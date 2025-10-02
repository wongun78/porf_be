import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { corsResponse, handleCorsOptions } from "@/lib/utils";

// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

// GET - Get all users
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("hocdanit");

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const response: ApiResponse<any[]> = {
      success: true,
      data: users,
      message: "Users retrieved successfully",
    };

    return corsResponse(NextResponse.json(response));
  } catch (error) {
    console.error("Get users error:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: "Failed to fetch users",
    };
    return corsResponse(NextResponse.json(response, { status: 500 }));
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, fullName, bio, role = "user" } = body;

    // Validation
    if (!username || !email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Username, email, and password are required",
      };
      return corsResponse(NextResponse.json(response, { status: 400 }));
    }

    if (password.length < 6) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Password must be at least 6 characters",
      };
      return corsResponse(NextResponse.json(response, { status: 400 }));
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "User with this username or email already exists",
      };
      return corsResponse(NextResponse.json(response, { status: 409 }));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      fullName: fullName || "",
      bio: bio || "",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    // Return user without password
    const { password: _, ...userResponse } = newUser;

    const response: ApiResponse<any> = {
      success: true,
      data: { ...userResponse, _id: result.insertedId },
      message: "User created successfully",
    };

    return corsResponse(NextResponse.json(response, { status: 201 }));
  } catch (error) {
    console.error("Create user error:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: "Failed to create user",
    };
    return corsResponse(NextResponse.json(response, { status: 500 }));
  }
}
