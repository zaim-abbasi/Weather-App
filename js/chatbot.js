const gemini_api_key = "AIzaSyBiAqNp9D5w_lssMVnDhmfk6d5kqa7WPxw";
const openweather_api_key = "a7b7da5beed5ede7c6186250d2f136ac"; // your openweather api key
import { GoogleGenerativeAI } from "google-generative-ai";

(function () {
  // initialize google generative ai
  const genAI = new GoogleGenerativeAI(gemini_api_key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // function to display chatbot messages
  const displayChatbotMessage = (message, sender) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = message;

    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // fetch weather data from openweather api
  const fetchWeatherData = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openweather_api_key}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("weather data not available");
    return await response.json();
  };

  // fetch weather forecast from openweather api
  const fetchWeatherForecast = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openweather_api_key}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("forecast data not available");
    return await response.json();
  };

  // generate response using gemini api
  const generateResponseWithGemini = async (question, weatherDescription) => {
    const prompt = `user asked: "${question}". the weather condition is: "${weatherDescription}". provide 1-2 concise suggestions on what to wear or bring while going outside (up to 10 words).`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    if (response && response.text) {
      return await response.text();
    } else {
      throw new Error("invalid response format from gemini api");
    }
  };

  // handle weather intent
  const handleWeatherIntent = async (city) => {
    const weatherData = await fetchWeatherData(city);
    const weatherDescription = weatherData.weather[0].description;
    const temperature = weatherData.main.temp;

    return { weatherDescription, temperature };
  };

  // handle temperature intents
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

  // process chatbot question
  const processChatbotQuestion = async (question) => {
    try {
      const cityRegex = /in ([A-Za-z\s]+)/i;
      const cityMatch = question.match(cityRegex);
      let city = cityMatch ? cityMatch[1].trim() : "";

      if (city) {
        let intentResponse;

        // determine the intent based on keywords in the question
        if (question.toLowerCase().includes("current weather") || question.toLowerCase().includes("weather")) {
          intentResponse = await handleWeatherIntent(city);
          const weatherOutput = `the current weather in ${city} is ${intentResponse.weatherDescription} with a temperature of ${intentResponse.temperature}°C.`;
          const geminiResponse = await generateResponseWithGemini(question, intentResponse.weatherDescription);
          const combinedResponse = `${weatherOutput} ${geminiResponse}`;
          displayChatbotMessage(combinedResponse, 'bot');
        } else if (question.toLowerCase().includes("highest temperature")) {
          const highestTemp = await handleTemperatureIntents(city, "highest");
          displayChatbotMessage(`the highest temperature in ${city} is ${highestTemp}°C.`, 'bot');
        } else if (question.toLowerCase().includes("lowest temperature")) {
          const lowestTemp = await handleTemperatureIntents(city, "lowest");
          displayChatbotMessage(`the lowest temperature in ${city} is ${lowestTemp}°C.`, 'bot');
        } else if (question.toLowerCase().includes("average temperature")) {
          const averageTemp = await handleTemperatureIntents(city, "average");
          displayChatbotMessage(`the average temperature in ${city} is ${averageTemp}°C.`, 'bot');
        } else if (question.toLowerCase().includes("forecast")) {
          // handle forecast request (this part can be extended with more functionality)
          displayChatbotMessage("sorry, forecast data is not available yet.", 'bot');
        } else {
          displayChatbotMessage("i couldn't understand your request. please ask about the current weather or temperature details.", 'bot');
        }
      } else {
        displayChatbotMessage("i'm sorry, but i need a city name to provide weather information.", 'bot');
      }
    } catch (error) {
      console.error("error processing chatbot question:", error);
      displayChatbotMessage("sorry, i couldn't process your request. please try again later.", 'bot');
    }
  };

  // domcontentloaded event listener
  document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');

    // debounce function to limit the number of api calls
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(null, args);
        }, delay);
      };
    };

    // send chat message
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

    // event listeners for chat input and send button
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });

    sendChatBtn.addEventListener('click', debounce(sendChatMessage, 300));
  });
})();