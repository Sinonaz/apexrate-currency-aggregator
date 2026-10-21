<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAssetsStore } from '@/stores/assetsStore';
import { useAlertsStore } from '@/stores/alertsStore';
import { useAppConfigStore } from '@/stores/appConfig';
import Navbar from '@/components/layout/Navbar.vue';
import AssetCard from '@/components/dashboard/AssetCard.vue';
import AssetSkeletonCard from '@/components/dashboard/AssetSkeletonCard.vue';
import PriceChart from '@/components/dashboard/PriceChart.vue';
import AlertsManager from '@/components/alerts/AlertsManager.vue';
import AddAssetModal from '@/components/dashboard/AddAssetModal.vue';
import ToastContainer from '@/components/common/ToastContainer.vue';
import { Plus, LayoutGrid } from 'lucide-vue-next';

const assetsStore = useAssetsStore();
const alertsStore = useAlertsStore();
const appConfig = useAppConfigStore();

const isAddAssetModalOpen = ref(false);

onMounted(() => {
  assetsStore.fetchAssets();
  alertsStore.fetchAlerts();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
    <!-- Navbar -->
    <Navbar @open-add-asset="isAddAssetModalOpen = true" />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Section 1: Tracked Assets Cards Grid -->
      <section aria-labelledby="tracked-assets-heading">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <LayoutGrid class="w-5 h-5 text-emerald-500" />
            <h2 id="tracked-assets-heading" class="text-lg font-bold text-slate-900 dark:text-white">
              Tracked Assets
            </h2>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {{ assetsStore.assets.length }}
            </span>
          </div>

          <button
            type="button"
            class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            @click="isAddAssetModalOpen = true"
          >
            <Plus class="w-3.5 h-3.5 text-emerald-500" />
            <span>Add Asset</span>
          </button>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <!-- Loading Skeletons -->
          <template v-if="assetsStore.isLoadingAssets">
            <AssetSkeletonCard v-for="i in 5" :key="i" />
          </template>

          <!-- Asset Cards -->
          <template v-else-if="assetsStore.assets.length > 0">
            <AssetCard
              v-for="asset in assetsStore.assets"
              :key="asset.id"
              :asset="asset"
              :is-selected="asset.id === assetsStore.selectedAssetId"
              :is-deleting="assetsStore.deletingId === asset.id"
              @select="assetsStore.selectAsset"
              @delete="assetsStore.deleteAsset"
            />
          </template>

          <!-- Empty State -->
          <div
            v-else
            class="col-span-full py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900"
          >
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">No assets configured yet</p>
            <button
              class="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
              @click="isAddAssetModalOpen = true"
            >
              Add Your First Asset
            </button>
          </div>
        </div>
      </section>

      <!-- Section 2: Interactive Price Chart -->
      <section aria-label="Interactive Price Chart">
        <PriceChart />
      </section>

      <!-- Section 3: Alerts Manager Panel -->
      <section aria-label="Price Alerts Management">
        <AlertsManager />
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-6 text-xs text-slate-500 dark:text-slate-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-slate-700 dark:text-slate-300">ApexRate Aggregator</span>
          <span>&bull;</span>
          <span>Vue 3 + Vite + Tailwind + Pinia</span>
        </div>
        <div class="flex items-center gap-4 text-xs font-mono">
          <span class="flex items-center gap-1.5">
            Mode:
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-semibold"
              :class="appConfig.isMockMode
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
            >
              {{ appConfig.isMockMode ? 'MOCK DATA' : 'LIVE API' }}
            </span>
          </span>
          <span class="text-slate-400 dark:text-slate-600">|</span>
          <span class="text-slate-500">API URL: <code>{{ appConfig.isMockMode ? 'simulated' : 'http://localhost:3000/api' }}</code></span>
        </div>
      </div>
    </footer>

    <!-- Add Asset Modal -->
    <AddAssetModal
      :is-open="isAddAssetModalOpen"
      @close="isAddAssetModalOpen = false"
    />

    <!-- Global Toast Container -->
    <ToastContainer />
  </div>
</template>
