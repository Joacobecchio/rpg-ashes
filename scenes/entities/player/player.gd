extends CharacterBody2D

signal health_changed(current: int, maximum: int)
signal mp_changed(current: int, maximum: int)
signal xp_changed(current: int, to_next: int)
signal level_up(new_level: int)

const SPEED        := 200.0
const SPRINT_SPEED := 320.0
const ATTACK_RANGE := 60.0

var stats: Dictionary = {}

func _ready() -> void:
	add_to_group("player")
	var pd := GameManager.get_player_data()
	if pd.is_empty():
		stats = StatsSystem.create_character("human", "warrior", "ashen_order")
	else:
		stats = StatsSystem.create_character(pd.get("race", "human"), pd.get("char_class", "warrior"), pd.get("faction", "ashen_order"))
		if pd.has("name"):
			stats["name"] = pd["name"]
	_apply_save_if_exists()
	_add_placeholder_visual()

func _apply_save_if_exists() -> void:
	var data := SaveSystem.load_data()
	if data.is_empty():
		return
	if data.has("stats"):
		stats = data["stats"]
	if data.has("position"):
		global_position = Vector2(data["position"]["x"], data["position"]["y"])
	if data.has("inventory"):
		InventorySystem.load_save_data(data["inventory"])
	if data.has("flags"):
		for key in data["flags"]:
			DialogueManager.flags[key] = data["flags"][key]

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("inventory") and not DialogueManager.is_active():
		InventorySystem.toggle_ui()
	elif event.is_action_pressed("ui_cancel"):
		if InventorySystem.is_open:
			InventorySystem.toggle_ui()
		else:
			SaveSystem.save(self)
			Transition.to_scene("res://scenes/ui/main_menu/main_menu.tscn")

func _physics_process(_delta: float) -> void:
	if InventorySystem.is_open or DialogueManager.is_active():
		velocity = Vector2.ZERO
		move_and_slide()
		return
	var direction := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var speed := SPRINT_SPEED if Input.is_action_pressed("sprint") else SPEED
	velocity = direction * speed
	move_and_slide()
	if Input.is_action_just_pressed("attack"):
		_try_attack()

func _try_attack() -> void:
	for enemy in get_tree().get_nodes_in_group("enemy"):
		if global_position.distance_to(enemy.global_position) <= ATTACK_RANGE:
			var is_crit := StatsSystem.roll_crit(stats)
			var dmg     := StatsSystem.compute_damage(stats, is_crit)
			enemy.take_damage(dmg, is_crit)

func take_damage(amount: int) -> void:
	StatsSystem.apply_damage(stats, amount)
	health_changed.emit(stats.hp, stats.max_hp)
	if not StatsSystem.is_alive(stats):
		_on_death()

func heal(amount: int) -> void:
	stats.hp = mini(stats.hp + amount, stats.max_hp)
	health_changed.emit(stats.hp, stats.max_hp)

func gain_xp(amount: int) -> void:
	var leveled_up := StatsSystem.gain_xp(stats, amount)
	xp_changed.emit(stats.xp, stats.xp_to_next)
	if leveled_up:
		level_up.emit(stats.level)
		health_changed.emit(stats.hp, stats.max_hp)
		mp_changed.emit(stats.mp, stats.max_mp)
		SaveSystem.save(self)

func _on_death() -> void:
	SaveSystem.delete_save()
	Transition.to_scene("res://scenes/ui/main_menu/main_menu.tscn")

func _add_placeholder_visual() -> void:
	var rect := ColorRect.new()
	rect.size     = Vector2(24, 32)
	rect.position = Vector2(-12, -16)
	rect.color    = Color(0.2, 0.8, 1.0)
	add_child(rect)
