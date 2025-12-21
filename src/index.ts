import NeelaWalletServer from "@/_server";
import { connectDB } from "@/config";
import { seedSuperAdmin } from "@/shared";

const server = new NeelaWalletServer();

(async () => {
  await connectDB();
  await seedSuperAdmin();
  await server.init();
})();

process.on("uncaughtException", (e) => {
  console.log(e);
  server.shutdown();
});

process.on("unhandledRejection", (e) => {
  console.log(e);
  server.shutdown();
});

process.on("SIGINT", () => {
  server.shutdown();
});

process.on("SIGTERM", () => {
  server.shutdown();
});
