import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const trainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  photo: z.string().nullable(),
  price: z.number(),
  childrenPrice: z.number(),
  specialization: z.array(z.string()),
  experience: z.number(),
  achievements: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Trainer = z.infer<typeof trainerSchema>;

export const trainerRouter = createTRPCRouter({
  getAll: publicProcedure
    .output(z.array(trainerSchema))
    .query(async ({ ctx }) => {
      try {
        const trainers = await ctx.db.trainer.findMany({
          orderBy: {
            name: "asc",
          },
        });
        
        console.log("Найдены тренеры:", trainers);
        return trainers;
      } catch (error) {
        console.error("Ошибка при получении тренеров:", error);
        return [];
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(trainerSchema.nullable())
    .query(async ({ ctx, input }) => {
      try {
        const trainer = await ctx.db.trainer.findUnique({
          where: { id: input.id },
        });
        
        console.log("Найден тренер:", trainer);
        return trainer;
      } catch (error) {
        console.error("Ошибка при получении тренера:", error);
        return null;
      }
    }),

  getAvailableTimeSlots: protectedProcedure
    .input(z.object({ 
      trainerId: z.string(),
      date: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const selectedDate = new Date(input.date);
        if (isNaN(selectedDate.getTime())) {
          throw new Error("Неверный формат даты");
        }

        // Устанавливаем время в UTC
        const startOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 8, 0, 0));
        const endOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 0, 0));

        console.log("Поиск слотов для тренера:", {
          trainerId: input.trainerId,
          date: input.date,
          startOfDay,
          endOfDay,
        });

        // Получаем все слоты времени для тренера
        const bookings = await ctx.db.booking.findMany({
          where: {
            trainerId: input.trainerId,
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        });

        // Получаем все доступные слоты для выбранной даты
        const availableSlots = await ctx.db.timeSlot.findMany({
          where: {
            isBooked: false,
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            court: true,
          },
          orderBy: {
            startTime: "asc",
          },
        });

        console.log("Найдено бронирований:", bookings.length);
        console.log("Найдено доступных слотов:", availableSlots.length);

        // Фильтруем слоты, исключая те, которые пересекаются с бронированиями тренера
        const filteredSlots = availableSlots.filter((slot) => {
          return !bookings.some((booking) => {
            return (
              (slot.startTime >= booking.startTime && slot.startTime < booking.endTime) ||
              (slot.endTime > booking.startTime && slot.endTime <= booking.endTime)
            );
          });
        });

        console.log("Отфильтровано слотов:", filteredSlots.length);
        return filteredSlots;
      } catch (error) {
        console.error("Ошибка при получении доступных слотов:", error);
        return [];
      }
    }),
}); 