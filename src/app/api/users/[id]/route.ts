import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { corsResponse, handleCorsOptions } from "@/lib/utils";

// Handle CORS preflight
export async function OPTIONS() {
  return handleCorsOptions();
}

// GET - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Invalid user ID",
      };
      return corsResponse(NextResponse.json(response, { status: 400 }));
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "User not found",
      };
      return corsResponse(NextResponse.json(response, { status: 404 }));
    }

    const response: ApiResponse<any> = {
      success: true,
      data: user,
      message: "User retrieved successfully",
    };

    return corsResponse(NextResponse.json(response));
  } catch (error) {
    console.error("Get user error:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: "Failed to fetch user",
    };
    return corsResponse(NextResponse.json(response, { status: 500 }));
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Invalid user ID",
      };
      return corsResponse(NextResponse.json(response, { status: 400 }));
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");

    // Check if user exists
    const existingUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "User not found",
      };
      return corsResponse(NextResponse.json(response, { status: 404 }));
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update fields if provided
    if (body.email) updateData.email = body.email;
    if (body.username) updateData.username = body.username;
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.role) updateData.role = body.role;

    // Hash new password if provided
    if (body.password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(body.password, saltRounds);
    }

    // Check for duplicate email/username if updating
    if (body.email || body.username) {
      const duplicateQuery: any = {
        _id: { $ne: new ObjectId(id) },
      };

      if (body.email && body.username) {
        duplicateQuery.$or = [
          { email: body.email },
          { username: body.username },
        ];
      } else if (body.email) {
        duplicateQuery.email = body.email;
      } else if (body.username) {
        duplicateQuery.username = body.username;
      }

      const duplicate = await db.collection("users").findOne(duplicateQuery);
      if (duplicate) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          message: "Email or username already exists",
        };
        return corsResponse(NextResponse.json(response, { status: 409 }));
      }
    }

    // Update user
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      {
        returnDocument: "after",
        projection: { password: 0 },
      }
    );

    if (!result || !result.value) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Failed to update user",
      };
      return corsResponse(NextResponse.json(response, { status: 500 }));
    }

    const response: ApiResponse<any> = {
      success: true,
      data: result.value,
      message: "User updated successfully",
    };

    return corsResponse(NextResponse.json(response));
  } catch (error) {
    console.error("Update user error:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: "Failed to update user",
    };
    return corsResponse(NextResponse.json(response, { status: 500 }));
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "Invalid user ID",
      };
      return corsResponse(NextResponse.json(response, { status: 400 }));
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");

    // Check if user exists
    const existingUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });

    if (!existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: "User not found",
      };
      return corsResponse(NextResponse.json(response, { status: 404 }));
    }

    // Delete user's coins first (cascade delete)
    await db.collection("coins").deleteMany({ userId: new ObjectId(id) });

    // Delete user
    await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: "User and associated data deleted successfully",
    };

    return corsResponse(NextResponse.json(response));
  } catch (error) {
    console.error("Delete user error:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: "Failed to delete user",
    };
    return corsResponse(NextResponse.json(response, { status: 500 }));
  }
}
