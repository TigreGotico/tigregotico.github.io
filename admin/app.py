"""
TigreGotico Admin Panel — CMS-style JSON editor with file uploads.
Run:  python admin/app.py

Upload destinations (existing folders, no new folders created):
  - Research PDFs     → public/research/
  - Featured images   → public/featured-projects/
  - Notebooks (.ipynb)→ public/notebooks/
"""

import json, shutil, datetime
from pathlib import Path
from typing import Any

from nicegui import ui, app, events

# ── paths ──────────────────────────────────────────────────────────────────────
BASE = Path(__file__).resolve().parent.parent / "public"
NOTEBOOKS_DIR = BASE / "notebooks"
RESEARCH_DIR = BASE / "research"
FEATURED_DIR = BASE / "featured-projects"

# ── section icons ──────────────────────────────────────────────────────────────
SECTION_ICONS = {
    "Datasets": "storage",
    "Featured Projects": "star",
    "Models": "model_training",
    "Notebooks": "menu_book",
    "Projects": "code",
    "Collaborations": "handshake",
    "Research": "science",
}

# ── field schemas ──────────────────────────────────────────────────────────────
JSON_FILES: dict[str, dict] = {
    "Datasets": {
        "path": BASE / "datasets" / "datasets.json",
        "ts_type": "Resource (Dataset)",
        "consumed_by": "Resources.tsx",
        "fields": [
            {"key": "id", "label": "ID", "dtype": "id", "icon": "fingerprint",
             "hint": "Unique React key. Not shown to users.", "required": True},
            {"key": "title", "label": "Title", "dtype": "string", "icon": "title",
             "hint": "Card title text.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Card body paragraph.", "required": True},
            {"key": "icon", "label": "Icon", "dtype": "icon_name", "icon": "image",
             "hint": "Currently ignored by frontend — hardcodes <Database>.", "required": False},
            {"key": "url", "label": "Collection URL", "dtype": "url", "icon": "link",
             "hint": "HuggingFace collection link. Opens in new tab.", "required": True},
        ],
    },
    "Featured Projects": {
        "path": FEATURED_DIR / "featured-projects.json",
        "ts_type": "FeaturedProject",
        "consumed_by": "FeaturedProjects.tsx → ProjectCarousel.tsx",
        "upload_dir": FEATURED_DIR,
        "fields": [
            {"key": "name", "label": "Name", "dtype": "string", "icon": "badge",
             "hint": "Carousel slide heading. First 2 chars = fallback avatar.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Paragraph in slide content area.", "required": True},
            {"key": "image", "label": "Image", "dtype": "image_upload", "icon": "image",
             "hint": "Fills half the carousel slide. Upload or paste URL. Saved to /featured-projects/.",
             "required": True, "upload_dir": FEATURED_DIR, "url_prefix": "/featured-projects/"},
            {"key": "github", "label": "GitHub URL", "dtype": "url", "icon": "link",
             "hint": "'View on GitHub' button target.", "required": True},
        ],
    },
    "Models": {
        "path": BASE / "models" / "models.json",
        "ts_type": "Resource (Model)",
        "consumed_by": "Resources.tsx",
        "fields": [
            {"key": "id", "label": "ID", "dtype": "id", "icon": "fingerprint",
             "hint": "Unique React key.", "required": True},
            {"key": "title", "label": "Title", "dtype": "string", "icon": "title",
             "hint": "Card title.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Card body.", "required": True},
            {"key": "icon", "label": "Icon", "dtype": "icon_name", "icon": "image",
             "hint": "Ignored — frontend hardcodes <Package>.", "required": False},
            {"key": "url", "label": "Collection URL", "dtype": "url", "icon": "link",
             "hint": "HuggingFace link.", "required": True},
        ],
    },
    "Notebooks": {
        "path": NOTEBOOKS_DIR / "notebooks.json",
        "ts_type": "Notebook",
        "consumed_by": "Resources.tsx → NotebookPreviewModal",
        "upload_dir": NOTEBOOKS_DIR,
        "fields": [
            {"key": "id", "label": "ID", "dtype": "id", "icon": "fingerprint",
             "hint": "React key. Fallback download filename.", "required": True},
            {"key": "title", "label": "Title", "dtype": "string", "icon": "title",
             "hint": "Card title + preview modal title.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Card body text.", "required": True},
            {"key": "url", "label": "Notebook", "dtype": "notebook_upload", "icon": "link",
             "hint": "Upload .ipynb or paste remote URL. Local files saved to /notebooks/.",
             "required": True, "upload_dir": NOTEBOOKS_DIR, "url_prefix": "/notebooks/"},
            {"key": "language", "label": "Language", "dtype": "enum", "icon": "code",
             "hint": "Monospace pill badge.", "options": ["python", "r", "julia", "scala"],
             "required": False},
            {"key": "tags", "label": "Tags", "dtype": "string[]", "icon": "label",
             "hint": "Orange pill badges on card.", "required": False},
            {"key": "date", "label": "Year", "dtype": "year", "icon": "calendar_today",
             "hint": "Badge with calendar icon.", "required": False},
        ],
    },
    "Projects": {
        "path": BASE / "projects" / "projects.json",
        "ts_type": "Project",
        "consumed_by": "Projects.tsx (GitHub API fallback)",
        "fields": [
            {"key": "name", "label": "Name", "dtype": "string", "icon": "badge",
             "hint": "Card title. Searchable.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Card body. Truncated in compact view.", "required": True},
            {"key": "url", "label": "GitHub URL", "dtype": "url", "icon": "link",
             "hint": "Wraps card as link.", "required": True},
            {"key": "category", "label": "Category", "dtype": "category", "icon": "category",
             "hint": "Tab/filter grouping.", "required": True},
            {"key": "tags", "label": "Tags", "dtype": "string[]", "icon": "label",
             "hint": "Colored pills. AND-based filtering.", "required": False},
        ],
    },
    "Collaborations": {
        "path": BASE / "projects" / "collaborations.json",
        "ts_type": "Collaboration",
        "consumed_by": "Projects.tsx",
        "fields": [
            {"key": "name", "label": "Name", "dtype": "string", "icon": "badge",
             "hint": "Section header.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Paragraph below header.", "required": True},
            {"key": "url", "label": "Website URL", "dtype": "url", "icon": "link",
             "hint": "'Visit' button target.", "required": True},
            {"key": "repositories", "label": "Repositories", "dtype": "url[]", "icon": "list",
             "hint": "GitHub URLs. Parsed for owner/repo display.", "required": False},
        ],
    },
    "Research": {
        "path": RESEARCH_DIR / "research-data.json",
        "ts_type": "ResearchPaper",
        "consumed_by": "Resources.tsx → downloadFile()",
        "upload_dir": RESEARCH_DIR,
        "fields": [
            {"key": "id", "label": "ID", "dtype": "id", "icon": "fingerprint",
             "hint": "Unique React key.", "required": True},
            {"key": "title", "label": "Title", "dtype": "string", "icon": "title",
             "hint": "Card title. Also download filename.", "required": True},
            {"key": "description", "label": "Description", "dtype": "text", "icon": "notes",
             "hint": "Card body paragraph.", "required": True},
            {"key": "filePath", "label": "PDF / File", "dtype": "file_upload", "icon": "upload_file",
             "hint": "Upload PDF/doc or type path. Saved to /research/. Used by downloadFile().",
             "required": True, "upload_dir": RESEARCH_DIR, "url_prefix": "research/",
             "accept": ".pdf,.doc,.docx,.txt,.md"},
            {"key": "fileType", "label": "File Type", "dtype": "enum", "icon": "description",
             "hint": "Format detection for download.", "options": ["pdf", "md", "txt", "docx"],
             "required": False},
            {"key": "buttonLabel", "label": "Button Label", "dtype": "string", "icon": "smart_button",
             "hint": "Custom button text. Default: 'Download'.", "required": False},
            {"key": "date", "label": "Year", "dtype": "year", "icon": "calendar_today",
             "hint": "Badge with calendar icon.", "required": False},
            {"key": "authors", "label": "Authors", "dtype": "string[]", "icon": "person",
             "hint": "Badge per author with User icon.", "required": False},
            {"key": "tags", "label": "Tags", "dtype": "string[]", "icon": "label",
             "hint": "Purple pill badges.", "required": False},
        ],
    },
}

