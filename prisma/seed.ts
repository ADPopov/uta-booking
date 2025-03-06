import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Создаем тестового пользователя
  const hashedPassword = await hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { username: "test" },
    update: {},
    create: {
      username: "test",
      password: hashedPassword,
      name: "Test User",
    },
  });

  console.log({ user });

  // Создаем корты
  const courts = await Promise.all([
    prisma.court.upsert({
      where: { id: "1" },
      update: {},
      create: {
        id: "1",
        name: "Корт 1",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "2" },
      update: {},
      create: {
        id: "2",
        name: "Корт 2",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "3" },
      update: {},
      create: {
        id: "3",
        name: "Корт 3",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "4" },
      update: {},
      create: {
        id: "4",
        name: "Корт 4",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "5" },
      update: {},
      create: {
        id: "5",
        name: "Корт 5",
        description: "Грунтовый корт",
        price: 1000,
        surface: "CLAY",
      },
    }),
    prisma.court.upsert({
      where: { id: "6" },
      update: {},
      create: {
        id: "6",
        name: "Корт 6",
        description: "Хард корт",
        price: 1500,
        surface: "HARD",
      },
    }),
  ]);

  console.log({ courts });

  // Создаем тренеров
  const trainers = await Promise.all([
    prisma.trainer.upsert({
      where: { id: "1" },
      update: {},
      create: {
        id: "1",
        name: "Александр Петров",
        description: "Мастер спорта, опыт работы 10 лет",
        price: 2000,
        photo: "/trainers/trainer1.jpg",
      },
    }),
    prisma.trainer.upsert({
      where: { id: "2" },
      update: {},
      create: {
        id: "2",
        name: "Мария Иванова",
        description: "Кандидат в мастера спорта, опыт работы 5 лет",
        price: 1800,
        photo: "/trainers/trainer2.jpg",
      },
    }),
    prisma.trainer.upsert({
      where: { id: "3" },
      update: {},
      create: {
        id: "3",
        name: "Дмитрий Сидоров",
        description: "Мастер спорта международного класса, опыт работы 15 лет",
        price: 2500,
        photo: "/trainers/trainer3.jpg",
      },
    }),
  ]);

  // Создаем временные слоты для каждого корта
  const now = new Date();
  const timeSlots = [];

  for (const court of courts) {
    for (let hour = 8; hour < 23; hour++) {
      const startTime = new Date(now);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(now);
      endTime.setHours(hour + 1, 0, 0, 0);

      timeSlots.push(
        prisma.timeSlot.create({
          data: {
            courtId: court.id,
            startTime,
            endTime,
            isBooked: false,
          },
        })
      );
    }
  }

  await Promise.all(timeSlots);

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