import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Создаем тестового пользователя
  const hashedPassword = await hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      username: "testuser",
      password: hashedPassword,
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
        name: "Корт №1",
        description: "Крытый корт с профессиональным покрытием",
        price: 1500,
      },
    }),
    prisma.court.upsert({
      where: { id: "2" },
      update: {},
      create: {
        id: "2",
        name: "Корт №2",
        description: "Открытый корт с искусственным покрытием",
        price: 1200,
      },
    }),
    prisma.court.upsert({
      where: { id: "3" },
      update: {},
      create: {
        id: "3",
        name: "Корт №3",
        description: "Крытый корт с синтетическим покрытием",
        price: 1300,
      },
    }),
  ]);

  console.log({ courts });

  // Создаем слоты времени для каждого корта
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));

  // Создаем слоты на сегодня
  for (const court of courts) {
    // Создаем слоты с 8:00 до 23:00 с интервалом в 1 час
    for (let hour = 8; hour < 23; hour++) {
      const startTime = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), hour, 0, 0));
      const endTime = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), hour + 1, 0, 0));

      await prisma.timeSlot.upsert({
        where: {
          courtId_startTime_endTime: {
            courtId: court.id,
            startTime: startTime,
            endTime: endTime,
          },
        },
        update: {},
        create: {
          courtId: court.id,
          startTime: startTime,
          endTime: endTime,
          isBooked: false,
        },
      });
    }
  }

  // Создаем слоты на несколько дней вперед
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    
    for (const court of courts) {
      // Создаем слоты с 8:00 до 23:00 с интервалом в 1 час
      for (let hour = 8; hour < 23; hour++) {
        const startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour, 0, 0));
        const endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour + 1, 0, 0));

        await prisma.timeSlot.upsert({
          where: {
            courtId_startTime_endTime: {
              courtId: court.id,
              startTime: startTime,
              endTime: endTime,
            },
          },
          update: {},
          create: {
            courtId: court.id,
            startTime: startTime,
            endTime: endTime,
            isBooked: false,
          },
        });
      }
    }
  }

  console.log("Добавлены слоты времени для всех кортов");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 