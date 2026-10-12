# 3D Portfolio

Plain HTML, CSS and JavaScript. No build step.

## Folder layout

```
portfolio/
├─ index.html
├─ css/style.css
├─ js/
│  ├─ mesh.js        low-poly mesh + renderer (hero + auto thumbnails)
│  ├─ viewport.js    hero viewport controls
│  └─ main.js        builds the page from the data files
├─ data/
│  ├─ site.json      your name, intro, about text, skills, links
│  └─ projects.json  one entry per project  <-- you edit this
└─ projects/
   └─ <project-id>/  your images for that project
```

## Run it locally

1. Open the folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

(Double-clicking `index.html` will not work because the page loads its data with `fetch()`.)

## Add a new project (about 2 minutes)

1. Create a folder: `projects/ruined-chapel/`
2. Export your renders as **WebP**, about 1600 px wide, under 300 KB each. Put them in the folder, for example `cover.webp` and `shot-01.webp`.
3. Add a block at the top of `data/projects.json`:

```json
{
  "id": "ruined-chapel",
  "title": "Ruined Chapel",
  "category": "Environment",
  "date": "2026-10-11",
  "tris": 24600,
  "tools": "Blender, Substance Painter, Unreal Engine",
  "description": "One or two sentences about the piece.",
  "cover": "projects/ruined-chapel/cover.webp",
  "images": [
    "projects/ruined-chapel/shot-01.webp",
    "projects/ruined-chapel/shot-02.webp"
  ]
}
```

Rules: keep the commas between blocks, and use a new `category` name any time and a filter chip appears automatically. Projects sort by `date`, newest first. If `cover` is empty or the file is missing, a generated low-poly thumbnail is shown instead.

## Publish it (free) and update from anywhere

1. Create a free **GitHub** account and a new repository.
2. Upload this folder to the repository.
3. Turn on hosting with one of these (all free, all redeploy automatically when the repository changes):
   - **GitHub Pages**: repository Settings > Pages > deploy from the main branch.
   - **Netlify** or **Cloudflare Pages**: "Import from Git" and pick the repository.

### Updating without VS Code (even from your phone)

On github.com open the repository, then **Add file > Upload files** to drop in new images, and use the pencil icon on `data/projects.json` to add the new block. Commit, and the site updates in a minute or two.

## Later upgrades

- **Decap CMS**: adds an `/admin` page with a form to upload images and fill in project fields, so you never touch JSON.
- **Astro**: worth it only if you want a full page per project with long breakdowns.
