# Hussain Yisa: personal portfolio

A fast, free-to-host portfolio site written in plain HTML, CSS and JavaScript. There is no build step, no framework and no dependencies, so it deploys to Cloudflare Pages exactly as it is.

```
hussain-yisa-portfolio/
├── index.html        Page content (this is the file you edit most)
├── css/style.css     Colours, fonts and layout
├── js/main.js        Interactive parts (network, terminal, animations)
├── images/           Three hero image options (hero-1, hero-2, hero-3)
├── favicon.svg       Browser tab icon
├── 404.html          Page shown for broken links
├── _headers          Security headers Cloudflare applies automatically
└── README.md         This guide
```

---

## 1. Make it yours (do this first)

Open `index.html` and search for `EDIT`. Every comment marked `EDIT` tells you what to change.

| What | Where in `index.html` |
| --- | --- |
| Intro text | `<p class="lede">` in the hero (the three `redact` phrases get the blacked-out effect) |
| Skills lists | `<section id="skills">` |
| Projects | `<section id="work">` (see below) |
| University | `<section id="education">` (already set to Nile University of Nigeria) |
| Email and social links | `<section id="contact">`, replace every `YOUR-USERNAME` (your email is already set) |

**Projects.** Exhibit A is this portfolio, B is your Wazuh security operations project and C is your social engineering and phishing study. To add another project, copy one whole `<li class="exhibit">...</li>` block and change the letter, title, description and link. The little "In progress" chip on C is a `<span class="status">`: delete it once the project is finished.

**Socials.** Delete any row in the `socials` list you don't use. To add one, copy a `<li>` row and change the link and handle.

**Colours and fonts.** All of them live at the top of `css/style.css` under `:root`. Dark mode follows the visitor's device and has its own set just below.

**Hero image.** Three options are included in the `images` folder: `hero-1.svg` (fingerprint and lens), `hero-2.svg` (network with one flagged node) and `hero-3.svg` (redacted case file, the default). To switch, open `index.html`, find `<figure class="hero-art">` and change the file name in `src`. To use your own photo instead, drop it into `images` (for example `me.jpg`), point `src` at it and describe it in the `alt` text.

### Preview on your computer

Double-click `index.html` to open it in a browser. For a closer match to the live site, run a tiny local server from inside the folder:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

---

## 2. Put the site on GitHub

You only need to do the setup once. After that, every change is a quick save and push.

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Click **New repository**. Name it `hussain-yisa-portfolio` (or anything you like). Public or private both work with Cloudflare. Leave "Add a README" unchecked.
3. Upload the files using whichever method you prefer.

**Option A: no tools needed.** On the new empty repo page, click **uploading an existing file**, drag in everything from this folder (keep the `css` and `js` folders), then click **Commit changes**.

**Option B: Git on your computer** (best for editing regularly). Install [Git](https://git-scm.com/downloads), open a terminal inside this folder and run:

```
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hussain-yisa-portfolio.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. A browser window will ask you to sign in the first time.

**Option C: GitHub Desktop.** If you prefer clicking over typing, [GitHub Desktop](https://desktop.github.com) does the same thing with buttons.

### Editing later

- **Quick fix from any device:** open the file on GitHub, click the pencil icon, edit, then **Commit changes**.
- **On your computer:** edit the files, then run `git add .`, `git commit -m "Describe the change"` and `git push`.

Either way, Cloudflare notices the change and redeploys the site within about a minute (see below).

---

## 3. Host it free on Cloudflare Pages

Cloudflare Pages has a free plan that is more than enough for a portfolio: free hosting, free HTTPS and a free `*.pages.dev` address.

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) and verify your email.
2. In the dashboard sidebar, open **Workers & Pages**.
3. Click **Create**, choose the **Pages** option, then **Import an existing Git repository** (sometimes labelled **Connect to Git**).
4. Choose **GitHub**. The first time, Cloudflare asks you to install its GitHub app. Authorise it and, for safety, give it access to **only the portfolio repository**.
5. Select your `hussain-yisa-portfolio` repository and click **Begin setup**.
6. Fill in the build settings:

   | Setting | Value |
   | --- | --- |
   | Project name | `hussain-yisa` (this becomes `hussain-yisa.pages.dev`) |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | leave empty |
   | Build output directory | leave empty or enter `/` |

7. Click **Save and Deploy**. After a minute or so your site is live at `https://YOUR-PROJECT-NAME.pages.dev`.

From now on, every push to `main` redeploys automatically. Pushes to other branches get their own preview link, which is handy for trying changes before they go live.

Cloudflare occasionally rearranges its dashboard. If a button name differs, the steps in [Cloudflare's Pages Git integration guide](https://developers.cloudflare.com/pages/platform/git-integration/) cover the same flow.

### Optional: use your own domain

1. Buy a domain from any registrar (Cloudflare Registrar sells them at cost).
2. In your Pages project open **Custom domains**, click **Set up a custom domain** and follow the prompts.
3. Cloudflare creates the DNS record and issues the HTTPS certificate for you.

Domains are the only part of this setup that costs money. The `pages.dev` address is free forever.

### Security headers

The `_headers` file tells Cloudflare to send protective headers with every page, including a strict Content Security Policy. It allows scripts and styles from your own site and fonts from Google Fonts. If you later add something from another service (an analytics script, an embedded video, a form provider), add that service's address to the matching rule in `_headers`, or the browser will block it.

---

## 4. The interactive parts

Everything moves for a reason, and all of it works without touching any code.

| Feature | What it does | How to change or remove it |
| --- | --- | --- |
| Network background | Drifting dots in the hero link up and chase the cursor | Delete the `<canvas class="net" ...>` line in `index.html` |
| Hero image | Tilts toward the cursor, click or tap to switch images | Delete `data-images="..."` on `<figure class="hero-art">` to keep one fixed image |
| Redacted intro | Key phrases are blacked out, then reveal; the "Redact" button puts them back | Remove the `<button class="redact-toggle" ...>` line |
| Scroll reveals | Sections slide in as you scroll | Remove the "Reveal sections" block at the bottom of `js/main.js` |
| Progress bar | Blue line at the top fills as you scroll | Delete the `<div class="progress">` line |
| "Interview me" terminal | Visitors type `help`, `skills`, `projects`, `contact` and more | Delete the `<section id="terminal">` block and the Terminal link in the nav |

The terminal reads its answers straight from the page, so when you update your skills, projects or contact details, it updates itself. It also has a hidden command for visitors who like poking around.

People who have "reduce motion" turned on in their device settings get a calm version: the background stays still and the scroll animations are skipped.

---

## 5. Ideas for later


- **CV download.** Put a PDF in a new `assets` folder, then add `<a class="btn btn-ghost" href="assets/Hussain-Yisa-CV.pdf">Download CV</a>` next to the hero buttons.
- **Project write-ups.** Add a page such as `writeups/home-lab.html`, copy the head and header from `index.html`, and link to it from the project's "links" line.
- **Social preview image.** Add a 1200x630 image and the tags `<meta property="og:image" content="https://YOUR-SITE/preview.png">` and `<meta name="twitter:card" content="summary_large_image">` so links look good when shared.
