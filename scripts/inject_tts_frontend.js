const fs = require('fs');

// 1. ACTUALIZAR HEADER DEL CHAT EN index.html Y public/index.html
function updateIndexChatHeader(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  const oldCloseBtn = `<button id="btn-close-luz-chat" class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>`;

  const newControls = `<div class="flex items-center gap-1.5">
          <button id="btn-toggle-voice" class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 hover:text-white transition-all text-xs" title="Voz Neuronal Argentina (Elena)">
            🔊
          </button>
          <button id="btn-close-luz-chat" class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>`;

  if (!html.includes('id="btn-toggle-voice"')) {
    html = html.replace(oldCloseBtn, newControls);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Botón de voz agregado a:', filePath);
  }
}

updateIndexChatHeader('index.html');
updateIndexChatHeader('public/index.html');

// 2. ACTUALIZAR scrollytelling.js Y public/src/scrollytelling.js
function updateScrollytellingVoice(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  const oldAssistantInit = `    let isOpen = false;
    let chatHistory = [];`;

  const newAssistantInit = `    let isOpen = false;
    let chatHistory = [];
    let isVoiceActive = true;
    let voicePlayer = null;

    const btnToggleVoice = document.getElementById('btn-toggle-voice');
    if (btnToggleVoice) {
      btnToggleVoice.addEventListener('click', () => {
        isVoiceActive = !isVoiceActive;
        btnToggleVoice.textContent = isVoiceActive ? '🔊' : '🔇';
        btnToggleVoice.title = isVoiceActive ? 'Voz Activada (Elena Argentina)' : 'Voz Silenciada';
        if (!isVoiceActive && voicePlayer) {
          voicePlayer.pause();
          voicePlayer = null;
        }
      });
    }

    function reproducirVozHumana(texto) {
      if (!isVoiceActive) return;
      const textoLimpio = texto
        .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
        .replace(/[*_#\`~]/g, '')
        .trim();

      if (!textoLimpio) return;

      if (voicePlayer) {
        voicePlayer.pause();
        voicePlayer = null;
      }

      const audioUrl = \`/api/tts?voice=es-AR-ElenaNeural&text=\${encodeURIComponent(textoLimpio.substring(0, 400))}\`;
      voicePlayer = new Audio(audioUrl);
      voicePlayer.play().catch(err => console.log('Audio espera interacción del usuario:', err));
    }`;

  if (!code.includes('reproducirVozHumana(texto)')) {
    code = code.replace(oldAssistantInit, newAssistantInit);
    code = code.replace(
      'appendChatMessage(\'Luz-02\', reply, \'assistant\');',
      'appendChatMessage(\'Luz-02\', reply, \'assistant\');\n        reproducirVozHumana(reply);'
    );
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('scrollytelling.js actualizado con voz neuronal en:', filePath);
  }
}

updateScrollytellingVoice('src/scrollytelling.js');
updateScrollytellingVoice('public/src/scrollytelling.js');
