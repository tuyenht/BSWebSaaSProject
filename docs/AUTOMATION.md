# Automation Engine – SaaS Platform

This document defines the automation layer that enables dynamic workflows, triggers, and AI-assisted actions across tenants and sites.

---

## 1. Overview

The **Automation Engine** allows non-technical users to automate tasks such as:

- Send notifications on new form leads.
- Run AI-powered content generation.
- Sync data between collections.
- Trigger exports, webhooks, or workflows.

Automations are defined as **rules**: `trigger → condition → action`.

---

## 2. Core Components

| Component | Description |
|------------|-------------|
| **AutomationRule** | Payload collection defining a rule |
| **Trigger Engine** | Detects events and dispatches matching rules |
| **Condition Evaluator** | Validates whether rule conditions match |
| **Action Executor** | Runs the specified action(s) |
| **Scheduler** | Optional job queue for delayed or recurring tasks |

---

## 3. Rule Structure

```json
{
  "id": "auto_123",
  "name": "Notify Sales on New Lead",
  "enabled": true,
  "trigger": "form.submit",
  "condition": {
    "formId": "contact-us"
  },
  "actions": [
    {
      "type": "webhook",
      "url": "https://crm.example.com/webhook/leads"
    },
    {
      "type": "email",
      "to": "sales@yourdomain.com",
      "subject": "New Lead Submitted"
    }
  ]
}
```

---

## 4. Triggers

| Event | Description |
|--------|--------------|
| `form.submit` | When a public form is submitted |
| `lead.created` | When a new lead is saved |
| `post.published` | When content transitions to Published |
| `export.completed` | When a site export finishes |
| `user.login` | When a user logs in |
| `automation.schedule` | Timed or recurring automation |
| `assistant.response` | When AI assistant finishes a task |

Triggers are emitted by internal hooks or background jobs.

---

## 5. Conditions

Conditions are optional filters to limit automation scope.

Examples:

```json
{ "siteId": "abc123" }
{ "locale": "vi" }
{ "role": "siteAdmin" }
{ "formId": "contact" }
{ "contains": { "field": "message", "keyword": "urgent" } }
```

---

## 6. Actions

Available action types:

| Type | Description |
|------|--------------|
| `email` | Send templated email |
| `webhook` | POST JSON payload to URL |
| `ai.generate` | Generate AI content via Assistant API |
| `ai.translate` | Translate text between locales |
| `export.run` | Run site export job |
| `db.update` | Modify specific record(s) |
| `notify` | Send in-app notification |
| `log` | Append structured log entry |

Actions can run sequentially or in parallel.

---

## 7. Execution Flow

```
1. Trigger event occurs (e.g., form.submit)
2. Engine fetches enabled rules for trigger
3. Evaluate conditions
4. Execute all actions (parallel async)
5. Record automation run in AuditEvents
```

---

## 8. Automation UI (Admin)

Location: `Admin > Automations`

- Create/edit rules via visual builder.
- Choose trigger from dropdown.
- Add conditional filters (JSON or form UI).
- Configure multiple actions.
- Enable/disable per rule.

Each automation run is logged for review.

---

## 9. API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/api/automations` | List automations |
| `POST` | `/api/automations/run` | Run manually |
| `POST` | `/api/automations/test` | Test rule with mock payload |

---

## 10. Background Jobs

Some automations run asynchronously using Payload background jobs.

Example:

```js
payload.jobs.add({
  name: "automation-run",
  data: { ruleId, triggerData },
});
```

Jobs support retries and delayed execution.

---

## 11. AI Integration

Actions `ai.generate`, `ai.translate`, and `ai.summary` directly call the **Assistant API layer**.

- Supports per-site or global OpenAI key.
- Logs tokens usage to `UsageRecords`.
- Automatically handles fallback and error recovery.

---

## 12. Security & Limits

- Rules scoped per tenant.
- Rate limit on automation executions per minute.
- Prevent recursive rule calls (loop protection).
- Actions run in sandboxed context (no untrusted code).

---

## 13. Monitoring

- Each automation run logged in `AuditEvents`.
- Metrics exposed: `automation_runs_total`, `automation_failures_total`.
- Grafana dashboard includes success/failure ratio.

---

## 14. Example Use Cases

### A. Send Slack message when new lead created

```json
{
  "trigger": "lead.created",
  "actions": [
    {
      "type": "webhook",
      "url": "https://hooks.slack.com/...",
      "payload": {
        "text": "New lead from {{lead.name}}"
      }
    }
  ]
}
```

### B. Auto-translate new posts

```json
{
  "trigger": "post.published",
  "actions": [
    {
      "type": "ai.translate",
      "from": "vi",
      "to": ["en", "ja"]
    }
  ]
}
```

---

## 15. Future Enhancements

- Visual workflow builder with drag-drop nodes.  
- Conditional branching (if/else).  
- Loop iteration over dataset.  
- Retry/backoff strategies.  
- Audit replay for debugging.  

---

## 16. Contacts

- **Automation Lead:** automation@yourdomain.com  
- **Support:** support@yourdomain.com
