export function query(selector, root = document) {
  return root.querySelector(selector);
}

export function queryAll(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export async function readJson(path) {
  const response = await fetch(path);
  return response.json();
}

export function sanitizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\?/g, "").trim();
}

export function toNumber(value) {
  if (value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function compareNullable(a, b) {
  if (a === null || a === undefined) {
    return 1;
  }

  if (b === null || b === undefined) {
    return -1;
  }

  return a - b;
}
