extends Control

const RESOLUTIONS = [
	{"label": "1280 × 720",  "size": Vector2i(1280, 720)},
	{"label": "1600 × 900",  "size": Vector2i(1600, 900)},
	{"label": "1920 × 1080", "size": Vector2i(1920, 1080)},
	{"label": "2560 × 1440", "size": Vector2i(2560, 1440)},
]

var _res_btns:  Array = []
var _lang_btns: Dictionary = {}

func _es() -> bool:
	return I18nManager.get_language() == "es"

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_build_ui()

func _build_ui() -> void:
	var bg := TextureRect.new()
	bg.texture      = load("res://assets/images/ui/menu/background.png")
	bg.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.size         = Vector2(1280, 720)
	bg.position     = Vector2.ZERO
	add_child(bg)

	var overlay := ColorRect.new()
	overlay.size     = Vector2(1280, 720)
	overlay.position = Vector2.ZERO
	overlay.color    = Color(0.0, 0.0, 0.0, 0.52)
	add_child(overlay)

	# Panel central 720×520
	var pw: float = 720.0
	var ph: float = 520.0
	var px: float = (1280 - pw) * 0.5
	var py: float = (720  - ph) * 0.5

	var panel_bg := ColorRect.new()
	panel_bg.size     = Vector2(pw, ph)
	panel_bg.position = Vector2(px, py)
	panel_bg.color    = Color(0.06, 0.04, 0.03, 0.90)
	add_child(panel_bg)

	var border := ColorRect.new()
	border.size     = Vector2(pw, ph)
	border.position = Vector2(px, py)
	border.color    = Color(0, 0, 0, 0)
	add_child(border)

	# Título
	var title := Label.new()
	title.text = "AJUSTES" if _es() else "SETTINGS"
	title.add_theme_font_size_override("font_size", 38)
	title.add_theme_color_override("font_color", Color(0.95, 0.80, 0.45))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.size     = Vector2(pw, 60)
	title.position = Vector2(px, py + 20)
	add_child(title)

	var pad: float = 48.0  # left padding inside panel

	# ── Resolución ────────────────────────────────────────────────────────────

	add_child(_make_section_label(
		"RESOLUCIÓN" if _es() else "RESOLUTION",
		Vector2(px + pad, py + 96)))

	var res_y:    float = py + 124
	var btn_w:    float = 130.0
	var btn_gap:  float = 12.0

	for i in RESOLUTIONS.size():
		var r: Dictionary = RESOLUTIONS[i]
		var btn := _make_option_btn(r["label"],
			Vector2(px + pad + i * (btn_w + btn_gap), res_y),
			Vector2(btn_w, 38))
		btn.pressed.connect(_on_resolution.bind(r["size"]))
		_res_btns.append(btn)
		add_child(btn)

	# Pantalla completa — fila propia debajo de las resoluciones
	var fs_btn := _make_option_btn(
		"PANTALLA COMPLETA" if _es() else "FULLSCREEN",
		Vector2(px + pad, res_y + 52), Vector2(210, 38))
	fs_btn.pressed.connect(_on_fullscreen)
	add_child(fs_btn)

	# Highlight resolución activa
	var cur_size := DisplayServer.window_get_size()
	for i in RESOLUTIONS.size():
		var r: Dictionary = RESOLUTIONS[i]
		if r["size"] == cur_size:
			_res_btns[i].modulate = Color(1.3, 1.1, 0.7)

	# ── Idioma ────────────────────────────────────────────────────────────────

	add_child(_make_section_label(
		"IDIOMA" if _es() else "LANGUAGE",
		Vector2(px + pad, py + 238)))

	var lang_y: float = py + 266
	var langs := [["es", "Español"], ["en", "English"]]
	for pair in langs:
		var code: String  = pair[0]
		var label: String = pair[1]
		var idx: int = langs.find(pair)
		var btn := _make_option_btn(label,
			Vector2(px + pad + idx * 172, lang_y),
			Vector2(152, 38))
		btn.pressed.connect(_on_language.bind(code))
		_lang_btns[code] = btn
		add_child(btn)

	# Highlight idioma activo
	var cur_lang := I18nManager.get_language()
	if _lang_btns.has(cur_lang):
		_lang_btns[cur_lang].modulate = Color(1.3, 1.1, 0.7)

	# ── Separador ─────────────────────────────────────────────────────────────

	var sep := ColorRect.new()
	sep.size     = Vector2(pw - pad * 2, 1)
	sep.position = Vector2(px + pad, py + 338)
	sep.color    = Color(0.45, 0.28, 0.10, 0.6)
	add_child(sep)

	# ── Volver ────────────────────────────────────────────────────────────────

	var back_btn := _make_option_btn(
		"◄  VOLVER" if _es() else "◄  BACK",
		Vector2(px + pad, py + 358), Vector2(160, 44))
	back_btn.modulate = Color(1.0, 0.85, 0.6)
	back_btn.pressed.connect(_on_back)
	add_child(back_btn)

