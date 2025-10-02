import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/middleware";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request);

    if (!auth.success) {
      const response: ApiResponse = {
        success: false,
        error: auth.error || "Authentication failed",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // For JWT tokens, logout is typically handled on the client side
    // by removing the token from storage. Here we can optionally:
    // 1. Log the logout event
    // 2. Add token to blacklist (if implementing token blacklisting)
    // 3. Update user's last activity

    // For now, we'll just return success
    const response: ApiResponse = {
      success: true,
      message: "Logout successful",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to logout",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
