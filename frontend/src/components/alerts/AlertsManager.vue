<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAlertsStore } from '@/stores/alertsStore';
import { useAssetsStore } from '@/stores/assetsStore';
import { useToastStore } from '@/stores/toastStore';
import type { AlertCondition } from '@/types';
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
import {
  Bell,
  ArrowUp,
  ArrowDown,
  Trash2,
  Send,
  Loader2,
  CheckCircle,
  Info,
} from 'lucide-vue-next';

const alertsStore = useAlertsStore();
const assetsStore = useAssetsStore();
const toastStore = useToastStore();

const selectedAssetId = ref<string>('');
const condition = ref<AlertCondition>('ABOVE');
const targetPrice = ref<number | ''>('');
const telegramChatId = ref<string>('');

// Auto-select first asset if not selected
const availableAssets = computed(() => assetsStore.assets);

// If selectedAssetId is empty but assets are loaded, initialize it
const currentAsset = computed(() => {
  return availableAssets.value.find((a) => a.id === selectedAssetId.value) || availableAssets.value[0];
});

function handleUseCurrentPrice() {
  if (currentAsset.value) {
    targetPrice.value = currentAsset.value.currentPrice;
  }
}

async function handleCreateAlert() {
  const assetIdToUse = selectedAssetId.value || (availableAssets.value[0] ? availableAssets.value[0].id : '');
  if (!assetIdToUse) {
    toastStore.warning('Please select an asset to track', 'Missing Asset');
    return;
  }

  if (targetPrice.value === '' || Number(targetPrice.value) <= 0) {
    toastStore.warning('Please enter a valid target price greater than 0', 'Invalid Price');
    return;
  }

  if (!telegramChatId.value.trim()) {
    toastStore.warning('Please enter your Telegram Chat ID for notifications', 'Missing Chat ID');
    return;
  }

  const asset = availableAssets.value.find((a) => a.id === assetIdToUse);
  const assetSymbol = asset ? asset.symbol : 'ASSET';

  const success = await alertsStore.createAlert({
    assetId: assetIdToUse,
    assetSymbol,
    targetPrice: Number(targetPrice.value),
    condition: condition.value,
    telegramChatId: telegramChatId.value.trim(),
  });

  if (success) {
    targetPrice.value = '';
  }
}

