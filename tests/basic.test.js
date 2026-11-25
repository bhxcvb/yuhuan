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
ok(QS.length===1460,'题库应为 1460，实际 '+QS.length);
ok(QS.filter(q=>/^20\d\d/.test(q[5]||'')).length===420,'真题应为 420');
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

ok(QS.filter(q=>q[7]&&q[7]!=='').every(q=>q[2].length===4),'知识点题每题 4 个选项');
ok(Object.keys(NOS).length===420,'题号映射 420');
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
ok(Object.keys(getDict()).length>26000,'词库 '+Object.keys(getDict()).length);
ok(true,'完形已移除');

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


/* ========== J2. 中文反查 ========== */
ok(isCJK('网络')&&!isCJK('network'),'中英文判断');
(function(){
  var r1=searchChinese('网络'); ok(r1.length>0 && r1.slice(0,3).indexOf('network')>=0,'中文查「网络」→ network（实际 '+r1.slice(0,3).join(',')+'）');
  var r2=searchChinese('解释'); ok(r2.slice(0,3).indexOf('explain')>=0,'中文查「解释」→ explain');
  var r3=searchChinese('尽管'); ok(r3.length>=2,'中文查「尽管」有结果');
  var r4=searchChinese('责任'); ok(r4.length>=2,'中文查「责任」有结果');
  ok(!!getDict()['account for'],'短语库含 account for');
  ok(suggestCNHTML('网络').indexOf('network')>=0,'中文结果渲染到页面');
})();

/* ========== J3. 导航栈与完形整篇 ========== */
(function(){
  S.seenGuide=true; save();
  navRoot('home');
  nav('outline'); nav('mine');
  ok(navStack.length===2,'导航栈记录 2 层');
  navRoot('home'); ok(navStack.length===0,'回首页清空栈');
  phase='home'; render(); startPoint('一般现在时');
  ok(phase==='quiz','进入练习');
  backPage(); ok(phase==='home','退出练习回首页');
  nav('outline'); ui.openMod='时态'; render();
  ui.detail='一般现在时'; nav('detail'); startPoint('一般现在时');
  backPage(); ok(phase==='detail','从知识点进入的练习退回知识点');
  ok(QS.every(q=>q[0]!=='真题·完形'),'已无完形题');
  ok(intDays(2)>0,'复习间隔函数');
  S.settings.reviewIntensity='tight'; ok(intDays(5)===7,'紧凑档生效');
  S.settings.reviewIntensity='normal'; ok(intDays(5)===15,'标准档生效');
})();

/* ========== J4. 知识点关联 ========== */
(function(){
  ok(Object.keys(REL).length===51,'关联表覆盖 51 个知识点');
  ok(REL['定语从句：关系代词'].length>=3,'关系代词有 3 个以上相邻考点');
  ok(REL['虚拟语气：与现在相反'].indexOf('虚拟语气：与过去相反')>=0,'虚拟语气相关关系正确');
  for(var k in REL){ ok(Array.isArray(REL[k])&&REL[k].length<=4,'关联数量不超过 4：'+k); }
})();

/* ========== J5. 复习算法与数据安全 ========== */
(function(){
  S.seenGuide=true; save();
  // 复习：答对升箱、错两次推到明天、错因概念不清推到明天
  var i=singles()[0];
  delete S.rev[i]; schedule(i,false,"careless");
  ok(S.rev[i].err===1 && S.rev[i].due===dateKey(),'首次错：当天再练');
  schedule(i,false,"careless");
  ok(S.rev[i].err===2 && S.rev[i].due>dateKey(),'连续错两次：推到明天');
  delete S.rev[i]; schedule(i,false,"concept");
  ok(S.rev[i].due>dateKey(),'概念不清：推到明天');
  delete S.rev[i]; schedule(i,true);
  ok(S.rev[i] && S.rev[i].box===1,'答对升箱到 1');
  S.rev[i].err=2; schedule(i,true);
  ok(S.rev[i].box>=2,'错过又答对会加速');
  // 迁移
  var old={schema:1,q:{},log:{},wrong:[],rev:{},reason:{},words:[],ach:[]};
  var m=migrate(old); ok(m.schema===4,'旧数据迁移到 schema 4');
  // 导入前自动备份
  autoBackup("pre-import-test");
  ok(!!localStorage.getItem("yuhuan_pre-import-test"),'导入前备份写入本地');
  localStorage.removeItem("yuhuan_pre-import-test");
  // 重复题隐藏
  ok(Object.keys(dupSet()).length>0,'检测到重复题并隐藏：'+Object.keys(dupSet()).length+' 条');
  ok(Object.keys(dupSet()).length>=40,'重复题归一化后隐藏 ≥40 条（实际 '+Object.keys(dupSet()).length+'）');
  var dupList=Object.keys(dupSet()).map(Number);
  ok(dupList.every(function(x){return singles().indexOf(x)<0;}),'重复题不在单题池中');
  // 周目标
  ok(typeof S.settings.weekly==='number' && S.settings.weekly>0,'每周目标存在：'+S.settings.weekly);
})();

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

