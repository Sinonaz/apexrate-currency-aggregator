import type { Asset, PricePoint, PriceAlert, TimeFrame } from '@/types';

export const INITIAL_MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-btc-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    providerId: 'bitcoin',
    type: 'CRYPTO',
    currentPrice: 67850.5,
    change24h: 3.42,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asset-eth-2',
    symbol: 'ETH',
    name: 'Ethereum',
    providerId: 'ethereum',
    type: 'CRYPTO',
    currentPrice: 3480.25,
    change24h: -1.28,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asset-sol-3',
    symbol: 'SOL',
    name: 'Solana',
    providerId: 'solana',
    type: 'CRYPTO',
    currentPrice: 182.4,
    change24h: 8.65,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asset-eur-4',
    symbol: 'USD/EUR',
    name: 'Euro',
    providerId: 'eur',
    type: 'FIAT',
    currentPrice: 0.924,
    change24h: 0.18,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'asset-uyu-5',
    symbol: 'USD/UYU',
    name: 'Uruguayan Peso',
    providerId: 'uyu',
    type: 'FIAT',
    currentPrice: 41.85,
    change24h: -0.45,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_MOCK_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    assetId: 'asset-btc-1',
    assetSymbol: 'BTC',
    targetPrice: 70000,
    condition: 'ABOVE',
    telegramChatId: '123456789',
    isTriggered: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'alert-2',
    assetId: 'asset-eth-2',
    assetSymbol: 'ETH',
    targetPrice: 3400,
    condition: 'BELOW',
    telegramChatId: '123456789',
    isTriggered: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'alert-3',
    assetId: 'asset-sol-3',
    assetSymbol: 'SOL',
    targetPrice: 200,
    condition: 'ABOVE',
    telegramChatId: '987654321',
    isTriggered: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

/**
 * Generates realistic price history points based on base price, trend, and timeframe
 */
export function generateMockHistory(basePrice: number, change24h: number, timeframe: TimeFrame): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();

  let count = 24;
  let intervalMs = 3600000; // 1 hour for 24h
  let volatility = 0.008;

  if (timeframe === '1h') {
    count = 12; // every 5 minutes
    intervalMs = 5 * 60000;
    volatility = 0.003;
  } else if (timeframe === '7d') {
    count = 28; // every 6 hours
    intervalMs = 6 * 3600000;
    volatility = 0.02;
  }

  // Calculate starting price based on change percentage
  const totalChangeRatio = change24h / 100;
  const startPrice = basePrice / (1 + totalChangeRatio);

  let current = startPrice;

  for (let i = 0; i < count; i++) {
    const timeOffset = (count - 1 - i) * intervalMs;
    const timestamp = new Date(now - timeOffset).toISOString();

    if (i === count - 1) {
      // Last point is exactly current price
      points.push({
        price: Number(basePrice.toFixed(basePrice < 10 ? 4 : 2)),
        timestamp,
      });
      break;
    }

    // Progress towards final basePrice with some noise
    const progress = (i + 1) / count;
    const trendTarget = startPrice + (basePrice - startPrice) * progress;
    const randomVariation = (Math.random() - 0.48) * basePrice * volatility;
    current = trendTarget + randomVariation;

    points.push({
      price: Number(Math.max(current, basePrice * 0.5).toFixed(basePrice < 10 ? 4 : 2)),
      timestamp,
    });
  }

  return points;
}
