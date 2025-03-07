import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, ClockIcon, CurrencyDollarIcon, UserIcon } from "@heroicons/react/24/outline";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDate: Date;
  selectedTime: string;
  selectedCourt: {
    name: string;
    description: string | null;
    price: number;
    surface: string;
  };
  selectedTrainer?: {
    name: string;
    price: number;
    childrenPrice: number;
  };
  isSplitTraining?: boolean;
}

export function BookingConfirmation({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  selectedCourt,
  selectedTrainer,
  isSplitTraining,
}: BookingConfirmationProps) {
  console.log("=== Booking Confirmation Debug ===");
  console.log("Court:", selectedCourt);
  console.log("Trainer:", selectedTrainer);
  console.log("Is Split Training:", isSplitTraining);
  
  // Базовая стоимость корта
  const courtPrice = typeof selectedCourt.price === 'number' ? selectedCourt.price : 0;
  console.log("Court Price:", courtPrice);
  
  // Базовая стоимость тренера
  const baseTrainerPrice = selectedTrainer?.price ?? 0;
  console.log("Base Trainer Price:", baseTrainerPrice);
  
  // Доплата за сплит
  const splitSurcharge = (selectedTrainer && isSplitTraining) ? 2000 : 0;
  console.log("Split Surcharge:", splitSurcharge);
  
  // Итоговая стоимость тренера
  const trainerPrice = baseTrainerPrice + splitSurcharge;
  console.log("Total Trainer Price:", trainerPrice);
  
  // Итоговая сумма
  const totalPrice = courtPrice + trainerPrice;
  console.log("Total Price:", totalPrice);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение бронирования</DialogTitle>
          <DialogDescription>
            Пожалуйста, проверьте детали бронирования перед подтверждением
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-primary mr-2" />
            <div>
              <div className="font-medium">
                {format(selectedDate, "PPP", { locale: ru })}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedTime}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">{selectedCourt.name}</div>
            <div className="text-sm text-muted-foreground">
              {selectedCourt.description}
            </div>
            <div className="text-sm text-muted-foreground">
              Тип покрытия: {selectedCourt.surface === "CLAY" ? "Грунт" : "Хард"}
            </div>
            <div className="text-sm">
              Стоимость корта: {courtPrice} ₽
            </div>
          </div>

          {selectedTrainer && (
            <div className="space-y-1">
              <div className="flex items-center text-sm text-primary">
                <UserIcon className="h-4 w-4 mr-1" />
                Тренер: {selectedTrainer.name}
              </div>
              <div className="flex flex-col text-sm">
                <div>Стоимость тренера: {baseTrainerPrice} ₽</div>
                {isSplitTraining && (
                  <div className="text-gray-600">
                    Доплата за сплит-тренировку: +{splitSurcharge} ₽ (по 1000₽ с человека)
                  </div>
                )}
                {isSplitTraining && (
                  <div className="font-medium">
                    Итого за тренера: {trainerPrice} ₽
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center text-lg font-semibold text-primary">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            Итого за бронирование: {totalPrice} ₽
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onConfirm}>
            Подтвердить бронирование
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 