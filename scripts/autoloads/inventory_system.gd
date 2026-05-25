extends Node

const ITEMS: Dictionary = {
	"ash_sword": {
		"name_es": "Espada de Ceniza", "name_en": "Ash Sword",
		"type": "weapon",
		"desc_es": "Forjada con acero de las ruinas del Ashfall.",
		"desc_en": "Forged from steel salvaged in the Ashfall ruins.",
		"bonus": { "atk": 5, "dex": 1 },
	},
	"rusty_dagger": {
		"name_es": "Daga Oxidada", "name_en": "Rusty Dagger",
		"type": "weapon",
		"desc_es": "Vieja y gastada. Aun así, corta.",
		"desc_en": "Old and worn. Still cuts.",
		"bonus": { "atk": 2, "dex": 4 },
	},
	"leather_tunic": {
		"name_es": "Jubón de Cuero", "name_en": "Leather Tunic",
		"type": "chest",
		"desc_es": "Protección básica de cuero endurecido.",
		"desc_en": "Basic hardened leather protection.",
		"bonus": { "armor": 3, "vit": 1 },
	},
	"quince_armor": {
		"name_es": "Armadura del XV", "name_en": "Armor of the XV",
		"type": "chest",
		"desc_es": "Rojo y blanco. Los colores que Jeicok todavía recuerda.",
		"desc_en": "Red and white. Colors Jeicok still remembers.",
		"bonus": { "armor": 8, "vit": 3, "atk": 2 },
		"quest_item": true,
	},
	"insignia_xv": {
		"name_es": "Insignia del XV", "name_en": "Insignia of the XV",
		"type": "accessory",
		"desc_es": "Símbolo de lealtad probada. La Casa del XV la reconoce.",
		"desc_en": "Symbol of proven loyalty. The House of the XV recognizes it.",
		"bonus": { "vit": 2, "armor": 2 },
		"quest_item": true,
	},
	"health_potion": {
		"name_es": "Poción de Salud", "name_en": "Health Potion",
		"type": "consumable",
		"desc_es": "Restaura 120 puntos de vida.",
		"desc_en": "Restores 120 hit points.",
		"heal": 120,
	},
}

const MAX_BAG := 12
const SLOTS   := ["weapon", "chest", "accessory"]

var bag:      Array      = []
var equipped: Dictionary = { "weapon": "", "chest": "", "accessory": "" }
var is_open:  bool       = false

var _ui: Node = null

signal inventory_changed
signal item_acquired(item_id: String)

func _ready() -> void:
	call_deferred("_create_ui")

func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("inventory") and not DialogueManager.is_active():
		toggle_ui()

func _create_ui() -> void:
	var scene = load("res://scenes/ui/inventory/inventory_ui.tscn")
	if scene == null:
		return
	_ui = scene.instantiate()
	get_tree().root.add_child(_ui)

func toggle_ui() -> void:
	if _ui:
		is_open = !is_open
		_ui.visible = is_open

func add_item(item_id: String) -> bool:
	if bag.size() >= MAX_BAG or item_id not in ITEMS:
		return false
	bag.append(item_id)
	inventory_changed.emit()
	item_acquired.emit(item_id)
	return true

func equip(bag_idx: int) -> void:
	if bag_idx < 0 or bag_idx >= bag.size():
		return
	var item_id: String    = bag[bag_idx]
	var item:    Dictionary = ITEMS.get(item_id, {})
	var slot:    String    = item.get("type", "")
	if slot not in SLOTS:
		return
	var player := _get_player()
	if not player:
		return
	if equipped[slot] != "":
		_remove_bonuses(player, equipped[slot])
		bag.append(equipped[slot])
	equipped[slot] = item_id
	bag.remove_at(bag_idx)
	_apply_bonuses(player, item_id)
	_sync_quest_flags()
	inventory_changed.emit()

func unequip(slot: String) -> void:
	if slot not in SLOTS or equipped[slot] == "":
		return
	if bag.size() >= MAX_BAG:
		return
	var player := _get_player()
	if player:
		_remove_bonuses(player, equipped[slot])
	bag.append(equipped[slot])
	equipped[slot] = ""
	_sync_quest_flags()
	inventory_changed.emit()

func use_consumable(bag_idx: int) -> void:
	if bag_idx < 0 or bag_idx >= bag.size():
		return
	var item_id: String    = bag[bag_idx]
	var item:    Dictionary = ITEMS.get(item_id, {})
	if item.get("type") != "consumable":
		return
	var player := _get_player()
	if not player:
		return
	if item.has("heal"):
		player.heal(item["heal"])
	bag.remove_at(bag_idx)
	inventory_changed.emit()

func item_name(item_id: String) -> String:
	var item: Dictionary = ITEMS.get(item_id, {})
	var es: bool = I18nManager.get_language() == "es"
	return item.get("name_es" if es else "name_en", item_id)

func item_desc(item_id: String) -> String:
	var item: Dictionary = ITEMS.get(item_id, {})
	var es: bool = I18nManager.get_language() == "es"
	return item.get("desc_es" if es else "desc_en", "")

func get_save_data() -> Dictionary:
	return { "bag": bag.duplicate(), "equipped": equipped.duplicate() }

func load_save_data(data: Dictionary) -> void:
	bag      = data.get("bag", [])
	equipped = data.get("equipped", { "weapon": "", "chest": "", "accessory": "" })
	_sync_quest_flags()
	inventory_changed.emit()

# ── Internal ──────────────────────────────────────────────────────────────────

func _sync_quest_flags() -> void:
	DialogueManager.set_flag("has_quince_armor", equipped.get("chest") == "quince_armor")
	DialogueManager.set_flag("has_quince_mark",  equipped.get("accessory") == "insignia_xv")

func _apply_bonuses(player: Node, item_id: String) -> void:
	var bonus: Dictionary = ITEMS.get(item_id, {}).get("bonus", {})
	for key in bonus:
		if key in player.stats:
			player.stats[key] += bonus[key]
		if key == "vit":
			var hp_gain: int = bonus[key] * 5
			player.stats["max_hp"] += hp_gain
			player.stats["hp"]      = mini(player.stats["hp"] + hp_gain, player.stats["max_hp"])
	player.health_changed.emit(player.stats.hp, player.stats.max_hp)

func _remove_bonuses(player: Node, item_id: String) -> void:
	var bonus: Dictionary = ITEMS.get(item_id, {}).get("bonus", {})
	for key in bonus:
		if key in player.stats:
			player.stats[key] -= bonus[key]
		if key == "vit":
			var hp_loss: int = bonus[key] * 5
			player.stats["max_hp"] -= hp_loss
			player.stats["hp"]      = mini(player.stats["hp"], player.stats["max_hp"])
	player.health_changed.emit(player.stats.hp, player.stats.max_hp)

func _get_player() -> Node:
	var players := get_tree().get_nodes_in_group("player")
	return players[0] if players.size() > 0 else null
