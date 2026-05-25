extends Control

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

	_spawn_ash(60)

	var logo := TextureRect.new()
	logo.texture      = load("res://assets/images/ui/menu/logo.png")
	logo.expand_mode  = TextureRect.EXPAND_IGNORE_SIZE
	logo.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	logo.size         = Vector2(560, 290)
	logo.position     = Vector2((1280 - 560) * 0.5, 150)
	add_child(logo)

	var lbl := Label.new()
	lbl.text = "— Presiona cualquier botón para continuar —"
	lbl.add_theme_font_size_override("font_size", 19)
	lbl.add_theme_color_override("font_color", Color(0.90, 0.82, 0.55))
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.size     = Vector2(900, 40)
	lbl.position = Vector2((1280 - 900) * 0.5, 645)
	add_child(lbl)

	var tween := create_tween().set_loops()
	tween.tween_property(lbl, "modulate:a", 0.22, 0.9)
	tween.tween_property(lbl, "modulate:a", 1.00, 0.9)

func _spawn_ash(count: int) -> void:
	for i in count:
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

func _unhandled_input(event: InputEvent) -> void:
	if event.is_pressed() and not event.is_echo():
		Transition.to_scene("res://scenes/ui/main_menu/main_menu.tscn")
