-- ============================================================================
-- 004_service_role_bypass.sql
-- Service role bypass — full access for Balerion analytics and admin operations
-- ============================================================================
-- Supabase's service_role key automatically bypasses RLS by default.
-- These explicit policies serve two purposes:
--   1. Documentation of intent — makes it clear that service_role has full access
--   2. Defense in depth — if Supabase ever changes default bypass behavior,
--      these policies ensure service_role retains access
--
-- Usage: Balerion aggregated analytics, admin dashboards, cross-org reporting
-- The service_role key should NEVER be exposed to the client.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- owners
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_owners" ON owners
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- stores
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_stores" ON stores
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- providers
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_providers" ON providers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- contracts
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_contracts" ON contracts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- devices
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_devices" ON devices
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_transactions" ON transactions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_products" ON products
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_customers" ON customers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- incidents
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_incidents" ON incidents
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- tax_records
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_tax_records" ON tax_records
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- insurance_policies
-- ---------------------------------------------------------------------------
CREATE POLICY "service_role_full_access_insurance_policies" ON insurance_policies
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
