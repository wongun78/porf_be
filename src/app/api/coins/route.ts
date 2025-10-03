import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { authenticateRequest } from "@/lib/middleware";
import { Validator, PortfolioUtils } from "@/lib/utils";
import { CoinInput, ApiResponse, Coin } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/coins - Get all coins for authenticated user
export async function GET(request: NextRequest) {
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

    const client = await clientPromise;
    const db = client.db("hocdanit");
    const coinsCollection = db.collection("coins");

    // Get query parameters
    const url = new URL(request.url);
    const active = url.searchParams.get("active");
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") || "desc";

    // Build query
    const query: any = { userId: new ObjectId(auth.userId!) };
    if (active !== null) {
      query.isActive = active === "true";
    }

    // Build sort
    const sortObj: any = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    // Get coins
    const coins = await coinsCollection.find(query).sort(sortObj).toArray();

    // Calculate profit/loss for each coin
    const coinsWithCalculations = coins.map((coin) => {
      const calc = PortfolioUtils.calculateCoinProfitLoss(coin as Coin);
      return {
        ...coin,
        currentValue: calc.currentValue,
        profitLoss: calc.profitLoss,
        profitLossPercentage: calc.profitLossPercentage,
      } as Coin;
    });

    const response: ApiResponse<Coin[]> = {
      success: true,
      data: coinsWithCalculations,
      total: coinsWithCalculations.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Get coins error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to get coins",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/coins - Create new coin
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

    const body: CoinInput = await request.json();

    // Validate input
    const validation = Validator.validateCoin(body);
    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        error: "Validation failed",
        message: validation.errors.join(", "),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");
    const coinsCollection = db.collection("coins");

    // Check if user already has this coin symbol
    const existingCoin = await coinsCollection.findOne({
      userId: new ObjectId(auth.userId!),
      symbol: body.symbol.toUpperCase(),
      isActive: true,
    });

    if (existingCoin) {
      const response: ApiResponse = {
        success: false,
        error: "Coin already exists",
        message: `You already have ${body.symbol.toUpperCase()} in your portfolio. Use update to modify existing coin.`,
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Calculate total invested
    const totalInvested = body.quantity * body.averageBuyPrice;

    // Create new coin
    const newCoin: Coin = {
      userId: new ObjectId(auth.userId!),
      symbol: body.symbol.toUpperCase(),
      name: body.name,
      quantity: body.quantity,
      averageBuyPrice: body.averageBuyPrice,
      currentPrice: body.currentPrice || 0,
      totalInvested,
      currentValue: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
      note: body.note || "",
      purchaseDate: new Date(body.purchaseDate),
      lastPriceUpdate: body.currentPrice ? new Date() : undefined,
      isActive: body.isActive !== false,
      // New fields
      logo: body.logo || "",
      coinGeckoId: body.coinGeckoId || "",
      marketCap: 0,
      rank: 0,
      volume24h: 0,
      priceChange24h: 0,
      priceChange7d: 0,
      allTimeHigh: 0,
      allTimeLow: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      maxSupply: 0,
      website: body.website || "",
      whitepaper: "",
      explorer: "",
      github: "",
      category: body.category || "",
      tags: body.tags || [],
      description: body.description || "",
      riskLevel: body.riskLevel || "MEDIUM",
      investmentGoal: body.investmentGoal || "LONG_TERM",
      alertSettings: body.alertSettings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate profit/loss if current price is provided
    if (newCoin.currentPrice && newCoin.currentPrice > 0) {
      const calc = PortfolioUtils.calculateCoinProfitLoss(newCoin);
      newCoin.currentValue = calc.currentValue;
      newCoin.profitLoss = calc.profitLoss;
      newCoin.profitLossPercentage = calc.profitLossPercentage;
    }

    const result = await coinsCollection.insertOne(newCoin);

    if (!result.insertedId) {
      const response: ApiResponse = {
        success: false,
        error: "Failed to create coin",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<Coin> = {
      success: true,
      message: "Coin added successfully",
      data: { ...newCoin, _id: result.insertedId },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Create coin error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to create coin",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
