// Reveal individual pieces of content once per page visit, never on scroll-back.
export function installScrollReveals(){
 if(!('IntersectionObserver' in window))return;
 const selectors=[
  '.hero-top > span','.hero h1 > span','.room-entry-copy > *','.room-entry-visual',
  '.hero-description > *','.round-link','.hero-foot > *','.section-label',
  'main h2','main h3','main h4','.about-copy > p','.section-heading > p',
  '.project-top > span','.project-description','.tags','.project-link','.blueprint',
  '.project-details p','.knowledge-heading > p','.area-number','.area > p','.area-tech',
  '.timeline article > span','.timeline article > p','.github-section > a',
  '.github-section > p','.contact-row > p','.contact-row > div','.contact-email','footer > *'
 ];
 const elements=[...document.querySelectorAll(selectors.join(','))];
 const order=new Map(elements.map((el,index)=>[el,index]));
 const animations=new Map();
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 function finish(el){
  el.dataset.revealState='shown';
  animations.get(el)?.cancel();animations.delete(el);
  observer.unobserve(el);
 }
 function reveal(el,sequence){
  if(el.dataset.revealState!=='pending')return;
  observer.unobserve(el);
  const reduced=motion.matches;
  const heading=el.matches('h2,h3,h4,.hero h1 > span');
  const visual=el.matches('.blueprint,.room-entry-visual');
  const distance=reduced?12:heading?46:28;
  const from=visual&&!reduced?'translateY(28px) scale(.96)':`translateY(${distance}px)${heading&&!reduced?' rotate(.7deg)':''}`;
  el.dataset.revealState='entering';
  const animation=el.animate([
   {opacity:0,transform:from},
   {opacity:1,transform:'none'}
  ],{duration:reduced?420:heading?950:visual?1000:750,delay:Math.min(sequence,4)*(reduced?45:85),easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  animations.set(el,animation);
  // Remove the animation layer entirely: finished text remains sharp and static.
  animation.finished.then(()=>finish(el),()=>{});
 }
 const observer=new IntersectionObserver(entries=>{
  entries.filter(e=>e.isIntersecting).sort((a,b)=>order.get(a.target)-order.get(b.target)).forEach((entry,index)=>reveal(entry.target,index));
 },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
 for(const el of elements){el.classList.add('scroll-reveal');el.dataset.revealState='pending';observer.observe(el)}
 function onFocus(event){const el=event.target.closest?.('.scroll-reveal');if(el)finish(el)}
 document.addEventListener('focusin',onFocus);
 return()=>{
  observer.disconnect();document.removeEventListener('focusin',onFocus);
  for(const el of elements){el.dataset.revealState='shown';animations.get(el)?.cancel();el.classList.remove('scroll-reveal')}
  animations.clear();
 };
}
