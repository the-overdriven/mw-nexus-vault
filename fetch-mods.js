// usage example: node fetch-mods.js vurt

import fs from 'fs'

// Get uploaderName from command-line argument
const uploaderName = process.argv[2]

if (!uploaderName) {
  console.error('❌ Please provide an uploader name as an argument.\nUsage: node fetch-mods.js <uploaderName>')
  process.exit(1)
}

const outputFile = `mods_${uploaderName}.json`

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
          isBlockedFromEarningDp
          viewerBlocked
        }
        totalCount
      }
    }

    fragment ModFragment on Mod {
      adultContent
      createdAt
      downloads
      endorsements
      fileSize
      game {
        domainName
        id
        name
      }
      modCategory {
        categoryId
        name
      }
      modId
      name
      status
      summary
      thumbnailUrl
      thumbnailBlurredUrl
      uid
      updatedAt
      uploader {
        avatar
        memberId
        name
      }
      viewerDownloaded
      viewerEndorsed
      viewerTracked
      viewerUpdateAvailable
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
      // uploaderId: [{ op: "EQUALS", value: '61856301' }]
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

  const data = await res.json()
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))
  console.log(`✅ Response saved to ${outputFile}`)
} catch (err) {
  console.error('❌ Fetch error:', err)
}
