// ChameleonClear's shared parts: the skin-colour model (photonic crystal + pigments → a colour you can
// see), the heat model, a procedural chameleon (and a garden lizard to compare), a cut-open slab of
// skin, and the layout and chart-board helpers the chapters use (the same ones as JellyfishClear).
//
// The colour model, step by step (all in colourOf / skinSpectrum below):
//  1. Superficial iridophores (S-iridophores) hold guanine nanocrystals about 127 nm across
//     (127.4 ± 17.8 nm) packed in a triangular lattice, which the authors model as face-centred
//     cubic (FCC). Refractive indices: guanine 1.83, cytoplasm 1.33. The spacing between crystals is
//     on average 30% smaller in calm (green/blue) skin than in excited (yellow/orange) skin, while the
//     crystal size stays the same. Their simulations run the FCC lattice parameter a from 233 to 480
//     nm, which is a centre-to-centre distance s = a/√2 of about 165 to 340 nm.
//     (Teyssier, Saenko, van der Marel & Milinkovitch 2015, "Photonic crystals cause active colour
//     change in chameleons", Nature Communications 6: 6368; read in the Europe PMC full text.)
//  2. We replace their full photonic band-gap calculation with a first-order Bragg reflection from
//     the FCC (111) planes, the textbook simplification: λ = 2 · n_eff · d₁₁₁ · cosθ, with
//     d₁₁₁ = a/√3 = s·√(2/3), and n_eff² the volume-weighted mean of 1.83² and 1.33². The guanine
//     volume fraction is 0.74 (close packing) when crystals touch and falls as (D/s)³ as they move
//     apart. This toy model lands in the same range as the paper: violet-blue near s = 165 nm, red
//     near 300 nm, near-infrared by 340 nm.
//  3. The reflected band is drawn as a bell curve about 7.5% of λ wide. Light passes the yellow
//     pigment cells (xanthophores) on the way in and out, which absorb blue below about 500 nm, so blue
//     + yellow filter looks green (Teyssier et al. 2015 note xanthophores in the green skin).
//  4. Melanin moving up the melanophore arms covers the layers above and absorbs broadly.
//  5. The spectrum is turned into a screen colour with the CIE 1931 colour-matching functions (the
//     analytic fit of Wyman, Sloan & Shirley 2013, JCGT 2(2)), lit by a 6500 K blackbody (close to
//     daylight), converted to sRGB. Display brightness is raised a little so dark skins stay visible.
// The heat model is in absorbedPower(): see the comment there.
import { THREE, M, clamp, beam, sphere } from './kit.js';

export const TAU = Math.PI * 2;
export const N_GUANINE = 1.83, N_CYTO = 1.33, D_CRYSTAL = 127;   // Teyssier et al. 2015
export const S_CALM = 218, S_EXCITED = Math.round(218 * 1.3);   // nm; the paper's 30% difference

// ---------------------------------------------------------------- photonic crystal → wavelength
export function crystal(s, cosT = 1) {
  const f = 0.74 * Math.pow(Math.min(1, D_CRYSTAL / s), 3);
  const n = Math.sqrt(f * N_GUANINE ** 2 + (1 - f) * N_CYTO ** 2);
  const d = s * Math.sqrt(2 / 3);
  return { f, n, d, lambda: 2 * n * d * cosT };
}

