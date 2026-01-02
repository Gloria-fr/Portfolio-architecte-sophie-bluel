const form = document.getElementById('login-form');
const email = document.getElementById('email');   // champ e-mail
const pwd   = document.getElementById('password');
const storage = sessionStorage;              // ou sessionStorage si besoin

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 1) Règles de validation côté client (à adapter si besoin)
  const emailVal = email.value.trim();
  email.value = emailVal; 
  const pwdVal = pwd.value;

   // 2) validation (sans bulles navigateur)
  if(!emailVal&&!pwdVal){
    showMsg("Veuillez entrer votre e-mail et votre mot de passe.");
    email.focus();
    return;
    }

  if (!emailVal) {
    showMsg("L'e-mail est requis.");
    email.focus();
    return;
  }

  if (!email.checkValidity()) {
    showMsg("Format d'e-mail invalide.");
    email.focus();
    return;
  }

  if (!pwdVal) {
    showMsg("Le mot de passe est requis.");
    pwd.focus();
    return;
  }

  if (pwdVal.length < 6) {
    showMsg("Le mot de passe doit comporter au moins 6 caractères.");
    pwd.focus();
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





