import assert from 'node:assert/strict';
import test from 'node:test';

import { parseInvoiceDraft, parseMoneyToCents } from '../tools/import-stripe-invoice.mjs';

test('parseMoneyToCents converts invoice amounts to cents', () => {
  assert.equal(parseMoneyToCents('$500.00'), 50000);
  assert.equal(parseMoneyToCents('25.50'), 2550);
});

test('parseInvoiceDraft reads the invoice draft table and totals', () => {
  const markdown = `# OG Blacman Website Invoice Draft

## Invoice summary

- Project: OG Blacman website design and development
- Billing basis: Fixed project fee
- Total due: $500.00

## Line items

| Item | Amount |
| --- | ---: |
| Creative discovery and iterative prototyping | $100.00 |
| Reference-led visual design and responsive brand experience | $55.00 |
| Project total | $155.00 |
`;

  const parsed = parseInvoiceDraft(markdown);

  assert.equal(parsed.title, 'OG Blacman Website Invoice Draft');
  assert.equal(parsed.summary.project, 'OG Blacman website design and development');
  assert.equal(parsed.lineItems.length, 2);
  assert.deepEqual(parsed.lineItems[0], {
    description: 'Creative discovery and iterative prototyping',
    amount: 10000,
  });
  assert.equal(parsed.totals.statedTotal, 50000);
  assert.equal(parsed.totals.calculatedTotal, 15500);
});
