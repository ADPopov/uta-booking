"use client";

import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CalendarIcon, ClockIcon, CurrencyDollarIcon, XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: bookings, isLoading } = api.court.getUserBookings.useQuery();

  const cancelBooking = api.court.cancelBooking.useMutation({
    onSuccess: () => {
      utils.court.getUserBookings.invalidate();
      utils.court.getAvailableTimeSlots.invalidate();
    },
  });

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking.mutateAsync({ bookingId });
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои бронирования</h1>
          <p className="text-muted-foreground">
            У вас пока нет активных бронирований
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Нет бронирований</h3>
            <p className="text-sm text-muted-foreground">Забронируйте корт, чтобы увидеть его здесь</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/book")}
            >
              Забронировать корт
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Мои бронирования</h1>
        <p className="text-muted-foreground">
          Здесь вы можете увидеть все ваши бронирования
        </p>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="flex flex-col p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                  <div className="font-medium">
                    {format(new Date(booking.startTime), "PPP", { locale: ru })}
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {format(new Date(booking.startTime), "HH:mm")} -{" "}
                  {format(new Date(booking.endTime), "HH:mm")}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{booking.court.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.court.description}
                  </div>
                  {booking.trainerId && (
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-primary">
                        <UserIcon className="h-4 w-4 mr-1" />
                        Тренер: {booking.trainer?.name ?? "Не указан"}
                      </div>
                      {booking.isSplitTraining && (
                        <div className="text-sm text-gray-600">
                          Сплит-тренировка (+1000₽ с человека)
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm text-primary">
                      <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                      {booking.court.price} ₽
                    </div>
                    {booking.trainerId && (
                      <>
                        <div className="text-sm text-gray-600">
                          + {booking.trainer?.price ?? 0} ₽ (тренер)
                        </div>
                        {booking.isSplitTraining && (
                          <div className="text-sm text-gray-600">
                            + 2000 ₽ (сплит)
                          </div>
                        )}
                        <div className="text-sm font-semibold text-primary mt-1">
                          Итого: {booking.court.price + (booking.trainer?.price ?? 0) + (booking.isSplitTraining ? 2000 : 0)} ₽
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancelBooking.isPending}
                  >
                    {cancelBooking.isPending ? "..." : <XMarkIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 