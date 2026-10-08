/* Professor Tutor: uso anônimo por abertura e por ocorrência de desafio. */
(()=>{
 if(window.__tutorUsageTracker)return;window.__tutorUsageTracker=true;
 const page=location.hostname==='neilasalem.github.io'?({'/horizontes/jogo_a.html':'jogo-a','/horizontes/jogo_b.html':'jogo-b','/horizontes/jogo_c.html':'jogo-c','/horizontes/jogo_d.html':'jogo-d'}[location.pathname]):location.hostname==='furukawaluzia-lt1.github.io'&&location.pathname.startsWith('/tutor-fracoes-rubrica/')?'guia':null;
 if(!page||!crypto.randomUUID)return;
 const endpoint='https://coleta-uso-professor-tutor.furukawaluzia.chatgpt.site/api/coleta';
 const id=crypto.randomUUID();let active=0,prints=0,activity=null,last=performance.now(),eligible=document.visibilityState==='visible'&&document.hasFocus(),suspended=false;
 function tick(){const now=performance.now(),elapsed=Math.min(Math.max(0,now-last),15000);if(eligible){active=Math.min(active+elapsed,14400000);if(activity&&!activity.correct)activity.active_ms=Math.min(activity.active_ms+elapsed,14400000)}last=now;eligible=!suspended&&document.visibilityState==='visible'&&document.hasFocus()}
 function send(){tick();const data=JSON.stringify({id,page,active_ms:Math.floor(active),prints,...(activity?{activity:{...activity,active_ms:Math.floor(activity.active_ms)}}:{})});if(!navigator.sendBeacon(endpoint,new Blob([data],{type:'text/plain'})))fetch(endpoint,{method:'POST',body:data,headers:{'Content-Type':'text/plain'},keepalive:true,credentials:'omit'}).catch(()=>{})}
 window.TutorActivity={
  begin(challenge){if(page==='guia'||!Number.isSafeInteger(challenge)||challenge<1||challenge>50)return;tick();if(activity)send();activity={id:crypto.randomUUID(),challenge,active_ms:0,attempts:0,correct:0,first_correct:0};send()},
  answer(correct){if(!activity||activity.correct||typeof correct!=='boolean')return;tick();activity.attempts=Math.min(activity.attempts+1,1000);if(correct){activity.correct=1;activity.first_correct=activity.attempts===1?1:0}send()}
 };
 document.addEventListener('visibilitychange',()=>{tick();send()});window.addEventListener('focus',tick);window.addEventListener('blur',()=>{tick();send()});window.addEventListener('pagehide',()=>{tick();suspended=true;eligible=false;send()});window.addEventListener('pageshow',()=>{last=performance.now();suspended=false;eligible=document.visibilityState==='visible'&&document.hasFocus();send()});
 document.addEventListener('click',e=>{if(page==='guia'&&e.target.closest&&e.target.closest('#printPage')){prints=Math.min(prints+1,100);send()}});
 setInterval(tick,5000);setInterval(send,15000);send();
})();

