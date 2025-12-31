const storage = sessionStorage; 
const token = sessionStorage.getItem('token');
const hasToken =
  typeof token === 'string' &&
  token.trim() !== '' &&
  token !== 'null' &&
  token !== 'undefined';
  
  if(hasToken){
  document.addEventListener('DOMContentLoaded', () => {
  // 1) Afficher la barre d’édition uniquement s’il existe un token
  const viewGallery = document.querySelector('.viewgallery');     // Vue 1 : Galerie
  const viewAdd     = document.querySelector('.viewadd');         // Vue 2 : Ajout
  const bar   = document.getElementById('edit-bar');
  const filters   = document.getElementById('btnfilters');
  const editBtn = document.querySelector('.section-edit #btn-modifier');
  const token = sessionStorage.getItem('token');
  const isAdmin = token && token !== 'undefined' && token !== 'null';
  bar.hidden = !isAdmin;
  
   if (isAdmin) {
    bar.classList.add('is-active');  
    filters.classList.add('hidden');
    editBtn.classList.remove('hidden');

  } else {
    bar.classList.remove('is-active'); 
    filters.classList.remove('hidden');
    editBtn.classList.add('hidden');
    return;
  }

  // 2) Rechercher les éléments ici pour garantir qu’ils sont rendus 
  const dlg = document.querySelector('#edit-bar dialog'); // <dialog>
  const closeBtn = document.getElementById('close-modal');

  if (!editBtn || !dlg) {
    console.warn('Bouton ou élément <dialog> introuvable');
    return;
  }

  // 3) Ouvrir la modale
  editBtn.addEventListener('click', (event) => {
    event.preventDefault();
    //activez cette ligne pour poser un point d’arrêt si besoin
    dlg.showModal();            // Important : appeler showModal() sur <dialog>
  });

  // 4) Fermer la modale (bouton croix)
  if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());

  // 5) Fermer en cliquant sur l’arrière-plan (backdrop)
   
   dlg?.addEventListener('click', (e) => {
  const inside =
    (viewGallery && viewGallery.contains(e.target)) ||
    (viewAdd && viewAdd.contains(e.target));

  if (!inside) {
    e.preventDefault();
    dlg.close();
    showGallery();
    clearPreview();
  }
});
}, { once: true });
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

function showGallery() {
  const viewAdd = document.querySelector('.viewadd');
  const viewGallery = document.querySelector('.viewgallery');
  viewAdd.classList.add('hidden'); 
  viewGallery.classList.remove('hidden');
}





