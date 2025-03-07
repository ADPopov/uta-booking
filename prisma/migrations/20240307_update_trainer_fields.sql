-- Переименовываем поле adult_price обратно в price
ALTER TABLE "Trainer" RENAME COLUMN "adult_price" TO "price";

-- Обновляем данные тренера
UPDATE "Trainer"
SET 
  "price" = 2000,
  "childrenPrice" = 1500,
  "specialization" = ARRAY['Дети', 'Взрослые', 'Профессионалы'],
  "experience" = 15,
  "achievements" = 'Первая ракетка мира, победитель международных турниров'
WHERE "name" = 'Серебрякова Дарья'; 