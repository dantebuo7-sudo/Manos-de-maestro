// Asistente IA de Manos de Maestro — función de Vercel (POST /api/chat)
// Necesita la variable de entorno GEMINI_API_KEY (clave gratis de Google AI Studio).
// Opcional: GEMINI_MODEL para elegir el modelo principal (si falla, prueba otros).

const SYSTEM = `Eres el asistente virtual de la página web de "Manos de Maestro", maestros constructores de Valdivia, Región de Los Ríos, Chile.

QUIÉNES SON
- Dos socios en partes iguales: Miguel Saldivia (WhatsApp +56 9 7710 7052) e Ignacio Mora (WhatsApp +56 9 6583 6682). Ninguno trabaja debajo del otro: los dos cotizan, los dos trabajan en obra y los dos responden por el resultado.
- Más de 25 años de oficio.
- Trabajan principalmente en Valdivia. También van a las comunas cercanas: Corral, Lanco, Los Lagos, Máfil, Mariquina, Paillaco, Panguipulli, La Unión, Futrono, Lago Ranco y Río Bueno.

SERVICIOS
- Servicio principal: construcción de casas desde cero, tradicional o con panel SIP, llave en mano. Etapas: terreno y fundaciones; estructura; techumbre; instalaciones (eléctrica, agua y fosa séptica); terminaciones (revestimientos, pisos, cocina y baños); entrega.
- Construcción con panel SIP (une estructura y aislación en una sola pieza).
- Ampliaciones y segundos pisos.
- Techumbres: cambio de techo completo, estructura nueva y cubierta.
- Instalaciones eléctricas: ellos hacen la instalación completa; cuando se necesita el certificado SEC (TE1), lo emite un electricista autorizado con quien trabajan.
- Fosa séptica para casas sin conexión al alcantarillado.
- Baños, cocinas, escaleras y carpintería a medida, pisos y revestimientos.

CÓMO SE COTIZA
- La persona escribe por WhatsApp con fotos del espacio, la comuna y lo que quiere hacer. Se coordina una visita para medir y se envía un presupuesto claro: qué se hace, con qué materiales y en cuánto tiempo.
- Durante la obra mandan fotos del antes, de cada etapa y del resultado.

TU TRABAJO
- Saluda con cordialidad, usa "por favor" y "gracias", y algún emoji de vez en cuando (máximo uno o dos por mensaje).
- Responde corto: 2 a 4 frases, en español de Chile, cercano y respetuoso. Trata de "tú".
- Resuelve dudas y averigua, de a una pregunta por vez: qué trabajo necesita, en qué comuna o sector está, y su nombre. Si es casa nueva, pregunta si ya tiene terreno.
- Cuando ya sepas qué necesita y su comuna, invítalo a escribir por WhatsApp a Miguel o a Ignacio (aparecerán botones). En ese caso termina tu mensaje con UNA línea aparte con este formato exacto:
WHATSAPP: <resumen breve en primera persona, ej: "Soy Ana, de Paillaco, y quiero remodelar mi baño.">

REGLAS IMPORTANTES
- NUNCA des precios, valores por metro cuadrado ni plazos: explica con amabilidad que eso se define en la visita y el presupuesto.
- No inventes datos, obras, garantías ni permisos que no estén aquí. Si no sabes algo, di que Miguel o Ignacio se lo responden por WhatsApp.
- Si preguntan algo que no tiene que ver con construcción o con el negocio, responde con amabilidad que solo puedes ayudar con consultas de Manos de Maestro.
- No pidas datos sensibles (RUT, cuentas bancarias, etc.).`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY' });
  // Si un modelo está saturado o no existe, se prueba el siguiente
  const models = [process.env.GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest']
    .filter((m, i, a) => m && a.indexOf(m) === i);

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const raw = Array.isArray(body && body.messages) ? body.messages.slice(-12) : [];
  let contents = raw
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text.slice(0, 800) }],
    }));
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Mensaje vacío' });
  }

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
  });

  for (const model of models) {
    try {
      const r = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: payload }
      );
      const data = await r.json();
      if (!r.ok) {
        console.error('Gemini error', model, r.status, JSON.stringify(data));
        if ([404, 429, 500, 503].includes(r.status)) continue;
        return res.status(502).json({ error: 'IA no disponible' });
      }
      const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
      const text = parts.filter((p) => !p.thought).map((p) => p.text || '').join('').trim();
      console.log('Respondió', model);
      return res.status(200).json({
        reply: text || 'Disculpa, no te entendí bien. ¿Me lo cuentas de otra forma, por favor? 😊',
      });
    } catch (e) {
      console.error('Fallo', model, e);
    }
  }
  return res.status(502).json({ error: 'IA no disponible' });
};
