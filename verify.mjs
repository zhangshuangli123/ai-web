import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-web-security']
})
const page = await browser.newPage()
await page.setViewport({width: 1440, height: 900, deviceScaleFactor: 2})
const url = 'https://picasso-private-1251524319.cos.ap-shanghai.myqcloud.com/formula-static/dibp/polaroid13-10778xz8h/index.html'
const failed = []
page.on('requestfailed', req => failed.push({url: req.url(), err: req.failure()?.errorText}))
page.on('response', res => {
  if (res.status() >= 400 && res.url().includes('photo')) failed.push({url: res.url(), status: res.status()})
})
await page.goto(url, {waitUntil: 'networkidle0', timeout: 30000})
await new Promise(r => setTimeout(r, 1000))
await page.evaluate(() => document.getElementById('experience').scrollIntoView({behavior:'instant', block:'center'}))
await new Promise(r => setTimeout(r, 2000))
const rect = await page.evaluate(() => {
  const el = document.querySelector('.polaroid-fan')
  const r = el.getBoundingClientRect()
  return {x: Math.max(0, r.x - 40), y: Math.max(0, r.y - 40), w: r.width + 80, h: r.height + 80}
})
await page.screenshot({
  path: '/home/node/.openclaw/workspace/tmp/fan-actual.png',
  clip: rect
})
console.log('FAILED:', JSON.stringify(failed, null, 2))
console.log('DONE')
await browser.close()
