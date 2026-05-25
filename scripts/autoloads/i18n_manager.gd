extends Node

signal language_changed(lang: String)

var _current_lang: String = "es"
var _translations: Dictionary = {}

func _ready() -> void:
	_load_language(_current_lang)

func _load_language(lang: String) -> void:
	var path := "res://assets/data/i18n/%s.json" % lang
	var file := FileAccess.open(path, FileAccess.READ)
	if not file:
		push_warning("I18nManager: archivo no encontrado: %s" % path)
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		_translations = parsed
	file.close()

func set_language(lang: String) -> void:
	if lang == _current_lang:
		return
	_current_lang = lang
	_load_language(lang)
	language_changed.emit(lang)

func get_language() -> String:
	return _current_lang

# Usar t() en vez de tr() porque tr() es método reservado de Godot
func t(key: String, params: Dictionary = {}) -> String:
	var keys := key.split(".")
	var node: Variant = _translations
	for k in keys:
		if node is Dictionary and node.has(k):
			node = node[k]
		else:
			return key
	var result := str(node)
	for k in params:
		result = result.replace("{%s}" % k, str(params[k]))
	return result
