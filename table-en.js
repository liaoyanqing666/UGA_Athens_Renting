import { query, queryAll, readJson, sanitizeText } from "./app-utils.js";

const DATA_PATH = "./data/apartments_EN.json";
const TABLE_FONT_KEY = "uga-table-font-scale";

const elements = {
  head: query("#sheet-head"),
  body: query("#sheet-body"),
  meta: query("#sheet-meta"),
  fontControls: queryAll(".font-control"),
};

const COLUMN_DEFS = [
  { key: "name", label: "Name", noteKeys: ["Name"], getValue: (apartment) => sanitizeText(apartment.name) },
  { key: "region", label: "Region", noteKeys: ["Region"], getValue: (apartment) => sanitizeText(apartment.region) },
  { key: "location", label: "Location", noteKeys: ["Location"], getValue: (apartment) => sanitizeText(apartment.location) },
  { key: "layouts", label: "Layouts", noteKeys: ["Layouts"], getValue: (apartment) => sanitizeText(apartment.raw?.layouts) },
  { key: "sizes", label: "Size", noteKeys: ["Size"], getValue: (apartment) => sanitizeText(apartment.raw?.sizes) },
  { key: "prices", label: "Min Price Per Person", noteKeys: ["Min Price Per Person"], getValue: (apartment) => sanitizeText(apartment.raw?.prices) },
  { key: "furnished", label: "Furnishing", noteKeys: ["Furnishing"], getValue: (apartment) => sanitizeText(apartment.furnished) },
  { key: "drive", label: "Drive to Boyd (mile/min)", noteKeys: ["Drive to Boyd (mile/min)"], getValue: (apartment) => sanitizeText(apartment.raw?.drive) },
  { key: "bike", label: "Bike (mile/min)", noteKeys: ["Bike (mile/min)"], getValue: (apartment) => sanitizeText(apartment.raw?.bike) },
  { key: "bus", label: "Bus/shuttle", noteKeys: ["Bus/shuttle"], getValue: (apartment) => sanitizeText(apartment.raw?.bus) },
  { key: "rating", label: "Google Rating", noteKeys: ["Google Rating"], getValue: (apartment) => (apartment.googleRating === null || apartment.googleRating === undefined ? "" : String(apartment.googleRating)) },
  { key: "reviews", label: "Google Reviews", noteKeys: ["Google Reviews"], getValue: (apartment) => sanitizeText(apartment.googleReviewSummary) },
  {
    key: "fees",
    label: "Fees (if disclosed, excluding application fee)",
    noteKeys: ["Fees (if disclosed, excluding application fee)"],
    getValue: (apartment) => sanitizeText(apartment.fees),
  },
  {
    key: "amenities",
    label: "Community Amenities (Sports)",
    noteKeys: ["Community Amenities (Sports)"],
    getValue: (apartment) => sanitizeText(apartment.amenitiesText),
  },
  { key: "notes", label: "Notes", noteKeys: ["Notes"], getValue: (apartment) => sanitizeText(apartment.notes) },
  { key: "website", label: "Website", noteKeys: ["Website"], getValue: (apartment) => sanitizeText(apartment.website) },
];

init().catch((error) => {
  console.error(error);
  elements.body.innerHTML = '<tr><td class="sheet-table__index">-</td><td colspan="16">Failed to load data.</td></tr>';
});

async function init() {
  const payload = await readJson(DATA_PATH);

  bindFontControls();
  applyStoredFontScale();
  renderHead(payload);
  renderBody(payload.apartments);
  elements.meta.textContent = `${payload.apartments.length} rows, displayed in the original Excel column order`;
}

function renderHead(payload) {
  const headerRow = document.createElement("tr");
  const noteRow = document.createElement("tr");

  noteRow.className = "sheet-table__notes";
  headerRow.innerHTML = '<th class="sheet-table__index">Row</th>';
  noteRow.innerHTML = '<td class="sheet-table__index">Notes</td>';

  COLUMN_DEFS.forEach((column) => {
    const head = document.createElement("th");
    const note = document.createElement("td");

    head.textContent = column.label;
    note.textContent = findNote(payload.columnNotes, column.noteKeys);

    headerRow.append(head);
    noteRow.append(note);
  });

  elements.head.append(headerRow);
  elements.body.append(noteRow);
}

function renderBody(apartments) {
  const fragment = document.createDocumentFragment();

  apartments.forEach((apartment) => {
    fragment.append(createRow(apartment));
  });

  elements.body.append(fragment);
}

function createRow(apartment) {
  const row = document.createElement("tr");
  const indexCell = document.createElement("td");

  indexCell.className = "sheet-table__index";
  indexCell.textContent = String(apartment.rowNumber ?? "");
  row.append(indexCell);

  COLUMN_DEFS.forEach((column) => {
    row.append(createCell(column, apartment));
  });

  return row;
}

function createCell(column, apartment) {
  const cell = document.createElement("td");
  const value = column.getValue(apartment);

  if (column.key === "website" && value) {
    const link = document.createElement("a");

    link.className = "table-link";
    link.href = value;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = value;
    cell.append(link);
    return cell;
  }

  cell.textContent = value;
  return cell;
}

function findNote(notes, keys) {
  for (const key of keys) {
    const value = notes?.[key];
    if (value) {
      return sanitizeText(value);
    }
  }

  return "";
}

function bindFontControls() {
  elements.fontControls.forEach((button) => {
    button.addEventListener("click", () => {
      const scale = button.dataset.fontScale || "1";
      setTableFontScale(scale);
    });
  });
}

function applyStoredFontScale() {
  const scale = localStorage.getItem(TABLE_FONT_KEY) || "1";
  setTableFontScale(scale);
}

function setTableFontScale(scale) {
  document.documentElement.style.setProperty("--table-font-scale", String(scale));
  localStorage.setItem(TABLE_FONT_KEY, String(scale));

  elements.fontControls.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.fontScale === String(scale));
  });
}
