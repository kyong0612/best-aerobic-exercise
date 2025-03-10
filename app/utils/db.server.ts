import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// この処理はHotReloadなどの開発環境でPrismaClientのインスタンスが
// 複数作成されることを防ぐためのもの
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.__db) {
    // @ts-ignore
    global.__db = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.__db;
}

export { prisma };
