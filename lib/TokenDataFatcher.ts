import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function TokenDataFetcher() {
  const userId = (await auth()).userId;
  const user = await currentUser();

  if (!userId || !user) {
    return { tokenUsage: 0 };
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { Id: userId },
      select: { Used_Tokens: true },
    });

    return { tokenUsage: dbUser?.Used_Tokens || 0 };
  } catch (error) {
    console.error("Error fetching token usage:", error);
    return { tokenUsage: 0 };
  } finally {
    await prisma.$disconnect();
  }
}
