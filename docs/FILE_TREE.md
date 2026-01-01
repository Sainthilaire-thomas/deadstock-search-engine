# Project File Tree

**Generated:** 2026-01-01 11:00:50

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Files | 92 |
| Total Directories | 2407 |
| TypeScript Files | 34 |
| JavaScript Files | 0 |
| Markdown Files | 38 |
| SQL Files | 8 |
| JSON Files | 4 |
| Other Files | 8 |

---

## Complete File Tree

```
deadstock-search-engine/
|-- .env.local |-- .gitignore |-- eslint.config.mjs |-- GUIDE_DEMARRAGE.md |-- next.config.ts |-- next-env.d.ts |-- package.json |-- package-lock.json |-- postcss.config.mjs |-- README.md |-- tsconfig.json |-- tsconfig.tsbuildinfo |-- .vscode/ |   +-- tasks.json |-- database/ |   |-- DATABASE_ARCHITECTURE.md |   |-- schema.sql |   |-- USAGE_GUIDE.md |   |-- migrations/ |   |   |-- 001_initial_schema.sql |   |   |-- 004_dictionary_mappings_table.sql |   |   |-- 007_admin_scraping_system.sql |   |   |-- 008_add_currency_to_textiles.sql |   |   |-- 009_clean_dictionary_schema.sql |   |   |-- 010_add_normalization_metadata.sql |   |   +-- MIGRATIONS.md |   +-- seeds/ |       +-- enrich_dictionaries.sql |-- docs/ |   |-- FILE_TREE.md |   |-- README.md |   |-- ai_context/ |   |   |-- CONTEXT_SUMMARY.md |   |   +-- NEXT_STEPS.md |   |-- decisions/ |   |   |-- ADR_001_database_architecture.md |   |   |-- ADR_002_normalization_english_i18n.md |   |   |-- ADR_003_multi_project_architecture.md |   |   |-- ADR_004_normalization_tuning_system.md |   |   |-- ADR_005_light_ddd_architecture.md |   |   |-- ADR_006_product_context_enrichment.md |   |   |-- ADR_007_adapter_pattern_scrapers.md |   |   |-- ADR_008_intelligent_data_extraction.md |   |   |-- ADR_009_internationalization_strategy.md |   |   |-- ADR_010_dynamic_attribute_system.md |   |   |-- ADR_011_admin_driven_scraping_strategy.md |   |   |-- ADR_012_STOPWORDS_FILTER.md |   |   |-- ADR_TEMPLATE.md |   |   +-- ARCHITECTURE_DECISION_SUMMARY.md |   |-- project/ |   |   |-- PHASES.md |   |   |-- PHASES_V2.md |   |   |-- PRODUCT_VISION.md |   |   |-- PROJECT_OVERVIEW.md |   |   |-- RECAP_MISE_A_JOUR_DOCS.md |   |   +-- SCRAPING_PLAN.md |   |-- sessions/ |   |   |-- SESSION_2024-12-28_architecture-ddd-interface-admin.md |   |   |-- SESSION_3_NORMALIZATION_SUCCESS.md |   |   |-- SESSION_3_PLAN.md |   |   |-- SESSION_NOTE_2025-12-27.md |   |   |-- SESSION_NOTES_2024-12-28.md |   |   +-- SESSION_NOTES_2024-12-28_PART2.md |   |-- state/ |   |   |-- CURRENT_STATE.md |   |   +-- TECH_STACK.md |   +-- technical/ |       +-- TUNING_SYSTEM.md |-- scripts/ |   |-- analyze-unknowns.ts |   |-- generate-file-tree.ps1 |   |-- load-env.ts |   |-- scrape-mlc-to-db.ts |   |-- scrape-tfs-to-db.ts |   |-- test-mlc.ts |   |-- test-scrape.ts |   +-- admin/ |       |-- discover-site.ts |       |-- preview-scraping.ts |       +-- scrape-site.ts +-- src/     |-- app/     |   |-- favicon.ico     |   |-- globals.css     |   |-- layout.tsx     |   |-- page.tsx     |   |-- admin/     |   |   +-- tuning/     |   |       |-- actions.ts     |   |       |-- page.tsx     |   |       +-- components/     |   |           +-- UnknownsList.tsx     |   +-- textiles/     |       +-- page.tsx     |-- features/     |   |-- admin/     |   |   |-- infrastructure/     |   |   |   |-- discoveryRepo.ts     |   |   |   +-- scrapingRepo.ts     |   |   |-- services/     |   |   |   |-- discoveryService.ts     |   |   |   +-- scrapingService.ts     |   |   +-- utils/     |   |       +-- extractTerms.ts     |   |-- normalization/     |   |   |-- application/     |   |   |   +-- normalizeTextile.ts     |   |   |-- domain/     |   |   |   +-- ValueObjects.ts     |   |   +-- infrastructure/     |   |       +-- normalizationService.ts     |   +-- tuning/     |       |-- application/     |       |   |-- approveMapping.ts     |       |   |-- getUnknowns.ts     |       |   +-- rejectUnknown.ts     |       |-- domain/     |       |   |-- DictionaryMapping.ts     |       |   |-- types.ts     |       |   +-- UnknownTerm.ts     |       +-- infrastructure/     |           |-- dictionaryRepo.ts     |           +-- unknownsRepo.ts     +-- lib/         +-- supabase/             +-- client.ts
```

---

## TypeScript Files by Feature

### Feature: `admin`

- `/src/features/admin/infrastructure/discoveryRepo.ts`
- `/src/features/admin/infrastructure/scrapingRepo.ts`
- `/src/features/admin/services/discoveryService.ts`
- `/src/features/admin/services/scrapingService.ts`
- `/src/features/admin/utils/extractTerms.ts`

### Feature: `normalization`

- `/src/features/normalization/application/normalizeTextile.ts`
- `/src/features/normalization/domain/ValueObjects.ts`
- `/src/features/normalization/infrastructure/normalizationService.ts`

### Feature: `tuning`

- `/src/features/tuning/application/approveMapping.ts`
- `/src/features/tuning/application/getUnknowns.ts`
- `/src/features/tuning/application/rejectUnknown.ts`
- `/src/features/tuning/domain/DictionaryMapping.ts`
- `/src/features/tuning/domain/types.ts`
- `/src/features/tuning/domain/UnknownTerm.ts`
- `/src/features/tuning/infrastructure/dictionaryRepo.ts`
- `/src/features/tuning/infrastructure/unknownsRepo.ts`

---

## Database Files

### Migrations

- `001_initial_schema.sql`
- `004_dictionary_mappings_table.sql`
- `007_admin_scraping_system.sql`
- `008_add_currency_to_textiles.sql`
- `009_clean_dictionary_schema.sql`
- `010_add_normalization_metadata.sql`

### Seeds

- `enrich_dictionaries.sql`

---

## Configuration Files

- `package.json` [EXISTS]
- `tsconfig.json` [EXISTS]
- `next.config.js` [MISSING]
- `.env.example` [MISSING]
- `tailwind.config.ts` [MISSING]

---

## Last Updated

**Date:** 2026-01-01 11:01:02

**Command to regenerate:**
```powershell
npm run docs:tree
```

Or manually:
```powershell
.\scripts\generate-file-tree.ps1
```

---

**Note:** This file is auto-generated. Do not edit manually.

