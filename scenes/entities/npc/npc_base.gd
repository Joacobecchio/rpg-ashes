extends CharacterBody2D

const INTERACT_RANGE := 72.0

var _prompt: Label
var _player_near: bool = false

func _ready() -> void:
	add_to_group("npc")
	_build_prompt()
	_on_ready_npc()

func _on_ready_npc() -> void:
	pass  # override en subclases

func _build_prompt() -> void:
	_prompt = Label.new()
	_prompt.text     = "[ F ]"
	_prompt.position = Vector2(-14, -44)
	_prompt.visible  = false
	_prompt.add_theme_font_size_override("font_size", 12)
	_prompt.add_theme_color_override("font_color", Color(0.98, 0.92, 0.55))
	add_child(_prompt)

func _physics_process(_delta: float) -> void:
	if DialogueManager.is_active():
		_prompt.visible = false
		return
	var players := get_tree().get_nodes_in_group("player")
	if players.is_empty():
		_prompt.visible = false
		return
	_player_near    = global_position.distance_to(players[0].global_position) <= INTERACT_RANGE
	_prompt.visible = _player_near
	_on_physics_npc(_delta)

func _on_physics_npc(_delta: float) -> void:
	pass  # override para movimiento

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("interact") and _player_near and not DialogueManager.is_active():
		_on_interact()

func _on_interact() -> void:
	pass  # override en subclases
