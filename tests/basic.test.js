// 语欢基础回归测试（CI 自动运行）：node tests/basic.test.js
const fs=require('fs'),vm=require('vm');
const els={};let ch=null;
function el(id){return els[id]||(els[id]={id,innerHTML:'',textContent:'',style:{},value:'',className:'',select(){},focus(){},_secs:null,_groups:null})}
const hs=[{phase:'home'}];
global.history={pushState(s){hs.push(s)},replaceState(s){hs[0]=s},back(){hs.pop()},length:2};
global.document={getElementById:el,addEventListener(t,f){if(t==='click')ch=f},createElement(){return{style:{},click(){},remove(){}}},body:{appendChild(){},className:'',setAttribute(){}},caretRangeFromPoint(){return null},execCommand(){return true}};
global.window=global;global.addEventListener=function(){};
global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};
let timers=[]; global.setInterval=function(fn){timers.push(fn);return timers.length}; global.clearInterval=function(){};
const path=require('path');
const htmlSrc=fs.readFileSync(path.join(__dirname,'..','web','index.html'),'utf8');
const mm=htmlSrc.match(/<script>([\s\S]*?)<\/script>/);
if(!mm) throw new Error('web/index.html 里找不到 script');
vm.runInThisContext(mm[1]);
const html=()=>els.view.innerHTML;

let pass=0,fail=0;
const ok=(c,m)=>{ if(c){pass++;} else {fail++; console.log('FAIL: '+m);} };
function click(act,a){const e={getAttribute(k){if(k==='data-act')return act;return(a&&a[k]!==undefined)?String(a[k]):null},closest(){return this}};ch({target:{closest(){return e}}})}
function $date(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}

/* ========== A. 数据完整性 ========== */
ok(QS.length===1670,'题库应为 1670，实际 '+QS.length);
ok(QS.filter(q=>/^20\d\d/.test(q[5]||'')).length===630,'真题应为 630');
ok(QS.filter(q=>q[7]).length===985,'知识点题应为 985');
ok(QS.every(q=>Array.isArray(q)&&q.length>=5),'题目结构');
ok(QS.every(q=>q[1]&&q[1].trim().length>0),'题干非空');
ok(QS.every(q=>Array.isArray(q[2])&&q[2].length>=2),'选项数≥2');
ok(QS.every(q=>typeof q[3]==='number'&&q[3]>=0&&q[3]<q[2].length),'答案下标合法');
ok(QS.every(q=>q[4]&&q[4].length>=20),'解析非空且≥20字');
const dup={}; let dups=0;
QS.forEach(q=>{const k=q[1].trim().toLowerCase()+'||'+q[2].join('|').toLowerCase(); if(dup[k])dups++; dup[k]=1;});
ok(dups===0,'无完全重复题目（题干+选项，实际 '+dups+'）');
// 同题干不同篇章是正常的（七选五固定问法）
const stemCount={}; QS.forEach(q=>{const k=q[1].trim(); stemCount[k]=(stemCount[k]||0)+1;});
const seven=QS.filter(q=>q[0]==='真题·七选五');
ok(seven.every(q=>q[2].length===7),'七选五每题 7 个选项');
ok(QS.filter(q=>q[0]==='真题·阅读').every(q=>q[2].length===4),'阅读每题 4 个选项');
ok(QS.filter(q=>q[0]==='真题·完形').every(q=>q[2].length===4),'完形每题 4 个选项');
ok(QS.filter(q=>q[7]&&q[7]!=='').every(q=>q[2].length===4),'知识点题每题 4 个选项');
ok(Object.keys(NOS).length===630,'题号映射 630');
// 篇章题
const withP=QS.map((q,i)=>i).filter(i=>QS[i][6]);
ok(withP.length>=280,'带原文题目 '+withP.length);
ok(withP.every(i=>QS[i][6].length>100),'原文长度合理');
// 译文
ok(Object.keys(TR).length>=1100,'译文条目 '+Object.keys(TR).length);
ok(withP.every(i=>TR[i]&&TR[i].p),'篇章题都有原文译文');
// 知识库/范文/词典
ok(Object.keys(KB).length===51,'知识库 51 篇');
ok(WRITING.length===14,'范文 14 篇');
ok(WRITING.every(w=>w.en&&w.zh),'范文含中英');
ok(Object.keys(DICT).length>26000,'词库 '+Object.keys(DICT).length);
ok(Object.keys(CLOZE).length>=14,'完形译文 '+Object.keys(CLOZE).length);