// ---------------------------------------------------------------- spectra and colour
const L0 = 380, L1 = 730, DL = 5, NL = (L1 - L0) / DL + 1;
export const LAMBDAS = Array.from({ length: NL }, (_, i) => L0 + i * DL);
const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
const CMF = LAMBDAS.map((l) => [
  1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
  0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
  1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
]);
const planck = (l, T) => { const x = l * 1e-9; return 1 / (x ** 5 * (Math.exp(1.4388e-2 / (x * T)) - 1)); };
const ILL = (() => { const a = LAMBDAS.map((l) => planck(l, 6500)); const m = a[Math.round((560 - L0) / DL)]; return a.map((v) => v / m); })();
const YW = LAMBDAS.reduce((acc, _, i) => acc + ILL[i] * CMF[i][1], 0);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function xyzToRgb([X, Y, Z], gain = 1) {
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  r *= gain; gg *= gain; b *= gain;
  const mx = Math.max(r, gg, b, 1); // keep the hue if one channel overflows
  return [r, gg, b].map((c) => clamp(gam(Math.max(0, c / mx)), 0, 1));
}
export function spectrumToRgb(R, gain = 1.45) {
  const xyz = [0, 0, 0];
  R.forEach((v, i) => { for (let k = 0; k < 3; k++) xyz[k] += v * ILL[i] * CMF[i][k]; });
  return xyzToRgb(xyz.map((v) => v / YW), gain);
}
// The colour of pure light of one wavelength (for drawing rays and the spectrum strip).
export function lambdaRgb(l) {
  if (l > 730) return [0.45, 0.05, 0.05];
  const i = clamp(Math.round((l - L0) / DL), 0, NL - 1), [X, Y, Z] = CMF[i];
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  const mn = Math.min(r, gg, b); if (mn < 0) { r -= mn; gg -= mn; b -= mn; }
  const mx = Math.max(r, gg, b) || 1;
  return [r, gg, b].map((c) => gam(c / mx));
}
export const css = (rgb) => `rgb(${rgb.map((c) => Math.round(c * 255)).join(',')})`;
export const hex = (rgb) => (Math.round(rgb[0] * 255) << 16) | (Math.round(rgb[1] * 255) << 8) | Math.round(rgb[2] * 255);

// Reflectance of skin at each wavelength (0–1).
// p: { s: crystal spacing nm, yellow: 0–1 pigment, melanin: 0–1, white: 0–1 broadband (whitish bars) }
export function skinSpectrum({ s = S_CALM, yellow = 1, melanin = 0.1, white = 0, red = 0 } = {}) {
  const { lambda } = crystal(s), w = 0.075 * lambda;
  return LAMBDAS.map((l) => {
    const rs = 0.78 * Math.exp(-0.5 * ((l - lambda) / w) ** 2) + white * 0.55;
    const ty = 1 - yellow * 0.93 / (1 + Math.exp((l - 497) / 11));
    const tr = 1 - red * 0.9 / (1 + Math.exp((l - 585) / 14));          // red pigment (erythrophores)
    const tm = Math.exp(-melanin * 2.4 * (1 + 0.35 * (550 - l) / 150));
    const rd = 0.1;                                                          // a little white from D-iridophores
    return 0.03 + tm * tm * ty * ty * tr * tr * (Math.min(0.95, rs) + (1 - Math.min(0.95, rs)) ** 2 * rd);
  });
}
export const meanVisible = (R) => R.reduce((a, v, i) => a + v * ILL[i] * CMF[i][1], 0) / YW;
export function colourOf(p) { const R = skinSpectrum(p); return { R, rgb: spectrumToRgb(R), lambda: crystal(p.s ?? S_CALM).lambda, Rvis: meanVisible(R) }; }
export function hueName(rgb) {
  const [r, g2, b] = rgb, mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2;
  if (mx < 0.16) return 'almost black';
  if (mx - mn < 0.08) return l > 0.7 ? 'whitish' : 'grey-brown';
  let h = mx === r ? ((g2 - b) / (mx - mn)) % 6 : mx === g2 ? (b - r) / (mx - mn) + 2 : (r - g2) / (mx - mn) + 4; h *= 60; if (h < 0) h += 360;
  const n = h < 14 ? 'red' : h < 38 ? 'orange' : h < 62 ? 'yellow' : h < 82 ? 'yellow-green' : h < 150 ? 'green' : h < 190 ? 'turquoise' : h < 250 ? 'blue' : h < 290 ? 'violet' : h < 335 ? 'pink' : 'red';
  return (mx < 0.38 ? 'dark ' : '') + n;
}
export const bandName = (l) => (l < 450 ? 'violet' : l < 495 ? 'blue' : l < 565 ? 'green' : l < 590 ? 'yellow' : l < 625 ? 'orange' : l < 720 ? 'red' : 'near-infrared');

