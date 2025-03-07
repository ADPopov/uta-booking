import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { startOfDay, endOfDay } from "date-fns";

export const adminRouter = createTRPCRouter({
  getBookingsByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const startDate = startOfDay(new Date(input.date));
      const endDate = endOfDay(new Date(input.date));

      return ctx.db.booking.findMany({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          court: true,
          user: true,
          trainer: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });
    }),

  cancelBooking: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Находим и удаляем бронирование
      const booking = await ctx.db.booking.delete({
        where: { id: input.bookingId },
      });

      if (!booking) {
        throw new Error("Бронирование не найдено");
      }

      return booking;
    }),
}); 