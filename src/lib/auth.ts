// import { NextRequest } from "next/server";
// import { verify } from "jsonwebtoken";

// const JWT_KEY = process.env.JWT_SECRET!;

// export function getUserIdFromReq(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;

//   if (!token) {
//     throw new Error("Not authenticated");
//   }

//   try {
//     const decoded = verify(token, JWT_KEY) as { userId: string; role: "owner" | "user";};
//     return decoded;
//   } catch (err) {
//     throw new Error("Invalid token");
//   }
// }


import { NextRequest } from "next/server";
import { TokenPayload, verifyToken, decodeToken, isTokenExpired } from "./jwt";

// Types for extracted user data
export interface RequestUser {
  userId: string;
  email: string;
  name: string;
  role: "owner" | "user";
  storeName?: string;
  storeType?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Extract complete user data from request cookies
 */
export function getUserFromRequest(req: NextRequest): RequestUser {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    throw new AuthenticationError(
      "Not authenticated",
      "MISSING_TOKEN",
      401
    );
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    throw new AuthenticationError(
      "Session expired. Please log in again.",
      "TOKEN_EXPIRED",
      401
    );
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new AuthenticationError(
      "Invalid authentication token",
      "INVALID_TOKEN",
      401
    );
  }

  // Validate required fields
  if (!decoded.userId || !decoded.email || !decoded.role) {
    throw new AuthenticationError(
      "Malformed authentication token",
      "MALFORMED_TOKEN",
      401
    );
  }

  // Check if user account is active
  if (decoded.isActive === false) {
    throw new AuthenticationError(
      "Your account has been deactivated. Please contact support.",
      "ACCOUNT_DEACTIVATED",
      403
    );
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    storeName: decoded.storeName,
    storeType: decoded.storeType,
    avatar: decoded.avatar,
    emailVerified: decoded.emailVerified,
    isActive: decoded.isActive,
    iat: decoded.iat,
    exp: decoded.exp
  };
}

/**
 * Extract only user ID from request (minimal validation)
 */
export function getUserIdFromRequest(req: NextRequest): string {
  const user = getUserFromRequest(req);
  return user.userId;
}

/**
 * Extract user role from request
 */
export function getUserRoleFromRequest(req: NextRequest): "owner" | "user" {
  const user = getUserFromRequest(req);
  return user.role;
}

/**
 * Check if user has specific role
 */
export function hasRole(req: NextRequest, role: "owner" | "user"): boolean {
  try {
    const userRole = getUserRoleFromRequest(req);
    return userRole === role;
  } catch {
    return false;
  }
}

/**
 * Check if user is owner
 */
export function isOwner(req: NextRequest): boolean {
  try {
    const user = getUserFromRequest(req);
    // NOTE: This checks JWT role, not database role
    return user.role === "owner";
  } catch {
    return false;
  }
}

/**
 * Check if user is regular user
 */

// lib/utils.ts - Add these functions
export function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function calculateEstimatedDelivery(slot: string): Date {
  const now = new Date();
  const deliveryDate = new Date(now);
  
  switch (slot) {
    case "30-45 mins":
      deliveryDate.setMinutes(deliveryDate.getMinutes() + 45);
      break;
    case "1-2 hours":
      deliveryDate.setHours(deliveryDate.getHours() + 2);
      break;
    case "Schedule":
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      break;
    default:
      deliveryDate.setHours(deliveryDate.getHours() + 2);
  }
  
  return deliveryDate;
}

export function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function calculateDeliveryTime(slot: string): Date {
  return calculateEstimatedDelivery(slot);
}

export function isRegularUser(req: NextRequest): boolean {
  return hasRole(req, "user");
}

/**
 * Get user data safely (returns null instead of throwing)
 */
export function getUserSafely(req: NextRequest): RequestUser | null {
  try {
    return getUserFromRequest(req);
  } catch {
    return null;
  }
}

/**
 * Get refresh token from request
 */
export function getRefreshTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get("refresh_token")?.value || null;
}

/**
 * Extract user information from headers (for API routes using middleware)
 */
export function getUserFromHeaders(headers: Headers): Partial<RequestUser> | null {
  try {
    const userId = headers.get("x-user-id");
    const email = headers.get("x-user-email");
    const role = headers.get("x-user-role") as "owner" | "user" | null;
    const name = headers.get("x-user-name");

    if (!userId || !email || !role) {
      return null;
    }

    return {
      userId,
      email,
      name: name || "",
      role,
      emailVerified: headers.get("x-user-email-verified") === "true",
      isActive: headers.get("x-user-active") !== "false"
    };
  } catch {
    return null;
  }
}

/**
 * Validate API key from request (for external API access)
 */
export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key") || req.nextUrl.searchParams.get("api_key");
  
  if (!apiKey) return false;

  // Add your API key validation logic here
  const validApiKeys = process.env.API_KEYS?.split(",") || [];
  return validApiKeys.includes(apiKey);
}

/**
 * Custom authentication error class
 */
export class AuthenticationError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string = "AUTH_ERROR", statusCode: number = 401) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode
    };
  }
}

/**
 * Create request headers with authentication for internal API calls
 */
export function createAuthenticatedHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  
  try {
    const user = getUserFromRequest(req);
    
    headers.set("x-user-id", user.userId);
    headers.set("x-user-email", user.email);
    headers.set("x-user-role", user.role);
    headers.set("x-user-name", user.name || "");
    headers.set("x-user-store", user.storeName || "");
    headers.set("x-user-email-verified", user.emailVerified.toString());
    headers.set("x-user-active", user.isActive.toString());
    
    // Forward original authorization if present
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      headers.set("authorization", authHeader);
    }
    
    // Forward other relevant headers
    const userAgent = req.headers.get("user-agent");
    if (userAgent) {
      headers.set("user-agent", userAgent);
    }
    
  } catch (error) {
    // If not authenticated, still forward some headers
    const userAgent = req.headers.get("user-agent");
    if (userAgent) {
      headers.set("user-agent", userAgent);
    }
  }
  
  return headers;
}

/**
 * Check if request has valid authentication (without throwing)
 */
export function isAuthenticated(req: NextRequest): boolean {
  try {
    getUserFromRequest(req);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get token expiration time from request
 */
export function getTokenExpirationFromRequest(req: NextRequest): Date | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded?.exp) return null;
  
  return new Date(decoded.exp * 1000);
}

/**
 * Get remaining token validity in seconds
 */
export function getTokenRemainingValidity(req: NextRequest): number | null {
  const expiration = getTokenExpirationFromRequest(req);
  if (!expiration) return null;
  
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

// Legacy function (backward compatibility)
export function getUserIdFromReq(req: NextRequest): { userId: string; role: "owner" | "user" } {
  const user = getUserFromRequest(req);
  return {
    userId: user.userId,
    role: user.role
  };
}