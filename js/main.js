const app = new WeatherApp();
// app.searchWeather('Dnipro');
app.searchWeather(['Dnipro', 'London', 'Canberra']);

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

let form = document.forms.searchForm;
form.addEventListener('submit', (e) => {
    app.searchWeather(form.searchInput.value.trim());
    e.preventDefault();
    form.reset();
    modeSwitchBtn.textContent = 'Show for the week';
});
// form.searchInput.focus();
