const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('./dist/math.js');
const near=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
let r=M.directedForce([1,1,0],[4,5,0],100);assert.deepEqual(r.displacement,[3,4,0]);near(r.length,5);assert.deepEqual(r.unit,[.6,.8,0]);assert.deepEqual(r.force,[60,80,0]);near(r.angles[2],90);
let back=M.directedForce([4,5,0],[1,1,0],100);back.unit.forEach((v,i)=>near(v,-r.unit[i]));near(back.length,r.length);
const shifted=M.directedForce([11,-9,5],[14,-5,5],100);assert.deepEqual(shifted.displacement,r.displacement);
r=M.directedForce([1,2,3],[-1,5,9],350);near(r.length,7);assert.deepEqual(r.force,[-100,150,300]);near(Math.hypot(...r.unit),1);near(Math.hypot(...r.force),350);near(r.unit.reduce((sum,v)=>sum+v*v,0),1);assert.ok(r.angles[0]>90);
r=M.directedForce([1,2,3],[1,2,3],100);assert.equal(r.unit,null);assert.equal(r.force,null);assert.equal(r.length,0);assert.throws(()=>M.directedForce([0,0,0],[1,1,1],-1));assert.throws(()=>M.directedForce([0,NaN,0],[1,1,1],100));
r=M.directedForce([0,0,0],[0,0,-1],0);assert.deepEqual(r.force,[0,0,-0]);near(r.angles[2],180);
// Simulated DOM exercises initialization and actual control/answer handlers.
const elements=new Map(),listeners={};function element(id){if(!elements.has(id))elements.set(id,{id,value:'',dataset:{},checked:true,hidden:false,innerHTML:'',textContent:'',handlers:{},addEventListener(key,fn){this.handlers[key]=fn;},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);}
const context=vm.createContext({StudyMath:M,document:{getElementById:element,querySelectorAll:()=>[],addEventListener:(key,fn)=>listeners[key]=fn},localStorage:{getItem:()=>null},window:{print(){}},console});
for(const file of ['learning.js','app.js','position.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
assert.ok(element('position').innerHTML.includes('Point & cable lab'));assert.ok(element('positionSteps').innerHTML.includes('<mfrac>'));assert.ok(element('positionSteps').innerHTML.includes('data-symbol="unitAB"'));assert.ok(element('positionSummary').innerHTML.includes('5 m'));
element('reverseDirection').onclick();assert.ok(element('positionSteps').innerHTML.includes('data-symbol="displacementBA"'));assert.ok(element('geometryProblem').innerHTML.includes('toward A'));
element('example3D').onclick();assert.ok(element('positionSteps').innerHTML.includes('data-symbol="alpha3D"'));assert.ok(element('positionSummary').innerHTML.includes('7 m'));assert.ok(element('projectionHelp').textContent.includes('not physical measurements'));
for(const point of ['A','B'])for(let i=0;i<3;i++)element('point'+point+i).value='0';element('pointForce').value='100';element('pointA0').handlers.input();assert.ok(element('positionError').textContent.includes('coincide'));assert.ok(!element('positionSteps').innerHTML.includes('<mfrac>'));
element('pointA0').value='';element('pointA0').handlers.input();assert.ok(element('positionError').textContent.includes('finite number'));
for(const [key,value] of Object.entries({rx:3,ry:4,rz:0}))element('positionAnswer'+key).value=String(value);element('positionCheck').onclick();assert.ok(element('positionPracticeInputs').innerHTML.includes('Step 2'));
for(const [key,value] of Object.entries({length:5,ux:.6,uy:.8,uz:0}))element('positionAnswer'+key).value=String(value);element('positionCheck').onclick();assert.ok(element('positionPracticeInputs').innerHTML.includes('Step 3'));
for(const [key,value] of Object.entries({fx:120,fy:160,fz:0}))element('positionAnswer'+key).value=String(value);element('positionCheck').onclick();assert.ok(element('positionFeedback').textContent.includes('Correct'));assert.equal(element('positionCheck').disabled,true);
console.log('3D geometry, reversal, translation, zero-length handling, unit norms, force norms, lesson rendering, inputs, and three-stage practice passed.');
