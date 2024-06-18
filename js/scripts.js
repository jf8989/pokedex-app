// IIFE to create a Pokémon repository
let pokemonRepository = (function () {
  let pokemonList = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // *** DATA MANAGEMENT ***

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

  // *** DOM RENDERING ***

  // Function to render the Pokémon list
  function renderList() {
    const pokemonListElement = document.querySelector("#pokemon-list");
    pokemonListElement.innerHTML = "";
    getPageItems().forEach((pokemon) => {
      addListItem(pokemon);
    });
    updatePaginationControls();
  }

  // Function to create list item for each Pokémon
  function addListItem(pokemon) {
    let ul = document.querySelector("#pokemon-list");
    let li = document.createElement("li");
    li.classList.add("list-group-item", "pokemon-item"); // Add custom class
  
    let typesText = pokemon.types.join(", ");
    let displayText = `${capitalizeFirstLetter(pokemon.name)} (Height: ${
      pokemon.height
    }, Types: ${typesText})`;
    
    if (pokemon.height > 7) {
      displayText += ` - <span class="big">Wow, that’s big!</span>`;
    } else {
      displayText += ` - <span class="small">That's a small one.</span>`;
    }
  
    let button = document.createElement("button");
    button.innerHTML = displayText;
    button.classList.add("btn", "pokemon-button"); // Custom class for button
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#pokemonModal");
    button.addEventListener("click", () => {
      showDetails(pokemon);
    });
  
    li.appendChild(button);
    ul.appendChild(li);
  }  

  // *** API INTERACTIONS ***

  // Function to load the list of Pokémon from the API
  function loadList(url = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0") {
    showLoadingMessage(); // Show loading message at the start
    return fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json); // Check what the API returns
        json.results.forEach((item) => {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url,
          };
          add(pokemon);
        });
  
        // Check if there is another page
        if (json.next) {
          return loadList(json.next); // Fetch next page
        } else {
          // Hide loading message after rendering the list
          pokemonRepository.renderList();
          pokemonRepository.updatePaginationControls();
          hideLoadingMessage(); // Hide loading message once all data is loaded and rendered
        }
      })
      .catch((e) => {
        console.error(e);
        hideLoadingMessage(); // Hide loading message if an error occurs
      });
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
        pokemonRepository.renderList();
        pokemonRepository.updatePaginationControls();
        hideLoadingMessage(); // Hide loading message once data is loaded and rendered
      })
      .catch((e) => {
        console.error(e);
        hideLoadingMessage(); // Hide loading message if an error occurs
      });
  }  

  // Function to show detailed Pokémon information
  function showDetails(pokemon) {
    loadDetails(pokemon).then(() => {
      showModal(pokemon);
    });
  }

  // *** UTILITY FUNCTIONS ***

  // Helper function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Function to open the modal with Pokémon details
  function showModal(pokemon) {
    let modalTitle = document.querySelector("#pokemonModalLabel");
    let pokemonName = document.querySelector("#pokemonName");
    let pokemonHeight = document.querySelector("#pokemonHeight");
    let pokemonImage = document.querySelector("#pokemonImage");

    // Capitalize the Pokémon name
    let capitalizedPokemonName = capitalizeFirstLetter(pokemon.name);

    // Set the content
    modalTitle.innerText = capitalizedPokemonName;
    pokemonName.innerText = capitalizedPokemonName;
    pokemonHeight.innerText = `Height: ${pokemon.height}`;
    pokemonImage.src = pokemon.imageUrl;

    // Ensure the modal shows correctly
    $("#pokemonModal").modal("show");

    // Ensure modal focus and close functionality
    $("#pokemonModal").on("shown.bs.modal", function () {
      $("#pokemonModal").trigger("focus");
    });

    $("#pokemonModal").on("hidden.bs.modal", function () {
      // Restore focus to the main page or perform any necessary clean up
    });
  }

  function showLoadingMessage() {
    if (!document.getElementById("loading-message")) {
      const loadingMessage = document.createElement("div");
      loadingMessage.id = "loading-message";
      loadingMessage.style.display = "flex";
      loadingMessage.style.justifyContent = "center";
      loadingMessage.style.alignItems = "center";
      loadingMessage.style.position = "fixed";
      loadingMessage.style.top = "0";
      loadingMessage.style.left = "0";
      loadingMessage.style.width = "100%";
      loadingMessage.style.height = "100%";
      loadingMessage.style.backgroundColor = "rgba(0,0,0,0.5)";
      loadingMessage.style.zIndex = "9999";
  
      const spinner = document.createElement("div");
      spinner.className = "spinner-border text-light";
      spinner.setAttribute("role", "status");
  
      const spinnerText = document.createElement("span");
      spinnerText.className = "sr-only";
      spinnerText.innerText = "Loading...";
  
      spinner.appendChild(spinnerText);
      loadingMessage.appendChild(spinner);
      document.body.appendChild(loadingMessage);
    }
  }
  
  function hideLoadingMessage() {
    const loadingMessage = document.getElementById("loading-message");
    if (loadingMessage) {
      loadingMessage.parentNode.removeChild(loadingMessage);
    }
  }

  // *** PAGINATION LOGIC ***
  function getPageItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    console.log(`Getting items for page ${currentPage}, startIndex: ${startIndex}, endIndex: ${endIndex}`);
    return pokemonList.slice(startIndex, endIndex);
  }

  function updatePaginationControls() {
    const totalPages = Math.ceil(pokemonList.length / itemsPerPage);
    console.log(`Total pages: ${totalPages}`);
    
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    
    if (prevPageButton) {
      prevPageButton.disabled = currentPage === 1;
    }
    if (nextPageButton) {
      nextPageButton.disabled = currentPage === totalPages;
    }
  
    // Update page counter
    updatePageCounter(totalPages);
  } 
  
  function updatePageCounter(totalPages) {
    const pageCounter = document.getElementById('page-counter');
    pageCounter.innerText = `${currentPage}/${totalPages}`;
  }  
  
  function goToNextPage() {
    const totalPages = Math.ceil(pokemonList.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderList();
      updatePaginationControls(); // Update controls after changing page
    }
  }
  
  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderList();
      updatePaginationControls(); // Update controls after changing page
    }
  }
  
  document.getElementById('next-page').addEventListener('click', goToNextPage);
  document.getElementById('prev-page').addEventListener('click', goToPrevPage);  

  // Expose these new methods via the repository's public interface
  return {
    getAll,
    add,
    findByName,
    renderList,
    loadList,
    loadDetails,
    updatePaginationControls, // Expose the function
  };  
})();

// Initial setup
document.querySelector("#pokemon-container").innerHTML =
  '<ul class="list-group" id="pokemon-list"></ul>';

// Initial rendering of the list
pokemonRepository.renderList();

// *** ACTIONS ***

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
    let detailsPromises = pokemonRepository
      .getAll()
      .map((pokemon) => pokemonRepository.loadDetails(pokemon));
    Promise.all(detailsPromises)
      .then(() => {
        pokemonRepository.renderList();
        pokemonRepository.updatePaginationControls(); // Call the exposed function
      })
      .catch((e) => {
        console.error("Error fetching details:", e);
      });
  });
});
