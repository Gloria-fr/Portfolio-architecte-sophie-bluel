// ===================================================================
// 1) Configuration / État (aucun accès DOM ici)
// ===================================================================
const storage     = sessionStorage;                                      // Cache de session
const categories  = JSON.parse(sessionStorage.getItem('categories') || '[]'); // Catégories en cache

// Références DOM (déclarées ici, initialisées dans init()) 
let dlg, viewGallery, viewAdd, select, btnAdd, fileIn, preview, uploadarea, form, title, submitBtn, gallery;


// ===================================================================
// 2) Fonctions (noms et logique conservés)
// ===================================================================

// Basculer vers la vue Galerie
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

function renderGalleryModale(list, container) {
  if (!container || !Array.isArray(list)) return;

  const frag = document.createDocumentFragment();
  for (const w of list) {
    const fig = document.createElement('figure');
    fig.dataset.id = w.id;

    if (w.category?.id) {
      fig.dataset.categoryId = w.category.id;
      fig.dataset.categoryName = w.category.name;
    } else if (w.categoryId) {
      fig.dataset.categoryId = w.categoryId;
    }

    const img = document.createElement('img');
    img.src = w.imageUrl;
    img.alt = w.title || '';
    img.loading = 'lazy';

    const cap = document.createElement('figcaption');
    cap.textContent = w.title || '';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'del';
    del.setAttribute('aria-label', 'Supprimer');

    const icon = document.createElement('i');          // Icône de suppression
    icon.className = 'bi bi-trash3';

    del.appendChild(icon);
    fig.append(img, cap, del);
    frag.append(fig);
  }
  container.replaceChildren(frag);
}



function showGallery() {
  viewAdd.classList.add('hidden'); 
  viewGallery.classList.remove('hidden');
}

// Basculer vers la vue Ajout
function showAdd() {
  viewGallery.classList.add('hidden'); 
  viewAdd.classList.remove('hidden');
}

// Aperçu de l’image sélectionnée (blob URL + gestion succès/erreur)
function showPreview(file) {
  const preview    = document.querySelector('.preview');      // <img> d’aperçu
  const uploadarea = document.querySelector('.upload-area');  // Zone de dépôt/téléversement
  if (!(preview instanceof HTMLImageElement)) {
    alert('Zone d’aperçu introuvable : veuillez ajouter <img id="preview">');
    return;
  }

  const url = URL.createObjectURL(file);                      // Créer l’URL temporaire
  console.log('[preview] url =', url);

  preview.onload = () => {
    URL.revokeObjectURL(url);                                 // Libérer l’URL dès que l’image est chargée
    preview.classList.remove('hidden');                       // Afficher l’image
    uploadarea?.classList?.add('hidden');                     // Masquer la zone d’upload
    console.log('[preview] loaded');
  };

  preview.onerror = () => {
    URL.revokeObjectURL(url);                                 // Toujours libérer l’URL en cas d’échec
    resetPreview('Échec de l’aperçu : le fichier n’est pas une image valide');
    console.warn('[preview] error');
  };

  preview.src = url;                                          // Définir la source en dernier
}

// Vérifier qu’un fichier est une image (MIME prioritaire, extension en secours)
function isImageFile(f) {
  if (!f) return false;
  if (f.type) return f.type.startsWith('image/');             // Chemin standard via MIME
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || ''); // Secours via l’extension
}

// Afficher une boîte de message (dialog natif si dispo, sinon alert)
function showMsg(text){
  const dlg = document.getElementById('msg');
  document.getElementById('msg-text').textContent = text;
  if (typeof dlg.showModal === 'function') {
    dlg.showModal();                                          // Ouvrir le <dialog>
  } else {
    alert(text);                                              // Repli pour anciens navigateurs
  }
}

// Nettoyer l’aperçu et réafficher la zone d’upload
function clearPreview() {
  const preview    = document.querySelector('.preview');
  const uploadarea = document.querySelector('.upload-area');
  const fileIn     = document.querySelector('.file');

  // Masquer l’aperçu, montrer la zone d’upload, retirer src
  if (preview) {
    preview.removeAttribute('src');
    preview.classList.add('hidden');
  }
  uploadarea?.classList?.remove('hidden');

  // Vider le champ fichier
  if (fileIn) fileIn.value = '';
}