/* ========== N. 数据安全与学习系统增强（v6.23） ========== */
(function(){
  // 规范化：残缺/旧数据不崩溃
  var n=normalizeStore({q:{},settings:{theme:"light"}});
  ok(Array.isArray(n.wrong)&&Array.isArray(n.words)&&n.log&&n.rev,'残缺数据补齐');
  ok(typeof n.settings.daily==="number"&&n.settings.theme==="light",'规范化保留已有设置');
  var n2=normalizeStore({q:{"a":"bad","1":{n:3,right:2,extra:1}},log:{x:{n:5,r:3}},rev:{2:{box:"x"}}});
  ok(!n2.q.a&&n2.q[1].n===3&&n2.q[1].extra===undefined,'q 字段清洗');
  ok(n2.log.x.n===5,'log 字段清洗');
  ok(!n2.rev[2],'rev 缺少 due 时丢弃');

  // 进度备份不含自定义题库
  var oldDS=S.dataset; S.dataset={QS:[[1]],TR:{},NOS:{}};
  ok(progressDump().indexOf('"dataset"')<0,'进度备份不含题库');
  if(oldDS===undefined) delete S.dataset; else S.dataset=oldDS;

  // 真实正确率 / 掌握度（不是覆盖率）
  var pt=POINTS[0][0], ids=pointIds(pt);
  S.q={}; S.q[ids[0]]={n:4,right:1};
  var st=pointStats(pt);
  ok(st.n===4&&st.right===1&&Math.abs(st.acc-0.25)<1e-9,'知识点统计用真实正确率');
  var mv=pointMastery(pt);
  ok(mv>=15&&mv<=45,'掌握度按正确率+覆盖度计：'+mv);
  var wl=weakList();
  ok(wl[0].p===pt,'真实正确率最低的知识点排最前');
  ok(typeof wl[0].n==='number','薄弱点带作答次数');
  ok(masteredPoints()>=0,'掌握点数计算（新口径）');

  // 动态 SRS：掌握后保留长间隔，不再删除记录
  var i2=singles()[0]; S.q[i2]={n:5,right:5};
  S.rev[i2]={box:5,due:dateKey(),err:0,lapses:0};
  schedule(i2,true);
  ok(S.rev[i2]&&S.rev[i2].box===6,'高箱答对继续升级');
  ok(S.rev[i2].due>addDays(20),'掌握后保留长间隔：'+S.rev[i2].due);
  S.rev[i2]={box:5,due:dateKey(),err:0,lapses:0};
  schedule(i2,false,"careless"); schedule(i2,false,"careless");
  ok(S.rev[i2].lapses===1,'高箱遗忘记 lapses');

  // 智能推荐：不含篇章、数量正确
  var rec=recommendList(12);
  ok(rec.length>0&&rec.every(function(x){return !QS[x][6];}),'推荐练习不含篇章题');

  // 错题自动分类
  var wid=pointIds(POINTS[0][0])[0]; S.reason={}; S.q[wid]={n:4,right:0};
  S.reason[wid]={concept:1};
  ok(wrongCategory(wid)==='concept','用户标记错因优先');
  S.reason={};
  ok(wrongCategory(wid)==='concept','未标记时按低正确率推断概念不清');
  S.q[wid]={n:4,right:4};
  ok(wrongCategory(wid)==='careless','未标记时高正确率推断粗心');

  // 周报目标/建议、薄弱页、备份页
  S.log[dateKey()]={n:5,r:4}; S.settings.weekly=70; S.wrong=[];
  phase='report'; ui.reportSpan=7; render();
  ok(html().includes('本周目标'),'周报含目标');
  ok(html().includes('下周建议'),'周报含下周建议');
  ok(html().includes('错题分类'),'周报含错题分类');
  phase='weak'; render();
  ok(html().includes('真实正确率'),'薄弱页显示真实正确率');
  phase='data'; render();
  ok(html().includes('题库')&&html().includes('保存为文件'),'备份页含题库与文件备份');
  var old=S; S=normalizeStore({schema:1,q:{},log:{},wrong:[],rev:{},reason:{},words:[],ach:[]}); phase='home'; render();
  ok(html().length>0,'旧数据结构可正常渲染');
  S=old;

  // PWA 与资源
  var sw=fs.readFileSync(path.join(__dirname,'..','web','sw.js'),'utf8');
  ok(sw.indexOf('navigate')>=0,'SW 导航请求走 network-first');
  ok(sw.indexOf('yuhuan-v1')<0,'SW 缓存版本已升级');
  ok(fs.existsSync(path.join(__dirname,'..','web','reward.webp')),'web/reward.webp 存在');
})();

