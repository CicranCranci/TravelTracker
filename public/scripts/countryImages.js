// List of all country names (ISO 3166-1 format)
const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
    "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
    "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
    "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
    "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
    "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Function to populate the dropdown with country options
function populateCountryDropdown() {
    const countryDropdown = document.getElementById('country-input');
    countryDropdown.innerHTML = '';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryDropdown.appendChild(option);
    });
}

// Function to fetch country images from Unsplash API
async function fetchCountryImages(query) {
    const apiKey = '7kXLup-cYaya-Mu8pZzglboV9o6XCNoXYbVAObhH6BM'; // Replace with your Unsplash Access Key
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${apiKey}`);
    if (!response.ok) throw new Error('Failed to fetch images from Unsplash');
    const data = await response.json();
    return data.results.map(image => image.urls.regular);
}

// Function to display country images with random movement
async function displayCountryImages(countryName) {
    try {
        const images = await fetchCountryImages(countryName);
        const container = document.getElementById('country-images');
        container.innerHTML = '';

        if (images.length === 0) {
            container.innerHTML = '<p>No images found for this country.</p>';
            return;
        }

        const imageElements = images.map(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = countryName;
            img.classList.add('country-image');
            img.addEventListener('click', () => showZoomedImage(img.src));
            container.appendChild(img);
            return img;
        });

        setInterval(() => moveImagesRandomly(imageElements), 5000); // Move every 5 seconds
    } catch (error) {
        console.error('Error displaying country images:', error);
        document.getElementById('country-images').innerHTML = '<p>Error fetching images.</p>';
    }
}

// Function to randomly move images around the screen
function moveImagesRandomly(images) {
    images.forEach(img => {
        const randomX = Math.floor(Math.random() * 80);
        const randomY = Math.floor(Math.random() * 80);
        img.style.left = `${randomX}%`;
        img.style.top = `${randomY}%`;
    });
}

// Function to show the zoomed image
function showZoomedImage(src) {
    const zoomedImage = document.getElementById('zoomed-image');
    const zoomedImageContainer = document.getElementById('zoomed-image-container');
    const zoomOverlay = document.getElementById('zoom-overlay');

    zoomedImage.src = src;
    zoomedImageContainer.style.display = 'flex';
    zoomOverlay.style.display = 'block';
}

// Function to hide the zoomed image
function hideZoomedImage() {
    const zoomedImageContainer = document.getElementById('zoomed-image-container');
    const zoomOverlay = document.getElementById('zoom-overlay');

    zoomedImageContainer.style.display = 'none';
    zoomOverlay.style.display = 'none';
}

// Add an event listener to populate the dropdown and trigger image display
document.addEventListener('DOMContentLoaded', () => {
    populateCountryDropdown(); // Populate the country dropdown

    const countryInput = document.getElementById('country-input'); // Ensure this ID matches your HTML
    countryInput.addEventListener('change', (event) => {
        const countryName = event.target.value;
        displayCountryImages(countryName);
    });

    // Add click event to overlay to close zoomed image
    document.getElementById('zoom-overlay').addEventListener('click', hideZoomedImage);
});










