UPDATE "Trainer"
SET 
  "childrenPrice" = 1500,
  "specialization" = ARRAY['Дети', 'Взрослые', 'Профессионалы'],
  "experience" = 15,
  "achievements" = 'Первая ракетка мира, победитель международных турниров'
WHERE "name" = 'Серебрякова Дарья'; 