const fs = require('fs');

function updateGreeting(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const oldGreeting = `<div class="flex gap-2.5 items-start">
          <div class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            L
          </div>
          <div class="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-slate-200">
            ¡Hola! Soy <strong>Luz-02</strong>, la ingeniera asistente de la Comunidad Faro de Luz. ¿En qué puedo orientarte hoy?
          </div>
        </div>`;

  const newGreeting = `<div class="flex gap-2.5 items-start">
          <div class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            L
          </div>
          <div class="space-y-1.5 max-w-[85%]">
            <div class="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-slate-200">
              ¡Hola! Soy <strong>Luz-02</strong>, la ingeniera asistente de la Comunidad Faro de Luz. ¿En qué puedo orientarte hoy?
            </div>
            <button class="btn-play-voice text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 transition-all shadow-sm" onclick="const a = new Audio('/api/tts?voice=es-AR-ElenaNeural&text=' + encodeURIComponent('Hola, soy Luz 02, la ingeniera asistente de la Comunidad Faro de Luz. En que puedo orientarte hoy?')); this.innerHTML='<span class=\\'animate-pulse text-amber-300\\'>⚡ Reproduciendo voz...</span>'; a.onended=()=>this.innerHTML='<span>🔊</span><span>Escuchar saludo</span>'; a.play();">
              <span>🔊</span>
              <span>Escuchar saludo</span>
            </button>
          </div>
        </div>`;

  if (html.includes(oldGreeting)) {
    html = html.replace(oldGreeting, newGreeting);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Saludo inicial actualizado con botón de audio en:', filePath);
  }
}

updateGreeting('index.html');
updateGreeting('public/index.html');
