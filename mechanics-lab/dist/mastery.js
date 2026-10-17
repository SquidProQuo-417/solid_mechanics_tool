(function(root){
 function independent(p,state,correct){return state.evidenceEligible===true&&!state.assisted&&!Object.values(state.helped||{}).some(Boolean)&&p.steps.every((s,i)=>state.checked?.[i]&&correct(s,state.answers?.[i]||{},state.rounding?.[i]??state.sigFigs));}
 function score(topic,problems,evidence){const pool=problems.filter(p=>p.group===topic),done=pool.filter(p=>evidence[p.id]&&Number.isFinite(evidence[p.id].at)).length;return {done,total:pool.length,percent:pool.length?Math.round(done/pool.length*100):0};}
 const api={independent,score};root.MasteryMath=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
