// Chapter 1: meet a chameleon. A generic panther-like chameleon on a branch (zygodactyl feet, curled
// prehensile tail, turret eyes that swivel on their own, a casque on the head, the projectile tongue),
// and beside it a block of its skin cut open in layers (see SkinSlab in cham.js and the sources there).
// Numbers:
//  - Skin layers and crystal sizes: Teyssier et al. 2015, Nature Communications 6: 6368 (S-iridophore
//    crystals ~127 nm; D-iridophore crystals 200–600 nm long and 90–150 nm high; the upper S layer is
//    fully developed only in adult males, reduced in females and juveniles).
//  - Tongue: Anderson 2016, Scientific Reports 6: 18625, measured 20 species; small chameleons project
//    their tongues furthest relative to body size, with peak accelerations up to 264 g in Rhampholeon
//    spinosus (read in press summaries of the paper). The tongue is preloaded like a spring (elastic
//    recoil). We draw a shot of about one body length (without the tail) and slow it right down.
import { THREE, M, approach, clamp, sphere, beam } from '../kit.js';
import { toast } from '../ui.js';
import { Chameleon, SkinSlab, LAYERS, branch, palette, PAL, layoutOf, reelZoom, viewFixer, forestLook } from '../cham.js';

const CX = -2.2, CY = 2.5, SX = 3.0, SY = 3.2;

const INFO = {
  eye: 'Each <b>turret eye</b> is covered by skin with a pinhole and swivels on its own: one can look ahead while the other looks back. To strike, both swing forward to judge distance.',
  head: 'The bony ridge on the head is the <b>casque</b>. It is tall in veiled chameleons and low in panther chameleons.',
  body: 'The body is flattened from side to side like a leaf, so a chameleon can turn its broad flank to the sun, or to a rival.',
  tail: 'The <b>prehensile tail</b> curls round twigs like a fifth hand. It cannot be dropped and regrown, as many lizards can.',
  leg: 'The legs move slowly, swaying like a leaf in the wind.',
  foot: '<b>Zygodactyl</b> feet: the toes are fused into two bundles that pinch the branch from both sides, like tongs.',
};

