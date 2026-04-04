import { compareNullable, query, readJson, sanitizeText, toNumber } from "./app-utils.js";

const DATA_PATH = "./data/apartments.json";

const state = {
  apartments: [],
  filtered: [],
};

const elements = {
  cards: query("#cards"),
  results: query(".results"),
  regionGroup: query("#filter-region-group"),
  layoutGroup: query("#filter-layout-group"),
  furnished: query("#filter-furnished"),
  search: query("#filter-search"),
  maxPrice: query("#filter-max-price"),
  minRating: query("#filter-min-rating"),
  maxDrive: query("#filter-max-drive"),
  maxBus: query("#filter-max-bus"),
  sortBy: query("#sort-by"),
  reset: query("#reset-filters"),
  statTotal: query("#stat-total"),
  statVisible: query("#stat-visible"),
  resultsMeta: query("#results-meta"),
  notes: query("#column-notes"),
  template: query("#card-template"),
};

const noteLabels = {
  "人均价格(最低)": "人均价格（最低）",
  大小: "面积",
  "距离Boyd开车(mile/min)": "到 Boyd 开车距离",
  "公交/shuttle bus": "公交 / Shuttle",
  谷歌评价: "Google 评价",
};

const furnishedAliases = {
  含: "含家具",
  不含: "不含家具",
  "含/不含": "含 / 不含混合",
};

const regionPriorityRules = [
  { test: (value) => value === "downtown", rank: 0 },
  { test: (value) => value.includes("学校"), rank: 1 },
  { test: (value) => value.includes("雅典"), rank: 2 },
  { test: (value) => value.includes("周边城市"), rank: 3 },
];

init().catch((error) => {
  console.error(error);
  elements.cards.innerHTML = '<div class="empty-state">数据加载失败，请确认 <code>data/apartments.json</code> 已成功生成。</div>';
});

async function init() {
  const payload = await readJson(DATA_PATH);

  state.apartments = payload.apartments;
  state.filtered = [...payload.apartments];

  renderNotes(payload.columnNotes);
  populateRegionOptions(payload.apartments);
  populateLayoutOptions(payload.apartments);
  bindEvents();
  setupResponsiveGrid();
  applyFilters();
}

function bindEvents() {
  const filterInputs = [
    elements.furnished,
    elements.search,
    elements.maxPrice,
    elements.minRating,
    elements.maxDrive,
    elements.maxBus,
    elements.sortBy,
  ];

  filterInputs.forEach((element) => {
    element.addEventListener("input", applyFilters);
  });

  [elements.regionGroup, elements.layoutGroup].forEach((container) => {
    container.addEventListener("change", applyFilters);
  });

  elements.reset.addEventListener("click", resetFilters);
}

function resetFilters() {
  elements.furnished.value = "";
  elements.search.value = "";
  elements.maxPrice.value = "";
  elements.minRating.value = "";
  elements.maxDrive.value = "";
  elements.maxBus.value = "";
  elements.sortBy.value = "region-asc";

  clearCheckboxGroup(elements.regionGroup);
  clearCheckboxGroup(elements.layoutGroup);
  applyFilters();
}

function setupResponsiveGrid() {
  const syncColumns = () => {
    const width = elements.results.clientWidth;
    let columns = 3;

    if (width < 640) {
      columns = 1;
    } else if (width < 980) {
      columns = 2;
    } else if (width > 1500) {
      columns = 4;
    }

    elements.cards.style.setProperty("--card-columns", String(columns));
  };

  syncColumns();
  window.addEventListener("resize", syncColumns);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(syncColumns);
    observer.observe(elements.results);
  }
}

function populateRegionOptions(apartments) {
  const regions = [...new Set(apartments.map((item) => sanitizeText(item.region)).filter(Boolean))].sort(compareRegion);

  elements.regionGroup.innerHTML = "";
  regions.forEach((region) => {
    elements.regionGroup.append(createCheckbox("region", region, region));
  });
}

function populateLayoutOptions(apartments) {
  const layouts = apartments
    .flatMap((apartment) => apartment.units.map((unit) => sanitizeText(unit.layout)))
    .filter(Boolean);

  const uniqueLayouts = [...new Set(layouts)].sort((a, b) => a.localeCompare(b, "zh-CN"));

  elements.layoutGroup.innerHTML = "";
  uniqueLayouts.forEach((layout) => {
    elements.layoutGroup.append(createCheckbox("layout", layout, layout));
  });
}

