import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { AuthUtils, Validator } from "@/lib/utils";
import { RegisterRequest, ApiResponse, AuthResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, username, password, fullName } = body;

    // Validate input
    const emailValidation = Validator.validateEmail(email);
    const usernameValidation = Validator.validateUsername(username);
    const passwordValidation = Validator.validatePassword(password);

    const errors = [
      ...emailValidation.errors,
      ...usernameValidation.errors,
      ...passwordValidation.errors,
    ];

    if (errors.length > 0) {
      const response: ApiResponse = {
        success: false,
        error: "Validation failed",
        message: errors.join(", "),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db("hocdanit");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: "User already exists",
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Username already taken",
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create new user
    const newUser = {
      email,
      username,
      password: hashedPassword,
      fullName: fullName || "",
      avatar: "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    if (!result.insertedId) {
      const response: ApiResponse = {
        success: false,
        error: "Failed to create user",
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Generate JWT token
    const token = AuthUtils.generateToken(result.insertedId);

    // Prepare response (exclude password)
    const userResponse = {
      _id: result.insertedId,
      email,
      username,
      fullName: fullName || "",
      avatar: "",
      isActive: true,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to register user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
