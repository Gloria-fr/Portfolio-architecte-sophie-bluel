// =================== Galerie modale (structure réorganisée) ===================
// 1) Configuration / État (aucun accès DOM ici)
const storage = sessionStorage;
const token   = storage.getItem('token');
const works   = JSON.parse(storage.getItem('works') || '[]');

// Références DOM (résolues dans init)
let gallery;       // #edit-bar #gallery (galerie dans la modale)
let mainGallery;   // #portfolio .gallery (galerie principale)
let dlg, viewGallery, viewAdd;
let btnClose, btnAddDlg, btnModifier;


// =================== 2) Fonctions (noms et logique conservés) ===================
// Rendu d’une galerie dans un conteneur donné
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

// Basculer vers la vue Galerie (modale)
function showGallery() {
  viewAdd?.classList.add('hidden');
  viewGallery?.classList.remove('hidden');
}

// Basculer vers la vue Ajout (modale)
function showAdd() {
  viewGallery?.classList.add('hidden');
  viewAdd?.classList.remove('hidden');
}


// =================== 3) Démarrage : résolution du DOM, liaisons, rendu ===================
function init() {
  // -- Résoudre les éléments du DOM --
  gallery      = document.querySelector('#edit-bar #gallery');
  mainGallery  = document.querySelector('#portfolio .gallery');

  dlg          = document.querySelector('#edit-bar dialog');
  btnModifier = document.getElementById('btn-modifier');
  viewGallery  = document.querySelector('.viewgallery');
  viewAdd      = document.querySelector('.viewadd');

  btnClose     = document.querySelector('.close-modal');
  btnAddDlg    = document.querySelector('.btn-ajouter');

  // -- Rendu initial de la galerie modale --
  renderGalleryModale(works, gallery);

  // -- Ouverture 
  if (btnModifier) {
    btnModifier.addEventListener('click', (e) => {
        e.preventDefault();
        showGallery(); 
        if (typeof dlg.showModal === 'function') {
            dlg.showModal(); 
        }
    });
}
  // / fermeture / navigation entre vues --
  btnClose?.addEventListener('click', () => {
    if (dlg?.open && typeof dlg.close === 'function') dlg.close();
  });

  btnAddDlg?.addEventListener('click', () => {
    showAdd();
    if (typeof dlg?.showModal === 'function') dlg.showModal();
  });

  // --- Fermer la modale en cliquant à l’extérieur (backdrop) ---
dlg?.addEventListener('click', (e) => {
  const inside =
    (viewGallery && viewGallery.contains(e.target)) ||
    (viewAdd && viewAdd.contains(e.target));

  if (!inside) {
    e.preventDefault();       
    if (dlg.open && typeof dlg.close === 'function') dlg.close();
    showGallery();            
  }
});

// --- Fermer avec la touche Échap (ESC) ---
dlg?.addEventListener('cancel', (e) => {
  e.preventDefault();        
  if (dlg.open && typeof dlg.close === 'function') dlg.close();
  showGallery();
});



  // -- Suppression d’un élément (délégation sur la galerie modale) --
  if (gallery) {
    gallery.addEventListener('click', async (e) => {
      const btn = e.target.closest('button.del');
      if (!btn) return;

      const fig = btn.closest('figure');
      const workId = Number.parseInt(fig?.dataset.id, 10);
      if (!Number.isInteger(workId)) return;

      const token = sessionStorage.getItem('token');
      if (!token) return alert('Non autorisé : veuillez vous connecter d’abord');
      if (!confirm('Confirmer la suppression de cette image ?')) return;

      try {
        const res = await fetch(`http://localhost:5678/api/works/${workId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        const bodyText = await res.text().catch(() => '');
        if (res.status === 200 || res.status === 204) {
          // Mettre à jour le cache
          let cached = JSON.parse(sessionStorage.getItem('works') || '[]');
          cached = cached.filter(w => Number(w.id) !== workId);
          sessionStorage.setItem('works', JSON.stringify(cached));

          // Rester dans la modale : retirer seulement le nœud et conserver le scroll
          const y = gallery.scrollTop;
          fig.remove();
          gallery.scrollTop = y;

          // Optionnel : message léger sans fermer la modale
          // showMsg('Suppression réussie');
          return;
        }

        if (res.status === 401) return alert('Non autorisé : veuillez vous reconnecter (401)');
        if (res.status === 403) return alert('Accès refusé : vous n’avez pas les droits (403)');
        if (res.status === 404) return alert('Œuvre introuvable (404)');

        alert(`Échec de la suppression (${res.status})${bodyText ? ' : ' + bodyText : ''}`);
      } catch (err) {
        console.error(err);
        alert('Erreur réseau, veuillez réessayer');
      }
    });
  }
}

// Lancer une fois le DOM prêt (liaisons uniques)
document.addEventListener('DOMContentLoaded', init, { once: true });





