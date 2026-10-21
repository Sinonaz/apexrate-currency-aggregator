import { apiClient } from './client';
import type { Asset, CreateAssetDto, DeleteAssetResponse, PricePoint, TimeFrame } from '@/types';
import { INITIAL_MOCK_ASSETS, generateMockHistory } from './mockData';

const MOCK_STORAGE_KEY = 'apexrate_mock_assets';

function getStoredMockAssets(): Asset[] {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ASSETS));
  return [...INITIAL_MOCK_ASSETS];
}

function saveStoredMockAssets(assets: Asset[]) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(assets));
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const assetsApi = {
  async getAssets(useMock = false): Promise<Asset[]> {
    if (useMock) {
      await delay(250);
      return getStoredMockAssets();
    }
    const response = await apiClient.get<Asset[]>('/assets');
    return response.data;
  },

  async createAsset(dto: CreateAssetDto, useMock = false): Promise<Asset> {
    if (useMock) {
      await delay(350);
      const assets = getStoredMockAssets();
      
      // Generate initial realistic price based on symbol or random
      const initialPrice = dto.symbol.toUpperCase().includes('USD') ? 1.0 : Math.floor(Math.random() * 500) + 10;
      const newAsset: Asset = {
        id: 'asset-' + Date.now(),
        symbol: dto.symbol.toUpperCase().trim(),
        name: dto.name.trim(),
        providerId: dto.providerId.toLowerCase().trim(),
        type: dto.type,
        currentPrice: initialPrice,
        change24h: Number(((Math.random() - 0.4) * 8).toFixed(2)),
        updatedAt: new Date().toISOString(),
      };

      assets.push(newAsset);
      saveStoredMockAssets(assets);
      return newAsset;
    }

    const response = await apiClient.post<Asset>('/assets', dto);
    return response.data;
  },

  async deleteAsset(id: string, useMock = false): Promise<DeleteAssetResponse> {
    if (useMock) {
      await delay(250);
      let assets = getStoredMockAssets();
      assets = assets.filter((a) => a.id !== id);
      saveStoredMockAssets(assets);
      return { success: true };
    }

    const response = await apiClient.delete<DeleteAssetResponse>(`/assets/${id}`);
    return response.data;
  },

  async getAssetHistory(assetId: string, timeframe: TimeFrame = '24h', useMock = false): Promise<PricePoint[]> {
    if (useMock) {
      await delay(200);
      const assets = getStoredMockAssets();
      const asset = assets.find((a) => a.id === assetId) || assets[0];
      const basePrice = asset ? asset.currentPrice : 50000;
      const change24h = asset ? asset.change24h : 2.5;
      return generateMockHistory(basePrice, change24h, timeframe);
    }

    const response = await apiClient.get<PricePoint[]>(`/assets/${assetId}/history`, {
      params: { timeframe },
    });
    return response.data;
  },
};