// ===================================================================
// 3) Démarrage : résoudre le DOM, lier les événements, etc.
// ===================================================================
function init() {
  // Résoudre les éléments du DOM (maintenant qu’ils existent)
  dlg         = document.querySelector('#edit-bar dialog'); // Élément <dialog>
  viewGallery = document.querySelector('.viewgallery');     // Vue 1 : Galerie
  viewAdd     = document.querySelector('.viewadd');         // Vue 2 : Ajout

  select      = document.getElementById('category');        // <select> des catégories
  btnAdd      = document.querySelector('.btn-addphoto');    // Bouton “Ajouter une photo”
  fileIn      = document.querySelector('.file');            // <input type="file">
  preview     = document.querySelector('.preview');         // <img> d’aperçu
  uploadarea  = document.querySelector('.upload-area');     // Zone de dépôt

  form        = document.getElementById('add-form');        // Formulaire d’ajout
  title       = document.getElementById('title');           // Champ titre
  submitBtn   = form ? form.querySelector('.btn-primary') : null; // Bouton de soumission
  gallery      = document.querySelector('#edit-bar #gallery');
  // Navigation modale : retour & fermeture
  document.addEventListener('click', (e) => {
    if (e.target.closest('.back-modal')) {
      e.preventDefault();
      showGallery();
      clearPreview();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.close-modal')) return;
    e.preventDefault();
    if (dlg?.open && typeof dlg.close === 'function') dlg.close();
    showGallery();
    clearPreview();
  });

  // Ajouter puis prévisualiser l’image
  if (btnAdd) btnAdd.addEventListener('click', () => fileIn?.click());

  if (fileIn) fileIn.addEventListener('change', () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    if (isImageFile(f)) {
      // Fichier image valide → lancer l’aperçu
      showPreview(f);
    } else {
      // Fichier non image → réinitialiser l’UI et alerter
      const preview    = document.querySelector('.preview');
      const uploadarea = document.querySelector('.upload-area');
      preview?.removeAttribute('src');
      preview?.classList?.add('hidden');
      uploadarea?.classList?.remove('hidden');
      alert('Veuillez sélectionner un fichier image');
    }
  });

  // Remplir la liste déroulante des catégories
  if (select) {
    // Retirer un placeholder vide en première position si présent
    if (select.options[0] && select.options[0].value === '') {
      select.remove(0);
    }
    const frag = document.createDocumentFragment();
    categories.forEach(c => frag.append(new Option(c.name, c.id)));
    select.append(frag);
  }



submitBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  form?.requestSubmit();
});

if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('SUBMIT OK');
});


  if (form) form.addEventListener('submit', async (e) => {
    console.log('SUBMIT TRIGGERED');
    e.preventDefault();

    // Vérifier les champs requis (message groupé)
    const p = fileIn.files && fileIn.files[0];
    const missing = [];
    if (!p)      missing.push('Image');
    if (!title)  missing.push('Titre');
    if (!select) missing.push('Catégorie');
    if (missing.length) {
      alert('Veuillez compléter : ' + missing.join(', '));
      return;
    }

    const f = fileIn.files[0];
    if (!f.type.startsWith('image/')) return alert('Veuillez sélectionner un fichier image');
    if (f.size > 4 * 1024 * 1024)      return alert('L’image ne doit pas dépasser 4 Mo');

    const fd = new FormData();
    fd.append('image', f);
    fd.append('title', title.value.trim());
    fd.append('category', select.value);  // <option value> doit être l’id de la catégorie

    const token = sessionStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined, // Ne pas définir Content-Type manuellement
        body: fd,
      });

      if (!res.ok) {
        if (res.status === 401) return alert('Non autorisé : veuillez vous reconnecter');
        return alert(`Échec du téléversement (${res.status})`);
      }

      const newWork = await res.json();
      alert('Téléversement réussi');


// debug
console.log('[SUCCESS] newWork =', newWork);
console.log('[SUCCESS] renderGallery type =', typeof renderGallery);

// 1)  UI
form.reset();
clearPreview();                 
showGallery();                 

// 2) （Work push）
const works = JSON.parse(sessionStorage.getItem('works') || '[]');
works.push(newWork);
sessionStorage.setItem('works', JSON.stringify(works));
console.log('[SUCCESS] works length now =', works.length);

// 3) modal / page renderGallery 
if (typeof renderGallery === 'function') {
  renderGallery(works);
   // -- Rendu initial de la galerie modale --
  renderGalleryModale(works, gallery);
  console.log('[SUCCESS] renderGallery called');
} else {
  console.warn('[SUCCESS] renderGallery is not defined');
}


if (submitBtn) submitBtn.disabled = false;





      // Réinitialiser formulaire et UI
     

    } catch (err) {
      console.error(err);
      alert('Erreur réseau, veuillez réessayer');
    }
  });
}

// Lancer une fois le DOM prêt (évite les sélecteurs null)
document.addEventListener('DOMContentLoaded', init, { once: true });