# ── colors ─────────────────────────────────────────────────────────────────────
DTYPE_COLORS = {
    "id": "blue-grey", "string": "grey", "text": "grey", "url": "cyan",
    "image_upload": "amber", "notebook_upload": "orange", "file_upload": "lime",
    "icon_name": "pink", "enum": "deep-purple", "category": "teal", "year": "brown",
    "string[]": "indigo", "url[]": "cyan",
}
DTYPE_LABELS = {
    "id": "ID", "string": "String", "text": "Long Text", "url": "URL",
    "image_upload": "Image (upload/URL)", "notebook_upload": "Notebook (upload/URL)",
    "file_upload": "File (upload/path)", "icon_name": "Icon (unused)",
    "enum": "Select", "category": "Category", "year": "Year",
    "string[]": "Tags", "url[]": "URL List",
}




# ── helpers ────────────────────────────────────────────────────────────────────
def load_json(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))

def save_json(path: Path, data: list[dict]) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def item_label(item: dict) -> str:
    return item.get("title") or item.get("name") or item.get("id") or "Untitled"

def blank_item(fields: list[dict]) -> dict:
    r: dict = {}
    for f in fields:
        if f["dtype"] in ("string[]", "url[]"):
            r[f["key"]] = []
        elif f["dtype"] == "enum":
            r[f["key"]] = f.get("options", [""])[0]
        else:
            r[f["key"]] = ""
    return r

