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
  };
}

export function BookingConfirmation({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  selectedCourt,
  selectedTrainer,
}: BookingConfirmationProps) {
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
          </div>

          {selectedTrainer && (
            <div className="flex items-center text-sm text-primary">
              <UserIcon className="h-4 w-4 mr-1" />
              Тренер: {selectedTrainer.name}
            </div>
          )}

          <div className="flex items-center text-lg font-semibold text-primary">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            {selectedCourt.price} ₽
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