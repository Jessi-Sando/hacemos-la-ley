/* =====================================================================
   Expediente digital: panel lateral, línea de tiempo y exportación
   ===================================================================== */
(function () {
  const D = HLL.DATA;
  const { esc, nl2p } = HLL.ui;

  function srcTitle(id) { const s = D.sources.find((x) => x.id === id); return s ? s.title : id; }
  function feedTitle(id) { const f = D.feed.find((x) => x.id === id); return f ? f.author + ' (' + f.tag + ')' : id; }

  function statusOf(st) {
    const c = st.congress;
    if (!st.role) return { key: 'demanda', label: 'Demanda ciudadana', text: 'El problema circula en redes. Todavía no hay proyecto presentado.' };
    if (c.stage === 0 && !c.finished) return { key: 'borrador', label: 'Proyecto en estudio', text: 'Se prepara el tratamiento del proyecto. Aún no ingresó formalmente.' };
    const sc = HLL.congress.scenario(st);
    if (c.stage <= 3) return { key: 'origen', label: 'En la cámara de origen', text: 'El proyecto está en tratamiento en la Cámara de Diputados.' };
    if (sc.ready && !sc.dipApproved) return { key: 'rechazado', label: 'Rechazado en la cámara de origen', text: 'No puede repetirse en las sesiones de este año (art. 81).' };
    if (c.stage === 4) return { key: 'revisora', label: 'Media sanción · en el Senado', text: 'Aprobado por Diputados, en revisión en el Senado.' };
    if (c.stage === 5) return { key: 'sancionado', label: 'Sancionado · en el Poder Ejecutivo', text: 'El Congreso lo sancionó. Falta la intervención del Poder Ejecutivo.' };
    if (sc.status === 'ley') return { key: 'ley', label: 'Ley promulgada', text: 'El Poder Ejecutivo promulgó la ley.' };
    return { key: 'parcial', label: 'Ley con veto parcial', text: 'Se promulgó el texto salvo el artículo observado, que volvió al Congreso.' };
  }

  function timeline(st) {
    const c = st.congress;
    const sc = HLL.congress.scenario(st);
    const items = [['Demanda ciudadana', 'La campaña juvenil visibiliza el problema.', true]];
    HLL.congress.STAGES.forEach((s, i) => {
      let done = c.stage > i || c.finished && i <= c.stage;
      let note = s.ref;
      if (sc.ready && !sc.dipApproved && i > 3) { done = false; note = 'No se realiza: el proyecto fue rechazado.'; }
      items.push([s.title, note, done]);
    });
    return '<ol class="timeline">' + items.map((it) => '<li class="' + (it[2] ? 'done' : '') + '"><strong>' + esc(it[0]) + '</strong><span>' + esc(it[1]) + '</span></li>').join('') + '</ol>';
  }

  /* Producción del estudiante según rol */
  function productionHtml(st) {
    const p = st.production || {};
    const r = st.role;
    if (!r) return '<p class="muted">Todavía no elegiste un rol.</p>';
    if (r === 'diputado' || r === 'senador') {
      if (!(p.mods || []).length) return '<p class="muted">Sin propuestas de modificación todavía.</p>';
      return '<ul class="prodlist">' + p.mods.map((m) => '<li><strong>' + (m.target === 'nuevo' ? 'Artículo nuevo: ' + esc(m.title || '') : 'Modifica el artículo ' + esc(m.target)) + '</strong><p>' + esc(m.text) + '</p><p class="small"><em>Fundamento:</em> ' + esc(m.why) + '</p></li>').join('') + '</ul>';
    }
    if (r === 'organizacion') {
      if (!(p.demands || []).length) return '<p class="muted">Sin documento de demandas todavía.</p>';
      return (p.intro ? nl2p(p.intro) : '') + '<ol class="prodlist">' + p.demands.map((d) => '<li><strong>' + (d.art ? 'Sobre el artículo ' + esc(d.art) : 'Recomendación general') + ':</strong> ' + esc(d.text) + '</li>').join('') + '</ol>' +
        ((p.testimonies || []).length ? '<p class="small">Testimonios que respaldan el documento: ' + p.testimonies.map(feedTitleOrSrc).map(esc).join('; ') + '</p>' : '');
    }
    if (r === 'periodista') {
      if (!p.headline) return '<p class="muted">Sin cobertura todavía.</p>';
      return '<div class="newsprint"><p class="kicker">El Eco Federal · medio ficticio</p><h4>' + esc(p.headline) + '</h4><p class="lead">' + esc(p.lead) + '</p>' + nl2p(p.body) +
        '<p class="small">Fuentes citadas: ' + (p.sources || []).map(feedTitleOrSrc).map(esc).join('; ') + '</p></div>';
    }
    if (r === 'asesor') {
      if (!(p.obs || []).length) return '<p class="muted">Sin informe técnico todavía.</p>';
      return '<table class="mini"><thead><tr><th>Art.</th><th>Tipo</th><th>Observación</th><th>Recomendación</th></tr></thead><tbody>' +
        p.obs.map((o) => '<tr><td>' + esc(o.art) + '</td><td>' + esc(o.cat) + '</td><td>' + esc(o.text) + '</td><td>' + esc(o.rec) + '</td></tr>').join('') + '</tbody></table>' +
        '<p><strong>Viabilidad:</strong> ' + esc(p.viability || '—') + '</p>' + (p.conclusion ? nl2p(p.conclusion) : '');
    }
    return '';
  }
  function feedTitleOrSrc(id) { return D.feed.find((f) => f.id === id) ? feedTitle(id) : srcTitle(id); }

  function congressTexts(st) {
    const c = st.congress; const out = [];
    const lbl = { s2: 'Comisión de Diputados', s4: 'Debate en Diputados', s5: 'Senado', s5b: 'Vuelta a Diputados', s6: 'Cierre' };
    Object.keys(lbl).forEach((k) => { if (c[k] && c[k].text) out.push('<li><strong>' + lbl[k] + ':</strong> ' + esc(c[k].text) + '</li>'); });
    return out.length ? '<ul class="prodlist">' + out.join('') + '</ul>' : '<p class="muted">Sin intervenciones registradas.</p>';
  }

  /* Contenido completo (para panel, resultado y descarga) */
  function full(st, opts) {
    opts = opts || {};
    const R = st.role ? D.roles[st.role] : null;
    const sc = HLL.congress.scenario(st);
    const status = statusOf(st);
    const h = opts.h || 'h3';
    let html = '';
    html += '<div class="status status-' + status.key + '"><span>Estado</span><strong>' + esc(status.label) + '</strong><small>' + esc(status.text) + '</small></div>';
    html += '<p class="docline"><span class="badge fic">Ficticio</span> ' + esc(D.bill.expediente) + ' · ' + esc(D.bill.title) + '</p>';

    html += '<' + h + '>Rol</' + h + '>' + (R ? '<p><strong>' + esc(R.name) + '</strong> — ' + esc(R.mission) + ' Producto: ' + esc(R.product) + '.</p>' : '<p class="muted">Sin rol.</p>');

    html += '<' + h + '>Demanda: problemas priorizados</' + h + '>';
    html += st.demand.selected.length ? '<ul>' + st.demand.selected.map((id) => '<li>' + esc((D.problems.find((p) => p.id === id) || {}).label) + '</li>').join('') + '</ul>' : '<p class="muted">Sin selección.</p>';
    if (st.demand.question) html += '<p><em>Pregunta para investigar:</em> ' + esc(st.demand.question) + '</p>';

    html += '<' + h + '>Ficha de investigación</' + h + '>';
    html += st.evidence.length ? '<ol>' + st.evidence.map((e) => '<li><strong>' + esc(srcTitle(e.id)) + '</strong>' + ((D.sources.find((s) => s.id === e.id) || {}).real ? ' (fuente real)' : ' (ficticio)') + '<br>' + esc(e.why) + '</li>').join('') + '</ol>' : '<p class="muted">Sin evidencias seleccionadas.</p>';

    html += '<' + h + '>' + (R ? esc(R.product) : 'Producción') + '</' + h + '>' + productionHtml(st);
    if (st.role && !['diputado', 'senador'].includes(st.role)) html += '<p class="small">Este aporte figura como <strong>aporte vinculado</strong> al expediente: no modifica el articulado por sí mismo.</p>';

    html += '<' + h + '>Proyecto inicial</' + h + '>' + HLL.congress.articlesHtml(D.bill.articles.map((a) => ({ n: a.n, title: a.title, text: a.text, orig: a.n })));

    if (sc.ready && st.congress.stage > 2) {
      html += '<' + h + '>Texto con dictamen de mayoría' + (sc.dipApproved ? ' / media sanción' : '') + '</' + h + '>' + HLL.congress.articlesHtml(sc.v1, true);
    }
    if (sc.ready && sc.dipApproved && st.congress.s5.locked && sc.senChanged) {
      html += '<' + h + '>Texto modificado por el Senado</' + h + '>' + HLL.congress.articlesHtml(sc.v2, true);
    }
    if (st.congress.stage > 3 && sc.ready) {
      html += '<' + h + '>Votaciones</' + h + '><ul>';
      html += '<li>Diputados: ' + sc.dipVote.af + ' afirmativos, ' + sc.dipVote.ne + ' negativos, ' + sc.dipVote.ab + ' abstenciones → ' + (sc.dipApproved ? 'aprobado' : 'rechazado') + '.' + (st.role === 'diputado' ? ' Tu voto: ' + esc(st.congress.s4.vote) + '.' : '') + '</li>';
      if (sc.dipApproved && st.congress.s5.locked) html += '<li>Senado: ' + sc.senVote.af + ' afirmativos, ' + sc.senVote.ne + ' negativos, ' + sc.senVote.ab + ' abstenciones → ' + (sc.senChanged ? 'aprobado con modificaciones' : 'aprobado sin cambios') + '.' + (st.role === 'senador' ? ' Tu voto: ' + esc(st.congress.s5.vote) + '.' : '') + '</li>';
      if (sc.returnVote && st.congress.stage > 4) html += '<li>Vuelta a Diputados (' + (sc.returnChoice === 'insistir' ? 'insistencia' : 'aceptación') + '): ' + sc.returnVote.af + ' afirmativos, ' + sc.returnVote.ne + ' negativos.</li>';
      html += '</ul><p class="small">Votos ficticios programados según escenarios coherentes con el procedimiento.</p>';
    }
    html += '<' + h + '>Intervenciones durante el tratamiento</' + h + '>' + congressTexts(st);
    html += '<' + h + '>Registro de decisiones</' + h + '>' + (st.log.length ? '<ol class="log">' + st.log.map((l) => '<li><time>' + new Date(l.t).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) + '</time> ' + esc(l.msg) + '</li>').join('') + '</ol>' : '<p class="muted">Sin registros.</p>');
    return html;
  }

  /* Panel lateral */
  let lastFocus = null;
  function open() {
    const d = document.getElementById('drawer');
    lastFocus = document.activeElement;
    document.getElementById('drawer-body').innerHTML = full(HLL.store.state) + '<div class="row"><button type="button" class="btn primary" id="drawer-dl">Descargar resumen</button></div>';
    d.setAttribute('aria-hidden', 'false');
    d.classList.add('open');
    document.body.classList.add('noscroll');
    setTimeout(() => d.querySelector('.iconbtn').focus(), 60);
    d.querySelector('#drawer-dl').addEventListener('click', exportSummary);
  }
  function close() {
    const d = document.getElementById('drawer');
    if (!d.classList.contains('open')) return;
    d.classList.remove('open');
    d.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('noscroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* Descarga: documento HTML autónomo, imprimible */
  function exportSummary() {
    const st = HLL.store.state;
    const refl = st.reflection || {};
    const qs = HLL.REFLECTION || [];
    const body = full(st, { h: 'h2' }) + '<h2>Línea de tiempo</h2>' + timeline(st) +
      '<h2>Reflexión</h2>' + qs.map((q) => '<h3>' + esc(q.q) + '</h3>' + (refl[q.id] ? nl2p(refl[q.id]) : '<p class="muted">Sin respuesta.</p>')).join('');
    const css = 'body{font-family:Arial,Helvetica,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;color:#263443;line-height:1.5}h1{color:#142D4E}h2{color:#27649A;border-bottom:2px solid #D6A84B;padding-bottom:.2rem;margin-top:1.8rem}.badge{background:#fff3d6;border:1px solid #D6A84B;border-radius:4px;padding:0 .3rem;font-size:.8rem}.muted,.small{color:#5a6877;font-size:.9rem}.status{background:#EAF3FA;padding:.8rem 1rem;border-left:5px solid #27649A}.status span{display:block;font-size:.8rem;text-transform:uppercase}.status small{display:block}.tag{font-size:.75rem;background:#EAF3FA;border-radius:4px;padding:0 .3rem;margin-left:.3rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd;padding:.3rem;vertical-align:top;font-size:.9rem}.timeline li.done strong::after{content:" ✓"}.timeline span{display:block;color:#5a6877;font-size:.9rem}';
    const html = '<!DOCTYPE html><html lang="es-AR"><head><meta charset="utf-8"><title>Hacemos la ley — Resumen de la experiencia</title><style>' + css + '</style></head><body>' +
      '<p><strong>SIMULACIÓN EDUCATIVA.</strong> Personajes, testimonios, noticias, votos y proyecto de ley son ficticios.</p>' +
      '<h1>Hacemos la ley — Resumen de mi experiencia</h1><p>Generado el ' + new Date().toLocaleString('es-AR') + '</p>' + body + '</body></html>';
    HLL.ui.download('hacemos-la-ley-resumen.html', html, 'text/html;charset=utf-8');
    HLL.ui.toast('Resumen descargado. Podés abrirlo en el navegador e imprimirlo como PDF.', 'ok');
  }

  HLL.expediente = { open, close, full, timeline, statusOf, productionHtml, exportSummary };
})();
