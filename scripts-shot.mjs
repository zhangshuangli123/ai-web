import puppeteer from 'puppeteer-core'
import fs from 'fs'

const sections = ['top', 'about', 'experience', 'projects', 'photography', 'contact']

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--user-data-dir=/tmp/pupp-user-' + Date.now()],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle0' })

await page.evaluate(() => {
  document.querySelectorAll('.fade-in, .hero__word').forEach(el => el.classList.add('visible'))
  document.querySelectorAll('img').forEach(i => { i.loading = 'eager' })
})
await new Promise(r => setTimeout(r, 2500))

// 拿 section 位置
const rects = await page.evaluate((ids) => {
  return ids.map(id => {
    const el = document.getElementById(id)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { id, top: Math.round(r.top + window.scrollY), height: Math.round(r.height) }
  })
}, sections)
console.log('rects:', JSON.stringify(rects))

// 直接用 puppeteer fullPage 拍完整页（会自动伸展视口高度但不影响 CSS，因为 CDP 走 emulation）
await page.screenshot({ path: '/tmp/shots/full.png', fullPage: true })
const fullBuf = fs.readFileSync('/tmp/shots/full.png')
console.log('full done, size=', fullBuf.length)

// 用 sharp 裁切每个板块
const sharp = (await import('sharp')).default
for (const r of rects) {
  if (!r) continue
  await sharp(fullBuf)
    .extract({ left: 0, top: r.top, width: 1440, height: r.height })
    .toFile(`/tmp/shots/${r.id}.png`)
  console.log('shot', r.id, 'top=', r.top, 'h=', r.height)
}

await browser.close()
