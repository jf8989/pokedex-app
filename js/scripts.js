/* eslint-disable no-unused-vars */
/* global $ */
// js/scripts.js
// IIFE to create a Pokémon repository
let pokemonRepository = (function () {
  let pokemonList = [];
  let currentPage = 1;
  // --- CHANGE: Updated items per page ---
  const itemsPerPage = 10;
  const CACHE_KEY = "pokemonListCache";

  // *** Logging Setup ***
  const logGroup = "PokemonRepository";
  const log = (level, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${logGroup}]`, ...args);
  };
  log("info", "Repository initialized");

  // *** DATA MANAGEMENT *** (Keep existing functions: getAll, add, findByName)
  function getAll() {
    log("info", "getAll called");
    return pokemonList;
  }

  function add(pokemon) {
    if (
      typeof pokemon === "object" &&
      "name" in pokemon &&
      "detailsUrl" in pokemon
    ) {
      pokemonList.push(pokemon);
    } else {
      log("error", "Invalid Pokémon data", pokemon);
    }
  }

  function findByName(name) {
    log("info", `findByName called for: ${name}`);
    return pokemonList.filter(
      (pokemon) => pokemon.name.toLowerCase() === name.toLowerCase()
    );
  }


  // *** DOM RENDERING ***

  // --- CHANGE: Modified to target grid and clear grid ---
  function renderList() {
    log("info", `renderList called for page ${currentPage}`);
    // Target the grid container row
    const pokemonGridElement = document.querySelector("#pokemon-grid");
    if (!pokemonGridElement) {
      log("error", "Pokemon grid element (#pokemon-grid) not found");
      return;
    }
    pokemonGridElement.innerHTML = ""; // Clear existing grid content
    const pageItems = getPageItems();
    log("info", `Rendering ${pageItems.length} items for page ${currentPage}`);
    pageItems.forEach((pokemon) => {
      addListItem(pokemon); // Changed function name for clarity
    });
    updatePaginationControls();
  }

  // --- CHANGE: Modified to create Bootstrap cards ---
  function addListItem(pokemon) { // Renamed from addListItem to createPokemonCard internally if preferred
    let gridRow = document.querySelector("#pokemon-grid");
    if (!gridRow) {
      log("error", "Pokemon grid row element not found in addListItem");
      return;
    }

    // Create the column div for Bootstrap grid
    let col = document.createElement("div");
    // Responsive column sizing: 1 col on xs, 2 on sm, 3 on md, 5 on lg/xl
    col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-2", "mb-4", "pokemon-grid-col"); // mb-4 adds margin bottom

    // Create the card element
    let card = document.createElement("div");
    card.classList.add("card", "pokemon-card", "h-100"); // h-100 makes cards in a row equal height

    // Create card body
    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "d-flex", "flex-column", "justify-content-center", "align-items-center"); // Centering content

    // Create card title (Pokemon Name)
    let cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title", "text-center");
    cardTitle.innerText = capitalizeFirstLetter(pokemon.name);

    // Add placeholder for image (optional, could load image here too)
    // let imgPlaceholder = document.createElement('div');
    // imgPlaceholder.classList.add('pokemon-image-placeholder'); // Add styling for this

    // Append title to card body
    cardBody.appendChild(cardTitle);
    // cardBody.appendChild(imgPlaceholder); // Append placeholder if using

    // Append card body to card
    card.appendChild(cardBody);

    // Add event listener to the whole card to show details
    card.addEventListener("click", () => {
      log("info", `Card clicked for: ${pokemon.name}`);
      showDetails(pokemon);
    });
    // Add hover class for styling (optional)
    card.addEventListener('mouseenter', () => card.classList.add('hover'));
    card.addEventListener('mouseleave', () => card.classList.remove('hover'));


    // Append card to column, column to grid row
    col.appendChild(card);
    gridRow.appendChild(col);
  }


  // *** API INTERACTIONS *** (Keep existing: loadList, loadDetails, showDetails)
  // Function to load the list of Pokémon from the API or Cache
  function loadList() {
    log("info", "loadList called");
    showLoadingMessage("Loading Pokémon list...");

    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        log("info", "Found cached Pokémon list in sessionStorage.");
        pokemonList = JSON.parse(cachedData);
        renderList();
        hideLoadingMessage();
        // Fetch details for the first page in the background for smoother modal opening
        preloadDetailsForCurrentPage();
        return Promise.resolve();
      }
    } catch (e) {
      log("error", "Failed to read or parse cache", e);
      sessionStorage.removeItem(CACHE_KEY);
    }

    log("info", "No cache found or cache invalid. Fetching from API...");
    let allPokemon = [];
    const initialUrl = "https://pokeapi.co/api/v2/pokemon?limit=151"; // Adjust limit as needed

    function fetchPokemonPage(url) {
      log("info", `Fetching Pokémon page: ${url}`);
      return fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then((json) => {
          log("info", `Received ${json.results.length} Pokémon from ${url}`);
          json.results.forEach((item) => {
            allPokemon.push({
              name: item.name,
              detailsUrl: item.url,
              height: undefined,
              types: undefined,
              imageUrl: undefined
            });
          });
          if (json.next && allPokemon.length < 1000) { // Limit total fetches if desired
            return fetchPokemonPage(json.next);
          } else {
            log("info", "Finished fetching all Pokémon pages.");
            return null;
          }
        });
    }

    return fetchPokemonPage(initialUrl)
      .then(() => {
        log("info", `Total Pokémon fetched: ${allPokemon.length}`);
        pokemonList = allPokemon;

        try {
          log("info", "Caching complete Pokémon list to sessionStorage.");
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(pokemonList));
        } catch (e) {
          log("error", "Failed to cache Pokémon list", e);
        }

        renderList();
        hideLoadingMessage();
        // Fetch details for the first page in the background
        preloadDetailsForCurrentPage();
      })
      .catch((e) => {
        log("error", "Failed to load Pokémon list from API", e);
        hideLoadingMessage();
        displayErrorMessage("Could not load Pokémon data. Please try refreshing the page.");
      });
  }

  // Preload details for visible items to make modal opening faster
  function preloadDetailsForCurrentPage() {
    const items = getPageItems();
    log('info', `Preloading details for ${items.length} Pokémon on page ${currentPage}`);
    items.forEach(pokemon => {
      if (pokemon.height === undefined) { // Only preload if not already loaded
        loadDetails(pokemon).catch(e => {
          // Log error but don't block anything
          log('warn', `Background detail preload failed for ${pokemon.name}`, e);
        });
      }
    });
  }


  function loadDetails(pokemon) {
    if (pokemon.height !== undefined && pokemon.types !== undefined && pokemon.imageUrl !== undefined) {
      log('info', `Details already loaded for ${pokemon.name}`);
      return Promise.resolve();
    }

    log("info", `loadDetails called for: ${pokemon.name}`);
    // Don't show global loading message for background preloads, only for explicit clicks maybe?
    // showLoadingMessage(`Loading details for ${capitalizeFirstLetter(pokemon.name)}...`);
    let url = pokemon.detailsUrl;
    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        return response.json();
      })
      .then((details) => {
        log("info", `Details received for: ${pokemon.name}`);
        pokemon.height = details.height;
        pokemon.types = details.types.map((t) => t.type.name);
        pokemon.imageUrl = details.sprites.front_default;
        // hideLoadingMessage(); // Hide only if shown by explicit action
      })
      .catch((e) => {
        log("error", `Failed to load details for ${pokemon.name}`, e);
        // hideLoadingMessage(); // Hide only if shown by explicit action
        // Don't display error message for background preloads
        // displayErrorMessage(`Could not load details for ${capitalizeFirstLetter(pokemon.name)}.`);
        return Promise.reject(e);
      });
  }

  function showDetails(pokemon) {
    log("info", `showDetails called for: ${pokemon.name}`);
    // Show loading message specifically for this action
    showLoadingMessage(`Loading ${capitalizeFirstLetter(pokemon.name)}...`);
    loadDetails(pokemon).then(() => {
      log("info", `Showing modal for: ${pokemon.name}`);
      hideLoadingMessage(); // Hide loading message once details are ready
      showModal(pokemon);
    }).catch(e => {
      log("error", `Cannot show details because loading failed for ${pokemon.name}`, e);
      hideLoadingMessage(); // Hide loading message on error too
      displayErrorMessage(`Could not load details for ${capitalizeFirstLetter(pokemon.name)}.`);
    });
  }


  // *** UTILITY FUNCTIONS *** (Keep existing: capitalizeFirstLetter, showModal, showLoadingMessage, hideLoadingMessage, displayErrorMessage)
  function capitalizeFirstLetter(string) {
    if (typeof string !== 'string' || string.length === 0) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function showModal(pokemon) {
    log("info", `showModal called for: ${pokemon.name}`);
    if (typeof $ !== "undefined" && $.fn.modal) {
      let modalTitle = document.querySelector("#pokemonModalLabel");
      let pokemonName = document.querySelector("#pokemonName");
      let pokemonHeight = document.querySelector("#pokemonHeight");
      let pokemonImage = document.querySelector("#pokemonImage");
      let pokemonTypes = document.querySelector("#pokemonTypes");

      if (!modalTitle || !pokemonName || !pokemonHeight || !pokemonImage || !pokemonTypes) {
        log("error", "One or more modal elements not found.");
        return;
      }

      let capitalizedPokemonName = capitalizeFirstLetter(pokemon.name);

      modalTitle.innerText = capitalizedPokemonName;
      pokemonName.innerText = capitalizedPokemonName;
      pokemonHeight.innerText = `Height: ${pokemon.height ? pokemon.height / 10 + ' m' : 'N/A'}`;
      pokemonImage.src = pokemon.imageUrl ? pokemon.imageUrl : 'images/pokeball-placeholder.png'; // Use a placeholder image
      pokemonImage.alt = pokemon.imageUrl ? `Image of ${capitalizedPokemonName}` : 'Image not available';
      pokemonTypes.innerHTML = ''; // Clear previous types
      if (pokemon.types && pokemon.types.length > 0) {
        pokemonTypes.innerText = 'Types: ';
        pokemon.types.forEach(type => {
          const typeSpan = document.createElement('span');
          typeSpan.classList.add('pokemon-type', `type-${type}`); // Add type class for styling
          typeSpan.innerText = type;
          pokemonTypes.appendChild(typeSpan);
        });
      } else {
        pokemonTypes.innerText = 'Types: N/A';
      }


      $("#pokemonModal").modal("show");

      $("#pokemonModal").off('shown.bs.modal').on("shown.bs.modal", function () {
        log("info", `Modal shown for ${pokemon.name}`);
      });

      $("#pokemonModal").off('hidden.bs.modal').on("hidden.bs.modal", function () {
        log("info", `Modal hidden for ${pokemon.name}`);
      });

    } else {
      log("error", "Bootstrap modal plugin ($ or $.fn.modal) is not available");
      displayErrorMessage("Cannot display Pokémon details. Modal component is missing.");
    }
  }

  function showLoadingMessage(message = "Loading...") {
    log("info", `Showing loading message: "${message}"`);
    let loadingMessage = document.getElementById("loading-message");
    if (!loadingMessage) {
      loadingMessage = document.createElement("div");
      loadingMessage.id = "loading-message";
      loadingMessage.className = "loading-indicator"; // Use class for styling

      const spinnerContainer = document.createElement("div");
      spinnerContainer.className = "loading-box"; // Box for spinner and text

      const spinner = document.createElement("div");
      spinner.className = "spinner"; // Custom spinner (CSS defined)
      // spinner.className = "spinner-border text-light"; // Bootstrap spinner alternative

      const messageElement = document.createElement("p");
      messageElement.id = "loading-message-text";
      messageElement.className = "loading-text";
      messageElement.innerText = message;

      spinnerContainer.appendChild(spinner);
      spinnerContainer.appendChild(messageElement);
      loadingMessage.appendChild(spinnerContainer);
      document.body.appendChild(loadingMessage);
    } else {
      const messageElement = document.getElementById("loading-message-text");
      if (messageElement) messageElement.innerText = message;
      loadingMessage.style.display = "flex"; // Ensure it's visible
    }
  }

  function hideLoadingMessage() {
    log("info", "Hiding loading message");
    const loadingMessage = document.getElementById("loading-message");
    if (loadingMessage) {
      loadingMessage.style.display = "none";
    }
  }

  // Basic alert, replace with a nicer UI element (e.g., a toast or modal)
  function displayErrorMessage(message) {
    log("warn", `Displaying error to user: "${message}"`);
    alert(`Error: ${message}`);
  }


  // *** PAGINATION LOGIC *** (Keep existing: getPageItems)
  function getPageItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    log("info", `Getting items for page ${currentPage}, startIndex: ${startIndex}, endIndex: ${endIndex}`);
    return pokemonList.slice(startIndex, endIndex);
  }

  // --- CHANGE: Updated pagination control logic ---
  function updatePaginationControls() {
    const totalItems = pokemonList.length;
    const paginationControlsContainer = document.getElementById("pagination-controls"); // Get container

    if (totalItems === 0 || !paginationControlsContainer) {
      log("info", "No Pokémon data or pagination container found, hiding controls.");
      if (paginationControlsContainer) paginationControlsContainer.style.display = 'none';
      return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    log("info", `Updating pagination: Page ${currentPage}/${totalPages} (Total items: ${totalItems})`);

    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageCounter = document.getElementById("page-counter");

    if (prevPageButton) {
      prevPageButton.disabled = currentPage === 1;
    } else { log("warn", "Previous page button not found"); }

    if (nextPageButton) {
      nextPageButton.disabled = currentPage === totalPages;
    } else { log("warn", "Next page button not found"); }

    if (pageCounter) {
      pageCounter.innerText = `Page ${currentPage} of ${totalPages}`;
    } else { log("warn", "Page counter element not found"); }

    // Ensure controls are visible
    paginationControlsContainer.style.display = 'flex'; // Use flex for center alignment defined in CSS
  }

  // --- CHANGE: Added preloading trigger on page change ---
  function goToNextPage() {
    const totalPages = Math.ceil(pokemonList.length / itemsPerPage);
    if (currentPage < totalPages) {
      log("info", `Navigating to next page (Page ${currentPage + 1})`);
      currentPage++;
      renderList();
      preloadDetailsForCurrentPage(); // Preload details for the new page
      window.scrollTo(0, 0); // Scroll to top on page change
    } else {
      log("info", "Already on the last page, cannot go next.");
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      log("info", `Navigating to previous page (Page ${currentPage - 1})`);
      currentPage--;
      renderList();
      preloadDetailsForCurrentPage(); // Preload details for the new page
      window.scrollTo(0, 0); // Scroll to top on page change
    } else {
      log("info", "Already on the first page, cannot go previous.");
    }
  }

  function initializePaginationListeners() {
    log("info", "Initializing pagination listeners");
    const nextButton = document.getElementById("next-page");
    const prevButton = document.getElementById("prev-page");

    if (nextButton) {
      nextButton.addEventListener("click", goToNextPage);
    } else { log("error", "Next page button not found during listener initialization."); }

    if (prevButton) {
      prevButton.addEventListener("click", goToPrevPage);
    } else { log("error", "Previous page button not found during listener initialization."); }
  }


  // Expose public methods
  return {
    // getAll, // Expose if needed elsewhere
    // add,
    // findByName,
    loadList,
    // loadDetails, // Keep internal? Called via showDetails
    initializePaginationListeners
  };
})();

// --- Initial Setup --- (Keep existing DOMContentLoaded listener)
document.addEventListener("DOMContentLoaded", function () {
  console.log("[DOMContentLoaded] DOM fully loaded and parsed.");
  // Ensure the grid container exists
  const pokemonContainer = document.querySelector("#pokemon-container");
  if (pokemonContainer && !document.querySelector("#pokemon-grid")) {
    console.log("[Initial Setup] Creating Pokémon grid row element.");
    const grid = document.createElement("div");
    grid.className = "row"; // Bootstrap row class
    grid.id = "pokemon-grid";
    pokemonContainer.appendChild(grid);
  } else if (!pokemonContainer) {
    console.error("[Initial Setup] Pokémon container element (#pokemon-container) not found.");
  }

  pokemonRepository.initializePaginationListeners();
  pokemonRepository.loadList().then(() => {
    console.log("[DOMContentLoaded] Initial Pokémon list loaded and rendered.");
  }).catch(error => {
    console.error("[DOMContentLoaded] Error during initial loadList:", error);
  });
});