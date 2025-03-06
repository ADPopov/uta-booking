"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">UTA Booking</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              <Button asChild variant="default" size="sm">
                <Link href="/book">Забронировать</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/bookings">Мои бронирования</Link>
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {session.user.username || session.user.email}
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => signOut()}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="default" size="sm">
                <Link href="/auth/signin">Войти</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/register">Регистрация</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
} 