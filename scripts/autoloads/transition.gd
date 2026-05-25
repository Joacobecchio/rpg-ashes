extends CanvasLayer

var _overlay: ColorRect

func _ready() -> void:
	layer = 100
	_overlay = ColorRect.new()
	_overlay.color = Color(0.0, 0.0, 0.0, 1.0)
	_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_overlay)
	_fade_in()

func _fade_in() -> void:
	var tween := create_tween()
	tween.tween_property(_overlay, "color:a", 0.0, 0.45)

func to_scene(path: String) -> void:
	var tween := create_tween()
	tween.tween_property(_overlay, "color:a", 1.0, 0.35)
	tween.tween_callback(func(): get_tree().change_scene_to_file(path))
	tween.tween_interval(0.08)
	tween.tween_property(_overlay, "color:a", 0.0, 0.45)
