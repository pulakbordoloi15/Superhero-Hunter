// Set up an array of image URLs for background images
const images = ['images/deadpool.jpg', 'images/Hulk.jpg', 'images/ironman.jpg', 'images/kids.jpg', 'images/marvel.jpg', 'images/Spider.jpg', 'images/thor.jpg'];

// Select the container for the background image
const imageContainer = document.querySelector('.background-image-container');

// Function to get a random image URL from the array
function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

// Function to change the background image
function changeBackgroundImage() {
    const randomImage = getRandomImage();
    // Apply a transition effect to the background image
    imageContainer.style.transition = 'background-image 3s ease-in-out';
    imageContainer.style.backgroundImage = `url(${randomImage})`;
}

// Change the background image on page load
changeBackgroundImage();

// Periodically change the background image every 10 seconds
setInterval(changeBackgroundImage, 10000);

// API Integration

// Define variables for Marvel API authentication and endpoint
const ts = "1699111321077";
const publicKey = "184378ac2ddfa1910377337cc908a978";
const hashVal = "9c337723c188dccd2510316d870cbf59";
const baseUrl = "https://gateway.marvel.com:443/v1/public/characters";

// Select input and button elements for character search
const input = document.getElementById("input-box");
const button = document.getElementById("submit-button");

// Select containers for displaying character results and favorites
const showContainer = document.getElementById("show-container");
const listContainer = document.querySelector(".list");
const favoritesContainer = document.getElementById("favorites-container");

// Initialize variables for authentication
const [timestamp, apiKey, hashValue] = [ts, publicKey, hashVal];

// Initialize an array to store favorite characters
const favorites = [];

// Function to display character search results
function displayWords(value) {
    input.value = value;
    removeElements();
    getResults();
}

// Function to remove search result elements
function removeElements() {
    listContainer.innerHTML = "";
}

// Function to add a character to the favorites list
function addCharacterToFavorites(character) {
    if (!favorites.includes(character)) {
        favorites.push(character);
        saveFavoritesToLocalStorage(); // Save to local storage
        displayFavorites();
        console.log(`${character.name} has been added to favorites.`);
    }
}

// Function to update the "Add to Favorites" button
function updateAddToFavoritesButton(button, character) {
    if (favorites.includes(character)) {
        button.textContent = "Already Favorited";
        button.disabled = true;
    } else {
        button.textContent = "Add to Favorites";
        button.disabled = false;
    }
}

// Function to display the list of favorite characters
function displayFavorites() {
    favoritesContainer.innerHTML = "";
    favorites.forEach((favorite, index) => {
        const favoriteDiv = document.createElement("div");
        favoriteDiv.classList.add("favorite-item");
        favoriteDiv.innerHTML = `
            <p>${index + 1}. ${favorite.name}</p>
            <button class="remove-favorite-button" data-index="${index}">Remove</button>
        `;
        favoriteDiv.querySelector(".remove-favorite-button").addEventListener("click", (event) => {
            removeFavorite(event.target.getAttribute("data-index"));
        });
        favoritesContainer.appendChild(favoriteDiv);
    });
}

// Function to remove a character from the favorites list
function removeFavorite(index) {
    if (index >= 0 && index < favorites.length) {
        favorites.splice(index, 1);
        displayFavorites();
        saveFavoritesToLocalStorage(); // Save to local storage
    }
}

// Event listener for input changes
input.addEventListener("keyup", async () => {
    removeElements();
    if (input.value.length < 4) {
        return false;
    }
    const url = `${baseUrl}?ts=${timestamp}&apikey=${apiKey}&hash=${hashValue}&nameStartsWith=${input.value}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        if (jsonData.data && jsonData.data.results) {
            jsonData.data.results.forEach((result) => {
                let name = result.name;
                let div = document.createElement("div");
                div.style.cursor = "pointer";
                div.classList.add("autocomplete-items");
                div.addEventListener("click", function () {
                    displayWords(name);
                });
                let word = "<b>" + name.substr(0, input.value.length) + "</b>";
                word += name.substr(input.value.length);
                div.innerHTML = `
                    <p class="item">${word}</p>
                `;
                listContainer.appendChild(div);
            });
        } else {
            throw Error('API response format is not as expected');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to fetch character search results
function getResults() {
    if (input.value.trim().length < 1) {
        console.log("Input cannot be blank");
        return;
    }
    showContainer.innerHTML = "";
    const url = `${baseUrl}?ts=${timestamp}&apikey=${apiKey}&hash=${hashValue}&name=${input.value}`;
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((jsonData) => {
            if (jsonData.data && jsonData.data.results) {
                jsonData.data.results.forEach((element) => {
                    showContainer.innerHTML = `<div class="card-container">
                        <div class="container-character-image">
                            <img src="${element.thumbnail.path}.${element.thumbnail.extension}" alt="${element.name}"/>
                        </div>
                        <div class="character-name">${element.name}</div>
                        <div class="character-description">${element.description || "No description available"}</div>
                        <button class="add-favorite-button">Add to Favorites</button>
                    </div>`;
                    const addButton = showContainer.querySelector(".add-favorite-button");
                    addButton.addEventListener("click", () => {
                        addCharacterToFavorites(element);
                        updateAddToFavoritesButton(addButton, element);
                    });
                    updateAddToFavoritesButton(addButton, element);
                });
            } else {
                throw new Error('API response format is not as expected');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Save user favorites to local storage
function saveFavoritesToLocalStorage() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Load user favorites from local storage on page load
function loadFavoritesFromLocalStorage() {
    const favoritesData = localStorage.getItem("favorites");
    if (favoritesData) {
        favorites = JSON.parse(favoritesData);
    }
}

// Load favorites from local storage on page load
window.onload = () => {
    loadFavoritesFromLocalStorage();
    getResults();
    button.addEventListener("click", getResults);
};
