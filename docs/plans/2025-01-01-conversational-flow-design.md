# Conversational Flow Architecture - Design Document

**Data:** 2025-01-01
**Status:** Implementado ✅
**Impacto:** UX Revolution - Bot conversa naturalmente, sem etapas rígidas

---

## Objetivo

Transformar o fluxo de criação de música de um processo linear com etapas (*"Digite 1 ou 2"*) em uma **conversa natural tipo amigo**, onde a IA entende contexto, intenção e guia conversacionalmente.

---

## Antes vs Depois

### ❌ Antes (Linear/Steps)
```
Bot: "1️⃣ Descrever ou 2️⃣ Letra?"
User: "1"
Bot: "Descreva sua música"
User: "Festa alegre"
Bot: "Qual estilo?"
[...5 mensagens depois...]
Bot: "Confirma?"
```

### ✅ Depois (Conversacional)
```
Bot: "Me conta tudo: qual a vibe?"
User: "Tô com vibe de festa, sabe? Tipo 15 anos"
Bot: "Quer algo mais dançante ou romântico?"
User: "Dança mesmo"
Bot: "Perfeito! Deixa eu criar... ✨"
```

---

## Arquitetura Técnica

### Componentes

**1. `src/services/conversationAnalysis.ts`** (NEW)
- `analyzeUserMessage()` - GPT analisa mensagem em tempo real
  - Extrai: description, lyrics, style
  - Detecta se tem informação suficiente
  - Gera próxima pergunta natural
  - Indica quando está pronto para gerar

- `generateBotResponse()` - GPT gera resposta conversacional
  - Contextualizado com estado atual
  - Nunca faz listas/etapas
  - Tipo amigo ajudando
  - Usa emojis naturalmente

- `simpleAnalysis()` - Fallback se GPT falhar
  - Regex simples para extrair estilo
  - Análise baseada em comprimento

**2. `src/flows/criarMusicaFlow.ts`** (REWRITTEN)

Dois flows agora:
- `criarMusicaFlow` - Inicia a conversa
- `criarMusicaConversationFlow` - Continua conversação (EVENTS.ACTION)

**Fluxo:**
1. User dispara `/criar`
2. Bot inicia conversa amigável
3. Cada mensagem é analisada com GPT
4. Contexto é mantido em `state.musicState`
5. Quando pronto → gera música
6. Processamento em background (async)

### Data Flow

```
User Message
    ↓
[isAudioMessage?] → transcribe
    ↓
analyzeUserMessage(msg, history)
    ↓
Extract: description, lyrics, style
    ↓
generateBotResponse(msg, context, history)
    ↓
Send conversational reply
    ↓
[readyToGenerate?] → generateMusic()
```

---

## Fluxo Conversacional Exemplo

```
👤 "Opa, criar uma música"
🤖 "Me conta tudo: qual a vibe? O que você imagina?"

👤 "Tô com saudade, sabe? Daquele lance que não deu certo"
🤖 Analisa:
   - description: "saudade de algo que não deu certo"
   - style: não mencionado
   - readyToGenerate: false

🤖 "Que vibe você imagina pra isso? Algo mais acústico, melancólico, ou energético?"

👤 "Acústico mesmo, bem intimista"
🤖 Analisa:
   - description: "saudade de algo que não deu certo"
   - style: "acústico"
   - readyToGenerate: true

🤖 "Perfeito! Deixa eu criar isso pra você... ✨"
[gera música em background]

🤖 "🎉 Pronto! Sua música está aqui!"
[envia áudio, link, vídeo]
```

---

## Tecnologia

- **OpenAI GPT-4o-mini** - Análise de intenção + geração de respostas
- **Conversation History** - Mantém contexto (armazenado em state)
- **JSON Response** - análise structurada
- **Fallback Simple** - Se GPT falhar, usa regex

---

## Estado da Conversa

```typescript
interface MusicCreationState {
  conversationHistory: Array<{ role: string; content: string }>
  description?: string      // O que o user quer
  lyrics?: string           // Letra pronta
  style?: string            // Gênero/estilo
}
```

---

## Análise de Intenção

A IA retorna:
```json
{
  "description": "festa de 15 anos alegre",
  "lyrics": null,
  "style": "dança",
  "hasEnoughInfo": false,
  "nextQuestion": "Quer algo mais energético ou romântico?",
  "readyToGenerate": false
}
```

---

## Resposta do Bot

Sempre conversacional:
- "Quer algo mais dançante?" ✅
- "Perfeito! Deixa eu criar..." ✅
- "1️⃣ Dança 2️⃣ Acústico" ❌ (etapas = não permitido)

---

## Tratamento de Erros

| Erro | Fallback |
|------|----------|
| GPT timeout | simpleAnalysis() |
| Invalid JSON | Pergunta genérica |
| Audio falha | Pede para descrever em texto |
| Credits insuficientes | Redireciona para comprar |

---

## Próximos Passos

1. ✅ Implementar análise com GPT
2. ✅ Reescrever flow conversacional
3. ⏳ Testar com usuários reais
4. ⏳ Melhorar prompts baseado em feedback
5. ⏳ Adicionar mais contexto (preferências do user)
6. ⏳ Salvar histórico para personalizacao

---

## Impacto UX

- **Natural:** Conversa tipo amigo, não bot rígido
- **Inteligente:** GPT entende intenção implícita
- **Agnóstico:** Usuário pode falar de qualquer forma
- **Fast:** Pronto em 2-3 mensagens (vs 5-6 antes)
- **Conversável:** Usuário pode mudar ideia, refinar

---

## Performance

- GPT latency: ~1-2s por análise
- Estado armazenado em memória (state)
- Histórico mantido até conclusão
- Cleanup automático após gerar música
