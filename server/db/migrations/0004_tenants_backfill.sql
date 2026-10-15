-- Backfill: move a pre-multi-tenant (single mosque) database into ONE tenant.
-- Idempotent and a no-op on a fresh database.
DO $$
DECLARE
  tid uuid;
  slug_candidate text;
  has_data boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM users WHERE tenant_id IS NULL)
      OR EXISTS (SELECT 1 FROM mosque_profile WHERE tenant_id IS NULL)
      OR EXISTS (SELECT 1 FROM categories WHERE tenant_id IS NULL)
      OR EXISTS (SELECT 1 FROM events WHERE tenant_id IS NULL)
      OR EXISTS (SELECT 1 FROM cash_accounts WHERE tenant_id IS NULL)
      OR EXISTS (SELECT 1 FROM transaction_categories WHERE tenant_id IS NULL)
    INTO has_data;
  IF NOT has_data THEN
    RETURN;
  END IF;

  SELECT id INTO tid FROM tenants ORDER BY created_at LIMIT 1;

  IF tid IS NULL THEN
    SELECT trim(BOTH '-' FROM regexp_replace(lower(coalesce(mp.slug, mp.name, '')), '[^a-z0-9]+', '-', 'g'))
      INTO slug_candidate
      FROM mosque_profile mp
      LIMIT 1;
    IF slug_candidate IS NULL OR slug_candidate !~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$' THEN
      slug_candidate := 'masjid';
    END IF;

    INSERT INTO tenants (slug, name)
    VALUES (
      slug_candidate,
      coalesce((SELECT name FROM mosque_profile LIMIT 1), 'Masjid')
    )
    RETURNING id INTO tid;
  END IF;

  UPDATE users SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE mosque_profile SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE categories SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE events SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE event_speakers SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE event_agenda_items SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE registrants SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE cash_accounts SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE transaction_categories SET tenant_id = tid WHERE tenant_id IS NULL;
  UPDATE transactions SET tenant_id = tid WHERE tenant_id IS NULL;

  -- Earliest active admin becomes the owner.
  UPDATE tenants
     SET owner_user_id = (
       SELECT id FROM users
        WHERE tenant_id = tid AND role = 'admin' AND deleted_at IS NULL
        ORDER BY created_at
        LIMIT 1
     )
   WHERE id = tid AND owner_user_id IS NULL;
END $$;
