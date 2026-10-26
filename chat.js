/* Asistente IA de Manos de Maestro: burbuja de chat con el emblema, respuestas en vivo desde /api/chat */
(function(){
  if (window.__mdmChat) return; window.__mdmChat = true;
  var LOGO = '/img/logo-160.webp';
  var SOCIOS = [
    { name: 'Miguel', full: 'Miguel Saldivia', n: '56977107052' },
    { name: 'Ignacio', full: 'Ignacio Mora', n: '56965836682' }
  ];
  var W = 'var(--wood,#C29A6B)', INK = 'var(--ink,#0B0D0F)', BONE = 'var(--bone,#F5F5F3)', LINE = 'var(--line,#262B30)', SANS = 'var(--sans,system-ui,sans-serif)';

  var css = ''
  + '@keyframes mdmSpin{to{transform:rotate(360deg)}}'
  + '@keyframes mdmPulse{0%{box-shadow:0 0 0 0 rgba(194,154,107,.45)}70%{box-shadow:0 0 0 14px rgba(194,154,107,0)}100%{box-shadow:0 0 0 0 rgba(194,154,107,0)}}'
  + '@keyframes mdmDot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}'
  + '@keyframes mdmIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}'
  + '.mdm-emb{position:relative;flex:none;width:52px;height:52px;border-radius:50%;display:grid;place-items:center}'
  + '.mdm-emb::before{content:"";position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,#8A6A45,#F3DDB8,#C29A6B,#5E4630,#C29A6B,#F3DDB8,#8A6A45);animation:mdmSpin 7s linear infinite}'
  + '.mdm-emb::after{content:"";position:absolute;inset:2px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#1C2024,' + INK + ' 70%)}'
  + '.mdm-emb img{position:relative;z-index:1;width:68%;height:auto;display:block}'
  + '.mdm-emb.sm{width:40px;height:40px}'
  + '.mdm-emb.xs{width:28px;height:28px}.mdm-emb.xs::before{animation:none}'
  + '.mdm-chat-btn{position:fixed;right:20px;bottom:20px;z-index:58;display:flex;align-items:center;gap:12px;padding:6px 20px 6px 6px;border-radius:999px;border:1px solid rgba(194,154,107,.45);background:rgba(11,13,15,.9);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:' + BONE + ';font-family:' + SANS + ';cursor:pointer;text-align:left;box-shadow:0 14px 40px rgba(0,0,0,.5);transition:transform .2s ease,border-color .2s ease}'
  + '.mdm-chat-btn:hover{transform:translateY(-2px);border-color:' + W + '}'
  + '.mdm-chat-btn .mdm-emb{animation:mdmPulse 3.2s ease-out infinite}'
  + '.mdm-chat-btn[aria-expanded="true"] .mdm-emb{animation:none}'
  + '.mdm-lbl b{display:block;font-size:15px;font-weight:600;letter-spacing:-.01em}'
  + '.mdm-lbl small,.mdm-head small{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted,#A3A9AF)}'
  + '.mdm-live{width:7px;height:7px;border-radius:50%;background:#3DDC84;box-shadow:0 0 0 3px rgba(61,220,132,.18)}'
  + '.mdm-chat{position:fixed;right:20px;bottom:96px;z-index:59;width:min(390px,calc(100vw - 32px));height:min(580px,calc(100svh - 130px));display:flex;flex-direction:column;background:var(--surface,#14171A);color:' + BONE + ';border:1px solid ' + LINE + ';border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6);font-family:' + SANS + ';animation:mdmIn .28s ease}'
  + '.mdm-chat[hidden]{display:none!important}'
  + '.mdm-head{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;border-bottom:1px solid rgba(194,154,107,.25);background:linear-gradient(180deg,#121518,' + INK + ')}'
  + '.mdm-head b{display:block;font-size:15px;font-weight:600}'
  + '.mdm-close{margin-left:auto;width:44px;height:44px;border:0;border-radius:10px;background:transparent;color:inherit;font-size:24px;line-height:1;cursor:pointer}'
  + '.mdm-close:hover{background:rgba(245,245,243,.08)}'
  + '.mdm-log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:18px 14px;display:flex;flex-direction:column;gap:12px}'
  + '.mdm-row{display:flex;align-items:flex-end;gap:8px;max-width:92%}'
  + '.mdm-msg{padding:11px 14px;border-radius:16px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}'
  + '.mdm-row .mdm-msg{background:#1E2226;border:1px solid #2A2F34;border-bottom-left-radius:6px}'
  + '.mdm-msg.me{align-self:flex-end;max-width:85%;background:' + BONE + ';color:' + INK + ';border-bottom-right-radius:6px}'
  + '.mdm-dots{display:inline-flex;gap:5px;padding:4px 2px}'
  + '.mdm-dots i{width:7px;height:7px;border-radius:50%;background:' + W + ';animation:mdmDot 1.2s infinite}'
  + '.mdm-dots i:nth-child(2){animation-delay:.15s}.mdm-dots i:nth-child(3){animation-delay:.3s}'
  + '.mdm-was{display:flex;flex-direction:column;gap:8px;margin-left:36px}'
  + '.mdm-wa{display:flex;align-items:center;gap:10px;min-height:46px;padding:0 14px;border-radius:12px;background:#25D366;color:#0B0D0F;font-weight:700;font-size:14px;text-decoration:none}'
  + '.mdm-wa small{font-weight:500;margin-left:auto;opacity:.75}'
  + '.mdm-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 12px}'
  + '.mdm-chips[hidden]{display:none!important}'
  + '.mdm-chips button{min-height:36px;padding:0 12px;border-radius:999px;border:1px solid ' + LINE + ';background:transparent;color:#D0D3D6;font:500 13px ' + SANS + ';cursor:pointer}'
  + '.mdm-chips button:hover{border-color:' + W + ';color:' + BONE + '}'
  + '.mdm-form{display:flex;gap:8px;padding:12px;border-top:1px solid ' + LINE + ';background:' + INK + '}'
  + '.mdm-form input{flex:1;min-width:0;min-height:46px;padding:0 14px;border-radius:12px;border:1px solid ' + LINE + ';background:var(--surface,#14171A);color:' + BONE + ';font:400 16px ' + SANS + '}'
  + '.mdm-form input:focus{outline:2px solid ' + W + ';outline-offset:1px}'
  + '.mdm-form button{min-height:46px;padding:0 16px;border-radius:12px;border:0;background:' + W + ';color:' + INK + ';font:700 14px ' + SANS + ';cursor:pointer}'
  + '.mdm-form button:disabled{opacity:.5;cursor:default}'
  + '.mdm-note{padding:0 14px 10px;font-size:11px;color:var(--muted,#A3A9AF);text-align:center;background:' + INK + '}'
  + '.mdm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  + '@media (max-width:899px){'
  + '.mdm-chat-btn{bottom:calc(84px + env(safe-area-inset-bottom,0px));right:16px;padding:5px}'
  + '.mdm-lbl{display:none}'
  + '.mdm-chat{right:12px;left:12px;width:auto;bottom:calc(152px + env(safe-area-inset-bottom,0px));height:min(540px,calc(100svh - 190px))}'
  + '}'
  + '@media (prefers-reduced-motion:reduce){.mdm-emb::before,.mdm-chat-btn .mdm-emb,.mdm-chat,.mdm-dots i{animation:none!important}}'
  + 'html.intro-on .mdm-chat-btn{opacity:0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function emb(size){ return '<span class="mdm-emb' + (size ? ' ' + size : '') + '" aria-hidden="true"><img src="' + LOGO + '" alt="" width="160" height="73"></span>'; }

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'mdm-chat-btn';
  btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mdmChat');
  btn.setAttribute('aria-label', 'Pregúntale al Maestro: asistente de Manos de Maestro');
  btn.innerHTML = emb('') + '<span class="mdm-lbl"><b>Pregúntale al Maestro</b><small><span class="mdm-live"></span>En línea · responde al tiro</small></span>';

  var box = document.createElement('section');
  box.className = 'mdm-chat'; box.id = 'mdmChat'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Asistente de Manos de Maestro');
  box.innerHTML = ''
    + '<div class="mdm-head">' + emb('sm') + '<div><b>Manos de Maestro</b><small><span class="mdm-live"></span>Asistente con IA · en línea</small></div>'
    + '<button type="button" class="mdm-close" aria-label="Cerrar asistente">×</button></div>'
    + '<div class="mdm-log" aria-live="polite"></div>'
    + '<div class="mdm-chips"><button type="button">Quiero construir una casa</button><button type="button">¿Qué es el panel SIP?</button><button type="button">¿Trabajan en mi comuna?</button></div>'
    + '<form class="mdm-form"><label for="mdmInput" class="mdm-sr">Escribe tu mensaje</label>'
    + '<input id="mdmInput" type="text" maxlength="500" autocomplete="off" placeholder="Escribe tu pregunta...">'
    + '<button type="submit">Enviar</button></form>'
    + '<div class="mdm-note">Asistente con IA. Precios y plazos los ven Miguel e Ignacio en la visita.</div>';

  document.body.appendChild(box); document.body.appendChild(btn);
  var log = box.querySelector('.mdm-log'), form = box.querySelector('.mdm-form'), input = box.querySelector('input');
  var send = form.querySelector('button'), chips = box.querySelector('.mdm-chips'), close = box.querySelector('.mdm-close');
  var history = [], busy = false, started = false;

  function track(name, data){ try { if (window.va) window.va('event', { name: name, data: data || {} }); } catch (e) {} }
  function down(){ log.scrollTop = log.scrollHeight; }
  function me(text){ var d = document.createElement('div'); d.className = 'mdm-msg me'; d.textContent = text; log.appendChild(d); down(); }
  function bot(text){
    var row = document.createElement('div'); row.className = 'mdm-row'; row.innerHTML = emb('xs');
    var d = document.createElement('div'); d.className = 'mdm-msg'; row.appendChild(d);
    if (text == null) d.innerHTML = '<span class="mdm-dots" aria-label="Escribiendo"><i></i><i></i><i></i></span>'; else d.textContent = text;
    log.appendChild(row); down(); return { row: row, el: d };
  }
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
    log.appendChild(wrap); down();
  }
  function open(){
    box.hidden = false; btn.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true; track('Asistente abierto');
      var hi = '¡Hola, buenas tardes! 👋 Soy el asistente de Manos de Maestro. Pregúntame lo que quieras sobre tu casa o tu proyecto, y con gusto te oriento.';
      bot(hi); history.push({ role: 'assistant', text: hi });
    }
    setTimeout(function(){ input.focus(); }, 60);
  }
  function shut(){ box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  btn.addEventListener('click', function(){ box.hidden ? open() : shut(); });
  close.addEventListener('click', shut);
  box.addEventListener('keydown', function(e){ if (e.key === 'Escape') shut(); });
  box.setAttribute('data-lenis-prevent', '');

  var WA_RE = /\n?\s*WHATSAPP:\s*/i;
  function ask(text){
    text = (text || '').trim(); if (!text || busy) return;
    chips.hidden = true; busy = true; send.disabled = true;
    me(text); history.push({ role: 'user', text: text });
    var b = bot(null), full = '', gotAny = false;
    var ctrl = window.AbortController ? new AbortController() : null;
    var stop = setTimeout(function(){ if (ctrl) ctrl.abort(); }, 35000);
    function paint(){
      var shown = full.split(WA_RE)[0].replace(/\*\*/g, '').trim();
      if (shown) { b.el.textContent = shown; down(); }
    }
    fetch('/api/chat', { signal: ctrl ? ctrl.signal : undefined, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) })
      .then(function(r){
        if (!r.ok) throw new Error('http ' + r.status);
        if (!r.body || !r.body.getReader) return r.text().then(function(t){ full = t; gotAny = true; paint(); });
        var reader = r.body.getReader(), dec = new TextDecoder();
        function pump(){
          return reader.read().then(function(x){
            if (x.done) return;
            full += dec.decode(x.value, { stream: true }); gotAny = true; paint();
            return pump();
          });
        }
        return pump();
      })
      .then(function(){
        if (!full.trim()) throw new Error('vacío');
        var parts = full.split(WA_RE), reply = parts[0].replace(/\*\*/g, '').trim(), summary = parts[1] ? parts[1].split('\n')[0].replace(/^["“]|["”]$/g, '').trim() : null;
        if (reply) { b.el.textContent = reply; history.push({ role: 'assistant', text: reply }); } else b.row.remove();
        if (summary) addWa(summary);
      })
      .catch(function(){
        if (gotAny && full.trim()) { paint(); history.push({ role: 'assistant', text: full.split(WA_RE)[0].trim() }); return; }
        b.el.textContent = 'Uy, el asistente no está disponible en este momento 🙏 Escríbenos directo por WhatsApp y te respondemos personalmente.';
        addWa(null);
      })
      .then(function(){ clearTimeout(stop); busy = false; send.disabled = false; input.focus(); });
  }
  form.addEventListener('submit', function(e){ e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  chips.addEventListener('click', function(e){ if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });
})();
