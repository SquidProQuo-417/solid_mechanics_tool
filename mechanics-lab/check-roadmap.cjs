const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('./dist/math.js'),D=require('./dist/roadmap-variants.js');
assert.equal(D.problems.length,33);for(const p of D.problems){for(const s of p.steps){assert.ok(s.why.trim());assert.ok(s.solution.trim());assert.ok(!D.correct(s,{}));const answers=s.options?{choice:s.answer}:Object.fromEntries(s.fields.map((f,i)=>[i,String(f.value)]));assert.ok(D.correct(s,answers));if(s.fields){const wrong={...answers,0:String(Number(answers[0])+1)};assert.ok(!D.correct(s,wrong));assert.ok(!D.correct(s,{...answers,0:''}));}}}
assert.equal(D.problems.find(p=>p.id==='projection').steps[0].title,'Read the coordinates');assert.equal(D.problems.find(p=>p.id==='axis').steps[4].fields[0].value,-100);assert.equal(D.problems.find(p=>p.id==='couples').steps[3].fields[0].value,2);
const storage=new Map();function browser(){const nodes=new Map(),queries=new Map();function node(id){if(!nodes.has(id)){const el={id,hidden:false,disabled:false,textContent:'',value:'',dataset:{},attrs:{},addEventListener(){},focus(){},showModal(){},close(){},setAttribute(k,v){this.attrs[k]=v;}};let html='';Object.defineProperty(el,'innerHTML',{get:()=>html,set:s=>{html=s;if(id!=='roadmap')return;queries.clear();for(const match of s.matchAll(/<button\b([^>]+)>/g)){const id=match[1].match(/id="([^"]+)"/)?.[1];if(id)node(id).disabled=/\bdisabled\b/.test(match[1]);}for(const m of s.matchAll(/<input\b([^>]+)>/g)){const attrs=m[1],field=attrs.match(/data-roadmap-field="([^"]+)"/)?.[1],name=attrs.match(/name="([^"]+)"/)?.[1];if(field===undefined&&!name)continue;const selector=field!==undefined?'[data-roadmap-field]':`input[name="${name}"]`,input={dataset:{roadmapField:field},value:attrs.match(/value="([^"]*)"/)?.[1]||''};if(!queries.has(selector))queries.set(selector,[]);queries.get(selector).push(input);}}});nodes.set(id,el);}return nodes.get(id);}const context=vm.createContext({StudyMath:M,RoadmapData:D,GraphScales:{axesSVG:()=>'',paint:(svg,html)=>svg.innerHTML=html},document:{getElementById:node,addEventListener(){},querySelectorAll:s=>queries.get(s)||[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},showView:name=>context.view=name,console});context.window=context;context.M=M;for(const file of ['graphs.js','learning.js','app.js','engineering.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);context.showView=name=>context.view=name;vm.runInContext(fs.readFileSync('dist/roadmap.js','utf8'),context);return {context,node,query:s=>queries.get(s)||[]};}
let b=browser();b.context.GuidedRoadmap.open('projection');assert.equal(b.context.view,'roadmap');assert.equal(b.node('roadmapNext').disabled,true);b.node('roadmapCheck').onclick();assert.ok(b.node('roadmapFeedback').innerHTML.includes('Review this step'));const projection=D.problems.find(p=>p.id==='projection');for(const [i,f] of projection.steps[0].fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false);b.node('roadmapNext').onclick();assert.ok(b.node('roadmap').innerHTML.includes('Build the direction vector'));
b=browser();b.context.GuidedRoadmap.open('projection');assert.ok(b.node('roadmap').innerHTML.includes('STEP 2 / 6'));for(let index=1;index<projection.steps.length;index++){const s=projection.steps[index];if(s.options){const radio=b.query('input[name="roadmapChoice"]')[s.answer];radio.onchange();}else for(const [i,f] of s.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}if(index===2)b.node('roadmapExplain').onclick();b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false);b.node('roadmapNext').onclick();}assert.ok(b.node('roadmapComplete').textContent.includes('complete'));assert.ok(b.node('roadmapComplete').textContent.includes('explanations'));assert.equal(JSON.parse(storage.get('statics-roadmap-v1')).projection.checked[5],true);
b.context.examInProgress=true;b.context.GuidedRoadmap.open('couples');assert.ok(b.node('roadmap').innerHTML.includes('Force projections'));b.context.examInProgress=false;b.node('roadmapRestart').onclick();assert.equal(b.node('roadmapNext').disabled,true);
console.log('Six scaffolded problem types, coordinate-first projections, numeric/choice checking, gated steps, saved resume, assisted progress, restart and exam lock passed.');
assert.ok(b.node('roadmap').innerHTML.includes('Choose a problem type'));b.context.GuidedRoadmap.open('couples');assert.equal(b.node('pageTitle').textContent,'Couple moments walkthrough');b.node('roadmapExplore').onclick();assert.equal(b.context.view,'coupleWorkspace');b.context.GuidedRoadmap.open('axis');b.node('roadmapExplore').onclick();assert.equal(b.context.view,'axisWorkspace');
b.context.GuidedRoadmap.open('resultants');assert.ok(b.node('roadmapDiagram-resultants').innerHTML.includes('α = 30°'));assert.ok(b.node('roadmapDiagram-resultants').innerHTML.includes('β = 120°'));b.query('input[name="roadmapChoice"]')[0].onchange();b.node('roadmapCheck').onclick();b.node('roadmapNext').onclick();const componentStep=D.problems[0].steps[1];for(const [i,f] of componentStep.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=Number(f.value).toFixed(3);input.oninput();}b.node('roadmapCheck').onclick();b.node('roadmapNext').onclick();const history=b.node('roadmap').innerHTML;assert.ok(history.includes('Your checked steps'));for(const field of componentStep.fields){assert.ok(history.includes(field.label));assert.ok(history.includes(Number(field.value).toFixed(3)));}assert.ok(history.includes('<details class="history-step">'));assert.ok(history.includes('Return to step 2'));

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

for(const p of D.problems)for(const step of p.steps){assert.ok(step.worked.length>=1);for(const row of step.worked){assert.ok(row.text.trim());assert.ok(Array.isArray(row.equations));}}
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

// Solve every distinct family through the UI, not just the data validator.
for(const p of D.problems){b.context.GuidedRoadmap.open(p.group);b.context.GuidedRoadmap.selectProblem(p.id);b.node('roadmapRestart').onclick();for(const step of p.steps){if(step.options)b.query('input[name="roadmapChoice"]')[step.answer].onchange();else for(const [i,f] of step.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false,p.id);b.node('roadmapNext').onclick();}const record=JSON.parse(storage.get('statics-roadmap-v1'))[p.id];assert.equal(record.completed,true,p.id);assert.ok(b.node('roadmap').innerHTML.includes('&#10003;'));const graph=b.node('roadmapDiagram-'+p.id).innerHTML;assert.ok(graph.includes('marker-end'),p.id);assert.ok(graph.includes('Axis coordinates'),p.id);}
b.context.GuidedRoadmap.open('position');b.context.GuidedRoadmap.selectProblem('position-3d-cable');
const old=JSON.parse(storage.get('statics-roadmap-v1'))['position-3d-cable'].answers;
b.node('roadmapRestart').onclick();assert.equal(b.node('roadmapNext').disabled,true);assert.ok(b.node('roadmap').innerHTML.includes('Review last completed attempt'));
assert.equal(JSON.parse(storage.get('statics-roadmap-v1'))['position-3d-cable'].completed,true);
b.node('roadmapReview').onclick();assert.deepEqual(JSON.parse(storage.get('statics-roadmap-v1'))['position-3d-cable'].answers,old);
b.context.GuidedRoadmap.selectProblem('position-distance');
b=browser();b.context.GuidedRoadmap.open('position');assert.ok(b.node('roadmap').innerHTML.includes('3D displacement, distance and unit vector: build'));
assert.deepEqual(D.problems.find(p=>p.id==='moments-3d').steps[1].fields.map(f=>f.value),[-220,130,190]);
assert.equal(D.problems.find(p=>p.id==='axis-3d').steps.at(-1).fields[0].value,-440/3);
assert.ok(Math.abs(D.problems.find(p=>p.id==='projection-negative-3d').steps.at(-1).fields[0].value+1550/13)<1e-10);
assert.equal(D.problems.find(p=>p.id==='couples-force').steps[0].fields[0].value,300);
console.log('All 33 types solve, save independently, retain completion checks, resume selection, archive retries, and render labelled vector arrows.');

b.context.GuidedRoadmap.open('position');b.context.GuidedRoadmap.selectProblem('position-distance');
const fitted=b.node('roadmapDiagram-position-distance').innerHTML;
assert.ok(!fitted.includes('x=40'));assert.ok(!fitted.includes('y=40'));assert.ok(fitted.includes('z=5'));
const cableLine=[...fitted.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"[^>]*marker-end/g)][2];
assert.ok(Math.hypot(Number(cableLine[3])-Number(cableLine[1]),Number(cableLine[4])-Number(cableLine[2]))>130,'3D displacement should occupy a readable fraction of the viewport');
console.log('Roadmap fit uses projected geometry, keeps the 3D vector visible, and omits irrelevant 40 m ticks.');

const answerBeforeLayer=JSON.parse(storage.get('statics-roadmap-v1'))['position-distance'].answers;
if(b.node('roadmapMeasurements').hidden)b.node('roadmapMeasurementToggle').onclick();b.node('roadmapMeasureVector').value='2';b.node('roadmapMeasureVector').onchange();assert.equal(b.node('roadmapMeasurements').hidden,false);
assert.equal(b.node('roadmapMeasurementToggle').attrs['aria-pressed'],'true');
assert.ok(b.node('roadmapMeasurements').innerHTML.includes('<td>13</td>'));
assert.ok(b.node('roadmapMeasurements').innerHTML.includes('Signed components'));
assert.ok(b.node('roadmapDiagram-position-distance').innerHTML.includes('xy landing (4, 2, 0)'));
for(const plane of ['xz','yz']){b.node('roadmapMeasurePlane').value=plane;b.node('roadmapMeasurePlane').onchange();assert.ok(b.node('roadmapDiagram-position-distance').innerHTML.includes(plane+' landing'));}
b.node('roadmapMeasurementToggle').onclick();assert.equal(b.node('roadmapMeasurements').hidden,true);
assert.deepEqual(JSON.parse(storage.get('statics-roadmap-v1'))['position-distance'].answers,answerBeforeLayer);
for(const p of D.problems){b.context.GuidedRoadmap.open(p.group);b.context.GuidedRoadmap.selectProblem(p.id);const html=b.node('roadmapDiagram-'+p.id).innerHTML;const arrowLines=[...html.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"[^>]*marker-end/g)];assert.ok(arrowLines.length,p.id);let maxLength=0;for(const line of arrowLines){const values=line.slice(1).map(Number);assert.ok(values[0]>=50&&values[0]<=550&&values[2]>=50&&values[2]<=550,p.id);assert.ok(values[1]>=75&&values[1]<=345&&values[3]>=75&&values[3]<=345,p.id);maxLength=Math.max(maxLength,Math.hypot(values[2]-values[0],values[3]-values[1]));}assert.ok(maxLength>90,p.id);}
console.log('Every roadmap graph keeps arrow endpoints inside padded bounds; plane layer toggles, coordinate readouts and answer preservation passed.');

b.context.GuidedRoadmap.open('moments');b.context.GuidedRoadmap.selectProblem('moments');b.node('roadmapRestart').onclick();
assert.ok(!b.node('roadmapDiagram-moments').innerHTML.includes('right-angle-marker'));
const momentProblem=D.problems.find(p=>p.id==='moments');
for(let i=0;i<=4;i++){const step=momentProblem.steps[i];if(step.options)b.query('input[name="roadmapChoice"]')[step.answer].onchange();else for(const [j,f] of step.fields.entries()){const input=b.query('[data-roadmap-field]')[j];input.value=String(f.value);input.oninput();}assert.ok(!b.node('roadmapDiagram-moments').innerHTML.includes('right-angle-marker'));b.node('roadmapCheck').onclick();if(i<4)b.node('roadmapNext').onclick();}
assert.ok(b.node('roadmapDiagram-moments').innerHTML.includes('right-angle-marker'));
assert.ok(b.node('roadmapDiagram-moments').innerHTML.includes('d = 1.34 m'));
assert.ok(b.node('roadmap').innerHTML.includes('>1.34</span>'));
assert.ok(!b.node('roadmap').innerHTML.includes('Your answers are within tolerance'));
b.query('[data-roadmap-field]')[0].oninput();assert.ok(!b.node('roadmapDiagram-moments').innerHTML.includes('right-angle-marker'));
b.context.GuidedRoadmap.open('resultants');b.context.GuidedRoadmap.selectProblem('resultants');b.node('roadmapRestart').onclick();b.query('input[name="roadmapChoice"]')[0].onchange();b.node('roadmapCheck').onclick();b.node('roadmapNext').onclick();
for(const [i,f] of D.problems[0].steps[1].fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.ok(b.node('roadmap').innerHTML.includes('>104</span>'));
const finalStep=D.problems.find(p=>p.id==='resultants-triangle').steps[0];assert.ok(D.correct(finalStep,{0:'218'}));assert.ok(!D.correct(finalStep,{0:'219'}));
console.log('Derived arms appear only after valid checks and disappear on edits; numerical feedback uses 10/3 significant figures and accepts rounded final results.');

b.context.GuidedRoadmap.open('moments');b.context.GuidedRoadmap.selectProblem('moments-scalar');b.node('roadmapRestart').onclick();
assert.ok(!b.node('roadmap').innerHTML.includes('id="roadmapMeasurementToggle"'));
assert.ok(!b.node('roadmapDiagram-moments-scalar').innerHTML.includes('plane-measurement'));
b.node('roadmapGraphView').value='iso';b.node('roadmapGraphView').onchange();
const displacementStep=D.problems.find(p=>p.id==='moments-scalar').steps[0];for(const [i,f] of displacementStep.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}
b.node('roadmapCheck').onclick();assert.ok(b.node('roadmap').innerHTML.includes('id="roadmapMeasurementToggle"'));
assert.equal(b.node('roadmapMeasurements').hidden,false);
const colored=b.node('roadmapDiagram-moments-scalar').innerHTML;
assert.ok(colored.includes('marker-end="url(#roadmapDiagram-moments-scalarPlaneArrow)"'));
assert.ok(colored.includes('fill="#d6b6ff"/></marker>'));
b.query('[data-roadmap-field]')[0].value='99';b.query('[data-roadmap-field]')[0].oninput();
assert.equal(b.node('roadmapMeasurements').hidden,true);assert.equal(b.node('roadmapEarnedControls').hidden,true);
assert.ok(!b.node('roadmapDiagram-moments-scalar').innerHTML.includes('plane-measurement'));
console.log('Measurements unlock and show after checked steps, relock on edits, and use matching purple projection arrowheads.');

b.context.GuidedRoadmap.open('resultants');b.context.GuidedRoadmap.selectProblem('resultants');
b.node('roadmapSigFigs').value='6';b.node('roadmapSigFigs').onchange();
assert.equal(JSON.parse(storage.get('statics-roadmap-v1')).resultants.sigFigs,6);
assert.ok(b.node('roadmap').innerHTML.includes('>103.923</span>'));
const beforePrecision=JSON.parse(storage.get('statics-roadmap-v1')).resultants.answers;
b.node('roadmapSigFigs').value='10';b.node('roadmapSigFigs').onchange();assert.ok(b.node('roadmap').innerHTML.includes('>103.9230485</span>'));
assert.deepEqual(JSON.parse(storage.get('statics-roadmap-v1')).resultants.answers,beforePrecision);
b.context.GuidedRoadmap.selectProblem('resultants-component');assert.ok(b.node('roadmap').innerHTML.includes('value="3" selected'));
b.context.GuidedRoadmap.selectProblem('resultants');assert.ok(b.node('roadmap').innerHTML.includes('value="10" selected'));
b.node('roadmapRestart').onclick();assert.equal(JSON.parse(storage.get('statics-roadmap-v1')).resultants.sigFigs,10);
b.context.GuidedRoadmap.open('position');b.context.GuidedRoadmap.selectProblem('position');b.node('roadmapRestart').onclick();b.node('roadmapSigFigs').value='10';b.node('roadmapSigFigs').onchange();
for(const [i,f] of D.problems.find(p=>p.id==='position').steps[0].fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.ok(b.node('roadmap').innerHTML.includes('>1</span>'));assert.ok(!b.node('roadmap').innerHTML.includes('>1.000000000</span>'));
const sigStep=D.problems.find(p=>p.id==='resultants-triangle').steps[0];assert.ok(D.correct(sigStep,{0:'217.9'},4));assert.ok(!D.correct(sigStep,{0:'217.9'},6));
b=browser();b.context.GuidedRoadmap.open('resultants');assert.ok(b.node('roadmap').innerHTML.includes('value="10" selected'));
console.log('Per-problem significant figures persist independently and across restarts; coordinates stay compact and selected rounded answers are accepted.');

for(const problem of D.problems.filter(p=>/\bP\s*=/.test(p.prompt))){b.context.GuidedRoadmap.open(problem.group);b.context.GuidedRoadmap.selectProblem(problem.id);const svg=b.node('roadmapDiagram-'+problem.id).innerHTML;assert.ok(svg.includes('data-point="P"'),problem.id);assert.ok(svg.includes('class="point-label"'),problem.id);}
console.log('All roadmap prompts specifying P render a distinct named application-point marker.');
