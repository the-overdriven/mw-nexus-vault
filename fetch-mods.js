// usage example: 
// pull one author: node fetch-mods.js vurt
// pull all authors: node fetch-mods.js

import fs from 'fs'

import { readdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { findFileIds } from './find-file-ids.js'
import { getCheckedAtField } from './get-checked-at.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const modsDir = path.join(__dirname, 'mods')

let modAuthors

try {
  const files = await readdir(modsDir)
  modAuthors = files
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'))
} catch (err) {
  console.error('Error reading directory:', err.message)
}


// Get uploaderName from command-line argument, if it exists
if (process.argv[2]) {
  modAuthors = [process.argv[2]]
}

const url = "https://api-router.nexusmods.com/graphql"

const headers = {
  "accept": "*/*",
  "accept-language": "en-GB,en;q=0.8",
  "content-type": "application/json",
  "priority": "u=1, i",
  "sec-ch-ua": "\"Chromium\";v=\"136\", \"Brave\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "sec-gpc": "1",
  "x-graphql-operationname": "UserMods",
  // "cookie": "cf_clearance=YOUR_TOKEN_HERE"
}

for (const uploaderName of modAuthors) {
  const outputFile = `./mods/${uploaderName}.json`

  const body = JSON.stringify({
    query: `
      query UserMods($count: Int, $facets: ModsFacet, $filter: ModsFilter, $offset: Int, $sort: [ModsSort!]) {
        mods(
          count: $count
          facets: $facets
          filter: $filter
          offset: $offset
          sort: $sort
        ) {
          facetsData
          nodes {
            ...ModFragment
          }
          totalCount
        }
      }

      fragment ModFragment on Mod {
        adultContent
        createdAt
        fileSize
        modCategory {
          categoryId
          name
        }
        modId
        name
        status
        summary
        thumbnailUrl
        uid
        updatedAt
      }
    `,
    variables: {
      count: 150,
      facets: {
        gameId: ["100"]
      },
      filter: {
        adultContent: [{ op: "EQUALS", value: false }],
        filter: [],
        op: "AND",
        uploader: [{ op: "EQUALS", value: uploaderName }]
      },
      offset: 0,
      sort: {
        createdAt: { direction: "DESC" }
      }
    },
    operationName: "UserMods"
  })

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body
    })

    let data = await res.json()

    const dateNow = new Date()
    const dateCheckedStr = await getCheckedAtField(outputFile)
    const dateChecked = new Date(dateCheckedStr)

    console.log('last checked author:', dateCheckedStr)

    // for each author's mod, check if it was updated since last check, and if it was, update mod's file IDs
    for (const mod of data.data.mods.nodes) {
      const dateUpdatedAt = new Date(mod.updatedAt)
      if (dateUpdatedAt > dateChecked) {
        console.log(`mod ${mod.modId} was updated since last checked`, mod.updatedAt)

        const fileIds = await findFileIds(mod.modId)
        console.log(`fetched file ids for mod ${mod.modId}:`, fileIds)

        mod.fileIds = fileIds
      }
    }

    data = { checkedAt: dateNow.toISOString(), ...data.data }

    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))
    console.log(`✅ Saved data for ${uploaderName} to ${outputFile}`)
  } catch (err) {
    console.error(`❌ Error fetching data for ${uploaderName}:`, err)
  }
}
