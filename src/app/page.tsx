import { Header } from "~/app/_components/header";
import Link from "next/link";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Бронирование кортов
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Забронируйте корт для игры в удобное для вас время. Простой и быстрый процесс бронирования.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <CardTitle>Выберите дату</CardTitle>
              </div>
              <CardDescription>
                Удобный календарь для выбора даты бронирования
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-primary" />
                <CardTitle>Выберите время</CardTitle>
              </div>
              <CardDescription>
                Доступные временные слоты на выбранную дату
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Забронировать</CardTitle>
              <CardDescription>
                Подтвердите бронирование и оплатите
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/book">
                <Button className="w-full">
                  Забронировать корт
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
