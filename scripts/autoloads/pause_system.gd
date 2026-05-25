extends Node

var is_open: bool = false
var _ui:     Node = null

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	call_deferred("_create_ui")

func _process(_delta: float) -> void:
	if not Input.is_action_just_pressed("ui_cancel"):
		return
	if DialogueManager.is_active():
		return
	if InventorySystem.is_open:
		InventorySystem.toggle_ui()
		return
	toggle()

func toggle() -> void:
	if _ui == null:
		return
	is_open = !is_open
	_ui.visible   = is_open
	get_tree().paused = is_open

func _create_ui() -> void:
	var scene = load("res://scenes/ui/pause/pause_menu.tscn")
	if scene == null:
		return
	_ui = scene.instantiate()
	get_tree().root.add_child(_ui)
