import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { PriceAlert, CreateAlertDto } from '@/types';
import { alertsApi } from '@/api/alertsApi';
import { useAppConfigStore } from './appConfig';
import { useToastStore } from './toastStore';

export const useAlertsStore = defineStore('alerts', () => {
  const appConfig = useAppConfigStore();
  const toastStore = useToastStore();

  const alerts = ref<PriceAlert[]>([]);
  const isLoading = ref<boolean>(false);
  const isCreating = ref<boolean>(false);
  const deletingId = ref<string | null>(null);
  const error = ref<string | null>(null);

  async function fetchAlerts() {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await alertsApi.getAlerts(appConfig.isMockMode);
      alerts.value = data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch alerts';
      error.value = msg;
      toastStore.error(msg, 'Alerts Load Failed');
    } finally {
      isLoading.value = false;
    }
  }

  async function createAlert(dto: CreateAlertDto): Promise<boolean> {
    isCreating.value = true;
    try {
      const created = await alertsApi.createAlert(dto, appConfig.isMockMode);
      alerts.value.unshift(created);
      toastStore.success(`Price alert created for ${created.assetSymbol} at $${created.targetPrice}`, 'Alert Created');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create alert';
      toastStore.error(msg, 'Create Alert Failed');
      return false;
    } finally {
      isCreating.value = false;
    }
  }

  async function deleteAlert(id: string): Promise<boolean> {
    deletingId.value = id;
    try {
      await alertsApi.deleteAlert(id, appConfig.isMockMode);
      alerts.value = alerts.value.filter((a) => a.id !== id);
      toastStore.info('Alert deleted successfully', 'Alert Removed');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete alert';
      toastStore.error(msg, 'Delete Failed');
      return false;
    } finally {
      deletingId.value = null;
    }
  }

  // Reload when switching Mock mode
  watch(
    () => appConfig.isMockMode,
    () => {
      fetchAlerts();
    }
  );

  return {
    alerts,
    isLoading,
    isCreating,
    deletingId,
    error,
    fetchAlerts,
    createAlert,
    deleteAlert,
  };
});
