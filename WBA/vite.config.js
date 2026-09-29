import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function typesafeReview() {
  let apiKey
  const middleware = (req, res, next) => {
    if (req.url !== '/api/typesafe/catalog-review') return next()
    res.setHeader('Content-Type', 'application/json')
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }
    if (!apiKey) {
      res.statusCode = 503
      res.end(JSON.stringify({ error: 'TypeSafe is not configured. Set TYPESAFE_API_KEY on the dev server.' }))
      return
    }
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 8192) req.destroy()
    })
    req.on('end', async () => {
      try {
        const item = JSON.parse(body)
        if (typeof item.name !== 'string' || typeof item.sku !== 'string' || typeof item.warehouseBin !== 'string') throw new Error('Invalid item')
        const response = await fetch('https://api.typesafe.ai/v1/systemone', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'jev-latest',
            state: { item: { name: item.name.slice(0, 200), sku: item.sku.slice(0, 80), warehouseBin: item.warehouseBin.slice(0, 120), hasShelfLife: !!item.hasShelfLife, shelfLifeMonths: item.shelfLifeMonths } },
            questions: {
              shelf_life_mismatch: { type: 'noul', instructions: 'Does `item.name` suggest a perishable or expiring product while `item.hasShelfLife` is false?' },
              vague_identity: { type: 'noul', instructions: 'Is `item.name` too vague to identify a specific catalog product?' },
              location_mismatch: { type: 'noul', instructions: 'Does `item.warehouseBin` look like a note or unrelated text rather than a warehouse location?' },
            },
          }),
          signal: AbortSignal.timeout(10000),
        })
        if (!response.ok) throw new Error(`TypeSafe request failed (${response.status})`)
        const data = await response.json()
        const scores = Object.fromEntries(['shelf_life_mismatch', 'vague_identity', 'location_mismatch'].map((key) => [key, data.answers?.[key]?.noul]))
        if (Object.values(scores).some((value) => typeof value !== 'number' || value < 0 || value > 1)) throw new Error('Invalid TypeSafe response')
        res.end(JSON.stringify({ scores }))
      } catch (error) {
        res.statusCode = 502
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
  return { name: 'typesafe-catalog-review', configResolved(config) { apiKey = loadEnv(config.mode, config.root, 'TYPESAFE_API_KEY').TYPESAFE_API_KEY }, configureServer(server) { server.middlewares.use(middleware) }, configurePreviewServer(server) { server.middlewares.use(middleware) } }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), typesafeReview()],
  server: {
    allowedHosts: ['octane-jumble-uncurious.ngrok-free.dev']
  }
})
