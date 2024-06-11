// IIFE to create a Pokémon repository
let pokemonRepository = (function () {
  let pokemonList = [];

  // Function to return all Pokémon
  function getAll() {
    return pokemonList;
  }

  // Function to add a new Pokémon
  function add(pokemon) {
    if (
      typeof pokemon === "object" &&
      "name" in pokemon &&
      "detailsUrl" in pokemon
    ) {
      pokemonList.push(pokemon);
      console.log("Added: ", pokemon); // Check if Pokémon are added
    } else {
      console.error("Invalid Pokémon data", pokemon);
    }
  }

  // Function to find a Pokémon by name
  function findByName(name) {
    return pokemonList.filter(
      (pokemon) => pokemon.name.toLowerCase() === name.toLowerCase()
    );
  }

  // Function to render the Pokémon list
  function renderList() {
    document.querySelector(".pokemon-list").innerHTML = ""; // Clear the current list

    // Simply add each Pokémon to the list without grouping
    pokemonList.forEach((pokemon) => {
      addListItem(pokemon);
    });
  }

  // Function to create list item for each Pokémon
  function addListItem(pokemon) {
    let ul = document.querySelector(".pokemon-list");
    let li = document.createElement("li");

    let typesText = pokemon.types.join(", "); // Join all types with a comma
    let displayText = `${pokemon.name} (Height: ${pokemon.height}, Types: ${typesText})`;
    if (pokemon.height > 1.0) {
      displayText += ` - <span class="big">Wow, that’s big!</span>`;
    } else {
      displayText += ` - <span class="small">That's a small one.</span>`;
    }

    let button = document.createElement("button");
    button.innerHTML = displayText;
    button.classList.add("pokemon-button");
    button.addEventListener("click", () => {
      showDetails(pokemon);
    });

    li.appendChild(button);
    ul.appendChild(li);
  }

  // Updated showDetails function to fetch details from API
  function showDetails(pokemon) {
    loadDetails(pokemon).then(() => {
      console.log(pokemon); // Now this logs all details including fetched ones
    });
  }

  // Function to load the list of Pokémon from the API
  function loadList() {
    showLoadingMessage(); // Show loading message at the start
    return fetch("https://pokeapi.co/api/v2/pokemon/")
      .then((response) => response.json())
      .then((json) => {
        console.log(json); // Add this line to check what the API returns
        json.results.forEach((item) => {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url,
          };
          add(pokemon);
        });
        hideLoadingMessage(); // Hide loading message once data is loaded
      })
      .catch((e) => console.error(e));
  }

  // Function to load detailed data for a given Pokémon
  function loadDetails(pokemon) {
    showLoadingMessage(); // Show loading message at the start
    let url = pokemon.detailsUrl;
    return fetch(url)
      .then((response) => response.json())
      .then((details) => {
        pokemon.height = details.height; // Continue fetching height
        pokemon.types = details.types.map((t) => t.type.name); // Fetch and store types
        pokemon.imageUrl = details.sprites.front_default; // Continue fetching image URL
        hideLoadingMessage(); // Hide loading message once data is loaded
      })
      .catch((e) => console.error(e));
  }

  // Utility functions:
  function showLoadingMessage() {
    const loadingMessage = document.createElement("div");
    loadingMessage.innerText = "Loading Pokémon data...";
    loadingMessage.id = "loading-message";
    document.body.appendChild(loadingMessage);
  }

  function hideLoadingMessage() {
    const loadingMessage = document.getElementById("loading-message");
    if (loadingMessage) {
      loadingMessage.parentNode.removeChild(loadingUserListMessage);
    }
  }

  // Expose these new methods via the repository's public interface
  return {
    getAll: getAll,
    add: add,
    findByName: findByName,
    renderList: renderList,
    loadList: loadList, // Make sure to expose loadList
    loadDetails: loadDetails, // And loadDetails
  };
})();

// Create the initial list container
document.querySelector("#pokemon-container").innerHTML =
  '<ul class="pokemon-list"></ul>';

// Initial rendering of the list
pokemonRepository.renderList();

// ***ACTIONS***

// Adding a new Pokémon
pokemonRepository.add({
  name: "Mew",
  height: 0.4,
  types: ["psychic"],
});

// Finding a Pokémon by name (check in console)
console.log(pokemonRepository.findByName("Mew"));

document.addEventListener("DOMContentLoaded", function () {
  pokemonRepository.loadList().then(() => {
    // Fetch details for all Pokémon before rendering
    let detailsPromises = pokemonRepository
      .getAll()
      .map((pokemon) => pokemonRepository.loadDetails(pokemon));
    Promise.all(detailsPromises)
      .then(() => {
        // Render the list only after all details are fetched
        pokemonRepository.renderList();
      })
      .catch((e) => {
        console.error("Error fetching details:", e);
      });
  });
});
