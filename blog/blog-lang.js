(function() {
  var lang = localStorage.getItem("sgf_lang") || "es";
  document.documentElement.lang = lang;

  function applyLang(l) {
    document.documentElement.lang = l;
    localStorage.setItem("sgf_lang", l);
    document.querySelectorAll(".lang-es").forEach(function(el) {
      el.style.display = l === "es" ? "" : "none";
    });
    document.querySelectorAll(".lang-en").forEach(function(el) {
      el.style.display = l === "en" ? "" : "none";
    });
    document.querySelectorAll(".bl-switch button").forEach(function(btn) {
      btn.classList.toggle("active", btn.dataset.lang === l);
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    applyLang(lang);
    document.querySelectorAll(".bl-switch button").forEach(function(btn) {
      btn.addEventListener("click", function() { applyLang(btn.dataset.lang); });
    });
  });
})();
