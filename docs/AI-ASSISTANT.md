# AI Assistant Layer – SaaS Platform

This document details the AI Assistant subsystem integrated into the platform for SEO, translation, and content automation.

---

## 1. Overview

The **AI Assistant Layer** provides unified AI-powered functionality across tenants and sites:

- SEO metadata generation.
- Auto content translation.
- Summarization and lead response.
- Content ideation and rewriting.
- Automation actions (`ai.generate`, `ai.translate`, etc.).

---

## 2. Architecture

```
User / Automation → Assistant API Layer → Provider Adapter (OpenAI, Claude, Gemini) → Response
```

Key features:

- Provider-agnostic design (OpenAI, Anthropic, Google).  
- Hybrid API key system (global or per-site).  
- Request caching + token usage tracking.  
- Logging via `AssistantRuns` collection.

---

## 3. Configuration

### Environment variables

```bash
OPENAI_API_KEY=sk-...
ASSISTANT_MODEL=gpt-4.1-mini
ASSISTANT_TIMEOUT=45
```

### Per-site settings (in Payload CMS)

Collection: `AiSettings`

```json
{
  "provider": "openai",
  "apiKey": "sk-site-specific-key",
  "defaultModel": "gpt-4.1-mini",
  "language": ["vi", "en", "ja"]
}
```

If `apiKey` missing, fallback to global key.

---

## 4. API Endpoint

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/api/assistant/query` | Send query or generation request |
| `POST` | `/api/assistant/translate` | Translate text to target locales |
| `POST` | `/api/assistant/seo` | Generate SEO title/desc/keywords |
| `POST` | `/api/assistant/summary` | Summarize text or lead messages |

Example:

```bash
curl -X POST https://app/api/assistant/query   -H "Authorization: Bearer <token>"   -d '{ "prompt": "Write SEO title for product page", "siteId": "123" }'
```

---

## 5. Prompt Schema

Every query follows the structured schema:

```json
{
  "siteId": "abc",
  "locale": "vi",
  "intent": "seo.title",
  "context": "Product: An Vinh CNC Jig",
  "instruction": "Generate a concise SEO title under 60 characters"
}
```

Response:

```json
{
  "result": "High-Precision CNC Jig | An Vinh Engineering",
  "tokensUsed": 37,
  "model": "gpt-4.1-mini"
}
```

---

## 6. AI Actions Integration

These actions map directly to Automation Engine:

| Action | Description |
|---------|-------------|
| `ai.generate` | Generate creative or structured content |
| `ai.translate` | Translate post or page fields |
| `ai.summary` | Summarize content or lead inquiry |
| `ai.reply` | Compose automated replies to leads |

---

## 7. Token Usage Tracking

Every request stores metrics in `UsageRecords`:

| Field | Description |
|--------|--------------|
| `tenantId` | Tenant scope |
| `siteId` | Site scope |
| `tokensUsed` | Total tokens |
| `model` | Model used |
| `costUsd` | Computed from rate |

Used by Billing module for overage detection.

---

## 8. Response Caching

- Hash requests to Redis: `assistant:{hash}`.  
- Cached for 10 minutes for repeated prompts.  
- Automatically skips cache for unique contexts.  

---

## 9. Error Handling & Retries

- Automatic retry up to 2 times on 5xx or timeout.  
- Graceful degradation: fallback to simplified model.  
- Log error trace in `AssistantRuns` collection.  

---

## 10. Model Configuration

Supported providers:

| Provider | Models |
|-----------|---------|
| **OpenAI** | gpt-4.1-mini, gpt-4-turbo, gpt-3.5-turbo |
| **Anthropic** | claude-3, claude-3-haiku |
| **Google** | gemini-1.5-pro |

Configuration hierarchy:

1. Site AiSettings.  
2. Tenant AiSettings (optional).  
3. Global secret trong `env/.env.*` (hoặc secret manager).  

---

## 11. Context Injection

For SEO & content tasks, Assistant automatically enriches the prompt with:

- Site name, brand keywords.  
- Locale tone and writing style.  
- Existing content metadata.  
- Schema.org fields (if any).  

---

## 12. Security

- Sanitizes all prompt inputs.  
- Rate limit per site and per user.  
- No prompt logs stored unless debug mode enabled.  
- All responses pass through `sanitize-html` before saving.  

---

## 13. Metrics

| Metric | Description |
|---------|-------------|
| `assistant_requests_total` | Total AI calls |
| `assistant_tokens_total` | Tokens used |
| `assistant_failures_total` | Errors encountered |

Displayed in Grafana dashboard alongside automation metrics.

---

## 14. Example Workflows

### A. Auto-generate SEO meta when new post published

Trigger: `post.published`  
Action: `ai.seo`  

### B. Translate “News” to all enabled locales

Trigger: `post.published`  
Action: `ai.translate` (`vi` → `en`, `ja`)

### C. Auto-reply to new lead

Trigger: `lead.created`  
Action: `ai.reply`  

---

## 15. Future Enhancements

- Multi-provider ensemble fallback.  
- Local caching & cost optimization.  
- Context persistence for chat-like use.  
- Prompt templating per industry.  
- Fine-tuning model integration (enterprise).  

---

## 16. Contacts

- **AI Lead:** ai@yourdomain.com  
- **Support:** support@yourdomain.com  
- **Monitoring Channel:** #ai-assistant
