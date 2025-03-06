"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">UTA Booking</span>
          </Link>
        </div>
        
        {/* Мобильная кнопка меню */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* Десктопная навигация */}
        <nav className="hidden md:flex items-center space-x-4">
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

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-t shadow-lg">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {session ? (
              <>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/book">Забронировать</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/bookings">Мои бронирования</Link>
                </Button>
                <div className="text-sm text-muted-foreground px-2 text-center">
                  {session.user.username || session.user.email}
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="w-full"
                  onClick={() => signOut()}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href="/auth/signin">Войти</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/auth/register">Регистрация</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
} 