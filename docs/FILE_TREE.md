# Project File Tree

**Generated:** 2026-01-09 10:45:06

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Files | 286 |
| Total Directories | 3239 |
| TypeScript Files | 164 |
| JavaScript Files | 0 |
| Markdown Files | 86 |
| SQL Files | 22 |
| JSON Files | 5 |
| Other Files | 9 |

---

## Complete File Tree

```
deadstock-search-engine/
|-- .env.local |-- .gitignore |-- components.json |-- eslint.config.mjs |-- GUIDE_DEMARRAGE.md |-- next.config.ts |-- next-env.d.ts |-- package.json |-- package-lock.json |-- postcss.config.mjs |-- README.md |-- tailwind.config.ts |-- tsconfig.json |-- tsconfig.tsbuildinfo |-- .vscode/ |   +-- tasks.json |-- database/ |   |-- DATABASE_ARCHITECTURE.md |   |-- schema.sql |   |-- USAGE_GUIDE.md |   |-- migrations/ |   |   |-- 001_initial_schema.sql |   |   |-- 004_dictionary_mappings_table.sql |   |   |-- 007_admin_scraping_system.sql |   |   |-- 008_add_currency_to_textiles.sql |   |   |-- 009_clean_dictionary_schema.sql |   |   |-- 010_add_normalization_metadata.sql |   |   |-- 011_add_favorites_table.sql |   |   |-- 012_enable_rls_favorites.sql |   |   |-- 013_grant_favorites_permissions.sql |   |   |-- 014_create_projects_table.sql |   |   |-- 015_create_boards_tables.sql |   |   |-- 016_add_crystallization_columns.sql |   |   |-- 017_create_imported_patterns.sql |   |   |-- 018_add_site_id_to_textiles.sql |   |   |-- 019_add_extraction_patterns.sql |   |   |-- 020_migrate_legacy_to_textile_attributes.sql |   |   |-- 021_create_textiles_search_materialized_view.sql |   |   |-- 022_create_refresh_function.sql |   |   |-- 025_add_sale_type.sql |   |   |-- 026_fix_nona_source_variants.sql |   |   +-- MIGRATIONS.md |   +-- seeds/ |       +-- enrich_dictionaries.sql |-- docs/ |   |-- FILE_TREE.md |   |-- README.md |   |-- ai_context/ |   |   |-- CONTEXT_SUMMARY.md |   |   |-- NEXT_STEPS.md |   |   +-- NEXT_STEPS_MVP_DEMO.md |   |-- decisions/ |   |   |-- ADR_001_database_architecture.md |   |   |-- ADR_002_normalization_english_i18n.md |   |   |-- ADR_003_multi_project_architecture.md |   |   |-- ADR_004_normalization_tuning_system.md |   |   |-- ADR_005_light_ddd_architecture.md |   |   |-- ADR_006_product_context_enrichment.md |   |   |-- ADR_007_adapter_pattern_scrapers.md |   |   |-- ADR_008_intelligent_data_extraction.md |   |   |-- ADR_009_internationalization_strategy.md |   |   |-- ADR_010_dynamic_attribute_system.md |   |   |-- ADR_011_admin_driven_scraping_strategy.md |   |   |-- ADR_012_STOPWORDS_FILTER.md |   |   |-- ADR_013_ADMIN_SERVICE_ROLE.md |   |   |-- ADR_014_TYPESCRIPT_TYPES.md |   |   |-- ADR_015_CONFIGURE_UX.md |   |   |-- ADR_016_BOARD_ARCHITECTURE.md |   |   |-- ADR_017_UNIFIED_REPOSITORIES.md |   |   |-- ADR_018_CRYSTALLIZATION_RULES.md |   |   |-- ADR_020_SCRAPER_SOURCE_LOCALE.md |   |   |-- ADR_021_EXTRACTION_PATTERNS_SYSTEM.md |   |   |-- ADR_022_DEMAND_DRIVEN_INDEXATION.md |   |   |-- ADR_023_SCRAPING_NORMALIZATION_INTEGRATION.md |   |   |-- ADR_024_TEXTILE_STANDARD_SYSTEM.md |   |   |-- ADR_024_UPDATE_SALE_TYPE.md |   |   |-- ADR_025_ADMIN_ARCHITECTURE_CLARIFICATION.md |   |   |-- ADR_TEMPLATE.md |   |   +-- ARCHITECTURE_DECISION_SUMMARY.md |   |-- market/ |   |   |-- ANALYSE_CONCURRENTIELLE.md |   |   +-- ANALYSE_OUTILS_CALCUL_METRAGE.md |   |-- project/ |   |   |-- ARCHITECTURE_3_LEVEL_SEARCH.md |   |   |-- PHASES.md |   |   |-- PHASES_V2.md |   |   |-- PRODUCT_VISION.md |   |   |-- PRODUCT_VISION_V2.1.md |   |   |-- PROJECT_OVERVIEW.md |   |   |-- RECAP_MISE_A_JOUR_DOCS.md |   |   +-- SCRAPING_PLAN.md |   |-- sessions/ |   |   |-- SESSION_10_JOURNEY_MODULE.md |   |   |-- SESSION_11_BRAINSTORM_UX.md |   |   |-- SESSION_12_BOARD_MODULE.md |   |   |-- SESSION_13_FAVORITES_SELECTOR.md |   |   |-- SESSION_14_FAVORITES_RESIZE_CRISTALLISATION.md |   |   |-- SESSION_15_CRYSTALLIZATION_IMPLEMENTATION.md |   |   |-- SESSION_16_ADMIN_TUNING_LOCALE.md |   |   |-- SESSION_17_EXTRACTION_PATTERNS.md |   |   |-- SESSION_18_TEXTILE_STANDARD_SYSTEM.md |   |   |-- SESSION_19_DYNAMIC_FILTERS.md |   |   |-- SESSION_2024-12-28_architecture-ddd-interface-admin.md |   |   |-- SESSION_3_NORMALIZATION_SUCCESS.md |   |   |-- SESSION_3_PLAN.md |   |   |-- SESSION_4_STRATEGIC_PIVOT.md |   |   |-- SESSION_7_FAVORITES_SYSTEM.md |   |   |-- SESSION_8_ADMIN_MODULE_COMPLETE.md |   |   |-- SESSION_9_SCRAPING_PIPELINE_COMPLETE.md |   |   |-- SESSION_NOTE_2025-12-27.md |   |   |-- SESSION_NOTES_2024-12-28.md |   |   +-- SESSION_NOTES_2024-12-28_PART2.md |   |-- specs/ |   |   |-- SPEC_ADMIN_DATA_TUNING_COMPLETE.md |   |   |-- SPEC_ADMIN_DATA_TUNING_V3.md |   |   |-- SPEC_DEMAND_DRIVEN_INDEXATION.md |   |   |-- SPEC_DESIGN_SYSTEM_PARCOURS.md |   |   |-- SPEC_JOURNEY_UI_AMBITIEUSE.md |   |   |-- SPEC_MODULE_ADMIN.md |   |   |-- SPEC_MODULE_RECHERCHE_DESIGNER.md |   |   |-- SPEC_PATTERN_IMPORT.md |   |   |-- SYNTHESE_DONNEES_DESIGNER (1).md |   |   +-- board/ |   |       |-- ARCHITECTURE_UX_BOARD_REALISATION.md |   |       |-- GLOSSAIRE.md |   |       |-- MIGRATION_JOURNEY_TO_BOARD.md |   |       |-- SPEC_BOARD_MODULE.md |   |       |-- SPEC_CRISTALLISATION.md |   |       +-- color_palette/ |   |           +-- SPEC_COLOR_PALETTE.md |   |-- state/ |   |   |-- CURRENT_STATE.md |   |   |-- CURRENT_STATE_UPDATED.md |   |   +-- TECH_STACK.md |   +-- technical/ |       +-- TUNING_SYSTEM.md |-- scripts/ |   |-- analyze-unknowns.ts |   |-- generate-file-tree.ps1 |   |-- load-env.ts |   |-- scrape-mlc-to-db.ts |   |-- scrape-tfs-to-db.ts |   |-- test-mlc.ts |   |-- test-scrape.ts |   +-- admin/ |       |-- discover-site.ts |       |-- preview-scraping.ts |       +-- scrape-site.ts +-- src/     |-- app/     |   |-- favicon.ico     |   |-- globals.css     |   |-- layout.tsx     |   |-- (main)/     |   |   |-- layout.tsx     |   |   |-- page.tsx     |   |   |-- boards/     |   |   |   |-- page.tsx     |   |   |   +-- [boardId]/     |   |   |-- favorites/     |   |   |   |-- page.tsx     |   |   |   +-- [id]/     |   |   |-- journey/     |   |   |   |-- page.tsx     |   |   |   |-- [projectId]/     |   |   |   +-- new/     |   |   |       +-- page.tsx     |   |   |-- search/     |   |   |   +-- page.tsx     |   |   |-- textiles/     |   |   |   +-- page.tsx     |   |   +-- tools/     |   |       +-- yardage-calculator/     |   |-- admin/     |   |   |-- layout.tsx     |   |   |-- page.tsx     |   |   |-- demands/     |   |   |   +-- page.tsx     |   |   |-- dictionary/     |   |   |   +-- page.tsx     |   |   |-- discovery/     |   |   |   |-- page.tsx     |   |   |   +-- [siteSlug]/     |   |   |-- jobs/     |   |   |   |-- page.tsx     |   |   |   +-- [id]/     |   |   |-- scraping/     |   |   |   +-- page.tsx     |   |   |-- sites/     |   |   |   |-- page.tsx     |   |   |   |-- [id]/     |   |   |   +-- new/     |   |   |       +-- page.tsx     |   |   +-- tuning/     |   |       |-- actions.ts     |   |       |-- page.tsx     |   |       |-- components/     |   |       |   +-- UnknownsList.tsx     |   |       +-- quality/     |   |           +-- page.tsx     |   +-- api/     |       +-- search/     |           +-- route.ts     |-- components/     |   |-- search/     |   |   |-- Filters.tsx     |   |   |-- SearchBar.tsx     |   |   |-- SearchInterface.tsx     |   |   |-- TextileGrid.tsx     |   |   +-- YardageFilterBadge.tsx     |   |-- textile/     |   |-- theme/     |   |   |-- ThemeProvider.tsx     |   |   +-- ThemeToggle.tsx     |   +-- ui/     |       |-- badge.tsx     |       |-- button.tsx     |       |-- card.tsx     |       |-- checkbox.tsx     |       |-- command.tsx     |       |-- dialog.tsx     |       |-- dropdown-menu.tsx     |       |-- form.tsx     |       |-- input.tsx     |       |-- label.tsx     |       |-- popover.tsx     |       |-- progress.tsx     |       |-- select.tsx     |       |-- separator.tsx     |       |-- sheet.tsx     |       |-- skeleton.tsx     |       |-- slider.tsx     |       |-- sonner.tsx     |       |-- table.tsx     |       |-- tabs.tsx     |       |-- textarea.tsx     |       +-- tooltip.tsx     |-- domains/     |   +-- pattern/     |       +-- constants/     |-- features/     |   |-- admin/     |   |   |-- application/     |   |   |   |-- actions.ts     |   |   |   +-- queries.ts     |   |   |-- components/     |   |   |   |-- AddSiteForm.tsx     |   |   |   |-- AdminSidebar.tsx     |   |   |   |-- ExtractionPatternsCard.tsx     |   |   |   |-- PreviewModal.tsx     |   |   |   |-- ScrapingConfigForm.tsx     |   |   |   |-- SiteActions.tsx     |   |   |   +-- SiteAnalysisCard.tsx     |   |   |-- config/     |   |   |   +-- navigation.ts     |   |   |-- domain/     |   |   |   +-- types.ts     |   |   |-- hooks/     |   |   |   +-- useAdminNavigation.ts     |   |   |-- infrastructure/     |   |   |   |-- discoveryRepo.ts     |   |   |   |-- jobsRepo.ts     |   |   |   |-- scrapingRepo.ts     |   |   |   +-- sitesRepo.ts     |   |   |-- services/     |   |   |   |-- discoveryService.ts     |   |   |   |-- extractionPatternDetector.ts     |   |   |   |-- extractionService.ts     |   |   |   +-- scrapingService.ts     |   |   +-- utils/     |   |       |-- extractTerms.ts     |   |       +-- variantAnalyzer.ts     |   |-- boards/     |   |   |-- actions/     |   |   |   |-- boardActions.ts     |   |   |   |-- crystallizationActions.ts     |   |   |   |-- elementActions.ts     |   |   |   +-- zoneActions.ts     |   |   |-- components/     |   |   |   |-- AddToBoardButton.tsx     |   |   |   |-- BoardCanvas.tsx     |   |   |   |-- BoardHeader.tsx     |   |   |   |-- BoardToolPanel.tsx     |   |   |   |-- CrystallizationDialog.tsx     |   |   |   |-- ElementCard.tsx     |   |   |   |-- FavoritesSelector.tsx     |   |   |   |-- NoteEditor.tsx     |   |   |   +-- ZoneCard.tsx     |   |   |-- context/     |   |   |   +-- BoardContext.tsx     |   |   |-- domain/     |   |   |   +-- types.ts     |   |   +-- infrastructure/     |   |       |-- boardsRepository.ts     |   |       |-- elementsRepository.ts     |   |       +-- zonesRepository.ts     |   |-- favorites/     |   |   |-- actions/     |   |   |   +-- favoriteActions.ts     |   |   |-- components/     |   |   |   |-- FavoriteButton.tsx     |   |   |   |-- FavoriteDetailView.tsx     |   |   |   |-- FavoritesCountBadge.tsx     |   |   |   +-- FavoritesGrid.tsx     |   |   |-- context/     |   |   |   +-- FavoritesContext.tsx     |   |   |-- domain/     |   |   |   +-- types.ts     |   |   |-- infrastructure/     |   |   |   +-- favoritesRepository.ts     |   |   +-- utils/     |   |       +-- sessionManager.ts     |   |-- journey/     |   |   |-- actions/     |   |   |   +-- projectActions.ts     |   |   |-- components/     |   |   |   |-- MobileJourneyNav.tsx     |   |   |   |-- Sidebar.tsx     |   |   |   +-- SidebarStep.tsx     |   |   |-- config/     |   |   |   |-- garments.ts     |   |   |   +-- steps.ts     |   |   |-- context/     |   |   |   +-- ProjectContext.tsx     |   |   |-- domain/     |   |   |   +-- types.ts     |   |   |-- infrastructure/     |   |   |   +-- projectsRepository.ts     |   |   +-- services/     |   |       +-- yardageCalculator.ts     |   |-- normalization/     |   |   |-- application/     |   |   |   +-- normalizeTextile.ts     |   |   |-- domain/     |   |   |   +-- ValueObjects.ts     |   |   +-- infrastructure/     |   |       +-- normalizationService.ts     |   |-- pattern/     |   |   |-- index.ts     |   |   |-- actions/     |   |   |-- application/     |   |   |   +-- calculateYardage.ts     |   |   |-- components/     |   |   |   |-- ManualPatternForm.tsx     |   |   |   |-- PatternCalculationCard.tsx     |   |   |   |-- PatternConfigForm.tsx     |   |   |   |-- PatternImportModal.tsx     |   |   |   +-- YardageResult.tsx     |   |   |-- domain/     |   |   |   |-- garmentFormulas.ts     |   |   |   +-- types.ts     |   |   +-- infrastructure/     |   |       +-- patternRepository.ts     |   |-- search/     |   |   |-- application/     |   |   |   +-- searchTextiles.ts     |   |   |-- domain/     |   |   |   +-- types.ts     |   |   +-- infrastructure/     |   |       +-- textileRepository.ts     |   +-- tuning/     |       |-- application/     |       |   |-- approveMapping.ts     |       |   |-- getUnknowns.ts     |       |   +-- rejectUnknown.ts     |       |-- domain/     |       |   |-- DictionaryMapping.ts     |       |   |-- types.ts     |       |   +-- UnknownTerm.ts     |       +-- infrastructure/     |           |-- dictionaryRepo.ts     |           +-- unknownsRepo.ts     |-- lib/     |   |-- utils.ts     |   +-- supabase/     |       |-- admin.ts     |       |-- client.ts     |       +-- server.ts     |-- styles/     |   +-- design-tokens.css     +-- types/         +-- database.types.ts
```

