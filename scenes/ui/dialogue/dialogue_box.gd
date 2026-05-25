extends CanvasLayer

const TYPING_SPEED := 0.028

var _root:         Control
var _name_label:   Label
var _text_label:   Label
var _choices_box:  HBoxContainer
var _hint_label:   Label

var _steps:        Array    = []
var _step_idx:     int      = 0
var _done_cb:      Callable
var _full_text:    String   = ""
var _char_idx:     int      = 0
var _typing:       bool     = false
var _typing_timer: float    = 0.0

func _ready() -> void:
	layer = 20
	_build_ui()
	hide()

func _build_ui() -> void:
	_root = Control.new()
	_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(_root)

	var panel_style := StyleBoxFlat.new()
	panel_style.bg_color     = Color(0.04, 0.02, 0.01, 0.94)
	panel_style.border_color = Color(0.52, 0.33, 0.10, 0.88)
	panel_style.set_border_width_all(2)
	panel_style.corner_radius_top_left  = 7
	panel_style.corner_radius_top_right = 7

	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", panel_style)
	panel.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	panel.offset_top    = -188
	panel.offset_bottom = -10
	panel.offset_left   = 10
	panel.offset_right  = -10
	_root.add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left",   18)
	margin.add_theme_constant_override("margin_right",  18)
	margin.add_theme_constant_override("margin_top",    12)
	margin.add_theme_constant_override("margin_bottom", 10)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	margin.add_child(vbox)

	# Nombre del hablante
	_name_label = Label.new()
	_name_label.add_theme_font_size_override("font_size", 15)
	_name_label.add_theme_color_override("font_color", Color(0.95, 0.78, 0.35))
	vbox.add_child(_name_label)

	# Texto del diálogo
	_text_label = Label.new()
	_text_label.autowrap_mode     = TextServer.AUTOWRAP_WORD_SMART
	_text_label.custom_minimum_size = Vector2(0, 76)
	_text_label.add_theme_font_size_override("font_size", 14)
	_text_label.add_theme_color_override("font_color", Color(0.90, 0.86, 0.78))
	vbox.add_child(_text_label)

	# Opciones (se muestran solo cuando hay choices)
	_choices_box = HBoxContainer.new()
	_choices_box.add_theme_constant_override("separation", 12)
	_choices_box.visible = false
	vbox.add_child(_choices_box)

	# Hint "F Continuar"
	_hint_label = Label.new()
	_hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_hint_label.add_theme_font_size_override("font_size", 11)
	_hint_label.add_theme_color_override("font_color", Color(0.50, 0.46, 0.38))
	vbox.add_child(_hint_label)
	_update_hint_text()

func _update_hint_text() -> void:
	if not _hint_label:
		return
	var es: bool = I18nManager.get_language() == "es"
	_hint_label.text = "[ F ] Continuar" if es else "[ F ] Continue"

# ── API pública ───────────────────────────────────────────────────────────────

func start(steps: Array, done_cb: Callable) -> void:
	_steps    = steps
	_step_idx = 0
	_done_cb  = done_cb
	show()
	_show_step(0)

# ── Lógica interna ────────────────────────────────────────────────────────────

func _show_step(idx: int) -> void:
	if idx >= _steps.size():
		_finish()
		return
	var step: Dictionary = _steps[idx]
	_name_label.text = step.get("speaker", "")
	_full_text        = step.get("text", "")
	_char_idx         = 0
	_typing           = true
	_typing_timer     = 0.0
	_text_label.text  = ""

	for c in _choices_box.get_children():
		c.queue_free()

	var has_choices: bool = step.has("choices") and (step["choices"] as Array).size() > 0
	_choices_box.visible = false
	_hint_label.visible  = not has_choices

func _process(delta: float) -> void:
	if not visible or not _typing:
		return
	_typing_timer += delta
	if _typing_timer < TYPING_SPEED:
		return
	_typing_timer = 0.0
	_char_idx += 1
	_text_label.text = _full_text.left(_char_idx)
	if _char_idx >= _full_text.length():
		_typing = false
		_on_typing_done()

func _on_typing_done() -> void:
	var step: Dictionary = _steps[_step_idx]
	if not step.has("choices"):
		return
	var choices: Array = step["choices"]
	if choices.is_empty():
		return
	_choices_box.visible = true
	_hint_label.visible  = false
	for choice in choices:
		var btn := _make_choice_btn(choice["label"], choice.get("on_select", Callable()))
		_choices_box.add_child(btn)

func _make_choice_btn(lbl_text: String, cb: Callable) -> Button:
	var btn := Button.new()
	btn.text = lbl_text
	btn.add_theme_font_size_override("font_size", 13)
	btn.add_theme_color_override("font_color", Color(0.92, 0.85, 0.68))

	var ns := StyleBoxFlat.new()
	ns.bg_color     = Color(0.12, 0.08, 0.05, 0.90)
	ns.border_color = Color(0.45, 0.28, 0.10)
	ns.set_border_width_all(1)
	ns.corner_radius_top_left    = 4; ns.corner_radius_top_right    = 4
	ns.corner_radius_bottom_left = 4; ns.corner_radius_bottom_right = 4

	var hs := StyleBoxFlat.new()
	hs.bg_color     = Color(0.24, 0.15, 0.07, 0.95)
	hs.border_color = Color(0.75, 0.52, 0.18)
	hs.set_border_width_all(1)
	hs.corner_radius_top_left    = 4; hs.corner_radius_top_right    = 4
	hs.corner_radius_bottom_left = 4; hs.corner_radius_bottom_right = 4

	btn.add_theme_stylebox_override("normal",  ns)
	btn.add_theme_stylebox_override("hover",   hs)
	btn.add_theme_stylebox_override("pressed", hs)
	btn.add_theme_stylebox_override("focus",   ns)

	btn.pressed.connect(func():
		for c in _choices_box.get_children():
			c.queue_free()
		_choices_box.visible = false
		if cb.is_valid():
			cb.call()
		else:
			_finish()
	)
	return btn

func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if not event.is_action_pressed("interact"):
		return
	get_viewport().set_input_as_handled()
	if _typing:
		_char_idx        = _full_text.length()
		_text_label.text = _full_text
		_typing          = false
		_on_typing_done()
	elif _choices_box.visible:
		pass  # esperando que el jugador elija
	else:
		_step_idx += 1
		_show_step(_step_idx)

func _finish() -> void:
	hide()
	_steps.clear()
	if _done_cb.is_valid():
		_done_cb.call()
