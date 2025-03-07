"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { CalendarIcon, ClockIcon, UserIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";

export default function AdminPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const utils = api.useUtils();
  
  const { data: bookings, isLoading } = api.admin.getBookingsByDate.useQuery({
    date: format(selectedDate, "yyyy-MM-dd"),
  });

  const cancelBooking = api.admin.cancelBooking.useMutation({
    onSuccess: () => {
      toast.success("Бронирование успешно отменено");
      utils.admin.getBookingsByDate.invalidate();
      setBookingToCancel(null);
    },
    onError: (error) => {
      toast.error(`Ошибка при отмене бронирования: ${error.message}`);
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      await cancelBooking.mutateAsync({ bookingId: bookingToCancel });
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const clayBookings = bookings?.filter(booking => booking.court.surface === "CLAY") ?? [];
  const hardBookings = bookings?.filter(booking => booking.court.surface === "HARD") ?? [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Панель администратора</h1>
          <p className="text-muted-foreground">
            Управление бронированиями кортов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Всего бронирований: {bookings?.length ?? 0}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Грунт: {clayBookings.length}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Хард: {hardBookings.length}
          </Badge>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Выберите дату</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : "Выберите дату"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Грунтовые корты */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Грунтовые корты</Badge>
              <span className="text-sm text-muted-foreground">({clayBookings.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {clayBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет бронирований на выбранную дату
                </div>
              ) : (
                clayBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden transition-all hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-medium">
                              {booking.court.name}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{booking.user.name || booking.user.username}</span>
                          </div>
                          {booking.trainer && (
                            <div className="flex items-center gap-1 text-sm">
                              <AcademicCapIcon className="h-4 w-4" />
                              <span>{booking.trainer.name}</span>
                              {booking.isSplitTraining && (
                                <Badge variant="secondary" className="ml-2">
                                  Сплит
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setBookingToCancel(booking.id)}
                          className="shrink-0"
                        >
                          Отменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Хардовые корты */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Хардовые корты</Badge>
              <span className="text-sm text-muted-foreground">({hardBookings.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {hardBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет бронирований на выбранную дату
                </div>
              ) : (
                hardBookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden transition-all hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-medium">
                              {booking.court.name}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{booking.user.name || booking.user.username}</span>
                          </div>
                          {booking.trainer && (
                            <div className="flex items-center gap-1 text-sm">
                              <AcademicCapIcon className="h-4 w-4" />
                              <span>{booking.trainer.name}</span>
                              {booking.isSplitTraining && (
                                <Badge variant="secondary" className="ml-2">
                                  Сплит
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setBookingToCancel(booking.id)}
                          className="shrink-0"
                        >
                          Отменить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение отмены</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отменить это бронирование? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingToCancel(null)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? "Отмена..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 