---

## TypeScript Files by Feature

### Feature: `admin`

- `/src/features/admin/application/actions.ts`
- `/src/features/admin/application/queries.ts`
- `/src/features/admin/config/navigation.ts`
- `/src/features/admin/domain/types.ts`
- `/src/features/admin/hooks/useAdminNavigation.ts`
- `/src/features/admin/infrastructure/discoveryRepo.ts`
- `/src/features/admin/infrastructure/jobsRepo.ts`
- `/src/features/admin/infrastructure/scrapingRepo.ts`
- `/src/features/admin/infrastructure/sitesRepo.ts`
- `/src/features/admin/services/discoveryService.ts`
- `/src/features/admin/services/extractionPatternDetector.ts`
- `/src/features/admin/services/extractionService.ts`
- `/src/features/admin/services/scrapingService.ts`
- `/src/features/admin/utils/extractTerms.ts`
- `/src/features/admin/utils/variantAnalyzer.ts`

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
- `011_add_favorites_table.sql`
- `012_enable_rls_favorites.sql`
- `013_grant_favorites_permissions.sql`
- `014_create_projects_table.sql`
- `015_create_boards_tables.sql`
- `016_add_crystallization_columns.sql`
- `017_create_imported_patterns.sql`
- `018_add_site_id_to_textiles.sql`
- `019_add_extraction_patterns.sql`
- `020_migrate_legacy_to_textile_attributes.sql`
- `021_create_textiles_search_materialized_view.sql`
- `022_create_refresh_function.sql`
- `025_add_sale_type.sql`
- `026_fix_nona_source_variants.sql`

### Seeds

- `enrich_dictionaries.sql`

---

## Configuration Files

- `package.json` [EXISTS]
- `tsconfig.json` [EXISTS]
- `next.config.js` [MISSING]
- `.env.example` [MISSING]
- `tailwind.config.ts` [EXISTS]

---

## Last Updated

**Date:** 2026-01-09 10:45:14

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

