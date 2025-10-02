import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { AuthUtils, Validator } from "@/lib/utils";
import { LoginRequest, ApiResponse, AuthResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    const emailValidation = Validator.validateEmail(email);
    const passwordValidation = Validator.validatePassword(password);

    const errors = [...emailValidation.errors, ...passwordValidation.errors];

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

    // Find user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Check if user is active
    if (user.isActive === false) {
      const response: ApiResponse = {
        success: false,
        error: "Account disabled",
        message: "Your account has been disabled",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Generate JWT token
    const token = AuthUtils.generateToken(user._id);

    // Update last login (optional)
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Prepare response (exclude password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || "",
      avatar: user.avatar || "",
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to login",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
