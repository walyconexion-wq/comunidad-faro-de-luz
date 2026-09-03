const { EdgeTTS } = require('@travisvn/edge-tts');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.writeHead(200);
    return res.end();
  }

  let text = '';
  let voice = 'es-AR-ElenaNeural';

  if (req.query && req.query.text) {
    text = req.query.text;
    voice = req.query.voice || voice;
  } else if (req.body && req.body.text) {
    text = req.body.text;
    voice = req.body.voice || voice;
  } else if (req.url && req.url.includes('?')) {
    const urlObj = new URL('http://localhost' + req.url);
    text = urlObj.searchParams.get('text') || '';
    voice = urlObj.searchParams.get('voice') || voice;
  }

  if (!text) {
    if (typeof res.status === 'function') return res.status(400).json({ error: 'Texto requerido' });
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Texto requerido' }));
  }

  // Intento de síntesis neuronal con Microsoft Edge TTS
  try {
    const synthesizeWithTimeout = async () => {
      const tts = new EdgeTTS(text, voice);
      const result = await tts.synthesize();
      const arrayBuf = await result.audio.arrayBuffer();
      return Buffer.from(arrayBuf);
    };

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('EdgeTTS timeout')), 5000)
    );

    const audioBuffer = await Promise.race([synthesizeWithTimeout(), timeoutPromise]);

    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    if (typeof res.send === 'function') {
      return res.send(audioBuffer);
    } else {
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': audioBuffer.length
      });
      return res.end(audioBuffer);
    }
  } catch (error) {
    console.warn('EdgeTTS timeout/error, usando audio stream fallback argentino:', error.message);
    try {
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=es-AR&client=tw-ob&q=${encodeURIComponent(text.substring(0, 250))}`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const fallbackArrayBuf = await fallbackRes.arrayBuffer();
      const fallbackBuf = Buffer.from(fallbackArrayBuf);

      if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }

      if (typeof res.send === 'function') {
        return res.send(fallbackBuf);
      } else {
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
          'Content-Length': fallbackBuf.length
        });
        return res.end(fallbackBuf);
      }
    } catch (e2) {
      console.error('Error total en TTS:', e2);
      if (typeof res.status === 'function') return res.status(500).json({ error: 'Error al sintetizar voz' });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Error al sintetizar voz' }));
    }
  }
};
