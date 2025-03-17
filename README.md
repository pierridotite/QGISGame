# QGIS Warm-Up Card Game

A simple and interactive card game built with React and Tailwind CSS to help users practice QGIS workflows. Players complete a chain of processing steps by dragging and dropping cards into a hidden slot.

## Features

- **Predefined Chains**: Randomized processing workflows with missing steps.
- **Drag & Drop**: Interactive card selection.
- **Validation System**: Ensures correct card placement.

## Data Structure

Each card has the following properties:

```js
{
  name: "Cours d'eau",
  image: "/data/cours_deau.png",
  type: "data" // Can be "data", "processing", or "result"
}
```

### Predefined Chain Example:

```js
[
  { name: "Cours d'eau", image: "/data/cours_deau.png", type: "data" },
  { name: "Tampon", image: "/traitement/tampon.png", type: "processing" },
  { name: "Resultat tampon", image: "/result/tampon.png", type: "result" }
] 
// It's possible to add more than 3 cards. If multiple data cards exist, they will be placed in a column.
```

## Installation & Running

1. Clone the repository:
   ```bash
   git clone https://github.com/pierridotite/QGISGame.git
   cd QGISGame
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Customization

- Add new cards by modifying `dataCards`, `processingCards`, and `resultCards` in `App.jsx`.
- Create new workflows by adding to `predefinedChains`.

## License

This project is licensed under the MIT License.