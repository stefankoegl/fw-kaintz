(function(){
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var hasGsap=!!window.gsap;
var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var animate=hasGsap&&!reduce;
if(hasGsap&&window.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);

/* Menü */
var burger=$('#burger'),mnav=$('#mnav');
if(burger&&mnav){
var bl=burger.querySelectorAll('line'),menuOpen=false;
var setMenu=function(open){
menuOpen=open;burger.setAttribute('aria-expanded',open?'true':'false');
if(!animate){if(open)mnav.removeAttribute('hidden');else mnav.setAttribute('hidden','');return}
gsap.killTweensOf([mnav,mnav.children,bl]);
if(open){
mnav.removeAttribute('hidden');
gsap.fromTo(mnav,{height:0,opacity:0},{height:'auto',opacity:1,duration:0.4,ease:'power2.out'});
gsap.fromTo(mnav.children,{x:-24,opacity:0},{x:0,opacity:1,duration:0.4,ease:'power2.out',stagger:0.06,delay:0.1});
gsap.to(bl[0],{y:5,rotation:45,transformOrigin:'50% 50%',duration:0.3,ease:'power2.out'});
gsap.to(bl[1],{opacity:0,scaleX:0,transformOrigin:'50% 50%',duration:0.2});
gsap.to(bl[2],{y:-5,rotation:-45,transformOrigin:'50% 50%',duration:0.3,ease:'power2.out'});
}else{
gsap.to(mnav,{height:0,opacity:0,duration:0.3,ease:'power2.in',onComplete:function(){mnav.setAttribute('hidden','');gsap.set(mnav,{clearProps:'height,opacity'})}});
gsap.to(bl[0],{y:0,rotation:0,duration:0.3,ease:'power2.out'});
gsap.to(bl[1],{opacity:1,scaleX:1,duration:0.3,delay:0.1});
gsap.to(bl[2],{y:0,rotation:0,duration:0.3,ease:'power2.out'});
}
};
burger.addEventListener('click',function(){setMenu(!menuOpen)});
mnav.addEventListener('click',function(e){if(e.target.tagName==='A')setMenu(false)});
}

/* Slideshows */
function initCarousel(car){
var track=car.querySelector('.car-track'),ov=car.querySelector('.car-ov'),dotsBox=car.querySelector('.car-dots');
var count=car.querySelector('[data-count]'),prog=car.querySelector('.car-prog'),playBtn=car.querySelector('.car-play');
var prev=car.querySelector('[data-prev]'),next=car.querySelector('[data-next]');
var slides=track?track.children.length:0,idx=0,dots=[];
if(!slides)return;
var DELAY=parseFloat(car.getAttribute('data-delay'))||2;
var playing=animate,progTween=null,holdHover=false,holdView=true,holdTab=false;
function paint(){
for(var i=0;i<dots.length;i++){var a=i===idx;dots[i].firstChild.style.cssText=a?'display:block;width:8px;height:8px;border-radius:9999px;background:#222222':'display:block;width:6px;height:6px;border-radius:9999px;background:#c1c1c1'}
if(count)count.textContent=(idx+1)+' / '+slides;
}
function sync(){
if(!progTween)return;
if(playing&&!holdHover&&holdView&&!holdTab)progTween.resume();else progTween.pause();
}
function stopProg(){if(progTween){progTween.kill();progTween=null}if(prog&&hasGsap)gsap.set(prog,{scaleX:0})}
function startProg(){
if(!animate||!playing||!prog)return;
stopProg();
progTween=gsap.fromTo(prog,{scaleX:0},{scaleX:1,duration:DELAY,ease:'none',onComplete:function(){go(idx+1)}});
sync();
}
function preload(i){var s=track.children[((i%slides)+slides)%slides],im=s&&s.querySelector('img');if(im&&im.loading==='lazy')im.loading='eager'}
function go(n,instant,byUser){
idx=((n%slides)+slides)%slides;
preload(idx);preload(idx+1);
if(byUser&&playing)setPlaying(false);
if(hasGsap){gsap.to(track,{xPercent:-100*idx,duration:instant?0:0.8,ease:'power2.inOut',overwrite:true})}else{track.style.transform='translateX('+(-100*idx)+'%)'}
if(animate&&!instant){var im=track.children[idx].querySelector('img');if(im)gsap.fromTo(im,{scale:1.08},{scale:1,duration:2.4,ease:'power1.out',overwrite:true})}
paint();
if(playing&&!byUser)startProg();
}
function setPlaying(v){
playing=v;
if(playBtn){
playBtn.setAttribute('aria-label',v?'Slideshow pausieren':'Slideshow abspielen');
playBtn.firstElementChild.style.display=v?'block':'none';
playBtn.lastElementChild.style.display=v?'none':'block';
}
if(v)startProg();else stopProg();
}
for(var i=0;i<slides;i++){(function(i){var b=document.createElement('button');b.type='button';b.className='car-dot';b.setAttribute('aria-label','Foto '+(i+1)+' anzeigen');b.appendChild(document.createElement('span'));b.addEventListener('click',function(){go(i,false,true)});dotsBox.appendChild(b);dots.push(b)})(i)}
if(prev)prev.addEventListener('click',function(){go(idx-1,false,true)});
if(next)next.addEventListener('click',function(){go(idx+1,false,true)});
var sx=null;
ov.addEventListener('pointerdown',function(e){sx=e.clientX});
ov.addEventListener('pointercancel',function(){sx=null});
ov.addEventListener('pointerup',function(e){
if(sx===null)return;var dx=e.clientX-sx;sx=null;
if(Math.abs(dx)>40){go(dx<0?idx+1:idx-1,false,true);return}
var r=ov.getBoundingClientRect(),x=e.clientX-r.left;
if(x<r.width/3)go(idx-1,false,true);else if(x>r.width*2/3)go(idx+1,false,true);
});
if(playBtn){
if(!animate)playBtn.style.display='none';
playBtn.addEventListener('click',function(){setPlaying(!playing)});
}
car.addEventListener('mouseenter',function(){holdHover=true;sync()});
car.addEventListener('mouseleave',function(){holdHover=false;sync()});
if(window.IntersectionObserver)new IntersectionObserver(function(en){holdView=en[0].isIntersecting;sync()},{threshold:0.3}).observe(car);
document.addEventListener('visibilitychange',function(){holdTab=document.hidden;sync()});
go(0,true);
if(playing)setPlaying(true);else if(playBtn)setPlaying(false);
}
$$('.car').forEach(initCarousel);

/* Animationen */
if(animate){
gsap.from('.kw-hero-photo',{opacity:0,scale:1.06,duration:1.4,ease:'power2.out'});
var heroImg=$('.kw-hero-photo img');
var tl=gsap.timeline({delay:0.35,defaults:{ease:'power3.out'}});
tl.from('.kw-hero-card',{opacity:0,y:32,duration:0.9});
tl.from('.kw-hero-card > *',{opacity:0,y:18,duration:0.6,stagger:0.1},'-=0.5');
tl.from('.kw-hero-card svg',{scale:0,rotation:-90,transformOrigin:'50% 50%',duration:0.5,stagger:0.1,ease:'back.out(2)'},'-=0.9');
if(window.ScrollTrigger&&heroImg){
gsap.fromTo(heroImg,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}
var st=function(el,extra){var o={trigger:el,start:'top 88%',once:true};if(extra)for(var k in extra)o[k]=extra[k];return window.ScrollTrigger?o:null};
/* Überschriften: Akzentstrich wächst */
$$('main h2').forEach(function(h){
var b=document.createElement('span');b.className='h2bar';h.insertBefore(b,h.firstChild);
var s=st(h);gsap.from(b,{scaleX:0,transformOrigin:'0 50%',duration:0.7,ease:'power3.out',scrollTrigger:s||undefined});
});
/* Blöcke: Kinder fahren gestaffelt ein */
$$('[data-fade]').forEach(function(el){
var t=el.children.length>1?el.children:el;
var v={opacity:0,y:28,duration:0.8,ease:'power2.out',stagger:0.09};
var s=st(el);if(s)v.scrollTrigger=s;
gsap.from(t,v);
});
/* Bildpaare fliegen von links und rechts ein */
$$('.pair').forEach(function(p){
var im=p.querySelectorAll('img'),s=st(p,{start:'top 90%'});
gsap.from(im[0],{x:-70,opacity:0,rotate:-2,duration:1,ease:'power3.out',scrollTrigger:s||undefined});
if(im[1])gsap.from(im[1],{x:70,opacity:0,rotate:2,duration:1,delay:0.12,ease:'power3.out',scrollTrigger:s||undefined});
});
/* Ausstattung, Karten, Tabellenzeilen, Logos, Footer */
if(window.ScrollTrigger){
var amen=$$('.amen li');
gsap.set(amen,{opacity:0,y:20});
ScrollTrigger.batch(amen,{start:'top 94%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,y:0,duration:0.55,ease:'power2.out',stagger:0.05,overwrite:true})}});
var cards=$$('.vars > div,.times > div,.why > div');
gsap.set(cards,{opacity:0,scale:0.94});
ScrollTrigger.batch(cards,{start:'top 92%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,scale:1,duration:0.6,ease:'back.out(1.5)',stagger:0.12})}});
var rows=$$('.tbl tbody tr');
gsap.set(rows,{opacity:0,x:-24});
ScrollTrigger.batch(rows,{start:'top 94%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,x:0,duration:0.5,ease:'power2.out',stagger:0.1})}});
var logos=$$('.logos > div');
gsap.set(logos,{opacity:0,y:20,scale:0.9});
ScrollTrigger.batch(logos,{start:'top 95%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,y:0,scale:1,duration:0.6,ease:'back.out(1.6)',stagger:0.1})}});
var fc=$$('.foot > div');
gsap.set(fc,{opacity:0,y:24});
ScrollTrigger.batch(fc,{start:'top 98%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,y:0,duration:0.6,ease:'power2.out',stagger:0.12})}});
}
/* Mehr Bewegung */
/* Fortschrittsbalken beim Scrollen */
if(window.ScrollTrigger){
var sb=document.createElement('div');sb.className='scrollbar';sb.setAttribute('aria-hidden','true');document.body.appendChild(sb);
gsap.to(sb,{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:0.3}});
var hdr=$('.hdr');
if(hdr)ScrollTrigger.create({start:40,onEnter:function(){gsap.to(hdr,{boxShadow:'rgba(0,0,0,0.04) 0 2px 6px 0',duration:0.3})},onLeaveBack:function(){gsap.to(hdr,{boxShadow:'rgba(0,0,0,0) 0 0 0 0',duration:0.3})}});
}
/* Titel: Buchstaben springen ein */
var h1=$('.kw-hero-card h1');
if(h1){
var t1=h1.textContent;h1.setAttribute('aria-label',t1);h1.textContent='';
t1.split('').forEach(function(ch){var sp=document.createElement('span');sp.className='ch';sp.setAttribute('aria-hidden','true');sp.textContent=ch===' '?' ':ch;h1.appendChild(sp)});
gsap.from(h1.querySelectorAll('.ch'),{y:36,opacity:0,rotation:8,duration:0.7,ease:'back.out(2)',stagger:0.035,delay:0.9});
}
/* Sonnen im Titel schweben */
gsap.to('.kw-hero-card svg',{y:-3,rotation:14,duration:1.8,ease:'sine.inOut',repeat:-1,yoyo:true,stagger:{each:0.25,repeat:-1,yoyo:true},delay:2});
/* Überschriften: Wörter fahren aus einer Maske hoch */
$$('main h2').forEach(function(h){
var bar=h.querySelector('.h2bar');
var txt=h.textContent;h.setAttribute('aria-label',txt);
var nodes=[];
for(var n=h.firstChild;n;n=n.nextSibling)if(n.nodeType===3)nodes.push(n);
nodes.forEach(function(n){
var f=document.createDocumentFragment();
n.textContent.split(/(\s+)/).forEach(function(w){
if(!w)return;
if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(' '));return}
var m=document.createElement('span');m.className='wm';m.setAttribute('aria-hidden','true');
var i2=document.createElement('span');i2.textContent=w;m.appendChild(i2);f.appendChild(m);
});
n.parentNode.replaceChild(f,n);
});
var inner=h.querySelectorAll('.wm > span');
if(inner.length){var o={yPercent:110,duration:0.8,ease:'power3.out',stagger:0.07};var s2=st(h);if(s2)o.scrollTrigger=s2;gsap.from(inner,o)}
});
ScrollTrigger.batch($$('.chip'),{start:'top 96%',once:true,onEnter:function(b){gsap.from(b,{scale:0.6,opacity:0,duration:0.5,ease:'back.out(2.4)',stagger:0.07})}});
/* Preise zählen hoch */
if(window.ScrollTrigger){
$$('.tbl td').forEach(function(td){
var m=/^€\s?(\d+)$/.exec(td.textContent.trim());if(!m)return;
var orig=td.textContent,end=+m[1],o={v:0};
ScrollTrigger.create({trigger:td,start:'top 92%',once:true,onEnter:function(){
gsap.to(o,{v:end,duration:1.1,ease:'power2.out',onUpdate:function(){td.textContent='€ '+Math.round(o.v)},onComplete:function(){td.textContent=orig}});
}});
});
/* Ausstattung: Symbole poppen */
ScrollTrigger.batch($$('.amen li .ic'),{start:'top 94%',once:true,onEnter:function(b){gsap.from(b,{scale:0.4,rotation:-25,duration:0.6,ease:'back.out(2.6)',stagger:0.05})}});
}
$$('.amen li').forEach(function(li){
var ic=li.querySelector('.ic');if(!ic)return;
li.addEventListener('mouseenter',function(){gsap.to(ic,{rotation:10,scale:1.14,duration:0.25,ease:'back.out(3)'})});
li.addEventListener('mouseleave',function(){gsap.to(ic,{rotation:0,scale:1,duration:0.3,ease:'power2.out'})});
});
/* Bilder: Wisch-Reveal und leichtes Anheben */
$$('.pair img').forEach(function(im){
gsap.from(im,{clipPath:'inset(0% 0% 100% 0% round 14px)',duration:1.1,ease:'power3.inOut',scrollTrigger:window.ScrollTrigger?st(im.parentNode,{start:'top 90%'}):undefined});
im.addEventListener('mouseenter',function(){gsap.to(im,{y:-5,scale:1.02,duration:0.35,ease:'power2.out'})});
im.addEventListener('mouseleave',function(){gsap.to(im,{y:0,scale:1,duration:0.4,ease:'power2.out'})});
});
/* Wellen vor dem Footer treiben */
gsap.to('.wave-a',{xPercent:-50,duration:22,ease:'none',repeat:-1});
gsap.fromTo('.wave-b',{xPercent:-50},{xPercent:0,duration:15,ease:'none',repeat:-1});
/* Anfrage-Button pulsiert sanft */
gsap.to('.bar .btn-p',{scale:1.05,duration:1.1,ease:'sine.inOut',repeat:-1,yoyo:true});
/* Buttons: sanftes Anheben beim Darüberfahren */
$$('.btn-p,.btn-s,.car-arrow,.car-play').forEach(function(b){
b.addEventListener('mouseenter',function(){gsap.to(b,{y:-2,duration:0.2,ease:'power2.out'})});
b.addEventListener('mouseleave',function(){gsap.to(b,{y:0,duration:0.25,ease:'power2.out'})});
});
}
})();

(function(){
var form=document.getElementById('anfrage-form');if(!form)return;
var btn=document.getElementById('form-btn'),st=document.getElementById('form-status');
function msg(t,err){st.hidden=false;st.textContent=t;st.style.color=err?'#c13515':'#3f3f3f'}
form.addEventListener('submit',function(e){
e.preventDefault();
if(!form.reportValidity())return;
btn.disabled=true;var old=btn.textContent;btn.textContent='Wird gesendet …';
fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
.then(function(r){if(r.ok){form.reset();msg('Vielen Dank! Ihre Anfrage wurde gesendet. Wir melden uns bei Ihnen.',false)}else{throw new Error('send')}})
.catch(function(){msg('Das Senden hat leider nicht geklappt. Bitte versuchen Sie es erneut.',true)})
.then(function(){btn.disabled=false;btn.textContent=old});
});
})();

(function(){
var boxes=document.querySelectorAll('[data-emb]');
for(var i=0;i<boxes.length;i++){(function(box){
var btn=box.querySelector('[data-emb-btn]'),ph=box.querySelector('.emb-ph'),fr=box.querySelector('iframe');
if(!btn||!fr)return;
btn.addEventListener('click',function(){
fr.src=fr.getAttribute('data-src');fr.removeAttribute('hidden');ph.hidden=true;
});
})(boxes[i])}
})();

/* Externe Links: auf der Live-Seite in neuem Tab öffnen (lokal/Vorschau im selben Tab) */
(function(){
var h=location.hostname;
if(!h||h==='localhost'||h==='127.0.0.1')return;
var l=document.querySelectorAll('a[href^="http"]');
for(var i=0;i<l.length;i++){if(l[i].hostname!==h){l[i].target='_blank';l[i].rel='noopener'}}
})();
