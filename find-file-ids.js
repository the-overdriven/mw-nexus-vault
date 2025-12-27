import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function scrapeNexusMods(url) {
  const browser = await puppeteer.launch({
    headless: true, // set false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  // Pretend to be a normal browser
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/139 Safari/537.36'
  )

  console.log('Opening page...')
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 })

  // Wait a bit in case Cloudflare or JS challenge appears
  const delay = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000
  await new Promise(r => setTimeout(r, delay))

  // Get the HTML after challenge
  const html = await page.content()

  await browser.close()

  return html
}

export async function findFileIds(modId) {
  try {
    const url = `https://www.nexusmods.com/morrowind/mods/${modId}?tab=files`
    await delay(300)

    console.log('Pulling file ids from: ', url)

    const response = await scrapeNexusMods(url).catch(console.error)

    const $ = cheerio.load(response)

    const dataIds = []

    $('dt[data-id]').each((_, element) => {
      const dataId = $(element).attr('data-id')
      if (dataId) {
        dataIds.push(dataId)
      }
    })

    return dataIds
  } catch (error) {
    console.error('Error fetching or parsing page:', error.message)
  }
}
