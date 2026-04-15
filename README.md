# Simple AI Projects for Kids

A static website that gives kids (ages 5 through 16+) hands-on AI projects they can actually build. Plain HTML + CSS, no frameworks. Deployable to GitHub Pages as-is.

## File structure

```
/
├── index.html                       Home page
├── grown-ups.html                   For parents and teachers
├── glossary.html                    AI words explained simply
├── safety.html                      Kid-safe rules for AI projects
├── css/
│   └── styles.css                   All shared styles
├── ages/
│   ├── 5-8.html                     Ages 5–8 landing page
│   ├── 9-12.html                    Ages 9–12 landing page
│   ├── 13-15.html                   Ages 13–15 landing page
│   └── 16-plus.html                 Ages 16+ landing page
├── projects/
│   ├── teach-computer-to-sort.html  Ages 5–8 sample project
│   ├── custom-chatbot.html          Ages 9–12 sample project
│   ├── movie-recommender.html       Ages 13–15 sample project
│   └── study-buddy.html             Ages 16+ sample project
├── js/
│   ├── common.js                    Shared interactive behavior (mascot, steps, videos, quiz…)
│   └── demo.js                      Homepage "Happy or Sad?" live AI demo
├── images/                          Drop AI-generated art here
│   └── scenes/                      Hero illustrations per project (see images/scenes/README.md)
└── videos/                          Optional project walkthrough MP4s (see videos/README.md)
```

## Adding videos to a project

Each project page already has a `<div class="video-slot">`. To replace the placeholder:

- **YouTube:** set `data-yt="YOUTUBE_ID"` on the slot.
- **Local MP4:** drop a file in `videos/` and set `data-src="../videos/FILE.mp4"`.

See `videos/README.md` for details and per-project filename suggestions.

## Adding illustrations to a project

Each project has an inline SVG hero scene that renders out of the box. To replace it with a PNG:

1. Create a PNG (suggest 1280×640) and drop it in `images/scenes/` with the expected filename — see `images/scenes/README.md`.
2. That's it. `js/common.js` preloads the PNG; if it loads, the inline SVG is replaced. If not, the SVG stays.

## How to preview

Just open `index.html` in a browser. No build step.

## How to deploy to GitHub Pages

1. Create a new GitHub repo.
2. Copy these files into the repo root.
3. Commit and push.
4. In repo settings → Pages, select "Deploy from a branch," pick `main` and `/ (root)`.
5. Your site is live at `https://<your-username>.github.io/<repo-name>/`.

## Image prompts for AI art

The site uses emoji and inline SVG as placeholders. When you're ready to replace them with generated images, here are prompts to start with. Keep the style consistent across all images: friendly, cartoony, rounded shapes, bright flat colors, thick black outlines, kids-book illustration feel.

### Hero illustration (home page)

> "Cute smiling robot with wide eyes and headphones, holding a paintbrush in one hand and a laptop in the other. Bright primary colors, thick black outlines, flat cartoon style, kids-book illustration. Transparent background. Square format."

Save as `images/hero-robot.png` and replace the inline SVG in `index.html`.

### Age band cards

Use a consistent character across the four cards — same robot, four outfits:

- **Ages 5–8:** "Same friendly robot holding crayons and finger-painting on an easel. Yellow background tint, bright primaries."
- **Ages 9–12:** "Same robot snapping together colorful coding blocks. Mint green background tint."
- **Ages 13–15:** "Same robot wearing headphones, typing on a laptop covered in stickers. Sky blue background tint."
- **Ages 16+:** "Same robot at a rocket-ship-shaped desk, surrounded by glowing screens and floating emoji reactions. Purple background tint."

Save as `images/band-5-8.png`, `images/band-9-12.png`, etc.

### Project thumbnails

Each age-band page currently uses an emoji as the thumbnail. For each project, generate a 16:9 illustration:

- **Teach the Computer to Sort:** "An apple and a banana floating above a laptop screen that shows two green checkmarks. Same robot-friendly style."
- **Build Your Own Chatbot:** "Chat bubble with three different messages (a wave, a question mark, and a peace sign) coming out of a smiling speech-bubble character."
- **Movie Recommender:** "Stack of film strips next to a laptop showing a thumbs-up ratings bar chart."
- **RAG Study Buddy:** "Stack of open books with a chat bubble floating above them saying '?'. Futuristic but approachable."

Save each as `images/projects/<project-slug>.png` and swap the `.project-thumb` divs in the HTML.

### Style guide (for consistency)

- Palette: cream background (#fdfaf5), warm yellow accent (#ffe28a), coral red (#ff6b6b), dark navy outlines (#1e1e2e)
- Always include thick black/dark outlines (minimum 3px equivalent)
- No photorealism. No 3D renders. Flat cartoon only
- Inclusive character design — vary hair, skin tones, and abilities across human characters
- No scary, dark, or edgy imagery — this site is kid-first

## How to add a new project

1. Copy one of the existing `projects/*.html` files — pick the one from the same age band.
2. Rename it and update the title, breadcrumb, headings, and content.
3. Open the matching `ages/*.html` file and turn one of the placeholder `href="#"` cards into a real link to your new project.

## Roadmap

- Replace emoji placeholders with AI-generated art
- Flesh out all remaining project pages (currently 4 of ~26 are complete)
- Add a printable teacher one-pager per project
- Add a simple search/filter on each age-band page
- Add an RSS feed or "new this month" section
