/* =====================================================================
   Pantallas 1–5, 7 y 8 (la 6 está en legislative-process.js)
   Cada pantalla: render(st) → HTML · bind(root, st, rerender)
   ===================================================================== */
(function () {
  const D = HLL.DATA;
  const { esc, nl2p, ICONS, badge, toast } = HLL.ui;
  const save = () => HLL.store.save();

  function head(n, title, lead, kicker) {
    return '<header class="screen-head"><p class="kicker">Pantalla ' + n + (kicker ? ' · ' + kicker : '') + '</p><h1 tabindex="-1">' + title + '</h1>' + (lead ? '<p class="lead">' + lead + '</p>' : '') + '</header>';
  }
  function nextBar(label, id, back) {
    return '<div class="errors" id="' + id + '-errors" role="alert" tabindex="-1"></div><div class="row between">' +
      (back ? '<a class="btn ghost" href="#/' + back + '">← Volver</a>' : '<span></span>') +
      '<button type="button" class="btn primary" id="' + id + '">' + label + ' →</button></div>';
  }
  function showErrors(root, id, errs) {
    const box = root.querySelector('#' + id + '-errors');
    box.innerHTML = '<p><strong>Para continuar falta:</strong></p><ul>' + errs.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul>';
    box.focus();
  }
  function counters(root) {
    root.querySelectorAll('textarea[data-min], input[data-min]').forEach((t) => {
      const c = root.querySelector('.counter[data-for="' + t.id + '"]');
      if (!c) return;
      const upd = () => {
        const min = Number(t.dataset.min); const n = t.value.trim().length;
        c.textContent = min ? (n >= min ? '✓ ' + n + ' caracteres' : n + ' / mínimo ' + min) : '';
        c.classList.toggle('ok', n >= min);
      };
      t.addEventListener('input', upd); upd();
    });
  }
  function roleHint(st, roles) {
    return st.role && roles && roles.includes(st.role) ? '<span class="badge key">Clave para tu rol</span>' : '';
  }

  /* ================================================================ */
  /* 1 · BIENVENIDA                                                    */
  /* ================================================================ */
  const heroArt = '<img class="hero-photo" src="assets/images/portada.jpg" width="915" height="740" alt="Ilustración: un grupo de estudiantes secundarios mira hacia el Congreso de la Nación; una de ellas sostiene un cartel que dice «#No al acoso digital», rodeados de celulares, un megáfono y globos de diálogo.">';

  const bienvenida = {
    render(st) {
      return '<section class="screen hero">' +
        '<div class="hero-left">' + heroArt +
        '</div>' +
        '<div class="hero-right">' +
          '<p class="kicker light">Pantalla 1 · Bienvenida</p>' +
          '<h1 tabindex="-1" class="mega"><span class="paper-label">HACEMOS<br>LA LEY</span></h1>' +
          '<p class="slogan"><span>Una idea puede cambiar las reglas</span></p>' +
          '<div class="intro">' +
            '<p>Una situación que ocurre en muchas escuelas está empezando a generar preocupación. Jóvenes de distintos lugares del país comparten sus experiencias de <strong>violencia y acoso digital</strong>. Algunos piden respuestas, otros cuestionan las propuestas y muchos creen que llegó el momento de hacer algo.</p>' +
            '<p><strong>La discusión llegó al Congreso.</strong> Tu misión: participar, desde un rol, en el recorrido de un proyecto que podría convertirse en ley. Vas a investigar, argumentar, negociar y ver las consecuencias de cada decisión.</p>' +
          '</div>' +
          '<div class="hero-ctas">' +
            '<button type="button" class="btn cta" id="start">' + (st.started ? 'Continuar la partida' : 'Comenzar') + ' <span aria-hidden="true">→</span></button>' +
            '<button type="button" class="btn outline-light" data-action="como">Cómo funciona</button>' +
          '</div>' +
          '<p class="simnote">⚠ Simulación educativa: el caso, los personajes y el proyecto de ley son ficticios.</p>' +
        '</div></section>';
    },
    bind(root, st) {
      root.querySelector('#start').addEventListener('click', () => {
        if (!st.started) { st.started = true; HLL.store.log('Inicio de la experiencia.'); }
        HLL.app.unlock('rol');
        location.hash = '#/' + (st.started && st.maxStep > 1 ? D.steps[st.maxStep].id : 'rol');
      });
    }
  };

  /* ================================================================ */
  /* 2 · ELEGÍ TU ROL                                                  */
  /* ================================================================ */
  const rol = {
    render(st) {
      const cards = Object.keys(D.roles).map((k) => {
        const r = D.roles[k];
        const sel = st.role === k;
        return '<li><button type="button" class="rolecard' + (sel ? ' selected' : '') + '" data-role="' + k + '" aria-pressed="' + sel + '" style="--rc:' + r.color + '">' +
          '<span class="rc-icon">' + ICONS[r.icon] + '</span><span class="rc-name">' + esc(r.name) + '</span>' +
          '<span class="rc-desc">' + esc(r.who) + '</span><span class="rc-mission"><strong>Misión:</strong> ' + esc(r.mission) + '</span>' +
          (sel ? '<span class="rc-sel">✓ Tu rol</span>' : '') + '</button></li>';
      }).join('');
      let ficha = '';
      if (st.role) {
        const r = D.roles[st.role];
        ficha = '<article class="ficha" style="--rc:' + r.color + '" aria-labelledby="ficha-t"><div class="ficha-head"><span class="rc-icon">' + ICONS[r.icon] + '</span><div><p class="kicker">Ficha de misión</p><h2 id="ficha-t">' + esc(r.name) + '</h2></div></div>' +
          '<dl class="ficha-grid">' +
          '<div><dt>Quién sos</dt><dd>' + esc(r.who) + '</dd></div>' +
          '<div><dt>Qué intereses representás</dt><dd>' + esc(r.interests) + '</dd></div>' +
          '<div><dt>Qué información tenés</dt><dd>' + esc(r.info) + ' Vas a ver recursos marcados como <span class="badge key">Clave para tu rol</span> y un documento exclusivo.</dd></div>' +
          '<div><dt>Responsabilidades</dt><dd><ul>' + r.responsibilities.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></dd></div>' +
          '<div><dt>Misión</dt><dd>' + esc(r.mission) + '</dd></div>' +
          '<div><dt>Producto final</dt><dd><strong>' + esc(r.product) + '</strong></dd></div>' +
          '</dl>' +
          '<p class="note">' + (r.canVoteIn ? 'Tu rol vota en el recinto del ' + (r.canVoteIn === 'senado' ? 'Senado' : 'la Cámara de Diputados') + '.' : 'Tu rol no vota: interviene investigando, recomendando y comunicando, como ocurre en la realidad.') + '</p>' +
          '</article>';
      }
      return '<section class="screen">' + head(2, 'Elegí tu rol', 'Cada personaje accede a información distinta y tiene una misión propia. Ningún rol puede resolver la historia solo. <em>Si tu docente asignó los roles, elegí el que te tocó.</em>', 'Personajes') +
        '<ul class="roles">' + cards + '</ul>' + ficha +
        (st.role ? nextBar('Aceptar la misión', 'go-demanda', 'bienvenida') : '') + '</section>';
    },
    bind(root, st, rerender) {
      root.querySelectorAll('[data-role]').forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.role;
        if (st.role === k) return;
        const apply = () => {
          const had = !!st.role;
          st.role = k;
          if (had) { st.production = {}; st.congress = { stage: 0, s1: {}, s2: {}, s3: {}, s4: {}, s5: {}, s5b: {}, s6: {}, finished: false }; st.maxStep = Math.min(st.maxStep, 4); }
          HLL.store.log('Rol elegido: ' + D.roles[k].name + '.');
          rerender();
          const f = document.getElementById('ficha-t'); if (f) f.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
          toast('Rol guardado: ' + D.roles[k].name);
        };
        if (st.role && (Object.keys(st.production).length || st.congress.stage > 0)) {
          HLL.ui.confirmBox('¿Cambiar de rol?', 'Vas a perder la producción de la pantalla 5 y el avance en el Congreso. Se conservan tu demanda y tus evidencias.', 'Cambiar de rol', apply);
        } else apply();
      }));
      const go = root.querySelector('#go-demanda');
      if (go) go.addEventListener('click', () => { HLL.app.unlock('demanda'); location.hash = '#/demanda'; });
    }
  };

  /* ================================================================ */
  /* 3 · LA DEMANDA (red social ficticia «Ágora»)                       */
  /* ================================================================ */
  const demanda = {
    render(st) {
      const post = (f) => {
        const cls = { 'campaña': 'camp', 'testimonio': 'test', 'noticia': 'news', 'critica': 'crit' }[f.kind];
        return '<article class="post post-' + cls + '" aria-labelledby="' + f.id + '-a">' +
          '<header><span class="avatar" aria-hidden="true">' + esc(f.avatar) + '</span><div><strong id="' + f.id + '-a">' + esc(f.author) + '</strong><span class="handle">' + esc(f.handle) + ' · ' + esc(f.time) + '</span></div>' +
          '<span class="ptag">' + esc(f.tag) + '</span></header>' +
          (f.title ? '<h3 class="news-title">' + esc(f.title) + '</h3>' : '') +
          '<p>' + esc(f.text) + '</p>' +
          (f.comments.length ? '<ul class="comments" aria-label="Comentarios">' + f.comments.map((c) => '<li><strong>' + esc(c.a) + '</strong> ' + esc(c.t) + '</li>').join('') + '</ul>' : '') +
          '<footer>' + badge(false) + roleHint(st, f.roles) + '</footer></article>';
      };
      return '<section class="screen">' + head(3, 'La demanda', 'Así circula el problema en <strong>Ágora</strong>, una red social inventada para esta simulación. Leé las publicaciones: aportan miradas diferentes, también críticas.', 'Redes sociales simuladas') +
        '<div class="split">' +
          '<div class="feed" aria-label="Publicaciones ficticias"><div class="feed-brand"><span class="logo-agora">ágora</span><span class="badge fic">Red social ficticia</span></div>' + D.feed.map(post).join('') + '</div>' +
          '<aside class="task sticky" aria-labelledby="t3"><h2 id="t3">Tu tarea: mapa de problemas</h2>' +
            '<p>' + esc(D.feedQuestion) + '</p>' +
            '<fieldset class="choices"><legend>Seleccioná entre 2 y 4 problemas que debería abordar una respuesta pública</legend>' +
            D.problems.map((p) => '<label class="choice"><input type="checkbox" name="prob" value="' + p.id + '"' + (st.demand.selected.includes(p.id) ? ' checked' : '') + '> ' + esc(p.label) + '</label>').join('') +
            '</fieldset><p class="counter" id="prob-count"></p>' +
            '<div class="field"><label for="dq">Tu primera pregunta para investigar</label><p class="hint" id="dq-hint">Por ejemplo: ¿qué ya existe en las leyes? ¿quién tendría que hacerse cargo?</p><textarea id="dq" rows="3" data-min="15" aria-describedby="dq-hint">' + esc(st.demand.question) + '</textarea><p class="counter" data-for="dq"></p></div>' +
            nextBar('Guardar e investigar', 'go-investigar', 'rol') +
          '</aside>' +
        '</div></section>';
    },
    bind(root, st) {
      const cnt = root.querySelector('#prob-count');
      const upd = () => { const n = st.demand.selected.length; cnt.textContent = n + ' seleccionados' + (n > 4 ? ' — elegí como máximo 4' : ''); cnt.classList.toggle('ok', n >= 2 && n <= 4); };
      upd();
      root.querySelectorAll('input[name="prob"]').forEach((c) => c.addEventListener('change', () => {
        st.demand.selected = Array.from(root.querySelectorAll('input[name="prob"]:checked')).map((x) => x.value); save(); upd();
      }));
      root.querySelector('#dq').addEventListener('input', (e) => { st.demand.question = e.target.value; save(); });
      counters(root);
      root.querySelector('#go-investigar').addEventListener('click', () => {
        const errs = []; const n = st.demand.selected.length;
        if (n < 2 || n > 4) errs.push('Seleccioná entre 2 y 4 problemas.');
        if (st.demand.question.trim().length < 15) errs.push('Escribí una pregunta para investigar (mínimo 15 caracteres).');
        if (errs.length) return showErrors(root, 'go-investigar', errs);
        HLL.store.log('Demanda: ' + n + ' problemas priorizados.');
        HLL.app.unlock('investigar'); location.hash = '#/investigar';
      });
    }
  };

  /* ================================================================ */
  /* 4 · INVESTIGAR PARA DECIDIR (dossier)                              */
  /* ================================================================ */
  const TYPE_LABEL = { institucional: 'Documento institucional', antecedente: 'Antecedente normativo', especialista: 'Especialista', perspectiva: 'Perspectiva contrapuesta', testimonio: 'Testimonio', podcast: 'Podcast «Voces del debate»' };
  const investigar = {
    filter: 'todos',
    render(st) {
      const f = this.filter;
      const types = ['todos', 'institucional', 'antecedente', 'testimonio', 'especialista', 'perspectiva', 'podcast'];
      const picked = (id) => st.evidence.find((e) => e.id === id);
      const list = D.sources.filter((s) => f === 'todos' || s.type === f || (f === 'mio' && s.roles.includes(st.role)));
      const card = (s) => {
        const p = picked(s.id);
        return '<article class="doc' + (s.real ? ' doc-real' : ' doc-fic') + (p ? ' picked' : '') + '" aria-labelledby="' + s.id + '-t">' +
          '<header><span class="dtype">' + TYPE_LABEL[s.type] + '</span>' + badge(s.real) + roleHint(st, s.roles) + '</header>' +
          '<h3 id="' + s.id + '-t">' + esc(s.title) + '</h3><p class="origin">' + esc(s.origin) + '</p>' +
          (s.transcript ? '<div class="podcast"><p class="audio-note">🎧 Audio en producción. Por ahora, leé la transcripción.</p><dl>' + s.transcript.map((l) => '<dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd>').join('') + '</dl></div>' : '<p>' + esc(s.body) + '</p>') +
          (s.link ? '<p class="small"><a href="' + s.link.href + '" target="_blank" rel="noopener">' + esc(s.link.label) + ' ↗</a> · verificá el texto vigente.</p>' : '') +
          '<button type="button" class="btn ' + (p ? 'ghost' : 'secondary') + ' sm" data-pick="' + s.id + '" aria-pressed="' + !!p + '">' + (p ? 'Quitar de mi ficha' : 'Usar como evidencia') + '</button>' +
          '</article>';
      };
      const ex = D.exclusive[st.role];
      const exclusive = ex ? '<article class="doc doc-exclusive"><header><span class="dtype">Información exclusiva de tu rol</span>' + badge(false) + '</header><h3>' + esc(ex.title) + '</h3><p>' + esc(ex.body) + '</p></article>' : '';
      const others = Object.keys(D.roles).filter((k) => k !== st.role).map((k) => D.roles[k].name).join(', ');
      const ficha = '<aside class="task sticky" aria-labelledby="t4"><h2 id="t4">Ficha de investigación</h2><p>Seleccioná <strong>tres evidencias</strong> y justificá por qué son importantes para fundamentar una propuesta. Combiná tipos de fuente.</p>' +
        (st.evidence.length ? '<ol class="evlist">' + st.evidence.map((e, i) => {
          const s = D.sources.find((x) => x.id === e.id);
          return '<li><p><strong>' + esc(s.title) + '</strong> ' + badge(s.real) + '</p><label for="why-' + e.id + '">¿Por qué es importante? (situación, consecuencia o posible solución)</label><textarea id="why-' + e.id + '" data-why="' + e.id + '" data-min="25" rows="3">' + esc(e.why) + '</textarea><p class="counter" data-for="why-' + e.id + '"></p></li>';
        }).join('') + '</ol>' : '<p class="empty">Todavía no elegiste evidencias.</p>') +
        '<p class="counter ' + (st.evidence.length === 3 ? 'ok' : '') + '">' + st.evidence.length + ' de 3 evidencias</p>' +
        nextBar('Guardar ficha y construir el proyecto', 'go-proyecto', 'demanda') + '</aside>';

      return '<section class="screen">' + head(4, 'Investigar para decidir', 'Dossier con documentos institucionales reales (resumidos), antecedentes normativos, testimonios y opiniones ficticias, y el podcast <em>Voces del debate</em>. Contrastá: no todas las fuentes dicen lo mismo.', 'Dossier') +
        '<div class="split">' +
        '<div><div class="filters" role="group" aria-label="Filtrar documentos">' +
          types.concat(['mio']).map((t) => '<button type="button" class="chip' + (f === t ? ' on' : '') + '" data-filter="' + t + '" aria-pressed="' + (f === t) + '">' + (t === 'todos' ? 'Todos' : t === 'mio' ? 'Clave para mi rol' : TYPE_LABEL[t]) + '</button>').join('') +
        '</div>' + exclusive + '<div class="docs">' + list.map(card).join('') + '</div>' +
        '<p class="note">Los otros roles (' + esc(others) + ') reciben documentos exclusivos distintos. En la experiencia grupal, esa información se pone en común en la sesión.</p></div>' +
        ficha + '</div></section>';
    },
    bind(root, st, rerender) {
      root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { investigar.filter = b.dataset.filter; rerender(); }));
      root.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
        const id = b.dataset.pick;
        const i = st.evidence.findIndex((e) => e.id === id);
        if (i >= 0) st.evidence.splice(i, 1);
        else {
          if (st.evidence.length >= 3) { toast('Ya tenés tres evidencias. Quitá una para elegir otra.', 'warn'); return; }
          st.evidence.push({ id, why: '' });
        }
        save(); rerender();
        const t = document.getElementById('why-' + id); if (t) t.focus();
      }));
      root.querySelectorAll('[data-why]').forEach((t) => t.addEventListener('input', () => {
        const e = st.evidence.find((x) => x.id === t.dataset.why); if (e) { e.why = t.value; save(); }
      }));
      counters(root);
      root.querySelector('#go-proyecto').addEventListener('click', () => {
        const errs = [];
        if (st.evidence.length !== 3) errs.push('Elegí exactamente tres evidencias.');
        st.evidence.forEach((e) => { if (e.why.trim().length < 25) errs.push('Justificá «' + D.sources.find((s) => s.id === e.id).title + '» (mínimo 25 caracteres).'); });
        if (errs.length) return showErrors(root, 'go-proyecto', errs);
        HLL.store.log('Ficha de investigación completada con 3 evidencias.');
        HLL.app.unlock('proyecto'); location.hash = '#/proyecto';
      });
    }
  };

  /* ================================================================ */
  /* 5 · CONSTRUIR EL PROYECTO                                          */
  /* ================================================================ */
  const ART_OPTS = () => D.bill.articles.slice(0, 4).map((a) => '<option value="' + a.n + '">Artículo ' + a.n + ' — ' + esc(a.title) + '</option>').join('');
  const CONSIGNAS = {
    diputado: 'Proponé al menos <strong>una modificación</strong> al articulado (podés cambiar un artículo o agregar uno nuevo) y fundamentala con tus evidencias. Tus propuestas se incorporan al dictamen si lo firmás.',
    senador: 'Anticipá tu revisión: proponé al menos <strong>una modificación</strong> pensando en las distintas jurisdicciones. Podrás presentarla cuando el proyecto llegue al Senado.',
    organizacion: 'Elaborá el <strong>documento de demandas</strong> de la Red: una presentación breve y al menos <strong>dos recomendaciones</strong> concretas, vinculadas a artículos.',
    periodista: 'Producí una <strong>noticia</strong> que permita comprender las posiciones en discusión. Citá al menos <strong>dos fuentes</strong> que no piensen lo mismo.',
    asesor: 'Elaborá un <strong>informe técnico</strong> con al menos <strong>dos observaciones</strong> sobre artículos y una conclusión de viabilidad.'
  };

  const proyecto = {
    render(st) {
      const p = st.production;
      const bill = '<article class="paper bill" aria-labelledby="bill-t"><p class="kicker">' + badge(false) + ' ' + esc(D.bill.expediente) + '</p><h2 id="bill-t">Proyecto de ley: ' + esc(D.bill.title) + '</h2>' +
        '<p class="small">Autor: ' + esc(D.bill.author) + '</p><details><summary>Fundamentos</summary>' + nl2p(D.bill.fundamentos) + '</details>' +
        '<p class="formula">' + esc(D.bill.formula) + '</p>' +
        HLL.congress.articlesHtml(D.bill.articles.map((a) => ({ n: a.n, title: a.title, text: a.text, orig: a.n }))) +
        '<p class="small">Base de trabajo, no una versión jurídica definitiva.</p></article>';

      let form = '';
      const r = st.role;
      if (r === 'diputado' || r === 'senador') {
        const mods = p.mods || [];
        form += mods.length ? '<ol class="prodlist">' + mods.map((m, i) => '<li><strong>' + (m.target === 'nuevo' ? 'Nuevo: ' + esc(m.title) : 'Art. ' + esc(m.target)) + '</strong> — ' + esc(m.text) + '<br><span class="small"><em>Fundamento:</em> ' + esc(m.why) + '</span> <button type="button" class="linkbtn" data-del="' + i + '">Eliminar</button></li>').join('') + '</ol>' : '';
        form += '<form class="subform" id="modform" novalidate><h3>Nueva modificación</h3>' +
          '<div class="field"><label for="m-target">¿Qué querés modificar?</label><select id="m-target">' + ART_OPTS() + '<option value="nuevo">Agregar un artículo nuevo</option></select></div>' +
          '<div class="field" id="m-title-f" hidden><label for="m-title">Título del artículo nuevo</label><input id="m-title" type="text" maxlength="60"></div>' +
          '<div class="field"><label for="m-text">Nueva redacción</label><textarea id="m-text" rows="3" data-min="30"></textarea><p class="counter" data-for="m-text"></p></div>' +
          '<div class="field"><label for="m-why">Fundamento' + (r === 'senador' ? ' (mirada federal)' : '') + '</label><textarea id="m-why" rows="3" data-min="40"></textarea><p class="counter" data-for="m-why"></p></div>' +
          '<div class="errors" id="mod-errors" role="alert" tabindex="-1"></div><button type="submit" class="btn secondary">Agregar al expediente</button></form>';
      } else if (r === 'organizacion') {
        const dem = p.demands || [];
        form += '<div class="field"><label for="o-intro">Presentación de la Red (quiénes son, a quién representan, qué piden)</label><textarea id="o-intro" rows="4" data-min="60">' + esc(p.intro || '') + '</textarea><p class="counter" data-for="o-intro"></p></div>';
        form += dem.length ? '<ol class="prodlist">' + dem.map((d, i) => '<li><strong>' + (d.art ? 'Art. ' + esc(d.art) : 'General') + ':</strong> ' + esc(d.text) + ' <button type="button" class="linkbtn" data-del="' + i + '">Eliminar</button></li>').join('') + '</ol>' : '';
        form += '<form class="subform" id="demform" novalidate><h3>Nueva recomendación</h3><div class="field"><label for="d-art">Vinculada a</label><select id="d-art"><option value="">Recomendación general</option>' + ART_OPTS() + '</select></div>' +
          '<div class="field"><label for="d-text">Recomendación</label><textarea id="d-text" rows="3" data-min="30"></textarea><p class="counter" data-for="d-text"></p></div><div class="errors" id="dem-errors" role="alert" tabindex="-1"></div><button type="submit" class="btn secondary">Agregar recomendación</button></form>';
        form += '<fieldset class="choices"><legend>Testimonios que respaldan el documento (opcional)</legend>' + D.feed.filter((f) => f.kind === 'testimonio').concat(D.sources.filter((s) => s.type === 'testimonio')).map((t) =>
          '<label class="choice"><input type="checkbox" name="o-test" value="' + t.id + '"' + ((p.testimonies || []).includes(t.id) ? ' checked' : '') + '> ' + esc(t.author || t.title) + '</label>').join('') + '</fieldset>';
      } else if (r === 'periodista') {
        const srcs = D.feed.map((f) => [f.id, f.author + ' — ' + f.tag]).concat(D.sources.map((s) => [s.id, s.title]));
        form += '<div class="field"><label for="n-head">Titular</label><input id="n-head" type="text" maxlength="120" data-min="15" value="' + esc(p.headline || '') + '"><p class="counter" data-for="n-head"></p></div>' +
          '<div class="field"><label for="n-lead">Bajada (qué, quién, dónde, por qué importa)</label><textarea id="n-lead" rows="2" data-min="40">' + esc(p.lead || '') + '</textarea><p class="counter" data-for="n-lead"></p></div>' +
          '<div class="field"><label for="n-body">Cuerpo de la nota (presentá al menos dos posiciones)</label><textarea id="n-body" rows="7" data-min="200">' + esc(p.body || '') + '</textarea><p class="counter" data-for="n-body"></p></div>' +
          '<fieldset class="choices scroll"><legend>Fuentes citadas (mínimo 2, con miradas diferentes)</legend>' + srcs.map((s) => '<label class="choice"><input type="checkbox" name="n-src" value="' + s[0] + '"' + ((p.sources || []).includes(s[0]) ? ' checked' : '') + '> ' + esc(s[1]) + '</label>').join('') + '</fieldset>' +
          '<p class="note">Cuidado ético: no publiques datos que identifiquen a quienes dieron testimonios anónimos.</p>';
      } else if (r === 'asesor') {
        const obs = p.obs || [];
        form += obs.length ? '<table class="mini"><thead><tr><th>Art.</th><th>Tipo</th><th>Observación</th><th>Recomendación</th><th><span class="sr">Acción</span></th></tr></thead><tbody>' + obs.map((o, i) => '<tr><td>' + esc(o.art) + '</td><td>' + esc(o.cat) + '</td><td>' + esc(o.text) + '</td><td>' + esc(o.rec) + '</td><td><button type="button" class="linkbtn" data-del="' + i + '">Eliminar</button></td></tr>').join('') + '</tbody></table>' : '';
        form += '<form class="subform" id="obsform" novalidate><h3>Nueva observación técnica</h3><div class="row wrap"><div class="field"><label for="a-art">Artículo</label><select id="a-art">' + ART_OPTS() + '<option value="General">General</option></select></div>' +
          '<div class="field"><label for="a-cat">Tipo</label><select id="a-cat"><option>Jurídica</option><option>Competencias Nación–provincias</option><option>Presupuestaria</option><option>Implementación</option><option>Derechos y datos personales</option></select></div></div>' +
          '<div class="field"><label for="a-text">Observación</label><textarea id="a-text" rows="3" data-min="30"></textarea><p class="counter" data-for="a-text"></p></div>' +
          '<div class="field"><label for="a-rec">Recomendación</label><textarea id="a-rec" rows="2" data-min="20"></textarea><p class="counter" data-for="a-rec"></p></div>' +
          '<div class="errors" id="obs-errors" role="alert" tabindex="-1"></div><button type="submit" class="btn secondary">Agregar observación</button></form>';
        form += '<fieldset class="choices inline"><legend>Conclusión de viabilidad</legend>' + ['Viable', 'Viable con modificaciones', 'No viable en su forma actual'].map((v) => '<label class="choice"><input type="radio" name="a-via" value="' + v + '"' + (p.viability === v ? ' checked' : '') + '> ' + v + '</label>').join('') + '</fieldset>' +
          '<div class="field"><label for="a-conc">Síntesis final del informe</label><textarea id="a-conc" rows="3" data-min="40">' + esc(p.conclusion || '') + '</textarea><p class="counter" data-for="a-conc"></p></div>';
      }

      const ev = st.evidence.length ? '<details class="evmini"><summary>Tu ficha de investigación (' + st.evidence.length + ')</summary><ul>' + st.evidence.map((e) => '<li><strong>' + esc((D.sources.find((s) => s.id === e.id) || {}).title) + ':</strong> ' + esc(e.why) + '</li>').join('') + '</ul></details>' : '';

      return '<section class="screen">' + head(5, 'Construir el proyecto', 'Este es el expediente del proyecto que el diputado ficticio Ramiro Acosta presentará. Consultá el articulado y realizá la tarea de tu rol.', 'Expediente legislativo') +
        '<div class="split wide-left">' + bill +
        '<aside class="task" aria-labelledby="t5"><h2 id="t5">Tu producto: ' + esc(D.roles[r].product) + '</h2><p>' + CONSIGNAS[r] + '</p>' + ev + form +
        nextBar('Guardar y llevar al Congreso', 'go-congreso', 'investigar') + '</aside></div></section>';
    },
    bind(root, st, rerender) {
      const p = st.production;
      const r = st.role;
      counters(root);
      const errBox = (id, errs) => { const b = root.querySelector('#' + id); b.innerHTML = '<ul>' + errs.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul>'; b.focus(); };
      const val = (id) => (root.querySelector('#' + id) || {}).value || '';

      root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
        const key = { diputado: 'mods', senador: 'mods', organizacion: 'demands', asesor: 'obs' }[r];
        p[key].splice(Number(b.dataset.del), 1); save(); rerender(); toast('Elemento eliminado.');
      }));

      const modform = root.querySelector('#modform');
      if (modform) {
        const tgt = root.querySelector('#m-target');
        const tf = root.querySelector('#m-title-f');
        tgt.addEventListener('change', () => {
          tf.hidden = tgt.value !== 'nuevo';
          if (tgt.value !== 'nuevo') { const a = D.bill.articles.find((x) => String(x.n) === tgt.value); root.querySelector('#m-text').value = a.text; root.querySelector('#m-text').dispatchEvent(new Event('input')); }
        });
        tgt.dispatchEvent(new Event('change'));
        modform.addEventListener('submit', (e) => {
          e.preventDefault();
          const m = { target: tgt.value, title: val('m-title').trim(), text: val('m-text').trim(), why: val('m-why').trim() };
          const errs = [];
          if (m.target === 'nuevo' && m.title.length < 3) errs.push('Poné un título al artículo nuevo.');
          if (m.text.length < 30) errs.push('La redacción debe tener al menos 30 caracteres.');
          const orig = D.bill.articles.find((x) => String(x.n) === m.target);
          if (orig && orig.text === m.text) errs.push('La redacción es igual a la original: modificala.');
          if (m.why.length < 40) errs.push('El fundamento debe tener al menos 40 caracteres.');
          if (errs.length) return errBox('mod-errors', errs);
          p.mods = (p.mods || []).filter((x) => !(x.target === m.target && m.target !== 'nuevo'));
          p.mods.push(m); save(); HLL.store.log('Propuesta de modificación: ' + (m.target === 'nuevo' ? 'artículo nuevo «' + m.title + '»' : 'artículo ' + m.target) + '.');
          rerender(); toast('Modificación agregada al expediente.', 'ok');
        });
      }
      const demform = root.querySelector('#demform');
      if (demform) {
        root.querySelector('#o-intro').addEventListener('input', (e) => { p.intro = e.target.value; save(); });
        root.querySelectorAll('input[name="o-test"]').forEach((c) => c.addEventListener('change', () => { p.testimonies = Array.from(root.querySelectorAll('input[name="o-test"]:checked')).map((x) => x.value); save(); }));
        demform.addEventListener('submit', (e) => {
          e.preventDefault();
          const d = { art: val('d-art'), text: val('d-text').trim() };
          if (d.text.length < 30) return errBox('dem-errors', ['La recomendación debe tener al menos 30 caracteres.']);
          p.demands = (p.demands || []).concat([d]); save(); rerender(); toast('Recomendación agregada.', 'ok');
        });
      }
      if (r === 'periodista') {
        [['n-head', 'headline'], ['n-lead', 'lead'], ['n-body', 'body']].forEach((x) => root.querySelector('#' + x[0]).addEventListener('input', (e) => { p[x[1]] = e.target.value; save(); }));
        root.querySelectorAll('input[name="n-src"]').forEach((c) => c.addEventListener('change', () => { p.sources = Array.from(root.querySelectorAll('input[name="n-src"]:checked')).map((x) => x.value); save(); }));
      }
      const obsform = root.querySelector('#obsform');
      if (obsform) {
        root.querySelector('#a-conc').addEventListener('input', (e) => { p.conclusion = e.target.value; save(); });
        root.querySelectorAll('input[name="a-via"]').forEach((c) => c.addEventListener('change', () => { p.viability = c.value; save(); }));
        obsform.addEventListener('submit', (e) => {
          e.preventDefault();
          const o = { art: val('a-art'), cat: val('a-cat'), text: val('a-text').trim(), rec: val('a-rec').trim() };
          const errs = [];
          if (o.text.length < 30) errs.push('La observación debe tener al menos 30 caracteres.');
          if (o.rec.length < 20) errs.push('La recomendación debe tener al menos 20 caracteres.');
          if (errs.length) return errBox('obs-errors', errs);
          p.obs = (p.obs || []).concat([o]); save(); rerender(); toast('Observación agregada al informe.', 'ok');
        });
      }

      root.querySelector('#go-congreso').addEventListener('click', () => {
        const errs = [];
        if (r === 'diputado' || r === 'senador') { if (!(p.mods || []).length) errs.push('Agregá al menos una modificación con su fundamento (botón «Agregar al expediente»).'); }
        if (r === 'organizacion') { if ((p.intro || '').trim().length < 60) errs.push('Completá la presentación de la Red (mínimo 60 caracteres).'); if ((p.demands || []).length < 2) errs.push('Agregá al menos dos recomendaciones.'); }
        if (r === 'periodista') {
          if ((p.headline || '').trim().length < 15) errs.push('Escribí un titular (mínimo 15 caracteres).');
          if ((p.lead || '').trim().length < 40) errs.push('Escribí la bajada (mínimo 40 caracteres).');
          if ((p.body || '').trim().length < 200) errs.push('El cuerpo de la nota necesita al menos 200 caracteres.');
          if ((p.sources || []).length < 2) errs.push('Citá al menos dos fuentes.');
        }
        if (r === 'asesor') {
          if ((p.obs || []).length < 2) errs.push('Agregá al menos dos observaciones técnicas.');
          if (!p.viability) errs.push('Elegí una conclusión de viabilidad.');
          if ((p.conclusion || '').trim().length < 40) errs.push('Escribí la síntesis final (mínimo 40 caracteres).');
        }
        if (errs.length) return showErrors(root, 'go-congreso', errs);
        HLL.store.log(D.roles[r].product + ' guardado en el expediente.');
        HLL.app.unlock('congreso'); location.hash = '#/congreso';
      });
    }
  };

  /* ================================================================ */
  /* 6 · CONGRESO (delegado)                                            */
  /* ================================================================ */
  const congreso = {
    render: (st) => HLL.congress.render(st),
    bind: (root, st, rerender) => { HLL.congress.bind(root, st, rerender); counters(root); }
  };

  /* ================================================================ */
  /* 7 · EL RESULTADO                                                   */
  /* ================================================================ */
  HLL.REFLECTION = [
    { id: 'r1', q: '¿Qué cambió respecto del proyecto inicial?' },
    { id: 'r2', q: '¿Qué argumentos fueron importantes?' },
    { id: 'r3', q: '¿Qué intereses entraron en conflicto?' },
    { id: 'r4', q: '¿Qué aprendiste sobre el funcionamiento del Congreso?' }
  ];
  const resultado = {
    render(st) {
      const sc = HLL.congress.scenario(st);
      const status = HLL.expediente.statusOf(st);
      let consequences = '';
      if (!sc.dipApproved) consequences = '<p>La cámara de origen rechazó el proyecto. Según el art. 81 de la Constitución, no puede repetirse en las sesiones de este año. La demanda ciudadana no desaparece: puede volver a impulsarse, con otros apoyos o un texto distinto, en el próximo período.</p>';
      else if (sc.status === 'ley') consequences = '<p>El proyecto atravesó ambas cámaras y el Poder Ejecutivo lo promulgó. Ahora es ley: se publica en el Boletín Oficial y la autoridad de aplicación debe implementarlo.' + (sc.noFunding ? ' Como no se definió el financiamiento, su aplicación dependerá de futuras decisiones presupuestarias.' : '') + (sc.finalDec.fed === 'A' ? ' Su implementación se acordará con las provincias en el Consejo Federal de Educación.' : ' Al no prever concertación federal, pueden surgir tensiones con las provincias, que gestionan sus escuelas.') + '</p>';
      else consequences = '<p>El Congreso sancionó el proyecto, pero el Poder Ejecutivo vetó el artículo de supervisión de comunicaciones y promulgó el resto. La parte vetada volvió al Congreso: solo podría imponerse con dos tercios en ambas cámaras (art. 83).</p>';

      return '<section class="screen">' + head(7, 'El resultado', 'Tu expediente final reconstruye lo que hiciste y lo que pasó en cada instancia. No hay un único final correcto: importa entender las consecuencias.', 'Expediente final') +
        '<div class="result-hero status-' + status.key + '"><span class="kicker">Estado final del proyecto</span><strong>' + esc(status.label) + '</strong></div>' +
        '<div class="split wide-left"><div class="paper">' +
          '<h2>Consecuencias institucionales</h2>' + consequences +
          '<h2>Línea de tiempo del procedimiento</h2>' + HLL.expediente.timeline(st) +
          '<h2>Expediente completo</h2>' + HLL.expediente.full(st) +
        '</div>' +
        '<aside class="task" aria-labelledby="t7"><h2 id="t7">Reflexión</h2>' +
          HLL.REFLECTION.map((r) => '<div class="field"><label for="' + r.id + '">' + esc(r.q) + '</label><textarea id="' + r.id + '" data-refl="' + r.id + '" rows="3">' + esc((st.reflection || {})[r.id] || '') + '</textarea></div>').join('') +
          '<p class="small">Se guarda automáticamente en este navegador.</p>' +
          '<div class="row wrap"><button type="button" class="btn primary" id="dl">Descargar resumen</button><button type="button" class="btn ghost" id="print">Imprimir</button></div>' +
          '<h3>Simplificaciones de esta simulación</h3><ul class="small">' + D.simplifications.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>' +
          '<a class="btn secondary" href="#/laboratorio">Ir al Laboratorio de ideas →</a>' +
        '</aside></div></section>';
    },
    bind(root, st) {
      root.querySelectorAll('[data-refl]').forEach((t) => t.addEventListener('input', () => { st.reflection = st.reflection || {}; st.reflection[t.dataset.refl] = t.value; save(); }));
      root.querySelector('#dl').addEventListener('click', HLL.expediente.exportSummary);
      root.querySelector('#print').addEventListener('click', () => window.print());
    }
  };

  /* ================================================================ */
  /* 8 · LABORATORIO DE IDEAS                                           */
  /* ================================================================ */
  const CATS = ['Nuevo personaje', 'Nuevo conflicto público', 'Testimonio', 'Misión', 'Mejora de la experiencia', 'Corrección de información'];
  const laboratorio = {
    render() {
      const list = HLL.store.loadLab();
      return '<section class="screen">' + head(8, 'Laboratorio de ideas', 'Ampliá el universo de <em>Hacemos la ley</em>: proponé personajes, conflictos, testimonios, misiones o mejoras. Las propuestas se guardan solo en este navegador.', 'Expansión') +
        '<p class="note">🔒 Tus aportes <strong>no se publican</strong> ni se comparten con otras personas. Podés descargarlos y entregarlos a tu docente, que los revisará antes de incorporarlos a futuras versiones. No incluyas datos personales reales.</p>' +
        '<div class="split"><form class="task" id="labform" novalidate aria-labelledby="t8"><h2 id="t8">Nueva propuesta</h2>' +
          '<div class="field"><label for="l-cat">Categoría</label><select id="l-cat">' + CATS.map((c) => '<option>' + c + '</option>').join('') + '</select></div>' +
          '<div class="field"><label for="l-title">Título</label><input id="l-title" type="text" maxlength="80" data-min="5"><p class="counter" data-for="l-title"></p></div>' +
          '<div class="field"><label for="l-desc">Descripción o texto del aporte</label><textarea id="l-desc" rows="5" data-min="60"></textarea><p class="counter" data-for="l-desc"></p></div>' +
          '<div class="field"><label for="l-why">¿Qué aporta a la historia y al aprendizaje?</label><textarea id="l-why" rows="3" data-min="30"></textarea><p class="counter" data-for="l-why"></p></div>' +
          '<div class="field"><label for="l-task">¿Qué tendría que hacer quien participe? (opcional)</label><textarea id="l-task" rows="2"></textarea></div>' +
          '<div class="field"><label for="l-author">Grupo o seudónimo (opcional)</label><input id="l-author" type="text" maxlength="40"></div>' +
          '<div class="errors" id="lab-errors" role="alert" tabindex="-1"></div>' +
          '<button type="submit" class="btn primary">Guardar propuesta</button>' +
        '</form>' +
        '<div><h2 class="sub">Vista previa</h2><div id="preview" class="labcard preview" aria-live="polite"></div>' +
          '<h2 class="sub">Propuestas guardadas (' + list.length + ')</h2>' +
          (list.length ? '<ul class="lablist">' + list.map((x, i) => '<li class="labcard"><span class="ptag">' + esc(x.cat) + '</span><h3>' + esc(x.title) + '</h3>' + nl2p(x.desc) + '<p class="small"><strong>Aporte:</strong> ' + esc(x.why) + '</p>' + (x.task ? '<p class="small"><strong>Tarea:</strong> ' + esc(x.task) + '</p>' : '') + '<p class="small muted">' + esc(x.author || 'Sin firma') + ' · ' + new Date(x.date).toLocaleDateString('es-AR') + '</p><button type="button" class="linkbtn" data-ldel="' + i + '">Eliminar</button></li>').join('') + '</ul>' +
            '<div class="row wrap"><button type="button" class="btn secondary" id="lab-dl">Descargar propuestas (.txt)</button><button type="button" class="btn ghost" id="lab-json">Descargar (.json)</button></div>'
            : '<p class="empty">Todavía no guardaste propuestas.</p>') +
        '</div></div></section>';
    },
    bind(root, st, rerender) {
      counters(root);
      const f = (id) => root.querySelector('#' + id);
      const preview = () => {
        const t = f('l-title').value.trim(); const d = f('l-desc').value.trim(); const w = f('l-why').value.trim();
        f('preview').innerHTML = (t || d) ? '<span class="ptag">' + esc(f('l-cat').value) + '</span><h3>' + esc(t || 'Sin título') + '</h3>' + nl2p(d) + (w ? '<p class="small"><strong>Aporte:</strong> ' + esc(w) + '</p>' : '') + '<p class="small muted">' + esc(f('l-author').value || 'Sin firma') + '</p>' : '<p class="muted">Empezá a escribir y vas a ver acá cómo queda tu propuesta.</p>';
      };
      ['l-cat', 'l-title', 'l-desc', 'l-why', 'l-author'].forEach((id) => f(id).addEventListener('input', preview));
      preview();
      f('labform').addEventListener('submit', (e) => {
        e.preventDefault();
        const x = { cat: f('l-cat').value, title: f('l-title').value.trim(), desc: f('l-desc').value.trim(), why: f('l-why').value.trim(), task: f('l-task').value.trim(), author: f('l-author').value.trim(), date: new Date().toISOString() };
        const errs = [];
        if (x.title.length < 5) errs.push('El título debe tener al menos 5 caracteres.');
        if (x.desc.length < 60) errs.push('La descripción debe tener al menos 60 caracteres.');
        if (x.why.length < 30) errs.push('Explicá qué aporta (mínimo 30 caracteres).');
        if (errs.length) { const b = f('lab-errors'); b.innerHTML = '<ul>' + errs.map((m) => '<li>' + esc(m) + '</li>').join('') + '</ul>'; b.focus(); return; }
        const list = HLL.store.loadLab(); list.push(x);
        if (!HLL.store.saveLab(list)) { toast('No se pudo guardar: el navegador bloquea el almacenamiento local.', 'warn'); return; }
        rerender(); toast('Propuesta guardada en este navegador.', 'ok');
      });
      root.querySelectorAll('[data-ldel]').forEach((b) => b.addEventListener('click', () => {
        HLL.ui.confirmBox('¿Eliminar la propuesta?', 'Se borrará de este navegador.', 'Eliminar', () => { const l = HLL.store.loadLab(); l.splice(Number(b.dataset.ldel), 1); HLL.store.saveLab(l); rerender(); });
      }));
      const dl = root.querySelector('#lab-dl');
      if (dl) dl.addEventListener('click', () => {
        const l = HLL.store.loadLab();
        const txt = 'HACEMOS LA LEY — Laboratorio de ideas\nPropuestas para revisión docente (no publicadas)\n\n' + l.map((x, i) => (i + 1) + '. [' + x.cat + '] ' + x.title + '\n' + x.desc + '\nAporte: ' + x.why + (x.task ? '\nTarea: ' + x.task : '') + '\nAutoría: ' + (x.author || 'sin firma') + ' · ' + new Date(x.date).toLocaleDateString('es-AR')).join('\n\n----------\n\n');
        HLL.ui.download('hacemos-la-ley-laboratorio.txt', txt);
      });
      const dj = root.querySelector('#lab-json');
      if (dj) dj.addEventListener('click', () => HLL.ui.download('hacemos-la-ley-laboratorio.json', JSON.stringify(HLL.store.loadLab(), null, 2), 'application/json'));
    }
  };

  HLL.screens = { bienvenida, rol, demanda, investigar, proyecto, congreso, resultado, laboratorio };
})();
