/* ============================================================
   Vantage Point Studio — interactions
   Progressive enhancement: the page is fully readable without
   this file (static axonometric SVG stands in for the model).
   ============================================================ */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  /* drafting ease — decisive start, precise settle, no bounce */
  const easeOut = (t) => 1 - Math.pow(1 - t, 5);

  /* ---------------- projects: facts + massing compositions ----------------
     Each volume: [cx, cz, w, d, h, yBase] in abstract site units (plot ~8×8). */
  const PROJECTS = [
    { name: 'HALLE AM UFER', facts: '52.5069°N 13.4310°E · 12,400 M² · 2024 · BUILT',
      vols: [[0, 0, 5.6, 2.6, 1.6, 0], [-2.2, 0.2, 1.2, 1.2, 3.2, 0], [1.8, 1.7, 1.5, 1.1, 0.9, 0], [0.6, -1.7, 2.3, 0.9, 0.8, 0]] },
    { name: 'TERRASSHUSET', facts: '59.9139°N 10.7522°E · 8,200 M² · 2023 · BUILT',
      vols: [[0, 0, 4.6, 3.2, 0.75, 0], [0.4, 0.3, 3.6, 2.5, 0.75, 0.75], [0.85, 0.6, 2.6, 1.9, 0.75, 1.5], [1.3, 0.9, 1.6, 1.3, 0.75, 2.25], [-1.6, -0.9, 0.75, 0.75, 3.4, 0]] },
    { name: 'COUR OUVERTE', facts: '45.7640°N 4.8357°E · 6,750 M² · 2025 · ON SITE',
      vols: [[0, -1.9, 4.8, 1.0, 1.4, 0], [0, 1.9, 4.8, 1.0, 1.8, 0], [-2.4, 0, 1.0, 2.8, 1.2, 0], [2.4, 0.4, 1.0, 2.0, 2.3, 0]] },
    { name: 'STILLE KAMMER', facts: '51.3397°N 12.3731°E · 4,300 M² · 2022 · BUILT',
      vols: [[-0.2, 0, 2.4, 2.4, 3.0, 0], [0.2, 0.1, 5.0, 3.6, 0.5, 0], [2.0, -1.2, 1.3, 0.9, 1.1, 0.5]] },
    { name: 'FEMTE VÅNING', facts: '59.3293°N 18.0686°E · 3,900 M² · 2026 · COMPETITION, 1ST PRIZE',
      vols: [[0, 0, 3.8, 2.9, 2.2, 0], [0.5, 0.4, 2.5, 1.8, 0.95, 2.2], [-1.25, -0.85, 1.0, 1.0, 1.4, 2.2]] },
    { name: 'PASSAGE 44', facts: '51.9244°N 4.4777°E · 15,800 M² · 2021 · BUILT',
      vols: [[0, 0, 6.2, 2.5, 0.8, 0], [-2.4, 0, 0.34, 2.9, 1.9, 0], [-1.2, 0, 0.34, 2.9, 1.9, 0], [0, 0, 0.34, 2.9, 1.9, 0], [1.2, 0, 0.34, 2.9, 1.9, 0], [2.4, 0, 0.34, 2.9, 1.9, 0]] },
  ];
  const POOL = 8; // fixed mesh pool; unused volumes collapse to zero

  /* ---------------- reveals + hero intro ---------------- */
  const hero = document.getElementById('hero');
  requestAnimationFrame(() => hero && hero.classList.add('loaded'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------------- counters ---------------- */
  const fmt = (n, pad) => {
    let s = Math.round(n).toLocaleString('en-US');
    if (pad) s = String(Math.round(n)).padStart(+pad, '0');
    return s;
  };
  const cio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      const el = e.target, to = parseFloat(el.dataset.to), pad = el.dataset.pad;
      if (reduce) { el.textContent = fmt(to, pad); continue; }
      const t0 = performance.now(), dur = 1300;
      const tick = (now) => {
        const t = clamp((now - t0) / dur, 0, 1);
        el.textContent = fmt(to * easeOut(t), pad);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.5 });
  document.querySelectorAll('.c-num').forEach((el) => cio.observe(el));

  /* ---------------- project index → viewer swap ---------------- */
  const rows = [...document.querySelectorAll('.row')];
  const indexEl = document.querySelector('.index');
  const vCaption = document.getElementById('vCaption');
  const vFacts = document.getElementById('vFacts');
  let current = 0;
  let morphTo = null; // set by the viewer once ready

  const select = (i, fromHover) => {
    if (i === current && fromHover) return;
    current = i;
    rows.forEach((r, j) => {
      r.classList.toggle('is-active', j === i);
      r.setAttribute('aria-pressed', String(j === i));
    });
    indexEl.classList.add('has-active');
    vCaption.textContent = `STUDY ${String(i + 1).padStart(2, '0')} — ${PROJECTS[i].name}`;
    vFacts.textContent = PROJECTS[i].facts;
    if (morphTo) morphTo(i);
  };
  rows.forEach((r) => {
    const i = +r.dataset.i;
    r.addEventListener('pointerenter', () => select(i, true));
    r.addEventListener('focus', () => select(i, true));
    r.addEventListener('click', () => select(i));
  });
  rows[0].classList.add('is-active');
  indexEl.classList.add('has-active');

  /* ---------------- plates: drag + keyboard gallery ---------------- */
  const track = document.getElementById('platesTrack');
  const bar = document.getElementById('platesBar');
  if (track && bar) {
    const setBar = () => {
      const scrollable = track.scrollWidth - track.clientWidth;
      const p = scrollable > 0 ? track.scrollLeft / scrollable : 0;
      bar.style.transform = `scaleX(${0.12 + p * 0.88})`;
    };
    track.addEventListener('scroll', setBar, { passive: true });
    addEventListener('resize', setBar);
    setBar();

    let down = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return; // touch uses native scroll
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('dragging');
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => { down = false; track.classList.remove('dragging'); });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);

    const step = () => {
      const plate = track.querySelector('.plate');
      return plate ? plate.getBoundingClientRect().width + 24 : 400;
    };
    track.addEventListener('keydown', (e) => {
      const b = reduce ? 'auto' : 'smooth';
      if (e.key === 'ArrowRight') { track.scrollBy({ left: step(), behavior: b }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -step(), behavior: b }); e.preventDefault(); }
      if (e.key === 'Home') { track.scrollTo({ left: 0, behavior: b }); e.preventDefault(); }
      if (e.key === 'End') { track.scrollTo({ left: track.scrollWidth, behavior: b }); e.preventDefault(); }
    });
  }

  /* ---------------- three.js massing viewer ----------------
     Guarded: reduced motion or missing WebGL keeps the static SVG axon. */
  const stage = document.getElementById('viewerStage');
  const webglOK = (() => {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
    catch { return false; }
  })();

  if (stage && webglOK && !reduce) initViewer().catch(() => { /* SVG axon remains */ });

  async function initViewer() {
    const THREE = await import('three');

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // DPR cap
    renderer.setClearColor(0x000000, 0);
    stage.appendChild(renderer.domElement);
    stage.classList.add('webgl');

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(10, 8.2, 10);
    camera.lookAt(0, 1.05, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d5cc, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(5, 10, 3);
    scene.add(sun);

    const model = new THREE.Group();
    scene.add(model);

    /* soft contact shadow: radial-gradient canvas on a ground plane */
    const sh = document.createElement('canvas');
    sh.width = sh.height = 256;
    const ctx = sh.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 12, 128, 128, 126);
    g.addColorStop(0, 'rgba(22,22,22,.34)');
    g.addColorStop(0.55, 'rgba(22,22,22,.12)');
    g.addColorStop(1, 'rgba(22,22,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 11),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    model.add(shadow);

    /* site boundary: a thin square plot line */
    const plotPts = [new THREE.Vector3(-4.2, 0, -4.2), new THREE.Vector3(4.2, 0, -4.2),
      new THREE.Vector3(4.2, 0, 4.2), new THREE.Vector3(-4.2, 0, 4.2)];
    const plot = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(plotPts),
      new THREE.LineBasicMaterial({ color: 0x161616, transparent: true, opacity: 0.28 })
    );
    plot.position.y = 0.004;
    model.add(plot);

    /* mesh pool: unit cubes + edge lines, scaled per composition */
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const edgeGeo = new THREE.EdgesGeometry(boxGeo);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.95, metalness: 0 });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x161616, transparent: true, opacity: 0.42 });
    const pool = [];
    for (let i = 0; i < POOL; i++) {
      const m = new THREE.Mesh(boxGeo, bodyMat);
      m.add(new THREE.LineSegments(edgeGeo, edgeMat));
      m.visible = false;
      model.add(m);
      pool.push(m);
    }

    const targetOf = (comp, i) => {
      const v = comp[i];
      if (!v) return null;
      const [cx, cz, w, d, h, y0] = v;
      return { px: cx, py: y0 + h / 2, pz: cz, sx: w, sy: h, sz: d };
    };
    const apply = (m, t) => {
      m.position.set(t.px, t.py, t.pz);
      m.scale.set(Math.max(t.sx, 0.001), Math.max(t.sy, 0.001), Math.max(t.sz, 0.001));
    };

    /* precise tween pool between compositions */
    let anims = [];
    const morph = (i) => {
      const comp = PROJECTS[i].vols;
      anims = [];
      const now = performance.now();
      pool.forEach((m, j) => {
        let to = targetOf(comp, j);
        if (!to) { // collapse into the composition's centre, flat
          const base = targetOf(comp, j % comp.length);
          to = { px: base.px, py: 0, pz: base.pz, sx: 0.001, sy: 0.001, sz: 0.001 };
        }
        if (!m.visible) { apply(m, { ...to, sy: 0.001, py: 0 }); m.visible = true; }
        const from = {
          px: m.position.x, py: m.position.y, pz: m.position.z,
          sx: m.scale.x, sy: m.scale.y, sz: m.scale.z,
        };
        anims.push({ m, from, to, t0: now + j * 45, dur: 720 });
      });
    };
    pool.forEach((m) => { m.visible = false; });
    morph(current);
    // snap the first composition into place (no intro tween on load)
    anims.forEach((a) => { apply(a.m, a.to); });
    anims = [];
    morphTo = morph;

    /* drag to rotate + very slow turntable */
    let rotY = Math.PI * 0.22, targetRot = rotY, dragging = false, lastX = 0;
    stage.addEventListener('pointerdown', (e) => {
      dragging = true; lastX = e.clientX; stage.classList.add('dragging');
      stage.setPointerCapture?.(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      targetRot += (e.clientX - lastX) * 0.008;
      lastX = e.clientX;
    });
    const endDrag = () => { dragging = false; stage.classList.remove('dragging'); };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* sizing — always draw a frame after resize (setSize clears the canvas,
       and the loop may be paused in a hidden tab) */
    const FRUSTUM = 8.6;
    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      const a = w / h;
      camera.left = -FRUSTUM * a / 2; camera.right = FRUSTUM * a / 2;
      camera.top = FRUSTUM / 2 + 1.2; camera.bottom = -FRUSTUM / 2 + 1.2;
      camera.updateProjectionMatrix();
      model.rotation.y = rotY;
      renderer.render(scene, camera);
    };
    new ResizeObserver(resize).observe(stage);
    resize();

    /* render loop — pauses when off-screen or tab hidden */
    let inView = true, last = performance.now(), rafId = 0;
    const vio = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) { last = performance.now(); loop(last); }
    }, { threshold: 0.02 });
    vio.observe(stage);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && inView) { last = performance.now(); loop(last); }
    });

    const loop = (now) => {
      cancelAnimationFrame(rafId);
      if (!inView || document.hidden) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (!dragging) targetRot += dt * 0.11; // very slow turntable
      rotY += (targetRot - rotY) * Math.min(1, dt * 7);
      model.rotation.y = rotY;

      if (anims.length) {
        anims = anims.filter((a) => {
          const t = clamp((now - a.t0) / a.dur, 0, 1);
          if (t <= 0) return true;
          const k = easeOut(t);
          apply(a.m, {
            px: a.from.px + (a.to.px - a.from.px) * k,
            py: a.from.py + (a.to.py - a.from.py) * k,
            pz: a.from.pz + (a.to.pz - a.from.pz) * k,
            sx: a.from.sx + (a.to.sx - a.from.sx) * k,
            sy: a.from.sy + (a.to.sy - a.from.sy) * k,
            sz: a.from.sz + (a.to.sz - a.from.sz) * k,
          });
          return t < 1;
        });
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    loop(performance.now());

    /* cleanup */
    addEventListener('pagehide', () => {
      cancelAnimationFrame(rafId);
      boxGeo.dispose(); edgeGeo.dispose(); bodyMat.dispose(); edgeMat.dispose();
      shadow.geometry.dispose(); shadow.material.map.dispose(); shadow.material.dispose();
      plot.geometry.dispose(); plot.material.dispose();
      renderer.dispose();
    }, { once: true });
  }
})();
