import { useState, useEffect, useRef } from 'react';
import './CityAutocomplete.css';

interface City {
    id: number;
    name: string;
    region: string;
    country: string;
}

interface CityAutocompleteProps {
    onCitySelect: (city: string) => void;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ onCitySelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Обработчик клика вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Поиск городов с дебаунсом
    useEffect(() => {
        const searchCities = async () => {
            if (searchTerm.length < 2) {
                setCities([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/search.json?key=f42dfb3ebdba48f2a9b142355251005&q=${searchTerm}`
                );
                if (!response.ok) throw new Error('Ошибка поиска городов');
                const data = await response.json();
                setCities(data);
            } catch (error) {
                console.error('Ошибка при поиске городов:', error);
                setCities([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimeout = setTimeout(searchCities, 300);
        return () => clearTimeout(debounceTimeout);
    }, [searchTerm]);

    const handleCityClick = (cityName: string) => {
        onCitySelect(cityName);
        setSearchTerm(cityName);
        setShowDropdown(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && searchTerm.length > 1) {
            if (cities.length > 0) {
                handleCityClick(cities[0].name);
            }
        }
    };

    return (
        <div className="cityAutocomplete" ref={dropdownRef}>
            <div className="searchInputWrapper">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true); // Показываем выпадающий список при вводе текста
                    }}
                    onKeyDown={handleKeyDown} // Обработчик нажатия клавиш
                    placeholder="Enter city name"
                    className="searchInput"
                />
            </div>

            {showDropdown && searchTerm.length > 1 && (
                <div className="citiesDropdown">
                    {isLoading ? (
                        <div className="dropdownItem loading">Идет поиск городов...</div>
                    ) : cities.length > 0 ? (
                        cities.map((city) => (
                            <div
                                key={city.id}
                                className="dropdownItem"
                                onClick={() => handleCityClick(city.name)}
                            >
                                <span className="cityName">{city.name}</span>
                                <span className="cityRegion">{city.region}, {city.country}</span>
                            </div>
                        ))
                    ) : (
                        <div className="dropdownItem noResults">Города не найдены</div>
                    )}
                </div>
            )}
        </div>
    );
};