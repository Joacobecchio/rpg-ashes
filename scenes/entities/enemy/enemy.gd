extends CharacterBody2D

signal died(xp_reward: int)

enum State { IDLE, PATROL, CHASE, ATTACK }

const SPEED           := 80.0
const DETECTION_RANGE := 200.0
const ATTACK_RANGE    := 45.0
const ATTACK_COOLDOWN := 1.5
const BAR_WIDTH       := 30.0
const BAR_HEIGHT      := 4.0

var state: State    = State.IDLE
var patrol_target: Vector2
var patrol_timer: float  = 0.0
var attack_timer: float  = 0.0

var hp: int      = 60
var max_hp: int  = 60
var atk: int     = 8
var xp_reward: int = 20

var _body_rect:    ColorRect
var _hp_bar_fill:  ColorRect

func _ready() -> void:
	add_to_group("enemy")
	patrol_target = global_position
	patrol_timer  = randf_range(1.0, 3.0)
	_build_visuals()

func _physics_process(delta: float) -> void:
	var player := _get_player()

	match state:
		State.IDLE:
			velocity = Vector2.ZERO
			patrol_timer -= delta
			if patrol_timer <= 0.0:
				patrol_target = global_position + Vector2(randf_range(-120, 120), randf_range(-120, 120))
				state = State.PATROL
			if player and global_position.distance_to(player.global_position) < DETECTION_RANGE:
				state = State.CHASE

		State.PATROL:
			var dir := (patrol_target - global_position).normalized()
			velocity = dir * SPEED
			move_and_slide()
			if global_position.distance_to(patrol_target) < 8.0:
				state = State.IDLE
				patrol_timer = randf_range(1.5, 3.5)
			if player and global_position.distance_to(player.global_position) < DETECTION_RANGE:
				state = State.CHASE

		State.CHASE:
			if not player:
				state = State.IDLE
				return
			var dist := global_position.distance_to(player.global_position)
			if dist <= ATTACK_RANGE:
				velocity = Vector2.ZERO
				state = State.ATTACK
			elif dist > DETECTION_RANGE * 1.5:
				state = State.IDLE
			else:
				velocity = (player.global_position - global_position).normalized() * SPEED
				move_and_slide()

		State.ATTACK:
			velocity = Vector2.ZERO
			attack_timer -= delta
			if not player:
				state = State.IDLE
				return
			var dist := global_position.distance_to(player.global_position)
			if dist > ATTACK_RANGE:
				state = State.CHASE
			elif attack_timer <= 0.0:
				attack_timer = ATTACK_COOLDOWN
				player.take_damage(atk)

func take_damage(amount: int, is_crit: bool = false) -> void:
	hp = maxi(0, hp - amount)
	_update_hp_bar()
	_flash_hit()
	_spawn_damage_number(amount, is_crit)
	if hp == 0:
		_on_death()

func _on_death() -> void:
	set_physics_process(false)
	var player := _get_player()
	if player:
		player.gain_xp(xp_reward)
	died.emit(xp_reward)
	_try_drop()
	var tween := create_tween()
	tween.tween_property(self, "modulate", Color(1.0, 1.0, 1.0, 0.0), 0.35)
	tween.tween_callback(queue_free)

func _try_drop() -> void:
	var roll := randf()
	var drop := ""
	if   roll < 0.30: drop = "health_potion"
	elif roll < 0.42: drop = "rusty_dagger"
	elif roll < 0.50: drop = "leather_tunic"
	if drop != "":
		InventorySystem.add_item(drop)

# ── Visuals ───────────────────────────────────────────────────────────────────

func _build_visuals() -> void:
	_body_rect = ColorRect.new()
	_body_rect.size     = Vector2(24, 28)
	_body_rect.position = Vector2(-12, -14)
	_body_rect.color    = Color(0.85, 0.1, 0.1)
	add_child(_body_rect)

	var bar_bg := ColorRect.new()
	bar_bg.size     = Vector2(BAR_WIDTH, BAR_HEIGHT)
	bar_bg.position = Vector2(-BAR_WIDTH * 0.5, -22.0)
	bar_bg.color    = Color(0.15, 0.0, 0.0)
	add_child(bar_bg)

	_hp_bar_fill = ColorRect.new()
	_hp_bar_fill.size     = Vector2(BAR_WIDTH, BAR_HEIGHT)
	_hp_bar_fill.position = Vector2(-BAR_WIDTH * 0.5, -22.0)
	_hp_bar_fill.color    = Color(0.85, 0.1, 0.1)
	add_child(_hp_bar_fill)

func _update_hp_bar() -> void:
	_hp_bar_fill.size.x = BAR_WIDTH * (float(hp) / float(max_hp))

func _flash_hit() -> void:
	var tween := create_tween()
	tween.tween_property(_body_rect, "color", Color.WHITE, 0.05)
	tween.tween_property(_body_rect, "color", Color(0.85, 0.1, 0.1), 0.12)

func _spawn_damage_number(amount: int, is_crit: bool) -> void:
	var lbl := Label.new()
	lbl.text = str(amount) + ("!" if is_crit else "")
	lbl.add_theme_font_size_override("font_size", 16 if is_crit else 12)
	lbl.add_theme_color_override("font_color", Color(1.0, 0.85, 0.0) if is_crit else Color(1.0, 1.0, 1.0))
	lbl.position = Vector2(randf_range(-8.0, 8.0), -28.0)
	add_child(lbl)
	var tween := create_tween()
	tween.tween_property(lbl, "position", lbl.position + Vector2(randf_range(-6.0, 6.0), -38.0), 0.75)
	tween.parallel().tween_property(lbl, "modulate:a", 0.0, 0.75)
	tween.tween_callback(lbl.queue_free)

# ── Helpers ───────────────────────────────────────────────────────────────────

func _get_player() -> Node:
	var players := get_tree().get_nodes_in_group("player")
	return players[0] if players.size() > 0 else null
