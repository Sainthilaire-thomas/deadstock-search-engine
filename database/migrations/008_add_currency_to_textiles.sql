-- ============================================================================
-- Migration 008: Add currency column to textiles table
-- ============================================================================

-- Add currency column (3-letter ISO code: EUR, USD, GBP, etc.)
ALTER TABLE deadstock.textiles 
ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';

-- Add comment
COMMENT ON COLUMN deadstock.textiles.currency IS 
'ISO 4217 currency code (EUR, USD, GBP, etc.)';

-- Create index for filtering by currency
CREATE INDEX idx_textiles_currency 
ON deadstock.textiles(currency);

-- Update existing records to EUR (default for EU shops)
UPDATE deadstock.textiles 
SET currency = 'EUR' 
WHERE currency IS NULL;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Currency column added to textiles table';
END $$;
