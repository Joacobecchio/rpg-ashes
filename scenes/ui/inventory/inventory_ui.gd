extends CanvasLayer

const BG_COLOR     := Color(0.06, 0.04, 0.02, 0.96)
const BORDER_COLOR := Color(0.55, 0.38, 0.08)
const SLOT_EMPTY   := Color(0.10, 0.08, 0.05)
const SLOT_FILLED  := Color(0.18, 0.14, 0.08)
const SLOT_QUEST   := Color(0.18, 0.07, 0.04)
const SLOT_HOVER   := Color(0.28, 0.22, 0.10)
const TEXT_COLOR   := Color(0.95, 0.88, 0.65)
const DIM_COLOR    := Color(0.5,  0.45, 0.35)
const BONUS_COLOR  := Color(0.55, 0.85, 0.45)

const PANEL_W := 560
const PANEL_H := 380

var _eq_slots:  Array = []
var _bag_slots: Array = []
var _desc_lbl:  Label

func _ready() -> void:
	layer   = 15
	visible = false
	_build()
	InventorySystem.inventory_changed.connect(_refresh)

# ── Build ─────────────────────────────────────────────────────────────────────

func _build() -> void:
	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.45)
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

	var panel := Panel.new()
	panel.size     = Vector2(PANEL_W, PANEL_H)
	panel.position = Vector2((1280 - PANEL_W) / 2.0, (720 - PANEL_H) / 2.0)
	panel.add_theme_stylebox_override("panel", _make_panel_style())
	add_child(panel)

	var es := I18nManager.get_language() == "es"

	# Title
	var title := _lbl("INVENTARIO" if es else "INVENTORY", Vector2(20, 12), 16, TEXT_COLOR)
	panel.add_child(title)
	var hint := _lbl("[ I ] cerrar" if es else "[ I ] close", Vector2(PANEL_W - 112, 14), 11, DIM_COLOR)
	panel.add_child(hint)

	# Top divider
	panel.add_child(_hline(Vector2(10, 40), PANEL_W - 20))

	# ── Left: equipment ───────────────────────────────────────────────────────
	panel.add_child(_lbl("EQUIPADO" if es else "EQUIPPED", Vector2(15, 50), 10, DIM_COLOR))

	var slot_keys  := ["weapon", "chest", "accessory"]
	var labels_es  := ["Arma", "Pecho", "Accesorio"]
	var labels_en  := ["Weapon", "Chest", "Accessory"]
	var slot_lbls  := labels_es if es else labels_en

	for i in range(3):
		var s: Dictionary = _build_equip_slot(panel, Vector2(15, 68 + i * 78), slot_keys[i], slot_lbls[i])
		_eq_slots.append(s)

	# Vertical divider
	panel.add_child(_vline(Vector2(205, 44), PANEL_H - 55))

	# ── Right: bag ────────────────────────────────────────────────────────────
	panel.add_child(_lbl("MOCHILA" if es else "BAG", Vector2(215, 50), 10, DIM_COLOR))

	var cols   := 3
	var slot_w := 108
	var slot_h := 58
	var gap    := 4
	var ox     := 215
	var oy     := 68

	for i in range(12):
		var col := i % cols
		var row := i / cols
		var pos := Vector2(ox + col * (slot_w + gap), oy + row * (slot_h + gap))
		var s: Dictionary = _build_bag_slot(panel, pos, Vector2(slot_w, slot_h), i)
		_bag_slots.append(s)

	# Bottom area
	panel.add_child(_hline(Vector2(10, PANEL_H - 52), PANEL_W - 20))
	_desc_lbl = _lbl("", Vector2(15, PANEL_H - 46), 11, TEXT_COLOR)
	_desc_lbl.size = Vector2(PANEL_W - 30, 40)
	_desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	panel.add_child(_desc_lbl)

	_refresh()

