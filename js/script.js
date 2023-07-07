class WeatherAPI {
    urlRoot = 'https://api.openweathermap.org/';

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async #getCoords(city) {
        const url = `${this.urlRoot}geo/1.0/direct?q=${city},&limit=1&appid=${this.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data);

        if (data.length > 0) {
            return {
                coord: { lat: data[0].lat, lon: data[0].lon },
                location: { country: data[0].country, city: data[0].name }
            }
        } else return { coord: { lat: '', lon: '' } }
    }

    async getCurrentWeather(city, units = 'metric') {
        try {
            const cityData = await this.#getCoords(city);

            const url = `${this.urlRoot}data/3.0/onecall?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&exclude=minutely,hourly,daily,alerts&appid=${this.apiKey}&units=${units}`;

            const response = await fetch(url);
            const data = await response.json();
            data.location = cityData.location ? cityData.location : '';
            return data;
        } catch (error) {
            console.error('Something went wrong', error);
        }
    }

    async getWeatherData(city, units = 'metric') {
        try {
            const cityData = await this.#getCoords(city);

            //const response = await fetch(`${this.urlRoot}data/2.5/weather?q=${city}&appid=${this.apiKey}&units=${units}`);
            const url = `${this.urlRoot}data/3.0/onecall?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&exclude=minutely,alerts&appid=${this.apiKey}&units=${units}`;

            const response = await fetch(url);
            // console.log(response);
            const data = await response.json();
            data.location = cityData.location ? cityData.location : '';
            // console.log(data);
            return data;
        } catch (error) {
            console.error('Something went wrong', error);
        }
    }
}


class WeatherUI {
    isFahrenheit = false;

    constructor() {
        this.forecastSection = document.querySelector('#forecast-main-section');
        this.errorElement = document.querySelector('#error');

        this.startBlock = document.querySelector('#start-block');
        this.templateStartItem = document.querySelector('#start-item').innerHTML;

        this.controlsBlock = document.querySelector('#controls');

        this.weatherOneDayBlock = document.querySelector('#weather-one-day');
        this.locationElement = document.querySelector('#location');
        this.dateElement = document.querySelector('#date');
        this.temperatureElement = document.querySelector('#temp');
        this.temperatureFeelsLikeElement = document.querySelector('#feels-like');
        this.descriptionElement = document.querySelector('#description');
        this.cloudsElement = document.querySelector('#clouds');
        this.humidityElement = document.querySelector('#humidity');
        this.windElement = document.querySelector('#wind');
        this.iconElement = document.querySelector('#icon');

        this.hourlyForecastBlock = document.querySelector('#hourly');
        this.templateHourlyForecastItem = document.querySelector('#hourly-forecast-item').innerHTML;

        this.shortForecastBlock = document.querySelector('#short-forecast');
        this.templateShortForecastOneDayItem = document.querySelector('#short-forecast-day-item').innerHTML;

        this.fullForecastWeekBlock = document.querySelector('#forecast-week');
        this.templateFullForecastOneDayItem = document.querySelector('#full-forecast-day-item').innerHTML;
    }

    set tempUnitsInFahrenheit(isFahrenheit) {
        this.isFahrenheit = isFahrenheit;
    }

    getTemperature(temp) {
        let result = this.isFahrenheit
            ? Math.round(temp * 9 / 5 + 32) + '°F'
            : Math.round(temp) + '°C';
        return result;
    }

    displayControls() {
        this.controlsBlock.hidden = false;
    }

    displayWeatherOnPageLoad(weatherData) {
        const data = weatherData.current;
        const date = new Date(data.dt * 1000);
        let item = {
            location: {
                city: weatherData.location.city,
                country: weatherData.location.country
            },
            time: date.toLocaleTimeString('en-GB', { weekday: 'long', hour: 'numeric', minute: 'numeric', timeZone: weatherData.timezone }),
            temp: Math.round(data.temp),
            description: data.weather[0].description,
            src: 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png',
        }

        let rendered = Mustache.render(this.templateStartItem, item);
        this.startBlock.innerHTML += rendered;
    }

    displayDailyWeatherForecast(weatherData) {
        if (this.forecastSection.classList.contains('not-active')) this.forecastSection.classList.remove('not-active');
        if (!this.startBlock.hidden) this.startBlock.hidden = true;
        if (!this.errorElement.hidden) this.errorElement.hidden = true;
        this.fullForecastWeekBlock.hidden = true;
        this.weatherOneDayBlock.hidden = false;

        const data = weatherData.current;
        const date = new Date(data.dt * 1000);

        this.locationElement.textContent = weatherData.location.city + ', ' + weatherData.location.country;
        this.temperatureElement.innerHTML = `<span class="degree">${this.getTemperature(data.temp)}</span>`;
        this.temperatureFeelsLikeElement.innerHTML = `Feels like: <span class="degree">${this.getTemperature(data.feels_like)}</span>`;
        this.descriptionElement.textContent = data.weather[0].description;
        this.cloudsElement.textContent = 'Clouds: ' + data.clouds + '%';
        this.humidityElement.textContent = 'Humidity: ' + data.humidity + '%';
        this.windElement.textContent = 'Wind: ' + data.wind_speed.toFixed(1) + ' m/s';
        this.iconElement.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">`;
        this.dateElement.textContent = date.toLocaleString('en-GB', { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: weatherData.timezone });
    }

    displayHourlyForecast(weatherData) {
        const data = weatherData.hourly;
        this.hourlyForecastBlock.innerHTML = '';

        for (let i = 1; i < 25; i += 2) {
            let date = new Date(data[i].dt * 1000);
            let item = {
                day: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: weatherData.timezone }),
                time: date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: 'numeric', timeZone: weatherData.timezone }),
                src: 'http://openweathermap.org/img/wn/' + data[i].weather[0].icon + '@2x.png',
                description: data[i].weather[0].description,
                temp: this.getTemperature(data[i].temp),
                feelsLike: this.getTemperature(data[i].feels_like),
                wind: data[i].wind_speed.toFixed(1),
            }

            let rendered = Mustache.render(this.templateHourlyForecastItem, item);
            this.hourlyForecastBlock.innerHTML += rendered;
        }
    }

    displayShortForecastForComingDays(weatherData, days = 3) {
        const data = weatherData.daily;
        this.shortForecastBlock.innerHTML = '';

        for (let i = 1; i <= days; i++) {
            const dataDay = data[i];
            let date = new Date(dataDay.dt * 1000);
            let item = {
                day: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: weatherData.timezone }),
                src: 'http://openweathermap.org/img/wn/' + dataDay.weather[0].icon + '@2x.png',
                temp: this.getTemperature(dataDay.temp.day),
                description: dataDay.weather[0].main,
            }

            let rendered = Mustache.render(this.templateShortForecastOneDayItem, item);
            this.shortForecastBlock.innerHTML += rendered;
        }
    }

    displayFullForecastForWeek(weatherData) {
        this.weatherOneDayBlock.hidden = true;
        this.fullForecastWeekBlock.hidden = false;
        const data = weatherData.daily;

        this.fullForecastWeekBlock.innerHTML = `<p class="location">${weatherData.location.city}, ${weatherData.location.country}</p>`;
        for (let i = 1; i <= 7; i++) {
            const dataDay = data[i];
            let date = new Date(dataDay.dt * 1000);
            let item = {
                day: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: weatherData.timezone }),
                src: 'http://openweathermap.org/img/wn/' + dataDay.weather[0].icon + '@2x.png',
                summary: dataDay.summary,
                description: dataDay.weather[0].description,
                tempDay: this.getTemperature(dataDay.temp.day),
                feelsLikeDay: this.getTemperature(dataDay.feels_like.day),
                tempNight: this.getTemperature(dataDay.temp.night),
                feelsLikeNight: this.getTemperature(dataDay.feels_like.night),
                clouds: dataDay.clouds,
                humidity: dataDay.humidity,
                wind: dataDay.wind_speed.toFixed(1),
            }

            let rendered = Mustache.render(this.templateFullForecastOneDayItem, item);
            this.fullForecastWeekBlock.innerHTML += rendered;
        }
    }

    displaySelectedWeather() {
        this.weatherOneDayBlock.hidden = !this.weatherOneDayBlock.hidden;
        this.fullForecastWeekBlock.hidden = !this.fullForecastWeekBlock.hidden;
    }

    displayTempWithChangedUnits() {
        const elements = document.querySelectorAll('.degree');
        for (let i = 0; i < elements.length; i++) {
            let temp = elements[i].textContent;
            if (this.isFahrenheit) elements[i].textContent = this.getTemperature(parseInt(temp));
            else elements[i].textContent = this.getTemperature((parseInt(temp) - 32) * 5 / 9);
        }
    }

    displayErrorElement(errorText) {
        this.errorElement.textContent = errorText;
        this.errorElement.hidden = false;
        this.forecastSection.classList.add('not-active');
    }
}


