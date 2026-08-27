#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_SOURCE_FILE = fileURLToPath(new URL('../../og-blacman-stripe-invoice-draft.md', import.meta.url));
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export function parseArgs(argv) {
  const args = {
    currency: 'usd',
    dryRun: false,
    finalize: false,
    source: null,
    customerId: null,
    customerName: null,
    customerEmail: null,
    memo: null,
    invoiceDescription: null,
    dueDays: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) {
      continue;
    }

    const equalsIndex = value.indexOf('=');
    const key = equalsIndex === -1 ? value.slice(2) : value.slice(2, equalsIndex);
    const raw = equalsIndex === -1 ? argv[index + 1] : value.slice(equalsIndex + 1);
    const consumesNext = equalsIndex === -1 && raw && !raw.startsWith('--');

    if (key === 'dry-run') {
      args.dryRun = true;
      continue;
    }

    if (key === 'finalize') {
      args.finalize = true;
      continue;
    }

    if (key === 'source') {
      args.source = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'customer-id') {
      args.customerId = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'customer-name') {
      args.customerName = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'customer-email') {
      args.customerEmail = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'memo') {
      args.memo = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'invoice-description') {
      args.invoiceDescription = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'currency') {
      args.currency = raw;
      if (consumesNext) {
        index += 1;
      }
      continue;
    }

    if (key === 'due-days') {
      args.dueDays = Number(raw);
      if (consumesNext) {
        index += 1;
      }
    }
  }

  return args;
}

export function parseMoneyToCents(value) {
  const match = value.trim().match(/^\$?([0-9]+(?:\.[0-9]{2})?)$/);
  if (!match) {
    throw new Error(`Unable to parse money value: ${value}`);
  }

  return Math.round(Number(match[1]) * 100);
}

export function parseInvoiceDraft(markdown) {
  const lines = markdown.split(/\r?\n/);
  const titleLine = lines.find((line) => line.startsWith('# '));
  const title = titleLine ? titleLine.slice(2).trim() : 'Invoice draft';

  const summary = {};
  const summaryStart = lines.findIndex((line) => line.trim() === '## Invoice summary');
  if (summaryStart !== -1) {
    for (let index = summaryStart + 1; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (!line) {
        continue;
      }
      if (line.startsWith('## ')) {
        break;
      }
      if (!line.startsWith('- ')) {
        continue;
      }
      const content = line.slice(2).trim();
      const separatorIndex = content.indexOf(':');
      if (separatorIndex === -1) {
        continue;
      }
      const key = content.slice(0, separatorIndex).trim().toLowerCase();
      const value = content.slice(separatorIndex + 1).trim();
      summary[key] = value;
    }
  }

  const lineItems = [];
  const tableStart = lines.findIndex((line) => line.trim() === '## Line items');
  if (tableStart === -1) {
    throw new Error('Could not find the line items table in the invoice draft.');
  }

  for (let index = tableStart + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      continue;
    }
    if (line.startsWith('## ')) {
      break;
    }
    if (!line.startsWith('|')) {
      continue;
    }
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);

    if (cells.length !== 2) {
      continue;
    }
    if (cells[0] === 'Item' || cells[0].startsWith('---')) {
      continue;
    }
    if (cells[0] === 'Project total') {
      continue;
    }

    lineItems.push({
      description: cells[0],
      amount: parseMoneyToCents(cells[1]),
    });
  }

  const statedTotal = summary['total due'] ? parseMoneyToCents(summary['total due']) : null;
  const calculatedTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    title,
    summary,
    lineItems,
    totals: {
      statedTotal,
      calculatedTotal,
    },
  };
}

async function stripeRequest(secretKey, method, endpoint, formFields = null) {
  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(formFields ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: formFields ? new URLSearchParams(formFields) : undefined,
  });

  const bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = { raw: bodyText };
  }

  if (!response.ok) {
    const message = body?.error?.message || response.statusText || 'Stripe request failed';
    throw new Error(`${message} (${response.status})`);
  }

  return body;
}

function requireValue(value, label) {
  if (!value) {
    throw new Error(`Missing required ${label}.`);
  }
  return value;
}

export async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceFile = path.resolve(process.cwd(), args.source || DEFAULT_SOURCE_FILE);
  const markdown = await fs.readFile(sourceFile, 'utf8');
  const invoiceDraft = parseInvoiceDraft(markdown);

  if (invoiceDraft.totals.statedTotal !== null && invoiceDraft.totals.statedTotal !== invoiceDraft.totals.calculatedTotal) {
    throw new Error(
      `Invoice total mismatch: stated ${invoiceDraft.totals.statedTotal} cents, calculated ${invoiceDraft.totals.calculatedTotal} cents.`,
    );
  }

  if (args.dryRun) {
    console.log(JSON.stringify({ sourceFile, invoiceDraft, args }, null, 2));
    return;
  }

  const secretKey = requireValue(process.env.STRIPE_SECRET_KEY, 'STRIPE_SECRET_KEY');

  let customerId = args.customerId;
  if (!customerId) {
    const customerName = requireValue(args.customerName, '--customer-name');
    const customerFields = {
      name: customerName,
    };
    if (args.customerEmail) {
      customerFields.email = args.customerEmail;
    }
    const customer = await stripeRequest(secretKey, 'POST', '/customers', customerFields);
    customerId = customer.id;
  }

  const invoiceFields = {
    customer: customerId,
    collection_method: 'send_invoice',
    auto_advance: 'false',
    currency: args.currency,
  };
  if (args.dueDays !== null && Number.isFinite(args.dueDays)) {
    invoiceFields.days_until_due = String(args.dueDays);
  }
  if (args.invoiceDescription) {
    invoiceFields.description = args.invoiceDescription;
  } else {
    invoiceFields.description = invoiceDraft.summary.project
      ? `${invoiceDraft.summary.project} invoice`
      : invoiceDraft.title;
  }
  if (args.memo) {
    invoiceFields.footer = args.memo;
  }

  const invoice = await stripeRequest(secretKey, 'POST', '/invoices', invoiceFields);

  for (const item of invoiceDraft.lineItems) {
    await stripeRequest(secretKey, 'POST', '/invoiceitems', {
      customer: customerId,
      invoice: invoice.id,
      amount: String(item.amount),
      currency: args.currency,
      description: item.description,
    });
  }

  let finalInvoice = invoice;
  if (args.finalize) {
    finalInvoice = await stripeRequest(secretKey, 'POST', `/invoices/${invoice.id}/finalize`, {});
  }

  console.log(
    JSON.stringify(
      {
        sourceFile,
        customerId,
        invoiceId: finalInvoice.id,
        status: finalInvoice.status,
        totalDue: finalInvoice.amount_due,
        currency: finalInvoice.currency,
        hostedInvoiceUrl: finalInvoice.hosted_invoice_url || null,
        invoicePdf: finalInvoice.invoice_pdf || null,
      },
      null,
      2,
    ),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
