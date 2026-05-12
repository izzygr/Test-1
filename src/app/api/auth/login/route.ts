import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "שם משתמש וסיסמה נדרשים" }, { status: 400 });
    }

    const user = await prisma.appUser.findUnique({ where: { username } });
    if (!user) {
      return Response.json({ error: "שם משתמש או סיסמה שגויים" }, { status: 401 });
    }

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: "שם משתמש או סיסמה שגויים" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    return Response.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
    });
  } catch {
    return Response.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}