// ---------------------------------------------------------------- heat
// Absorbed sunlight on the side of a chameleon turned broadside to the sun:  P = G · A · α.
//  - α mixes three parts of sunlight by energy, roughly 5% ultraviolet, 44% visible and 51%
//    near-infrared at ground level (ASTM G173 reference spectrum, rounded). UV is taken as all absorbed.
//  - Visible absorptance = 1 − the skin's mean visible reflectance from the colour model above.
//  - Near-infrared: Teyssier et al. 2015 measured that the deep iridophores (D-iridophores) screen
//    about 45% of near-infrared energy by reflection in panther chameleons. Without them we assume
//    10%. Melanin spread above the iridophores hides part of that mirror (illustrative factor).
//  - A = 60 cm² (a flank of roughly 12 × 5 cm, an illustrative adult panther chameleon) and m = 150 g
//    with c = 3.5 kJ/kg·K (a typical value for animal tissue). The warming rate ignores losses to air,
//    so it is an upper bound for the first minutes in the sun.
export const BODY = { A: 0.006, m: 0.15, c: 3500 };
export function absorbedPower(G, Rvis, melanin, dLayer = true) {
  const rN = (dLayer ? 0.45 : 0.1) * Math.exp(-melanin * 0.9) + 0.03;
  const alpha = 0.05 + 0.44 * (1 - Rvis) + 0.51 * (1 - rN);
  const P = G * BODY.A * alpha;
  return { alpha, rN, P, rate: (P / (BODY.m * BODY.c)) * 60 };   // W, °C per minute
}

// ---------------------------------------------------------------- shapes
function taperTube(points, r0, r1, mat, seg = 80) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const RS = 12, geo = new THREE.TubeGeometry(curve, seg, 1, RS, false), pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, r = r0 + (r1 - r0) * u; curve.getPointAt(u, c);
    for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m;
}
function latheXZ(profile, zs, mat, seg = 48) {
  const geo = new THREE.LatheGeometry(profile.map(([x, r]) => new THREE.Vector2(Math.max(0.001, r), x)), seg);
  geo.rotateZ(-Math.PI / 2); geo.scale(1, 1, zs); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m;
}
function fin(pts, depth, mat) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: depth * 0.4, bevelThickness: depth * 0.4, bevelSegments: 2 });
  geo.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
}

// ---------------------------------------------------------------- the chameleon
// Local frame: head toward +X, back up +Y, the animal's left side toward +Z. It stands on a branch
// along X whose top is at y = -1.0. Total length about 4.9 units with the tail curled.
export const PAL = {
  calm: { s: S_CALM, yellow: 1, melanin: 0.12, barS: 205, barYellow: 0.1, barWhite: 0, red: 0 },
  excited: { s: S_EXCITED, yellow: 1, melanin: 0.05, barS: 205, barYellow: 0.15, barWhite: 0.9, red: 0.2 },
};
export function palette(p) {
  const base = colourOf(p).rgb;
  const bar = colourOf({ s: p.barS ?? p.s * 0.94, yellow: p.barYellow ?? 0.1, melanin: p.barMelanin ?? p.melanin, white: p.barWhite ?? 0, red: 0 }).rgb;
  const stripe = colourOf({ s: p.barS ?? p.s, yellow: 0.2, melanin: p.melanin * 0.6, white: Math.max(0.35, p.barWhite ?? 0), red: 0 }).rgb;
  const belly = base.map((c) => Math.min(1, c * 0.75 + 0.2));
  return { base, bar, stripe, belly };
}
export function mixPal(a, b, k) { const o = {}; for (const key in a) o[key] = a[key].map((v, i) => v + (b[key][i] - v) * k); return o; }

