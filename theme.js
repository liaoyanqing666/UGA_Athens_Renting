import { query } from "./app-utils.js";

const THEME_KEY = "uga-theme";
const button = query("[data-theme-toggle]");

initTheme();

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const theme = storedTheme === "dark" ? "dark" : "light";

  applyTheme(theme);

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  if (!button) {
    return;
  }

  button.textContent = theme === "dark" ? "白天模式" : "黑夜模式";
}
