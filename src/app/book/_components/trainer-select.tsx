"use client";

import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { ClockIcon, CurrencyDollarIcon, UserIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface TrainerSelectProps {
  selectedDate: Date;
  onSelectTrainer: (trainerId: string | null) => void;
}

export function TrainerSelect({ selectedDate, onSelectTrainer }: Omit<TrainerSelectProps, 'onBack'>) {
  const { data: trainers, isLoading } = api.trainer.getAll.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Выберите тренера</h2>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, "PPP", { locale: ru })}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !trainers || trainers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Нет доступных тренеров</h3>
            <p className="text-sm text-muted-foreground">На выбранную дату нет доступных тренеров</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {/* Карточка "Без тренера" */}
          <Card 
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onSelectTrainer(null)}
          >
            <CardContent className="flex items-center p-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-3">
                <UserIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">Без тренера</div>
                  <Badge variant="outline" className="ml-2">Только аренда</Badge>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  Только аренда корта без тренера
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Карточки тренеров */}
          {trainers.map((trainer) => (
            <Card 
              key={trainer.id}
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onSelectTrainer(trainer.id)}
            >
              <CardContent className="flex items-center p-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden mr-3">
                  <Image
                    src={trainer.photo ?? "/images/trainers/trainer-1.jpg"}
                    alt={trainer.name}
                    width={48}
                    height={48}
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{trainer.name}</div>
                    <Badge variant="outline" className="ml-2">
                      {trainer.price} ₽/час
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {trainer.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 