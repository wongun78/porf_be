import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "./utils";
import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

// Middleware to check authentication
export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = AuthUtils.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user exists in database
    const client = await clientPromise;
    const db = client.db("hocdanit");
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
      isActive: { $ne: false },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Add user info to request headers for the API route to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-email", user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Helper function to get authenticated user ID from request headers
export function getAuthenticatedUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}

// Helper function to get authenticated user email from request headers
export function getAuthenticatedUserEmail(request: NextRequest): string | null {
  return request.headers.get("x-user-email");
}

// Helper function to manually authenticate request (for API routes that don't use middleware)
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return { success: false, error: "No token provided" };
    }

    const decoded = AuthUtils.verifyToken(token);
    if (!decoded) {
      return { success: false, error: "Invalid or expired token" };
    }

    // Check if user exists
    const client = await clientPromise;
    const db = client.db("hocdanit");
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
      isActive: { $ne: false },
    });

    if (!user) {
      return { success: false, error: "User not found or inactive" };
    }

    return { success: true, userId: decoded.userId };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}
