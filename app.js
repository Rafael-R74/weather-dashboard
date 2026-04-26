// Seletores do DOM | DOM Selectors
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
const errorMessage = document.getElementById('error-message');
const weatherMain = document.getElementById('weather-main');
const loading = document.getElementById('loading');

// Elementos de UI do Clima | Weather UI Elements
const cityNameEl = document.getElementById('city-name');
const weatherDescEl = document.getElementById('weather-description');
const tempEl = document.getElementById('temperature');
const mainIconEl = document.getElementById('main-icon');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const feelsLikeEl = document.getElementById('feels-like');
const forecastGrid = document.getElementById('forecast-grid');

// Mapeamento de códigos climáticos da WMO para descrições, ícones e temas | WMO Weather Code Mapping
const weatherCodeMap = {
    0: { desc: 'Céu limpo', icon: 'fa-sun', theme: 'weather-sunny' },
    1: { desc: 'Principalmente limpo', icon: 'fa-sun', theme: 'weather-sunny' },
    2: { desc: 'Parcialmente nublado', icon: 'fa-cloud-sun', theme: 'weather-cloudy' },
    3: { desc: 'Nublado', icon: 'fa-cloud', theme: 'weather-cloudy' },
    45: { desc: 'Nevoeiro', icon: 'fa-smog', theme: 'weather-cloudy' },
    48: { desc: 'Nevoeiro com geada', icon: 'fa-smog', theme: 'weather-cloudy' },
    51: { desc: 'Garoa leve', icon: 'fa-cloud-rain', theme: 'weather-rainy' },
    53: { desc: 'Garoa moderada', icon: 'fa-cloud-rain', theme: 'weather-rainy' },
    55: { desc: 'Garoa densa', icon: 'fa-cloud-showers-heavy', theme: 'weather-rainy' },
    61: { desc: 'Chuva leve', icon: 'fa-cloud-rain', theme: 'weather-rainy' },
    63: { desc: 'Chuva moderada', icon: 'fa-cloud-rain', theme: 'weather-rainy' },
    65: { desc: 'Chuva forte', icon: 'fa-cloud-showers-heavy', theme: 'weather-rainy' },
    71: { desc: 'Neve leve', icon: 'fa-snowflake', theme: 'weather-cloudy' },
    73: { desc: 'Neve moderada', icon: 'fa-snowflake', theme: 'weather-cloudy' },
    75: { desc: 'Neve forte', icon: 'fa-snowflake', theme: 'weather-cloudy' },
    80: { desc: 'Pancadas de chuva leves', icon: 'fa-cloud-rain', theme: 'weather-rainy' },
    81: { desc: 'Pancadas de chuva moderadas', icon: 'fa-cloud-showers-heavy', theme: 'weather-rainy' },
    82: { desc: 'Pancadas violentas', icon: 'fa-cloud-showers-heavy', theme: 'weather-rainy' },
    95: { desc: 'Tempestade', icon: 'fa-bolt', theme: 'weather-rainy' },
    96: { desc: 'Tempestade leve', icon: 'fa-bolt', theme: 'weather-rainy' },
    99: { desc: 'Tempestade forte', icon: 'fa-bolt', theme: 'weather-rainy' }
};

// Histórico de Pesquisa | Search History
let recentSearches = JSON.parse(localStorage.getItem('weatherRecentSearches')) || [];

function saveSearch(cityStr) {
    if(!recentSearches.includes(cityStr)) {
        recentSearches.unshift(cityStr);
        if(recentSearches.length > 5) recentSearches.pop(); // Mantém só os últimos 5 | Keep only the last 5
        localStorage.setItem('weatherRecentSearches', JSON.stringify(recentSearches));
    }
}

// Utilitários | Utilities
const getDayOfWeek = (dateString) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const date = new Date(dateString + 'T12:00:00');
    return days[date.getDay()];
};

let debounceTimer;
const debounce = (func, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
};

