<!-- TableComponent.vue -->
<template>
  <div>
    <!-- End of the list message -->
    <div id="endOfListMessage" :style="{ display: skuListData.length === 0 ? 'block' : 'none' }">
      End of the list
    </div>
    <div v-if="skuListData.length > 0">
      <table class="m-1">
        <thead>
          <tr class="bg-gray-100 h-28">
            <!-- SKU -->
            <th class="text-left">
              <p>SKU</p>
            </th>
            <!-- Product Name -->
            <th class="text-left">
              <p>Product Name</p>
            </th>
            <!-- SalesDate Information -->
            <th class="text-right">
              <p>{{ moment(store.state.tableSettings.salesDate).format("dddd") }}</p>
              <p>{{ moment(store.state.tableSettings.salesDate).format("DD-MM-YYYY") }}</p>
              <p>Sales / Units</p>
              <p>Avg. Selling Price</p>
            </th>
            <!-- SalesDate2 Information if available -->
            <th v-if="store.state.tableSettings.salesDate2 !== ''" class="text-right">
              <p>{{ moment(store.state.tableSettings.salesDate2).format("dddd") }}</p>
                <p>{{ moment(store.state.tableSettings.salesDate2).format("DD-MM-YYYY") }}</p>
                <p>Sales / Units</p>
                <p>Avg. Selling Price</p>
            </th>
            <th class="text-right">
              <p>SKU Refund Rate</p>
              <p>(Last {{ days }} days)</p>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Rest of the table body content goes here -->
          <tr v-for="(rowData, index) in skuListData" :key="index" class="even:bg-gray-100 h-28">
            <!-- SKU -->
            <td class="text-left">
              <p>{{ rowData.sku }}</p>
            </td>
            <!-- Product Name -->
            <td class="text-left">
              <p>{{ rowData.productName }}</p>
            </td>
            <!-- SalesDate Information -->
            <td class="text-right text-blue-500">
              <!-- Add your data here -->
              <p>${{ rowData.amount.toFixed(2) }} / {{ rowData.qty }}</p>
              <p>${{ (rowData.amount/rowData.qty).toFixed(2) }}</p>
            </td>
            <!-- SalesDate2 Information if available -->
            <td v-if="store.state.tableSettings.salesDate2 !== ''" class="text-right text-green-500">
              <!-- Add your data here -->
              <p>${{ rowData.amount2.toFixed(2) }} / {{ rowData.qty2}}</p>
              <p>${{ (rowData.amount2/rowData.qty2).toFixed(2) }}</p>
            </td>
            <td class="text-right">
              <!-- Add your data here -->
              <p>{{ skuRateListData[index].refundRate.toFixed(2) }}%</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination Section -->
    <div class="flex items-center justify-center space-x-4 my-8">
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer focus:outline-none"
        :class="{ 'opacity-50 cursor-not-allowed': page === 1 }"
        @click="updatePage(-1)"
        :disabled="page === 1"
      >Prev</button>

      <div class="px-4 py-2 bg-gray-100 rounded-md">{{ page }}</div>

      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer focus:outline-none"
        :class="{ 'opacity-50 cursor-not-allowed': skuListData.length === 0 }"
        @click="updatePage(1)"
        :disabled="skuListData.length === 0"
      >Next</button>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import moment from 'moment';
  const skuListData = ref<Array<{ sku: string, productName: string, amount: number, amount2: number, qty: number, qty2: number }>>([]);
  const skuRateListData = ref<Array<{refundRate: number}>>([]);
  const page = ref(1);  
  const store = useStore();
  const days = ref(store.state.selectedDay);
  // Function to make API call using fetch
  const fetchData = async () => {
    try {
    const accessToken = localStorage.getItem('accessToken');

    // Prepare the request body for daily-sales-sku-list
    const dailySalesRequestBody = {
      isDaysCompare: store.state.tableSettings.isDaysCompare === 2 ? 1 : 0,
      marketplace: store.state.tableSettings.marketplace,
      pageNumber: Math.ceil(page.value / 3),
      pageSize: 30,
      salesDate: store.state.tableSettings.salesDate,
      salesDate2: store.state.tableSettings.salesDate2,
      sellerId: store.state.tableSettings.sellerId,
    };

    // Make the fetch request for daily-sales-sku-list
    const dailySalesResponse = await fetch('https://iapitest.eva.guru/data/daily-sales-sku-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dailySalesRequestBody),
    });

    // Check if the daily-sales-sku-list request was successful
    if (dailySalesResponse.ok) {
      const dailySalesData = await dailySalesResponse.json();
      const startIndex = (page.value % 3 - 1)*10;
      const endIndex = startIndex + 10;
      skuListData.value = dailySalesData?.Data?.item?.skuList.slice(startIndex, endIndex) || [];
      console.log('API Response (daily-sales-sku-list):', skuListData.value);

      // Prepare the request body for get-sku-refund-rate
      const refundRateRequestBody = {
        marketplace: store.state.tableSettings.marketplace,
        sellerId: store.state.tableSettings.sellerId,
        skuList: skuListData.value,
        requestedDay: store.state.selectedDay,
      };

      // Make the fetch request for get-sku-refund-rate
      const refundRateResponse = await fetch('https://iapitest.eva.guru/data/get-sku-refund-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(refundRateRequestBody),
      });

      // Check if the get-sku-refund-rate request was successful
      if (refundRateResponse.ok) {
        const refundRateData = await refundRateResponse.json();
        skuRateListData.value = refundRateData.Data
        console.log('API Response (get-sku-refund-rate):', refundRateData.Data);
      } else {
        console.error('API Error (get-sku-refund-rate):', refundRateResponse.statusText);
      }
    } else {
      console.error('API Error (daily-sales-sku-list):', dailySalesResponse.statusText);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
  };

  const updatePage = (change: number) => {
    page.value += change;
    fetchData();
    };
  
  // Watch for changes in tableSettings
  watch(() => store.state.tableSettings, async (newTableSettings) => {
    // If salesDate or salesDate2 changes, make the API call
    if (newTableSettings.salesDate !== '') {
      await fetchData(); // Call the fetchData function
    }
  }, { deep: true, immediate: true });
  
  
  
  onMounted(() => {
    console.log('Table component mounted');
  });
  </script>
  
  <style scoped>
  </style>
  