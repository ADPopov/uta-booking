import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const trainerRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.trainer.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.trainer.findUnique({
        where: { id: input.id },
      });
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

        // Фильтруем слоты, оставляя только те, которые еще не наступили
        const now = new Date();
        const futureSlots = availableSlots.filter(slot => {
          const slotStartTime = new Date(slot.startTime);
          return slotStartTime > now;
        });

        // Исключаем слоты, которые уже забронированы с тренером
        const availableSlotsWithTrainer = futureSlots.filter(slot => {
          return !bookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            const slotStart = new Date(slot.startTime);
            const slotEnd = new Date(slot.endTime);
            return slotStart >= bookingStart && slotEnd <= bookingEnd;
          });
        });

        return availableSlotsWithTrainer;
      } catch (error) {
        console.error("Ошибка при получении доступных слотов тренера:", error);
        return [];
      }
    }),
}); 