# ── Handlers ──────────────────────────────────────────────────────────────────

func _on_resolution(size: Vector2i) -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(size)
	var screen_size := DisplayServer.screen_get_size()
	DisplayServer.window_set_position((screen_size - size) / 2)
	for i in _res_btns.size():
		var r: Dictionary = RESOLUTIONS[i]
		_res_btns[i].modulate = Color(1.3, 1.1, 0.7) if r["size"] == size else Color.WHITE

func _on_fullscreen() -> void:
	var mode := DisplayServer.window_get_mode()
	if mode == DisplayServer.WINDOW_MODE_FULLSCREEN or mode == DisplayServer.WINDOW_MODE_EXCLUSIVE_FULLSCREEN:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)

func _on_language(lang: String) -> void:
	I18nManager.set_language(lang)
	for code in _lang_btns:
		_lang_btns[code].modulate = Color(1.3, 1.1, 0.7) if code == lang else Color.WHITE

func _on_back() -> void:
	Transition.to_scene("res://scenes/ui/main_menu/main_menu.tscn")

# ── Helpers UI ────────────────────────────────────────────────────────────────

func _make_section_label(text: String, pos: Vector2) -> Label:
	var lbl := Label.new()
	lbl.text     = text
	lbl.position = pos
	lbl.add_theme_font_size_override("font_size", 16)
	lbl.add_theme_color_override("font_color", Color(0.78, 0.62, 0.38))
	return lbl

func _make_option_btn(text: String, pos: Vector2, sz: Vector2) -> Button:
	var btn := Button.new()
	btn.text     = text
	btn.position = pos
	btn.custom_minimum_size = sz
	btn.add_theme_font_size_override("font_size", 13)
	btn.add_theme_color_override("font_color", Color(0.92, 0.85, 0.68))

	var normal := StyleBoxFlat.new()
	normal.bg_color     = Color(0.12, 0.08, 0.05, 0.85)
	normal.border_color = Color(0.45, 0.28, 0.10, 0.7)
	normal.border_width_bottom = 1; normal.border_width_top   = 1
	normal.border_width_left   = 1; normal.border_width_right = 1
	normal.corner_radius_top_left = 4; normal.corner_radius_top_right    = 4
	normal.corner_radius_bottom_left = 4; normal.corner_radius_bottom_right = 4

	var hover := StyleBoxFlat.new()
	hover.bg_color     = Color(0.22, 0.14, 0.07, 0.95)
	hover.border_color = Color(0.75, 0.52, 0.18, 0.9)
	hover.border_width_bottom = 1; hover.border_width_top   = 1
	hover.border_width_left   = 1; hover.border_width_right = 1
	hover.corner_radius_top_left = 4; hover.corner_radius_top_right    = 4
	hover.corner_radius_bottom_left = 4; hover.corner_radius_bottom_right = 4

	btn.add_theme_stylebox_override("normal",  normal)
	btn.add_theme_stylebox_override("hover",   hover)
	btn.add_theme_stylebox_override("pressed", hover)
	btn.add_theme_stylebox_override("focus",   normal)
	return btn
