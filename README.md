# Teste-AI-Studio

App web para recomendações de filmes/séries por mood, com autenticação Supabase e enriquecimento de metadados via TMDB.

## Stack
- React + Vite + TypeScript
- Supabase (Auth + profiles)
- TMDB API (posters, detalhes)
- Gemini API (recomendações) via endpoint **server-side**

## Segurança (importante)
A chave Gemini **não é usada no frontend**.
As recomendações passam por `POST /api/recommendations` e a `GEMINI_API_KEY` fica apenas no servidor.

## Variáveis de ambiente
Copiar `.env.example` e preencher:

### Frontend
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TMDB_API_KEY` (opcional)

### Server-only
- `GEMINI_API_KEY`

## Correr localmente
1. Instalar dependências:
   ```bash
   npm install
   ```
2. Criar `.env` (ou configurar env no provider de deploy).
3. Iniciar:
   ```bash
   npm run dev
   ```

## Deploy (preview/produção)
Recomendado: Vercel.

- `vercel.json` já incluído para suportar:
  - rotas API (`/api/*`)
  - fallback SPA para `index.html`

## Checklist rápida pré-lançamento
- [ ] signup/login/logout OK
- [ ] dashboard carrega sem erros
- [ ] geração de recomendações OK
- [ ] fallback quando API falha (sem crash)
- [ ] env vars de produção configuradas
