document.addEventListener('DOMContentLoaded', function () {
    // Initialize variables and cache DOM elements
    const countryCodes = JSON.parse(document.getElementById('country-codes').textContent);
    const mapPaths = document.querySelectorAll('.ag-canvas_svg path');
    const input = document.querySelector('input[name="country"]');
    const autocompleteContainer = document.getElementById('autocomplete-container');
    const countryInfo = document.getElementById('country-info');

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

    // Hover effect to highlight country on the map
    mapPaths.forEach(path => {
        path.addEventListener('click', function () {
            const countryName = this.getAttribute('title');
            fetchCountryInfo(countryName);
        });
    });

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

    function handleFetchError(context) {
        return (error) => {
            console.error(`Error fetching ${context}:`, error);
            alert(`Failed to fetch ${context}: ${error.message}`);
        };
    }
});









