def slugify(text: str) -> str:
    return text.lower().strip().replace(" ", "-").replace("_", "-")

def discover_local_notebooks() -> list[str]:
    return sorted(f"/notebooks/{p.name}" for p in NOTEBOOKS_DIR.glob("*.ipynb"))

def get_notebook_cell_summary(url_path: str) -> list[dict]:
    resolved = BASE / url_path.lstrip("/")
    if not resolved.exists():
        return []
    try:
        nb = json.loads(resolved.read_text(encoding="utf-8"))
        summary = []
        for i, cell in enumerate(nb.get("cells", [])):
            ctype = cell.get("cell_type", "unknown")
            source = "".join(cell.get("source", []))
            summary.append({"index": i, "type": ctype, "preview": source[:300].strip(),
                            "lines": source.count("\n") + 1})
        return summary
    except Exception:
        return []

def collect_existing_values(section_name: str, key: str) -> list[str]:
    vals: set[str] = set()
    for item in current_data.get(section_name, []):
        v = item.get(key)
        if isinstance(v, list): vals.update(v)
        elif isinstance(v, str) and v: vals.add(v)
    return sorted(vals)

def collect_existing_categories() -> list[str]:
    return sorted({it.get("category", "") for it in current_data.get("Projects", []) if it.get("category")})

def validate_field(value: Any, field: dict) -> str | None:
    dtype, required = field["dtype"], field.get("required", False)
    if required:
        if isinstance(value, list) and not value: return "Required"
        if isinstance(value, str) and not value.strip(): return "Required"
    if not value: return None
    if dtype in ("url",) and isinstance(value, str) and not (value.startswith("http") or value.startswith("/")):
        return "Should start with http(s):// or /"
    if dtype == "year" and isinstance(value, str) and not value.isdigit():
        return "Should be a year (e.g. 2026)"
    if dtype == "id" and isinstance(value, str) and " " in value:
        return "No spaces — use hyphens"
    return None


# ── state ──────────────────────────────────────────────────────────────────────
current_section = {"name": "Datasets"}
current_data: dict[str, list[dict]] = {}
for name, cfg in JSON_FILES.items():
    current_data[name] = load_json(cfg["path"])


# ── upload handler ─────────────────────────────────────────────────────────────
def handle_upload(e: events.UploadEventArguments, dest_dir: Path, url_prefix: str,
                  input_elem) -> None:
    """Save uploaded file to dest_dir, set input value to the served path."""
    filename = e.name
    dest = dest_dir / filename
    # write file
    dest.write_bytes(e.content.read())
    # set the path in the input
    served_path = f"{url_prefix}{filename}" if not url_prefix.startswith("/") else f"{url_prefix}{filename}"
    input_elem.set_value(served_path)
    ui.notify(f"Uploaded: {filename}", type="positive", position="bottom-right")