export class Chameleon {
  constructor({ calotes = false, casque = 1, bars = true } = {}) {
    this.calotes = calotes; this.bars = bars;
    const g = (this.group = new THREE.Group());
    this.mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 });
    const mat = this.mat;
    this.meshes = [];
    const add = (m, kind) => { m.userData.kind = kind; g.add(m); this.meshes.push(m); return m; };
    if (!calotes) {
      this.body = add(latheXZ([[-1.35, 0.18], [-1.1, 0.4], [-0.6, 0.66], [0, 0.74], [0.55, 0.66], [0.95, 0.5], [1.15, 0.42]], 0.5, mat), 'body');
      this.head = add(latheXZ([[1.0, 0.38], [1.25, 0.44], [1.55, 0.4], [1.85, 0.3], [2.05, 0.18], [2.16, 0.02]], 0.68, mat), 'head');
      this.head.position.y = 0.06;
      const cq = add(fin([[1.05, 0.25], [1.95, 0.28], [1.35, 0.58 + 0.28 * casque]], 0.12, mat), 'head'); cq.position.y = 0.06;
      // Dorsal crest: a row of small cones down the spine.
      for (let i = 0; i < 9; i++) { const x = -1.0 + i * 0.24, y = Math.sqrt(Math.max(0, 1 - (x / 1.45) ** 2)) * 0.72; const c = add(new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 6), mat), 'body'); c.position.set(x, y + 0.04, 0); }
      // Prehensile tail, curled into a spiral below and behind.
      const tp = [[-1.25, 0.0, 0], [-1.7, -0.12, 0], [-2.1, -0.4, 0]];
      for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + 0.25 - i * 0.48, r = 0.42 * (1 - i / 18); tp.push([-2.15 - 0.25 + r * Math.cos(a) * -1, -0.85 - r * Math.sin(a) * -1 + 0.0, 0]); }
      this.tail = add(taperTube(tp.slice(0, 3).concat(tp.slice(4)), 0.17, 0.035, mat), 'tail');
    } else {
      // Garden lizard (Calotes versicolor): slim body, big triangular head, long straight tail.
      this.body = add(latheXZ([[-1.2, 0.18], [-0.8, 0.38], [0, 0.46], [0.7, 0.4], [1.0, 0.3]], 0.75, mat), 'body');
      this.head = add(latheXZ([[0.9, 0.28], [1.2, 0.36], [1.55, 0.27], [1.85, 0.14], [1.98, 0.02]], 0.8, mat), 'head'); this.head.position.y = 0.06;
      for (let i = 0; i < 12; i++) { const x = -0.9 + i * 0.18; const c = add(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16 - Math.abs(x) * 0.05, 6), mat), 'body'); c.position.set(x, 0.42 * Math.sqrt(Math.max(0, 1 - (x / 1.2) ** 2)) + 0.05, 0); }
      this.tail = add(taperTube([[-1.15, 0, 0], [-2.0, -0.18, 0.05], [-3.0, -0.38, -0.1], [-4.2, -0.5, 0.05]], 0.15, 0.02, mat), 'tail');
    }
    // Eyes: chameleon turret eyes (skin-covered cones with a pinhole) that swivel on their own.
    this.eyes = [1, -1].map((side) => {
      const eg = new THREE.Group(); eg.position.set(calotes ? 1.48 : 1.58, calotes ? 0.22 : 0.24, side * (calotes ? 0.26 : 0.28)); g.add(eg);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(calotes ? 0.1 : 0.2, 24, 16), mat); ball.scale.set(1, 1, 0.9); ball.userData.kind = 'eye'; this.meshes.push(ball); eg.add(ball);
      const pupil = sphere(calotes ? 0.045 : 0.05, M.plastic(0x101010, { roughness: 0.2 }), 16); pupil.position.set(0, 0, side * (calotes ? 0.085 : 0.185)); eg.add(pupil);
      const glint = sphere(0.015, M.glow(0xffffff), 8); glint.position.set(0.02, 0.025, side * (calotes ? 0.12 : 0.225)); eg.add(glint);
      return { g: eg, side };
    });
    // Legs with zygodactyl feet gripping the branch (two bundles of toes, one each side).
    const LEGS = calotes
      ? [[0.65, 1], [0.65, -1], [-0.85, 1], [-0.85, -1]]
      : [[0.7, 1], [0.7, -1], [-0.8, 1], [-0.8, -1]];
    this.legs = LEGS.map(([x, side]) => {
      const lg = new THREE.Group(); g.add(lg);
      const hip = [x, -0.25, side * 0.22], knee = calotes ? [x + 0.1 * Math.sign(x), -0.45, side * 0.75] : [x + 0.12 * Math.sign(x), -0.62, side * 0.42], foot = calotes ? [x + 0.3 * Math.sign(x), -0.98, side * 0.85] : [x + 0.05, -0.96, side * 0.04];
      const a = beam(hip, knee, 0.085, mat), b = beam(knee, foot, 0.07, mat); a.userData.kind = b.userData.kind = 'leg'; this.meshes.push(a, b); lg.add(a, b);
      if (!calotes) for (const sz of [1, -1]) { const t = beam(foot, [foot[0] + 0.03 * sz, -1.12, sz * 0.13], 0.05, mat); t.userData.kind = 'foot'; this.meshes.push(t); lg.add(t); }
      else for (let k = -1; k <= 1; k++) { const t = beam(foot, [foot[0] + 0.22 * Math.sign(x), -1.0, foot[2] + k * 0.12], 0.025, mat); t.userData.kind = 'foot'; this.meshes.push(t); lg.add(t); }
      return lg;
    });
    // Mouth line and the projectile tongue (hidden until shot).
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 30, 0.9), M.plastic(0x2a2a2a)); lip.rotation.set(0, 0, -0.45); lip.position.set(1.35, 0.15, 0); lip.scale.set(1.3, 0.5, 0.68 * 0.75); g.add(lip);
    this.tongue = new THREE.Group(); this.tongue.position.set(2.1, -0.02, 0); g.add(this.tongue);
    this.tongueRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10), M.plastic(0xf08aa0)); this.tongueRod.rotation.z = -Math.PI / 2; this.tongue.add(this.tongueRod);
    this.tongueTip = sphere(0.09, M.plastic(0xe06a88, { roughness: 0.25 }), 16); this.tongue.add(this.tongueTip);
    this.setTongue(0);
    this.meshes.forEach((m) => { const n = m.geometry.attributes.position.count; m.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); });
    this.paint(palette(PAL.calm));
  }
  setTongue(L) { this.tongue.visible = L > 0.02; this.tongueRod.scale.y = Math.max(0.01, L); this.tongueRod.position.x = L / 2; this.tongueTip.position.x = L; }
  // yaw > 0 turns the pupil forward (toward the snout), pitch > 0 turns it up.
  look(i, yaw, pitch) { const e = this.eyes[i]; e.g.rotation.set(-pitch * e.side, yaw * e.side, 0); }
  // pal: { base, bar, stripe, belly } as [r,g,b] in sRGB 0–1. Optional head colour (Calotes).
  paint(pal, head = null) {
    const c = new THREE.Color(), v = new THREE.Vector3(), col = (rgb) => c.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
    for (const m of this.meshes) {
      m.updateMatrix(); const pos = m.geometry.attributes.position, out = m.geometry.attributes.color, kind = m.userData.kind;
      const mx = m.parent === this.group ? m.matrix : new THREE.Matrix4().multiplyMatrices(m.parent.matrix, m.matrix);
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mx);
        let rgb = pal.base;
        if (kind === 'body') {
          if (v.y < -0.42) rgb = pal.belly;
          else if (Math.abs(v.y + 0.1) < 0.065 && v.x > -1.2 && v.x < 1.0 && !this.calotes) rgb = pal.stripe;
          else if (this.bars && v.x > -1.15 && v.x < 0.95 && ((v.x + 1.15) / 0.42) % 1 < 0.3 && v.y > -0.38) rgb = pal.bar;
        } else if (kind === 'head') {
          if (head) rgb = head; else if (v.y < 0.0 && !this.calotes) rgb = pal.stripe;
        } else if (kind === 'eye') rgb = head || pal.base;
        else if (kind === 'tail' && this.bars && !this.calotes && Math.sin(v.x * 9 + v.y * 9) > 0.6) rgb = pal.bar;
        else if (kind === 'foot') rgb = pal.belly;
        if (head && this.calotes && kind === 'body' && v.x > 0.55) rgb = head.map((h, k) => h * 0.7 + pal.base[k] * 0.3);
        col(rgb); out.setXYZ(i, c.r, c.g, c.b);
      }
      out.needsUpdate = true;
    }
  }
}

