import './mainPage.css';
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldCat} from '@fortawesome/free-solid-svg-icons';
import { CityAutocomplete } from '../../components/CityAutocomplete/CityAutocomplete';
import { ThemeSwitch } from '../../components/ThemeSwitch/ThemeSwitch';

interface WeatherData {
    current?: {
        humidity: number;
        wind_kph: number;
        pressure_mb: number;
        cloud: number;
        temp_f: number;
        feelslike_c: number;
        condition: {
            text: string;
            icon: string;
        };
        temp_c: number;
        is_day: number;
    };
    location?: {
        name: string;
    };
}

export default function MainPage() {
    const [checked, setChecked] = useState(true);
    const [weatherData, setWeatherData] = useState<WeatherData>({});
    const [mainPageTheme, setMainPageTheme] = useState('mainLight');
    const [isDarkTheme, setDarkTheme] = useState(true);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    async function fetchWeatherData(city: string) {
        const url = `https://api.weatherapi.com/v1/current.json?key=f42dfb3ebdba48f2a9b142355251005&q=${city}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setWeatherData(data);
            console.log(data);
        } catch (error) {
            console.error("Ошибка при получении данных о погоде:", error);
        }
    }

    const themeChange = () => {
        if (isDarkTheme) {
            setMainPageTheme("mainLight");
        } else {
            setMainPageTheme("mainDark");
        }
        setDarkTheme(!isDarkTheme);
    }

    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(Date.now());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const date = new Date(time);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const weatherArray = weatherData.current ? [
        { title: "humidity", value: `${weatherData.current.humidity} %`, img: "https://cdn-icons-png.flaticon.com/512/219/219816.png"},
        { title: "wind", value: `${weatherData.current.wind_kph} км/ч`, img: "https://cdn-icons-png.flaticon.com/512/54/54298.png"},
        { title: "pressure", value: `${weatherData.current.pressure_mb} мб`, img: "https://cdn-icons-png.flaticon.com/512/5497/5497268.png"},
        { title: "cloud", value: `${weatherData.current.cloud} %`, img: "https://cdn-icons-png.flaticon.com/512/606/606796.png"},
        { title: "temp F°", value: `${weatherData.current.temp_f} F°`, img: "https://cdn-icons-png.flaticon.com/512/136/136609.png"},
        { title: "feelslike ", value: `${weatherData.current.feelslike_c} C°`, img: "https://cdn-icons-png.flaticon.com/512/95/95922.png"},
    ] : [];

    function getDay(number:number) {
        switch (number) {
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
            case 7:
                return "Sunday";
        }
    }

    return (
        <>
            <div className={mainPageTheme}>
                <div className="mainPage">
                    <div className='mainPageContainer'>
                        <div className='headerControls'>
                            <CityAutocomplete onCitySelect={fetchWeatherData}/>
                            <ThemeSwitch
                                checked={checked}
                                onChange={handleChange}
                                onClick={themeChange}
                            />
                        </div>
                        <div className='title'>
                            <h1>Weather Cat <FontAwesomeIcon icon={faShieldCat} /></h1>
                        </div>
                        {Object.keys(weatherData).length > 0 && weatherData.current ? (
                            <div className='weather'>
                                <div className='tempInfo'>
                                    <h1>{weatherData.location?.name}</h1>
                                    <h1 className='time'>{hours}:{minutes}</h1>
                                    <p>{getDay(weatherData.current.is_day)}</p>
                                </div>
                                <div className='tempInfo'>
                                    <h1>{weatherData.current.temp_c} °C</h1>
                                    <p>{weatherData.current.condition.text}</p>
                                    <img src={`https:${weatherData.current.condition.icon}`} alt="Weather icon" />
                                </div>
                                <div className='weatherMain'>
                                    {weatherArray.map((item, id) => (
                                        <div key={id} className="weatherItem">
                                            <p>{item.title}</p>
                                            <img src={item.img}/>
                                            <p>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p></p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}