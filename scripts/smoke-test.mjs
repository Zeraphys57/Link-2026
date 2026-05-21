import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = 'scripts/.smoke'
mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:3000'

const log = (...a) => console.log('[smoke]', ...a)
const errors = []

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  // ---- PESERTA ----
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    page.on('console', m => { if (m.type() === 'error') errors.push(`[peserta console] ${m.text()}`) })
    page.on('pageerror', e => errors.push(`[peserta pageerror] ${e.message}`))

    log('navigate /login')
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: `${OUT}/01-login.png` })

    // mode 'tim' is default
    await page.getByPlaceholder('Contoh: Garuda').fill('Codex')
    await page.getByPlaceholder('••••••••').fill('1321913277')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForURL('**/peserta', { timeout: 20000 })
    await page.waitForLoadState('networkidle')
    log('peserta dashboard:', page.url())
    await page.screenshot({ path: `${OUT}/02-peserta.png`, fullPage: true })
    await ctx.close()
  }

  // ---- PANITIA ----
  {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    page.on('console', m => { if (m.type() === 'error') errors.push(`[panitia console] ${m.text()}`) })
    page.on('pageerror', e => errors.push(`[panitia pageerror] ${e.message}`))

    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Panitia' }).click()
    await page.getByPlaceholder('email@example.com').fill('bryanjacquellino5757@gmail.com')
    await page.getByPlaceholder('••••••••').fill('panitiaLink2026!')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await page.waitForURL('**/panitia', { timeout: 20000 })
    await page.waitForLoadState('networkidle')
    log('panitia dashboard:', page.url())
    await page.screenshot({ path: `${OUT}/03-panitia.png`, fullPage: true })
    await ctx.close()
  }

  await browser.close()
}

run()
  .then(() => {
    if (errors.length) {
      console.log('\n=== CONSOLE/PAGE ERRORS ===')
      errors.forEach(e => console.log(' -', e))
      process.exit(1)
    } else {
      log('DONE — no console/page errors')
    }
  })
  .catch(e => {
    console.error('[smoke] FAILED:', e.message)
    if (errors.length) errors.forEach(x => console.log(' -', x))
    process.exit(1)
  })
