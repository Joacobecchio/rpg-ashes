extends Control

# ── Opciones ──────────────────────────────────────────────────────────────────

const RACES        = ["human", "elf", "dwarf", "orc", "draconic", "gnome"]
const RACE_NAMES   = ["Humano", "Elfo", "Enano", "Orco", "Dracónico", "Gnomo"]
const CLASSES      = ["warrior", "paladin", "berserker", "ranger", "assassin", "pyromancer", "necromancer", "inquisitor", "warlock"]
const CLASS_NAMES  = ["Guerrero", "Paladín", "Berserker", "Arquero", "Asesino", "Piromante", "Nigromante", "Inquisidor", "Brujo"]
const FACTIONS     = ["ashen_order", "black_choir", "hollow_pact", "iron_wolves", "emberborn", "ashen_veil", "frostborn_clans"]
const FACTION_NAMES= ["Ashen Order", "Black Choir", "Hollow Pact", "Iron Wolves", "Emberborn", "Ashen Veil", "Frostborn Clans"]
const GENDERS      = ["male", "female"]
const GENDER_NAMES = ["Masculino", "Femenino"]

const BODY_IMAGES = {
	"human_male":   "res://assets/images/characters/human/male/base-front.png",
	"human_female": "res://assets/images/characters/human/female/base-front.png",
	"elf_male":     "res://assets/images/characters/elf/male/base-front.png",
	"elf_female":   "res://assets/images/characters/elf/female/base-front.png",
}

const STAT_COLORS = {
	"hp":  Color(0.80, 0.12, 0.12),
	"mp":  Color(0.15, 0.40, 0.90),
	"atk": Color(0.90, 0.55, 0.10),
	"dex": Color(0.20, 0.75, 0.30),
	"mag": Color(0.60, 0.20, 0.90),
	"vit": Color(0.85, 0.78, 0.20),
}

# ── Estado ────────────────────────────────────────────────────────────────────

var race_idx    := 0
var class_idx   := 0
var faction_idx := 0
var gender_idx  := 0

var _name_input:  LineEdit
var _preview_img: TextureRect
var _stat_bars:   Dictionary = {}
var _stat_labels: Dictionary = {}
var _sel_labels:  Dictionary = {}

# ── Idioma y assets ───────────────────────────────────────────────────────────

func _lang() -> String:
	return I18nManager.get_language()

func _ui(es_path: String, en_path: String) -> Texture2D:
	return load(en_path if _lang() == "en" else es_path)

func _ui_btn(es_path: String, en_path: String) -> Texture2D:
	return load(en_path if _lang() == "en" else es_path)

# ── Build ─────────────────────────────────────────────────────────────────────

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_build_ui()
	_refresh()

