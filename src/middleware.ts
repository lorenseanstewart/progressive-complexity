// Single JWT middleware for authentication and user context
import { defineMiddleware } from 'astro:middleware';

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  role: 'admin' | 'user';
  exp: number;
  iat: number;
}

// Demo JWT token (hardcoded for demo purposes)  
// Payload: { userId: 1, email: "demo@example.com", username: "stew_loren", role: "admin", exp: 9999999999, iat: 1700000000 }
const DEMO_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoic3Rld19sb3JlbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzAwMDAwMDAwfQ.demo-signature-stew-loren";

// Extend Astro's locals interface to include our JWT data
declare global {
  namespace App {
    interface Locals {
      jwt: JWTPayload | null;
    }
  }
}

/**
 * Simple JWT parser for demo purposes
 * In production, use a proper JWT library with signature verification
 */
function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.warn('Invalid JWT token:', error);
    return null;
  }
}

/**
 * Extract JWT from Authorization header or return demo token
 */
function extractJWT(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // For demo purposes, return hardcoded token if no auth header
  return DEMO_JWT;
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize locals
  context.locals.jwt = null;

  try {
    // Extract and parse JWT from request
    const token = extractJWT(context.request);
    
    if (token) {
      const jwtPayload = parseJWT(token);
      
      if (jwtPayload) {
        context.locals.jwt = jwtPayload;
        console.log(`[JWT Middleware] JWT parsed for user: ${jwtPayload.username} (${jwtPayload.role})`);
      } else {
        console.warn('[JWT Middleware] Invalid JWT token');
      }
    } else {
      console.log('[JWT Middleware] No JWT found, proceeding as anonymous user');
    }
  } catch (error) {
    console.error('[JWT Middleware] Error processing authentication:', error);
    // Continue without authentication rather than failing the request
  }

  // Continue to the next middleware or route
  return next();
});