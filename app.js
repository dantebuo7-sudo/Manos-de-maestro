(function(){
  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis=null;

  // header: solid after hero top, hides on scroll down, returns on scroll up
  var hdr=$('#hdr'), lastY=0;
  function onScroll(){
    var y=window.scrollY;
    hdr.classList.toggle('solid', y>32);
    if(!document.body.classList.contains('lb-open')) hdr.classList.toggle('away', y>lastY && y>600);
    lastY=y;
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // before / after comparator
  var cmp=$('#cmp'), rng=$('#cmpRange');
  function setPos(v){cmp.style.setProperty('--pos', v+'%'); rng.value=v;}
  rng.addEventListener('input', function(){setPos(rng.value);});
  function animTo(v){
    if(window.gsap && !reduce){var o={v:+rng.value}; gsap.to(o,{v:v,duration:.8,ease:'power3.inOut',onUpdate:function(){setPos(o.v.toFixed(1));}});} else setPos(v);
  }
  $('#btnAntes').addEventListener('click', function(){animTo(100);});
  $('#btnDespues').addEventListener('click', function(){animTo(0);});

  // video: plays only while visible
  var vid=$('#procVid'), vb=$('#vidBtn'), userPaused=false;
  vb.addEventListener('click', function(){ if(vid.paused){vid.play().catch(function(){}); userPaused=false; vb.textContent='Pausar';} else {vid.pause(); userPaused=true; vb.textContent='Reproducir';} });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ if(!userPaused && !reduce){ vid.preload='auto'; vid.play().catch(function(){}); } } else vid.pause(); });},{threshold:.25}).observe(vid);
    if(reduce){vb.textContent='Reproducir';}
    var mbar=$('#mbar'), hero=$('.hero'), contact=$('#contacto'), heroIn=true, contactIn=false;
    function upd(){mbar.classList.toggle('hide', heroIn||contactIn);}
    new IntersectionObserver(function(es){es.forEach(function(e){heroIn=e.isIntersecting;}); upd();},{threshold:.35}).observe(hero);
    new IntersectionObserver(function(es){es.forEach(function(e){contactIn=e.isIntersecting;}); upd();},{threshold:.2}).observe(contact);
  }

  // mobile story carousel dots
  var sm=$('#storyMobile'), dots=$$('#storyDots i');
  if(sm){ sm.addEventListener('scroll', function(){ var i=Math.round(sm.scrollLeft/(sm.firstElementChild.offsetWidth+12)); dots.forEach(function(d,k){d.classList.toggle('on',k===i);}); }, {passive:true}); }

  // gallery arrows
  var gal=$('#gal'), gp=$('#galPrev'), gn=$('#galNext');
  function step(){var f=gal.querySelector('figure'); return f? f.offsetWidth+14 : 300;}
  function galState(){ gp.disabled=gal.scrollLeft<8; gn.disabled=gal.scrollLeft+gal.clientWidth>=gal.scrollWidth-8; }
  gp.addEventListener('click', function(){gal.scrollBy({left:-step(),behavior:'smooth'});});
  gn.addEventListener('click', function(){gal.scrollBy({left:step(),behavior:'smooth'});});
  gal.addEventListener('scroll', galState, {passive:true}); window.addEventListener('resize', galState); galState();
  // drag to scroll with the mouse on desktop
  var down=false, sx=0, sl=0, moved=false;
  gal.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse') return; down=true; moved=false; sx=e.clientX; sl=gal.scrollLeft; gal.style.scrollSnapType='none'; });
  window.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4) moved=true; gal.scrollLeft=sl-dx; });
  window.addEventListener('pointerup', function(){ if(!down) return; down=false; gal.style.scrollSnapType=''; if(moved){ var s=step(); gal.scrollTo({left:Math.round(gal.scrollLeft/s)*s,behavior:'smooth'}); } });
  gal.addEventListener('click', function(e){ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
  gal.addEventListener('keydown', function(e){ if(e.key==='ArrowRight'){gn.click();e.preventDefault();} if(e.key==='ArrowLeft'){gp.click();e.preventDefault();} });

  // lightbox
  var lb=$('#lb'), lbImg=$('#lbImg'), lbCap=$('#lbCap'), lbC=$('#lbC'), list=[], idx=0;
  function show(i){
    idx=(i+list.length)%list.length; var el=list[idx];
    lbImg.style.opacity=0;
    var src=el.getAttribute('data-full')||el.currentSrc||el.src, pre=new Image();
    pre.onload=pre.onerror=function(){ lbImg.src=src; lbImg.alt=el.alt; lbImg.style.opacity=1; };
    pre.src=src;
    lbCap.textContent=el.alt; lbC.textContent=(idx+1)+' / '+list.length;
  }
  function openLb(el){
    var g=el.getAttribute('data-lb'); list=$$('img[data-lb="'+g+'"]'); show(list.indexOf(el));
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

  // hero entrance + gentle parallax as it scrolls away
  gsap.fromTo('#heroImg',{scale:1.1},{scale:1,duration:2.4,ease:'power2.out'});
  gsap.from('.hero .rv',{y:24,opacity:0,duration:.8,ease:ease,stagger:.09,delay:.15});
  gsap.to('.hero-media',{yPercent:14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero .wrap',{yPercent:-10,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'center center',end:'bottom top',scrub:true}});

  // ticker speeds up with scroll velocity
  var track=$('.ticker-track');
  if(track && track.getAnimations){
    var anim=track.getAnimations()[0];
    if(anim){ ScrollTrigger.create({trigger:'.ticker',start:'top bottom',end:'bottom top',onUpdate:function(self){ var v=Math.min(Math.abs(self.getVelocity())/600,4); anim.playbackRate=1+v; gsap.to(anim,{playbackRate:1,duration:.8,overwrite:true}); }}); }
  }

  // reveals (start visible-ish, never fully hidden)
  gsap.utils.toArray('.reveal').forEach(function(el){
    gsap.fromTo(el,{y:18,opacity:.35},{y:0,opacity:1,duration:.7,ease:ease,scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  gsap.utils.toArray('.reveal-group').forEach(function(g){
    gsap.fromTo(g.children,{y:18,opacity:.35},{y:0,opacity:1,duration:.7,ease:ease,stagger:.07,scrollTrigger:{trigger:g,start:'top 86%',once:true}});
  });
  gsap.utils.toArray('.img-reveal').forEach(function(box){
    var img=box.querySelector('img,video');
    gsap.fromTo(box,{clipPath:'inset(6% 6% 6% 6% round 10px)'},{clipPath:'inset(0% 0% 0% 0% round 10px)',duration:1.1,ease:'power3.inOut',scrollTrigger:{trigger:box,start:'top 90%',once:true}});
    gsap.fromTo(img,{scale:1.12},{scale:1,duration:1.4,ease:ease,scrollTrigger:{trigger:box,start:'top 90%',once:true},clearProps:'transform'});
  });

  // count up numbers
  $$('.count').forEach(function(el){
    var to=+el.getAttribute('data-to'), o={v:0};
    ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){ gsap.to(o,{v:to,duration:1.6,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v);}}); }});
    el.textContent='0';
  });

  // manifesto sentence by sentence, tied to scroll
  gsap.fromTo('#manifesto .w',{opacity:.22},{opacity:1,ease:'none',stagger:.5,scrollTrigger:{trigger:'.manifesto',start:'top 70%',end:'bottom 60%',scrub:.3}});

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
  window.addEventListener('load', function(){ScrollTrigger.refresh();});
})();