function formatPrice(val: number) {
  if (val >= 1000) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  }
  if (val >= 1) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(val);
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-colors duration-200">
    <!-- Panel Header -->
    <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Bell class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Price Alerts & Telegram Bot
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Set triggers to notify you via Telegram when an asset reaches target levels
          </p>
        </div>
      </div>
      <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
        {{ alertsStore.alerts.length }} Total Alerts
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
      <!-- Left Column: Create Alert Form (4 cols) -->
      <div class="lg:col-span-5 p-5 bg-slate-50/50 dark:bg-slate-900/40">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
          <span>Create New Alert</span>
        </h3>

        <form class="space-y-4" @submit.prevent="handleCreateAlert">
          <!-- Asset Select -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Asset
            </label>
            <select
              v-model="selectedAssetId"
              class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="" disabled>Choose an asset...</option>
              <option
                v-for="asset in availableAssets"
                :key="asset.id"
                :value="asset.id"
              >
                {{ asset.symbol }} - {{ asset.name }} (${{ asset.currentPrice }})
              </option>
            </select>
          </div>

          <!-- Condition: Above vs Below -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Condition Trigger
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
                :class="condition === 'ABOVE'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
                @click="condition = 'ABOVE'"
              >
                <ArrowUp class="w-4 h-4 text-emerald-500" />
                <span>Price ABOVE (&ge;)</span>
              </button>

              <button
                type="button"
                class="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
                :class="condition === 'BELOW'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
                @click="condition = 'BELOW'"
              >
                <ArrowDown class="w-4 h-4 text-rose-500" />
                <span>Price BELOW (&le;)</span>
              </button>
            </div>
          </div>

          <!-- Target Price -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Price (USD)
              </label>
              <button
                v-if="currentAsset"
                type="button"
                class="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                @click="handleUseCurrentPrice"
              >
                Current: {{ formatPrice(currentAsset.currentPrice) }}
              </button>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
              <input
                v-model="targetPrice"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                required
                class="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <!-- Telegram Chat ID -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Telegram Chat ID
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Send class="w-3.5 h-3.5" />
              </span>
              <input
                v-model="telegramChatId"
                type="text"
                placeholder="e.g. 123456789 or @username"
                required
                class="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
            <div class="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
              <Info class="w-3 h-3 shrink-0" />
              <span>Tip: Send /start to your bot or check via <code>@userinfobot</code></span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm shadow-emerald-600/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            :disabled="alertsStore.isCreating"
          >
            <Loader2 v-if="alertsStore.isCreating" class="w-4 h-4 animate-spin" />
            <Bell v-else class="w-4 h-4" />
            <span>{{ alertsStore.isCreating ? 'Creating Alert...' : 'Set Alert Trigger' }}</span>
          </button>
        </form>
      </div>

      <!-- Right Column: Active Alerts Table (7 cols) -->
      <div class="lg:col-span-7 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Active Alerts Table
          </h3>
          <span class="text-xs text-slate-400">
            Monitored by backend scheduler
          </span>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="alertsStore.isLoading" class="space-y-3">
          <LoadingSkeleton v-for="i in 3" :key="i" className="h-14 w-full rounded-xl" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="alertsStore.alerts.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
        >
          <Bell class="w-8 h-8 mb-2 opacity-30" />
          <p class="text-sm font-medium text-slate-600 dark:text-slate-300">No alerts created yet</p>
          <p class="text-xs text-slate-400 mt-0.5">Use the form on the left to set price triggers</p>
        </div>

        <!-- Alerts Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th class="pb-2.5 pl-1">Asset</th>
                <th class="pb-2.5">Condition</th>
                <th class="pb-2.5">Target Price</th>
                <th class="pb-2.5">Status</th>
                <th class="pb-2.5">Telegram Chat</th>
                <th class="pb-2.5 pr-1 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              <tr
                v-for="alert in alertsStore.alerts"
                :key="alert.id"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <!-- Asset Symbol -->
                <td class="py-3 pl-1 font-bold text-slate-900 dark:text-white">
                  {{ alert.assetSymbol }}
                </td>

                <!-- Condition -->
                <td class="py-3">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="alert.condition === 'ABOVE'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
                  >
                    <ArrowUp v-if="alert.condition === 'ABOVE'" class="w-3 h-3" />
                    <ArrowDown v-else class="w-3 h-3" />
                    <span>{{ alert.condition }}</span>
                  </span>
                </td>

                <!-- Target Price -->
                <td class="py-3 font-semibold text-slate-800 dark:text-slate-200">
                  {{ formatPrice(alert.targetPrice) }}
                </td>

                <!-- Status Badge -->
                <td class="py-3">
                  <span
                    v-if="!alert.isTriggered"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    <CheckCircle class="w-3 h-3" />
                    TRIGGERED
                  </span>
                </td>

                <!-- Telegram Chat ID & Date -->
                <td class="py-3 text-[11px]">
                  <div class="font-mono text-slate-600 dark:text-slate-300">{{ alert.telegramChatId }}</div>
                  <div class="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">{{ formatDate(alert.createdAt) }}</div>
                </td>

                <!-- Delete Action -->
                <td class="py-3 pr-1 text-right">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                    :disabled="alertsStore.deletingId === alert.id"
                    title="Delete Alert"
                    @click="alertsStore.deleteAlert(alert.id)"
                  >
                    <Loader2 v-if="alertsStore.deletingId === alert.id" class="w-4 h-4 animate-spin text-rose-500" />
                    <Trash2 v-else class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
