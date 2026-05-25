extends Node2D

const TMJ_PATH  = "res://assets/data/maps/mapv1.tmj"
const TILE_SIZE = 32

const TS_IMAGES = {
	"TX Plant":         "res://assets/images/tilesets/TX Plant.png",
	"TX Tileset Grass": "res://assets/images/tilesets/TX Tileset Grass.png",
	"TX Struct":        "res://assets/images/tilesets/TX Struct.png",
}

# Atlas coords que bloquean el movimiento del jugador
const BLOCKING = {
	"TX Tileset Grass": [Vector2i(0, 4)],  # tile 561 = bordes de paredes
}

var _sources: Dictionary = {}
var _tileset: TileSet
var _tilemap: TileMap

func _ready() -> void:
	var file := FileAccess.open(TMJ_PATH, FileAccess.READ)
	if not file:
		push_error("MapLoader: no se puede abrir %s" % TMJ_PATH)
		return
	var json = JSON.parse_string(file.get_as_text())
	file.close()
	if not json is Dictionary:
		push_error("MapLoader: JSON inválido")
		return

	var map_w: int = int(json["width"])
	var map_h: int = int(json["height"])
	_build_tileset(json["tilesets"])
	_build_tilemap(json["layers"], map_w, map_h)
	_add_boundary_walls(map_w, map_h)
	call_deferred("_apply_camera_limits", map_w, map_h)

# ── TileSet ───────────────────────────────────────────────────────────────────

func _build_tileset(raw: Array) -> void:
	_tileset = TileSet.new()
	_tileset.tile_size = Vector2i(TILE_SIZE, TILE_SIZE)
	_tileset.add_physics_layer(0)

	for ts in raw:
		var ts_name: String = ts["name"]
		if not TS_IMAGES.has(ts_name):
			continue
		var source := TileSetAtlasSource.new()
		source.texture = load(TS_IMAGES[ts_name])
		source.texture_region_size = Vector2i(TILE_SIZE, TILE_SIZE)
		var sid: int = _tileset.add_source(source)
		_sources[ts_name] = {
			"sid":      sid,
			"firstgid": int(ts["firstgid"]),
			"columns":  int(ts["columns"]),
			"source":   source,
		}

# ── TileMap ───────────────────────────────────────────────────────────────────

func _build_tilemap(layers: Array, map_w: int, map_h: int) -> void:
	_tilemap = TileMap.new()
	_tilemap.tile_set = _tileset
	add_child(_tilemap)

	var godot_layer := 0
	for layer in layers:
		if layer.get("type") != "tilelayer" or not layer.get("visible", true):
			continue
		if godot_layer > 0:
			_tilemap.add_layer(godot_layer)
		_tilemap.set_layer_name(godot_layer, layer["name"])

		var data: Array = layer["data"]
		for i in data.size():
			var gid: int = data[i]
			if gid == 0:
				continue
			var r := _resolve(gid)
			if r.is_empty():
				continue
			var atlas := Vector2i(r["col"], r["row"])
			var ts_name: String = r["ts_name"]
			var src: TileSetAtlasSource = _sources[ts_name]["source"]
			var sid: int = _sources[ts_name]["sid"]
			if not src.has_tile(atlas):
				src.create_tile(atlas)
				_add_collision_if_blocking(ts_name, atlas, src)
			_tilemap.set_cell(godot_layer, Vector2i(i % map_w, i / map_w), sid, atlas)

		godot_layer += 1

func _add_collision_if_blocking(ts_name: String, atlas: Vector2i, src: TileSetAtlasSource) -> void:
	if not BLOCKING.has(ts_name):
		return
	if not (atlas in BLOCKING[ts_name]):
		return
	var td := src.get_tile_data(atlas, 0)
	td.add_collision_polygon(0)
	td.set_collision_polygon_points(0, 0, PackedVector2Array([
		Vector2(-16, -16), Vector2(16, -16),
		Vector2(16,   16), Vector2(-16, 16),
	]))

# ── Bordes del mapa ───────────────────────────────────────────────────────────

func _add_boundary_walls(map_w: int, map_h: int) -> void:
	var w: float = map_w * TILE_SIZE
	var h: float = map_h * TILE_SIZE
	var thickness: float = 32.0
	# [posición central, tamaño del rectángulo]
	var walls := [
		[Vector2(w * 0.5,  -thickness * 0.5), Vector2(w + thickness * 2, thickness)],  # top
		[Vector2(w * 0.5,   h + thickness * 0.5), Vector2(w + thickness * 2, thickness)],  # bottom
		[Vector2(-thickness * 0.5, h * 0.5), Vector2(thickness, h)],  # left
		[Vector2(w + thickness * 0.5, h * 0.5), Vector2(thickness, h)],  # right
	]
	for data in walls:
		var body := StaticBody2D.new()
		body.position = data[0]
		var shape := CollisionShape2D.new()
		var rect := RectangleShape2D.new()
		rect.size = data[1]
		shape.shape = rect
		body.add_child(shape)
		add_child(body)

# ── Cámara ────────────────────────────────────────────────────────────────────

func _apply_camera_limits(map_w: int, map_h: int) -> void:
	var players := get_tree().get_nodes_in_group("player")
	if players.is_empty():
		return
	var cam := players[0].get_node_or_null("Camera2D")
	if not cam:
		return
	cam.limit_left   = 0
	cam.limit_top    = 0
	cam.limit_right  = map_w * TILE_SIZE
	cam.limit_bottom = map_h * TILE_SIZE

# ── Helpers ───────────────────────────────────────────────────────────────────

func _resolve(gid: int) -> Dictionary:
	var best_name := ""
	var best_fg   := -1
	for ts_name in _sources:
		var fg: int = _sources[ts_name]["firstgid"]
		if fg <= gid and fg > best_fg:
			best_fg   = fg
			best_name = ts_name
	if best_name.is_empty():
		return {}
	var local: int = gid - best_fg
	var cols: int  = _sources[best_name]["columns"]
	return {"ts_name": best_name, "col": local % cols, "row": local / cols}
