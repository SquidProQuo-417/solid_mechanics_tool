/* Stable coordinate scales shared by the live labs. */
(function(root){
 const states=new Map(),nice=n=>{const power=10**Math.floor(Math.log10(Math.max(n,1e-12))),v=n/power;return (v<=1?1:v<=2?2:v<=5?5:10)*power;},label=n=>Number(n.toPrecision(4)).toString();
 function frame(id,view,fit,redraw,unit){
  const key=id+':'+view+':'+unit;let state=states.get(key);if(!state){state={...fit,zoom:1,auto:false};states.set(key,state);}if(state.auto)Object.assign(state,fit,{zoom:1});
  const result={...state,scale:state.scale*state.zoom,extent:state.extent/state.zoom};
  if(typeof document!=='undefined'){const svg=document.getElementById(id);if(svg?.parentElement&&document.createElement){let bar=document.getElementById(id+'ScaleControls');if(!bar){bar=document.createElement('div');bar.id=id+'ScaleControls';bar.className='graph-controls';svg.insertAdjacentElement('afterend',bar);}bar.innerHTML='';
   for(const [text,action] of [['Zoom in',()=>state.zoom=Math.min(64,state.zoom*1.5)],['Zoom out',()=>state.zoom=Math.max(1/64,state.zoom/1.5)],['Fit to data',()=>Object.assign(state,fit,{zoom:1})],[state.auto?'Lock scale':'Enable auto-fit',()=>state.auto=!state.auto]]){const button=document.createElement('button');button.type='button';button.textContent=text;button.onclick=()=>{action();redraw();};bar.appendChild(button);}
   const note=document.createElement('p');note.className='diagram-help';note.textContent=(state.auto?'Auto-fit: scale changes with inputs.':'Scale locked: input changes preserve arrow size comparisons.')+' Axis labels in '+unit+'. '+(view==='iso'?'3D axes are projected; screen lengths and angles are foreshortened.':'Equal scale on both axes.')+' Use Fit to data if a point leaves the frame.';bar.appendChild(note);
  }}return result;
 }
 function axesSVG(view,screen,extent,unit){const names=['x','y','z'],pair={xy:[0,1],xz:[0,2],yz:[1,2]}[view],step=nice(extent/4);let out='';for(let i=0;i<3;i++){if(pair&&!pair.includes(i))continue;const point=n=>names.map((_,j)=>j===i?n:0),a=screen(point(-extent)),b=screen(point(extent));out+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#586778"/><text x="${b[0]+6}" y="${b[1]-6}" fill="#94a3b8" font-size="12">+${names[i]}</text>`;
   for(let n=-Math.floor(extent/step);n<=Math.floor(extent/step);n++){if(!n)continue;const p=screen(point(n*step));out+=`<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="#94a3b8"/><text x="${p[0]+5}" y="${p[1]+(i===2?-7:14)}" fill="#94a3b8" font-size="10">${view==='iso'?names[i]+'=':''}${label(n*step)}</text>`;}}
  return out+`<text x="12" y="20" fill="#b9c7d8" font-size="12">Axis coordinates (${unit}) · tick step ${label(step)} ${unit}</text>`;
 }
 const api={frame,axesSVG,nice};if(typeof module!=='undefined')module.exports=api;else root.GraphScales=globalThis.GraphScales=api;
})(typeof window!=='undefined'?window:globalThis);
