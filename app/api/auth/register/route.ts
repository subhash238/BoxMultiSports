import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  mobile: z.string().min(10).max(15),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, mobile, password } = result.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { mobile }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or Mobile already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}