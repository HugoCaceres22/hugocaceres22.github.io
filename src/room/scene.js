import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {stations} from './content.js';
import {CSS3DRenderer,CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';

export function createRoom(container,{onOpen,onReady,onError,onFocused,onBookChanged}){
 const mobile=matchMedia('(max-width:760px)').matches;
 let motionEnabled=true;
 const reduced={get matches(){return !motionEnabled}};
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x090b16);
 const camera=new THREE.PerspectiveCamera(35,1,.1,100);
 const home=new THREE.Vector3(10,8.2,12.5), center=new THREE.Vector3(0,1.5,0);
 function frameOverview(){
  // Fill more of the desktop stage while retaining the full room on phones.
  const distance=container.clientWidth>=1100?.84:container.clientWidth>=761?.92:1;
  home.set(10,8.2,12.5).sub(center).multiplyScalar(distance).add(center);
 }
 frameOverview();
 camera.position.copy(home);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 container.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Habitación 3D de Hugo. Utiliza los puntos numerados o el menú para explorar.');
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.target.copy(center);controls.enableDamping=true;controls.enablePan=false;controls.enableZoom=false;
 controls.minAzimuthAngle=.18;controls.maxAzimuthAngle=1.15;controls.minPolarAngle=.78;controls.maxPolarAngle=1.18;controls.rotateSpeed=.45;
 const cssRenderer=new CSS3DRenderer();cssRenderer.domElement.className='world-dom';cssRenderer.domElement.style.overflow='clip';
 cssRenderer.domElement.firstElementChild.style.position='absolute';cssRenderer.domElement.firstElementChild.style.inset='0';container.append(cssRenderer.domElement);
 const surfaceElements={},surfaceObjects={};
 // Use native text layout at rest, avoiding cached text inside nested 3D transforms.
 // Reuse the DOM nodes so selection, focus and book state survive each handoff.
 const sharpLayer=document.createElement('div');sharpLayer.className='world-sharp';container.append(sharpLayer);
 let sharpSurface=null;
 function restoreSurface(){
  if(!sharpSurface)return;
  const {element,parent,transform}=sharpSurface;
  const focused=element.contains(document.activeElement)?document.activeElement:null;
  element.style.zoom='';element.style.transform=transform;parent.append(element);
  focused?.focus({preventScroll:true});
  sharpSurface=null;sharpLayer.style.transform='';sharpLayer.style.left='0px';sharpLayer.style.top='0px';
 }
 function sharpenSurface(id){
  const object=surfaceObjects[id],element=surfaceElements[id];if(!object||!element)return;
  const w=parseFloat(element.style.width),h=parseFloat(element.style.height);
  object.updateWorldMatrix(true,false);
  const point=(x,y)=>{const p=new THREE.Vector3(x,y,0).applyMatrix4(object.matrixWorld).project(camera);return new THREE.Vector2((p.x+1)*container.clientWidth/2,(1-p.y)*container.clientHeight/2)};
  const origin=point(-w/2,h/2),right=point(w/2,h/2),bottom=point(-w/2,-h/2);
  const a=(right.x-origin.x)/w,b=(right.y-origin.y)/w,c=(bottom.x-origin.x)/h,d=(bottom.y-origin.y)/h;
  const density=window.devicePixelRatio||1;
  const zoom=Math.round(Math.hypot(a,b)*w*density)/(w*density);if(!zoom)return;
  sharpSurface={element,parent:element.parentElement,transform:element.style.transform};
  const focused=element.contains(document.activeElement)?document.activeElement:null;
  sharpLayer.style.left=(Math.round(origin.x*density)/density)+'px';
  sharpLayer.style.top=(Math.round(origin.y*density)/density)+'px';
  const aligned=Math.abs(b)<.00001&&Math.abs(c)<.00001;
  sharpLayer.style.transform=aligned?'none':`matrix(${a/zoom},${b/zoom},${c/zoom},${d/zoom},0,0)`;
  element.style.transform='none';element.style.zoom=String(zoom);sharpLayer.append(element);
  focused?.focus({preventScroll:true});
 }
 function surface(id,w,h,scale,pos,parent=root,rotation=[0,0,0]){const element=document.createElement('div');element.className='world-surface surface-'+id;element.style.width=w+'px';element.style.height=h+'px';element.dataset.active='false';element.inert=true;const object=new CSS3DObject(element);object.position.set(...pos);object.rotation.set(...rotation);object.scale.setScalar(scale);parent.add(object);surfaceElements[id]=element;surfaceObjects[id]=object;return object}
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.3,.45,1.2);composer.addPass(bloom);composer.addPass(new OutputPass());
 const root=new THREE.Group();scene.add(root);
 const cyan=0x44e8e1,pink=0xbc71ff;
 const mats=new Map();
 const material=(color,glow=0)=>{const key=color+':'+glow;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:.6,metalness:.12,emissive:glow?color:0,emissiveIntensity:glow}));return mats.get(key)};
 function box(w,h,d,color,x,y,z,group=root,glow=0,r=.025){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,1,r),material(color,glow));mesh.position.set(x,y,z);mesh.castShadow=!glow;mesh.receiveShadow=true;group.add(mesh);return mesh}
 function cylinder(r1,r2,h,color,x,y,z,group=root,glow=0){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,32),material(color,glow));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh}
 function group(id){const g=new THREE.Group();g.userData.station=id;root.add(g);return g}
 function texture(width,height,draw){const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 function imagePlane(tex,w,h,x,y,z,g=root){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,toneMapped:false,transparent:true}));m.position.set(x,y,z);g.add(m);return m}
 function line(points,color,r=.025,g=root){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*8),r,8,false),material(color,2));g.add(mesh);return mesh}
 scene.add(new THREE.HemisphereLight(0xb5ccff,0x20172e,2.4));
 const key=new THREE.DirectionalLight(0xd6e3ff,3.8);key.position.set(2,9,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.025;scene.add(key);
 function light(c,intensity,pos,distance=9){const l=new THREE.PointLight(c,intensity,distance,2);l.position.set(...pos);scene.add(l);return l}
 light(cyan,14,[-2.7,2.7,-1.9]);light(pink,18,[2.3,3,-2.2]);light(0xffae79,5,[-3,3,1.6]);
 // An open architectural model: two walls, a raised platform and individual floorboards.
 box(8.1,.28,6.4,0x202337,0,-.17,0);
 for(let i=0;i<20;i++)box(.38,.06,6.15,[0x414353,0x383c4c,0x454556,0x3d4050][i%4],-3.8+i*.4,.01,0);
 box(8,.07,.07,cyan,0,-.16,3.22,root,2);
 box(.07,.07,6.4,pink,4.04,-.16,0,root,2);
 box(8,4.3,.16,0x292b42,0,2.1,-3.12);
 box(.16,4.3,6.3,0x242d3d,-4,2.1,0);
 box(8,.1,.09,0x505269,0,.15,-2.99);box(.1,.1,6.1,0x505269,-3.88,.15,0);
 box(7.75,.035,.035,pink,0,4.12,-3,root,2);
 box(.035,.035,6.1,cyan,-3.88,4.12,0,root,2);
 // Inset acoustic panels and a geometric RGB installation.
 for(let i=0;i<9;i++)box(.095,1.45,.06,0x141b2b,-3.55+i*.15,2.8,-3);
 for(let i=0;i<4;i++){const m=box(.24,.24,.08,i%2?pink:cyan,3.47,3.7-i*.37,-2.99,root,.4);m.rotation.z=Math.PI/4;}
 // Wall identity, rendered locally as a texture rather than a remote image.
 const about=group('about');
 const sign=texture(1024,320,(ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.shadowColor='#ad80ff';ctx.shadowBlur=20;ctx.fillStyle='#d6c3ff';ctx.font='700 116px monospace';ctx.textAlign='center';ctx.fillText('HUGO',w/2,140);ctx.shadowBlur=0;ctx.fillStyle='#90a5c0';ctx.font='25px monospace';ctx.fillText('BUILD · BREAK · LEARN',w/2,220)});
 imagePlane(sign,2.65,.83,-.65,3.58,-3,about);
 box(2.55,1.88,.09,0x1b2533,1.62,2.9,-2.96,about);
 box(2.42,1.73,.025,0x624b43,1.62,2.9,-2.9,about);
 const muralTex=texture(1100,780,(ctx,w,h)=>{ctx.fillStyle='#5a4640';ctx.fillRect(0,0,w,h);ctx.fillStyle='#e2d2bd';ctx.font='bold 56px monospace';ctx.fillText('LAS PIEZAS DE HUGO',65,105);['HC / SISTEMAS','CISCO / REDES','CAMBRIDGE / B2','B + A2','FÚTBOL SALA','IA + BIG DATA'].forEach((t,i)=>{const x=60+(i%3)*340,y=180+Math.floor(i/3)*260;ctx.fillStyle=['#ccd8db','#a6c9c0','#d9c4e1','#d8cfb6','#d4dcb6','#b9cbdb'][i];ctx.fillRect(x,y,300,215);ctx.fillStyle='#415164';ctx.font='bold 24px monospace';ctx.fillText(t,x+20,y+110)})});
 imagePlane(muralTex,2.42,1.72,1.62,2.9,-2.88,about);
 surface('about',1100,780,.0022,[1.62,2.9,-2.865],about);
 // Desk: solid walnut top, black legs, LED underside and a large deskmat.
 const desk=group('projects');
 box(5.5,.16,1.65,0x55414c,-.4,1.42,-1.65,desk);
 box(5.3,.035,.045,pink,-.4,1.33,-.86,desk,2);
 for(const x of [-2.85,2.05]){box(.1,1.3,.13,0x171d2c,x,.7,-1.1,desk);box(.1,1.3,.13,0x171d2c,x,.7,-2.2,desk);box(.13,.1,1.35,0x171d2c,x,.1,-1.65,desk)}
 box(2.4,.025,.8,0x131c2f,-.5,1.525,-1.25,desk);
 box(2.43,.012,.025,cyan,-.5,1.54,-.84,desk,1);
 // Monitor with a purpose-built editor screen.
 box(.45,.055,.28,0x101625,-.6,1.56,-2.03,desk);box(.09,.35,.09,0x101625,-.6,1.75,-2.09,desk);
 box(2.12,1.22,.12,0x0c1020,-.6,2.35,-2.13,desk);
 const screen=texture(1024,576,(ctx,w,h)=>{
  ctx.fillStyle='#0c1426';ctx.fillRect(0,0,w,h);ctx.fillStyle='#162238';ctx.fillRect(0,0,w,50);
  for(let i=0;i<3;i++){ctx.fillStyle=['#ff7089','#f4bf61','#60d6ad'][i];ctx.beginPath();ctx.arc(25+i*25,25,6,0,7);ctx.fill()}
  ctx.font='20px monospace';ctx.fillStyle='#8899b7';ctx.fillText('hugo / projects',340,33);
  ctx.fillStyle='#44e8e1';ctx.font='bold 44px monospace';ctx.fillText('Hola, soy Hugo.',55,139);
  ctx.font='24px monospace';ctx.fillStyle='#b5c2da';ctx.fillText('Sistemas. Código. Curiosidad.',55,192);
  const lines=['const portfolio = {','  sistemas: "Windows + Linux",','  automatizacion: "Ansible",','  desarrollo: ["Web", "C#"],','  aprendiendo: "IA & Big Data"','};'];
  lines.forEach((s,i)=>{ctx.fillStyle=i===0||i===5?'#a889ef':'#8cb3d1';ctx.fillText(s,55,265+i*39)});
  ctx.fillStyle='#44e8e1';ctx.fillRect(55,520,13,22);ctx.fillStyle='#7186a5';ctx.font='18px monospace';ctx.fillText('explora mis proyectos ↗',88,538);
 });imagePlane(screen,1.98,1.1,-.6,2.35,-2.062,desk);
 surface('projects',1000,560,.00198,[-.6,2.35,-2.05],desk);
 // Second portrait monitor with an abstract system graph.
 box(.09,.3,.09,0x0c1020,-2.27,1.76,-2.05,desk);box(.82,1.12,.12,0x0c1020,-2.22,2.25,-2.03,desk);
 const stats=texture(384,600,(ctx,w,h)=>{ctx.fillStyle='#0c1426';ctx.fillRect(0,0,w,h);ctx.fillStyle='#44e8e1';ctx.font='24px monospace';ctx.fillText('CONTROL NEXUS',20,55);['CPU','RAM','GPU'].forEach((s,i)=>{ctx.fillStyle='#91a9ca';ctx.font='18px monospace';ctx.fillText(s,25,130+i*150);ctx.strokeStyle=['#44e8e1','#be84ff','#ffb380'][i];ctx.lineWidth=4;ctx.beginPath();for(let k=0;k<30;k++){const y=175+i*150-Math.sin(k*1.6+i)*18-Math.cos(k*.7)*12;k?ctx.lineTo(25+k*11,y):ctx.moveTo(25,y)}ctx.stroke()});ctx.font='14px monospace';ctx.fillStyle='#7388a5';ctx.fillText('VISTA ILUSTRATIVA',30,570)});
 imagePlane(stats,.73,1.02,-2.22,2.25,-1.963,desk);
 // Mechanical keyboard: separate keys and a cyan-lit mouse.
 box(1.25,.07,.44,0x101421,-.65,1.59,-1.2,desk);
 for(let row=0;row<4;row++)for(let col=0;col<13;col++)box(.075,.033,.07,(row+col)%6===0?pink:0x748499,-1.2+col*.09,1.64,-1.35+row*.09,desk,(row+col)%6===0?.5:0,.006);
 box(.16,.08,.25,0x5f758b,.43,1.59,-1.19,desk);box(.014,.009,.12,cyan,.43,1.633,-1.2,desk,2);
 // PC tower: translucent side, inset fan rings and RGB edges.
 box(.78,1.24,.85,0x101725,1.55,2.1,-1.92,desk);
 const glass=box(.012,1.05,.69,0x263249,1.15,2.12,-1.92,desk);glass.material=new THREE.MeshStandardMaterial({color:0x758ad5,transparent:true,opacity:.28,roughness:.1,metalness:.6});
 for(let i=0;i<3;i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.14,.022,8,32),material(i%2?pink:cyan,2));ring.position.set(1.55,1.73+i*.36,-1.48);desk.add(ring);
  const blade=box(.2,.035,.035,0x647994,1.55,1.73+i*.36,-1.47,desk);blade.rotation.z=i;
 }
 box(.02,1.15,.02,pink,1.19,2.1,-1.5,desk,2);
 // Headphones on a stand, speakers and a mug.
 box(.3,.04,.3,0x101725,-2.7,1.55,-1.25,desk);cylinder(.025,.025,.5,0x29344c,-2.7,1.8,-1.25,desk);
 const arc=new THREE.Mesh(new THREE.TorusGeometry(.22,.045,12,32,Math.PI),material(0x7287a0));arc.position.set(-2.7,2.04,-1.25);desk.add(arc);
 for(const x of [-2.92,-2.48])box(.12,.23,.15,0x131a2c,x,2.02,-1.25,desk);
 cylinder(.12,.1,.22,0x9a91b2,.4,1.63,-2.2,desk);cylinder(.095,.095,.008,0x2a1422,.4,1.746,-2.2,desk);
 // Gaming chair, at an angle, with armrests and five wheels.
 const chair=new THREE.Group();chair.position.set(-.55,0,.42);chair.rotation.y=-.22;root.add(chair);
 cylinder(.075,.09,.65,0x222738,0,.5,0,chair);box(.85,.2,.8,0x151c2d,0,.94,0,chair);
 box(.87,1.25,.2,0x191f35,0,1.58,.38,chair);box(.65,.8,.035,0x343453,0,1.66,.26,chair);
 box(.07,1.07,.035,pink,-.35,1.6,.26,chair,.6);box(.07,1.07,.035,pink,.35,1.6,.26,chair,.6);
 box(.45,.18,.09,0x101727,0,2.02,.23,chair);
 for(const x of [-.55,.55]){box(.075,.4,.075,0x222c40,x,1.01,0,chair);box(.15,.08,.55,0x30354e,x,1.2,-.05,chair)}
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const spoke=box(.055,.06,.58,0x232b3e,Math.sin(a)*.24,.19,Math.cos(a)*.24,chair);spoke.rotation.y=a;cylinder(.07,.07,.09,0x101522,Math.sin(a)*.52,.13,Math.cos(a)*.52,chair)}
 // Woven rug grounds the chair.
 box(3.3,.018,2.5,0x26233c,-.25,.062,.75);
 for(let i=0;i<15;i++)box(3.15,.004,.014,0x423354,-.25,.075,-.42+i*.16);
 // Floating shelving, books, a plant and a football.
 const shelves=group('education');
 for(const y of [1.75,2.85]){
  box(.66,.1,2.4,0x564751,-3.56,y,-.5,shelves);box(.055,.035,2.3,cyan,-3.21,y-.08,-.5,shelves,1);
 }
 const educationBooks=[];
 const educationTitles=['IA + DATOS','ASIR','BACHILLER','CERTIFICADOS','EXPERIENCIA'];
 for(let i=0;i<5;i++){
  const b=new THREE.Group();b.userData.station='education';b.userData.bookIndex=i;b.position.set(-3.55,2.13,-1.35+i*.34);b.rotation.y=Math.PI/2;shelves.add(b);
  const spine=box(.12,.68,.44,[0x397b79,0x705d99,0x9e7861,0x426787,0x817a4b][i],0,0,0,b);
  const coverLeft=box(.43,.68,.035,[0x397b79,0x705d99,0x9e7861,0x426787,0x817a4b][i],0,0,0,b);
  const coverRight=box(.43,.68,.035,[0x397b79,0x705d99,0x9e7861,0x426787,0x817a4b][i],0,0,0,b);
  const pagesLeft=box(.42,.64,.026,0xe8e2d0,-.22,0,.028,b);
  const pagesRight=box(.42,.64,.026,0xf2eddf,.22,0,.028,b);
  const title=texture(140,680,(ctx,w,h)=>{ctx.fillStyle=['#397b79','#705d99','#9e7861','#426787','#817a4b'][i];ctx.fillRect(0,0,w,h);ctx.translate(80,620);ctx.rotate(-Math.PI/2);ctx.fillStyle='#e4e2d9';ctx.font='bold 42px monospace';ctx.fillText(educationTitles[i],0,0);ctx.fillRect(5,-35,500,2)});
  const label=imagePlane(title,.11,.64,0,0,.225,b);
  educationBooks.push({group:b,base:b.position.clone(),left:coverLeft,right:coverRight,pagesLeft,pagesRight,spine,label,progress:0});
 }
 for(let i=0;i<4;i++)box(.36,.085,.5,[0x805f9b,0x3b8e9a,0xc8bdc7,0x475672][i],-3.55,2.96+i*.086,-.9,shelves);
 surface('education',1100,760,.00076,[0,0,.065],educationBooks[0].group);
 const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.24,1),material(0xd2cfdb));ball.position.set(-3.53,2.05,.35);shelves.add(ball);
 for(let i=0;i<6;i++){const a=i*1.05;box(.035,.11,.11,0x202a40,-3.29,2.05+Math.sin(a)*.14,.35+Math.cos(a)*.14,shelves)}
 function plant(x,y,z,g=root){cylinder(.16,.12,.26,0x8c6a81,x,y+.13,z,g);for(let i=0;i<7;i++){const a=i*2.4;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),material(i%2?0x539c8c:0x2a6e63));leaf.scale.set(.45,1.7,.65);leaf.position.set(x+Math.sin(a)*.11,y+.38+(i%3)*.05,z+Math.cos(a)*.1);leaf.rotation.z=Math.sin(a)*.6;g.add(leaf)}}
 plant(-3.55,2.9,.35,shelves);plant(-3.38,.08,2.24);
 // A framed training diagram on the side wall.
 const poster=texture(400,500,(ctx,w,h)=>{ctx.fillStyle='#101c30';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#47d6cf';ctx.lineWidth=3;[[200,145,95,260],[200,145,305,260],[95,260,200,370],[305,260,200,370]].forEach(p=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.stroke()});ctx.fillStyle='#a380dc';[[200,145],[95,260],[305,260],[200,370]].forEach(([x,y])=>ctx.fillRect(x-22,y-22,44,44));ctx.fillStyle='#d7e3ee';ctx.font='24px monospace';ctx.fillText('CONNECT THE DOTS',75,65);ctx.font='16px monospace';ctx.fillText('SISTEMAS / REDES / IA',77,463)});
 const frame=box(.06,1.5,1.2,0x7e648d,-3.85,2.65,1.65,shelves);const print=imagePlane(poster,1.1,1.4,-3.807,2.65,1.65,shelves);print.rotation.y=Math.PI/2;
 // Minecraft-inspired enchanting table: an obsidian block, red top and diamond corners.
 const minecraft=group('minecraft');
 const obsidian=texture(32,32,(ctx,w,h)=>{const shades=['#14121d','#21192b','#2e203b','#1a1725','#382440'];for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){ctx.fillStyle=shades[(x*7+y*13+(x*y)%11)%shades.length];ctx.fillRect(x,y,2,2)}});obsidian.magFilter=THREE.NearestFilter;obsidian.minFilter=THREE.NearestFilter;
 const tableBody=box(1.17,.66,1.17,0x211529,2.65,.41,1,minecraft,0,.001);tableBody.material=new THREE.MeshStandardMaterial({map:obsidian,roughness:1});
 box(1.23,.1,1.23,0x160f1b,2.65,.095,1,minecraft,0,.001);
 box(1.2,.11,1.2,0x792f2b,2.65,.785,1,minecraft,0,.001);
 box(.97,.016,.97,0xa03931,2.65,.85,1,minecraft,0,.001);
 for(const x of [2.13,3.17])for(const z of [.48,1.52]){box(.17,.17,.17,0x51c2c0,x,.735,z,minecraft,0,.001);box(.09,.04,.17,0xa3efdc,x,.835,z,minecraft,0,.001)}
 for(const z of [.46,1.54])box(.7,.035,.035,0xc89f54,2.65,.8,z,minecraft,0,.001);
 for(const x of [2.11,3.19])box(.035,.035,.7,0xc89f54,x,.8,1,minecraft,0,.001);
 const book=new THREE.Group();book.position.set(2.65,1.15,1);book.rotation.y=.2;minecraft.add(book);
 const leftHinge=new THREE.Group(),rightHinge=new THREE.Group();book.add(leftHinge,rightHinge);
 const left=box(.33,.055,.42,0xc9bd99,-.16,0,0,leftHinge);const right=box(.33,.055,.42,0xe1d7b7,.16,0,0,rightHinge);
 const printedPage=texture(64,96,ctx=>{ctx.fillStyle='#e1d7b7';ctx.fillRect(0,0,64,96);for(let row=0;row<8;row++)for(let col=0;col<5;col++){const x=7+col*10,y=9+row*10;ctx.fillStyle=(row+col)%5===0?'#a18d50':'#6b6251';ctx.fillRect(x,y,2,6);ctx.fillRect(x,y+(row%3)*2,6,2);if((row+col)%2)ctx.fillRect(x+4,y+2,2,4)}});printedPage.magFilter=THREE.NearestFilter;
 for(const [x,hinge] of [[-.16,leftHinge],[.16,rightHinge]]){const ink=imagePlane(printedPage,.28,.36,x,.03,0,hinge);ink.rotation.x=-Math.PI/2}
 box(.055,.055,.46,0x62382a,0,-.045,0,book,0,.001);
 for(const x of [-.17,.17]){const hinge=x<0?leftHinge:rightHinge;box(.34,.026,.46,0x8c4533,x,-.036,0,hinge,0,.001);for(const z of [-.2,.2])box(.055,.012,.045,0xc7a359,x+Math.sign(x)*.12,-.016,z,hinge,0,.001)}
 surface('minecraft',1000,640,.00062,[0,.036,0],book,[-Math.PI/2,0,0]);
 const turnLeaf=new THREE.Group();turnLeaf.position.set(0,.045,0);book.add(turnLeaf);box(.3,.006,.4,0xf1deb3,.15,0,0,turnLeaf);turnLeaf.visible=false;
 const idleLeaves=[0,1].map(i=>{const leaf=new THREE.Group();leaf.position.y=.043+i*.008;box(.3,.004,.39,i?0xd9caa4:0xf1deb3,.15,0,0,leaf,0,.001);const ink=imagePlane(printedPage,.27,.35,.15,.004,0,leaf);ink.rotation.x=-Math.PI/2;book.add(leaf);return leaf});
 const diamond=new THREE.Mesh(new THREE.OctahedronGeometry(.1),material(0x9eb9ae,.2));diamond.position.set(3.1,1.4,1);diamond.visible=false;minecraft.add(diamond);
 // Small grey, pixel-built runes rise from the book while the room is in overview.
 const runeCloud=new THREE.Group();runeCloud.userData.station='minecraft';root.add(runeCloud);
 const runePatterns=[[[1,1,1,5],[1,3,4,1],[4,1,1,5]],[[1,1,4,1],[3,2,1,4],[1,5,4,1]],[[1,1,1,5],[4,1,1,5],[1,5,4,1]],[[1,1,4,1],[1,1,1,5],[1,3,4,1]],[[1,1,1,5],[1,1,4,1],[4,1,1,3],[1,5,4,1]],[[1,1,4,1],[1,3,4,1],[1,5,4,1],[1,1,1,3]]];
 const runeSprites=[];
 for(let i=0;i<8;i++){const map=texture(16,16,ctx=>{ctx.fillStyle='#d3d1c9';for(const [x,y,w,h] of runePatterns[i%runePatterns.length])ctx.fillRect(x*2,y*2,w*2,h*2)});map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,color:0xc5c7c8,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));sprite.scale.setScalar(.13+(i%3)*.015);runeCloud.add(sprite);runeSprites.push(sprite)}
 // Resume sheet with visible printed lines.
 const cv=group('cv');const paper=box(.6,.012,.78,0xe0dfdf,-1.65,1.521,-.99,cv);paper.rotation.y=.13;
 const paperTex=texture(300,400,(ctx,w,h)=>{ctx.fillStyle='#e0dfdf';ctx.fillRect(0,0,w,h);ctx.fillStyle='#292b43';ctx.font='bold 28px monospace';ctx.fillText('HUGO',26,48);ctx.fillText('CÁCERES',26,83);ctx.fillStyle='#74639c';ctx.fillRect(26,106,240,7);for(let i=0;i<13;i++){ctx.fillStyle=i%4===0?'#65517f':'#8d91a0';ctx.fillRect(26,140+i*17,i%3===0?170:235,4)}});
 const paperPrint=imagePlane(paperTex,.56,.73,-1.65,1.531,-.99,cv);paperPrint.rotation.x=-Math.PI/2;paperPrint.rotation.z=0;paper.rotation.y=0;
 const cvAnchor=new THREE.Vector3(-1.65,1.521,-.99);cv.children.forEach(c=>c.position.sub(cvAnchor));cv.position.copy(cvAnchor);cv.rotation.y=.13;
 surface('cv',600,848,.00094,[0,.018,0],cv,[-Math.PI/2,0,0]);
 // Phone dock.
 const contact=group('contact');box(.28,.05,.28,0x20243b,.79,1.55,-1.65,root);
 const phone=box(.22,.4,.035,0x101524,.79,1.76,-1.65,contact);phone.rotation.x=-.18;
 const phoneScreen=imagePlane(texture(200,360,(ctx,w,h)=>{ctx.fillStyle='#284b68';ctx.fillRect(0,0,w,h);ctx.fillStyle='#7fe5dd';ctx.font='bold 47px monospace';ctx.fillText('@',80,155);ctx.font='20px monospace';ctx.fillText('HABLEMOS',52,215)}),.18,.33,.79,1.76,-1.625,contact);phoneScreen.rotation.x=-.18;
 const phoneAnchor=new THREE.Vector3(.79,1.76,-1.65);contact.children.forEach(c=>c.position.sub(phoneAnchor));contact.position.copy(phoneAnchor);
 surface('contact',400,730,.00045,[0,0,.029],contact,[-.18,0,0]);
 // Under-desk cable runs and small floor lights.
 line([[-2.1,1.4,-2.1],[-2.1,.65,-2.4],[-1.2,.2,-2.6],[1.55,.2,-2.5],[1.55,1.4,-2.1]],0x454d6d,.018);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 let down=null,disposed=false,frameId,paused=false,activeId=null,flight=null,bookIndex=0,magicProgress=0,cvProgress=0,phoneProgress=0,turnStart=-100,enchantLook=0,enchantLookTarget=0;
 const clock=new THREE.Clock();
 const educationDestination=new THREE.Vector3(-2.55,2.65,-.4);
 function showSurface(id,interactive=false){for(const [key,element] of Object.entries(surfaceElements)){element.dataset.active=String(key===id);element.dataset.interactive=String(key===id&&interactive);element.inert=!(key===id&&interactive)}}
 function fitDistance(width,height){const angle=THREE.MathUtils.degToRad(35/2);return Math.max(height/(2*Math.tan(angle)),width/(2*Math.tan(angle)*camera.aspect))/.8}
 function focusPose(id){
  let target,width,height,normal=new THREE.Vector3(0,0,1);
  switch(id){
   case 'projects':target=new THREE.Vector3(-.6,2.35,-2.05);width=1.98;height=1.11;break;
   case 'minecraft':target=new THREE.Vector3(2.65,2.35,1.14);width=2.36;height=1.51;break;
   case 'education':target=educationDestination.clone().add(new THREE.Vector3(.23,0,0));width=2.84;height=1.97;normal.set(1,0,0);break;
   case 'about':target=new THREE.Vector3(1.62,2.9,-2.865);width=2.42;height=1.72;break;
   case 'cv':target=new THREE.Vector3(-1.25,2.5,-.7);width=2.48;height=3.51;break;
   case 'contact':target=new THREE.Vector3(.79,2.5,-.6);width=.99;height=1.81;break;
   default:return {position:home.clone(),target:center.clone()};
  }
  const distance=fitDistance(width,height);
  return {target,position:target.clone().addScaledVector(normal,distance)};
 }
 function startFlight(id){
  restoreSurface();
  const previous=activeId,fromFov=camera.fov;
  activeId=id;showSurface(previous);controls.enabled=false;
  const from=camera.position.clone(),lookFrom=controls.target.clone();
  const outgoing=from.clone().sub(lookFrom).normalize();
  const changing=Boolean(previous&&id&&previous!==id);
  const distance=from.distanceTo(focusPose(id).position);
  flight={id,previous,elapsed:0,frames:0,from,lookFrom,fromFov,
   propFrom:{magic:magicProgress,cv:cvProgress,phone:phoneProgress,books:educationBooks.map(b=>b.progress)},
   fromOverview:overviewWeight,toOverview:id?0:1,
   endFov:id?35:(container.clientWidth/container.clientHeight<1?46:35),
   changing,pullback:changing?1.9:previous===id?.35:1.1,
   controlOut:from.clone().addScaledVector(outgoing,changing?1.7:.3).add(new THREE.Vector3(0,changing?.55:.25,0)),
   bank:changing?(id==='education'?-1:1)*.028:0,
   duration:reduced.matches?.01:previous===id?2.2:Math.min(3.6,2.8+distance*.035)};
  container.dataset.cameraState=id?'entering':'leaving';
 }
 function commitBook(index){bookIndex=index;educationBooks[bookIndex].group.add(surfaceObjects.education);onBookChanged?.(index)}
 function selectEducation(index){
  index=Math.max(0,Math.min(educationBooks.length-1,index));
  if(index===bookIndex){if(activeId==='education')onFocused?.('education');return}
  if(activeId==='education'){
   startFlight('education');flight.bookChange=index;flight.bookCommitted=false;flight.pullback=.8;flight.duration=reduced.matches?.01:.7;
  }else commitBook(index);
 }
 function pick(event){
  if(activeId||flight)return null;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
  const hits=ray.intersectObjects(root.children,true);
  for(const hit of hits){let o=hit.object;while(o){if(o.userData.station)return {id:o.userData.station,index:o.userData.bookIndex};o=o.parent}if(hit.object.material?.transparent)continue;return null}return null;
 }
 function pointerMove(e){renderer.domElement.style.cursor=pick(e)?'pointer':activeId?'default':'grab';const rect=renderer.domElement.getBoundingClientRect();enchantLookTarget=THREE.MathUtils.clamp(((e.clientX-rect.left)/rect.width-.5)*.55,-.28,.28)}
 function pointerDown(e){down=[e.clientX,e.clientY]}
 function pointerUp(e){if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const result=pick(e);if(result)onOpen(result.id,result.index)}down=null}
 renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
 const lost=e=>{e.preventDefault();onError('La vista 3D se ha interrumpido. Puedes usar la vista de lectura.')};renderer.domElement.addEventListener('webglcontextlost',lost);
 const stationVectors=stations.map(s=>({id:s.id,v:new THREE.Vector3(...s.position)})),labelEls=new Map();
 let overviewWeight=1;
 function viewOffset(){const w=container.clientWidth,h=container.clientHeight,portrait=w<760;camera.setViewOffset(w,h,-w*(portrait?0:.14)*overviewWeight,h*(portrait?-.13:.035)*overviewWeight,w,h)}
 function resize(){restoreSurface();const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;frameOverview();renderer.setSize(w,h);composer.setSize(w,h);cssRenderer.setSize(w,h);camera.aspect=w/h;camera.fov=activeId?35:(w/h<1?46:35);viewOffset();camera.updateProjectionMatrix();if(!flight){const pose=focusPose(activeId);camera.position.copy(pose.position);camera.lookAt(pose.target);controls.target.copy(pose.target)}}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 let last=0,elapsed=0;const projected=new THREE.Vector3();
 function draw(time){
  if(disposed)return;frameId=requestAnimationFrame(draw);if(document.hidden||time-last<(mobile?1000/30:1000/60))return;
  const dt=Math.min((time-last)/1000,.08);last=time;const now=clock.getElapsedTime();if(!paused&&!reduced.matches)elapsed+=dt;
  if(flight){flight.elapsed+=dt;flight.frames++;if(Number.isInteger(flight.bookChange)&&flight.elapsed/flight.duration>=.5&&!flight.bookCommitted){commitBook(flight.bookChange);flight.bookCommitted=true}}
  const smooth=1-Math.exp(-dt*6.5);
  const travelPart=flight?Math.min(1,flight.elapsed/flight.duration):1;
  const propEase=travelPart*travelPart*(3-2*travelPart);
  magicProgress=flight?THREE.MathUtils.lerp(flight.propFrom.magic,activeId==='minecraft'?1:0,propEase):THREE.MathUtils.lerp(magicProgress,activeId==='minecraft'?1:0,reduced.matches?1:smooth);
  cvProgress=flight?THREE.MathUtils.lerp(flight.propFrom.cv,activeId==='cv'?1:0,propEase):THREE.MathUtils.lerp(cvProgress,activeId==='cv'?1:0,reduced.matches?1:smooth);
  phoneProgress=flight?THREE.MathUtils.lerp(flight.propFrom.phone,activeId==='contact'?1:0,propEase):THREE.MathUtils.lerp(phoneProgress,activeId==='contact'?1:0,reduced.matches?1:smooth);
  book.position.set(2.65,THREE.MathUtils.lerp(1.15,2.35,magicProgress)+Math.sin(elapsed*1.5)*.045*(1-magicProgress),1);
  const idle=1-magicProgress;
  if(!paused&&!reduced.matches)enchantLook=THREE.MathUtils.lerp(enchantLook,enchantLookTarget,smooth);
  book.rotation.set(Math.PI/2*magicProgress+Math.sin(elapsed*.85)*.045*idle,(.2+Math.sin(elapsed*.55)*.13+enchantLook)*idle,Math.sin(elapsed*.7)*.035*idle);book.scale.setScalar(1+2.8*magicProgress);
  leftHinge.rotation.z=-(.2+Math.sin(elapsed*1.3)*.065)*idle;rightHinge.rotation.z=(.2+Math.sin(elapsed*1.3+.7)*.065)*idle;
  for(let i=0;i<idleLeaves.length;i++){const cycle=(elapsed+i*.17)%4.2;idleLeaves[i].visible=idle>.98&&!activeId&&cycle<.95;idleLeaves[i].rotation.z=Math.PI*THREE.MathUtils.smoothstep(cycle,0,.95)}
  runeCloud.visible=!activeId&&!flight;
  for(let i=0;i<runeSprites.length;i++){const life=(elapsed*.3+i/runeSprites.length)%1,angle=i*2.399+life*.45,radius=.06+life*.4;const rune=runeSprites[i];rune.position.set(2.65+Math.cos(angle)*radius,1.18+life*.85,1+Math.sin(angle)*radius);rune.material.opacity=Math.sin(life*Math.PI)*.55;rune.material.rotation=Math.sin(elapsed*.3+i)*.12}
  const pageProgress=(now-turnStart)/.7;turnLeaf.visible=activeId==='minecraft'&&pageProgress>=0&&pageProgress<1;turnLeaf.rotation.z=-Math.PI*Math.max(0,Math.min(1,pageProgress));
  cv.position.copy(cvAnchor).lerp(new THREE.Vector3(-1.25,2.5,-.7),cvProgress);cv.rotation.set(Math.PI/2*cvProgress,.13*(1-cvProgress),-.035*cvProgress);cv.scale.setScalar(1+3.4*cvProgress);
  contact.position.copy(phoneAnchor).lerp(new THREE.Vector3(.79,2.5,-.6),phoneProgress);contact.rotation.x=.18*phoneProgress;contact.scale.setScalar(1+4.5*phoneProgress);
  for(let i=0;i<educationBooks.length;i++){
   const b=educationBooks[i];
   let desired=activeId==='education'&&i===bookIndex?1:0;
   if(flight&&Number.isInteger(flight.bookChange)){
    const part=Math.min(1,flight.elapsed/flight.duration);
    if(!flight.bookCommitted&&i===bookIndex)desired=1-THREE.MathUtils.smoothstep(part,.05,.42);
    if(flight.bookCommitted&&i===bookIndex)desired=THREE.MathUtils.smoothstep(part,.5,1);
   }
   const bookTime=flight?Math.min(1,flight.elapsed/.7):1,bookEase=reduced.matches?1:bookTime*bookTime*(3-2*bookTime);
   b.progress=flight?(Number.isInteger(flight.bookChange)?desired:THREE.MathUtils.lerp(flight.propFrom.books[i],desired,bookEase)):THREE.MathUtils.lerp(b.progress,desired,reduced.matches?1:smooth);
   const p=b.progress;b.group.position.copy(b.base).lerp(educationDestination,p);b.group.scale.setScalar(1+2.4*p);b.group.rotation.y=Math.PI/2;
   b.left.position.x=-.225*p;b.right.position.x=.225*p;b.left.rotation.y=-Math.PI/2*(1-p);b.right.rotation.y=Math.PI/2*(1-p);b.spine.visible=p<.75;b.label.visible=p<.25;b.pagesLeft.visible=p>.1;b.pagesRight.visible=p>.1;b.pagesLeft.scale.x=Math.max(.01,p);b.pagesRight.scale.x=Math.max(.01,p);
  }
  if(flight){
   const t=Math.min(1,flight.elapsed/flight.duration),ease=t*t*(3-2*t),pose=focusPose(flight.id);
   const incoming=pose.position.clone().sub(pose.target).normalize();
   const controlIn=pose.position.clone().addScaledVector(incoming,flight.pullback).add(new THREE.Vector3(0,flight.changing?.45:.2,0));
   // Pull away from the current object, sweep around the room, then settle in front of the next one.
   const remaining=1-ease;
   camera.position.copy(flight.from).multiplyScalar(remaining**3)
    .addScaledVector(flight.controlOut,3*remaining*remaining*ease)
    .addScaledVector(controlIn,3*remaining*ease*ease)
    .addScaledVector(pose.position,ease**3);
   controls.target.copy(flight.lookFrom).lerp(pose.target,ease);camera.lookAt(controls.target);
   if(!reduced.matches)camera.rotateZ(Math.sin(t*Math.PI)*flight.bank);
   overviewWeight=THREE.MathUtils.lerp(flight.fromOverview,flight.toOverview,ease);viewOffset();
   camera.fov=THREE.MathUtils.lerp(flight.fromFov,flight.endFov,ease)+(reduced.matches?0:Math.sin(t*Math.PI)*(flight.changing?7:4));camera.updateProjectionMatrix();
   if(flight.previous&&t<(flight.id?.38:.9))showSurface(flight.previous);
   else if(flight.id&&t>.78)showSurface(flight.id);
   else showSurface(null);
   if(t===1){const id=flight.id;camera.fov=flight.endFov;camera.updateProjectionMatrix();flight=null;controls.enabled=!id;if(!id)controls.target.copy(center);showSurface(id,true);container.dataset.cameraState=id?'focused':'overview';onFocused?.(id)}
  }else if(!activeId){controls.update()}
  composer.render();
  if(!sharpSurface){cssRenderer.render(scene,camera);if(activeId&&!flight)sharpenSurface(activeId)}
  for(const s of stationVectors){let el=labelEls.get(s.id);if(!el){el=container.querySelector(`[data-station="${s.id}"]`);if(el)labelEls.set(s.id,el)}if(!el)continue;projected.copy(s.v).project(camera);el.style.left=((projected.x+1)/2*container.clientWidth)+'px';el.style.top=((-projected.y+1)/2*container.clientHeight)+'px';el.style.visibility=activeId||Math.abs(projected.x)>1||Math.abs(projected.y)>1?'hidden':'visible'}
 }
 frameId=requestAnimationFrame(draw);onReady(surfaceElements);
 return {
  reset(){startFlight(null)},pause(value){paused=value},motion(value){motionEnabled=value},select(id,index){if(id==='education'&&Number.isInteger(index)&&activeId!=='education')commitBook(index);startFlight(id)},education:selectEducation,
  turnPage(){turnStart=clock.getElapsedTime()},
  dispose(){disposed=true;cancelAnimationFrame(frameId);observer.disconnect();controls.dispose();composer.dispose();renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose()}}});renderer.dispose();renderer.domElement.remove();cssRenderer.domElement.remove();sharpLayer.remove()}
 };
}
