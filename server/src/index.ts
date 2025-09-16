import { app, connectDB } from "@/server";

const PORT = process.env.DEV_PORT || 4000;

console.log("Welcome to Medmatch");

connectDB().then(() => {
  console.log("[server] Starting...");
  app.listen(PORT, () => {
    console.log(`[server]: Running on port ${PORT}`);
  });
});
