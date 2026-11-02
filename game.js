import * as THREE from 'three';
const scene=new THREE.Scene();scene.background=new THREE.Color('#a9c5c6');scene.fog=new THREE.Fog('#a9c5c6',48,145);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,220);camera.position.set(0,7,12);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight('#e4f2dc','#58645d',2.05));const sun=new THREE.DirectionalLight('#fff0d4',3.3);sun.position.set(-18,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-42;sun.shadow.camera.right=42;sun.shadow.camera.top=42;sun.shadow.camera.bottom=-42;scene.add(sun);
const mat=(c,r=.85)=>new THREE.MeshStandardMaterial({color:c,roughness:r});const concrete=mat('#b4b8aa'),dark=mat('#424c49'),metal=mat('#ccd0c4',.32),lime=mat('#d8ff3e'),brick=mat('#c88763'),wood=mat('#ae7752'),glass=mat('#91b3ad',.5);
function box(x,y,z,sx,sy,sz,m,shadow=true){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o}
function cyl(x,y,z,rad,len,m,axis='y'){const o=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,len,12),m);o.position.set(x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;o.castShadow=true;scene.add(o);return o}
// plaza ground and architectural frame
box(0,-.45,0,100,.8,100,mat('#78877d'));box(0,-.03,0,54,.16,54,concrete);
// expansion joints and colored court markings
for(let i=-24;i<=24;i+=6){box(i,.055,0,.045,.012,53,mat(i%12===0?'#9ca59a':'#a7ada2'),false);box(0,.056,i,53,.012,.045,mat('#a7ada2'),false)}
box(0,.065,-13,28,.025,.13,lime,false);box(-13,.065,0,.13,.025,23,mat('#d1d1b7'),false);
// ramps: detailed banked wedge meshes
function ramp(x,z,w,d,h,rot=0){const shape=new THREE.Shape();shape.moveTo(-d/2,0);shape.lineTo(d/2,0);shape.lineTo(d/2,h);shape.lineTo(-d/2,0);const geo=new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.06,bevelThickness:.05});geo.rotateY(Math.PI/2);const o=new THREE.Mesh(geo,mat('#d4d0bf'));o.position.set(x-w/2,.07,z);o.rotation.y=rot;o.castShadow=true;o.receiveShadow=true;scene.add(o);box(x,.12,z+d*.33,w+.1,.12,.17,dark);return {x,z,w,d,h}}
const ramps=[ramp(-10,-8,5,7,1.5),ramp(12,9,6,8,1.8,Math.PI),ramp(0,18,8,5,1.2,Math.PI/2)];
// rails, ledges, stairs
function rail(x,z,len,axis='z',height=.85){const y=height;const obj=cyl(x,y,z,.075,len,metal,axis);if(axis==='z'){for(const dz of [-len*.38,len*.38])cyl(x,.42,z+dz,.045,.8,metal)}else{for(const dx of [-len*.38,len*.38])cyl(x+dx,.42,z,.045,.8,metal)}return {x,z,len,axis,y}}
const rails=[rail(0,-5,9),rail(-8,7,8,'x'),rail(8,-15,8,'x'),rail(16,0,7)];
function ledge(x,z,w,d,h){box(x,h/2,z,w,h,d,mat('#ded9c8'));box(x,h+.02,z,w+.08,.06,d+.08,mat('#ebe5d3'));box(x,.08,z,w+.12,.14,d+.12,dark)}
ledge(-15,0,3,12,.8);ledge(15,13,3,8,1);ledge(3,10,7,2,.65);
// steps
for(let i=0;i<5;i++){box(-16+i*.9,.12+i*.18,-9,.9,.24+i*.36,4,mat(i%2?'#ddd7c8':'#c6c3b4'))}
// benches and planters
for(const [x,z] of [[-21,-18],[21,16],[-20,18]]){box(x,.5,z,4,.16,1.1,wood);for(const dx of [-1.4,1.4])box(x+dx,.25,z,.15,.5,.75,dark);box(x,.12,z,5,.24,1.5,mat('#65746d'))}
for(const [x,z] of [[-21,0],[22,-8],[0,-23]]){box(x,.45,z,3,.9,3,mat('#586b5b'));for(let i=0;i<8;i++){const a=i*Math.PI/4;const t=cyl(x+Math.cos(a)*.75,.9+Math.random()*.25,z+Math.sin(a)*.75,.13,.8,mat(i%2?'#617851':'#8c9a62'));t.rotation.z=.4}}
// distant city facades
for(let i=0;i<11;i++){const x=-45+i*9;const h=8+Math.random()*13;box(x,h/2,-37,7,h,4,mat(['#667b75','#87938a','#bc9a7e'][i%3]));for(let y=2;y<h-1;y+=2.5)for(let xx=-2;xx<=2;xx+=2)box(x+xx,y,-34.92,.8,1.1,.07,glass,false)}
// stylized palm trees
function palm(x,z){cyl(x,2.1,z,.23,4,mat('#79634b'));for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=box(x+Math.cos(a)*1.1,4.2,z+Math.sin(a)*1.1,2.3,.12,.45,mat('#52714e'));leaf.rotation.y=-a;leaf.rotation.z=-.2}box(x,4.1,z,.55,.3,.55,mat('#6a7346'))}
for(const p of [[-24,-20],[24,-22],[-25,19],[25,7]])palm(...p);
// skater rig and board
const skater=new THREE.Group();scene.add(skater);const rig=new THREE.Group();skater.add(rig);
const skin=mat('#b77e5c'),shirt=mat('#e15d42'),pants=mat('#27313b'),shoe=mat('#ece5d2'),hair=mat('#3a2925');
const board=new THREE.Group();rig.add(board);const deck=box(0,.27,0,.48,.12,1.45,mat('#262d31'));deck.position.y=.26;const underside=box(0,.19,0,.42,.04,1.25,mat('#d8ff3e'));underside.position.y=.19;
for(const z of [-.47,.47]){box(0,.15,z,.55,.06,.12,metal);for(const x of [-.24,.24])cyl(x,.105,z,.105,.09,mat('#272d2e'),'x')}
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.29,.64,4,8),shirt);torso.position.y=1.22;torso.castShadow=true;rig.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.24,14,12),skin);head.position.set(0,1.83,-.02);head.castShadow=true;rig.add(head);const hairmesh=new THREE.Mesh(new THREE.SphereGeometry(.245,12,8,0,Math.PI*2,0,Math.PI*.52),hair);hairmesh.position.copy(head.position);hairmesh.position.y+=.045;rig.add(hairmesh);
const limbs=[];function limb(a,b,r,m){const mid=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);const v=new THREE.Vector3().subVectors(b,a);const o=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r,v.length(),8),m);o.position.copy(mid);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.castShadow=true;rig.add(o);limbs.push(o);return o}
const upperL=limb(new THREE.Vector3(-.2,1.45,0),new THREE.Vector3(-.47,1.08,-.13),.105,shirt),lowerL=limb(new THREE.Vector3(-.47,1.08,-.13),new THREE.Vector3(-.37,.94,.13),.075,skin),upperR=limb(new THREE.Vector3(.2,1.45,0),new THREE.Vector3(.47,1.08,-.13),.105,shirt),lowerR=limb(new THREE.Vector3(.47,1.08,-.13),new THREE.Vector3(.38,.94,.13),.075,skin);
function leg(x,z){const thigh=limb(new THREE.Vector3(x*.4,.94,0),new THREE.Vector3(x,.52,z),.14,pants);const shin=limb(new THREE.Vector3(x,.52,z),new THREE.Vector3(x*.82,.23,z+.18),.105,pants);const foot=box(x*.82,.18,z+.31,.25,.16,.42,shoe);return [thigh,shin,foot]}
const legs=[leg(-.2,-.25),leg(.2,.25)];
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.65,20),new THREE.MeshBasicMaterial({color:'#29312b',transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.075;scene.add(shadow);
const $=id=>document.getElementById(id),keys={},clock=new THREE.Clock();let active=false,air=false,charging=false,charge=0,vy=0,speed=0,yaw=0,score=0,combo=0,comboBank=0,comboTime=0,airTricks=[],trickSpin=0,boardSpin=0,boardFlip=0,grinding=false,grindRail=null,manual=false,balance=0,sessionTime=0,toastTime=0,landPulse=0;
const pos=new THREE.Vector3(0,0,15);skater.position.copy(pos);
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastTime=1.1}
function start(){if(active)return;active=true;$('overlay').classList.add('hide');$('session').textContent='LIVE SESSION';clock.start()}
$('start').addEventListener('click',start);window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(!keys[k]){keys[k]=true;onPress(k)}if(k==='enter'&&!active)start()});window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys[k]=false;if(k===' '||k==='space')releaseOllie()});
function onPress(k){if(k===' '||k==='space'){if(active&& !air&&!grinding){charging=true;charge=0}}if(['j','k','l','arrowleft','arrowright'].includes(k)&&active&&air){const name={j:'KICKFLIP',k:'HEELFLIP',l:'SHOVE-IT',arrowleft:'360° SHUV',arrowright:'BODY VARIAL'}[k];airTricks.push(name);combo++;trickSpin+=(k==='arrowleft'?-1:1)*Math.PI*2;if(k==='l')boardSpin+=Math.PI*1.65;else if(k==='j')boardFlip-=Math.PI*1.65;else if(k==='k')boardFlip+=Math.PI*1.65;toast(name+'  +'+(250*combo))}if(k==='r'){pos.set(0,0,15);speed=0;vy=0;air=false;grinding=false;skater.rotation.set(0,0,0)}}
function releaseOllie(){if(!charging)return;charging=false;if(!air&&!grinding){const power=.25+charge*.75;vy=5.1+power*4.4;air=true;manual=false;toast('OLLIE!')}}
for(const btn of document.querySelectorAll('.mobile button')){const k=btn.dataset.key;btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;onPress(k)});for(const ev of ['pointerup','pointercancel','pointerleave'])btn.addEventListener(ev,e=>{e.preventDefault();keys[k]=false;if(k==='space')releaseOllie()})}
function projectToRail(r){if(r.axis==='z')return {d:Math.hypot(pos.x-r.x,pos.z-Math.max(r.z-r.len/2,Math.min(r.z+r.len/2,pos.z))),along:pos.z-r.z};return {d:Math.hypot(pos.z-r.z,pos.x-Math.max(r.x-r.len/2,Math.min(r.x+r.len/2,pos.x))),along:pos.x-r.x}}
function tick(dt){if(!active)return;sessionTime+=dt;if(charging)charge=Math.min(1,charge+dt*1.35);const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));
if(keys.w||keys.arrowup)speed+=7.5*dt;if(keys.s||keys.arrowdown)speed-=8*dt;speed*=Math.pow(.985,dt*60);speed=THREE.MathUtils.clamp(speed,-7,15);if(Math.abs(speed)<.12)speed=0;
const steering=(keys.a||keys.arrowleft?-1:0)+(keys.d||keys.arrowright?1:0);if(Math.abs(speed)>.4)yaw+=steering*dt*(1.15+Math.min(Math.abs(speed),8)*.055)*Math.sign(speed||1);
if(grinding){if(!keys.shift||!grindRail){grinding=false;vy=2.2;air=true;toast('POP OUT!')}else{pos.y=grindRail.y-.22;vy=0;pos.addScaledVector(forward,speed*dt);speed=Math.max(speed,5);comboTime=2.2;combo+=dt*3;score+=Math.floor(85*dt);const q=projectToRail(grindRail);if(Math.abs(q.along)>grindRail.len*.58){grinding=false;air=true;vy=2.8;toast('END OF RAIL!')}}}
else{pos.addScaledVector(forward,speed*dt);if(!air){manual=!!(keys.arrowup||keys.arrowdown)&&Math.abs(speed)>2;if(manual){balance+=((keys.arrowleft?-1:0)+(keys.arrowright?1:0))*dt*1.8;balance+=Math.sin(sessionTime*3)*dt*.42;balance=THREE.MathUtils.clamp(balance,-1,1);comboTime=2;if(Math.abs(balance)>.95){manual=false;speed*=.4;toast('MANUAL BAIL!')}}else balance*=.9;if(air){} }else{vy-=12.5*dt;pos.y+=vy*dt;}}
// bank ramps kick a fast skater upward
if(!air&&!grinding&&Math.abs(speed)>5){for(const r of ramps){if(Math.abs(pos.x-r.x)<r.w*.48&&Math.abs(pos.z-r.z)<r.d*.32){vy=4.5+Math.min(speed*.28,3);air=true;toast('BANK TRANSFER!');break}}}
// catch a rail by holding grind close to the top bar
if(!air&&!grinding&&keys.shift&&Math.abs(speed)>2.5){for(const r of rails){const q=projectToRail(r);if(q.d<.72&&Math.abs(pos.y)<.2){grinding=true;grindRail=r;pos.y=r.y-.22;vy=0;toast('LOCKED IN!');break}}}
if(air&&pos.y<=0){pos.y=0;air=false;vy=0;if(airTricks.length){const multiplier=Math.max(1,combo);const earned=Math.round((airTricks.length*500+Math.abs(trickSpin)*95)*multiplier);comboBank+=earned;toast('CLEAN LANDING  +'+earned.toLocaleString('pt-BR'));comboTime=2.6;landPulse=.3}else if(comboBank>0){score+=comboBank;comboBank=0;combo=0;airTricks=[]}trickSpin=0;boardSpin=0;boardFlip=0;if(manual){comboTime=2.2}}
if(pos.y<0&&!air){pos.y=0;vy=0}pos.x=THREE.MathUtils.clamp(pos.x,-25,25);pos.z=THREE.MathUtils.clamp(pos.z,-25,25);
if(comboTime>0)comboTime-=dt;else if(!air&&!grinding&&combo>0){score+=comboBank;comboBank=0;combo=0;airTricks=[]}if(landPulse>0)landPulse-=dt;
// rider pose and follow camera
skater.position.set(pos.x,pos.y,pos.z);skater.rotation.y=yaw;rig.rotation.set(0,0,0);if(air){rig.rotation.z=THREE.MathUtils.lerp(rig.rotation.z,Math.sin(sessionTime*12)*.08,dt*5);board.rotation.y=boardSpin;board.rotation.z=boardFlip;skater.rotation.y=yaw+trickSpin*.06}else{board.rotation.y=0;board.rotation.z=manual?balance*.17:0}if(grinding)skater.rotation.z=.05;else skater.rotation.z=0;
shadow.position.set(pos.x,.075,pos.z);shadow.scale.setScalar(Math.max(.45,1-pos.y*.16));const target=new THREE.Vector3(pos.x,1.1+pos.y,pos.z);const camOffset=new THREE.Vector3(Math.sin(yaw)*2,6.6,Math.cos(yaw)*10.4);camera.position.lerp(target.clone().add(camOffset),1-Math.pow(.002,dt));camera.lookAt(target.x,target.y+.25,target.z-2.5);
// HUD
$('speed').textContent=Math.round(Math.abs(speed)*3.6);$('speedbar').style.width=Math.min(100,Math.abs(speed)/15*100)+'%';$('score').textContent=Math.floor(score+comboBank).toString().padStart(6,'0');$('combo').innerHTML=combo>0?`${combo}× COMBO <small>　${airTricks.slice(-2).join(' + ')|| (manual?'MANUAL':'GRIND')}</small>`:'';
const pct=Math.min(100,(score+comboBank)/5000*100);$('progress').style.width=pct+'%';$('goalstatus').textContent=Math.min(5000,Math.floor(score+comboBank)).toLocaleString('pt-BR')+' / 5,000';if(pct>=100){$('goal').textContent='CHALLENGE COMPLETE!';$('goalstatus').textContent='+2,500 BONUS';if(pct>=100&&$('goal').dataset.done!=='yes'){$('goal').dataset.done='yes';score+=2500;toast('CHALLENGE COMPLETE! +2,500')}}if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show')}
}
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.035);tick(dt);renderer.render(scene,camera)}clock.start();frame();window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
