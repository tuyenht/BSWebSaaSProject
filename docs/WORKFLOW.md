# Workflow & Publishing System – SaaS Platform

This document describes the content workflow engine, versioning, and publishing process for all content types in the SaaS platform.

---

## 1. Overview

The **Workflow System** ensures safe and auditable content publishing across tenants and roles.

### Goals:
- Allow multi-step publishing (Draft → Pending → Published).
- Role-based permissions for each transition.
- Maintain version history & rollback.
- Provide audit trails for all actions.

---

## 2. States

| State | Description |
|--------|--------------|
| `draft` | Created or edited but not visible publicly. |
| `pending` | Submitted for review. Awaiting approval. |
| `published` | Approved and visible to public. |
| `archived` | Hidden but kept for reference. |

---

## 3. Transition Rules

| From | To | Role Required |
|------|----|----------------|
| `draft` → `pending` | Any editor |
| `pending` → `published` | `siteAdmin` or higher |
| `published` → `archived` | `siteOwner` or `saasAdmin` |
| `archived` → `draft` | `siteAdmin` |

---

## 4. Permissions by Role

| Role | Actions |
|------|----------|
| `siteViewer` | View only published |
| `siteEditor` | Create/edit drafts |
| `siteAdmin` | Approve and publish |
| `siteOwner` | Full access |
| `saasAdmin` | Global override |
| `saasOwner` | Superuser, can bypass workflow |

---

## 5. Implementation in Payload

Each collection includes:

```ts
fields: [
  {
    name: "workflowState",
    type: "select",
    options: ["draft", "pending", "published", "archived"],
    defaultValue: "draft"
  },
  {
    name: "versionNumber",
    type: "number",
    defaultValue: 1
  }
]
```

Hook example:

```ts
export const beforeChange = ({ req, data }) => {
  if (data.workflowState === "published" && !req.user.canPublish) {
    throw new Error("Permission denied");
  }
};
```

---

## 6. Versioning

Enabled via Payload’s built-in version control:

```ts
versions: {
  drafts: true,
  maxPerDoc: 50
}
```

Every change stored as a separate version with metadata:

```json
{
  "id": "ver_123",
  "documentId": "post_456",
  "versionNumber": 3,
  "workflowState": "pending",
  "modifiedBy": "user_789"
}
```

---

## 7. Rollback

Admins can restore older versions:

- From UI: “Restore Previous Version” button.  
- From API: `/api/posts/{id}/versions/{versionId}/restore`

Logs an event in `AuditEvents`.

---

## 8. Workflow Notifications

- Email & in-app notifications on state changes.
- Configurable per site or tenant.
- Example:
  > “Post ‘New Product Launch’ submitted for review.”

---

## 9. Automation Integration

Automations can trigger on workflow transitions:

| Trigger | Action |
|----------|---------|
| `post.pending` | Send review request email |
| `post.published` | Notify marketing team |
| `post.archived` | Trigger data cleanup |

---

## 10. Analytics Integration

Workflow actions counted in metrics:

| Metric | Description |
|---------|-------------|
| `workflow_transitions_total` | Total transitions per day |
| `workflow_pending_total` | Pending items awaiting review |

---

## 11. Security & Compliance

- Only authorized roles can change workflow state.  
- State change events logged in `AuditEvents`.  
- Optional 2FA prompt for publishing.  

---

## 12. Future Enhancements

- Custom workflows (multi-step approvals).  
- Reviewer comments & feedback threads.  
- Time-based publishing (schedule).  
- AI-assisted content review.

---

## 13. Contacts

- **Workflow Lead:** workflow@yourdomain.com  
- **Support:** support@yourdomain.com
