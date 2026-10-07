export const profile = {
  name: 'Hugo Cáceres', fullName: 'Hugo Cáceres Martín',
  github: 'https://github.com/HugoCaceres22', email: 'hugocaceresmartin@gmail.com', linkedin: '', cv: '',
  intro: 'Aprendo informática construyendo entornos, automatizando tareas y entendiendo cómo se conectan las piezas.',
  about: 'Mi trabajo se centra en sistemas, redes y automatización. Me interesa desplegar un entorno, comprender qué sucede cuando algo falla y documentar una solución que pueda repetir. También exploro el tratamiento de datos y el aprendizaje automático desde la práctica.',
  education: [
    {title:'Curso de especialización en Inteligencia Artificial y Big Data',place:'IES Zaidín-Vergeles · 2026–actualidad',detail:'Formación actual de especialización en inteligencia artificial y tratamiento de datos.'},
    {title:'Técnico Superior en Administración de Sistemas Informáticos en Red',place:'IES Zaidín-Vergeles · 2024–2026',detail:'Formación de grado superior en administración de sistemas informáticos en red (ASIR).'},
    {title:'Bachillerato Tecnológico',place:'IES Pedro Soto de Rojas · 2022–2024',detail:'Formación de bachillerato en la modalidad tecnológica.'}
  ],
  experience: [{title:'Prácticas en un entorno laboral real',place:'Input for You · 4 meses',detail:'Soporte y resolución de incidencias básicas de software y sistemas, tareas técnicas del día a día y atención a usuarios. Trabajo en equipo y adaptación a un entorno real de trabajo.'}],
  certifications: [{title:'Cisco — Introducción a redes',place:'Cisco',detail:'Formación introductoria en redes.'}],
  languages: [{title:'Inglés · B2',place:'Cambridge',detail:'Inglés de nivel intermedio alto.'}],
  areas: [
    {title:'Sistemas',text:'Administración de entornos Linux y Windows, dominios y políticas de grupo.',tech:['Linux','Windows Server','Active Directory','GPO']},
    {title:'Automatización',text:'Configuraciones reproducibles y administración centralizada de equipos.',tech:['Ansible','PowerShell','Python','Git / GitHub']},
    {title:'Monitorización y seguridad',text:'Conocimientos de monitorización con Zabbix y prácticas documentadas de cifrado y recuperación.',tech:['Zabbix','BitLocker','Kerberos','Certificados']},
    {title:'Redes',text:'Servicios de direccionamiento y resolución de nombres en laboratorios virtualizados.',tech:['DHCP','DNS / BIND9','WinRM HTTPS','Vagrant']},
    {title:'Datos',text:'Prácticas de extracción y transformación con cuadernos Python y distintos formatos.',tech:['Pandas','DuckDB','Dask','CSV / JSON / XML / Parquet']},
    {title:'Inteligencia artificial',text:'Área de aprendizaje vinculada al tratamiento de datos. Exploro sus herramientas desde la formación y la práctica.',tech:['Python','Jupyter','scikit-learn · en formación']}
  ]
};
export const projects = [
 {id:'01',slug:'Windows-Managed-with-Ansible',title:'Un dominio.\nUn punto de control.',category:'SISTEMAS / AUTOMATIZACIÓN',name:'Windows Managed with Ansible',description:'Administración de equipos Windows desde Ubuntu con Ansible, autenticación Kerberos y WinRM sobre HTTPS.',problem:'Evitar preparar y administrar cada equipo del dominio de forma manual.',work:'Preparación del entorno con Active Directory, GPO, AD CS y certificados de equipo. Arquitectura y configuración documentadas.',result:'Un diseño de administración centralizada con conexión segura al dominio. El repositorio contiene README y documentación PDF.',tech:['Ansible','Ubuntu','Active Directory','Kerberos','WinRM HTTPS'],flow:['Ubuntu + Ansible','Kerberos · HTTPS :5986','Dominio Windows'],type:'domain'},
 {id:'02',slug:'bitlocker-ad-recovery-automation',title:'Cifrado con\nun plan de recuperación.',category:'SEGURIDAD / WINDOWS',name:'BitLocker y Active Directory',description:'Gestión de claves de recuperación de BitLocker mediante políticas de grupo y PowerShell.',problem:'Centralizar las claves de recuperación de los equipos de un dominio.',work:'Configuración de GPO y tarea programada que realiza el backup del protector RecoveryPassword en Active Directory y genera logs.',result:'Proceso de respaldo documentado. La activación de BitLocker se realiza manualmente; la tarea automatiza el guardado posterior de la clave.',tech:['BitLocker','PowerShell','GPO','TPM','Active Directory'],flow:['Equipo + BitLocker','PowerShell · GPO','Clave de recuperación → AD'],type:'security'},
 {id:'03',slug:'Dynamic-DNS',title:'Una red que\nresuelve sus cambios.',category:'REDES / LINUX',name:'DHCP y DNS dinámico',description:'Laboratorio Linux en el que DHCP y BIND9 mantienen sincronizadas las direcciones y los nombres de los clientes.',problem:'Actualizar la resolución de nombres cuando cambia la dirección IP de un cliente.',work:'Configuración de DHCP, zonas DNS directas e inversas y actualizaciones autenticadas con TSIG. Aprovisionamiento base con Ansible y Vagrant.',result:'El README documenta renovaciones de concesión y comprobaciones de resolución directa e inversa con dig.',tech:['Linux','BIND9','DHCP','Ansible','Vagrant'],flow:['Cliente · concesión DHCP','Actualización DNS','BIND9 · directa e inversa'],type:'network'}
];
