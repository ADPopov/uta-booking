"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { CalendarIcon, ClockIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

type TimeSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  court: {
    name: string;
    description: string;
    price: number;
  };
};

export default function BookPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: timeSlots, isLoading } = api.court.getAvailableTimeSlots.useQuery(
    { date: format(selectedDate, "yyyy-MM-dd") },
    {
      enabled: Boolean(selectedDate),
    }
  );

  const groupedSlots = timeSlots?.reduce((acc: Record<string, TimeSlot[]>, slot: TimeSlot) => {
    const timeKey = format(new Date(slot.startTime), "HH:mm");
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(slot);
    return acc;
  }, {}) ?? {};

  const createBooking = api.court.createBooking.useMutation({
    onSuccess: () => {
      router.push("/bookings");
    },
  });

  const handleBooking = async (timeSlotId: string) => {
    try {
      await createBooking.mutateAsync({ timeSlotId });
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Бронирование корта</h1>
        <p className="text-muted-foreground">
          {selectedTime 
            ? "Выберите доступный корт на выбранное время"
            : "Выберите удобное время для бронирования"}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Выберите дату</CardTitle>
          <CardDescription>
            Выберите дату, чтобы увидеть доступные слоты
          </CardDescription>
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
                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                initialFocus
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !timeSlots || timeSlots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClockIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Нет доступных слотов</h3>
            <p className="text-sm text-muted-foreground">На выбранную дату нет доступных слотов</p>
          </CardContent>
        </Card>
      ) : selectedTime ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold">{selectedTime}</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTime(null)}
            >
              Назад к выбору времени
            </Button>
          </div>
          <div className="grid gap-4">
            {(groupedSlots[selectedTime] as TimeSlot[]).map((slot) => (
              <Card key={slot.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="font-medium">{slot.court.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {slot.court.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm text-primary">
                      <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                      {slot.court.price} ₽
                    </div>
                    <Button
                      onClick={() => handleBooking(slot.id)}
                      disabled={createBooking.isPending}
                      size="sm"
                    >
                      {createBooking.isPending ? "..." : "Забронировать"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Object.entries(groupedSlots)
            .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
            .map(([time, slots]) => (
              <Card 
                key={time} 
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTime(time)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <ClockIcon className="h-6 w-6 text-primary mb-1" />
                  <div className="text-lg font-bold mb-1">{time}</div>
                  <div className="text-xs text-muted-foreground">
                    {(slots as TimeSlot[]).length} корт
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
} 