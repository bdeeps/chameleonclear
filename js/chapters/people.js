// Chapter 5: chameleons and people. Four scenes:
//  - The law in India: the Indian chameleon was in Schedule II (Part I) of the Wild Life (Protection)
//    Act, 1972 (state forest-department pages); the Wild Life (Protection) Amendment Act, 2022 (No. 18
//    of 2022) lists Chamaeleo zeylanicus in the new Schedule I (read in a legal database's text of the
//    amendment's section on the Schedules, via a search summary; check the Gazette for a citation).
//    CITES: all chameleons are on Appendix II except Brookesia perarmata on Appendix I (CITES CoP17
//    proposal, 2016, which proposed adding the last African pygmy chameleons).
//  - Trade: seizures of chameleons by customs at Chennai and Bhubaneswar airports (exotic species,
//    handed to forest departments; news reports), a Forest Department and Railway Protection Force bust
//    of an Indian chameleon smuggling ring at Titwala near Mumbai (news report, date not shown), and
//    the Wildlife Crime Control Bureau identifying seized species. No pet-keeping advice is given.
//  - Diversity: about 200 known species in 2014, of which about 85 are found only in Madagascar, and
//    36% of assessed species threatened (IUCN SSC chameleon assessment as reported by Mongabay, Nov
//    2014; search summary). A recent checklist counts about 234 species (RepFocus; secondary).
//  - The smallest: Brookesia nana, male 13.5 mm snout to vent, about 22 mm with the tail; female
//    19 mm and 29 mm (Glaw et al. 2021, Scientific Reports 11: 2522; press releases). Drawn to scale
//    against a ruler.
import { THREE, M, approach, clamp, box, beam } from '../kit.js';
import { Chameleon, palette, PAL, branch, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, focuser, viewFixer, fitBoard, forestLook, inReel } from '../cham.js';

const VIEWS = {
  law: { pos: [1.6, 3.4, 10.4], target: [1.4, 2.3, 0], narrow: { pos: [0.0, 3.2, 9.0], target: [0.0, 2.1, 0] } },
  trade: { pos: [1.6, 3.4, 10.4], target: [1.4, 2.3, 0], narrow: { pos: [0.0, 3.2, 9.0], target: [0.0, 2.1, 0] } },
  world: { pos: [1.6, 3.4, 10.4], target: [1.4, 2.3, 0], narrow: { pos: [0.0, 3.2, 9.0], target: [0.0, 2.1, 0] } },
  tiny: { pos: [0.4, 3.0, 5.4], target: [0.4, 1.4, 0], narrow: { pos: [0.4, 2.8, 5.8], target: [0.4, 1.2, 0] } },
};
const TEXT = {
  law: { t: 'Protected by law in India', rows: [
    ['Wild Life (Protection) Act, 1972', 'Indian chameleon protected; catching, keeping or selling one is a crime.'],
    ['2022 amendment', 'The schedules were redrawn. The Indian chameleon is listed in Schedule I, the highest level of protection.'],
    ['CITES (worldwide)', 'Every chameleon species is listed, so trade between countries needs permits. One Madagascar species is banned from trade altogether.'],
  ] },
  trade: { t: 'Taken from the wild', rows: [
    ['Smuggling rings', 'Forest officers and railway police near Mumbai broke up a gang smuggling Indian chameleons.'],
    ['At the airports', 'Customs in Chennai and Bhubaneswar have found foreign chameleons hidden in passengers’ bags.'],
    ['Why it harms', 'Wild animals are taken from their homes and packed into bags and boxes, and wild populations can shrink.'],
    ['What to do', 'Never buy one. Report wildlife trade to your state forest department or the Wildlife Crime Control Bureau.'],
  ] },
};

