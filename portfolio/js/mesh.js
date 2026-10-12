// Low-poly mesh generator + 2D canvas renderer (no libraries).
// Used by the hero viewport and for auto-generated project thumbnails.
const Mesh = (() => {
  const norm = p => { const l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; };
  const L = norm([-0.5, 0.7, 0.6]);

  function rng(s) {
    return () => {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function build(seed) {
    const r = rng(seed), t = (1 + Math.sqrt(5)) / 2;
    let v = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm);
    const f = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    const cache = {};
    const mid = (a, b) => {
      const k = a < b ? a + "_" + b : b + "_" + a;
      if (cache[k] !== undefined) return cache[k];
      v.push(norm([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]));
      return cache[k] = v.length - 1;
    };
    const nf = [];
    for (const [a, b, c] of f) {
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    v = v.map(p => { const k = 0.78 + r() * 0.38; return [p[0] * k, p[1] * k * 0.9, p[2] * k]; });
    return { v, f: nf };
  }

  function rot(p, yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1];
    return [x, y * cp - z * sp, y * sp + z * cp];
  }

  // mode: "solid" | "wire" | "points"
  function draw(ctx, W, H, mesh, yaw, pitch, mode) {
    ctx.clearRect(0, 0, W, H);
    const s = getComputedStyle(document.documentElement);
    const A = s.getPropertyValue('--mesh-a').split(',').map(Number);
    const B = s.getPropertyValue('--mesh-b').split(',').map(Number);
    const acc = s.getPropertyValue('--accent').trim(), ink = s.getPropertyValue('--ink').trim();
    const sc = Math.min(W, H) * 0.36, cam = 4;
    const P = mesh.v.map(p => {
      const q = rot(p, yaw, pitch), k = cam / (cam - q[2]);
      return { x: W / 2 + q[0] * sc * k, y: H / 2 - q[1] * sc * k, q };
    });
    const faces = mesh.f.map(f => {
      const a = P[f[0]].q, b = P[f[1]].q, c = P[f[2]].q;
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      let n = norm([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]);
      const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3, cz = (a[2] + b[2] + c[2]) / 3;
      if (n[0] * cx + n[1] * cy + n[2] * cz < 0) n = [-n[0], -n[1], -n[2]];
      return { f, n, z: cz };
    }).sort((p, q) => p.z - q.z);

    ctx.lineJoin = "round";
    for (const o of faces) {
      const [i, j, k] = o.f, front = o.n[2] > 0;
      ctx.beginPath();
      ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.lineTo(P[k].x, P[k].y); ctx.closePath();
      if (mode === "solid") {
        if (!front) continue;
        const l = Math.max(0, o.n[0] * L[0] + o.n[1] * L[1] + o.n[2] * L[2]) * 0.85 + 0.15;
        ctx.fillStyle = "rgb(" + [0, 1, 2].map(m => Math.round(B[m] + (A[m] - B[m]) * l)).join(",") + ")";
        ctx.fill();
        ctx.strokeStyle = "rgba(" + B.join(",") + ",.45)"; ctx.lineWidth = 1; ctx.stroke();
      } else {
        ctx.globalAlpha = front ? (mode === "wire" ? 0.9 : 0.35) : (mode === "wire" ? 0.2 : 0.08);
        ctx.strokeStyle = mode === "wire" ? acc : ink; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    if (mode === "points") {
      ctx.fillStyle = acc;
      for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.283); ctx.fill(); }
    }
  }

  return { build, draw, hash };
})();
