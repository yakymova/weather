class WeatherAPI {
    urlRoot = 'https://api.openweathermap.org/';
    coord;
    location;

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async #getCoords(city) {
        try {
            const url = `${this.urlRoot}geo/1.0/direct?q=${city},&limit=1&appid=${this.apiKey}`;

            const response = await fetch(url);
            let data = await response.json();

            this.coord = { lat: data[0].lat, lon: data[0].lon };
            this.location = { country: data[0].country, city: data[0].name };
        } catch (error) {
            console.error('Something went wrong', error);
        }
    }

    async getWeatherData(city, units = 'metric') {
        try {
            //const response = await fetch(`${this.urlRoot}data/2.5/weather?q=${city}&appid=${this.apiKey}&units=${units}`);

            await this.#getCoords(city);

            const url = `${this.urlRoot}data/3.0/onecall?lat=${this.coord.lat}&lon=${this.coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${this.apiKey}&units=${units}`;

            const response = await fetch(url);
            // console.log(response);
            const data = await response.json();
            data.location = this.location;
            // console.log(data);
            return data;
        } catch (error) {
            console.error('Something went wrong', error);
        }
    }

    async getWeatherForecast(units = 'metric') {
        try {
            const url = `${this.urlRoot}data/3.0/onecall?lat=${this.coord.lat}&lon=${this.coord.lon}&exclude=current,minutely,alerts&appid=${this.apiKey}&units=${units}`;

            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Something went wrong', error);
        }
    }
}


class WeatherUI {
    constructor() {
        this.startBlock = document.querySelector('.forecast__start-block');
        this.templateStartItem = document.querySelector('#start-item').innerHTML;

        this.weatherOneDayBlock = document.querySelector('.forecast__one-day');
        this.locationElement = document.querySelector('#location');
        this.dateElement = document.querySelector('#date');
        this.temperatureElement = document.querySelector('#temp');
        this.temperatureFeelsLikeElement = document.querySelector('#feels-like');
        this.descriptionElement = document.querySelector('#description');
        this.cloudsElement = document.querySelector('#clouds');
        this.humidityElement = document.querySelector('#humidity');
        this.windElement = document.querySelector('#wind');
        this.iconElement = document.querySelector('#icon');

        this.hourlyForecastBlock = document.querySelector('.hourly');
        this.templateHourlyForecastItem = document.querySelector('#hourly-forecast-item').innerHTML;
    }

    displayWeatherFoundCity(weatherData, units) {
        this.startBlock.hidden = true;
        const data = weatherData.current;
        const date = new Date(data.dt * 1000);

        this.locationElement.textContent = weatherData.location.city + ', ' + weatherData.location.country;
        this.temperatureElement.textContent = `${Math.round(data.temp)}${units === 'imperial' ? '°F' : '°C'}`;
        this.temperatureFeelsLikeElement.textContent = `Feels like: ${Math.round(data.feels_like)}${units === 'imperial' ? '°F' : '°C'}`;
        this.descriptionElement.textContent = data.weather[0].description;
        this.cloudsElement.textContent = 'Clouds: ' + data.clouds + '%';
        this.humidityElement.textContent = 'Humidity: ' + data.humidity + '%';
        this.windElement.textContent = 'Wind: ' + data.wind_speed.toFixed(1) + ' m/s';
        this.iconElement.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">`;
        this.dateElement.textContent = date.toLocaleString('en-GB', { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: weatherData.timezone });
    }

    displayWeatherOnPageLoad(weatherData, units) {
        const data = weatherData.current;
        const date = new Date(data.dt * 1000);
        let item = {
            location: {
                city: weatherData.location.city,
                country: weatherData.location.country
            },
            time: date.toLocaleTimeString('en-GB', { weekday: 'long', hour: 'numeric', minute: 'numeric', timeZone: weatherData.timezone }),
            temp: `${Math.round(data.temp)}${units === 'imperial' ? '°F' : '°C'}`,
            description: data.weather[0].description,
            src: 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png',
        }

        let rendered = Mustache.render(this.templateStartItem, item);
        this.startBlock.innerHTML += rendered;
    }

    displayHourlyForecast(weatherData, units) {
        const data = weatherData.hourly;
        this.hourlyForecastBlock.innerHTML = '';

        for (let i = 1; i < 25; i += 2) {
            let date = new Date(data[i].dt * 1000);
            let item = {
                day: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: weatherData.timezone }),
                time: date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', timeZone: weatherData.timezone }),
                src: 'http://openweathermap.org/img/wn/' + data[i].weather[0].icon + '@2x.png',
                description: data[i].weather[0].description,
                temp: `${Math.round(data[i].temp)}${units === 'imperial' ? '°F' : '°C'}`,
                feelsLike: `${Math.round(data[i].feels_like)}${units === 'imperial' ? '°F' : '°C'}`,
                wind: data[i].wind_speed.toFixed(1),
            }

            let rendered = Mustache.render(this.templateHourlyForecastItem, item);
            this.hourlyForecastBlock.innerHTML += rendered;
        }
    }
}


class WeatherApp {
    apiKey = 'a19f4bad0c78d317d1c566ef8ffecad2';
    weatherForDay;
    weatherForecast;

    constructor() {
        this.weatherAPI = new WeatherAPI(this.apiKey);
        this.weatherUI = new WeatherUI();
    }

    async searchWeather(city, units) {
        if (units !== 'imperial') units = 'metric';

        if (Array.isArray(city)) {
            for (let item of city) {
                const weatherData = await this.weatherAPI.getWeatherData(item, units);
                this.weatherUI.displayWeatherOnPageLoad(weatherData, units);
            }
        } else {
            this.weatherForDay = await this.weatherAPI.getWeatherData(city, units);
            this.weatherUI.displayWeatherFoundCity(this.weatherForDay, units);
            console.log(this.weatherForDay);

            this.weatherForecast = await this.weatherAPI.getWeatherForecast(units);
            this.weatherUI.displayHourlyForecast(this.weatherForecast, units)
            console.log(this.weatherForecast);
        }
    }
}

const app = new WeatherApp();
// app.searchWeather(['Dnipro', 'London', 'Ottawa']);
// app.searchWeather('Dnipro', 'imperial');
app.searchWeather('london');

let form = document.forms.searchForm;
form.addEventListener('submit', (e) => {
    app.searchWeather(form.searchInput.value.trim());
    e.preventDefault();
    form.reset();
});
// form.searchInput.focus();

let celsiusSwitchBtn = document.querySelector('#celsius');
let fahrenheitSwitchBtn = document.querySelector('#fahrenheit');
