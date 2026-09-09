/**
 * LUZ VOICE GUIDE - Sistema de Audio-Guía Espacial (SNC 2.0)
 * Especializado para COMUNIDAD FARO DE LUZ
 * Voz Humana Neural Argentina (es-AR-ElenaNeural)
 * Cero polución visual - Control exclusivo en botón 3D superior
 */
(function() {
  'use strict';

  // Configuración de Guiones de la Comunidad Faro de Luz
  const SECTIONS_SCRIPTS = {
    'hero': {
      title: 'Bienvenida',
      text: 'Te doy la bienvenida a la Comunidad Faro de Luz. Un espacio vivo de fraternidad, encuentro y crecimiento en las sierras.'
    },
    'mision-vision': {
      title: 'Visión & Misión',
      text: 'Nuestra visión es unir la fe, la ecotecnología y la vida comunitaria en un entorno sustentable en Traslasierra.'
    },
    'ecosistema': {
      title: 'Ecosistema',
      text: 'Descubrí nuestro ecosistema: el Ministerio Caminos de Fe, la Fundación Valle de Luz y la Comunidad en plena sinergia.'
    },
    'ecotecnologia': {
      title: 'Ecotecnología',
      text: 'Energía solar autónoma de 18 kilovatios, almacenamiento en litio y diseño bioclimático de montaña.'
    },
    'gobernanza': {
      title: 'Organigrama & Familias',
      text: 'Seis parejas fundadoras en co-housing, asambleas horizontales y acuerdos de convivencia claros.'
    },
    'regla-tiempo': {
      title: 'Regla 70/20/10',
      text: 'Nuestra regla 70/20/10 equilibra el trabajo productivo, el servicio a la comunidad y el descanso.'
    },
    'ubicacion': {
      title: 'Ubicación de Montaña',
      text: 'Ubicados en Panaholma, a 980 metros sobre el nivel del mar, rodeados de sierras y aire puro.'
    },
    'galeria': {
      title: 'Galería de Registros',
      text: 'Recorré en imágenes nuestras obras, talleres al aire libre y encuentros serranos.'
    },
    'formacion': {
      title: 'Formación Comunitaria',
      text: 'Talleres de oficios, huerta orgánica, bioconstrucción y vida comunitaria.'
    },
    'postulacion': {
      title: 'Sumarme a la Comunidad',
      text: 'Si sentís el llamado a formar parte de Faro de Luz, completá tu postulación para contactarnos.'
    }
  };

  // Estado del Sistema
  const state = {
    isActive: false,
    isSpeaking: false,
    isMuted: false,
    currentSectionId: null,
    lastSpokenTime: {},
    synth: window.speechSynthesis || null,
    currentUtterance: null,
    preferredVoice: null,
    currentAudio: null,
    audioCache: {}
  };

  // Precalentar audios neurales en caché del navegador
  function prewarmAudioCache() {
    try {
      Object.keys(SECTIONS_SCRIPTS).forEach(key => {
        const text = SECTIONS_SCRIPTS[key].text;
        const url = '/api/tts?voice=es-AR-ElenaNeural&text=' + encodeURIComponent(text);
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        state.audioCache[key] = audio;
      });
    } catch(e) {
      console.warn('Error en prewarmAudioCache:', e);
    }
  }

  // Fallback a mejor voz nativa
  function resolveBestVoice() {
    if (!state.synth) return null;
    const voices = state.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    let voice = voices.find(v => v.lang === 'es-AR') ||
                voices.find(v => v.lang.startsWith('es-') && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('helena') || v.name.toLowerCase().includes('sabina') || v.name.toLowerCase().includes('zira'))) ||
                voices.find(v => v.lang.startsWith('es-419')) ||
                voices.find(v => v.lang.startsWith('es'));

    return voice || voices[0];
  }

  if (state.synth && state.synth.onvoiceschanged !== undefined) {
    state.synth.onvoiceschanged = () => {
      state.preferredVoice = resolveBestVoice();
    };
  }

  // Hablar frase de sección usando Voz Neural Humana Argentina
  function speakScript(text, onComplete) {
    if (!state.isActive || state.isMuted) return;

    stopSpeaking();

    try {
      const ttsUrl = '/api/tts?voice=es-AR-ElenaNeural&text=' + encodeURIComponent(text);
      const audio = new Audio(ttsUrl);
      state.currentAudio = audio;
      audio.volume = 1.0;

      audio.onplay = () => {
        state.isSpeaking = true;
        updateNavbarVoiceButton(true, true);
      };

      audio.onended = () => {
        state.isSpeaking = false;
        state.currentAudio = null;
        updateNavbarVoiceButton(true, false);
        if (onComplete) onComplete();
      };

      audio.onerror = (err) => {
        console.warn('Fallback a síntesis local:', err);
        state.isSpeaking = false;
        state.currentAudio = null;
        updateNavbarVoiceButton(true, false);
        speakWithSpeechSynthesis(text, onComplete);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Autoplay bloqueado:', err);
          state.isSpeaking = false;
          updateNavbarVoiceButton(true, false);
        });
      }
      return;
    } catch (e) {
      console.warn('Error de reproducción neural:', e);
      speakWithSpeechSynthesis(text, onComplete);
    }
  }

  function speakWithSpeechSynthesis(text, onComplete) {
    if (!state.synth || !state.isActive || state.isMuted) return;

    try {
      state.synth.cancel();
    } catch(e) {}

    const utterance = new SpeechSynthesisUtterance(text);
    if (!state.preferredVoice) {
      state.preferredVoice = resolveBestVoice();
    }
    if (state.preferredVoice) {
      utterance.voice = state.preferredVoice;
    }
    utterance.lang = state.preferredVoice ? state.preferredVoice.lang : 'es-AR';
    utterance.pitch = 1.04;
    utterance.rate = 0.94;
    utterance.volume = 0.95;

    utterance.onstart = () => {
      state.isSpeaking = true;
      updateNavbarVoiceButton(true, true);
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      updateNavbarVoiceButton(true, false);
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      state.isSpeaking = false;
      updateNavbarVoiceButton(true, false);
    };

    state.currentUtterance = utterance;
    state.synth.speak(utterance);
  }

  function stopSpeaking() {
    if (state.currentAudio) {
      try {
        state.currentAudio.pause();
        state.currentAudio.currentTime = 0;
      } catch(e) {}
      state.currentAudio = null;
    }
    if (state.synth) {
      try {
        state.synth.cancel();
      } catch(e) {}
    }
    state.isSpeaking = false;
    updateNavbarVoiceButton(state.isActive, false);
  }

  // Observador de scroll
  function setupScrollObserver() {
    const sectionIds = Object.keys(SECTIONS_SCRIPTS);
    const elementsToObserve = [];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) elementsToObserve.push(el);
    });

    if (elementsToObserve.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      if (!state.isActive || state.isMuted) return;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          const sectionId = entry.target.id;
          const now = Date.now();
          const lastTime = state.lastSpokenTime[sectionId] || 0;

          if (now - lastTime > 45000 && sectionId !== state.currentSectionId) {
            state.currentSectionId = sectionId;
            state.lastSpokenTime[sectionId] = now;

            const scriptData = SECTIONS_SCRIPTS[sectionId];
            if (scriptData) {
              setTimeout(() => {
                if (state.currentSectionId === sectionId && state.isActive) {
                  speakScript(scriptData.text);
                }
              }, 250);
            }
          }
        }
      });
    }, {
      threshold: [0.35, 0.6]
    });

    elementsToObserve.forEach(el => observer.observe(el));
  }

  // Eliminar cualquier widget flotante residual
  function removeLegacyPlayerUI() {
    const widget = document.getElementById('luz-voice-guide-widget');
    if (widget) widget.remove();
  }

  // Sincronizar apariencia del botón 3D en la barra superior (Navbar)
  function updateNavbarVoiceButton(isActive, isSpeaking) {
    const btn = document.getElementById('navbar-voice-toggle-btn');
    if (!btn) return;

    const pulse = document.getElementById('nav-voice-pulse');
    const dot = document.getElementById('nav-voice-dot');
    const badge = document.getElementById('nav-voice-badge');
    const waves = document.getElementById('nav-voice-waves');
    const icon = document.getElementById('nav-voice-icon');

    if (isActive) {
      btn.classList.add('voice-active');
      if (dot) {
        dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]';
      }
      if (pulse) {
        pulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80';
      }
      if (badge) {
        badge.textContent = 'ON';
        badge.className = 'hidden sm:inline-block text-[8px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-bold tracking-wider';
      }
      if (isSpeaking) {
        if (waves) {
          waves.classList.remove('hidden');
          waves.classList.add('flex');
        }
        if (icon) icon.classList.add('hidden');
      } else {
        if (waves) {
          waves.classList.add('hidden');
          waves.classList.remove('flex');
        }
        if (icon) icon.classList.remove('hidden');
      }
    } else {
      btn.classList.remove('voice-active');
      if (dot) {
        dot.className = 'relative inline-flex rounded-full h-2 w-2 bg-amber-500';
      }
      if (pulse) {
        pulse.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75';
      }
      if (badge) {
        badge.textContent = 'OFF';
        badge.className = 'hidden sm:inline-block text-[8px] sm:text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold tracking-wider';
      }
      if (waves) {
        waves.classList.add('hidden');
        waves.classList.remove('flex');
      }
      if (icon) icon.classList.remove('hidden');
    }
  }

  function activate() {
    state.isActive = true;
    state.isMuted = false;
    prewarmAudioCache();
    updateNavbarVoiceButton(true, false);

    const secId = state.currentSectionId || 'hero';
    const scriptData = SECTIONS_SCRIPTS[secId] || SECTIONS_SCRIPTS['hero'];
    speakScript(scriptData.text);
  }

  function deactivate() {
    stopSpeaking();
    state.isActive = false;
    state.isMuted = false;
    updateNavbarVoiceButton(false, false);
  }

  function toggle() {
    if (typeof window.playHapticPop === 'function') {
      try { window.playHapticPop(); } catch(e) {}
    }
    if (state.isActive) {
      deactivate();
    } else {
      activate();
    }
  }

  function bindUIEvents() {
    const navVoiceBtn = document.getElementById('navbar-voice-toggle-btn');
    if (navVoiceBtn) {
      navVoiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      });
    }
  }

  function init() {
    removeLegacyPlayerUI();
    bindUIEvents();
    setupScrollObserver();
    updateNavbarVoiceButton(state.isActive, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.luzVoiceGuide = {
    activate,
    deactivate,
    toggle,
    speakScript,
    stopSpeaking,
    getState: () => ({ ...state })
  };
})();
