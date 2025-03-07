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
  const trainers = [
    {
      id: "trainer-1",
      name: "Егор Ромашов",
      description: "Специализируется на тренировках для взрослых и турнирных игроков",
      photo: "/images/trainers/trainer-1.jpg",
      price: 2200,
      childrenPrice: 2000,
      specialization: ["Взрослые", "Турнирные игроки"],
      experience: 8,
      achievements: "Мастер спорта по теннису, победитель международных турниров",
    },
    {
      id: "trainer-2",
      name: "Степан Радус",
      description: "Профессиональный тренер для взрослых и детей",
      photo: "/images/trainers/trainer-2.jpg",
      price: 1900,
      childrenPrice: 1700,
      specialization: ["Взрослые", "Дети"],
      experience: 5,
      achievements: "КМС по теннису",
    },
    {
      id: "trainer-3",
      name: "Арсений Токарь",
      description: "Опытный тренер, специализирующийся на индивидуальных и групповых занятиях",
      photo: "/images/trainers/trainer-3.jpg",
      price: 1800,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети", "Группы"],
      experience: 6,
      achievements: "Тренер высшей категории",
    },
    {
      id: "trainer-4",
      name: "Елизавета Хабарова",
      description: "Специализируется на работе со взрослыми и детьми",
      photo: "/images/trainers/trainer-4.jpg",
      price: 1700,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети"],
      experience: 4,
      achievements: "КМС по теннису",
    },
    {
      id: "trainer-5",
      name: "Анастасия Ушакова",
      description: "Профессиональный тренер для взрослых и детей",
      photo: "/images/trainers/trainer-5.jpg",
      price: 1700,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети"],
      experience: 5,
      achievements: "Мастер спорта по теннису",
    },
    {
      id: "trainer-6",
      name: "Сергей Волков",
      description: "Специализируется на индивидуальных тренировках",
      photo: "/images/trainers/trainer-6.jpg",
      price: 1600,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети"],
      experience: 3,
      achievements: "КМС по теннису",
    },
    {
      id: "trainer-7",
      name: "Мартин Петросян",
      description: "Опытный тренер для всех возрастов и уровней подготовки",
      photo: "/images/trainers/trainer-7.jpg",
      price: 1700,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети", "Группы"],
      experience: 7,
      achievements: "Тренер высшей категории",
    },
    {
      id: "trainer-8",
      name: "Саида Хакимова",
      description: "Специализируется на индивидуальных тренировках",
      photo: "/images/trainers/trainer-8.jpg",
      price: 1600,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети"],
      experience: 4,
      achievements: "КМС по теннису",
    },
    {
      id: "trainer-9",
      name: "Иван Васюра",
      description: "Тренер для всех возрастных групп",
      photo: "/images/trainers/trainer-9.jpg",
      price: 1500,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети", "Группы"],
      experience: 5,
      achievements: "Тренер первой категории",
    },
    {
      id: "trainer-10",
      name: "Екатерина Макрушина",
      description: "Опытный тренер для индивидуальных и групповых занятий",
      photo: "/images/trainers/trainer-10.jpg",
      price: 1800,
      childrenPrice: 1500,
      specialization: ["Взрослые", "Дети", "Группы"],
      experience: 6,
      achievements: "Мастер спорта по теннису",
    },
    {
      id: "trainer-11",
      name: "Ирина Каурова",
      description: "Специализируется на работе с детьми",
      photo: "/images/trainers/trainer-11.jpg",
      price: 1200,
      childrenPrice: 1200,
      specialization: ["Дети", "Группы"],
      experience: 3,
      achievements: "Специализация на работе с детьми",
    },
    {
      id: "trainer-12",
      name: "Марк Лаштабов",
      description: "Тренер для всех возрастных групп",
      photo: "/images/trainers/trainer-12.jpg",
      price: 1500,
      childrenPrice: 1400,
      specialization: ["Взрослые", "Дети", "Группы"],
      experience: 4,
      achievements: "Тренер первой категории",
    },
  ];

  console.log({ trainers });

  // Создаем тренеров
  await Promise.all(
    trainers.map((trainer) =>
      prisma.trainer.upsert({
        where: { id: trainer.id },
        update: trainer,
        create: trainer,
      })
    )
  );

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