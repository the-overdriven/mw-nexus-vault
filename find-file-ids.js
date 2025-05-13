import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export async function findFileIds(modId) {
  try {
    const url = `https://www.nexusmods.com/morrowind/mods/${modId}?tab=files`
    await delay(300)

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    const $ = cheerio.load(response.data)
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
