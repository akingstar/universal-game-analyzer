(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const PLATFORMS = ['SPRIBE Aviator','Big Daddy Game','91 Club','Tiranga Games','Daman Games','Goa Games','OK Win','Jalwa Game','TC Lottery','Dream 99','BDG Win','Other'];
  const KEY = 'uga_history_v1';
  let history = load(), running = false, analysisTimer = null;
  function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(history))}catch{alert('Browser storage is full. Export your history and remove older entries.')}}
  function type(){return $('gameType').value}
  function platform(){return type()==='aviator'?'SPRIBE Aviator':type()==='sports'?'Sports results':$('platform').value}
  function key(){return `${type()}::${platform()}`}
  function records(){return Array.isArray(history[key()])?history[key()]:[]}
  function selected(){const a=records(),n=$('windowSize').value;return n==='all'?a:a.slice(-Number(n))}
  function setStatus(){ $('statusText').textContent=running?'ANALYZING':'STOPPED';$('statusDot').classList.toggle('on',running);$('toggleLive').textContent=running?'■ STOP LIVE':'▶ START LIVE'; }
  function update(){const all=records(),data=selected(),last=all.at(-1);$('total').textContent=all.length;$('lastResult').textContent=last?display(last.value):'—';$('quality').textContent=all.length>=30?'USABLE':all.length>=10?'LIMITED':all.length?'LOW':'NO DATA';$('qualityNote').textContent=all.length>=30?'Descriptive sample':all.length>=10?'More data recommended':'Need more recorded results';$('windowLabel').textContent=$('windowSize').selectedOptions[0].textContent;$('historyCount').textContent=`${all.length} entries`;
    const s=streak(all);$('streak').textContent=s?s.count+' × '+display(s.value):'—';$('streakNote').textContent=s?'Consecutive matching results':'Same-result sequence';renderAnalysis(data);renderHistory(all);}
  function display(v){return type()==='aviator'?Number(v).toFixed(2)+'×':String(v)}
  function streak(a){if(!a.length)return null;let n=1;for(let i=a.length-2;i>=0&&String(a[i].value)===String(a.at(-1).value);i--)n++;return {count:n,value:a.at(-1).value}}
  function metric(name,value,note=''){return `<div class="metric"><small>${name}</small><strong>${value}</strong>${note?`<small>${note}</small>`:''}</div>`}
  function renderAnalysis(data){const box=$('analysis');if(!data.length){box.innerHTML='<div class="empty">Add actual results to see statistical analysis.</div>';return}
    if(type()==='aviator'){
      const nums=data.map(x=>Number(x.value)).filter(Number.isFinite).sort((a,b)=>a-b),sum=nums.reduce((a,b)=>a+b,0),mean=sum/nums.length,mid=Math.floor(nums.length/2),median=nums.length%2?nums[mid]:(nums[mid-1]+nums[mid])/2;
      const buckets=[['1.00–1.49',1,1.5],['1.50–1.99',1.5,2],['2.00–4.99',2,5],['5.00–9.99',5,10],['10.00+',10,Infinity]];
      let html=metric('MEAN MULTIPLIER',mean.toFixed(2)+'×')+metric('MEDIAN MULTIPLIER',median.toFixed(2)+'×')+metric('HIGHEST RECORDED',Math.max(...nums).toFixed(2)+'×')+metric('LOWEST RECORDED',Math.min(...nums).toFixed(2)+'×')+metric('ROUNDS IN WINDOW',nums.length)+metric('ABOVE 2.00×',((nums.filter(x=>x>=2).length/nums.length)*100).toFixed(1)+'%','Historical share only');
      html+='<div class="metric" style="grid-column:1/-1"><b style="font-size:12px">Multiplier distribution</b>'+buckets.map(([name,lo,hi])=>{const c=nums.filter(x=>x>=lo&&x<hi).length,p=c/nums.length*100;return `<div class="bar-row"><span>${name}×</span><div class="bar"><i style="width:${p}%"></i></div><b>${p.toFixed(1)}%</b></div>`}).join('')+'</div>';box.innerHTML=html;
    }else{
      const vals=data.map(x=>String(x.value)),counts={};vals.forEach(v=>counts[v]=(counts[v]||0)+1);const total=vals.length;
      let html=metric('RESULTS IN WINDOW',total)+metric('UNIQUE OUTCOMES',Object.keys(counts).length)+metric('MOST FREQUENT',Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]);
      html+='<div class="metric" style="grid-column:1/-1"><b style="font-size:12px">Observed result frequency</b>'+Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([v,c])=>`<div class="bar-row"><span>${esc(v)}</span><div class="bar"><i style="width:${c/total*100}%"></i></div><b>${(c/total*100).toFixed(1)}%</b></div>`).join('')+'</div>';
      const pairs={};for(let i=1;i<vals.length;i++){const k=vals[i-1]+' → '+vals[i];pairs[k]=(pairs[k]||0)+1}const top=Object.entries(pairs).sort((a,b)=>b[1]-a[1]).slice(0,3);if(top.length)html+=metric('MOST SEEN TRANSITIONS',top.map(x=>`${esc(x[0])} (${x[1]})`).join('<br>'),'Observed adjacent pairs; not predictive');box.innerHTML=html;
    }
    if(data.length<10)box.insertAdjacentHTML('beforeend','<div class="notice" style="grid-column:1/-1">INSUFFICIENT DATA: fewer than 10 results in this analysis window. Add more history before interpreting patterns.</div>');
  }
  function renderHistory(all){const body=$('historyBody');if(!all.length){body.innerHTML='<tr><td colspan="5" class="empty">No results recorded yet.</td></tr>';return}body.innerHTML=all.slice().reverse().slice(0,30).map((r,i)=>`<tr><td>${all.length-i}</td><td><b>${esc(display(r.value))}</b></td><td>${esc(r.id||'—')}</td><td>${new Date(r.time).toLocaleString()}</td><td><button class="delete-row" data-id="${esc(r.uid)}" aria-label="Delete result">Delete</button></td></tr>`).join('')}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function configure(){const t=type();$('platformWrap').style.display=t==='aviator'||t==='sports'?'none':'block';$('resultLabel').firstChild.textContent=t==='aviator'?'Crash multiplier':t==='colour'?'Colour result':'Match result';const input=$('resultValue');if(t==='aviator'){input.type='number';input.min='1';input.step='0.01';input.placeholder='Example: 2.45';$('formHint').textContent='Enter the actual crash multiplier (minimum 1.00).'}else if(t==='colour'){input.type='text';input.removeAttribute('min');input.placeholder='RED, GREEN or VIOLET';$('formHint').textContent='Enter RED, GREEN or VIOLET exactly. Other outcomes are not accepted in this mode.'}else{input.type='text';input.removeAttribute('min');input.placeholder='HOME / DRAW / AWAY or team result';$('formHint').textContent='Enter the actual match result. Use a consistent label for each competition.'}update()}
  $('gameType').addEventListener('change',configure);$('platform').addEventListener('change',update);$('windowSize').addEventListener('change',update);
  $('resultForm').addEventListener('submit',e=>{e.preventDefault();let v=$('resultValue').value.trim();if(type()==='aviator'){v=Number(v);if(!Number.isFinite(v)||v<1){alert('Multiplier must be a valid number of 1.00 or higher.');return}}else if(type()==='colour'){v=v.toUpperCase();if(!['RED','GREEN','VIOLET'].includes(v)){alert('Please enter RED, GREEN or VIOLET.');return}}else{if(!v||v.length>60){alert('Enter a result up to 60 characters.');return}v=v.toUpperCase()}
    const a=records();a.push({uid:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),value:v,id:$('roundId').value.trim(),time:new Date().toISOString()});history[key()]=a;save();$('resultValue').value='';$('roundId').value='';update();});
  $('historyBody').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;history[key()]=records().filter(r=>r.uid!==b.dataset.id);save();update()});
  $('toggleLive').addEventListener('click',()=>{running=!running;if(running){analysisTimer=setInterval(update,1500)}else{clearInterval(analysisTimer);analysisTimer=null}setStatus();update()});
  $('clearBtn').addEventListener('click',()=>{if(!records().length)return;if(confirm(`Delete all ${records().length} saved results for ${platform()}? Export first if you need a backup.`)){delete history[key()];save();update()}});
  $('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({app:'Universal Game Analyzer',version:1,exportedAt:new Date().toISOString(),history},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='universal-game-analyzer-history.json';a.click();URL.revokeObjectURL(a.href)});
  $('importFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!obj.history||typeof obj.history!=='object')throw Error('Invalid format');let added=0;for(const [k,arr] of Object.entries(obj.history)){if(!Array.isArray(arr))continue;const valid=arr.filter(r=>r&&r.uid&&r.time&&r.value!==undefined);history[k]=[...(history[k]||[]),...valid];added+=valid.length}save();update();alert(`Imported ${added} result records. Duplicate records are not automatically removed.`)}catch(err){alert('Could not import this file: '+err.message)}e.target.value=''});
  configure();setStatus();
})();
