/* Small explicit grammar: no eval, no executable user input. */
(function(root){
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 function parse(source){
  const s=source.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi');let i=0,tokens=[];
  while(i<s.length){if(/\s/.test(s[i])){i++;continue}let m=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(m){tokens.push({type:'num',value:m[0]});i+=m[0].length;continue}m=s.slice(i).match(/^[A-Za-z][A-Za-z0-9]*/);if(m){tokens.push({type:'id',value:m[0].toLowerCase()});i+=m[0].length;continue}if('+-*/^(),'.includes(s[i])){tokens.push({type:s[i],value:s[i++]});continue}throw Error('Unsupported character. Use numbers and calculator functions.');}
  tokens.push({type:'end'});let p=0;const peek=()=>tokens[p].type;function take(type){if(peek()!==type)throw Error('Check parentheses or the expression.');return tokens[p++];}
  function primary(){if(peek()==='num')return {kind:'num',value:take('num').value};if(peek()==='id'){let name=take('id').value;if(peek()==='('){take('(');let args=[add()];while(peek()===','){take(',');args.push(add());}take(')');return {kind:'fn',name,args};}return {kind:'id',name};}if(peek()==='('){take('(');let n=add();take(')');return {kind:'group',n};}throw Error('Enter a complete expression.');}
  function power(){let l=primary();if(peek()==='^'){take('^');l={kind:'op',op:'^',l,r:unary()};}return l;}
  function unary(){if(peek()==='+'||peek()==='-'){let op=tokens[p++].type;return {kind:'unary',op,n:unary()};}return power();}
  function mul(){let l=unary();while(peek()==='*'||peek()==='/'){let op=tokens[p++].type;l={kind:'op',op,l,r:unary()};}return l;}
  function add(){let l=mul();while(peek()==='+'||peek()==='-'){let op=tokens[p++].type;l={kind:'op',op,l,r:mul()};}return l;}
  let tree=add();if(peek()!=='end')throw Error('Use × between terms, for example 2×pi.');return tree;
 }
 function evaluate(n,mode='DEG',ans=0){const run=v=>evaluate(v,mode,ans),rad=v=>mode==='DEG'?v*Math.PI/180:v,angle=v=>mode==='DEG'?v*180/Math.PI:v;let result;
 if(n.kind==='num')result=Number(n.value);else if(n.kind==='group')result=run(n.n);else if(n.kind==='unary')result=(n.op==='-'?-1:1)*run(n.n);else if(n.kind==='id'){if(!['pi','e','ans'].includes(n.name))throw Error('Unknown variable: '+n.name);result={pi:Math.PI,e:Math.E,ans}[n.name];}else if(n.kind==='op'){let a=run(n.l),b=run(n.r);if(n.op==='/'&&b===0)throw Error('Cannot divide by zero.');result={'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'/':()=>a/b,'^':()=>a**b}[n.op]();}else {const functions={sin:v=>Math.sin(rad(v)),cos:v=>Math.cos(rad(v)),tan:v=>{if(Math.abs(Math.cos(rad(v)))<1e-12)throw Error('Tangent is undefined at this angle.');return Math.tan(rad(v));},asin:v=>angle(Math.asin(v)),acos:v=>angle(Math.acos(v)),atan:v=>angle(Math.atan(v)),sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,atan2:(y,x)=>angle(Math.atan2(y,x))};if(!functions[n.name])throw Error('Unknown function: '+n.name);if(n.args.length!==(n.name==='atan2'?2:1))throw Error('Wrong number of function arguments.');result=functions[n.name](...n.args.map(run));}
 if(!Number.isFinite(result))throw Error('No finite real result. Check the function domain.');return result;
 }
 function markup(n){if(n.kind==='num')return '<mn>'+esc(n.value)+'</mn>';if(n.kind==='id')return '<mi>'+esc(n.name==='pi'?'π':n.name)+'</mi>';if(n.kind==='group')return '<mrow><mo>(</mo>'+markup(n.n)+'<mo>)</mo></mrow>';if(n.kind==='unary')return '<mrow><mo>'+n.op+'</mo>'+markup(n.n)+'</mrow>';if(n.kind==='op'){if(n.op==='/')return '<mfrac>'+markup(n.l)+markup(n.r)+'</mfrac>';if(n.op==='^')return '<msup>'+markup(n.l)+markup(n.r)+'</msup>';return '<mrow>'+markup(n.l)+'<mo>'+({'*':'×','-':'−'}[n.op]||n.op)+'</mo>'+markup(n.r)+'</mrow>';}if(n.name==='sqrt')return '<msqrt>'+markup(n.args[0])+'</msqrt>';return '<mrow><mi>'+esc(n.name)+'</mi><mo>(</mo>'+n.args.map(markup).join('<mo>,</mo>')+'<mo>)</mo></mrow>';}
 function resultant(a,alpha,b,beta){let ax=a*Math.cos(alpha*Math.PI/180),ay=a*Math.sin(alpha*Math.PI/180),bx=b*Math.cos(beta*Math.PI/180),by=b*Math.sin(beta*Math.PI/180),x=ax+bx,y=ay+by,magnitude=Math.hypot(x,y);return {ax,ay,bx,by,x,y,magnitude,angle:magnitude<1e-9?null:(Math.atan2(y,x)*180/Math.PI+360)%360};}
 function directedForce(start,end,force){
  if(!Array.isArray(start)||!Array.isArray(end)||start.length!==3||end.length!==3||![...start,...end,force].every(Number.isFinite)||force<0)throw Error('Use three finite coordinates for each point and a nonnegative force magnitude.');
  const displacement=end.map((value,index)=>value-start[index]),length=Math.hypot(...displacement);
  if(!Number.isFinite(length))throw Error('Coordinates are too large.');
  if(length===0)return {displacement,length,unit:null,force:null,angles:null};
  const unit=displacement.map(value=>value/length),components=unit.map(value=>force*value),angles=unit.map(value=>Math.acos(Math.max(-1,Math.min(1,value)))*180/Math.PI);
  return {displacement,length,unit,force:components,angles};
 }
 function checkVector(value){if(!Array.isArray(value)||value.length!==3||!value.every(Number.isFinite))throw Error('Enter three finite Cartesian components.');}
 function dot(a,b){checkVector(a);checkVector(b);return a.reduce((sum,value,index)=>sum+value*b[index],0);}
 function projection(force,axis){
  checkVector(force);checkVector(axis);const axisLength=Math.hypot(...axis),forceLength=Math.hypot(...force);
  if(!axisLength)throw Error('The axis direction is zero. Give it a nonzero direction.');
  const unit=axis.map(value=>value/axisLength),scalar=dot(force,unit),parallel=unit.map(value=>scalar*value),perpendicular=force.map((value,index)=>value-parallel[index]),angle=forceLength?Math.acos(Math.max(-1,Math.min(1,scalar/forceLength)))*180/Math.PI:null;
  return {axisLength,forceLength,unit,scalar,parallel,perpendicular,angle};
 }
 const api={parse,evaluate,markup,esc,resultant,directedForce,dot,projection};if(typeof module!=='undefined')module.exports=api;else root.StudyMath=api;
})(typeof window!=='undefined'?window:globalThis);