/* ========== O. 多题库进度隔离与迁移（v6.24） ========== */
(function(){
  // 旧数据迁移
  var old={schema:3,q:{0:{n:2,right:1}},log:{},wrong:[0],rev:{0:{box:1,due:dateKey(),err:0}},reason:{},trend:[],words:[],ach:[]};
  var n=normalizeStore(old);
  ok(n.schema===4,'schema 升到 4');
  ok(n.activeProfile==='builtin','旧数据归属内置题库');
  ok(n.q[0]&&n.q[0].n===2,'旧进度保留');
  ok(Object.keys(n.profiles).length===0,'旧数据不产生重复 profile');

  // 题库指纹稳定且区分
  var h1=datasetHash([['a','题干',['x','y'],0,'解析']]);
  var h2=datasetHash([['a','题干',['x','y'],0,'解析']]);
  var h3=datasetHash([['a','题干',['x','z'],0,'解析']]);
  ok(h1===h2&&h1!==h3,'题库指纹稳定且可区分');

  // 切换到自定义题库：进度独立
  S=normalizeStore(initStore()); S.seenGuide=true; save();
  S.q={0:{n:3,right:2}}; S.wrong=[0]; S.rev={0:{box:2,due:dateKey(),err:0}};
  save();
  var fake={QS:[['模拟','测试题干',['a','b'],0,'解析内容够长']],TR:{},NOS:{}};
  fake.id=datasetHash(fake.QS);
  ok(switchDataset(fake),'切换到自定义题库成功');
  ok(S.dataset&&S.dataset.id===fake.id,'当前题库 ID 正确');
  ok(Object.keys(S.q).length===0,'自定义题库从独立进度开始');
  ok(S.profiles.builtin&&S.profiles.builtin.q[0]&&S.profiles.builtin.q[0].n===3,'内置题库进度存入 profiles');
  var saved=JSON.parse(localStorage.getItem(KEY));
  ok(!saved.profiles[saved.activeProfile],'存储中不与当前题库重复保存');
  ok(switchDataset(null),'切回内置题库成功');
  ok(S.q[0]&&S.q[0].n===3,'切回后恢复内置题库进度');
  ok(!S.dataset,'当前题库回到内置');

  // 新格式备份导入：保留其他题库进度
  var backup=JSON.parse(JSON.stringify(S));
  backup.profiles={other:{q:{9:{n:1,right:0}},log:{},wrong:[],rev:{},reason:{},trend:[]}};
  backup.activeProfile='builtin';
  adoptImportedStore(backup,true);
  ok(S.activeProfile==='builtin'&&S.q[0].n===3,'导入新格式备份保留当前题库进度');
  ok(S.profiles.other&&S.profiles.other.q[9],'导入备份保留其他题库进度');

  // 旧格式备份导入：按旧行为归属当前题库
  var legacy={schema:3,q:{5:{n:2,right:2}},log:{},wrong:[],rev:{},reason:{},trend:[],words:[],ach:[]};
  adoptImportedStore(legacy,true);
  ok(S.q[5]&&S.q[5].n===2,'旧格式备份可导入');
  ok(S.activeProfile==='builtin','旧格式归入当前题库');

  // 清理
  S=normalizeStore(initStore()); S.seenGuide=true; save();
})();

