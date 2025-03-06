import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { db } from "~/server/db";

const registerSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа").max(20, "Имя пользователя не должно превышать 20 символов"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  name: z.string().optional(),
  email: z.string().email("Введите корректный email").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, name, email } = registerSchema.parse(body);

    // Проверяем, существует ли пользователь
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким именем уже существует" },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 12);

    // Создаем пользователя
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => err.message);
      return NextResponse.json(
        { error: "Ошибка валидации", details: errorMessages },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 