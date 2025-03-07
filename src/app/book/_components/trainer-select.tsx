"use client";

import { api } from "~/trpc/react";
import type { Trainer } from "~/server/api/routers/trainer";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { ClockIcon, CurrencyDollarIcon, UserIcon, ArrowLeftIcon, AcademicCapIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface TrainerSelectProps {
  onSelect: (trainer: Trainer | null, isSplit?: boolean) => void;
  ageGroup: "adult" | "children";
}

export function TrainerSelect({ onSelect, ageGroup }: TrainerSelectProps) {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [isSplitTraining, setIsSplitTraining] = useState(false);
  
  const { data: trainers, isLoading } = api.trainer.getAll.useQuery();
  
  console.log("Полученные тренеры:", trainers);
  
  if (isLoading) {
    return <div>Загрузка тренеров...</div>;
  }
  
  if (!trainers || trainers.length === 0) {
    console.log("Тренеры не найдены");
    return <div>Тренеры не найдены</div>;
  }

  // Фильтруем тренеров по специализации
  const filteredTrainers = trainers.filter(trainer => {
    if (ageGroup === "children") {
      return trainer.specialization.includes("Дети");
    } else {
      return trainer.specialization.includes("Взрослые");
    }
  });

  if (filteredTrainers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium">
          {ageGroup === "children" 
            ? "Нет доступных тренеров для детей" 
            : "Нет доступных тренеров для взрослых"}
        </p>
      </div>
    );
  }

  const handleTrainerSelect = (trainer: Trainer | null, split: boolean = false) => {
    if (trainer === null) {
      setSelectedTrainerId(null);
      setIsSplitTraining(false);
      onSelect(null, false);
    } else {
      setSelectedTrainerId(trainer.id);
      onSelect(trainer, isSplitTraining);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer p-4 transition-all hover:shadow-lg flex items-center justify-center min-h-[120px] sm:min-h-[200px]"
          onClick={() => handleTrainerSelect(null)}
        >
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-1 sm:mb-2">Без тренера</h3>
            <p className="text-sm text-gray-600">Самостоятельная тренировка</p>
          </div>
        </Card>
        <Card
          className={`cursor-pointer p-4 transition-all hover:shadow-lg flex items-center justify-center min-h-[120px] sm:min-h-[200px] ${
            isSplitTraining ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => {
            setIsSplitTraining(!isSplitTraining);
            if (selectedTrainerId) {
              const selectedTrainer = trainers.find(t => t.id === selectedTrainerId);
              if (selectedTrainer) {
                onSelect(selectedTrainer, !isSplitTraining);
              }
            }
          }}
        >
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-1 sm:mb-2">Сплит-тренировка</h3>
            <p className="text-sm text-gray-600">Тренировка для двух человек</p>
            <p className="text-xs text-gray-500 mt-1">+1000₽ с человека к стоимости тренера</p>
          </div>
        </Card>
        {filteredTrainers.map((trainer) => (
          <Card
            key={trainer.id}
            className={`cursor-pointer p-4 transition-all hover:shadow-lg ${
              selectedTrainerId === trainer.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleTrainerSelect(trainer, isSplitTraining)}
          >
            <div className="flex items-start space-x-4">
              {trainer.photo && (
                <Image
                  src={trainer.photo}
                  alt={trainer.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{trainer.name}</h3>
                {trainer.description && (
                  <p className="text-sm text-gray-600">{trainer.description}</p>
                )}
                <div className="mt-2">
                  <p className="text-lg font-bold text-primary">
                    {ageGroup === "children" ? trainer.childrenPrice : trainer.price} ₽/час
                    {isSplitTraining && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        (+1000₽ с человека)
                      </span>
                    )}
                  </p>
                </div>
                {trainer.specialization && trainer.specialization.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Специализация:</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialization.map((spec, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {trainer.experience > 0 && (
                  <p className="mt-1 text-sm">
                    Опыт работы: {trainer.experience} лет
                  </p>
                )}
                {trainer.achievements && (
                  <p className="mt-1 text-sm text-gray-600">
                    {trainer.achievements}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 