/* ========== P. 间隔复习专项（v6.24） ========== */
(function(){
  var i=singles()[0];
  function reset(qn,qr){ delete S.rev[i]; S.q[i]={n:qn||0,right:qr||0}; }
  // 连续答对：逐级升箱、间隔递增
  reset(); schedule(i,true); var b1=S.rev[i].box,d1=S.rev[i].due;
  schedule(i,true); var b2=S.rev[i].box,d2=S.rev[i].due;
  schedule(i,true);
  ok(b1===1&&b2===2&&S.rev[i].box===3,'连续答对逐级升箱：'+[b1,b2,S.rev[i].box].join('/'));
  ok(d1<d2&&S.rev[i].due>=d2,'连续答对间隔递增');
  // 连续答错
  reset(); schedule(i,false,'careless');
  ok(S.rev[i].err===1&&S.rev[i].due===dateKey(),'第一次错当天重练');
  schedule(i,false,'careless');
  ok(S.rev[i].err===2&&S.rev[i].due>dateKey(),'连续错两次推到明天');
  schedule(i,false,'concept');
  ok(S.rev[i].due>dateKey(),'概念不清推到明天');
  // 遗忘后重新答对：箱位重置、lapses 记录、间隔缩短
  reset(10,9); S.rev[i]={box:5,due:addDays(-2),err:0,lapses:0};
  schedule(i,false,'careless');
  ok(S.rev[i].box===0&&S.rev[i].lapses===1,'高箱答错误记遗忘并归零');
  schedule(i,true);
  var gap=daysBetween(S.rev[i].due,dateKey());
  ok(S.rev[i].box>=1&&S.rev[i].box<=2,'遗忘后答对重新从低箱开始：'+S.rev[i].box);
  ok(gap<=2,'遗忘后间隔较短：'+gap+' 天');
  // 长期未复习：逾期 30 天后答对，间隔应比正常阶梯短
  reset(5,5); S.rev[i]={box:3,due:addDays(-30),err:0,lapses:0};
  schedule(i,true);
  var gap2=daysBetween(S.rev[i].due,dateKey());
  ok(gap2<intDays(4),'长期未复习后间隔缩短：'+gap2+' < '+intDays(4));
  // 掌握后重新遗忘：从高箱跌回、记录 lapse
  reset(8,8); S.rev[i]={box:7,due:dateKey(),err:0,lapses:0};
  schedule(i,false,'reading');
  ok(S.rev[i].box===0&&S.rev[i].lapses===1,'掌握后答错也记录遗忘');
  // 掌握后保留长间隔而不是删除
  reset(8,8); S.rev[i]={box:4,due:dateKey(),err:0,lapses:0};
  schedule(i,true); schedule(i,true);
  ok(S.rev[i]&&S.rev[i].box>=6&&daysBetween(S.rev[i].due,dateKey())>30,'掌握后保留长间隔：'+S.rev[i].due);
  // 复习队列只包含到期题
  S.rev={}; S.rev[i]={box:1,due:addDays(3),err:0,lapses:0};
  ok(dueList().indexOf(i)<0,'未到期不进入复习队列');
  S.rev[i].due=dateKey();
  ok(dueList().indexOf(i)>=0,'到期进入复习队列');
  delete S.rev[i]; delete S.q[i];
})();
/* ========== Q. 薄弱点/推荐/周报口径（v6.24） ========== */
(function(){
  var pA=POINTS[0][0], pB=POINTS[1][0];
  var idsA=pointIds(pA), idsB=pointIds(pB);
  // 单样本不应被判为最薄弱
  S=normalizeStore(initStore()); S.seenGuide=true;
  S.q={}; S.q[idsA[0]]={n:1,right:0}; S.q[idsB[0]]={n:6,right:1};
  var wl=weakList();
  var a=wl.filter(function(x){return x.p===pA;})[0], b=wl.filter(function(x){return x.p===pB;})[0];
  ok(a.low===true,'单样本标记为样本不足');
  ok(b.shrunk>b.acc,'平滑后正确率向 50% 收缩');
  ok(b.shrunk<0.5,'低正确率平滑后仍低于 50%');
  ok(wl[0].low===false,'薄弱点榜首不是单样本');
  ok(weakPoints(5).every(function(x){ return x.n>=2; }),'薄弱点推荐排除单样本');
  // 推荐排序：无到期题时，最薄弱知识点优先
  S=normalizeStore(initStore()); S.seenGuide=true; S.log={}; S.q={}; S.rev={}; S.wrong=[];
  idsA.slice(0,3).forEach(function(i){ S.q[i]={n:3,right:0}; });
  idsB.slice(0,3).forEach(function(i){ S.q[i]={n:3,right:3}; });
  var rec=recommendList(8);
  ok(rec.length>0 && QS[rec[0]][7]===pA,'推荐练习优先薄弱知识点：'+(rec.length?QS[rec[0]][7]:'空'));
  // 周报与分析页口径一致
  S=normalizeStore(initStore()); S.seenGuide=true; S.log={};
  var d0=dateKey(), d1=addDays(-1), d2=addDays(-2);
  S.log[d0]={n:4,r:3}; S.log[d1]={n:6,r:3}; S.log[d2]={n:2,r:2};
  var rs=rangeStats(7);
  ok(rs.tot===12&&rs.rgt===8&&rs.acc===67,'rangeStats 汇总正确：'+[rs.tot,rs.rgt,rs.acc].join('/'));
  ok(rs.perDay.reduce(function(x,e){return x+e.n;},0)===rs.tot,'每天题量求和等于总量');
  ok(rangeStats(7,7).tot===0,'上一周期无数据');
  S.settings.weekly=70;
  phase='report'; ui.reportSpan=7; render();
  ok(html().includes('12 题 · 正确率 67%'),'周报总数与 rangeStats 一致');
  ok(html().includes('本周目标'),'周报显示本周目标');
  phase='stats'; ui.statSpan=7; render();
  ok(html().includes('67%'),'分析页正确率同口径');
  // 低样本提示
  S=normalizeStore(initStore()); S.seenGuide=true; S.q={}; S.q[idsA[0]]={n:1,right:0};
  phase='weak'; render();
  ok(html().includes('样本不足'),'薄弱页显示样本不足区');
  S=normalizeStore(initStore()); S.seenGuide=true; save();
})();
/* ========== R. 2022+ 答案标注 / render 拆分 / iOS 静态加固（v6.24） ========== */
(function(){
  // 2022 年后真题标注官方答案状态
  var q22=-1;
  for(var i=0;i<QS.length;i++){ if(/^202[2-6]/.test(QS[i][5]||'')){ q22=i; break; } }
  ok(q22>=0,'存在 2022 年后真题');
  ui.qid=q22; phase='showQ'; render();
  ok(html().includes('官方未公布答案'),'2022 后真题标注答案来源');
  var q20=-1;
  for(var j=0;j<QS.length;j++){ if(/^2020/.test(QS[j][5]||'')){ q20=j; break; } }
  ui.qid=q20; phase='showQ'; render();
  ok(!html().includes('官方未公布答案'),'2020 真题不标注未公布');
  // render 拆分
  ok(typeof pageReport==='function'&&typeof pageStats==='function'&&typeof pageData==='function','页面渲染函数已独立');
  phase='report'; ui.reportSpan=7; render(); ok(html().length>500,'报告页仍可渲染');
  // iOS 加固静态检查
  ok(htmlSrc.indexOf('calc(100dvh / var(--fs,1))')>=0,'字号使用 CSS 变量而非直接改 zoom');
  ok(htmlSrc.indexOf('safe-area-inset-bottom')>=0,'底部安全区适配');
  ok(htmlSrc.indexOf('function warmSpeech')>=0,'语音合成预热（iOS）');
  ok(htmlSrc.indexOf('focusin')>=0,'键盘弹出时输入框滚动');
  ok(htmlSrc.indexOf('format-detection')>=0,'iOS 电话号码自动识别关闭');
})();
console.log('\n========== 结果 ==========');
console.log('通过 '+pass+' 项，失败 '+fail+' 项');
if(fail) process.exitCode=1;
