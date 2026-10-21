<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>

<template>
  <div
    class="animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-lg"
    :class="className"
  />
</template>
