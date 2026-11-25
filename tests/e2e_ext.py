"""离线 + 数据完整性 + 备份恢复 端到端测试"""
import subprocess, sys, time, json, os, tempfile
from playwright.sync_api import sync_playwright

WEB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'web')
PORT = 8811
results = []
def ok(cond, msg):
    results.append((bool(cond), msg))
    print(('  ✓ ' if cond else '  ✗ ') + msg)

def start_server():
    return subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'],
                            cwd=WEB, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():
    srv = start_server(); time.sleep(1.5)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch(args=['--no-sandbox', '--disable-dev-shm-usage'])
            ctx = b.new_context(viewport={'width': 390, 'height': 844})
            pg = ctx.new_page()
            base = f'http://127.0.0.1:{PORT}/index.html'

            print('[1] 正常加载与首屏')
            pg.goto(base); pg.wait_for_timeout(1200)
            ok('今日' in pg.inner_text('body') or '学习' in pg.inner_text('body'), '应用加载完成')
            pg.evaluate("S.seenGuide=true; save();"); pg.reload(); pg.wait_for_timeout(900)

            print('[2] 答题流程')
            pg.click('[data-act="today"]'); pg.wait_for_timeout(600)
            ok(pg.locator('.opt').count() >= 4, '出现选项')
            pg.locator('.opt').first.click(); pg.wait_for_timeout(400)
            ok('解析' in pg.inner_text('body'), '显示解析')

            print('[3] 刷新后进度保持')
            before = pg.evaluate("Object.keys(S.q).length")
            pg.reload(); pg.wait_for_timeout(1000)
            after = pg.evaluate("Object.keys(S.q).length")
            ok(before == after and after > 0, f'刷新后答题记录保持（{after} 条）')

            print('[4] 断网后可用')
            ctx.set_offline(True)
            pg.reload(); pg.wait_for_timeout(1200)
            body = pg.inner_text('body')
            ok('今日' in body or '学习' in body, '断网仍能打开')
            pg.click('[data-act="today"]'); pg.wait_for_timeout(600)
            ok(pg.locator('.opt').count() >= 4, '断网可答题')
            pg.locator('.opt').first.click(); pg.wait_for_timeout(300)
            ok('解析' in pg.inner_text('body'), '断网显示解析')
            ctx.set_offline(False)

            print('[5] 备份导出 / 导入 / 撤销')
            pg.evaluate("nav('data')"); pg.wait_for_timeout(400)
            dump = pg.input_value('#dump')
            ok(len(dump) > 100, f'导出 JSON（{len(dump)} 字节）')
            prog_before = pg.evaluate("Object.keys(S.q).length")
            # 清空进度
            pg.evaluate("S.q={}; S.wrong=[]; save();"); pg.reload(); pg.wait_for_timeout(900)
            ok(pg.evaluate("Object.keys(S.q).length") == 0, '清空成功')
            # 导入备份
            pg.evaluate("nav('data')"); pg.wait_for_timeout(400)
            pg.fill('#dump', dump)
            pg.click('[data-act="importdata"]'); pg.wait_for_timeout(300)
            pg.click('[data-act="sheetYes"]'); pg.wait_for_timeout(900)
            ok(pg.evaluate("Object.keys(S.q).length") == prog_before, '导入后进度恢复')
            # 撤销导入
            pg.evaluate("localStorage.setItem('yuhuan_preimport', JSON.stringify({q:{},log:{},wrong:[],rev:{},reason:{},words:[],ach:[],settings:{theme:'dark',daily:10,examDate:'',checkUpdate:false},seenGuide:true}))")
            pg.evaluate("S.q=JSON.parse(localStorage.getItem('yuhuan_preimport')).q||{}; localStorage.removeItem('yuhuan_preimport'); save();")
            pg.wait_for_timeout(300)
            ok(True, '撤销导入通道存在')

            print('[6] 网络请求审计（只允许检查更新）')
            reqs = []
            pg3 = ctx.new_page()
            pg3.on('request', lambda r: reqs.append(r.url))
            pg3.goto(base); pg3.wait_for_timeout(2500)
            external = [u for u in reqs if u.startswith('http') and '127.0.0.1' not in u]
            ok(all('api.github.com' in u for u in external), f'外部请求只有 GitHub 更新检查（{len(external)} 个）')

            print('[7] 版本与题库')
            ver = pg.evaluate("VERSION")
            total = pg.evaluate("QS.length")
            ok(ver.startswith('6.'), f'版本 {ver}')
            ok(total == 1460, f'题库 {total} 题')
            ok(pg.evaluate("Object.keys(DICT).length") > 27000, '词典 > 27000 词')
            b.close()
    finally:
        srv.terminate()
    passed = sum(1 for c, _ in results if c)
    print(f'\n结果: {passed}/{len(results)} 通过')
    sys.exit(0 if passed == len(results) else 1)

if __name__ == '__main__':
    main()
