import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getCheckedAtField = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8')
    const json = JSON.parse(data)

    if (json.checkedAt) {
      return json.checkedAt
    } else {
      console.log('checkedAt field not found.')
      return null
    }
  } catch (error) {
    console.error('Error reading or parsing file:', error.message)
  }
}
