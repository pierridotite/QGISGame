import React, { useState, useEffect } from "react";

function App() {
  // Cartes disponibles pour le tiroir, réparties par type
  const dataCards = [
    { name: "Cours d'eau", image: "/data/cours_deau.png", type: "data" },
    { name: "Parcellaire_déclaré", image: "/data/parcellaire_déclaré.png", type: "data" },
  ];
  const processingCards = [
    { name: "Calculatrice de champ", image: "/traitement/calculatrice_de_champ.png", type: "processing" },
    { name: "Intersection", image: "/traitement/intersection.png", type: "processing" },
    { name: "Sélection attributaire", image: "/traitement/selection_attributaire.png", type: "processing" },
    { name: "Sélection spatiale", image: "/traitement/selection_spatiale.png", type: "processing" },
    { name: "Statistiques par catégorie", image: "/traitement/statistiques_par_categorie.png", type: "processing" },
    { name: "Tampon", image: "/traitement/tampon.png", type: "processing" },
  ];
  const resultCards = [
    { name: "Resultat tampon", image: "/result/tampon.png", type: "result" },
    { name: "Tableau_stat", image: "/result/tableau_stat.png", type: "result" },
  ];

  // Chaînes prédéfinies
  const predefinedChains = [
    [
      { name: "Cours d'eau", image: "/data/cours_deau.png", type: "data" },
      { name: "Tampon", image: "/traitement/tampon.png", type: "processing" },
      { name: "Resultat tampon", image: "/result/tampon.png", type: "result" },
    ],
    [
      { name: "Cours d'eau", image: "/data/cours_deau.png", type: "data" },
      { name: "Parcellaire_déclaré", image: "/data/parcellaire_déclaré.png", type: "data" },
      { name: "Intersection", image: "/traitement/intersection.png", type: "processing" },
      { name: "Sélection spatiale", image: "/traitement/selection_spatiale.png", type: "processing" },
      { name: "Tableau_stat", image: "/result/tableau_stat.png", type: "result" },
    ],
  ];

  // États du jeu
  const [board, setBoard] = useState([]); // Chaîne de traitement avec une carte cachée
  const [hiddenIndex, setHiddenIndex] = useState(null);
  const [correctCard, setCorrectCard] = useState(null);
  const [message, setMessage] = useState("");

  // Par défaut, les sections du tiroir sont fermées
  const [drawerOpen, setDrawerOpen] = useState({
    data: false,
    processing: false,
    result: false,
  });

  // Génère une nouvelle question en choisissant aléatoirement une chaîne et en cachant une carte
  const generateNewQuestion = () => {
    const randomChain = predefinedChains[Math.floor(Math.random() * predefinedChains.length)];
    const chainCopy = [...randomChain];
    const randomIndex = Math.floor(Math.random() * chainCopy.length);
    setCorrectCard(chainCopy[randomIndex]);
    chainCopy[randomIndex] = null; // On cache la carte attendue
    setHiddenIndex(randomIndex);
    setBoard(chainCopy);
    setMessage("");
  };

  // Permet de retirer la carte déposée pour en choisir une autre
  const handleChangeCard = () => {
    const newBoard = [...board];
    newBoard[hiddenIndex] = null;
    setBoard(newBoard);
    setMessage("Carte retirée, veuillez déposer une nouvelle carte.");
  };

  // Initialisation lors du montage du composant
  useEffect(() => {
    generateNewQuestion();
  }, []);

  // --- Gestion du Drag & Drop ---
  const handleDragStart = (e, card, source, boardIndex = null) => {
    e.dataTransfer.setData("card", JSON.stringify(card));
    e.dataTransfer.setData("source", source);
    if (source === "board" && boardIndex !== null) {
      e.dataTransfer.setData("boardIndex", boardIndex);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Dépose la carte dans la case cachée sans validation immédiate
  const handleDrop = (e, index) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData("card");
    const droppedCard = JSON.parse(cardData);
    if (index === hiddenIndex && board[index] === null) {
      const newBoard = [...board];
      newBoard[index] = droppedCard;
      setBoard(newBoard);
      setMessage("");
    }
  };

  // Validation lors du clic sur "Soumettre"
  const handleSubmit = () => {
    const droppedCard = board[hiddenIndex];
    if (!droppedCard) {
      setMessage("Aucune carte déposée. Veuillez déposer une carte dans la case cachée.");
      return;
    }
    if (droppedCard.type !== correctCard.type) {
      setMessage(`Type incorrect. Attendu : ${correctCard.type}.`);
    } else if (droppedCard.name !== correctCard.name) {
      setMessage("Mauvaise réponse, essayez encore.");
    } else {
      setMessage("Correct !");
    }
  };

  // Bascule l'affichage d'une section du tiroir
  const toggleDrawerSection = (section) => {
    setDrawerOpen({
      ...drawerOpen,
      [section]: !drawerOpen[section],
    });
  };

  // --- Regroupement de la chaîne de traitement pour affichage desktop ---
  // On regroupe les cartes "data" contiguës afin de les afficher verticalement dans un groupe
  const groupedBoard = [];
  let currentGroup = null;
  for (let i = 0; i < board.length; i++) {
    // Pour une case cachée attendue de type data, on considère son type comme "data"
    const card = board[i];
    const currentType =
      card !== null
        ? card.type
        : (i === hiddenIndex && correctCard && correctCard.type === "data")
        ? "data"
        : "other";
    if (currentType === "data") {
      if (currentGroup && currentGroup.groupType === "data") {
        currentGroup.cards.push({ card, index: i });
      } else {
        currentGroup = { groupType: "data", cards: [{ card, index: i }] };
        groupedBoard.push(currentGroup);
      }
    } else {
      groupedBoard.push({ groupType: currentType, cards: [{ card, index: i }] });
      currentGroup = null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-6 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800">
          QGIS Warm-Up Card Game
        </h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
        {/* Tiroir en accordéon */}
        <section className="md:col-span-1 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-4 md:mb-6 text-gray-700">
            Tiroir de cartes
          </h2>
          {/* Section Donnée */}
          <div className="mb-4">
            <h3
              className="text-xl font-semibold text-gray-600 cursor-pointer"
              onClick={() => toggleDrawerSection("data")}
            >
              Donnée {drawerOpen.data ? "▲" : "▼"}
            </h3>
            {drawerOpen.data && (
              <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
                {dataCards.map((card, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, "drawer")}
                    className="p-2 bg-blue-100 rounded-lg cursor-move text-center"
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-16 md:w-20 h-16 md:h-20 object-contain mx-auto"
                    />
                    <p className="text-sm md:text-base">{card.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Section Traitement */}
          <div className="mb-4">
            <h3
              className="text-xl font-semibold text-gray-600 cursor-pointer"
              onClick={() => toggleDrawerSection("processing")}
            >
              Traitement {drawerOpen.processing ? "▲" : "▼"}
            </h3>
            {drawerOpen.processing && (
              <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
                {processingCards.map((card, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, "drawer")}
                    className="p-2 bg-green-100 rounded-lg cursor-move text-center"
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-16 md:w-20 h-16 md:h-20 object-contain mx-auto"
                    />
                    <p className="text-sm md:text-base">{card.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Section Résultat */}
          <div className="mb-4">
            <h3
              className="text-xl font-semibold text-gray-600 cursor-pointer"
              onClick={() => toggleDrawerSection("result")}
            >
              Résultat {drawerOpen.result ? "▲" : "▼"}
            </h3>
            {drawerOpen.result && (
              <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
                {resultCards.map((card, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, "drawer")}
                    className="p-2 bg-yellow-100 rounded-lg cursor-move text-center"
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-16 md:w-20 h-16 md:h-20 object-contain mx-auto"
                    />
                    <p className="text-sm md:text-base">{card.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        {/* Chaîne de traitement */}
        <section className="md:col-span-3 bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-4 md:mb-6 text-gray-700">
            Chaîne de traitement
          </h2>

          {/* Affichage pour desktop : chaîne en ligne avec scroll horizontal */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <div className="flex items-center gap-4 flex-nowrap">
                {groupedBoard.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <div className="flex flex-col items-center">
                      {group.cards.map(({ card, index }) => (
                        <div
                          key={index}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className="w-40 md:w-56 h-40 md:h-56 border border-gray-300 flex flex-col items-center justify-center rounded-lg bg-gray-100"
                        >
                          {card ? (
                            <>
                              <img
                                src={card.image}
                                alt={card.name}
                                className="w-32 md:w-50 h-32 md:h-50 object-contain"
                              />
                              <p className="text-center text-base md:text-lg">{card.name}</p>
                            </>
                          ) : (
                            <span className="text-gray-400 text-base md:text-lg">Carte Cachée</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {groupIndex < groupedBoard.length - 1 && (
                      <div className="w-px h-20 bg-gray-300" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Affichage pour mobile : chaîne verticale avec séparateurs */}
          <div className="flex flex-col md:hidden">
            {board.map((card, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="w-full h-24 border border-gray-300 flex items-center justify-center rounded-lg bg-gray-100"
                >
                  {card ? (
                    <>
                      <img src={card.image} alt={card.name} className="w-16 h-16 object-contain" />
                      <p className="text-center text-sm">{card.name}</p>
                    </>
                  ) : (
                    <span className="text-gray-400 text-sm">Carte Cachée</span>
                  )}
                </div>
                {index < board.length - 1 && (
                  <hr className="w-full my-2 border-t border-gray-300" />
                )}
              </div>
            ))}
          </div>

          {/* Boutons et message de validation */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white text-base md:text-xl font-bold rounded-lg cursor-pointer"
              >
                Soumettre
              </button>
              <button
                onClick={generateNewQuestion}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white text-base md:text-xl font-bold rounded-lg cursor-pointer"
              >
                Nouvelle Question
              </button>
              {board[hiddenIndex] && (
                <button
                  onClick={handleChangeCard}
                  className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white text-base md:text-xl font-bold rounded-lg cursor-pointer"
                >
                  Changer la carte
                </button>
              )}
            </div>
            {message && (
              <p className={`mt-4 text-center text-base md:text-2xl ${message === "Correct !" ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
