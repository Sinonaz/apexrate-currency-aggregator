<script setup lang="ts">
import { useAppConfigStore } from '@/stores/appConfig';
import { useAssetsStore } from '@/stores/assetsStore';
import { useAlertsStore } from '@/stores/alertsStore';
import {
  TrendingUp,
  Sun,
  Moon,
  RefreshCw,
  PlusCircle,
  Server,
  Database,
  Radio,
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'openAddAsset'): void;
}>();

const appConfig = useAppConfigStore();
const assetsStore = useAssetsStore();
const alertsStore = useAlertsStore();

async function handleRefresh() {
  await Promise.all([
    assetsStore.fetchAssets(),
    alertsStore.fetchAlerts(),
  ]);
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Left: Logo & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              ApexRate
            </h1>
            <span class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              v1.0
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Currency & Crypto Price Aggregator
          </p>
        </div>
      </div>

      <!-- Center / Right: Mode Switcher & Controls -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Mock Mode Toggle Pill -->
        <div class="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-medium">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            :class="appConfig.isMockMode
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            @click="appConfig.setMockMode(true)"
            title="Use simulated mock data without backend"
          >
            <Database class="w-3.5 h-3.5 text-amber-500" />
            <span>Mock Data</span>
          </button>
          
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            :class="!appConfig.isMockMode
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            @click="appConfig.setMockMode(false)"
            title="Connect to live NestJS backend at http://localhost:3000/api"
          >
            <Server class="w-3.5 h-3.5 text-emerald-500" />
            <span class="flex items-center gap-1">
              Live API
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </span>
          </button>
        </div>

        <!-- Add Asset Action Button -->
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm shadow-emerald-600/30 active:scale-95"
          @click="emit('openAddAsset')"
        >
          <PlusCircle class="w-4 h-4" />
          <span class="hidden md:inline">Add Asset</span>
        </button>

        <!-- Refresh Button -->
        <button
          type="button"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          :class="{ 'opacity-60 cursor-not-allowed': assetsStore.isLoadingAssets }"
          :disabled="assetsStore.isLoadingAssets"
          @click="handleRefresh"
          title="Refresh All Data"
        >
          <RefreshCw
            class="w-4 h-4"
            :class="{ 'animate-spin text-emerald-500': assetsStore.isLoadingAssets || alertsStore.isLoading }"
          />
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          @click="appConfig.toggleTheme"
          :title="appConfig.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <Sun v-if="appConfig.isDarkMode" class="w-4 h-4 text-amber-400" />
          <Moon v-else class="w-4 h-4 text-slate-700" />
        </button>
      </div>
    </div>

    <!-- Sub-bar alert banner if Live API selected but error connecting -->
    <div
      v-if="!appConfig.isMockMode && assetsStore.error"
      class="bg-amber-500/10 dark:bg-amber-950/40 border-t border-amber-500/20 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between"
    >
      <div class="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <Radio class="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
        <span>
          Backend offline: Cannot connect to <code>http://localhost:3000/api</code>.
          Switch to <strong>Mock Mode</strong> above to preview frontend features, or start your NestJS backend.
        </span>
        <button
          class="underline font-semibold ml-auto hover:text-amber-950 dark:hover:text-white"
          @click="appConfig.setMockMode(true)"
        >
          Enable Mock Data
        </button>
      </div>
    </div>
  </header>
</template>
