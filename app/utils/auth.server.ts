import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { prisma } from "../utils/db.server";
import bcrypt from "bcrypt";

type LoginForm = {
  email: string;
  password: string;
};

export async function register({
  email,
  password,
  name,
  age,
  gender,
  height,
  weight,
}: {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const maxHeartRate = Math.round(211 - 0.64 * age);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      age,
      gender,
      height,
      weight,
      maxHeartRate,
      heartRateZones: {
        create: {
          zone1Min: Math.round(maxHeartRate * 0.5),
          zone1Max: Math.round(maxHeartRate * 0.6),
          zone2Min: Math.round(maxHeartRate * 0.6),
          zone2Max: Math.round(maxHeartRate * 0.7),
          zone3Min: Math.round(maxHeartRate * 0.7),
          zone3Max: Math.round(maxHeartRate * 0.8),
          zone4Min: Math.round(maxHeartRate * 0.8),
          zone4Max: Math.round(maxHeartRate * 0.9),
          zone5Min: Math.round(maxHeartRate * 0.9),
          zone5Max: maxHeartRate,
        },
      },
    },
  });

  return { id: user.id, email };
}

export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, email };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "5zone_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30日間
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        maxHeartRate: true,
      },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
