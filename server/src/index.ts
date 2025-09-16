import { app, connectDB } from "@/server";

const PORT = process.env.DEV_PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server]: Running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[database]: Failed to connect", err);
  });
