/* Termoelectra — envío de contacto por WhatsApp con degradación segura.
   Motivo: window.open() en solitario se pierde en silencio si el navegador
   bloquea la ventana emergente; aquí se detecta y se navega en la misma pestaña. */
(() => {
  'use strict';
  const WA = '34651097393';

  function initContactForm(opts) {
    const form = document.getElementById(opts.form);
    if (!form) return;
    const nameEl = document.getElementById(opts.name);
    const phoneEl = document.getElementById(opts.phone);
    const consentEl = document.getElementById(opts.form + 'Consent');
    const statusEl = document.getElementById(opts.form + 'Status');
    if (!nameEl || !phoneEl) return;

    const say = (msg, kind) => {
      if (!statusEl) { if (kind === 'error') alert(msg); return; }
      statusEl.textContent = msg;
      statusEl.className = 'te-form-status is-' + kind;
    };

    if (consentEl) {
      consentEl.addEventListener('change', () => {
        if (consentEl.checked) consentEl.closest('.te-consent')?.classList.remove('is-missing');
      });
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();

      if (!name || !phone) { say('Indica tu nombre y tu teléfono para poder responderte.', 'error'); return; }
      if (phone.replace(/\D/g, '').length < 9) { say('Revisa el teléfono: parece incompleto.', 'error'); return; }
      if (consentEl && !consentEl.checked) {
        say('Necesitamos que aceptes la política de privacidad para poder contactarte.', 'error');
        const row = consentEl.closest('.te-consent');
        if (row) {
          row.classList.remove('is-missing');
          void row.offsetWidth;            // reinicia la animación de aviso
          row.classList.add('is-missing');
        }
        consentEl.focus({ preventScroll: false });
        return;
      }

      const message = 'Hola Termoelectra, quiero solicitar información' + (opts.ctx || '') +
        '.\n\nNombre: ' + name + '\nTeléfono: ' + phone;
      const url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message);

      let win = null;
      try { win = window.open(url, '_blank', 'noopener'); } catch (e) { win = null; }

      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Ventana emergente bloqueada: no se pierde el contacto, se navega aquí.
        say('Abriendo WhatsApp…', 'ok');
        window.location.href = url;
        return;
      }
      say('Listo. Hemos abierto WhatsApp con tu mensaje. Si no se abrió, llámanos al 651 09 73 93.', 'ok');
      form.reset();
    });
  }

  window.TEContact = { init: initContactForm };
})();
