import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useAppConfigStore = defineStore('appConfig', () => {
  // Mock mode is off by default; set VITE_MOCK_MODE=true in frontend/.env to start with mock data locally
  const isMockMode = ref<boolean>(
    localStorage.getItem('apexrate_mock_mode') !== null
      ? localStorage.getItem('apexrate_mock_mode') === 'true'
      : import.meta.env.VITE_MOCK_MODE === 'true'
  );

  // Dark mode by default for professional financial dashboard aesthetic
  const isDarkMode = ref<boolean>(
    localStorage.getItem('apexrate_theme') !== null
      ? localStorage.getItem('apexrate_theme') === 'dark'
      : true
  );

  // Sync dark class on document element
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  applyTheme(isDarkMode.value);

  watch(isDarkMode, (val) => {
    localStorage.setItem('apexrate_theme', val ? 'dark' : 'light');
    applyTheme(val);
  });

  watch(isMockMode, (val) => {
    localStorage.setItem('apexrate_mock_mode', String(val));
  });

  function toggleMockMode() {
    isMockMode.value = !isMockMode.value;
  }

  function setMockMode(val: boolean) {
    isMockMode.value = val;
  }

  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
  }

  return {
    isMockMode,
    isDarkMode,
    toggleMockMode,
    setMockMode,
    toggleTheme,
  };
});
