# Project File Tree

**Generated:** 2026-01-27 18:06:10

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Files | 435 |
| Total Directories | 145 |
| TypeScript Files (.ts/.tsx) | 243 |
| JavaScript Files (.js/.jsx) | 0 |
| Markdown Files (.md) | 145 |
| SQL Files (.sql) | 29 |
| JSON Files (.json) | 7 |
| CSS Files (.css) | 2 |
| Other Files | 9 |

---

## Complete File Tree

```
deadstock-search-engine/
|-- .vscode/
|   +-- tasks.json
|-- database/
|   |-- migrations/
|   |   |-- 001_initial_schema.sql
|   |   |-- 004_dictionary_mappings_table.sql
|   |   |-- 007_admin_scraping_system.sql
|   |   |-- 008_add_currency_to_textiles.sql
|   |   |-- 009_clean_dictionary_schema.sql
|   |   |-- 010_add_normalization_metadata.sql
|   |   |-- 011_add_favorites_table.sql
|   |   |-- 012_enable_rls_favorites.sql
|   |   |-- 013_grant_favorites_permissions.sql
|   |   |-- 014_create_projects_table.sql
|   |   |-- 015_create_boards_tables.sql
|   |   |-- 016_add_crystallization_columns.sql
|   |   |-- 017_create_imported_patterns.sql
|   |   |-- 018_add_site_id_to_textiles.sql
|   |   |-- 019_add_extraction_patterns.sql
|   |   |-- 020_migrate_legacy_to_textile_attributes.sql
|   |   |-- 021_create_textiles_search_materialized_view.sql
|   |   |-- 022_create_refresh_function.sql
|   |   |-- 025_add_sale_type.sql
|   |   |-- 026_fix_nona_source_variants.sql
|   |   |-- 027_add_video_link_element_types.sql
|   |   |-- 028_add_pdf_pattern_silhouette_types.sql
|   |   |-- 029_extend_users.sql
|   |   |-- 030_user_creation_trigger.sql
|   |   |-- 031_add_project_order_fields.sql
|   |   |-- 032_add_board_cover_image.sql
|   |   +-- MIGRATIONS.md
|   |-- seeds/
|   |   +-- enrich_dictionaries.sql
|   |-- DATABASE_ARCHITECTURE.md
|   |-- schema.sql
|   |-- schema_deadstock.sql
|   +-- USAGE_GUIDE.md
|-- docs/
|   |-- _archive/
|   |   |-- CONTEXT_SUMMARY.md
|   |   |-- NEXT_STEPS.md
|   |   |-- NEXT_STEPS_MVP_DEMO.md
|   |   |-- PHASES.md
|   |   |-- PRODUCT_VISION.md
|   |   |-- PROJECT_CONTEXT_COMPACT.md
|   |   |-- PROJECT_CONTEXT_COMPACT_V2.md
|   |   |-- PROJECT_CONTEXT_COMPACT_V3.md
|   |   |-- PROJECT_CONTEXT_V4.1.md
|   |   +-- PROJECT_CONTEXT_V4.md
|   |-- ai_context/
|   |   |-- PROJECT_CONTEXT_V4_2.md
|   |   +-- PROJECT_CONTEXT_V4_3.md
|   |-- audit/
|   |   |-- AUDIT_PERFORMANCE_V1.md
|   |   |-- AUDIT_PERFORMANCE_V2.2.md
|   |   |-- AUDIT_PERFORMANCE_V2_3.md
|   |   |-- SPRINT_PERFORMANCE_V1.md
|   |   +-- SPRINT_PERFORMANCE_V2.md
|   |-- decisions/
|   |   |-- ADR_001_database_architecture.md
|   |   |-- ADR_002_normalization_english_i18n.md
|   |   |-- ADR_003_multi_project_architecture.md
|   |   |-- ADR_004_normalization_tuning_system.md
|   |   |-- ADR_005_light_ddd_architecture.md
|   |   |-- ADR_006_product_context_enrichment.md
|   |   |-- ADR_007_adapter_pattern_scrapers.md
|   |   |-- ADR_008_intelligent_data_extraction.md
|   |   |-- ADR_009_internationalization_strategy.md
|   |   |-- ADR_010_dynamic_attribute_system.md
|   |   |-- ADR_011_admin_driven_scraping_strategy.md
|   |   |-- ADR_012_STOPWORDS_FILTER.md
|   |   |-- ADR_013_ADMIN_SERVICE_ROLE.md
|   |   |-- ADR_014_TYPESCRIPT_TYPES.md
|   |   |-- ADR_015_CONFIGURE_UX.md
|   |   |-- ADR_016_BOARD_ARCHITECTURE.md
|   |   |-- ADR_017_UNIFIED_REPOSITORIES.md
|   |   |-- ADR_018_CRYSTALLIZATION_RULES.md
|   |   |-- ADR_020_SCRAPER_SOURCE_LOCALE.md
|   |   |-- ADR_021_EXTRACTION_PATTERNS_SYSTEM.md
|   |   |-- ADR_022_DEMAND_DRIVEN_INDEXATION.md
|   |   |-- ADR_023_SCRAPING_NORMALIZATION_INTEGRATION.md
|   |   |-- ADR_024_TEXTILE_STANDARD_SYSTEM.md
|   |   |-- ADR_024_UPDATE_SALE_TYPE.md
|   |   |-- ADR_025_ADMIN_ARCHITECTURE_CLARIFICATION.md
|   |   |-- ADR_026_SALE_TYPE_DISCOVERY_HYBRID_DISPLAY.md
|   |   |-- ADR_027_BOARD_VIEWMODE_PERSISTENCE.md
|   |   |-- ADR_028_BOARDS_ROADMAP.md
|   |   |-- ADR_029_BOARD_JOURNEY_COMPLEMENTARITY.md
|   |   |-- ADR_030_AUTH_MULTI_SCHEMA_V2.md
|   |   |-- ADR_031_SIGNOUT_SERVER_SIDE.md
|   |   |-- ADR_TEMPLATE.md
|   |   +-- ARCHITECTURE_DECISION_SUMMARY.md
|   |-- market/
|   |   |-- ANALYSE_CONCURRENTIELLE.md
|   |   +-- ANALYSE_OUTILS_CALCUL_METRAGE.md
|   |-- project/
|   |   |-- ARCHITECTURE_3_LEVEL_SEARCH.md
|   |   |-- PHASES_V2.md
|   |   |-- PRODUCT_VISION_V2.1.md
|   |   |-- PROJECT_OVERVIEW.md
|   |   |-- RECAP_MISE_A_JOUR_DOCS.md
|   |   +-- SCRAPING_PLAN.md
|   |-- sessions/
|   |   |-- SESSION_10_JOURNEY_MODULE.md
|   |   |-- SESSION_11_BRAINSTORM_UX.md
|   |   |-- SESSION_12_BOARD_MODULE.md
|   |   |-- SESSION_13_FAVORITES_SELECTOR.md
|   |   |-- SESSION_14_FAVORITES_RESIZE_CRISTALLISATION.md
|   |   |-- SESSION_15_CRYSTALLIZATION_IMPLEMENTATION.md
|   |   |-- SESSION_16_ADMIN_TUNING_LOCALE.md
|   |   |-- SESSION_17_EXTRACTION_PATTERNS.md
|   |   |-- SESSION_18_TEXTILE_STANDARD_SYSTEM.md
|   |   |-- SESSION_19_DYNAMIC_FILTERS.md
|   |   |-- SESSION_20_VARIANT_ANALYSIS.md
|   |   |-- SESSION_2024-12-28_architecture-ddd-interface-admin.md
|   |   |-- SESSION_21_ADR026_COMPLETE.md
|   |   |-- SESSION_22_SPRINT5_COMPLETE.md
|   |   |-- SESSION_23_SPRINT6_BOARDS_COMPLETE.md
|   |   |-- SESSION_24_NOTE_2026-01-13.md
|   |   |-- SESSION_25_SUMMARY.md
|   |   |-- SESSION_3_NORMALIZATION_SUCCESS.md
|   |   |-- SESSION_3_PLAN.md
|   |   |-- SESSION_4_STRATEGIC_PIVOT.md
|   |   |-- SESSION_7_FAVORITES_SYSTEM.md
|   |   |-- SESSION_8_ADMIN_MODULE_COMPLETE.md
|   |   |-- SESSION_9_SCRAPING_PIPELINE_COMPLETE.md
|   |   |-- SESSION_NOTE_2025-12-27.md
|   |   |-- SESSION_NOTES_2024-12-28.md
|   |   +-- SESSION_NOTES_2024-12-28_PART2.md
|   |-- specs/
|   |   |-- board/
|   |   |   |-- color_palette/
|   |   |   |   |-- PALETTE_LIBRARIES_COMPARISON.md
|   |   |   |   +-- SPEC_COLOR_PALETTE.md
|   |   |   |-- ARCHITECTURE_UX_BOARD_REALISATION.md
|   |   |   |-- GLOSSAIRE.md
|   |   |   |-- GLOSSAIRE_V2.md
|   |   |   |-- GLOSSAIRE_V3_i18n.md
|   |   |   |-- MIGRATION_JOURNEY_TO_BOARD.md
|   |   |   |-- ROADMAP_BOARDS_IMBRIQUES.md
|   |   |   |-- ROADMAP_BOARDS_IMBRIQUES_UPDATED.md
|   |   |   |-- SPEC_BOARD_MODULE.md
|   |   |   |-- SPEC_BOARD_MOODBOARD_V2.md
|   |   |   |-- SPEC_CRISTALLISATION.md
|   |   |   |-- SPRINT_BOARD_1_2_COMPLETE.md
|   |   |   |-- SPRINT_BOARD_3_PALETTE_COMPLETE.md
|   |   |   |-- SPRINT4_COMPLETE.md
|   |   |   +-- SPRINT5_COMPLETE.md
|   |   |-- consumer/
|   |   |   |-- Deadstock_Strategy_V2_API_First.docx
|   |   |   |-- Deadstock_Strategy_V2_Complete.docx
|   |   |   +-- SPEC_CONSUMER_EXPERIENCE_V0.md
|   |   |-- sprints_standby/
|   |   |   |-- admin_journey_complete.md
|   |   |   |-- BOARD_JOURNEY_SPRINTS.md
|   |   |   |-- BOARD_JOURNEY_SPRINTS_V2.1.md
|   |   |   |-- BOARD_JOURNEY_SPRINTS_V2.2.md
|   |   |   |-- PARCOURS_DESIGNER_REFERENCE.md
|   |   |   |-- SPEC_ADMIN_DATA_TUNING_COMPLETE.md
|   |   |   |-- SPEC_ADMIN_DATA_TUNING_V3.md
|   |   |   |-- SPEC_CONTEXTUAL_SEARCH.md
|   |   |   |-- SPEC_DEMAND_DRIVEN_INDEXATION.md
|   |   |   |-- SPEC_DESIGN_SYSTEM_PARCOURS.md
|   |   |   |-- SPEC_JOURNEY_UI_AMBITIEUSE.md
|   |   |   |-- SPEC_MODULE_ADMIN.md
|   |   |   |-- SPEC_MODULE_RECHERCHE_DESIGNER.md
|   |   |   |-- SPEC_PATTERN_IMPORT.md
|   |   |   |-- SPRINT_NAVIGATION_CLEANUP.md
|   |   |   |-- SPRINT_NAVIGATION_CLEANUP_COMPLETED.md
|   |   |   |-- SPRINT_NAVIGATION_UNIFICATION.md
|   |   |   |-- SPRINT_PLAN_CRISTALLISATION.md
|   |   |   |-- SPRINT_PLAN_CRISTALLISATION_V2.md
|   |   |   +-- SYNTHESE_DONNEES_DESIGNER (1).md
|   |   |-- SPRINT_CANVAS_IMPROVEMENTS.md
|   |   |-- SPRINT_CANVAS_IMPROVEMENTS_V2.md
|   |   |-- SPRINT_IMAGES_STORAGE.md
|   |   |-- SPRINT_LANDING_AUTH.md
|   |   |-- SPRINT_LANDING_AUTH_V2.md
|   |   |-- SPRINT_LANDING_AUTH_V3.md
|   |   |-- SPRINT_PLAN.md
|   |   |-- SPRINT_PLAN_V2.1.md
|   |   |-- SPRINT_PLAN_V2.2.md
|   |   |-- SPRINT_PLAN_V3.md
|   |   |-- SPRINT_UI1_I18N1.md
|   |   |-- SPRINT_UI1_I18N1_V1.1.md
|   |   +-- SPRINT_UI1_I18N1_V1.2.md
|   |-- state/
|   |   |-- CURRENT_STATE.md
|   |   |-- CURRENT_STATE_UPDATED.md
|   |   +-- TECH_STACK.md
|   |-- technical/
|   |   +-- TUNING_SYSTEM.md
|   |-- FILE_TREE.md
|   +-- README.md
|-- scripts/
|   |-- admin/
|   |   |-- discover-site.ts
|   |   |-- preview-scraping.ts
|   |   +-- scrape-site.ts
|   |-- generate-file-tree.ps1
|   +-- load-env.ts
|-- src/
|   |-- app/
|   |   |-- (auth)/
|   |   |   |-- forgot-password/
|   |   |   |   +-- page.tsx
|   |   |   |-- login/
|   |   |   |   +-- page.tsx
|   |   |   |-- reset-password/
|   |   |   |   +-- page.tsx
|   |   |   |-- signup/
|   |   |   |   +-- page.tsx
|   |   |   +-- layout.tsx
|   |   |-- (main)/
|   |   |   |-- boards/
|   |   |   |   |-- [boardId]/
|   |   |   |   +-- page.tsx
|   |   |   |-- favorites/
|   |   |   |   +-- page.tsx
|   |   |   |-- home/
|   |   |   |   +-- page.tsx
|   |   |   |-- search/
|   |   |   |   +-- page.tsx
|   |   |   |-- settings/
|   |   |   |   +-- page.tsx
|   |   |   |-- textiles/
|   |   |   |   |-- [id]/
|   |   |   |   +-- page.tsx
|   |   |   |-- tools/
|   |   |   |   +-- yardage-calculator/
|   |   |   |-- layout.tsx
|   |   |   +-- page.tsx
|   |   |-- admin/
|   |   |   |-- demands/
|   |   |   |   +-- page.tsx
|   |   |   |-- dictionary/
|   |   |   |   +-- page.tsx
|   |   |   |-- discovery/
|   |   |   |   |-- [siteSlug]/
|   |   |   |   +-- page.tsx
|   |   |   |-- jobs/
|   |   |   |   |-- [id]/
|   |   |   |   +-- page.tsx
|   |   |   |-- scraping/
|   |   |   |   +-- page.tsx
|   |   |   |-- sites/
|   |   |   |   |-- [id]/
|   |   |   |   |-- new/
|   |   |   |   |   +-- page.tsx
|   |   |   |   +-- page.tsx
|   |   |   |-- tuning/
|   |   |   |   |-- components/
|   |   |   |   |   +-- UnknownsList.tsx
|   |   |   |   |-- quality/
|   |   |   |   |   +-- page.tsx
|   |   |   |   |-- actions.ts
|   |   |   |   +-- page.tsx
|   |   |   |-- layout.tsx
|   |   |   +-- page.tsx
|   |   |-- api/
|   |   |   |-- auth/
|   |   |   |   |-- callback/
|   |   |   |   |   +-- route.ts
|   |   |   |   +-- signout/
|   |   |   |       +-- route.ts
|   |   |   |-- colors/
|   |   |   |   +-- available/
|   |   |   |       +-- route.ts
|   |   |   |-- search/
|   |   |   |   |-- contextual/
|   |   |   |   |   +-- route.ts
|   |   |   |   +-- route.ts
|   |   |   +-- textiles/
|   |   |       +-- urls/
|   |   |           +-- route.ts
|   |   |-- components/
|   |   |-- pricing/
|   |   |   +-- page.tsx
|   |   |-- favicon.ico
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   +-- page-v1-backup.tsx
|   |-- components/
|   |   |-- i18n/
|   |   |   +-- LocaleSwitcher.tsx
|   |   |-- landing/
|   |   |   +-- ValueChainComparison.tsx
|   |   |-- navigation/
|   |   |-- search/
|   |   |   |-- Filters.tsx
|   |   |   |-- PriceDisplay.tsx
|   |   |   |-- SearchBar.tsx
|   |   |   |-- SearchInterface.tsx
|   |   |   |-- TextileGrid.tsx
|   |   |   +-- YardageFilterBadge.tsx
|   |   |-- theme/
|   |   |   |-- ThemeProvider.tsx
|   |   |   +-- ThemeToggle.tsx
|   |   +-- ui/
|   |       |-- badge.tsx
|   |       |-- button.tsx
|   |       |-- card.tsx
|   |       |-- checkbox.tsx
|   |       |-- command.tsx
|   |       |-- dialog.tsx
|   |       |-- dropdown-menu.tsx
|   |       |-- form.tsx
|   |       |-- input.tsx
|   |       |-- label.tsx
|   |       |-- popover.tsx
|   |       |-- progress.tsx
|   |       |-- select.tsx
|   |       |-- separator.tsx
|   |       |-- sheet.tsx
|   |       |-- skeleton.tsx
|   |       |-- slider.tsx
|   |       |-- sonner.tsx
|   |       |-- table.tsx
|   |       |-- tabs.tsx
|   |       |-- textarea.tsx
|   |       +-- tooltip.tsx
|   |-- features/
|   |   |-- admin/
|   |   |   |-- application/
|   |   |   |   |-- actions.ts
|   |   |   |   +-- queries.ts
|   |   |   |-- components/
|   |   |   |   |-- AddSiteForm.tsx
|   |   |   |   |-- AdminSidebar.tsx
|   |   |   |   |-- ExtractionPatternsCard.tsx
|   |   |   |   |-- PreviewModal.tsx
|   |   |   |   |-- SaleTypeCard.tsx
|   |   |   |   |-- ScrapingConfigForm.tsx
|   |   |   |   |-- SiteActions.tsx
|   |   |   |   +-- SiteAnalysisCard.tsx
|   |   |   |-- config/
|   |   |   |   +-- navigation.ts
|   |   |   |-- domain/
|   |   |   |   +-- types.ts
|   |   |   |-- hooks/
|   |   |   |   +-- useAdminNavigation.ts
|   |   |   |-- infrastructure/
|   |   |   |   |-- discoveryRepo.ts
|   |   |   |   |-- jobsRepo.ts
|   |   |   |   |-- scrapingRepo.ts
|   |   |   |   +-- sitesRepo.ts
|   |   |   |-- services/
|   |   |   |   |-- discoveryService.ts
|   |   |   |   |-- extractionPatternDetector.ts
|   |   |   |   |-- extractionService.ts
|   |   |   |   |-- saleTypeDetector.ts
|   |   |   |   +-- scrapingService.ts
|   |   |   +-- utils/
|   |   |       |-- extractTerms.ts
|   |   |       +-- variantAnalyzer.ts
|   |   |-- auth/
|   |   |   |-- components/
|   |   |   |   |-- LandingHeader.tsx
|   |   |   |   +-- UserMenu.tsx
|   |   |   +-- context/
|   |   |       +-- AuthContext.tsx
|   |   |-- boards/
|   |   |   |-- actions/
|   |   |   |   |-- boardActions.ts
|   |   |   |   |-- crystallizationActions.ts
|   |   |   |   |-- elementActions.ts
|   |   |   |   +-- zoneActions.ts
|   |   |   |-- components/
|   |   |   |   |-- canvas/
|   |   |   |   |   |-- hooks/
|   |   |   |   |   |   |-- index.ts
|   |   |   |   |   |   |-- useElementDrag.ts
|   |   |   |   |   |   |-- useKeyboardShortcuts.ts
|   |   |   |   |   |   |-- useZoneDrag.ts
|   |   |   |   |   |   +-- useZoneResize.ts
|   |   |   |   |   |-- CanvasModals.tsx
|   |   |   |   |   |-- FavoritesSheet.tsx
|   |   |   |   |   +-- index.ts
|   |   |   |   |-- elements/
|   |   |   |   |   |-- ImageElement.tsx
|   |   |   |   |   |-- LinkElement.tsx
|   |   |   |   |   |-- PaletteElement.tsx
|   |   |   |   |   |-- PatternElement.tsx
|   |   |   |   |   |-- PdfElement.tsx
|   |   |   |   |   |-- SilhouetteElement.tsx
|   |   |   |   |   +-- VideoElement.tsx
|   |   |   |   |-- AddToBoardButton.tsx
|   |   |   |   |-- AutoArrangeDialog.tsx
|   |   |   |   |-- BoardCanvas.tsx
|   |   |   |   |-- BoardLayoutClient.tsx
|   |   |   |   |-- BoardToolbar.tsx
|   |   |   |   |-- ColorMatchDisplay.tsx
|   |   |   |   |-- ColorPickerPopover.tsx
|   |   |   |   |-- ConstraintToggleButton.tsx
|   |   |   |   |-- ContextualSearchPanel.tsx
|   |   |   |   |-- CrystallizationDialog.tsx
|   |   |   |   |-- ElementCard.tsx
|   |   |   |   |-- FavoritesSelector.tsx
|   |   |   |   |-- ImageUploadModal.tsx
|   |   |   |   |-- LinkModal.tsx
|   |   |   |   |-- NoteEditor.tsx
|   |   |   |   |-- PaletteEditor.tsx
|   |   |   |   |-- PatternModal.tsx
|   |   |   |   |-- PdfModal.tsx
|   |   |   |   |-- PhaseColumns.tsx
|   |   |   |   |-- SearchFiltersCompact.tsx
|   |   |   |   |-- SharedBoardHeader.tsx
|   |   |   |   |-- SilhouetteModal.tsx
|   |   |   |   |-- UnsplashImagePicker.tsx
|   |   |   |   |-- VideoModal.tsx
|   |   |   |   |-- ViewToggle.tsx
|   |   |   |   |-- ZoneCard.tsx
|   |   |   |   |-- ZoneElementThumbnail.tsx
|   |   |   |   |-- ZoneFocusOverlay.tsx
|   |   |   |   +-- ZoomControls.tsx
|   |   |   |-- context/
|   |   |   |   |-- BoardContext.tsx
|   |   |   |   |-- ContextualSearchContext.tsx
|   |   |   |   |-- ImmersiveModeContext.tsx
|   |   |   |   |-- TransformContext.tsx
|   |   |   |   +-- ZoneFocusContext.tsx
|   |   |   |-- domain/
|   |   |   |   +-- types.ts
|   |   |   |-- hooks/
|   |   |   |   +-- useContextualSearch.ts
|   |   |   |-- infrastructure/
|   |   |   |   |-- boardsRepository.ts
|   |   |   |   |-- elementsRepository.ts
|   |   |   |   +-- zonesRepository.ts
|   |   |   |-- services/
|   |   |   |   +-- unsplashService.ts
|   |   |   +-- utils/
|   |   |       |-- autoArrange.ts
|   |   |       |-- colorExtractor.ts
|   |   |       +-- zoneUtils.ts
|   |   |-- favorites/
|   |   |   |-- actions/
|   |   |   |   +-- favoriteActions.ts
|   |   |   |-- components/
|   |   |   |   |-- FavoriteButton.tsx
|   |   |   |   |-- FavoriteDetailView.tsx
|   |   |   |   |-- FavoritesCountBadge.tsx
|   |   |   |   +-- FavoritesGrid.tsx
|   |   |   |-- context/
|   |   |   |   +-- FavoritesContext.tsx
|   |   |   |-- domain/
|   |   |   |   +-- types.ts
|   |   |   |-- infrastructure/
|   |   |   |   +-- favoritesRepository.ts
|   |   |   +-- utils/
|   |   |       +-- sessionManager.ts
|   |   |-- journey/
|   |   |   |-- actions/
|   |   |   |   |-- orderActions.ts
|   |   |   |   +-- projectActions.ts
|   |   |   |-- components/
|   |   |   |   |-- views/
|   |   |   |   |   +-- TextileJourneyView.tsx
|   |   |   |   |-- JourneyClientWrapper.tsx
|   |   |   |   |-- JourneyNavigation.tsx
|   |   |   |   |-- MobileJourneyNav.tsx
|   |   |   |   |-- OrderForm.tsx
|   |   |   |   |-- Sidebar.tsx
|   |   |   |   +-- SidebarStep.tsx
|   |   |   |-- config/
|   |   |   |   |-- garments.ts
|   |   |   |   +-- steps.ts
|   |   |   |-- context/
|   |   |   |   +-- ProjectContext.tsx
|   |   |   |-- domain/
|   |   |   |   +-- types.ts
|   |   |   |-- infrastructure/
|   |   |   |   +-- projectsRepository.ts
|   |   |   +-- services/
|   |   |       +-- yardageCalculator.ts
|   |   |-- navigation/
|   |   |   |-- components/
|   |   |   |   +-- MainHeader.tsx
|   |   |   +-- context/
|   |   |       +-- NavigationContext.tsx
|   |   |-- normalization/
|   |   |   |-- application/
|   |   |   |   +-- normalizeTextile.ts
|   |   |   |-- domain/
|   |   |   |   +-- ValueObjects.ts
|   |   |   +-- infrastructure/
|   |   |       +-- normalizationService.ts
|   |   |-- pattern/
|   |   |   |-- actions/
|   |   |   |-- application/
|   |   |   |   +-- calculateYardage.ts
|   |   |   |-- components/
|   |   |   |   |-- ManualPatternForm.tsx
|   |   |   |   |-- PatternCalculationCard.tsx
|   |   |   |   |-- PatternConfigForm.tsx
|   |   |   |   |-- PatternImportModal.tsx
|   |   |   |   +-- YardageResult.tsx
|   |   |   |-- domain/
|   |   |   |   |-- garmentFormulas.ts
|   |   |   |   +-- types.ts
|   |   |   |-- infrastructure/
|   |   |   |   +-- patternRepository.ts
|   |   |   +-- index.ts
|   |   |-- search/
|   |   |   |-- application/
|   |   |   |   +-- searchTextiles.ts
|   |   |   |-- domain/
|   |   |   |   +-- types.ts
|   |   |   +-- infrastructure/
|   |   |       +-- textileRepository.ts
|   |   +-- tuning/
|   |       |-- application/
|   |       |   |-- approveMapping.ts
|   |       |   |-- getUnknowns.ts
|   |       |   +-- rejectUnknown.ts
|   |       |-- domain/
|   |       |   |-- DictionaryMapping.ts
|   |       |   |-- types.ts
|   |       |   +-- UnknownTerm.ts
|   |       +-- infrastructure/
|   |           |-- dictionaryRepo.ts
|   |           +-- unknownsRepo.ts
|   |-- i18n/
|   |   |-- messages/
|   |   |   |-- en.json
|   |   |   +-- fr.json
|   |   |-- config.ts
|   |   |-- index.ts
|   |   +-- request.ts
|   |-- lib/
|   |   |-- auth/
|   |   |   |-- getAuthUser.ts
|   |   |   +-- requireUser.ts
|   |   |-- color/
|   |   |   |-- colorConversion.ts
|   |   |   |-- colorMatching.ts
|   |   |   |-- databaseColors.ts
|   |   |   +-- index.ts
|   |   |-- storage/
|   |   |   +-- imageUpload.ts
|   |   |-- supabase/
|   |   |   |-- admin.ts
|   |   |   |-- auth.ts
|   |   |   |-- browser.ts
|   |   |   |-- client.ts
|   |   |   |-- database.types.ts
|   |   |   |-- scraper.ts
|   |   |   +-- server.ts
|   |   +-- utils.ts
|   |-- styles/
|   |   +-- design-tokens.css
|   +-- types/
|       |-- colorthief.d.types.ts
|       +-- database.types.ts
|-- .env.local
|-- .gitignore
|-- components.json
|-- eslint.config.mjs
|-- GUIDE_DEMARRAGE.md
|-- middleware.ts
|-- next.config.ts
|-- next-env.d.ts
|-- package.json
|-- package-lock.json
|-- postcss.config.mjs
|-- README.md
|-- tailwind.config.ts
|-- tsconfig.json
+-- tsconfig.tsbuildinfo
```

