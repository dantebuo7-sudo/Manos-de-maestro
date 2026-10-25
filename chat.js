/* Asistente IA de Manos de Maestro: burbuja de chat que habla con /api/chat */
(function(){
  if (window.__mdmChat) return; window.__mdmChat = true;
  var SOCIOS = [
    { name: 'Miguel', full: 'Miguel Saldivia', n: '56977107052' },
    { name: 'Ignacio', full: 'Ignacio Mora', n: '56965836682' }
  ];

  var css = ''
  + '.mdm-chat-btn{position:fixed;right:20px;bottom:20px;z-index:58;display:flex;align-items:center;gap:10px;min-height:56px;padding:0 20px 0 16px;border-radius:999px;border:1px solid var(--wood,#C29A6B);background:var(--ink,#0B0D0F);color:var(--bone,#F5F5F3);font:600 15px var(--sans,system-ui,sans-serif);cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.45);transition:transform .16s ease}'
  + '.mdm-chat-btn:hover{transform:translateY(-2px)}'
  + '.mdm-chat-btn svg{color:var(--wood,#C29A6B);flex:none}'
  + '.mdm-chat{position:fixed;right:20px;bottom:88px;z-index:59;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100svh - 120px));display:flex;flex-direction:column;background:var(--surface,#14171A);color:var(--bone,#F5F5F3);border:1px solid var(--line,#262B30);border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.55);font-family:var(--sans,system-ui,sans-serif)}'
  + '.mdm-chat[hidden]{display:none!important}'
  + '.mdm-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line,#262B30);background:var(--ink,#0B0D0F)}'
  + '.mdm-head b{display:block;font-size:15px}'
  + '.mdm-head small{color:var(--muted,#A3A9AF);font-size:12px}'
  + '.mdm-dot{width:36px;height:36px;border-radius:999px;border:1px solid var(--wood,#C29A6B);display:flex;align-items:center;justify-content:center;color:var(--wood,#C29A6B);flex:none}'
  + '.mdm-close{margin-left:auto;width:44px;height:44px;border:0;border-radius:8px;background:transparent;color:inherit;font-size:24px;line-height:1;cursor:pointer}'
  + '.mdm-close:hover{background:rgba(245,245,243,.08)}'
  + '.mdm-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px;display:flex;flex-direction:column;gap:10px}'
  + '.mdm-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:15px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}'
  + '.mdm-msg.bot{align-self:flex-start;background:#1F2327}'
  + '.mdm-msg.me{align-self:flex-end;background:var(--bone,#F5F5F3);color:var(--ink,#0B0D0F)}'
  + '.mdm-msg.typing{color:var(--muted,#A3A9AF)}'
  + '.mdm-was{display:flex;flex-direction:column;gap:8px;align-self:stretch}'
  + '.mdm-wa{display:flex;align-items:center;gap:10px;min-height:46px;padding:0 14px;border-radius:10px;background:#25D366;color:#0B0D0F;font-weight:700;font-size:14px;text-decoration:none}'
  + '.mdm-wa small{font-weight:500;margin-left:auto;opacity:.75}'
  + '.mdm-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 10px}'
  + '.mdm-chips[hidden]{display:none!important}'
  + '.mdm-chips button{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid var(--line,#262B30);background:transparent;color:#D0D3D6;font:500 13px var(--sans,system-ui,sans-serif);cursor:pointer}'
  + '.mdm-chips button:hover{border-color:var(--wood,#C29A6B);color:var(--bone,#F5F5F3)}'
  + '.mdm-form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,#262B30);background:var(--ink,#0B0D0F)}'
  + '.mdm-form input{flex:1;min-width:0;min-height:44px;padding:0 14px;border-radius:8px;border:1px solid var(--line,#262B30);background:var(--surface,#14171A);color:var(--bone,#F5F5F3);font:400 16px var(--sans,system-ui,sans-serif)}'
  + '.mdm-form input:focus{outline:2px solid var(--wood,#C29A6B);outline-offset:1px}'
  + '.mdm-form button{min-height:44px;padding:0 16px;border-radius:8px;border:0;background:var(--bone,#F5F5F3);color:var(--ink,#0B0D0F);font:700 14px var(--sans,system-ui,sans-serif);cursor:pointer}'
  + '.mdm-form button:disabled{opacity:.5;cursor:default}'
  + '.mdm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  + '@media (max-width:899px){'
  + '.mdm-chat-btn{bottom:calc(84px + env(safe-area-inset-bottom,0px));right:16px;padding:0 16px}'
  + '.mdm-chat-btn span{display:none}'
  + '.mdm-chat{right:16px;bottom:calc(150px + env(safe-area-inset-bottom,0px));height:min(520px,calc(100svh - 190px))}'
  + '}'
  + 'html.intro-on .mdm-chat-btn{opacity:0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var SVG_CHAT = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>';
  var SVG_HOUSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/></svg>';

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'mdm-chat-btn';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mdmChat');
  btn.setAttribute('aria-label', 'Abrir asistente de Manos de Maestro');
  btn.innerHTML = SVG_CHAT + '<span>¿Dudas? Pregúntanos</span>';

  var box = document.createElement('section');
  box.className = 'mdm-chat'; box.id = 'mdmChat'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Asistente de Manos de Maestro');
  box.innerHTML = ''
    + '<div class="mdm-head"><span class="mdm-dot">' + SVG_HOUSE + '</span>'
    + '<div><b>Asistente Manos de Maestro</b><small>Respuestas al tiro · Asistente con IA</small></div>'
    + '<button type="button" class="mdm-close" aria-label="Cerrar asistente">×</button></div>'
    + '<div class="mdm-log" aria-live="polite"></div>'
    + '<div class="mdm-chips"><button type="button">Quiero construir una casa</button><button type="button">Quiero remodelar mi baño</button><button type="button">¿Trabajan en mi comuna?</button></div>'
    + '<form class="mdm-form"><label for="mdmInput" class="mdm-sr">Escribe tu mensaje</label>'
    + '<input id="mdmInput" type="text" maxlength="500" autocomplete="off" placeholder="Escribe tu consulta...">'
    + '<button type="submit">Enviar</button></form>';

  document.body.appendChild(box); document.body.appendChild(btn);
  var log = box.querySelector('.mdm-log'), form = box.querySelector('.mdm-form'), input = box.querySelector('input');
  var send = form.querySelector('button'), chips = box.querySelector('.mdm-chips'), close = box.querySelector('.mdm-close');
  var history = [], busy = false, started = false;

  function track(name, data){ try { if (window.va) window.va('event', { name: name, data: data || {} }); } catch (e) {} }
  function add(cls, text){ var d = document.createElement('div'); d.className = 'mdm-msg ' + cls; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function addWa(summary){
    var wrap = document.createElement('div'); wrap.className = 'mdm-was';
    SOCIOS.forEach(function(s){
      var a = document.createElement('a'); a.className = 'mdm-wa'; a.target = '_blank'; a.rel = 'noopener';
      var msg = 'Hola ' + s.name + ', buenas tardes 👋 ' + (summary || 'Vi la página de Manos de Maestro y me gustaría cotizar, por favor.');
      a.href = 'https://wa.me/' + s.n + '?text=' + encodeURIComponent(msg);
      a.textContent = 'Escribir a ' + s.full;
      var sm = document.createElement('small'); sm.textContent = 'WhatsApp'; a.appendChild(sm);
      a.addEventListener('click', function(){ track('WhatsApp abierto', { socio: s.name, origen: 'asistente IA' }); });
      wrap.appendChild(a);
    });
    log.appendChild(wrap); log.scrollTop = log.scrollHeight;
  }
  function open(){
    box.hidden = false; btn.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true; track('Asistente abierto');
      var hi = '¡Hola, buenas tardes! 👋 Soy el asistente de Manos de Maestro. Cuéntame, por favor, ¿qué trabajo tienes en mente?';
      add('bot', hi); history.push({ role: 'assistant', text: hi });
    }
    setTimeout(function(){ input.focus(); }, 50);
  }
  function shut(){ box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  btn.addEventListener('click', function(){ box.hidden ? open() : shut(); });
  close.addEventListener('click', shut);
  box.addEventListener('keydown', function(e){ if (e.key === 'Escape') shut(); });
  // que el scroll suave de la página no se robe la rueda del mouse dentro del chat
  box.setAttribute('data-lenis-prevent', '');

  function ask(text){
    text = (text || '').trim(); if (!text || busy) return;
    chips.hidden = true; busy = true; send.disabled = true;
    add('me', text); history.push({ role: 'user', text: text });
    var t = add('bot typing', 'Escribiendo...');
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) })
      .then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function(d){
        t.remove();
        var reply = String(d.reply || ''), m = reply.match(/^\s*WHATSAPP:\s*(.+)\s*$/mi), summary = null;
        if (m) { summary = m[1].replace(/^["“]|["”]$/g, '').trim(); reply = reply.replace(m[0], '').trim(); }
        if (reply) { add('bot', reply); history.push({ role: 'assistant', text: reply }); }
        if (summary) addWa(summary);
      })
      .catch(function(){
        t.remove();
        add('bot', 'Uy, el asistente no está disponible en este momento 🙏 Escríbenos directo por WhatsApp y te respondemos personalmente.');
        addWa(null);
      })
      .then(function(){ busy = false; send.disabled = false; input.focus(); });
  }
  form.addEventListener('submit', function(e){ e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  chips.addEventListener('click', function(e){ if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });
})();
