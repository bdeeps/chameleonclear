// Chapter 4: India's chameleon, and a lizard that is not one.
//  - The Indian chameleon, Chamaeleo zeylanicus Laurenti, 1768, is the only chameleon in India. It
//    lives across much of peninsular India (reported from the whole peninsula including the Eastern
//    and Western Ghats), north-western Sri Lanka and extreme south-eastern Pakistan, in scrub, dry
//    deciduous and secondary forest and dry areas (Reptile Database; Karunarathna et al. 2009,
//    Taprobanica 1: 115; search summaries). IUCN Red List: Least Concern (Srinivasulu et al. 2014,
//    e.T172657A1360663). Rare in Rajasthan and in Sri Lanka (regional reports).
//  - Its colour: usually green to yellow or brown; colour change is mainly for signalling to other
//    chameleons, with dark colours linked to submission and brighter patterns to readiness to mate
//    (Wikipedia, citing field reports). We show three illustrative states, not measured spectra.
//  - The map is a hand-drawn sketch from rounded coordinates, and the shaded range is approximate.
//  - The common garden lizard Calotes versicolor (an agamid, not a chameleon): in the breeding season
//    the male's head and shoulders turn bright orange to crimson and the throat blackish; males also
//    redden after winning fights (encyclopedia accounts; a 2021 Odisha study noted brighter red throats
//    in breeding males). Its colours come mostly from pigment and it changes far less than a chameleon.
import { THREE, M, approach, clamp, beam } from '../kit.js';
import { Chameleon, palette, mixPal, PAL, S_CALM, branch, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, viewFixer, fitBoard, forestLook } from '../cham.js';

// India, a rough outline as [longitude °E, latitude °N].
const INDIA = [[68.4, 23.5], [70.5, 24.4], [71.0, 25.6], [70.0, 26.6], [69.6, 27.2], [70.8, 28.0], [72.2, 29.0], [73.4, 30.0], [74.5, 31.0], [74.6, 32.5], [73.8, 34.3], [74.5, 35.0], [75.8, 35.8], [77.8, 35.5], [79.0, 34.3], [78.7, 32.5], [79.5, 31.0], [80.3, 30.2], [81.2, 30.0], [82.0, 27.6], [84.0, 27.4], [85.5, 26.8], [87.0, 26.4], [88.1, 26.7], [88.8, 27.3], [89.0, 26.4], [89.8, 26.7], [92.0, 26.9], [94.0, 27.6], [95.4, 28.2], [97.0, 28.2], [96.2, 27.2], [95.2, 26.5], [94.6, 25.2], [94.2, 23.9], [93.3, 23.5], [92.6, 22.2], [92.2, 23.6], [91.6, 24.1], [91.2, 23.2], [90.4, 24.8], [92.2, 25.2], [89.9, 25.3], [88.6, 24.3], [88.8, 22.6], [89.1, 21.8],
  [88.2, 21.6], [87.5, 21.6], [86.8, 20.8], [86.6, 20.2], [85.8, 19.8], [84.9, 19.3], [84.2, 18.4], [83.3, 17.7], [82.3, 16.9], [81.2, 16.3], [80.9, 15.8], [80.1, 15.2], [80.15, 14.2], [80.3, 13.1], [80.2, 12.6], [79.85, 11.9], [79.85, 11.0], [79.8, 10.3], [79.3, 10.2], [79.0, 9.6], [79.2, 9.3], [78.2, 8.9], [78.1, 8.6], [77.5, 8.1], [76.9, 8.5], [76.2, 9.9], [75.8, 11.2], [75.4, 11.9], [74.8, 12.9], [74.4, 14.4], [73.8, 15.4], [73.7, 15.8], [73.3, 17.0], [73.0, 18.0], [72.8, 19.0], [72.9, 20.2], [72.7, 21.3], [72.6, 22.2], [72.2, 21.2], [71.4, 20.7], [70.4, 20.9], [69.6, 21.6], [69.1, 22.3], [70.2, 22.6], [69.6, 22.9]];
const SRI = [[79.9, 9.8], [80.3, 9.6], [81.0, 8.6], [81.8, 7.4], [81.6, 6.4], [80.6, 5.9], [80.0, 6.6], [79.8, 8.0]];
const px = (ll, w) => [30 + ((ll[0] - 67.5) / 30) * (w - 60), 90 + ((36.5 - ll[1]) / 31) * 560];

const MOOD = {
  green: { s: S_CALM, yellow: 1, melanin: 0.15, barS: S_CALM, barYellow: 0.9, barWhite: 0.25, red: 0 },
  banded: { s: 262, yellow: 1, melanin: 0.04, barS: S_CALM, barYellow: 1, barMelanin: 0.85, barWhite: 0, red: 0.05 },
  dark: { s: S_CALM, yellow: 1, melanin: 0.75, barS: S_CALM, barYellow: 1, barMelanin: 0.95, barWhite: 0, red: 0 },
};
const LIZ = { base: [0.58, 0.52, 0.33], bar: [0.45, 0.4, 0.26], stripe: [0.62, 0.56, 0.38], belly: [0.72, 0.68, 0.52] };
const RED = [0.86, 0.17, 0.07];