function createCheckbox(name, value, label) {
  const wrapper = document.createElement("label");
  const input = document.createElement("input");
  const text = document.createElement("span");

  wrapper.className = "check-item";
  input.type = "checkbox";
  input.name = name;
  input.value = value;
  text.textContent = label;

  wrapper.append(input, text);
  return wrapper;
}

function renderNotes(columnNotes = {}) {
  elements.notes.innerHTML = "";

  Object.entries(columnNotes).forEach(([key, note]) => {
    if (!sanitizeText(note)) {
      return;
    }

    const item = document.createElement("li");
    item.textContent = `${noteLabels[key] || key}：${sanitizeText(note)}`;
    elements.notes.append(item);
  });
}

function applyFilters() {
  const search = elements.search.value.trim().toLowerCase();
  const selectedRegions = getCheckedValues(elements.regionGroup);
  const selectedLayouts = getCheckedValues(elements.layoutGroup);
  const furnished = elements.furnished.value;
  const maxPrice = toNumber(elements.maxPrice.value);
  const minRating = toNumber(elements.minRating.value);
  const maxDrive = toNumber(elements.maxDrive.value);
  const maxBus = toNumber(elements.maxBus.value);

  state.filtered = state.apartments.filter((apartment) => {
    if (selectedRegions.size && !selectedRegions.has(sanitizeText(apartment.region))) {
      return false;
    }

    if (furnished && normalizeFurnished(apartment.furnished) !== furnished) {
      return false;
    }

    if (search && !matchesSearch(apartment, search)) {
      return false;
    }

    if (maxPrice !== null && (apartment.summary.minPricePerPerson === null || apartment.summary.minPricePerPerson > maxPrice)) {
      return false;
    }

    if (minRating !== null && (apartment.googleRating === null || apartment.googleRating < minRating)) {
      return false;
    }

    if (maxDrive !== null && (apartment.commute.drive.minutes === null || apartment.commute.drive.minutes > maxDrive)) {
      return false;
    }

    if (maxBus !== null && (apartment.commute.bus.minutes === null || apartment.commute.bus.minutes > maxBus)) {
      return false;
    }

    if (selectedLayouts.size) {
      const hasLayoutMatch = apartment.units.some((unit) => selectedLayouts.has(sanitizeText(unit.layout)));
      if (!hasLayoutMatch) {
        return false;
      }
    }

    return true;
  });

  sortApartments();
  render();
}

