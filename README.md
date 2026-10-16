# OG Blacman website: a beginner's guide

This is the source code for [ogblacman.com](https://www.ogblacman.com/). This guide walks you through running a copy on your Windows PC or Mac, changing it, checking the mobile layout, and eventually updating the live website.

You do **not** need Claude Code, ChatGPT Codex, another AI assistant, or an AI subscription. You can edit this project with a free text editor. You also do not need GitHub or Vercel accounts just to run a copy on your computer, provided you have the project files.

## Contents

- [Understand what runs where](#understand-what-runs-where)
- [Install the tools](#install-the-tools)
- [Get the project files](#get-the-project-files)
- [Run the website on your computer](#run-the-website-on-your-computer)
- [Make your first change](#make-your-first-change)
- [Find the right file to edit](#find-the-right-file-to-edit)
- [Common content changes](#common-content-changes)
- [Develop the mobile layout in Chrome](#develop-the-mobile-layout-in-chrome)
- [Check your changes before publishing](#check-your-changes-before-publishing)
- [Publish through the existing GitHub and Vercel setup](#publish-through-the-existing-github-and-vercel-setup)
- [Set up your own hosting if needed](#set-up-your-own-hosting-if-needed)
- [Troubleshooting](#troubleshooting)

## Understand what runs where

The existing hosting arrangement is:

```text
Your computer: edit and test files
       |
       | upload saved changes
       v
GitHub repository: stores the source code and its history
       |
       | Vercel builds the connected repository
       v
Vercel: serves the built website to visitors
       ^
       | GoDaddy DNS points the domain here
       |
www.ogblacman.com
```

The repository configured in this checkout is [nrrb/ogblacman](https://github.com/nrrb/ogblacman). The live domain is also recorded in `src/content/site.yaml`.

| Term | What it means here |
| --- | --- |
| Local | On your own computer. Local edits do not automatically change the public website. |
| React | The JavaScript library used to build the page from reusable pieces called components. |
| Vite | The tool that runs the local development server and builds the finished site. |
| Node.js | Software that lets your computer run this project's development tools. |
| npm | The package manager included with Node.js; it installs the project's required libraries and runs commands. |
| Repository, or repo | The project files plus their saved change history. |
| Git / GitHub | Git tracks changes; GitHub stores and shares the repository online. GitHub Desktop gives Git a graphical interface. |
| Branch | A separate line of work, so you can prepare changes before adding them to the main version. |
| Commit / push | A commit records a set of changes locally; a push uploads commits to GitHub. |
| Pull request / merge | A pull request presents a branch for review; merging adds its changes to another branch. |
| Deployment | A built version of the website hosted by Vercel. A preview is for review; production is the public version. |
| DNS | The domain's address records, which tell browsers where to find the hosted website. |

This is a React and Vite project, despite older planning documents mentioning Vue or future CMS work. There is no CMS admin screen, database, or custom server to start. Most editable content is in a YAML text file. The newsletter uses an existing **Kit** signup form; deployed builds also include Vercel Analytics.

## Install the tools

For local editing, install these three tools:

1. **[Google Chrome](https://www.google.com/chrome/)** to view the site and test mobile sizes.
2. **[Visual Studio Code](https://code.visualstudio.com/download)**, usually called VS Code, to edit files. Choose the installer for your operating system. You can skip account sign-in and AI setup.
3. **[Node.js](https://nodejs.org/en/download)**, including npm. Choose the **Node.js 24 LTS** installer for Windows or macOS. LTS means long-term support. Use the normal installer rather than Docker or a source-code download. The locked Vite version requires Node `20.19+` or `22.12+`; Node 24 is a suitable starting point.

On Windows, use the `.msi` installer and leave npm and the option to add Node to `PATH` enabled. No WSL or separate Linux setup is needed. On Mac, use the `.pkg` installer appropriate for your computer; Apple Silicon means M-series Macs, and Intel means older Intel Macs. You do not need Homebrew for the basic setup.

After installing Node, fully close and reopen VS Code so its terminal can find it.

If you want to save changes to GitHub and publish later, also install **[GitHub Desktop](https://desktop.github.com/)**. It is optional for the initial local setup. This guide uses its buttons instead of requiring Git commands in a terminal.

## Get the project files

Choose one of the following routes. If you plan to maintain the live site, use the GitHub route from the start.

### Route A: start without a GitHub account

1. Open [the repository](https://github.com/nrrb/ogblacman). If it is publicly accessible, select **Code → Download ZIP**. If you see a sign-in requirement or a 404 page, ask the owner for a ZIP copy of the source, or use Route B with an invitation.
2. Extract the ZIP: on Windows, right-click it and choose **Extract All**; on Mac, double-click it.
3. Move the extracted folder somewhere you can find again, such as `Documents/code/ogblacman`. A folder named `ogblacman-main` also works. Prefer a local folder outside OneDrive or iCloud syncing.
4. Open VS Code, choose **File → Open Folder**, and select the folder containing `package.json`, `src`, and `public`.

GitHub's [source download instructions](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives) show the ZIP button. A ZIP is a snapshot without Git history. Keep a backup before editing. For publishing later, clone the repository using Route B and copy only your changed source files into that clone; do not copy `node_modules` or `dist`.

### Route B: prepare to maintain the existing website

1. [Create a GitHub account](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github) and verify your email.
2. Ask the repository owner to invite your GitHub username with permission to push changes, and accept the invitation. Creating an account alone does not grant access to the existing repository.
3. Open GitHub Desktop and sign in. Choose **File → Clone Repository**, then its **URL** tab, and enter `https://github.com/nrrb/ogblacman.git`.
4. Choose a local folder and click **Clone**. Cloning downloads the files and their history. Use HTTPS as shown here; you do not need to configure SSH keys.
5. Open the cloned folder in VS Code using **File → Open Folder**.
6. Before editing, use GitHub Desktop's **Current Branch** menu to select `main`, then **Fetch origin** and **Pull origin** if offered. Create a branch through **Branch → New Branch**, for example `feature/update-home-copy`, and switch to it.

GitHub provides illustrated guides to [cloning](https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop) and [working with branches](https://docs.github.com/en/desktop/making-changes-in-a-branch/managing-branches-in-github-desktop). A fork is your own separate copy on GitHub; changing a fork does not automatically update this site's connected repository.

## Run the website on your computer

### 1. Open a terminal in the project

In VS Code, select **Terminal → New Terminal**. A terminal is the panel where you type commands and press Enter. It normally opens in the folder you selected.

Check the file list in VS Code's left sidebar: `package.json` should be at the top level. All commands below run from that folder. Do not double-click `index.html` to run this project.

If you use a separate terminal, change to your actual project location first. These are examples; replace `YOUR-NAME` and adjust the folder if necessary:

**Windows, in Command Prompt:**

```bat
cd /d "C:\Users\YOUR-NAME\Documents\code\ogblacman"
```

**Mac, in Terminal:**

```sh
cd "/Users/YOUR-NAME/Documents/code/ogblacman"
```

### 2. Check Node and npm

Run these commands separately:

```sh
node --version
npm --version
```

Both should print a version number. If Windows PowerShell says `npm.ps1` cannot run because scripts are disabled, use VS Code's terminal dropdown next to the **+** button, choose **Select Default Profile → Command Prompt**, and open a new terminal. You can also use `npm.cmd` in place of `npm` in PowerShell, for example `npm.cmd ci`. There is no need to change your computer's execution policy.

### 3. Install the project's libraries

```sh
npm ci
```

Wait for the command to finish and the prompt to return. This downloads the versions recorded in `package-lock.json` into a generated `node_modules` folder. You need internet access for the initial downloads. Keep `package-lock.json`; do not replace it with another package manager's files.

Run `npm ci` again after downloading changes that update the lockfile. You do not need to run it every time you edit text or restart the site.

### 4. Start the development server

```sh
npm run dev
```

Leave that terminal running. Open the **Local** address it prints in Chrome, usually `http://localhost:5173/`. If that port is busy, Vite may print another number; use the printed address.

You should see the OG Blacman website. Saving most source files updates the browser automatically. Changes to build configuration can require stopping and restarting the server. Your computer is now serving a local copy; this command does not publish it.

To stop the server, click in its terminal and press **Ctrl+C**, on either Windows or Mac. If Windows asks `Terminate batch job (Y/N)?`, type `Y` and press Enter. Next time, reopen the project and run `npm run dev` again.

No `.env` file, API key, Vercel login, or GoDaddy login is required for the current local site. The Kit form and external links still need internet access. **The local newsletter form uses the real Kit service**: submitting it can add an actual subscriber. Use your own email only when intentionally testing a real signup.

## Make your first change

Start with one small, visible text change:

1. In VS Code, open `src/content/site.yaml`.
2. Find `homePage`, then `sections`, then `hero`. Under `hero`, change `scrollPrompt: CLIMB DOWN` to `scrollPrompt: "EXPLORE THE MUSIC"`. Keep the spaces before `scrollPrompt` exactly as they are.
3. Save with **Ctrl+S** on Windows or **Command+S** on Mac.
4. Check the opening section in Chrome. The prompt should change. If necessary, refresh the page.
5. To undo the experiment, change the text back and save. VS Code's Undo command also works before you close the editing session.

That is the basic editing loop: **change a file → save → inspect the local site → check it at different sizes**.

## Find the right file to edit

Paths below start at the project folder. `src` means source code; `public` contains files served directly to the browser.

| What you want to change | Where to look |
| --- | --- |
| Headings, descriptions, button labels, release details, show listings, social links, contact details, section visibility | `src/content/site.yaml` — start here for most updates |
| Page title, search description, canonical website address, social preview image reference | `siteSettings.identity` and `siteSettings.seo` in `src/content/site.yaml` |
| The five main brand colors | `og-colors.yaml` — use quoted six-digit hex colors such as `"#FDCA00"` |
| Spacing, font sizes, layout rules, responsive styling | `src/styles/runtime.css`, `src/styles/reference.css`, and component-specific `.css` files |
| Which media file an asset name refers to; responsive image sizes; Kit embed host; presentation settings | `src/config/presentation.js` |
| Images, videos, fonts, and audio files | `public/assets/` and `public/music/` |
| Overall desktop or mobile page structure | `src/components/DesktopExperience.jsx` and `src/components/MobileExperience.jsx` |
| Telephone music player | `src/components/TelephonePlayer.jsx` and `src/components/TopPickRelease.jsx` |
| Newsletter form behavior and styling | `src/components/KitSignup.jsx` and `src/components/KitSignup.css` |
| Mobile scrolling behavior | `src/components/MobileSlider.jsx` |
| The mobile/desktop switch | `src/App.jsx` |
| Content validation and media lookup | `src/content/validateContent.js`, `hydrateContent.js`, and `loadContent.js` |
| HTML metadata template and build setup | `index.html` and `vite.config.js` |
| Available commands and dependency versions | `package.json` and `package-lock.json` |
| Vercel asset cache rules | `vercel.json` |
| Automated checks | `tests/` |

`.jsx` files combine JavaScript with HTML-like markup. CSS controls appearance. YAML holds structured content using indentation. Keep editable wording in `site.yaml`, even when changing components.

`node_modules/` and `dist/` are generated. Do not edit them: reinstalling or rebuilding replaces them. Older `PLAN.md`, `VUE_CONTENT_PLAN.md`, and `REACT_MIGRATION_PLAN.md` describe planning/history; the current code and `package.json` determine what actually runs. `AGENTS.md` records project working rules.

## Common content changes

### Keep YAML formatting intact

- Use spaces, never tabs, and keep sibling fields aligned. This file uses two spaces per level.
- Change values to the right of `:`; keep field names such as `scrollPrompt` unchanged.
- Quote text containing `: ` or `#`, for example `description: "New single: Telephone"`. Double quotes also work for apostrophes, as in `body: "You're on the list."`.
- Keep `true`, `false`, and `null` unquoted when they mean a boolean or an empty value. `[]` means an empty list.
- Keep dates quoted, such as `releaseDate: "2026-08-26"`, and use full `https://` URLs for external links.

### Edit text, links, and the featured release

In `site.yaml`, social profiles are under `siteSettings.socialLinks`. The release is under `homePage.sections.featuredRelease.release`. Edit the title, description, date, and `primaryLink` values there. The newsletter labels are under `homePage.sections.newsletter.formCopy`.

Page titles, search descriptions, and sharing metadata use `siteSettings.seo`. After editing these, restart `npm run dev` to refresh metadata read by the Vite configuration, and rebuild before checking a production preview.

Changing a release title does not replace its audio, artwork, or video. Those use named asset references such as `telephone`, `telephoneCover`, and `treePhone`, resolved through `presentation.js`.

### Show or hide a section

Each section under `homePage.sections` has `status: visible` or `status: hidden`. Booking is currently hidden. Change its status to `visible` to display the existing booking contact information on both layouts. At least one home section must stay visible.

Keep a hidden section's fields in place: validation and media lookup still read them. A link targeting a hidden section becomes non-interactive. **Hidden content is not private**: its data can still be included in the browser download. Remove confidential information from source files rather than relying on visibility.

### Add a show

Under `homePage.sections.shows`, replace that section's `items: []` with the following example. Keep `items` aligned with `heading`, `emptyState`, and `mobileBackground`; do not replace the whole section. Replace the example venue, date, and ticket URL with real details before publishing.

```yaml
      items:
        - _key: philly-show-2027-06-12
          startAt: "2027-06-12T20:00:00-04:00"
          timezone: America/New_York
          venue: "Example Venue"
          city: "Philadelphia, PA"
          ticketStatus: available
          ticketLink:
            type: external
            label: Tickets
            url: https://example.com/tickets
```

Every show needs a unique `_key`. `startAt` includes the time and UTC offset; the example means 8 p.m. in Philadelphia during daylight saving time. Use the correct offset for your date and an appropriate timezone such as `America/New_York`. Supported ticket statuses are `available`, `soldOut`, `cancelled`, and `unavailable`. The empty-state message is replaced by the list once there are items. Adding a show does not create a ticket-selling service; link to one that already exists.

### Add merchandise or replace media

The merch list is `homePage.sections.merch.items`. Its items support a unique `_key`, `title`, optional `price`, `availability` (`available`, `comingSoon`, or `soldOut`), an `image` with an `asset` name and `alt` description, and an optional external `productLink`. The current populated merch component displays linked images; it is not a full product catalog or shopping cart. Checkout happens at the linked store.

For a new image:

1. Put the file in `public/assets/`, for example `public/assets/shirt-v1.jpg`.
2. In `src/config/presentation.js`, add an entry inside the existing `images` object, for example `shirt: { src: '/assets/shirt-v1.jpg?v=shirt-v1' },`. The `?v=` value follows this project's cache-version convention.
3. Reference that name in YAML, for example `image: { asset: shirt, alt: "Black OG Blacman T-shirt" }` within a merch item. A new filename alone is not a registered asset name.

Public file URLs omit `public`: `public/music/new-song-v1.mp3` is served as `/music/new-song-v1.mp3`. Match letter case exactly; a mismatch can work on your computer and fail on hosting.

For existing release artwork, `presentation.js` also lists smaller image variants and a separate social preview image. Update those references together when replacing a cover; otherwise some screens or shared links may still show the old artwork. Videos can have separate desktop/mobile versions, MP4/WebM sources, and poster images. Keep those references consistent too.

Vercel caches files in `/assets/` and `/music/` for a year. Use a **new filename** when replacing media and update its references. Existing assets also use `assetVersions` in `presentation.js`; update the relevant version when modifying an existing asset set. Icons referenced directly in `index.html` need their references updated there as well. Keeping an unchanged URL can leave visitors with old files after a deployment.

The optimized media and fonts required by the site are already included. You do not need FFmpeg, Python, or the media-processing tools to run the site or edit text. Advanced video work is described in [MONTAGE_TOOL.md](MONTAGE_TOOL.md). Check the actual tool's help, for example `npm run process:hero -- --help`, before running it: original source footage may need to be supplied separately, and historical examples may differ from current defaults. Font generation uses the separate `pyftsubset` tool.

### Understand the newsletter integration

The public Kit form ID is `siteSettings.integrations.kit.formUid` in YAML. Its embed host is in `presentation.integrations.kit` in `src/config/presentation.js`. Keeping the existing form does not require a Kit login to run the site. Managing subscribers or replacing the form requires access to the relevant Kit account. If you use another account's form, update both the host and form ID to match its official embed.

Use public embed identifiers only. Never put Kit API secrets, account passwords, GitHub tokens, or other private credentials into YAML, JavaScript, or `public/`. This site's browser-delivered files are readable by visitors.

## Develop the mobile layout in Chrome

You can work on the mobile site from your desktop browser while `npm run dev` is running.

1. Open your local site in Chrome.
2. Right-click the page and choose **Inspect** to open Developer Tools, also called DevTools.
3. Click the **phone/tablet icon** in DevTools to toggle the Device Toolbar.
4. In the **Dimensions** dropdown, choose **Responsive** and enter a width and height, such as **390 × 844**, or choose a phone preset.
5. Reload after selecting a device. Scroll, click or tap controls, save your edits in VS Code, and inspect the result.
6. Use **Rotate** to check landscape. Toggle the phone/tablet icon off to return to the normal desktop viewport.

Useful [Chrome keyboard shortcuts](https://developer.chrome.com/docs/devtools/shortcuts):

| Action | Windows | Mac |
| --- | --- | --- |
| Open DevTools | Ctrl+Shift+I | Command+Option+I |
| Toggle Device Toolbar, with DevTools open | Ctrl+Shift+M | Command+Shift+M |

This project's mobile layout is active at **767 CSS pixels wide or less**; desktop starts at **768**. The switch in `src/App.jsx` mounts a different component, so always inspect both layouts. A landscape phone can be wide enough to show the desktop layout.

Try these widths as you edit: **320, 390, 600, 767, 768, 1024, and 1440**. Check that headings fit, buttons remain reachable, there is no unwanted sideways scrolling, the Telephone player starts and stops, and the newsletter is usable. Resize across 767/768 and check that the form still works. If opening DevTools makes the normal viewport narrow, the site may switch to mobile even with Device Toolbar off.

Changes made directly in DevTools' Elements/Styles panels are temporary. Copy changes into the appropriate source file in VS Code and save to keep them.

Google's [illustrated Device Mode tutorial](https://developer.chrome.com/docs/devtools/device-mode) covers resizing, device presets, screenshots, and network/CPU throttling. Its [short video tutorial](https://www.youtube.com/watch?v=f7kokNyRe7U) demonstrates the controls. Start without throttling; use it later to check slow connections, then turn it off again.

Device Mode approximates mobile behavior; it still runs your desktop Chrome browser. Check a real iPhone/Safari and Android/Chrome when possible, especially for audio, autoplay, scrolling, and the on-screen keyboard. See Google's [Device Mode limitations](https://developer.chrome.com/docs/devtools/device-mode#limitations).

### Optional: open your local site on a real phone

Connect your computer and phone to the same trusted Wi-Fi network. Stop the local server and restart it with:

```sh
npm run dev -- --host 0.0.0.0
```

Open the **Network** URL Vite prints on your phone, such as `http://192.168.1.25:5173/`. Use your computer's actual printed address. `localhost` on a phone means the phone itself. If prompted by Windows Firewall, allow access on your private network. Guest Wi-Fi or a VPN can block the connection. This exposes the development server to that network while it runs; stop it with Ctrl+C when finished. A Vercel preview URL is another way to test on a phone once you have publishing access.

## Check your changes before publishing

### Validate content and make a production build

Keep the development server running if you like, and open a **second terminal** with the **+** button in VS Code's terminal panel. Run these separately from the project folder:

```sh
npm run test:content
npm run build
```

The content check validates YAML and project expectations. The build creates `dist/`, the finished files Vercel will serve, and also validates content. Both commands should finish successfully before you publish. A successful build does not automatically run every test.

**Some tests deliberately expect the current content**, including the Telephone release, Kit ID, no show/merch items, and hidden Booking section. Intentional updates to those details may require matching changes in `tests/content.mjs` and `tests/interaction.mjs`. Read the failing assertion and confirm your intended behavior; do not simply delete tests to make them pass. New YAML fields or changes to its structure must also be reflected in `src/content/validateContent.js` and the content tests.

### Inspect the production version locally

After building, run:

```sh
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/` and repeat the desktop/mobile checks. This preview serves the last build, so after editing you must rebuild to see new changes here. It is a local preview, not a Vercel deployment. Leave its terminal running while you use it.

### Run the interaction check after layout or behavior changes

With that production preview running, open another terminal. Install the test browser once:

```sh
npx playwright install chromium
```

Then run:

```sh
npm run test:interaction
```

The test uses `http://127.0.0.1:4173/` by default. It exercises mobile/desktop behavior, media, and the newsletter. It intercepts signup submissions, but still loads the external Kit embed, so it needs network access to Kit. A missing/blocked embed can make this check fail even when local code builds.

If you intentionally use a different preview URL, set it for the test using your terminal's syntax:

**Windows Command Prompt:**

```bat
set "TEST_URL=http://127.0.0.1:4175/"
npm run test:interaction
```

**Windows PowerShell:**

```powershell
$env:TEST_URL = "http://127.0.0.1:4175/"
npm run test:interaction
```

**Mac:**

```sh
TEST_URL=http://127.0.0.1:4175/ npm run test:interaction
```

For targeted maintenance, `package.json` also provides `test:bundle`, `test:cache`, `test:fonts`, `test:media`, and `test:montage`. Some inspect the built output; media/montage checks use FFmpeg/FFprobe. There is no generic `npm test` command in this project.

## Publish through the existing GitHub and Vercel setup

Local saving, committing, uploading, and going live are separate steps. Use the existing connected repository and Vercel project to update the current website.

### Get access to the existing accounts

You need the GitHub access described above. For deployment settings, logs, and domains, create a Vercel account at [vercel.com](https://vercel.com/) and ask the current owner to arrange access to the existing project/team. Availability of collaboration features depends on the owner's plan. A new personal account does not automatically own the current project.

Ask the owner to confirm the connected GitHub repository and **Production Branch** in Vercel's project settings. It is commonly `main`; confirm rather than assuming. The account-specific production branch and DNS values cannot be determined from these source files alone. Vercel's [GitHub integration guide](https://vercel.com/docs/git/vercel-for-github) explains the connection and deployment permissions.

GoDaddy access is only needed to manage the domain or DNS. Ordinary text, style, and media updates do not need DNS edits. Kit access is separate if you need to manage the mailing list.

### Upload a branch for review

1. Finish and check your edits on your feature branch. In GitHub Desktop's **Changes** tab, inspect the changed lines and select only files belonging to your update.
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

Follow Vercel's [Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite). First test the generated `*.vercel.app` address. For an independent copy, replace the canonical URL in `site.yaml`, review links and branding, and replace or hide the original Kit form before accepting signups.

### How GoDaddy fits into the domain setup

The current GoDaddy DNS already points visitors to Vercel. Keep it in place for routine site updates. If the domain is intentionally moved to a different Vercel project, the owner must arrange any required domain reassignment there.

For a new custom domain, add it to the intended Vercel project's **Domains** settings. Copy the exact DNS records Vercel shows into that domain's GoDaddy DNS settings, then wait for verification and HTTPS setup. Do not copy old IP addresses from a tutorial: the required values depend on the domain/project setup. See Vercel's [custom domain setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain) and GoDaddy's [A-record editing guide](https://www.godaddy.com/help/edit-an-a-record-19239).

DNS edits belong at the provider hosting the domain's authoritative nameservers. If those are GoDaddy's, edit records there; if the nameservers were moved elsewhere, edit them at that provider. Preserve unrelated records, especially email records such as MX and TXT. Vercel explains [DNS management and nameservers](https://vercel.com/docs/domains/working-with-dns).

## Troubleshooting

| Problem | What to try |
| --- | --- |
| `node` or `npm` is not recognized / command not found | Install Node.js, close and reopen VS Code, and check both version commands again. |
| PowerShell blocks `npm.ps1` | Use Command Prompt or `npm.cmd`, as described in local setup. |
| `ENOENT` or cannot find `package.json` | Open the actual extracted/cloned project folder, not its parent or the ZIP itself. Open a fresh terminal there. |
| `vite` is not recognized / missing module | Run `npm ci` in the project folder, then retry. |
| `EBADENGINE` or unsupported Node version | Install Node 24 LTS, restart the terminal, and run `npm ci` again. |
| `npm ci` says the lockfile and package file disagree | Restore the matching `package.json` and `package-lock.json` from the same revision. If you deliberately changed dependencies, review that change and regenerate the lockfile with `npm install`; do not delete the lockfile as a workaround. Production dependency changes require the project owner's approval. |
| Browser says it cannot connect | Keep the server terminal open and use its printed URL, including the correct port. |
| Preview says port 4173 is in use | Stop the old preview with Ctrl+C, or choose a different port and set `TEST_URL` for the interaction test. |
| Red error overlay or `Content validation failed at ...` | Read the field path in the terminal, check YAML indentation/value types, and undo the last edit if needed. Hidden sections must still have valid fields. |
| Content test fails after an intentional content update | Check whether it asserts an old release detail or visibility state; update the relevant expectation along with the content. |
| Dev site updates but production preview does not | Run `npm run build` again. The preview serves `dist`, not the live source files. |
| Image or video is missing | Confirm its public path, letter case, asset registration, and every responsive variant. |
| Newsletter does not load | Check your internet connection and whether a privacy/ad-blocking extension blocks Kit. Confirm the configured host and public form ID. |
| Playwright says its browser executable is missing | Run `npx playwright install chromium`, then retry with the production preview running. |
| GitHub repository shows 404 / push denied | Sign into the invited account and accept the invitation; ask the owner to confirm repository permissions. |
| Pushing does not update the live site | Check the repository/branch connection, Vercel permissions, deployment status, and logs. A feature branch normally creates a preview rather than changing production. |
| Visitors still see an old media file | Give replacement media a new filename, update its references/version, rebuild, and deploy. A local hard refresh alone does not update visitors' caches. |

If you need help, share the command you ran and its error text, your operating system, and the Node version. Include which page or viewport fails. Leave passwords, tokens, and private account information out of screenshots and messages.
