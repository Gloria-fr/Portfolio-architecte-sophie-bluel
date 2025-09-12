const form = document.getElementById('login-form');
const email = document.getElementById('email');   // champ e-mail
const pwd   = document.getElementById('password');
const storage = sessionStorage;              // ou sessionStorage si besoin

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 1) Réinitialiser les messages de validation personnalisés précédents
  email.setCustomValidity('');
  pwd.setCustomValidity('');

  // 2) Règles de validation côté client (à adapter si besoin)
  const emailVal = email.value.trim();
  const pwdVal   = pwd.value;

  // E-mail : obligatoire + format
  if (!emailVal) {
    email.setCustomValidity("L'e-mail est requis.");
  } else if (email.type === 'email' && email.validity.typeMismatch) {
    email.setCustomValidity("Format d'e-mail invalide.");
  }

  // Mot de passe : obligatoire + au moins 6 caractères
  // (peut aussi être géré via l'attribut HTML minlength)
  if (!pwdVal) {
    pwd.setCustomValidity("Le mot de passe est requis.");
  } else if (pwdVal.length < 6) {
    pwd.setCustomValidity("Le mot de passe doit comporter au moins 6 caractères.");
  }

  // 3) Si un champ est invalide, empêcher l'envoi et afficher les messages
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();
    return;
  }

  try {
    const res = await fetch(`http://localhost:5678/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailVal, password: pwdVal })
    });
    console.log('status=', res.status, 'res.url=', res.url);

    // Toutes les utilisations de res restent dans le try (même portée que const res)
    if (res.status === 404) { showMsg('Utilisateur introuvable.'); return; }
    if (res.status === 401) { showMsg('Mot de passe incorrect.'); return; }
    if (!res.ok)            { showMsg('Erreur serveur. Réessayez.'); return; }
    
    // Succès : récupérer token et userId
    const { token, userId } = await res.json();
    storage.setItem('token', token);
    if (userId) storage.setItem('userId', userId);

    // Redirection vers la page d’accueil
    window.location.replace('index.html');
    console.log('CONNECTE OK');
  } catch {
    showMsg('Réseau indisponible.');
  }
});

function showMsg(text){
  const dlg = document.getElementById('msg');
  document.getElementById('msg-text').textContent = text;

  if (typeof dlg.showModal === 'function') {
    dlg.showModal();            // ouvrir la boîte de dialogue
  } else {
    alert(text);                // solution de repli pour les anciens navigateurs
  }
}





