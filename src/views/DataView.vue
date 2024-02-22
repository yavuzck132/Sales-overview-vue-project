<template>
    <div>
      <ChartComponent />
      <TableComponent v-if="showTableComponent" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import ChartComponent from "../components/ChartComponent.vue";
  import TableComponent from '../components/TableComponent.vue';
  import { useStore } from 'vuex';
  
  const store = useStore();
  const isUserInformationAvailable = ref(false);
  const isDailySalesOverviewAvailable = ref(false);
  
  // Fetch user information and daily sales overview on component mount
  onMounted(async () => {
    try {
      // Fetch user information
      await store.dispatch('fetchUserInformation');
      isUserInformationAvailable.value = true;
  
      // Fetch daily sales overview
      await store.dispatch('fetchDailySalesOverview');
      isDailySalesOverviewAvailable.value = true;
    } catch (error) {
      // Handle errors if needed
      console.error('Error fetching data:', error);
    }
  });  
  const showTableComponent = ref(false);
  watch(() => store.state.tableSettings, (newTableSettings) => {
    // Check if salesDate exists and is not an empty string
    console.log(newTableSettings)
    showTableComponent.value = newTableSettings?.salesDate !== undefined && newTableSettings.salesDate !== "";
  }, { deep: true, immediate: true });
  </script>
  