// Chapter 6: how people worked out chameleon colour. Four scenes:
// 1. Ancient ideas. Aristotle, History of Animals book II (ch. 7 in Thompson's translation, ch. 11
//    in older numbering): the colour change "takes place when it is filled with air", to black,
//    ochre or panther-like spots, over the whole body. Pliny, Natural History VIII.51: it takes the
//    colour of whatever it is closest to "except red and white", and it was said to live on air.
//    Thomas Browne's Pseudodoxia Epidemica (1646, book III ch. 21) argued against the air diet.
// 2. Nerves. Ernst Brücke presented his study of the African chameleon's colour change to the Vienna
//    Academy in 1852 (six of ten chameleons sent from Cairo; Sitzungsberichte 8; Denkschriften 4).
//    Paul Bert (report to the Académie, translated in Annals and Magazine of Natural History 1876,
//    17: 97) traced colour to coloured "corpuscles" moving toward or away from the surface, controlled
//    by two sets of nerves; cutting the medulla oblongata turned the whole body black for good.
// 3. Crystals. Teyssier et al. 2015 bathed excited (white/yellow) skin in solutions from 236 to 1,416
//    mOsm (1× to 6× Ringer's): water left the cells, the lattice shrank and single cells shifted
//    through the whole visible spectrum, red to green to blue. Our mapping from osmolarity to crystal
//    spacing is illustrative (linear, from the excited spacing down to about 180 nm).
// 4. Materials. Chameleon-inspired colour-changing materials stretch or swell a photonic lattice, for
//    example the stretchable "smart skin" of Salaita's group at Emory (ACS Nano 2019) and cellulose-
//    nanocrystal films (ACS Applied Materials & Interfaces 2020); read in press summaries. Our film
//    model: stretching thins the film, so layer spacing falls as 1/√(1 + strain) (volume kept).
import { THREE, M, approach, clamp, box, beam, sphere } from '../kit.js';
import { Chameleon, palette, mixPal, colourOf, crystal, css, hueName, bandName, PAL, S_CALM, S_EXCITED, branch, layoutOf, reelZoom, focuser, viewFixer, forestLook } from '../cham.js';

const VIEWS = {
  ancient: { pos: [1.4, 3.4, 9.6], target: [1.2, 2.3, 0], narrow: { pos: [0.2, 3.2, 9.6], target: [0.2, 2.1, 0] } },
  nerves: { pos: [1.4, 3.4, 9.6], target: [1.2, 2.3, 0], narrow: { pos: [0.2, 3.2, 9.6], target: [0.2, 2.1, 0] } },
  salt: { pos: [1.2, 3.6, 5.0], target: [1.0, 1.4, 0], narrow: { pos: [0.6, 4.0, 6.6], target: [0.6, 1.3, 0] } },
  film: { pos: [1.2, 3.6, 5.6], target: [1.0, 1.7, 0], narrow: { pos: [0.6, 4.0, 7.8], target: [0.6, 1.6, 0] } },
};
const osmS = (o) => S_EXCITED - ((o - 236) / (1416 - 236)) * (S_EXCITED - 180);
const filmS = (e) => 300 / Math.sqrt(1 + e);

