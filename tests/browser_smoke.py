from playwright.sync_api import sync_playwright
from pathlib import Path

ROOT = 'http://127.0.0.1:4177'
OUT = Path(__file__).resolve().parents[1] / 'screenshots'
OUT.mkdir(parents=True, exist_ok=True)
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1,accept_downloads=True)
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(ROOT, wait_until='networkidle')
    assert 'M01' in page.title()
    page.screenshot(path=str(OUT/'01_initial.png'),full_page=True)
    page.get_by_role('button',name='Run EverBee Research').click()
    page.get_by_text('Research results',exact=False).wait_for(timeout=20000)
    assert page.locator('tbody tr[data-key]').count()>=5
    assert page.get_by_text('SYNTHETIC').count()>0
    page.screenshot(path=str(OUT/'02_research_results.png'),full_page=True)
    page.locator('tbody tr[data-key]').first.click()
    page.get_by_role('button',name='Approve Demo Opportunity').click()
    page.locator('[data-page="handoff"]').click()
    assert page.get_by_text('APPROVED DEMO').count()>0
    page.screenshot(path=str(OUT/'03_handoff.png'),full_page=True)
    page.locator('[data-page="seo"]').click()
    page.get_by_role('button',name='Run Fresh SEO Research (MOCK)').click()
    page.get_by_text('SKU-Specific SEO Listing File').wait_for(timeout=2000)
    page.screenshot(path=str(OUT/'04_seo.png'),full_page=True)
    page.locator('[data-page="connection"]').click()
    page.screenshot(path=str(OUT/'05_connection.png'),full_page=True)
    assert not errors, errors
    browser.close()
print('PASS: browser opened, M01 research executed, opportunity approved, M02 handoff displayed, M04 mock SEO executed; no JS errors')
