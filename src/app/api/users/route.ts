import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { corsResponse, handleCorsOptions } from "@/lib/utils";

// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

// GET - Get all users with pagination
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("hocdanit");

    // Get query parameters
    const url = new URL(request.url);
    const current = parseInt(url.searchParams.get("current") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") || "desc";

    // Validate pagination parameters
    const page = Math.max(1, current);
    const limit = Math.min(Math.max(1, pageSize), 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = {};
    if (search) {
      searchQuery.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    // Get total count for pagination
    const totalUsers = await db.collection("users").countDocuments(searchQuery);

    // Get users with pagination
    const users = await db
      .collection("users")
      .find(searchQuery, { projection: { password: 0 } })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response: ApiResponse<any[]> = {
      success: true,
      data: users,
      message: "Users retrieved successfully",
      total: totalUsers,
      pagination: {
        current: page,
        pageSize: limit,
        total: totalUsers,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
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
    const { 
      username, 
      email, 
      password, 
      fullName, 
      bio, 
      phone,
      address,
      dateOfBirth,
      country,
      city,
      profileImage,
      coverImage,
      socialLinks,
      preferences,
      role = "user" 
    } = body;

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
      phone: phone || "",
      address: address || "",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      country: country || "",
      city: city || "",
      profileImage: profileImage || "",
      coverImage: coverImage || "",
      socialLinks: socialLinks || {},
      preferences: preferences || {
        currency: "USD",
        language: "en",
        theme: "dark",
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      role,
      isActive: true,
      isVerified: false,
      lastLoginAt: null,
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
