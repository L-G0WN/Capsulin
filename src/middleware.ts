import { defineMiddleware } from "astro/middleware";
import { verifyToken } from "@/lib/auth";
import { getCookie } from "@/lib/cookies";

export const onRequest = defineMiddleware(async (context, next) => {
  const protectedPaths = ["/admin/"];
  const { pathname } = new URL(context.request.url);
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const token = getCookie(context.request, "token");
    const payload = token ? verifyToken(token) : null;

    if (!payload) {
      return Response.redirect(new URL("/no-autorizado", context.request.url), 302);
    }
  }

  return next();
});