# Personal Website

A minimal, chat-inspired portfolio website built with vanilla HTML, CSS, and JavaScript. Content is loaded from a single JSON file—no build step, no frameworks.

## Features

- **Chat-style UI** — Portfolio presented as a conversation with "Thinking..." indicators and stream-in animations
- **Cursor glow** — Subtle mouse-following glow effect
- **Data-driven** — All content (profile, skills, projects, experience, articles) comes from `data/data.json`
- **Articles** — Dedicated articles page with sidebar navigation and markdown-style content
- **Responsive** — Works on desktop and mobile

## Project Structure

```
├── index.html          # Main portfolio page
├── articles.html       # Articles / blog page
├── css/
│   ├── styles.css      # Global styles
│   └── articles.css    # Articles page styles
├── js/
│   ├── script.js       # Main page logic
│   └── articles.js     # Articles page logic
├── data/
│   └── data.json      # All content (edit this to customize)
└── assets/
    └── avatar.png     # Profile avatar
```

## Getting Started

### Run Locally

The site is static. Serve it with any HTTP server:

**Python:**
```bash
python -m http.server 8000
```

**Node (npx):**
```bash
npx serve .
```

Then open `http://localhost:8000` in your browser.

### Customize Content

Edit `data/data.json` to update:

- **profile** — Name, tagline, bio, avatar, email, location, social links
- **skills** — Skills with optional "reps" for visual weight
- **projects** — Title, description, technologies, demo/github links
- **experience** — Job history (title, company, period, description)
- **articles** — Slug, title, excerpt, date, tags, content (HTML)
- **contact** — Contact links and labels

## Deployment

Deploy to any static host. Examples:

- **GitHub Pages** — Push to a repo, enable Pages in Settings
- **Netlify** — Drag & drop the folder or connect your repo
- **Vercel** — Import the project, no config needed

## Tech Stack

- HTML5
- CSS3 (custom properties, flexbox, grid)
- Vanilla JavaScript (fetch, DOM APIs)
- [Inter](https://fonts.google.com/specimen/Inter) font

## License

MIT
