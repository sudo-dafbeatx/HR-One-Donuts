-- Add new theme customization columns to ui_theme
ALTER TABLE ui_theme 
ADD COLUMN IF NOT EXISTS card_bg_color varchar(9) NOT NULL DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS card_border_color varchar(9) NOT NULL DEFAULT '#e7edf3',
ADD COLUMN IF NOT EXISTS search_bg_color varchar(9) NOT NULL DEFAULT '#f1f5f9',
ADD COLUMN IF NOT EXISTS search_text_color varchar(9) NOT NULL DEFAULT '#64748b',
ADD COLUMN IF NOT EXISTS account_bg_color varchar(9) NOT NULL DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS account_text_color varchar(9) NOT NULL DEFAULT '#0f172a';
