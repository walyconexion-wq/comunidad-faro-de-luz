/**
 * BACKEND SERVERLESS FUNCTION: /api/chat
 * Vercel Serverless Function & Node.js Endpoint
 * Calibración de Inteligencia Artificial para Asistente Asistente Luz
 * Comunidad Faro de Luz
 */

const SYSTEM_PROMPT = `
Eres el Asistente Luz, la ingeniera oficial de infraestructura, ecotecnología y atención comunitaria de la COMUNIDAD FARO DE LUZ.
Estás ubicada en la base física de montaña en el Valle de Traslasierra, Córdoba, Argentina.
Tu misión es orientar con amabilidad, precisión técnica, orden y calidez a todas las personas, familias y aspirantes interesados en el proyecto.

=== DIRECTIVAS DE IDENTIDAD Y TONO ===
- Identidad: Asistente Luz (Ingeniería de Infraestructura y Asistente Oficial).
- Tono: Profesional, tecnológico, acogedor, sobrio y con valores comunitarios y espirituales cristianos.
- Liderazgo: La Dirección General del ecosistema está a cargo del Director Waly ("Director Omega").

=== BASE DE CONOCIMIENTO TÉCNICO OFICIAL ===
1. HÁBITAT Y VIVIENDAS MODULARES:
   - 6 Viviendas modulares construidas a partir de contenedores marítimos de 40ft High Cube, dispuestos en herradura con orientación bioclimática.
   - Domo Geodésico Central de 10m de diámetro para reuniones, formación y sala de servidores/búnker.
   - Montaje sobre pilotes antisísmicos elevados del suelo para evitar humedad e impacto ambiental.
   - Aislamiento térmico de triple capa (poliuretano proyectado de 50mm + cámara de aire + Durlock ignífugo).

2. ENERGÍA Y CONECTIVIDAD:
   - Microrred fotovoltaica híbrida de 18.4 kW con banco de baterías de Litio LiFePO4 de 48V.
   - Enlace satelital de alta velocidad Starlink fijado en el Domo Central con redundancia de energía solar.

3. AGUA Y RECURSOS:
   - Provisión de agua asegurada en el predio de 1 hectárea en Traslasierra.
   - Torre con cisterna elevada de 22.000 Litros con distribución integral por gravedad y sistema de filtrado multicapa.

4. SUSTENTO ECONÓMICO Y REGLA 70/20/10:
   - La comunidad NO vive de agricultura de subsistencia ni depende de donaciones para su comida.
   - Está sustentada al 100% por la empresa tecnológica SHOPDIGITAL (desarrollo de software, inteligencia artificial, servicios cloud).
   - Regla 70/20/10:
     * 70% del tiempo: Trabajo remoto de alta productividad para ShopDigital (garantiza el fondo común).
     * 20% del tiempo: Mantenimiento y tareas ecotecnológicas de la base comunal.
     * 10% del tiempo: Acción social con la Fundación Valle de Luz y actividades de culto con el Ministerio Caminos de Fe.

5. CONVOCATORIA DE PAREJAS FUNDADORAS:
   - Se busca conformar el núcleo de 6 parejas fundadoras (12-13 personas en total).
   - Perfiles buscados: Desarrolladores de Software/IA, Especialistas en Ecotecnología/Energía Solar/Hídrica, Logística Social y Administración.
   - Para postularse, los aspirantes deben completar el formulario al pie de la página oficial.

6. MARCO LEGAL Y GOBERNANZA:
   - El terreno y los módulos están estructurados bajo un Fideicomiso Inmobiliario de Co-Housing registrado ante la IPJ (Inspección de Personas Jurídicas de Córdoba).
   - Cada pareja fundadora posee un certificado de participación y uso habitacional intransferible sin aval comunal.

=== INSTRUCCIONES DE RESPUESTA ===
- Responde siempre en español, de forma clara, concisa y empática (máximo 2 a 3 párrafos).
- Invita siempre a los interesados a postularse en el formulario de la página si desean ser parte de los fundadores.
- Si te hacen preguntas fuera de tema, redirige amablemente hacia la visión de la Comunidad Faro de Luz.
`;

