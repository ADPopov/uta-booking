import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

type TimeSlot = {
  id: string;
  courtId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
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

        // Устанавливаем время в локальном часовом поясе
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(8, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 0, 0, 0);

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
        
        const availableSlots = slots.filter((slot) => {
          const slotStartTime = new Date(slot.startTime);
          const slotDate = new Date(slotStartTime);
          slotDate.setHours(0, 0, 0, 0);
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          
          // Если дата в будущем, показываем все слоты
          if (slotDate > today) {
            return true;
          }
          
          // Если дата сегодня, показываем только будущие слоты
          return slotStartTime > now;
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

        // Устанавливаем время в локальном часовом поясе
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(8, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 0, 0, 0);

        console.log("Диапазон поиска:", {
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString()
        });

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

        console.log("Найдено слотов:", slots.length);
        console.log("Слоты:", slots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          isBooked: slot.isBooked
        })));

        // Фильтруем слоты, оставляя только те, которые еще не наступили
        const now = new Date();
        console.log("Текущее время:", now.toISOString());
        
        const availableSlots = slots.filter((slot) => {
          const slotStartTime = new Date(slot.startTime);
          const slotDate = new Date(slotStartTime);
          slotDate.setHours(0, 0, 0, 0);
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);
          
          // Если дата в будущем, показываем все слоты
          if (slotDate > today) {
            return true;
          }
          
          // Если дата сегодня, показываем только будущие слоты
          return slotStartTime > now;
        });

        console.log("Доступных слотов:", availableSlots.length);
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
      isSplitTraining: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const timeSlot = await ctx.db.timeSlot.findUnique({
        where: { id: input.timeSlotId },
        include: { court: true },
      });

      if (!timeSlot) {
        throw new Error("Временной слот не найден");
      }

      if (timeSlot.isBooked) {
        throw new Error("Этот слот уже забронирован");
      }

      const booking = await ctx.db.booking.create({
        data: {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          courtId: timeSlot.courtId,
          userId: ctx.session.user.id,
          trainerId: input.trainerId,
          isSplitTraining: input.isSplitTraining ?? false,
        },
      });

      await ctx.db.timeSlot.update({
        where: { id: timeSlot.id },
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

  getUserBookings: protectedProcedure
    .query(async ({ ctx }) => {
      const bookings = await ctx.db.booking.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          court: true,
          trainer: {
            select: {
              id: true,
              name: true,
              price: true,
              childrenPrice: true,
            },
          },
        },
        orderBy: {
          startTime: "desc",
        },
      });

      return bookings;
    }),
}); 