---

## TypeScript Files by Feature

### Feature: `admin`

- `/src/features/admin/application/actions.ts`
- `/src/features/admin/application/queries.ts`
- `/src/features/admin/components/AddSiteForm.tsx`
- `/src/features/admin/components/AdminSidebar.tsx`
- `/src/features/admin/components/ExtractionPatternsCard.tsx`
- `/src/features/admin/components/PreviewModal.tsx`
- `/src/features/admin/components/SaleTypeCard.tsx`
- `/src/features/admin/components/ScrapingConfigForm.tsx`
- `/src/features/admin/components/SiteActions.tsx`
- `/src/features/admin/components/SiteAnalysisCard.tsx`
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
- `/src/features/admin/services/saleTypeDetector.ts`
- `/src/features/admin/services/scrapingService.ts`
- `/src/features/admin/utils/extractTerms.ts`
- `/src/features/admin/utils/variantAnalyzer.ts`

### Feature: `auth`

- `/src/features/auth/components/LandingHeader.tsx`
- `/src/features/auth/components/UserMenu.tsx`
- `/src/features/auth/context/AuthContext.tsx`

### Feature: `boards`

- `/src/features/boards/actions/boardActions.ts`
- `/src/features/boards/actions/crystallizationActions.ts`
- `/src/features/boards/actions/elementActions.ts`
- `/src/features/boards/actions/zoneActions.ts`
- `/src/features/boards/components/AddToBoardButton.tsx`
- `/src/features/boards/components/AutoArrangeDialog.tsx`
- `/src/features/boards/components/BoardCanvas.tsx`
- `/src/features/boards/components/BoardLayoutClient.tsx`
- `/src/features/boards/components/BoardToolbar.tsx`
- `/src/features/boards/components/canvas/CanvasModals.tsx`
- `/src/features/boards/components/canvas/FavoritesSheet.tsx`
- `/src/features/boards/components/canvas/hooks/index.ts`
- `/src/features/boards/components/canvas/hooks/useElementDrag.ts`
- `/src/features/boards/components/canvas/hooks/useKeyboardShortcuts.ts`
- `/src/features/boards/components/canvas/hooks/useZoneDrag.ts`
- `/src/features/boards/components/canvas/hooks/useZoneResize.ts`
- `/src/features/boards/components/canvas/index.ts`
- `/src/features/boards/components/ColorMatchDisplay.tsx`
- `/src/features/boards/components/ColorPickerPopover.tsx`
- `/src/features/boards/components/ConstraintToggleButton.tsx`
- `/src/features/boards/components/ContextualSearchPanel.tsx`
- `/src/features/boards/components/CrystallizationDialog.tsx`
- `/src/features/boards/components/ElementCard.tsx`
- `/src/features/boards/components/elements/ImageElement.tsx`
- `/src/features/boards/components/elements/LinkElement.tsx`
- `/src/features/boards/components/elements/PaletteElement.tsx`
- `/src/features/boards/components/elements/PatternElement.tsx`
- `/src/features/boards/components/elements/PdfElement.tsx`
- `/src/features/boards/components/elements/SilhouetteElement.tsx`
- `/src/features/boards/components/elements/VideoElement.tsx`
- `/src/features/boards/components/FavoritesSelector.tsx`
- `/src/features/boards/components/ImageUploadModal.tsx`
- `/src/features/boards/components/LinkModal.tsx`
- `/src/features/boards/components/NoteEditor.tsx`
- `/src/features/boards/components/PaletteEditor.tsx`
- `/src/features/boards/components/PatternModal.tsx`
- `/src/features/boards/components/PdfModal.tsx`
- `/src/features/boards/components/PhaseColumns.tsx`
- `/src/features/boards/components/SearchFiltersCompact.tsx`
- `/src/features/boards/components/SharedBoardHeader.tsx`
- `/src/features/boards/components/SilhouetteModal.tsx`
- `/src/features/boards/components/UnsplashImagePicker.tsx`
- `/src/features/boards/components/VideoModal.tsx`
- `/src/features/boards/components/ViewToggle.tsx`
- `/src/features/boards/components/ZoneCard.tsx`
- `/src/features/boards/components/ZoneElementThumbnail.tsx`
- `/src/features/boards/components/ZoneFocusOverlay.tsx`
- `/src/features/boards/components/ZoomControls.tsx`
- `/src/features/boards/context/BoardContext.tsx`
- `/src/features/boards/context/ContextualSearchContext.tsx`
- `/src/features/boards/context/ImmersiveModeContext.tsx`
- `/src/features/boards/context/TransformContext.tsx`
- `/src/features/boards/context/ZoneFocusContext.tsx`
- `/src/features/boards/domain/types.ts`
- `/src/features/boards/hooks/useContextualSearch.ts`
- `/src/features/boards/infrastructure/boardsRepository.ts`
- `/src/features/boards/infrastructure/elementsRepository.ts`
- `/src/features/boards/infrastructure/zonesRepository.ts`
- `/src/features/boards/services/unsplashService.ts`
- `/src/features/boards/utils/autoArrange.ts`
- `/src/features/boards/utils/colorExtractor.ts`
- `/src/features/boards/utils/zoneUtils.ts`