function matchesSearch(apartment, search) {
  const haystack = [
    apartment.name,
    apartment.region,
    apartment.location,
    apartment.notes,
    apartment.amenitiesText,
    apartment.googleReviewSummary,
    apartment.fees,
  ]
    .map((value) => sanitizeText(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(search);
}

function sortApartments() {
  const sorters = {
    "region-asc": (a, b) => compareRegion(a.region, b.region) || a.name.localeCompare(b.name, "zh-CN"),
    "price-asc": (a, b) => compareNullable(a.summary.minPricePerPerson, b.summary.minPricePerPerson) || a.name.localeCompare(b.name, "zh-CN"),
    "rating-desc": (a, b) => compareNullable(b.googleRating, a.googleRating) || a.name.localeCompare(b.name, "zh-CN"),
    "drive-asc": (a, b) => compareNullable(a.commute.drive.minutes, b.commute.drive.minutes) || a.name.localeCompare(b.name, "zh-CN"),
    "bus-asc": (a, b) => compareNullable(a.commute.bus.minutes, b.commute.bus.minutes) || a.name.localeCompare(b.name, "zh-CN"),
    "name-asc": (a, b) => a.name.localeCompare(b.name, "zh-CN"),
  };

  const sorter = sorters[elements.sortBy.value] || sorters["region-asc"];
  state.filtered.sort(sorter);
}

function render() {
  elements.statTotal.textContent = String(state.apartments.length);
  elements.statVisible.textContent = String(state.filtered.length);
  elements.resultsMeta.textContent = `显示 ${state.filtered.length} / ${state.apartments.length} 个公寓`;

  if (!state.filtered.length) {
    elements.cards.innerHTML = '<div class="empty-state">没有符合当前筛选条件的结果。</div>';
    return;
  }

  elements.cards.innerHTML = "";

  const fragment = document.createDocumentFragment();
  state.filtered.forEach((apartment) => {
    fragment.append(createCard(apartment));
  });

  elements.cards.append(fragment);
}

function createCard(apartment) {
  const card = elements.template.content.firstElementChild.cloneNode(true);

  fillCardHeader(card, apartment);
  fillCardMetrics(card, apartment);
  fillCardDetails(card, apartment);
  fillCardTags(card, apartment);
  fillCardUnits(card, apartment);

  return card;
}

function fillCardHeader(card, apartment) {
  card.querySelector(".card__region").textContent = sanitizeText(apartment.region);
  card.querySelector(".card__title").textContent = sanitizeText(apartment.name);
  card.querySelector(".card__link").href = apartment.website;
}

function fillCardMetrics(card, apartment) {
  card.querySelector(".metric__price").textContent = formatCurrency(apartment.summary.minPricePerPerson);
  card.querySelector(".metric__rating").textContent = apartment.googleRating ? apartment.googleRating.toFixed(1) : "未知";
  card.querySelector(".metric__drive").textContent = formatCommute(apartment.commute.drive);
  card.querySelector(".metric__bus").textContent = formatBus(apartment.commute.bus);
}

function fillCardDetails(card, apartment) {
  card.querySelector(".card__reviews").textContent = sanitizeText(apartment.googleReviewSummary) || "暂无";
  card.querySelector(".card__fees").textContent = sanitizeText(apartment.fees) || "暂无";
  card.querySelector(".card__location").textContent = sanitizeText(apartment.location) || "暂无";
  card.querySelector(".card__amenities").textContent = sanitizeText(apartment.amenitiesText) || "暂无";
  card.querySelector(".card__notes").textContent = sanitizeText(apartment.notes) || "暂无";
  card.querySelector(".card__raw-commute").textContent = [
    `开车 ${sanitizeText(apartment.raw?.drive) || "未知"}`,
    `骑车 ${sanitizeText(apartment.raw?.bike) || "未知"}`,
    `公交 ${sanitizeText(apartment.raw?.bus) || "未知"}`,
  ].join(" / ");
}

function fillCardTags(card, apartment) {
  const tags = card.querySelector(".card__tags");

  createTag(tags, normalizeFurnished(apartment.furnished) || "家具未知");

  if (apartment.commute.bus.hasShuttle === true) {
    createTag(tags, "有 Shuttle");
  }

  apartment.amenities.slice(0, 3).forEach((item) => {
    createTag(tags, sanitizeText(item));
  });
}

function fillCardUnits(card, apartment) {
  const unitList = card.querySelector(".unit-list");

  apartment.units.forEach((unit) => {
    const pill = document.createElement("span");
    pill.className = "unit-pill";
    pill.textContent = `${sanitizeText(unit.layout)} | ${formatNullable(unit.size_sqft, " sqft")} | ${formatCurrency(unit.min_price_per_person)}`;
    unitList.append(pill);
  });
}

function createTag(container, text) {
  if (!text) {
    return;
  }

  const item = document.createElement("span");
  item.className = "tag";
  item.textContent = text;
  container.append(item);
}

function getCheckedValues(container) {
  const checked = container.querySelectorAll('input[type="checkbox"]:checked');
  return new Set([...checked].map((input) => input.value));
}

function clearCheckboxGroup(container) {
  container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
}

function compareRegion(a, b) {
  const rankA = getRegionRank(a);
  const rankB = getRegionRank(b);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return sanitizeText(a).localeCompare(sanitizeText(b), "zh-CN");
}

function getRegionRank(region) {
  const value = sanitizeText(region);

  for (const rule of regionPriorityRules) {
    if (rule.test(value)) {
      return rule.rank;
    }
  }

  return 99;
}

function formatCurrency(value) {
  return value === null || value === undefined ? "未知" : `$${Math.round(value)}`;
}

function formatNullable(value, suffix = "") {
  return value === null || value === undefined ? "未知" : `${Math.round(value)}${suffix}`;
}

function formatCommute(commute) {
  if (!commute || commute.minutes === null) {
    return "未知";
  }

  const miles = commute.miles === null ? "?" : commute.miles.toFixed(1);
  return `${miles} mi / ${Math.round(commute.minutes)} min`;
}

function formatBus(bus) {
  if (!bus || bus.minutes === null) {
    return "未知";
  }

  return `${Math.round(bus.minutes)} min`;
}

function normalizeFurnished(value) {
  return furnishedAliases[value] || sanitizeText(value);
}
