/**
 * COMUNIDAD FARO DE LUZ - MOTOR DE SCROLLYTELLING Y CANVAS RENDER
 * Desarrollado para Antigravity / Ecosistema Faro de Luz
 */

(function () {
  'use strict';
  // Configuración de Conexión en Vivo con Supabase
  const SUPABASE_URL = 'https://osdduwjsicoaeojfhokm.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_eVJfo1_bTqFQ0hmcXVA47A_kEdvMM0K';
  let supabaseClient = null;

  try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (err) {
    console.warn('Error al inicializar Supabase en cliente:', err);
  }


  const FRAME_COUNT = 240;
  const canvas = document.getElementById('scrolly-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderText = document.getElementById('preloader-text');
  const form = document.getElementById('talent-form');
  const formFeedback = document.getElementById('form-feedback');

  const images = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let targetFrame = 0;
  let isReady = false;

  // Generador de rutas de frames
  function getFramePath(index) {
    const frameNumber = String(index + 1).padStart(4, '0');
    return `public/frames/frame_${frameNumber}.jpg`;
  }

  // Ajustar resolución interna del Canvas (Soporte Retina / High DPI)
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    renderFrame(Math.round(currentFrame));
  }

  // Renderizar un frame con escalado 'cover'
  function renderFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Algoritmo cover
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.drawImage(img, nx, ny, nw, nh);
  }

  // Bucle de animación continuo con interpolación suave (Lerp)
  function animationLoop() {
    if (isReady) {
      // Lerp para suavizado de inercia
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.01) {
        currentFrame += diff * 0.12; // Velocidad de interpolación
        renderFrame(Math.round(currentFrame));
      }
    }
    requestAnimationFrame(animationLoop);
  }

  // Cálculo del progreso de scroll normalizado (0 a 1)
  function onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / docHeight));
    
    targetFrame = Math.min(FRAME_COUNT - 1, Math.floor(scrollFraction * FRAME_COUNT));
  }

  // Precarga asíncrona de los 240 fotogramas
  function preloadImages() {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / FRAME_COUNT) * 100);
        
        if (preloaderBar) preloaderBar.style.width = `${percent}%`;
        if (preloaderText) preloaderText.textContent = `Cargando Fotogramas: ${percent}% (${loadedCount}/${FRAME_COUNT})`;

        // Cuando se carga el primer frame o el 100%
        if (loadedCount === 1) {
          resizeCanvas();
        }

        if (loadedCount === FRAME_COUNT) {
          finishLoading();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) finishLoading();
      };
      images.push(img);
    }
  }

  function finishLoading() {
    isReady = true;
    renderFrame(0);
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('opacity-0');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 700);
      }
    }, 300);
  }

  // Gestión del Formulario de Postulación
  // ============================================================
  // GESTIÓN DEL EMBUDO DE SUSCRIPCIÓN Y CREDENCIALES (SUPABASE)
  // ============================================================
  const communityForm = document.getElementById('talent-form');
  const credentialSuccessCard = document.getElementById('credential-success-card');
  const credName = document.getElementById('cred-name');
  const credModalidad = document.getElementById('cred-modalidad');
  const credId = document.getElementById('cred-id');
  const btnWhatsappDirect = document.getElementById('btn-whatsapp-direct');

  if (communityForm) {
    communityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = communityForm.querySelector('button[type="submit"]');

      const nombre = document.getElementById('form-nombre').value.trim();
      const modalidad = document.getElementById('form-modalidad').value;
      const telefono = document.getElementById('form-telefono').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const ciudad = document.getElementById('form-ciudad').value.trim();
      const talentoEl = document.querySelector('input[name="talento"]:checked');
      const talento = talentoEl ? talentoEl.value : 'software';
      const mensaje = document.getElementById('form-mensaje').value.trim();

      if (!nombre || !telefono || !email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin text-base">⚡</span> Procesando Credencial en el Búnker...';
      }

      // Generar código de credencial único
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const credentialCode = 'FL-2027-' + randomCode;

      // Inserción en Supabase en tiempo real
      if (supabase) {
        try {
          await supabase.from('postulaciones_fundadores').insert([{
            nombre_completo: nombre,
            modalidad: modalidad,
            telefono_whatsapp: telefono,
            email: email,
            talento_principal: talento + ' (' + ciudad + ')',
            experiencia_motivacion: mensaje + ' [Credencial: ' + credentialCode + ']',
            estado_evaluacion: 'Credencial Emitida'
          }]);
        } catch (err) {
          console.warn('Registro local de suscripción:', err);
        }
      }

      // Renderizado visual de la Credencial Digital
      if (credName) credName.textContent = nombre;
      if (credModalidad) credModalidad.textContent = modalidad;
      if (credId) credId.textContent = credentialCode;

      if (btnWhatsappDirect) {
        const cleanPhone = telefono.replace(/[^0-9]/g, '');
        const whatsappMsg = encodeURIComponent('¡Hola Director Waly! Acabo de registrarme en la Comunidad Faro de Luz con la Credencial ' + credentialCode + ' (' + nombre + ' - ' + modalidad + '). Me gustaría recibir más información y estar en contacto.');
        btnWhatsappDirect.href = 'https://wa.me/5491100000000?text=' + whatsappMsg;
      }

      setTimeout(() => {
        communityForm.classList.add('hidden');
        if (credentialSuccessCard) {
          credentialSuccessCard.classList.remove('hidden');
          credentialSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 700);
    });
  }

  // Filtros de categoría
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'active');
        b.classList.add('glass-card-faro', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'active');
      btn.classList.remove('glass-card-faro', 'text-slate-300');

      activeCategory = btn.getAttribute('data-category');
      renderPublicGaleria();
    });
  });

  // Carga inicial
  fetchPublicGaleria();


  // ==========================================
  // RELOJ DIGITAL EN VIVO (HEADER FARO DE LUZ)
  // ==========================================
  function initLiveHeaderClock() {
    const clockEl = document.getElementById('clock-display');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const day = pad(now.getDate());
      const month = pad(now.getMonth() + 1);
      const year = now.getFullYear();
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());

      clockEl.textContent = `${day}/${month}/${year} · ${hours}:${minutes}:${seconds}`;
    }

    update();
    setInterval(update, 1000);
  }

  initLiveHeaderClock();