/* ========== B. 所有入口的题池规则 ========== */
function poolOf(fn,args){ try{ fn.apply(null,args||[]); }catch(e){ return {err:e.message}; }
  const r = ses? {list:ses.list.slice(),mode:ses.mode}:{list:[]}; phase='home'; return r; }
let r;
r=poolOf(startToday); ok(!r.err&&r.list.length>0&&r.list.every(i=>!QS[i][6]),'今日学习只用单题');
(function(){
  var mods={}; r.list.forEach(function(i){ mods[QS[i][0]]=1; });
  ok(Object.keys(mods).length>=3,'今日学习跨模块随机（'+Object.keys(mods).length+' 个模块）');
})();
r=poolOf(startDaily); ok(r.list.length>0&&r.list.every(i=>!QS[i][6]),'随机练习只用单题');
r=poolOf(startMock); ok(r.list.length===20&&r.list.every(i=>!QS[i][6]),'模拟考只用单题');
r=poolOf(startDiag); ok(r.list.length===20&&r.list.every(i=>!QS[i][6]),'摸底只用单题');
r=poolOf(startReview); ok(!r.err,'复习可启动');
r=poolOf(startPoint,['一般现在时']); ok(r.list.length>0&&r.list.every(i=>QS[i][7]==='一般现在时'),'知识点只出该点题');
r=poolOf(startModule,['时态']); ok(r.list.length>0&&r.list.every(i=>QS[i][0]==='时态'),'模块只出该模块题');
r=poolOf(startTimed); ok(r.list.length>=3&&r.list.every(i=>QS[i][6]),'限时阅读都是篇章');
r=poolOf(startRealCat,['真题·七选五']); ok(r.list.every(i=>QS[i][0]==='真题·七选五'),'按题型只出该题型');

/* ========== C. 页面渲染 ========== */
S.seenGuide=true; S.q={}; S.wrong=[]; S.rev={}; S.reason={}; S.words=[]; S.ach=[]; S.log={}; save();
['home','outline','mine','papers','cats','passages','writing','wronglist','report','words','data','guide'].forEach(p=>{
  phase=p; render();
  ok(els.view.innerHTML.length>50,'页面 '+p+' 有内容');
});
ui.pcat='真题·阅读'; phase='passages'; render();
ok((els.view._groups||[]).length>10,'阅读篇章列表 '+((els.view._groups||[]).length));
ui.detail='一般现在时'; phase='detail'; render();
ok(html().includes('规则')&&html().includes('真题里考过'),'知识点详情完整');
phase='data'; render(); ok(html().includes('导入'),'备份页正常');
phase='report'; render(); ok(html().includes('最近 7 天'),'周报正常');

/* ========== D. 答题流程 ========== */
phase='home'; render(); click('daily');
ok(phase==='quiz','随机练习启动');
let guard=0;
while(phase==='quiz'&&guard++<40){ const i=current(); click('pick',{'data-k':QS[i][3]}); click('next'); }
ok(phase==='result','答完进结果页');
ok(html().includes('正确率'),'结果页有正确率');
// 答错流程 + 错因
phase='home'; render(); click('daily');
const wq=current(); const wrongK=(QS[wq][3]+1)%4;
click('pick',{'data-k':wrongK});
ok(html().includes('这题为什么错'),'答错显示错因');
click('reason',{'data-r':'concept'});
ok(S.reason[wq]&&S.reason[wq].concept===1,'错因记录');
ok(S.wrong.indexOf(wq)>=0,'错题入本');
ok(S.rev[wq]&&S.rev[wq].due<=$date(),'错题进复习');
// 答对调度
const good=current(); click('pick',{'data-k':QS[good][3]});
ok(!S.rev[good] || S.rev[good].due>=$date(),'答对后排到未来或已掌握');
click('next'); click('skip'); ok(true,'跳转不崩');

