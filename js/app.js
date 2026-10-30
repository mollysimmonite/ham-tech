// Study and mock exam logic. Question content lives in data/*.js, figures in img/.
const L="ABCD"; let state={}, missedOnly=false;
try{state=JSON.parse(localStorage.getItem("tp-state")||"{}")||{}}catch(e){state={}}
function save(){try{localStorage.setItem("tp-state",JSON.stringify(state))}catch(e){}}
const SUBS=[["T1","Commission’s Rules"],["T2","Operating Procedures"],["T3","Radio Wave Propagation"],["T4","Amateur Radio Practices"],["T5","Electrical Principles"],["T6","Electronic and Electrical Components"],["T7","Practical Circuits"],["T8","Signals and Emissions"],["T9","Antennas and Feed Lines"],["T0","Safety"]];
let cur="T1A";
try{const s=localStorage.getItem("sec");if(s&&SECTIONS.some(x=>x.id===s))cur=s}catch(e){}
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
function sec(){return SECTIONS.find(s=>s.id===cur)}
function tally(id){const s=SECTIONS.find(x=>x.id===id);let g=0,d=0;s.qs.forEach(q=>{const v=state[q.id];if(v!=null&&v!=="peek"){d++;if(v===q.a)g++}});return{g,d,n:s.qs.length}}
function subTally(sb){let g=0,d=0,n=0;SECTIONS.filter(s=>s.sub===sb).forEach(s=>{const t=tally(s.id);g+=t.g;d+=t.d;n+=t.n});return{g,d,n}}
function renderTabs(){const cs=sec().sub;$("subs").innerHTML=SUBS.map(([id,nm])=>{const t=subTally(id);return `<button class="tab sub" role="tab" aria-selected="${id===cs}" data-sub="${id}" title="${nm}">${id}<span class="sc">${t.d?t.g+"/"+t.n:t.n+" q"}</span></button>`}).join("");$("tabs").innerHTML=SECTIONS.filter(s=>s.sub===cs).map(s=>{const t=tally(s.id);return `<button class="tab" role="tab" aria-selected="${s.id===cur}" data-s="${s.id}">${s.id}<span class="sc">${t.d?t.g+"/"+t.n:t.n+" q"}</span></button>`}).join("")}
function renderScore(){const s=sec(),t=tally(cur);$("score").textContent=`${t.g} right of ${t.d} tried · ${t.n} in section`;$("meter").innerHTML=s.qs.map(q=>{const v=state[q.id];return `<i class="${v==null||v==="peek"?"":v===q.a?"g":"b"}"></i>`}).join("")}
function card(q,mode){const ex=mode==="exam",rs=mode==="result";const v=ex||rs?(EX.ans[q.id]):state[q.id];const ord=(ex||rs)&&EX.ord&&EX.ord[q.id]||[0,1,2,3],ltr=i=>L[ord.indexOf(i)];const done=rs||(!ex&&v!=null);let h=`<div class="qid">${ex||rs?`Question ${EX.qs.indexOf(q.id)+1} of 35 · `:""}${q.id}</div><p class="qt">${esc(q.q)}</p>`;
 if(q.fig)h+=`<div class="fig"><img src="${FIGS[q.fig]}" alt="Official exam figure ${q.fig.replace("T","T-")}"></div>`;
 h+=`<div class="opts">`;
 ord.forEach((i,p)=>{const o=q.o[i];let c="";if(done){if(i===q.a)c="right";else if(i===v)c="wrong";else c="dim"}else if(ex&&i===v)c="sel";
  const note=done&&q.w[i]?`<span class="note">${esc(q.w[i])}</span>`:"";
  h+=`<button class="opt ${c}" ${ex?`data-x="${q.id}"`:`data-q="${q.id}"`} data-i="${i}" ${done?"disabled":""}><b>${L[p]}</b><span>${esc(o)}${note}</span></button>`});
 h+="</div>";
 if(done){const vd=v==="peek"?`<div class="verdict">Answer: ${ltr(q.a)}</div>`:v==null?`<div class="verdict b">Left blank. It's ${ltr(q.a)}</div>`:v===q.a?`<div class="verdict g">Correct, ${ltr(q.a)}</div>`:`<div class="verdict b">Not quite. It's ${ltr(q.a)}</div>`;
  h+=`<div class="exp">${vd}<p>${esc(q.e)}</p>${q.t?`<div class="tip"><span>Remember</span>${esc(q.t)}</div>`:""}</div>`}
 else if(!ex)h+=`<button class="ghost peek" data-peek="${q.id}">Just show me</button>`;
 return `<article class="q" id="${ex||rs?"x":"c"}-${q.id}">${h}</article>`}

