class WeatherApp {
    constructor() {
        this.fragment = document.createDocumentFragment();
        this.cardList = document.getElementById("cardList");
        this.searchLocation = document.getElementById("searchLocation");
        this.chart;
        this.lat;
        this.lon;

        this.clock();
        this.searchLocation.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                this.getLocation();
            }
        });
    }

    async getLocation() {
        try {
            const location = this.searchLocation.value;
            if (location == "") {
                this.searchLocation.placeholder = "Please enter a location";
                this.searchLocation.className =
                    "form-control bg-secondary-subtle invalid";
                setTimeout(() => {
                    this.searchLocation.placeholder = "Search location";
                    this.searchLocation.className = "form-control bg-secondary-subtle";
                }, 1200);
            } else {
                const url = `https://nominatim.openstreetmap.org/search?q=${location}&format=json`;
                const response = await fetch(url);
                const data = await response.json();
                if (data != 0) {
                    this.cardList.innerHTML = `
                    <div class="d-flex align-items-center" style="height: 85px;" id="spinner">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    `;
                    this.chart.destroy();
                    this.getWeatherData(data[0]);
                    document.getElementById("locationText").textContent = location;
                } else {
                    this.searchLocation.value = "";
                    this.searchLocation.className =
                        "form-control bg-secondary-subtle invalid";
                    this.searchLocation.placeholder = "Enter the correct location name";
                    setTimeout(() => {
                        this.searchLocation.className = "form-control bg-secondary-subtle";
                        this.searchLocation.placeholder = "Search location";
                    }, 2000);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getWeatherData(data) {
        try {
            this.cardList.innerHTML = `
            <div class="d-flex align-items-center" style="height: 85px;" id="spinner">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
            `;
            let lat;
            let lon;
            if (data != undefined) {
                lat = data.lat;
                lon = data.lon;
            } else {
                lat = "41.006381";
                lon = "28.9758715";
            }
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
            const response = await fetch(url);
            const weatherData = await response.json();
            this.createCart(weatherData.daily);
            this.createChart(
                weatherData.daily.temperature_2m_max,
                weatherData.daily.time
            );
        } catch (error) {
            console.log(error);
        }
    }

    createCart(data) {
        document.getElementById("spinner").remove();
        for (let i = 0; i < 7; i++) {
            let date = new Date(data.time[i]);

            const card = document.createElement("div");
            card.className = "card bg-secondary-subtle border w-100 py-2";
            this.fragment.appendChild(card);

            const cardContent = document.createElement("div");
            cardContent.className =
                "d-flex justify-content-center align-items-center gap-1";
            card.append(cardContent);

            const maxTemp = document.createElement("h4");
            maxTemp.className = "m-0";
            maxTemp.textContent = data.temperature_2m_max[i];
            cardContent.appendChild(maxTemp);

            const bracket = document.createElement("h4");
            bracket.className = "m-0";
            bracket.textContent = "/";
            cardContent.appendChild(bracket);

            const minTemp = document.createElement("h5");
            minTemp.className = "m-0";
            minTemp.textContent = data.temperature_2m_min[i];
            cardContent.appendChild(minTemp);

            const hr = document.createElement("hr");
            hr.className = "card-hr m-1 mx-2";
            card.appendChild(hr);

            const day = document.createElement("h4");
            day.className = "text-center m-0";
            day.textContent = date.toLocaleString("default", { weekday: "long" });
            card.appendChild(day);
        }
        this.cardList.appendChild(this.fragment);
    }

    createChart(data, weekday) {
        const ctx = document.getElementById("chart");
        let day = [];

        weekday.forEach((e) => {
            day.push(new Date(e).toLocaleString("default", { weekday: "long" }));
        });

        this.chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: day,
                datasets: [
                    {
                        label: "Daily change",
                        data: data,
                        borderWidth: 3,
                        borderColor: "#f3c302",
                        backgroundColor: "#4c4219",
                        fill: true,
                        fillColor: "#4c4219",
                        lineTension: 0.5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    clock() {
        const clock = document.getElementById("clock");
        setInterval(() => {
            let date = new Date();
            clock.textContent = date.toLocaleTimeString();
        }, 1000);
    }
}

const createWeatherApp = new WeatherApp();
createWeatherApp.getWeatherData();
