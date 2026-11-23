/* =====================================================================
   Congreso Virtual: navegación, progreso, menús y arranque
   ===================================================================== */
(function () {
  const D = HLL.DATA;
  const { esc, modal, closeModal, confirmBox, toast } = HLL.ui;
  const st = () => HLL.store.state;
  const idx = (id) => D.steps.findIndex((s) => s.id === id);

  function unlock(id) {
    const i = idx(id);
    if (i > st().maxStep) { st().maxStep = i; }
    HLL.store.save();
    renderProgress(currentId());
  }

  function allowed(id) {
    const s = st(); const i = idx(id);
    if (i < 0) return false;
    if (id === 'bienvenida' || id === 'laboratorio') return true;
    if (i > 2 && !s.role) return false;
    if (id === 'resultado' && !s.congress.finished) return false;
    return i <= s.maxStep;
  }

  function currentId() {
    const m = location.hash.match(/^#\/([a-z]+)/);
    return m ? m[1] : 'bienvenida';
  }

  function renderProgress(cur) {
    const s = st();
    const nav = document.getElementById('progress');
    nav.innerHTML = '<ol>' + D.steps.map((step) => {
      const ok = allowed(step.id);
      const doneCls = idx(step.id) < s.maxStep ? ' done' : '';
      const inner = '<span class="pn">' + step.n + '</span><span class="pl">' + esc(step.label) + '</span>';
      return '<li class="' + (step.id === cur ? 'cur' : '') + doneCls + (ok ? '' : ' locked') + '">' +
        (ok ? '<a href="#/' + step.id + '"' + (step.id === cur ? ' aria-current="page"' : '') + '>' + inner + '</a>'
            : '<span aria-disabled="true" title="Se habilita al completar la pantalla anterior">' + inner + '<span class="sr"> (bloqueada)</span></span>') + '</li>';
    }).join('') + '</ol>';
    nav.hidden = cur === 'bienvenida';

    const chip = document.getElementById('rolechip');
    const R = s.role ? D.roles[s.role] : null;
    if (R && cur !== 'bienvenida') {
      chip.hidden = false;
      chip.style.setProperty('--rc', R.color);
      chip.innerHTML = '<span class="rc-icon">' + HLL.ui.ICONS[R.icon] + '</span><span>Tu rol: <strong>' + esc(R.name) + '</strong> · Misión: ' + esc(R.mission) + '</span>';
    } else chip.hidden = true;
    document.getElementById('btn-expediente').hidden = !s.role;
  }

  function route() {
    let id = currentId();
    if (!HLL.screens[id]) id = 'bienvenida';
    if (!allowed(id)) {
      const s = st();
      const target = (idx(id) > 2 && !s.role) ? 'rol' : D.steps[Math.min(s.maxStep, idx(id))].id;
      toast(id === 'resultado' ? 'El resultado se habilita al terminar el recorrido en el Congreso.' : 'Esa pantalla se habilita al completar las anteriores.', 'warn');
      location.replace('#/' + (allowed(target) ? target : 'bienvenida'));
      return;
    }
    HLL.expediente.close();
    closeModal();
    document.body.dataset.screen = id;
    draw(id, true);
  }

  function draw(id, focus) {
    const main = document.getElementById('main');
    const scr = HLL.screens[id];
    const y = window.scrollY;
    main.innerHTML = scr.render(st());
    const rerender = () => draw(id, false);
    scr.bind(main, st(), rerender);
    renderProgress(id);
    if (focus) {
      window.scrollTo(0, 0);
      const h = main.querySelector('h1');
      if (h) h.focus({ preventScroll: true });
      document.title = (D.steps[idx(id)].label) + ' · Hacemos la ley';
    } else window.scrollTo(0, y);
  }

  /* ---------------- Menús informativos ---------------- */
  function como() {
    modal('Cómo funciona', '<p><strong>Hacemos la ley</strong> no es una web para memorizar cómo se sancionan las leyes: es una experiencia para comprender el proceso democrático participando en una simulación de sus conflictos, actores, procedimientos y decisiones.</p>' +
      '<ol class="howto"><li><strong>Elegís un rol</strong> (diputado/a, senador/a, organización social, periodista o asesor/a). Cada uno ve información distinta y tiene su propia misión.</li>' +
      '<li><strong>Explorás distintos medios</strong>: la red social ficticia Ágora, el dossier de investigación, el podcast <em>Voces del debate</em> (por ahora, en transcripciones) y el expediente digital.</li>' +
      '<li><strong>Producís</strong>: un mapa de problemas, una ficha de investigación y el producto de tu rol.</li>' +
      '<li><strong>Seguís el proyecto por el Congreso</strong>: comisión, dictamen, cámara de origen, cámara revisora y Poder Ejecutivo. Tus decisiones cambian el escenario.</li>' +
      '<li><strong>Reflexionás</strong> con tu expediente final y proponés ideas en el Laboratorio.</li></ol>' +
      '<h3>Reglas de la simulación</h3><ul><li>El caso, los personajes, las publicaciones, los votos y el proyecto son <strong>ficticios</strong>. Las fuentes marcadas como «Fuente real» resumen normas vigentes: verificá siempre el texto oficial.</li>' +
      '<li>Tu avance se guarda en este navegador (no en un servidor). Podés reiniciar cuando quieras.</li>' +
      '<li>No hay otros usuarios conectados: los demás actores son personajes programados. La deliberación entre compañeros sucede en el aula.</li></ul>' +
      '<h3>Simplificaciones didácticas</h3><ul class="small">' + D.simplifications.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>' +
      '<div class="row end"><button type="button" class="btn primary" data-close="modal">Entendido</button></div>');
  }
  function glosario() {
    modal('Glosario legislativo', '<dl class="glossary">' + D.glossary.map((g) => '<dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd>').join('') + '</dl><p class="small">Referencia: Constitución Nacional, arts. 39, 64 y 77 a 84.</p>');
  }
  function creditos() {
    modal('Créditos', '<p><strong>Hacemos la ley.</strong> Una experiencia educativa transmedia para comprender y participar en el proceso de formación de las leyes.</p>' +
      '<p>Trabajo final de la materia Materiales Educativos Transmedia (maestría en educación). Maqueta funcional — versión 0.1.</p>' +
      '<p><strong>Integrantes:</strong> [completar] · <strong>Institución:</strong> [completar]</p>' +
      '<h3>Marco teórico</h3><p class="small">Scolari, Lugo Rodríguez y Masanet (2019); Milillo, Rogovsky y Trech (2019); Odetti (2016); Real Torres (2019); Derrico (2019); Rivero y Rabajoli (2016).</p>' +
      '<h3>Fuentes normativas</h3><p class="small">Constitución de la Nación Argentina, arts. 39 y 77–84; leyes 24.156, 25.326, 26.061, 26.206, 26.892 y 27.590. Consultá los textos oficiales en <a href="https://www.argentina.gob.ar/normativa" target="_blank" rel="noopener">argentina.gob.ar/normativa ↗</a>, <a href="https://www.hcdn.gob.ar/" target="_blank" rel="noopener">hcdn.gob.ar ↗</a> y <a href="https://www.senado.gob.ar/" target="_blank" rel="noopener">senado.gob.ar ↗</a>.</p>' +
      '<h3>Desarrollos futuros</h3><ul class="small"><li>Audios reales del podcast (la estructura ya está preparada).</li><li>Partidas grupales con roles complementarios y sesión compartida (requiere un servidor).</li><li>Archivo de experiencias de distintas partidas con moderación docente.</li><li>Panel docente para asignar roles y revisar producciones.</li></ul>');
  }
  function reiniciar() {
    confirmBox('¿Reiniciar la partida?', 'Se borrarán tu rol, tus evidencias, tus producciones y el avance en el Congreso. Las propuestas del Laboratorio se conservan. Si querés guardar lo hecho, descargá antes el resumen desde el Expediente.', 'Reiniciar', () => {
      HLL.store.reset();
      location.hash = '#/bienvenida';
      route();
      toast('Partida reiniciada.', 'ok');
    });
  }

  /* ---------------- Eventos globales ---------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (a) {
      const act = a.dataset.action;
      if (act === 'expediente') HLL.expediente.open();
      if (act === 'como') como();
      if (act === 'glosario') glosario();
      if (act === 'creditos') creditos();
      if (act === 'reiniciar') reiniciar();
      return;
    }
    const c = e.target.closest('[data-close]');
    if (c) { if (c.dataset.close === 'modal') closeModal(); else HLL.expediente.close(); return; }
    if (e.target.id === 'modal') closeModal();
    if (e.target.id === 'drawer') HLL.expediente.close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); HLL.expediente.close(); }
    // Mantener el foco dentro de modal/panel abiertos
    if (e.key === 'Tab') {
      const m = document.getElementById('modal');
      const d = document.getElementById('drawer');
      const box = !m.hidden ? m.querySelector('.modal-card') : d.classList.contains('open') ? d.querySelector('.drawer-inner') : null;
      if (!box) return;
      const f = box.querySelectorAll('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('hashchange', route);

  HLL.app = { unlock, route };

  HLL.store.load();
  if (!HLL.store.ok) toast('Este navegador no permite guardar el avance: si cerrás la página, se perderá.', 'warn');
  route();
})();
