// Array to hold Pokémon data
let pokemonList = [
    // First Pokémon object
    {
        name: "Bulbasaur",
        height: 7,
        types: ["grass", "poison"]
    },
    // Second Pokémon object
    {
        name: "Charmander",
        height: 6,
        types: ["fire"]
    },
    // Third Pokémon object
    {
        name: "Squirtle",
        height: 5,
        types: ["water"]
    },
    {
        name: "Charizard",
        height: 1.7,
        types: ["fire", "flying"]
    },
    {
        name: "Pikachu",
        height: 0.4,
        types: ["electric"]
    },
    {
        name: "Jigglypuff",
        height: 0.5,
        types: ["fairy", "normal"]
    },
    {
        name: "Gengar",
        height: 1.5,
        types: ["ghost", "poison"]
    },
    {
        name: "Eevee",
        height: 0.3,
        types: ["normal"]
    },
    {
        name: "Snorlax",
        height: 2.1,
        types: ["normal"]
    },
    {
        name: "Mewtwo",
        height: 2.0,
        types: ["psychic"]
    },
    {
        name: "Lucario",
        height: 1.2,
        types: ["fighting", "steel"]
    },
    {
        name: "Greninja",
        height: 1.5,
        types: ["water", "dark"]
    },
    {
        name: "Dragonite",
        height: 2.2,
        types: ["dragon", "flying"]
    },
    {
        name: "Gyarados",
        height: 6.5,
        types: ["water", "flying"]
    },
    {
        name: "Lapras",
        height: 2.5,
        types: ["water", "ice"]
    },
    {
        name: "Arcanine",
        height: 1.9,
        types: ["fire"]
    }
];

// Iterate over each Pokémon in the list
document.write('<ul class="pokemon-list">');
for (let i = 0; i < pokemonList.length; i++) {
    let pokemon = pokemonList[i];
    let displayText = `<li>${pokemon.name} (height: ${pokemon.height}`;

    // Highlight special Pokémon with height above 1.0
    if (pokemon.height > 1.0) {
        displayText += `) - <span class="big">Wow, that’s big!</span>`;
    } else {
        displayText += `) - <span class="small">That's a small one.</span>`;
    }

    displayText += `</li>`;
    document.write(displayText);
}
document.write('</ul>');