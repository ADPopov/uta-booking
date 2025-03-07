-- Переименовываем существующее поле price в adult_price
ALTER TABLE "Trainer" RENAME COLUMN "price" TO "adult_price";

-- Добавляем новые поля
ALTER TABLE "Trainer" 
  ADD COLUMN "childrenPrice" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "experience" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "achievements" TEXT; 