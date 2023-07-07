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