const fs = require('fs');

const bunkerGalleryEngine = `
  // ============================================================
  // GESTOR MAESTRO DE GALERÍA Y MULTIMEDIA (LIVE & SYNC ENGINE)
  // ============================================================
  const formAddMedia = document.getElementById('form-add-media');
  const bunkerGaleriaGrid = document.getElementById('bunker-galeria-grid');
  const badgeGaleriaCount = document.getElementById('badge-galeria-count');
  const btnRefreshGaleria = document.getElementById('btn-refresh-galeria');
  const btnResetDefault = document.getElementById('btn-reset-default-media');
  
  const btnTabFile = document.getElementById('btn-tab-file');
  const btnTabUrl = document.getElementById('btn-tab-url');
  const sectionUploadFile = document.getElementById('section-upload-file');
  const sectionUploadUrl = document.getElementById('section-upload-url');
  const mediaFileInput = document.getElementById('media-file-input');
  const filePlaceholder = document.getElementById('file-placeholder');
  const filePreviewContainer = document.getElementById('file-preview-container');
  const filePreviewImg = document.getElementById('file-preview-img');
  const filePreviewVideo = document.getElementById('file-preview-video');
  const fileInfoText = document.getElementById('file-info-text');

  const STORAGE_KEY = 'faro_galeria_live_v1';
  let currentFileBase64 = null;
  let currentFileType = 'foto';

  const initialMasterMedia = [
    {
      id: 'item-1',
      titulo: 'Emblema Oficial Faro de Luz 3D',
      tipo: 'foto',
      url: 'https://farodeluz.dpdns.org/og-faro.jpg',
      categoria: 'Montaña & Predio',
      descripcion: 'Insignia dorada en relieve 3D sobre metal oscuro y haces de luz.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'item-2',
      titulo: 'Amanecer en las Altas Cumbres',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Montaña & Predio',
      descripcion: 'Vista panorámica de las sierras cordobesas donde se asienta la comunidad.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'item-3',
      titulo: 'Domo Geodésico y Búnker Central',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Estructura geodésica central de frecuencia 4/5 para reuniones y telecomunicaciones.',
      destacado: true,
      fecha: new Date().toISOString()
    },
    {
      id: 'item-4',
      titulo: 'Microrred Solar Fotovoltaica 18.4kW',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Ecotecnología',
      descripcion: 'Generación solar con banco de baterías de litio 48V para autonomía continua.',
      destacado: false,
      fecha: new Date().toISOString()
    },
    {
      id: 'item-5',
      titulo: 'Viviendas Modulares 40ft High Cube',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Domo & Obra',
      descripcion: 'Montaje sobre pilotes antisísmicos con aislamiento térmico de poliuretano proyectado.',
      destacado: false,
      fecha: new Date().toISOString()
    },
    {
      id: 'item-6',
      titulo: 'Recorrido Panorámico del Valle',
      tipo: 'video',
      url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      categoria: 'Montaña & Predio',
      descripcion: 'Registro audiovisual de la geografía y entorno natural de Traslasierra.',
      destacado: true,
      fecha: new Date().toISOString()
    }
  ];

  // Helper de YouTube Embed
  function formatMediaUrl(url, type) {
    if (!url) return '';
    let formatted = url.trim();
    if (type === 'video') {
      if (formatted.includes('watch?v=')) {
        formatted = formatted.replace('watch?v=', 'embed/').split('&')[0];
      } else if (formatted.includes('youtu.be/')) {
        formatted = formatted.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
      } else if (formatted.includes('youtube.com/shorts/')) {
        formatted = formatted.replace('youtube.com/shorts/', 'www.youtube.com/embed/').split('?')[0];
      }
    }
    return formatted;
  }

  // Cargar lista activa
  async function loadGaleriaData() {
    if (!bunkerGaleriaGrid) return;

    let items = null;

    // 1. Intentar desde Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('galeria_multimedia')
          .select('*')
          .order('fecha', { ascending: false });

        if (!error && data) {
          items = data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
      } catch (err) {
        console.warn('Supabase offline, usando LocalStorage:', err);
      }
    }

    // 2. Si no hay Supabase o dio error, usar LocalStorage
    if (!items) {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData !== null) {
        try {
          items = JSON.parse(localData);
        } catch (e) {
          items = initialMasterMedia;
        }
      } else {
        items = initialMasterMedia;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    }

    renderBunkerGaleria(items);
  }

  // Renderizador de Grilla del Búnker
  function renderBunkerGaleria(items) {
    if (!bunkerGaleriaGrid) return;
    if (badgeGaleriaCount) badgeGaleriaCount.textContent = items.length;

    bunkerGaleriaGrid.innerHTML = '';

    if (items.length === 0) {
      bunkerGaleriaGrid.innerHTML = \`
        <div class="col-span-2 text-center p-10 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
          <div class="text-3xl">📷</div>
          <div class="text-white font-bold text-sm">No hay medios publicados actualmente</div>
          <p class="text-xs text-slate-400">Subí una foto o video desde tu computadora o pegá un link para publicarlo en la web oficial.</p>
        </div>
      \`;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between group hover:border-cyan-400/50 transition-all text-xs shadow-lg';

      const isVideo = item.tipo === 'video';
      let previewHtml = '';

      if (isVideo) {
        if (item.url.includes('youtube.com/embed/')) {
          previewHtml = \`
            <div class="w-full h-36 bg-slate-950 rounded-xl overflow-hidden mb-2 relative">
              <iframe src="\${item.url}" class="w-full h-full border-0 pointer-events-none"></iframe>
              <span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300">🎬 YouTube</span>
            </div>\`;
        } else {
          previewHtml = \`
            <div class="w-full h-36 bg-slate-950 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-2 relative overflow-hidden">
              <video src="\${item.url}" class="w-full h-full object-cover"></video>
              <span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300">🎬 Video MP4</span>
            </div>\`;
        }
      } else {
        previewHtml = \`
          <div class="w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-white/10 mb-2 relative">
            <img src="\${item.url}" alt="\${item.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://farodeluz.dpdns.org/og-faro.jpg'">
            <span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300">📷 Foto</span>
          </div>\`;
      }

      card.innerHTML = \`
        <div>
          \${previewHtml}
          <div class="flex items-center justify-between gap-2 mb-1">
            <h5 class="font-bold text-white truncate text-xs group-hover:text-cyan-300 transition-colors">\${item.titulo}</h5>
            <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] uppercase whitespace-nowrap">\${item.categoria}</span>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">\${item.descripcion || 'Registro oficial de la base de montaña.'}</p>
        </div>
        <div class="flex items-center justify-between pt-2.5 border-t border-white/10 text-[10px] font-mono">
          <span class="text-slate-500">\${new Date(item.fecha || Date.now()).toLocaleDateString('es-AR')}</span>
          <button class="btn-delete-item px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-all flex items-center gap-1 font-bold" data-id="\${item.id}">
            <span>🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      \`;

      bunkerGaleriaGrid.appendChild(card);
    });

    // EVENTOS DE ELIMINACIÓN EFECTIVA
    document.querySelectorAll('.btn-delete-item').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (!confirm('¿Confirmás eliminar este elemento de la galería oficial?')) return;

        // 1. Eliminar de Supabase
        if (supabase) {
          try {
            await supabase.from('galeria_multimedia').delete().eq('id', id);
          } catch (err) {
            console.warn('Eliminación en Supabase:', err);
          }
        }

        // 2. Eliminar de LocalStorage
        let localData = [];
        try {
          localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
          localData = [];
        }
        const updated = localData.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // 3. Notificación y Renderizado
        alert('✓ Elemento eliminado correctamente de la galería.');
        loadGaleriaData();
      });
    });
  }

  // RESTAURAR INICIALES
  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', async () => {
      if (!confirm('¿Deseás restaurar las 6 fotos y videos originales por defecto?')) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMasterMedia));
      if (supabase) {
        try {
          await supabase.from('galeria_multimedia').upsert(initialMasterMedia);
        } catch (e) {
          console.warn('Upsert inicial en Supabase:', e);
        }
      }
      alert('✓ 6 Medios originales restaurados.');
      loadGaleriaData();
    });
  }

  // SELECTOR DE TABS (ARCHIVO PC VS LINK WEB)
  if (btnTabFile && btnTabUrl) {
    btnTabFile.addEventListener('click', () => {
      btnTabFile.className = 'py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5';
      btnTabUrl.className = 'py-2 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5';
      sectionUploadFile.classList.remove('hidden');
      sectionUploadUrl.classList.add('hidden');
    });

    btnTabUrl.addEventListener('click', () => {
      btnTabUrl.className = 'py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5';
      btnTabFile.className = 'py-2 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5';
      sectionUploadUrl.classList.remove('hidden');
      sectionUploadFile.classList.add('hidden');
    });
  }

  // COMPRESIÓN Y LECTURA DE ARCHIVOS DE LA PC
  if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');

      const mediaTypeSelect = document.getElementById('media-tipo');
      if (isVid && mediaTypeSelect) mediaTypeSelect.value = 'video';
      if (isImg && mediaTypeSelect) mediaTypeSelect.value = 'foto';

      fileInfoText.textContent = \`\${file.name} (\${(file.size / 1024 / 1024).toFixed(2)} MB)\`;
      filePlaceholder.classList.add('hidden');
      filePreviewContainer.classList.remove('hidden');

      if (isImg) {
        filePreviewVideo.classList.add('hidden');
        filePreviewImg.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Compresión ligera en canvas para asegurar rendimiento de carga
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1400;
            const MAX_HEIGHT = 1400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            currentFileBase64 = canvas.toDataURL('image/jpeg', 0.85);
            filePreviewImg.src = currentFileBase64;
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else if (isVid) {
        filePreviewImg.classList.add('hidden');
        filePreviewVideo.classList.remove('hidden');

        const reader = new FileReader();
        reader.onload = (event) => {
          currentFileBase64 = event.target.result;
          filePreviewVideo.src = currentFileBase64;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ENVÍO Y GUARDADO DE NUEVO MEDIO
  if (formAddMedia) {
    formAddMedia.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-media');

      const titulo = document.getElementById('media-titulo').value.trim();
      const tipo = document.getElementById('media-tipo').value;
      const categoria = document.getElementById('media-categoria').value;
      const descripcion = document.getElementById('media-descripcion').value.trim();
      const destacado = document.getElementById('media-destacado').checked;
      const urlInput = document.getElementById('media-url').value.trim();

      let finalUrl = '';

      if (currentFileBase64) {
        finalUrl = currentFileBase64;
      } else if (urlInput) {
        finalUrl = formatMediaUrl(urlInput, tipo);
      }

      if (!titulo || !finalUrl) {
        alert('Por favor seleccioná un archivo de tu PC o ingresá una URL válida.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⚡</span><span>Publicando en la Web...</span>';
      }

      const newItem = {
        id: 'item-' + Date.now(),
        titulo,
        tipo,
        categoria,
        url: finalUrl,
        descripcion,
        destacado,
        fecha: new Date().toISOString()
      };

      // 1. Guardar en Supabase
      if (supabase) {
        try {
          await supabase.from('galeria_multimedia').insert([newItem]);
        } catch (err) {
          console.warn('Registro directo local:', err);
        }
      }

      // 2. Guardar en LocalStorage
      let localItems = [];
      try {
        localItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch (e) {
        localItems = [];
      }
      localItems.unshift(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems));

      // 3. Reset del formulario
      formAddMedia.reset();
      currentFileBase64 = null;
      if (filePlaceholder) filePlaceholder.classList.remove('hidden');
      if (filePreviewContainer) filePreviewContainer.classList.add('hidden');
      if (filePreviewImg) filePreviewImg.src = '';
      if (filePreviewVideo) filePreviewVideo.src = '';

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Guardar y Publicar en la Web</span><span>🚀</span>';
      }

      alert('✓ ¡Medio publicado con éxito! Ya está visible en el Búnker y en la web pública.');
      loadGaleriaData();
    });
  }

  if (btnRefreshGaleria) {
    btnRefreshGaleria.addEventListener('click', () => loadGaleriaData());
  }

  // Carga inicial
  loadGaleriaData();
`;

function updateBunkerJs(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  const startTag = '  // ==========================================';
  const startIndex = code.indexOf(startTag);

  if (startIndex !== -1) {
    code = code.substring(0, startIndex) + bunkerGalleryEngine.trim() + '\n\n})();\n';
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('bunker.js actualizado con motor maestro de galería en:', filePath);
  }
}

updateBunkerJs('src/bunker.js');
updateBunkerJs('public/src/bunker.js');
