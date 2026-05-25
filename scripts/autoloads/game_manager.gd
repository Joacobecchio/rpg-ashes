extends Node

signal scene_changed(scene_name: String)
signal game_paused(is_paused: bool)

enum GameState { MENU, PLAYING, PAUSED, CUTSCENE, LOADING }

var current_state: GameState = GameState.MENU
var player_data: Dictionary = {}
var is_new_game: bool = true

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func change_scene(path: String) -> void:
	get_tree().change_scene_to_file(path)
	scene_changed.emit(path)

func pause(value: bool) -> void:
	get_tree().paused = value
	current_state = GameState.PAUSED if value else GameState.PLAYING
	game_paused.emit(value)

func set_player_data(data: Dictionary) -> void:
	player_data = data

func get_player_data() -> Dictionary:
	return player_data
