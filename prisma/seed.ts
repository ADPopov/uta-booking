import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_UNPOOLED,
    },
  },
});

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
      where: { id: "trainer-1" },
      update: {},
      create: {
        id: "trainer-1",
        name: "Егор Ромашов",
        description: "Индивидуальные тренировки - 2200р, Взрослые группы - 2000р, Тренировки для турнирных игроков - 2500р",
        photo: "/images/trainers/trainer-1.jpg",
        price: 2200,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-2" },
      update: {},
      create: {
        id: "trainer-2",
        name: "Степан Радус",
        description: "Индивидуальные тренировки - 1900р",
        photo: "/images/trainers/trainer-2.jpg",
        price: 1900,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-3" },
      update: {},
      create: {
        id: "trainer-3",
        name: "Арсений Токарь",
        description: "Индивидуальные тренировки (взрослые) - 1800р, Индивидуальные тренировки (дети до 16 лет) - 1500р, Детские группы - 800р по абонементу/ 1000р разовое занятие, Взрослые группы - 2000р",
        photo: "/images/trainers/trainer-3.jpg",
        price: 1800,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-4" },
      update: {},
      create: {
        id: "trainer-4",
        name: "Елизавета Хабарова",
        description: "Индивидуальные тренировки (взрослые) - 1700р, Индивидуальные тренировки (дети до 16 лет) - 1500р",
        photo: "/images/trainers/trainer-4.jpg",
        price: 1700,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-5" },
      update: {},
      create: {
        id: "trainer-5",
        name: "Анастасия Ушакова",
        description: "Индивидуальные тренировки (взрослые) - 1700р, Индивидуальные тренировки (дети до 16 лет) - 1500р",
        photo: "/images/trainers/trainer-5.jpg",
        price: 1700,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-6" },
      update: {},
      create: {
        id: "trainer-6",
        name: "Сергей Волков",
        description: "Индивидуальные тренировки (взрослые) - 1600р, Индивидуальные тренировки (дети до 16 лет) - 1500р",
        photo: "/images/trainers/trainer-6.jpg",
        price: 1600,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-7" },
      update: {},
      create: {
        id: "trainer-7",
        name: "Мартин Петросян",
        description: "Индивидуальные тренировки - 1700р, Детская группа - 600р по абонементу/ 750р разовое занятие",
        photo: "/images/trainers/trainer-7.jpg",
        price: 1700,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-8" },
      update: {},
      create: {
        id: "trainer-8",
        name: "Саида Хакимова",
        description: "Индивидуальные тренировки (взрослые) - 1600р, Индивидуальные тренировки (дети до 16 лет) - 1500р",
        photo: "/images/trainers/trainer-8.jpg",
        price: 1600,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-9" },
      update: {},
      create: {
        id: "trainer-9",
        name: "Иван Васюра",
        description: "Индивидуальные тренировки (взрослые и дети) - 1500р, Детские группы - 800р по абонементу/ 1000р разовое занятие",
        photo: "/images/trainers/trainer-9.jpg",
        price: 1500,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-10" },
      update: {},
      create: {
        id: "trainer-10",
        name: "Екатерина Макрушина",
        description: "Индивидуальные тренировки (взрослые) - 1800р, Индивидуальные тренировки (дети до 16 лет) - 1500р, Взрослые группы - 1500р",
        photo: "/images/trainers/trainer-10.jpg",
        price: 1800,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-11" },
      update: {},
      create: {
        id: "trainer-11",
        name: "Ирина Каурова",
        description: "Индивидуальные тренировки (дети до 16 лет) - 1200р, Детские группы - 800р по абонементу/ 1000р разовое занятие",
        photo: "/images/trainers/trainer-11.jpg",
        price: 1200,
      },
    }),
    prisma.trainer.upsert({
      where: { id: "trainer-12" },
      update: {},
      create: {
        id: "trainer-12",
        name: "Марк Лаштабов",
        description: "Индивидуальные тренировки (взрослые) - 1500р, Индивидуальные тренировки (дети до 16 лет) - 1400р, Детские группы - 1000р разовое занятие",
        photo: "/images/trainers/trainer-12.jpg",
        price: 1500,
      },
    }),
  ]);

  console.log({ trainers });

  // Создаем временные слоты для каждого корта
  const now = new Date();
  const timeSlots = [];

  // Создаем слоты на ближайшие 30 дней
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(now);
    currentDate.setDate(currentDate.getDate() + day);

    for (const court of courts) {
      // Создаем слоты с 8:00 до 23:00
      for (let hour = 8; hour < 23; hour++) {
        const startTime = new Date(currentDate);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(hour + 1, 0, 0, 0);

        // Случайным образом делаем некоторые слоты забронированными
        const isBooked = Math.random() < 0.3; // 30% слотов будут забронированы

        timeSlots.push({
          courtId: court.id,
          startTime,
          endTime,
          isBooked,
        });
      }
    }
  }

  // Создаем слоты пакетами по 100 штук
  const batchSize = 100;
  for (let i = 0; i < timeSlots.length; i += batchSize) {
    const batch = timeSlots.slice(i, i + batchSize);
    await Promise.all(
      batch.map((slot) =>
        prisma.timeSlot.upsert({
          where: {
            courtId_startTime_endTime: {
              courtId: slot.courtId,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          },
          update: {},
          create: slot,
        })
      )
    );
    console.log(`Created batch ${i / batchSize + 1} of ${Math.ceil(timeSlots.length / batchSize)}`);
  }

  console.log("Created all time slots");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 