# OG Blacman website: make changes with a coding agent

This is the source code for [ogblacman.com](https://www.ogblacman.com/). This guide is for a complete beginner on **Windows or Mac** who wants to use **OpenAI Codex or Claude Code** to modify the website.

You describe what you want in plain English. The coding agent reads the project, finds the relevant code, makes changes, and runs checks. You review the website in Chrome and tell it what to adjust. You do not need to know which file to edit before asking for a change.

The workflow is: **describe → let the agent implement → inspect locally → refine → publish when ready**.

## Contents

- [Choose a coding subscription](#choose-a-coding-subscription)
- [Install the tools on Windows or Mac](#install-the-tools-on-windows-or-mac)
- [Get the project onto your computer](#get-the-project-onto-your-computer)
- [Connect your coding agent](#connect-your-coding-agent)
- [Ask the agent to start the site](#ask-the-agent-to-start-the-site)
- [Make your first change](#make-your-first-change)
- [Example requests for this website](#example-requests-for-this-website)
- [Develop the mobile layout in Chrome](#develop-the-mobile-layout-in-chrome)
- [Ask the agent to check its work](#ask-the-agent-to-check-its-work)
- [Understand GitHub, Vercel, and GoDaddy](#understand-github-vercel-and-godaddy)
- [Publish through the existing GitHub and Vercel setup](#publish-through-the-existing-github-and-vercel-setup)
- [Set up your own hosting if needed](#set-up-your-own-hosting-if-needed)
- [Troubleshooting with your agent](#troubleshooting-with-your-agent)

## Choose a coding subscription

Start with **one** of these $20/month options. You do not need both.

| Subscription | Monthly starting price in USD | Coding tool included | Where to subscribe |
| --- | --- | --- | --- |
| **ChatGPT Plus** from OpenAI | **$20/month** | **Codex**, including its VS Code extension | [Get ChatGPT Plus](https://chatgpt.com/explore/plus) — create an account or sign in and choose Plus |
| **Claude Pro** from Anthropic | **$20/month when billed monthly** | **Claude Code**, including its VS Code extension | [Choose Claude Pro](https://claude.com/pricing) — select Pro and monthly billing, then follow the signup prompts |

These prices and included coding tools were checked on **October 16, 2026** against [OpenAI's official pricing](https://learn.chatgpt.com/docs/pricing) and [Anthropic's official pricing](https://claude.com/pricing). Checkout determines local currency and applicable taxes. Claude's lower advertised monthly equivalent is an annual plan paid up front. Both subscriptions have usage limits; neither promises unlimited coding. Check the current plan details before paying.

The $20 OpenAI plan is called **Plus**; the $20 Anthropic plan is called **Pro**. You do not need the more expensive ChatGPT Pro or Claude Max plan to follow this guide. If you already have one of the two subscriptions, use it first. If you hit a usage limit, you can wait for it to reset before deciding whether to upgrade.

Sign into the coding tool with the same account you subscribed with. Use subscription sign-in for this workflow; a separately billed API account or API key is not required. Buying a subscription does not automatically give an ordinary chat access to your computer: you still need to open the project in the coding tool as explained below.

## Install the tools on Windows or Mac

Use **VS Code with a coding-agent extension** as the shared workflow on both operating systems. VS Code is the application that holds your project and the agent's conversation in one window.

1. Install **[Google Chrome](https://www.google.com/chrome/)** for previewing the site and testing phone-sized layouts.
2. Install **[Visual Studio Code](https://code.visualstudio.com/download)**, also called VS Code. Choose the Windows or Mac download for your computer. It is different from the larger product named Visual Studio.
3. Install **[Node.js 24 LTS](https://nodejs.org/en/download)**, including npm. Node runs the site's development tools; npm installs its libraries and runs project commands. Use the regular installer rather than Docker or the source-code download.
4. Install **[GitHub Desktop](https://desktop.github.com/)** if you will maintain the existing repository. It gives you buttons to download the project, review changes, and upload them.

On **Windows**, use Node's `.msi` installer, keeping npm and the option to add Node to `PATH` enabled. You can use a normal Windows setup for this website; no separate Linux installation is required. If the agent needs command-line Git, install [Git for Windows](https://git-scm.com/install/windows), which also provides Git Bash. GitHub Desktop's bundled Git may not be available to the agent's terminal.

On **Mac**, use Node's `.pkg` installer. Choose Apple Silicon for M-series Macs or Intel for older Intel Macs when an installer offers that choice. If the agent reports that Git is unavailable, follow the [official macOS Git installation guidance](https://git-scm.com/install/mac); macOS may offer to install Command Line Tools.

After installation, fully close and reopen VS Code so the agent and terminal can find the new tools. The project's locked Vite version supports Node `^20.19.0` or `>=22.12.0`; Node 24 is a suitable starting point. The site itself is built with **React and Vite**, even though older planning documents mention Vue.

## Get the project onto your computer

### Recommended: create a GitHub account and clone the repository

A repository, or repo, is the project files plus their change history. Cloning means downloading a working copy with that history.

1. [Create a GitHub account](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github) and verify your email address.
2. Ask the current owner of [nrrb/ogblacman](https://github.com/nrrb/ogblacman) to invite your GitHub username with permission to push changes. Accept the invitation. Your AI subscription and GitHub account do not automatically grant access to this repository.
3. Open GitHub Desktop, sign in, and choose **File → Clone Repository → URL**.
4. Enter `https://github.com/nrrb/ogblacman.git`, choose a local folder, and click **Clone**. A location such as `Documents/code/ogblacman`, outside OneDrive/iCloud syncing, is easy to find again.
5. Open VS Code, choose **File → Open Folder**, and select that project folder. Its top level should contain `package.json`, `src`, and `public`.

GitHub's [illustrated cloning guide](https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop) shows the process. Use the HTTPS URL above; SSH keys are unnecessary for this route.

### If you only have a ZIP copy

You can start locally without a GitHub account if the owner supplies the source files. For a public repository, **Code → Download ZIP** also works. On Windows, right-click the ZIP and choose **Extract All**; on Mac, double-click it. Open the extracted project folder in VS Code. See GitHub's [download instructions](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives).

A ZIP has no Git history. Keep a backup and tell the agent you are using a ZIP. For publishing later, clone the real repository and ask the agent to bring over only your intended changes. Do not overwrite the clone with generated `node_modules` or `dist` folders. A fork is a separate GitHub copy; changing one does not automatically update the live site's connected repository.

## Connect your coding agent

Install the extension for the subscription you chose. You only need one agent running on this project at a time.

### Option A: ChatGPT Plus with Codex

1. In VS Code, open **Extensions** using **Ctrl+Shift+X** on Windows or **Command+Shift+X** on Mac.
2. Install the official **Codex** extension published by **OpenAI**. OpenAI links to it from the [Codex IDE setup guide](https://learn.chatgpt.com/docs/codex/ide).
3. Open the Codex icon in the sidebar. If it is missing, open the Command Palette with **Ctrl+Shift+P** on Windows or **Command+Shift+P** on Mac and run **Codex: Open Codex Sidebar**.
4. Choose ChatGPT sign-in and complete the browser login with your Plus account. Follow any initial setup prompts.
5. Keep this project folder open and work locally so the agent changes the same files your local website serves.

OpenAI's [getting-started guide](https://learn.chatgpt.com/docs/quickstart) covers account setup and other ways to use Codex. You can use an official desktop app instead; the VS Code route keeps this guide consistent across Windows and Mac.

### Option B: Claude Pro with Claude Code

1. In VS Code, open **Extensions** using **Ctrl+Shift+X** on Windows or **Command+Shift+X** on Mac.
2. Search for **Claude Code** and install the official extension published by **Anthropic**.
3. Open its spark icon in the sidebar, or use the Command Palette and search for **Claude Code** to open its panel.
4. Click **Sign in** and complete authorization in your browser with the Claude Pro account.
5. Keep this project folder open while you work with the agent.

Anthropic's [VS Code setup guide](https://code.claude.com/docs/en/vs-code) includes screenshots and troubleshooting. The extension bundles its coding runtime; a separate terminal CLI installation is only needed if you want to launch `claude` by typing a command. See the [Windows and Mac setup notes](https://code.claude.com/docs/en/setup) if it needs additional setup.

### Give the agent the project rules

Send this as your first message in the agent panel. Replace the operating system with yours:

```text
I'm a complete beginner using Windows / Mac. Read README.md and AGENTS.md
and follow this project's working rules. Inspect the project before changing it.
Explain your work in plain English.

Check whether this folder is a Git clone or a ZIP copy. If it is a clone,
check for existing uncommitted changes and preserve them. Before feature work,
create and switch to a dedicated feature branch. Keep coherent changes in
separate commits after checks pass.

Use the existing architecture and npm lockfile. Ask before adding or replacing
a production dependency. Do not merge, push, open a pull request, deploy, or
change DNS until I explicitly ask. First, explain how you will run this site.
```

This explicitly gives either agent the repository's rules, including Claude Code if it does not automatically discover `AGENTS.md`. The agent may ask to read files, make edits, install the project's existing libraries, or run commands. Review what the permission covers and allow the steps needed for your request. Complete account logins yourself in the official browser flow.

## Ask the agent to start the site

Once it has read the project, send:

```text
Get this site running locally. Check Node and npm, install the locked project
libraries with npm ci if needed, and start the development server. Give me
the exact URL to open in Chrome. If you cannot keep a server running, show
me the command and explain where to run it. Do not publish anything.
```

The agent should give you an address such as `http://localhost:5173/`. Open its actual address, including the port number, in Chrome. You should see the OG Blacman website. `localhost` means your own computer; local edits do not update the public site.

The current site needs no database, custom server, `.env` file, or API key to run. Existing media and fonts are included. The newsletter loads the real **Kit** service, and external services need internet access. **Submitting the newsletter manually can add a real subscriber**, even from localhost; use your own email only when intentionally testing a signup.

### If you need to run a command yourself

In VS Code, choose **Terminal → New Terminal**. A terminal is the panel where you type commands and press Enter. It normally starts in the open project folder. Run these separately, waiting for each to finish:

```sh
node --version
npm --version
npm ci
npm run dev
```

`npm ci` installs the versions in `package-lock.json`; it is needed initially and after lockfile updates, not for every text change. `npm run dev` starts the local server. Leave its terminal running and use the printed **Local** URL. If a port is busy, Vite may choose another. Do not double-click `index.html` to run this project.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`, or switch VS Code's terminal profile to **Command Prompt** and open a new terminal. Ask the agent to help if the terminal is in the wrong folder.

To stop the server, press **Ctrl+C** in its terminal on either Windows or Mac. If Windows asks `Terminate batch job (Y/N)?`, type `Y` and press Enter. To resume later, reopen the same project folder, ask the agent to check the current state, and restart the server.

## Make your first change

Start with a small change that is easy to spot. Send this to the coding agent:

```text
Change the opening section's "CLIMB DOWN" prompt to "EXPLORE THE MUSIC".
Apply it wherever that prompt appears on mobile and desktop. Keep the current
black, warm-white, and gold design. Run the relevant checks and tell me how
to review it locally. Do not publish.
```

Let the agent find and change the relevant code. When it reports completion:

1. Refresh the local website in Chrome if it has not updated automatically.
2. Look at the opening section on desktop and in Chrome's mobile view below.
3. If you want a refinement, reply in the same conversation, for example: **“The new wording wraps awkwardly at 390 pixels. Adjust it so it fits comfortably.”**
4. Ask **“What changed, which checks passed, and what should I inspect?”** if its handoff is unclear.

If you want the experiment undone, say **“Undo only the prompt change from this task; preserve other work.”** The agent can use the change history to reverse its own work. Avoid asking it to reset everything when you only want one adjustment.

## Example requests for this website

Describe the visible result and supply the facts the agent cannot infer. A screenshot helps for visual problems. Add your viewport size, what you expected, and what actually happened.

| Goal | Example message to the agent |
| --- | --- |
| Update the release | “Feature the new single [title], out [date]. Use this description: [...], this listening link: [...], and the artwork/audio/video files I supplied. Update the release and sharing preview together. Tell me if anything is missing.” |
| Add a show | “Add a show at [venue] in [city] on [date] at [local time] in [timezone]. Tickets are [URL]. Keep the existing show-list design and verify the displayed date and time.” |
| Show booking information | “Display the booking section on mobile and desktop using these contact details: [...]. Check the layout and links.” |
| Add merch | “Show these merch images and link each to this existing store URL: [...]. Keep checkout at that store.” |
| Fix a phone layout | “At 390 × 844, this heading overlaps the button. Screenshot attached. Fix the spacing and check nearby widths as well as desktop.” |
| Replace a background video | “Use the video I supplied for the opening background. Prepare suitable mobile/desktop versions and poster images, update references and cache versions, and tell me if a processing tool is needed.” |
| Update social links | “Replace the Instagram link with [URL] everywhere it appears and verify that it opens correctly.” |
| Review a problem | “The Telephone player stops working after I resize the browser from mobile to desktop. Reproduce it, fix the cause, and run the relevant interaction check.” |

For larger work, first ask: **“Inspect the current implementation and give me a short plan before making changes.”** Then approve or refine the plan. Work on one clear outcome at a time so you can judge the result.

Useful context to give the agent:

- Preserve the mobile-first black, warm-white, and heritage-gold design, accessible controls, and keyboard focus states.
- Text and links have a shared content model. The agent should keep copy there and update validation and tests when changing its structure.
- Some tests expect the current Telephone release, empty shows/merch, or hidden Booking. For intentional content updates, ask the agent to update the relevant expectations while keeping meaningful checks.
- Hidden sections are not private storage: their data can still reach the browser. Keep passwords, API secrets, and confidential information out of the project.
- Existing media has responsive variants and long-lived caching. Ask the agent to update all affected variants, references, and cache versions when replacing assets.
- Kit account access is needed to manage subscribers or replace the newsletter form. Its public embed identifier belongs in the site; private API credentials do not.

You do not need to learn YAML, JSX, or CSS before making these requests. Ask the agent to explain an unfamiliar term when it affects a decision you need to make.

## Develop the mobile layout in Chrome

You can work on the mobile site from your desktop browser while `npm run dev` is running.

1. Open your local site in Chrome.
2. Right-click the page and choose **Inspect** to open Developer Tools, also called DevTools.
3. Click the **phone/tablet icon** in DevTools to toggle the Device Toolbar.
4. In the **Dimensions** dropdown, choose **Responsive** and enter a width and height, such as **390 × 844**, or choose a phone preset.
5. Reload after selecting a device. Scroll, click or tap controls, ask the agent for changes, and inspect the result after it saves them.
6. Use **Rotate** to check landscape. Toggle the phone/tablet icon off to return to the normal desktop viewport.

Useful [Chrome keyboard shortcuts](https://developer.chrome.com/docs/devtools/shortcuts):

| Action | Windows | Mac |
| --- | --- | --- |
| Open DevTools | Ctrl+Shift+I | Command+Option+I |
| Toggle Device Toolbar, with DevTools open | Ctrl+Shift+M | Command+Shift+M |

This project's mobile layout is active at **767 CSS pixels wide or less**; desktop starts at **768**. The switch in `src/App.jsx` mounts a different component, so always inspect both layouts. A landscape phone can be wide enough to show the desktop layout.

Try these widths as you edit: **320, 390, 600, 767, 768, 1024, and 1440**. Check that headings fit, buttons remain reachable, there is no unwanted sideways scrolling, the Telephone player starts and stops, and the newsletter is usable. Resize across 767/768 and check that the form still works. If opening DevTools makes the normal viewport narrow, the site may switch to mobile even with Device Toolbar off.

Changes made directly in DevTools' Elements/Styles panels are temporary. If you like an experiment, show the agent a screenshot or describe it and ask it to implement the change in the project.

Google's [illustrated Device Mode tutorial](https://developer.chrome.com/docs/devtools/device-mode) covers resizing, device presets, screenshots, and network/CPU throttling. Its [short video tutorial](https://www.youtube.com/watch?v=f7kokNyRe7U) demonstrates the controls. Start without throttling; use it later to check slow connections, then turn it off again.

Device Mode approximates mobile behavior; it still runs your desktop Chrome browser. Check a real iPhone/Safari and Android/Chrome when possible, especially for audio, autoplay, scrolling, and the on-screen keyboard. See Google's [Device Mode limitations](https://developer.chrome.com/docs/devtools/device-mode#limitations).

### Optional: open your local site on a real phone

Connect your computer and phone to the same trusted Wi-Fi network. Stop the local server and restart it with:

```sh
npm run dev -- --host 0.0.0.0
```

Open the **Network** URL Vite prints on your phone, such as `http://192.168.1.25:5173/`. Use your computer's actual printed address. `localhost` on a phone means the phone itself. If prompted by Windows Firewall, allow access on your private network. Guest Wi-Fi or a VPN can block the connection. This exposes the development server to that network while it runs; stop it with Ctrl+C when finished. A Vercel preview URL is another way to test on a phone once you have publishing access.

## Ask the agent to check its work

After a change looks right in your development view, send:

```text
Review this task's changes and run npm run test:content and npm run build.
If behavior or responsive layout changed, run npm run test:interaction against
a running production preview too. Update tests only where the intended
behavior changed; preserve meaningful coverage. Fix failures caused by this
task. Tell me what passed, what could not be checked, and the preview URL
I should inspect before publishing.
```

A production build creates `dist/`, the files Vercel serves. A local production preview lets you inspect that built version. The agent can start it with:

```sh
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/`. Unlike the development server, it serves the **last build**: ask the agent to rebuild after further changes. Neither building nor running this preview publishes the site.

The interaction check uses that address by default. If its test browser is missing, the agent can install it with `npx playwright install chromium`. It still needs access to the external Kit embed, although test signup submissions are intercepted. Ask the agent to report blocked checks accurately rather than claim they passed.

You should also inspect the result yourself: desktop, mobile widths, the Telephone player, navigation/links, and the newsletter fields. Automated checks help, but you decide whether the wording and design are right.

## Understand GitHub, Vercel, and GoDaddy

The existing arrangement is:

```text
You describe a change to the coding agent
                  |
                  v
Agent edits and tests a local project copy
                  |
                  | when you authorize an upload
                  v
GitHub: stores the source code and change history
                  |
                  | connected repository triggers a build
                  v
Vercel: builds and hosts the website
                  ^
                  | GoDaddy DNS points visitors here
                  |
          www.ogblacman.com
```

| Term | What it means |
| --- | --- |
| Branch | A separate line of work where the agent can prepare a change. `main` is the usual shared version. |
| Commit | A saved checkpoint of changes on your computer. A commit by itself does not publish. |
| Push | Upload local commits to GitHub. |
| Pull request | A page for reviewing a branch before adding it to the shared version. |
| Merge | Add a branch's work to another branch, such as `main`. |
| Preview deployment | A hosted version for reviewing a change before production. |
| Production deployment | The version shown on the public website. |
| DNS | Address records that connect a domain name to its hosting service. |

The existing repository is [nrrb/ogblacman](https://github.com/nrrb/ogblacman). The code uses React and Vite; the newsletter uses Kit, and deployed builds include Vercel Analytics. There is no separate CMS admin panel to maintain.

## Publish through the existing GitHub and Vercel setup

Local editing, committing, uploading, and going live are separate steps. Use the existing connected repository and Vercel project to update the current website. Your coding subscription does not provide access to these accounts.

Once you have reviewed the result and its checks, you can ask the agent:

```text
The feature is complete. Verify the branch is clean and the relevant checks
pass. Merge this feature into main and push main to origin. Keep the feature
branch. Report the commit and push result.
```

Use that prompt only after confirming that `main` is the project's production branch and you are ready to publish. It explicitly authorizes the upload and may trigger Vercel to update the public site. If your repository requires pull requests, use that review process instead; tell the agent to push the feature branch and open a pull request. If account authentication is needed, complete the browser sign-in yourself.

### Get access to the existing accounts

You need the GitHub access described above. For deployment settings, logs, and domains, create a Vercel account at [vercel.com](https://vercel.com/) and ask the current owner to arrange access to the existing project/team. Availability of collaboration features depends on the owner's plan. A new personal account does not automatically own the current project.

Ask the owner to confirm the connected GitHub repository and **Production Branch** in Vercel's project settings. It is commonly `main`; confirm rather than assuming. The account-specific production branch and DNS values cannot be determined from these source files alone. Vercel's [GitHub integration guide](https://vercel.com/docs/git/vercel-for-github) explains the connection and deployment permissions.

GoDaddy access is only needed to manage the domain or DNS. Ordinary text, style, and media updates do not need DNS edits. Kit access is separate if you need to manage the mailing list.

### Upload a branch for review

This button-based route is available if you prefer GitHub Desktop.

1. Finish and check the agent's changes on your feature branch. If the agent already committed them, inspect the History tab and skip to step 3. Otherwise, inspect the changed lines in the **Changes** tab and select only files belonging to your update.
2. Enter a short commit message, such as `Update homepage copy`, and click **Commit to feature/...**. A commit is a local checkpoint.
3. Click **Publish branch** for its first upload, or **Push origin** for later commits. This uploads to GitHub.
4. Use **Create Pull Request** to open the GitHub review page. Set the base branch to the intended production branch, usually `main`, describe the change and checks, and create the pull request.
5. If automatic preview deployments are enabled and your account has permission, Vercel builds the branch and adds a preview link. Open it on desktop and a real phone. Wait for a successful deployment; inspect Vercel's build logs if it fails.

GitHub's [commit guide](https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop) covers reviewing and recording changes. Vercel explains [preview and production environments](https://vercel.com/docs/deployments/environments). Preview links may require authentication depending on the project's protection settings.

### Make the finished update live

When the feature is complete and approved, merge the pull request into the confirmed production branch. **With the existing automatic deployment connection, updating that branch triggers a production deployment.** Wait until Vercel reports success, then check the public domain, links, media, and form. Do not merge unfinished changes simply because they build.

After merging, switch GitHub Desktop back to `main` (or the confirmed base branch), fetch/pull the latest changes, and create a fresh feature branch for your next task. Keep the previous branch unless there is a reason to remove it. Do not force-push or discard changes you have not backed up.

If you need to undo a published update, use a GitHub pull request **Revert** where available to create a new change that reverses it, review/test that change, and merge it. This keeps source history aligned with the next deployment. Coordinate with the project owner if an urgent hosting rollback is needed.

## Set up your own hosting if needed

Skip this section if you are maintaining the existing site. A second repository or Vercel project does not automatically take over `ogblacman.com`.

For an independent copy, create a repository under your own GitHub account containing the source files, or fork the existing repository if permitted. Do not upload `node_modules` or `dist`. Create a Vercel account, authorize access to that repository, and import it as a new project. Use these settings for this codebase:

| Vercel setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | Repository root, where `package.json` is located |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | 24.x, matching the recommended local setup |
| Environment variables | None required by the current source |

Follow Vercel's [Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite). First test the generated `*.vercel.app` address. For an independent copy, ask the agent to update the canonical website address, review links and branding, and replace or hide the original Kit form before accepting signups.

### How GoDaddy fits into the domain setup

The current GoDaddy DNS already points visitors to Vercel. Keep it in place for routine site updates. If the domain is intentionally moved to a different Vercel project, the owner must arrange any required domain reassignment there.

For a new custom domain, add it to the intended Vercel project's **Domains** settings. Copy the exact DNS records Vercel shows into that domain's GoDaddy DNS settings, then wait for verification and HTTPS setup. Do not copy old IP addresses from a tutorial: the required values depend on the domain/project setup. See Vercel's [custom domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain) and GoDaddy's [A-record editing guide](https://www.godaddy.com/help/edit-an-a-record-19239).

DNS edits belong at the provider hosting the domain's authoritative nameservers. If those are GoDaddy's, edit records there; if the nameservers were moved elsewhere, edit them at that provider. Preserve unrelated records, especially email records such as MX and TXT. Vercel explains [DNS management and nameservers](https://vercel.com/docs/domains/working-with-dns).

## Troubleshooting with your agent

Copy the error text into the agent conversation and explain what you were doing. Include Windows or Mac, the address you opened, and the viewport size if it is a visual issue. For example:

```text
I'm on Windows. I asked you to start the local site, but Chrome says it cannot
connect to http://localhost:5173/. The terminal output is below. Diagnose it
and get the local site working. Preserve my changes and do not publish.

[paste the error text here]
```

| Problem | What to tell the agent or do yourself |
| --- | --- |
| Agent only gives advice instead of changing the project | “You have this project folder open. Please implement the change, run the checks, and give me a local URL to review.” Confirm you opened the coding extension and the correct folder. |
| Agent asks you to paste the whole project | Confirm it is working locally in the coding tool, with permission to read the open project. An ordinary chat may not have that access. |
| Paid plan is not recognized | Sign into the extension with the same account you subscribed with. Use the official setup guide for that tool. |
| Usage limit reached | Wait for the reset or review the provider's options. Ask the agent for a handoff before starting another session. |
| `node`, `npm`, or `git` cannot be found | Install the relevant tool, fully reopen VS Code, and ask the agent to check versions and its terminal environment. |
| PowerShell blocks `npm.ps1` | Use `npm.cmd` or a Command Prompt terminal. |
| Missing `package.json`, `vite`, or another module | Ask the agent to confirm the working folder and install the locked libraries with `npm ci`. |
| Site fails after a change | Share the terminal/browser error and ask the agent to diagnose it before making more changes. |
| Local production preview shows old content | Ask the agent to rebuild, then refresh the preview. |
| Image, video, or newsletter is missing | Share the screenshot and browser error. Ask the agent to check media references, letter case, caching, or Kit network access as appropriate. |
| GitHub shows 404 or push denied | Sign into the invited account, accept the invitation, and ask the owner to confirm permissions. |
| Push succeeds but the live site does not update | Ask the agent to inspect the connected repository/branch and Vercel deployment logs using available authorized access; otherwise open those settings with the owner. |
| The agent's changes look wrong | Describe the specific problem or supply a screenshot. Ask it to revise or undo only this task's changes. |

Keep passwords and tokens out of prompts, screenshots, and repository files. Complete sign-ins in the provider's official interface. For normal updates, your job is to describe the result, inspect it, and decide when it is ready to go live.