/* ========== E. 篇章模式 ========== */
const g=passGroups('真题·阅读')[0];
startBlock(g.ids,'测试篇');
ok(phase==='block','篇章作答启动');
ok(!html().includes('原文译文'),'作答前无原文译文');
ok(!html().includes('解析：'),'作答前无解析');
g.ids.forEach(qi=>{ ses.answers[qi]=QS[qi][3]; });
ses._warned=false;
click('bsubmit');
ok(ses.submitted,'交卷成功');
ok(html().includes('原文译文')&&html().includes('解析：'),'交卷后出译文与解析');
click('blockdone'); ok(phase==='result','篇章结果页');

/* ========== F. 计时 ========== */
startMock(); ok(ses.seconds===1200&&ses.left>0,'模拟考计时 20 分钟');
const before=ses.left; timers[timers.length-1]();
ok(ses.left===before-1,'倒计时递减');
stopTimer();

/* ========== G. 词典与生词本 ========== */
ok(meanOf('hello').includes('喂'),'词典 hello');
ok(meanOf('technology').includes('技术'),'词典 technology');
ok(['student','students'].indexOf(lookup("students'").w)>=0,'词形回退');
ok(lookup('running').w==='run'||lookup('running').w==='running'||lookup('running').w==='run','-ing 回退');
ok(suggestWords('abso').length>3,'联想 abso');
ok(suggestWords('zzzzqqq').length===0,'无匹配返回空');
S.words=[{w:'hello',ctx:'say hello',ts:1}]; save();
phase='words'; render(); ok(html().includes('喂'),'生词本显示释义');
// 输入不重建
const inp=el('wq'); inp.oninput.call({value:'tech'});
ok(el('wq')===inp,'生词本输入不重建');
// 默认输入框也应存在
ok(!!el('hq'),'首页查词框存在');

/* ========== H. 设置与持久化 ========== */
click('theme'); ok(document.body.className==='light','日间模式');
click('theme'); ok(document.body.className==='dark','夜间模式');
click('accent',{'data-a':'green'}); ok(S.settings.accent==='green','主题色切换');
S.settings.examDate='2026-06-07'; save();
ok(daysLeft()!==null,'倒计时计算');
const dump=JSON.stringify(S); ok(dump.length>100,'数据可序列化 '+Math.round(dump.length/1024)+'KB');
// 非法导入
phase='data'; render();
const ta=el('dump'); ta.value='bad json';
click('importdata'); ok(els.toast.textContent.includes('导入失败'),'非法导入被拒');

/* ========== I. 成就与统计 ========== */
S.q={}; for(let i=0;i<10;i++) S.q[i]={n:2,right:2};
checkAch(); ok(S.ach.length>=1,'成就可解锁');
ok(totalDone()===10,'totalDone 统计');
ok(masteredPoints()>=0,'掌握点数计算');
phase='mine'; render(); ok(html().includes('成就'),'我的页成就区');

/* ========== J. 性能 ========== */
const t0=Date.now(); for(let k=0;k<20;k++){ phase='home'; render(); } const t1=Date.now();
ok((t1-t0)/20<80,'首页渲染平均 '+Math.round((t1-t0)/20)+'ms（<80ms）');
const t2=Date.now(); for(let k=0;k<50;k++) suggestWords('inf'); const t3=Date.now();
ok((t3-t2)/50<20,'联想平均 '+((t3-t2)/50).toFixed(1)+'ms（<20ms）');


/* ========== K. 更新检查 ========== */
global.XMLHttpRequest=function(){
  this.open=function(){}; this.send=function(){ this.status=200;
    this.responseText=JSON.stringify({tag_name:"v9.9.9",html_url:"https://example.com/release"}); this.onload(); };
};
checkUpdate(true);
ok(UPD.latest==="9.9.9",'更新检查解析版本号');
phase='home'; render();
ok(html().includes('发现新版本'),'首页显示新版本提示');

/* ========== L. 错误日志 ========== */
logError('测试异常','Error: test\n  at foo');
ok(S.errors.length>=1,'错误写入本地');
ok(S.errors[S.errors.length-1].m.indexOf('测试异常')>=0,'错误内容记录');
ok(errorDump().indexOf('测试异常')>=0,'错误可导出');
phase='errors'; render();
ok(html().includes('测试异常'),'错误日志页显示');

console.log('\n========== 结果 ==========');
console.log('通过 '+pass+' 项，失败 '+fail+' 项');
if(fail) process.exitCode=1;