module.exports = async (req, res) => {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El campo message es requerido.' });
    }

    // Configuración de API Keys (Groq / DeepSeek / OpenRouter / Gemini)
    const GROQ_KEY = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

    let reply = '';

    // 1. INTENTO CON GROQ CLOUD (Ultra Rápido y Gratis)
    if (GROQ_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.6,
            max_tokens: 600
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('Fallo en conexión Groq:', err.message);
      }
    }

    // 2. INTENTO CON DEEPSEEK API
    if (!reply && DEEPSEEK_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.6,
            max_tokens: 600
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('Fallo en conexión DeepSeek:', err.message);
      }
    }

    // 3. INTENTO CON OPENROUTER
    if (!reply && OPENROUTER_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen/qwen-2.5-72b-instruct',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(Array.isArray(history) ? history.slice(-6) : []),
              { role: 'user', content: message }
            ],
            temperature: 0.6,
            max_tokens: 600
          })
        });

        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn('Fallo en conexión OpenRouter:', err.message);
      }
    }

    // 4. MOTOR INTELIGENTE DE RESPALDO (Fallback Calibrado con Base de Conocimiento)
    if (!reply) {
      reply = generateCalibratedFallback(message);
    }

    return res.status(200).json({
      reply,
      agent: 'Asistente Luz',
      model: GROQ_KEY ? 'Llama 3.3 70B (Groq)' : (DEEPSEEK_KEY ? 'DeepSeek-V3' : 'Motor Calibrado Asistente Luz'),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      error: 'Error interno al procesar el mensaje.',
      reply: 'Disculpas, ocurrió una intermitencia momentánea en el búnker. Por favor, reintentá tu consulta o dejá tu postulación en el formulario.'
    });
  }
};

function generateCalibratedFallback(text) {
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
    return 'Nuestras viviendas constan de 6 módulos en contenedores marítimos de 40ft High Cube dispuestos en herradura con orientación bioclimática hacia las sierras. Están montados sobre pilotes antisísmicos con aislamiento de poliuretano proyectado y convergen hacia el Domo Central de 10m de diámetro.';
  }
  if (q.includes('shopdigital') || q.includes('sustento') || q.includes('trabajo') || q.includes('70/20') || q.includes('dinero') || q.includes('economia')) {
    return 'La comunidad no depende de agricultura de subsistencia. Aplicamos la regla 70/20/10: el 70% del tiempo se dedica al desarrollo remoto de software e inteligencia artificial en ShopDigital, lo que garantiza el financiamiento total de servicios, compras mayoristas y equipamiento.';
  }
  if (q.includes('postul') || q.includes('pareja') || q.includes('fundador') || q.includes('requisito') || q.includes('entrar') || q.includes('inscribir')) {
    return 'Buscamos conformar el equipo fundacional de 6 parejas (13 miembros) con facultades en desarrollo cloud/IA, ecotecnología solar e hídrica, logística comunitaria o administración. Te invitamos a completar el formulario de postulación al final de esta página para que el Director Waly evalúe tu perfil.';
  }
  if (q.includes('fideicomiso') || q.includes('legal') || q.includes('tierra') || q.includes('terreno') || q.includes('cordoba') || q.includes('ipj')) {
    return 'La hectárea y los módulos están blindados bajo un Fideicomiso Inmobiliario de Co-Housing en la Provincia de Córdoba ante la IPJ, otorgando certificados de uso formal y un estatuto de convivencia transparente para cada familia.';
  }
  if (q.includes('agua') || q.includes('solar') || q.includes('internet') || q.includes('starlink') || q.includes('bateria') || q.includes('litio')) {
    return 'Contamos con provisión asegurada de agua mediante cisterna elevada de 22.000 Litros para distribución por gravedad, microrred fotovoltaica híbrida con banco de baterías de litio de 48V y conexión satelital Starlink instalada en el Domo.';
  }
  return '¡Hola! Soy Asistente Luz, ingeniera de la Comunidad Faro de Luz en Traslasierra. Con gusto te asesoro sobre nuestras viviendas modulares, la regla 70/20/10 sustentada por ShopDigital o el proceso de postulación para las 6 parejas fundadoras. ¿Sobre qué tema te gustaría profundizar?';
}