func _build_ui() -> void:
	# Fondo
	var bg := TextureRect.new()
	bg.texture      = load("res://assets/images/ui/character-creation/background.png")
	bg.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.size         = Vector2(1280, 720)
	bg.position     = Vector2.ZERO
	add_child(bg)

	_spawn_ash()

	# Título — PNG 1536×1024 (ratio 1.5). Parte superior del PNG queda fuera de pantalla;
	# la parte visible contiene el texto del título.
	var title := TextureRect.new()
	title.texture      = _ui(
		"res://assets/images/ui/character-creation/title/es/crea-tu-personaje.png",
		"res://assets/images/ui/character-creation/title/en/create-your-character.png")
	title.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	title.stretch_mode = TextureRect.STRETCH_SCALE
	title.size         = Vector2(536, 357)
	title.position     = Vector2(372, -118)
	add_child(title)

	# ── Frames (se agregan antes que los botones flotantes para z-order correcto)

	# Panel izquierdo (selectores) — labels NOMBRE/RAZA/etc. están en la imagen
	var left_frame := TextureRect.new()
	left_frame.texture      = _ui(
		"res://assets/images/ui/character-creation/box/es/recuadro-left.png",
		"res://assets/images/ui/character-creation/box/en/box-character.png")
	left_frame.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	left_frame.stretch_mode = TextureRect.STRETCH_SCALE
	left_frame.size         = Vector2(606, 406)
	left_frame.position     = Vector2(12, 52)
	add_child(left_frame)

	_build_left_panel()

	# Panel atributos (bottom-left) — labels HP/MP/etc. están en la imagen
	var stats_frame := TextureRect.new()
	stats_frame.texture      = _ui(
		"res://assets/images/ui/character-creation/box/es/recuadro-right.png",
		"res://assets/images/ui/character-creation/box/en/box-right.png")
	stats_frame.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	stats_frame.stretch_mode = TextureRect.STRETCH_SCALE
	stats_frame.size         = Vector2(360, 238)
	stats_frame.position     = Vector2(12, 446)
	add_child(stats_frame)

	_build_attr_panel()

	# Panel bonificaciones (bottom-center)
	var bonus_frame := TextureRect.new()
	bonus_frame.texture      = _ui(
		"res://assets/images/ui/character-creation/box/es/recuadro-bonificaciones.png",
		"res://assets/images/ui/character-creation/box/en/box-bonuses.png")
	bonus_frame.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	bonus_frame.stretch_mode = TextureRect.STRETCH_SCALE
	bonus_frame.size         = Vector2(258, 238)
	bonus_frame.position     = Vector2(380, 446)
	add_child(bonus_frame)

	# Panel vista previa (derecho)
	var preview_frame := TextureRect.new()
	preview_frame.texture      = _ui(
		"res://assets/images/ui/character-creation/box/es/recuadro-vista-previa.png",
		"res://assets/images/ui/character-creation/box/en/box-preview.png")
	preview_frame.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	preview_frame.stretch_mode = TextureRect.STRETCH_SCALE
	preview_frame.size         = Vector2(622, 632)
	preview_frame.position     = Vector2(646, 20)
	add_child(preview_frame)

	_build_preview_panel()

	# ── Botones encima de los frames (z-order: se agregan al final)

	# Botón VOLVER — mismo ancho que COMENZAR (264), alto según ratio 1350:464 ≈ 2.91
	add_child(_make_img_btn(
		"res://assets/images/ui/character-creation/buttons/es/volver.png",
		"res://assets/images/ui/character-creation/buttons/en/back.png",
		Vector2(264, 91), Vector2(18, 12), _on_back))

	# Botón COMENZAR — PNG 1536×1024 (ratio 1.5), tamaño exact-ratio
	add_child(_make_img_btn(
		"res://assets/images/ui/character-creation/buttons/es/comenzar.png",
		"res://assets/images/ui/character-creation/buttons/en/start-game.png",
		Vector2(264, 176), Vector2(970, 544), _on_start))

# ── Panel izquierdo ───────────────────────────────────────────────────────────

func _build_left_panel() -> void:
	# El frame está en (12, 52). Los labels NOMBRE/RAZA/CLASE/FACCION/GENERO/CABEZA
	# están baked en la imagen. Solo ponemos elementos interactivos en las posiciones
	# que coinciden con las áreas visuales de la imagen.

	_name_input = LineEdit.new()
	_name_input.placeholder_text    = "Tu nombre..."
	_name_input.custom_minimum_size = Vector2(316, 28)
	_name_input.position            = Vector2(196, 168)
	_name_input.add_theme_font_size_override("font_size", 13)
	_name_input.add_theme_color_override("font_color", Color(0.92, 0.85, 0.68))
	var style := StyleBoxFlat.new()
	style.bg_color            = Color(0.10, 0.07, 0.05, 0.85)
	style.border_color        = Color(0.45, 0.28, 0.10, 0.8)
	style.border_width_bottom = 1
	style.border_width_top    = 1
	style.border_width_left   = 1
	style.border_width_right  = 1
	_name_input.add_theme_stylebox_override("normal", style)
	add_child(_name_input)

	# [key, y_absoluto] — ~55px entre cada fila para coincidir con labels baked en la imagen
	# Box en (12, 52) h=406. Interior desde ~152 hasta ~430.
	var rows = [
		["race",    215],
		["class",   268],
		["faction", 321],
		["gender",  374],
	]
	for row in rows:
		_build_selector_row(row[0] as String, row[1] as int)

