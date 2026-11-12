// Chapter 2: colour from a crystal lattice. A block of guanine nanocrystals packed in layers (the FCC
// lattice Teyssier et al. 2015 used to model S-iridophores) with white light coming in and one
// coloured band bouncing back. The gap between crystals sets the colour (crystal() in cham.js: a
// first-order Bragg reflection from the (111) planes, λ = 2·n_eff·d, guanine n = 1.83, cytoplasm
// n = 1.33, crystals 127 nm). The reflected band then passes the yellow pigment layer and the melanin
// arms (skinSpectrum() in cham.js) and the result is turned into a screen colour with the CIE 1931
// colour-matching functions. Scene scale: 1 unit = 400 nm.
// Calm and excited spacings: the paper measured that crystals sit on average 30% closer in calm
// (green) skin than in excited (yellow/orange) skin of male panther chameleons, with no change in
// crystal size. Our calm value, 218 nm, is chosen so the toy model gives blue-green at rest; the
// paper's simulated range (lattice parameter 233–480 nm) is s ≈ 165–340 nm.
import { THREE, M, approach, clamp, arrow } from '../kit.js';
import { crystal, colourOf, skinSpectrum, lambdaRgb, css, bandName, hueName, LAMBDAS, S_CALM, S_EXCITED, Chameleon, palette, board, panel, head, txt, swatch, COL, layoutOf, reelZoom, viewFixer, fitBoard, forestLook } from '../cham.js';

const SC = 1 / 400, LX = 0.4, LY = 2.0;
const MOODS = { calm: { s: S_CALM, melanin: 0.12, yellow: 1 }, excited: { s: S_EXCITED, melanin: 0.05, yellow: 1 }, dark: { s: S_CALM, melanin: 0.75, yellow: 1 } };

