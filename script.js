// Define the class Info to represent product information
class Info {
    constructor(product_name, amazonPrice, flipkartPrice, ajioPrice, snapdealPrice) {
        // Normalize product name
        this.product_name = normalizeString(product_name);
        this.amazonPrice = { cost: amazonPrice, column_name: 'amazon' };
        this.flipkartPrice = { cost: flipkartPrice, column_name: 'flipkart' };
        this.ajioPrice = { cost: ajioPrice, column_name: 'ajio' };
        this.snapdealPrice = { cost: snapdealPrice, column_name: 'snapdeal' };
    }
}

// Function to load CSV data and parse it into an array of Info objects
async function loadCSVData(filePath) {
    const response = await fetch(filePath);
    const data = await response.text();

    // Check for proper response and valid data
    if (!response.ok) {
        console.error(`Failed to fetch data from ${filePath}:`, response.statusText);
        return [];
    }

    // Split the CSV data into rows and remove the header row
    const rows = data.trim().split('\n');
    rows.shift();

    // Parse rows and create Info objects
    const productInformation = rows.map(row => {
        const [product_name, amazon, flipkart, ajio, snapdeal] = row.split(',').map(cell => cell.trim());

        // Create an Info object and return it
        return new Info(
            product_name,
            parseFloat(amazon),
            parseFloat(flipkart),
            parseFloat(ajio),
            parseFloat(snapdeal)
        );
    });

    // Log the number of products loaded for debugging
    console.log(`Loaded ${productInformation.length} products from CSV data.`);
    
    // Create an array of product names for suggestions
    const productNames = productInformation.map(info => info.product_name);

    return { productInformation, productNames };
}

// Normalize input strings for comparison
function normalizeString(str) {
    // Convert to lowercase and remove non-alphanumeric characters (except spaces)
    return str.trim().toLowerCase().replace(/[^a-z0-9 ]/gi, '');
}

// Handle the search functionality
function handleSearch(productInformation) {
    const searchForm = document.getElementById('search-form');
    const resultDiv = document.getElementById('result');

    // Add an event listener for form submission
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get and normalize the search value
        const searchValue = normalizeString(document.getElementById('search').value);

        // Log the search value for debugging
        console.log(`User search input: "${searchValue}"`);

        // Find the product in productInformation using the normalized search value
        const product = productInformation.find(info => info.product_name === searchValue);

        // Clear previous results
        resultDiv.innerHTML = '';

        if (product) {
            // Get all prices for the product and find the minimum cost
            const prices = [product.amazonPrice, product.flipkartPrice, product.ajioPrice, product.snapdealPrice];
            const minPrice = prices.reduce((min, curr) => (curr.cost < min.cost ? curr : min));

            // Display the lowest price for the product
            resultDiv.innerHTML = `The platform with the <strong>lowest price</strong> for "${product.product_name}" is: <strong>${minPrice.column_name}</strong> at a price of ₹<strong>${minPrice.cost.toFixed(2)*83}</strong>`;
        } else {
            // Display a message if the product is not found
            resultDiv.innerHTML = `Product "${searchValue}" not found in the database.`;
        }
    });
}

// Handle search suggestions
function handleSearchSuggestions(productNames) {
    const searchInput = document.getElementById('search');
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions-container';
    searchInput.parentNode.appendChild(suggestionsContainer);

    // Add an input event listener to the search input field
    searchInput.addEventListener('input', function(event) {
        const prefix = normalizeString(event.target.value);
        const suggestions = productNames.filter(name => name.startsWith(prefix)).slice(0, 7);

        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';

        // Populate the suggestions container
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = suggestion;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = suggestion; // Set input value to the selected suggestion
                suggestionsContainer.innerHTML = ''; // Clear suggestions
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
    });
}

// Initialize the script
async function init() {
    const filePath = 'ECommerce_data.csv'; // Path to the CSV file
    const { productInformation, productNames } = await loadCSVData(filePath);

    // Set up the search event listener
    handleSearch(productInformation);
    
    // Set up the search suggestions event listener
    handleSearchSuggestions(productNames);
}

// Run the initialization function when the document is fully loaded
document.addEventListener('DOMContentLoaded', init);