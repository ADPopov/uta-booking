"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка при регистрации");
      }

      router.push("/auth/signin?registered=true");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Регистрация</CardTitle>
          <CardDescription className="text-gray-500">
            Создайте новый аккаунт
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Имя пользователя
              </label>
              <Input
                type="text"
                id="username"
                name="username"
                required
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Имя
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                required
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Пароль
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <a href="/auth/signin" className="text-indigo-600 hover:text-indigo-500">
              Войти
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 