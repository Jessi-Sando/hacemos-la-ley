/* =====================================================================
   Pantalla 6 — El Congreso en acción
   Motor de escenarios programados (art. 77 a 84 CN) + interfaz por etapas
   ===================================================================== */
(function () {
  const D = HLL.DATA;
  const { esc } = HLL.ui;

  const STAGES = [
    { id: 'presentacion', title: 'Presentación formal del proyecto', chamber: 'Cámara de Diputados · origen', ref: 'CN art. 77' },
    { id: 'comision', title: 'Tratamiento en comisión', chamber: 'Diputados · Comisiones de Educación y de Presupuesto y Hacienda', ref: 'Reglamento de la Cámara' },
    { id: 'dictamen', title: 'Dictamen', chamber: 'Diputados · Comisiones', ref: 'Reglamento de la Cámara' },
    { id: 'origen', title: 'Debate y votación en la cámara de origen', chamber: 'Cámara de Diputados · recinto', ref: 'CN arts. 78 y 81' },
    { id: 'revisora', title: 'Intervención de la cámara revisora', chamber: 'Senado de la Nación', ref: 'CN arts. 78 y 81' },
    { id: 'ejecutivo', title: 'Intervención del Poder Ejecutivo', chamber: 'Poder Ejecutivo nacional', ref: 'CN arts. 78, 80 y 83' }
  ];

  /* ------------------------------------------------------------------
     Escenarios: números ficticios coherentes con las mayorías exigidas
     Diputados: 257 miembros · Senado: 72 miembros
     Los valores "base" excluyen el voto del estudiante, que se suma aparte.
     ------------------------------------------------------------------ */
  const DIP_VOTES = {          // según cantidad de puntos de consenso (opciones A)
    3: { af: 188, ne: 41, ab: 11 },
    2: { af: 151, ne: 78, ab: 11 },
    1: { af: 130, ne: 99, ab: 11 },
    0: { af: 97, ne: 131, ab: 12 }
  };
  const SEN_VOTES = { sinCambios: { af: 51, ne: 16, ab: 2 }, conCambios: { af: 40, ne: 27, ab: 2 } };
  const RETURN_VOTES = { aceptar: { af: 167, ne: 62, ab: 11 }, insistir: { af: 125, ne: 104, ab: 11 } };

  const PERIODISTA_DEFAULT = { fin: 'B', fed: 'B', dat: 'B' };
  const SENADOR_DEFAULT = { fin: 'B', fed: 'B', dat: 'A' };

  /* Decisiones de la comisión de Diputados según el rol */
  function committeeDecisions(st) {
    const s2 = st.congress.s2 || {};
    if (st.role === 'senador') return Object.assign({}, SENADOR_DEFAULT);
    if (st.role === 'periodista') {
      const d = Object.assign({}, PERIODISTA_DEFAULT);
      (s2.asked || []).forEach((k) => { d[k] = 'A'; });
      return d;
    }
    if (s2.fin && s2.fed && s2.dat) return { fin: s2.fin, fed: s2.fed, dat: s2.dat };
    return null;
  }

  function addVote(base, vote) {
    const r = Object.assign({}, base);
    if (vote === 'afirmativo') r.af++;
    else if (vote === 'negativo') r.ne++;
    else if (vote === 'abstencion') r.ab++;
    r.presentes = r.af + r.ne + r.ab;
    return r;
  }

  /* Aplica modificaciones del estudiante (pantalla 5) a un articulado */
  function applyUserMods(arts, mods) {
    const out = arts.map((a) => Object.assign({}, a));
    (mods || []).forEach((m) => {
      if (m.target === 'nuevo') {
        out.splice(out.length - 1, 0, { title: m.title || 'Artículo incorporado', text: m.text, by: 'vos' });
      } else {
        const i = out.findIndex((a) => String(a.orig) === String(m.target));
        if (i >= 0) out[i] = Object.assign({}, out[i], { text: m.text, by: 'vos', changed: true });
      }
    });
    return out;
  }

  /* Construye un articulado a partir de decisiones */
  function buildArticles(dec, opts) {
    opts = opts || {};
    const base = D.bill.articles.slice(0, 4).map((a) => ({ orig: a.n, title: a.title, text: a.text }));
    const extra = [];
    ['fed', 'fin', 'dat'].forEach((k) => {
      const opt = D.issues[k][dec[k]];
      if (opt && opt.art) extra.push({ title: opt.art.title, text: opt.art.text, issue: k, by: opts.marks && opts.marks[k] });
    });
    let arts = base.concat(extra);
    arts.push({ orig: 5, title: 'De forma', text: D.bill.articles[4].text });
    if (opts.userMods) arts = applyUserMods(arts, opts.userMods);
    return arts.map((a, i) => Object.assign(a, { n: i + 1 }));
  }

  /* ------------------------------------------------------------------
     Escenario completo calculado a partir del estado (función pura)
     ------------------------------------------------------------------ */
  function scenario(st) {
    const c = st.congress;
    const dec = committeeDecisions(st);
    if (!dec) return { ready: false };
    const score = ['fin', 'fed', 'dat'].filter((k) => dec[k] === 'A').length;
    const userIsDip = st.role === 'diputado';
    const userIsSen = st.role === 'senador';
    const dipMods = userIsDip && (c.s3.firma !== 'minoria') ? (st.production.mods || []) : null;

    const sc = { ready: true, dec, score };
    sc.v1 = buildArticles(dec, { userMods: dipMods });               // dictamen / media sanción
    sc.dipVote = addVote(DIP_VOTES[score], userIsDip ? c.s4.vote : null);
    sc.dipApproved = sc.dipVote.af > sc.dipVote.ne;                 // simplificación: mayoría de votos emitidos
    if (!sc.dipApproved) {
      sc.status = 'rechazado';
      sc.final = null;
      return sc;
    }

    // Senado
    let mods;
    if (userIsSen) mods = { fin: !!(c.s5.mods && c.s5.mods.fin) && dec.fin === 'B', fed: !!(c.s5.mods && c.s5.mods.fed) && dec.fed === 'B', own: !!(c.s5.mods && c.s5.mods.own) };
    else mods = { fin: dec.fin === 'B', fed: dec.fed === 'B', own: false };
    sc.senMods = mods;
    sc.senChanged = mods.fin || mods.fed || mods.own;
    sc.senVote = addVote(sc.senChanged ? SEN_VOTES.conCambios : SEN_VOTES.sinCambios, userIsSen ? c.s5.vote : null);
    sc.senTwoThirds = sc.senVote.af >= Math.ceil(sc.senVote.presentes * 2 / 3);
    const decSen = Object.assign({}, dec);
    if (mods.fin) decSen.fin = 'A';
    if (mods.fed) decSen.fed = 'A';
    const marks = { fin: mods.fin ? 'Senado' : null, fed: mods.fed ? 'Senado' : null };
    sc.v2 = sc.senChanged ? buildArticles(decSen, { userMods: (dipMods || []).concat(mods.own ? (st.production.mods || []) : []), marks }) : null;

    // Vuelta a la cámara de origen (art. 81)
    let finalDec = dec;
    let finalArts = sc.v1;
    if (sc.senChanged) {
      const choice = userIsDip ? (c.s5b.choice || null) : 'aceptar';
      sc.returnChoice = choice;
      if (choice) {
        sc.returnVote = addVote(RETURN_VOTES[choice], userIsDip ? 'afirmativo' : null);
        if (choice === 'aceptar') { finalDec = decSen; finalArts = sc.v2; }
      }
    }
    sc.finalDec = finalDec;
    sc.final = finalArts;

    // Poder Ejecutivo
    sc.pe = finalDec.dat === 'B' ? 'veto-parcial' : 'promulga';
    sc.status = sc.pe === 'promulga' ? 'ley' : 'ley-parcial';
    sc.noFunding = finalDec.fin === 'B';
    return sc;
  }

  /* ------------------------------------------------------------------
     Interfaz
     ------------------------------------------------------------------ */
  function voteBlock(title, v, opts) {
    opts = opts || {};
    const tot = v.presentes || (v.af + v.ne + v.ab);
    const pct = (x) => (x / tot * 100).toFixed(1);
    const userLine = opts.user
      ? '<p class="uservote"><strong>Tu voto:</strong> ' + esc(labelVote(opts.user)) + ' — se suma como 1 voto entre ' + tot + ' presentes. Los demás votos son ficticios y programados.</p>'
      : '<p class="uservote muted">Votos de legisladores ficticios (escenario programado). Tu rol no vota en esta cámara.</p>';
    return '<div class="vote" role="group" aria-label="' + esc(title) + '">' +
      '<h4>' + esc(title) + '</h4>' +
      '<div class="votebar" aria-hidden="true"><span class="af" style="width:' + pct(v.af) + '%"></span><span class="ne" style="width:' + pct(v.ne) + '%"></span><span class="ab" style="width:' + pct(v.ab) + '%"></span></div>' +
      '<ul class="votelegend"><li><i class="af"></i>Afirmativos: <strong>' + v.af + '</strong></li><li><i class="ne"></i>Negativos: <strong>' + v.ne + '</strong></li><li><i class="ab"></i>Abstenciones: <strong>' + v.ab + '</strong></li><li>Presentes: <strong>' + tot + '</strong> de ' + (opts.members || '') + '</li></ul>' +
      userLine + (opts.note ? '<p class="small">' + opts.note + '</p>' : '') + '</div>';
  }
  function labelVote(v) { return { afirmativo: 'Afirmativo', negativo: 'Negativo', abstencion: 'Abstención' }[v] || '—'; }

  function textField(id, label, value, min, hint) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + '</label>' +
      (hint ? '<p class="hint" id="' + id + '-hint">' + esc(hint) + '</p>' : '') +
      '<textarea id="' + id + '" data-min="' + (min || 0) + '" rows="4"' + (hint ? ' aria-describedby="' + id + '-hint"' : '') + '>' + esc(value || '') + '</textarea>' +
      '<p class="counter" data-for="' + id + '"></p></div>';
  }

  function voteField(name, value) {
    return '<fieldset class="choices inline"><legend>Tu voto en el recinto</legend>' +
      ['afirmativo', 'negativo', 'abstencion'].map((v) =>
        '<label class="choice"><input type="radio" name="' + name + '" value="' + v + '"' + (value === v ? ' checked' : '') + '> ' + labelVote(v) + '</label>').join('') +
      '</fieldset>';
  }

  function issueTable(showDecided, dec) {
    const L = D.legislators.diputados;
    return '<div class="tablewrap"><table class="issues"><caption>Posiciones de legisladores ficticios por punto de negociación</caption><thead><tr><th scope="col">Punto</th>' +
      L.map((l) => '<th scope="col">' + esc(l.name) + '</th>').join('') + (showDecided ? '<th scope="col">Comisión</th>' : '') + '</tr></thead><tbody>' +
      ['fin', 'fed', 'dat'].map((k) => '<tr><th scope="row">' + esc(D.issues[k].label) + '</th>' +
        L.map((l) => '<td><span class="opt opt-' + l[k] + '">' + l[k] + '</span> ' + esc(D.issues[k][l[k]].label) + '</td>').join('') +
        (showDecided ? '<td><strong>' + esc(D.issues[k][dec[k]].label) + '</strong></td>' : '') + '</tr>').join('') +
      '</tbody></table></div>';
  }

  function quotes(list) {
    return '<div class="quotes">' + list.map((l) =>
      '<figure class="quote"><span class="badge fic">Ficticio</span><blockquote>«' + esc(l.quote) + '»</blockquote><figcaption><strong>' + esc(l.name) + '</strong><br><span>' + esc(l.bloc) + ' · ' + esc(l.stance) + '</span></figcaption></figure>').join('') + '</div>';
  }

  function articlesHtml(arts, compareTo) {
    return '<ol class="articles">' + arts.map((a) => {
      const isNew = !a.orig;
      const tag = a.by === 'vos' ? '<span class="tag you">Tu aporte</span>' : a.by === 'Senado' ? '<span class="tag sen">Agregado por el Senado</span>' : isNew && compareTo ? '<span class="tag new">Nuevo</span>' : (a.changed ? '<span class="tag you">Modificado</span>' : '');
      return '<li><strong>Artículo ' + a.n + '. ' + esc(a.title) + '.</strong> ' + tag + '<br>' + esc(a.text) + '</li>';
    }).join('') + '</ol>';
  }

  /* --- Contenido de cada etapa --- */
  function stageBody(i, st, sc) {
    const c = st.congress;
    const role = st.role;
    const R = D.roles[role];
    const done = c.stage > i;
    let html = '';

    if (i === 0) {
      html += '<div class="explain"><h4>Qué pasa en esta etapa</h4><p>La campaña juvenil instaló el tema, pero una demanda no es un proyecto de ley. El diputado ficticio Ramiro Acosta recoge la demanda y presenta formalmente el proyecto en la Cámara de Diputados, que pasa a ser la <strong>cámara de origen</strong>. Recibe un número de expediente y la Presidencia lo envía (lo «gira») a las comisiones que lo van a estudiar.</p></div>';
      html += '<div class="docline"><span class="badge fic">Ficticio</span> <strong>' + esc(D.bill.expediente) + '</strong> · Autor: ' + esc(D.bill.author) + ' · Giro: Comisión de Educación; Comisión de Presupuesto y Hacienda.</div>';
      html += '<fieldset class="choices" ' + (done ? 'disabled' : '') + '><legend>Antes de avanzar: ¿quién puede presentar formalmente este proyecto ante el Congreso?</legend>' +
        [['campaña', 'La campaña juvenil, directamente en el recinto'], ['legislador', 'Un/a diputado/a o senador/a, o el Poder Ejecutivo'], ['medio', 'El medio de comunicación que publicó la noticia']].map((o) =>
          '<label class="choice"><input type="radio" name="s1-answer" value="' + o[0] + '"' + (c.s1.answer === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>').join('') + '</fieldset>';
      if (c.s1.answer) {
        const ok = c.s1.answer === 'legislador';
        html += '<div class="feedback ' + (ok ? 'ok' : 'warn') + '"><p><strong>' + (ok ? 'Correcto.' : 'Revisemos.') + '</strong> Según el art. 77 de la Constitución, las leyes pueden iniciarse por proyectos presentados por miembros de cualquiera de las cámaras o por el Poder Ejecutivo. La ciudadanía también tiene iniciativa popular en Diputados (art. 39), con requisitos que fija una ley. Las organizaciones y los medios pueden impulsar el tema, pero no presentan el proyecto por sí mismos en esta historia.</p></div>';
      }
      if (role === 'diputado') {
        html += '<label class="check"><input type="checkbox" id="s1-coauthor"' + (c.s1.coauthor ? ' checked' : '') + (done ? ' disabled' : '') + '> Acompañar el proyecto como cofirmante</label>';
      }
      return html;
    }

    if (i === 1) {
      html += '<div class="explain"><h4>Qué pasa en esta etapa</h4><p>Las comisiones estudian el proyecto, escuchan a especialistas y organizaciones y discuten cambios. Hay tres puntos de conflicto. Mirá qué piensa cada integrante ficticio de la comisión.</p></div>';
      html += quotes(D.legislators.diputados);
      html += issueTable(false);
      if (role === 'diputado' || role === 'organizacion' || role === 'asesor') {
        const verb = role === 'diputado' ? 'Tu posición como integrante de la comisión' : 'Tu recomendación a la comisión';
        html += '<div class="decisions"' + (done ? ' inert' : '') + '>' + ['fin', 'fed', 'dat'].map((k) =>
          '<fieldset class="choices"><legend>' + verb + ' — ' + esc(D.issues[k].q) + '</legend>' +
          ['A', 'B'].map((o) => '<label class="choice"><input type="radio" name="s2-' + k + '" value="' + o + '"' + (c.s2[k] === o ? ' checked' : '') + '> ' + esc(D.issues[k][o].label) + '</label>').join('') +
          '</fieldset>').join('') + '</div>';
        if (role !== 'diputado') html += '<p class="note">Simplificación: tu rol no vota en la comisión. En esta simulación, legisladores ficticios retoman tu recomendación al redactar el dictamen.</p>';
        else html += '<p class="note">Simplificación: la comisión está dividida y tu posición define la mayoría.</p>';
        const prompts = {
          diputado: ['Fundamentá tus decisiones ante la comisión', 'Explicá por qué elegiste cada opción. Podés usar las evidencias de tu ficha de investigación.'],
          organizacion: ['Tu intervención en la reunión informativa de la comisión', 'Presentá las demandas de la Red y explicá cómo se relacionan con los tres puntos.'],
          asesor: ['Nota técnica para la comisión', 'Señalá riesgos jurídicos, presupuestarios o de implementación de cada opción.']
        };
        html += textField('s2-text', prompts[role][0], c.s2.text, 60, prompts[role][1]);
      } else if (role === 'periodista') {
        html += '<fieldset class="choices"' + (done ? ' disabled' : '') + '><legend>Elegí exactamente dos preguntas para publicar en tu medio antes del dictamen</legend>' +
          [['fin', '¿Con qué recursos se va a financiar el programa?'], ['fed', '¿Cómo se va a aplicar en provincias con realidades tan distintas?'], ['dat', '¿La prevención incluye revisar los celulares de los estudiantes?']].map((q) =>
            '<label class="choice"><input type="checkbox" name="s2-asked" value="' + q[0] + '"' + ((c.s2.asked || []).includes(q[0]) ? ' checked' : '') + '> ' + q[1] + '</label>').join('') + '</fieldset>';
        html += '<p class="note">Escenario: los puntos que tu cobertura pone en evidencia generan presión pública y la comisión los revisa. Los que no se preguntan quedan como en la versión del autor o del sector más duro.</p>';
        html += textField('s2-text', 'Bajada de tu nota (2 o 3 oraciones)', c.s2.text, 60, 'Explicá por qué esas preguntas importan para la comunidad.');
      } else if (role === 'senador') {
        html += '<p class="note">Tu rol todavía no interviene: el proyecto está en la cámara de origen. Seguís el debate para preparar tu revisión.</p>';
        html += textField('s2-text', 'Anotá qué vas a revisar cuando el proyecto llegue al Senado', c.s2.text, 40, 'Pensá en las provincias, las escuelas rurales y el financiamiento.');
      }
      return html;
    }

    if (i === 2) {
      html += '<div class="explain"><h4>Qué pasa en esta etapa</h4><p>La comisión firma un <strong>dictamen</strong>: su recomendación al pleno. Puede haber un dictamen de mayoría y otro de minoría. El dictamen no aprueba la ley: orienta el debate en el recinto.</p></div>';
      html += issueTable(true, sc.dec);
      html += '<div class="twocol"><section class="paper"><h4>Dictamen de mayoría (texto propuesto)</h4>' + articlesHtml(sc.v1, true) + '</section>' +
        '<section class="paper alt"><h4>Dictamen de minoría</h4><p>Firmado por el Dip. Federico Lund (ficticio). Aconseja rechazar el proyecto por superponerse con las leyes 26.892 y 27.590 y propone, en cambio, fortalecer los programas existentes.</p></section></div>';
      if (role === 'diputado') {
        html += '<fieldset class="choices"' + (done ? ' disabled' : '') + '><legend>¿Qué dictamen firmás?</legend>' +
          [['mayoria', 'Dictamen de mayoría (incluye tus modificaciones de la pantalla 5)'], ['disidencia', 'Dictamen de mayoría, en disidencia parcial'], ['minoria', 'Dictamen de minoría']].map((o) =>
            '<label class="choice"><input type="radio" name="s3-firma" value="' + o[0] + '"' + (c.s3.firma === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>').join('') + '</fieldset>';
      } else {
        html += '<p class="note">Tu rol no firma dictámenes. Leé qué cambió respecto del proyecto inicial: lo vas a necesitar en el debate.</p>';
      }
      return html;
    }

    if (i === 3) {
      html += '<div class="explain"><h4>Qué pasa en esta etapa</h4><p>El proyecto se debate en el recinto de Diputados, con quórum, y se vota. Si se aprueba, obtiene <strong>media sanción</strong> y pasa al Senado (art. 78). Si se rechaza totalmente, no puede volver a tratarse en las sesiones de ese año (art. 81).</p></div>';
      html += quotes(D.legislators.diputados.slice(0, 3));
      const P = {
        diputado: ['Tu discurso en el recinto', 'Exponé argumentos: problema, evidencia y por qué tu versión del texto es la mejor posible.', 80],
        senador: ['Nota de seguimiento', 'Tu rol no vota en Diputados. ¿Qué argumento del debate te parece más importante para el Senado?', 40],
        organizacion: ['Publicación de la Red en Ágora durante la sesión', 'Escribí un posteo que informe a los jóvenes qué se vota hoy y qué pide la organización.', 50],
        periodista: ['Crónica en vivo de la sesión', 'Contá qué se discute y presentá al menos dos posiciones distintas.', 60],
        asesor: ['Nota breve para tu legislador antes de votar', 'Resumí en pocas líneas fortalezas y debilidades técnicas del texto que se vota.', 50]
      }[role];
      html += textField('s4-text', P[0], c.s4.text, P[2], P[1]);
      if (role === 'diputado') html += voteField('s4-vote', c.s4.vote);
      if (done) {
        html += voteBlock('Votación en la Cámara de Diputados', sc.dipVote, { user: role === 'diputado' ? c.s4.vote : null, members: 257, note: 'Simplificación: se presenta como una única votación en general y en particular.' });
        html += sc.dipApproved
          ? '<div class="feedback ok"><p><strong>Media sanción.</strong> El proyecto fue aprobado por la cámara de origen y pasa al Senado como cámara revisora. Todavía no es ley.</p></div>'
          : '<div class="feedback warn"><p><strong>Proyecto rechazado.</strong> La cámara de origen lo desechó totalmente. Según el art. 81, no podrá repetirse en las sesiones de este año. La demanda ciudadana sigue existiendo, pero el trámite termina acá.</p></div>';
      }
      return html;
    }

    if (i === 4) {
      html += '<div class="explain"><h4>Qué pasa en esta etapa</h4><p>El Senado, como <strong>cámara revisora</strong>, estudia el proyecto en sus comisiones (Educación y Cultura; Presupuesto y Hacienda) y lo vota. Puede aprobarlo sin cambios, rechazarlo o introducir modificaciones. Si lo modifica, el proyecto vuelve a Diputados, que solo puede aceptar esas modificaciones o insistir en su texto original (art. 81).</p></div>';
      html += quotes(D.legislators.senado);
      html += '<section class="paper"><h4>Texto con media sanción que recibe el Senado</h4>' + articlesHtml(sc.v1, true) + '</section>';
      if (role === 'senador') {
        html += '<fieldset class="choices"' + (done ? ' disabled' : '') + '><legend>Modificaciones que proponés en el Senado</legend>' +
          (sc.dec.fed === 'B' ? '<label class="choice"><input type="checkbox" name="s5-mod" value="fed"' + (c.s5.mods && c.s5.mods.fed ? ' checked' : '') + '> Reemplazar la aplicación directa por la implementación concertada en el Consejo Federal de Educación</label>' : '') +
          (sc.dec.fin === 'B' ? '<label class="choice"><input type="checkbox" name="s5-mod" value="fin"' + (c.s5.mods && c.s5.mods.fin ? ' checked' : '') + '> Agregar un artículo de financiamiento con partidas presupuestarias</label>' : '') +
          ((st.production.mods || []).length ? '<label class="choice"><input type="checkbox" name="s5-mod" value="own"' + (c.s5.mods && c.s5.mods.own ? ' checked' : '') + '> Incorporar mis propuestas de modificación de la pantalla 5</label>' : '') +
          '<p class="small">Si no marcás ninguna, el Senado vota el texto tal como llegó.</p></fieldset>';
        html += textField('s5-text', 'Fundamentá tu posición en el Senado', c.s5.text, 60, 'Usá argumentos federales: qué necesitan las provincias para aplicar el programa.');
        html += voteField('s5-vote', c.s5.vote);
      } else {
        const P = {
          diputado: ['¿Qué esperás que haga el Senado?', 'Tu rol no vota en el Senado. Anticipá qué cambios podrían proponer y cómo responderías.', 40],
          organizacion: ['Carta de la Red a la Comisión de Educación y Cultura del Senado', 'Pedí lo que todavía falta en el texto. Sé concreto/a.', 60],
          periodista: ['Pregunta a un senador o senadora (ficticios)', 'Elegí a quién le preguntás y qué. Una buena pregunta pone en evidencia un conflicto.', 40],
          asesor: ['Recomendación técnica para el Senado', 'Indicá qué artículos convendría modificar y por qué.', 60]
        }[role];
        html += textField('s5-text', P[0], c.s5.text, P[2], P[1]);
      }
      if (done || (c.s5.locked)) {
        html += voteBlock('Votación en el Senado', sc.senVote, { user: role === 'senador' ? c.s5.vote : null, members: 72, note: sc.senChanged ? 'El Senado aprobó con modificaciones por mayoría absoluta de los presentes, sin alcanzar dos tercios. Eso le permite a Diputados aceptar o insistir por mayoría absoluta (art. 81).' : '' });
        if (!sc.senChanged) html += '<div class="feedback ok"><p><strong>Sanción.</strong> El Senado aprobó el mismo texto que Diputados. El proyecto queda sancionado por el Congreso y pasa al Poder Ejecutivo.</p></div>';
        else {
          html += '<section class="paper"><h4>Texto modificado por el Senado</h4>' + articlesHtml(sc.v2, true) + '</section>';
          html += '<div class="explain"><h4>Vuelve a la cámara de origen</h4><p>Diputados no puede agregar nuevos cambios: solo puede aceptar las modificaciones del Senado o insistir en su redacción original, en este caso por mayoría absoluta de los presentes.</p></div>';
          if (role === 'diputado') {
            html += '<fieldset class="choices"' + (done ? ' disabled' : '') + '><legend>¿Qué proponés en Diputados?</legend>' +
              [['aceptar', 'Aceptar las modificaciones del Senado'], ['insistir', 'Insistir en el texto original de Diputados']].map((o) =>
                '<label class="choice"><input type="radio" name="s5b-choice" value="' + o[0] + '"' + (c.s5b.choice === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>').join('') + '</fieldset>';
            html += textField('s5b-text', 'Fundamentá tu propuesta', c.s5b.text, 40, '');
          }
          if (done) {
            html += voteBlock('Diputados: ' + (sc.returnChoice === 'insistir' ? 'insistencia en el texto original' : 'aceptación de las modificaciones'), sc.returnVote, { members: 257, user: role === 'diputado' ? 'afirmativo' : null, note: role === 'diputado' ? 'Votaste a favor de la moción que propusiste.' : '' });
            html += '<div class="feedback ok"><p><strong>Sanción.</strong> ' + (sc.returnChoice === 'insistir' ? 'Diputados insistió en su texto original con mayoría absoluta de los presentes.' : 'Diputados aceptó las modificaciones del Senado.') + ' El proyecto pasa al Poder Ejecutivo.</p></div>';
          }
        }
      }
      return html;
    }

    if (i === 5) {
      html += '<div class="explain"><h4>Qué pasa en esta etapa</h4><p>El Poder Ejecutivo examina el proyecto sancionado. Puede <strong>promulgarlo</strong> o <strong>vetarlo</strong> total o parcialmente. Si no lo veta en diez días útiles, queda promulgado automáticamente (art. 80). Si lo veta, vuelve a la cámara de origen, y el Congreso solo puede imponer su texto con dos tercios en ambas cámaras (art. 83). Luego la ley se publica en el Boletín Oficial.</p></div>';
      if (sc.pe === 'promulga') {
        html += '<div class="feedback ok"><p><strong>Escenario: el Poder Ejecutivo promulga la ley.</strong> Se publica en el Boletín Oficial. Salvo que la propia ley fije otra fecha, rige desde el octavo día de su publicación.</p></div>';
      } else {
        html += '<div class="feedback warn"><p><strong>Escenario: veto parcial.</strong> El Poder Ejecutivo observa el artículo de supervisión de comunicaciones por su posible conflicto con la intimidad y la protección de datos, y promulga el resto. La parte observada vuelve al Congreso, que necesitaría dos tercios en ambas cámaras para insistir.</p><p class="small">Simplificación pendiente de revisión: la promulgación parcial exige que las partes no vetadas tengan autonomía normativa y no alteren el espíritu del proyecto (art. 80). La simulación no desarrolla esa nueva votación.</p></div>';
      }
      if (sc.noFunding) html += '<div class="feedback info"><p><strong>Consecuencia institucional:</strong> la ley no indica cómo se financia. Su aplicación dependerá de decisiones presupuestarias futuras.</p></div>';
      if (role === 'periodista') html += textField('s6-text', 'Titular final de tu cobertura', c.s6.text, 15, 'Una frase precisa: ¿qué pasó finalmente con el proyecto?');
      return html;
    }
    return html;
  }

  /* Validación por etapa. Devuelve lista de errores. */
  function validate(i, st) {
    const c = st.congress;
    const role = st.role;
    const errs = [];
    const need = (val, min, label) => { if (!val || val.trim().length < min) errs.push(label + ': escribí al menos ' + min + ' caracteres.'); };
    if (i === 0) { if (!c.s1.answer) errs.push('Respondé quién puede presentar formalmente el proyecto.'); }
    if (i === 1) {
      if (['diputado', 'organizacion', 'asesor'].includes(role)) ['fin', 'fed', 'dat'].forEach((k) => { if (!c.s2[k]) errs.push('Elegí una opción sobre ' + D.issues[k].label.toLowerCase() + '.'); });
      if (role === 'periodista' && (c.s2.asked || []).length !== 2) errs.push('Elegí exactamente dos preguntas.');
      need(c.s2.text, role === 'senador' ? 40 : 60, 'Texto');
    }
    if (i === 2 && role === 'diputado' && !c.s3.firma) errs.push('Elegí qué dictamen firmás.');
    if (i === 3) {
      need(c.s4.text, { diputado: 80, senador: 40, organizacion: 50, periodista: 60, asesor: 50 }[role], 'Texto');
      if (role === 'diputado' && !c.s4.vote) errs.push('Emití tu voto.');
    }
    if (i === 4) {
      need(c.s5.text, { senador: 60, diputado: 40, organizacion: 60, periodista: 40, asesor: 60 }[role], 'Texto');
      if (role === 'senador' && !c.s5.vote) errs.push('Emití tu voto en el Senado.');
      const sc = scenario(st);
      if (c.s5.locked && sc.senChanged && role === 'diputado') {
        if (!c.s5b.choice) errs.push('Elegí si aceptás las modificaciones o insistís.');
        need(c.s5b.text, 40, 'Fundamentación');
      }
    }
    if (i === 5 && role === 'periodista') need(c.s6.text, 15, 'Titular');
    return errs;
  }

  /* --- Render de la pantalla 6 --- */
  function render(st) {
    const c = st.congress;
    const sc = scenario(st);
    const i = Math.min(c.viewing != null ? c.viewing : c.stage, 5);
    const stopped = sc.ready && c.stage > 3 && !sc.dipApproved;

    let stepper = '<ol class="stages" aria-label="Etapas del procedimiento">' + STAGES.map((s, k) => {
      const state = k < c.stage ? 'done' : k === c.stage ? 'current' : 'next';
      const skipped = stopped && k > 3;
      const can = k <= c.stage && !skipped;
      return '<li class="stage ' + state + (skipped ? ' skipped' : '') + (k === i ? ' viewing' : '') + '"><button type="button" data-stage="' + k + '"' + (can ? '' : ' disabled') + ' aria-current="' + (k === i ? 'step' : 'false') + '"><span class="num">' + (k + 1) + '</span><span class="lbl">' + esc(s.title) + '</span></button></li>';
    }).join('') + '</ol>';

    const S = STAGES[i];
    let body = '<article class="stagecard"><header><p class="kicker">Etapa ' + (i + 1) + ' de 6 · ' + esc(S.chamber) + '</p><h3>' + esc(S.title) + '</h3><span class="ref">' + esc(S.ref) + '</span></header>';
    if (i >= 2 && !sc.ready) body += '<p>Completá la etapa anterior.</p>';
    else body += stageBody(i, st, sc);

    const isCurrent = i === c.stage && !c.finished;
    if (isCurrent && !stopped) {
      let label = 'Confirmar y avanzar';
      if (i === 3) label = 'Votar y ver el resultado';
      if (i === 4) label = !c.s5.locked ? 'Ver la votación del Senado' : 'Confirmar y pasar al Poder Ejecutivo';
      if (i === 5) label = 'Cerrar el expediente y ver el resultado';
      body += '<div class="errors" id="stage-errors" role="alert"></div><div class="row end"><button type="button" class="btn primary" id="stage-next">' + label + ' →</button></div>';
    } else if (c.finished || stopped) {
      body += '<div class="row end"><a class="btn primary" href="#/resultado">Ver el resultado final →</a></div>';
    } else {
      body += '<div class="row end"><button type="button" class="btn ghost" data-stage="' + c.stage + '">Volver a la etapa actual</button></div>';
    }
    body += '</article>';

    return '<section class="screen congreso">' +
      '<header class="screen-head"><p class="kicker">Pantalla 6 · Congreso Virtual</p><h1 tabindex="-1">El Congreso en acción</h1>' +
      '<p class="lead">El proyecto recorre distintas instancias. En cada una intervienen actores diferentes y se toman decisiones distintas. <strong>Una sola votación no convierte un proyecto en ley.</strong></p></header>' +
      stepper + body + '</section>';
  }

  function bind(root, st, rerender) {
    const c = st.congress;
    const save = () => HLL.store.save();

    root.querySelectorAll('[data-stage]').forEach((b) => b.addEventListener('click', () => {
      c.viewing = Number(b.dataset.stage); save(); rerender();
    }));

    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 's1-answer') { c.s1.answer = t.value; save(); rerender(); return; }
      if (t.id === 's1-coauthor') { c.s1.coauthor = t.checked; save(); return; }
      if (/^s2-(fin|fed|dat)$/.test(t.name)) { c.s2[t.name.slice(3)] = t.value; save(); return; }
      if (t.name === 's2-asked') { c.s2.asked = Array.from(root.querySelectorAll('input[name="s2-asked"]:checked')).map((x) => x.value); save(); return; }
      if (t.name === 's3-firma') { c.s3.firma = t.value; save(); return; }
      if (t.name === 's4-vote') { c.s4.vote = t.value; save(); return; }
      if (t.name === 's5-mod') { c.s5.mods = {}; root.querySelectorAll('input[name="s5-mod"]:checked').forEach((x) => { c.s5.mods[x.value] = true; }); save(); return; }
      if (t.name === 's5-vote') { c.s5.vote = t.value; save(); return; }
      if (t.name === 's5b-choice') { c.s5b.choice = t.value; save(); return; }
    });
    root.addEventListener('input', (e) => {
      const t = e.target;
      const map = { 's2-text': 's2', 's4-text': 's4', 's5-text': 's5', 's5b-text': 's5b', 's6-text': 's6' };
      if (map[t.id]) { c[map[t.id]].text = t.value; save(); }
    });

    const next = root.querySelector('#stage-next');
    if (next) next.addEventListener('click', () => {
      const i = c.stage;
      const errs = validate(i, st);
      const box = root.querySelector('#stage-errors');
      if (errs.length) {
        box.innerHTML = '<p><strong>Falta completar:</strong></p><ul>' + errs.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
        box.focus && box.setAttribute('tabindex', '-1'); box.focus();
        return;
      }
      const sc = scenario(st);
      if (i === 4 && !c.s5.locked) {
        c.s5.locked = true;
        HLL.store.log('Senado: ' + (sc.senChanged ? 'aprobó con modificaciones' : 'aprobó sin cambios') + '.');
        if (!(sc.senChanged && st.role === 'diputado')) {
          c.stage = 5; c.viewing = 4;
          HLL.store.log(sc.senChanged ? 'Diputados aceptó las modificaciones del Senado. Proyecto sancionado.' : 'Proyecto sancionado: pasa al Poder Ejecutivo.');
          HLL.ui.toast('Revisá el resultado del Senado y pasá a la etapa 6.');
        } else c.viewing = null;
        save(); rerender(); return;
      }
      const msgs = {
        0: 'Proyecto presentado en Diputados y girado a comisiones.',
        1: 'Comisión: financiamiento ' + (sc.dec ? sc.dec.fin : '') + ', federalismo ' + (sc.dec ? sc.dec.fed : '') + ', privacidad ' + (sc.dec ? sc.dec.dat : '') + '.',
        2: 'Dictamen de mayoría emitido' + (st.role === 'diputado' ? ' (firmaste: ' + c.s3.firma + ')' : '') + '.',
        3: sc.dipApproved ? 'Diputados aprobó: media sanción.' : 'Diputados rechazó el proyecto.',
        4: 'Diputados ' + (c.s5b.choice === 'insistir' ? 'insistió en su texto' : 'aceptó las modificaciones') + '. Proyecto sancionado.',
        5: sc.pe === 'promulga' ? 'Poder Ejecutivo: promulgación.' : 'Poder Ejecutivo: veto parcial.'
      };
      HLL.store.log(msgs[i]);
      if (i === 3 && !sc.dipApproved) { c.stage = 4; c.finished = true; c.viewing = 3; }
      else if (i === 5) { c.finished = true; c.stage = 6; c.viewing = 5; }
      else { c.stage = i + 1; c.viewing = (i === 3) ? 3 : null; }
      save(); rerender();
      if (c.finished) HLL.app.unlock('resultado');
      if (i === 3) HLL.ui.toast(sc.dipApproved ? 'Resultado: media sanción. Revisá el detalle y pasá a la etapa 5.' : 'Resultado: el proyecto fue rechazado.');
    });
  }

  HLL.congress = { STAGES, scenario, render, bind, buildArticles, articlesHtml };
})();
