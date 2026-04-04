from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parent.parent
SOURCE_GLOB = "*.xlsx"
OUTPUT_DIR = ROOT / "data"
OUTPUT_FILE = OUTPUT_DIR / "apartments.json"

HEADERS = [
    "名称",
    "地理位置",
    "位置",
    "房型",
    "大小",
    "人均价格(最低)",
    "家具",
    "距离Boyd开车(mile/min)",
    "骑车(mile/min)",
    "公交/shuttle bus",
    "谷歌评分",
    "谷歌评价",
    "各种费用(如有写明)(不含申请费)",
    "社区设施(运动)",
    "注意事项/备注",
    "网址",
]


@dataclass
class UnitOption:
    layout: str
    bedrooms: float | None
    bathrooms: float | None
    size_sqft: float | None
    min_price_per_person: float | None
    raw_size: str | None
    raw_price: str | None


def normalize_space(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        if int(value) == value:
            return str(int(value))
        return str(value)
    return " ".join(str(value).replace("\n", " ").split())


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "apartment"


def parse_number(value: str) -> float | None:
    match = re.search(r"\d+(?:\.\d+)?", value)
    return float(match.group()) if match else None


def parse_layout(layout: str) -> tuple[float | None, float | None]:
    layout = layout.strip().lower()
    if layout == "studio":
        return 0.0, 1.0
    match = re.fullmatch(r"(\d+(?:\.\d+)?)b(\d+(?:\.\d+)?)b", layout)
    if not match:
        return None, None
    return float(match.group(1)), float(match.group(2))


def parse_token_values(raw: Any) -> list[str]:
    text = normalize_space(raw)
    if not text or text == "未知":
        return []
    return re.findall(r"\S+", text)


def parse_commute_pair(raw: Any) -> dict[str, float | None | str]:
    text = normalize_space(raw)
    match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)", text)
    if not match:
        return {"raw": text, "miles": None, "minutes": None}
    return {
        "raw": text,
        "miles": float(match.group(1)),
        "minutes": float(match.group(2)),
    }


def parse_bus(raw: Any) -> dict[str, Any]:
    text = normalize_space(raw)
    minutes = parse_number(text)
    lowered = text.lower()
    has_shuttle = False if "无shuttle" in lowered else ("shuttle" in lowered if lowered else None)
    return {"raw": text, "minutes": minutes, "hasShuttle": has_shuttle}


def parse_amenities(raw: Any) -> list[str]:
    text = normalize_space(raw)
    if not text:
        return []
    return [item.strip() for item in re.split(r"[，、；;/]+", text) if item.strip()]


def build_units(layouts_raw: Any, sizes_raw: Any, prices_raw: Any) -> list[UnitOption]:
    layouts = parse_token_values(layouts_raw)
    sizes = parse_token_values(sizes_raw)
    prices = parse_token_values(prices_raw)

    units: list[UnitOption] = []
    for index, layout in enumerate(layouts):
        size_token = sizes[index] if index < len(sizes) else None
        price_token = prices[index] if index < len(prices) else None
        bedrooms, bathrooms = parse_layout(layout)
        units.append(
            UnitOption(
                layout=layout,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                size_sqft=parse_number(size_token) if size_token else None,
                min_price_per_person=parse_number(price_token) if price_token else None,
                raw_size=size_token,
                raw_price=price_token,
            )
        )
    return units


def main() -> None:
    source_candidates = sorted(ROOT.glob(SOURCE_GLOB))
    if not source_candidates:
        raise SystemExit("No source Excel file found.")

    source_file = source_candidates[0]
    workbook = load_workbook(source_file, data_only=True)
    worksheet = workbook[workbook.sheetnames[0]]
    rows = [list(row) for row in worksheet.iter_rows(values_only=True)]

    notes = dict(zip(HEADERS, rows[1]))
    apartments = []
    seen_slugs: dict[str, int] = {}

    for row_index, row in enumerate(rows[2:], start=3):
        if not any(value is not None for value in row):
            continue

        record = dict(zip(HEADERS, row[: len(HEADERS)]))
        name = normalize_space(record["名称"])
        base_slug = slugify(name)
        seen_slugs[base_slug] = seen_slugs.get(base_slug, 0) + 1
        slug = base_slug if seen_slugs[base_slug] == 1 else f"{base_slug}-{seen_slugs[base_slug]}"

        units = build_units(record["房型"], record["大小"], record["人均价格(最低)"])
        prices = [unit.min_price_per_person for unit in units if unit.min_price_per_person is not None]
        sizes = [unit.size_sqft for unit in units if unit.size_sqft is not None]
        drive = parse_commute_pair(record["距离Boyd开车(mile/min)"])
        bike = parse_commute_pair(record["骑车(mile/min)"])
        bus = parse_bus(record["公交/shuttle bus"])

        apartments.append(
            {
                "id": slug,
                "rowNumber": row_index,
                "name": name,
                "region": normalize_space(record["地理位置"]),
                "location": normalize_space(record["位置"]),
                "furnished": normalize_space(record["家具"]),
                "googleRating": parse_number(normalize_space(record["谷歌评分"])),
                "googleReviewSummary": normalize_space(record["谷歌评价"]),
                "fees": normalize_space(record["各种费用(如有写明)(不含申请费)"]),
                "amenitiesText": normalize_space(record["社区设施(运动)"]),
                "amenities": parse_amenities(record["社区设施(运动)"]),
                "notes": normalize_space(record["注意事项/备注"]),
                "website": normalize_space(record["网址"]),
                "commute": {
                    "drive": drive,
                    "bike": bike,
                    "bus": bus,
                },
                "units": [unit.__dict__ for unit in units],
                "summary": {
                    "unitCount": len(units),
                    "minPricePerPerson": min(prices) if prices else None,
                    "maxPricePerPerson": max(prices) if prices else None,
                    "minSizeSqft": min(sizes) if sizes else None,
                    "maxSizeSqft": max(sizes) if sizes else None,
                },
                "raw": {
                    "layouts": normalize_space(record["房型"]),
                    "sizes": normalize_space(record["大小"]),
                    "prices": normalize_space(record["人均价格(最低)"]),
                    "drive": normalize_space(record["距离Boyd开车(mile/min)"]),
                    "bike": normalize_space(record["骑车(mile/min)"]),
                    "bus": normalize_space(record["公交/shuttle bus"]),
                },
            }
        )

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceFile": source_file.name,
        "sheetName": worksheet.title,
        "columns": HEADERS,
        "columnNotes": notes,
        "recordCount": len(apartments),
        "apartments": apartments,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
