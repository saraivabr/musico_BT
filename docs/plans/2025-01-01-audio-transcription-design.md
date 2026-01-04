# Audio Transcription Feature - Design Document

**Data:** 2025-01-01
**Status:** Implementado ✅
**Impacto:** WOW Factor - Usuário pode descrever música via áudio

---

## Objetivo

Permitir que usuários descrevam suas ideias musicais **falando** (enviando áudio) em vez de digitando texto. Isso cria uma experiência mais natural, expressiva e intuitiva.

---

## Arquitetura

### Componentes

1. **`src/services/transcription.ts`** (NEW)
   - `downloadAudio(mediaUrl)` - Baixa áudio do WhatsApp
   - `transcribeAudioWithWhisper(audioBuffer)` - Transcreve com OpenAI Whisper
   - `processAudioMessage(mediaUrl)` - Orquestra download + transcrição
   - `isAudioMessage(message)` - Valida se é áudio

2. **`src/flows/criarMusicaFlow.ts`** (UPDATED)
   - Detecta mensagens de áudio no passo `getting_description`
   - Transcreve automaticamente
   - Continua o fluxo normal com texto transcrito

### Fluxo de Dados

```
WhatsApp Audio Message
    ↓
[Media URL captured]
    ↓
axios.get(mediaUrl) → Buffer
    ↓
FormData + OpenAI Whisper API
    ↓
Text Transcript
    ↓
criarMusicaFlow continues normally
    ↓
Music Generation
```

---

## User Experience

### Antes
```
Bot: "Descreva sua música"
User: [typing long text...]
```

### Depois
```
Bot: "Você fala (áudio 🎤) ou escreve a ideia"
User: [sends 30 second audio]
    ↓
Bot: "🎤 Estou escutando sua visão..."
Bot: "✅ Entendi: [transcrição]"
Bot: "🎸 Qual estilo?"
```

---

## Implementação

### Tecnologia
- **OpenAI Whisper API** - Speech-to-text (multilíngue, preciso)
- **axios** - HTTP client para download + API
- **form-data** - Multipart form para upload de áudio

### Fluxo no Código

```typescript
// Em criarMusicaFlow.ts
if (isAudioMessage(ctx.message)) {
  try {
    const description = await processAudioMessage(ctx.message.media.url)
    // Continua fluxo normal com descrição transcrita
  } catch (error) {
    // Tratamento de erro amigável
  }
}
```

---

## Tratamento de Erros

| Erro | Mensagem | Ação |
|------|----------|------|
| Download falha | "Não consegui baixar seu áudio" | Retry ou texto |
| Áudio > 25MB | "Áudio muito grande (máx 25MB)" | Enviar outro |
| Transcrição vazia | "Não consegui ouvir nada" | Gravar novamente |
| Whisper timeout | "Demorou demais" | Retry automático |

---

## Limitações & Melhorias Futuras

### MVP Atual
✅ Áudio descritivo (usuário fala sua ideia)

### Futuro
🔄 Humming/melodia (usuário canta melodia como referência)
🔄 Multi-idioma (não apenas PT)
🔄 Análise emocional da voz (tom, velocidade)

---

## Configuração

Nenhuma config extra necessária - usa `OPENAI_API_KEY` existente.

---

## Testing

### Manual
1. Enviar `/criar`
2. Selecionar opção `1` (descrever)
3. Enviar áudio de 10-30 segundos descrevendo ideia
4. Verificar se transcrição aparece corretamente

### Casos de Teste
- ✅ Áudio claro, português
- ✅ Áudio com background noise
- ✅ Áudio muito curto (< 2s)
- ✅ Áudio muito longo (> 25MB)
- ✅ Fallback para texto

---

## Impacto Psicológico

**WOW Factor:** Usuário sente que está criando arte naturalmente, conversando com a IA
**Acessibilidade:** Não precisa digitar (mais rápido, mais fácil)
**Expressividade:** Tom, emoção na voz são capturados naturalmente

---

## Próximos Passos

1. ✅ Implementar transcrição básica
2. ⏳ Testar em produção com usuários reais
3. ⏳ Melhorar prompt do Gemini com contexto de áudio
4. ⏳ Adicionar análise de sentimento da voz
