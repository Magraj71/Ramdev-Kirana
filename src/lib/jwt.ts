// import jwt from "jsonwebtoken";

// export const createToken = (user:{id:string; role:string}) => {
//   return jwt.sign(
//     { userId:user.id, role: user.role }, process.env.JWT_SECRET!, {
//     expiresIn: "7d",
//   });
// };


import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";

// Environment variable validation
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + "-refresh";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// Validate environment variables
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is not set!");
  throw new Error("JWT_SECRET is required");
}

if (JWT_SECRET.length < 32) {
  console.warn("⚠️  JWT_SECRET is less than 32 characters. Consider using a stronger secret.");
}

// User roles type
export type UserRole = "owner" | "user";

// Token payload interface
export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  storeName?: string;
  storeType?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  iat?: number;
  exp?: number;
}

// Refresh token payload interface
export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  tokenVersion?: number;
}

// Create token options
const signOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
  issuer: "kirana-pro",
  audience: ["web", "mobile"],
  algorithm: "HS256"
};

// Verify token options
const verifyOptions: VerifyOptions = {
  algorithms: ["HS256"],
  issuer: "kirana-pro",
  audience: ["web", "mobile"],
  maxAge: JWT_EXPIRES_IN
};

/**
 * Create JWT access token with full user information
 */
export function createToken(user: {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  storeName?: string;
  storeType?: string;
  avatar?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}): string {
  try {
    const payload: TokenPayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      storeName: user.storeName,
      storeType: user.storeType,
      avatar: user.avatar,
      emailVerified: user.emailVerified || false,
      isActive: user.isActive !== undefined ? user.isActive : true
    };

    return jwt.sign(payload, JWT_SECRET!, signOptions);
  } catch (error) {
    console.error("Error creating JWT token:", error);
    throw new Error("Failed to create authentication token");
  }
}

/**
 * Create refresh token (for longer sessions)
 */
export function createRefreshToken(userId: string, tokenVersion: number = 0): string {
  try {
    const payload: RefreshTokenPayload = {
      userId,
      tokenVersion
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "kirana-pro",
      audience: "web"
    });
  } catch (error) {
    console.error("Error creating refresh token:", error);
    throw new Error("Failed to create refresh token");
  }
}

/**
 * Verify and decode JWT access token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, verifyOptions) as TokenPayload;
    
    // Additional validation
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.warn("Invalid token payload: missing required fields");
      return null;
    }

    return decoded;
  } catch (error: any) {
    // Log specific error types
    if (error.name === "TokenExpiredError") {
      console.warn("Token expired:", error.expiredAt);
    } else if (error.name === "JsonWebTokenError") {
      console.warn("Invalid token:", error.message);
    } else {
      console.error("Token verification error:", error);
    }
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return null;
  }
}

/**
 * Decode token without verification (for debugging or getting expired token data)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
}

/**
 * Extract user ID from token (convenience method)
 */
export function getUserIdFromToken(token: string): string | null {
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

/**
 * Extract user role from token (convenience method)
 */
export function getUserRoleFromToken(token: string): UserRole | null {
  const decoded = verifyToken(token);
  return decoded?.role || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded?.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded?.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Create both access and refresh tokens
 */
export function createTokenPair(user: {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  storeName?: string;
  storeType?: string;
  avatar?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}, tokenVersion: number = 0): { accessToken: string; refreshToken: string } {
  return {
    accessToken: createToken(user),
    refreshToken: createRefreshToken(user.userId, tokenVersion)
  };
}

/**
 * Generate a short-lived token for specific purposes (password reset, email verification)
 */
export function createShortLivedToken(payload: Record<string, any>, expiresIn: string = "1h"): string {
  try {
    return jwt.sign(
      { ...payload, purpose: "short-lived" },
      JWT_SECRET!,
      { expiresIn, issuer: "kirana-pro" }
    );
  } catch (error) {
    console.error("Error creating short-lived token:", error);
    throw new Error("Failed to create short-lived token");
  }
}

/**
 * Verify short-lived token
 */
export function verifyShortLivedToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    if (decoded.purpose !== "short-lived") {
      throw new Error("Invalid token purpose");
    }
    return decoded;
  } catch (error) {
    console.error("Short-lived token verification failed:", error);
    return null;
  }
}