/* ---- mock exam ---- */
const QI={};SECTIONS.forEach(s=>s.qs.forEach(q=>QI[q.id]=q));
let EX=null,HIST=[],tick=null,confirmOpen=false;
try{EX=JSON.parse(localStorage.getItem("tp-exam")||"null")}catch(e){}
try{HIST=JSON.parse(localStorage.getItem("tp-hist")||"[]")||[]}catch(e){}
function saveEx(){try{localStorage.setItem("tp-exam",JSON.stringify(EX))}catch(e){}}
// Shuffle answer order so you learn the answer, not its letter. "All these choices are correct" stays last.
function shuffle(q){const pin=i=>/^(all|none of) these (choices|answers)/i.test(q.o[i]);const free=[0,1,2,3].filter(i=>!pin(i));for(let i=free.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[free[i],free[j]]=[free[j],free[i]]}return free.concat([0,1,2,3].filter(pin))}
function startExam(){const qs=SECTIONS.map(s=>s.qs[Math.floor(Math.random()*s.qs.length)].id),ord={};qs.forEach(id=>ord[id]=shuffle(QI[id]));EX={qs,ord,ans:{},start:Date.now(),done:false};saveEx();renderLast();confirmOpen=false;showExam();window.scrollTo({top:0})}
function fmt(ms){const s=Math.floor(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}
function nAns(){return EX.qs.filter(id=>EX.ans[id]!=null).length}
function exStat(){const el=$("exstat");if(!el)return;el.textContent=`${nAns()} of 35 answered · ${fmt((EX.end||Date.now())-EX.start)}`}
function dots(){return `<div class="dots">${EX.qs.map((id,i)=>{const v=EX.ans[id],q=QI[id];const c=EX.done?(v===q.a?"g":"b"):(v!=null?"on":"");return `<a href="#" data-jump="${id}" class="${c}" title="Question ${i+1}" aria-label="Go to question ${i+1}"></a>`}).join("")}</div>`}
function showExam(){$("study").hidden=true;$("exam").hidden=false;clearInterval(tick);
 if(!EX.done){
  $("exam").innerHTML=`<div class="exbar"><div class="exstat"><span id="exstat"></span><span id="dots">${dots()}</span></div><div class="btns"><button class="ghost" id="quitExam">Quit</button><button class="cta" id="submitExam">Submit</button></div></div>
  <section class="intro"><div class="eyebrow">Mock exam</div><h2>35 questions, one from each group</h2><p>Just like the real exam: answers aren't shown until you submit, and you need 26 right to pass. Answer choices are shuffled, so learn the answer, not the letter. You can change answers any time before submitting. Your place is saved if you leave the page.</p></section>
  <div id="confirm"></div><div class="exlist">${EX.qs.map(id=>card(QI[id],"exam")).join("")}</div>
  <div class="btns" style="justify-content:flex-end"><button class="cta" id="submitExam2">Submit exam</button></div>`;
  exStat();tick=setInterval(exStat,1000);
 } else {
  const right=EX.qs.filter(id=>EX.ans[id]===QI[id].a).length,pass=right>=26;
  const rows=SUBS.map(([sid,nm])=>{const ids=EX.qs.filter(id=>id.startsWith(sid));const r=ids.filter(id=>EX.ans[id]===QI[id].a).length;return `<tr><td>${sid} ${nm}</td><td>${r}/${ids.length}</td></tr>`}).join("");
  $("exam").innerHTML=`<div class="exbar"><div class="exstat"><span>${right} of 35 correct · ${fmt(EX.end-EX.start)}</span><span>${dots()}</span></div><div class="btns"><button class="ghost" id="quitExam">Back to study</button><button class="cta" id="startExam2">New mock exam</button></div></div>
  <section class="result ${pass?"pass":"fail"}"><div class="eyebrow">Mock exam result</div><div class="big">${right}/35</div><div class="lbl">${pass?"Pass":"Not a pass yet"}</div><p style="margin:0">${pass?`You needed 26. ${right===35?"Perfect score.":`That's ${right-26} to spare.`}`:`You needed 26, so ${26-right} more would have done it.`} Wrong answers are marked below with explanations, and they now show up under "Only unanswered and missed" in study mode.</p></section>
  <section class="q"><div class="eyebrow">By section</div><table class="subtbl">${rows}</table></section>
  <div class="exlist">${EX.qs.map(id=>card(QI[id],"result")).join("")}</div>`;
 }}
function hideExam(){clearInterval(tick);$("exam").hidden=true;$("study").hidden=false;renderLast();render();window.scrollTo({top:0})}
function submitExam(force){const blank=35-nAns();if(blank&&!force){confirmOpen=true;$("confirm").innerHTML=`<div class="warn"><div>You've left ${blank} question${blank>1?"s":""} blank. Blank answers count as wrong.</div><div class="btns"><button class="ghost" id="keepGoing">Keep going</button><button class="cta" id="submitAnyway">Submit anyway</button></div></div>`;$("confirm").scrollIntoView({behavior:"smooth",block:"center"});return}
 EX.done=true;EX.end=Date.now();EX.qs.forEach(id=>{if(EX.ans[id]!=null)state[id]=EX.ans[id]});save();
 const right=EX.qs.filter(id=>EX.ans[id]===QI[id].a).length;HIST.push({d:EX.end,r:right});HIST=HIST.slice(-20);try{localStorage.setItem("tp-hist",JSON.stringify(HIST))}catch(e){}
 saveEx();renderLast();showExam();window.scrollTo({top:0})}
function renderLast(){const el=$("lastScore");if(!HIST.length){el.textContent=EX&&!EX.done?"You have an exam in progress":"";$("startExam").textContent=EX&&!EX.done?"Resume mock exam":"Take a mock exam";return}
 const last=HIST.slice(-5).map(h=>h.r).join(", ");el.textContent=`Recent scores: ${last} (pass is 26)`;$("startExam").textContent=EX&&!EX.done?"Resume mock exam":"Take a mock exam"}
function visible(q){if(!missedOnly)return true;const v=state[q.id];return v==null||v==="peek"||v!==q.a}
function render(){const s=sec();$("missed").textContent=missedOnly?"Show all questions":"Only unanswered and missed";$("intro").innerHTML=`<div class="eyebrow">${s.sub} ${SUBS.find(x=>x[0]===s.sub)[1]} · ${s.id} · ${s.qs.length} questions</div><h2>${esc(s.title)}</h2><p>${esc(s.intro)}</p>`;const vs=s.qs.filter(visible);$("list").innerHTML=vs.length?vs.map(card).join(""):`<p class="intro" style="background:var(--good-soft);border-color:var(--good)">You’ve answered every question in ${s.id} correctly.</p>`;renderTabs();renderScore()}
function redraw(id){const q=sec().qs.find(x=>x.id===id);const el=$("c-"+id);el.outerHTML=card(q);renderTabs();renderScore()}
document.addEventListener("click",e=>{const j=e.target.closest("[data-jump]");if(j){e.preventDefault();const el=$("x-"+j.dataset.jump);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});return}
 const t=e.target.closest("button");if(!t)return;
 if(t.id==="startExam"){if(EX&&!EX.done)showExam();else startExam();return}
 if(t.id==="startExam2"){startExam();return}
 if(t.id==="quitExam"){hideExam();return}
 if(t.id==="submitExam"||t.id==="submitExam2"){submitExam(false);return}
 if(t.id==="submitAnyway"){submitExam(true);return}
 if(t.id==="keepGoing"){$("confirm").innerHTML="";return}
 if(t.dataset.x){if(EX.done)return;const id=t.dataset.x;EX.ans[id]=+t.dataset.i;saveEx();$("x-"+id).outerHTML=card(QI[id],"exam");$("dots").innerHTML=dots();exStat();return}
 if(t.dataset.sub){cur=SECTIONS.find(s=>s.sub===t.dataset.sub).id;try{localStorage.setItem("sec",cur)}catch(e){}render();window.scrollTo({top:0});return}
 if(t.dataset.s){cur=t.dataset.s;try{localStorage.setItem("sec",cur)}catch(e){}render();window.scrollTo({top:0});return}
 if(t.dataset.q){state[t.dataset.q]=+t.dataset.i;save();redraw(t.dataset.q);return}
 if(t.dataset.peek){state[t.dataset.peek]="peek";save();redraw(t.dataset.peek);return}
 if(t.id==="more"){const b=document.querySelector(".bar"),o=b.classList.toggle("open");t.setAttribute("aria-expanded",o);return}
 if(t.closest("#sectionBtns")){document.querySelector(".bar").classList.remove("open");$("more").setAttribute("aria-expanded",false)}
 if(t.id==="revealAll"){sec().qs.forEach(q=>{if(state[q.id]==null)state[q.id]="peek"});save();render();return}
 if(t.id==="missed"){missedOnly=!missedOnly;render();return}
 if(t.id==="reset"){sec().qs.forEach(q=>delete state[q.id]);save();render();return}});
render();renderLast();if(EX&&!EX.done&&location.hash==="#exam")showExam();
