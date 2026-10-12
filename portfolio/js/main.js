// Loads data/site.json and data/projects.json and builds the page.
(async () => {
  const $ = s => document.querySelector(s);
  const root = document.documentElement;
  const thumbs = [];            // generated thumbnails, redrawn on theme change / resize

  // ---- Theme toggle ----
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  $('#theme').onclick = () => { root.dataset.theme = isDark() ? "light" : "dark"; setTimeout(redrawThumbs, 0); };

  // ---- Load data ----
  let site, projects;
  try {
    [site, projects] = await Promise.all([
      fetch('data/site.json').then(r => r.json()),
      fetch('data/projects.json').then(r => r.json())
    ]);
  } catch (err) {
    $('#grid').innerHTML = '<p class="empty">Could not load data. Open the site with VS Code Live Server or a web host, not by double-clicking index.html.</p>';
    return;
  }
  projects.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // ---- Site info ----
  document.title = site.name + " | 3D Artist Portfolio";
  $('#logo').textContent = site.name;
  $('#tagline').textContent = site.tagline;
  $('#intro').textContent = site.intro;
  $('#about-text').innerHTML = "";
  site.about.forEach(t => { const p = document.createElement('p'); p.textContent = t; $('#about-text').appendChild(p); });
  site.skills.forEach(g => {
    const d = document.createElement('div'); d.className = "skill";
    d.innerHTML = "<h3></h3><div class='tags'></div>";
    d.querySelector('h3').textContent = g.group;
    g.items.forEach(i => { const s = document.createElement('span'); s.textContent = i; d.querySelector('.tags').appendChild(s); });
    $('#skills').appendChild(d);
  });
  site.links.forEach(l => {
    const a = document.createElement('a'); a.href = l.url; a.textContent = l.label; a.target = "_blank"; a.rel = "noopener";
    $('#links').appendChild(a);
  });

  // ---- Stats ----
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
  const totalTris = projects.reduce((s, p) => s + (p.tris || 0), 0);
  const cats = [...new Set(projects.map(p => p.category))];
  const latest = projects[0] ? new Date(projects[0].date).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "-";
  [["Projects", projects.length], ["Categories", cats.length], ["Triangles modelled", fmt(totalTris)], ["Last update", latest]].forEach(([k, v]) => {
    const d = document.createElement('div');
    d.innerHTML = "<dt></dt><dd></dd>";
    d.querySelector('dt').textContent = k; d.querySelector('dd').textContent = v;
    $('#stats').appendChild(d);
  });

  // ---- Thumbnails ----
  function drawThumb(canvas, seed) {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const d = Math.min(devicePixelRatio || 1, 2), ctx = canvas.getContext('2d');
    canvas.width = r.width * d; canvas.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    Mesh.draw(ctx, r.width, r.height, Mesh.build(seed), 0.7, -0.3, "solid");
  }
  function redrawThumbs() { thumbs.forEach(([c, s]) => drawThumb(c, s)); }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redrawThumbs, 150); });

  function makeThumb(p, src) {
    const box = document.createElement('div'); box.className = "thumb";
    const fallback = () => {
      box.innerHTML = "";
      const c = document.createElement('canvas'); box.appendChild(c);
      const seed = Mesh.hash(p.id || p.title);
      thumbs.push([c, seed]);
      requestAnimationFrame(() => drawThumb(c, seed));
    };
    if (src) {
      const img = new Image(); img.loading = "lazy"; img.alt = p.title; img.src = src;
      img.onerror = fallback; box.appendChild(img);
    } else fallback();
    return box;
  }

  // ---- Gallery ----
  let cat = "All";
  function renderChips() {
    $('#chips').innerHTML = "";
    ["All", ...cats].forEach(c => {
      const b = document.createElement('button'); b.type = "button"; b.className = "chip"; b.textContent = c;
      b.setAttribute('aria-pressed', c === cat);
      b.onclick = () => { cat = c; renderChips(); renderGrid(); };
      $('#chips').appendChild(b);
    });
  }
  function renderGrid() {
    thumbs.length = 0;
    const g = $('#grid'); g.innerHTML = "";
    const list = projects.filter(p => cat === "All" || p.category === cat);
    if (!list.length) { g.innerHTML = '<p class="empty">No projects in this category yet.</p>'; return; }
    list.forEach(p => {
      const b = document.createElement('button'); b.type = "button"; b.className = "card";
      b.appendChild(makeThumb(p, p.cover));
      const info = document.createElement('div'); info.className = "card-info";
      info.innerHTML = "<strong></strong><small></small>";
      info.querySelector('strong').textContent = p.title;
      info.querySelector('small').textContent = p.category;
      b.appendChild(info);
      b.onclick = () => openModal(p);
      g.appendChild(b);
    });
  }

  // ---- Modal ----
  const modal = $('#modal');
  function openModal(p) {
    $('#m-cat').textContent = p.category;
    $('#m-title').textContent = p.title;
    $('#m-desc').textContent = p.description;
    $('#m-meta').textContent = fmt(p.tris || 0) + " triangles. Made with " + p.tools + ".";
    const wrap = $('#m-images'); wrap.innerHTML = "";
    if (p.images && p.images.length) {
      p.images.forEach(src => { const i = new Image(); i.loading = "lazy"; i.alt = p.title; i.src = src; wrap.appendChild(i); });
    } else {
      const t = makeThumb(p, ""); wrap.appendChild(t);
    }
    modal.showModal();
  }
  $('#m-close').onclick = () => modal.close();
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  renderChips();
  renderGrid();
})();
