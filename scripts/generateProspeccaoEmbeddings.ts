import { GoogleGenerativeAI } from '@google/generative-ai'
import { promises as fs } from 'fs'
import path from 'path'
import { prospeccaoPlaybook } from '../src/knowledge/prospeccaoPlaybook'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCwuVjD84QifhOUUkcNR7TLZgWGJd9U2lA'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const embeddingModel = 'text-embedding-004'

interface EmbeddingVector {
  id: string
  category: string
  title: string
  content: string
  vector: number[]
}

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: embeddingModel })
  const result = await model.embedContent(text)
  return result.embedding.values
}

async function main() {
  console.log('🚀 Gerando embeddings do Playbook de Prospecção no Google...\n')

  const embeddings: EmbeddingVector[] = []
  const total = prospeccaoPlaybook.length

  for (let i = 0; i < prospeccaoPlaybook.length; i++) {
    const chunk = prospeccaoPlaybook[i]
    const text = `${chunk.title}\n${chunk.content}`

    console.log(`[${i + 1}/${total}] Gerando embedding: ${chunk.id}`)

    try {
      const vector = await generateEmbedding(text)

      embeddings.push({
        id: chunk.id,
        category: chunk.category,
        title: chunk.title,
        content: chunk.content,
        vector
      })

      console.log(`   ✅ OK (${vector.length} dimensões)`)

      // Delay para não estourar rate limit
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`   ❌ Erro: ${error}`)
    }
  }

  // Salva em arquivo
  const outputPath = path.join(process.cwd(), 'data', 'prospeccao-embeddings.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(embeddings, null, 2))

  console.log(`\n✅ ${embeddings.length} embeddings gerados e salvos em:`)
  console.log(`   ${outputPath}`)

  // Estatísticas
  const categories = [...new Set(embeddings.map(e => e.category))]
  console.log('\n📊 Estatísticas:')
  for (const cat of categories) {
    const count = embeddings.filter(e => e.category === cat).length
    console.log(`   ${cat}: ${count} chunks`)
  }
}

main().catch(console.error)
