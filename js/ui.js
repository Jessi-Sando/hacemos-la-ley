/* =====================================================================
   Utilidades de interfaz: escape, íconos, modal, aviso, descargas
   ===================================================================== */
(function () {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const nl2p = (s) => esc(s).split(/\n+/).filter(Boolean).map((p) => '<p>' + p + '</p>').join('');

  /* Íconos de rol (SVG en línea, trazo) */
  const ICONS = {
    banca: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 20h32M10 20v18M38 20v18M6 38h36M24 6l16 9H8z"/><path d="M17 26h14v12H17z"/></svg>',
    federal: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="16"/><path d="M8 24h32M24 8c6 5 6 27 0 32M24 8c-6 5-6 27 0 32"/></svg>',
    megafono: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 20v8h6l16 9V11L14 20z M14 28l3 10h5l-2-9"/><path d="M36 18c3 3 3 9 0 12M40 14c5 5 5 15 0 20"/></svg>',
    micro: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="18" y="6" width="12" height="22" rx="6"/><path d="M12 22a12 12 0 0 0 24 0M24 34v8M17 42h14"/></svg>',
    lupa: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="20" cy="20" r="11"/><path d="M28 28l12 12M14 18h12M14 23h8"/></svg>'
  };

  function toast(msg, kind) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + (kind || '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.className = 'toast'; }, 3600);
  }

  let lastFocus = null;
  function modal(title, html, onOpen) {
    const m = document.getElementById('modal');
    lastFocus = document.activeElement;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    m.hidden = false;
    document.body.classList.add('noscroll');
    const first = m.querySelector('.modal-card button, .modal-card a, .modal-card input');
    if (first) first.focus();
    if (onOpen) onOpen(m);
  }
  function closeModal() {
    const m = document.getElementById('modal');
    if (m.hidden) return;
    m.hidden = true;
    document.body.classList.remove('noscroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* Confirmación con botones propios (no usa window.confirm) */
  function confirmBox(title, text, okLabel, onOk) {
    modal(title, '<p>' + esc(text) + '</p><div class="row end"><button type="button" class="btn ghost" data-close="modal">Cancelar</button><button type="button" class="btn danger" id="confirm-ok">' + esc(okLabel) + '</button></div>', (m) => {
      m.querySelector('#confirm-ok').addEventListener('click', () => { closeModal(); onOk(); });
    });
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function badge(real) {
    return real
      ? '<span class="badge real" title="Fuente institucional real (resumen)">Fuente real</span>'
      : '<span class="badge fic" title="Material creado para la simulación">Ficticio</span>';
  }

  HLL.ui = { esc, nl2p, ICONS, toast, modal, closeModal, confirmBox, download, badge };
})();