export function branch(len = 7, r = 0.12, y = -1.12) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, len, 14), M.matte(0x6b4a2e));
  m.rotation.z = Math.PI / 2; m.position.y = y; m.castShadow = m.receiveShadow = true; return m;
}

// ---------------------------------------------------------------- skin cut open
// A block of skin, top to bottom: clear outer skin (epidermis), yellow pigment cells (xanthophores),
// superficial iridophores with their crystal lattice, deep iridophores with big plate crystals, and
// melanophores with arms reaching up through the layers. Width along X, depth along Z.
export const LAYERS = [
  { id: 'epi', name: 'Outer skin (epidermis)', short: 'Outer skin', h: 0.22 },
  { id: 'xan', name: 'Yellow pigment cells (xanthophores)', short: 'Yellow pigment cells', h: 0.32 },
  { id: 'sir', name: 'S-iridophores: tunable crystal lattice', short: 'S-iridophores: tunable crystals', h: 0.62 },
  { id: 'dir', name: 'D-iridophores: big crystals, reflect infrared', short: 'D-iridophores: reflect infrared', h: 0.5 },
  { id: 'mel', name: 'Melanophores (melanin cells)', short: 'Melanophores', h: 0.34 },
  { id: 'der', name: 'Deeper skin (dermis)', short: 'Dermis', h: 0.4 },
];
export class SkinSlab {
  constructor({ W = 3.6, D = 2.0 } = {}) {
    this.W = W; this.D = D;
    const g = (this.group = new THREE.Group());
    this.layers = {};
    let y = 0; let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const L of LAYERS) {
      const lg = new THREE.Group(); lg.position.y = -y - L.h / 2; g.add(lg); this.layers[L.id] = lg; L.y = -y - L.h / 2; y += L.h;
    }
    this.H = y;
    const slab = (h, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(W, h * 0.96, D), mat); m.castShadow = m.receiveShadow = true; return m; };
    this.layers.epi.add(slab(0.22, M.clear(0xe8f2f0, 0.28, { roughness: 0.1 })));
    this.layers.der.add(slab(0.4, M.matte(0xd9a08c)));
    // Xanthophores: flattened yellow cells.
    const xg = new THREE.SphereGeometry(0.13, 14, 10);
    this.xanMat = M.plastic(0xffd23a, { transparent: true, opacity: 0.9 });
    this.xan = new THREE.InstancedMesh(xg, this.xanMat, 36); const o = new THREE.Object3D();
    for (let i = 0; i < 36; i++) { o.position.set(-W / 2 + 0.25 + (i % 9) * ((W - 0.5) / 8), 0, -D / 2 + 0.3 + Math.floor(i / 9) * ((D - 0.6) / 3)); o.scale.set(1.5, 0.55, 1.3); o.updateMatrix(); this.xan.setMatrixAt(i, o.matrix); }
    this.layers.xan.add(this.xan, slab(0.32, M.clear(0xfff2c0, 0.1)));
    // S-iridophores: cells whose colour shows the band they reflect, each with a dotted lattice.
    this.sirMat = M.plastic(0x4aa0ff, { emissive: 0x153060, roughness: 0.25, transparent: true, opacity: 0.85 });
    const cellG = new THREE.BoxGeometry(0.62, 0.5, 0.55);
    this.sir = new THREE.InstancedMesh(cellG, this.sirMat, 15);
    for (let i = 0; i < 15; i++) { o.position.set(-W / 2 + 0.38 + (i % 5) * ((W - 0.76) / 4), 0, -D / 2 + 0.38 + Math.floor(i / 5) * ((D - 0.76) / 2)); o.scale.set(1, 1, 1); o.updateMatrix(); this.sir.setMatrixAt(i, o.matrix); }
    this.layers.sir.add(this.sir);
    // A tiny lattice in the front cells (crystals as dots).
    this.dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), M.glow(0xeaf6ff), 5 * 36); this.layers.sir.add(this.dots);
    // D-iridophores: tilted white plates.
    const plates = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.03, 0.2), M.plastic(0xe9eef2, { roughness: 0.3, metalness: 0.2 }), 70);
    for (let i = 0; i < 70; i++) { o.position.set((rnd() - 0.5) * (W - 0.3), (rnd() - 0.5) * 0.36, (rnd() - 0.5) * (D - 0.3)); o.rotation.set((rnd() - 0.5) * 0.7, rnd() * 3, (rnd() - 0.5) * 0.7); o.scale.setScalar(0.7 + rnd() * 0.8); o.updateMatrix(); plates.setMatrixAt(i, o.matrix); }
    o.rotation.set(0, 0, 0);
    this.layers.dir.add(plates, slab(0.5, M.clear(0xdfe8ef, 0.12)));
    // Melanophores: dark cell bodies with arms up to just under the epidermis. Melanin fills the arms
    // from the bottom up as the slider rises.
    this.arms = []; this.melMat = M.matte(0x1b120c);
    const ghost = M.clear(0x8a6a50, 0.22);
    const yBody = LAYERS.find((l) => l.id === 'mel').y, yTop = LAYERS.find((l) => l.id === 'xan').y + 0.1;
    for (let i = 0; i < 6; i++) {
      const x = -W / 2 + 0.4 + i * ((W - 0.8) / 5), z = i % 2 ? -0.35 : 0.35;
      const bodyM = sphere(0.16, this.melMat, 16); bodyM.scale.set(1.4, 0.8, 1.2); bodyM.position.set(x, yBody, z); g.add(bodyM);
      for (const dx of [-0.22, 0.22]) {
        const top = [x + dx, yTop, z + dx * 0.6], bot = [x + dx * 0.3, yBody, z];
        g.add(beam(bot, top, 0.045, ghost, 8));
        const fill = beam(bot, top, 0.05, this.melMat, 8); g.add(fill);
        this.arms.push({ fill, bot: new THREE.Vector3(...bot), top: new THREE.Vector3(...top) });
      }
    }
    this.armTopY = yTop; this.armBotY = yBody;
    this.setSpacing(S_CALM); this.setMelanin(0.12); this.setYellow(1);
  }
  setSpacing(s) {
    const { lambda } = crystal(s), col = lambda > 730 ? [0.35, 0.05, 0.05] : lambdaRgb(lambda);
    this.sirMat.color.setRGB(col[0], col[1], col[2], THREE.SRGBColorSpace); this.sirMat.emissive.setRGB(col[0] * 0.3, col[1] * 0.3, col[2] * 0.3, THREE.SRGBColorSpace);
    // Lattice dots: a 6×6 triangular grid in each of the five front cells, spread with s.
    const o = new THREE.Object3D(), k = (s / S_CALM) * 0.055;
    let n = 0;
    for (let c = 0; c < 5; c++) {
      const cx = -this.W / 2 + 0.38 + c * ((this.W - 0.76) / 4), cz = this.D / 2 - 0.38 + 0.285;
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { o.position.set(cx + (j - 2.5 + (i % 2) * 0.5) * k, (i - 2.5) * k * 0.87, cz); o.updateMatrix(); this.dots.setMatrixAt(n++, o.matrix); }
    }
    this.dots.instanceMatrix.needsUpdate = true;
  }
  setMelanin(m) {
    const k = clamp(m, 0, 1) * 0.95 + 0.05;
    for (const a of this.arms) { const top = a.bot.clone().lerp(a.top, k); const len = a.bot.distanceTo(top); a.fill.scale.y = Math.max(0.01, len / a.bot.distanceTo(a.top)); a.fill.position.copy(a.bot).lerp(top, 0.5); }
    // beam() scales the geometry built at full length; scale.y works along its axis.
  }
  setYellow(y) { this.xan.visible = y > 0.02; this.xanMat.opacity = 0.25 + 0.7 * y; }
  explode(k) { let i = 0; for (const L of LAYERS) { this.layers[L.id].position.y = L.y + (2.5 - i) * k * 0.45; i++; } }
}

