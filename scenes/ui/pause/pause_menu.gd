extends CanvasLayer

const BG_COLOR     := Color(0.05, 0.03, 0.02, 0.94)
const BORDER_COLOR := Color(0.55, 0.38, 0.08)
const BTN_NORMAL   := Color(0.11, 0.08, 0.05)
const BTN_HOVER    := Color(0.26, 0.18, 0.08)
const BORDER_HOV   := Color(0.85, 0.65, 0.15)
const TEXT_COLOR   := Color(0.95, 0.88, 0.65)

const PANEL_W := 360
const PANEL_H := 290

func _ready() -> void:
	layer        = 18
	visible      = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	_build()

func _build() -> void:
	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.62)
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

	var panel := Panel.new()
	panel.size     = Vector2(PANEL_W, PANEL_H)
	panel.position = Vector2((1280 - PANEL_W) / 2.0, (720 - PANEL_H) / 2.0)
	panel.add_theme_stylebox_override("panel", _make_style(BG_COLOR, BORDER_COLOR))
	add_child(panel)

	var es: bool = I18nManager.get_language() == "es"

	# Title
	var title := Label.new()
	title.text                = "PAUSA" if es else "PAUSE"
	title.size                = Vector2(PANEL_W, 36)
	title.position            = Vector2(0, 24)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", TEXT_COLOR)
	panel.add_child(title)

	# Divider
	var div := ColorRect.new()
	div.size     = Vector2(PANEL_W - 40, 1)
	div.position = Vector2(20, 72)
	div.color    = BORDER_COLOR
	panel.add_child(div)

	# Buttons
	var btns: Array = [
		["Reanudar",       "Resume",       _on_resume],
		["Volver al Menú", "Back to Menu", _on_back_to_menu],
		["Salir del Juego","Quit Game",    _on_quit],
	]
	for i in range(btns.size()):
		var label: String   = btns[i][0] if es else btns[i][1]
		var cb:    Callable = btns[i][2]
		_add_btn(panel, label, Vector2((PANEL_W - 250) / 2.0, 90 + i * 64), cb)

# ── Callbacks ─────────────────────────────────────────────────────────────────

func _on_resume() -> void:
	PauseSystem.toggle()

func _on_back_to_menu() -> void:
	PauseSystem.toggle()
	var players := get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		SaveSystem.save(players[0])
	Transition.to_scene("res://scenes/ui/main_menu/main_menu.tscn")

func _on_quit() -> void:
	var players := get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		SaveSystem.save(players[0])
	get_tree().quit()

# ── Helpers ───────────────────────────────────────────────────────────────────

func _add_btn(parent: Control, text: String, pos: Vector2, cb: Callable) -> void:
	var btn := Button.new()
	btn.text     = text
	btn.size     = Vector2(250, 48)
	btn.position = pos
	btn.focus_mode = Control.FOCUS_NONE
	btn.add_theme_font_size_override("font_size", 15)
	btn.add_theme_color_override("font_color", TEXT_COLOR)
	btn.add_theme_stylebox_override("normal",  _make_style(BTN_NORMAL, BORDER_COLOR))
	btn.add_theme_stylebox_override("hover",   _make_style(BTN_HOVER,  BORDER_HOV))
	btn.add_theme_stylebox_override("pressed", _make_style(BTN_HOVER,  BORDER_HOV))
	btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	btn.pressed.connect(cb)
	parent.add_child(btn)

func _make_style(bg: Color, border: Color) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color            = bg
	sb.border_color        = border
	sb.border_width_left   = 1
	sb.border_width_right  = 1
	sb.border_width_top    = 1
	sb.border_width_bottom = 1
	return sb
