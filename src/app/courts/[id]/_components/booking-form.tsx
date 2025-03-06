"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface BookingFormProps {
  courtId: string;
}

export function BookingForm({ courtId }: BookingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: timeSlots, isLoading: isLoadingSlots } = api.court.getTimeSlots.useQuery(
    { 
      courtId,
      date: selectedDate,
    },
    { 
      enabled: Boolean(selectedDate && courtId),
      staleTime: 0,
    }
  );

  const createBooking = api.court.createBooking.useMutation({
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const timeSlotId = formData.get("timeSlot") as string;
    const selectedSlot = timeSlots?.find((slot) => slot.id === timeSlotId);

    if (!selectedSlot) {
      setError("Выберите время бронирования");
      setIsLoading(false);
      return;
    }

    createBooking.mutate({
      courtId,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-white"
        >
          Дата
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          min={new Date().toISOString().split("T")[0]}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-white/5 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label
          htmlFor="timeSlot"
          className="block text-sm font-medium text-white"
        >
          Доступное время
        </label>
        <select
          id="timeSlot"
          name="timeSlot"
          required
          disabled={isLoadingSlots || !selectedDate}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-white/5 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Выберите время</option>
          {timeSlots?.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.startTime.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </option>
          ))}
        </select>
        {isLoadingSlots && (
          <p className="mt-2 text-sm text-gray-400">Загрузка доступного времени...</p>
        )}
        {!isLoadingSlots && selectedDate && (!timeSlots || timeSlots.length === 0) && (
          <p className="mt-2 text-sm text-yellow-400">Нет доступного времени на выбранную дату</p>
        )}
      </div>
      
      {error && (
        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isLoading || isLoadingSlots || !selectedDate}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? "Бронирование..." : "Забронировать"}
      </button>
    </form>
  );
} 