export default {
  id: 'history',
  short: 'Working it out',
  title: 'How we worked out chameleon colour',
  subtitle: 'From “it lives on air” to nerves, cells, nanocrystals and colour-changing materials.',
  view: VIEWS.ancient,
  learn: `<p>People have wondered about chameleons for over 2,300 years. The Greek thinker <b>Aristotle</b> wrote that a chameleon’s colour changes when it <b>fills itself with air</b>: it puffs up and goes black, ochre or spotted. The Roman writer <b>Pliny</b> claimed it takes the colour of whatever it touches, “except red and white”, and many believed it <b>lived on air</b>. In 1646 the English doctor <b>Thomas Browne</b> argued that chameleons must eat like other animals. They eat insects, of course, caught with the tongue.</p>
    <p>In <b>1852</b> the physiologist <b>Ernst Brücke</b> in Vienna studied live chameleons shipped from Cairo and described colour cells moving pigment in the skin. In the <b>1870s</b> the French physiologist <b>Paul Bert</b> showed that <b>nerves</b> steer the colour: two sets of nerves move the coloured grains toward or away from the surface, and when he cut the nerve pathways at the base of the brain the whole animal turned black and stayed black. (Brains and nerves: <a href="/brainclear/">BrainClear</a>.)</p>
    <p>For a century, chameleon colour was explained mostly by pigment cells. Then in <b>2015</b> <b>Jérémie Teyssier</b>, <b>Michel Milinkovitch</b> and colleagues in Geneva showed it is mainly <b>structural</b>. They soaked excited skin in salty water: water left the cells, the crystal lattice shrank, and single cells shifted from <b>red to green to blue</b>, exactly as the physics of photonic crystals predicts.</p>
    <p>Engineers now copy the trick. Stretchy films with tiny regular structures inside change colour when pulled, squeezed or warmed, like a chameleon. They could make sensors that show strain or heat by colour, with no dyes at all. Living things make other colours of their own: a jellyfish glows green with a protein called GFP (<a href="/jellyfishclear/#history">JellyfishClear</a>).</p>
    <p class="tip"><b>Try it:</b> puff up Aristotle’s chameleon, cut the nerves like Bert, add salt like Teyssier’s team, and stretch the film.</p>`,
  terms: [
    { t: 'Natural History', d: 'Pliny the Elder’s huge encyclopedia of the Roman world, finished about 77 CE.' },
    { t: 'Physiologist', d: 'A scientist who studies how living bodies work.' },
    { t: 'Osmosis', d: 'Water moving through a cell’s skin from less salty to more salty liquid. Salty water outside shrinks a cell.' },
    { t: 'Bio-inspired material', d: 'A material designed by copying a trick from nature.' },
  ],
  defaults: { focus: 'ancient', puff: false, cut: false, osm: 236, strain: 0 },
  onChange(s, key) { if (key === 'puff') s.focus = 'ancient'; if (key === 'cut') s.focus = 'nerves'; if (key === 'osm') s.focus = 'salt'; if (key === 'strain') s.focus = 'film'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'ancient', label: 'Aristotle, Pliny' }, { v: 'nerves', label: 'Bert’s nerves' }, { v: 'salt', label: 'Crystals, 2015' }, { v: 'film', label: 'New materials' }] },
    { key: 'puff', type: 'toggle', label: 'Puff up with air (Aristotle)' },
    { key: 'cut', type: 'toggle', label: 'Cut the nerve pathway (Bert, 1870s)' },
    { key: 'osm', type: 'range', label: 'Saltiness of the bath (2015)', min: 236, max: 1416, step: 1, fmt: (v) => `${Math.round(v)} mOsm (${(v / 236).toFixed(1)}× normal)` },
    { key: 'strain', type: 'range', label: 'Stretch the film', min: 0, max: 0.8, step: 0.01, fmt: (v) => '+' + Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'What did the Roman writer Pliny wrongly believe about chameleons?', options: ['That they eat insects', 'That they take the colour of whatever they touch, and were said to live on air', 'That they have tongues', 'That they come from Madagascar'], answer: 1, why: 'Pliny repeated that chameleons copy their surroundings (except red and white), and the air diet was a common belief.' },
    { q: 'What did Paul Bert show in the 1870s?', options: ['That chameleons are colour-blind', 'That nerves control colour change; cutting a nerve pathway turned the animal black', 'That colour comes from food', 'That chameleons glow'], answer: 1, why: 'Bert found two sets of nerves that move the coloured grains, and a cut at the base of the brain left the whole body black.' },
    { q: 'In the 2015 experiment, what happened when excited chameleon skin was put in salty water?', options: ['It dissolved', 'Water left the cells, the crystal lattice shrank and the colour shifted from red toward blue', 'It turned white', 'Nothing changed'], answer: 1, why: 'Salty water pulls water out of the cells, the crystals pack closer and the reflected colour moves to shorter waves.' },
  ],
  reel: [
    { ms: 4800, caption: 'Aristotle thought chameleons changed colour by filling with air. Pliny thought they lived on it.', set: { focus: 'ancient', puff: true }, anim: {}, view: { pos: [0.6, 3.2, 7.6], target: [0.6, 2.3, 0] }, spin: 0.25 },
    { ms: 5200, caption: 'In 2015, salty water shrank the crystal lattice in chameleon skin, shifting red to green to blue.', set: { focus: 'salt' }, anim: { osm: [236, 1416] }, view: { pos: [0.8, 4.2, 5.4], target: [0.8, 1.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    forestLook(stage, 0x100e14);
    const G = { ancient: new THREE.Group(), nerves: new THREE.Group(), salt: new THREE.Group(), film: new THREE.Group() };
    for (const k in G) root.add(G[k]);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);
    // Ancient: a chameleon that puffs up; a scroll-like card label.
    const a = new Chameleon(); a.group.position.set(0.8, 2.5, 0); G.ancient.add(a.group);
    const ba = branch(5); ba.position.set(0.8, 2.5 - 1.12, 0); G.ancient.add(ba);
    const la = { ar: L('Aristotle: colour changes “when it is filled with air”', [0.8, 4.2, 0], G.ancient, 'hot'), pl: L('Pliny: copies what it touches “except red and white”. Wrong!', [0.8, 0.6, 0.6], G.ancient) };
    // Nerves: a chameleon with a glowing nerve line along the spine.
    const n = new Chameleon(); n.group.position.set(0.8, 2.5, 0); G.nerves.add(n.group);
    const bn = branch(5); bn.position.set(0.8, 2.5 - 1.12, 0); G.nerves.add(bn);
    const nerve = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[1.5, 0.3, 0], [0.8, 0.55, 0], [0, 0.6, 0], [-0.8, 0.45, 0], [-1.3, 0.1, 0]].map((p) => new THREE.Vector3(...p))), 60, 0.035, 8), M.glow(0xffd84a, { transparent: true, opacity: 0.85 }));
    n.group.add(nerve);
    const cutMark = beam([1.1, 0.25, 0.5], [1.3, 0.75, -0.5], 0.05, M.glow(0xff5a5a)); n.group.add(cutMark);
    const ln = { nv: L('Nerves from the brain steer the colour cells', [0.8, 4.1, 0], G.nerves, 'hot') };
    // Salt: a dish with a disc of skin and a dropper.
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.5, 0.35, 48, 1, true), M.clear(0xd8ecff, 0.35)); dish.position.set(0.8, 0.9, 0); G.salt.add(dish);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.04, 48), M.clear(0xd8ecff, 0.35)); base.position.set(0.8, 0.74, 0); G.salt.add(base);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.48, 0.25, 48), M.clear(0x8ec9ff, 0.25)); water.position.set(0.8, 0.86, 0); G.salt.add(water);
    const skinMat = new THREE.MeshBasicMaterial({ color: 0xff8a3a, toneMapped: false });
    const skin = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 40), skinMat); skin.position.set(0.8, 0.85, 0); G.salt.add(skin);
    const drop = new THREE.Group(); drop.position.set(2.0, 2.4, 0); G.salt.add(drop);
    drop.add(box(0.14, 1.0, 0.14, M.clear(0xe8f2ff, 0.5))); const bulb = sphere(0.16, M.plastic(0xff6b6b), 16); bulb.position.y = 0.6; drop.add(bulb);
    const ls = { sk: L('', [0.8, 1.6, 0], G.salt, 'hot') };
    // Film: a stretchable sheet between two clamps.
    const film = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.6), new THREE.MeshBasicMaterial({ color: 0xff3a3a, toneMapped: false })); film.position.set(0.8, 1.6, 0); G.film.add(film);
    const clampL = box(0.3, 0.3, 1.7, M.metal()), clampR = box(0.3, 0.3, 1.7, M.metal()); G.film.add(clampL, clampR);
    const lf = { f: L('', [0.8, 2.4, 0], G.film, 'hot') };

    let t = 0, puff = 1, pa = palette(PAL.calm), pn = palette(PAL.calm), sNow = S_EXCITED, eNow = 0;
    const focus = focuser(stage, G, VIEWS), fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView(); focus(s.focus);
        const narrow = layoutOf(stage) === 'narrow';
        // Ancient
        puff = approach(puff, s.puff ? 1.28 : 1, 2.5, dt); a.body.scale.set(1, puff, 1 + (puff - 1) * 1.6);
        pa = mixPal(pa, palette(s.puff ? { s: S_CALM, yellow: 1, melanin: 0.7, barS: 240, barYellow: 1, barMelanin: 0.1, barWhite: 0, red: 0.2 } : PAL.calm), Math.min(1, dt * 2)); a.paint(pa);
        a.look(0, 0.5 * Math.sin(t), 0); a.look(1, 0.5 * Math.sin(t * 0.8 + 2), 0);
        la.pl.visible = !narrow;
        // Nerves
        pn = mixPal(pn, palette(s.cut ? { s: S_CALM, yellow: 1, melanin: 1, barS: S_CALM, barYellow: 1, barMelanin: 1, barWhite: 0, red: 0 } : PAL.calm), Math.min(1, dt * 1.5)); n.paint(pn);
        nerve.material.opacity = s.cut ? 0.15 : 0.55 + 0.35 * Math.sin(t * 6); cutMark.visible = s.cut;
        ln.nv.element.textContent = s.cut ? 'Nerve pathway cut: the whole body goes black and stays' : 'Nerves from the brain steer the colour cells';
        n.look(0, 0.4 * Math.sin(t), 0); n.look(1, 0.4 * Math.sin(t * 0.7 + 1), 0);
        // Salt
        sNow = approach(sNow, osmS(s.osm), 3, dt);
        const c = colourOf({ s: sNow, yellow: 0, melanin: 0, white: 0.05 });
        skinMat.color.setRGB(c.rgb[0], c.rgb[1], c.rgb[2], THREE.SRGBColorSpace);
        drop.position.y = 2.4 + 0.1 * Math.sin(t * 2); water.material.opacity = 0.18 + 0.25 * (s.osm - 236) / 1180;
        ls.sk.element.innerHTML = `Skin cell reflects <b>${Math.round(crystal(sNow).lambda)} nm</b>: ${hueName(c.rgb)}`;
        // Film
        eNow = approach(eNow, s.strain, 4, dt);
        film.scale.set(1 + eNow, 1 / Math.sqrt(1 + eNow), 1 / Math.sqrt(1 + eNow));
        const fc = colourOf({ s: filmS(eNow), yellow: 0, melanin: 0, white: 0.05 });
        film.material.color.setRGB(fc.rgb[0], fc.rgb[1], fc.rgb[2], THREE.SRGBColorSpace);
        clampL.position.set(0.8 - 1.2 * (1 + eNow) - 0.15, 1.6, 0); clampR.position.set(0.8 + 1.2 * (1 + eNow) + 0.15, 1.6, 0);
        lf.f.element.innerHTML = `Film reflects <b>${Math.round(crystal(filmS(eNow)).lambda)} nm</b>: ${hueName(fc.rgb)}`;
      },
      readout: (s) => {
        if (s.focus === 'ancient') return `<div class="big">c. 350 BCE to 77 CE</div><div class="row"><span>Aristotle</span><b>changes when filled with air</b></div><div class="row"><span>Pliny</span><b>copies what it touches; lives on air</b></div><div class="row"><span>Today</span><b>signals and warmth; eats insects</b></div><small>History of Animals, book II; Natural History, book VIII.</small>`;
        if (s.focus === 'nerves') return `<div class="big">Nerves steer colour</div><div class="row"><span>Brücke, Vienna</span><b>1852</b></div><div class="row"><span>Paul Bert, Paris</span><b>1870s</b></div><div class="row"><span>Cut at the base of the brain</span><b>whole body black</b></div><small>Bert’s report, translated in Annals and Magazine of Natural History, 1876.</small>`;
        if (s.focus === 'salt') { const c = crystal(sNow); return `<div class="big">${Math.round(s.osm)} mOsm bath</div><div class="row"><span>Crystal gap (model)</span><b>${Math.round(sNow)} nm</b></div><div class="row"><span>Reflected band</span><b>${Math.round(c.lambda)} nm, ${bandName(c.lambda)}</b></div><small>Teyssier et al. 2015 used 236–1,416 mOsm baths. Mapping from saltiness to gap is illustrative.</small>`; }
        const c = crystal(filmS(eNow));
        return `<div class="big">Stretched +${Math.round(eNow * 100)}%</div><div class="row"><span>Layer spacing (model)</span><b>${Math.round(filmS(eNow))} nm</b></div><div class="row"><span>Reflected band</span><b>${Math.round(c.lambda)} nm, ${bandName(c.lambda)}</b></div><small>Toy film: stretching thins it, so the layers squeeze closer and the colour shifts toward blue.</small>`;
      },
    };
  },
};
