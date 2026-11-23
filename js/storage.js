/* =====================================================================
   Estado de la partida y guardado en localStorage
   ===================================================================== */
(function () {
  const KEY = 'hll-partida-v1';
  const LAB_KEY = 'hll-laboratorio-v1'; // el laboratorio sobrevive al reinicio de partida

  function fresh() {
    return {
      v: 1,
      started: false,
      maxStep: 0,          // índice de la pantalla más avanzada habilitada
      role: null,
      demand: { selected: [], question: '' },
      evidence: [],        // [{ id, why }]
      production: {},      // depende del rol
      congress: { stage: 0, s1: {}, s2: {}, s3: {}, s4: {}, s5: {}, s5b: {}, s6: {}, finished: false },
      reflection: {},
      log: []              // registro de decisiones [{ t, msg }]
    };
  }

  let state = fresh();
  let storageOk = true;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1) state = Object.assign(fresh(), parsed);
      }
    } catch (e) {
      storageOk = false;
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      storageOk = false;
      return false;
    }
  }

  function reset() {
    state = fresh();
    try { localStorage.removeItem(KEY); } catch (e) { /* sin acceso */ }
    return state;
  }

  function log(msg) {
    state.log.push({ t: new Date().toISOString(), msg: msg });
    save();
  }

  function loadLab() {
    try { return JSON.parse(localStorage.getItem(LAB_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveLab(list) {
    try { localStorage.setItem(LAB_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  HLL.store = {
    load, save, reset, log, loadLab, saveLab,
    get state() { return state; },
    get ok() { return storageOk; }
  };
})();
