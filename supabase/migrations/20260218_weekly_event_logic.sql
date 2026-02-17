-- Migration: Weekly Event Logic
-- Add columns to handle specific weekdays and time ranges for recurring events

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS active_weekday INTEGER, -- 1=Monday, 2=Tuesday, ..., 7=Sunday (ISO)
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '00:00:00',
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '23:59:59';

-- Update existing events with their weekly logic
-- Selasa Mega Sale (active_weekday = 2)
UPDATE events 
SET active_weekday = 2, 
    start_time = '00:00:00', 
    end_time = '23:59:59'
WHERE event_type = 'selasa_mega_sale';

-- Jum'at Berkah (active_weekday = 5)
UPDATE events 
SET active_weekday = 5, 
    start_time = '00:00:00', 
    end_time = '23:59:59'
WHERE event_type = 'jumat_berkah';
