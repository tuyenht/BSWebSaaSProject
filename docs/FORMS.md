# Form Builder & Lead Management – SaaS Platform

This document explains how the form system, lead storage, and automation hooks function in the SaaS platform.

---

## 1. Overview

The **Form Builder** lets each tenant/site create dynamic forms for:

- Contact, quote, recruitment, or custom use.  
- Storing leads centrally.  
- Triggering automation actions (webhooks, AI replies).

---

## 2. Data Model

Collections:

| Collection | Description |
|-------------|--------------|
| **Forms** | Form definitions (schema, settings, recipients). |
| **Leads** | Submissions from users (linked to form + site). |

---

## 3. Form Definition

Example document in `Forms` collection:

```json
{
  "name": "Contact Form",
  "fields": [
    { "name": "name", "type": "text", "required": true },
    { "name": "email", "type": "email", "required": true },
    { "name": "message", "type": "textarea", "required": true }
  ],
  "actions": ["saveLead", "notifyEmail"],
  "recipients": ["sales@yourdomain.com"]
}
```

---

## 4. Field Types

| Type | Description |
|-------|-------------|
| `text` | Single-line text |
| `textarea` | Multi-line input |
| `email` | Validated email field |
| `select` | Dropdown choices |
| `checkbox` | Boolean field |
| `file` | Uploads (validated MIME) |
| `date` | Date picker |

---

## 5. Validation Rules

- Required field check.  
- Email pattern validation.  
- File MIME & size limit.  
- Honeypot anti-spam field.  
- Rate limiting per IP.  

---

## 6. Submissions

POST `/api/forms/submit`

Example:

```bash
curl -X POST https://app/api/forms/submit   -d '{ "formId": "contact", "data": { "name": "Tuyen", "email": "test@demo.com", "message": "Hello" } }'
```

Response:

```json
{ "status": "success", "leadId": "lead_123" }
```

---

## 7. Lead Storage

Each submission stored in `Leads` collection:

```json
{
  "formId": "contact",
  "siteId": "abc123",
  "tenantId": "t5g",
  "data": { "name": "Tuyen", "email": "test@demo.com", "message": "Hello" },
  "status": "new"
}
```

Leads can be marked as `new`, `processing`, `completed`, or `failed`.

---

## 8. Notifications

On submission:
- Email sent to recipients.
- Webhook triggered if defined.
- In-app notification logged.

Example email:

```
Subject: New Contact Lead from An Vinh Website
Body:
Name: Tuyen
Email: test@demo.com
Message: Hello
```

---

## 9. Automation Integration

Each submission can trigger an automation rule:

| Trigger | Description |
|----------|-------------|
| `form.submit` | Run Automation Rules (webhook, email, AI reply) |

Example:

```json
{
  "trigger": "form.submit",
  "actions": [
    { "type": "ai.reply", "template": "Cảm ơn bạn đã liên hệ." }
  ]
}
```

---

## 10. AI Assistant Integration

AI can respond automatically:

```json
{
  "trigger": "lead.created",
  "actions": [
    { "type": "ai.summary" },
    { "type": "ai.reply", "language": "vi" }
  ]
}
```

Assistant composes response using lead data and site tone.

---

## 11. Security

- Rate limit per IP.  
- Honeypot field prevents bots.  
- ReCAPTCHA optional.  
- Files validated for MIME type.  
- Leads anonymized after X days (optional).  

---

## 12. Monitoring

Metrics under `/metrics`:

| Metric | Description |
|---------|-------------|
| `form_submissions_total` | Total form submissions |
| `form_failures_total` | Failed submissions |
| `lead_created_total` | Leads successfully saved |

---

## 13. Data Retention

| Data | Retention |
|------|------------|
| Leads | 12 months (configurable) |
| Form definitions | Persistent |
| Automation logs | 90 days |

---

## 14. Future Enhancements

- Visual form builder UI.  
- Drag & drop field editor.  
- Lead scoring.  
- CRM integration (HubSpot, Zoho).  
- Form analytics dashboard.

---

## 15. Contacts

- **Form Lead:** forms@yourdomain.com  
- **Automation Support:** automation@yourdomain.com