func _build_selector_row(key: String, y: int) -> void:
	var arr_left := _make_arrow_btn(
		"res://assets/images/ui/character-creation/buttons/arrows/arrow-left.png",
		Vector2(192, y - 2), func(): _change(key, -1))
	add_child(arr_left)

	var val_lbl := Label.new()
	val_lbl.custom_minimum_size  = Vector2(192, 24)
	val_lbl.position             = Vector2(222, y)
	val_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	val_lbl.add_theme_font_size_override("font_size", 12)
	val_lbl.add_theme_color_override("font_color", Color(0.95, 0.88, 0.65))
	_sel_labels[key] = val_lbl
	add_child(val_lbl)

	var arr_right := _make_arrow_btn(
		"res://assets/images/ui/character-creation/buttons/arrows/arrow-right.png",
		Vector2(418, y - 2), func(): _change(key, 1))
	add_child(arr_right)

# ── Panel atributos ───────────────────────────────────────────────────────────

func _build_attr_panel() -> void:
	# recuadro-right.png en (12, 446). Labels HP/MP/STR/DEX/INT/VIT están en imagen.
	var stat_keys = ["hp", "mp", "atk", "dex", "mag", "vit"]
	var val_x := 68
	var bar_x := 108
	var bar_w := 108
	var y0    := 472   # primer stat (HP)
	var row_h := 24

	for i in stat_keys.size():
		var key = stat_keys[i]
		var y   = y0 + i * row_h

		var val_lbl := Label.new()
		val_lbl.position = Vector2(val_x, y)
		val_lbl.add_theme_font_size_override("font_size", 11)
		val_lbl.add_theme_color_override("font_color", Color(0.88, 0.82, 0.62))
		_stat_labels[key] = val_lbl
		add_child(val_lbl)

		var bar_bg := ColorRect.new()
		bar_bg.size     = Vector2(bar_w, 7)
		bar_bg.position = Vector2(bar_x, y + 5)
		bar_bg.color    = Color(0.08, 0.06, 0.04)
		add_child(bar_bg)

		var bar := ColorRect.new()
		bar.size     = Vector2(bar_w, 7)
		bar.position = Vector2(bar_x, y + 5)
		bar.color    = STAT_COLORS.get(key, Color(0.7, 0.7, 0.7))
		_stat_bars[key] = bar
		add_child(bar)

# ── Panel vista previa ────────────────────────────────────────────────────────

func _build_preview_panel() -> void:
	# Preview frame en (646, 40), size (622, 632). Centro: (957, 356).
	_preview_img = TextureRect.new()
	_preview_img.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	_preview_img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_preview_img.size         = Vector2(280, 480)
	_preview_img.position     = Vector2(817, 108)
	add_child(_preview_img)

# ── Lógica de selección ───────────────────────────────────────────────────────

func _change(key: String, delta: int) -> void:
	match key:
		"race":    race_idx    = wrapi(race_idx    + delta, 0, RACES.size())
		"class":   class_idx   = wrapi(class_idx   + delta, 0, CLASSES.size())
		"faction": faction_idx = wrapi(faction_idx + delta, 0, FACTIONS.size())
		"gender":  gender_idx  = wrapi(gender_idx  + delta, 0, GENDERS.size())
	_refresh()

