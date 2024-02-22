// store.ts
import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    userInformation: null,
    dailySalesOverview: null,
    selectedDay: 30,
    tableSettings: {
        isDaysCompare: 0,
        marketplace: "",
        pageNumber: 1,
        pageSize: 30,
        salesDate: "",
        salesDate2: "",
        sellerId: ""
      }
  },
  mutations: {
    setUserInformation(state, userInformation) {
      state.userInformation = userInformation;
    },
    setDailySalesOverview(state, dailySalesOverview) {
      state.dailySalesOverview = dailySalesOverview;
    },
    setSelectedDay(state, selectedDay) {
      state.selectedDay = selectedDay;
    },
    setTableSettings(state, tableSettings) {
        state.tableSettings = tableSettings;
    },
  },
  actions: {
    async fetchUserInformation({ commit }) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const email = localStorage.getItem('email');
        const response = await axios.post(
          'https://iapitest.eva.guru/user/user-information',
          { email },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        commit('setUserInformation', response.data);
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    },
    async fetchDailySalesOverview({ commit, state }) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await axios.post(
          'https://iapitest.eva.guru/data/daily-sales-overview',
          {
            marketplace: state.userInformation?.Data.user.store[0].marketplaceName,
            sellerId: state.userInformation?.Data.user.store[0].storeId,
            requestStatus: 0,
            day: state.selectedDay,
            excludeYoYData: true,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        commit('setDailySalesOverview', response.data);
      } catch (error) {
        console.error('Error fetching daily sales overview:', error);
      }
    },
    updateSelectedDay({ commit, dispatch }, selectedDay) {
      commit('setSelectedDay', selectedDay);
      // When selectedDay changes, fetch user information and daily sales overview again
      dispatch('fetchUserInformation');
      dispatch('fetchDailySalesOverview');
    },
    updateTableSettings({ commit, dispatch }, tableSettings) {
        commit('setTableSettings', tableSettings);
        console.log(tableSettings);
        // Trigger any additional actions or logic as needed
    },
  },
});
