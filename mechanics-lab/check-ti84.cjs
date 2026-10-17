const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),M=require('./dist/math.js'),R=require('./dist/ti-recipes.js'),TI=require('./dist/ti84.js');
const original=require('./dist/calculus-data.js').data,originalAnswers=new Map(original.problems.map(p=>[p.id,p.steps.filter(s=>s.fields).map(s=>s.fields.map(f=>f.value))]));const D=require('./dist/practice-bank.js').data;
const close=(a,b,label='',tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`),rad=t=>t*Math.PI/180,add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),norm=a=>Math.sqrt(a.reduce((s,x)=>s+x*x,0)),unit=a=>a.map(x=>x/norm(a)),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
// Independent antisymmetric tensor expansion, rather than the application's component formula.
function cross(a,b){let c=[0,0,0];for(const [i,j,k] of [[0,1,2],[1,2,0],[2,0,1]]){c[i]+=a[j]*b[k];c[i]-=a[k]*b[j];}return c;}
function determinant(a,b,c){return a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]);}
function simpson(f,a,b,N=2000){let s=f(a)+f(b);for(let i=1;i<N;i++)s+=(i%2?4:2)*f(a+(b-a)*i/N);return s*(b-a)/(3*N);}
function verifyModel(r){const p=r.proof,g=r.groups.map(g=>g.rows.map(x=>x.value)),last=g.at(-1),flat=g.flat(),check=(x,y)=>Array.isArray(x)?x.forEach((v,i)=>close(v,y[i],r.id)):close(x,y,r.id),end=x=>check(last,x);assert.ok(p,r.id);
 switch(p.kind){
 case 'resultant':{const a=[p.a*Math.cos(rad(p.alpha)),p.a*Math.sin(rad(p.alpha))],b=[p.b*Math.cos(rad(p.beta)),p.b*Math.sin(rad(p.beta))],v=add(a,b),angle=(Math.atan2(v[1],v[0])*180/Math.PI+360)%360;if(r.id==='resultants'){check(g[0],[...a,...b]);check(g[1],v);check(g[2],[norm(v)]);end([angle]);}else if(r.id==='exam1-1'){check(g[0],[p.beta-p.alpha]);end([norm(v)]);}else{check(g[0],[norm(v)]);end([Math.atan2(v[1],v[0])*180/Math.PI]);}break;}
 case 'component':check(g[0],[p.f*Math.cos(rad(p.t)),p.f*Math.sin(rad(p.t)),0]);end([p.f]);break;
 case 'cartesian':check(g[0],[norm(p.f)]);end([(Math.atan2(p.f[1],p.f[0])*180/Math.PI+360)%360]);break;
 case 'sum':{const v=p.missing?sub(p.b,p.a):add(p.a,p.b);check(g[0],v);check(g[1],[norm(v)]);if(!p.missing)end(v.map(x=>Math.acos(x/norm(v))*180/Math.PI));break;}
 case 'oblique':{const b=g[0][0],a=last[0];check([a+b*Math.cos(rad(p.axis)),b*Math.sin(rad(p.axis))],[p.f*Math.cos(rad(p.t)),p.f*Math.sin(rad(p.t))]);break;}
 case 'cosines':end([p.f*Math.cos(rad(p.a)),p.f*Math.cos(rad(p.b)),p.f*Math.sqrt(1-Math.cos(rad(p.a))**2-Math.cos(rad(p.b))**2)]);check(norm(last),p.f);break;
 case 'cable':{const d=sub(p.b,p.a),u=unit(d),f=u.map(x=>x*p.F);if(r.id==='position')end([p.F]);else if(r.id==='position-distance')end([norm(d),...u]);else end(f);check(norm(f),p.F);break;}
 case 'projection':{const u=unit(p.d),s=dot(p.f,u),parallel=u.map(x=>s*x),perp=sub(p.f,parallel);if(r.id==='projection')end(parallel);else if(r.id==='projection-perpendicular'){end(perp);close(dot(perp,p.d),0,r.id,1e-6);check(add(parallel,perp),p.f);}else if(r.id==='projection-included-angle')end([Math.acos(s/norm(p.f))*180/Math.PI]);else end([s]);break;}
 case 'twoCables':{const a=unit(sub(p.b,p.a)).map(x=>x*p.f),b=unit(sub(p.c,p.a)).map(x=>x*p.h);end(add(a,b));check(norm(a),p.f);check(norm(b),p.h);break;}
 case 'angleProjection':end([p.f*Math.cos(rad(p.t))]);break;
 case 'moment':{const v=cross(p.r,p.f);if(r.id==='moments')end([norm(v)/norm(p.f)]);else if(r.id==='moments-3d')end([norm(v)]);else if(r.id==='exam1-3')end(v.map(Math.abs));else end([v[2]]);close(dot(v,p.r),0,r.id,1e-6);close(dot(v,p.f),0,r.id,1e-6);break;}
 case 'cableMoment':{const f=unit(sub(p.b,p.a)).map(x=>x*p.F),m=cross(p.a,f);end(m);check(cross(p.b,f),m);break;}
 case 'inverseMoment':check(g[0][0]*p.r,p.target);end([Math.abs(p.target/p.r)]);break;
 case 'arm':end([-p.f*p.d]);break;
 case 'multipleMoment':end([cross(p.r1,p.f1)[2]+cross(p.r2,p.f2)[2]]);break;
 case 'inverseAxis':check(determinant(p.u,p.r,[0,0,last[0]]),p.target);break;
 case 'axisProjection':{const x=dot(p.f,unit(p.d));end([r.id==='exam1-5'?Math.abs(x):x]);break;}
 case 'axis':{const m=cross(p.r,p.f),s=determinant(unit(p.d),p.r,p.f);end([r.id==='axis'?Math.abs(s):s]);check(dot(unit(p.d),m),s);check(determinant(unit(p.d),add(p.r,p.d),p.f),s);break;}
 case 'coupleSum':end([p.a+p.b]);break;
 case 'inverseCouple':check(last[0]*(p.findForce?p.d:p.f),p.target);break;
 case 'couple':{const m=cross(sub(p.p,p.b),p.f),o=[4,-2,7],other=add(cross(sub(p.p,o),p.f),cross(sub(p.b,o),p.f.map(x=>-x)));check(m,other);end([r.id==='couples'?norm(m)/norm(p.f):norm(m)]);break;}
 case 'system':end([cross(p.r,p.f)[2]+p.c]);break;
 case 'system3':end(add(add(cross(p.r1,p.f1),cross(p.r2,p.f2)),p.c));break;
 case 'location':end([(p.a*p.x1+p.b*p.x2)/(p.a+p.b)]);check(last[0]*(p.a+p.b),p.a*p.x1+p.b*p.x2);break;
 case 'pureCouple':end([-p.f*p.d]);break;
 case 'load':{const f=simpson(x=>p.coef*x**p.n,0,p.L),q=simpson(x=>p.coef*x**(p.n+1),0,p.L);check(g[0],[f]);if(r.id.startsWith('integrals'))end([f]);else{check(g[1],[q]);end([q/f]);assert.ok(last[0]>0&&last[0]<p.L);}break;}
 case 'trapezoid':{const f=simpson(x=>p.low+(p.high-p.low)*x/p.L,0,p.L),q=simpson(x=>x*(p.low+(p.high-p.low)*x/p.L),0,p.L);end([f,q/f]);break;}
 case 'pressure':check(g[0],[p.p*p.b]);check(g[1],[simpson(x=>p.p*x/p.L*p.b,0,p.L)]);end([2*p.L/3]);break;
 case 'piecewise':{const f=p.a*p.L+p.b*(p.U-p.L),q=simpson(x=>p.a*x,0,p.L)+simpson(x=>p.b*x,p.L,p.U);end([f,q/f]);break;}
 case 'power':{const exponent=g[0][0],a=g[1][0];for(const x of [.7,1.3,2.1]){const h=1e-5;close((a*(x+h)**exponent-a*(x-h)**exponent)/(2*h),p.c*x**p.n,r.id,2e-7);}end([p.c,p.n]);break;}
 case 'polyIntegral':end([simpson(x=>p.coeff.reduce((s,c,i)=>s+c*x**i,0),p.a,p.b)]);break;
 case 'constant':check(g[0],[p.c/2,2]);check(g[0][0]*p.x**2+last[0],p.y);break;
 case 'polynomial':end([p.coeff[2]/3,p.coeff[1]/2,p.coeff[0]]);for(const x of [-1,.5,2])check(3*last[0]*x*x+2*last[1]*x+last[2],p.coeff[2]*x*x+p.coeff[1]*x+p.coeff[0]);break;
 case 'signed':check(g[0],[simpson(x=>x,-p.L,p.L)]);end([simpson(x=>-x,-p.L,0)+simpson(x=>x,0,p.L)]);break;
 case 'substitution':{const a=last[0],n=last[1];for(const x of [.3,.7,1])check(a*n*(x*x+1)**(n-1)*2*x,p.c*x*(x*x+1)**p.n);break;}
 case 'subBounds':end([simpson(x=>x*(x*x+1)**p.n,0,p.U)]);break;
 case 'log':end([simpson(x=>p.c/x,p.a,p.b)]);break;
 case 'exponential':check(g[0][0]*p.n,p.c);end([p.c]);break;
 case 'trig':end([simpson(x=>Math.sin(p.n*x),0,Math.PI/(2*p.n))]);break;
 case 'parts':{const [a,b]=last;for(const x of [-1,.5,1])check((a+a*x+b)*Math.exp(x),p.c*x*Math.exp(x));break;}
 case 'riemann':{let sum=0;for(let i=1;i<=p.N;i++){const x=i*p.L/p.N;sum+=x*x*p.L/p.N;}end([sum]);break;}
 default:throw Error('Missing mathematical check '+p.kind);
 }
}
let fields=0;for(const p of D.problems){const r=R.recipe(p.familyId,p.exampleNumber),steps=p.steps.filter(s=>s.fields);assert.equal(steps.length,r.groups.length,p.id);let memory={};for(const [i,group] of r.groups.entries()){assert.equal(steps[i].fields.length,group.rows.length,p.id);for(const [j,row] of group.rows.entries()){
 // Pass 1: stored answer vs explicit calculator expression derived from raw givens.
 close(steps[i].fields[j].value,row.value,p.id);if(!p.exampleNumber)close(originalAnswers.get(p.id)[i][j],row.value,p.id+' original answer',5e-8);
 // Pass 2: independent JavaScript arithmetic evaluator, not StudyMath's parser.
 const angle=r.mode==='DEG'?Math.PI/180:1,scope={...memory,sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,pi:Math.PI,sin:x=>Math.sin(x*angle),cos:x=>Math.cos(x*angle),atan:x=>Math.atan(x)/angle,acos:x=>Math.acos(x)/angle};const alt=vm.runInNewContext(row.expression.replaceAll('^','**'),scope);close(alt,row.value,p.id);memory[row.store]=row.value;fields++;
 }}
 // Pass 3: independent vector identities, geometric reconstruction, quadrature or derivative.
 verifyModel(r);for(const s of steps){const html=TI.renderStep(s);assert.ok(html.includes('STO'));assert.ok(!html.includes('atan2('));assert.ok(!html.includes('NaN'));}
}
// Real roadmap flow across all 228 examples, with the family/example picker and support gates.
let harness=fs.readFileSync('check-roadmap.cjs','utf8').split('let b=browser();')[0].replace("require('./dist/roadmap-variants.js')","require('./dist/practice-bank.js').data").replace('D.problems.length,33','D.problems.length,228');
harness+=`let b=browser();b.context.TI84=require('./dist/ti84.js');for(const p of D.problems){b.context.GuidedRoadmap.open(p.group);b.context.GuidedRoadmap.selectProblem(p.id);assert.ok(b.node('roadmap').innerHTML.includes('id="roadmapExample"'));b.node('roadmapFullExampleToggle').onclick();assert.ok(b.node('roadmapFullExample').innerHTML.includes('TI-84 Plus'));b.node('roadmapRestart').onclick();for(const step of p.steps){if(step.options)b.query('input[name="roadmapChoice"]')[step.answer].onchange();else for(const [i,f] of step.fields.entries()){const input=b.query('[data-roadmap-field]')[i];input.value=String(f.value);input.oninput();}b.node('roadmapCheck').onclick();assert.equal(b.node('roadmapNext').disabled,false,p.id);b.node('roadmapNext').onclick();}assert.equal(JSON.parse(storage.get('statics-roadmap-v1'))[p.id].completed,true,p.id);}`;
new Function('require',harness)(require);
// Live workspace expressions follow arbitrary inputs, not just the saved examples.
for(let n=1;n<=20;n++){
 const r=[n/3,-2,4],f=[20+n,-30,40],a=[1,1,0],b=[4,5,n/2];
 const groups=R.live('moment',{O:[0,0,0],P:r,F:f});groups[1].ti84.rows.forEach((row,i)=>close(row.value,cross(r,f)[i],'live moment'));close(groups[2].ti84.rows[1].value,norm(cross(r,f))/norm(f),'live arm');
 const projection=R.live('projection',{F:f,d:b});close(projection[1].ti84.rows[0].value,dot(f,unit(b)),'live projection');
 const axis=R.live('axisWorkspace',{A:[0,0,0],B:b,P:r,F:f,M:[0,0,0],source:'force',reverse:n%2===0});close(axis.at(-1).ti84.rows[0].value,determinant(unit(b).map(x=>n%2===0?-x:x),r,f),'live axis');
 const cable=R.live('position',{A:a,B:b,F:250});close(norm(cable.at(-1).ti84.rows.map(x=>x.value)),250,'live cable norm');
}
assert.throws(()=>R.live('position',{A:[1,1,1],B:[1,1,1],F:100}));assert.throws(()=>R.live('projection',{F:[1,2,3],d:[0,0,0]}));
const nodes=new Map();function node(id){if(!nodes.has(id)){let html='';const n={id,value:'',textContent:'',dataset:{},children:[],appendChild(c){this.children.push(c);},querySelector(){return {dataset:{equation:'Displacement from A to B'},textContent:''};}};Object.defineProperty(n,'innerHTML',{get:()=>html,set:s=>{html=s;for(const m of s.matchAll(/id="([^"]+)"/g))node(m[1]);}});nodes.set(id,n);}return nodes.get(id);}
const seed=(prefix,v)=>v.forEach((x,i)=>node(prefix+i).value=String(x));for(const [prefix,v] of Object.entries({pointA:[1,1,0],pointB:[4,5,0],projectionF:[100,50,0],projectionD:[3,4,0],momentO:[0,0,0],momentP:[2,1,0],momentF:[50,100,0],axisA:[0,0,0],axisB:[3,4,0],axisP:[2,1,0],axisF:[0,0,100],axisM:[0,180,0],coupleP:[2,3,0],coupleQ:[0,0,0],coupleF:[0,100,0]}))seed(prefix,v);for(const [id,value] of Object.entries({a:120,b:90,alpha:30,beta:120,pointForce:100,axisSource:'given'}))node(id).value=String(value);for(const prefix of ['systems','location','distributed','integrals'])for(const [suffix,value] of [['Length',4],['Load',120],['Shape',0]])node(prefix+suffix).value=String(value);
let count=0;const ctx={TIRecipes:R,TI84:TI,M,$:node,document:{createElement:()=>node('created-'+count++),querySelector:()=>node('main'),addEventListener(){}},MutationObserver:class{observe(){}},queueMicrotask:fn=>fn()};ctx.window=ctx;vm.runInNewContext(fs.readFileSync('dist/ti84-workspaces.js','utf8'),ctx);assert.ok(node('lessonTI84Entries').innerHTML.includes('120'));const before=node('momentTI84Entries').innerHTML;node('momentF0').value='75';ctx.TI84Workspaces.refresh();assert.notEqual(node('momentTI84Entries').innerHTML,before);assert.ok(node('axisWorkspaceTI84Entries').innerHTML.includes('TI-84 Plus'));
console.log(`Three-method numerical audit passed: ${D.problems.length} examples, ${fields} numeric answers; all walkthroughs solve through the UI.`);
