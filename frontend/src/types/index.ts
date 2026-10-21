export type AssetType = 'CRYPTO' | 'FIAT';

export interface Asset {
  id: string;
  symbol: string;       // e.g., "BTC"
  name: string;         // e.g., "Bitcoin"
  providerId: string;   // e.g., "bitcoin" (CoinGecko ID)
  type: AssetType;
  currentPrice: number;
  change24h: number;
  updatedAt: string;    // ISO Date
}

export interface PricePoint {
  price: number;
  timestamp: string;    // ISO Date
}

export interface PriceAlert {
  id: string;
  assetId: string;
  assetSymbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  telegramChatId: string;
  isTriggered: boolean;
  createdAt: string;
}

export interface CreateAssetDto {
  symbol: string;
  name: string;
  providerId: string;
  type: AssetType;
}

export interface CreateAlertDto {
  assetId: string;
  assetSymbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  telegramChatId: string;
}

export interface DeleteAssetResponse {
  success: boolean;
}

export interface DeleteAlertResponse {
  success: boolean;
}

export type TimeFrame = '1h' | '24h' | '7d';

export type AlertCondition = 'ABOVE' | 'BELOW';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}
