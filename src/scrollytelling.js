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
    
    if (q.includes('donde') || q.includes('ubicac') || q.includes('mapa') || q.includes('panaholma') || q.includes('brochero') || q.includes('llegar')) {
    return 'La Comunidad Faro de Luz está emplazada en un predio de 1 hectárea con provisión de agua propia en el Valle de Traslasierra, Córdoba, ubicado estratégicamente en el corredor entre Panaholma (a 10 min) y Villa Cura Brochero / Mina Clavero (a 15 min), con acceso consolidado para todo tipo de vehículos y a 2.5 hs de Córdoba Capital por las Altas Cumbres.';
  }
    if (q.includes('ecosistema') || q.includes('4 pilares') || q.includes('plataforma') || q.includes('ramas')) {
    return 'Nuestro Ecosistema está compuesto por 4 pilares independientes: 1) ShopDigital (empresa de software e IA que sustenta el 100% de los fondos), 2) Comunidad Faro de Luz (la base física de montaña y hábitat modular), 3) Fundación Valle de Luz (acción social y apoyo comunitario en Traslasierra), y 4) Ministerio Caminos de Fe (formación espiritual, culto y adoración).';
  }
    if (q.includes('vision') || q.includes('mision') || q.includes('proposito') || q.includes('objetivo')) {
    return 'Nuestra Visión es ser un modelo pionero de comunidad de montaña autosustentable en Traslasierra, con soberanía energética y tecnológica. Nuestra Misión es albergar a 6 familias fundadoras que integran fe cristiana, excelencia profesional en ShopDigital (70/20/10) y desarrollo comunitario de vanguardia.';
  }
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



  // ==========================================
  // RENDERIZADOR DE GALERÍA PÚBLICA (SUPABASE)
  // ==========================================
  const galeriaGrid = document.getElementById('galeria-public-grid');
  const filterBtns = document.querySelectorAll('.galeria-filter-btn');
  const lightboxModal = document.getElementById('galeria-lightbox');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxBadge = document.getElementById('lightbox-badge');

  const defaultPublicMedia = [
    {
      id: 'm1',
      titulo: 'Emblema Oficial Faro de Luz 3D',
      tipo: 'foto',
      url: 'https://farodeluz.dpdns.org/og-faro.jpg',
      categoria: 'Montaña & Predio',
      descripcion: 'Insignia dorada en relieve 3D sobre metal oscuro y haces de luz.',
      destacado: true
    },
    {
      id: 'm2',
      titulo: 'Amanecer en las Altas Cumbres',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Montaña & Predio',
      descripcion: 'Vista panorámica de las sierras cordobesas donde se asienta la comunidad.',
      destacado: true
    },
    {
      id: 'm3',
      titulo: 'Domo Geodésico y Búnker Central',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Estructura geodésica central de frecuencia 4/5 para reuniones y telecomunicaciones.',
      destacado: true
    },
    {
      id: 'm4',
      titulo: 'Microrred Solar Fotovoltaica 18.4kW',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Ecotecnología',
      descripcion: 'Generación solar con banco de baterías de litio 48V para autonomía continua.',
      destacado: false
    },
    {
      id: 'm5',
      titulo: 'Viviendas Modulares 40ft High Cube',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Montaje sobre pilotes antisísmicos con aislamiento térmico de poliuretano proyectado.',
      destacado: false
    },
    {
      id: 'm6',
      titulo: 'Recorrido Panorámico del Valle',
      tipo: 'video',
      url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      categoria: 'Montaña & Predio',
      descripcion: 'Registro audiovisual de la geografía y entorno natural de Traslasierra.',
      destacado: true
    }
  ];

  let currentMediaList = defaultPublicMedia;
  let activeCategory = 'todos';

  async function fetchPublicGaleria() {
    if (!galeriaGrid) return;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('galeria_multimedia')
          .select('*')
          .order('fecha', { ascending: false });

        if (!error && data && data.length > 0) {
          currentMediaList = data;
        } else {
          currentMediaList = defaultPublicMedia;
        }
      } catch (e) {
        currentMediaList = defaultPublicMedia;
      }
    } else {
      currentMediaList = defaultPublicMedia;
    }

    renderPublicGaleria();
  }

  function renderPublicGaleria() {
    if (!galeriaGrid) return;
    galeriaGrid.innerHTML = '';

    const filtered = currentMediaList.filter(item => {
      if (activeCategory === 'todos') return true;
      if (activeCategory === 'video') return item.tipo === 'video';
      return item.categoria === activeCategory;
    });

    if (filtered.length === 0) {
      galeriaGrid.innerHTML = '<div class="col-span-full text-center p-8 text-slate-400 font-mono text-xs">No hay medios en esta categoría por el momento.</div>';
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-card-faro rounded-3xl overflow-hidden shadow-2xl hover:border-amber-500/50 transition-all duration-300 group flex flex-col justify-between transform hover:scale-[1.02] cursor-pointer';

      const isVideo = item.tipo === 'video';
      const thumbnailHtml = isVideo
        ? `<div class="relative w-full h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
             <div class="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 z-20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-lg">
               ▶
             </div>
             <span class="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-cyan-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">
               🎬 Video
             </span>
           </div>`
        : `<div class="relative w-full h-48 bg-slate-950 overflow-hidden">
             <img src="${item.url}" alt="${item.titulo}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
             <span class="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/80 text-slate-950 font-mono text-[9px] font-bold uppercase">
               📷 Foto
             </span>
           </div>`;

      card.innerHTML = `
        ${thumbnailHtml}
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] uppercase">
                ${item.categoria}
              </span>
              ${item.destacado ? '<span class="text-amber-400 text-xs">⭐ Destacado</span>' : ''}
            </div>
            <h4 class="font-serif text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">
              ${item.titulo}
            </h4>
            <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed text-shadow-faro">
              ${item.descripcion || 'Registro oficial de la Comunidad Faro de Luz.'}
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span>Ver en Pantalla Completa</span>
            <span>↗</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openLightbox(item));
      galeriaGrid.appendChild(card);
    });
  }

  function openLightbox(item) {
    if (!lightboxModal) return;

    lightboxTitle.textContent = item.titulo;
    lightboxDesc.textContent = item.descripcion || 'Registro oficial de la base de montaña.';
    lightboxBadge.textContent = item.tipo === 'video' ? '🎬 Video' : '📷 Fotografía';
    lightboxBadge.className = item.tipo === 'video'
      ? 'px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] uppercase'
      : 'px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase';

    if (item.tipo === 'video') {
      let embedUrl = item.url;
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      }
      lightboxContent.innerHTML = `<iframe src="${embedUrl}?autoplay=1" class="w-full h-[50vh] sm:h-[60vh] border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      lightboxContent.innerHTML = `<img src="${item.url}" alt="${item.titulo}" class="max-h-[65vh] w-auto object-contain rounded-xl p-2" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">`;
    }

    lightboxModal.classList.remove('hidden');
  }

  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.classList.add('hidden');
      lightboxContent.innerHTML = '';
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.add('hidden');
        lightboxContent.innerHTML = '';
      }
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
