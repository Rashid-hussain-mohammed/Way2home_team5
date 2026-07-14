// src/types/express.d.ts
import { User } from '@/entities'; // Adjust path if necessary

declare global {
  namespace Express {
    interface Request {
      user?: User; // Declare the user property on the Request object
    }
  }
}
