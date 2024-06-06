// IIFE to create a Pokémon repository
let pokemonRepository = (function () {
  let pokemonList = [
    {name: "Bulbasaur", height: 7, types: ["grass", "poison"]},
    {name: "Charmander", height: 6, types: ["fire"]},
    {name: "Squirtle", height: 5, types: ["water"]},
    {name: "Charizard", height: 1.7, types: ["fire", "flying"]},
    {name: "Pikachu", height: 0.4, types: ["electric"]},
    {name: "Jigglypuff", height: 0.5, types: ["fairy", "normal"]},
    {name: "Gengar", height: 1.5, types: ["ghost", "poison"]},
    {name: "Eevee", height: 0.3, types: ["normal"]},
    {name: "Snorlax", height: 2.1, types: ["normal"]},
    {name: "Mewtwo", height: 2.0, types: ["psychic"]},
    {name: "Lucario", height: 1.2, types: ["fighting", "steel"]},
    {name: "Greninja", height: 1.5, types: ["water", "dark"]},
    {name: "Dragonite", height: 2.2, types: ["dragon", "flying"]},
    {name: "Gyarados", height: 6.5, types: ["water", "flying"]},
    {name: "Lapras", height: 2.5, types: ["water", "ice"]},
    {name: "Arcanine", height: 1.9, types: ["fire"]},
  ];

  // Function to return all Pokémon
  function getAll() {
    return pokemonList;
  }

  // Function to add a new Pokémon
  function add(pokemon) {
    if (
      typeof pokemon === "object" &&
      pokemon.hasOwnProperty("name") &&
      pokemon.hasOwnProperty("height") &&
      pokemon.hasOwnProperty("types")
    ) {
      pokemonList.push(pokemon);
      renderList(); // Update the list after adding a new Pokémon
    } else {
      console.log("Invalid Pokémon data");
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
    // Clear the current list
    document.querySelector(".pokemon-list").innerHTML = "";

    // Group Pokémon by first type
    let groupedPokemon = {};
    pokemonList.forEach((pokemon) => {
      let firstType = pokemon.types[0]; // Use only the first type
      if (!groupedPokemon[firstType]) {
        groupedPokemon[firstType] = [];
      }
      groupedPokemon[firstType].push(pokemon);
    });

    // Sort each group by height, tallest to shortest
    Object.keys(groupedPokemon).forEach((type) => {
      groupedPokemon[type].sort((a, b) => b.height - a.height);
    });

    // Render the grouped and sorted Pokémon
    Object.keys(groupedPokemon).forEach((type) => {
      let typeHeader = `<h2>${
        type.charAt(0).toUpperCase() + type.slice(1)
      }</h2>`;
      document
        .querySelector(".pokemon-list")
        .insertAdjacentHTML("beforeend", typeHeader);

      groupedPokemon[type].forEach((pokemon) => {
        let typeClass = type; // Use only the current type for class

        let displayText = `<li class="${typeClass}">`;
        displayText += `${pokemon.name} (height: ${pokemon.height}`;

        // Highlight special Pokémon with height above 1.0
        if (pokemon.height > 1.0) {
          displayText += `) - <span class="big">Wow, that’s big!</span>`;
        } else {
          displayText += `) - <span class="small">That's a small one.</span>`;
        }

        displayText += `</li>`;
        document
          .querySelector(".pokemon-list")
          .insertAdjacentHTML("beforeend", displayText);
      });
    });
  }

  return {
    getAll: getAll,
    add: add,
    findByName: findByName,
    renderList: renderList,
  };
})();

// Create the initial list container
document.write('<ul class="pokemon-list"></ul>');

// Initial rendering of the list
pokemonRepository.renderList();

// ***ACTIONS***

// Adding a new Pokémon
pokemonRepository.add({
    name: "Mew",
    height: 0.4,
    types: ["psychic"]
});

// Finding a Pokémon by name (check in console)
console.log(pokemonRepository.findByName('Mew'));