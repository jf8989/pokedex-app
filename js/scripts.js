/* eslint-disable no-unused-vars */
/* global $ */
// js/scripts.js - Enhanced Stunning UI Version
let pokemonRepository = (function () {
  let pokemonList = [];
  let filteredList = [];
  let currentPage = 1;
  const itemsPerPage = 12;
  const CACHE_KEY = "pokemonListCache";
  let searchActive = false;

  const logGroup = "PokemonRepository";
  const log = (level, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${logGroup}]`, ...args);
  };
  log("info", "Repository initialized");

  // === DATA MANAGEMENT ===
  function getAll() {
    return pokemonList;
  }

  function getCurrentList() {
    return searchActive ? filteredList : pokemonList;
  }

  // === SEARCH FUNCTIONALITY ===
  function initializeSearch() {
    const searchInput = document.getElementById("pokemon-search");
    const clearBtn = document.getElementById("clear-search");
    const resultsInfo = document.getElementById("search-results-info");
    const noResults = document.getElementById("no-results");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();

      if (query === "") {
        clearSearch();
        return;
      }

      searchActive = true;
      filteredList = pokemonList.filter((p) =>
        p.name.toLowerCase().includes(query)
      );

      currentPage = 1;
      renderList();

      // Show/hide clear button
      clearBtn.style.display = "block";

      // Show results info or no results
      if (filteredList.length > 0) {
        resultsInfo.style.display = "block";
        noResults.style.display = "none";
        const infoText = resultsInfo.querySelector(".search-info-text");
        infoText.innerHTML = `Found <span>${filteredList.length}</span> Pokémon matching "${e.target.value}"`;
      } else {
        resultsInfo.style.display = "none";
        noResults.style.display = "block";
        document.getElementById("pokemon-grid").innerHTML = "";
      }
    });

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearSearch();
    });
  }

  function clearSearch() {
    searchActive = false;
    filteredList = [];
    currentPage = 1;
    document.getElementById("clear-search").style.display = "none";
    document.getElementById("search-results-info").style.display = "none";
    document.getElementById("no-results").style.display = "none";
    renderList();
  }

  // === DOM RENDERING ===
  function renderList() {
    const pokemonGridElement = document.querySelector("#pokemon-grid");
    if (!pokemonGridElement) {
      log("error", "Pokemon grid element not found");
      return;
    }

    pokemonGridElement.innerHTML = "";
    const currentList = getCurrentList();
    const pageItems = getPageItems();

    pageItems.forEach((pokemon) => {
      addListItem(pokemon);
    });

    updatePaginationControls();

    // Hide pagination if searching with few results
    const paginationControls = document.getElementById("pagination-controls");
    if (searchActive && currentList.length <= itemsPerPage) {
      paginationControls.style.display = "none";
    } else {
      paginationControls.style.display = "flex";
    }
  }

  function addListItem(pokemon) {
    const gridRow = document.querySelector("#pokemon-grid");
    if (!gridRow) return;

    // Create column
    const col = document.createElement("div");
    col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-2", "mb-4");

    // Create card
    const card = document.createElement("div");
    card.classList.add("card", "pokemon-card", "h-100");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `View details for ${pokemon.name}`);

    // Pokemon number badge
    const numberBadge = document.createElement("span");
    numberBadge.classList.add("pokemon-number-badge");
    const pokemonId = extractIdFromUrl(pokemon.detailsUrl);
    numberBadge.innerText = `#${pokemonId.toString().padStart(3, "0")}`;

    // Create card body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-center");

    // Add Pokemon image
    const img = document.createElement("img");
    img.classList.add("pokemon-image-preview");
    img.alt = pokemon.name;
    img.src = pokemon.imageUrl || "images/pokeball.png";
    // Lazy load if not preloaded
    if (!pokemon.imageUrl) {
      loadImageForCard(pokemon, img);
    }

    // Pokemon name
    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.innerText = capitalizeFirstLetter(pokemon.name);

    // Type badges
    const typesDiv = document.createElement("div");
    if (pokemon.types && pokemon.types.length > 0) {
      pokemon.types.forEach((type) => {
        const typeBadge = document.createElement("span");
        typeBadge.classList.add("pokemon-type-badge", `type-${type}`);
        typeBadge.innerText = type;
        typesDiv.appendChild(typeBadge);
      });
    }

    // Append elements
    cardBody.appendChild(img);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(typesDiv);

    card.appendChild(numberBadge);
    card.appendChild(cardBody);

    // Event listeners
    card.addEventListener("click", () => showDetails(pokemon));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showDetails(pokemon);
      }
    });

    col.appendChild(card);
    gridRow.appendChild(col);
  }

  // === API INTERACTIONS ===
  function loadList() {
    showLoadingMessage("Loading Pokédex...");

    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        pokemonList = JSON.parse(cachedData);
        renderList();
        hideLoadingMessage();
        preloadDetailsForCurrentPage();
        return Promise.resolve();
      }
    } catch (e) {
      log("error", "Cache error", e);
      sessionStorage.removeItem(CACHE_KEY);
    }

    return fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then((response) => response.json())
      .then((json) => {
        pokemonList = json.results.map((item) => ({
          name: item.name,
          detailsUrl: item.url,
        }));

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(pokemonList));
        renderList();
        hideLoadingMessage();
        preloadDetailsForCurrentPage();
      })
      .catch((e) => {
        log("error", "Failed to load list", e);
        hideLoadingMessage();
        displayErrorMessage("Could not load Pokémon. Please refresh.");
      });
  }

  function loadImageForCard(pokemon, imgElement) {
    if (pokemon.imageUrl) return;

    fetch(pokemon.detailsUrl)
      .then((res) => res.json())
      .then((data) => {
        pokemon.imageUrl =
          data.sprites.other["official-artwork"].front_default ||
          data.sprites.front_default;
        pokemon.types = data.types.map((t) => t.type.name);
        if (imgElement && pokemon.imageUrl) {
          imgElement.src = pokemon.imageUrl;
        }
      })
      .catch((e) => log("warn", `Failed to load image for ${pokemon.name}`, e));
  }

  function preloadDetailsForCurrentPage() {
    const items = getPageItems();
    items.forEach((pokemon) => {
      if (!pokemon.imageUrl) {
        loadImageForCard(pokemon);
      }
    });
  }

  async function loadFullDetails(pokemon) {
    try {
      // Load Pokemon details
      const pokemonRes = await fetch(pokemon.detailsUrl);
      const pokemonData = await pokemonRes.json();

      // Load species data for descriptions and evolution chain
      const speciesRes = await fetch(pokemonData.species.url);
      const speciesData = await speciesRes.json();

      // Load evolution chain
      let evolutionChain = [];
      if (speciesData.evolution_chain) {
        const evolutionRes = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionRes.json();
        evolutionChain = await parseEvolutionChain(evolutionData.chain);
      }

      return {
        ...pokemonData,
        species: speciesData,
        evolutionChain: evolutionChain,
      };
    } catch (e) {
      log("error", `Failed to load full details for ${pokemon.name}`, e);
      throw e;
    }
  }

  async function parseEvolutionChain(chain) {
    const evolutions = [];
    let current = chain;

    while (current) {
      const speciesId = extractIdFromUrl(current.species.url);
      try {
        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${speciesId}`
        );
        const pokemonData = await pokemonRes.json();

        evolutions.push({
          id: speciesId,
          name: current.species.name,
          image:
            pokemonData.sprites.other["official-artwork"].front_default ||
            pokemonData.sprites.front_default,
          level: current.evolution_details[0]?.min_level || null,
          trigger: current.evolution_details[0]?.trigger.name || null,
          item: current.evolution_details[0]?.item?.name || null,
        });
      } catch (e) {
        log("warn", `Failed to load evolution: ${current.species.name}`, e);
      }

      current = current.evolves_to[0] || null;
    }

    return evolutions;
  }

  function showDetails(pokemon) {
    showLoadingMessage(`Loading ${capitalizeFirstLetter(pokemon.name)}...`);

    loadFullDetails(pokemon)
      .then((data) => {
        hideLoadingMessage();
        showModal(data);
      })
      .catch((e) => {
        hideLoadingMessage();
        displayErrorMessage(`Could not load details for ${pokemon.name}`);
      });
  }

  // === MODAL ===
  function showModal(data) {
    if (typeof $ === "undefined" || !$.fn.modal) {
      displayErrorMessage("Modal component not available");
      return;
    }

    // Pokemon number
    document.getElementById("pokemonNumber").innerText = `#${data.id
      .toString()
      .padStart(3, "0")}`;

    // Title and name
    const pokemonName = capitalizeFirstLetter(data.name);
    document.getElementById("pokemonModalLabel").innerText = pokemonName;
    document.getElementById("pokemonName").innerText = pokemonName;

    // Genus
    const genusEntry = data.species.genera.find((g) => g.language.name === "en");
    document.getElementById("pokemonGenus").innerText = genusEntry
      ? genusEntry.genus
      : "";

    // Badges (Legendary/Mythical)
    const badgesDiv = document.getElementById("pokemonBadges");
    badgesDiv.innerHTML = "";
    if (data.species.is_legendary) {
      badgesDiv.innerHTML += '<span class="badge-legendary">⭐ Legendary</span>';
    }
    if (data.species.is_mythical) {
      badgesDiv.innerHTML += '<span class="badge-mythical">✨ Mythical</span>';
    }

    // Image and sprite toggle
    const pokemonImage = document.getElementById("pokemonImage");
    const defaultImage =
      data.sprites.other["official-artwork"].front_default ||
      data.sprites.front_default;
    pokemonImage.src = defaultImage;

    setupSpriteToggle(data.sprites, pokemonImage);

    // Types
    const typesDiv = document.getElementById("pokemonTypes");
    typesDiv.innerHTML = "";
    data.types.forEach((typeInfo) => {
      const typeBadge = document.createElement("span");
      typeBadge.classList.add("pokemon-type-badge", `type-${typeInfo.type.name}`);
      typeBadge.innerText = typeInfo.type.name;
      typesDiv.appendChild(typeBadge);
    });

    // Description
    const descEntry = data.species.flavor_text_entries.find(
      (entry) => entry.language.name === "en"
    );
    if (descEntry) {
      document.getElementById("pokemonDescriptionSection").style.display =
        "block";
      document.getElementById("pokemonDescription").innerText =
        descEntry.flavor_text.replace(/\f/g, " ");
    } else {
      document.getElementById("pokemonDescriptionSection").style.display = "none";
    }

    // Height and Weight
    document.getElementById("pokemonHeight").innerText = `${(data.height / 10).toFixed(1)} m`;
    document.getElementById("pokemonWeight").innerText = `${(data.weight / 10).toFixed(1)} kg`;

    // Abilities
    if (data.abilities && data.abilities.length > 0) {
      document.getElementById("pokemonAbilitiesSection").style.display = "block";
      const abilitiesDiv = document.getElementById("pokemonAbilities");
      abilitiesDiv.innerHTML = "";
      data.abilities.forEach((abilityInfo) => {
        const abilityBadge = document.createElement("span");
        abilityBadge.classList.add("ability-badge");
        abilityBadge.innerText = abilityInfo.ability.name.replace("-", " ");
        abilitiesDiv.appendChild(abilityBadge);
      });
    } else {
      document.getElementById("pokemonAbilitiesSection").style.display = "none";
    }

    // Stats
    if (data.stats && data.stats.length > 0) {
      document.getElementById("pokemonStatsSection").style.display = "block";
      const statsDiv = document.getElementById("pokemonStats");
      statsDiv.innerHTML = "";
      data.stats.forEach((statInfo) => {
        const statRow = document.createElement("div");
        statRow.classList.add("stat-row");

        const statLabel = document.createElement("div");
        statLabel.classList.add("stat-label");
        statLabel.innerHTML = `<span>${statInfo.stat.name.replace("-", " ")}</span><span class="stat-value">${statInfo.base_stat}</span>`;

        const statBar = document.createElement("div");
        statBar.classList.add("stat-bar");

        const statFill = document.createElement("div");
        statFill.classList.add("stat-fill");
        const percentage = (statInfo.base_stat / 255) * 100;
        statFill.style.width = `${percentage}%`;

        statBar.appendChild(statFill);
        statRow.appendChild(statLabel);
        statRow.appendChild(statBar);
        statsDiv.appendChild(statRow);
      });
    } else {
      document.getElementById("pokemonStatsSection").style.display = "none";
    }

    // Evolution Chain
    if (data.evolutionChain && data.evolutionChain.length > 1) {
      document.getElementById("pokemonEvolutionSection").style.display = "block";
      const evolutionDiv = document.getElementById("pokemonEvolution");
      evolutionDiv.innerHTML = "";

      data.evolutionChain.forEach((evo, index) => {
        // Evolution item
        const evoItem = document.createElement("div");
        evoItem.classList.add("evolution-item");

        const evoImg = document.createElement("img");
        evoImg.classList.add("evolution-image");
        evoImg.src = evo.image;
        evoImg.alt = evo.name;

        const evoName = document.createElement("div");
        evoName.classList.add("evolution-name");
        evoName.innerText = capitalizeFirstLetter(evo.name);

        evoItem.appendChild(evoImg);
        evoItem.appendChild(evoName);

        if (evo.level) {
          const evoLevel = document.createElement("div");
          evoLevel.classList.add("evolution-level");
          evoLevel.innerText = `Lv. ${evo.level}`;
          evoItem.appendChild(evoLevel);
        } else if (evo.item) {
          const evoLevel = document.createElement("div");
          evoLevel.classList.add("evolution-level");
          evoLevel.innerText = evo.item.replace("-", " ");
          evoItem.appendChild(evoLevel);
        }

        evolutionDiv.appendChild(evoItem);

        // Add arrow between evolutions
        if (index < data.evolutionChain.length - 1) {
          const arrow = document.createElement("span");
          arrow.classList.add("evolution-arrow");
          arrow.innerHTML = "→";
          evolutionDiv.appendChild(arrow);
        }
      });
    } else {
      document.getElementById("pokemonEvolutionSection").style.display = "none";
    }

    $("#pokemonModal").modal("show");
  }

  function setupSpriteToggle(sprites, imgElement) {
    const spriteToggle = document.getElementById("spriteToggle");
    spriteToggle.innerHTML = "";

    const spriteOptions = [
      {
        label: "Official",
        url: sprites.other["official-artwork"].front_default,
      },
      {
        label: "Shiny",
        url: sprites.other["official-artwork"].front_shiny,
      },
      { label: "Normal", url: sprites.front_default },
      { label: "Shiny Sprite", url: sprites.front_shiny },
      { label: "Female", url: sprites.front_female },
      { label: "Shiny Female", url: sprites.front_shiny_female },
    ];

    spriteOptions.forEach((option, index) => {
      if (option.url) {
        const btn = document.createElement("button");
        btn.classList.add("sprite-btn");
        if (index === 0) btn.classList.add("active");
        btn.innerText = option.label;
        btn.addEventListener("click", () => {
          imgElement.src = option.url;
          spriteToggle
            .querySelectorAll(".sprite-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
        spriteToggle.appendChild(btn);
      }
    });
  }

  // === UTILITY FUNCTIONS ===
  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function extractIdFromUrl(url) {
    const matches = url.match(/\/(\d+)\//);
    return matches ? parseInt(matches[1]) : 0;
  }

  function showLoadingMessage(message = "Loading...") {
    let loadingMessage = document.getElementById("loading-message");
    if (!loadingMessage) {
      loadingMessage = document.createElement("div");
      loadingMessage.id = "loading-message";
      loadingMessage.className = "loading-indicator";

      const spinnerContainer = document.createElement("div");
      spinnerContainer.className = "loading-box";

      const spinner = document.createElement("div");
      spinner.className = "spinner";

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
      loadingMessage.style.display = "flex";
    }
  }

  function hideLoadingMessage() {
    const loadingMessage = document.getElementById("loading-message");
    if (loadingMessage) {
      loadingMessage.style.display = "none";
    }
  }

  function displayErrorMessage(message) {
    alert(`Error: ${message}`);
  }

  // === PAGINATION ===
  function getPageItems() {
    const currentList = getCurrentList();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentList.slice(startIndex, endIndex);
  }

  function updatePaginationControls() {
    const currentList = getCurrentList();
    const totalItems = currentList.length;
    const paginationControlsContainer = document.getElementById(
      "pagination-controls"
    );

    if (totalItems === 0 || !paginationControlsContainer) {
      if (paginationControlsContainer)
        paginationControlsContainer.style.display = "none";
      return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageCounter = document.getElementById("page-counter");

    if (prevPageButton) {
      prevPageButton.disabled = currentPage === 1;
    }

    if (nextPageButton) {
      nextPageButton.disabled = currentPage === totalPages;
    }

    if (pageCounter) {
      pageCounter.innerText = `Page ${currentPage} of ${totalPages}`;
    }

    paginationControlsContainer.style.display = "flex";
  }

  function goToNextPage() {
    const currentList = getCurrentList();
    const totalPages = Math.ceil(currentList.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderList();
      preloadDetailsForCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderList();
      preloadDetailsForCurrentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function initializePaginationListeners() {
    const nextButton = document.getElementById("next-page");
    const prevButton = document.getElementById("prev-page");

    if (nextButton) {
      nextButton.addEventListener("click", goToNextPage);
    }

    if (prevButton) {
      prevButton.addEventListener("click", goToPrevPage);
    }
  }

  // === PUBLIC API ===
  return {
    loadList,
    initializePaginationListeners,
    initializeSearch,
  };
})();

// === INITIALIZATION ===
document.addEventListener("DOMContentLoaded", function () {
  console.log("[Pokédex] Initializing...");

  const pokemonContainer = document.querySelector("#pokemon-container");
  if (pokemonContainer && !document.querySelector("#pokemon-grid")) {
    const grid = document.createElement("div");
    grid.className = "row";
    grid.id = "pokemon-grid";
    pokemonContainer.appendChild(grid);
  }

  pokemonRepository.initializePaginationListeners();
  pokemonRepository.initializeSearch();
  pokemonRepository
    .loadList()
    .then(() => {
      console.log("[Pokédex] Ready!");
    })
    .catch((error) => {
      console.error("[Pokédex] Initialization error:", error);
    });
});
