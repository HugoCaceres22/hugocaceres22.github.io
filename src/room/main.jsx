import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import {profile} from '../data/profile.js';
import {stations} from './content.js';
import {Experience} from './experiences.jsx';
import './room.css';

function Room(){
 const stage=useRef(null),scene=useRef(null),lastFocus=useRef(null),activeRef=useRef(null);
 const [ready,setReady]=useState(false),[error,setError]=useState(''),[active,setActive]=useState(null),[phase,setPhase]=useState('overview'),[motion,setMotion]=useState(true),[surfaces,setSurfaces]=useState({}),[busy,setBusy]=useState(false),[reading,setReading]=useState(false),[bookIndex,setBookIndex]=useState(0),[labels,setLabels]=useState(true),[paused,setPaused]=useState(false),[help,setHelp]=useState(true);
 const activeStation=stations.find(s=>s.id===active);
 function open(id,index){
  if(!activeRef.current)lastFocus.current=document.activeElement;
  activeRef.current=id;setActive(id);setPhase('entering');setHelp(false);setReading(false);setBusy(Boolean(scene.current)&&!error);
  if(Number.isInteger(index))setBookIndex(index);
  scene.current?.select(id,Number.isInteger(index)?index:bookIndex);
 }
 function close(){if(!activeRef.current)return;activeRef.current=null;setReading(false);if(scene.current&&!error){setPhase('leaving');setBusy(true);scene.current.reset()}else{setActive(null);setPhase('overview');setBusy(false)}}
 useEffect(()=>{
  let cancel=false;
  import('./scene.js').then(({createRoom})=>{if(cancel)return;try{
   scene.current=createRoom(stage.current,{onOpen:open,onReady:elements=>{setSurfaces(elements);setReady(true)},onBookChanged:setBookIndex,onFocused:id=>{setBusy(false);setPhase(id?'focused':'overview');if(!id){setActive(null);if(lastFocus.current?.isConnected)lastFocus.current.focus({preventScroll:true})}if(id===activeRef.current){const surface=surfaces[id]||stage.current?.querySelector('.surface-'+id);const first=surface?.querySelector('[aria-pressed="true"]')||surface?.querySelector('button:not(:disabled), a');first?.focus({preventScroll:true})}},onError:message=>{setError(message);setBusy(false)}});
   scene.current.pause(paused);scene.current.motion(motion);if(activeRef.current){setBusy(true);scene.current.select(activeRef.current,0)}
  }catch(e){console.error(e);setError('Tu navegador no ha podido abrir la vista 3D. Puedes usar la vista de lectura.')}}).catch(()=>setError('No se ha podido cargar la escena. Puedes explorar los contenidos desde el menú.'));
  return()=>{cancel=true;scene.current?.dispose()};
 },[]);
 useEffect(()=>{function escape(e){if(e.key==='Escape'&&activeRef.current){e.preventDefault();close()}}window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[]);
 useEffect(()=>{for(const [id,el] of Object.entries(surfaces))el.inert=reading||Boolean(error)||id!==active||busy},[reading,error,active,busy,surfaces]);
 useEffect(()=>{
  const panel=document.querySelector('.reading-experience.read-projects');if(!panel)return;
  function fit(){if(matchMedia('(max-width:760px)').matches)return;panel.style.setProperty('--library-fit',String(Math.min(1,panel.clientWidth/1000,panel.clientHeight/560)))}
  const observer=new ResizeObserver(fit);observer.observe(panel);fit();return()=>observer.disconnect();
 },[reading,error,active,surfaces]);
 function pause(){setPaused(v=>{scene.current?.pause(!v);return !v})}
 function selectBook(index){if(!error&&scene.current&&!reading){setBusy(true);scene.current.education(index)}else{setBookIndex(index);scene.current?.education(index)}}
 function toggleMotion(){setMotion(v=>{scene.current?.motion(!v);return !v})}
 const experience=id=><Experience id={id} bookIndex={bookIndex} onBook={selectBook} onTurn={()=>scene.current?.turnPage()}/>;
 const readMode=Boolean(active&&(reading||error||!surfaces[active]));
 return <div data-motion={motion?'full':'reduced'} data-view={phase} className={'room-app '+(active?'exploring exploring-'+active:'')+(busy?' is-travelling':'')+(readMode?' reading-mode':'')}>
  <a className="room-skip" href="#room-navigation">Saltar al menú de contenidos</a>
  <div className="ambient ambient-cyan"/><div className="ambient ambient-violet"/>
  <header className="room-header"><a className="room-brand" href="../" aria-label="Volver al portfolio de Hugo Cáceres">HC<span>✦</span></a><span className="header-divider"/><span className="room-header-caption">{activeStation?activeStation.object.toUpperCase()+' / '+activeStation.title.toUpperCase():'MI PEQUEÑO UNIVERSO DIGITAL'}</span><a className="back-link" href="../"><span>↖</span> Portfolio clásico</a></header>
  <div className={'experience-toolbar '+(!active?'toolbar-overview':'')} aria-hidden={!active} inert={!active?true:undefined}><button className="return-room" onClick={close} aria-label="Volver a la habitación (Escape)"><span className="return-arrow" aria-hidden="true">←</span><span>Volver a la habitación</span><kbd>ESC</kbd></button><div className="experience-context"><span className="active-object-dot"/>{phase==='leaving'?'Volviendo a la habitación…':busy?'Acercándonos…':active==='projects'?'Biblioteca de proyectos':active==='education'?'Elige un libro de la estantería':active==='minecraft'?'El grimorio de MeT':active==='about'?'Cada nota cuenta una historia':active==='cv'?'Currículum original':'Pulsa una aplicación'}</div>{!error&&surfaces[active]&&<button className="reading-toggle" aria-pressed={reading} onClick={()=>setReading(!reading)}>{reading?'Ver en el objeto ◇':'Ampliar lectura ⤢'}</button>}</div>
  <main className="room-main"><section className="room-intro" inert={active?true:undefined} aria-hidden={Boolean(active)}><span className="status"><i/> SISTEMA EN MODO CURIOSIDAD</span><h1>Donde las <br/>ideas <em>cobran <br/>vida.</em></h1><p>Soy Hugo Cáceres. <br/>Sistemas, código y muchas<br className="desktop-break"/> ganas de construir.</p><div className="intro-rule"/><span className="intro-invitation">Pasa. Estás en mi habitación.</span><button className="explore-button" onClick={()=>open('projects')}>Explorar mis proyectos <span>↗</span></button><span className="coordinates">37° N &nbsp; / &nbsp; GRANADA, ES</span></section>
  <section className={'room-stage '+(!labels?'labels-hidden':'')} ref={stage} inert={readMode?true:undefined} aria-hidden={readMode} aria-label="Habitación interactiva">
   {!ready&&!error&&<div className="loading" role="status"><span className="loading-orbit"/>Encendiendo el setup…</div>}
   {error&&!active&&<div className="scene-error" role="status"><span>⌘</span><h2>El contenido sigue aquí.</h2><p>{error}</p><button onClick={()=>open('projects')}>Explorar proyectos ↗</button></div>}
   {ready&&!error&&stations.map(s=><button className="hotspot" data-station={s.id} key={s.id} aria-label={s.title+' · '+s.object} onClick={()=>open(s.id)}><span className="hotspot-number">{s.number}</span><span className="hotspot-label">{s.title}<small>{s.object}</small></span></button>)}
  </section>
  {Object.entries(surfaces).map(([id,element])=>createPortal(experience(id),element,id))}
  {readMode&&<section className="reading-stage" aria-label={'Vista de lectura de '+activeStation.title}><div className={'reading-experience read-'+active}>{experience(active)}</div></section>}
  {!active&&<><div className="scene-caption"><span className="view-mark">⌖</span><span>HUGO’S ROOM <small>UN ESPACIO PARA EXPLORAR</small></span><span className="scene-caption-line"/><span className="scene-version">VOL. 02 / 2026</span></div><div className="room-tools" aria-label="Controles de la escena"><button onClick={toggleMotion} aria-pressed={motion} title={motion?'Movimiento de cámara completo':'Movimiento de cámara reducido'} aria-label="Animaciones de cámara completas">{motion?'✦':'◇'}</button><button onClick={()=>{scene.current?.reset();setHelp(false)}} title="Restablecer cámara" aria-label="Restablecer cámara">⌂</button><button onClick={()=>setLabels(!labels)} aria-pressed={labels} title="Mostrar etiquetas" aria-label="Mostrar etiquetas">⌖</button><button onClick={pause} aria-pressed={paused} title={paused?'Reanudar animación':'Pausar animación'} aria-label={paused?'Reanudar animación':'Pausar animación'}>{paused?'▷':'Ⅱ'}</button></div></>}
  {help&&ready&&!error&&!active&&<div className="room-hint"><span>↔</span><p>Arrastra para mirar alrededor.<br/><strong>Pulsa un objeto para entrar en su historia.</strong></p><button onClick={()=>setHelp(false)} aria-label="Ocultar ayuda">×</button></div>}
  <span className="sr-only" role="status">{phase==='leaving'?'Volviendo a la vista general de la habitación':busy?'Animando la cámara hacia '+activeStation?.object:activeStation?'Explorando '+activeStation.title:''}</span>
  </main>
  <nav id="room-navigation" className="station-nav" aria-label="Explorar la habitación">{stations.map(s=><button key={s.id} onClick={()=>open(s.id)} aria-pressed={active===s.id}><span className="nav-icon" aria-hidden="true">{s.icon}</span><span><small>{s.number} / {s.object}</small>{s.title}</span><span className="nav-arrow" aria-hidden="true">↗</span></button>)}</nav>
  <footer className="room-footer"><span>© {new Date().getFullYear()} HUGO CÁCERES</span><span>HECHO CON CURIOSIDAD <i>✦</i></span><a href={profile.github} target="_blank" rel="noreferrer">GITHUB ↗</a></footer>
 </div>
}
createRoot(document.getElementById('room-root')).render(<Room/>);