func _build_equip_slot(parent: Control, pos: Vector2, slot_key: String, label_text: String) -> Dictionary:
	var sz  := Vector2(175, 68)
	var bg  := ColorRect.new()
	bg.size     = sz
	bg.position = pos
	bg.color    = SLOT_EMPTY
	parent.add_child(bg)

	var type_lbl := _lbl(label_text.to_upper(), pos + Vector2(5, 3), 9, DIM_COLOR)
	parent.add_child(type_lbl)
	var name_lbl := _lbl("—", pos + Vector2(5, 20), 13, TEXT_COLOR)
	name_lbl.size = Vector2(sz.x - 8, 24)
	parent.add_child(name_lbl)
	var bonus_lbl := _lbl("", pos + Vector2(5, 46), 9, BONUS_COLOR)
	parent.add_child(bonus_lbl)

	var btn := _make_invisible_btn(sz)
	btn.position = pos
	btn.pressed.connect(_on_equip_click.bind(slot_key))
	btn.mouse_entered.connect(_on_equip_hover.bind(slot_key, bg))
	btn.mouse_exited.connect(_on_hover_exit.bind(bg, SLOT_EMPTY))
	parent.add_child(btn)

	return { "bg": bg, "name_lbl": name_lbl, "bonus_lbl": bonus_lbl, "slot_key": slot_key }

func _build_bag_slot(parent: Control, pos: Vector2, sz: Vector2, idx: int) -> Dictionary:
	var bg  := ColorRect.new()
	bg.size     = sz
	bg.position = pos
	bg.color    = SLOT_EMPTY
	parent.add_child(bg)

	var name_lbl := _lbl("", pos + Vector2(5, 5), 11, TEXT_COLOR)
	name_lbl.size = Vector2(sz.x - 8, 30)
	name_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	parent.add_child(name_lbl)

	var type_lbl := _lbl("", pos + Vector2(5, sz.y - 18), 9, DIM_COLOR)
	parent.add_child(type_lbl)

	var btn := _make_invisible_btn(sz)
	btn.position = pos
	btn.pressed.connect(_on_bag_click.bind(idx))
	btn.mouse_entered.connect(_on_bag_hover.bind(idx, bg))
	btn.mouse_exited.connect(_on_hover_exit.bind(bg, SLOT_EMPTY))
	parent.add_child(btn)

	return { "bg": bg, "name_lbl": name_lbl, "type_lbl": type_lbl }

# ── Refresh ───────────────────────────────────────────────────────────────────

func _refresh() -> void:
	if not is_inside_tree():
		return

	var slot_keys := ["weapon", "chest", "accessory"]
	for i in range(3):
		var s:         Dictionary = _eq_slots[i]
		var item_id:   String     = InventorySystem.equipped[slot_keys[i]]
		var bg:        ColorRect  = s["bg"]
		var name_lbl:  Label      = s["name_lbl"]
		var bonus_lbl: Label      = s["bonus_lbl"]
		if item_id == "":
			name_lbl.text  = "—"
			bonus_lbl.text = ""
			bg.color       = SLOT_EMPTY
		else:
			name_lbl.text  = InventorySystem.item_name(item_id)
			bonus_lbl.text = _fmt_bonus(item_id)
			bg.color       = SLOT_QUEST if InventorySystem.ITEMS[item_id].get("quest_item", false) else SLOT_FILLED

	for i in range(12):
		var s:        Dictionary = _bag_slots[i]
		var bg:       ColorRect  = s["bg"]
		var name_lbl: Label      = s["name_lbl"]
		var type_lbl: Label      = s["type_lbl"]
		if i < InventorySystem.bag.size():
			var item_id := InventorySystem.bag[i]
			var item    := InventorySystem.ITEMS.get(item_id, {})
			name_lbl.text = InventorySystem.item_name(item_id)
			type_lbl.text = _type_str(item.get("type", ""))
			bg.color      = SLOT_QUEST if item.get("quest_item", false) else SLOT_FILLED
		else:
			name_lbl.text = ""
			type_lbl.text = ""
			bg.color      = SLOT_EMPTY

# ── Interactions ──────────────────────────────────────────────────────────────

func _on_equip_click(slot_key: String) -> void:
	InventorySystem.unequip(slot_key)

