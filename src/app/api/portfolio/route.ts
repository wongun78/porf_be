import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { authenticateRequest } from "@/lib/middleware";
import { PortfolioUtils } from "@/lib/utils";
import { ApiResponse, Portfolio, Coin } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/portfolio - Get portfolio summary and analytics
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

    // Get all active coins for the user
    const coins = await coinsCollection
      .find({
        userId: new ObjectId(auth.userId!),
        isActive: true,
      })
      .toArray();

    if (coins.length === 0) {
      const emptyPortfolio: Portfolio = {
        userId: auth.userId!,
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercentage: 0,
        coinCount: 0,
        lastUpdated: new Date(),
      };

      const response: ApiResponse<Portfolio> = {
        success: true,
        data: emptyPortfolio,
        message: "No coins in portfolio",
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Calculate portfolio summary
    const portfolio = PortfolioUtils.calculatePortfolioSummary(coins as Coin[]);

    // Additional analytics
    const analytics = {
      // Breakdown by coin value
      coinBreakdown: coins
        .map((coin) => {
          const calc = PortfolioUtils.calculateCoinProfitLoss(coin as Coin);
          return {
            symbol: coin.symbol,
            name: coin.name,
            totalInvested: coin.totalInvested,
            currentValue: calc.currentValue,
            profitLoss: calc.profitLoss,
            profitLossPercentage: calc.profitLossPercentage,
            allocation:
              portfolio.currentValue > 0
                ? (calc.currentValue / portfolio.currentValue) * 100
                : 0,
          };
        })
        .sort((a, b) => b.currentValue - a.currentValue),

      // Performance metrics
      performance: {
        totalCoins: coins.length,
        profitableCoins: coins.filter((coin) => {
          const calc = PortfolioUtils.calculateCoinProfitLoss(coin as Coin);
          return calc.profitLoss > 0;
        }).length,
        losingCoins: coins.filter((coin) => {
          const calc = PortfolioUtils.calculateCoinProfitLoss(coin as Coin);
          return calc.profitLoss < 0;
        }).length,
        largestPosition: Math.max(...coins.map((coin) => coin.totalInvested)),
        averagePosition: portfolio.totalInvested / coins.length,
      },
    };

    const response: ApiResponse<{
      portfolio: Portfolio;
      analytics: typeof analytics;
    }> = {
      success: true,
      data: {
        portfolio,
        analytics,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Get portfolio error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to get portfolio",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/portfolio/prices - Update all coin prices (manual price update)
export async function PUT(request: NextRequest) {
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

    const body: { prices: { symbol: string; price: number }[] } =
      await request.json();

    if (!body.prices || !Array.isArray(body.prices)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid request",
        message: "Prices array is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("hocdanit");
    const coinsCollection = db.collection("coins");

    const updateResults = [];
    const updatePromises = body.prices.map(async ({ symbol, price }) => {
      if (price < 0) {
        return { symbol, success: false, error: "Price cannot be negative" };
      }

      try {
        const result = await coinsCollection.updateMany(
          {
            userId: new ObjectId(auth.userId!),
            symbol: symbol.toUpperCase(),
            isActive: true,
          },
          {
            $set: {
              currentPrice: price,
              lastPriceUpdate: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        return {
          symbol,
          success: true,
          updatedCount: result.modifiedCount,
        };
      } catch (error) {
        return {
          symbol,
          success: false,
          error: "Failed to update price",
        };
      }
    });

    const results = await Promise.all(updatePromises);

    const response: ApiResponse<{ updateResults: typeof results }> = {
      success: true,
      message: "Price update completed",
      data: { updateResults: results },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Update portfolio prices error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
      message: "Failed to update prices",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
