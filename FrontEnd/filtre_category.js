// ===================================================================
// 1) Configuration / État (ne pas toucher au DOM ici)
// ===================================================================
const storage = sessionStorage;                                   // Stockage de session pour mettre en cache les données
let works = [];                                                    // Liste des œuvres (état en mémoire)
let categories = [];                                               // Liste des catégories (état en mémoire)
// ===================================================================
// 2) Fonctions
//    2.1 Rendu de la galerie (DOM)
//    2.2 Génération de la barre de filtres (DOM + cache)
//    2.3 Listeners des filtres (DOM)
//    2.4 Logout
// ===================================================================

// 2.1 Rendre la grille de travaux dans .gallery
function renderGallery(list) {
  const gallery = document.querySelector(".gallery");              // Conteneur de la galerie
  gallery.innerHTML = "";                                          // Vider la galerie avant nouveau rendu

  for (let i = 0; i < list.length; i++) {
    const work = list[i];                                          // Œuvre courante

    const figure = document.createElement("figure");               // Carte (figure)
    const img = document.createElement("img");                     // Image
    img.src = work.imageUrl;                                       // URL de l’image
    img.alt = work.title;                                          // Texte alternatif

    const caption = document.createElement("figcaption");          // Légende (titre de l’œuvre)
    caption.textContent = work.title;

    figure.appendChild(img);                                       // Image → figure
    figure.appendChild(caption);                                   // Légende → figure
    gallery.appendChild(figure);                                   // Figure → galerie
  }
}

// 2.2 Générer la barre de filtres à partir de la liste des œuvres
function genererCategory(works) {
  const filterFiches = document.querySelector(".filters");         // Conteneur des filtres (barre de boutons)
  filterFiches.innerHTML = "";                                     // Nettoyer avant (ré)génération

  const categoryElement = document.createElement("div");           // Wrapper des boutons
  categoryElement.className = "btnlist";

  // Éviter les doublons
  const categoryIdlist = new Set();                                // IDs déjà rencontrés
  const categoryNamelist = new Set();                              // Noms (facultatif, pour mémoire)

  // Bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.dataset.id = "all";                                       // Valeur non numérique pour éviter conflit d’ID
  allBtn.textContent = "Tous";                                     // Libellé
  categoryElement.appendChild(allBtn);

  // Un bouton par catégorie présente dans works
  for (let i = 0; i < works.length; i++) {
    const category = works[i].category;                            // Catégorie de l’œuvre
    if (!category) continue;                                       // Sécurité : certaines œuvres peuvent ne pas avoir de catégorie
    if (categoryIdlist.has(category.id)) continue;                 // Déjà générée → on saute
    categoryIdlist.add(category.id);

    const btnCategory = document.createElement("button");          // Bouton de catégorie
    btnCategory.dataset.id = category.id;                          // ID dans data-id
    btnCategory.textContent = category.name;                       // Intitulé
    categoryNamelist.add(category.name);
    categoryElement.appendChild(btnCategory);
  }

  sessionStorage.setItem('categoryNamelist', JSON.stringify([...categoryNamelist])); // Mémoriser les noms (si utile)
  filterFiches.appendChild(categoryElement);                        // Insérer la barre de filtres dans .filters

  // Attacher les écouteurs une fois les boutons en place
  ajoutListenersFiltresCategory(works);
}

// 2.3 Gérer les clics sur les boutons de filtre
function ajoutListenersFiltresCategory(works) {
  const btnElements = document.querySelectorAll("#portfolio .filters button"); // Tous les boutons de filtre

  for (let i = 0; i < btnElements.length; i++) {
    btnElements[i].addEventListener("click", async function (event) { // Au clic sur un bouton
      /* ... */                                                       // Placeholder pour autre logique
      const id = event.target.dataset.id;                             // ID de catégorie

      if (id === "all") {
        renderGallery(works);                                         // Afficher toutes les œuvres
      } else {
        const filtered = works.filter(w => w.category.id == id);      // Filtrer sur l’ID
        renderGallery(filtered);                                      // Afficher la sélection
      }
    });
  }
}

// 2.4 Gérer le lien login/logout en fonction du token
function setupAuthLink() {
  const link = document.getElementById('auth-link');
  if (!link) return;

  const token = sessionStorage.getItem('token');

  if (token) {
    // logout
    link.textContent = 'logout';
    link.href = '#';

    link.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      sessionStorage.clear();

      window.location.replace('index.html');
    });
  } else {
    // login
    link.textContent = 'login';
    link.href = 'login.html';
  }
}

// ===================================================================
// 3) Démarrage (chargement des données + rendu initial)
//    - Lit le cache sessionStorage, sinon appelle l’API
//    - Rend la barre de filtres + la galerie
//    - Lancement après DOMContentLoaded pour éviter les nulls
// ===================================================================
async function init() {
  // ---- works ----
  works = JSON.parse(storage.getItem('works') || '[]');             // Lire le cache des œuvres
  if (!Array.isArray(works) || works.length === 0) {                // Si cache vide/invalide → API
    const res = await fetch('http://localhost:5678/api/works');     // Requête des œuvres
    if (!res.ok) throw new Error(`HTTP ${res.status}`);             // Gestion d’erreur HTTP
    works = await res.json();                                       // Parser la réponse
    storage.setItem('works', JSON.stringify(works));                // Mettre en cache
  }
  console.log('Works:', works);                                      // Debug

  // ---- categories ----
  categories = JSON.parse(storage.getItem('categories') || '[]');   // Lire le cache des catégories
  if (!Array.isArray(categories) || categories.length === 0) {      // Si cache vide/invalide → API
    const resCat = await fetch('http://localhost:5678/api/categories'); // Requête des catégories
    if (!resCat.ok) throw new Error(`HTTP ${resCat.status}`);       // Gestion d’erreur HTTP
    categories = await resCat.json();                               // Parser la réponse
    storage.setItem('categories', JSON.stringify(categories));      // Mettre en cache
  }
  console.log('Categories:', categories);                            // Debug

  // ---- Rendu initial ----
  genererCategory(works);                                            // Générer la barre de filtres
  renderGallery(works);                                              // Afficher toutes les œuvres
}

// Lancer une fois le DOM prêt (évite querySelector null)
document.addEventListener('DOMContentLoaded', () => {
  setupAuthLink();
  init().catch(err => console.error(err));                           // Démarrage + trace en cas d’erreur
});