### Feature: `favorites`

- `/src/features/favorites/actions/favoriteActions.ts`
- `/src/features/favorites/components/FavoriteButton.tsx`
- `/src/features/favorites/components/FavoriteDetailView.tsx`
- `/src/features/favorites/components/FavoritesCountBadge.tsx`
- `/src/features/favorites/components/FavoritesGrid.tsx`
- `/src/features/favorites/context/FavoritesContext.tsx`
- `/src/features/favorites/domain/types.ts`
- `/src/features/favorites/infrastructure/favoritesRepository.ts`
- `/src/features/favorites/utils/sessionManager.ts`

### Feature: `journey`

- `/src/features/journey/actions/orderActions.ts`
- `/src/features/journey/actions/projectActions.ts`
- `/src/features/journey/components/JourneyClientWrapper.tsx`
- `/src/features/journey/components/JourneyNavigation.tsx`
- `/src/features/journey/components/MobileJourneyNav.tsx`
- `/src/features/journey/components/OrderForm.tsx`
- `/src/features/journey/components/Sidebar.tsx`
- `/src/features/journey/components/SidebarStep.tsx`
- `/src/features/journey/components/views/TextileJourneyView.tsx`
- `/src/features/journey/config/garments.ts`
- `/src/features/journey/config/steps.ts`
- `/src/features/journey/context/ProjectContext.tsx`
- `/src/features/journey/domain/types.ts`
- `/src/features/journey/infrastructure/projectsRepository.ts`
- `/src/features/journey/services/yardageCalculator.ts`

