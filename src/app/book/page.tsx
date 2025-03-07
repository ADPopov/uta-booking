"use client";

import { useState, useEffect } from "react";
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
import { TrainerSelect } from "./_components/trainer-select";
import { useSession } from "next-auth/react";
import { BookingConfirmation } from "./_components/booking-confirmation";
import type { Trainer } from "~/server/api/routers/trainer";

type TimeSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  court: {
    name: string;
    description: string | null;
    price: number;
    surface: string;
    id: string;
  };
};

type GroupedSlots = Record<string, TimeSlot[]>;

export default function BookPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const utils = api.useUtils();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isSplitTraining, setIsSplitTraining] = useState(false);
  const [showTrainerSelect, setShowTrainerSelect] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [ageGroup, setAgeGroup] = useState<"adult" | "children">(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ageGroup') as "adult" | "children" || "adult";
    }
    return "adult";
  });

  const { data: timeSlots, isLoading } = api.court.getAvailableTimeSlots.useQuery(
    { date: format(selectedDate, "yyyy-MM-dd") },
    {
      enabled: Boolean(selectedDate) && status === "authenticated",
    }
  );

  const { data: trainerTimeSlots } = api.trainer.getAvailableTimeSlots.useQuery(
    { 
      trainerId: selectedTrainerId ?? "",
      date: format(selectedDate, "yyyy-MM-dd"),
    },
    {
      enabled: Boolean(selectedDate) && Boolean(selectedTrainerId) && status === "authenticated",
    }
  );

  const { data: trainer } = api.trainer.getById.useQuery(
    { id: selectedTrainerId ?? "" },
    { enabled: Boolean(selectedTrainerId) }
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const createBooking = api.court.createBooking.useMutation({
    onSuccess: () => {
      utils.court.getUserBookings.invalidate();
      utils.court.getAvailableTimeSlots.invalidate({ date: format(selectedDate, "yyyy-MM-dd") });
      router.push("/bookings");
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null);
      setSelectedTrainerId(null);
      setShowTrainerSelect(true);
    }
  };

  const handleTrainerSelect = (trainer: Trainer | null, isSplit: boolean = false) => {
    setSelectedTrainer(trainer);
    setSelectedTrainerId(trainer?.id ?? null);
    setIsSplitTraining(isSplit);
    setShowTrainerSelect(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = (timeSlot: TimeSlot) => {
    setSelectedSlot(timeSlot);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    
    try {
      await createBooking.mutateAsync({ 
        timeSlotId: selectedSlot.id,
        trainerId: selectedTrainerId ?? undefined,
        isSplitTraining: isSplitTraining
      });
      setShowConfirmation(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
    }
  };

  const groupedSlots = timeSlots?.reduce((acc: GroupedSlots, slot: TimeSlot) => {
    const timeKey = format(new Date(slot.startTime), "HH:mm");
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(slot);
    return acc;
  }, {}) ?? {};

  // Фильтруем слоты по доступности тренера
  const availableTimeSlots = selectedTrainerId && trainerTimeSlots
    ? Object.entries(groupedSlots).reduce((acc, [time, slots]) => {
        const trainerSlot = trainerTimeSlots.find(
          (ts: { startTime: Date }) => format(new Date(ts.startTime), "HH:mm") === time
        );
        if (trainerSlot) {
          acc[time] = slots;
        }
        return acc;
      }, {} as Record<string, TimeSlot[]>)
    : groupedSlots;

  // Сортируем временные слоты
  const sortedTimeSlots = Object.entries(availableTimeSlots)
    .sort(([timeA], [timeB]) => timeA.localeCompare(timeB));

  // Сохраняем выбранную группу в localStorage
  const handleAgeGroupChange = (group: "adult" | "children") => {
    setAgeGroup(group);
    localStorage.setItem('ageGroup', group);
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
                onSelect={handleDateSelect}
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
      ) : showTrainerSelect ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Выберите тренера</h2>
            <div className="flex gap-2">
              <Button
                variant={ageGroup === "adult" ? "default" : "outline"}
                onClick={() => handleAgeGroupChange("adult")}
              >
                Для взрослых
              </Button>
              <Button
                variant={ageGroup === "children" ? "default" : "outline"}
                onClick={() => handleAgeGroupChange("children")}
              >
                Для детей
              </Button>
            </div>
          </div>
          <TrainerSelect
            onSelect={(trainer) => handleTrainerSelect(trainer, false)}
            ageGroup={ageGroup}
          />
        </div>
      ) : selectedTime ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold">{selectedTime}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTime(null);
                  setSelectedTrainerId(null);
                  setShowTrainerSelect(true);
                }}
              >
                Назад к выбору тренера
              </Button>
            </div>
          </div>

          {/* Грунтовые корты */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Грунтовые корты</h3>
            <div className="grid gap-4">
              {selectedTime && availableTimeSlots[selectedTime] && (
                availableTimeSlots[selectedTime]
                  .filter((slot) => slot.court.surface === "CLAY")
                  .sort((a, b) => a.court.id.localeCompare(b.court.id))
                  .map((slot) => (
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
                            onClick={() => handleBooking(slot)}
                            disabled={createBooking.isPending}
                            size="sm"
                          >
                            {createBooking.isPending ? "..." : "Забронировать"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>

          {/* Хардовые корты */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Хардовые корты</h3>
            <div className="grid gap-4">
              {selectedTime && availableTimeSlots[selectedTime] && (
                availableTimeSlots[selectedTime]
                  .filter((slot) => slot.court.surface === "HARD")
                  .sort((a, b) => a.court.id.localeCompare(b.court.id))
                  .map((slot) => (
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
                            onClick={() => handleBooking(slot)}
                            disabled={createBooking.isPending}
                            size="sm"
                          >
                            {createBooking.isPending ? "..." : "Забронировать"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sortedTimeSlots.map(([time, slots]) => (
            <Card 
              key={time} 
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleTimeSelect(time)}
            >
              <CardContent className="flex flex-col items-center justify-center p-4">
                <ClockIcon className="h-6 w-6 text-primary mb-1" />
                <div className="text-lg font-bold mb-1">{time}</div>
                <div className="text-xs text-muted-foreground">
                  {(slots as TimeSlot[]).filter(slot => slot.court.surface === "CLAY").length} грунт. • {" "}
                  {(slots as TimeSlot[]).filter(slot => slot.court.surface === "HARD").length} хард
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSlot && (
        <BookingConfirmation
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setSelectedSlot(null);
          }}
          onConfirm={handleConfirmBooking}
          selectedDate={selectedDate}
          selectedTime={selectedTime ?? ""}
          selectedCourt={selectedSlot.court}
          selectedTrainer={selectedTrainer ? {
            name: selectedTrainer.name,
            price: selectedTrainer.price,
            childrenPrice: selectedTrainer.childrenPrice
          } : undefined}
          isSplitTraining={isSplitTraining}
        />
      )}
    </div>
  );
} 