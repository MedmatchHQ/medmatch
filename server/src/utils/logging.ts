import { RequestHandler } from "express";

const loggingMiddleware: RequestHandler = (req, res, next) => {
  console.log(`[server] Recieved request ${req.method} ${req.url} at time ${new Date().toISOString()}`);
  next();
};

export { loggingMiddleware };
