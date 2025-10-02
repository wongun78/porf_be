import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { User, Coin, Portfolio } from "@/types";

// JWT Secret key (should be in environment variables)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// Validation utilities for form data and API inputs
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Authentication utilities
export class AuthUtils {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(userId: string | ObjectId): string {
    return jwt.sign({ userId: userId.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}

// Validation utilities
export class Validator {
  // Email validation
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email format");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Password validation
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push("Password is required");
    } else {
      if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }
      if (password.length > 100) {
        errors.push("Password must be less than 100 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Username validation
  static validateUsername(username: string): ValidationResult {
    const errors: string[] = [];

    if (!username) {
      errors.push("Username is required");
    } else {
      if (username.length < 3) {
        errors.push("Username must be at least 3 characters long");
      }
      if (username.length > 30) {
        errors.push("Username must be less than 30 characters");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push(
          "Username can only contain letters, numbers, and underscores"
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Coin validation
  static validateCoin(coinData: {
    symbol?: string;
    name?: string;
    quantity?: number;
    averageBuyPrice?: number;
    currentPrice?: number;
  }): ValidationResult {
    const errors: string[] = [];

    if (!coinData.symbol || coinData.symbol.trim().length === 0) {
      errors.push("Coin symbol is required");
    } else if (coinData.symbol.length > 10) {
      errors.push("Coin symbol must be less than 10 characters");
    }

    if (!coinData.name || coinData.name.trim().length === 0) {
      errors.push("Coin name is required");
    } else if (coinData.name.length > 100) {
      errors.push("Coin name must be less than 100 characters");
    }

    if (coinData.quantity === undefined || coinData.quantity === null) {
      errors.push("Quantity is required");
    } else if (coinData.quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (
      coinData.averageBuyPrice === undefined ||
      coinData.averageBuyPrice === null
    ) {
      errors.push("Average buy price is required");
    } else if (coinData.averageBuyPrice <= 0) {
      errors.push("Average buy price must be greater than 0");
    }

    if (coinData.currentPrice !== undefined && coinData.currentPrice < 0) {
      errors.push("Current price cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Portfolio calculation utilities
export class PortfolioUtils {
  // Calculate profit/loss for a single coin
  static calculateCoinProfitLoss(coin: Coin): {
    profitLoss: number;
    profitLossPercentage: number;
    currentValue: number;
  } {
    const currentPrice = coin.currentPrice || 0;
    const currentValue = coin.quantity * currentPrice;
    const profitLoss = currentValue - coin.totalInvested;
    const profitLossPercentage =
      coin.totalInvested > 0 ? (profitLoss / coin.totalInvested) * 100 : 0;

    return {
      profitLoss: Number(profitLoss.toFixed(2)),
      profitLossPercentage: Number(profitLossPercentage.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
    };
  }

  // Calculate portfolio summary
  static calculatePortfolioSummary(coins: Coin[]): Portfolio {
    let totalInvested = 0;
    let currentValue = 0;
    let topPerformer: Portfolio["topPerformer"];
    let worstPerformer: Portfolio["worstPerformer"];
    let maxGain = -Infinity;
    let maxLoss = Infinity;

    coins.forEach((coin) => {
      const calc = this.calculateCoinProfitLoss(coin);

      totalInvested += coin.totalInvested;
      currentValue += calc.currentValue;

      // Find top and worst performers
      if (calc.profitLossPercentage > maxGain) {
        maxGain = calc.profitLossPercentage;
        topPerformer = {
          symbol: coin.symbol,
          name: coin.name,
          profitLossPercentage: calc.profitLossPercentage,
        };
      }

      if (calc.profitLossPercentage < maxLoss) {
        maxLoss = calc.profitLossPercentage;
        worstPerformer = {
          symbol: coin.symbol,
          name: coin.name,
          profitLossPercentage: calc.profitLossPercentage,
        };
      }
    });

    const totalProfitLoss = currentValue - totalInvested;
    const totalProfitLossPercentage =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return {
      userId: coins[0]?.userId || "",
      totalInvested: Number(totalInvested.toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      totalProfitLossPercentage: Number(totalProfitLossPercentage.toFixed(2)),
      coinCount: coins.length,
      topPerformer,
      worstPerformer,
      lastUpdated: new Date(),
    };
  }

  // Update coin with new price
  static updateCoinPrice(coin: Coin, newPrice: number): Coin {
    const calc = this.calculateCoinProfitLoss({
      ...coin,
      currentPrice: newPrice,
    });

    return {
      ...coin,
      currentPrice: newPrice,
      currentValue: calc.currentValue,
      profitLoss: calc.profitLoss,
      profitLossPercentage: calc.profitLossPercentage,
      lastPriceUpdate: new Date(),
      updatedAt: new Date(),
    };
  }

  // Calculate new average buy price when adding more coins
  static calculateNewAveragePrice(
    currentQuantity: number,
    currentAvgPrice: number,
    newQuantity: number,
    newPrice: number
  ): number {
    const totalValue =
      currentQuantity * currentAvgPrice + newQuantity * newPrice;
    const totalQuantity = currentQuantity + newQuantity;
    return Number((totalValue / totalQuantity).toFixed(8));
  }
}

// General utilities
export class Utils {
  // Format currency
  static formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  // Format percentage
  static formatPercentage(percentage: number): string {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  }

  // Format large numbers
  static formatNumber(num: number): string {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + "B";
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + "M";
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + "K";
    }
    return num.toFixed(2);
  }

  // Generate random string
  static generateRandomString(length: number): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Clean string for database
  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, " ");
  }
}

// CORS helper function
export function corsResponse(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

// Handle OPTIONS request for CORS preflight
export function handleCorsOptions() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export { JWT_SECRET, JWT_EXPIRE };
