"use client";

import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ClockIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export default function BookingsPage() {
  const { data: bookings, isLoading } = api.court.getUserBookings.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-72 mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои бронирования</h1>
          <p className="text-muted-foreground">У вас пока нет активных бронирований</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Нет бронирований</h3>
            <p className="text-sm text-muted-foreground">Забронируйте корт, чтобы увидеть его здесь</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Мои бронирования</h1>
        <p className="text-muted-foreground">Управляйте вашими бронированиями</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking: { 
          id: string;
          court: {
            name: string;
            price: number;
          };
          startTime: Date;
          endTime: Date;
        }) => (
          <Card key={booking.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="font-medium">{booking.court.name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(booking.startTime), "d MMMM yyyy", { locale: ru })}
                  {" • "}
                  {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-primary">
                  <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                  {booking.court.price} ₽
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // TODO: Добавить функционал отмены бронирования
                  }}
                >
                  Отменить
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 