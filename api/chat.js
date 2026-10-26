// Asistente IA de Manos de Maestro — función de Vercel (POST /api/chat)
// Responde en vivo (texto que va apareciendo). Necesita la variable GEMINI_API_KEY.
// Opcional: GEMINI_MODEL para elegir el modelo principal (si falla o tarda, prueba otros).

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

TU ESTILO
- Conversa como un asesor experto en construcción, cálido, inteligente y genuinamente útil: entiende bien lo que la persona quiere, responde exactamente eso y explica el porqué con claridad.
- Puedes explicar temas generales de construcción con criterio (qué es un panel SIP y sus ventajas, qué revisar en un terreno, por qué importa la aislación y la humedad en el sur, qué trámites suelen pedirse), siempre como orientación general.
- Español de Chile, cercano y respetuoso; trata de "tú". Saluda con cordialidad y usa "por favor" y "gracias" con naturalidad.
- Respuestas breves y bien armadas: normalmente 2 a 5 frases. Si ayuda, usa una lista corta con guiones. Nunca uses asteriscos ni formato Markdown.
- Como máximo un emoji por mensaje, solo si suma.
- Haz una sola pregunta por vez para avanzar: qué necesita, en qué comuna o sector está y su nombre. Si es casa nueva, pregunta si ya tiene terreno.
- Cuando ya sepas qué necesita y su comuna, invítalo a escribir por WhatsApp a Miguel o a Ignacio (aparecerán botones). En ese caso termina tu mensaje con UNA línea aparte con este formato exacto:
WHATSAPP: <resumen breve en primera persona, ej: "Soy Ana, de Paillaco, y quiero remodelar mi baño.">

REGLAS IMPORTANTES
- NUNCA des precios, valores por metro cuadrado ni plazos: explica con amabilidad que eso se define en la visita y el presupuesto, porque depende del terreno, los materiales y el diseño.
- No inventes datos del negocio, obras, garantías ni permisos que no estén aquí. Si no sabes algo del negocio, di que Miguel o Ignacio se lo responden por WhatsApp.
- Si preguntan algo que no tiene que ver con construcción o con el negocio, responde con amabilidad que solo puedes ayudar con consultas de Manos de Maestro.
- No pidas datos sensibles (RUT, cuentas bancarias, etc.).`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Falta configurar GEMINI_API_KEY' });
  // Primero los modelos livianos (más rápidos y menos saturados); si uno falla o tarda, se prueba el siguiente
  const models = [process.env.GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest']
    .filter((m, i, a) => m && a.indexOf(m) === i);
  const started = Date.now();

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

  const base = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };
  // Sin "pensar" para responder más rápido (si el modelo no lo acepta, se manda sin eso)
  const fast = { ...base, generationConfig: { ...base.generationConfig, thinkingConfig: { thinkingBudget: 0 } } };

  // Abre la conexión con Gemini en modo "en vivo"; si no responde a tiempo, se corta
  async function open(model, payload, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':streamGenerateContent?alt=sse',
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(payload), signal: ctrl.signal }
      );
      if (!r.ok) {
        clearTimeout(timer);
        let info = '';
        try { info = (await r.text()).slice(0, 300); } catch (e) {}
        return { ok: false, status: r.status, info };
      }
      return { ok: true, r, ctrl, timer };
    } catch (e) {
      clearTimeout(timer);
      return { ok: false, status: 0, info: e && e.name };
    }
  }

  for (const model of models) {
    const left = 25000 - (Date.now() - started);
    if (left < 2000) break;
    let c = await open(model, fast, Math.min(9000, left));
    if (!c.ok && c.status === 400) c = await open(model, base, Math.min(9000, 25000 - (Date.now() - started)));
    if (!c.ok) { console.error('Gemini error', model, c.status, c.info); continue; }

    // Lee el texto a medida que llega y lo manda al navegador al tiro
    const reader = c.r.body.getReader();
    const dec = new TextDecoder();
    let buf = '', sent = 0, headers = false;
    clearTimeout(c.timer);
    const guard = setTimeout(() => c.ctrl.abort(), 40000);
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith('data:')) continue;
          let j;
          try { j = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
          const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
          const text = parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
          if (!text) continue;
          if (!headers) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('X-Accel-Buffering', 'no');
            headers = true;
          }
          res.write(text);
          sent += text.length;
        }
      }
    } catch (e) {
      console.error('Corte en vivo', model, e && e.name);
    } finally {
      clearTimeout(guard);
    }
    if (sent > 0) {
      console.log('Respondió', model, (Date.now() - started) + 'ms');
      return res.end();
    }
    console.error('Respuesta vacía', model);
  }
  return res.status(502).json({ error: 'IA no disponible' });
};
