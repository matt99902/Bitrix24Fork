import { NextResponse } from "next/server";
import {
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
  PROTECTED_BASE_ROUTES,
  PROTECTED_ROUTES,
} from "./routes";
import { auth } from "./auth";

export default auth((req) => {
  // Your custom middleware logic goes here
  const currentPathname = req.nextUrl.pathname;
  //   !! converts the value into its boolean equivalent
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = currentPathname.startsWith("/api/auth");
  const isPublicRoute = AUTH_ROUTES.includes(currentPathname);

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  const isProtectedBaseRoute = PROTECTED_BASE_ROUTES.some((el) =>
    currentPathname.startsWith(el),
  );

  if (isProtectedBaseRoute && !isLoggedIn) {
    console.log(
      "Access denied for not logged-in users trying to access a protected base route",
    );
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (AUTH_ROUTES.includes(currentPathname)) {
    // we are accessing an auth route
    if (isLoggedIn) {
      console.log(
        "access denied for accessing auth routes for logged in users",
      );
      // we are already logged in so we cant access the auth routes anymore
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
  }

  if (PROTECTED_ROUTES.includes(currentPathname)) {
    // we are accessing a protected routes
    // check for valid sessions
    // redirect unauthorized users

    if (!isLoggedIn) {
      console.log("access denied for not logged in users");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
});

// run for all routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
