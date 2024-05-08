<template>

  <body style="height: 100vh; display: flex; justify-content: flex-start;">
    <div class="d-flex align-items-center w-100 flex-column">
      <h1 class="text-center fw-bold text-primary">Weather APP</h1>
      <div class="input-group mb-3 w-50">
        <span class="input-group-text" id="basic-addon1">@</span>
        <input v-model="city" type="text" class="form-control" placeholder="City" aria-label="city"
          aria-describedby="basic-addon1">
        <input v-model="date" type="month" class="form-control" placeholder="Month" aria-label="month"
          aria-describedby="basic-addon1">
      </div>
      <button type="button" class="btn btn-light w-25 text-primary fw-bold" @click="search">Search!</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <div class="mt-5 w-100 d-flex flex-column align-items-center" v-if="weatherData">
        <h2>{{ weatherData.location.name }}, {{ weatherData.location.country }}</h2>
        <img :src="weatherData.current.condition.icon" alt="Weather icon">
        <p>Temperature: {{ weatherData.current.temp_c }}°C</p>
        <p>Weather: {{ weatherData.current.condition.text }}</p>
        <p>Average Temperature in selected month: {{ tavg }}°C</p>
        <div v-if="countryData">
          <p class="text-center">Capital: {{ countryData[0].capital[0] }}</p>
          <div v-if="Object.keys(countryData[0].currencies)[0] !== 'EUR'">
            <p class="text-center">Currency: {{ Object.keys(countryData[0].currencies)[0] }}</p>
            <p class="text-center">Rate to EUR: {{ currencyRate }}</p>
          </div>
          <img :src="countryData[0].flags[0]"
            style="width: 400px; height: 200px; object-fit: cover; border: 1px solid black;" alt="Country flag">
        </div>
      </div>
      <!-- <table class="table">
        <thead>
          <tr>
            <th>City</th>
            <th>Country</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in searchHistory" :key="entry.city">
            <td>{{ entry.city }}</td>
            <td>{{ entry.country }}</td>
            <td>{{ entry.count }}</td>
          </tr>
        </tbody>
      </table> -->
      <div>
        <DataTable :value="searchHistory" sortMode="multiple" tableStyle="min-width: 50rem">
          <Column field="city" header="City" sortable></Column>
          <Column field="country" header="Name" sortable></Column>
          <Column field="count" header="Category" sortable></Column>
        </DataTable>
      </div>
    </div>
  </body>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';


const city = ref('');
const date = ref('');
const weatherData = ref(null);
const countryData = ref(null);
const currencyRate = ref(null);
const tavg = ref(null);
const errorMessage = ref('');
const searchHistory = ref([]);


onMounted(() => {
  //$('#searchHistoryTable').DataTable();
  if (localStorage.getItem('searchHistory')) {
    searchHistory.value = JSON.parse(localStorage.getItem('searchHistory'));
  }
});

onUnmounted(() => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
});

const search = async () => {
  try {
    const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=eacb9e371dd34d0cbe371704242104&q=${city.value}`);
    if (!response.ok) {
      throw new Error('Bad request');
    }
    weatherData.value = await response.json();
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = 'Invalid city name. Please try again.';
    weatherData.value = null;
  }

  //const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=eacb9e371dd34d0cbe371704242104&q=${city.value}`);
  //weatherData.value = await response.json();

  // Fetch country data from API
  const countryResponse = await fetch(`https://restcountries.com/v3/name/${weatherData.value.location.country}`);
  const data = await countryResponse.json();
  if (data && data[0]) {
    countryData.value = data;
  }

  if (countryData.value && countryData.value[0] && Object.keys(countryData.value[0].currencies)[0] !== 'EUR') {
    const currencyResponse = await fetch(`https://api.frankfurter.app/latest?to=${Object.keys(countryData.value[0].currencies)[0]}&from=EUR`);
    const currencyData = await currencyResponse.json();
    currencyRate.value = currencyData.rates[Object.keys(countryData.value[0].currencies)[0]];
  }

  if (date.value !== '') {
    const month = date.value.slice(-2);
    const url = `https://meteostat.p.rapidapi.com/point/monthly?lat=${weatherData.value.location.lat}&lon=${weatherData.value.location.lon}&start=2020-${month}-01&end=2020-${month}-28&alt=43`;
    const options = {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'X-RapidAPI-Key': 'e72171c9aemsh9fb21d90d8aad0dp12cdebjsn79b13c8ffc96',
        'X-RapidAPI-Host': 'meteostat.p.rapidapi.com'
      }
    };

    const tempResponse = await fetch(url, options);
    const tempData = await tempResponse.json();
    tavg.value = tempData.data[0].tavg;
  }
  else {
    errorMessage.value = 'Please fill in month!';
    weatherData.value = null;
  }

  if (date.value !== '' && weatherData.value !== null) {
    const existingEntry = searchHistory.value.find(entry => entry.city === city.value);
    if (existingEntry) {
      existingEntry.count++;
    } else {
      searchHistory.value.push({ city: city.value, country: weatherData.value.location.country, count: 1 });
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
  }

};
</script>
