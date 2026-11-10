import {profile, projects} from '../data/profile.js';
export const roomProjects = [
 {...projects[0],url:profile.github+'/Windows-Managed-with-Ansible',label:'01 / INFRAESTRUCTURA',headline:'Windows, bajo control.',summary:'Un punto de administración para todo un dominio Windows.'},
 {name:'Minecraft Enchanting Tool',label:'02 / DESARROLLO WEB + IA',headline:'Menos niveles. Más encantamientos.',summary:'Una herramienta que propone el orden de combinación de objetos y libros en el yunque.',description:'Proyecto en equipo con Jesús Pérez Marinetto. Dos aplicaciones para explorar el desarrollo asistido por IA y guiado por especificaciones.',work:'Interfaz con Vue y una API con FastAPI. Consulta a OpenRouter, validación de las respuestas y acceso con Clerk en la segunda aplicación.',tech:['Vue','FastAPI','Docker','IA','AWS'],url:'https://github.com/Marinettoo/Minecraft-Enchanting-Tool'},
 {name:'PC Control · Control Nexus',label:'03 / APLICACIÓN WINDOWS',headline:'Tu equipo, en tiempo real.',summary:'Una aplicación de escritorio para consultar el rendimiento del ordenador.',description:'Panel configurable, perfiles, alertas y overlay manual. La monitorización se realiza mientras la aplicación está abierta.',work:'Aplicación en C# y WPF sobre .NET 8. El panel permite elegir sensores y adaptar su distribución. La compatibilidad del overlay con juegos concretos requiere validación en cada entorno.',tech:['C#','WPF','.NET 8','Windows'],url:'https://github.com/HugoCaceres22/PC-Control'},
 {...projects[2],url:profile.github+'/Dynamic-DNS',label:'04 / REDES',headline:'Una red que se adapta.',summary:'DHCP y DNS sincronizados en un laboratorio Linux.'},
 {...projects[1],url:profile.github+'/bitlocker-ad-recovery-automation',label:'05 / SEGURIDAD',headline:'Cifrar y poder recuperar.',summary:'Respaldo de claves de recuperación de BitLocker en Active Directory.'}
];
export const stations = [
 {id:'projects',number:'01',title:'Mis proyectos',object:'El ordenador',icon:'⌘',position:[-.55,2.5,-1.9]},
 {id:'about',number:'02',title:'Sobre mí',object:'El mural',icon:'✦',position:[1.62,3,-2.8]},
 {id:'education',number:'03',title:'Formación',object:'La estantería',icon:'▤',position:[-3.5,2.7,-.3]},
 {id:'minecraft',number:'04',title:'Minecraft',object:'La mesa de encantamientos',icon:'◇',position:[2.65,1.25,.8]},
 {id:'cv',number:'05',title:'Mi currículum',object:'El documento',icon:'↧',position:[-1.65,1.58,-.99]},
 {id:'contact',number:'06',title:'Contacto',object:'El teléfono',icon:'↗',position:[.79,1.85,-1.65]}
];
