const storage = sessionStorage; 
// Récupération des pièces depuis l'API
// ---- works ----


let works = JSON.parse(storage.getItem('works') || '[]');
if (!Array.isArray(works) || works.length === 0) {
  const res = await fetch('http://localhost:5678/api/works');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  works = await res.json();
  storage.setItem('works', JSON.stringify(works));
}
console.log('Works:', works);

// ---- categories ----
let categories = JSON.parse(storage.getItem('categories') || '[]');
if (!Array.isArray(categories) || categories.length === 0) {
  const resCat = await fetch('http://localhost:5678/api/categories');
  if (!resCat.ok) throw new Error(`HTTP ${resCat.status}`);
  categories = await resCat.json();
  storage.setItem('categories', JSON.stringify(categories));
}
console.log('Categories:', categories);

// Récupération de l'élément du DOM qui accueillera les fiches
const filterFiches = document.querySelector(".filters");

genererCategory(works);   

// Fonction qui génère toute la page web
function genererCategory(works) {
  // Vider le conteneur avant de (re)générer (cohérence d'affichage)
  filterFiches.innerHTML = "";

  // Créer le conteneur des boutons
  const categoryElement = document.createElement("div");
  categoryElement.className = "btnlist";

  // Pour éviter les doublons de catégories
  const categoryIdlist = new Set();
  const categoryNamelist = new Set();
  // Créer le bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.dataset.id = "all";      // Valeur non numérique pour éviter tout conflit d'ID
  allBtn.textContent = "Tous";    // Libellé du bouton
  categoryElement.appendChild(allBtn);
  
  // Générer un bouton par catégorie présente dans works
  for (let i = 0; i < works.length; i++) {
    const category = works[i].category;
    if (!category) continue;              // Par précaution : certaines œuvres n'ont pas de catégorie
    if (categoryIdlist.has(category.id)) continue;  // Déjà générée ? On passe
    categoryIdlist.add(category.id);

    // Remarque : localStorage (si besoin de mémoriser le filtre actif)
    const btnCategory = document.createElement("button");
    btnCategory.dataset.id = category.id;
    btnCategory.textContent = category.name;
    categoryNamelist.add(category.name);
    categoryElement.appendChild(btnCategory);
  }
  sessionStorage.setItem('categoryNamelist', JSON.stringify([...categoryNamelist]));
  // Insérer le bloc de boutons dans .fiches (et non dans body)
  filterFiches.appendChild(categoryElement);

  // Attacher les écouteurs de filtres une fois les boutons présents dans le DOM
  ajoutListenersFiltresCategory(works);
}

function ajoutListenersFiltresCategory(works) {
  const btnElements = document.querySelectorAll("#portfolio .filters button");
  for (let i = 0; i < btnElements.length; i++) {
    btnElements[i].addEventListener("click", async function (event) {
      /* ... */
      const id = event.target.dataset.id;
      if (id === "all")
      {
        renderGallery(works);
      }
      else{
        const filtered = works.filter(w => w.category.id == id);
         renderGallery(filtered);
      }
    });
  }
}

function renderGallery(list){
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; 
  for (let i = 0; i < list.length; i++) {
    const work = list[i];
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    const caption = document.createElement("figcaption");
    caption.textContent = work.title;
    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  }
}