extends Node

signal dialogue_started
signal dialogue_ended

# Flags persistentes del sistema narrativo
var flags: Dictionary = {
	"jeicok_talks":       0,      # conversaciones completadas con JEICOK
	"jeicok_quest_state": 0,      # 0=sin iniciar, 1=activa, 2=completada, 3=traición
	"jeicok_told_offer":  false,  # el jugador le contó a JEICOK sobre el soborno
	"varek_deal_taken":   false,  # aceptó el trato de Varek
	"varek_gold":         0,      # oro recibido de Varek
	"varek_alliance":     false,  # se alió con Varek (traicionó a JEICOK)
	"jeicok_dead":        false,  # mató a JEICOK
	"has_quince_armor":   false,  # tiene la armadura del XV
	"has_quince_mark":    false,  # tiene la Insignia del XV (camino leal)
	"bastion_fragments":  0,      # fragmentos del Acta de Fundación encontrados (max 15)
}

var _box: Node = null
var _active: bool = false

func _ready() -> void:
	call_deferred("_init_box")

func _init_box() -> void:
	var packed = load("res://scenes/ui/dialogue/dialogue_box.tscn")
	if packed:
		_box = packed.instantiate()
		get_tree().root.add_child(_box)

func is_active() -> bool:
	return _active

func get_flag(key: String) -> Variant:
	return flags.get(key)

func set_flag(key: String, value: Variant) -> void:
	flags[key] = value

func increment_flag(key: String) -> void:
	flags[key] = int(flags.get(key, 0)) + 1

func show_sequence(steps: Array) -> void:
	if _active or not _box:
		return
	_active = true
	dialogue_started.emit()
	_box.start(steps, _on_done)

func _on_done() -> void:
	_active = false
	dialogue_ended.emit()
