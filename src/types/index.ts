import { ObjectId } from "mongodb";

// Base interface for MongoDB documents
export interface BaseDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// User interface for authentication and profile
export interface User extends BaseDocument {
  email: string;
  username: string;
  password: string; // hashed password
  fullName?: string;
  avatar?: string;
  isActive?: boolean;
}

// User input for registration/profile updates (without password hash)
export interface UserInput {
  email: string;
  username: string;
  password: string; // plain password for registration
  fullName?: string;
  avatar?: string;
}

// User response (without password)
export interface UserResponse {
  _id?: ObjectId | string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Coin interface for portfolio tracking
export interface Coin extends BaseDocument {
  userId: ObjectId | string; // Reference to user who owns this coin
  symbol: string; // e.g., "BTC", "ETH", "ADA"
  name: string; // e.g., "Bitcoin", "Ethereum", "Cardano"
  quantity: number; // Number of coins owned
  averageBuyPrice: number; // Average purchase price per coin (USD)
  currentPrice?: number; // Current market price (can be manual or from API)
  totalInvested: number; // Total amount invested (quantity * averageBuyPrice)
  currentValue?: number; // Current portfolio value (quantity * currentPrice)
  profitLoss?: number; // Current profit/loss amount
  profitLossPercentage?: number; // Current profit/loss percentage
  note?: string; // Personal notes about this coin
  purchaseDate: Date; // Date when first purchased
  lastPriceUpdate?: Date; // Last time price was updated
  isActive: boolean; // Whether still tracking this coin
}

// Coin input for creating/updating
export interface CoinInput {
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice?: number;
  note?: string;
  purchaseDate: Date;
  isActive?: boolean;
}

// Transaction interface for buy/sell history
export interface Transaction extends BaseDocument {
  userId: ObjectId | string;
  coinId: ObjectId | string;
  type: "BUY" | "SELL";
  quantity: number;
  pricePerCoin: number;
  totalAmount: number;
  transactionDate: Date;
  note?: string;
}

// Portfolio summary interface
export interface Portfolio {
  userId: ObjectId | string;
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  coinCount: number;
  topPerformer?: {
    symbol: string;
    name: string;
    profitLossPercentage: number;
  };
  worstPerformer?: {
    symbol: string;
    name: string;
    profitLossPercentage: number;
  };
  lastUpdated: Date;
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Search parameters
export interface SearchParams extends PaginationParams {
  search?: string;
  filter?: Record<string, any>;
}
