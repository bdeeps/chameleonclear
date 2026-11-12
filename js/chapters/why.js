// Chapter 3: why chameleons change colour. Scenes, each painted with the colour model in cham.js:
//  - Rival males: brighter, faster-changing males tend to win. In veiled chameleons, the brightness of
//    the side stripes predicted which male would approach, and head brightness and how fast the head
//    changed colour predicted the winner (Ligon & McGraw 2013, Biology Letters 9: 20130892; 10 males,
//    round-robin contests; correlational, read in the abstract and press summaries). The loser darkens.
//  - Courtship: females signal their state with colour. In common chameleons, temporary female colours
//    track reproductive status and males respond to them (Cuadrado 2000, Ethology; abstract). A
//    female that will not mate often turns dark with bright contrasting marks, gapes and rocks; this
//    varies by species (Ligon's veiled-chameleon work found some patches show when females are
//    receptive), so we keep the wording general.
//  - Sleeping pale at night: widely reported for chameleons; melanin pulled back to the cell bodies.
//  - Warming up: the model in absorbedPower() (cham.js). Walton & Bennett 1993 (Physiological Zoology
//    66: 270) found reflectance rises with temperature in Kenyan chameleons (search summary). The deep
//    iridophores reflect about 45% of near-infrared energy (Teyssier et al. 2015).
//  - The myth: background matching. Stuart-Fox & Moussalli 2008 (PLoS Biology 6: e25) compared 21
//    lineages of dwarf chameleons and found that the ability to change colour tracked how showy their
//    social signals were, not how varied their backgrounds were. Chameleons can be well camouflaged,
//    but the big, fast changes are for talking.
//  - Speeds: cephalopod chromatophores are pigment sacs pulled open by radial muscles under direct
//    nerve control and close by elastic recoil, changing in well under a second (Messenger 2001, Biol
//    Rev 76: 473; read in the abstract and reviews citing it). Chameleons: seconds to minutes (cells
//    swell; melanin moves). Many other lizards change more slowly under hormones such as
//    melanocyte-stimulating hormone (general textbook statement; not given a number here).
import { THREE, M, approach, clamp, sphere, arrow } from '../kit.js';
import { Chameleon, palette, mixPal, colourOf, absorbedPower, css, hueName, PAL, S_CALM, S_EXCITED, branch, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, viewFixer, fitBoard, forestLook } from '../cham.js';

const P = {
  calm: PAL.calm,
  win: { s: S_EXCITED + 6, yellow: 1, melanin: 0.02, barS: 205, barYellow: 0.15, barWhite: 1, red: 0.25 },
  lose: { s: S_CALM - 6, yellow: 1, melanin: 0.72, barS: 205, barYellow: 0.1, barWhite: 0, red: 0 },
  male: { ...PAL.excited },
  reject: { s: S_CALM, yellow: 1, melanin: 0.8, barS: S_EXCITED + 15, barYellow: 1, barWhite: 0, barMelanin: 0.02, red: 0.4 },
  sleep: { s: 205, yellow: 0.55, melanin: 0, barS: 200, barYellow: 0.3, barWhite: 0.6, red: 0 },
};
const BG = { leaf: 0x2e6b2a, bark: 0x5a3b22, flower: 0xb8323a, sky: 0x3d77c4 };
const SCENES = {
  rival: { pos: [1.0, 3.6, 12.6], target: [0.9, 2.1, 0] }, court: { pos: [1.0, 3.6, 12.6], target: [0.9, 2.1, 0] },
  sleep: { pos: [0.8, 3.6, 10.5], target: [0.6, 2.2, 0] }, warm: { pos: [2.6, 3.8, 11.6], target: [2.4, 2.6, 0] }, myth: { pos: [2.6, 3.8, 11.6], target: [2.4, 2.6, 0] },
};

