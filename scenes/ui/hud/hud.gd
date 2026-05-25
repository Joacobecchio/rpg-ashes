extends CanvasLayer

var hp_bar: ProgressBar
var mp_bar: ProgressBar
var xp_bar: ProgressBar
var hp_label: Label
var mp_label: Label
var name_label: Label
var level_label: Label

func _ready() -> void:
	_build_ui()
	call_deferred("_find_and_connect_player")

# ── Construcción del HUD ─────────────────────────────────────────────────────

func _build_ui() -> void:
	_build_stats_panel()
	_build_xp_bar()

func _build_stats_panel() -> void:
	var panel := PanelContainer.new()
	panel.set_anchors_preset(Control.PRESET_TOP_LEFT)
	panel.position = Vector2(16, 16)

	var panel_bg := StyleBoxFlat.new()
	panel_bg.bg_color = Color(0.05, 0.03, 0.03, 0.85)
	panel_bg.border_width_left   = 1
	panel_bg.border_width_right  = 1
	panel_bg.border_width_top    = 1
	panel_bg.border_width_bottom = 1
	panel_bg.border_color = Color(0.35, 0.2, 0.1, 0.8)
	panel_bg.corner_radius_top_left     = 5
	panel_bg.corner_radius_top_right    = 5
	panel_bg.corner_radius_bottom_left  = 5
	panel_bg.corner_radius_bottom_right = 5
	panel.add_theme_stylebox_override("panel", panel_bg)
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left",   12)
	margin.add_theme_constant_override("margin_right",  12)
	margin.add_theme_constant_override("margin_top",     8)
	margin.add_theme_constant_override("margin_bottom",  8)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 5)
	margin.add_child(vbox)

	# Fila nombre + nivel
	var name_row := HBoxContainer.new()
	name_row.add_theme_constant_override("separation", 8)
	vbox.add_child(name_row)

	name_label = Label.new()
	name_label.text = "Warrior"
	name_label.add_theme_font_size_override("font_size", 13)
	name_label.add_theme_color_override("font_color", Color(0.9, 0.85, 0.75))
	name_row.add_child(name_label)

	level_label = Label.new()
	level_label.text = "Lv. 1"
	level_label.add_theme_font_size_override("font_size", 13)
	level_label.add_theme_color_override("font_color", Color(0.95, 0.78, 0.15))
	name_row.add_child(level_label)

	# Barra HP
	vbox.add_child(_make_bar_row("HP", Color(0.75, 0.08, 0.08), Color(0.12, 0.03, 0.03), "hp"))
	# Barra MP
	vbox.add_child(_make_bar_row("MP", Color(0.12, 0.35, 0.88), Color(0.03, 0.05, 0.15), "mp"))

func _make_bar_row(label_text: String, fill_color: Color, bg_color: Color, bar_type: String) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)

	var lbl := Label.new()
	lbl.text = label_text
	lbl.custom_minimum_size = Vector2(22, 0)
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.add_theme_color_override("font_color", fill_color.lightened(0.3))
	row.add_child(lbl)

	var bar := ProgressBar.new()
	bar.custom_minimum_size = Vector2(170, 14)
	bar.show_percentage = false

	var fill_style := StyleBoxFlat.new()
	fill_style.bg_color = fill_color
	fill_style.corner_radius_top_left     = 3
	fill_style.corner_radius_top_right    = 3
	fill_style.corner_radius_bottom_left  = 3
	fill_style.corner_radius_bottom_right = 3
	bar.add_theme_stylebox_override("fill", fill_style)

	var bg_style := StyleBoxFlat.new()
	bg_style.bg_color = bg_color
	bg_style.corner_radius_top_left     = 3
	bg_style.corner_radius_top_right    = 3
	bg_style.corner_radius_bottom_left  = 3
	bg_style.corner_radius_bottom_right = 3
	bar.add_theme_stylebox_override("background", bg_style)

	row.add_child(bar)

	var val_lbl := Label.new()
	val_lbl.add_theme_font_size_override("font_size", 10)
	val_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	val_lbl.text = "—"
	row.add_child(val_lbl)

	if bar_type == "hp":
		hp_bar   = bar
		hp_label = val_lbl
	else:
		mp_bar   = bar
		mp_label = val_lbl

	return row

func _build_xp_bar() -> void:
	var xp_bg := PanelContainer.new()
	xp_bg.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	xp_bg.offset_top    = -22
	xp_bg.offset_bottom = 0

	var bg_style := StyleBoxFlat.new()
	bg_style.bg_color = Color(0.06, 0.05, 0.0, 0.9)
	xp_bg.add_theme_stylebox_override("panel", bg_style)
	add_child(xp_bg)

	xp_bar = ProgressBar.new()
	xp_bar.set_anchors_preset(Control.PRESET_FULL_RECT)
	xp_bar.show_percentage = false
	xp_bar.min_value = 0.0
	xp_bar.max_value = 65.0

	var fill_style := StyleBoxFlat.new()
	fill_style.bg_color = Color(0.88, 0.68, 0.0)
	xp_bar.add_theme_stylebox_override("fill", fill_style)

	var bg_style2 := StyleBoxFlat.new()
	bg_style2.bg_color = Color(0.1, 0.08, 0.0)
	xp_bar.add_theme_stylebox_override("background", bg_style2)

	xp_bg.add_child(xp_bar)

# ── Conexión al jugador ───────────────────────────────────────────────────────

func _find_and_connect_player() -> void:
	var players := get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		connect_to_player(players[0])

func connect_to_player(player: Node) -> void:
	player.health_changed.connect(_on_health_changed)
	player.mp_changed.connect(_on_mp_changed)
	player.xp_changed.connect(_on_xp_changed)
	player.level_up.connect(_on_level_up)

	var s: Dictionary = player.stats
	_on_health_changed(s.get("hp", 100),      s.get("max_hp", 100))
	_on_mp_changed(    s.get("mp", 100),      s.get("max_mp", 100))
	_on_xp_changed(    s.get("xp", 0),        s.get("xp_to_next", 65))
	name_label.text  = s.get("char_class", "warrior").capitalize()
	level_label.text = "Lv. " + str(s.get("level", 1))

# ── Callbacks ────────────────────────────────────────────────────────────────

func _on_health_changed(current: int, maximum: int) -> void:
	hp_bar.max_value = maximum
	hp_bar.value     = current
	hp_label.text    = "%d/%d" % [current, maximum]

func _on_mp_changed(current: int, maximum: int) -> void:
	mp_bar.max_value = maximum
	mp_bar.value     = current
	mp_label.text    = "%d/%d" % [current, maximum]

func _on_xp_changed(current: int, to_next: int) -> void:
	xp_bar.max_value = to_next
	xp_bar.value     = current

func _on_level_up(new_level: int) -> void:
	level_label.text = "Lv. " + str(new_level)
