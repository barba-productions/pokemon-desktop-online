// Simple static-site i18n: no build step, just a dictionary + DOM text patching.
// Exposed as window.PDO_I18N so ES module scripts (game.js, account.js, ...) can use t().
(function () {
  const STORAGE_KEY = "pdo_lang";
  const SUPPORTED = ["en", "pt", "es", "de"];

  const dict = {
    en: {
      nav_home: "Home",
      nav_play: "Play",
      nav_leaderboard: "Leaderboard",
      nav_account: "Login / Sync",

      home_subtitle: "The web companion to your Pokemon Desktop hardware.",
      card_play_title: "Play the streak game",
      card_play_text: "Guess as many Pokémon silhouettes in a row as you can. One wrong answer ends the run - share your best streak with friends!",
      card_play_btn: "Play now",
      card_sync_title: "Sync your Pokemon Desktop",
      card_sync_title_synced: "Check your Pokemon Desktop Points and Pokédex",
      card_sync_text: "Log in and enter your Activation Code (shown on your Pokemon Desktop) to see your lifetime stats and Pokédex here.",
      card_sync_btn: "Login / Link device",
      card_leaderboard_title: "Global leaderboard",
      card_leaderboard_text: "See how your best streak stacks up against other trainers.",
      card_leaderboard_btn: "View leaderboard",
      footer_text: "Pokemon Desktop Online - Barba Productions",

      play_title: "Who's that Pokémon?",
      play_loading: "Loading...",
      play_streak_label: "Streak:",
      play_next_btn: "Next",
      play_game_over_title: "Game over!",
      play_your_streak: "Your streak:",
      play_name_label: "Your name (for the leaderboard)",
      play_name_placeholder: "Trainer",
      play_submit_btn: "Submit score",
      play_share_btn: "Share my score",
      play_again_btn: "Play again",
      play_state_correct: "Correct! Next Pokémon...",
      play_state_wrong: "Wrong! Game over.",
      play_oak_message: "Professor Oak is disappointed in your Pokédex knowledge.",
      play_submit_submitting: "Submitting...",
      play_submit_ok: "Score submitted! Check the leaderboard.",
      play_submit_error: "Could not submit score (is Firebase configured yet?).",
      play_share_copied: "Copied!",
      play_share_copy_label: "Copy share text",

      leaderboard_title: "Top streaks",
      leaderboard_col_trainer: "Trainer",
      leaderboard_col_streak: "Streak",
      leaderboard_loading: "Loading...",
      leaderboard_empty: "No scores yet. Be the first!",
      leaderboard_error: "Could not load leaderboard (is Firebase configured yet?).",

      account_title: "Your account",
      auth_email_label: "Email",
      auth_password_label: "Password",
      auth_password_placeholder: "At least 6 characters",
      auth_login_btn: "Log in",
      auth_signup_btn: "Create account",
      dashboard_signed_in_as: "Signed in as",
      dashboard_logout_btn: "Log out",
      link_title: "Link your Pokemon Desktop",
      link_help: "Find your Activation Code on your Pokemon Desktop: press and hold the screen on the Home page for 4 seconds.",
      link_input_label: "Activation Code",
      link_btn: "Link device",
      link_status_none: "No device linked yet.",
      link_status_invalid: "That doesn't look like a valid Activation Code (format XXX-XXXX-XXX).",
      link_status_linking: "Linking...",
      link_status_linked: "Device linked!",
      link_status_no_stats: "Linked, but no stats received yet. Finish a game on your device first.",
      link_status_error: "Could not link device. Try again.",
      stats_title: "Your stats",
      stat_score: "Lifetime score",
      stat_caught: "Pokédex caught",
      stat_correct: "Total correct",
      stat_wrong: "Total wrong",
      stat_days: "Days played",
      stat_trainer: "Trainer name",
      pokedex_title: "Your Pokédex",
    },
    pt: {
      nav_home: "Início",
      nav_play: "Jogar",
      nav_leaderboard: "Ranking",
      nav_account: "Entrar / Sincronizar",

      home_subtitle: "O companheiro web do seu Pokemon Desktop.",
      card_play_title: "Jogue o desafio de adivinhar o Pokémon",
      card_play_text: "Acerte o máximo de silhuetas de Pokémon seguidas que conseguir. Um erro encerra a rodada - compartilhe sua sequência com os amigos!",
      card_play_btn: "Jogar agora",
      card_sync_title: "Sincronize seu Pokemon Desktop",
      card_sync_title_synced: "Veja seus pontos e Pokédex do Pokemon Desktop",
      card_sync_text: "Entre na sua conta e digite o Código de Ativação (mostrado no seu Pokemon Desktop) para ver suas estatísticas e Pokédex aqui.",
      card_sync_btn: "Entrar / Vincular dispositivo",
      card_leaderboard_title: "Ranking global",
      card_leaderboard_text: "Veja como sua melhor sequência se compara com outros treinadores.",
      card_leaderboard_btn: "Ver ranking",
      footer_text: "Pokemon Desktop Online - Barba Productions",

      play_title: "Quem é esse Pokémon?",
      play_loading: "Carregando...",
      play_streak_label: "Sequência:",
      play_next_btn: "Próximo",
      play_game_over_title: "Fim de jogo!",
      play_your_streak: "Sua sequência:",
      play_name_label: "Seu nome (para o ranking)",
      play_name_placeholder: "Treinador",
      play_submit_btn: "Enviar pontuação",
      play_share_btn: "Compartilhar pontuação",
      play_again_btn: "Jogar novamente",
      play_state_correct: "Certo! Próximo Pokémon...",
      play_state_wrong: "Errado! Fim de jogo.",
      play_oak_message: "O Professor Carvalho ficou decepcionado com seu conhecimento de Pokédex.",
      play_submit_submitting: "Enviando...",
      play_submit_ok: "Pontuação enviada! Confira o ranking.",
      play_submit_error: "Não foi possível enviar a pontuação (o Firebase já está configurado?).",
      play_share_copied: "Copiado!",
      play_share_copy_label: "Copiar texto para compartilhar",

      leaderboard_title: "Melhores sequências",
      leaderboard_col_trainer: "Treinador",
      leaderboard_col_streak: "Sequência",
      leaderboard_loading: "Carregando...",
      leaderboard_empty: "Ainda sem pontuações. Seja o primeiro!",
      leaderboard_error: "Não foi possível carregar o ranking (o Firebase já está configurado?).",

      account_title: "Sua conta",
      auth_email_label: "Email",
      auth_password_label: "Senha",
      auth_password_placeholder: "Pelo menos 6 caracteres",
      auth_login_btn: "Entrar",
      auth_signup_btn: "Criar conta",
      dashboard_signed_in_as: "Conectado como",
      dashboard_logout_btn: "Sair",
      link_title: "Vincule seu Pokemon Desktop",
      link_help: "Encontre seu código de Ativação no Pokemon Desktop: segure a tela na página inicial por 4 segundos.",
      link_input_label: "Código de Ativação",
      link_btn: "Vincular dispositivo",
      link_status_none: "Nenhum dispositivo vinculado ainda.",
      link_status_invalid: "Isso não parece um código de Ativação válido (formato XXX-XXXX-XXX).",
      link_status_linking: "Vinculando...",
      link_status_linked: "Dispositivo vinculado!",
      link_status_no_stats: "Vinculado, mas ainda sem estatísticas. Termine um jogo no seu dispositivo primeiro.",
      link_status_error: "Não foi possível vincular o dispositivo. Tente novamente.",
      stats_title: "Suas estatísticas",
      stat_score: "Pontuação vitalícia",
      stat_caught: "Pokédex capturados",
      stat_correct: "Total de acertos",
      stat_wrong: "Total de erros",
      stat_days: "Dias jogados",
      stat_trainer: "Nome do treinador",
      pokedex_title: "Sua Pokédex",
    },
    es: {
      nav_home: "Inicio",
      nav_play: "Jugar",
      nav_leaderboard: "Clasificación",
      nav_account: "Iniciar sesión / Sincronizar",

      home_subtitle: "El compañero web de tu Pokemon Desktop.",
      card_play_title: "Juega la racha de aciertos",
      card_play_text: "Adivina la mayor cantidad de siluetas de Pokémon seguidas que puedas. ¡Un error termina la partida - comparte tu mejor racha con tus amigos!",
      card_play_btn: "Jugar ahora",
      card_sync_title: "Sincroniza tu Pokemon Desktop",
      card_sync_title_synced: "Consulta tus puntos y Pokédex del Pokemon Desktop",
      card_sync_text: "Inicia sesión e ingresa tu Código de Activación (que aparece en tu Pokemon Desktop) para ver tus estadísticas y Pokédex aquí.",
      card_sync_btn: "Iniciar sesión / Vincular dispositivo",
      card_leaderboard_title: "Clasificación global",
      card_leaderboard_text: "Mira cómo se compara tu mejor racha con la de otros entrenadores.",
      card_leaderboard_btn: "Ver clasificación",
      footer_text: "Pokemon Desktop Online - Barba Productions",

      play_title: "¿Quién es ese Pokémon?",
      play_loading: "Cargando...",
      play_streak_label: "Racha:",
      play_next_btn: "Siguiente",
      play_game_over_title: "¡Fin del juego!",
      play_your_streak: "Tu racha:",
      play_name_label: "Tu nombre (para la clasificación)",
      play_name_placeholder: "Entrenador",
      play_submit_btn: "Enviar puntuación",
      play_share_btn: "Compartir mi puntuación",
      play_again_btn: "Jugar de nuevo",
      play_state_correct: "¡Correcto! Siguiente Pokémon...",
      play_state_wrong: "¡Incorrecto! Fin del juego.",
      play_oak_message: "El Profesor Oak está decepcionado de tu conocimiento Pokédex.",
      play_submit_submitting: "Enviando...",
      play_submit_ok: "¡Puntuación enviada! Revisa la clasificación.",
      play_submit_error: "No se pudo enviar la puntuación (¿ya está configurado Firebase?).",
      play_share_copied: "¡Copiado!",
      play_share_copy_label: "Copiar texto para compartir",

      leaderboard_title: "Mejores rachas",
      leaderboard_col_trainer: "Entrenador",
      leaderboard_col_streak: "Racha",
      leaderboard_loading: "Cargando...",
      leaderboard_empty: "Aún no hay puntuaciones. ¡Sé el primero!",
      leaderboard_error: "No se pudo cargar la clasificación (¿ya está configurado Firebase?).",

      account_title: "Tu cuenta",
      auth_email_label: "Correo electrónico",
      auth_password_label: "Contraseña",
      auth_password_placeholder: "Al menos 6 caracteres",
      auth_login_btn: "Iniciar sesión",
      auth_signup_btn: "Crear cuenta",
      dashboard_signed_in_as: "Sesión iniciada como",
      dashboard_logout_btn: "Cerrar sesión",
      link_title: "Vincula tu Pokemon Desktop",
      link_help: "Encuentra tu Código de Activación en tu Pokemon Desktop: mantén la pantalla presionada en la página de inicio por 4 segundos.",
      link_input_label: "Código de Activación",
      link_btn: "Vincular dispositivo",
      link_status_none: "Aún no hay dispositivo vinculado.",
      link_status_invalid: "Eso no parece un Código de Activación válido (formato XXX-XXXX-XXX).",
      link_status_linking: "Vinculando...",
      link_status_linked: "¡Dispositivo vinculado!",
      link_status_no_stats: "Vinculado, pero aún sin estadísticas. Termina una partida en tu dispositivo primero.",
      link_status_error: "No se pudo vincular el dispositivo. Intenta de nuevo.",
      stats_title: "Tus estadísticas",
      stat_score: "Puntuación de por vida",
      stat_caught: "Pokédex capturados",
      stat_correct: "Total de aciertos",
      stat_wrong: "Total de errores",
      stat_days: "Días jugados",
      stat_trainer: "Nombre de entrenador",
      pokedex_title: "Tu Pokédex",
    },
    de: {
      nav_home: "Start",
      nav_play: "Spielen",
      nav_leaderboard: "Bestenliste",
      nav_account: "Anmelden / Sync",

      home_subtitle: "Der Web-Begleiter zu deinem Pokemon Desktop.",
      card_play_title: "Serien-Spiel spielen",
      card_play_text: "Errate so viele Pokémon-Silhouetten hintereinander wie möglich. Eine falsche Antwort beendet den Lauf - teile deine beste Serie mit Freunden!",
      card_play_btn: "Jetzt spielen",
      card_sync_title: "Pokemon Desktop synchronisieren",
      card_sync_title_synced: "Deine Pokemon Desktop Punkte und Pokédex ansehen",
      card_sync_text: "Melde dich an und gib deinen Aktivierungscode ein (auf deinem Pokemon Desktop angezeigt), um hier deine Statistiken und Pokédex zu sehen.",
      card_sync_btn: "Anmelden / Gerät verknüpfen",
      card_leaderboard_title: "Globale Bestenliste",
      card_leaderboard_text: "Sieh, wie deine beste Serie im Vergleich zu anderen Trainern abschneidet.",
      card_leaderboard_btn: "Bestenliste ansehen",
      footer_text: "Pokemon Desktop Online - Barba Productions",

      play_title: "Wer ist das Pokémon?",
      play_loading: "Wird geladen...",
      play_streak_label: "Serie:",
      play_next_btn: "Weiter",
      play_game_over_title: "Spiel vorbei!",
      play_your_streak: "Deine Serie:",
      play_name_label: "Dein Name (für die Bestenliste)",
      play_name_placeholder: "Trainer",
      play_submit_btn: "Punktzahl senden",
      play_share_btn: "Punktzahl teilen",
      play_again_btn: "Nochmal spielen",
      play_state_correct: "Richtig! Nächstes Pokémon...",
      play_state_wrong: "Falsch! Spiel vorbei.",
      play_oak_message: "Professor Eich ist enttäuscht von deinem Pokédex-Wissen.",
      play_submit_submitting: "Wird gesendet...",
      play_submit_ok: "Punktzahl gesendet! Sieh dir die Bestenliste an.",
      play_submit_error: "Punktzahl konnte nicht gesendet werden (ist Firebase schon eingerichtet?).",
      play_share_copied: "Kopiert!",
      play_share_copy_label: "Text zum Teilen kopieren",

      leaderboard_title: "Beste Serien",
      leaderboard_col_trainer: "Trainer",
      leaderboard_col_streak: "Serie",
      leaderboard_loading: "Wird geladen...",
      leaderboard_empty: "Noch keine Punktzahlen. Sei der Erste!",
      leaderboard_error: "Bestenliste konnte nicht geladen werden (ist Firebase schon eingerichtet?).",

      account_title: "Dein Konto",
      auth_email_label: "E-Mail",
      auth_password_label: "Passwort",
      auth_password_placeholder: "Mindestens 6 Zeichen",
      auth_login_btn: "Anmelden",
      auth_signup_btn: "Konto erstellen",
      dashboard_signed_in_as: "Angemeldet als",
      dashboard_logout_btn: "Abmelden",
      link_title: "Pokemon Desktop verknüpfen",
      link_help: "Finde deinen Aktivierungscode auf dem Pokemon Desktop: Bildschirm auf der Startseite 4 Sekunden gedrückt halten.",
      link_input_label: "Aktivierungscode",
      link_btn: "Gerät verknüpfen",
      link_status_none: "Noch kein Gerät verknüpft.",
      link_status_invalid: "Das sieht nicht wie ein gültiger Aktivierungscode aus (Format XXX-XXXX-XXX).",
      link_status_linking: "Wird verknüpft...",
      link_status_linked: "Gerät verknüpft!",
      link_status_no_stats: "Verknüpft, aber noch keine Statistiken erhalten. Beende zuerst ein Spiel auf deinem Gerät.",
      link_status_error: "Gerät konnte nicht verknüpft werden. Versuche es erneut.",
      stats_title: "Deine Statistiken",
      stat_score: "Punktzahl (gesamt)",
      stat_caught: "Pokédex gefangen",
      stat_correct: "Richtige Antworten",
      stat_wrong: "Falsche Antworten",
      stat_days: "Gespielte Tage",
      stat_trainer: "Trainername",
      pokedex_title: "Deine Pokédex",
    },
  };

  function getLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;

    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(browserLang) ? browserLang : "en";
  }

  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyI18n();
  }

  function t(key) {
    const lang = getLanguage();
    return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
  }

  function applyI18n() {
    const lang = getLanguage();
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });

    document.querySelectorAll(".lang-select").forEach((select) => {
      select.value = lang;
    });
  }

  function initNav() {
    document.querySelectorAll(".hamburger-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nav = document.querySelector("nav.site-nav");
        if (nav) nav.classList.toggle("open");
      });
    });

    document.querySelectorAll(".lang-select").forEach((select) => {
      select.value = getLanguage();
      select.addEventListener("change", (e) => setLanguage(e.target.value));
    });
  }

  window.PDO_I18N = { t, getLanguage, setLanguage, applyI18n };

  document.addEventListener("DOMContentLoaded", () => {
    applyI18n();
    initNav();
  });
})();
