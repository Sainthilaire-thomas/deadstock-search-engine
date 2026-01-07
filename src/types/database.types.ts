export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  deadstock: {
    Tables: {
      attribute_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          is_searchable: boolean | null
          level: number | null
          name: string
          parent_id: string | null
          path: string | null
          slug: string
          translations: Json | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          is_searchable?: boolean | null
          level?: number | null
          name: string
          parent_id?: string | null
          path?: string | null
          slug: string
          translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          is_searchable?: boolean | null
          level?: number | null
          name?: string
          parent_id?: string | null
          path?: string | null
          slug?: string
          translations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attribute_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "attribute_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      board_elements: {
        Row: {
          board_id: string
          created_at: string
          element_data: Json
          element_type: string
          height: number | null
          id: string
          position_x: number
          position_y: number
          updated_at: string
          width: number | null
          z_index: number
          zone_id: string | null
        }
        Insert: {
          board_id: string
          created_at?: string
          element_data?: Json
          element_type: string
          height?: number | null
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          width?: number | null
          z_index?: number
          zone_id?: string | null
        }
        Update: {
          board_id?: string
          created_at?: string
          element_data?: Json
          element_type?: string
          height?: number | null
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          width?: number | null
          z_index?: number
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "board_elements_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_elements_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "board_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      board_zones: {
        Row: {
          board_id: string
          color: string | null
          created_at: string
          crystallized_at: string | null
          height: number
          id: string
          linked_project_id: string | null
          name: string
          position_x: number
          position_y: number
          width: number
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string
          crystallized_at?: string | null
          height?: number
          id?: string
          linked_project_id?: string | null
          name?: string
          position_x?: number
          position_y?: number
          width?: number
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string
          crystallized_at?: string | null
          height?: number
          id?: string
          linked_project_id?: string | null
          name?: string
          position_x?: number
          position_y?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "board_zones_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_zones_linked_project_id_fkey"
            columns: ["linked_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
          session_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dictionary_mappings: {
        Row: {
          category_id: string
          confidence: number | null
          created_at: string | null
          id: string
          notes: string | null
          source: string | null
          source_locale: string
          source_term: string
          translations: Json
          updated_at: string | null
          usage_count: number | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          category_id: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          source_locale: string
          source_term: string
          translations: Json
          updated_at?: string | null
          usage_count?: number | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          category_id?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          source_locale?: string
          source_term?: string
          translations?: Json
          updated_at?: string | null
          usage_count?: number | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dictionary_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "attribute_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_jobs: {
        Row: {
          config: Json | null
          created_at: string | null
          ended_at: string | null
          error_summary: Json | null
          id: string
          mode: string | null
          sites_completed: number | null
          sites_failed: number | null
          sites_total: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          ended_at?: string | null
          error_summary?: Json | null
          id?: string
          mode?: string | null
          sites_completed?: number | null
          sites_failed?: number | null
          sites_total?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          ended_at?: string | null
          error_summary?: Json | null
          id?: string
          mode?: string | null
          sites_completed?: number | null
          sites_failed?: number | null
          sites_total?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          textile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          textile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          textile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "active_textiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_low_confidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_needing_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_with_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_patterns: {
        Row: {
          analysis_result: Json | null
          brand: string | null
          confidence: number | null
          created_at: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string | null
          garment_type: string | null
          id: string
          name: string
          page_count: number | null
          precision_level: number | null
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_result?: Json | null
          brand?: string | null
          confidence?: number | null
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          garment_type?: string | null
          id?: string
          name: string
          page_count?: number | null
          precision_level?: number | null
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_result?: Json | null
          brand?: string | null
          confidence?: number | null
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string | null
          garment_type?: string | null
          id?: string
          name?: string
          page_count?: number | null
          precision_level?: number | null
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      llm_cost_tracking: {
        Row: {
          avg_confidence: number | null
          calls_count: number | null
          category: string | null
          created_at: string | null
          date: string
          id: string
          total_cost: number | null
        }
        Insert: {
          avg_confidence?: number | null
          calls_count?: number | null
          category?: string | null
          created_at?: string | null
          date: string
          id?: string
          total_cost?: number | null
        }
        Update: {
          avg_confidence?: number | null
          calls_count?: number | null
          category?: string | null
          created_at?: string | null
          date?: string
          id?: string
          total_cost?: number | null
        }
        Relationships: []
      }
      normalization_snapshots: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          applied_by: string | null
          changes_detail: Json | null
          changes_detected: number | null
          created_at: string | null
          dictionary_version: string
          id: string
          notes: string | null
          total_textiles: number
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          applied_by?: string | null
          changes_detail?: Json | null
          changes_detected?: number | null
          created_at?: string | null
          dictionary_version: string
          id?: string
          notes?: string | null
          total_textiles: number
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          applied_by?: string | null
          changes_detail?: Json | null
          changes_detected?: number | null
          created_at?: string | null
          dictionary_version?: string
          id?: string
          notes?: string | null
          total_textiles?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          client_email: string | null
          client_name: string | null
          color_palette: Json | null
          constraints: Json | null
          created_at: string | null
          currency: string | null
          current_step: string
          deadline: string | null
          description: string | null
          description_i18n: Json | null
          fabric_modifiers: Json | null
          fabric_width: number | null
          garments: Json | null
          id: string
          margin_percent: number | null
          mood_board: Json | null
          name: string
          name_i18n: Json | null
          project_type: string
          reference_images: Json | null
          selected_textiles: Json | null
          session_id: string | null
          source_board_id: string | null
          source_zone_id: string | null
          status: string
          style_keywords: string[] | null
          total_yardage: number | null
          updated_at: string | null
          user_id: string | null
          yardage_details: Json | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          client_email?: string | null
          client_name?: string | null
          color_palette?: Json | null
          constraints?: Json | null
          created_at?: string | null
          currency?: string | null
          current_step?: string
          deadline?: string | null
          description?: string | null
          description_i18n?: Json | null
          fabric_modifiers?: Json | null
          fabric_width?: number | null
          garments?: Json | null
          id?: string
          margin_percent?: number | null
          mood_board?: Json | null
          name: string
          name_i18n?: Json | null
          project_type?: string
          reference_images?: Json | null
          selected_textiles?: Json | null
          session_id?: string | null
          source_board_id?: string | null
          source_zone_id?: string | null
          status?: string
          style_keywords?: string[] | null
          total_yardage?: number | null
          updated_at?: string | null
          user_id?: string | null
          yardage_details?: Json | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          client_email?: string | null
          client_name?: string | null
          color_palette?: Json | null
          constraints?: Json | null
          created_at?: string | null
          currency?: string | null
          current_step?: string
          deadline?: string | null
          description?: string | null
          description_i18n?: Json | null
          fabric_modifiers?: Json | null
          fabric_width?: number | null
          garments?: Json | null
          id?: string
          margin_percent?: number | null
          mood_board?: Json | null
          name?: string
          name_i18n?: Json | null
          project_type?: string
          reference_images?: Json | null
          selected_textiles?: Json | null
          session_id?: string | null
          source_board_id?: string | null
          source_zone_id?: string | null
          status?: string
          style_keywords?: string[] | null
          total_yardage?: number | null
          updated_at?: string | null
          user_id?: string | null
          yardage_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_source_board_id_fkey"
            columns: ["source_board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_source_zone_id_fkey"
            columns: ["source_zone_id"]
            isOneToOne: false
            referencedRelation: "board_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_jobs: {
        Row: {
          config: Json | null
          created_at: string | null
          ended_at: string | null
          error_details: Json | null
          errors_count: number | null
          id: string
          logs: Json | null
          products_fetched: number | null
          products_saved: number | null
          products_skipped: number | null
          products_updated: number | null
          profile_id: string | null
          quality_score: number | null
          site_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          ended_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          logs?: Json | null
          products_fetched?: number | null
          products_saved?: number | null
          products_skipped?: number | null
          products_updated?: number | null
          profile_id?: string | null
          quality_score?: number | null
          site_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          ended_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          id?: string
          logs?: Json | null
          products_fetched?: number | null
          products_saved?: number | null
          products_skipped?: number | null
          products_updated?: number | null
          profile_id?: string | null
          quality_score?: number | null
          site_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraping_jobs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "site_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraping_jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          items_failed: number | null
          items_found: number | null
          items_new: number | null
          items_updated: number | null
          source_platform: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_found?: number | null
          items_new?: number | null
          items_updated?: number | null
          source_platform: string
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_found?: number | null
          items_new?: number | null
          items_updated?: number | null
          source_platform?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      site_profiles: {
        Row: {
          collections: Json | null
          created_at: string | null
          data_structure: Json | null
          discovered_at: string | null
          estimated_available: number | null
          estimated_products: number | null
          extraction_patterns: Json | null
          global_analysis: Json | null
          id: string
          is_shopify: boolean | null
          needs_rediscovery: boolean | null
          profile_version: number | null
          quality_metrics: Json | null
          recommendations: Json | null
          rediscovery_reason: string | null
          relevant_collections: number | null
          sample_products: Json | null
          site_id: string
          total_collections: number | null
          valid_until: string
        }
        Insert: {
          collections?: Json | null
          created_at?: string | null
          data_structure?: Json | null
          discovered_at?: string | null
          estimated_available?: number | null
          estimated_products?: number | null
          extraction_patterns?: Json | null
          global_analysis?: Json | null
          id?: string
          is_shopify?: boolean | null
          needs_rediscovery?: boolean | null
          profile_version?: number | null
          quality_metrics?: Json | null
          recommendations?: Json | null
          rediscovery_reason?: string | null
          relevant_collections?: number | null
          sample_products?: Json | null
          site_id: string
          total_collections?: number | null
          valid_until: string
        }
        Update: {
          collections?: Json | null
          created_at?: string | null
          data_structure?: Json | null
          discovered_at?: string | null
          estimated_available?: number | null
          estimated_products?: number | null
          extraction_patterns?: Json | null
          global_analysis?: Json | null
          id?: string
          is_shopify?: boolean | null
          needs_rediscovery?: boolean | null
          profile_version?: number | null
          quality_metrics?: Json | null
          recommendations?: Json | null
          rediscovery_reason?: string | null
          relevant_collections?: number | null
          sample_products?: Json | null
          site_id?: string
          total_collections?: number | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string | null
          discovery_completed_at: string | null
          id: string
          last_scraped_at: string | null
          name: string | null
          notes: string | null
          platform_type: string | null
          priority: string | null
          quality_score: number | null
          scraping_config: Json | null
          source_locale: string
          status: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          discovery_completed_at?: string | null
          id?: string
          last_scraped_at?: string | null
          name?: string | null
          notes?: string | null
          platform_type?: string | null
          priority?: string | null
          quality_score?: number | null
          scraping_config?: Json | null
          source_locale?: string
          status?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          discovery_completed_at?: string | null
          id?: string
          last_scraped_at?: string | null
          name?: string | null
          notes?: string | null
          platform_type?: string | null
          priority?: string | null
          quality_score?: number | null
          scraping_config?: Json | null
          source_locale?: string
          status?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      textile_attributes: {
        Row: {
          category_id: string
          category_slug: string
          confidence: number | null
          created_at: string | null
          id: string
          source_locale: string | null
          source_term: string | null
          textile_id: string
          value: string
        }
        Insert: {
          category_id: string
          category_slug: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          source_locale?: string | null
          source_term?: string | null
          textile_id: string
          value: string
        }
        Update: {
          category_id?: string
          category_slug?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          source_locale?: string | null
          source_term?: string | null
          textile_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "textile_attributes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "attribute_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textile_attributes_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "active_textiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textile_attributes_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textile_attributes_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_low_confidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textile_attributes_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_needing_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textile_attributes_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_with_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      textiles: {
        Row: {
          additional_images: string[] | null
          available: boolean
          certifications: string[] | null
          color: string | null
          color_confidence: number | null
          color_original: string | null
          composition: Json | null
          created_at: string
          currency: string | null
          data_quality_score: number | null
          description: string | null
          description_i18n: Json | null
          id: string
          image_url: string | null
          material_confidence: number | null
          material_id: string | null
          material_original: string | null
          material_type: string | null
          minimum_order_unit: string | null
          minimum_order_value: number | null
          missing_fields: string[] | null
          name: string
          name_i18n: Json | null
          needs_review: boolean | null
          pattern: string | null
          pattern_confidence: number | null
          pattern_original: string | null
          price_currency: string | null
          price_per_unit: number | null
          price_per_unit_label: string | null
          price_value: number | null
          quantity_unit: string
          quantity_value: number
          raw_data: Json | null
          review_reasons: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          scraped_at: string
          search_vector: unknown
          site_id: string | null
          source_platform: string
          source_product_id: string | null
          source_url: string
          supplier_id: string | null
          supplier_location: string | null
          supplier_name: string | null
          supplier_url: string | null
          tags_original: string[] | null
          updated_at: string
          weight_unit: string | null
          weight_value: number | null
          width_unit: string | null
          width_value: number | null
        }
        Insert: {
          additional_images?: string[] | null
          available?: boolean
          certifications?: string[] | null
          color?: string | null
          color_confidence?: number | null
          color_original?: string | null
          composition?: Json | null
          created_at?: string
          currency?: string | null
          data_quality_score?: number | null
          description?: string | null
          description_i18n?: Json | null
          id?: string
          image_url?: string | null
          material_confidence?: number | null
          material_id?: string | null
          material_original?: string | null
          material_type?: string | null
          minimum_order_unit?: string | null
          minimum_order_value?: number | null
          missing_fields?: string[] | null
          name: string
          name_i18n?: Json | null
          needs_review?: boolean | null
          pattern?: string | null
          pattern_confidence?: number | null
          pattern_original?: string | null
          price_currency?: string | null
          price_per_unit?: number | null
          price_per_unit_label?: string | null
          price_value?: number | null
          quantity_unit: string
          quantity_value: number
          raw_data?: Json | null
          review_reasons?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scraped_at?: string
          search_vector?: unknown
          site_id?: string | null
          source_platform: string
          source_product_id?: string | null
          source_url: string
          supplier_id?: string | null
          supplier_location?: string | null
          supplier_name?: string | null
          supplier_url?: string | null
          tags_original?: string[] | null
          updated_at?: string
          weight_unit?: string | null
          weight_value?: number | null
          width_unit?: string | null
          width_value?: number | null
        }
        Update: {
          additional_images?: string[] | null
          available?: boolean
          certifications?: string[] | null
          color?: string | null
          color_confidence?: number | null
          color_original?: string | null
          composition?: Json | null
          created_at?: string
          currency?: string | null
          data_quality_score?: number | null
          description?: string | null
          description_i18n?: Json | null
          id?: string
          image_url?: string | null
          material_confidence?: number | null
          material_id?: string | null
          material_original?: string | null
          material_type?: string | null
          minimum_order_unit?: string | null
          minimum_order_value?: number | null
          missing_fields?: string[] | null
          name?: string
          name_i18n?: Json | null
          needs_review?: boolean | null
          pattern?: string | null
          pattern_confidence?: number | null
          pattern_original?: string | null
          price_currency?: string | null
          price_per_unit?: number | null
          price_per_unit_label?: string | null
          price_value?: number | null
          quantity_unit?: string
          quantity_value?: number
          raw_data?: Json | null
          review_reasons?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scraped_at?: string
          search_vector?: unknown
          site_id?: string | null
          source_platform?: string
          source_product_id?: string | null
          source_url?: string
          supplier_id?: string | null
          supplier_location?: string | null
          supplier_name?: string | null
          supplier_url?: string | null
          tags_original?: string[] | null
          updated_at?: string
          weight_unit?: string | null
          weight_value?: number | null
          width_unit?: string | null
          width_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "textiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      unknown_terms: {
        Row: {
          added_to_dict: boolean | null
          added_to_dict_at: string | null
          category: string
          contexts: Json | null
          created_at: string | null
          dict_type: string | null
          first_seen_at: string | null
          human_mapping: string | null
          id: string
          is_regex: boolean | null
          last_seen_at: string | null
          llm_calls_count: number | null
          llm_confidence: number | null
          llm_cost_total: number | null
          llm_reasoning: string | null
          llm_suggestion: string | null
          occurrences: number | null
          regex_pattern: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_platform: string | null
          status: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          added_to_dict?: boolean | null
          added_to_dict_at?: string | null
          category: string
          contexts?: Json | null
          created_at?: string | null
          dict_type?: string | null
          first_seen_at?: string | null
          human_mapping?: string | null
          id?: string
          is_regex?: boolean | null
          last_seen_at?: string | null
          llm_calls_count?: number | null
          llm_confidence?: number | null
          llm_cost_total?: number | null
          llm_reasoning?: string | null
          llm_suggestion?: string | null
          occurrences?: number | null
          regex_pattern?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_platform?: string | null
          status?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          added_to_dict?: boolean | null
          added_to_dict_at?: string | null
          category?: string
          contexts?: Json | null
          created_at?: string | null
          dict_type?: string | null
          first_seen_at?: string | null
          human_mapping?: string | null
          id?: string
          is_regex?: boolean | null
          last_seen_at?: string | null
          llm_calls_count?: number | null
          llm_confidence?: number | null
          llm_cost_total?: number | null
          llm_reasoning?: string | null
          llm_suggestion?: string | null
          occurrences?: number | null
          regex_pattern?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_platform?: string | null
          status?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          textile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          textile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          textile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "active_textiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_low_confidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_needing_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_textile_id_fkey"
            columns: ["textile_id"]
            isOneToOne: false
            referencedRelation: "textiles_with_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_textiles: {
        Row: {
          color: string | null
          created_at: string | null
          id: string | null
          image_url: string | null
          material_type: string | null
          name: string | null
          price_currency: string | null
          price_value: number | null
          quantity_unit: string | null
          quantity_value: number | null
          scraped_at: string | null
          source_platform: string | null
          source_url: string | null
          supplier_location: string | null
          supplier_name: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          material_type?: string | null
          name?: string | null
          price_currency?: string | null
          price_value?: number | null
          quantity_unit?: string | null
          quantity_value?: number | null
          scraped_at?: string | null
          source_platform?: string | null
          source_url?: string | null
          supplier_location?: string | null
          supplier_name?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          image_url?: string | null
          material_type?: string | null
          name?: string | null
          price_currency?: string | null
          price_value?: number | null
          quantity_unit?: string | null
          quantity_value?: number | null
          scraped_at?: string | null
          source_platform?: string | null
          source_url?: string | null
          supplier_location?: string | null
          supplier_name?: string | null
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          available_textiles: number | null
          avg_price_eur: number | null
          last_scraped: string | null
          source_platform: string | null
          total_textiles: number | null
          unique_materials: number | null
          unique_suppliers: number | null
        }
        Relationships: []
      }
      textiles_low_confidence: {
        Row: {
          avg_confidence: number | null
          color: string | null
          color_confidence: number | null
          data_quality_score: number | null
          id: string | null
          image_url: string | null
          material_confidence: number | null
          material_type: string | null
          name: string | null
          pattern: string | null
          pattern_confidence: number | null
          scraped_at: string | null
          source_platform: string | null
        }
        Insert: {
          avg_confidence?: never
          color?: string | null
          color_confidence?: number | null
          data_quality_score?: number | null
          id?: string | null
          image_url?: string | null
          material_confidence?: number | null
          material_type?: string | null
          name?: string | null
          pattern?: string | null
          pattern_confidence?: number | null
          scraped_at?: string | null
          source_platform?: string | null
        }
        Update: {
          avg_confidence?: never
          color?: string | null
          color_confidence?: number | null
          data_quality_score?: number | null
          id?: string | null
          image_url?: string | null
          material_confidence?: number | null
          material_type?: string | null
          name?: string | null
          pattern?: string | null
          pattern_confidence?: number | null
          scraped_at?: string | null
          source_platform?: string | null
        }
        Relationships: []
      }
      textiles_needing_review: {
        Row: {
          color: string | null
          color_confidence: number | null
          color_original: string | null
          created_at: string | null
          data_quality_score: number | null
          id: string | null
          image_url: string | null
          material_confidence: number | null
          material_original: string | null
          material_type: string | null
          name: string | null
          needs_review: boolean | null
          pattern: string | null
          pattern_confidence: number | null
          pattern_original: string | null
          review_reasons: Json | null
          scraped_at: string | null
          source_platform: string | null
          source_url: string | null
        }
        Insert: {
          color?: string | null
          color_confidence?: number | null
          color_original?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          id?: string | null
          image_url?: string | null
          material_confidence?: number | null
          material_original?: string | null
          material_type?: string | null
          name?: string | null
          needs_review?: boolean | null
          pattern?: string | null
          pattern_confidence?: number | null
          pattern_original?: string | null
          review_reasons?: Json | null
          scraped_at?: string | null
          source_platform?: string | null
          source_url?: string | null
        }
        Update: {
          color?: string | null
          color_confidence?: number | null
          color_original?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          id?: string | null
          image_url?: string | null
          material_confidence?: number | null
          material_original?: string | null
          material_type?: string | null
          name?: string | null
          needs_review?: boolean | null
          pattern?: string | null
          pattern_confidence?: number | null
          pattern_original?: string | null
          review_reasons?: Json | null
          scraped_at?: string | null
          source_platform?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      textiles_with_attributes: {
        Row: {
          additional_images: string[] | null
          available: boolean | null
          certifications: string[] | null
          color: string | null
          color_v2: string | null
          composition: Json | null
          created_at: string | null
          data_quality_score: number | null
          description: string | null
          description_i18n: Json | null
          id: string | null
          image_url: string | null
          material_id: string | null
          material_type: string | null
          material_type_v2: string | null
          minimum_order_unit: string | null
          minimum_order_value: number | null
          missing_fields: string[] | null
          name: string | null
          name_i18n: Json | null
          pattern: string | null
          pattern_v2: string | null
          price_currency: string | null
          price_per_unit: number | null
          price_per_unit_label: string | null
          price_value: number | null
          quantity_unit: string | null
          quantity_value: number | null
          raw_data: Json | null
          scraped_at: string | null
          search_vector: unknown
          source_platform: string | null
          source_product_id: string | null
          source_url: string | null
          supplier_id: string | null
          supplier_location: string | null
          supplier_name: string | null
          supplier_url: string | null
          updated_at: string | null
          weave_v2: string | null
          weight_unit: string | null
          weight_value: number | null
          width_unit: string | null
          width_value: number | null
        }
        Insert: {
          additional_images?: string[] | null
          available?: boolean | null
          certifications?: string[] | null
          color?: string | null
          color_v2?: never
          composition?: Json | null
          created_at?: string | null
          data_quality_score?: number | null
          description?: string | null
          description_i18n?: Json | null
          id?: string | null
          image_url?: string | null
          material_id?: string | null
          material_type?: string | null
          material_type_v2?: never
          minimum_order_unit?: string | null
          minimum_order_value?: number | null
          missing_fields?: string[] | null
          name?: string | null
          name_i18n?: Json | null
          pattern?: string | null
          pattern_v2?: never
          price_currency?: string | null
          price_per_unit?: number | null
          price_per_unit_label?: string | null
          price_value?: number | null
          quantity_unit?: string | null
          quantity_value?: number | null
          raw_data?: Json | null
          scraped_at?: string | null
          search_vector?: unknown
          source_platform?: string | null
          source_product_id?: string | null
          source_url?: string | null
          supplier_id?: string | null
          supplier_location?: string | null
          supplier_name?: string | null
          supplier_url?: string | null
          updated_at?: string | null
          weave_v2?: never
          weight_unit?: string | null
          weight_value?: number | null
          width_unit?: string | null
          width_value?: number | null
        }
        Update: {
          additional_images?: string[] | null
          available?: boolean | null
          certifications?: string[] | null
          color?: string | null
          color_v2?: never
          composition?: Json | null
          created_at?: string | null
          data_quality_score?: number | null
          description?: string | null
          description_i18n?: Json | null
          id?: string | null
          image_url?: string | null
          material_id?: string | null
          material_type?: string | null
          material_type_v2?: never
          minimum_order_unit?: string | null
          minimum_order_value?: number | null
          missing_fields?: string[] | null
          name?: string | null
          name_i18n?: Json | null
          pattern?: string | null
          pattern_v2?: never
          price_currency?: string | null
          price_per_unit?: number | null
          price_per_unit_label?: string | null
          price_value?: number | null
          quantity_unit?: string | null
          quantity_value?: number | null
          raw_data?: Json | null
          scraped_at?: string | null
          search_vector?: unknown
          source_platform?: string | null
          source_product_id?: string | null
          source_url?: string | null
          supplier_id?: string | null
          supplier_location?: string | null
          supplier_name?: string | null
          supplier_url?: string | null
          updated_at?: string | null
          weave_v2?: never
          weight_unit?: string | null
          weight_value?: number | null
          width_unit?: string | null
          width_value?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_category_by_slug: { Args: { p_slug: string }; Returns: string }
      get_searchable_categories: {
        Args: never
        Returns: {
          id: string
          level: number
          name: string
          parent_id: string
          slug: string
        }[]
      }
      get_translation: {
        Args: {
          p_fallback_locale?: string
          p_target_locale: string
          p_translations: Json
        }
        Returns: string
      }
      increment_mapping_usage: {
        Args: { p_mapping_id: string }
        Returns: undefined
      }
      increment_mapping_usage_i18n: {
        Args: {
          p_category: string
          p_source_locale: string
          p_source_term: string
        }
        Returns: undefined
      }
      increment_unknown_occurrence: {
        Args: {
          p_category: string
          p_context?: string
          p_source_platform?: string
          p_term: string
        }
        Returns: string
      }
      search_textiles: {
        Args: {
          color_filter?: string
          limit_count?: number
          material_filter?: string
          offset_count?: number
          search_query: string
        }
        Returns: {
          color: string
          id: string
          image_url: string
          material_type: string
          name: string
          price_currency: string
          price_value: number
          quantity_unit: string
          quantity_value: number
          rank: number
          source_platform: string
          source_url: string
          supplier_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  deadstock: {
    Enums: {},
  },
} as const