// ==========================
// Lógica de Autocomplete | Autocomplete Logic
// ==========================
async function fetchCitySuggestions(query) {
    if(query.length < 3) {
        showRecentSearches();
        return;
    }
    
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt`;
        const res = await fetch(url);
        const data = await res.json();
        
        if(data.results && data.results.length > 0) {
            renderDropdown(data.results.map(item => ({
                label: `${item.name}, ${item.admin1 ? item.admin1 + ', ' : ''}${item.country}`,
                lat: item.latitude,
                lon: item.longitude,
                name: item.name,
                country: item.country
            })));
        } else {
            autocompleteDropdown.classList.add('hidden');
        }
    } catch(err) {
        console.error(err);
    }
}

function showRecentSearches() {
    if(recentSearches.length === 0) {
        autocompleteDropdown.classList.add('hidden');
        return;
    }
    
    const items = recentSearches.map(city => ({
        label: city,
        isRecent: true,
        queryStr: city
    }));
    
    renderDropdown(items);
}

function renderDropdown(items) {
    autocompleteDropdown.innerHTML = ''; // Seguro, pois estamos limpando o nó | Safe, as we are clearing the node
    
    items.forEach(item => {
        const li = document.createElement('li');
        
        // Proteção contra XSS: Usar createElement e textContent em vez de innerHTML
        // XSS Protection: Use createElement and textContent instead of innerHTML
        if (item.isRecent) {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-clock-rotate-left';
            icon.style.marginRight = '8px';
            li.appendChild(icon);
            li.appendChild(document.createTextNode(item.label));
        } else {
            li.textContent = item.label;
        }
        
        li.addEventListener('click', () => {
            autocompleteDropdown.classList.add('hidden');
            if(item.isRecent) {
                cityInput.value = item.queryStr;
                handleSearch(item.queryStr);
            } else {
                cityInput.value = `${item.name}, ${item.country}`;
                // Buscar dados diretamente com a lat/lon do clique | Fetch data directly with click lat/lon
                fetchWeatherDirectly(item.lat, item.lon, item.name, item.country);
            }
        });
        autocompleteDropdown.appendChild(li);
    });
    
    autocompleteDropdown.classList.remove('hidden');
}

// Fechar dropdown ao clicar fora | Close dropdown on outside click
document.addEventListener('click', (e) => {
    if(!e.target.closest('.search-container-wrapper')) {
        autocompleteDropdown.classList.add('hidden');
    }
});

cityInput.addEventListener('input', (e) => {
    debounce(() => fetchCitySuggestions(e.target.value.trim()), 400);
});

cityInput.addEventListener('focus', () => {
    if(cityInput.value.trim().length < 3) showRecentSearches();
});

// ==========================
// Lógica Principal de Clima | Main Weather Logic
// ==========================

// Buscar coordenadas via nome | Fetch coordinates by name
async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar coordenadas | Error fetching coordinates');
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('Cidade não encontrada | City not found');
    }
    
    return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
    };
}

// Buscar previsão | Fetch forecast
async function getWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar dados do clima | Error fetching weather data');
    return await response.json();
}

// Atualizar Tema Dinâmico | Update Dynamic Theme
function updateTheme(weatherCode, isDay) {
    // Limpar classes de clima antigas | Clear old weather classes
    document.body.className = '';
    
    if (isDay === 0) {
        document.body.classList.add('weather-night');
        return;
    }
    
    const themeInfo = weatherCodeMap[weatherCode] || { theme: 'weather-sunny' };
    if(themeInfo.theme) {
        document.body.classList.add(themeInfo.theme);
    }
}

// Atualizar UI | Update UI
function updateUI(weatherData, locationData) {
    const current = weatherData.current;
    const codeInfo = weatherCodeMap[current.weather_code] || { desc: 'Desconhecido', icon: 'fa-cloud' };

    // Alterar Tema | Change Theme
    updateTheme(current.weather_code, current.is_day);

    cityNameEl.textContent = `${locationData.name}, ${locationData.country}`;
    weatherDescEl.textContent = codeInfo.desc;
    tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
    
    // Altera o ícone para lua se for noite | Change to moon icon if it's night
    let iconClass = codeInfo.icon;
    if(current.is_day === 0 && iconClass === 'fa-sun') iconClass = 'fa-moon';
    if(current.is_day === 0 && iconClass === 'fa-cloud-sun') iconClass = 'fa-cloud-moon';
    
    mainIconEl.className = `fa-solid ${iconClass}`;
    
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    windSpeedEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;

    // Atualizar Previsão | Update Forecast
    forecastGrid.innerHTML = '';
    const daily = weatherData.daily;
    
    for (let i = 1; i <= 5; i++) {
        const dayCodeInfo = weatherCodeMap[daily.weather_code[i]] || { desc: '', icon: 'fa-cloud' };
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-item';
        
        // Proteção XSS: Criando os elementos com DOM API em vez de innerHTML
        // XSS Protection: Creating elements with DOM API instead of innerHTML
        const pDay = document.createElement('p');
        pDay.className = 'day';
        pDay.textContent = getDayOfWeek(daily.time[i]);
        
        const iIcon = document.createElement('i');
        iIcon.className = `fa-solid ${dayCodeInfo.icon}`;
        
        const pTemp = document.createElement('p');
        pTemp.className = 'temp';
        pTemp.textContent = `${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°`;
        
        forecastCard.appendChild(pDay);
        forecastCard.appendChild(iIcon);
        forecastCard.appendChild(pTemp);
        
        forecastGrid.appendChild(forecastCard);
    }

    weatherMain.classList.remove('hidden');
    saveSearch(`${locationData.name}, ${locationData.country}`);
}

async function fetchWeatherDirectly(lat, lon, name, country) {
    errorMessage.classList.add('hidden');
    weatherMain.classList.add('hidden');
    autocompleteDropdown.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const weatherData = await getWeatherData(lat, lon);
        updateUI(weatherData, { lat, lon, name, country });
    } catch (error) {
        errorMessage.textContent = 'Erro ao carregar dados do clima. | Error loading weather data.';
        errorMessage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

async function handleSearch(overrideCity = null) {
    const city = overrideCity || cityInput.value.trim();
    if (!city) return;

    errorMessage.classList.add('hidden');
    weatherMain.classList.add('hidden');
    autocompleteDropdown.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const locationData = await getCoordinates(city);
        const weatherData = await getWeatherData(locationData.lat, locationData.lon);
        updateUI(weatherData, locationData);
    } catch (error) {
        errorMessage.textContent = error.message.includes('não encontrada') ? 
            'Cidade não encontrada. Tente novamente. | City not found. Try again.' : 
            'Erro ao carregar dados. Tente mais tarde. | Error loading data. Try later.';
        errorMessage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

// Botão de Localização (Geolocalização) | Location Button (Geolocation)
locationBtn.addEventListener('click', () => {
    if(navigator.geolocation) {
        loading.classList.remove('hidden');
        weatherMain.classList.add('hidden');
        autocompleteDropdown.classList.add('hidden');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
                    const revRes = await fetch(revUrl);
                    const revData = await revRes.json();
                    
                    const cityName = revData.city || revData.locality || "Sua Localização | Your Location";
                    const countryName = revData.countryName || "";
                    
                    cityInput.value = `${cityName}, ${countryName}`;
                    fetchWeatherDirectly(lat, lon, cityName, countryName);
                } catch(e) {
                    fetchWeatherDirectly(lat, lon, "Sua Localização | Your Location", "");
                }
            },
            (error) => {
                loading.classList.add('hidden');
                errorMessage.textContent = 'Permissão de localização negada ou indisponível. | Location permission denied or unavailable.';
                errorMessage.classList.remove('hidden');
            }
        );
    } else {
        alert("Geolocalização não é suportada no seu navegador. | Geolocation is not supported in your browser.");
    }
});

// Event Listeners
searchBtn.addEventListener('click', () => handleSearch());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        autocompleteDropdown.classList.add('hidden');
        handleSearch();
    }
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    // Se tiver histórico, carrega o último, se não, carrega SP | If there is history, load the last one, otherwise load SP
    if(recentSearches.length > 0) {
        cityInput.value = recentSearches[0];
        handleSearch(recentSearches[0]);
    } else {
        cityInput.value = 'São Paulo';
        handleSearch('São Paulo');
    }
});
