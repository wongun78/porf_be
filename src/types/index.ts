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
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  country?: string;
  city?: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    currency?: string; // USD, VND, EUR, etc.
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  lastLoginAt?: Date;
}

// User input for registration/profile updates (without password hash)
export interface UserInput {
  email: string;
  username: string;
  password: string; // plain password for registration
  fullName?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  country?: string;
  city?: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    currency?: string;
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  role?: string;
}

// User response (without password)
export interface UserResponse {
  _id?: ObjectId | string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  country?: string;
  city?: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    currency?: string;
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  lastLoginAt?: Date;
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
  
  // New fields for enhanced coin information
  logo?: string; // URL to coin logo/image
  coinGeckoId?: string; // CoinGecko API ID for price fetching
  marketCap?: number; // Current market capitalization
  rank?: number; // Market cap rank
  volume24h?: number; // 24h trading volume
  priceChange24h?: number; // 24h price change percentage
  priceChange7d?: number; // 7d price change percentage
  allTimeHigh?: number; // All-time high price
  allTimeLow?: number; // All-time low price
  circulatingSupply?: number; // Circulating supply
  totalSupply?: number; // Total supply
  maxSupply?: number; // Maximum supply
  website?: string; // Official website
  whitepaper?: string; // Whitepaper URL
  explorer?: string; // Blockchain explorer URL
  github?: string; // GitHub repository
  category?: string; // Coin category (DeFi, Layer 1, etc.)
  tags?: string[]; // Tags for categorization
  description?: string; // Coin description
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'; // Investment risk level
  investmentGoal?: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM'; // Investment timeline
  alertSettings?: {
    priceTargetHigh?: number; // Alert when price goes above
    priceTargetLow?: number; // Alert when price goes below
    percentageChangeAlert?: number; // Alert on % change
  };
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
  logo?: string;
  coinGeckoId?: string;
  website?: string;
  category?: string;
  tags?: string[];
  description?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  investmentGoal?: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  alertSettings?: {
    priceTargetHigh?: number;
    priceTargetLow?: number;
    percentageChangeAlert?: number;
  };
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

// Pagination metadata interface
export interface PaginationMeta {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  pagination?: PaginationMeta;
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
