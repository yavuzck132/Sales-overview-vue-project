<!-- ChartComponent.vue -->
<template>
    <div class="relative">
      <select class="absolute top-0 z-10 right-0"
      id="daySelector" v-model="selectedDay" @change="updateSelectedDay">
        <option value="60">Last 60 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="14">Last 14 Days</option>
        <option value="7">Last 7 Days</option>        
      </select>
    </div>
    <div>
        <highcharts :options="chartOptions" ref="chartRef" @click="handleChartClick"></highcharts>
    </div>
  </template>
  
  <script setup lang="ts">
  import moment from 'moment';
  import { ref, watch, onMounted, type Ref } from 'vue';
  import { useStore } from 'vuex';
  
  const store = useStore();
  const selectedDay = ref(30);
  const chartRef: Ref<any> = ref(null);
  const selectedIndices: Ref<number[]> = ref([]);
  const updateSelectedDay = () => {
    store.dispatch('updateSelectedDay', selectedDay.value);
    selectedIndices.value = []
    const tableSettings = {
      isDaysCompare: 0,
        marketplace: "",
        pageNumber: 1,
        pageSize: 30,
        salesDate: "",
        salesDate2: "",
        sellerId: ""
    };

    store.dispatch('updateTableSettings');
  };
  const chartOptions = ref({
    chart: {
      type: 'column',
      height: 600
    },
    title: {
      text: 'Daily Sales',
      align: 'left',
      x: 10,
    },
    xAxis: {
      categories: [],
    },
    yAxis: {
      title: {
        text: 'Amount ($)',
      },
    },
    plotOptions: {
        column: {
    stacking: 'normal',
    dataLabels: {
      enabled: true,
      color: 'white', // Set the text color to white
      verticalAlign: 'middle',
      inside: true,
      rotation: 270,
      formatter: function (this: any) {
        const point = this.point;

        // Calculate the sum for the current point
        const sum = point.y + (point.series.linkedSeries[0]?.points[point.index]?.y || 0);

        if (point.series.index === 1) {
          return sum.toFixed(2); // Display the sum with two decimal places
        }

        return ''; // Return an empty string for other series
      },
      style: {
        textOutline: '0px', // Remove the text outline
      },
    },
  } as Highcharts.PlotColumnOptions,
  series: {
    states: {
      inactive: {
        opacity: 1,
      },
    },
  },
    },
    series: [
      {
        name: 'Profit',
        data: [],
        color: 'green',
      },
      {
        name: 'FBA Amount',
        data: [],
        color: 'blue',
      },
      {
        name: 'FBM Amount',
        data: [],
        color: 'orange',
      },
    ],
    tooltip: {
      totalSales: [], // Update to an array to store total sales for each point
      shipping: [],
      profit: [],
      fbaSales: [],
      fbmSales: [],
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        const point = this as any;
  
        // Retrieve values from arrays based on point index
        const totalSales = chartOptions.value.tooltip.totalSales[point.point.index] || 0;
        const shipping = chartOptions.value.tooltip.shipping[point.point.index] || 0;
        const profit = chartOptions.value.tooltip.profit[point.point.index] || 0;
        const fbaSales = chartOptions.value.tooltip.fbaSales[point.point.index] || 0;
        const fbmSales = chartOptions.value.tooltip.fbmSales[point.point.index] || 0;
  
        return `<b>${point.x}</b><br/>
                Total Sales: ${totalSales}<br/>
                Shipping: ${shipping}<br/>
                Profit: ${profit}<br/>
                FBA Sales: ${fbaSales}<br/>
                FBM Sales: ${fbmSales}`;
      },
    },
  });
  
  watch(
    () => store.state.dailySalesOverview,
    (newDailySalesOverview) => {
      chartOptions.value.xAxis.categories = newDailySalesOverview?.Data?.item?.map((item: any) =>
        moment(item.date).format('dddd, DD-MM-YYYY')
      ) || [];
      chartOptions.value.series[0].data = newDailySalesOverview?.Data?.item?.map((item: any) => item.profit) || [];
      chartOptions.value.series[1].data = newDailySalesOverview?.Data?.item?.map((item: any) => item.fbaAmount) || [];
      chartOptions.value.series[2].data = newDailySalesOverview?.Data?.item?.map((item: any) => item.fbmAmount) || [];
  
      // Calculate 'totalSales' for each point and update chartOptions
      const totalSalesArray = newDailySalesOverview?.Data?.item?.map((item: any) =>
        item.fbaAmount + item.fbmAmount
      ) || [];
      const shippingArray = newDailySalesOverview?.Data?.item?.map((item: any) =>
        item.fbaShippingAmount
      ) || [];
      const profitArray = newDailySalesOverview?.Data?.item?.map((item: any) =>
        item.profit
      ) || [];
      const fbaSalesArray = newDailySalesOverview?.Data?.item?.map((item: any) =>
        item.fbaAmount
      ) || [];
      const fbmSalesArray = newDailySalesOverview?.Data?.item?.map((item: any) =>
        item.fbmAmount
      ) || [];
  
      // Update tooltip arrays
      chartOptions.value.tooltip.totalSales = totalSalesArray;
      chartOptions.value.tooltip.shipping = shippingArray;
      chartOptions.value.tooltip.profit = profitArray;
      chartOptions.value.tooltip.fbaSales = fbaSalesArray;
      chartOptions.value.tooltip.fbmSales = fbmSalesArray;
    },
    { immediate: true }
  );

  onMounted(() => {
    if (chartRef.value && chartRef.value.highcharts) {
    const chartInstance = chartRef.value.highcharts;
    if (chartInstance) {
      // Access the chartInstance and handle the click event
    }
  }
});

  const handleChartClick = (event: { point: { index: number } }) => {
    if (event.point && chartRef.value && chartRef.value.chart) {
    const index = event.point.index;
    if(selectedIndices.value.includes(index) || selectedIndices.value.length < 2){
        if (selectedIndices.value.includes(index)) {
      // Index exists, remove it
      selectedIndices.value = selectedIndices.value.filter((i) => i !== index);
    } else if (selectedIndices.value.length < 2) {
      // Index doesn't exist and there is space for another selection
      selectedIndices.value = [...selectedIndices.value, index];
    }

    // Highlight the selected columns
    chartRef.value.chart.series.forEach((series: any, seriesIndex: any) => {
      series.data.forEach((dataPoint: any, dataIndex: any) => {
        const isSelected = selectedIndices.value.includes(dataIndex);
        const color = isSelected ? 'red' : series.options.color || series.color;
        dataPoint.update({ color }, false); // Set false to prevent chart redraw for each point
      });
    });

    // Redraw the chart once to apply the color changes
    chartRef.value.chart.redraw();

    const isDaysCompare = selectedIndices.value.length === 2 ? 1 : 0;
    const marketplace = store.state.userInformation?.Data.user.store[0].marketplaceName;
    const pageNumber = 1;
    const pageSize = 30;
    const salesDate = selectedIndices.value.length > 0
      ? store.state.dailySalesOverview?.Data?.item[selectedIndices.value[0]].date || ""
      : "";
    const salesDate2 = selectedIndices.value.length > 1
      ? store.state.dailySalesOverview?.Data?.item[selectedIndices.value[1]].date || ""
      : "";
    const sellerId = store.state.userInformation?.Data.user.store[0].storeId;

    const tableSettings = {
      isDaysCompare,
      marketplace,
      pageNumber,
      pageSize,
      salesDate,
      salesDate2,
      sellerId
    };

    store.dispatch('updateTableSettings', tableSettings);
    }
    
  }
};
  </script>
  
  <style scoped>
  /* Add any custom styling for your chart here */
  </style>
  