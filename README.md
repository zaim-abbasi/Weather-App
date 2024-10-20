# Weather Dashboard and Chatbot

## Overview

This project is a comprehensive weather dashboard and chatbot application that provides real-time weather information, forecasts, and interactive chatbot capabilities. The application is built using HTML, CSS, JavaScript, and integrates with external APIs such as OpenWeatherMap and Google Generative AI (Gemini).

## Features

- **Real-Time Weather Data**: Fetches and displays current weather conditions for a specified city.
- **5-Day Weather Forecast**: Provides a detailed 5-day weather forecast with options to filter and paginate the data.
- **Interactive Chatbot**: An AI-powered chatbot that answers weather-related queries, suggests clothing based on weather conditions, and provides temperature details.
- **Charts and Graphs**: Visualizes weather data using bar, doughnut, and line charts.
- **Geolocation Support**: Allows users to fetch weather data based on their current location.

## Technologies Used

- **HTML/CSS**: For structuring and styling the web pages.
- **JavaScript**: For dynamic content and interactivity.
- **Chart.js**: For creating interactive charts and graphs.
- **jQuery**: For DOM manipulation and event handling.
- **OpenWeatherMap API**: For fetching weather data.
- **Google Generative AI (Gemini)**: For generating chatbot responses.

## API Usage

### OpenWeatherMap API

The application uses the OpenWeatherMap API to fetch real-time weather data and forecasts. The API key is required to make requests. The following endpoints are used:

- **Current Weather Data**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Weather Forecast**: `https://api.openweathermap.org/data/2.5/forecast`

### Google Generative AI (Gemini)

The chatbot functionality is powered by Google Generative AI (Gemini). The API key is required to interact with the model. The model is used to generate responses based on user queries and weather conditions.

## Project Structure

```
/
├── index.html
├── table.html
├── css/
│   ├── styles.css
│   └── table.css
├── images/
│   └── cloudy.png
├── js/
│   ├── app.js
│   ├── table.js
│   └── chatbot.js
└── README.md
```

- **index.html**: The main dashboard page displaying real-time weather data and charts.
- **table.html**: The page displaying the 5-day weather forecast and chatbot interface.
- **css/**: Contains the stylesheets for both pages.
- **images/**: Contains the logo image used in the sidebar.
- **js/**: Contains the JavaScript files for the dashboard, table, and chatbot functionalities.

## Instructions to Run Locally

### Prerequisites

- **Node.js**: Ensure Node.js is installed on your machine.
- **API Keys**: Obtain API keys from OpenWeatherMap and Google Generative AI (Gemini).

### Steps to Run

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/zaim-abbasi/Weather-App.git
   cd weather-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up API Keys**:
   - Open `js/app.js` and `js/table.js` and replace the placeholder API key with your OpenWeatherMap API key.
   - Open `js/chatbot.js` and replace the placeholder API key with your Google Generative AI (Gemini) API key.

4. **Run the Application**:
   - Open `index.html` and `table.html` in your web browser.
   - Alternatively, you can use a local server to serve the files. For example, using Python:
     ```bash
     python -m http.server
     ```
   - Open your browser and navigate to `http://localhost:8000`.

### Usage

- **Dashboard**: Enter a city name in the search bar to fetch and display the current weather data. Click the geolocation icon to fetch weather data based on your current location.
- **Table**: Enter a city name to fetch and display the 5-day weather forecast. Use the filter dropdown to sort or filter the data.
- **Chatbot**: Interact with the chatbot by typing weather-related queries. The chatbot will provide responses based on the current weather conditions and user queries.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

For any questions or support, please contact [Zaim Abbasi] at [zaim.k.abbasi@gmail.com].
