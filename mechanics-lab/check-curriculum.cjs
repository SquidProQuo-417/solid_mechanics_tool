const fs=require('node:fs'),assert=require('node:assert/strict'),{data:D,topics}=require('./dist/curriculum-data.js'),mastery=require('./dist/mastery.js');
assert.equal(D.problems.length,58);assert.equal(topics.length,10);
const by=id=>D.problems.find(p=>p.id===id),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
// Independent scalar checks, including corrected signs and exact cable geometry.
assert.deepEqual(by('systems-3d').steps.at(-1).fields.map(f=>f.value),[-85,-120,-75]);
near(by('distributed-2').steps[0].fields[0].value,1000/3);
near(by('distributed-2').steps.at(-1).fields[0].value,3.75);
near(by('distributed-trapezoid').steps.at(-1).fields[1].value,3.5);
near(by('distributed-pressure').steps.at(-1).fields[0].value,2);
assert.deepEqual(by('exam1-3').steps[0].fields.map(f=>f.value),[-70,-40,-240]);
near(by('exam1-4').steps.at(-1).fields[0].value,11025/Math.sqrt(106));
near(by('exam1-4').steps.at(-1).fields[1].value,14700/Math.sqrt(106));
near(by('exam1-5').steps.at(-1).fields[0].value,180/Math.sqrt(5));
for(const p of D.problems)for(const step of p.steps)for(const f of step.fields||[])assert.ok(Number.isFinite(f.value),p.id);
const p=by('distributed-2'),state={evidenceEligible:true,checked:{},answers:{},helped:{},rounding:{},sigFigs:6};p.steps.forEach((s,i)=>{state.checked[i]=true;state.answers[i]=Object.fromEntries(s.fields.map((f,j)=>[j,String(f.value)]));});
assert.ok(mastery.independent(p,state,D.correct));state.evidenceEligible=false;assert.ok(!mastery.independent(p,state,D.correct));state.evidenceEligible=true;state.assisted=true;assert.ok(!mastery.independent(p,state,D.correct));delete state.assisted;state.helped[0]=true;assert.ok(!mastery.independent(p,state,D.correct));state.helped={};state.answers[0][0]='0';assert.ok(!mastery.independent(p,state,D.correct));
assert.deepEqual(mastery.score('distributed',D.problems,{'distributed-2':{at:1}}),{done:1,total:5,percent:20});
assert.equal(mastery.score('distributed',D.problems,{'distributed-2':true}).percent,0);
// Reuse the real roadmap's simulated DOM to exercise every new problem end to end.
let harness=fs.readFileSync('check-roadmap.cjs','utf8').split('let b=browser();')[0].replace("require('./dist/roadmap-variants.js')","require('./dist/curriculum-data.js').data").replace('D.problems.length,33','D.problems.length,58');
harness+=`let b=browser();let recorded=0;b.context.StudyMastery={record:()=>recorded++};for(const p of D.problems.slice(33)){b.context.GuidedRoadmap.open(p.group);b.context.GuidedRoadmap.selectProblem(p.id);assert.ok(b.node('roadmap').innerHTML.includes(p.typeName));b.node('roadmapFullExampleToggle').onclick();for(const step of p.steps)assert.ok(b.node('roadmapFullExample').innerHTML.includes(step.title));b.node('roadmapRestart').onclick();for(const step of p.steps){if(step.options)b.query('input[name="roadmapChoice"]')[step.answer].onchange();else for(const [i,f] of step.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false,p.id);b.node('roadmapNext').onclick();}assert.ok(JSON.parse(storage.get('statics-roadmap-v1'))[p.id].completed,p.id);}assert.equal(recorded,25);`;
new Function('require',harness)(require);
console.log('58 problems validated; all 25 new walkthroughs solve through UI. Independent sign/geometry checks and mastery assistance gates passed.');
