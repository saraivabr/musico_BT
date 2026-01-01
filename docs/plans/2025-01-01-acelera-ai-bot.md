# Saraiva.AI - Acelera>AI Bot

**Goal:** Entregar um bot WhatsApp (Saraiva.AI) que vende e implementa o método Acelera>AI (copy matricial + playbooks) com Gemini, conduzindo leads a microcompromissos e agenda de 15 minutos (sem falar valores).

## Módulos
- Menu/boas-vindas orientados a vendas e CTA contínuo com convite de agenda.
- Pílula diária: headline, insight e próximo passo (06h) + convite de 15min.
- Diagnóstico (quiz): 5 perguntas sobre copy/funil.
- Estratégia imediata: microplano em bullets a partir do briefing + CTA de agenda.
- Planos de implementação: Sprint 7d e Ramp-up 14d.
- Playbooks/copys: exemplos por nicho/objeção.
- Indicação de lead/parceiro com abordagem consultiva.

## Variáveis de ambiente
- `PORT` (default 3008)
- `MONGODB_URI` (ex: `mongodb://localhost:27017/acelera-bot`)
- `GEMINI_API_KEY`
- `BOT_NAME` (default `Saraiva.AI`)
- `DEVOCIONAL_HORA` (hora da pílula diária, default `06:00`)

## Deploy rápido
```bash
export GEMINI_API_KEY=xxxx
docker-compose up -d --build
```

## Prompts chave
- `ACELERA_SYSTEM_PROMPT` em `src/services/gemini.ts` define persona de closer da Saraiva.AI (sem valores, sempre propondo agenda de 15 minutos).
- Pílula diária também está em `src/services/gemini.ts` (headline/insight/nextStep).

## Ritmo de follow-up sugerido
- 3 variações de gancho em 48h.
- Sequência de 3-5 toques em até 10 dias.
- CTA preferencial: agenda curta com horário específico.
