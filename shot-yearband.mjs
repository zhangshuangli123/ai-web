import puppeteer from 'puppeteer-core'

const url = process.argv[2]
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox']
})
const page = await browser.newPage()
await page.setViewport({width: 1440, height: 900})
await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 800))
await page.evaluate(() => document.getElementById('experience').scrollIntoView({behavior:'instant', block:'start'}))
await new Promise(r => setTimeout(r, 1200))
const rect = await page.evaluate(() => {
  const el = document.querySelector('.year-band')
  const r = el.getBoundingClientRect()
  return {x: r.left, y: r.top, w: r.width, h: r.height}
})
console.log(JSON.stringify(rect))
await page.screenshot({
  path: '/home/node/.openclaw/workspace/tmp/yearband-close.png',
  clip: {
    x: Math.max(0, rect.x - 20),
    y: Math.max(0, rect.y - 20),
    width: rect.w + 40,
    height: rect.h + 40,
  }
})
await browser.close()
console.log('done')
