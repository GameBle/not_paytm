export interface UserProfileResponse {
  username: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  emailVerified: boolean;
}

export interface UserSummary {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  firstName: string;
  emailVerified?: boolean;
  role?: "user" | "admin";
  message?: string;
}

export interface BalanceResponse {
  balance: number;
}

export interface TransferResponse {
  message: string;
  transactionId: string;
}

export interface BulkUsersResponse {
  user: UserSummary[];
}

export interface ApiErrorResponse {
  message: string;
}

export interface TransactionItem {
  _id: string;
  amount: number;
  status: string;
  type: string;
  direction: "sent" | "received";
  createdAt: string;
  counterpart: UserSummary | null;
}

export interface TransactionsResponse {
  items: TransactionItem[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionReceipt {
  _id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  direction: "sent" | "received";
  from: UserSummary | null;
  to: UserSummary | null;
}

export interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalVolume: number;
  totalTransactions: number;
}

export interface AdminUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  balance: number;
  createdAt: string;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}
