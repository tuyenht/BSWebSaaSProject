# AI-SEARCH-STRATEGY.md (v1.0 – AI-First Search & Indexing)

## Purpose
This document defines how the platform optimizes content for **AI-powered search systems**:
- Google AI Overview / SGE
- Bing Copilot
- Perplexity
- ChatGPT / Claude (Browse)
- Other LLM-based retrieval systems

Goal:
- Ensure pages are **understood, indexed, and cited** by AI systems
- Complement traditional SEO with **semantic & entity-first optimization**

---

## Core Principles

### 1. Semantic > Keywords
AI systems prioritize:
- Clear definitions
- Explicit relationships
- Independent, quote-ready sections

Keywords are supportive, not primary.

---

### 2. One Page = One Primary Topic
- Each page targets a single primary concept
- Subsections answer specific questions about that concept
- Avoid mixed intent pages

---

### 3. Quote-Ready Sections
AI prefers sections that:
- Are 1–3 sentences long
- Contain a clear subject and predicate
- Can be extracted without additional context

---

## Mandatory Content Structure (Public Pages)

Each public page MUST contain:
1. H1 (single)
2. AI Definition (summary)
3. Key Facts (bullet list)
4. Main sections (H2/H3)
5. FAQ (where applicable)
6. Structured data (schema.org)

Pages missing (2) or (6) MUST NOT be published.

---

## Heading & Section Rules
- H1: page topic only
- H2: core questions or aspects
- H3: detailed answers or steps
- No decorative headings

---

## Structured Data Strategy

Required schemas by page type:
- Homepage: Organization / LocalBusiness
- Service page: Service + FAQPage + HowTo
- Article/Guide: Article + FAQPage
- Project/Case: Article + BreadcrumbList

Structured data MUST:
- Match visible content
- Be rendered server-side
- Avoid spam or duplication

---

## Entity Strategy

Each site defines its own entity:
- Organization name
- Logo
- Address
- Contact info
- Social profiles (sameAs)

Entity data must be:
- Consistent across pages
- Isolated per domain/site
- Reflected in JSON-LD

---

## Anti-Abuse Rules (Critical)

Forbidden:
- Mass AI-generated pages without human review
- Thin or duplicate content
- Keyword stuffing for AI prompts
- Hidden AI-only text

Allowed:
- AI-assisted drafting
- Human-edited summaries and FAQs

---

## Measurement & Validation

Success indicators:
- AI Overviews citing page sections
- Increased long-tail impressions
- FAQ-rich results appearance
- Improved crawl efficiency

---

## Operational Checklist
- [ ] Summary present and concise
- [ ] Key facts exist
- [ ] FAQ validated
- [ ] JSON-LD valid
- [ ] Canonical correct
- [ ] SSR content visible

---