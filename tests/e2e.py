# 语欢端到端测试（需要 playwright）：python3 tests/e2e.py
import subprocess,time,sys,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','web')
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,'-m','http.server','8781','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1.5)
fails=[]
def ok(c,m):
    print(('ok: ' if c else 'FAIL: ')+m)
    if not c: fails.append(m)
try:
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--no-sandbox','--disable-dev-shm-usage'])
        ctx=b.new_context(viewport={'width':390,'height':844})
        pg=ctx.new_page()
        base='http://127.0.0.1:8781/index.html'
        pg.goto(base); pg.wait_for_timeout(700)
        ok(pg.evaluate("phase")=='guide','首次打开显示引导')
        pg.click('[data-act="home"]'); pg.wait_for_timeout(300)
        ok(pg.evaluate("phase")=='home','跳过引导进入首页')
        # 主题持久化
        pg.evaluate("S.settings.theme='light'; S.settings.accent='green'; save(); applyTheme();")
        pg.reload(); pg.wait_for_timeout(800)
        ok(pg.evaluate("S.settings.theme")=='light','主题持久化')
        ok(pg.evaluate("document.body.className")=='light','日间模式生效')
        ok(pg.evaluate("S.seenGuide")==True,'引导不再出现')
        ok(pg.evaluate("phase")=='home','重载后仍在首页')
        # 查词
        pg.fill('#hq','techno'); pg.wait_for_timeout(500)
        ok('technology' in pg.inner_html('#hres'),'查词联想')
        # 今日学习（单题）
        pg.click('[data-act="today"]'); pg.wait_for_timeout(500)
        ok(pg.evaluate("phase")=='quiz','今日学习启动')
        ok(pg.evaluate("ses.list.every(i=>!QS[i][6])"),'今日学习无篇章')
        qid=pg.evaluate("ses.list[0]")
        wrong=(pg.evaluate("QS[%d][3]"%qid)+1)%4
        pg.click('.opt >> nth=%d'%wrong); pg.wait_for_timeout(400)
        ok('这题为什么错' in pg.evaluate("document.body.innerText"),'答错显示错因')
        pg.click('[data-act="reason"][data-r="concept"]'); pg.wait_for_timeout(200)
        ok(pg.evaluate("(S.reason[%d]||{}).concept"%qid)==1,'错因记录')
        # 篇章模式
        pg.evaluate("startBlock(passGroups('真题·阅读')[0].ids,'x')"); pg.wait_for_timeout(500)
        ok(pg.evaluate("phase")=='block','篇章模式启动')
        ok('原文译文' not in pg.evaluate("document.body.innerText"),'作答前不显示原文译文（可见文本）')
        pg.evaluate("ses.answers[ses.list[0]]=0; render();")
        pg.click('[data-act="bsubmit"]'); pg.wait_for_timeout(300)
        ok(pg.evaluate("ses.submitted")==False,'未答完首次交卷被拦')
        pg.click('[data-act="bsubmit"]'); pg.wait_for_timeout(500)
        ok(pg.evaluate("ses.submitted")==True,'再点一次交卷成功')
        ok('原文译文' in pg.evaluate("document.body.innerText"),'交卷后显示原文译文')
        # 非法导入
        pg.evaluate("phase='data'; render();"); pg.wait_for_timeout(300)
        pg.fill('#dump','not-json')
        pg.click('[data-act="importdata"]'); pg.wait_for_timeout(400)
        ok('导入失败' in pg.evaluate("$('toast').textContent"),'非法导入被拒')
        # 进度可序列化
        ok(pg.evaluate("JSON.stringify(S).length")>100,'进度可序列化')
        # 计时
        pg.evaluate("phase='home'; render(); startMock();"); pg.wait_for_timeout(400)
        ok(pg.evaluate("ses.left")==1200,'模拟考倒计时 1200 秒')
        ok(pg.evaluate("ses.list.every(i=>!QS[i][6])"),'模拟考无篇章')
        pg.evaluate("stopTimer()")
        # 无 JS 报错
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for ph in ['home','outline','mine','papers','cats','writing','wronglist','report','words','data']:
            pg.evaluate("phase='%s'; render();"%ph); pg.wait_for_timeout(120)
        ok(len(errs)==0,'各页面渲染无 JS 报错 '+str(errs[:2]))
        b.close()
finally:
    srv.terminate()
print('\n结果:', '全部通过' if not fails else '失败 '+str(len(fails)))
sys.exit(1 if fails else 0)
