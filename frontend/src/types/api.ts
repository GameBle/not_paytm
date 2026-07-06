export interface UserProfileResponse {
  username: string;
  firstName: string;
  lastName: string;
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
  message?: string;
}

export interface BalanceResponse {
  balance: number;
}

export interface TransferResponse {
  message: string;
}

export interface BulkUsersResponse {
  user: UserSummary[];
}

export interface ApiErrorResponse {
  message: string;
}