# ── field builder ──────────────────────────────────────────────────────────────
def build_field(field: dict, item: dict, refs: dict, section_name: str):
    key, dtype, label = field["key"], field["dtype"], field["label"]
    icon, hint = field.get("icon"), field.get("hint", "")
    required = field.get("required", False)

    with ui.column().classes("w-full gap-1"):
        # header row with dtype badge
        with ui.row().classes("items-center gap-2"):
            dc = DTYPE_COLORS.get(dtype, "grey")
            ui.badge(DTYPE_LABELS.get(dtype, dtype), color=dc).props("dense outline")
            if required:
                ui.badge("required", color="red").props("dense")
            if hint:
                ui.icon("info_outline", size="14px", color="grey").tooltip(hint)

        # ── text / string ──────────────────────────────────────────
        if dtype == "text":
            elem = ui.textarea(label, value=item.get(key, "")).props(
                f'filled autogrow icon={icon}'
            ).classes("w-full")

        # ── tags (string[]) ────────────────────────────────────────
        elif dtype == "string[]":
            raw = item.get(key, [])
            val = ", ".join(raw) if isinstance(raw, list) else str(raw)
            existing = collect_existing_values(section_name, key)
            elem = ui.input(label, value=val).props(f'filled icon={icon}').classes("w-full")
            if existing:
                with ui.row().classes("gap-1 flex-wrap"):
                    for t in existing[:15]:
                        ui.chip(t, icon="add", color="indigo").props(
                            "dense clickable outline size=sm"
                        ).on("click", lambda _, tag=t: _append_tag(elem, tag))

        # ── url list ───────────────────────────────────────────────
        elif dtype == "url[]":
            raw = item.get(key, [])
            val = "\n".join(raw) if isinstance(raw, list) else str(raw)
            elem = ui.textarea(label, value=val).props(f'filled autogrow icon={icon}').classes("w-full")
            ui.label("One URL per line").classes("text-[10px] opacity-30")

        # ── plain url ──────────────────────────────────────────────
        elif dtype == "url":
            elem = ui.input(label, value=item.get(key, "")).props(f'filled icon={icon}').classes("w-full")
            v = item.get(key, "")
            if v:
                ui.link("Open ↗", v, new_tab=True).classes("text-xs text-indigo-400")

        # ── IMAGE UPLOAD ───────────────────────────────────────────
        elif dtype == "image_upload":
            current_val = item.get(key, "")
            elem = ui.input(label, value=current_val).props(f'filled icon={icon}').classes("w-full")

            upload_dir = field.get("upload_dir", FEATURED_DIR)
            url_prefix = field.get("url_prefix", "/featured-projects/")

            with ui.row().classes("items-center gap-2 mt-1"):
                ui.upload(
                    label="Upload Image",
                    auto_upload=True,
                    on_upload=lambda e, d=upload_dir, p=url_prefix, el=elem: handle_upload(e, d, p, el),
                ).props('accept="image/*" flat dense color=indigo').classes("max-w-[200px]")

                # list existing images in folder
                existing_imgs = sorted(
                    f.name for f in upload_dir.iterdir()
                    if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")
                )
                if existing_imgs:
                    ui.select(
                        existing_imgs, label="Or choose existing",
                        on_change=lambda e, pf=url_prefix: elem.set_value(f"{pf}{e.value}")
                    ).props("filled dense").classes("min-w-[180px]")

            # preview
            if current_val:
                with ui.card().classes("mt-1 p-2").props("flat bordered"):
                    # For local paths, serve via nicegui static; for URLs, use directly
                    src = current_val
                    ui.image(src).classes("max-w-[200px] rounded")

        # ── NOTEBOOK UPLOAD ────────────────────────────────────────
        elif dtype == "notebook_upload":
            current_val = item.get(key, "")
            elem = ui.input(label, value=current_val).props(f'filled icon={icon}').classes("w-full")

            upload_dir = field.get("upload_dir", NOTEBOOKS_DIR)
            url_prefix = field.get("url_prefix", "/notebooks/")

            with ui.row().classes("items-center gap-2 mt-1"):
                ui.upload(
                    label="Upload .ipynb",
                    auto_upload=True,
                    on_upload=lambda e, d=upload_dir, p=url_prefix, el=elem: handle_upload(e, d, p, el),
                ).props('accept=".ipynb" flat dense color=amber').classes("max-w-[200px]")

                local_nbs = discover_local_notebooks()
                if local_nbs:
                    names = [nb.split("/")[-1] for nb in local_nbs]
                    ui.select(
                        dict(zip(local_nbs, names)), label="Or choose existing",
                        on_change=lambda e: elem.set_value(e.value)
                    ).props("filled dense").classes("min-w-[180px]")

            # notebook preview
            if current_val and current_val.startswith("/notebooks/"):
                cells = get_notebook_cell_summary(current_val)
                if cells:
                    code_c = sum(1 for c in cells if c["type"] == "code")
                    md_c = sum(1 for c in cells if c["type"] == "markdown")
                    total_l = sum(c["lines"] for c in cells)
                    with ui.row().classes("gap-2 mt-1"):
                        ui.badge(f"{len(cells)} cells", color="indigo").props("dense")
                        ui.badge(f"{code_c} code", color="amber").props("dense")
                        ui.badge(f"{md_c} md", color="grey").props("dense")
                        ui.badge(f"~{total_l} lines", color="grey").props("dense outline")

                    with ui.expansion("Preview cells", icon="preview").classes("w-full mt-1"):
                        for cell in cells[:12]:
                            ic = cell["type"] == "code"
                            with ui.card().classes("w-full p-2 mb-1").props("flat bordered"):
                                with ui.row().classes("items-center gap-2 mb-1"):
                                    ui.icon("code" if ic else "text_snippet", size="14px",
                                            color="amber" if ic else "grey")
                                    ui.badge(
                                        f"[{cell['index']+1}] {cell['type']} · {cell['lines']}L",
                                        color="amber" if ic else "grey"
                                    ).props("dense outline")
                                ui.label(cell["preview"][:200] or "(empty)").classes(
                                    "text-xs font-mono whitespace-pre-wrap opacity-70"
                                ).style("max-height: 60px; overflow: hidden")

        # ── FILE UPLOAD (research PDFs etc.) ───────────────────────
        elif dtype == "file_upload":
            current_val = item.get(key, "")
            elem = ui.input(label, value=current_val).props(f'filled icon={icon}').classes("w-full")

            upload_dir = field.get("upload_dir", RESEARCH_DIR)
            url_prefix = field.get("url_prefix", "research/")
            accept = field.get("accept", ".pdf,.doc,.docx,.txt,.md")

            with ui.row().classes("items-center gap-2 mt-1"):
                ui.upload(
                    label="Upload File",
                    auto_upload=True,
                    on_upload=lambda e, d=upload_dir, p=url_prefix, el=elem: handle_upload(e, d, p, el),
                ).props(f'accept="{accept}" flat dense color=green').classes("max-w-[200px]")

                existing_files = sorted(
                    f.name for f in upload_dir.iterdir()
                    if f.suffix.lower() in (".pdf", ".doc", ".docx", ".txt", ".md") and not f.name.endswith(".json")
                )
                if existing_files:
                    ui.select(
                        existing_files, label="Or choose existing",
                        on_change=lambda e, pf=url_prefix: elem.set_value(f"{pf}{e.value}")
                    ).props("filled dense").classes("min-w-[180px]")

            # file status
            if current_val:
                resolved = BASE / current_val
                exists = resolved.exists()
                if exists:
                    size_kb = resolved.stat().st_size / 1024
                    ui.label(f"✓ {resolved.name} ({size_kb:.0f} KB)").classes("text-xs text-green-400")
                else:
                    ui.label(f"✗ File not found: {current_val}").classes("text-xs text-red-400")

        # ── enum select ────────────────────────────────────────────
        elif dtype == "enum":
            options = field.get("options", [])
            elem = ui.select(options, value=item.get(key, ""), label=label).props(
                f'filled icon={icon}'
            ).classes("w-full")

        # ── category (select + create) ─────────────────────────────
        elif dtype == "category":
            categories = collect_existing_categories()
            cv = item.get(key, "")
            if cv and cv not in categories: categories.append(cv)
            elem = ui.select(
                categories, value=cv, label=label, new_value_mode="add-unique"
            ).props(f'filled icon={icon}').classes("w-full")

        # ── icon_name (warn unused) ────────────────────────────────
        elif dtype == "icon_name":
            elem = ui.input(label, value=item.get(key, "")).props(f'filled icon={icon}').classes("w-full")
            if item.get(key):
                ui.label("Frontend ignores this field").classes("text-[10px] text-amber-400")

        # ── id ─────────────────────────────────────────────────────
        elif dtype == "id":
            elem = ui.input(label, value=item.get(key, "")).props(f'filled icon={icon}').classes("w-full")
            v = item.get(key, "")
            if v:
                dupes = sum(1 for it in current_data.get(section_name, []) if it.get(key) == v)
                if dupes > 1:
                    ui.label(f"Duplicate ID ({dupes}×)").classes("text-[10px] text-red-400")

        # ── year ───────────────────────────────────────────────────
        elif dtype == "year":
            yr = item.get(key, str(datetime.datetime.now().year))
            elem = ui.input(label, value=yr).props(f'filled icon={icon}').classes("w-full max-w-[140px]")

        # ── fallback string ────────────────────────────────────────
        else:
            elem = ui.input(label, value=item.get(key, "")).props(f'filled icon={icon}').classes("w-full")

        refs[key] = (elem, dtype)


