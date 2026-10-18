(function(){
  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lenis=null;
  // the intro (head script + CSS) lasts ~1.1s before the hero is uncovered
  var introDelay=document.documentElement.classList.contains('intro-on')?.95:0;

  // photos inside each work fade in once loaded; strips load all their photos as they come near
  $$('.cs-ph img, .cc img, .ph img, .gal img, .story-mobile img, .casa-fin img, .campo-hero img, .campo-more img, .bq-hero img, .techo-fin img').forEach(function(img){
    function ld(){ img.classList.add('is-ld'); }
    img.classList.add('fade-img'); if(img.complete && img.naturalWidth) ld(); else { img.addEventListener('load', ld); img.addEventListener('error', ld); }
  });
  $$('.casa-steps, .campo-pin, .story-mobile, .gal').forEach(function(strip){
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ $$('img[loading="lazy"]',strip).forEach(function(i){i.loading='eager';}); io.disconnect(); } },{rootMargin:'400px 0px'});
      io.observe(strip);
    }
    if(strip.classList.contains('story-mobile') || strip.classList.contains('gal')) return;
    var bar=document.createElement('div'); bar.className='rail-prog'; bar.setAttribute('aria-hidden','true'); bar.innerHTML='<i></i>';
    strip.parentNode.insertBefore(bar, strip.nextSibling);
    var fill=bar.firstChild, raf=0;
    function upd(){ raf=0; var m=strip.scrollWidth-strip.clientWidth; fill.style.transform='scaleX('+(m>0?.15+.85*strip.scrollLeft/m:1).toFixed(3)+')'; }
    strip.addEventListener('scroll', function(){ if(!raf) raf=requestAnimationFrame(upd); }, {passive:true});
    upd();
  });

  // header: solid after hero top, hides on scroll down, returns on scroll up
  var hdr=$('#hdr'), lastY=0, docEl=document.documentElement;
  function onScroll(){
    var y=window.scrollY, max=docEl.scrollHeight-window.innerHeight;
    hdr.style.setProperty('--p', max>0?(y/max).toFixed(4):0);
    hdr.classList.toggle('solid', y>32);
    if(!document.body.classList.contains('lb-open')) hdr.classList.toggle('away', y>lastY && y>600);
    lastY=y;
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // video: plays only while visible
  var vid=$('#procVid'), vb=$('#vidBtn'), userPaused=false;
  vb.addEventListener('click', function(){ if(vid.paused){vid.play().catch(function(){}); userPaused=false; vb.textContent='Pausar';} else {vid.pause(); userPaused=true; vb.textContent='Reproducir';} });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ if(!userPaused && !reduce){ vid.preload='auto'; vid.play().catch(function(){}); } } else vid.pause(); });},{threshold:.25}).observe(vid);
    if(reduce){vb.textContent='Reproducir';}
    var mbar=$('#mbar'), hero=$('.hero'), contact=$('#contacto'), heroIn=true, contactIn=false, quoteIn=false;
    function upd(){mbar.classList.toggle('hide', heroIn||contactIn||quoteIn);}
    new IntersectionObserver(function(es){es.forEach(function(e){quoteIn=e.isIntersecting;}); upd();},{threshold:.15}).observe($('#qf'));
    new IntersectionObserver(function(es){es.forEach(function(e){heroIn=e.isIntersecting;}); upd();},{threshold:.35}).observe(hero);
    new IntersectionObserver(function(es){es.forEach(function(e){contactIn=e.isIntersecting;}); upd();},{threshold:.2}).observe(contact);
  }

  // mobile story carousel dots
  var sm=$('#storyMobile'), dots=$$('#storyDots i');
  if(sm){ sm.addEventListener('scroll', function(){ var i=Math.round(sm.scrollLeft/(sm.firstElementChild.offsetWidth+12)); dots.forEach(function(d,k){d.classList.toggle('on',k===i);}); }, {passive:true}); }

  // gallery arrows
  var gal=$('#gal'), gp=$('#galPrev'), gn=$('#galNext');
  function step(){var f=gal.querySelector('figure'); return f? f.offsetWidth+14 : 300;}
  var galProg=$('#galProg');
  function galState(){
    gp.disabled=gal.scrollLeft<8; gn.disabled=gal.scrollLeft+gal.clientWidth>=gal.scrollWidth-8;
    var m=gal.scrollWidth-gal.clientWidth; if(!gal.classList.contains('pinned')) galProg.style.transform='scaleX('+(m>0?.18+.82*gal.scrollLeft/m:1).toFixed(3)+')';
  }
  gp.addEventListener('click', function(){gal.scrollBy({left:-step(),behavior:'smooth'});});
  gn.addEventListener('click', function(){gal.scrollBy({left:step(),behavior:'smooth'});});
  gal.addEventListener('scroll', galState, {passive:true}); window.addEventListener('resize', galState); galState();
  // drag to scroll with the mouse on desktop
  var down=false, sx=0, sl=0, moved=false;
  gal.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse' || gal.classList.contains('pinned')) return; down=true; moved=false; sx=e.clientX; sl=gal.scrollLeft; gal.style.scrollSnapType='none'; });
  window.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4) moved=true; gal.scrollLeft=sl-dx; });
  window.addEventListener('pointerup', function(){ if(!down) return; down=false; gal.style.scrollSnapType=''; if(moved){ var s=step(); gal.scrollTo({left:Math.round(gal.scrollLeft/s)*s,behavior:'smooth'}); } });
  gal.addEventListener('click', function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
  gal.addEventListener('keydown', function(e){ if(e.key==='ArrowRight'){gn.click();e.preventDefault();} if(e.key==='ArrowLeft'){gp.click();e.preventDefault();} });

  // lightbox
  var lb=$('#lb'), lbImg=$('#lbImg'), list=[], idx=0;
  function zoomFrom(el){
    var r=el.getBoundingClientRect(), f=lbImg.getBoundingClientRect();
    if(reduce || !lbImg.animate || !f.width || !r.width) return;
    var k=Math.max(r.width/f.width, r.height/f.height);
    var dx=(r.left+r.width/2)-(f.left+f.width/2), dy=(r.top+r.height/2)-(f.top+f.height/2);
    lbImg.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+k+')',opacity:.6},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  function show(i, zoom){
    idx=(i+list.length)%list.length; var el=list[idx];
    lbImg.style.opacity=0;
    var src=el.getAttribute('data-full')||el.currentSrc||el.src, pre=new Image();
    pre.onload=pre.onerror=function(){ lbImg.src=src; lbImg.alt=el.alt; lbImg.style.opacity=1; if(zoom) requestAnimationFrame(function(){zoomFrom(el);}); };
    pre.src=src;
  }
  function openLb(el){
    var g=el.getAttribute('data-lb'); list=$$('img[data-lb="'+g+'"]'); show(list.indexOf(el), true);
    if(typeof lb.showModal==='function') lb.showModal(); else lb.setAttribute('open','');
    document.body.classList.add('lb-open'); if(lenis) lenis.stop();
  }
  function closeLb(){ if(lb.open){ if(typeof lb.close==='function') lb.close(); else lb.removeAttribute('open'); } }
  lb.addEventListener('close', function(){ document.body.classList.remove('lb-open'); if(lenis) lenis.start(); });
  $$('img[data-lb]').forEach(function(img){
    img.setAttribute('tabindex','0'); img.setAttribute('role','button');
    img.addEventListener('click', function(){openLb(img);});
    img.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault(); openLb(img);} });
  });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', function(){show(idx-1);});
  $('#lbN').addEventListener('click', function(){show(idx+1);});
  lb.addEventListener('click', function(e){ if(e.target===lb || e.target.tagName==='FIGURE') closeLb(); });
  lb.addEventListener('keydown', function(e){ if(e.key==='ArrowRight') show(idx+1); if(e.key==='ArrowLeft') show(idx-1); });
  var tx=null, ty=null;
  lb.addEventListener('touchstart', function(e){ tx=e.touches[0].clientX; ty=e.touches[0].clientY; }, {passive:true});
  lb.addEventListener('touchend', function(e){ if(tx===null) return; var dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)) show(idx+(dx<0?1:-1)); else if(dy>90) closeLb(); tx=null; }, {passive:true});

  if(fine && !reduce){
    $$('.svc article, .pcard').forEach(function(c){
      c.addEventListener('pointermove', function(e){ var r=c.getBoundingClientRect(); c.style.setProperty('--mx',(e.clientX-r.left)+'px'); c.style.setProperty('--my',(e.clientY-r.top)+'px'); });
    });
    $$('.magnet').forEach(function(b){
      b.addEventListener('pointermove', function(e){ var r=b.getBoundingClientRect(); var x=(e.clientX-r.left-r.width/2)*.18, y=(e.clientY-r.top-r.height/2)*.3; b.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)'; });
      b.addEventListener('pointerleave', function(){ b.style.transition='transform .6s cubic-bezier(.22,1,.36,1)'; b.style.transform=''; setTimeout(function(){b.style.transition='';},600); });
    });
  }

  // chapter indicator: tells you where you are in the story
  var chap=$('#chap'), chapN=$('#chapN'), chapT=$('#chapT'), curChap='';
  if(chap && 'IntersectionObserver' in window){
    var chapIO=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var v=e.target.getAttribute('data-chap'); if(v===curChap) return; curChap=v;
        var parts=v.split('|'); chap.classList.add('on','swap');
        setTimeout(function(){ chapN.textContent=parts[0]; chapT.textContent=parts[1]; chap.classList.remove('swap'); },220);
      });
    },{rootMargin:'-50% 0px -50% 0px'});
    $$('[data-chap]').forEach(function(s){chapIO.observe(s);});
    new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ chap.classList.remove('on'); curChap=''; } }); },{threshold:.5}).observe($('.hero'));
  }

  // contact logo gleams once when it comes into view
  var cm=$('#contactMark');
  if(cm && 'IntersectionObserver' in window){ var cmIO=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ cm.classList.add('on'); cmIO.disconnect(); } },{threshold:.6}); cmIO.observe(cm); }

  // FAQ: one open at a time, animated height
  $$('.qa details').forEach(function(d){
    var s=d.querySelector('summary'), body=d.querySelector('div');
    s.addEventListener('click', function(e){
      if(reduce || !body.animate) return;
      e.preventDefault();
      if(d.open){ var h=body.offsetHeight; body.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'}).onfinish=function(){d.open=false;}; }
      else { $$('.qa details[open]').forEach(function(o){ if(o!==d) o.open=false; }); d.open=true; var h2=body.offsetHeight; body.animate([{height:'0px',opacity:0},{height:h2+'px',opacity:1}],{duration:340,easing:'cubic-bezier(.22,1,.36,1)'}); }
    });
  });



  // analytics: every WhatsApp tap and every quote sent (Vercel Web Analytics custom events)
  function track(name,data){ try{ if(window.va) window.va('event',{name:name,data:data}); }catch(x){} }
  function origin(a){ var s=a.closest('section,header,footer,.mbar'); return a.getAttribute('data-obra')||(s&&(s.id||s.className.split(' ')[0]))||'otro'; }
  var lastOrigin='';
  document.addEventListener('click', function(e){
    var a=e.target.closest && e.target.closest('a[href*="wa.me"]'); if(!a) return;
    if(a.classList.contains('who-opt')){ track('WhatsApp abierto',{socio:a.getAttribute('data-name'),origen:lastOrigin||'menú'}); return; }
    if(a.id==='qAgain'){ track('WhatsApp abierto',{socio:'reintento',origen:'formulario'}); return; }
    lastOrigin=origin(a);
    track('Botón WhatsApp',{origen:lastOrigin});
    if(a.hasAttribute('data-direct')) track('WhatsApp abierto',{socio:(a.href.indexOf('56965836682')>-1?'Ignacio':'Miguel'),origen:lastOrigin});
  }, true);

  // WhatsApp: Miguel and Ignacio are both main contacts, so buttons ask who to write to
  var who=$('#who'), whoOpts=$$('.who-opt'), whoCb=null;
  function personal(text,name){ return text.replace(/^Hola,?/, 'Hola '+name+','); }
  function closeWho(){
    if(!who.open) return;
    if(reduce){ who.close(); return; }
    who.classList.add('closing');
    setTimeout(function(){ who.classList.remove('closing'); who.close(); },220);
  }
  function openWho(text, cb){
    whoOpts.forEach(function(a){ a.href='https://wa.me/'+a.getAttribute('data-n')+'?text='+encodeURIComponent(personal(text,a.getAttribute('data-name'))); });
    whoCb=cb||null; who.showModal(); if(lenis) lenis.stop();
  }
  var canSheet=typeof who.showModal==='function';
  if(canSheet){
    $$('a[data-who]').forEach(function(a){
      a.addEventListener('click', function(e){
        e.preventDefault();
        var t=''; try{ t=new URL(a.href).searchParams.get('text')||''; }catch(x){}
        openWho(t);
      });
    });
    whoOpts.forEach(function(a){ a.addEventListener('click', function(){ var cb=whoCb; whoCb=null; setTimeout(closeWho,120); if(cb) cb(a.href); }); });
    $('#whoX').addEventListener('click', closeWho);
    who.addEventListener('click', function(e){ if(e.target===who) closeWho(); });
    who.addEventListener('cancel', function(e){ e.preventDefault(); closeWho(); });
    who.addEventListener('close', function(){ if(lenis && !document.body.classList.contains('lb-open')) lenis.start(); });
    // swipe the sheet down to dismiss on phones
    var sy=null, inner=$('.who-in');
    inner.addEventListener('touchstart', function(e){ sy=e.touches[0].clientY; }, {passive:true});
    inner.addEventListener('touchend', function(e){ if(sy!==null && e.changedTouches[0].clientY-sy>70) closeWho(); sy=null; }, {passive:true});
  }

  // quote form: four short steps, ends by opening WhatsApp with the answers written out
  (function(){
    var f=$('#qf'); if(!f) return;
    var steps=$$('.qs',f), last=steps.length-2, cur=0, busy=false;
    var bar=$('#qBar'), count=$('#qCount'), title=$('#qTitle'), back=$('#qBack'), nextT=$('#qNextT'), box=$('#qSteps'), sum=$('#qSum');
    var m2=$('#qM2'), nose=$('#qNose'), name=$('#qName'), desc=$('#qDesc');

    function checked(n){ return $$('input[name="'+n+'"]:checked',f).map(function(i){return i.value;}); }
    function m2Val(){ var v=parseFloat(m2.value.replace(',','.')); return isFinite(v)?v:NaN; }
    function data(){
      return {tipo:checked('tipo'), comuna:checked('comuna')[0]||'', m2:nose.checked?'No sé':(m2.value.trim()?m2.value.trim().replace('.',',')+' m²':''),
        cuando:checked('cuando')[0]||'', nombre:name.value.trim().replace(/\s+/g,' '), desc:desc.value.trim()};
    }
    function err(i,msg,el){
      var e=$('.qerr',steps[i]); e.textContent=msg||'';
      $$('.qinput.bad',steps[i]).forEach(function(x){x.classList.remove('bad');});
      if(!msg) return true;
      if(el){ el.closest('.qinput') && el.closest('.qinput').classList.add('bad'); el.focus({preventScroll:true}); }
      steps[i].classList.remove('shake'); void steps[i].offsetWidth; steps[i].classList.add('shake');
      return false;
    }
    function valid(i){
      var d=data();
      if(i===0 && !d.tipo.length) return err(0,'Elige al menos un tipo de trabajo para seguir.');
      if(i===1 && !d.comuna) return err(1,'Elige la comuna donde es la obra.');
      if(i===2){
        if(!nose.checked){
          var v=m2Val();
          if(!m2.value.trim()) return err(2,'Indica los m² aproximados o toca «No sé». No tiene que ser exacto.',m2);
          if(!(v>0 && v<=5000)) return err(2,'Escribe solo el número de m², por ejemplo 12.',m2);
        }
        if(!d.cuando) return err(2,'Cuéntanos cuándo te gustaría empezar.');
      }
      if(i===3){
        if(d.nombre.length<2) return err(3,'¿Cómo te llamas? Así sabemos a quién responder.',name);
        if(d.desc.length<8) return err(3,'Cuéntanos en pocas palabras qué quieres hacer.',desc);
      }
      return err(i,'');
    }
    function summary(){
      var d=data(), items=[];
      if(d.tipo.length) items.push(d.tipo.join(' + '));
      if(cur>=1 && d.comuna) items.push(d.comuna);
      if(cur>=2 && d.m2) items.push(d.m2);
      if(cur>=2 && d.cuando) items.push(d.cuando);
      var html=items.map(function(t){return '<li>'+t.replace(/[<>&]/g,'')+'</li>';}).join('');
      if(sum.getAttribute('data-h')!==html){ sum.innerHTML=html; sum.setAttribute('data-h',html); }
    }
    function message(){
      var d=data();
      return 'Hola, buenas tardes 👋 Vi la página de Manos de Maestro y me gustaría cotizar, por favor.\n\n'+
        '🏠 Trabajo: '+d.tipo.join(', ')+'\n'+
        '📍 Comuna: '+d.comuna+'\n'+
        '📐 Tamaño aproximado: '+d.m2+'\n'+
        '🗓️ Para cuándo: '+d.cuando+'\n'+
        '👤 Nombre: '+d.nombre+'\n'+
        '📝 Detalle: '+d.desc+'\n\n'+
        'Les envío fotos del espacio por aquí 📸 ¡Muchas gracias!';
    }
    function ui(){
      var done=cur>last;
      bar.style.transform='scaleX('+(done?1:(cur+1)/(last+1))+')';
      count.textContent=done?'Listo':'Paso '+(cur+1)+' de '+(last+1);
      title.textContent=steps[cur].getAttribute('data-title');
      back.hidden=cur===0||done;
      nextT.textContent=cur===last?'Abrir WhatsApp':'Continuar';
      f.classList.toggle('done',done);
      summary();
    }
    function go(to){
      if(busy || to===cur) return;
      var from=steps[cur], dest=steps[to], dir=to>cur?1:-1, h0=box.offsetHeight;
      cur=to; ui();
      var focusEl=$('legend, h3',dest);
      if(reduce || !from.animate){ from.classList.remove('on'); dest.classList.add('on'); if(focusEl) focusEl.focus({preventScroll:true}); return; }
      busy=true;
      box.style.height=h0+'px';
      from.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateX('+(-28*dir)+'px)'}],{duration:180,easing:'cubic-bezier(.4,0,1,1)'}).onfinish=function(){
        from.classList.remove('on'); dest.classList.add('on');
        var h1=dest.offsetHeight; box.style.height=h1+'px';
        dest.animate([{opacity:0,transform:'translateX('+(36*dir)+'px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'}).onfinish=function(){ box.style.height=''; busy=false; };
        if(focusEl) focusEl.focus({preventScroll:true});
        var r=f.getBoundingClientRect();
        if(r.top<0 || r.top>window.innerHeight*.5){ var y=window.scrollY+r.top-90; if(lenis) lenis.scrollTo(y,{duration:.8}); else window.scrollTo({top:y,behavior:'smooth'}); }
      };
    }
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(cur>last || !valid(cur)) return;
      if(cur<last){ go(cur+1); return; }
      var dq=data(); track('Formulario enviado',{tipo:dq.tipo.join(', '),comuna:dq.comuna}); lastOrigin='formulario';
      var done=function(url){ $('#qAgain').href=url; go(last+1); };
      if(canSheet){ openWho(message(), done); return; }
      var url='https://wa.me/56977107052?text='+encodeURIComponent(message());
      done(url); location.href=url;
    });
    back.addEventListener('click', function(){ if(cur>0) go(cur-1); });
    $('#qReset').addEventListener('click', function(){ f.reset(); err(3,''); go(0); });
    f.addEventListener('change', function(e){
      var t=e.target;
      if(t===nose){ m2.closest('.qinput').classList.toggle('off',nose.checked); if(nose.checked){ m2.value=''; } }
      if($('.qerr',steps[cur]).textContent) err(cur,'');
      summary();
    });
    m2.addEventListener('input', function(){
      m2.value=m2.value.replace(/[^0-9.,]/g,'');
      if(m2.value && nose.checked){ nose.checked=false; m2.closest('.qinput').classList.remove('off'); }
      summary();
    });
    // Enter inside the description adds a line; elsewhere it moves on
    desc.addEventListener('keydown', function(e){ if(e.key==='Enter' && (e.metaKey||e.ctrlKey)){ e.preventDefault(); f.requestSubmit ? f.requestSubmit() : $('#qNext').click(); } });
    ui();
  })();

  // house stages start lit; with motion they light up one by one below
  var stageLis=$$('.stages li'); stageLis.forEach(function(li){li.classList.add('on');});

  if(reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var ease='power3.out';

  // smooth wheel on desktop only; touch keeps native iOS / Android scrolling
  if(window.Lenis && window.matchMedia('(min-width: 900px) and (pointer: fine)').matches){
    lenis=new Lenis({lerp:.1, smoothWheel:true, syncTouch:false, prevent:function(n){return n.closest && n.closest('.gal, dialog');}});
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000);});
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var id=a.getAttribute('href'); var el=id.length>1?document.querySelector(id):document.body; if(!el) return;
      ev.preventDefault();
      if(lenis) lenis.scrollTo(el,{offset:id==='#inicio'?0:-72,duration:1.3}); else el.scrollIntoView({behavior:'smooth'});
    });
  });

  // headings: each word rises from behind a mask
  function split(el){
    Array.prototype.slice.call(el.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function(w){
          if(!w) return;
          if(/^\s+$/.test(w)){ frag.appendChild(document.createTextNode(' ')); return; }
          var o=document.createElement('span'), i=document.createElement('span'); o.className='wd'; i.className='wi'; i.textContent=w; o.appendChild(i); frag.appendChild(o);
        });
        n.parentNode.replaceChild(frag,n);
      } else if(n.nodeType===1) split(n);
    });
  }
  $$('.split').forEach(function(h){
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g,' ').trim()); split(h);
    $$('.wd',h).forEach(function(w){w.setAttribute('aria-hidden','true');});
    var words=$$('.wi',h);
    if(h.closest('.hero')) return;
    gsap.fromTo(words,{yPercent:110},{yPercent:0,duration:1,ease:'expo.out',stagger:.045,scrollTrigger:{trigger:h,start:'top 88%',once:true}});
  });

  // hero entrance (after the intro) + gentle parallax as it scrolls away
  gsap.fromTo('#heroImg',{scale:1.14},{scale:1,duration:2.6,ease:'power2.out',delay:introDelay*.6});
  gsap.fromTo('.hero .li',{yPercent:112},{yPercent:0,duration:1.15,ease:'expo.out',stagger:.12,delay:introDelay+.1});
  gsap.from('.cue',{opacity:0,y:-10,duration:.8,ease:ease,delay:introDelay+.9});
  gsap.from('.hero .rv',{y:24,duration:.9,ease:ease,stagger:.09,delay:introDelay+.2});
  gsap.to('.hero-media',{yPercent:14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero .wrap',{yPercent:-10,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'center center',end:'bottom top',scrub:true}});

  // ticker speeds up with scroll velocity
  var track=$('.ticker-track');
  if(track && track.getAnimations){
    var anim=track.getAnimations()[0];
    if(anim){ ScrollTrigger.create({trigger:'.ticker',start:'top bottom',end:'bottom top',onUpdate:function(self){ var v=Math.min(Math.abs(self.getVelocity())/600,4); anim.playbackRate=1+v; gsap.to(anim,{playbackRate:1,duration:.8,overwrite:true}); }}); }
  }

  // reveals: a soft rise, always fully visible (transform only)
  gsap.utils.toArray('.reveal').forEach(function(el){
    gsap.fromTo(el,{y:26},{y:0,duration:.9,ease:ease,scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  gsap.utils.toArray('.reveal-group').forEach(function(g){
    gsap.fromTo(g.children,{y:26},{y:0,duration:.9,ease:ease,stagger:.07,scrollTrigger:{trigger:g,start:'top 86%',once:true}});
  });
  gsap.utils.toArray('.img-reveal').forEach(function(box){
    var img=box.querySelector('img,video');
    gsap.fromTo(box,{clipPath:'inset(6% 6% 6% 6% round 10px)'},{clipPath:'inset(0% 0% 0% 0% round 10px)',duration:1.1,ease:'power3.inOut',scrollTrigger:{trigger:box,start:'top 90%',once:true}});
    if(box.classList.contains('par')) return;
    gsap.fromTo(img,{scale:1.12},{scale:1,duration:1.4,ease:ease,scrollTrigger:{trigger:box,start:'top 90%',once:true},clearProps:'transform'});
  });
  // big finished-house photos drift gently inside their frame (transform only)
  gsap.utils.toArray('.par').forEach(function(box){
    var img=box.querySelector('img');
    gsap.fromTo(img,{yPercent:-5,scale:1.12},{yPercent:5,scale:1.12,ease:'none',scrollTrigger:{trigger:box,start:'top bottom',end:'bottom top',scrub:true}});
  });

  // count up numbers
  $$('.count').forEach(function(el){
    var to=+el.getAttribute('data-to'), o={v:0};
    ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){ gsap.to(o,{v:to,duration:1.6,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v);}}); }});
    el.textContent='0';
  });

  // manifesto sentence by sentence, tied to scroll
  gsap.fromTo('#manifesto .w',{opacity:.4},{opacity:1,ease:'none',stagger:.5,scrollTrigger:{trigger:'.manifesto',start:'top 70%',end:'bottom 60%',scrub:.3}});

  // light sections rise in as a rounded card and settle full width
  gsap.utils.toArray('.morph').forEach(function(sec){
    gsap.fromTo(sec,{clipPath:'inset(0% 4% 0% 4% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:sec,start:'top bottom',end:'top 25%',scrub:true}});
  });
  // house stages: the line fills with scroll and each stage lights up as it is reached
  var stagesEl=$('#stages');
  if(stagesEl){
    stageLis.forEach(function(li){li.classList.remove('on');});
    stagesEl.style.setProperty('--f',0);
    ScrollTrigger.create({trigger:stagesEl,start:'top 72%',end:'bottom 52%',scrub:.4,onUpdate:function(self){
      var pr=self.progress; stagesEl.style.setProperty('--f',pr.toFixed(3));
      stageLis.forEach(function(li,k){ li.classList.toggle('on', pr>=k/(stageLis.length-1)-.02); });
    }});
    gsap.fromTo(stageLis,{x:-12,opacity:.4},{x:0,opacity:1,duration:.7,ease:ease,stagger:.07,scrollTrigger:{trigger:stagesEl,start:'top 80%',once:true}});
  }
  // process steps light up one after another
  $$('.steps li').forEach(function(li){
    gsap.fromTo(li.querySelector('.n'),{opacity:.3},{opacity:1,scrollTrigger:{trigger:li,start:'top 75%',end:'top 55%',scrub:true}});
  });

  var mm=gsap.matchMedia();
  mm.add('(min-width: 900px)', function(){
    // pinned before -> after story
    var imgs=$$('.story-frame img'), steps=$$('.step'), tag=$('#storyTag'), bar=$('#storyBar');
    var labels=['Antes','Proceso','Terminado'];
    function mark(i){steps.forEach(function(s,k){s.classList.toggle('on',k===i);}); tag.textContent=labels[i];}
    var tl=gsap.timeline({scrollTrigger:{trigger:'#story',start:'top top',end:'+=120%',pin:true,scrub:.3,
      onUpdate:function(self){ mark(self.progress<.3?0:self.progress<.7?1:2); bar.style.transform='scaleX('+self.progress.toFixed(3)+')'; }}});
    tl.fromTo(imgs[0],{scale:1.06},{scale:1,duration:.3,ease:'none'},0)
      .to(imgs[1],{opacity:1,duration:.1,ease:'none'},.25).fromTo(imgs[1],{scale:1.06},{scale:1,duration:.35,ease:'none'},.25)
      .to(imgs[2],{opacity:1,duration:.1,ease:'none'},.62).fromTo(imgs[2],{scale:1.06},{scale:1,duration:.38,ease:'none'},.62);
    // gentle parallax on big project photos
    gsap.utils.toArray('.ph.big img').forEach(function(img){
      gsap.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:img.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    });
    // services cards rise in sequence
    // partners cards drift
    gsap.utils.toArray('.pcard').forEach(function(c,i){ gsap.fromTo(c,{y:i?60:20},{y:0,ease:'none',scrollTrigger:{trigger:'.pair',start:'top bottom',end:'center center',scrub:true}}); });
  });
  mm.add('(min-width: 900px) and (pointer: fine)', function(){
    // gallery: vertical scroll drives a horizontal pan
    var track=$('#galTrack');
    gal.classList.add('pinned'); gal.scrollLeft=0;
    function dist(){ return Math.max(0, track.scrollWidth-window.innerWidth); }
    var tw=gsap.to(track,{x:function(){return -dist();},ease:'none',scrollTrigger:{trigger:'.gallery',start:'top top',end:function(){return '+='+dist();},pin:true,scrub:.6,invalidateOnRefresh:true,
      onUpdate:function(self){ galProg.style.transform='scaleX('+(.18+.82*self.progress).toFixed(3)+')'; }}});
    gsap.fromTo('.gal figure',{y:40,opacity:.4},{y:0,opacity:1,stagger:.06,duration:.9,ease:ease,scrollTrigger:{trigger:'.gallery',start:'top 70%',once:true}});
    return function(){ gal.classList.remove('pinned'); tw.kill(); gsap.set(track,{clearProps:'transform'}); };
  });
  // triggers above were created out of page order; let ScrollTrigger order them by position before measuring
  ScrollTrigger.sort(); ScrollTrigger.refresh();
  window.addEventListener('load', function(){ScrollTrigger.sort(); ScrollTrigger.refresh();});
})();

// casa de campo: horizontal walk-through pinned on desktop
(function(){
  if(!window.gsap || !window.ScrollTrigger) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var mm=gsap.matchMedia();
  mm.add('(min-width: 900px)', function(){
    var pin=document.querySelector('.campo-pin'), track=document.getElementById('campoTrack'); if(!pin||!track) return;
    function dist(){ return Math.max(0, track.scrollWidth - pin.clientWidth); }
    gsap.to(track,{x:function(){return -dist();},ease:'none',scrollTrigger:{trigger:pin,start:'center center',end:function(){return '+='+dist();},pin:true,scrub:.5,invalidateOnRefresh:true,anticipatePin:1}});
  });
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
})();

// casa en el bosque: stage viewer with autoplay while visible
(function(){
  var root=document.getElementById('bq'); if(!root) return;
  var imgs=[].slice.call(root.querySelectorAll('.bq-stage img')), btns=[].slice.call(root.querySelectorAll('.bq-steps button'));
  var nEl=document.getElementById('bqN'), tEl=document.getElementById('bqT'), dEl=document.getElementById('bqDesc'), bar=document.getElementById('bqBar'), stage=root.querySelector('.bq-stage');
  var i=0, timer=null, auto=true, visible=false, DUR=4200, t0=0, raf=0;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(k){
    i=(k+imgs.length)%imgs.length;
    imgs.forEach(function(im,j){im.classList.toggle('on',j===i);});
    btns.forEach(function(b,j){b.classList.toggle('on',j===i); if(j===i) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current');});
    nEl.textContent=(i<9?'0':'')+(i+1); tEl.textContent=btns[i].textContent.replace(/^\d+/,''); dEl.textContent=btns[i].getAttribute('data-d');
    var b=btns[i]; if(b.parentNode.parentNode.scrollWidth>b.parentNode.parentNode.clientWidth){ b.parentNode.parentNode.scrollTo({left:b.parentNode.offsetLeft-24,behavior:'smooth'}); }
    var nx=imgs[(i+1)%imgs.length]; if(nx.loading==='lazy') nx.loading='eager';
    t0=performance.now();
  }
  function tick(now){
    raf=0; if(!(auto && visible && !reduce)) return;
    var p=Math.min((now-t0)/DUR,1); bar.style.transform='scaleX('+p.toFixed(3)+')'; if(p>=1) show(i+1);
    raf=requestAnimationFrame(tick);
  }
  function kick(){ if(!raf && auto && visible && !reduce) raf=requestAnimationFrame(tick); }
  var play=document.getElementById('bqPlay');
  function setAuto(v){ auto=v; play.textContent=v?'Pausar':'Reproducir'; play.setAttribute('aria-label',v?'Pausar el avance automático':'Reanudar el avance automático'); if(!v) bar.style.transform='scaleX(0)'; else { t0=performance.now(); kick(); } }
  function stop(){ setAuto(false); }
  play.addEventListener('click',function(){ setAuto(!auto); });
  if(reduce) setAuto(false);
  btns.forEach(function(b,j){ b.addEventListener('click',function(){ stop(); show(j); }); });
  document.getElementById('bqPrev').addEventListener('click',function(){ stop(); show(i-1); });
  document.getElementById('bqNext').addEventListener('click',function(){ stop(); show(i+1); });
  stage.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){stop();show(i+1);} if(e.key==='ArrowLeft'){stop();show(i-1);} });
  var sx=null; stage.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  stage.addEventListener('touchend',function(e){ if(sx===null) return; var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>45){ stop(); show(i+(dx<0?1:-1)); } sx=null; },{passive:true});
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ var was=visible; visible=e.isIntersecting; if(visible && !was){ t0=performance.now(); kick(); } }); },{threshold:.5}).observe(stage); }
})();
