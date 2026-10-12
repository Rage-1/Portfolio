// Hero viewport: draggable mesh with shading modes.
(() => {
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, yaw = 0.6, pitch = -0.35, mode = "solid", mesh, dragging = false, lx = 0, ly = 0;

  function newMesh() {
    mesh = Mesh.build((Math.random() * 1e9) | 0);
    document.getElementById('nv').textContent = mesh.v.length;
    document.getElementById('nf').textContent = mesh.f.length;
  }
  newMesh();

  function resize() {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  new ResizeObserver(resize).observe(cv);
  resize();

  function tick() {
    if (!reduce && !dragging) yaw += 0.004;
    Mesh.draw(ctx, W, H, mesh, yaw, pitch, mode);
    requestAnimationFrame(tick);
  }
  tick();

  cv.addEventListener('pointerdown', e => {
    dragging = true; lx = e.clientX; ly = e.clientY;
    cv.classList.add('drag'); cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    yaw += (e.clientX - lx) * 0.012;
    if (e.pointerType === "mouse") pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - ly) * 0.01));
    lx = e.clientX; ly = e.clientY;
  });
  const end = () => { dragging = false; cv.classList.remove('drag'); };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);

  document.getElementById('modes').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    mode = b.dataset.m;
    document.querySelectorAll('#modes button').forEach(x => x.setAttribute('aria-pressed', x === b));
  });
  document.getElementById('reroll').onclick = newMesh;
})();