// ---------------------------------------------------------------- boards (as in JellyfishClear)
export const COL = { hot: '#ffb547', cool: '#8ef0ff', up: '#5ce1a9', down: '#ff7a59', water: '#6cc4ff', red: '#ff5a8a', gold: '#f2c24b', violet: '#c49bff', lime: '#a3e635', soft: 'rgba(255,255,255,.6)', text: '#e8eef8' };
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const gx = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = (...a) => { draw(gx, pxW, pxH, ...a); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
  m.position.set(...pos); m.renderOrder = 10; root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function panel(gx, w, h) { gx.clearRect(0, 0, w, h); gx.fillStyle = 'rgba(10,12,18,.88)'; gx.beginPath(); gx.roundRect(0, 0, w, h, 18); gx.fill(); }
export function head(gx, t, sub = '') {
  gx.fillStyle = COL.text; gx.font = 'bold 26px sans-serif'; gx.fillText(t, 22, 38);
  if (sub) { gx.font = '18px sans-serif'; gx.fillStyle = COL.soft; gx.fillText(sub, 22, 64); }
}
export function txt(gx, s, x, y, col = 'rgba(255,255,255,.78)', font = '19px sans-serif') { gx.fillStyle = col; gx.font = font; gx.fillText(s, x, y); }
export function wrap(gx, s, x, y, maxW, lh = 24, col = 'rgba(255,255,255,.78)', font = '19px sans-serif') {
  gx.fillStyle = col; gx.font = font; let line = '', yy = y;
  for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (gx.measureText(t).width > maxW && line) { gx.fillText(line, x, yy); line = word; yy += lh; } else line = t; }
  if (line) gx.fillText(line, x, yy);
  return yy + lh;
}
export function swatch(gx, rgb, x, y, w, h, label) {
  gx.fillStyle = css(rgb); gx.beginPath(); gx.roundRect(x, y, w, h, 12); gx.fill();
  gx.strokeStyle = 'rgba(255,255,255,.35)'; gx.lineWidth = 2; gx.stroke();
  if (label) txt(gx, label, x, y + h + 24, COL.text, '18px sans-serif');
}

