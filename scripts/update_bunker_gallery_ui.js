const fs = require('fs');

const tabGaleriaHtml = `
        <!-- TAB 6: GESTIÓN DE GALERÍA Y MULTIMEDIA -->
        <div id="tab-galeria" class="bunker-view space-y-6 hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <span>📸</span> Gestor de Galería Multimedia & CMS de la Comunidad
              </h3>
              <p class="text-xs text-slate-400">Subí fotos y videos directamente desde tu computadora, o pegá enlaces de YouTube para actualizar la web oficial en vivo.</p>
            </div>
            <div class="flex items-center gap-2">
              <span id="galeria-sync-badge" class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                ● Modo Live: Sincronizado
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- FORMULARIO DE CARGA DE NUEVO MEDIO -->
            <div class="bg-[#0B111A] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="text-lg">➕</span>
                  <h4 class="font-bold text-white text-sm">Publicar Foto o Video</h4>
                </div>
              </div>

              <!-- SELECTOR DE ORIGEN (ARCHIVO PC VS LINK WEB) -->
              <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold">
                <button type="button" id="btn-tab-file" class="py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold transition-all flex items-center justify-center gap-1.5">
                  <span>📁</span> Desde la PC
                </button>
                <button type="button" id="btn-tab-url" class="py-2 rounded-lg text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5">
                  <span>🔗</span> Enlace Web / YouTube
                </button>
              </div>

              <form id="form-add-media" class="space-y-4 text-xs">
                
                <!-- SECCIÓN 1: SUBIR DESDE COMPUTADORA -->
                <div id="section-upload-file" class="space-y-2">
                  <label class="block text-slate-300 font-semibold">Seleccionar Foto o Video de tu Equipo *</label>
                  <div class="relative border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 text-center cursor-pointer bg-slate-900/50 transition-all group" id="drop-zone-media">
                    <input type="file" id="media-file-input" accept="image/*,video/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div id="file-placeholder" class="space-y-1">
                      <div class="text-3xl group-hover:scale-110 transition-transform">📂</div>
                      <div class="text-slate-200 font-semibold">Hacé clic para elegir archivo</div>
                      <div class="text-[10px] text-slate-400">JPG, PNG, WebP, MP4 o WebM</div>
                    </div>
                    <div id="file-preview-container" class="hidden space-y-2">
                      <div class="max-h-36 overflow-hidden rounded-xl bg-black/50 border border-white/10 flex items-center justify-center">
                        <img id="file-preview-img" src="" alt="Preview" class="max-h-36 object-contain hidden">
                        <video id="file-preview-video" src="" controls class="max-h-36 w-full hidden"></video>
                      </div>
                      <div id="file-info-text" class="text-[11px] text-cyan-300 font-mono font-semibold truncate"></div>
                    </div>
                  </div>
                </div>

                <!-- SECCIÓN 2: PEGAR ENLACE WEB O YOUTUBE -->
                <div id="section-upload-url" class="space-y-2 hidden">
                  <label class="block text-slate-300 font-semibold">URL del Archivo o Video de YouTube *</label>
                  <input type="url" id="media-url" placeholder="https://... o https://youtube.com/watch?v=..." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400">
                  <p class="text-[10px] text-slate-500">Podés pegar enlaces de fotos web o videos de YouTube (se transforman automáticamente a reproductor).</p>
                </div>

                <!-- TÍTULO -->
                <div>
                  <label class="block text-slate-300 font-semibold mb-1">Título / Avance *</label>
                  <input type="text" id="media-titulo" required placeholder="Ej: Nueva foto de la base de montaña" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400">
                </div>

                <!-- TIPO Y CATEGORÍA -->
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">Tipo de Medio *</label>
                    <select id="media-tipo" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400">
                      <option value="foto">📷 Fotografía</option>
                      <option value="video">🎬 Video</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-slate-300 font-semibold mb-1">Categoría *</label>
                    <select id="media-categoria" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400">
                      <option value="Montaña & Predio">Montaña & Predio</option>
                      <option value="Domo & Obra">Domo & Obra</option>
                      <option value="Ecotecnología">Ecotecnología</option>
                      <option value="Comunidad">Comunidad</option>
                      <option value="Dron 4K">Dron 4K</option>
                    </select>
                  </div>
                </div>

                <!-- DESCRIPCIÓN -->
                <div>
                  <label class="block text-slate-300 font-semibold mb-1">Descripción / Bitácora</label>
                  <textarea id="media-descripcion" rows="2" placeholder="Detalles, avances o fecha..." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"></textarea>
                </div>

                <div class="flex items-center gap-2">
                  <input type="checkbox" id="media-destacado" class="rounded text-cyan-500 focus:ring-cyan-400">
                  <label for="media-destacado" class="text-slate-300">Marcar como Destacado ⭐</label>
                </div>

                <button type="submit" id="btn-submit-media" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
                  <span>Guardar y Publicar en la Web</span>
                  <span>🚀</span>
                </button>
              </form>
            </div>

            <!-- GRILLA DE MEDIOS EN VIVO -->
            <div class="lg:col-span-2 bg-[#0B111A] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between pb-3 border-b border-white/10">
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-white text-sm flex items-center gap-2">
                      <span>🖼️</span> Medios Publicados en la Web Oficial
                    </h4>
                    <span id="badge-galeria-count" class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">6</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button id="btn-reset-default-media" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-[10px] transition-all" title="Restaurar los 6 medios por defecto">
                      Restaurar Iniciales
                    </button>
                    <button id="btn-refresh-galeria" class="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-mono text-[10px] font-bold transition-all">
                      ↻ Refrescar
                    </button>
                  </div>
                </div>

                <!-- CONTENEDOR DE LA GRILLA -->
                <div id="bunker-galeria-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-1 pt-3">
                  <!-- Renderizado dinámico desde bunker.js -->
                </div>
              </div>

              <!-- NOTA INFORMATIVA -->
              <div class="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                <span>💡 Los cambios se sincronizan en tiempo real con la web pública (<a href="https://farodeluz.dpdns.org/#galeria" target="_blank" class="text-cyan-400 underline">farodeluz.dpdns.org</a>).</span>
              </div>
            </div>

          </div>
        </div>
`;

function updateBunkerHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const oldTabRegex = /<!-- TAB 6: GESTIÓN DE GALERÍA Y MULTIMEDIA -->[\s\S]*?<!-- TAB 5: SECOPS & AUDITORÍA -->/;
  if (oldTabRegex.test(html)) {
    html = html.replace(oldTabRegex, tabGaleriaHtml.trim() + '\n\n        <!-- TAB 5: SECOPS & AUDITORÍA -->');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Tab Galería con subida de archivos inyectado en:', filePath);
  }
}

updateBunkerHtml('bunker.html');
updateBunkerHtml('public/bunker.html');