export default {
  id: 'why',
  short: 'Why change?',
  title: 'Why chameleons change colour',
  subtitle: 'Mostly to talk and to warm up. Matching the background is the part everyone gets wrong.',
  view: SCENES.rival,
  learn: `<p>Everyone “knows” that a chameleon changes colour to match whatever it sits on. It doesn’t. Put a chameleon on a red cloth and it will not turn red. Many chameleons are well <b>camouflaged</b> in their normal resting colours, but the big, fast changes are about <b>signalling</b> and <b>temperature</b>.</p>
    <p><b>Rival males</b> face off, puff up and flash bright colours. In a study of veiled chameleons, the males whose heads got brighter, and changed faster, tended to <b>win</b>. The loser turns <b>dark</b> and backs off. Different body parts seem to carry different messages: the side stripes showed which male would attack.</p>
    <p><b>Females</b> use colour too. A female who is not ready to mate, or is already carrying eggs, often turns dark with bright, contrasting spots, gapes and rocks: a clear “go away”. At <b>night</b> many chameleons sleep <b>pale</b>, with melanin pulled back.</p>
    <p>Chameleons are <b>cold-blooded</b>: they warm up in the sun. In the cool morning a chameleon turns darker and turns its flat side to the sun, so it soaks up more light. Later it turns paler. Its deep crystal layer also reflects much of the sun’s invisible <b>infrared</b>, a built-in sunshade. (How heat moves: <a href="/heatclear/">HeatClear</a>.)</p>
    <p>A 2008 study of 21 kinds of South African dwarf chameleon settled it: the ones with the most dramatic colour change were the ones with the showiest <b>social signals</b>, not the ones living on the most varied backgrounds.</p>
    <p>Compare an <b>octopus</b> or <b>cuttlefish</b>. Its colour cells are elastic bags of pigment pulled open by tiny <b>muscles</b> wired straight to the brain, so it can change in well under a second, and it really does match its background. Chameleons take seconds to minutes. Many other lizards are slower still, steered by <b>hormones</b> in the blood.</p>
    <p class="tip"><b>Try it:</b> watch the rivals and the courtship, then warm up in the morning sun. In “The myth”, move the chameleon from leaf to bark to flower: its colour follows its mood, not the background.</p>`,
  terms: [
    { t: 'Signalling', d: 'Sending a message to another animal, here with colour.' },
    { t: 'Camouflage', d: 'Looking like the surroundings so predators or prey do not notice you.' },
    { t: 'Cold-blooded (ectotherm)', d: 'An animal that gets most of its body heat from the outside, like sunshine.' },
    { t: 'Absorptance', d: 'The share of light that a surface soaks up instead of reflecting. Dark skin has a higher absorptance.' },
    { t: 'Infrared', d: 'Light with waves too long to see. About half the sun’s energy at the ground arrives as near-infrared.' },
    { t: 'Cephalopod chromatophore', d: 'An elastic pigment sac in octopus and cuttlefish skin, pulled open by muscles.' },
  ],
  defaults: { scene: 'rival', sun: 500, dark: 0.6, dlayer: true, bg: 'leaf' },
  onChange(s, key) { if (key === 'sun' || key === 'dark' || key === 'dlayer') s.scene = 'warm'; if (key === 'bg') s.scene = 'myth'; },
  controls: [
    { key: 'scene', type: 'seg', label: 'Watch', options: [{ v: 'rival', label: 'Rival males' }, { v: 'court', label: 'Courtship' }, { v: 'sleep', label: 'Asleep' }, { v: 'warm', label: 'Warming up' }, { v: 'myth', label: 'The myth' }] },
    { key: 'sun', type: 'range', label: 'Sunlight on its side', min: 100, max: 1000, step: 10, fmt: (v) => `${Math.round(v)} W/m²`, hint: 'Early morning sun is a few hundred watts per square metre; strong midday sun about 1,000.' },
    { key: 'dark', type: 'range', label: 'How dark it makes its skin', min: 0, max: 1, step: 0.01, ends: ['pale', 'dark'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'dlayer', type: 'toggle', label: 'Deep infrared-reflecting layer' },
    { key: 'bg', type: 'seg', label: 'The myth: background', options: [{ v: 'leaf', label: 'Leaf' }, { v: 'bark', label: 'Bark' }, { v: 'flower', label: 'Red flower' }, { v: 'sky', label: 'Blue' }] },
  ],
  quiz: [
    { q: 'What are the big, fast colour changes of chameleons mostly for?', options: ['Matching the background', 'Signalling to other chameleons, and controlling body temperature', 'Scaring away birds', 'Seeing better'], answer: 1, why: 'Studies of contests, courtship and dwarf chameleon evolution all point to signalling, with temperature as a second job.' },
    { q: 'In veiled chameleon contests, which male tended to win?', options: ['The darker one', 'The one whose head got brighter and changed colour faster', 'The smaller one', 'The one that stayed still'], answer: 1, why: 'Ligon and McGraw (2013) found head brightness and speed of change predicted the winner. The loser darkens.' },
    { q: 'Why does a chameleon turn darker on a cool morning?', options: ['It is scared of the cold', 'Dark skin absorbs more sunlight, so it warms up faster', 'It is hiding in shadows', 'Melanin makes heat by itself'], answer: 1, why: 'Darker skin reflects less light and absorbs more, like a black car in the sun.' },
  ],
  reel: [
    { ms: 5400, caption: 'Rival males flash bright colours. The brighter, faster-changing male tends to win; the loser goes dark.', set: { scene: 'rival' }, anim: {}, view: { pos: [0.7, 3.4, 11.0], target: [0.7, 2.3, 0] }, spin: 0 },
    { ms: 5000, caption: 'On a cool morning a chameleon goes dark to soak up more sunshine.', set: { scene: 'warm', sun: 400, dlayer: true }, anim: { dark: [0.1, 0.85] }, view: { pos: [0.6, 3.3, 8.2], target: [0.4, 2.4, 0] }, spin: 0 },
    { ms: 5000, caption: 'Myth busted: a chameleon does not copy its background. Its colour follows its mood.', set: { scene: 'myth', bg: 'flower' }, anim: {}, view: { pos: [0.6, 3.3, 8.2], target: [0.4, 2.4, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    forestLook(stage);
    const A = new Chameleon(), B = new Chameleon({ casque: 0.6 });
    A.group.position.set(-1.6, 2.4, 0); B.group.position.set(3.0, 2.4, 0); B.group.rotation.y = Math.PI;
    root.add(A.group, B.group);
    const br = branch(9); br.position.set(0.7, 2.4 - 1.12, 0); root.add(br);
    // Sun and rays for the warming scene.
    const sun = sphere(0.45, M.glow(0xffd27a), 24); sun.position.set(1.4, 6.6, 2); root.add(sun);
    const rays = [0, 1, 2].map(() => { const a = arrow(0xffd27a, 2, 0.25, 0.035); root.add(a); return a; });
    // Backdrop for the myth.
    const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.5), M.matte(BG.leaf)); back.position.set(0.4, 2.6, -1.6); root.add(back);
    const moon = sphere(0.3, M.glow(0xe8eef8), 20); moon.position.set(-3.6, 6.0, -1); root.add(moon);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const la = L('', [0, 0, 0], 'hot'), lb2 = L('', [0, 0, 0]);
    const cur = { sun: 500, dlayer: true, dark: 0.6, scene: 'rival' };
    const chart = board(root, 4.4, 3.5, 740, 590, (g, w, h) => {
      panel(g, w, h);
      if (cur.scene === 'warm') {
        head(g, 'Sunlight soaked up by its side', `Flank about 60 cm², sun ${Math.round(cur.sun)} W/m²`);
        const x0 = 80, x1 = w - 40, y0 = 400, y1 = 100, X = (d) => x0 + (x1 - x0) * d;
        const pts = (dl) => { const a = []; for (let i = 0; i <= 40; i++) { const d = i / 40, c = colourOf(darkP(d)); a.push(absorbedPower(cur.sun, c.Rvis, darkP(d).melanin, dl).P); } return a; };
        const on = pts(true), off = pts(false), max = Math.max(...off) * 1.1;
        const Y = (v) => y0 - (y0 - y1) * v / max;
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
        const line = (a, col, dash = []) => { g.setLineDash(dash); g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); a.forEach((v, i) => { const x = X(i / 40), y = Y(v); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]); };
        line(off, 'rgba(255,122,89,.7)', [8, 6]); line(on, COL.hot);
        const c = colourOf(darkP(cur.dark)), r = absorbedPower(cur.sun, c.Rvis, darkP(cur.dark).melanin, cur.dlayer);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(X(cur.dark), Y(r.P), 10, 0, 7); g.fill();
        txt(g, 'pale', x0, y0 + 30, COL.soft, '17px sans-serif'); txt(g, 'skin darkness →', X(0.4), y0 + 30, COL.soft, '17px sans-serif'); txt(g, 'dark', x1 - 40, y0 + 30, COL.soft, '17px sans-serif');
        txt(g, `${(max / 1.1).toFixed(1)} W`, 12, y1 + 20, COL.soft, '16px sans-serif'); txt(g, '0', 50, y0, COL.soft, '16px sans-serif');
        txt(g, '— with the deep infrared mirror', x0, y0 + 70, COL.hot, 'bold 18px sans-serif'); txt(g, '- - without it', x0 + 330, y0 + 70, COL.down, 'bold 18px sans-serif');
        txt(g, `Now: ${r.P.toFixed(2)} W, up to ${r.rate.toFixed(2)} °C a minute before losses`, x0, y0 + 110, COL.text, 'bold 19px sans-serif');
      } else {
        head(g, 'How fast can skin change colour?', 'Three ways animals do it');
        const rows = [
          ['Cuttlefish, octopus', 'under a second', 0.12, COL.water, 'Muscles pull pigment sacs open, wired straight to the brain.'],
          ['Chameleon', 'seconds to minutes', 0.48, COL.lime, 'Iridophore cells swell or shrink; melanin flows up or down.'],
          ['Many other lizards', 'slower', 0.85, COL.gold, 'Hormones in the blood steer the pigment cells.'],
        ];
        let y = 110;
        for (const [n, tt, k, col, why] of rows) {
          txt(g, n, 24, y, COL.text, 'bold 21px sans-serif'); txt(g, tt, w - 230, y, col, 'bold 20px sans-serif');
          g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(24, y + 12, w - 48, 22); g.fillStyle = col; g.fillRect(24, y + 12, (w - 48) * k, 22);
          wrap(g, why, 24, y + 62, w - 48, 24, COL.soft, '18px sans-serif'); y += 150;
        }
        txt(g, 'Bar length: rough order of speed, not to scale.', 24, h - 18, COL.soft, '15px sans-serif');
      }
    }, [6.4, 2.6, -1.0]);
    let drawn = '';
    const darkP = (d) => ({ s: S_CALM - 10 * d, yellow: 1, melanin: d * 0.9, barS: 205, barYellow: 0.1, barMelanin: d * 0.9, barWhite: 0, red: 0 });

    let t = 0, k = 0, last = '', pA = palette(P.calm), pB = palette(P.calm), pAt = pA, pBt = pB, bgCol = new THREE.Color(BG.leaf), mythX = 0;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        const lay = layoutOf(stage), sc = s.scene;
        if (sc !== last) {
          last = sc; k = 0; t = 0;
          if (!document.body.classList.contains('gb-reel')) { const v = lay === 'narrow' ? { pos: [0.7, 3.4, 11.5], target: [0.7, 2.2, 0] } : SCENES[sc]; stage.setView(v.pos, v.target, 0.9); }
          stage.scene.background = new THREE.Color(sc === 'sleep' ? 0x05070f : 0x0b1410);
        }
        k = Math.min(1, k + dt / 2.2);   // colour change takes ~2 s on screen
        const two = sc === 'rival' || sc === 'court';
        B.group.visible = two; moon.visible = sc === 'sleep'; sun.visible = sc === 'warm'; rays.forEach((r) => (r.visible = sc === 'warm')); back.visible = sc === 'myth';
        A.group.position.set(two ? -1.6 : 0.4 + (sc === 'myth' ? mythX : 0), 2.4, 0);
        // Targets
        let a = P.calm, b = P.calm;
        if (sc === 'rival') { a = t > 1.8 ? P.win : P.male; b = t > 1.8 ? P.lose : P.male; }
        if (sc === 'court') { a = P.male; b = P.reject; }
        if (sc === 'sleep') a = P.sleep;
        if (sc === 'warm') a = darkP(s.dark);
        if (sc === 'myth') a = P.calm;
        const ta = palette(a), tb = palette(b);
        pA = mixPal(pA, ta, Math.min(1, dt * 2.5)); pB = mixPal(pB, tb, Math.min(1, dt * 2.5));
        A.paint(pA); if (two) B.paint(pB);
        // Postures: rivals puff up (wider), the loser shrinks; the rejecting female rocks.
        const puffA = sc === 'rival' || sc === 'court' ? 1.15 : 1, puffB = sc === 'rival' ? (t > 1.8 ? 0.9 : 1.15) : 1;
        A.body.scale.y = approach(A.body.scale.y, puffA, 3, dt); A.body.scale.z = approach(A.body.scale.z, sc === 'warm' ? 1.25 : 1, 3, dt);
        B.body.scale.y = approach(B.body.scale.y, puffB, 3, dt);
        B.group.rotation.z = sc === 'court' ? 0.06 * Math.sin(t * 5) : 0;
        B.group.position.x = sc === 'rival' && t > 1.8 ? approach(B.group.position.x, 3.8, 1.2, dt) : approach(B.group.position.x, 3.0, 2, dt);
        A.group.rotation.y = sc === 'warm' ? -0.5 : 0;
        const fwd = two ? 1.2 : 0.3 * Math.sin(t);
        A.look(0, fwd, 0); A.look(1, two ? 1.2 : -0.6 + 0.3 * Math.sin(t * 0.7), 0); B.look(0, 1.2, 0); B.look(1, 1.2, 0);
        // Sleep: eyes closed (hidden pupils by turning them back).
        if (sc === 'sleep') { A.look(0, -1.6, 0); A.look(1, -1.6, 0); }
        // Sun rays toward the flank.
        rays.forEach((r, i) => { r.position.set(1.0 + i * 0.4, 6.0, 1.8); r.lookAt(-0.3 + i * 0.6, 2.9 - i * 0.15, 0.3); r.rotateX(Math.PI / 2); r.set(3.6); r.visible = sc === 'warm'; });
        // Myth: background colour from the control; the chameleon drifts along the branch.
        bgCol.lerp(new THREE.Color(BG[s.bg]), Math.min(1, dt * 3)); back.material.color.copy(bgCol);
        mythX = approach(mythX, { leaf: -1.2, bark: -0.4, flower: 0.4, sky: 1.2 }[s.bg], 1.5, dt);
        // Labels
        la.visible = lb2.visible = sc !== 'warm';
        la.position.set(A.group.position.x - 0.2, 4.0, 0); lb2.position.set(B.group.position.x + 0.2, 4.0, 0); lb2.visible = two;
        la.element.textContent = sc === 'rival' ? (t > 1.8 ? 'Bright head: the winner' : 'Puffed up, flashing') : sc === 'court' ? 'Male shows off' : sc === 'sleep' ? 'Asleep: pale' : 'Same colour on every background';
        lb2.element.textContent = sc === 'rival' ? (t > 1.8 ? 'Goes dark, backs off' : 'Puffed up, flashing') : 'Female: dark with bright spots means “no”';
        // Board
        cur.sun = s.sun; cur.dark = s.dark; cur.dlayer = s.dlayer; cur.scene = sc;
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.5, 5.4, -1] : [6.6, 2.6, -1.0], lay === 'tall' ? 0.75 : 1);
        chart.mesh.visible = chart.mesh.visible && (sc === 'warm' || sc === 'myth');
        const key = sc === 'warm' ? [sc, s.sun, s.dark.toFixed(2), s.dlayer].join() : 'speed';
        if (key !== drawn) { drawn = key; chart.redraw(); }
      },
      readout: (s) => {
        const sc = s.scene;
        if (sc === 'warm') {
          const p = darkP(s.dark), c = colourOf(p), r = absorbedPower(s.sun, c.Rvis, p.melanin, s.dlayer), r0 = absorbedPower(s.sun, colourOf(darkP(0)).Rvis, 0, s.dlayer);
          return `<div class="big">${r.P.toFixed(2)} W soaked up</div>
            <div class="row"><span>Skin colour</span><b style="color:${css(c.rgb)}">${hueName(c.rgb)}</b></div>
            <div class="row"><span>Share of sunlight absorbed</span><b>${Math.round(r.alpha * 100)}%</b></div>
            <div class="row"><span>Compared with pale skin</span><b>+${Math.round((r.P / r0.P - 1) * 100)}%</b></div>
            <div class="row"><span>Infrared reflected by the deep layer</span><b>${Math.round(r.rN * 100)}%</b></div>
            <div class="row"><span>Warming, before losses to the air</span><b>up to ${r.rate.toFixed(2)} °C/min</b></div>
            <small>Model: P = sunlight × 60 cm² × share absorbed; 150 g body. Infrared mirror after Teyssier et al. 2015. Illustrative.</small>`;
        }
        const RO = {
          rival: ['Rivals: brighter and faster wins', 'Head brightness and speed of change predicted the winner in veiled chameleons (Ligon & McGraw 2013).'],
          court: ['Courtship: colour says yes or no', 'Female colours track whether she is ready to mate (Cuadrado 2000, common chameleons). Details vary by species.'],
          sleep: ['Asleep: pale', 'At night melanin is pulled back and many chameleons look pale.'],
          myth: ['Myth: matching the background', 'Colour change evolved for social signals, not to match backgrounds (Stuart-Fox & Moussalli 2008, 21 dwarf chameleon lineages).'],
        }[sc];
        return `<div class="big">${RO[0]}</div><small>${RO[1]}</small>`;
      },
    };
  },
};
