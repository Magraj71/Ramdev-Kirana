// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";

// const JWT_KEY = process.env.JWT_SECRET!;

// export async function getCurrentUser() {
//   try {
//     // cookies() returns a Promise - must be awaited
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;

//     if (!token) return null;

//     return jwt.verify(token, JWT_KEY) as {
//       userId: string;
//       role: "owner" | "user";
//     };
//   } catch {
//     return null;
//   }
// }

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Return user data without sensitive information
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      storeName: decoded.storeName,
      storeType: decoded.storeType,
      avatar: decoded.avatar,
      emailVerified: decoded.emailVerified
    };
  } catch {
    return null;
  }
}