export default {
  id: 'anatomy',
  short: 'Meet a chameleon',
  title: 'Meet a chameleon',
  subtitle: 'Tong feet, a fifth-hand tail, eyes that look two ways and skin built in layers.',
  view: { pos: [1.5, 3.6, 12.2], target: [1.3, 2.3, 0], narrow: { pos: [-0.2, 3.6, 12.5], target: [-0.2, 2.2, 0] } },
  learn: `<p>This is a generic <b>panther-like chameleon</b>, the kind found in Madagascar. Everything about it is made for life in bushes and trees.</p>
    <p>Its toes are fused into two bundles that pinch a twig from both sides, like tongs: <b>zygodactyl</b> feet. Its <b>prehensile tail</b> curls round branches like a fifth hand. Its body is squashed flat from side to side, like a leaf. On its head sits a bony helmet, the <b>casque</b>.</p>
    <p>Its <b>turret eyes</b> are cones of skin with a tiny hole, and each swivels on its own. One can watch the front while the other checks behind. To catch an insect, both swing forward and lock on, and then the <b>tongue</b> shoots out. It is loaded like a stretched spring, and in small chameleons it can hit over 260 times the pull of gravity. (How eyes judge distance: <a href="/eyeclear/">EyeClear</a>.)</p>
    <p>Now the real secret: the <b>skin</b>. Under a clear outer layer lie <b>yellow pigment cells</b>, then a thick layer of <b>S-iridophores</b> holding a neat lattice of tiny <b>guanine crystals</b>, then <b>D-iridophores</b> with bigger, messier crystals, and at the bottom dark <b>melanophores</b> with arms reaching up between the others. Melanin is the same dark pigment as in your skin (see <a href="/skinclear/#colour">SkinClear</a>). The bright colours do not come mainly from pigment at all. They come from light bouncing off the crystals, as the next chapter shows.</p>
    <p class="tip"><b>Try it:</b> pull the skin layers apart, then make the eyes look around and fire the tongue. Tap a part to hear what it does.</p>`,
  terms: [
    { t: 'Zygodactyl', d: 'Toes grouped in two opposing bundles, one each side of a branch.' },
    { t: 'Prehensile tail', d: 'A tail that can grip and hold on, like a hand.' },
    { t: 'Casque', d: 'The bony helmet-like ridge on a chameleon’s head.' },
    { t: 'Chromatophore', d: 'A colour cell in the skin. Chameleons have several kinds stacked in layers.' },
    { t: 'Iridophore', d: 'A colour cell that holds tiny reflecting crystals instead of pigment.' },
    { t: 'Guanine', d: 'A natural substance (also one of the letters of DNA) that forms the tiny mirror crystals in iridophores.' },
    { t: 'Melanophore', d: 'A cell full of dark melanin that can send it up its arms to darken the skin.' },
  ],
  defaults: { explode: 0.35, eyes: true },
  controls: [
    { key: 'explode', type: 'range', label: 'Pull the skin layers apart', min: 0, max: 1, step: 0.01, ends: ['together', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'eyes', type: 'toggle', label: 'Eyes look around on their own' },
    { key: 'tongue', type: 'buttons', label: 'Tongue', items: [{ label: 'Shoot it (slowed down)', act: (s, inst) => inst.shoot?.() }] },
  ],
  quiz: [
    { q: 'What is special about a chameleon’s feet?', options: ['They have suction pads', 'The toes are fused into two bundles that pinch a branch from both sides', 'They have webbing for swimming', 'They have one long claw each'], answer: 1, why: 'Zygodactyl feet work like tongs, gripping twigs from both sides.' },
    { q: 'What can a chameleon’s eyes do?', options: ['Only look forward together', 'Swivel on their own, then both lock forward to strike', 'See only in black and white', 'Close only one at a time'], answer: 1, why: 'Each turret eye moves independently, and both turn forward to judge distance before the tongue shoots.' },
    { q: 'Which skin layer holds the tiny crystals that make the bright colours?', options: ['The melanophores', 'The iridophores', 'The outer skin', 'The fat under the skin'], answer: 1, why: 'Iridophores hold guanine nanocrystals that reflect light. The S-iridophores near the top make the colour.' },
  ],
  reel: [
    { ms: 5200, caption: 'A chameleon grips with tong-like feet, a curling tail and eyes that swivel on their own.', set: { explode: 0, eyes: true }, anim: {}, view: { pos: [-1.8, 3.4, 7.4], target: [-2.0, 2.3, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    forestLook(stage);
    const ch = new Chameleon(); ch.group.position.set(CX, CY, 0); root.add(ch.group);
    ch.paint(palette(PAL.calm));
    const br = branch(6.2); br.position.set(CX - 0.2, CY - 1.12, 0); root.add(br);
    const twig = beam([CX - 2.6, CY - 1.12, 0], [CX - 3.4, CY - 2.0, 0.3], 0.07, M.matte(0x6b4a2e)); root.add(twig);
    const slab = new SkinSlab({ W: 3.0, D: 1.7 }); slab.group.position.set(SX, SY, 0); slab.group.rotation.y = -0.35; root.add(slab.group);
    // Magnifier: a ring on the flank and a line to the slab.
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.26, 0.31, 40), M.glow(0x8ef0ff, { transparent: true, opacity: 0.8, side: THREE.DoubleSide })); ring.position.set(CX - 0.2, CY + 0.05, 0.4); root.add(ring);
    const lead = beam([CX + 0.1, CY + 0.15, 0.4], [SX - 1.5, SY - 0.4, 0.2], 0.012, M.glow(0x8ef0ff, { transparent: true, opacity: 0.5 })); root.add(lead);
    const fly = sphere(0.08, M.plastic(0x222222), 12); root.add(fly);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const tags = {
      eye: L('Turret eye', [CX + 1.6, CY + 0.75, 0.3], 'hot'), cq: L('Casque', [CX + 1.2, CY + 1.25, 0]), foot: L('Zygodactyl foot', [CX + 0.7, CY - 1.7, 0.4]),
      tail: L('Prehensile tail', [CX - 2.5, CY - 1.85, 0]), skin: L('Skin, cut open', [SX, SY + 1.0, 0], 'hot'),
    };
    const ltags = LAYERS.map((ly) => L(ly.short, [0, 0, 0], ly.id === 'sir' ? 'hot' : ''));
    const pick = new Map();
    ch.meshes.forEach((m) => { stage.pickables.push(m); pick.set(m, m.userData.kind); });

    let t = 0, ex = 0, shotT = -1;
    const eyeT = [[0.3, 0.1], [-0.6, -0.1]], eyeC = [[0, 0], [0, 0]], next = [0.5, 1.3];
    let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const fixView = viewFixer(stage, this.view);
    return {
      shoot() { shotT = 0; },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.25); fixView();
        ex = approach(ex, s.explode, 5, dt); slab.explode(ex);
        // Eyes: each picks its own target now and then; both lock forward while hunting.
        const hunting = shotT >= 0 && shotT < 3.2;
        for (let i = 0; i < 2; i++) {
          if (!hunting && s.eyes && t > next[i]) { eyeT[i] = [(rnd() - 0.5) * 2.4, (rnd() - 0.5) * 1.0]; next[i] = t + 0.8 + rnd() * 1.6; }
          const want = hunting ? [1.25, -0.05] : s.eyes ? eyeT[i] : [0.2, 0];
          eyeC[i][0] = approach(eyeC[i][0], want[0], 7, dt); eyeC[i][1] = approach(eyeC[i][1], want[1], 7, dt);
          ch.look(i, eyeC[i][0], eyeC[i][1]);
        }
        // Tongue: eyes lock (0–0.8 s), shot (0.8–1.4 s, shown about 20× slower), back with the fly.
        let Ltg = 0;
        if (shotT >= 0) {
          shotT += dt;
          if (shotT > 0.8 && shotT < 1.4) Ltg = 2.6 * ((shotT - 0.8) / 0.6) ** 0.6;
          else if (shotT >= 1.4 && shotT < 2.4) Ltg = 2.6 * (1 - (shotT - 1.4) / 1.0) ** 1.5;
          if (shotT > 3.4) shotT = -1;
        }
        ch.setTongue(Ltg);
        const fx = CX + 2.1 + 2.6, caught = shotT > 1.4 && shotT < 2.4;
        fly.visible = shotT < 2.4;
        fly.position.set(caught ? CX + 2.1 + Ltg : fx, CY - 0.02 + (caught ? 0 : 0.05 * Math.sin(t * 20)), 0);
        if (shotT < 0) fly.position.y = CY + 0.4 + 0.15 * Math.sin(t * 3), fly.position.x = fx + 0.2 * Math.sin(t * 2.3);
        // Gentle sway, like a leaf.
        ch.group.position.x = CX + 0.04 * Math.sin(t * 0.9); ch.group.rotation.z = 0.015 * Math.sin(t * 0.9);
        ring.lookAt(stage.camera.position);
        // Layer labels sit to the right of each layer.
        const narrow = layoutOf(stage) === 'narrow';
        LAYERS.forEach((ly, i) => { const lg = slab.layers[ly.id]; ltags[i].position.set(SX + 1.75, SY + lg.position.y, 0.6); ltags[i].visible = !narrow && ex > 0.15; });
        tags.foot.visible = tags.tail.visible = tags.cq.visible = !narrow;
      },
      readout: () => (shotT >= 0
        ? `<div class="big">Tongue: loaded like a spring</div>
          <div class="row"><span>Eyes</span><b>both locked forward to judge distance</b></div>
          <div class="row"><span>Peak acceleration (small species)</span><b>up to 264 g</b></div>
          <div class="row"><span>Shown</span><b>about 20× slower</b></div>
          <small>Anderson 2016, Scientific Reports, 20 species: small chameleons are the most explosive.</small>`
        : `<div class="big">A panther-like chameleon</div>
          <div class="row"><span>Feet</span><b>zygodactyl: two toe bundles</b></div>
          <div class="row"><span>Eyes</span><b>each swivels on its own</b></div>
          <div class="row"><span>Skin colour cells</span><b>4 kinds, in layers</b></div>
          <div class="row"><span>Mirror crystals near the top</span><b>about 127 nm across</b></div>
          <small>Skin layers after Teyssier et al. 2015 (panther chameleon). 127 nm is hundreds of times thinner than a hair.</small>`),
      pick(o) { const k = pick.get(o); if (k && INFO[k]) toast(INFO[k]); },
    };
  },
};