### Feature: `normalization`

- `/src/features/normalization/application/normalizeTextile.ts`
- `/src/features/normalization/domain/ValueObjects.ts`
- `/src/features/normalization/infrastructure/normalizationService.ts`

### Feature: `pattern`

- `/src/features/pattern/application/calculateYardage.ts`
- `/src/features/pattern/components/ManualPatternForm.tsx`
- `/src/features/pattern/components/PatternCalculationCard.tsx`
- `/src/features/pattern/components/PatternConfigForm.tsx`
- `/src/features/pattern/components/PatternImportModal.tsx`
- `/src/features/pattern/components/YardageResult.tsx`
- `/src/features/pattern/domain/garmentFormulas.ts`
- `/src/features/pattern/domain/types.ts`
- `/src/features/pattern/index.ts`
- `/src/features/pattern/infrastructure/patternRepository.ts`

### Feature: `search`

- `/src/features/search/application/searchTextiles.ts`
- `/src/features/search/domain/types.ts`
- `/src/features/search/infrastructure/textileRepository.ts`

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

## API Routes

- `/api/auth/callback`
- `/api/auth/signout`
- `/api/colors/available`
- `/api/search/contextual`
- `/api/search`
- `/api/textiles/urls`

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
- `027_add_video_link_element_types.sql`
- `028_add_pdf_pattern_silhouette_types.sql`
- `029_extend_users.sql`
- `030_user_creation_trigger.sql`
- `031_add_project_order_fields.sql`
- `032_add_board_cover_image.sql`

