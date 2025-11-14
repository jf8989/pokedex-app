/* eslint-disable no-unused-vars */
/* global $ */
// js/scripts.js - Enhanced Stunning UI with Infinite Scroll
let pokemonRepository = (function () {
  let pokemonList = [];
  let filteredList = [];
  let searchActive = false;
  let isLoading = false;
  let currentOffset = 0;
  const BATCH_SIZE = 50;
  const TOTAL_POKEMON = 1302; // Updated as of Gen 9
  const CACHE_KEY = "pokemonAllCache";
  let observer = null;

  const logGroup = "PokemonRepository";
  const log = (level, ...args) => {
    const timestamp = new Date().toISOString();
    console[level](`[${timestamp}] [${logGroup}]`, ...args);
  };
  log("info", "Repository initialized");

  // === DARK MODE ===
  function initializeDarkMode() {
    const toggleBtn = document.getElementById("dark-mode-toggle");
    if (!toggleBtn) return;

    // Check saved preference or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    toggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  // === PASTEL GRADIENT GENERATOR ===
  function generatePastelGradient(types) {
    const typeColorMap = {
      normal: [168, 167, 122],
      fire: [238, 129, 48],
      water: [99, 144, 240],
      electric: [247, 208, 44],
      grass: [122, 199, 76],
      ice: [150, 217, 214],
      fighting: [194, 46, 40],
      poison: [163, 62, 161],
      ground: [226, 191, 101],
      flying: [169, 143, 243],
      psychic: [249, 85, 135],
      bug: [166, 185, 26],
      rock: [182, 161, 54],
      ghost: [115, 87, 151],
      dragon: [111, 53, 252],
      dark: [112, 87, 70],
      steel: [183, 183, 206],
      fairy: [214, 133, 173],
    };

    if (!types || types.length === 0) {
      return "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
    }

    // Convert type colors to pastel by blending with white
    const makePastel = (rgb) => {
      return rgb.map((c) => Math.round(c + (255 - c) * 0.6));
    };

    const color1 = typeColorMap[types[0]] || [200, 200, 200];
    const pastelColor1 = makePastel(color1);

    if (types.length === 1) {
      const lighterColor = pastelColor1.map((c) =>
        Math.min(255, c + 20)
      );
      return `linear-gradient(135deg, rgb(${pastelColor1.join(",")}), rgb(${lighterColor.join(",")}))`;
    }

    const color2 = typeColorMap[types[1]];
    const pastelColor2 = makePastel(color2);
    return `linear-gradient(135deg, rgb(${pastelColor1.join(",")}), rgb(${pastelColor2.join(",")}))`;
  }

  // === DATA MANAGEMENT ===
  function getAll() {
    return pokemonList;
  }

  function getCurrentList() {
    return searchActive ? filteredList : pokemonList;
  }

  function findByName(name) {
    return pokemonList.find((p) => p.name.toLowerCase() === name.toLowerCase());
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

      renderFilteredList();

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
    document.getElementById("clear-search").style.display = "none";
    document.getElementById("search-results-info").style.display = "none";
    document.getElementById("no-results").style.display = "none";
    renderAllLoaded();
  }

  function renderFilteredList() {
    const pokemonGridElement = document.querySelector("#pokemon-grid");
    if (!pokemonGridElement) return;

    pokemonGridElement.innerHTML = "";
    filteredList.forEach((pokemon) => {
      addListItem(pokemon);
    });
  }

  function renderAllLoaded() {
    const pokemonGridElement = document.querySelector("#pokemon-grid");
    if (!pokemonGridElement) return;

    pokemonGridElement.innerHTML = "";
    pokemonList.forEach((pokemon) => {
      addListItem(pokemon);
    });
  }

  // === DOM RENDERING ===
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

    // Apply pastel gradient background
    if (pokemon.types && pokemon.types.length > 0) {
      card.style.background = generatePastelGradient(pokemon.types);
    }

    // Pokemon number badge
    const numberBadge = document.createElement("span");
    numberBadge.classList.add("pokemon-number-badge");
    const pokemonId = extractIdFromUrl(pokemon.detailsUrl);
    numberBadge.innerText = `#${pokemonId.toString().padStart(4, "0")}`;

    // Create card body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-center");

    // Add Pokemon image
    const img = document.createElement("img");
    img.classList.add("pokemon-image-preview");
    img.alt = pokemon.name;
    img.src = pokemon.imageUrl || "images/pokeball.png";

    // Add loading class if details not loaded
    if (!pokemon.imageUrl || !pokemon.types) {
      card.classList.add("loading");
      loadImageForCard(pokemon, img, card);
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
  function loadNextBatch() {
    if (isLoading || currentOffset >= TOTAL_POKEMON) {
      if (currentOffset >= TOTAL_POKEMON) {
        hideLoadingMore();
      }
      return Promise.resolve();
    }

    isLoading = true;
    showLoadingMore();

    return fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${BATCH_SIZE}&offset=${currentOffset}`
    )
      .then((response) => response.json())
      .then((json) => {
        const newPokemon = json.results.map((item) => ({
          name: item.name,
          detailsUrl: item.url,
        }));

        pokemonList = [...pokemonList, ...newPokemon];
        currentOffset += BATCH_SIZE;

        // Render new items only if not searching
        if (!searchActive) {
          newPokemon.forEach((pokemon) => {
            addListItem(pokemon);
          });
        }

        // Cache the full list
        try {
          const cacheData = {
            list: pokemonList,
            offset: currentOffset,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
          log("warn", "Failed to cache data", e);
        }

        isLoading = false;
        hideLoadingMore();

        // If we haven't reached the end, keep observing
        if (currentOffset < TOTAL_POKEMON) {
          setupInfiniteScroll();
        }
      })
      .catch((e) => {
        log("error", "Failed to load batch", e);
        isLoading = false;
        hideLoadingMore();
        displayErrorMessage("Could not load more Pokémon. Please try again.");
      });
  }

  function loadImageForCard(pokemon, imgElement, cardElement) {
    if (pokemon.imageUrl) {
      cardElement.classList.remove("loading");
      return;
    }

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

        if (cardElement) {
          cardElement.classList.remove("loading");
          // Apply pastel gradient after types are loaded
          if (pokemon.types && pokemon.types.length > 0) {
            cardElement.style.background = generatePastelGradient(pokemon.types);
          }
        }
      })
      .catch((e) => {
        log("warn", `Failed to load image for ${pokemon.name}`, e);
        if (cardElement) {
          cardElement.classList.remove("loading");
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
    const visited = new Set();

    async function processEvolution(node, depth = 0) {
      const speciesId = extractIdFromUrl(node.species.url);
      const speciesKey = `${node.species.name}-${speciesId}`;

      // Avoid duplicates
      if (visited.has(speciesKey)) return;
      visited.add(speciesKey);

      try {
        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${speciesId}`
        );
        const pokemonData = await pokemonRes.json();

        evolutions.push({
          id: speciesId,
          name: node.species.name,
          image:
            pokemonData.sprites.other["official-artwork"].front_default ||
            pokemonData.sprites.front_default,
          level: node.evolution_details[0]?.min_level || null,
          trigger: node.evolution_details[0]?.trigger.name || null,
          item: node.evolution_details[0]?.item?.name || null,
          depth: depth,
        });
      } catch (e) {
        log("warn", `Failed to load evolution: ${node.species.name}`, e);
      }

      // Process all evolution branches
      if (node.evolves_to && node.evolves_to.length > 0) {
        for (const evolution of node.evolves_to) {
          await processEvolution(evolution, depth + 1);
        }
      }
    }

    await processEvolution(chain);
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
      .padStart(4, "0")}`;

    // Title and name
    const pokemonName = capitalizeFirstLetter(data.name);
    document.getElementById("pokemonModalLabel").innerText = pokemonName;
    document.getElementById("pokemonName").innerText = pokemonName;

    // Apply pastel gradient to modal header
    const types = data.types.map((t) => t.type.name);
    const modalHeader = document.querySelector(".pokemon-modal-header");
    if (modalHeader && types.length > 0) {
      const gradient = generatePastelGradient(types);
      modalHeader.style.background = gradient;
    }

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

      // Group evolutions by depth
      const groupedByDepth = {};
      data.evolutionChain.forEach((evo) => {
        if (!groupedByDepth[evo.depth]) {
          groupedByDepth[evo.depth] = [];
        }
        groupedByDepth[evo.depth].push(evo);
      });

      const depths = Object.keys(groupedByDepth).sort();
      const currentPokemonName = data.name.toLowerCase();

      depths.forEach((depth, depthIndex) => {
        const evosAtDepth = groupedByDepth[depth];

        evosAtDepth.forEach((evo, evoIndex) => {
          // Evolution item
          const evoItem = document.createElement("div");
          evoItem.classList.add("evolution-item");
          evoItem.setAttribute("data-pokemon-name", evo.name);

          // Check if this is the current Pokemon
          const isCurrentPokemon = evo.name.toLowerCase() === currentPokemonName;

          if (!isCurrentPokemon) {
            evoItem.setAttribute("role", "button");
            evoItem.setAttribute("tabindex", "0");
            evoItem.setAttribute("aria-label", `View ${evo.name} details`);
          } else {
            evoItem.classList.add("current-pokemon");
            evoItem.style.borderColor = "var(--primary-color)";
            evoItem.style.borderWidth = "3px";
          }

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

          // Make evolution clickable only if it's not the current Pokemon
          if (!isCurrentPokemon) {
            evoItem.addEventListener("click", () => {
              const pokemon = findByName(evo.name);
              if (pokemon) {
                $("#pokemonModal").modal("hide");
                // Small delay to allow modal to hide
                setTimeout(() => showDetails(pokemon), 300);
              }
            });

            evoItem.addEventListener("keypress", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const pokemon = findByName(evo.name);
                if (pokemon) {
                  $("#pokemonModal").modal("hide");
                  setTimeout(() => showDetails(pokemon), 300);
                }
              }
            });
          }

          evolutionDiv.appendChild(evoItem);

          // Add separator between evolutions at the same depth
          if (evoIndex < evosAtDepth.length - 1) {
            const separator = document.createElement("span");
            separator.classList.add("evolution-arrow");
            separator.innerHTML = "•";
            separator.style.fontSize = "1.5rem";
            separator.style.color = "#999";
            separator.style.padding = "0 0.5rem";
            evolutionDiv.appendChild(separator);
          }
        });

        // Add arrow between different depths
        if (depthIndex < depths.length - 1) {
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

  // === INFINITE SCROLL ===
  function setupInfiniteScroll() {
    const loadingMoreElement = document.getElementById("loading-more");
    if (!loadingMoreElement) return;

    // Disconnect existing observer
    if (observer) {
      observer.disconnect();
    }

    // Create intersection observer
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoading && !searchActive) {
            loadNextBatch();
          }
        });
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(loadingMoreElement);
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

  function showLoadingMore() {
    const loadingMore = document.getElementById("loading-more");
    if (loadingMore) {
      loadingMore.classList.add("visible");
    }
  }

  function hideLoadingMore() {
    const loadingMore = document.getElementById("loading-more");
    if (loadingMore) {
      loadingMore.classList.remove("visible");
    }
  }

  function displayErrorMessage(message) {
    alert(`Error: ${message}`);
  }

  // === PUBLIC API ===
  return {
    loadNextBatch,
    initializeSearch,
    initializeDarkMode,
    setupInfiniteScroll,
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

  // Initialize features
  pokemonRepository.initializeDarkMode();
  pokemonRepository.initializeSearch();

  // Load first batch
  pokemonRepository
    .loadNextBatch()
    .then(() => {
      console.log("[Pokédex] First batch loaded!");
      pokemonRepository.setupInfiniteScroll();
    })
    .catch((error) => {
      console.error("[Pokédex] Initialization error:", error);
    });
});
