-- ============================================================================
-- 003_owner_isolation.sql
-- Owner isolation — each store owner sees only their own stores and related data
-- ============================================================================
-- The owner_id is extracted from the Supabase JWT custom claim:
--   auth.jwt() ->> 'owner_id'
--
-- Data visibility chain:
--   owner → stores (direct via owner_id)
--        → contracts, devices, transactions, products, customers,
--          incidents, tax_records, insurance_policies (all via store_id)
--
-- Pattern: Every table that has a store_id column is filtered by:
--   store_id IN (SELECT store_id FROM stores WHERE owner_id matches JWT)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- owners: Owner can only see their own profile
-- ---------------------------------------------------------------------------
CREATE POLICY "owners_self_read" ON owners
  FOR SELECT
  USING (owner_id::text = auth.jwt() ->> 'owner_id');

-- ---------------------------------------------------------------------------
-- stores: Owner can only see their own stores
-- ---------------------------------------------------------------------------
CREATE POLICY "stores_owner_read" ON stores
  FOR SELECT
  USING (owner_id::text = auth.jwt() ->> 'owner_id');

-- ---------------------------------------------------------------------------
-- contracts: Owner can see contracts for their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "contracts_owner_read" ON contracts
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );

-- ---------------------------------------------------------------------------
-- devices: Owner can see devices linked to contracts in their stores
-- Join path: devices.contract_id → contracts.store_id → stores.owner_id
-- ---------------------------------------------------------------------------
CREATE POLICY "devices_owner_read" ON devices
  FOR SELECT
  USING (
    contract_id IN (
      SELECT contract_id FROM contracts
      WHERE store_id IN (
        SELECT store_id FROM stores
        WHERE owner_id::text = auth.jwt() ->> 'owner_id'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- transactions: Owner can see transactions in their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "transactions_owner_read" ON transactions
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );

-- ---------------------------------------------------------------------------
-- products: Owner can see products in their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "products_owner_read" ON products
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );

-- ---------------------------------------------------------------------------
-- customers: Owner can see customers linked to their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "customers_owner_read" ON customers
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );

-- ---------------------------------------------------------------------------
-- incidents: Owner can see incidents in their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "incidents_owner_read" ON incidents
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );

-- ---------------------------------------------------------------------------
-- tax_records: Owner can see tax records for their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "tax_records_owner_read" ON tax_records
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );

-- ---------------------------------------------------------------------------
-- insurance_policies: Owner can see insurance policies for their stores
-- ---------------------------------------------------------------------------
CREATE POLICY "insurance_policies_owner_read" ON insurance_policies
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM stores
      WHERE owner_id::text = auth.jwt() ->> 'owner_id'
    )
  );
