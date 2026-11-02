(() => {
  'use strict';
  const canvas = document.getElementById('scene'), ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const overlay = $('overlay'), card = $('card'), scoreEl = $('score'), bestEl = $('best'), scoreboard = $('scoreboard');
  const W = () => innerWidth, H = () => innerHeight;
  let w=0,h=0,dpr=1,last=0,elapsed=0,mode='ready',score=0,best=+(localStorage.getItem('flapstar-best')||0),sound=true;
  let bird, pipes=[], stars=[], particles=[], clouds=[], groundX=0, speed=0, shake=0, flash=0, combo=0, lastPoint=-10, skyPhase=0, toastTimer=0;
  bestEl.textContent=best;
  const rand=(a,b)=>a+Math.random()*(b-a), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function resize(){
    dpr=Math.min(devicePixelRatio||1,2); w=W();h=H(); canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    if(bird){bird.x=w*.27;bird.y=clamp(bird.y,h*.17,h*.77);}
    clouds=Array.from({length:7},(_,i)=>({x:(i/7)*w+rand(-30,30),y:rand(h*.09,h*.55),s:rand(.65,1.35),v:rand(5,13)}));
  }
  function groundY(){return h*.89;}
  resize(); addEventListener('resize',resize,{passive:true});
  function setup(){bird={x:w*.27,y:h*.43,vy:0,rot:0,wing:0,r:clamp(w*.037,13,19),inv:0};pipes=[];stars=[];particles=[];score=0;speed=w*.62;combo=0;lastPoint=-10;groundX=0;shake=0;flash=0;scoreEl.textContent='0';}
  setup();
  function rounded(x,y,ww,hh,r){ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);}
  function soundFX(type){
    if(!sound)return;
    try{const A=window.AudioContext||window.webkitAudioContext;if(!soundFX.ac)soundFX.ac=new A();const ac=soundFX.ac;if(ac.state==='suspended')ac.resume();
      const o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);const t=ac.currentTime;
      if(type==='flap'){o.type='sine';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(620,t+.07);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+.11);o.start(t);o.stop(t+.12);}
      else if(type==='score'){o.type='sine';o.frequency.setValueAtTime(740,t);o.frequency.setValueAtTime(990,t+.07);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.19);o.start(t);o.stop(t+.2);}
      else {o.type='triangle';o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(90,t+.28);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.start(t);o.stop(t+.33);}
    }catch(_){ }
  }
  function burst(x,y,color,n=9){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-100,100),vy:rand(-120,65),life:rand(.35,.8),max:.8,size:rand(2,5),color});}
  function flap(){
    if(mode==='ready'){start();}
    if(mode!=='playing')return;
    bird.vy=-h*.48;bird.wing=-.85;bird.inv=.08;burst(bird.x-bird.r*.55,bird.y+bird.r*.35,'#c7fff0',5);soundFX('flap');
  }
  function start(){setup();mode='playing';overlay.classList.add('hidden');scoreboard.classList.add('visible');$('pauseBtn').style.visibility='visible';flap();}
  function pause(){if(mode==='playing'){mode='paused';showCard('paused');}else if(mode==='paused'){mode='playing';overlay.classList.add('hidden');last=performance.now();}}
  function showCard(kind){
    const title=$('title'),message=$('message'),btn=$('playText'),foot=$('footnote');
    if(kind==='ready'){title.innerHTML='FLAP<br><em>STAR</em>';message.innerHTML='Um toque. Mais uma tentativa.<br>Até onde você consegue voar?';btn.textContent='DECOLAR';foot.textContent='FEITO PARA A SUA BOLSA DE CÉU';}
    if(kind==='paused'){title.innerHTML='HORA DE<br><em>RESPIRAR</em>';message.innerHTML='Seu passarinho está tomando fôlego.';btn.textContent='CONTINUAR';foot.textContent='TOQUE PARA RETOMAR';}
    if(kind==='over'){title.innerHTML='BELA<br><em>VIAGEM</em>';message.innerHTML=`Você passou por <b style="color:#ffe17f">${score}</b> ${score===1?'portão':'portões'}. ${score>=best&&score>0?'Novo recorde pessoal!':'Pronto para mais uma?'}`;btn.textContent='VOAR DE NOVO';foot.textContent=`RECORDE PESSOAL  ·  ${best}`;}
    card.style.animation='none';void card.offsetWidth;card.style.animation='';overlay.classList.remove('hidden');scoreboard.classList.toggle('visible',kind==='paused');
  }
  function newPipe(){
    const gap=clamp(h*.245-score*.65,h*.175,h*.245),margin=h*.13,cy=rand(margin+gap/2,groundY()-margin-gap/2);
    const x=(pipes.length?pipes[pipes.length-1].x:w)+w*.67;
    pipes.push({x,cy,gap,w:clamp(w*.155,58,78),passed:false,hue:Math.random()<.14?'gold':'mint'});
    if(Math.random()<.72)stars.push({x:x+w*.55,y:cy+rand(-gap*.2,gap*.2),r:clamp(w*.026,10,14),got:false,spin:rand(0,6)});
  }
  function background(t){
    const phase=(Math.floor(score/8)%3), blend=clamp((score%8)/8,0,1)*.18;
    const sets=[[['#62c6e8','#d8f6dd'],['#4a91c4','#f4be99']],[['#547dc3','#d5a5bd'],['#d17c8c','#ffc37c']],[['#092e56','#477ca1'],['#152b58','#8c6390']]];
    const pair=sets[phase],c1=pair[0],c2=pair[1];
    const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,c1[0]);grad.addColorStop(.68,c1[1]);grad.addColorStop(1,'#d7e8ce');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    const sunX=w*.77,sunY=h*.22,sunR=Math.min(w,h)*.07;
    const glow=ctx.createRadialGradient(sunX,sunY,2,sunX,sunY,sunR*2.7);glow.addColorStop(0,'#fff9d6aa');glow.addColorStop(.38,'#ffe9b044');glow.addColorStop(1,'#fff0c000');ctx.fillStyle=glow;ctx.fillRect(sunX-sunR*3,sunY-sunR*3,sunR*6,sunR*6);
    ctx.fillStyle='#fff4c9';ctx.beginPath();ctx.arc(sunX,sunY,sunR,0,Math.PI*2);ctx.fill();
    for(const c of clouds){c.x-=c.v*(mode==='playing'?1:.25)*t;if(c.x<-100)c.x=w+70;drawCloud(c.x,c.y,c.s);}
    drawHills(t);
    if(phase===2){ctx.save();ctx.globalAlpha=.72;for(let i=0;i<34;i++){const x=((i*173.7)%w),y=((i*97.3)%(h*.56));ctx.fillStyle='#fff7d9';ctx.globalAlpha=.25+.65*(.5+.5*Math.sin(elapsed*1.6+i));ctx.beginPath();ctx.arc(x,y,(i%3)*.45+.7,0,Math.PI*2);ctx.fill();}ctx.restore();}
  }
  function drawCloud(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#ffffff4c';ctx.beginPath();ctx.ellipse(0,4,36,11,0,0,Math.PI*2);ctx.ellipse(-15,0,14,12,0,0,Math.PI*2);ctx.ellipse(0,-6,18,17,0,0,Math.PI*2);ctx.ellipse(17,0,14,11,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  function drawHills(t){
    const gy=groundY();ctx.fillStyle='#679a9a';ctx.beginPath();ctx.moveTo(0,gy);for(let x=0;x<=w+10;x+=10)ctx.lineTo(x,gy-h*.20+Math.sin((x+elapsed*11)/w*7)*h*.035+Math.sin(x/w*15)*h*.014);ctx.lineTo(w,gy);ctx.fill();
    ctx.fillStyle='#8cbaa0';ctx.beginPath();ctx.moveTo(0,gy);for(let x=0;x<=w+10;x+=10)ctx.lineTo(x,gy-h*.12+Math.sin((x-elapsed*19)/w*9+2)*h*.025);ctx.lineTo(w,gy);ctx.fill();
  }
  function drawPipe(p){
    const x=p.x,pw=p.w,cap=14,top=p.cy-p.gap/2,bottom=p.cy+p.gap/2,colors=p.hue==='gold'?['#ffcb68','#b97934']:['#72e0ba','#25887d'];
    const pipe=(y,hh,flip)=>{if(hh<=0)return;const body=ctx.createLinearGradient(x,0,x+pw,0);body.addColorStop(0,colors[1]);body.addColorStop(.18,colors[0]);body.addColorStop(.57,colors[0]);body.addColorStop(1,colors[1]);
      ctx.fillStyle='#133e4a35';rounded(x+5,y+5,pw,hh,7);ctx.fill();ctx.fillStyle=body;rounded(x,y,pw,hh,7);ctx.fill();
      ctx.fillStyle='#ffffff38';rounded(x+8,y+7,5,Math.max(0,hh-14),3);ctx.fill();ctx.fillStyle='#102f3933';rounded(x+pw-10,y+6,5,Math.max(0,hh-12),3);ctx.fill();
      const cy=flip?y+hh-cap:y;const capGrad=ctx.createLinearGradient(x-5,0,x+pw+5,0);capGrad.addColorStop(0,colors[1]);capGrad.addColorStop(.2,colors[0]);capGrad.addColorStop(.55,colors[0]);capGrad.addColorStop(1,colors[1]);
      ctx.fillStyle=capGrad;rounded(x-5,cy,pw+10,cap,5);ctx.fill();ctx.fillStyle='#ffffff35';rounded(x+3,cy+3,4,cap-6,2);ctx.fill();ctx.fillStyle='#082f3730';ctx.fillRect(x-2,flip?cy+cap-3:cy+cap-3,pw+4,3);
    };
    pipe(0,top,false);pipe(bottom,groundY()-bottom,true);
  }
  function drawStar(s){if(s.got)return;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.spin);ctx.shadowColor='#fff29a';ctx.shadowBlur=18;const r=s.r;const g=ctx.createRadialGradient(-r*.25,-r*.3,1,0,0,r);g.addColorStop(0,'#fffbd0');g.addColorStop(.45,'#ffe479');g.addColorStop(1,'#ff9b48');ctx.fillStyle=g;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.48:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.restore();}
  function drawBird(){
    const b=bird,r=b.r;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);
    ctx.globalAlpha=.22;ctx.fillStyle='#193c50';ctx.beginPath();ctx.ellipse(1,r*.97,r*1.08,r*.32,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    // tail feathers
    const tail=ctx.createLinearGradient(-r*1.8,-r*.2,-r*.9,r*.45);tail.addColorStop(0,'#ffb456');tail.addColorStop(1,'#f77b60');ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-r*.72,r*.2);ctx.quadraticCurveTo(-r*1.35,-r*.32,-r*1.65,-r*.18);ctx.quadraticCurveTo(-r*1.45,r*.15,-r*1.72,r*.47);ctx.quadraticCurveTo(-r*1.1,r*.49,-r*.68,r*.42);ctx.fill();
    // body
    const body=ctx.createRadialGradient(-r*.35,-r*.48,r*.15,0,0,r*1.22);body.addColorStop(0,'#fff3a6');body.addColorStop(.38,'#ffd164');body.addColorStop(.76,'#ffa33f');body.addColorStop(1,'#ed7448');ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,r*1.04,r*.82,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff4c475';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(-r*.05,-r*.07,r*.91,r*.72,-.16,Math.PI*1.08,Math.PI*1.72);ctx.stroke();
    // wing
    ctx.save();ctx.rotate(Math.sin(elapsed*18)*.12+b.wing);const wing=ctx.createLinearGradient(-r*.6,-r*.4,r*.55,r*.35);wing.addColorStop(0,'#ffe784');wing.addColorStop(1,'#f58b47');ctx.fillStyle=wing;ctx.beginPath();ctx.ellipse(-r*.13,r*.26,r*.6,r*.35,-.28,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff6bc77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-r*.48,r*.28);ctx.quadraticCurveTo(-r*.1,r*.08,r*.27,r*.23);ctx.stroke();ctx.restore();
    // cheek and eye
    ctx.fillStyle='#ff876b';ctx.globalAlpha=.72;ctx.beginPath();ctx.ellipse(r*.54,r*.25,r*.16,r*.105,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(r*.45,-r*.27,r*.24,r*.29,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#18354a';ctx.beginPath();ctx.arc(r*.53,-r*.25,r*.115,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(r*.56,-r*.3,r*.045,0,Math.PI*2);ctx.fill();
    // beak
    const beak=ctx.createLinearGradient(r*.72,-r*.1,r*1.34,r*.16);beak.addColorStop(0,'#ffbf57');beak.addColorStop(1,'#ff7850');ctx.fillStyle=beak;ctx.beginPath();ctx.moveTo(r*.78,-r*.02);ctx.quadraticCurveTo(r*1.12,-r*.14,r*1.32,r*.06);ctx.quadraticCurveTo(r*1.1,r*.3,r*.73,r*.2);ctx.closePath();ctx.fill();ctx.strokeStyle='#d96a46';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(r*.84,r*.1);ctx.lineTo(r*1.25,r*.1);ctx.stroke();
    if(b.inv>0){ctx.strokeStyle='#fff9bd';ctx.globalAlpha=.55+.35*Math.sin(elapsed*40);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,r*1.27,r*1.08,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  function drawGround(t){const y=groundY();ctx.fillStyle='#d8cd9b';ctx.fillRect(0,y,w,h-y);const g=ctx.createLinearGradient(0,y,0,y+18);g.addColorStop(0,'#b4d977');g.addColorStop(1,'#78b46e');ctx.fillStyle=g;ctx.fillRect(0,y,w,18);ctx.fillStyle='#e6dda9';ctx.fillRect(0,y+18,w,h-y-18);ctx.fillStyle='#c2b97f';ctx.globalAlpha=.5;for(let x=-30+(groundX%34);x<w+30;x+=34){ctx.beginPath();ctx.moveTo(x,y+26);ctx.lineTo(x+14,y+26);ctx.lineTo(x+4,y+29);ctx.lineTo(x-8,y+29);ctx.fill();}ctx.globalAlpha=1;ctx.fillStyle='#f6f1d5';ctx.fillRect(0,y,w,2);}
  function collide(){const b=bird,gy=groundY();if(b.y+b.r*.66>=gy||b.y-b.r*.72<=0)return true;for(const p of pipes){if(b.x+b.r*.78>p.x-3&&b.x-b.r*.75<p.x+p.w+3&&(b.y-b.r*.63<p.cy-p.gap/2+8||b.y+b.r*.63>p.cy+p.gap/2-8))return true;}return false;}
  function showToast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),900);}
  function endGame(){mode='over';shake=9;flash=.42;bird.vy=-h*.1;soundFX('hit');if(navigator.vibrate)navigator.vibrate(45);if(score>best){best=score;localStorage.setItem('flapstar-best',best);bestEl.textContent=best;}setTimeout(()=>showCard('over'),390);}
  function update(dt){
    elapsed+=dt;
    if(mode==='playing'){
      const gy=groundY();speed=w*(.62+Math.min(score*.012,.26));groundX=(groundX+speed*dt)%34;
      bird.vy+=h*1.48*dt;bird.y+=bird.vy*dt;bird.rot=clamp(bird.vy/(h*.78),-.48,1.15);bird.wing+=(0-bird.wing)*Math.min(1,dt*11);bird.inv=Math.max(0,bird.inv-dt);
      if(!pipes.length||pipes[pipes.length-1].x<w+w*.27)newPipe();
      for(const p of pipes){p.x-=speed*dt;if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;scoreEl.textContent=score;soundFX('score');if(navigator.vibrate)navigator.vibrate(12);if(score-lastPoint<3)combo++;else combo=0;lastPoint=score;if(score%5===0)showToast(combo>1?`✦ ${score} GATES · x${combo+1} FLOW`:`✦ ${score} GATES`);}}
      pipes=pipes.filter(p=>p.x+p.w>-15);
      for(const s of stars){s.x-=speed*dt;s.spin+=dt*2.7;if(!s.got&&Math.hypot(s.x-bird.x,s.y-bird.y)<bird.r+s.r){s.got=true;score+=2;scoreEl.textContent=score;soundFX('score');burst(s.x,s.y,'#ffe27c',14);showToast('✦ STAR BONUS  +2');if(navigator.vibrate)navigator.vibrate([12,25,12]);}}
      stars=stars.filter(s=>s.x>-40&&!s.got);
      if(collide())endGame();
    } else if(mode==='ready'){bird.y=h*.43+Math.sin(elapsed*2.7)*h*.008;bird.rot=0;bird.wing=Math.sin(elapsed*8)*.12;}
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=h*.24*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
    shake=Math.max(0,shake-dt*27);flash=Math.max(0,flash-dt*1.7);
  }
  function render(dt){
    ctx.save();if(shake)ctx.translate(rand(-shake,shake),rand(-shake,shake));
    background(dt);for(const p of pipes)drawPipe(p);for(const s of stars)drawStar(s);drawGround(dt);
    for(const p of particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*clamp(p.life/p.max,.3,1),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    if(bird)drawBird();if(flash){ctx.fillStyle=`rgba(255,255,255,${flash*.38})`;ctx.fillRect(0,0,w,h);}ctx.restore();
  }
  function loop(now){const dt=Math.min((now-last)/1000||0,0.035);last=now;update(dt);render(dt);requestAnimationFrame(loop);}
  requestAnimationFrame(now=>{last=now;loop(now);});
  $('pauseBtn').style.visibility='hidden';
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(mode==='playing'||mode==='ready')flap();},{passive:false});
  $('playBtn').addEventListener('click',()=>{if(mode==='paused'){mode='playing';overlay.classList.add('hidden');scoreboard.classList.add('visible');last=performance.now();}else start();});
  $('pauseBtn').addEventListener('click',()=>{if(mode==='playing')pause();});
  $('soundBtn').addEventListener('click',()=>{sound=!sound;$('soundBtn').classList.toggle('sound-off',!sound);$('soundBtn').setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');if(sound)soundFX('score');});
  addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();if(mode==='playing'||mode==='ready')flap();}else if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();pause();}},{passive:false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
  showCard('ready');
})();
