import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Создаем тестового пользователя
  const hashedPassword = await hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: {
      username: "testuser",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });

  console.log({ user });

  // Создаем корты
  const courts = await Promise.all([
    // Грунтовые корты (1-5)
    prisma.court.upsert({
      where: { id: "clay_1" },
      update: {},
      create: {
        id: "clay_1",
        name: "Корт 1",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "clay_2" },
      update: {},
      create: {
        id: "clay_2",
        name: "Корт 2",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "clay_3" },
      update: {},
      create: {
        id: "clay_3",
        name: "Корт 3",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "clay_4" },
      update: {},
      create: {
        id: "clay_4",
        name: "Корт 4",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "clay_5" },
      update: {},
      create: {
        id: "clay_5",
        name: "Корт 5",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    // Хардовый корт
    prisma.court.upsert({
      where: { id: "hard_1" },
      update: {},
      create: {
        id: "hard_1",
        name: "Корт 6",
        description: "Хард",
        price: 1200,
        surface: "HARD",
      },
    }),
  ]);

  console.log({ courts });

  // Создаем временные слоты для каждого корта
  for (const court of courts) {
    for (let hour = 8; hour < 23; hour++) {
      const startTime = new Date();
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date();
      endTime.setHours(hour + 1, 0, 0, 0);

      await prisma.timeSlot.create({
        data: {
          courtId: court.id,
          startTime,
          endTime,
          isBooked: false,
        },
      });
    }
  }

  console.log("Тестовые данные успешно созданы");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 