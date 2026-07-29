import puppeteer from 'puppeteer-core'
import fs from 'fs'

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--user-data-dir=/tmp/pupp-grace-' + Date.now()],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })

try {
  await page.goto('https://gracexygu.github.io/', { waitUntil: 'networkidle0', timeout: 30000 })
  await new Promise(r => setTimeout(r, 4000))
  const html = await page.content()
  fs.writeFileSync('/tmp/grace.html', html)
  console.log('html length:', html.length)
  
  // 检查页面结构
  const summary = await page.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText.slice(0, 500),
      sections: Array.from(document.querySelectorAll('section, main, [class*="section"]')).map(s => ({
        tag: s.tagName,
        cls: s.className,
        text: (s.innerText || '').slice(0, 80)
      })).slice(0, 20),
      docH: document.documentElement.scrollHeight,
      scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || '(inline)').slice(0, 10),
    }
  })
  console.log(JSON.stringify(summary, null, 2))
  
  // 拍整页
  await page.screenshot({ path: '/tmp/grace-full.png', fullPage: true })
  console.log('screenshot saved')
} catch (e) {
  console.error('ERR:', e.message)
} finally {
  await browser.close()
}
