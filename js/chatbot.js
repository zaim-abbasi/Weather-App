const Gemini_API_KEY = "AIzaSyBiAqNp9D5w_lssMVnDhmfk6d5kqa7WPxw";
const OpenWeather_API_KEY = "a7b7da5beed5ede7c6186250d2f136ac"; // Your OpenWeather API Key
import { GoogleGenerativeAI } from "google-generative-ai";

(function () {
  const genAI = new GoogleGenerativeAI(Gemini_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const displayChatbotMessage = (message, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;

    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const fetchWeatherData = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OpenWeather_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather data not available");
    return await response.json();
  };

  const fetchWeatherForecast = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OpenWeather_API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast data not available");
    return await response.json();
  };

  const generateResponseWithGemini = async (question, weatherDescription) => {
    const prompt = `User asked: "${question}". The weather condition is: "${weatherDescription}". Provide 1-2 concise suggestions on what to wear or bring while going outside (up to 10 words).`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    if (response && response.text) {
      return await response.text();
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  };

  const handleWeatherIntent = async (city) => {
    const weatherData = await fetchWeatherData(city);
    const weatherDescription = weatherData.weather[0].description;
    const temperature = weatherData.main.temp;

    return { weatherDescription, temperature };
  };

  const handleTemperatureIntents = async (city, type) => {
    const forecastData = await fetchWeatherForecast(city);
    const temperatures = forecastData.list.map(item => item.main.temp);

    let result;
    if (type === "highest") {
      result = Math.max(...temperatures).toFixed(1);
    } else if (type === "lowest") {
      result = Math.min(...temperatures).toFixed(1);
    } else if (type === "average") {
      result = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1);
    }
    return result;
  };

  const processChatbotQuestion = async (question) => {
    try {
      const cityRegex = /in ([A-Za-z\s]+)/i;
      const cityMatch = question.match(cityRegex);
      let city = cityMatch ? cityMatch[1].trim() : "";

      if (city) {
        let intentResponse;

        // Determine the intent based on keywords in the question
        if (question.toLowerCase().includes("current weather") || question.toLowerCase().includes("weather")) {
          intentResponse = await handleWeatherIntent(city);
          const weatherOutput = `The current weather in ${city} is ${intentResponse.weatherDescription} with a temperature of ${intentResponse.temperature}°C.`;
          const geminiResponse = await generateResponseWithGemini(question, intentResponse.weatherDescription);
          const combinedResponse = `${weatherOutput} ${geminiResponse}`;
          displayChatbotMessage(combinedResponse, 'bot');
        } else if (question.toLowerCase().includes("highest temperature")) {
          const highestTemp = await handleTemperatureIntents(city, "highest");
          displayChatbotMessage(`The highest temperature in ${city} is ${highestTemp}°C.`, 'bot');
        } else if (question.toLowerCase().includes("lowest temperature")) {
          const lowestTemp = await handleTemperatureIntents(city, "lowest");
          displayChatbotMessage(`The lowest temperature in ${city} is ${lowestTemp}°C.`, 'bot');
        } else if (question.toLowerCase().includes("average temperature")) {
          const averageTemp = await handleTemperatureIntents(city, "average");
          displayChatbotMessage(`The average temperature in ${city} is ${averageTemp}°C.`, 'bot');
        } else if (question.toLowerCase().includes("forecast")) {
          // Handle forecast request (this part can be extended with more functionality)
          displayChatbotMessage("Sorry, forecast data is not available yet.", 'bot');
        } else {
          displayChatbotMessage("I couldn't understand your request. Please ask about the current weather or temperature details.", 'bot');
        }
      } else {
        displayChatbotMessage("I'm sorry, but I need a city name to provide weather information.", 'bot');
      }
    } catch (error) {
      console.error("Error processing chatbot question:", error);
      displayChatbotMessage("Sorry, I couldn't process your request. Please try again later.", 'bot');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');

    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(null, args);
        }, delay);
      };
    };

    const sendChatMessage = () => {
      const question = chatInput.value.trim();
      if (question) {
        displayChatbotMessage(question, 'user');
        processChatbotQuestion(question)
          .finally(() => {
            chatInput.value = '';
          });
      }
    };

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });

    sendChatBtn.addEventListener('click', debounce(sendChatMessage, 300));
  });
})();