class WeatherApp {
    apiKey = 'a19f4bad0c78d317d1c566ef8ffecad2';
    weatherData;

    constructor() {
        this.weatherAPI = new WeatherAPI(this.apiKey);
        this.weatherUI = new WeatherUI();
        this.loader = document.querySelector('#loader');
        this.isThisFirstForecastOnWeekShow = true;
    }

    async searchWeather(city) {
        if (Array.isArray(city)) {
            this.loader.hidden = false;
            for (let item of city) {
                const currentWeatherData = await this.weatherAPI.getCurrentWeather(item);
                this.weatherUI.displayWeatherOnPageLoad(currentWeatherData);
            }
            this.loader.hidden = true;
        } else {
            this.loader.hidden = false;
            this.weatherData = await this.weatherAPI.getWeatherData(city);
            this.loader.hidden = true;
            console.log(this.weatherData);
            if (this.weatherData.cod === '400') {
                this.weatherUI.displayErrorElement('City not found');
            } else {
                this.weatherUI.displayDailyWeatherForecast(this.weatherData);
                this.weatherUI.displayHourlyForecast(this.weatherData)
                this.weatherUI.displayShortForecastForComingDays(this.weatherData, 3);
                this.weatherUI.displayControls();
                this.isThisFirstForecastOnWeekShow = true;
            }
        }
    }

