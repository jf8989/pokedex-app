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
    }
];

// Iterate over each Pokémon in the list
for (let i = 0; i < pokemonList.length; i++) {
    let pokemon = pokemonList[i];
    let displayText = `<p>${pokemon.name} (height: ${pokemon.height})`;

    // Highlight special Pokémon with height above 1.0
    if (pokemon.height > 1.0) {
        displayText += " - Wow, that’s big!";
    }

    displayText += "</p>";
    document.write(displayText);
}