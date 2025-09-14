// ===================================================================
// 1) Configuration / État
// ===================================================================
const storage = sessionStorage;
const token   = sessionStorage.getItem('token');
const hasToken =
  typeof token === 'string' &&
  token.trim() !== '' &&
  token !== 'null' &&
  token !== 'undefined';

// ===================================================================
// 2) Logique DOM (à exécuter quand le DOM est prêt)
// ===================================================================
if (hasToken) {
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Afficher la barre d’édition uniquement s’il existe un token
    const bar     = document.getElementById('edit-bar');                 // barre noire fixe
    const filters = document.getElementById('btnfilters');               // groupe de filtres
    const editBtn = document.querySelector('.section-edit #btn-modifier'); // bouton "modifier"
    const isAdmin = hasToken;                                            // réutiliser l’état calculé

    if (!bar || !filters || !editBtn) {
      console.warn('Éléments requis introuvables (bar/filters/editBtn)');
      return;
    }

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
    const dlg      = document.querySelector('#edit-bar dialog'); // élément <dialog> dans la barre
    const closeBtn = document.getElementById('close-modal');     // bouton de fermeture (croix)

    if (!dlg) {
      console.warn('Élément <dialog> introuvable');
      return;
    }

    // 3) Ouvrir la modale
    editBtn.addEventListener('click', (event) => {
      event.preventDefault();
      dlg.showModal(); // ouvrir la boîte modale
    });

    // 4) Fermer la modale (bouton croix)
    if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());

    // 5) Fermer en cliquant sur l’arrière-plan (backdrop) — à implémenter si nécessaire
    // dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }, { once: true });
}
