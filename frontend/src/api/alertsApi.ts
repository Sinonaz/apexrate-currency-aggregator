import { apiClient } from './client';
import type { PriceAlert, CreateAlertDto, DeleteAlertResponse } from '@/types';
import { INITIAL_MOCK_ALERTS } from './mockData';

const MOCK_STORAGE_KEY = 'apexrate_mock_alerts';

function getStoredMockAlerts(): PriceAlert[] {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Fallback
    }
  }
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ALERTS));
  return [...INITIAL_MOCK_ALERTS];
}

function saveStoredMockAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(alerts));
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const alertsApi = {
  async getAlerts(useMock = false): Promise<PriceAlert[]> {
    if (useMock) {
      await delay(250);
      return getStoredMockAlerts();
    }
    const response = await apiClient.get<PriceAlert[]>('/alerts');
    return response.data;
  },

  async createAlert(dto: CreateAlertDto, useMock = false): Promise<PriceAlert> {
    if (useMock) {
      await delay(350);
      const alerts = getStoredMockAlerts();
      const newAlert: PriceAlert = {
        id: 'alert-' + Date.now(),
        assetId: dto.assetId,
        assetSymbol: dto.assetSymbol || 'ASSET',
        targetPrice: Number(dto.targetPrice),
        condition: dto.condition,
        telegramChatId: dto.telegramChatId.trim(),
        isTriggered: false,
        createdAt: new Date().toISOString(),
      };
      alerts.unshift(newAlert);
      saveStoredMockAlerts(alerts);
      return newAlert;
    }

    const response = await apiClient.post<PriceAlert>('/alerts', dto);
    return response.data;
  },

  async deleteAlert(id: string, useMock = false): Promise<DeleteAlertResponse> {
    if (useMock) {
      await delay(250);
      let alerts = getStoredMockAlerts();
      alerts = alerts.filter((a) => a.id !== id);
      saveStoredMockAlerts(alerts);
      return { success: true };
    }

    const response = await apiClient.delete<DeleteAlertResponse>(`/alerts/${id}`);
    return response.data;
  },
};
