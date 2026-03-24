-- ============================================================================
-- 002_provider_isolation.sql
-- Provider isolation — Palantir multi-org pattern
-- ============================================================================
-- Key concept: Each Provider (e.g., CAPS, S1) can ONLY see data related to
-- their own contracts. CAPS data must never be visible to S1, and vice versa.
--
-- The provider_id is extracted from the Supabase JWT custom claim:
--   auth.jwt() ->> 'provider_id'
--
-- Data visibility chain:
--   provider → contracts (direct) → devices (via contract_id)
--                                 → stores (via contract store_id)
--                                 → incidents (via store_id from contracts)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- providers: Each provider can only read their own row
-- ---------------------------------------------------------------------------
CREATE POLICY "providers_self_read" ON providers
  FOR SELECT
  USING (provider_id::text = auth.jwt() ->> 'provider_id');

-- ---------------------------------------------------------------------------
-- contracts: Provider can only see contracts where they are the provider
-- ---------------------------------------------------------------------------
CREATE POLICY "contracts_provider_read" ON contracts
  FOR SELECT
  USING (provider_id::text = auth.jwt() ->> 'provider_id');

-- ---------------------------------------------------------------------------
-- devices: Provider can see devices linked to their contracts
-- Join path: devices.contract_id → contracts.contract_id
-- ---------------------------------------------------------------------------
CREATE POLICY "devices_provider_read" ON devices
  FOR SELECT
  USING (
    contract_id IN (
      SELECT contract_id FROM contracts
      WHERE provider_id::text = auth.jwt() ->> 'provider_id'
    )
  );

-- ---------------------------------------------------------------------------
-- stores: Provider can see stores where they have active contracts
-- This allows providers to see store metadata for their serviced locations.
-- ---------------------------------------------------------------------------
CREATE POLICY "stores_provider_read" ON stores
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM contracts
      WHERE provider_id::text = auth.jwt() ->> 'provider_id'
    )
  );

-- ---------------------------------------------------------------------------
-- incidents: Provider can see incidents in stores where they have contracts
-- Join path: incidents.store_id → contracts.store_id (filtered by provider)
-- ---------------------------------------------------------------------------
CREATE POLICY "incidents_provider_read" ON incidents
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM contracts
      WHERE provider_id::text = auth.jwt() ->> 'provider_id'
    )
  );

-- ---------------------------------------------------------------------------
-- transactions: Provider can see transactions in their contracted stores
-- Useful for providers that need sales data for analytics/reporting.
-- ---------------------------------------------------------------------------
CREATE POLICY "transactions_provider_read" ON transactions
  FOR SELECT
  USING (
    store_id IN (
      SELECT store_id FROM contracts
      WHERE provider_id::text = auth.jwt() ->> 'provider_id'
    )
  );
