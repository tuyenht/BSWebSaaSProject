# CONTENT-SCHEMA-AI.md (v1.0 – AI-Ready Content Models)

## Purpose
Define CMS content schemas that:
- Support AI-first indexing
- Map cleanly to HTML and JSON-LD
- Enforce quality via publish gates

---

## Page Schema (Generic)

Page {
  title                // H1
  slug
  summary              // AI definition (required)
  keyFacts[]           // Bullet facts
  contentBlocks[]      // Visual/UI blocks
  faqs[]               // Question & Answer
  internalLinks[]      // Entity graph
  seo {
    title
    description
    canonical
  }
  schemaHints {
    type                // Service | Article | AboutPage
  }
  status                // draft | published
}

Publish rule:
- summary required
- seo.title & seo.description required

---

## Service Schema

Service {
  name
  summary
  technologies[]
  industries[]
  processSteps[]
  advantages[]
  faqs[]
}

JSON-LD mapping:
- Service
- HowTo (processSteps)
- FAQPage (faqs)

---

## Project / Case Schema

Project {
  name
  summary
  problem
  solution
  result
  technologies[]
}

JSON-LD mapping:
- Article
- BreadcrumbList

---

## Media Schema (AI-Safe)

Media {
  file
  alt                 // Required for featured/hero
  caption
  credit
}

Rules:
- ALT required for hero images
- ALT must describe content, not keywords

---

## Publish Gates (Mandatory)

A page CANNOT be published if:
- summary is missing
- summary > 3 sentences
- hero image has no ALT
- structured data type is undefined

---

## Rendering Rules

Frontend MUST:
- Render summary as visible text
- Render keyFacts as <ul>
- Render FAQs as visible Q/A
- Inject JSON-LD server-side

---

## Benefits
- AI systems can parse content as data
- Pages are citation-ready
- SEO quality enforced at CMS level

---