export interface IUserSession {
  User_ID: number;
  Wallet_ID: number;
  email: string;
  role: "organizer" | "customer";
  address: string;
}

export interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  user: IUserSession | null;
  connect: () => void;
  disconnect: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}