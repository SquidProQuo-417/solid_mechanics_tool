const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('./dist/math.js'),D=require('./dist/roadmap-data.js');
assert.equal(D.problems.length,6);for(const p of D.problems){for(const s of p.steps){assert.ok(s.why.trim());assert.ok(s.solution.trim());assert.ok(!D.correct(s,{}));const answers=s.options?{choice:s.answer}:Object.fromEntries(s.fields.map((f,i)=>[i,String(f.value)]));assert.ok(D.correct(s,answers));if(s.fields){const wrong={...answers,0:String(Number(answers[0])+1)};assert.ok(!D.correct(s,wrong));assert.ok(!D.correct(s,{...answers,0:''}));}}}
assert.equal(D.problems.find(p=>p.id==='projection').steps[0].title,'Read the coordinates');assert.equal(D.problems.find(p=>p.id==='axis').steps[4].fields[0].value,-100);assert.equal(D.problems.find(p=>p.id==='couples').steps[3].fields[0].value,2);
const storage=new Map();function browser(){const nodes=new Map(),queries=new Map();function node(id){if(!nodes.has(id)){const el={id,hidden:false,disabled:false,textContent:'',value:'',dataset:{},attrs:{},addEventListener(){},focus(){},showModal(){},close(){},setAttribute(k,v){this.attrs[k]=v;}};let html='';Object.defineProperty(el,'innerHTML',{get:()=>html,set:s=>{html=s;if(id!=='roadmap')return;queries.clear();for(const match of s.matchAll(/<button\b([^>]+)>/g)){const id=match[1].match(/id="([^"]+)"/)?.[1];if(id)node(id).disabled=/\bdisabled\b/.test(match[1]);}for(const m of s.matchAll(/<input\b([^>]+)>/g)){const attrs=m[1],field=attrs.match(/data-roadmap-field="([^"]+)"/)?.[1],name=attrs.match(/name="([^"]+)"/)?.[1];if(field===undefined&&!name)continue;const selector=field!==undefined?'[data-roadmap-field]':`input[name="${name}"]`,input={dataset:{roadmapField:field},value:attrs.match(/value="([^"]*)"/)?.[1]||''};if(!queries.has(selector))queries.set(selector,[]);queries.get(selector).push(input);}}});nodes.set(id,el);}return nodes.get(id);}const context=vm.createContext({StudyMath:M,RoadmapData:D,GraphScales:{axesSVG:()=>'',paint:(svg,html)=>svg.innerHTML=html},document:{getElementById:node,addEventListener(){},querySelectorAll:s=>queries.get(s)||[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},showView:name=>context.view=name,console});context.window=context;context.M=M;for(const file of ['graphs.js','learning.js','app.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);context.showView=name=>context.view=name;vm.runInContext(fs.readFileSync('dist/roadmap.js','utf8'),context);return {context,node,query:s=>queries.get(s)||[]};}
let b=browser();b.context.GuidedRoadmap.open('projection');assert.equal(b.context.view,'roadmap');assert.equal(b.node('roadmapNext').disabled,true);b.node('roadmapCheck').onclick();assert.ok(b.node('roadmapFeedback').innerHTML.includes('Review this step'));const projection=D.problems.find(p=>p.id==='projection');for(const [i,f] of projection.steps[0].fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false);b.node('roadmapNext').onclick();assert.ok(b.node('roadmap').innerHTML.includes('Build the direction vector'));
b=browser();b.context.GuidedRoadmap.open('projection');assert.ok(b.node('roadmap').innerHTML.includes('STEP 2 / 6'));for(let index=1;index<projection.steps.length;index++){const s=projection.steps[index];if(s.options){const radio=b.query('input[name="roadmapChoice"]')[s.answer];radio.onchange();}else for(const [i,f] of s.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}if(index===2)b.node('roadmapExplain').onclick();b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false);b.node('roadmapNext').onclick();}assert.ok(b.node('roadmapComplete').textContent.includes('complete'));assert.ok(b.node('roadmapComplete').textContent.includes('explanations'));assert.equal(JSON.parse(storage.get('statics-roadmap-v1')).projection.checked[5],true);
b.context.examInProgress=true;b.context.GuidedRoadmap.open('couples');assert.ok(b.node('roadmap').innerHTML.includes('Force projections'));b.context.examInProgress=false;b.node('roadmapRestart').onclick();assert.equal(b.node('roadmapNext').disabled,true);
console.log('Six scaffolded problem types, coordinate-first projections, numeric/choice checking, gated steps, saved resume, assisted progress, restart and exam lock passed.');
assert.ok(!b.node('roadmap').innerHTML.includes('Choose a problem type'));b.context.GuidedRoadmap.open('couples');assert.equal(b.node('pageTitle').textContent,'Couple moments walkthrough');b.node('roadmapExplore').onclick();assert.equal(b.context.view,'coupleWorkspace');b.context.GuidedRoadmap.open('axis');b.node('roadmapExplore').onclick();assert.equal(b.context.view,'axisWorkspace');
b.context.GuidedRoadmap.open('resultants');assert.ok(b.node('roadmapDiagram').innerHTML.includes('α = 30°'));assert.ok(b.node('roadmapDiagram').innerHTML.includes('β = 120°'));b.query('input[name="roadmapChoice"]')[0].onchange();b.node('roadmapCheck').onclick();b.node('roadmapNext').onclick();const componentStep=D.problems[0].steps[1];for(const [i,f] of componentStep.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=Number(f.value).toFixed(3);input.oninput();}b.node('roadmapCheck').onclick();b.node('roadmapNext').onclick();const history=b.node('roadmap').innerHTML;assert.ok(history.includes('Your checked steps'));for(const field of componentStep.fields){assert.ok(history.includes(field.label));assert.ok(history.includes(Number(field.value).toFixed(3)));}assert.ok(history.includes('<details class="history-step">'));assert.ok(history.includes('Return to step 2'));

for(const p of D.problems)for(const step of p.steps){assert.ok(step.hint.reminder.trim());assert.ok(step.hint.inputs.trim());}
assert.ok(b.node('roadmap').innerHTML.includes('aria-controls="roadmapHint"'));
assert.ok(b.node('roadmap').innerHTML.includes('Use all four signed components'));
const beforeHint=storage.get('statics-roadmap-v1'),beforeSolution=b.node('roadmapSolution').textContent;
b.node('roadmapHint').hidden=true; // Mirror native hidden markup in the simulated DOM.
b.node('roadmapHintToggle').onclick();
assert.equal(b.node('roadmapHint').hidden,false);
assert.equal(b.node('roadmapHintToggle').textContent,'Hide hint');
assert.equal(b.node('roadmapHintToggle').attrs['aria-expanded'],'true');
assert.equal(b.node('roadmapNext').disabled,true);
assert.equal(storage.get('statics-roadmap-v1'),beforeHint);
assert.equal(b.node('roadmapSolution').textContent,beforeSolution);
b.node('roadmapHintToggle').onclick();assert.equal(b.node('roadmapHint').hidden,true);
assert.equal(b.node('roadmapHintToggle').attrs['aria-expanded'],'false');
console.log('All steps have formula/input hints; toggling preserves answers, progress and explanation separation.');

for(const p of D.problems)for(const step of p.steps){assert.ok(step.worked.length>=2);for(const row of step.worked){assert.ok(row.text.trim());assert.ok(Array.isArray(row.equations));}}
b.context.GuidedRoadmap.open('position');b.node('roadmapSolution').hidden=true;
b.node('roadmapExplain').onclick();assert.ok(b.node('roadmapSolution').innerHTML.includes('Measure each point'));
assert.equal(b.node('roadmapExplain').attrs['aria-expanded'],'true');
b.node('roadmapExplain').onclick();assert.equal(b.node('roadmapSolution').hidden,true);
const normalize=D.problems.find(p=>p.id==='position').steps[2];
assert.ok(normalize.worked.some(row=>row.equations.includes('ux = 3/5 = 0.6')));
assert.ok(normalize.worked.some(row=>row.equations.includes('uy = 4/5 = 0.8')));
assert.ok(normalize.worked.some(row=>row.equations.includes('uz = 0/5 = 0')));
console.log('Every roadmap step has narrated derivations; explanation toggle and unit-component calculations passed.');

const position=D.problems.find(p=>p.id==='position');
for(let index=0;index<2;index++){for(const [i,f] of position.steps[index].fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();b.node('roadmapNext').onclick();}
b.node('roadmapSolution').hidden=true;b.node('roadmapExplain').onclick();
const derivation=b.node('roadmapSolution').innerHTML;
assert.ok(derivation.includes('<ol class="roadmap-worked">'));
assert.ok(derivation.includes('<mfrac>'));assert.ok(derivation.includes('ux = '));
assert.ok(derivation.includes('uy = '));assert.ok(derivation.includes('uz = '));
assert.ok(derivation.includes('Metres cancel'));
for(const [i,f] of normalize.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}
b.node('roadmapCheck').onclick();assert.ok(!b.node('roadmapFeedback').innerHTML.includes(normalize.solution));
for(const p of D.problems)for(const step of p.steps)for(const row of step.worked)for(const eq of row.equations)assert.ok(!eq.includes('?'),eq);
