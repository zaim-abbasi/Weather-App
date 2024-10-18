document.addEventListener('DOMContentLoaded', function () {
  const apiKey = 'a7b7da5beed5ede7c6186250d2f136ac'; // Replace with your OpenWeatherMap API key
  const geminiApiKey = 'AIzaSyBk1QdUe083ynpjvEuXSJR2QIwRG2963w4'; // Replace with your Gemini API key
  const cityInput = document.getElementById('city-input');
  const geolocationBtn = document.getElementById('geolocation-btn');
  const weatherTable = document.getElementById('weather-table');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatMessages = document.querySelector('.chat-messages');

  let currentPage = 1;
  const itemsPerPage = 5;
  let forecastData = [];

  // Fetch weather when city is selected
  cityInput.addEventListener('keyup', function (e) {
    const city = cityInput.value;

    if (e.key === 'Enter' && city !== '') {
      fetchWeatherForecast(city);
    }
  });

  // Fetch weather data by city name
  function fetchWeatherForecast(city) {
    if (city === '') {
      alert('Please enter a city name');
      return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.cod === '200') {
          forecastData = aggregateForecastData(data.list);
          displayForecast(currentPage);
        } else {
          alert('City not found. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error fetching weather forecast:', error);
        alert('Unable to fetch weather forecast data');
      });
  }

  function aggregateForecastData(data) {
    const aggregatedData = [];
    const dateMap = new Map();

    data.forEach(forecast => {
      const date = new Date(forecast.dt * 1000).toDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date: date,
          maxTemp: forecast.main.temp_max,
          minTemp: forecast.main.temp_min,
          currentTemp: forecast.main.temp,
          weather: forecast.weather[0].description,
          icon: forecast.weather[0].icon
        });
      } else {
        const existingData = dateMap.get(date);
        existingData.maxTemp = Math.max(existingData.maxTemp, forecast.main.temp_max);
        existingData.minTemp = Math.min(existingData.minTemp, forecast.main.temp_min);
      }
    });

    dateMap.forEach(value => aggregatedData.push(value));
    return aggregatedData;
  }

  function displayForecast(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const tableBody = weatherTable.querySelector('tbody');
    tableBody.innerHTML = '';

    for (let i = start; i < end && i < forecastData.length; i++) {
      const forecast = forecastData[i];
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
        <td>${new Date(forecast.date).toLocaleDateString()}</td>
        <td class="temperature">${forecast.currentTemp}°C</td>
        <td class="H/L"><span class="high"><b>${forecast.maxTemp}°C</b></span> <span class="low">${forecast.minTemp}°C</span></td>
        <td>${forecast.weather}</td>
      `;
      tableBody.appendChild(row);
    }

    // If there are fewer items than itemsPerPage, fetch more data
    if (end > forecastData.length) {
      const remainingDays = end - forecastData.length;
      fetchMoreWeatherData(cityInput.value, remainingDays);
    }
  }

  function fetchMoreWeatherData(city, days) {
    const currentDate = new Date();
    const futureDates = [];

    for (let i = 1; i <= days; i++) {
      const futureDate = new Date();
      futureDate.setDate(currentDate.getDate() + i);
      futureDates.push(futureDate.toISOString().split('T')[0]);
    }

    futureDates.forEach(date => {
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}&date=${date}`)
        .then(response => response.json())
        .then(data => {
          if (data.cod === '200') {
            const newForecastData = aggregateForecastData(data.list);
            forecastData = [...forecastData, ...newForecastData];
            displayForecast(currentPage);
          } else {
            console.error('Unable to fetch weather forecast data for future dates');
          }
        })
        .catch(error => {
          console.error('Error fetching weather forecast:', error);
        });
    });
  }

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

  // Geolocation button: fetch current location weather
  geolocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
          .then(response => response.json())
          .then(data => {
            if (data.cod === '200') {
              forecastData = aggregateForecastData(data.list);
              displayForecast(currentPage);
            } else {
              alert('Unable to fetch weather forecast data for your location');
            }
          })
          .catch(error => {
            console.error('Error fetching weather forecast:', error);
            alert('Unable to fetch weather forecast data');
          });
      });
    } else {
      alert('Geolocation is not supported by your browser');
    }
  });

  // Fetch weather data for Islamabad by default
  function fetchDefaultWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Islamabad&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.cod === '200') {
          forecastData = aggregateForecastData(data.list);
          displayForecast(currentPage);
        } else {
          // alert('Unable to fetch default weather data');
        }
      })
      .catch(error => {
        console.error('Error fetching default weather data:', error);
        // alert('Unable to fetch default weather data');
      });
  }

  // Call fetchDefaultWeather when the page loads
  fetchDefaultWeather();

  // Chatbot functionality
  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });

  sendChatBtn.addEventListener('click', sendChatMessage);

  function sendChatMessage() {
    const question = chatInput.value.trim();
    if (question !== '') {
      displayChatbotMessage(question, 'user');
      processChatbotQuestion(question);
      chatInput.value = '';
    }
  }

  function processChatbotQuestion(question) {
    // Clear chat history if the '/clear' command is issued
    if (question.toLowerCase().includes('/clear')) {
      chatMessages.innerHTML = '';
      return;
    }

    // Prepare the payload for the API call
    const payload = {
      contents: [
        {
          parts: [
            {
              text: question
            }
          ]
        }
      ]
    };

    // Make the API call to the Gemini API
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Convert the payload to JSON
    })
      .then(response => {
        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json(); // Parse the JSON response
      })
      .then(data => {
        console.log("API Response:", data); // Log full API response

        // Check if data contains the expected fields
        if (!data || !data.contents || !data.contents[0].parts || !data.contents[0].parts[0].text) {
          throw new Error('Invalid response format from API');
        }

        // Extract the generated text response
        const generatedResponse = data.contents[0].parts[0].text;
        displayChatbotMessage(generatedResponse, 'bot'); // Display the generated response
      })
      .catch(error => {
        // Catch errors from the API call
        console.error('Error processing API request:', error);
        displayChatbotMessage('Sorry, I am having trouble answering your question. Please try again later.', 'bot');
      });
  }

  function displayChatbotMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});