func _refresh() -> void:
	_sel_labels["race"].text    = RACE_NAMES[race_idx]
	_sel_labels["class"].text   = CLASS_NAMES[class_idx]
	_sel_labels["faction"].text = FACTION_NAMES[faction_idx]
	_sel_labels["gender"].text  = GENDER_NAMES[gender_idx]

	var body_key: String = RACES[race_idx] + "_" + GENDERS[gender_idx]
	var img_path: String = BODY_IMAGES.get(body_key,
		"res://assets/images/characters/human/male/base-front.png")
	_preview_img.texture = load(img_path)

	var s: Dictionary = StatsSystem.create_character(RACES[race_idx], CLASSES[class_idx], FACTIONS[faction_idx])
	var max_vals = { "hp": 1500, "mp": 900, "atk": 30, "dex": 30, "mag": 30, "vit": 25 }
	for key in _stat_bars:
		var val: int = s.get(key, 0)
		if key == "hp": val = s.get("max_hp", 100)
		if key == "mp": val = s.get("max_mp", 100)
		var pct := clampf(float(val) / float(max_vals.get(key, 100)), 0.0, 1.0)
		_stat_bars[key].size.x  = 108.0 * pct
		_stat_labels[key].text  = str(val)

# ── Acciones ──────────────────────────────────────────────────────────────────

func _on_back() -> void:
	Transition.to_scene("res://scenes/ui/main_menu/main_menu.tscn")

func _on_start() -> void:
	var char_name := _name_input.text.strip_edges()
	if char_name.is_empty():
		char_name = RACE_NAMES[race_idx]
	GameManager.set_player_data({
		"name":       char_name,
		"race":       RACES[race_idx],
		"char_class": CLASSES[class_idx],
		"faction":    FACTIONS[faction_idx],
		"gender":     GENDERS[gender_idx],
	})
	Transition.to_scene("res://scenes/world/valdrek/valdrek.tscn")

# ── Helpers UI ────────────────────────────────────────────────────────────────

func _make_img_btn(es_path: String, en_path: String, sz: Vector2, pos: Vector2, cb: Callable) -> TextureButton:
	var btn := TextureButton.new()
	btn.texture_normal      = load(en_path if _lang() == "en" else es_path)
	btn.ignore_texture_size = true
	btn.stretch_mode        = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
	btn.custom_minimum_size = sz
	btn.position            = pos
	btn.mouse_entered.connect(func(): btn.modulate = Color(1.15, 1.05, 0.85))
	btn.mouse_exited.connect(func():  btn.modulate = Color.WHITE)
	btn.pressed.connect(cb)
	return btn

func _make_arrow_btn(path: String, pos: Vector2, cb: Callable) -> TextureButton:
	var btn := TextureButton.new()
	btn.texture_normal      = load(path)
	btn.ignore_texture_size = true
	btn.stretch_mode        = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
	btn.custom_minimum_size = Vector2(24, 24)
	btn.position            = pos
	btn.pressed.connect(cb)
	return btn

func _spawn_ash() -> void:
	for i in 45:
		var flake := ColorRect.new()
		var sz := randf_range(1.5, 3.5)
		flake.size  = Vector2(sz, sz)
		flake.color = Color(randf_range(0.88,1.0), randf_range(0.18,0.48), randf_range(0.0,0.08), randf_range(0.45,0.80))
		add_child(flake)
		_animate_flake(flake, true)

func _animate_flake(flake: ColorRect, first: bool = false) -> void:
	var full_dur := randf_range(5.0, 12.0)
	var start_x  := randf_range(0.0, 1280.0)
	var drift_x  := randf_range(-40.0, 40.0)
	var start_y: float
	var duration: float
	if first:
		start_y  = randf_range(-20.0, 720.0)
		duration = full_dur * (735.0 - start_y) / 755.0
	else:
		start_y  = -8.0
		duration = full_dur
	flake.position = Vector2(start_x, start_y)
	var tween := create_tween()
	tween.tween_property(flake, "position", Vector2(start_x + drift_x, 735.0), duration)
	tween.tween_callback(func(): _animate_flake(flake, false))
