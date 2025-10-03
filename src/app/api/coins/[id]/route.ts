import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { authenticateRequest } from "@/lib/middleware";
import { Validator, PortfolioUtils } from "@/lib/utils";
import { CoinInput, ApiResponse, Coin } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/coins/[id] - Get specific coin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid coin ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");
    const coinsCollection = db.collection("coins");

    // Get coin by ID and user
    const coin = await coinsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(auth.userId!),
    });

    if (!coin) {
      const response: ApiResponse = {
        success: false,
        error: "Coin not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Calculate profit/loss
    const calc = PortfolioUtils.calculateCoinProfitLoss(coin as Coin);
    const coinWithCalculations = {
      ...coin,
      currentValue: calc.currentValue,
      profitLoss: calc.profitLoss,
      profitLossPercentage: calc.profitLossPercentage,
    } as Coin;

    const response: ApiResponse<Coin> = {
      success: true,
      data: coinWithCalculations,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Get coin error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to get coin",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/coins/[id] - Update coin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid coin ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body: Partial<CoinInput> = await request.json();

    // Validate input if provided
    if (body.symbol || body.name || body.quantity || body.averageBuyPrice) {
      const validation = Validator.validateCoin({
        symbol: body.symbol || "temp",
        name: body.name || "temp",
        quantity: body.quantity || 1,
        averageBuyPrice: body.averageBuyPrice || 1,
        currentPrice: body.currentPrice,
      });

      if (!validation.isValid) {
        const response: ApiResponse = {
          success: false,
          error: "Validation failed",
          message: validation.errors.join(", "),
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");
    const coinsCollection = db.collection("coins");

    // Get existing coin
    const existingCoin = await coinsCollection.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(auth.userId!),
    });

    if (!existingCoin) {
      const response: ApiResponse = {
        success: false,
        error: "Coin not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update fields if provided
    if (body.symbol) updateData.symbol = body.symbol.toUpperCase();
    if (body.name) updateData.name = body.name;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.averageBuyPrice !== undefined)
      updateData.averageBuyPrice = body.averageBuyPrice;
    if (body.currentPrice !== undefined) {
      updateData.currentPrice = body.currentPrice;
      updateData.lastPriceUpdate = new Date();
    }
    if (body.note !== undefined) updateData.note = body.note;
    if (body.purchaseDate)
      updateData.purchaseDate = new Date(body.purchaseDate);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    // Update new fields
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.coinGeckoId !== undefined) updateData.coinGeckoId = body.coinGeckoId;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.riskLevel !== undefined) updateData.riskLevel = body.riskLevel;
    if (body.investmentGoal !== undefined) updateData.investmentGoal = body.investmentGoal;
    if (body.alertSettings !== undefined) updateData.alertSettings = body.alertSettings;

    // Recalculate total invested if quantity or average price changed
    if (body.quantity !== undefined || body.averageBuyPrice !== undefined) {
      const newQuantity =
        body.quantity !== undefined ? body.quantity : existingCoin.quantity;
      const newAvgPrice =
        body.averageBuyPrice !== undefined
          ? body.averageBuyPrice
          : existingCoin.averageBuyPrice;
      updateData.totalInvested = newQuantity * newAvgPrice;
    }

    // Update coin
    const result = await coinsCollection.updateOne(
      { _id: new ObjectId(params.id), userId: new ObjectId(auth.userId!) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      const response: ApiResponse = {
        success: false,
        error: "Coin not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Get updated coin
    const updatedCoin = await coinsCollection.findOne({
      _id: new ObjectId(params.id),
    });

    // Calculate profit/loss
    const calc = PortfolioUtils.calculateCoinProfitLoss(updatedCoin as Coin);
    const coinWithCalculations = {
      ...updatedCoin,
      currentValue: calc.currentValue,
      profitLoss: calc.profitLoss,
      profitLossPercentage: calc.profitLossPercentage,
    } as Coin;

    const response: ApiResponse<Coin> = {
      success: true,
      message: "Coin updated successfully",
      data: coinWithCalculations,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Update coin error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to update coin",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/coins/[id] - Delete coin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate ObjectId
    if (!ObjectId.isValid(params.id)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid coin ID",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");
    const coinsCollection = db.collection("coins");

    // Delete coin
    const result = await coinsCollection.deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(auth.userId!),
    });

    if (result.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        error: "Coin not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Coin deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Delete coin error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to delete coin",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