export default {
  id: 'india',
  short: 'India’s chameleon',
  title: 'India’s chameleon',
  subtitle: 'One species, from scrub and dry forest across the peninsula, and a garden lizard that only pretends.',
  view: { pos: [1.6, 3.4, 10.8], target: [1.4, 2.3, 0], narrow: { pos: [0.6, 3.2, 9.6], target: [0.6, 2.0, 0] } },
  learn: `<p>India has just <b>one</b> kind of chameleon: the <b>Indian chameleon</b>, <i>Chamaeleo zeylanicus</i>. It lives across much of <b>peninsular India</b>, in thorny scrub, dry deciduous forest and even village hedges, and also in north-western Sri Lanka and a corner of south-eastern Pakistan. It moves slowly along twigs, rocking like a leaf, and catches insects with its tongue.</p>
    <p>It is usually <b>green</b> to <b>yellowish</b> or brown. When it is excited, stressed or meeting another chameleon it can turn yellow with <b>dark bands</b> and spots, or go very <b>dark</b>. As in other chameleons, these changes are mostly <b>messages</b> to other chameleons: darker colours tend to mean “I give up”, brighter patterns can mean readiness to mate.</p>
    <p>Many people in India call another lizard a “chameleon”, or <i>girgit</i>: the <b>common garden lizard</b>, <i>Calotes versicolor</i>, the one doing push-ups on walls and fences. It is not a chameleon at all but an <b>agamid</b>, with ordinary eyes, normal toes and a long, thin tail that cannot grip. In the breeding season the male’s head and shoulders turn bright <b>orange to red</b> and his throat dark, which is where the nickname “bloodsucker” comes from. (It does not suck blood.)</p>
    <p>The garden lizard’s red comes mostly from <b>pigment</b>, and its colours change far less than a true chameleon’s.</p>
    <p class="tip"><b>Try it:</b> change the Indian chameleon’s mood, then switch to the garden lizard and put it in breeding colours. Compare their eyes, feet and tails.</p>`,
  terms: [
    { t: 'Chamaeleo zeylanicus', d: 'The Indian chameleon, India’s only chameleon species.' },
    { t: 'Peninsular India', d: 'The southern, triangle-shaped part of India south of the great northern plains.' },
    { t: 'Dry deciduous forest', d: 'Forest whose trees drop their leaves in the dry season; common across central and southern India.' },
    { t: 'Agamid', d: 'A family of lizards that includes the garden lizard. Not chameleons, though related.' },
    { t: 'Breeding colours', d: 'Bright colours some animals wear only during the mating season.' },
  ],
  defaults: { who: 'cham', mood: 'green', breed: true },
  onChange(s, key) { if (key === 'mood') s.who = 'cham'; if (key === 'breed') s.who = 'liz'; },
  controls: [
    { key: 'who', type: 'seg', label: 'Look at', options: [{ v: 'cham', label: 'Indian chameleon' }, { v: 'liz', label: 'Garden lizard' }, { v: 'both', label: 'Side by side' }] },
    { key: 'mood', type: 'seg', label: 'Indian chameleon’s mood', options: [{ v: 'green', label: 'Calm green' }, { v: 'banded', label: 'Excited, banded' }, { v: 'dark', label: 'Dark' }] },
    { key: 'breed', type: 'toggle', label: 'Garden lizard in breeding colours' },
  ],
  quiz: [
    { q: 'How many kinds of chameleon live wild in India?', options: ['None', 'One: the Indian chameleon', 'About twenty', 'Over a hundred'], answer: 1, why: 'Chamaeleo zeylanicus is India’s only chameleon. Most chameleon species live in Africa and Madagascar.' },
    { q: 'Where does the Indian chameleon mostly live?', options: ['High Himalayan snowfields', 'Scrub and dry forests across peninsular India', 'Only in the Sundarbans mangroves', 'In rivers'], answer: 1, why: 'It lives in thorn scrub, dry deciduous and secondary forest across the peninsula, plus parts of Sri Lanka and Pakistan.' },
    { q: 'Is the red-headed garden lizard (Calotes versicolor) a chameleon?', options: ['Yes, a small one', 'No, it is an agamid lizard; the male’s head reddens in the breeding season', 'Yes, it is the same species', 'No, it is a snake'], answer: 1, why: 'It has ordinary eyes, toes and tail. Its breeding colours come mostly from pigment.' },
  ],
  reel: [
    { ms: 5000, caption: 'India has one chameleon, Chamaeleo zeylanicus, living in dry forests across the peninsula.', set: { who: 'cham', mood: 'green' }, anim: {}, view: { pos: [0.6, 3.3, 8.6], target: [0.6, 2.4, 0] }, spin: 0.2 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    forestLook(stage, 0x14110a);
    const ch = new Chameleon({ casque: 0.45 }); ch.group.position.set(0.6, 2.6, 0); root.add(ch.group);
    const br = branch(5.5); br.position.set(0.6, 2.6 - 1.12, 0); root.add(br);
    const liz = new Chameleon({ calotes: true }); liz.group.position.set(1.0, 0.98, 0.6); root.add(liz.group);
    const rock = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 2.2), M.matte(0x6e6152)); rock.position.set(0.2, -0.17 + 0.0, 0.6); rock.castShadow = rock.receiveShadow = true; root.add(rock);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const tag = { ch: L('Indian chameleon: turret eyes, tong feet, gripping tail', [0.6, 4.25, 0], 'hot'), liz: L('Garden lizard: ordinary eyes, toes and a long tail', [0.4, 0.15, 1.8]) };
    const map = board(root, 3.2, 3.9, 560, 700, (g, w, h) => {
      panel(g, w, h); head(g, 'Where the Indian chameleon lives', 'Sketch map; shaded range is approximate');
      const path = (pts) => { g.beginPath(); pts.forEach((ll, i) => { const [x, y] = px(ll, w); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
      g.save(); path(INDIA); g.clip();
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, 0, w, h);
      const [, ycut] = px([0, 24.2], w); g.fillStyle = 'rgba(163,230,53,.38)'; g.fillRect(0, ycut, w, h);
      g.restore();
      path(INDIA); g.strokeStyle = '#cfd8e3'; g.lineWidth = 2; g.stroke();
      path(SRI); g.fillStyle = 'rgba(255,255,255,.05)'; g.fill(); g.stroke();
      g.save(); path(SRI); g.clip(); const [, ys] = px([0, 7.6], w); g.fillStyle = 'rgba(163,230,53,.38)'; g.fillRect(0, 0, w, ys); g.restore();
      const [kx, ky] = px([68.0, 24.6], w); g.fillStyle = COL.lime; g.beginPath(); g.arc(kx - 4, ky, 7, 0, 7); g.fill();
      txt(g, 'SE Pakistan', kx - 2, ky - 14, COL.soft, '15px sans-serif');
      txt(g, 'Sri Lanka (north-west)', px([80.5, 6.2], w)[0] - 150, px([0, 5.4], w)[1], COL.soft, '15px sans-serif');
      g.fillStyle = COL.lime; g.fillRect(24, h - 46, 22, 16); txt(g, 'rough range: peninsular India', 54, h - 32, COL.text, '17px sans-serif');
    }, [-3.6, 2.6, -0.6]);

    let t = 0, pc = palette(MOOD.green), headK = 1;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        const lay = layoutOf(stage);
        fitBoard(stage, map.mesh, lay === 'tall' ? [0.6, 5.6, -0.6] : [-3.6, 2.6, -0.6], lay === 'tall' ? 0.7 : 1);
        const showC = s.who !== 'liz', showL = s.who !== 'cham';
        ch.group.visible = br.visible = tag.ch.visible = showC; liz.group.visible = rock.visible = tag.liz.visible = showL;
        pc = mixPal(pc, palette(MOOD[s.mood]), Math.min(1, dt * 2.5)); ch.paint(pc);
        headK = approach(headK, s.breed ? 1 : 0, 2, dt);
        const hc = LIZ.base.map((b, i) => b + (RED[i] - b) * headK);
        liz.paint(LIZ, hc);
        // Sway, eyes and push-ups.
        ch.group.rotation.z = 0.02 * Math.sin(t * 1.1); ch.look(0, 0.5 * Math.sin(t * 0.8), 0.15 * Math.sin(t * 0.5)); ch.look(1, -0.4 + 0.5 * Math.sin(t * 0.6 + 1), 0);
        liz.group.position.y = 0.98 + (s.breed ? 0.08 * Math.max(0, Math.sin(t * 4)) : 0);
        tag.liz.element.innerHTML = s.breed ? 'Garden lizard, breeding male: <b>red head</b>' : 'Garden lizard: ordinary eyes, toes and a long tail';
        tag.ch.visible = showC && lay !== 'narrow';
      },
      readout: (s) => (s.who === 'liz'
        ? `<div class="big">Common garden lizard (not a chameleon)</div>
          <div class="row"><span>Name</span><b><i>Calotes versicolor</i>, an agamid</b></div>
          <div class="row"><span>Breeding male</span><b>head and shoulders orange to red</b></div>
          <div class="row"><span>Colour made by</span><b>mostly pigment</b></div>
          <small>Breeding colours from encyclopedia and field accounts.</small>`
        : `<div class="big">Indian chameleon</div>
          <div class="row"><span>Name</span><b><i>Chamaeleo zeylanicus</i></b></div>
          <div class="row"><span>Lives in</span><b>scrub and dry forest, peninsular India</b></div>
          <div class="row"><span>Also in</span><b>NW Sri Lanka, SE Pakistan</b></div>
          <div class="row"><span>IUCN Red List</span><b>Least Concern (2014)</b></div>
          <small>Colours shown are illustrative. Range: Reptile Database and regional reviews.</small>`),
    };
  },
};
