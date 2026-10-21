<script setup lang="ts">
import { computed } from 'vue';
import type { Asset } from '@/types';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Trash2, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
  asset: Asset;
  isSelected: boolean;
  isDeleting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'delete', id: string): void;
}>();

const isPositive = computed(() => props.asset.change24h >= 0);

// Format price with appropriate decimal places based on magnitude
const formattedPrice = computed(() => {
  const p = props.asset.currentPrice;
  if (p >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p);
  }
  if (p >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(p);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(p);
});

const formattedTime = computed(() => {
  if (!props.asset.updatedAt) return 'Just now';
  try {
    const d = new Date(props.asset.updatedAt);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return props.asset.updatedAt;
  }
});
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="text-left w-full p-4 rounded-2xl border transition-all duration-200 relative group overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    :class="[
      isSelected
        ? 'bg-slate-900/5 dark:bg-emerald-950/20 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md'
    ]"
    @click="emit('select', asset.id)"
    @keydown.enter.self="emit('select', asset.id)"
    @keydown.space.self.prevent="emit('select', asset.id)"
  >
    <!-- Background subtle gradient highlight when selected -->
    <div
      v-if="isSelected"
      class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
    />

    <div class="flex items-start justify-between gap-2 mb-3">
      <div>
        <div class="flex items-center gap-1.5">
          <span class="text-base font-bold text-slate-900 dark:text-white tracking-wide">
            {{ asset.symbol }}
          </span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {{ asset.providerId }}
          </span>
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] mt-0.5">
          {{ asset.name }}
        </div>
      </div>

      <!-- 24h Change Badge -->
      <div
        class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        :class="isPositive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'"
      >
        <TrendingUp v-if="isPositive" class="w-3 h-3" />
        <TrendingDown v-else class="w-3 h-3" />
        <span>{{ isPositive ? '+' : '' }}{{ asset.change24h.toFixed(2) }}%</span>
      </div>
    </div>

    <!-- Current Price -->
    <div class="mb-3">
      <div class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ formattedPrice }}
      </div>
    </div>

    <!-- Footer: Timestamp, Active Indicator & Delete Button -->
    <div class="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      <span class="flex items-center gap-1">
        <Clock class="w-3 h-3" />
        <span>{{ formattedTime }}</span>
      </span>
      <div class="flex items-center gap-2">
        <span v-if="isSelected" class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck class="w-3 h-3" />
          <span>Active</span>
        </span>
        <button
          type="button"
          class="p-1 -my-1 -mr-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 cursor-pointer"
          :class="{ 'opacity-100': isDeleting }"
          :disabled="isDeleting"
          :title="`Delete ${asset.symbol}`"
          :aria-label="`Delete ${asset.symbol}`"
          @click.stop="emit('delete', asset.id)"
        >
          <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 animate-spin text-rose-500" />
          <Trash2 v-else class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
