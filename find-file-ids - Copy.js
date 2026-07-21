import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { addExtra } from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
// Use the rebrowser fork instead of standard puppeteer to eliminate CDP leaks
import vanillaPuppeteer from 'rebrowser-puppeteer' 

const puppeteer = addExtra(vanillaPuppeteer)
puppeteer.use(StealthPlugin())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function scrapeNexusMods(url) {
  const browser = await puppeteer.launch({
    // headless: false,
    headless: 'shell',
    // Target your local AppData Brave installation
    executablePath: `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled', 
      '--window-size=1920,1080',
      '--disable-infobars',
      '--excludeSwitches=enable-automation' 
    ]
  })


  // Open pages using target contexts to separate fingerprinting footprints
  const pages = await browser.pages()
  const page = pages.length > 0 ? pages[0] : await browser.newPage()

  await page.setViewport({ width: 1920, height: 1080 })

  // Match UA version structurally to avoid raising engine contradictions
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  )

  console.log('Opening page...')
  
  // Use 'domcontentloaded' because Cloudflare keeps connections open intentionally
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

  // Let Turnstile / Managed Challenges execute their interactive cycles naturally
  console.log('Waiting for potential Cloudflare challenge clearance...')
  await delay(7000)

  const html = await page.content()
  await browser.close()

  return html
}

export async function findFileIds(modId) {
  try {
    const url = `https://www.nexusmods.com/morrowind/mods/${modId}?tab=files`
    await delay(300)

    console.log('Pulling file ids from: ', url)
    const response = await scrapeNexusMods(url)

    if (!response) {
      console.log('No response received.')
      return []
    }

    const $ = cheerio.load(response)
    const dataIds = []

    // Extracted target structures matching Nexus Mods file lists
    $('dt[data-id], div[data-id]').each((_, element) => {
      const dataId = $(element).attr('data-id')
      if (dataId) {
        dataIds.push(dataId)
      }
    })

    return dataIds
  } catch (error) {
    console.error('Error fetching or parsing page:', error.message)
    return []
  }
}
