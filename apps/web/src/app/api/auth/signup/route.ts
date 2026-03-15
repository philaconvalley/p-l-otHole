import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const signupSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username must be at most 40 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .toLowerCase(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, password, username } = result.data;

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: {
            code: "EMAIL_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          error: {
            code: "USERNAME_EXISTS",
            message: "This username is already taken",
          },
        },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
