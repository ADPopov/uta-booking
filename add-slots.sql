-- Добавляем слоты на следующие несколько дней
INSERT INTO "TimeSlot" ("id", "courtId", "startTime", "endTime", "isBooked", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  c.id,
  (CURRENT_DATE + (n || ' days')::interval + (h || ' hours')::interval)::timestamp,
  (CURRENT_DATE + (n || ' days')::interval + ((h + 1) || ' hours')::interval)::timestamp,
  CASE WHEN random() < 0.3 THEN true ELSE false END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM 
  "Court" c,
  generate_series(0, 2) n, -- Следующие 3 дня
  generate_series(8, 22) h; -- С 8:00 до 23:00 