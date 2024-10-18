document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'a7b7da5beed5ede7c6186250d2f136ac';
  const cityInput = document.getElementById('city-input');
  const geolocationBtn = document.getElementById('geolocation-btn');
  const weatherTable = document.getElementById('weather-table');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');

  let currentPage = 1;
  const itemsPerPage = 5;
  let forecastData = [];

  // Fetch weather on "Enter" press
  cityInput.addEventListener('keyup', debounce((e) => {
    if (e.key === 'Enter' && cityInput.value.trim() !== '') {
      fetchWeatherForecast(cityInput.value.trim());
    }
  }, 300));

  // Debounce to limit the number of API calls while typing
  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Fetch weather data from OpenWeather API
  function fetchWeatherForecast(query, isGeolocation = false) {
    const apiUrl = isGeolocation
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${apiKey}`
      : `https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${apiKey}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.cod === '200') {
          forecastData = aggregateForecastData(data.list);
          displayForecast(currentPage);
        } else {
          showError('City not found. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error fetching weather forecast:', error);
        showError('Unable to fetch weather data. Please try again later.');
      });
  }

  // Aggregate forecast data to group by date
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

  // Display forecast data in a paginated table
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

    // Update button states for pagination
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage * itemsPerPage >= forecastData.length;
  }

  // Handle pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayForecast(currentPage);
    }
  });

  nextPageBtn.addEventListener('click', () => {
    if (currentPage * itemsPerPage < forecastData.length) {
      currentPage++;
      displayForecast(currentPage);
    }
  });

  // Fetch weather data using geolocation
  geolocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        fetchWeatherForecast({ lat: position.coords.latitude, lon: position.coords.longitude }, true);
      }, () => {
        showError('Unable to retrieve your location.');
      });
    } else {
      showError('Geolocation is not supported by your browser.');
    }
  });

  // Display error messages
  function showError(message) {
    alert(message);
  }

  // Fetch default weather for Islamabad on page load
  function fetchDefaultWeather() {
    fetchWeatherForecast('Islamabad');
  }

  fetchDefaultWeather(); // Initial fetch
});
