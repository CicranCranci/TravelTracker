document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables and cache DOM elements
    const countryCodes = JSON.parse(document.getElementById('country-codes').textContent);
    const mapPaths = document.querySelectorAll('.ag-canvas_svg path');
    const input = document.querySelector('input[name="country"]');
    const autocompleteContainer = document.getElementById('autocomplete-container');
    const visitedCountriesList = document.getElementById('visited-countries-list');
    const countElement = document.getElementById('visited-countries-count');
    const toggle = document.getElementById('visited-countries-toggle');
    const menu = document.getElementById('visited-countries-list');
    const countryInfo = document.getElementById('country-info');

    // Expanded carousel variables
    const expandedCarouselContainer = document.getElementById('expanded-carousel-container');
    let expandedImageIndex = 0;

    // Highlight visited countries on the map
    countryCodes.forEach(code => {
        const countryElement = document.getElementById(code);
        if (countryElement) {
            countryElement.style.fill = 'teal';
        } else {
            console.warn(`No element found with id: ${code}`);
        }
    });

    // Debounced input for country suggestions
    let debounceTimeout;
    input.addEventListener('input', function () {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const query = input.value.trim();
            if (query) {
                fetchSuggestions(query);
            } else {
                clearSuggestions();
            }
        }, 300); // Adjust delay as needed
    });

    async function fetchSuggestions(query) {
        try {
            const response = await fetch(`/suggestions?q=${query}`);
            if (response.ok) {
                const suggestions = await response.json();
                showSuggestions(suggestions);
            } else {
                showNoSuggestionsMessage();
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            showNoSuggestionsMessage();
        }
    }

    function showSuggestions(suggestions) {
        autocompleteContainer.innerHTML = '';
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.classList.add('autocomplete-suggestion');
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                input.value = suggestion;
                clearSuggestions();
            });
            autocompleteContainer.appendChild(div);
        });
    }

    function showNoSuggestionsMessage() {
        clearSuggestions();
        const div = document.createElement('div');
        div.classList.add('autocomplete-suggestion');
        div.textContent = 'No suggestions found';
        autocompleteContainer.appendChild(div);
    }

    function clearSuggestions() {
        autocompleteContainer.innerHTML = '';
    }

    // Populate visited country list and count
    fetch('/visited-countries')
        .then(response => response.json())
        .then(visitedCountries => {
            updateVisitedCountries(visitedCountries);
        })
        .catch(handleFetchError('visited countries'));

    function updateVisitedCountries(visitedCountries) {
        visitedCountriesList.innerHTML = '';
        countElement.textContent = `(${visitedCountries.length})`;

        if (visitedCountries.length === 0) {
            visitedCountriesList.innerHTML = '<li>No visited countries</li>';
        } else {
            visitedCountries.forEach(country => {
                const li = document.createElement('li');
                li.textContent = country;
                li.addEventListener('click', () => {
                    highlightCountry(country);
                    fetchCountryInfo(country);
                    menu.classList.remove('visible');
                    const icon = toggle.querySelector('.dropdown-icon');
                    if (icon) {
                        icon.classList.remove('rotate');
                    }
                });
                visitedCountriesList.appendChild(li);
            });
        }
    }

    function handleFetchError(context) {
        return (error) => {
            console.error(`Error fetching ${context}:`, error);
            alert(`Failed to fetch ${context}: ${error.message}`);
        };
    }


    // Hover effect to highlight country on the map
    visitedCountriesList.addEventListener('mouseover', function (event) {
        if (event.target.tagName === 'LI') {
            highlightCountryOnMap(event.target.textContent, true);
        }
    });

    visitedCountriesList.addEventListener('mouseout', function (event) {
        if (event.target.tagName === 'LI') {
            highlightCountryOnMap(event.target.textContent, false);
        }
    });

    function highlightCountryOnMap(countryName, highlight) {
        fetch(`/country-code?name=${countryName}`)
            .then(response => response.json())
            .then(data => {
                const countryElement = document.getElementById(data.country_code);
                if (countryElement) {
                    countryElement.classList.toggle('hovered', highlight);
                }
            })
            .catch(handleFetchError('country code'));
    }

    function highlightCountry(countryName) {
        fetch(`/country-code?name=${countryName}`)
            .then(response => response.json())
            .then(data => {
                const countryElement = document.getElementById(data.country_code);
                if (countryElement) {
                    countryElement.style.fill = 'yellow';
                    setTimeout(() => {
                        countryElement.style.fill = 'teal';
                    }, 4000);
                }
            })
            .catch(handleFetchError('country code'));
    }

    function fetchCountryInfo(countryName) {
        fetch(`/country-info?name=${countryName}`)
            .then(response => response.json())
            .then(data => {
                displayCountryInfo(data);
            })
            .catch(handleFetchError('country info'));
    }

    function displayCountryInfo(data) {
        countryInfo.innerHTML = `
            <button class="close-btn">&times;</button>
            <h3>${data.country_name}</h3>
            <p>Capital: ${data.capital}</p>
            <p>Population: ${data.population}</p>
        `;
        countryInfo.style.display = 'block';

        // Ensure the close button works after updating the content
        const closeBtn = countryInfo.querySelector('.close-btn');
        closeBtn.onclick = () => countryInfo.style.display = 'none';
    }

    // Add event listener to SVG paths
    mapPaths.forEach(path => {
        path.addEventListener('click', function () {
            const countryName = this.getAttribute('title');
            fetchCountryInfo(countryName);
        });
    });

    // Dropdown functionality for visited countries
    toggle.addEventListener('click', () => {
        menu.classList.toggle('visible');
        const icon = toggle.querySelector('.dropdown-icon');
        if (icon) {
            icon.classList.toggle('rotate');
        }
    });

    // Show expanded carousel without 3D effect
    function showExpandedCarousel(images) {
        expandedImageIndex = 0; // Reset index
        expandedCarouselImagesContainer.innerHTML = ''; // Clear existing images

        images.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            expandedCarouselImagesContainer.appendChild(img);
        });

        expandedCarouselContainer.style.display = 'block';
        updateExpandedCarousel();
    }

    function updateExpandedCarousel() {
        const offset = -expandedImageIndex * 100; // Calculate offset based on index
        expandedCarouselImagesContainer.style.transform = `translateX(${offset}%)`;
    }
});








































