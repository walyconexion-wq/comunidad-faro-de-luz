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
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando al Búnker...';
      }

      setTimeout(() => {
        if (formFeedback) {
          formFeedback.classList.remove('hidden');
          form.reset();
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Postulación Enviada';
        }
      }, 1000);
    });
  }

  // --- CONTROLADOR DEL ASISTENTE FLOTANTE LUZ-02 ---
  const btnToggleLuzChat = document.getElementById('btn-toggle-luz-chat');
  const btnCloseLuzChat = document.getElementById('btn-close-luz-chat');
  const luzChatWindow = document.getElementById('luz-chat-window');
  const luzChatForm = document.getElementById('luz-chat-form');
  const luzChatInput = document.getElementById('luz-chat-input');
  const luzChatBody = document.getElementById('luz-chat-body');
  const quickChips = document.querySelectorAll('.luz-quick-chip');

  let isChatOpen = false;

  function toggleLuzChat(open) {
    isChatOpen = (typeof open === 'boolean') ? open : !isChatOpen;
    if (isChatOpen) {
      luzChatWindow.classList.remove('hidden');
      setTimeout(() => {
        luzChatWindow.classList.remove('scale-95', 'opacity-0');
        luzChatWindow.classList.add('scale-100', 'opacity-100');
        if (luzChatInput) luzChatInput.focus();
      }, 10);
    } else {
      luzChatWindow.classList.remove('scale-100', 'opacity-100');
      luzChatWindow.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        luzChatWindow.classList.add('hidden');
      }, 300);
    }
  }

  if (btnToggleLuzChat) btnToggleLuzChat.addEventListener('click', () => toggleLuzChat());
  if (btnCloseLuzChat) btnCloseLuzChat.addEventListener('click', () => toggleLuzChat(false));

  // Manejo de chips de consultas rápidas
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.textContent.trim().replace(/^[^\w\s¿]+/, '').trim();
      handleLuzUserMessage(query);
    });
  });

  // Manejo de formulario de chat
  if (luzChatForm) {
    luzChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = luzChatInput.value.trim();
      if (!text) return;
      luzChatInput.value = '';
      handleLuzUserMessage(text);
    });
  }

  let luzChatHistory = [];

  async function handleLuzUserMessage(userText) {
    appendLuzMessage('Tú', userText, 'user');
    luzChatHistory.push({ role: 'user', content: userText });

    // Indicador de "Escribiendo..."
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'flex gap-2 items-center text-[10px] text-amber-300 font-mono italic p-2';
    typingIndicator.innerHTML = '<span class="animate-spin text-xs">⚡</span> Luz-02 está procesando tu respuesta...';
    luzChatBody.appendChild(typingIndicator);
    luzChatBody.scrollTop = luzChatBody.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: luzChatHistory })
      });

      const data = await response.json();
      typingIndicator.remove();

      const reply = data.reply || generateLuzResponse(userText);
      luzChatHistory.push({ role: 'assistant', content: reply });
      appendLuzMessage('Luz-02', reply, 'assistant');
    } catch (err) {
      console.warn('Fallback por red:', err);
      typingIndicator.remove();
      const reply = generateLuzResponse(userText);
      luzChatHistory.push({ role: 'assistant', content: reply });
      appendLuzMessage('Luz-02', reply, 'assistant');
    }
  }

  function generateLuzResponse(text) {
    const q = text.toLowerCase();
    
    if (q.includes('vivienda') || q.includes('casa') || q.includes('modular') || q.includes('container') || q.includes('domo')) {
      return 'Las viviendas son 6 módulos en contenedores marítimos de 40ft High Cube dispuestos en herradura alrededor del Domo Central. Cuentan con aislamiento térmico de triple capa (poliuretano expandido + Durlock) y montaje antisísmico sobre pilotes aislados.';
    }
    if (q.includes('shopdigital') || q.includes('sustento') || q.includes('trabajo') || q.includes('70/20') || q.includes('dinero') || q.includes('ingreso')) {
      return 'La comunidad no depende de agricultura de subsistencia. Aplicamos la regla 70/20/10: el 70% del tiempo se dedica al desarrollo de software y servicios de IA en ShopDigital, el cual financia el 100% de los servicios, alimentos e infraestructura comunal.';
    }
    if (q.includes('postul') || q.includes('pareja') || q.includes('fundador') || q.includes('requisito') || q.includes('entrar') || q.includes('inscribir')) {
      return 'Buscamos conformar el núcleo inicial de 6 parejas / 13 fundadores con talentos complementarios (Desarrollo Cloud/IA, Ecotecnología solar/hídrica, Logística social o Administración). Podés completar el formulario de postulación al final de esta página.';
    }
    if (q.includes('fideicomiso') || q.includes('legal') || q.includes('tierra') || q.includes('terreno') || q.includes('cordoba') || q.includes('ipj')) {
      return 'La hectárea y los módulos están blindados bajo un Fideicomiso Inmobiliario de Co-Housing en la Provincia de Córdoba ante la IPJ, garantizando certificados de uso para cada pareja y un estatuto de convivencia transparente.';
    }
    if (q.includes('agua') || q.includes('solar') || q.includes('internet') || q.includes('starlink') || q.includes('bateria')) {
      return 'Contamos con provisión asegurada de agua con cisterna elevada de 22.000 L para distribución por gravedad, microrred fotovoltaica con baterías de litio y enlace satelital Starlink fijado en el Domo Central.';
    }

    return 'Comprendo tu consulta sobre la Comunidad Faro de Luz. Te invito a explorar las secciones de Ecotecnología y Gobernanza en la página, o dejar tu postulación en el formulario para que la Dirección General (Director Waly) tome contacto con vos.';
  }

  function appendLuzMessage(sender, msg, type) {
    const isUser = type === 'user';
    const div = document.createElement('div');
    div.className = isUser ? 'flex justify-end' : 'flex gap-2.5 items-start';

    if (isUser) {
      div.innerHTML = `
        <div class="p-3 rounded-2xl rounded-tr-sm bg-amber-500/20 border border-amber-500/30 text-amber-100 max-w-[85%]">
          ${msg}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
          L
        </div>
        <div class="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-slate-200 max-w-[85%]">
          ${msg}
        </div>
      `;
    }

    luzChatBody.appendChild(div);
    luzChatBody.scrollTop = luzChatBody.scrollHeight;
  }

  // Listeners
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Inicialización
  window.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    resizeCanvas();
    requestAnimationFrame(animationLoop);
  });

})();

