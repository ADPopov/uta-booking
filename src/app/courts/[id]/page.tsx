import { Header } from "~/app/_components/header";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { BookingForm } from "./_components/booking-form";
import { auth } from "~/server/auth";

export default async function CourtPage({
  params,
}: {
  params: { id: string };
}) {
  const courts = await api.court.getAll();
  const court = courts.find((c) => c.id === params.id);
  const session = await auth();

  if (!court) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-center text-4xl font-bold text-white">
            {court.name}
          </h1>
          
          <div className="rounded-lg bg-white/10 p-6 text-white shadow-lg">
            <p className="mb-4 text-lg text-gray-300">{court.description}</p>
            <p className="mb-6 text-xl font-semibold text-indigo-400">
              {court.price} ₽/час
            </p>
            
            {session ? (
              <div className="mt-8">
                <h2 className="mb-4 text-2xl font-bold">Забронировать время</h2>
                <BookingForm courtId={court.id} />
              </div>
            ) : (
              <div className="mt-8 rounded-md bg-yellow-500/10 p-4 text-sm text-yellow-400">
                Для бронирования корта необходимо войти в систему
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 