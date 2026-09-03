const fs = require('fs');

// 1. ACTUALIZAR scrollytelling.js Y public/src/scrollytelling.js
const updatedAssistantLogic = `
  // 4. ASISTENTE FLOTANTE LUZ-02 (CONECTADO A /api/chat Y /api/tts)
  function initLuzAssistant() {
    const btnToggle = document.getElementById('btn-toggle-luz-chat');
    const btnClose = document.getElementById('btn-close-luz-chat');
    const chatWindow = document.getElementById('luz-chat-window');
    const chatForm = document.getElementById('luz-chat-form');
    const chatInput = document.getElementById('luz-chat-input');
    const chatBody = document.getElementById('luz-chat-body');
    const quickChips = document.querySelectorAll('.luz-quick-chip');
    const btnToggleVoice = document.getElementById('btn-toggle-voice');

    let isOpen = false;
    let chatHistory = [];
    let isVoiceActive = true;
    let currentAudio = null;

    if (btnToggleVoice) {
      btnToggleVoice.innerHTML = '<span>🔊</span><span>Voz ON</span>';
      btnToggleVoice.addEventListener('click', () => {
        isVoiceActive = !isVoiceActive;
        if (isVoiceActive) {
          btnToggleVoice.innerHTML = '<span>🔊</span><span>Voz ON</span>';
          btnToggleVoice.classList.remove('opacity-50');
          btnToggleVoice.classList.add('text-amber-300');
        } else {
          btnToggleVoice.innerHTML = '<span>🔇</span><span>Voz OFF</span>';
          btnToggleVoice.classList.add('opacity-50');
          btnToggleVoice.classList.remove('text-amber-300');
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }
        }
      });
    }

    function reproducirVozHumana(texto, triggerBtn) {
      if (!isVoiceActive && !triggerBtn) return;

      const textoLimpio = texto
        .replace(/[\\u{1F600}-\\u{1F64F}|\\u{1F300}-\\u{1F5FF}|\\u{1F680}-\\u{1F6FF}|\\u{1F1E0}-\\u{1F1FF}|\\u{2600}-\\u{26FF}|\\u{2700}-\\u{27BF}]/gu, '')
        .replace(/[*_#\`~<>[\\\\\\]]/g, '')
        .substring(0, 280)
        .trim();

      if (!textoLimpio) return;

      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      const audioUrl = \`/api/tts?voice=es-AR-ElenaNeural&text=\${encodeURIComponent(textoLimpio)}\`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      if (triggerBtn) {
        const originalHtml = triggerBtn.innerHTML;
        triggerBtn.innerHTML = '<span class="animate-pulse text-amber-300">⚡ Reproduciendo voz...</span>';
        triggerBtn.disabled = true;

        audio.onended = () => {
          triggerBtn.innerHTML = originalHtml;
          triggerBtn.disabled = false;
          currentAudio = null;
        };
        audio.onerror = () => {
          triggerBtn.innerHTML = originalHtml;
          triggerBtn.disabled = false;
          currentAudio = null;
        };
      }

      audio.play().catch(err => {
        console.log('Reproducción asistida esperando interacción o disponible vía botón:', err);
      });
    }

    function toggleChat(force) {
      isOpen = typeof force === 'boolean' ? force : !isOpen;
      if (!chatWindow) return;

      if (isOpen) {
        chatWindow.classList.remove('hidden');
        setTimeout(() => {
          chatWindow.classList.remove('scale-95', 'opacity-0');
          chatWindow.classList.add('scale-100', 'opacity-100');
          if (chatInput) chatInput.focus();
        }, 10);
      } else {
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-95', 'opacity-0');
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        setTimeout(() => {
          chatWindow.classList.add('hidden');
        }, 300);
      }
    }

    if (btnToggle) btnToggle.addEventListener('click', () => toggleChat());
    if (btnClose) btnClose.addEventListener('click', () => toggleChat(false));

    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.textContent.trim().replace(/^[^\\w\\s¿]+/, '').trim();
        handleUserMessage(query);
      });
    });

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        handleUserMessage(text);
      });
    }

    async function handleUserMessage(text) {
      appendChatMessage('Tú', text, 'user');
      chatHistory.push({ role: 'user', content: text });

      const indicator = document.createElement('div');
      indicator.className = 'flex gap-2 items-center text-[10px] text-amber-300 font-mono italic p-2';
      indicator.innerHTML = '<span class="animate-spin text-xs">⚡</span> Luz-02 está procesando respuesta...';
      chatBody.appendChild(indicator);
      chatBody.scrollTop = chatBody.scrollHeight;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: chatHistory })
        });

        const data = await response.json();
        indicator.remove();

        const reply = data.reply || getLocalFallback(text);
        chatHistory.push({ role: 'assistant', content: reply });
        appendChatMessage('Luz-02', reply, 'assistant');
        reproducirVozHumana(reply);
      } catch (err) {
        indicator.remove();
        const reply = getLocalFallback(text);
        chatHistory.push({ role: 'assistant', content: reply });
        appendChatMessage('Luz-02', reply, 'assistant');
        reproducirVozHumana(reply);
      }
    }

    function appendChatMessage(sender, msg, type) {
      const isUser = type === 'user';
      const div = document.createElement('div');
      div.className = isUser ? 'flex justify-end' : 'flex gap-2.5 items-start';

      if (isUser) {
        div.innerHTML = \`<div class="p-3 rounded-2xl rounded-tr-sm bg-amber-500/20 border border-amber-500/30 text-amber-100 max-w-[85%]">\${msg}</div>\`;
      } else {
        div.innerHTML = \`
          <div class="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">L</div>
          <div class="space-y-1.5 max-w-[85%]">
            <div class="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-slate-200">
              \${msg}
            </div>
            <button class="btn-play-voice text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 transition-all shadow-sm">
              <span>🔊</span>
              <span>Escuchar respuesta</span>
            </button>
          </div>
        \`;

        const playBtn = div.querySelector('.btn-play-voice');
        if (playBtn) {
          playBtn.addEventListener('click', () => {
            reproducirVozHumana(msg, playBtn);
          });
        }
      }

      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function getLocalFallback(text) {
      const q = text.toLowerCase();
      if (q.includes('donde') || q.includes('ubicac') || q.includes('mapa') || q.includes('panaholma') || q.includes('brochero')) {
        return 'La Comunidad Faro de Luz está emplazada en un predio de 1 hectárea con provisión de agua propia en el Valle de Traslasierra, Córdoba, ubicado estratégicamente en el corredor entre Panaholma (a 10 min) y Villa Cura Brochero / Mina Clavero (a 15 min), con acceso consolidado para todo tipo de vehículos y a 2.5 hs de Córdoba Capital.';
      }
      if (q.includes('ecosistema') || q.includes('4 pilares')) {
        return 'Nuestro Ecosistema está compuesto por 4 pilares: 1) ShopDigital (sustento económico), 2) Comunidad Faro de Luz (base física y Co-Housing), 3) Fundación Valle de Luz (acción social) y 4) Ministerio Caminos de Fe (culto cristiano y formación).';
      }
      if (q.includes('vision') || q.includes('mision')) {
        return 'Nuestra Visión es ser un modelo pionero de comunidad de montaña autosustentable en Traslasierra. Nuestra Misión es albergar a 6 familias fundadoras que integran fe cristiana, desarrollo en ShopDigital (Regla 70/20/10) y ecotecnología de vanguardia.';
      }
      if (q.includes('vivienda') || q.includes('casa') || q.includes('modular') || q.includes('container') || q.includes('domo')) {
        return 'Las viviendas son 6 módulos en contenedores marítimos de 40ft High Cube en herradura con triple aislamiento térmico y Domo Central de 10m de diámetro.';
      }
      if (q.includes('shopdigital') || q.includes('sustento') || q.includes('70/20')) {
        return 'Aplicamos la regla 70/20/10: 70% trabajo remoto en ShopDigital (garantiza el fondo común), 20% tareas comunitarias y 10% servicio social y espiritual.';
      }
      return '¡Hola! Soy Luz-02, ingeniera asistente de la Comunidad Faro de Luz. Te invito a explorar nuestra web o registrarte en el formulario de contacto para recibir tu Credencial Digital de Miembro.';
    }
  }
`;

function replaceAssistantInFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  const startTag = '  // 4. ASISTENTE FLOTANTE LUZ-02 (CONECTADO A /api/chat)';
  const endTag = '  // 5. GALERÍA PÚBLICA & LIGHTBOX';

  const startIndex = code.indexOf(startTag);
  const endIndex = code.indexOf(endTag);

  if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + updatedAssistantLogic.trim() + '\n\n' + code.substring(endIndex);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Asistente con botón de voz individual inyectado en:', filePath);
  }
}

replaceAssistantInFile('src/scrollytelling.js');
replaceAssistantInFile('public/src/scrollytelling.js');