func _on_bag_click(idx: int) -> void:
	if idx >= InventorySystem.bag.size():
		return
	var item_id := InventorySystem.bag[idx]
	var item    := InventorySystem.ITEMS.get(item_id, {})
	if item.get("type") == "consumable":
		InventorySystem.use_consumable(idx)
	else:
		InventorySystem.equip(idx)
	_desc_lbl.text = ""

func _on_equip_hover(slot_key: String, bg: ColorRect) -> void:
	bg.color = SLOT_HOVER
	var item_id := InventorySystem.equipped[slot_key]
	if item_id == "":
		_desc_lbl.text = ""
		return
	var es  := I18nManager.get_language() == "es"
	var act := "Clic para desequipar" if es else "Click to unequip"
	_desc_lbl.text = InventorySystem.item_name(item_id) + "  —  " + InventorySystem.item_desc(item_id) + "    [" + act + "]"

func _on_bag_hover(idx: int, bg: ColorRect) -> void:
	if idx < InventorySystem.bag.size():
		bg.color = SLOT_HOVER
	if idx >= InventorySystem.bag.size():
		_desc_lbl.text = ""
		return
	var item_id := InventorySystem.bag[idx]
	var item    := InventorySystem.ITEMS.get(item_id, {})
	var es      := I18nManager.get_language() == "es"
	var act: String
	if item.get("type") == "consumable":
		act = "Clic para usar" if es else "Click to use"
	else:
		act = "Clic para equipar" if es else "Click to equip"
	_desc_lbl.text = InventorySystem.item_name(item_id) + "  —  " + InventorySystem.item_desc(item_id) + "    [" + act + "]"

func _on_hover_exit(bg: ColorRect, base_color: Color) -> void:
	# Restore the current fill state, not always SLOT_EMPTY
	_desc_lbl.text = ""
	_refresh()

func _unhandled_input(event: InputEvent) -> void:
	if visible and event.is_action_pressed("inventory"):
		InventorySystem.toggle_ui()
		get_viewport().set_input_as_handled()

# ── Helpers ───────────────────────────────────────────────────────────────────

func _fmt_bonus(item_id: String) -> String:
	var bonus := InventorySystem.ITEMS.get(item_id, {}).get("bonus", {})
	if bonus.is_empty():
		return ""
	var parts: Array = []
	for key in bonus:
		parts.append("+" + str(bonus[key]) + " " + key.to_upper())
	return "  ".join(parts)

func _type_str(type: String) -> String:
	var es := I18nManager.get_language() == "es"
	match type:
		"weapon":     return "Arma" if es else "Weapon"
		"chest":      return "Pecho" if es else "Chest"
		"accessory":  return "Accesorio" if es else "Accessory"
		"consumable": return "Poción" if es else "Potion"
	return type

func _make_invisible_btn(sz: Vector2) -> Button:
	var btn := Button.new()
	btn.flat = true
	btn.size = sz
	btn.focus_mode = Control.FOCUS_NONE
	btn.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	var empty := StyleBoxEmpty.new()
	btn.add_theme_stylebox_override("normal",   empty)
	btn.add_theme_stylebox_override("hover",    empty)
	btn.add_theme_stylebox_override("pressed",  empty)
	btn.add_theme_stylebox_override("focus",    empty)
	btn.add_theme_stylebox_override("disabled", empty)
	return btn

func _lbl(text: String, pos: Vector2, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text     = text
	l.position = pos
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	return l

func _hline(pos: Vector2, width: float) -> ColorRect:
	var r := ColorRect.new()
	r.size     = Vector2(width, 1)
	r.position = pos
	r.color    = BORDER_COLOR
	return r

func _vline(pos: Vector2, height: float) -> ColorRect:
	var r := ColorRect.new()
	r.size     = Vector2(1, height)
	r.position = pos
	r.color    = BORDER_COLOR
	return r

func _make_panel_style() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color            = BG_COLOR
	sb.border_color        = BORDER_COLOR
	sb.border_width_left   = 1
	sb.border_width_right  = 1
	sb.border_width_top    = 1
	sb.border_width_bottom = 1
	return sb