// ---------------------------------------------------------------- layout helpers
export const inReel = () => document.body.classList.contains('gb-reel');
export function layoutOf(stage) {
  const w = stage.host.clientWidth, h = stage.host.clientHeight || 1;
  if (inReel() && w / h < 0.8) return 'tall';
  return w < 560 ? 'narrow' : 'wide';
}
export function viewFor(stage, v) { const lay = layoutOf(stage); return v[lay] || v; }
export function viewFixer(stage, view) {
  let done = false;
  return () => {
    if (done) return; done = true;
    const lay = layoutOf(stage);
    if (lay !== 'wide' && view[lay] && !inReel()) stage.setView(view[lay].pos, view[lay].target, 0.01);
  };
}
export function focuser(stage, groups, views) {
  let cur = '';
  return (f, force = false) => {
    if (f === cur && !force) return false;
    cur = f;
    for (const k in groups) groups[k].visible = k === f;
    if (!inReel()) { const v = viewFor(stage, views[f]); stage.setView(v.pos, v.target, 1.0); }
    return true;
  };
}
const _v = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3();
export function fitBoard(stage, mesh, base, scale = 1) {
  const cam = stage.camera;
  mesh.visible = layoutOf(stage) !== 'narrow';
  if (!mesh.visible) return;
  mesh.position.set(...base); mesh.scale.setScalar(scale); mesh.updateMatrixWorld(true);
  const p = mesh.geometry.parameters, hw = p.width / 2, hh = p.height / 2;
  cam.updateMatrixWorld(); _r.setFromMatrixColumn(cam.matrixWorld, 0); _u.setFromMatrixColumn(cam.matrixWorld, 1);
  for (let it = 0; it < 8; it++) {
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      _v.set(sx * hw, sy * hh, 0).applyMatrix4(mesh.matrixWorld).project(cam);
      x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y);
    }
    const wN = x1 - x0, hN = y1 - y0;
    if (wN > 1.25 || hN > 0.9) { const k = Math.min(1.25 / wN, 0.9 / hN); mesh.scale.multiplyScalar(k); mesh.updateMatrixWorld(true); continue; }
    let dx = 0, dy = 0;
    if (x1 > 0.97) dx = 0.97 - x1; if (x0 + dx < -0.97) dx = -0.97 - x0;
    if (y1 > 0.86) dy = 0.86 - y1;
    if (x0 + dx < 0.2 && y1 + dy > 0.3 && y0 + dy < 0.98) {
      if (wN > 0.77) { mesh.scale.multiplyScalar(0.77 / wN); mesh.updateMatrixWorld(true); continue; }
      dx = 0.2 - x0;
    }
    if (!dx && !dy) break;
    const d = mesh.position.distanceTo(cam.position), th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * d;
    mesh.position.addScaledVector(_r, dx * th * cam.aspect).addScaledVector(_u, dy * th);
    mesh.updateMatrixWorld(true);
  }
}
export function reelZoom(stage, z) {
  const lay = layoutOf(stage), want = lay === 'tall' ? z : 1;
  if (stage.camera.zoom !== want) { stage.camera.zoom = want; stage.camera.updateProjectionMatrix(); }
  const [x, y] = lay === 'narrow' ? [0, -0.24] : lay === 'wide' ? [0.08, -0.1] : [0, 0];
  if (!stage.shift || stage.shift[0] !== x || stage.shift[1] !== y) stage.setShift(x, y);
}
// Warm leafy backdrop. The stage resets background and fog on chapter close.
export function forestLook(stage, col = 0x0b1410) { stage.scene.background = new THREE.Color(col); stage.scene.fog = new THREE.Fog(col, 16, 44); }
