const form = document.querySelector("form");
const input = document.querySelector("input");

// Added the missing '.' for the weather-icon class
const cityNameElement = document.querySelector(".city-name");
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temp");
const feelsLikeElement = document.querySelector(".feelsLike");
const conditionElement = document.querySelector(".condition");
const highLowElement = document.querySelector(".high-low");
const msg = document.querySelector(".msg");

const forecastTableBodyElement = document.querySelector(".forecastTableBody");

const windMphElement = document.querySelector(".wind-mph");
const gustsMphElement = document.querySelector(".gusts-mph");
const windDirection = document.querySelector(".wind-direction");

const sunsetElement = document.querySelector(".sunset");
const sunriseElement = document.querySelector(".sunrise");

const humidityElement = document.querySelector(".humidity");

const apiKey = "e6bc83720d7c1be5117f509f9a3b9148";

//functions
function getWeatherIcon(condition) {
  // Wrapped all HTML tags in single quotes to make them strings
  switch (condition.toLowerCase()) {
    case "clear sky":
      return '<i class="fa-solid fa-sun"></i>';
    case "few clouds":
      return '<i class="fa-solid fa-cloud-sun"></i>';
    // Correct way to stack multiple cases in a switch statement:
    case "scattered clouds":
    case "broken clouds":
      return '<i class="fa-solid fa-cloud"></i>';
    case "shower rain":
      return '<i class="fa-solid fa-cloud-showers-heavy"></i>';
    case "rain":
      return '<i class="fa-solid fa-cloud-rain"></i>';
    case "thunderstorm":
      return '<i class="fa-solid fa-cloud-bolt"></i>';
    case "snow":
      return '<i class="fa-solid fa-snowflake"></i>';
    case "mist":
      return '<i class="fa-solid fa-smog"></i>';
    default:
      return '<i class="fa-solid fa-temperature-empty"></i>';
  }
}

function formatDate(date) {
  const formattedDate = new Date(date);
  const options = { month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(formattedDate);
}

function getWindDirection(deg) {
  // Array of 16 cardinal and intercardinal directions
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  // Normalize degrees to stay between 0 and 359
  let normalizedDeg = ((deg % 360) + 360) % 360;

  // Split 360 degrees into 16 sectors and round to the nearest index
  const index = Math.round(normalizedDeg / 22.5) % 16;

  return directions[index];
}

function epochToDate(epochSeconds) {
  // Multiply by 1000 to convert seconds to milliseconds
  const date = new Date(epochSeconds * 1000);

  return {
    localString: date.toLocaleTimeString(), // Returns local system time
    utcString: date.toUTCString(), // Returns clean UTC format
    isoString: date.toISOString(), // Returns standard ISO-8601 string
  };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let inputVal = input.value;

  const urls = [
    `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=imperial`,
    `https://api.openweathermap.org/data/2.5/forecast?q=${inputVal}&appid=${apiKey}&units=imperial`,
  ];

  try {
    const totalResponses = await Promise.all(urls.map((url) => fetch(url)));

    const data = await Promise.all(
      totalResponses.map((res) => {
        if (!res.ok) {
          throw new Error("City not Found.");
        }

        return res.json();
      }),
    );

    const [currWeather, forecastWeather] = data;

    const conditionString = currWeather.weather[0].description;

    const filteredForecast = forecastWeather.list.filter((element) =>
      element.dt_txt.includes("03:00:00"),
    );

    console.log("Current Weather: ", currWeather);
    console.log("Forecast: ", forecastWeather);
    console.log("Filtered Forecast: ", filteredForecast);

    // Update the UI
    iconElement.innerHTML = getWeatherIcon(conditionString);
    cityNameElement.textContent = currWeather.name;
    tempElement.textContent = `${Math.round(currWeather.main.temp)} °F`;
    feelsLikeElement.textContent = `Feels like: ${Math.round(currWeather.main.feels_like)} °F`;
    conditionElement.textContent =
      conditionString.charAt(0).toUpperCase() + conditionString.slice(1); // Reuses the string you just grabbed
    highLowElement.textContent = `L: ${Math.round(currWeather.main.temp_min)} °F  H: ${Math.round(currWeather.main.temp_max)} °F`;

    // making sure we update and erase values when we do a new search
    input.value = "";
    msg.textContent = "";
    forecastTableBodyElement.innerHTML = "";

    // updating 5 day forecast table
    filteredForecast.forEach((item) => {
      const row = document.createElement("tr");

      const dayCell = document.createElement("td");
      dayCell.textContent = formatDate(item.dt_txt);
      row.appendChild(dayCell);

      const conditionCell = document.createElement("td");
      conditionCell.classList.add("text-center");
      conditionCell.innerHTML = getWeatherIcon(item.weather[0].description);
      row.appendChild(conditionCell);

      const lowHighCell = document.createElement("td");
      lowHighCell.classList.add("text-right");
      lowHighCell.textContent = `L: ${Math.round(item.main.temp_min)} °F  H: ${Math.round(item.main.temp_max)} °F`;
      row.appendChild(lowHighCell);

      forecastTableBodyElement.appendChild(row);
    });

    windMphElement.textContent = `Wind: ${currWeather.wind.speed} MPH`;
    gustsMphElement.textContent = `Gusts: ${currWeather.wind.gust} MPH`;
    windDirection.textContent = `Direction: ${currWeather.wind.deg}°
     ${getWindDirection(currWeather.wind.deg)}`;

    sunsetElement.textContent = `${epochToDate(currWeather.sys.sunset).localString}`;
    sunriseElement.textContent = `Sunrise: ${epochToDate(currWeather.sys.sunrise).localString}`;

    humidityElement.textContent = `${currWeather.main.humidity} %`;
  } catch (error) {
    console.error("One or more request failed: ", error);
    msg.textContent = "Please search for a valid city.";
  }
});
