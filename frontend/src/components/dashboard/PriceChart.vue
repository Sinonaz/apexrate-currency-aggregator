<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { useAssetsStore } from '@/stores/assetsStore';
import { useAppConfigStore } from '@/stores/appConfig';
import type { TimeFrame } from '@/types';
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-vue-next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const assetsStore = useAssetsStore();
const appConfig = useAppConfigStore();

const timeframes: { label: string; value: TimeFrame }[] = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
];

const selectedAsset = computed(() => assetsStore.selectedAsset);
const history = computed(() => assetsStore.currentHistory);
const isPositive = computed(() => (selectedAsset.value ? selectedAsset.value.change24h >= 0 : true));

// Calculate stats for the period
const stats = computed(() => {
  if (!history.value.length) return { high: 0, low: 0, spread: 0 };
  const prices = history.value.map((p) => p.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const spread = high - low;
  return { high, low, spread };
});

function formatPrice(val: number) {
  if (val >= 1000) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  }
  if (val >= 1) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(val);
}

// Chart Labels & Data
const chartData = computed<ChartData<'line'>>(() => {
  const points = history.value;
  if (!points.length) {
    return { labels: [], datasets: [] };
  }

  const labels = points.map((p) => {
    const d = new Date(p.timestamp);
    if (assetsStore.timeframe === '7d') {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' });
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const lineColor = isPositive.value ? '#10b981' : '#f43f5e';
  const fillGradient = isPositive.value ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  return {
    labels,
    datasets: [
      {
        label: selectedAsset.value?.symbol || 'Price',
        data: points.map((p) => p.price),
        borderColor: lineColor,
        borderWidth: 2.5,
        backgroundColor: fillGradient,
        fill: true,
        tension: 0.35,
        pointRadius: points.length > 20 ? 0 : 3,
        pointHoverRadius: 6,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };
});

// Chart Options
const chartOptions = computed<ChartOptions<'line'>>(() => {
  const isDark = appConfig.isDarkMode;
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (ctx) => ` Price: ${formatPrice(Number(ctx.parsed.y))}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
          maxRotation: 0,
          maxTicksLimit: 8,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: (value) => formatPrice(Number(value)),
        },
      },
    },
  };
});
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors duration-200">
    <!-- Chart Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div v-if="selectedAsset">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            {{ selectedAsset.name }}
          </h2>
          <span class="text-sm font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {{ selectedAsset.symbol }}
          </span>
          <div
            class="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            :class="isPositive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
          >
            <TrendingUp v-if="isPositive" class="w-3.5 h-3.5" />
            <TrendingDown v-else class="w-3.5 h-3.5" />
            <span>{{ isPositive ? '+' : '' }}{{ selectedAsset.change24h.toFixed(2) }}%</span>
          </div>
        </div>
        <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          {{ formatPrice(selectedAsset.currentPrice) }}
        </div>
      </div>
      <div v-else class="space-y-2">
        <LoadingSkeleton className="h-6 w-32" />
        <LoadingSkeleton className="h-8 w-44" />
      </div>

      <!-- Timeframe selector -->
      <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
        <button
          v-for="tf in timeframes"
          :key="tf.value"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="assetsStore.timeframe === tf.value
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
          @click="assetsStore.setTimeframe(tf.value)"
        >
          {{ tf.label }}
        </button>
      </div>
    </div>

    <!-- Quick Stats Bar -->
    <div
      v-if="selectedAsset && history.length > 0"
      class="grid grid-cols-3 gap-2 py-3 px-4 my-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs"
    >
      <div>
        <span class="text-slate-400 flex items-center gap-1">
          <ArrowUpRight class="w-3 h-3 text-emerald-500" /> High ({{ assetsStore.timeframe.toUpperCase() }})
        </span>
        <span class="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
          {{ formatPrice(stats.high) }}
        </span>
      </div>
      <div>
        <span class="text-slate-400 flex items-center gap-1">
          <ArrowDownRight class="w-3 h-3 text-rose-500" /> Low ({{ assetsStore.timeframe.toUpperCase() }})
        </span>
        <span class="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
          {{ formatPrice(stats.low) }}
        </span>
      </div>
      <div>
        <span class="text-slate-400 flex items-center gap-1">
          <Activity class="w-3 h-3 text-blue-500" /> Spread
        </span>
        <span class="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
          {{ formatPrice(stats.spread) }}
        </span>
      </div>
    </div>

    <!-- Chart Canvas Area / Loading Skeleton -->
    <div class="h-72 sm:h-80 w-full relative mt-2">
      <!-- Loading skeleton -->
      <div
        v-if="assetsStore.isLoadingHistory"
        class="absolute inset-0 flex flex-col justify-end p-4 gap-4 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs rounded-xl"
      >
        <div class="flex items-center justify-center h-full">
          <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            <Activity class="w-4 h-4 animate-spin text-emerald-500" />
            <span>Loading historical data...</span>
          </div>
        </div>
      </div>

      <!-- No data empty state -->
      <div
        v-else-if="!history.length"
        class="flex flex-col items-center justify-center h-full text-slate-400"
      >
        <Activity class="w-8 h-8 mb-2 opacity-40" />
        <p class="text-sm">No price points available for this timeframe</p>
      </div>

      <!-- Chart.js component -->
      <Line
        v-if="history.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>
