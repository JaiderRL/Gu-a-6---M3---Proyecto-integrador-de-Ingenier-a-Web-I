/* ==========================================================================
   Lumen · Biblioteca Virtual Comunitaria
   Interacciones de la interfaz (JavaScript sin librerías)
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Acceso seguro a localStorage (puede estar bloqueado en modo privado)
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  const normalizar = (txt) => txt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const params = new URLSearchParams(window.location.search);

  /* ---------- 1. Menú de navegación móvil ---------- */
  const navToggle = $('.nav-toggle');
  const nav = $('#menu-principal');

  function cerrarMenu() {
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    nav.classList.remove('is-open');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const abierto = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!abierto));
      navToggle.setAttribute('aria-label', abierto ? 'Abrir menú' : 'Cerrar menú');
      nav.classList.toggle('is-open', !abierto);
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', cerrarMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });
    window.matchMedia('(min-width: 64em)').addEventListener('change', cerrarMenu);
  }

  /* ---------- 2. Tema claro / oscuro ---------- */
  const themeBtn = $('.theme-toggle');
  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    if (themeBtn) {
      themeBtn.textContent = tema === 'dark' ? '☀' : '☾';
      themeBtn.setAttribute('aria-label', tema === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro');
    }
  }
  aplicarTema(store.get('lumen-tema', 'light'));
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const nuevo = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      aplicarTema(nuevo);
      store.set('lumen-tema', nuevo);
    });
  }

  /* ---------- 3. Botón "volver arriba" ---------- */
  const backTop = $('.back-to-top');
  if (backTop) {
    const revisarScroll = () => backTop.classList.toggle('is-visible', window.scrollY > 600);
    window.addEventListener('scroll', revisarScroll, { passive: true });
    revisarScroll();
  }

  /* ---------- 4. Animación de aparición y contadores ---------- */
  function animarContador(el) {
    const meta = Number(el.dataset.count);
    const inicio = performance.now();
    const duracion = 1200;
    const paso = (t) => {
      const p = Math.min((t - inicio) / duracion, 1);
      el.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3))).toLocaleString('es-CO');
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  const revelables = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        $$('[data-count]', en.target).forEach(animarContador);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    revelables.forEach((el) => io.observe(el));
  } else {
    revelables.forEach((el) => el.classList.add('is-visible'));
  }

  $$('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- 5. Ventanas modales (<dialog>) ---------- */
  function abrirModal(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function cerrarModal(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  $$('dialog').forEach((d) => {
    $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => cerrarModal(d)));
    // Cerrar al hacer clic fuera del contenido
    d.addEventListener('click', (e) => { if (e.target === d) cerrarModal(d); });
  });

  /* ---------- 6. Catálogo: búsqueda, filtros, orden y detalle ---------- */
  const listaLibros = $('#lista-libros');
  if (listaLibros) {
    const libros = $$('.book-card', listaLibros);
    const inputTexto = $('#filtro-texto');
    const selDisp = $('#filtro-disponibilidad');
    const selOrden = $('#filtro-orden');
    const chips = $$('.chip[data-category]');
    const info = $('#resultados');
    const vacio = $('#sin-resultados');
    let categoria = 'todas';

    function filtrar() {
      const q = normalizar(inputTexto.value.trim());
      const disp = selDisp.value;
      let visibles = 0;

      libros.forEach((card) => {
        const texto = normalizar(card.dataset.title + ' ' + card.dataset.author);
        const ok = (!q || texto.includes(q)) &&
          (categoria === 'todas' || card.dataset.category === categoria) &&
          (disp === 'todos' || card.dataset.available === disp);
        card.hidden = !ok;
        if (ok) visibles++;
      });

      // Ordenar las tarjetas en el DOM
      const orden = selOrden.value;
      const ordenadas = [...libros].sort((a, b) => {
        if (orden === 'author') return a.dataset.author.localeCompare(b.dataset.author, 'es');
        if (orden === 'year-desc') return b.dataset.year - a.dataset.year;
        if (orden === 'year-asc') return a.dataset.year - b.dataset.year;
        return a.dataset.title.localeCompare(b.dataset.title, 'es');
      });
      ordenadas.forEach((c) => listaLibros.appendChild(c));

      info.textContent = visibles === 1 ? 'Mostrando 1 libro' : `Mostrando ${visibles} libros`;
      vacio.hidden = visibles !== 0;
    }

    chips.forEach((chip) => chip.addEventListener('click', () => {
      categoria = chip.dataset.category;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      filtrar();
    }));
    inputTexto.addEventListener('input', filtrar);
    selDisp.addEventListener('change', filtrar);
    selOrden.addEventListener('change', filtrar);
    $('#filtros').addEventListener('submit', (e) => e.preventDefault());
    $('#limpiar-filtros').addEventListener('click', () => {
      inputTexto.value = '';
      selDisp.value = 'todos';
      categoria = 'todas';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.category === 'todas')));
      filtrar();
      inputTexto.focus();
    });

    // Parámetros recibidos desde la página de inicio (?q= y ?categoria=)
    if (params.get('q')) inputTexto.value = params.get('q');
    const catParam = params.get('categoria');
    if (catParam && chips.some((c) => c.dataset.category === catParam)) {
      categoria = catParam;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.category === catParam)));
    }
    filtrar();

    // Detalle del libro en ventana modal
    const modal = $('#modal-libro');
    const nombresCat = { literatura: 'Literatura', ciencia: 'Ciencia', historia: 'Historia', tecnologia: 'Tecnología', infantil: 'Infantil' };
    $$('.js-detail', listaLibros).forEach((btn) => btn.addEventListener('click', () => {
      const d = btn.closest('.book-card').dataset;
      const disponible = d.available === 'true';
      $('#modal-portada').src = d.cover;
      $('#modal-portada').alt = 'Portada de ' + d.title;
      $('#modal-titulo').textContent = d.title;
      $('#modal-descripcion').textContent = d.description;
      $('#modal-autor').textContent = d.author;
      $('#modal-categoria').textContent = nombresCat[d.category];
      $('#modal-anio').textContent = d.year;
      $('#modal-paginas').textContent = d.pages;
      const estado = $('#modal-estado');
      estado.textContent = disponible ? 'Disponible' : 'Prestado';
      estado.className = 'badge ' + (disponible ? 'badge--ok' : 'badge--wait');
      const reservar = $('#modal-reservar');
      reservar.hidden = !disponible;
      reservar.href = 'reservas.html?libro=' + encodeURIComponent(d.title);
      abrirModal(modal);
    }));

    // "Avisarme" para libros prestados (se recuerda en el navegador)
    const avisos = store.get('lumen-avisos', []);
    $$('.js-notify', listaLibros).forEach((btn) => {
      const titulo = btn.closest('.book-card').dataset.title;
      const pintar = () => {
        const activo = avisos.includes(titulo);
        btn.setAttribute('aria-pressed', String(activo));
        btn.textContent = activo ? 'Te avisaremos ✓' : 'Avisarme';
      };
      pintar();
      btn.addEventListener('click', () => {
        const i = avisos.indexOf(titulo);
        if (i >= 0) avisos.splice(i, 1); else avisos.push(titulo);
        store.set('lumen-avisos', avisos);
        pintar();
      });
    });
  }

  /* ---------- 7. Eventos: filtro por público y agenda personal ---------- */
  const listaEventos = $('#lista-eventos');
  if (listaEventos) {
    const eventos = $$('.event-card', listaEventos);
    const chips = $$('.chip[data-audience]');
    const info = $('#agenda-info');
    const agenda = store.get('lumen-agenda', []);

    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      eventos.forEach((ev) => {
        ev.hidden = chip.dataset.audience !== 'todos' && ev.dataset.audience !== chip.dataset.audience;
      });
    }));

    function pintarAgenda() {
      eventos.forEach((ev) => {
        const guardado = agenda.includes(ev.dataset.id);
        const btn = $('.js-save-event', ev);
        ev.classList.toggle('is-saved', guardado);
        btn.setAttribute('aria-pressed', String(guardado));
        btn.textContent = guardado ? 'Guardado ✓ (quitar)' : 'Guardar en mi agenda';
      });
      const n = agenda.length;
      info.textContent = `Tienes ${n} evento${n === 1 ? '' : 's'} guardado${n === 1 ? '' : 's'} en tu agenda.`;
    }

    eventos.forEach((ev) => $('.js-save-event', ev).addEventListener('click', () => {
      const i = agenda.indexOf(ev.dataset.id);
      if (i >= 0) agenda.splice(i, 1); else agenda.push(ev.dataset.id);
      store.set('lumen-agenda', agenda);
      pintarAgenda();
    }));
    pintarAgenda();
  }

  /* ---------- 8. Galería con visor (lightbox) ---------- */
  const lightbox = $('#lightbox');
  if (lightbox) {
    const items = $$('.gallery__item');
    const img = $('#lightbox-img');
    const cap = $('#lightbox-caption');
    let actual = 0;

    const mostrar = (i) => {
      actual = (i + items.length) % items.length;
      const it = items[actual];
      img.src = it.dataset.src;
      img.alt = it.dataset.caption;
      cap.textContent = `${it.dataset.caption} (${actual + 1} de ${items.length})`;
    };

    items.forEach((it, i) => it.addEventListener('click', () => { mostrar(i); abrirModal(lightbox); }));
    $('#lightbox-prev').addEventListener('click', () => mostrar(actual - 1));
    $('#lightbox-next').addEventListener('click', () => mostrar(actual + 1));
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') mostrar(actual - 1);
      if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
  }

  /* ---------- 9. Formulario de reserva con validación ---------- */
  const form = $('#form-reserva');
  if (form) {
    const fecha = $('#fecha');
    const libro = $('#libro');
    const comentario = $('#comentario');
    const contador = $('#contador');
    const alerta = $('#reserva-ok');

    // Fecha mínima: hoy; máxima: 30 días
    const hoy = new Date();
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    fecha.min = iso(hoy);
    fecha.max = iso(new Date(hoy.getTime() + 30 * 86400000));

    // Libro preseleccionado desde el catálogo (?libro=)
    const libroParam = params.get('libro');
    if (libroParam && $$('option', libro).some((o) => o.value === libroParam)) libro.value = libroParam;

    comentario.addEventListener('input', () => { contador.textContent = comentario.value.length; });

    const mensajes = {
      nombre: 'Escribe tu nombre completo (mínimo 3 letras).',
      documento: 'El documento debe tener entre 6 y 10 números.',
      telefono: 'Ingresa un celular colombiano de 10 dígitos que empiece por 3.',
      correo: 'Ingresa un correo válido, por ejemplo nombre@correo.com.',
      libro: 'Selecciona el libro que quieres reservar.',
      fecha: 'Elige una fecha entre hoy y los próximos 30 días.',
      acepto: 'Debes aceptar el reglamento para continuar.'
    };

    function validarCampo(input) {
      const campo = input.closest('.field');
      const error = campo && $('.field__error', campo);
      let msg = '';
      if (!input.checkValidity()) msg = mensajes[input.name] || 'Revisa este campo.';
      if (!msg && input === fecha && input.value) {
        const dia = new Date(input.value + 'T12:00:00').getDay();
        if (dia === 0) msg = 'Los domingos la biblioteca está cerrada. Elige otro día.';
      }
      if (campo) campo.classList.toggle('has-error', Boolean(msg));
      if (error) error.textContent = msg;
      input.setAttribute('aria-invalid', String(Boolean(msg)));
      return !msg;
    }

    const campos = $$('input, select, textarea', form).filter((el) => el.name in mensajes);
    campos.forEach((c) => {
      c.addEventListener('blur', () => validarCampo(c));
      c.addEventListener('change', () => validarCampo(c));
    });

    // Lista de reservas guardadas
    const lista = $('#lista-reservas');
    const sinReservas = $('#sin-reservas');
    let reservas = store.get('lumen-reservas', []);

    function pintarReservas() {
      lista.innerHTML = '';
      reservas.forEach((r, i) => {
        const li = document.createElement('li');
        li.className = 'reservation';
        const fechaTxt = new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
        li.innerHTML = '<div><strong></strong><small></small></div>';
        $('strong', li).textContent = r.libro;
        $('small', li).textContent = `Recoger el ${fechaTxt} (${r.jornada.toLowerCase()}) · Código ${r.codigo}`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn--ghost btn--small';
        btn.textContent = 'Cancelar';
        btn.setAttribute('aria-label', 'Cancelar reserva de ' + r.libro);
        btn.addEventListener('click', () => {
          reservas.splice(i, 1);
          store.set('lumen-reservas', reservas);
          pintarReservas();
        });
        li.appendChild(btn);
        lista.appendChild(li);
      });
      sinReservas.hidden = reservas.length > 0;
    }
    pintarReservas();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const validos = campos.map(validarCampo).every(Boolean);
      if (!validos) {
        const primero = $('[aria-invalid="true"]', form);
        if (primero) primero.focus();
        return;
      }
      const datos = Object.fromEntries(new FormData(form));
      const reserva = {
        libro: datos.libro,
        fecha: datos.fecha,
        jornada: datos.jornada,
        codigo: 'LM-' + Math.random().toString(36).slice(2, 7).toUpperCase()
      };
      reservas.push(reserva);
      store.set('lumen-reservas', reservas);
      pintarReservas();

      alerta.hidden = false;
      alerta.textContent = `¡Listo, ${datos.nombre.split(' ')[0]}! Reservamos «${reserva.libro}». Tu código es ${reserva.codigo}. Te enviaremos la confirmación a ${datos.correo}.`;
      form.reset();
      contador.textContent = '0';
      campos.forEach((c) => {
        c.removeAttribute('aria-invalid');
        const f = c.closest('.field');
        if (f) f.classList.remove('has-error');
      });
      alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- 10. Resaltar el día actual en el horario ---------- */
  const horario = $('#horario');
  if (horario) {
    const fila = $(`tr[data-day="${new Date().getDay()}"]`, horario);
    if (fila) fila.classList.add('is-today');
  }
})();