    changeWeatherForecastDisplayMode() {
        if (this.isThisFirstForecastOnWeekShow) {
            this.weatherUI.displayFullForecastForWeek(this.weatherData);
            this.isThisFirstForecastOnWeekShow = false;
        } else {
            this.weatherUI.displaySelectedWeather();
        }
    }

    toFahrenheit() {
        this.weatherUI.tempUnitsInFahrenheit = true;
        this.weatherUI.displayTempWithChangedUnits();
    }
    toCelsius() {
        this.weatherUI.tempUnitsInFahrenheit = false;
        this.weatherUI.displayTempWithChangedUnits();
    }
}

const app = new WeatherApp();
// app.searchWeather('Dnipro');
app.searchWeather(['Dnipro', 'London', 'Canberra']);

let form = document.forms.searchForm;
form.addEventListener('submit', (e) => {
    app.searchWeather(form.searchInput.value.trim());
    e.preventDefault();
    form.reset();
});
// form.searchInput.focus();

let celsiusSwitchBtn = document.querySelector('#celsius');
let fahrenheitSwitchBtn = document.querySelector('#fahrenheit');

celsiusSwitchBtn.addEventListener('click', () => {
    if (celsiusSwitchBtn.classList.contains('active')) return;
    else {
        celsiusSwitchBtn.classList.add('active');
        fahrenheitSwitchBtn.classList.remove('active');
        app.toCelsius();
    }
})

fahrenheitSwitchBtn.addEventListener('click', () => {
    if (fahrenheitSwitchBtn.classList.contains('active')) return;
    else {
        fahrenheitSwitchBtn.classList.add('active');
        celsiusSwitchBtn.classList.remove('active');
        app.toFahrenheit();
    }
})

let modeSwitchBtn = document.querySelector('#mode-display-weather');
modeSwitchBtn.addEventListener('click', () => {
    app.changeWeatherForecastDisplayMode();

    if (modeSwitchBtn.textContent === 'Show for the week') {
        modeSwitchBtn.textContent = 'Show for today';
    } else {
        modeSwitchBtn.textContent = 'Show for the week';
    }
})
