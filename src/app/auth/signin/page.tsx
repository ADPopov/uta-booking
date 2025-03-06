"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setError(decodeURIComponent(error));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-900">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900">Вход</CardTitle>
          <CardDescription className="text-gray-500">
            Введите свои учетные данные для входа
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

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              Войти
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{" "}
            <a href="/auth/register" className="text-indigo-600 hover:text-indigo-500">
              Зарегистрироваться
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-900">Загрузка...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 