export default {
  id: 'people',
  short: 'Chameleons and people',
  title: 'Chameleons and people',
  subtitle: 'Protected in India, trafficked worldwide, and found in astonishing variety in Madagascar.',
  view: VIEWS.law,
  learn: `<p>In India, the Indian chameleon is protected by the <b>Wild Life (Protection) Act, 1972</b>. After the 2022 amendment it sits in <b>Schedule I</b>, the list with the strongest protection. Catching one from the wild, keeping it, buying it or selling it is a crime.</p>
    <p>Chameleons are popular in the <b>illegal pet trade</b>. Indian forest officers and railway police have broken up gangs smuggling Indian chameleons, and customs officers at Chennai and Bhubaneswar airports have found foreign chameleons hidden in bags, along with snakes and other reptiles. Seized animals go to the forest department. Every chameleon species is also listed under <b>CITES</b>, the world agreement on wildlife trade.</p>
    <p>Worldwide there are over <b>200 species</b> of chameleon, and almost half of them live only on the island of <b>Madagascar</b>, including the panther chameleon you met in chapter one. A 2014 survey by the <b>IUCN</b> (the body behind the Red List) found that about <b>a third</b> of the species it checked were threatened, mostly by forest loss, with collecting for the pet trade a risk for some.</p>
    <p>Madagascar also has the tiniest: <b><i>Brookesia nana</i></b>, the “nano-chameleon”, described in 2021. The male is <b>13.5 mm</b> from snout to vent, about 22 mm with its tail: one of the smallest reptiles known.</p>
    <p class="tip"><b>Try it:</b> step through the four scenes, then put the nano-chameleon on the ruler.</p>`,
  terms: [
    { t: 'Wild Life (Protection) Act', d: 'India’s main law protecting wild animals and plants, passed in 1972 and updated in 2022.' },
    { t: 'Schedule I', d: 'The list in that Act for animals with the highest protection.' },
    { t: 'CITES', d: 'The Convention on International Trade in Endangered Species, a treaty controlling trade in wildlife between countries.' },
    { t: 'IUCN Red List', d: 'The world list of how threatened each species is, from Least Concern to Extinct.' },
    { t: 'Endemic', d: 'Found in one place and nowhere else, like most of Madagascar’s chameleons.' },
  ],
  defaults: { focus: 'law', grow: 0 },
  onChange(s, key) { if (key === 'grow') s.focus = 'tiny'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'law', label: 'The law' }, { v: 'trade', label: 'Illegal trade' }, { v: 'world', label: 'Madagascar' }, { v: 'tiny', label: 'The smallest' }] },
    { key: 'grow', type: 'range', label: 'Nano-chameleon: walk along the ruler', min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'Under the 2022 amendment of India’s wildlife law, where is the Indian chameleon listed?', options: ['Nowhere, it is not protected', 'Schedule I, the highest protection', 'As vermin', 'Only in Sri Lanka’s law'], answer: 1, why: 'The Wild Life (Protection) Amendment Act, 2022 places Chamaeleo zeylanicus in Schedule I.' },
    { q: 'Roughly how many chameleon species live only in Madagascar?', options: ['About 5', 'Almost half of all chameleon species', 'None', 'All of them'], answer: 1, why: 'The 2014 IUCN survey counted about 85 Madagascar species out of roughly 200 known then.' },
    { q: 'How long is the male nano-chameleon, Brookesia nana, from snout to vent?', options: ['13.5 mm', '13.5 cm', '1 m', '0.1 mm'], answer: 0, why: 'Glaw and colleagues measured 13.5 mm, about 22 mm with the tail.' },
  ],
  reel: [
    { ms: 5000, caption: 'Almost half of the world’s 200-plus chameleon species live only in Madagascar.', set: { focus: 'world' }, anim: {}, view: { pos: [-0.7, 3.0, 9.0], target: [-0.7, 2.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    forestLook(stage);
    const G = { law: new THREE.Group(), trade: new THREE.Group(), world: new THREE.Group(), tiny: new THREE.Group() };
    for (const k in G) root.add(G[k]);
    // Law: an Indian chameleon on a branch.
    const ic = new Chameleon({ casque: 0.45 }); ic.group.position.set(-1.2, 2.5, 0); G.law.add(ic.group);
    const br = branch(5); br.position.set(-1.2, 2.5 - 1.12, 0); G.law.add(br);
    // Trade: a crate with a chameleon inside, crossed out.
    const crate = new THREE.Group(); crate.position.set(-1.0, 1.8, 0); G.trade.add(crate);
    const cw = M.matte(0x9a7a50);
    for (const x of [-1.6, 1.6]) for (const z of [-0.9, 0.9]) crate.add(beam([x, -1, z], [x, 1.2, z], 0.06, cw));
    for (let i = 0; i < 9; i++) { const x = -1.6 + i * 0.4; crate.add(beam([x, -1, 0.9], [x, 1.2, 0.9], 0.025, M.metal(0x9aa3ad))); }
    crate.add(box(3.3, 0.08, 1.9, cw)); crate.children.at(-1).position.y = -1;
    const tc = new Chameleon(); tc.group.scale.setScalar(0.5); tc.group.position.set(0, -0.45, 0); crate.add(tc.group);
    tc.paint(palette({ s: 205, yellow: 0.8, melanin: 0.7, barMelanin: 0.9, barS: 205, barYellow: 0.5, barWhite: 0, red: 0 }));
    const x1 = beam([-1.9, -1.2, 1.1], [1.9, 1.4, 1.1], 0.07, M.glow(0xff5a5a)), x2 = beam([-1.9, 1.4, 1.1], [1.9, -1.2, 1.1], 0.07, M.glow(0xff5a5a)); crate.add(x1, x2);
    // World: a little crowd of differently coloured chameleons (panther, veiled-like, small ones).
    const crowd = [];
    const kinds = [{ s: 218 }, { s: 260 }, { s: 290, red: 0.4 }, { s: 200, yellow: 0.3 }, { s: 230, melanin: 0.4 }, { s: 245 }];
    kinds.forEach((k, i) => { const c = new Chameleon({ casque: i % 2 ? 1.4 : 0.6 }); const sc = 0.35 + (i % 3) * 0.12; c.group.scale.setScalar(sc); c.group.position.set(-2.4 + (i % 3) * 1.7, 1.4 + Math.floor(i / 3) * 1.6, -0.3 + (i % 2) * 0.6); c.paint(palette({ yellow: 1, melanin: 0.1, barS: 205, barYellow: 0.2, barWhite: 0.3, red: 0, ...k })); G.world.add(c.group); crowd.push(c); });
    // Tiny: a ruler (1 unit = 10 mm) and a to-scale nano-chameleon (22 mm total).
    const ruler = box(6, 0.04, 0.5, M.matte(0xe8dcb5)); ruler.position.set(0.4, 0.5, 0); G.tiny.add(ruler);
    const tickM = M.matte(0x222222);
    for (let mm = 0; mm <= 50; mm++) { const tk = box(0.012, 0.01, mm % 10 === 0 ? 0.28 : mm % 5 === 0 ? 0.2 : 0.12, tickM); tk.position.set(-2.1 + mm * 0.1, 0.525, -0.25 + (mm % 10 === 0 ? 0.14 : mm % 5 === 0 ? 0.1 : 0.06)); G.tiny.add(tk); }
    const nano = new Chameleon({ casque: 0.3, bars: false }); nano.group.scale.setScalar(2.2 / 4.9); G.tiny.add(nano.group);
    nano.paint(palette({ s: 240, yellow: 0.9, melanin: 0.55, barS: 240, barYellow: 0.9, barWhite: 0, red: 0 }));
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);
    const tl = { ruler: L('Ruler: each big mark is 1 cm', [0.4, 0.2, 0.6], G.tiny), nano: L('<i>Brookesia nana</i>, male, to scale', [0, 0, 0], G.tiny, 'hot') };
    for (let c = 0; c <= 5; c++) L(`${c} cm`, [-2.1 + c, 0.35, -0.4], G.tiny);

    const cur = { focus: 'law' };
    const card = board(root, 4.4, 3.6, 740, 600, (g, w, h) => {
      panel(g, w, h);
      if (cur.focus === 'world') {
        head(g, 'Where the world’s chameleons live', 'IUCN survey, 2014 (as reported); totals keep rising');
        const bars = [['All known species (2014)', 200, COL.cool], ['Found only in Madagascar', 85, COL.lime], ['Found in India', 1, COL.hot]];
        let y = 120; for (const [n, v, col] of bars) { txt(g, n, 24, y, COL.text, 'bold 20px sans-serif'); txt(g, v === 200 ? 'about 200' : v === 85 ? 'about 85' : '1', w - 140, y, col, 'bold 20px sans-serif'); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(24, y + 12, w - 48, 24); g.fillStyle = col; g.fillRect(24, y + 12, Math.max(6, (w - 48) * v / 200), 24); y += 92; }
        wrap(g, 'About a third of the species assessed were threatened with extinction, mostly from forest loss. A recent checklist counts over 230 species.', 24, y + 10, w - 48, 26, COL.soft, '19px sans-serif');
      } else {
        const T = TEXT[cur.focus] || TEXT.law; head(g, T.t);
        let y = 100; for (const [a, b] of T.rows) { txt(g, a, 24, y, COL.hot, 'bold 25px sans-serif'); y = wrap(g, b, 24, y + 34, w - 48, 30, COL.text, '23px sans-serif') + 16; }
      }
    }, [5.4, 2.6, -1.0]);
    let drawn = '';
    let t = 0, walk = 0;
    const focus = focuser(stage, G, VIEWS), fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        focus(s.focus);
        const lay = layoutOf(stage);
        cur.focus = s.focus;
        fitBoard(stage, card.mesh, lay === 'tall' ? [0.6, 5.5, -1] : [5.4, 2.6, -1.0], lay === 'tall' ? 0.75 : 1);
        card.mesh.visible = card.mesh.visible && s.focus !== 'tiny';
        if (drawn !== s.focus) { drawn = s.focus; card.redraw(); }
        ic.look(0, 0.4 * Math.sin(t), 0.1); ic.look(1, -0.4 + 0.3 * Math.sin(t * 0.7), 0);
        crowd.forEach((c, i) => { c.look(0, Math.sin(t + i), 0); c.look(1, Math.sin(t * 0.8 + i * 2), 0); c.group.rotation.y = 0.3 * Math.sin(t * 0.3 + i); });
        walk = approach(walk, s.grow, 3, dt);
        // Nano: tail tip (local x ≈ −2.65) on the ruler mark, feet (local y ≈ −1.12) on the ruler.
        const k = 2.2 / 4.9; nano.group.position.set(-2.1 + walk * 2.5 + 2.65 * k, 0.52 + 1.12 * k, 0.05);   // tail tip at the ruler mark
        nano.look(0, 0.5 * Math.sin(t * 1.3), 0); nano.look(1, 0.5 * Math.sin(t + 1), 0);
        tl.nano.position.set(nano.group.position.x, 1.45, 0);
      },
      readout: (s) => ({
        law: `<div class="big">Indian chameleon: Schedule I</div><div class="row"><span>Law</span><b>Wild Life (Protection) Act, as amended in 2022</b></div><div class="row"><span>Worldwide trade</span><b>CITES: every chameleon listed</b></div><small>Schedule listing read in the amendment text (legal database); check the Gazette for a citation.</small>`,
        trade: `<div class="big">Wild capture and trade are illegal in India</div><small>Cases from news reports of forest-department, railway police and customs seizures. Report wildlife crime to your state forest department or the WCCB.</small>`,
        world: `<div class="big">Almost half live only in Madagascar</div><div class="row"><span>Known species (2014)</span><b>about 200</b></div><div class="row"><span>Only in Madagascar</span><b>about 85</b></div><div class="row"><span>Threatened (of those assessed)</span><b>about 36%</b></div><small>IUCN SSC assessment as reported in 2014. Counts change as new species are named.</small>`,
        tiny: `<div class="big">13.5 mm, snout to vent</div><div class="row"><span>With tail</span><b>about 22 mm</b></div><div class="row"><span>Female</span><b>19 mm, 29 mm with tail</b></div><small>Brookesia nana, Madagascar (Glaw et al. 2021, Scientific Reports). Only two animals were known.</small>`,
      }[s.focus]),
    };
  },
};
