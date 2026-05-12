import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (!auth) return unauthorized();

  const user = await prisma.appUser.findUnique({
    where: { id: auth.userId },
    select: { id: true, username: true, displayName: true, isAdmin: true, createdAt: true },
  });

  if (!user) return unauthorized();

  return Response.json({ user });
}
