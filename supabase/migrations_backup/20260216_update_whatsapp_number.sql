-- Update WhatsApp number in settings table
UPDATE settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{whatsapp_number}',
  '"6285810658117"'
)
WHERE key = 'site_info';

-- Update phone number as well if needed (optional, keeping it consistent)
UPDATE settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{phone_number}',
  '"+6285810658117"'
)
WHERE key = 'site_info';
