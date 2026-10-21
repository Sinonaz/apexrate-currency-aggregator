<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAssetsStore } from '@/stores/assetsStore';
import { useToastStore } from '@/stores/toastStore';
import type { AssetType } from '@/types';
import { X, Plus, Sparkles, Loader2, Coins, Banknote } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const assetsStore = useAssetsStore();
const toastStore = useToastStore();

const symbol = ref('');
const name = ref('');
const providerId = ref('');
const assetType = ref<AssetType>('CRYPTO');

// Quick presets to make testing intuitive and instant
const presets: { symbol: string; name: string; providerId: string; type: AssetType }[] = [
  { symbol: 'ADA', name: 'Cardano', providerId: 'cardano', type: 'CRYPTO' },
  { symbol: 'XRP', name: 'XRP', providerId: 'ripple', type: 'CRYPTO' },
  { symbol: 'AVAX', name: 'Avalanche', providerId: 'avalanche-2', type: 'CRYPTO' },
  { symbol: 'USD/GBP', name: 'British Pound', providerId: 'gbp', type: 'FIAT' },
  { symbol: 'USD/JPY', name: 'Japanese Yen', providerId: 'jpy', type: 'FIAT' },
];

function applyPreset(p: { symbol: string; name: string; providerId: string; type: AssetType }) {
  symbol.value = p.symbol;
  name.value = p.name;
  providerId.value = p.providerId;
  assetType.value = p.type;
}

function resetForm() {
  symbol.value = '';
  name.value = '';
  providerId.value = '';
  assetType.value = 'CRYPTO';
}

async function handleSubmit() {
  if (!symbol.value.trim() || !name.value.trim() || !providerId.value.trim()) {
    toastStore.warning('Please fill in all fields (Symbol, Name, Provider ID)', 'Incomplete Form');
    return;
  }

  const success = await assetsStore.createAsset({
    symbol: symbol.value.trim().toUpperCase(),
    name: name.value.trim(),
    providerId: providerId.value.trim().toLowerCase(),
    type: assetType.value,
  });

  if (success) {
    resetForm();
    emit('close');
  }
}

// Handle ESC key press
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-all transform scale-100 animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 id="modal-title" class="text-lg font-bold text-slate-900 dark:text-white">
            Add Tracked Asset
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register a cryptocurrency or currency pair for aggregation
          </p>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Quick Presets -->
      <div class="px-5 pt-4">
        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
          <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Suggestions:</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in presets"
            :key="preset.symbol"
            type="button"
            class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-500/5 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            @click="applyPreset(preset)"
          >
            {{ preset.symbol }}
          </button>
        </div>
      </div>

      <!-- Form Body -->
      <form class="p-5 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Asset Type <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Asset Type">
            <button
              type="button"
              role="radio"
              :aria-checked="assetType === 'CRYPTO'"
              class="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
              :class="assetType === 'CRYPTO'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
              @click="assetType = 'CRYPTO'"
            >
              <Coins class="w-4 h-4 text-emerald-500" />
              <span>Crypto (CRYPTO)</span>
            </button>

            <button
              type="button"
              role="radio"
              :aria-checked="assetType === 'FIAT'"
              class="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer"
              :class="assetType === 'FIAT'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'"
              @click="assetType = 'FIAT'"
            >
              <Banknote class="w-4 h-4 text-emerald-500" />
              <span>Fiat (FIAT)</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Asset Symbol <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="symbol"
            type="text"
            placeholder="e.g. BTC, ETH, USD/EUR"
            required
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all uppercase"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Display Name <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="e.g. Bitcoin, Cardano, Euro"
            required
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Provider ID (CoinGecko / Exchange ID) <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="providerId"
            type="text"
            placeholder="e.g. bitcoin, ethereum, cardano, eur"
            required
            class="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all lowercase"
          />
          <p class="text-[11px] text-slate-400 mt-1">
            Identifier used by backend workers to query external price APIs.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            class="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="assetsStore.isCreating"
          >
            <Loader2 v-if="assetsStore.isCreating" class="w-3.5 h-3.5 animate-spin" />
            <Plus v-else class="w-3.5 h-3.5" />
            <span>{{ assetsStore.isCreating ? 'Saving...' : 'Add Asset' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
