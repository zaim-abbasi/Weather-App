document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'a7b7da5beed5ede7c6186250d2f136ac';
  const cityInput = document.getElementById('city-input');
  const geolocationBtn = document.getElementById('geolocation-btn');
  const weatherTable = document.getElementById('weather-table');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const filterSelect = document.getElementById('filter-select');

  let currentPage = 1;
  const itemsPerPage = 5;
  let forecastData = [];
  let originalForecastData = [];

  // event listeners
  cityInput.addEventListener('keyup', debounce(handleCityInput, 300));
  geolocationBtn.addEventListener('click', handleGeolocation);
  prevPageBtn.addEventListener('click', handlePrevPage);
  nextPageBtn.addEventListener('click', handleNextPage);
  filterSelect.addEventListener('change', handleFilterChange);

  // debounce func
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // handle city input
  function handleCityInput(e) {
    if (e.key === 'Enter' && cityInput.value.trim() !== '') {
      fetchWeatherForecast(cityInput.value.trim());
    }
  }

  // handle geolocation
  function handleGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => fetchWeatherForecast({ lat: position.coords.latitude, lon: position.coords.longitude }, true),
        () => showError('unable to retrieve your location.')
      );
    } else {
      showError('geolocation is not supported by your browser.');
    }
  }

  // handle prev page
  function handlePrevPage() {
    if (currentPage > 1) {
      currentPage--;
      displayForecast(currentPage);
    }
  }

  // handle next page
  function handleNextPage() {
    if (currentPage * itemsPerPage < forecastData.length) {
      currentPage++;
      displayForecast(currentPage);
    }
  }

  // handle filter change
  function handleFilterChange() {
    const selectedFilter = filterSelect.value;
    applyFilter(selectedFilter);
  }

  // fetch weather forecast
  function fetchWeatherForecast(query, isGeolocation = false) {
    const apiUrl = isGeolocation
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${apiKey}`
      : `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${apiKey}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.cod === '200') {
          originalForecastData = aggregateForecastData(data.list); // store original data
          forecastData = [...originalForecastData]; // reset forecast data
          displayForecast(currentPage);
        } else {
          showError('city not found. please try again.');
        }
      })
      .catch(error => {
        console.error('error fetching weather forecast:', error);
        showError('unable to fetch weather data. please try again later.');
      });
  }

  // aggregate forecast data
  function aggregateForecastData(data) {
    const dateMap = new Map();

    data.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          maxTemp: forecast.main.temp_max,
          minTemp: forecast.main.temp_min,
          currentTemp: forecast.main.temp,
          weather: forecast.weather[0].description,
          icon: forecast.weather[0].icon,
        });
      } else {
        const existingData = dateMap.get(date);
        existingData.maxTemp = Math.max(existingData.maxTemp, forecast.main.temp_max);
        existingData.minTemp = Math.min(existingData.minTemp, forecast.main.temp_min);
      }
    });

    return Array.from(dateMap.values());
  }

  // display forecast data
  function displayForecast(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const tableBody = weatherTable.querySelector('tbody');
    tableBody.innerHTML = '';

    forecastData.slice(start, end).forEach(forecast => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
        <td>${new Date(forecast.date).toLocaleDateString()}</td>
        <td class="temperature">${forecast.currentTemp}°C</td>
        <td class="H/L"><span class="high"><b>${forecast.maxTemp}°C</b></span> <span class="low">${forecast.minTemp}°C</span></td>
        <td>${forecast.weather}</td>
      `;
      tableBody.appendChild(row);
    });

    updatePaginationButtons();
  }

  // update pagination buttons
  function updatePaginationButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage * itemsPerPage >= forecastData.length;
  }

  // show error messages
  function showError(message) {
    alert(message);
  }

  // apply filter
  function applyFilter(filter) {
    forecastData = [...originalForecastData]; // reset to original data

    switch (filter) {
      case 'ascending':
        forecastData.sort((a, b) => a.currentTemp - b.currentTemp);
        break;
      case 'descending':
        forecastData.sort((a, b) => b.currentTemp - a.currentTemp);
        break;
      case 'rain':
        forecastData = forecastData.filter(forecast => forecast.weather.toLowerCase().includes('rain'));
        break;
      case 'highest':
        const highestTempDay = forecastData.reduce((max, forecast) => (forecast.maxTemp > max.maxTemp ? forecast : max), forecastData[0]);
        forecastData = [highestTempDay];
        break;
      default:
        break;
    }
    currentPage = 1; // reset to first page
    displayForecast(currentPage);
  }

  // fetch default weather
  function fetchDefaultWeather() {
    fetchWeatherForecast('Islamabad');
  }

  fetchDefaultWeather(); // initial fetch
});