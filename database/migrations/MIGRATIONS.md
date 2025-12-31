# Database Migrations Log

## Migration 005 : i18n Schema (2024-12-28)

**Status** : ✅ Applied
**Duration** : ~5 minutes
**Rollback** : Available (see migration file)

**Changes** :

- dictionary_mappings : +3 columns (source_term, source_locale, translations)
- textiles : +2 columns (name_i18n, description_i18n) for future
- New constraint : (source_term, source_locale, category) UNIQUE
- Helper function : get_translation()

**Data Migration** :

- 25 mappings migrated successfully
- Backward compatible (old columns kept temporarily)

**Next Migration** : 006 (TBD - Full removal old columns)
