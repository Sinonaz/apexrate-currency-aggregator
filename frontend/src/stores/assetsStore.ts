import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { Asset, CreateAssetDto, PricePoint, TimeFrame } from '@/types';
import { assetsApi } from '@/api/assetsApi';
import { useAppConfigStore } from './appConfig';
import { useToastStore } from './toastStore';

export const useAssetsStore = defineStore('assets', () => {
  const appConfig = useAppConfigStore();
  const toastStore = useToastStore();

  const assets = ref<Asset[]>([]);
  const selectedAssetId = ref<string | null>(null);
  const timeframe = ref<TimeFrame>('24h');

  // Cache history by assetId and timeframe: { [assetId]: { [timeframe]: PricePoint[] } }
  const historyCache = ref<Record<string, Partial<Record<TimeFrame, PricePoint[]>>>>({});

  const isLoadingAssets = ref<boolean>(false);
  const isLoadingHistory = ref<boolean>(false);
  const isCreating = ref<boolean>(false);
  const deletingId = ref<string | null>(null);
  const error = ref<string | null>(null);

  const selectedAsset = computed<Asset | null>(() => {
    if (!assets.value.length) return null;
    return assets.value.find((a) => a.id === selectedAssetId.value) || assets.value[0] || null;
  });

  const currentHistory = computed<PricePoint[]>(() => {
    if (!selectedAsset.value) return [];
    const assetHist = historyCache.value[selectedAsset.value.id];
    return assetHist ? assetHist[timeframe.value] || [] : [];
  });

  async function fetchAssets() {
    isLoadingAssets.value = true;
    error.value = null;

    try {
      const data = await assetsApi.getAssets(appConfig.isMockMode);
      assets.value = data;

      if (data.length > 0) {
        if (!selectedAssetId.value || !data.some((a) => a.id === selectedAssetId.value)) {
          selectedAssetId.value = data[0].id;
        }
        await fetchHistory(selectedAssetId.value, timeframe.value);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch assets';
      error.value = msg;
      toastStore.error(msg, 'Assets Load Failed');
    } finally {
      isLoadingAssets.value = false;
    }
  }

  async function fetchHistory(assetId: string, tf: TimeFrame, force = false) {
    if (!assetId) return;

    if (!historyCache.value[assetId]) {
      historyCache.value[assetId] = {};
    }

    if (!force && historyCache.value[assetId][tf] && historyCache.value[assetId][tf]!.length > 0) {
      return;
    }

    isLoadingHistory.value = true;
    try {
      const points = await assetsApi.getAssetHistory(assetId, tf, appConfig.isMockMode);
      historyCache.value[assetId][tf] = points;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch price history';
      toastStore.error(msg, 'History Load Failed');
    } finally {
      isLoadingHistory.value = false;
    }
  }

  async function selectAsset(id: string) {
    selectedAssetId.value = id;
    await fetchHistory(id, timeframe.value);
  }

  async function setTimeframe(tf: TimeFrame) {
    timeframe.value = tf;
    if (selectedAsset.value) {
      await fetchHistory(selectedAsset.value.id, tf);
    }
  }

  async function createAsset(dto: CreateAssetDto): Promise<boolean> {
    isCreating.value = true;
    try {
      const created = await assetsApi.createAsset(dto, appConfig.isMockMode);
      assets.value.push(created);
      selectedAssetId.value = created.id;
      await fetchHistory(created.id, timeframe.value, true);
      toastStore.success(`Asset ${created.symbol} added successfully!`, 'Asset Created');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add asset';
      toastStore.error(msg, 'Create Failed');
      return false;
    } finally {
      isCreating.value = false;
    }
  }

  async function deleteAsset(id: string): Promise<boolean> {
    deletingId.value = id;
    try {
      const target = assets.value.find((a) => a.id === id);
      await assetsApi.deleteAsset(id, appConfig.isMockMode);
      assets.value = assets.value.filter((a) => a.id !== id);
      delete historyCache.value[id];

      if (selectedAssetId.value === id) {
        const nextAsset = assets.value[0];
        selectedAssetId.value = nextAsset ? nextAsset.id : null;
        if (nextAsset) {
          await fetchHistory(nextAsset.id, timeframe.value);
        }
      }

      toastStore.info(
        target ? `Asset ${target.symbol} removed` : 'Asset removed successfully',
        'Asset Removed'
      );
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete asset';
      toastStore.error(msg, 'Delete Failed');
      return false;
    } finally {
      deletingId.value = null;
    }
  }

  // Reload data when switching between Mock and Live API
  watch(
    () => appConfig.isMockMode,
    () => {
      historyCache.value = {};
      fetchAssets();
    }
  );

  return {
    assets,
    selectedAssetId,
    selectedAsset,
    timeframe,
    currentHistory,
    isLoadingAssets,
    isLoadingHistory,
    isCreating,
    deletingId,
    error,
    fetchAssets,
    fetchHistory,
    selectAsset,
    setTimeframe,
    createAsset,
    deleteAsset,
  };
});
