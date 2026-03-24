-- ============================================================================
-- 001_enable_rls.sql
-- Enable Row Level Security on all 11 Store Ontology tables
-- ============================================================================
-- RLS ensures that no row is accessible unless an explicit policy grants it.
-- With RLS enabled and no policies, all queries return zero rows (deny-by-default).
-- Policies are defined in subsequent migration files.
-- ============================================================================

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
