-- Добавляем новые поля в таблицу Trainer
ALTER TABLE "Trainer" 
ADD COLUMN IF NOT EXISTS "childrenPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "achievements" TEXT;

-- Обновляем данные существующего тренера
UPDATE "Trainer"
SET 
  "price" = 2000,
  "childrenPrice" = 1500,
  "specialization" = ARRAY['Дети', 'Взрослые', 'Профессионалы']::TEXT[],
  "experience" = 15,
  "achievements" = 'Первая ракетка мира, победитель международных турниров'
WHERE "name" = 'Серебрякова Дарья'; 