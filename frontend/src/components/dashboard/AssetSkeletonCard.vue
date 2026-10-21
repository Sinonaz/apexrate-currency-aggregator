<script setup lang="ts">
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue';
</script>

<template>
  <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <div class="space-y-1.5">
        <LoadingSkeleton className="h-5 w-16" />
        <LoadingSkeleton className="h-3 w-24" />
      </div>
      <LoadingSkeleton className="h-6 w-16 rounded-full" />
    </div>

    <LoadingSkeleton className="h-8 w-28 my-1" />

    <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
      <LoadingSkeleton className="h-3 w-20" />
      <LoadingSkeleton className="h-3 w-12" />
    </div>
  </div>
</template>
