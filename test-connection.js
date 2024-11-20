const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");

    // Fetch data from the User table
    const users = await prisma.user.findMany({
      take: 2,
    });
    console.log("Sample Users:");
    console.log(JSON.stringify(users, null, 2));

    // Fetch data from the File table
    const files = await prisma.file.findMany({
      take: 2,
    });
    console.log("\nSample Files:");
    console.log(JSON.stringify(files, null, 2));

    // Fetch data from the Agent table
    const agents = await prisma.agent.findMany({
      take: 2,
    });
    console.log("\nSample Agents:");
    console.log(JSON.stringify(agents, null, 2));

    // Fetch data from the Knowledge table
    const knowledges = await prisma.knowledge.findMany({
      take: 2,
    });
    console.log("\nSample Knowledge:");
    console.log(JSON.stringify(knowledges, null, 2));
  } catch (error) {
    console.error("Database operation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
