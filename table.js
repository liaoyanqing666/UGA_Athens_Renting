import { query, queryAll, readJson, sanitizeText } from "./app-utils.js";

const DATA_PATH = "./data/apartments.json";
const TABLE_FONT_KEY = "uga-table-font-scale";

const elements = {
  head: query("#sheet-head"),
  body: query("#sheet-body"),
  meta: query("#sheet-meta"),
  fontControls: queryAll(".font-control"),
};

const COLUMN_DEFS = [
  { key: "name", label: "名称", getValue: (apartment) => sanitizeText(apartment.name) },
  { key: "region", label: "地理位置", getValue: (apartment) => sanitizeText(apartment.region) },
  { key: "location", label: "位置", getValue: (apartment) => sanitizeText(apartment.location) },
  { key: "layouts", label: "房型", getValue: (apartment) => sanitizeText(apartment.raw?.layouts) },
  { key: "sizes", label: "大小", getValue: (apartment) => sanitizeText(apartment.raw?.sizes) },
  {
    key: "prices",
    label: "人均价格(最低)",
    getValue: (apartment) => sanitizeText(apartment.raw?.prices),
  },
  { key: "furnished", label: "家具", getValue: (apartment) => sanitizeText(apartment.furnished) },
  {
    key: "drive",
    label: "距离Boyd开车(mile/min)",
    getValue: (apartment) => sanitizeText(apartment.raw?.drive),
  },
  { key: "bike", label: "骑车(mile/min)", getValue: (apartment) => sanitizeText(apartment.raw?.bike) },
  {
    key: "bus",
    label: "公交/shuttle bus",
    getValue: (apartment) => sanitizeText(apartment.raw?.bus),
  },
  {
    key: "rating",
    label: "谷歌评分",
    getValue: (apartment) => (apartment.googleRating === null || apartment.googleRating === undefined ? "" : String(apartment.googleRating)),
  },
  { key: "reviews", label: "谷歌评价", getValue: (apartment) => sanitizeText(apartment.googleReviewSummary) },
  {
    key: "fees",
    label: "各种费用(如有写明)(不含申请费)",
    getValue: (apartment) => sanitizeText(apartment.fees),
  },
  {
    key: "amenities",
    label: "社区设施(运动)",
    getValue: (apartment) => sanitizeText(apartment.amenitiesText),
  },
  {
    key: "notes",
    label: "注意事项/备注",
    getValue: (apartment) => sanitizeText(apartment.notes),
  },
  { key: "website", label: "网址", getValue: (apartment) => sanitizeText(apartment.website) },
];

init().catch((error) => {
  console.error(error);
  elements.body.innerHTML = '<tr><td class="sheet-table__index">-</td><td colspan="16">数据加载失败。</td></tr>';
});

async function init() {
  const payload = await readJson(DATA_PATH);

  bindFontControls();
  applyStoredFontScale();
  renderHead(payload);
  renderBody(payload.apartments);
  elements.meta.textContent = `共 ${payload.apartments.length} 行，按 Excel 原列顺序展示`;
}

function renderHead(payload) {
  const headerRow = document.createElement("tr");
  const noteRow = document.createElement("tr");

  noteRow.className = "sheet-table__notes";
  headerRow.innerHTML = '<th class="sheet-table__index">行号</th>';
  noteRow.innerHTML = '<td class="sheet-table__index">说明</td>';

  COLUMN_DEFS.forEach((column) => {
    const head = document.createElement("th");
    const note = document.createElement("td");

    head.textContent = column.label;
    note.textContent = sanitizeText(payload.columnNotes?.[column.label]);

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
