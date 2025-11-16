
// ******************* search function *********************************
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.results || data.results.length === 0) {
    alert("City not found!");
    return null;
  }
  
  const result = data.results[0];
  return {
    // lat: data.results[0].latitude,
    // lon: data.results[0].longitude

    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
    country: result.country
  };
}


async function loadWeather(lat,lon) {

const apiurl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,sunrise,sunset,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,precipitation&timezone=auto&wind_speed_unit=mph&precipitation_unit=inch`

fetch(apiurl)
.then(response => response.json())
.then(data =>{
    console.log(data);
    
    const current = data.current;
    const temperature = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m
    const precipitation = current.precipitation


    document.getElementById("temperature").innerHTML = ` ${temperature} °C`;
    document.getElementById("feels-like").innerHTML = `${feelsLike} °C`
    document.getElementById("humi").innerHTML = `${humidity}`
    document.getElementById("wind").innerHTML = `${wind} mph`
    document.getElementById("precp").innerHTML = `${precipitation} in`


    // ************************ daily forecast *********************

    const days = document.querySelectorAll(".day");
    const daily = data.daily;

     for (let i = 0; i < 7; i++) {
      const date = new Date(daily.time[i]); 
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" }); 
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const rain = daily.precipitation_sum[i];

   // choose a basic weather icon
      let icon = "☀️";
      if (rain > 0) icon = "🌧️";
      else if (maxTemp < 10) icon = "❄️";
      else if (maxTemp > 30) icon = "🔥";
      else icon = "⛅";

      // update HTML content
      days[i].querySelector(".day-name").textContent = dayName;
      days[i].querySelector(".weather-icon").textContent = icon;
      days[i].querySelector(".temp-range").textContent = `${maxTemp}° / ${minTemp}°`;
    }


const hourly = data.hourly;
    const times = hourly.time;
    const temps = hourly.temperature_2m;
    const precip = hourly.precipitation;

    // ✅ Group hourly data by weekday name
    const groupedByDay = {};
    for (let i = 0; i < times.length; i++) {
      const date = new Date(times[i]);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const hour = date.getHours();

      if (!groupedByDay[dayName]) groupedByDay[dayName] = [];
      groupedByDay[dayName].push({
        hour,
        temp: Math.round(temps[i]),
        rain: precip[i]
      });
    }

    const daySelect = document.querySelector(".hourly-header select");
    const hourlyContainer = document.querySelector(".hourly");

    // ✅ Function to display selected day’s hours
    function displayDay(dayName) {
      // remove old hourly items
      const oldItems = hourlyContainer.querySelectorAll(".hourly-item");
      oldItems.forEach(item => item.remove());

      if (!groupedByDay[dayName]) {
        const p = document.createElement("p");
        p.textContent = "No data available";
        hourlyContainer.appendChild(p);
        return;
      }

      // show only first 8 hours (you can increase if you want)
      groupedByDay[dayName].slice(0, 8).forEach(entry => {
        let icon = "☀️";
        if (entry.rain > 0.5) icon = "🌧";
        else if (entry.temp < 10) icon = "❄️";
        else if (entry.temp > 30) icon = "🔥";
        else if (entry.rain > 0 && entry.rain <= 0.5) icon = "🌦";
        else if (entry.temp >= 10 && entry.temp <= 20) icon = "☁️";

        const ampm = entry.hour >= 12 ? "PM" : "AM";
        const hour12 = entry.hour % 12 || 12;

        const item = document.createElement("div");
        item.classList.add("hourly-item");
        item.innerHTML = `
          <div class="time">${icon} ${hour12} ${ampm}</div>
          <div class="temp">${entry.temp}°</div>
        `;
        hourlyContainer.appendChild(item);
      });
    }

    // 🟢 Show today by default
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    displayDay(today);

    // 🟡 Change day on select
    daySelect.addEventListener("change", () => {
      const selectedDay = daySelect.options[daySelect.selectedIndex].text;
      displayDay(selectedDay);
    })

})
 .catch(error => {
      console.error("Error fetching data:", error);
    });
  

const currentDate = document.getElementById("date")
const today = new Date();
currentDate.innerHTML = today.toLocaleDateString("en-IN",{
  weekday : "long",
  year : "numeric",
  month : "long",
  day : "numeric"
});


}



// ********************** deafult city **************************
document.getElementById("city").innerHTML = "Delhi, India";
loadWeather(28.6139, 77.2090);

// ================== SEARCH BUTTON CLICK ==================
document.getElementById("searchBtn").addEventListener("click", async () => {
  const city = document.getElementById("searchInput").value.trim();
  if (city === "") return;

  document.getElementById("suggestions").style.display = "none";

  const coords = await getCoordinates(city);
  if (coords) {
    document.getElementById("city").innerHTML = `${coords.name}, ${coords.country}`;
    loadWeather(coords.lat, coords.lon);
    // loadWeather(coords.lat, coords.lon);
  }

});



// ****************** city suggsetion ****************************

async function showSuggestions(query) {
  if (query.length < 2) {
    document.getElementById("suggestions").style.display = "none";
    return;
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`;

  const res = await fetch(url);
  const data = await res.json();

  const box = document.getElementById("suggestions");
  box.innerHTML = "";

  if (!data.results) {
    box.style.display = "none";
    return;
  }

  data.results.forEach(city => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.innerHTML = `${city.name}, ${city.country}`;

    div.addEventListener("click", () => {
      // update search input
      document.getElementById("searchInput").value = city.name;

      // update city name on screen
      document.getElementById("city").innerHTML = `${city.name}, ${city.country}`;

      // load weather
      loadWeather(city.latitude, city.longitude);

      // hide suggestions
      box.style.display = "none";
    });

    box.appendChild(div);
  });

  box.style.display = "block";
}
document.getElementById("searchInput").addEventListener("input", (e) => {
  showSuggestions(e.target.value);
});


document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("suggestions").style.display = "none";
  }
});


