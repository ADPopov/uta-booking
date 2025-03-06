import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { TimeSlot } from "~/types/prisma";

type TimeSlotWithCourt = TimeSlot & {
  court: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    surface: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

interface Court {
  id: string;
  name: string;
  description: string | null;
  price: number;
  surface: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TimeSlot {
  id: string;
  courtId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
  court: Court;
}

export const courtRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.court.findMany();
  }),

  getTimeSlots: publicProcedure
    .input(z.object({ 
      courtId: z.string(),
      date: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        console.log("Получен запрос на слоты времени:", { courtId: input.courtId, date: input.date });
        
        const selectedDate = new Date(input.date);
        if (isNaN(selectedDate.getTime())) {
          throw new Error("Неверный формат даты");
        }

        // Устанавливаем время в UTC
        const startOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59, 999));

        console.log("Диапазон поиска:", {
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString()
        });

        // Получаем все слоты для выбранной даты
        const slots = await ctx.db.timeSlot.findMany({
          where: {
            courtId: input.courtId,
            isBooked: false,
            startTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: {
            startTime: "asc",
          },
        });

        console.log("Найдено слотов:", slots.length);
        console.log("Слоты:", slots.map((slot: TimeSlot) => ({
          id: slot.id,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          isBooked: slot.isBooked
        })));

        // Фильтруем слоты, оставляя только те, которые еще не наступили
        const now = new Date();
        console.log("Текущее время:", now.toISOString());
        
        const availableSlots = slots.filter((slot: TimeSlot) => {
          const slotStartTime = new Date(slot.startTime);
          const isAvailable = slotStartTime > now;
          console.log("Слот:", {
            startTime: slotStartTime.toISOString(),
            isAvailable
          });
          return isAvailable;
        });

        console.log("Доступных слотов:", availableSlots.length);
        return availableSlots;
      } catch (error) {
        console.error("Ошибка при получении слотов времени:", error);
        return [];
      }
    }),

  getBookings: protectedProcedure
    .input(z.object({ courtId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.booking.findMany({
        where: {
          courtId: input.courtId,
        },
        include: {
          user: true,
        },
      });
    }),

  getAvailableTimeSlots: publicProcedure
    .input(z.object({ 
      date: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        console.log("Получен запрос на доступные слоты:", { date: input.date });
        
        const selectedDate = new Date(input.date);
        if (isNaN(selectedDate.getTime())) {
          throw new Error("Неверный формат даты");
        }

        // Устанавливаем время в UTC
        const startOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 8, 0, 0));
        const endOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 0, 0));

        // Получаем все доступные слоты для выбранной даты
        const slots = await ctx.db.timeSlot.findMany({
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
        const availableSlots = slots.filter((slot: TimeSlot) => {
          const slotStartTime = new Date(slot.startTime);
          return slotStartTime > now;
        });

        return availableSlots;
      } catch (error) {
        console.error("Ошибка при получении доступных слотов:", error);
        return [];
      }
    }),

  createBooking: protectedProcedure
    .input(z.object({ 
      timeSlotId: z.string(),
      trainerId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const timeSlot = await ctx.db.timeSlot.findUnique({
        where: { id: input.timeSlotId },
        include: { court: true },
      });

      if (!timeSlot) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Слот не найден",
        });
      }

      if (timeSlot.isBooked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Этот слот уже забронирован",
        });
      }

      // Проверяем, не забронирован ли тренер на это время
      if (input.trainerId) {
        const trainerBooking = await ctx.db.booking.findFirst({
          where: {
            trainerId: input.trainerId,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
          },
        });

        if (trainerBooking) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Тренер уже занят на это время",
          });
        }
      }

      // Создаем бронирование
      const booking = await ctx.db.booking.create({
        data: {
          courtId: timeSlot.courtId,
          userId: ctx.session.user.id,
          trainerId: input.trainerId,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        },
      });

      // Обновляем статус слота
      await ctx.db.timeSlot.update({
        where: { id: input.timeSlotId },
        data: { isBooked: true },
      });

      return booking;
    }),

  cancelBooking: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: { court: true },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Бронирование не найдено",
        });
      }

      if (booking.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "У вас нет прав для отмены этого бронирования",
        });
      }

      // Находим и обновляем слот
      const timeSlot = await ctx.db.timeSlot.findFirst({
        where: {
          courtId: booking.courtId,
          startTime: booking.startTime,
          endTime: booking.endTime,
        },
      });

      if (timeSlot) {
        await ctx.db.timeSlot.update({
          where: { id: timeSlot.id },
          data: { isBooked: false },
        });
      }

      // Удаляем бронирование
      await ctx.db.booking.delete({
        where: { id: input.bookingId },
      });

      return { success: true };
    }),

  getUserBookings: protectedProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.db.booking.findMany({
      where: {
        userId: ctx.session.user.id,
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        court: true,
        trainer: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return bookings;
  }),
}); 