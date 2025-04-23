#  Pokédex Web Application ϞϞ(๑⚈ ․̫ ⚈๑)∩

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) <!-- Example License Badge -->
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-brightgreen)](https://jf8989.github.io/pokedex-app/) <!-- Example Deployment Badge -->
<!-- Add other badges here if you set up CI/CD, code coverage, etc. -->
<!-- e.g., [![Build Status](https://img.shields.io/travis/com/your-username/your-repo.svg)](https://travis-ci.com/your-username/your-repo) -->
<!-- e.g., [![Code Coverage](https://img.shields.io/codecov/c/github/your-username/your-repo.svg)](https://codecov.io/gh/your-username/your-repo) -->

---

<p align="center">
  <img src="images/pokedex.jpg" alt="Pokédex Screenshot" width="70%"> 
  <br>
</p>

---

Welcome to a dynamic and interactive **Pokédex** web application! 📱💻 Built with vanilla JavaScript, jQuery, and Bootstrap, this app fetches data from the [PokeAPI](https://pokeapi.co/) ☁️ to display a list of Pokémon and allows users to view detailed information about each one. Gotta catch 'em all! 🔴⚪

## ✨ Features

*   **Browse Pokémon:** Displays a list of Pokémon fetched live from the PokeAPI.
*   **Pagination:** Smoothly navigate through the Pokémon list (100 per page). ⬅️➡️
*   **Detailed View:** Click on any Pokémon for an informative modal popup (image, height, types). ℹ️
*   **Client-Side Caching:** Pokémon list data is cached in `sessionStorage` for faster loads during the same session. ⚡
*   **Loading Indicator:** A friendly spinner lets you know data is being fetched. ⏳
*   **Responsive Design:** Looks great on desktops, tablets, and phones thanks to Bootstrap. 📐
*   **Clean Styling:** Uses Bootstrap components enhanced with custom CSS. 🎨

## 🚀 Live Demo

Experience the Pokédex live:

➡️ **[https://jf8989.github.io/pokedex-app/](https://jf8989.github.io/pokedex-app/)** ⬅️

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Libraries/Frameworks:**
    *   [Bootstrap 4.5](https://getbootstrap.com/docs/4.5/) `(Layout & Components)`
    *   [jQuery 3.5](https://jquery.com/) `(Bootstrap Dependency)`
    *   [Polyfill.io](https://polyfill.io/) `(Browser Compatibility)`
*   **API:** [PokeAPI v2](https://pokeapi.co/docs/v2) `(Pokémon Data Source)`
*   **Development Tools:**
    *   [ESLint](https://eslint.org/) `(Code Linting)`
    *   [Prettier](https://prettier.io/) `(Code Formatting)`
    *   [clean-css-cli](https://github.com/clean-css/clean-css-cli) `(CSS Minification)`
    *   [uglify-js](https://github.com/mishoo/UglifyJS) `(JavaScript Minification)`

---

## ⚙️ Installation & Setup

Get this project running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/jf8989/pokedex-app.git
    cd pokedex-app
    ```
2.  **Install Dev Dependencies (Optional):**
    (Requires [Node.js](https://nodejs.org/) & npm) - Needed for linting, formatting, and building minified files.
    ```bash
    npm install
    ```
3.  **Launch the App:**
    Simply open the `index.html` file in your favorite web browser! 🎉

## 📖 Usage Guide

1.  **Loading:** The app automatically fetches and displays the first page of Pokémon.
2.  **Navigation:** Use the **« Previous** and **Next »** buttons (fixed on the sides) to browse pages.
3.  **View Details:** Click any Pokémon's button.
4.  **Modal:** A pop-up shows the Pokémon's name, image, height (meters), and types.
5.  **Close Modal:** Click "Close" or anywhere outside the modal content.

---

## 🏗️ Development & Building

### Project Structure

```
pokedex-app/
├── css/
│   └── styles.css         # 🎨 Main custom styles
├── dist/
│   ├── app.min.js         # 📦 Minified JavaScript
│   └── styles.min.css     # 📦 Minified CSS
├── images/
│   ├── background_1.png   # 🖼️ Background image
│   └── screenshot.png     # 🖼️ App screenshot (ADD ME!)
├── js/
│   └── scripts.js         # 📜 Main application JavaScript
├── .eslint.config.js      # ⚙️ ESLint configuration
├── .gitignore             # 🚫 Git ignore rules (ADD ME!)
├── index.html             # 📄 Main HTML file
├── package.json           # 📦 Project config & dependencies
├── package-lock.json      # 🔒 Dependency lock file
└── README.md              # ⭐ This awesome file
```

### Useful npm Scripts (via `package.json`)

```json
// package.json excerpt
"scripts": {
  "minify:css": "cleancss -o dist/styles.min.css css/styles.css",
  "minify:js": "uglifyjs js/scripts.js -o dist/app.min.js -c -m",
  "build": "npm run minify:css && npm run minify:js",
  "lint": "eslint js/**/*.js",
  "format": "prettier --write ."
}
```

*   `npm run lint`: ✅ Check JavaScript code quality.
*   `npm run format`: ✨ Automatically format code.
*   `npm run build`: 📦 Create minified CSS and JS files in `dist/`.

> **Remember:** Ensure `index.html` links to the minified files (`dist/styles.min.css` & `dist/app.min.js`) for deployment.
---

## 🙌 Contributing

Got ideas or found a bug? Contributions are welcome!

1.  **Fork** the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📜 License

This project is licensed under the **MIT License**.
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*(Feel free to replace the MIT license if you prefer another one)*