### Seeds

- `enrich_dictionaries.sql`

---

## Components Summary

### `components/i18n/`

- `LocaleSwitcher.tsx`

### `components/landing/`

- `ValueChainComparison.tsx`

### `components/navigation/`


### `components/search/`

- `Filters.tsx`
- `PriceDisplay.tsx`
- `SearchBar.tsx`
- `SearchInterface.tsx`
- `TextileGrid.tsx`
- `YardageFilterBadge.tsx`

### `components/theme/`

- `ThemeProvider.tsx`
- `ThemeToggle.tsx`

### `components/ui/`

- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `command.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `form.tsx`
- `input.tsx`
- `label.tsx`
- `popover.tsx`
- `progress.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `sonner.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `tooltip.tsx`

---

## Configuration Files

| File | Status |
|------|--------|
| `package.json` | âœ… EXISTS |
| `tsconfig.json` | âœ… EXISTS |
| `next.config.ts` | âœ… EXISTS |
| `next.config.js` | âšª Optional |
| `tailwind.config.ts` | âœ… EXISTS |
| `postcss.config.mjs` | âœ… EXISTS |
| `eslint.config.mjs` | âœ… EXISTS |
| `.env.local` | âœ… EXISTS |
| `.env.example` | âšª Optional |
| `components.json` | âœ… EXISTS |

---

## Excluded from Tree

The following directories are excluded from this documentation:
- `node_modules/`
- `.next/`
- `.git/`
- `dist/`
- `build/`
- `coverage/`
- `.vercel/`
- `public/`

---

## Last Updated

**Date:** 2026-01-27 18:06:21

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