export default {
  id: 'crystal',
  short: 'Colour from crystals',
  title: 'Colour from a crystal lattice',
  subtitle: 'Tiny mirrors, spaced just so, pick out one colour of light. Move them apart and the colour changes.',
  view: { pos: [2.4, 3.3, 10.2], target: [2.1, 2.7, 0], narrow: { pos: [0.4, 3.0, 9.5], target: [0.4, 2.4, 0] } },
  learn: `<p>Most animal colours come from <b>pigments</b>, chemicals that soak up some colours of light. A chameleon’s greens, blues, yellows and reds come mostly from something else: <b>structural colour</b>, the same trick that makes a soap bubble or a peacock feather shine.</p>
    <p>In 2015 a team in Geneva led by <b>Michel Milinkovitch</b> looked at panther chameleon skin under an electron microscope. In the <b>S-iridophore</b> cells they found tiny <b>guanine crystals</b>, about <b>127 nanometres</b> across, packed in a neat <b>triangular lattice</b>, like oranges stacked on a market stall.</p>
    <p>Each layer of crystals reflects a little light. The reflections from layer after layer add up only for one wavelength, the one that fits the gap between the layers, and cancel for the rest. This is <b>interference</b>, the same adding and cancelling of waves as in <a href="/waveclear/#limits">WaveClear</a>. Close spacing picks out <b>blue</b>. Wider spacing picks out <b>green, yellow, orange, red</b>.</p>
    <p>Above the crystals sits a layer of <b>yellow pigment</b>. It soaks up blue light. So blue from the crystals plus a yellow filter looks <b>green</b>: the calm chameleon. When a male gets excited, his iridophore cells swell with water and the crystals move about <b>30% further apart</b>. The reflected band slides to longer waves and the skin turns <b>yellow or orange</b>. Calm down, and the crystals pack together again.</p>
    <p>Dark <b>melanin</b> works differently: it flows up the arms of the melanophores and covers the layers above, so everything gets darker.</p>
    <p class="tip"><b>Try it:</b> slide the gap from small to big and watch the reflected ray and the swatch. Then take away the yellow pigment, and finally push melanin up the arms.</p>`,
  terms: [
    { t: 'Structural colour', d: 'Colour made by the shape and spacing of tiny structures, not by pigment.' },
    { t: 'Photonic crystal', d: 'A regular pattern of materials, with spacing near the wavelength of light, that reflects one band of colour.' },
    { t: 'Interference', d: 'Waves adding up where crests meet crests and cancelling where crests meet troughs.' },
    { t: 'Wavelength', d: 'The length of one light wave. Blue is about 450–490 nm, green about 500–560 nm, red about 620–700 nm.' },
    { t: 'Refractive index', d: 'How much a material slows light: 1.83 for guanine, about 1.33 for the watery cell around it.' },
    { t: 'Xanthophore', d: 'A pigment cell with yellow pigment, which filters out blue light.' },
  ],
  defaults: { s: S_CALM, yellow: 1, melanin: 0.12, mood: 'calm' },
  onChange(s, key) {
    if (key === 'mood' && MOODS[s.mood]) Object.assign(s, MOODS[s.mood]);
    else if (key && key !== 'mood') s.mood = '';
  },
  controls: [
    { key: 'mood', type: 'seg', label: 'Quick set', options: [{ v: 'calm', label: 'Calm' }, { v: 'excited', label: 'Excited male' }, { v: 'dark', label: 'Dark' }] },
    { key: 's', type: 'range', label: 'Gap between crystals (centre to centre)', min: 165, max: 340, step: 1, fmt: (v) => `${Math.round(v)} nm`, ends: ['packed tight', 'spread out'], hint: 'The crystals themselves stay 127 nm across. Only the gap changes.' },
    { key: 'yellow', type: 'range', label: 'Yellow pigment above the crystals', min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'melanin', type: 'range', label: 'Melanin pushed up the arms', min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'Where do a chameleon’s bright greens and oranges mostly come from?', options: ['Green and orange pigments', 'Light reflected by a lattice of tiny guanine crystals, filtered by yellow pigment', 'Blood vessels under the skin', 'Reflections of the leaves around it'], answer: 1, why: 'Teyssier and colleagues showed in 2015 that the colour is mainly structural: crystal lattices in S-iridophores pick out one band of light.' },
    { q: 'What happens to the crystals when a male panther chameleon gets excited?', options: ['They dissolve', 'They grow bigger', 'They move further apart, by about 30%', 'They turn black'], answer: 2, why: 'The cells swell, the crystals stay the same size but the gaps grow, so the reflected light shifts from blue toward yellow and red.' },
    { q: 'Why does calm chameleon skin look green if the crystals reflect blue?', options: ['The eye mixes in the leaves', 'A layer of yellow pigment on top filters the blue, and blue plus yellow filter looks green', 'Melanin turns blue into green', 'The skin is green underneath'], answer: 1, why: 'Yellow pigment cells soak up the bluest light, so what comes out looks green.' },
  ],
  reel: [
    { ms: 5600, caption: 'The colour comes from tiny crystals: spaced close, they reflect blue, and yellow pigment makes it green.', set: { yellow: 1, melanin: 0.12, mood: '' }, anim: { s: [190, S_CALM] }, view: { pos: [0.4, 3.0, 7.2], target: [0.4, 2.4, 0] }, spin: 0 },
    { ms: 5600, caption: 'Excited, the cells swell and the crystals spread out about 30%: the skin turns orange.', set: { yellow: 1, melanin: 0.08, mood: '' }, anim: { s: [S_CALM, S_EXCITED] }, view: { pos: [0.4, 3.0, 7.2], target: [0.4, 2.4, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    forestLook(stage);
    // Lattice: 4 close-packed triangular layers (ABC stacking) of 5×5 crystals.
    const N = 4 * 25, sph = new THREE.InstancedMesh(new THREE.SphereGeometry(D_UNIT, 18, 12), M.plastic(0xeaf4ff, { roughness: 0.18, metalness: 0.25 }), N);
    sph.castShadow = true; root.add(sph);
    const cell = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), M.clear(0x9fd6ff, 0.08)); root.add(cell);
    // Pigment filters above the lattice.
    const yel = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 1), M.clear(0xffd23a, 0.5)); root.add(yel);
    const mel = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 1), M.clear(0x1b120c, 0.5)); root.add(mel);
    const rin = arrow(0xffffff, 2.2, 0.3, 0.05), rout = arrow(0x4aa0ff, 2.2, 0.3, 0.06), rgo = arrow(0x777777, 1.2, 0.2, 0.03);
    root.add(rin, rout, rgo);
    const mini = new Chameleon(); mini.group.scale.setScalar(0.55); mini.group.position.set(LX - 2.7, 0.95, 1.6); mini.group.rotation.y = 0.35; root.add(mini.group);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const lb = { in: L('White light in', [0, 0, 0]), out: L('', [0, 0, 0], 'hot'), gap: L('', [0, 0, 0]), yel: L('Yellow pigment', [0, 0, 0]), mel: L('Melanin', [0, 0, 0]) };

    const cur = { s: S_CALM, yellow: 1, melanin: 0.12 };
    const chart = board(root, 4.6, 3.6, 760, 600, (g, w, h) => {
      panel(g, w, h); head(g, 'From crystals to skin colour', 'Light reflected at each wavelength (toy model)');
      const x0 = 70, x1 = w - 30, y0 = 330, y1 = 95, X = (l) => x0 + (x1 - x0) * (l - 380) / 350, Y = (v) => y0 - (y0 - y1) * v;
      for (let l = 380; l < 730; l += 2) { const c = lambdaRgb(l); g.fillStyle = css(c); g.fillRect(X(l), y0 + 6, X(l + 2) - X(l) + 1, 10); }
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
      [400, 500, 600, 700].forEach((l) => txt(g, l + '', X(l) - 18, y0 + 40, COL.soft, '16px sans-serif'));
      txt(g, 'nm', x1 - 26, y0 + 40, COL.soft, '16px sans-serif');
      const crys = skinSpectrum({ s: cur.s, yellow: 0, melanin: 0 }), fin = skinSpectrum(cur);
      const line = (arr, col, dash = []) => { g.setLineDash(dash); g.strokeStyle = col; g.lineWidth = 3.5; g.beginPath(); arr.forEach((v, i) => { const x = X(LAMBDAS[i]), y = Y(Math.min(1, v)); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]); };
      // yellow filter transmission (two passes)
      const ty = LAMBDAS.map((l) => (1 - cur.yellow * 0.93 / (1 + Math.exp((l - 497) / 11))) ** 2 * 0.95);
      line(ty, 'rgba(255,210,58,.8)', [8, 6]);
      line(crys, '#bfe3ff');
      g.fillStyle = 'rgba(163,230,53,.25)'; g.beginPath(); g.moveTo(X(380), y0); fin.forEach((v, i) => g.lineTo(X(LAMBDAS[i]), Y(v))); g.lineTo(X(730), y0); g.fill(); line(fin, COL.lime);
      txt(g, '— crystals alone', x0, y1 - 4, '#bfe3ff', 'bold 17px sans-serif'); txt(g, '- - yellow filter', x0 + 190, y1 - 4, '#ffd23a', 'bold 17px sans-serif'); txt(g, '■ skin', x0 + 360, y1 - 4, COL.lime, 'bold 17px sans-serif');
      const a = colourOf({ s: cur.s, yellow: 0, melanin: 0 }).rgb, b = colourOf({ s: cur.s, yellow: cur.yellow, melanin: 0 }).rgb, c = colourOf(cur).rgb;
      const sy = 420;
      swatch(g, a, 40, sy, 190, 100, 'Crystals alone'); swatch(g, b, 285, sy, 190, 100, '+ yellow pigment'); swatch(g, c, 530, sy, 190, 100, '+ melanin = skin');
      txt(g, '→', 243, sy + 60, COL.text, 'bold 30px sans-serif'); txt(g, '→', 488, sy + 60, COL.text, 'bold 30px sans-serif');
    }, [5.6, 2.5, -1.0]);
    let drawn = '';

    let sNow = S_CALM, t = 0;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.4, 5.2, -1.0] : [5.6, 2.5, -1.0], lay === 'tall' ? 0.75 : 1);
        sNow = approach(sNow, s.s, 6, dt);
        const a = sNow * SC, o = new THREE.Object3D();
        // ABC close-packed layers, viewed side-on: layer spacing a·√(2/3).
        let n = 0; const dz = a * Math.sqrt(2 / 3);
        const offs = [[0, 0], [a / 2, a * Math.sqrt(3) / 6], [a, a * Math.sqrt(3) / 3]];
        for (let k = 0; k < 4; k++) for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
          const [ox, oz] = offs[k % 3];
          o.position.set(LX + (j - 2) * a + (i % 2) * a / 2 + ox - a / 2, LY - (k - 1.5) * dz, (i - 2) * a * Math.sqrt(3) / 2 + oz - a * 0.3);
          o.updateMatrix(); sph.setMatrixAt(n++, o.matrix);
        }
        sph.instanceMatrix.needsUpdate = true;
        const bw = 5.6 * a, bh = 4 * dz + D_UNIT * 2;
        cell.scale.set(bw, bh, bw); cell.position.set(LX, LY, -a * 0.3);
        yel.scale.set(bw, 1, bw); yel.position.set(LX, LY + bh / 2 + 0.12, -a * 0.3); yel.material.opacity = 0.08 + 0.55 * s.yellow; yel.visible = s.yellow > 0.02;
        mel.scale.set(bw, 1, bw); mel.position.set(LX, LY + bh / 2 + 0.3, -a * 0.3); mel.material.opacity = 0.05 + 0.85 * s.melanin; mel.visible = s.melanin > 0.03;
        // Rays: white in from upper left, the chosen band out to upper right, the rest goes on down.
        const top = LY + bh / 2 + 0.4, hit = new THREE.Vector3(LX, LY + dz, 0.8);
        const c = crystal(sNow), rgb = c.lambda > 730 ? [0.4, 0.06, 0.06] : lambdaRgb(c.lambda);
        rin.position.set(hit.x - 1.6, top + 1.2, 0.8); rin.lookAt(hit); rin.rotateX(Math.PI / 2); rin.set(rin.position.distanceTo(hit) - 0.05);
        rout.position.copy(hit); rout.lookAt(hit.x + 1.6, top + 1.2, 0.8); rout.rotateX(Math.PI / 2); rout.set(1.9);
        rout.children.forEach((m) => m.material.color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace));
        rgo.position.set(hit.x + 0.2, LY - bh / 2 - 0.1, 0.8); rgo.rotation.set(0, 0, Math.PI - 0.6); rgo.set(1.1);
        lb.in.position.set(hit.x - 1.9, top + 1.45, 0.8);
        lb.out.position.set(hit.x + 2.0, top + 1.45, 0.8); lb.out.element.innerHTML = `Reflected: <b>${c.lambda > 730 ? 'near-infrared' : Math.round(c.lambda) + ' nm, ' + bandName(c.lambda)}</b>`;
        lb.gap.position.set(LX, LY - bh / 2 - 0.45, 1.4); lb.gap.element.innerHTML = `Gap between crystals: <b>${Math.round(sNow)} nm</b>`;
        lb.yel.position.set(LX - bw / 2 - 0.9, LY + bh / 2 + 0.12, 0); lb.yel.visible = s.yellow > 0.02 && lay !== 'narrow';
        lb.mel.position.set(LX - bw / 2 - 0.7, LY + bh / 2 + 0.45, 0); lb.mel.visible = s.melanin > 0.03 && lay !== 'narrow';
        cur.s = sNow; cur.yellow = s.yellow; cur.melanin = s.melanin;
        const key = [sNow.toFixed(0), s.yellow.toFixed(2), s.melanin.toFixed(2)].join();
        if (key !== drawn) {
          drawn = key; chart.redraw();
          const p = { ...cur, barS: cur.s * 0.94, barYellow: 0.1, barWhite: clamp((cur.s - S_CALM) / (S_EXCITED - S_CALM), 0, 1) * 0.8, barMelanin: cur.melanin };
          mini.paint(palette(p));
        }
        mini.look(0, 0.4 * Math.sin(t * 0.7), 0.1); mini.look(1, -0.5 + 0.4 * Math.sin(t * 0.5 + 2), 0);
      },
      readout: (s) => {
        const c = crystal(sNow), col = colourOf({ s: sNow, yellow: s.yellow, melanin: s.melanin });
        const pct = Math.round((sNow / S_CALM - 1) * 100);
        return `<div class="big">Skin looks <span style="color:${css(col.rgb)}">${hueName(col.rgb)}</span></div>
          <div class="row"><span>Crystals reflect</span><b>${c.lambda > 730 ? 'near-infrared (' + Math.round(c.lambda) + ' nm)' : Math.round(c.lambda) + ' nm, ' + bandName(c.lambda)}</b></div>
          <div class="row"><span>Gap compared with calm skin</span><b>${pct >= 0 ? '+' : ''}${pct}%</b></div>
          <div class="row"><span>Layer spacing d · average index n</span><b>${c.d.toFixed(0)} nm · ${c.n.toFixed(2)}</b></div>
          <div class="row"><span>λ = 2 n d</span><b>2 × ${c.n.toFixed(2)} × ${c.d.toFixed(0)} = ${Math.round(c.lambda)} nm</b></div>
          <small>Toy Bragg model of the lattice in Teyssier et al. 2015 (guanine 1.83, cell 1.33, crystals 127 nm). The paper used a full photonic calculation.</small>`;
      },
    };
  },
};
const D_UNIT = (127 / 2) / 400;
