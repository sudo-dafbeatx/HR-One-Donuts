-- Update WhatsApp number in site_settings
UPDATE site_settings
SET content = jsonb_set(
  content,
  '{whatsapp_number}',
  '"6285810658117"'
)
WHERE key = 'site_info';

-- Update phone number as well if needed (optional, keeping it consistent)
UPDATE site_settings
SET content = jsonb_set(
  content,
  '{phone_number}',
  '"+6285810658117"'
)
WHERE key = 'site_info';
