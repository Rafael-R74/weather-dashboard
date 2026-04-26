# Weather Dashboard

<div align="center">

![Screenshot 1](https://i.postimg.cc/5y65H4f9/Captura-de-tela-2026-04-26-142808.png)

![Screenshot 2](https://i.postimg.cc/rFh5d49z/Captura-de-tela-2026-04-26-142932.png)

![Screenshot 3](https://i.postimg.cc/ydq6tH4B/Captura-de-tela-2026-04-26-143229.png)

![Screenshot 4](https://i.postimg.cc/2S5T5WwS/Captura-de-tela-2026-04-26-143343.png)

</div>

<br>

A modern and responsive weather dashboard developed as part of a final technical project. This application provides real-time weather conditions and forecasts using the **Open-Meteo API**. The interface features a dynamic glassmorphism design that adapts to different weather conditions (sunny, cloudy, rainy, and night) and includes features such as search functionality, geolocation, autocomplete suggestions, and a history of recent searches.

## Features

### Core Functionality
- **Real-time Weather Data**: Fetches current weather conditions and 7-day forecasts.
- **Search**: Allows users to search for weather in specific cities.
- **Geolocation**: Uses the browser's geolocation API to detect the user's current location.
- **Autocomplete & Recent Searches**: Suggests city names as the user types and maintains a list of recently searched locations.

### Dynamic & Responsive Design
- **Glassmorphism UI**: Utilizes a modern glassmorphism design with frosted glass effects.
- **Theme Adaptation**: The background gradients, colors, and glass effects automatically adjust based on the current weather conditions (Sunny, Cloudy, Rainy, Night).
- **Responsive Layout**: Fully responsive design that adapts to different screen sizes.

### Technical Features
- **API Integration**: Uses **Open-Meteo** for weather data.
- **Autocomplete**: Uses a search API to provide suggestions while typing.
- **Reverse Geocoding**: Uses **BigDataCloud** to retrieve city names from coordinates.
- **Local Storage**: Saves recent searches for quick access.

## Local Setup

1.  **Clone the repository** (or download the source code):
    ```bash
    git clone <repository-url>
    ```
2.  **Open the `index.html` file** in your web browser.

## Usage

- Enter a city name in the search bar and press Enter or click the search icon.
- Click the target icon to get weather for your current location.
- Click on a suggestion from the autocomplete dropdown to select a city.
- Recent searches are automatically saved and can be clicked to quickly view weather for those locations.

## Technologies Used

- **HTML5**: For the structure of the application.
- **CSS3**: For styling, animations, and the glassmorphism effect.
- **JavaScript (Vanilla)**: For the core logic and API integrations.
- **[Open-Meteo API](https://open-meteo.com/)**: For weather data.
- **[BigDataCloud API](https://www.bigdatacloud.io/)**: For reverse geocoding (city name lookup).

