document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'a7b7da5beed5ede7c6186250d2f136ac';
    const cityInput = document.getElementById('city-input');
    const geolocationBtn = document.getElementById('geolocation-btn');
    const weatherImage = document.getElementById('weather-image');
    const weatherWidget = document.getElementById('weather-widget');

    // Fetch weather when city is selected
    cityInput.addEventListener('keyup', function (e) {
        const city = cityInput.value;

        if (e.key === 'Enter' && city !== '') {
            fetchWeatherData(city);
        }
    });

    // Fetch weather data by city name
    function fetchWeatherData(city) {
        if (city === '') {
            alert('Please enter a city name');
            return;
        }

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const cityName = data.name;
                const temp = data.main.temp;
                const humidity = data.main.humidity;
                const windSpeed = data.wind.speed;
                const description = data.weather[0].description;
                const iconCode = data.weather[0].icon;
                const weatherMain = data.weather[0].main.toLowerCase();

                document.getElementById('city-name').textContent = cityName;
                document.getElementById('temperature').textContent = temp;
                document.getElementById('humidity').textContent = humidity;
                document.getElementById('wind-speed').textContent = windSpeed;
                document.getElementById('weather-description').textContent = description;
                weatherImage.src = `http://openweathermap.org/img/wn/${iconCode.replace('d', 'n')}@2x.png`; // Use night icon

                // Update widget background based on weather condition
                weatherWidget.className = `weather-widget ${weatherMain}`;

                updateCharts();
            })
            .catch(error => {
                // console.error('Error fetching data:', error);
                // alert('City not found or API error');
            });
    }

    // Geolocation button: fetch current location weather
    geolocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        const cityName = data.name;
                        const temp = data.main.temp;
                        const humidity = data.main.humidity;
                        const windSpeed = data.wind.speed;
                        const description = data.weather[0].description;
                        const iconCode = data.weather[0].icon;
                        const weatherMain = data.weather[0].main.toLowerCase();

                        document.getElementById('city-name').textContent = cityName;
                        document.getElementById('temperature').textContent = temp;
                        document.getElementById('humidity').textContent = humidity;
                        document.getElementById('wind-speed').textContent = windSpeed;
                        document.getElementById('weather-description').textContent = description;
                        weatherImage.src = `http://openweathermap.org/img/wn/${iconCode.replace('d', 'n')}@2x.png`; // Use night icon

                        // Update widget background based on weather condition
                        weatherWidget.className = `weather-widget ${weatherMain}`;

                        updateCharts();
                    });
            });
        } else {
            alert('Geolocation is not supported by your browser');
        }
    });

    // Fetch weather data for Islamabad by default
    function fetchDefaultWeather() {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=Islamabad&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const cityName = data.name;
                const temp = data.main.temp;
                const humidity = data.main.humidity;
                const windSpeed = data.wind.speed;
                const description = data.weather[0].description;
                const iconCode = data.weather[0].icon;
                const weatherMain = data.weather[0].main.toLowerCase();

                document.getElementById('city-name').textContent = cityName;
                document.getElementById('temperature').textContent = temp;
                document.getElementById('humidity').textContent = humidity;
                document.getElementById('wind-speed').textContent = windSpeed;
                document.getElementById('weather-description').textContent = description;
                weatherImage.src = `http://openweathermap.org/img/wn/${iconCode.replace('d', 'n')}@2x.png`; // Use night icon

                // Update widget background based on weather condition
                weatherWidget.className = `weather-widget ${weatherMain}`;

                updateCharts();
            })
            .catch(error => {
                console.error('Error fetching default weather data:', error);
                alert('Unable to fetch default weather data');
            });
    }

    // Call fetchDefaultWeather when the page loads
    fetchDefaultWeather();

    let barChartInstance, doughnutChartInstance, lineChartInstance; // Variables to store chart instances

    function updateCharts() {
        const apiKey = 'a7b7da5beed5ede7c6186250d2f136ac';
        const city = document.getElementById('city-name').textContent;

        // Fetch weather data for the next 5 days
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const forecasts = data.list;
                const tempData = [];
                const weatherConditionData = { sunny: 0, cloudy: 0, rainy: 0 };
                const tempChanges = [];

                // Process the data
                forecasts.forEach((forecast, index) => {
                    const temp = forecast.main.temp;
                    const weatherMain = forecast.weather[0].main.toLowerCase();

                    tempData.push(temp);
                    tempChanges.push(temp);

                    if (weatherMain.includes('clear')) {
                        weatherConditionData.sunny++;
                    } else if (weatherMain.includes('clouds')) {
                        weatherConditionData.cloudy++;
                    } else if (weatherMain.includes('rain')) {
                        weatherConditionData.rainy++;
                    }
                });

                const ctx1 = document.getElementById('barChart').getContext('2d');
                const ctx2 = document.getElementById('doughnutChart').getContext('2d');
                const ctx3 = document.getElementById('lineChart').getContext('2d');

                // Destroy existing chart instances if they exist
                if (barChartInstance) barChartInstance.destroy();
                if (doughnutChartInstance) doughnutChartInstance.destroy();
                if (lineChartInstance) lineChartInstance.destroy();

                // Generate day names based on today's date
                const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const today = new Date();
                const dayNames = [];
                for (let i = 0; i < 5; i++) {
                    dayNames.push(daysOfWeek[(today.getDay() + i) % 7]);
                }

                // Consistent color scheme
                const colors = {
                    primary: '#fdd835', // light Blue
                    secondary: '#6c757d', // Green
                    tertiary: '#17a2b8', // Teal
                    background: '#2e2e2e', // Dark gray
                    text: '#ffffff' // White
                };

                const chartColor = '#8e44ad'; // Example color: muted purple

                const barChartColor = '#4e73df'; // Example color: muted blue

                // Create new bar chart instance
                barChartInstance = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: dayNames,
                        datasets: [{
                            label: 'Temperature (°C)',
                            data: tempData.slice(0, 5),
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                                gradient.addColorStop(0, barChartColor); // Start color
                                gradient.addColorStop(1, 'rgba(78, 115, 223, 0.5)'); // End color with transparency
                                return gradient;
                            },
                            borderColor: colors.lightGray, // Use light gray for borders
                            borderWidth: 2, // Thicker border
                            borderRadius: 5, // Rounded edges
                            hoverBackgroundColor: barChartColor, // Hover background color
                            hoverBorderColor: colors.lightGray, // Hover border color
                            hoverBorderWidth: 3 // Thicker hover border
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: colors.text
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
                                    borderDash: [5, 5] // Dashed grid lines
                                }
                            },
                            x: {
                                ticks: {
                                    color: colors.text
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)', // Subtle grid lines
                                    borderDash: [5, 5] // Dashed grid lines
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: colors.text
                                }
                            }
                        },
                        animation: {
                            delay: function (context) {
                                return context.dataIndex * 100;
                            }
                        }
                    }
                });


                // Define separate colors for the doughnut chart segments
                const sunnyColor = '#f39c12'; // Example color: muted sunny
                const cloudyColor = '#7f8c8d'; // Example color: muted cloudy
                const rainyColor = '#3498db'; // Example color: muted rainy

                // Create new doughnut chart instance
                doughnutChartInstance = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Sunny', 'Cloudy', 'Rainy'],
                        datasets: [{
                            data: [weatherConditionData.sunny, weatherConditionData.cloudy, weatherConditionData.rainy],
                            backgroundColor: [
                                sunnyColor, // Sunny segment
                                cloudyColor, // Cloudy segment
                                rainyColor // Rainy segment
                            ],
                            borderColor: [
                                sunnyColor, // Sunny segment
                                cloudyColor, // Cloudy segment
                                rainyColor // Rainy segment
                            ],
                            borderWidth: 2, // Thicker border for modern look
                            hoverBackgroundColor: [
                                sunnyColor, // Sunny segment
                                cloudyColor, // Cloudy segment
                                rainyColor // Rainy segment
                            ],
                            hoverBorderColor: [
                                sunnyColor, // Sunny segment
                                cloudyColor, // Cloudy segment
                                rainyColor // Rainy segment
                            ],
                            hoverBorderWidth: 3 // Thicker hover border
                        }]
                    },
                    options: {
                        plugins: {
                            legend: {
                                labels: {
                                    color: colors.text,
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    }
                                },
                                position: 'bottom' // Position legend at the bottom
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        let label = context.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        label += context.parsed + ' days';
                                        return label;
                                    }
                                },
                                titleFont: {
                                    size: 16,
                                    weight: 'bold'
                                },
                                bodyFont: {
                                    size: 14
                                },
                                backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tooltip background color
                                titleColor: colors.text, // Tooltip title color
                                bodyColor: colors.text // Tooltip body color
                            }
                        },
                        animation: {
                            animateRotate: true, // Enable rotation animation
                            animateScale: true // Enable scaling animation
                        },
                        cutout: '60%', // Create a doughnut shape with a hole in the center
                        rotation: -0.5 * Math.PI, // Rotate the chart for a modern look
                        // circumference: 1.5 * Math.PI // Adjust the circumference for a modern look
                    }
                });

                // Create new line chart instance
                lineChartInstance = new Chart(ctx3, {
                    type: 'line',
                    data: {
                        labels: dayNames,
                        datasets: [{
                            label: 'Temperature Changes (°C)',
                            data: tempChanges.slice(0, 5),
                            borderColor: chartColor, // Use the same color here
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                                gradient.addColorStop(0, 'rgba(142, 68, 173, 0.5)'); // Start color with transparency
                                gradient.addColorStop(1, 'rgba(142, 68, 173, 0)'); // End color with transparency
                                return gradient;
                            },
                            fill: true,
                            pointBackgroundColor: chartColor,
                            pointBorderColor: colors.text,
                            pointHoverBackgroundColor: colors.text,
                            pointHoverBorderColor: chartColor,
                            borderWidth: 3, // Thicker border for modern look
                            borderJoinStyle: 'round', // Rounded corners
                            pointRadius: 5, // Larger points
                            pointHoverRadius: 7 // Larger hover points
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: colors.text
                                }
                            },
                            x: {
                                ticks: {
                                    color: colors.text
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: colors.text
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        label += context.parsed.y + '°C';
                                        return label;
                                    }
                                }
                            }
                        },
                        animation: {
                            y: {
                                type: 'number',
                                easing: 'linear',
                                duration: 1000,
                                from: NaN, // the point is initially skipped
                                delay(ctx) {
                                    if (ctx.type !== 'data' || ctx.yStarted) {
                                        return 0;
                                    }
                                    ctx.yStarted = true;
                                    return ctx.index * 300;
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching weather forecast data:', error);
                alert('Unable to fetch weather forecast data');
            });
    }

});