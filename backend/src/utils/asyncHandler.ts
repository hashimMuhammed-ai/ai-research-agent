import { Request, Response, NextFunction, RequestHandler } from "express";


// Automatically catch async errors and forward them to Express error middleware without using try/catch
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};