const { EdgeTTS, Communicate } = require('@travisvn/edge-tts');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Soporte tanto para query params como body JSON
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
    return res.status(400).json({ error: 'Texto requerido' });
  }

  try {
    const communicate = new Communicate(text, { voice });
    const audioChunks = [];
    
    for await (const chunk of communicate.stream()) {
      if (chunk.type === 'audio' && chunk.data) {
        audioChunks.push(chunk.data);
      }
    }

    if (audioChunks.length === 0) {
      throw new Error('No se recibieron chunks de audio');
    }

    const audioBuffer = Buffer.concat(audioChunks);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
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
    console.error('Error generando voz neuronal:', error);
    if (typeof res.status === 'function') {
      return res.status(500).json({ error: 'Error al sintetizar voz' });
    }
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Error al sintetizar voz' }));
  }
};
