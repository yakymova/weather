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