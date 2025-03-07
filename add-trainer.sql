INSERT INTO "Trainer" (
  "id",
  "name",
  "description",
  "price",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Серебрякова Дарья',
  'Первая ракетка мира',
  2000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
); 