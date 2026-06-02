import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_ATTEMPTS = 10; // Max 10 attempts per window

export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = loginAttempts.get(ip);

  if (record) {
    if (now > record.resetTime) {
      // Window expired, reset record
      loginAttempts.set(ip, {
        count: 1,
        resetTime: now + WINDOW_MS,
      });
      next();
    } else if (record.count >= MAX_ATTEMPTS) {
      // Max attempts reached
      const minutesLeft = Math.ceil((record.resetTime - now) / 60 / 1000);
      res.status(429).json({
        error: `Too many login attempts from this address. Please try again after ${minutesLeft} minute(s).`,
      });
    } else {
      // Increment attempt count
      record.count += 1;
      next();
    }
  } else {
    // First attempt in this window
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    next();
  }
}
