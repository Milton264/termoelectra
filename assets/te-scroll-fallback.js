/* Termoelectra — respaldo de efectos de scroll.

   El sitio anima con `animation-timeline: view()`, que solo existe en Chrome y Edge.
   En Safari y Firefox no se ejecutaba ni uno de los efectos. Aquí se reproducen los
   mismos fotogramas clave con IntersectionObserver, que sí funciona en todos.

   En navegadores con soporte nativo este archivo sale sin hacer nada.

   Principio de diseño: el contenido NUNCA puede quedar invisible. El estado inicial
   (opacity:0) lo aplica este script, no la hoja de estilos, y hay dos redes de
   seguridad: repaso en cada scroll de lo que ya quedó por encima de la pantalla,
   y un plazo máximo tras el cual todo se muestra sí o sí. */
(() => {
  'use strict';

  const nativo = window.CSS && CSS.supports && CSS.supports('animation-timeline', 'view()');
  if (nativo || !('IntersectionObserver' in window)) return;

  const html = document.documentElement;
  const reducido = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.add('te-io');
  if (reducido) return;

  const SEL = '.reveal, .te-stagger > *, .te-zoom, .te-open, .te-dim, .te-words .te-w > span';

  const arranca = () => {
    document.querySelectorAll('.te-stagger').forEach(g => {
      Array.prototype.forEach.call(g.children, (el, i) => {
        if (!el.style.getPropertyValue('--te-i')) el.style.setProperty('--te-i', i);
      });
    });
    document.querySelectorAll('.te-words').forEach(g => {
      g.querySelectorAll('.te-w > span').forEach((el, i) => {
        if (!el.style.getPropertyValue('--te-w')) el.style.setProperty('--te-w', i);
      });
    });

    const todos = Array.prototype.slice.call(document.querySelectorAll(SEL));
    const pendientes = new Set(todos);

    const mostrar = el => {
      if (!pendientes.has(el)) return;
      pendientes.delete(el);
      el.classList.remove('te-io-prep');
      el.classList.add('te-io-in');
      io.unobserve(el);
    };

    const io = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) mostrar(e.target); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    todos.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) {
        pendientes.delete(el);
        el.classList.add('te-io-in');
      } else {
        el.classList.add('te-io-prep');
        io.observe(el);
      }
    });

    let esperando = false;
    const repasar = () => {
      if (esperando) return;
      esperando = true;
      requestAnimationFrame(() => {
        esperando = false;
        if (!pendientes.size) { window.removeEventListener('scroll', repasar); return; }
        Array.from(pendientes).forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > -200) mostrar(el);
        });
      });
    };
    window.addEventListener('scroll', repasar, { passive: true });
    window.addEventListener('resize', repasar, { passive: true });

    setTimeout(() => {
      Array.from(pendientes).forEach(el => {
        el.classList.remove('te-io-prep');
        el.classList.add('te-io-in');
      });
      pendientes.clear();
    }, 8000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arranca);
  } else {
    arranca();
  }
})();
