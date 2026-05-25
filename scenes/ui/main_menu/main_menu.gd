extends Control

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_build_ui()

func _build_ui() -> void:
	# Fondo
	var bg := TextureRect.new()
	bg.texture      = load("res://assets/images/ui/menu/background.png")
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.size         = Vector2(1280, 720)
	bg.position     = Vector2.ZERO
	add_child(bg)

	# Partículas de ceniza (encima del fondo, debajo de todo lo demás)
	_add_ash_particles()

	# Logo (top-center) — PNG ratio 1.5:1, size matches exactly so no clipping
	var logo := TextureRect.new()
	logo.texture      = load("res://assets/images/ui/menu/logo.png")
	logo.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	logo.stretch_mode = TextureRect.STRETCH_SCALE
	logo.size         = Vector2(600, 400)
	logo.position     = Vector2((1280 - 600) * 0.5, 10)
	add_child(logo)
	_start_logo_glow(logo)

	# Guerrero fantasma — sigue al knight
	var ghost := TextureRect.new()
	ghost.texture      = load("res://assets/images/ui/menu/knight.png")
	ghost.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	ghost.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	ghost.size         = Vector2(1100, 1200)
	ghost.position     = Vector2(-30, -60)
	ghost.modulate     = Color(1, 1, 1, 0.12)
	add_child(ghost)
	_start_breathe(ghost)

	# Guerrero real (más a la derecha, pegado al suelo)
	var knight := TextureRect.new()
	knight.texture      = load("res://assets/images/ui/menu/knight.png")
	knight.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	knight.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	knight.size         = Vector2(360, 400)
	knight.position     = Vector2(300, 385)
	add_child(knight)

	# Botones (derecha)
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 16)
	vbox.position = Vector2(960, 258)
	add_child(vbox)

	var es := I18nManager.get_language() == "es"
	_add_btn(vbox, "res://assets/images/ui/menu/buttons/%s/%s.png" % [("es" if es else "en"), ("nueva-partida" if es else "new-game")],   _on_new_game)
	_add_btn(vbox, "res://assets/images/ui/menu/buttons/%s/%s.png" % [("es" if es else "en"), ("cargar-partida" if es else "load-game")], _on_continue, not SaveSystem.has_save())
	_add_btn(vbox, "res://assets/images/ui/menu/buttons/%s/%s.png" % [("es" if es else "en"), ("ajustes" if es else "settings")],         _on_settings)
	_add_btn(vbox, "res://assets/images/ui/menu/buttons/%s/%s.png" % [("es" if es else "en"), ("salir" if es else "exit")],               _on_quit)

# ── Efectos ───────────────────────────────────────────────────────────────────

func _start_logo_glow(node: TextureRect) -> void:
	node.pivot_offset = node.size / 2.0
	# Fire-like shimmer: warm golden pulses at irregular rhythm, no positional movement
	var tween := create_tween().set_loops()
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(node, "modulate", Color(1.12, 1.00, 0.75, 1.0), 0.9)
	tween.tween_property(node, "modulate", Color(1.04, 0.96, 0.82, 1.0), 0.5)
	tween.tween_property(node, "modulate", Color(1.18, 1.04, 0.68, 1.0), 0.7)
	tween.tween_property(node, "modulate", Color(1.00, 0.93, 0.78, 1.0), 1.1)
	tween.tween_property(node, "modulate", Color(1.14, 1.01, 0.72, 1.0), 0.6)
	tween.tween_property(node, "modulate", Color(1.0,  1.0,  1.0,  1.0), 1.4)

func _start_breathe(node: TextureRect) -> void:
	node.pivot_offset = node.size / 2.0
	var tween := create_tween().set_loops()
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(node, "scale", Vector2(1.10, 1.10), 2.2)
	tween.tween_property(node, "scale", Vector2(0.90, 0.90), 2.2)

func _add_ash_particles() -> void:
	for i in 60:
		var flake := ColorRect.new()
		var sz := randf_range(1.5, 3.8)
		flake.size  = Vector2(sz, sz)
		flake.color = Color(
			randf_range(0.88, 1.00),
			randf_range(0.18, 0.48),
			randf_range(0.00, 0.08),
			randf_range(0.50, 0.85)
		)
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
	tween.tween_callback(func():
		_animate_flake(flake, false)
	)

# ── Botones ───────────────────────────────────────────────────────────────────

func _add_btn(parent: Control, tex_path: String, callback: Callable, disabled: bool = false) -> void:
	var btn := TextureButton.new()
	btn.texture_normal      = load(tex_path)
	btn.ignore_texture_size = true
	btn.stretch_mode        = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
	btn.custom_minimum_size = Vector2(258, 82)
	btn.disabled            = disabled
	if disabled:
		btn.modulate = Color(0.55, 0.55, 0.55, 0.75)

	btn.mouse_entered.connect(func(): if not btn.disabled: btn.modulate = Color(1.18, 1.08, 0.88))
	btn.mouse_exited.connect(func():  if not btn.disabled: btn.modulate = Color.WHITE)
	btn.button_down.connect(func():   if not btn.disabled: btn.modulate = Color(0.78, 0.72, 0.62))
	btn.button_up.connect(func():     if not btn.disabled: btn.modulate = Color.WHITE)

	if not disabled:
		btn.pressed.connect(callback)
	parent.add_child(btn)

func _on_new_game() -> void:
	SaveSystem.delete_save()
	Transition.to_scene("res://scenes/ui/character_creation/character_creation.tscn")

func _on_continue() -> void:
	Transition.to_scene("res://scenes/world/valdrek/valdrek.tscn")

func _on_settings() -> void:
	Transition.to_scene("res://scenes/ui/settings/settings.tscn")

func _on_quit() -> void:
	get_tree().quit()
