import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const getOldAuthorData = async (filePath) => {
  try {
    const exists = await fs.promises.access(filePath, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false)

    if (!exists) {
      console.warn(`File does not exist: ${filePath}`)
      return null
    }

    const data = await fs.promises.readFile(filePath, 'utf8')
    const json = JSON.parse(data)

    return json || null
  } catch (error) {
  if (error.code === 'ENOENT') {
    console.warn(`File not found: ${filePath}`)
  } else {
    console.error('Error reading or parsing file:', error.message)
  }
  return null
}
}
