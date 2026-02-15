import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export function unauthorized() {
  return Response.json({ error: "לא מורשה" }, { status: 401 });
}