def _append_tag(input_elem, tag: str):
    cur = input_elem.value or ""
    tags = [t.strip() for t in cur.split(",") if t.strip()]
    if tag not in tags:
        tags.append(tag)
        input_elem.set_value(", ".join(tags))


def read_field(refs: dict, key: str) -> Any:
    elem, dtype = refs[key]
    val = elem.value
    if dtype == "string[]":
        return [t.strip() for t in val.split(",") if t.strip()] if val else []
    if dtype == "url[]":
        return [l.strip() for l in val.splitlines() if l.strip()] if val else []
    return val or ""


# ══════════════════════════════════════════════════════════════════════════════
#  PAGE
# ══════════════════════════════════════════════════════════════════════════════
@ui.page("/")
def index_page():
    # ── minimal styles (NiceGUI defaults + Inter font) ─────────────────
    ui.add_head_html("""
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet">
    <style>
      body, .q-page, .q-drawer, .q-header {
        font-family: 'Inter', sans-serif !important;
      }
      .sidebar-btn {
        text-transform: none !important;
        justify-content: flex-start !important;
        border-radius: 8px !important;
        padding: 10px 14px !important;
        margin-bottom: 2px !important;
      }
      .sidebar-btn-active {
        background: rgba(25, 118, 210, 0.08) !important;
        color: #1976d2 !important;
        font-weight: 600 !important;
      }
      .item-card {
        border-radius: 10px !important;
      }
      .ctx-banner {
        background: rgba(25, 118, 210, 0.05) !important;
        border: 1px solid rgba(25, 118, 210, 0.12) !important;
        border-radius: 8px !important;
      }
    </style>
    """)

    content_area = None
    section_buttons: dict[str, ui.button] = {}

    def switch_section(name: str):
        current_section["name"] = name
        for bn, bt in section_buttons.items():
            bt.classes(add="sidebar-btn-active" if bn == name else "", remove="" if bn == name else "sidebar-btn-active")
        render_content()

    # ── render content ─────────────────────────────────────────────────────
    def render_content():
        content_area.clear()
        name = current_section["name"]
        cfg = JSON_FILES[name]
        fields = cfg["fields"]
        items = current_data[name]
        sec_icon = SECTION_ICONS.get(name, "folder")

        with content_area:
            # header
            with ui.row().classes("w-full items-center justify-between mb-4"):
                with ui.row().classes("items-center gap-3"):
                    ui.icon(sec_icon, size="28px", color="primary")
                    ui.label(name).classes("text-xl font-semibold")
                    ui.badge(str(len(items)), color="primary").props("dense")
                ui.button("Add New", on_click=lambda: open_editor(None), icon="add").props(
                    "unelevated color=primary no-caps size=sm"
                ).style("border-radius: 6px")

            # context banner
            ts_type = cfg.get("ts_type", "")
            consumed = cfg.get("consumed_by", "")
            with ui.card().classes("w-full ctx-banner p-3 mb-4"):
                with ui.row().classes("items-center gap-4 flex-wrap"):
                    if ts_type:
                        with ui.row().classes("items-center gap-1"):
                            ui.icon("data_object", size="14px", color="grey")
                            ui.label(ts_type).classes("text-xs opacity-60 font-mono")
                    if consumed:
                        with ui.row().classes("items-center gap-1"):
                            ui.icon("widgets", size="14px", color="grey")
                            ui.label(consumed).classes("text-xs opacity-60")
                with ui.row().classes("gap-1 flex-wrap mt-1"):
                    for f in fields:
                        c = DTYPE_COLORS.get(f["dtype"], "grey")
                        ui.badge(f'{f["key"]}:{f["dtype"]}', color=c).props("dense outline")

            # search
            search = ui.input(placeholder="Search…").props(
                "outlined dense clearable"
            ).classes("w-full max-w-sm mb-4 search-box")

            container = ui.column().classes("w-full gap-2")

            def render_items(ft: str = ""):
                container.clear()
                n = 0
                with container:
                    for idx, itm in enumerate(items):
                        if ft and ft.lower() not in json.dumps(itm).lower():
                            continue
                        _render_card(idx, itm, fields, name)
                        n += 1
                    if n == 0:
                        with ui.column().classes("w-full items-center py-12 opacity-25"):
                            ui.icon("search_off", size="48px")
                            ui.label("No items found")

            search.on("update:model-value", lambda e: render_items(e.args or ""))
            render_items()

    # ── card ───────────────────────────────────────────────────────────────
    def _render_card(idx: int, item: dict, fields: list[dict], section: str):
        lbl = item_label(item)
        desc = item.get("description", "")
        tags = item.get("tags", [])
        cat = item.get("category", "")
        url = item.get("url") or item.get("github") or ""
        is_nb = section == "Notebooks"

        with ui.card().classes("w-full item-card p-0"):
            with ui.card_section().classes("px-4 py-3"):
                with ui.row().classes("w-full items-start justify-between gap-3"):
                    # left
                    with ui.column().classes("flex-1 gap-1"):
                        with ui.row().classes("items-center gap-2"):
                            if is_nb:
                                lang = item.get("language", "python")
                                lc = {"python": "amber", "r": "blue", "julia": "purple", "scala": "red"}
                                ui.icon("menu_book", color=lc.get(lang, "grey"), size="18px")
                            ui.label(lbl).classes("text-sm font-semibold")
                            ui.badge(f"#{idx+1}", color="grey").props("dense outline")

                        if desc:
                            ui.label(desc[:140] + ("…" if len(desc) > 140 else "")).classes(
                                "text-xs opacity-65 leading-snug"
                            )

                        with ui.row().classes("gap-1 mt-1 flex-wrap"):
                            if cat:
                                ui.badge(cat, color="teal").props("dense")
                            if is_nb:
                                if item.get("language"): ui.badge(item["language"], color="amber").props("dense")
                                if item.get("date"): ui.badge(item["date"], color="grey").props("dense outline")
                                nb_url = item.get("url", "")
                                ui.badge("local" if nb_url.startswith("/") else "remote",
                                         color="green" if nb_url.startswith("/") else "orange").props("dense")
                            for t in (tags[:5] if isinstance(tags, list) else []):
                                ui.badge(t, color="indigo").props("dense outline")
                            if isinstance(tags, list) and len(tags) > 5:
                                ui.badge(f"+{len(tags)-5}", color="grey").props("dense")

                        if url:
                            ui.link(url[:65] + ("…" if len(url) > 65 else ""), url, new_tab=True).classes(
                                "text-[10px] opacity-50 no-underline hover:opacity-75 mt-1"
                            )

                    # right actions  
                    with ui.button_group().props("flat rounded"):
                        ui.button(icon="edit", on_click=lambda i=idx: open_editor(i)).props(
                            "flat dense size=sm color=primary"
                        ).tooltip("Edit")
                        if is_nb and item.get("url", "").startswith("/"):
                            ui.button(icon="preview", on_click=lambda i=idx: preview_nb(i)).props(
                                "flat dense size=sm color=amber"
                            ).tooltip("Preview")
                        ui.button(icon="content_copy", on_click=lambda i=idx: dup(i)).props(
                            "flat dense size=sm color=grey"
                        ).tooltip("Duplicate")
                        if idx > 0:
                            ui.button(icon="arrow_upward", on_click=lambda i=idx: move(i, -1)).props(
                                "flat dense size=sm color=grey"
                            ).tooltip("Up")
                        if idx < len(current_data[current_section["name"]]) - 1:
                            ui.button(icon="arrow_downward", on_click=lambda i=idx: move(i, 1)).props(
                                "flat dense size=sm color=grey"
                            ).tooltip("Down")
                        ui.button(icon="delete_outline", on_click=lambda i=idx: confirm_del(i)).props(
                            "flat dense size=sm color=red"
                        ).tooltip("Delete")

    # ── actions ────────────────────────────────────────────────────────────
    def move(idx, d):
        n = current_section["name"]; c = JSON_FILES[n]; items = current_data[n]
        ni = idx + d
        if 0 <= ni < len(items):
            items[idx], items[ni] = items[ni], items[idx]
            save_json(c["path"], items); render_content()

    def dup(idx):
        n = current_section["name"]; c = JSON_FILES[n]
        clone = json.loads(json.dumps(current_data[n][idx]))
        for k in ("id", "name", "title"):
            if k in clone: clone[k] += " (copy)"; break
        current_data[n].insert(idx+1, clone)
        save_json(c["path"], current_data[n])
        ui.notify("Duplicated", type="info", position="bottom-right"); render_content()

    def preview_nb(idx):
        n = current_section["name"]; item = current_data[n][idx]
        cells = get_notebook_cell_summary(item.get("url", ""))
        if not cells: ui.notify("Can't read notebook", type="warning"); return
        cc = sum(1 for c in cells if c["type"] == "code")
        mc = sum(1 for c in cells if c["type"] == "markdown")
        tl = sum(c["lines"] for c in cells)

        with ui.dialog().classes("editor-dialog") as dlg, ui.card().classes("w-full max-w-3xl"):
            with ui.row().classes("w-full items-center justify-between mb-2"):
                ui.label(item_label(item)).classes("text-base font-semibold")
                ui.button(icon="close", on_click=dlg.close).props("flat round dense size=sm")
            with ui.row().classes("gap-2 mb-2"):
                ui.badge(f"{len(cells)} cells", color="indigo").props("dense")
                ui.badge(f"{cc} code", color="amber").props("dense")
                ui.badge(f"{mc} md", color="grey").props("dense")
                ui.badge(f"~{tl}L", color="grey").props("dense outline")
            ui.separator()
            with ui.scroll_area().style("max-height: 60vh"):
                for cell in cells:
                    ic = cell["type"] == "code"
                    with ui.card().classes("w-full p-2 mb-1").props("flat bordered"):
                        with ui.row().classes("items-center gap-2 mb-1"):
                            ui.icon("code" if ic else "text_snippet", size="14px",
                                    color="amber" if ic else "grey-6")
                            ui.badge(f"[{cell['index']+1}] {cell['type']}",
                                     color="amber" if ic else "grey").props("dense outline")
                        ui.label(cell["preview"][:250] or "(empty)").classes(
                            "text-xs font-mono whitespace-pre-wrap opacity-60"
                        ).style("max-height: 80px; overflow: hidden")
        dlg.open()

    def open_editor(idx):
        n = current_section["name"]; cfg = JSON_FILES[n]; fields = cfg["fields"]
        is_new = idx is None
        item = blank_item(fields) if is_new else json.loads(json.dumps(current_data[n][idx]))
        refs = {}

        with ui.dialog().classes("editor-dialog").props("persistent") as dlg, \
             ui.card().classes("w-full max-w-2xl"):
            with ui.row().classes("w-full items-center justify-between mb-2"):
                with ui.row().classes("items-center gap-2"):
                    ui.icon("add_circle" if is_new else "edit", color="primary", size="20px")
                    ui.label("New Item" if is_new else f"Edit: {item_label(item)}").classes(
                        "text-base font-semibold")
                ui.button(icon="close", on_click=dlg.close).props("flat round dense size=sm")

            ts = cfg.get("ts_type", "")
            if ts: ui.label(f"Schema: {ts}").classes("text-[10px] font-mono opacity-25 mb-1")
            ui.separator()

            with ui.scroll_area().classes("w-full").style("max-height: 58vh"):
                with ui.column().classes("w-full gap-4 p-3"):
                    for f in fields:
                        build_field(f, item, refs, n)

            ui.separator()
            with ui.row().classes("w-full justify-between items-center mt-2"):
                ui.label(f"Item {idx+1}/{len(current_data[n])}" if not is_new else "").classes(
                    "text-xs opacity-25")
                with ui.row().classes("gap-2"):
                    ui.button("Cancel", on_click=dlg.close).props("flat no-caps color=grey-6 size=sm")
                    def save(is_new=is_new, idx=idx):
                        new_item, errs = {}, []
                        for f in fields:
                            v = read_field(refs, f["key"])
                            e = validate_field(v, f)
                            if e: errs.append(f'{f["label"]}: {e}')
                            new_item[f["key"]] = v
                        if errs:
                            for e in errs: ui.notify(e, type="negative", position="top")
                            return
                        if is_new: current_data[n].append(new_item)
                        else: current_data[n][idx] = new_item
                        save_json(cfg["path"], current_data[n]); dlg.close()
                        ui.notify("Saved!" if not is_new else "Created!", type="positive",
                                  position="bottom-right")
                        render_content()
                    ui.button("Save", on_click=save, icon="check").props(
                        "unelevated color=primary no-caps size=sm"
                    ).style("border-radius: 6px")
        dlg.open()

    def confirm_del(idx):
        n = current_section["name"]; cfg = JSON_FILES[n]; item = current_data[n][idx]
        with ui.dialog() as dlg, ui.card().classes("max-w-sm"):
            with ui.column().classes("items-center text-center gap-2 p-4"):
                ui.icon("warning_amber", size="36px", color="red")
                ui.label("Delete?").classes("text-base font-semibold")
                ui.label(f'"{item_label(item)}"').classes("text-sm opacity-50")
                with ui.row().classes("gap-2 mt-2"):
                    ui.button("Cancel", on_click=dlg.close).props("flat no-caps color=grey-6 size=sm")
                    def do_del():
                        current_data[n].pop(idx); save_json(cfg["path"], current_data[n])
                        dlg.close(); ui.notify("Deleted", type="warning", position="bottom-right")
                        render_content()
                    ui.button("Delete", on_click=do_del, icon="delete").props(
                        "unelevated color=red no-caps size=sm").style("border-radius: 6px")
        dlg.open()

    def open_json_viewer():
        n = current_section["name"]; data = current_data[n]
        with ui.dialog().classes("editor-dialog") as dlg, ui.card().classes("w-full max-w-3xl"):
            with ui.row().classes("w-full items-center justify-between mb-2"):
                ui.label(f"JSON — {n}").classes("text-base font-semibold font-mono")
                ui.button(icon="close", on_click=dlg.close).props("flat round dense size=sm")
            ui.separator()
            with ui.scroll_area().style("max-height: 65vh"):
                ui.code(json.dumps(data, indent=2, ensure_ascii=False), language="json").classes("w-full")
        dlg.open()

    # ══════════════════════════════════════════════════════════════════════
    # LAYOUT
    # ══════════════════════════════════════════════════════════════════════

    with ui.header().classes("items-center px-5 h-12"):
        ui.icon("pets", color="primary", size="20px")
        ui.label("TigreGotico").classes("text-base font-semibold ml-1")
        ui.space()
        ui.label("Admin").classes("text-xs opacity-50")
        ui.separator().props("vertical").classes("mx-2 h-5")
        ui.button(icon="data_object", on_click=open_json_viewer).props(
            "flat round dense size=sm"
        ).tooltip("View raw JSON")

    with ui.left_drawer(value=True).classes("p-3").props("width=230 bordered"):
        ui.label("SECTIONS").classes("text-[9px] font-bold tracking-[3px] opacity-30 mb-3 ml-2")

        for sn in JSON_FILES:
            cnt = len(current_data[sn])
            si = SECTION_ICONS.get(sn, "folder")
            with ui.button(on_click=lambda n=sn: switch_section(n)).classes(
                "sidebar-btn w-full"
            ).props("flat align=left no-caps") as btn:
                with ui.row().classes("items-center gap-3 w-full no-wrap"):
                    ui.icon(si, size="18px", color="primary")
                    ui.label(sn).classes("flex-1 text-left text-sm")
                    ui.badge(str(cnt), color="grey").props("dense")
            section_buttons[sn] = btn

        ui.space()
        with ui.column().classes("mt-auto opacity-30 text-[9px] p-2 gap-1"):
            ui.separator()
            ui.label("Auto-saves to disk")
            ui.label("Upload files inline")
            ui.label("Type-aware validation")

    content_area = ui.column().classes("w-full p-6 max-w-5xl mx-auto")

    # serve uploaded/static files from public/
    app.add_static_files("/featured-projects", str(FEATURED_DIR))
    app.add_static_files("/research", str(RESEARCH_DIR))
    app.add_static_files("/notebooks", str(NOTEBOOKS_DIR))

    switch_section("Datasets")


# ── run ────────────────────────────────────────────────────────────────────────
if __name__ in {"__main__", "__mp_main__"}:
    ui.run(title="TigreGotico Admin", port=8090, reload=True)
