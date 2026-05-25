extends "res://scenes/entities/npc/npc_base.gd"

const SPEED := 40.0

# Waypoints de deambulación en Valdrek — cambia de posición, no todos lo encuentran igual
const WAYPOINTS := [
	Vector2(380, 340),
	Vector2(520, 290),
	Vector2(600, 420),
	Vector2(440, 500),
	Vector2(310, 450),
]

var _waypoint_idx: int   = 0
var _wait_timer:   float = 0.0
var _waiting:      bool  = true

func _on_ready_npc() -> void:
	_build_visual()
	_waypoint_idx = randi() % WAYPOINTS.size()
	global_position = WAYPOINTS[_waypoint_idx]

func _build_visual() -> void:
	var body := ColorRect.new()
	body.size     = Vector2(22, 30)
	body.position = Vector2(-11, -15)
	body.color    = Color(0.72, 0.62, 0.44)
	add_child(body)

	var name_lbl := Label.new()
	name_lbl.text     = "JEICOK"
	name_lbl.position = Vector2(-18, -32)
	name_lbl.add_theme_font_size_override("font_size", 10)
	name_lbl.add_theme_color_override("font_color", Color(0.95, 0.88, 0.65))
	add_child(name_lbl)

func _on_physics_npc(delta: float) -> void:
	if _player_near:
		velocity = Vector2.ZERO
		move_and_slide()
		return

	if _waiting:
		_wait_timer -= delta
		if _wait_timer <= 0.0:
			_waiting = false
			_waypoint_idx = (_waypoint_idx + 1) % WAYPOINTS.size()
		return

	var target: Vector2 = WAYPOINTS[_waypoint_idx]
	var dist: float     = global_position.distance_to(target)
	if dist < 6.0:
		velocity      = Vector2.ZERO
		_waiting      = true
		_wait_timer   = randf_range(2.5, 5.0)
	else:
		velocity = (target - global_position).normalized() * SPEED
	move_and_slide()

# ── Diálogo ───────────────────────────────────────────────────────────────────

func _on_interact() -> void:
	DialogueManager.increment_flag("jeicok_talks")
	DialogueManager.show_sequence(_get_dialogue())

func _get_dialogue() -> Array:
	var es: bool  = I18nManager.get_language() == "es"
	var quest: int = DialogueManager.get_flag("jeicok_quest_state")
	var armor: bool = DialogueManager.get_flag("has_quince_armor")

	# Si lleva puesta la armadura del XV → reacción especial primero
	if armor and quest != 2:
		return _dlg_sees_armor(es)

	match quest:
		0: return _dlg_base(es)
		1: return _dlg_quest_active(es)
		2: return _dlg_post_quest(es)
		3: return _dlg_betrayal(es)
	return []

# ── Estado 0 — conversaciones base ────────────────────────────────────────────

func _dlg_base(es: bool) -> Array:
	var talks: int = DialogueManager.get_flag("jeicok_talks")
	var phrases_es := [
		"Las mejores moradas se construyen con la gente que elige quedarse.",
		"Todavía queda gente buena en este mundo. Solo hay que saber dónde buscarla.",
		"No hace falta comprenderlo todo para seguir el camino.",
		"Hay lugares que, cuando son tuyos, los sientes de otra manera.",
		"Mientras haya gente que cuide a los suyos, todavía vale la pena luchar.",
	]
	var phrases_en := [
		"The best homes are built by the people who choose to stay.",
		"There's still good people in this world. You just have to know where to look.",
		"You don't need to understand everything to keep walking.",
		"There are places that, when they're yours, you feel them differently.",
		"As long as there are people looking after their own, it's still worth fighting.",
	]
	var phrases: Array = phrases_es if es else phrases_en
	var idx: int       = mini(talks - 1, phrases.size() - 1)

	var steps: Array = [{"speaker": "JEICOK", "text": phrases[idx]}]

	# A partir de la 5ta conversación se desbloquea preguntar por la Casa del XV
	if talks >= 5:
		var unlock_es := "Hay algo que llevo conmigo desde hace tiempo. No sé si estás listo para escucharlo... pero si quieres, te lo cuento."
		var unlock_en := "There's something I've been carrying for a long time. I don't know if you're ready to hear it... but if you want, I'll tell you."
		steps.append({
			"speaker": "JEICOK",
			"text":    unlock_es if es else unlock_en,
			"choices": [
				{
					"label":     "Preguntar por la Casa del XV" if es else "Ask about the House of the XV",
					"on_select": _start_quest.bind(es),
				},
				{
					"label":     "Ahora no" if es else "Not now",
					"on_select": Callable(),
				},
			],
		})
	return steps

# ── Inicio de quest ───────────────────────────────────────────────────────────

func _start_quest(es: bool) -> void:
	DialogueManager.set_flag("jeicok_quest_state", 1)
	var intro_es := [
		{"speaker": "JEICOK", "text": "La Casa del XV. Hace mucho tiempo que no pronunciaba ese nombre en voz alta."},
		{"speaker": "JEICOK", "text": "Hubo alguien... Varek Mourne. Fue aliado nuestro durante el Ashfall. Alguien en quien confiábamos."},
		{"speaker": "JEICOK", "text": "Cuando dejó de convenirle, se marchó. Y no se marchó solo. Se llevó gente. Mi gente."},
		{"speaker": "JEICOK", "text": "Nunca pude cerrar ese círculo. Tal vez tú sí puedas.", "choices": [
			{"label": "¿Dónde puedo encontrarlo?", "on_select": _give_quest_hint.bind(es)},
			{"label": "Necesito pensarlo", "on_select": Callable()},
		]},
	]
	var intro_en := [
		{"speaker": "JEICOK", "text": "The House of the XV. I haven't said that out loud in a long time."},
		{"speaker": "JEICOK", "text": "There was someone... Varek Mourne. An ally during the Ashfall. Someone we trusted."},
		{"speaker": "JEICOK", "text": "When it stopped being convenient for him, he left. And he didn't leave alone. He took people. My people."},
		{"speaker": "JEICOK", "text": "I was never able to close that circle. Maybe you can.", "choices": [
			{"label": "Where can I find him?", "on_select": _give_quest_hint.bind(es)},
			{"label": "I need to think about it", "on_select": Callable()},
		]},
	]
	DialogueManager.show_sequence(intro_es if es else intro_en)

func _give_quest_hint(es: bool) -> void:
	var hint_es := [
		{"speaker": "JEICOK", "text": "Lo último que supe, se encontraba al norte. Tiene su propia guardia ahora. La Guardia de Hierro Hueco, así se llaman."},
		{"speaker": "JEICOK", "text": "Son ruidosos. Arrogantes. Intentarán hacerte sentir pequeño antes de dejarte pasar."},
		{"speaker": "JEICOK", "text": "No les creas. Jamás ganaron nada por sí solos."},
	]
	var hint_en := [
		{"speaker": "JEICOK", "text": "Last I heard, he was to the north. He has his own people now. The Hollow Iron Guard, they call themselves."},
		{"speaker": "JEICOK", "text": "They're loud. Arrogant. They'll try to make you feel small before letting you through."},
		{"speaker": "JEICOK", "text": "Don't believe them. They never won anything on their own."},
	]
	DialogueManager.show_sequence(hint_es if es else hint_en)

# ── Estado 1 — quest activa ───────────────────────────────────────────────────

func _dlg_quest_active(es: bool) -> Array:
	var active_es := [
		{"speaker": "JEICOK", "text": "¿Cómo avanza todo? No tienes que apresurarte. Estas cosas tienen su tiempo.", "choices": [
			{"label": "Voy bien", "on_select": Callable()},
			{"label": "Abandonar misión", "on_select": _abandon_quest.bind(es)},
		]},
	]
	var active_en := [
		{"speaker": "JEICOK", "text": "How's it going? You don't have to rush. These things have their time.", "choices": [
			{"label": "I'm good", "on_select": Callable()},
			{"label": "Abandon quest", "on_select": _abandon_quest.bind(es)},
		]},
	]
	return active_es if es else active_en

func _abandon_quest(es: bool) -> void:
	DialogueManager.set_flag("jeicok_quest_state", 0)
	var msg_es := [
		{"speaker": "JEICOK", "text": "No hay problema. Cada uno carga lo que puede."},
		{"speaker": "JEICOK", "text": "Hay batallas que llegan más tarde. O que nunca llegan. Y así también está bien."},
	]
	var msg_en := [
		{"speaker": "JEICOK", "text": "It's alright. Everyone carries what they can."},
		{"speaker": "JEICOK", "text": "Some battles come later. Or they don't come at all. And that's okay too."},
	]
	DialogueManager.show_sequence(msg_es if es else msg_en)

# ── Estado 2 — quest completada (camino leal) ─────────────────────────────────

func _dlg_post_quest(es: bool) -> Array:
	var post_es := [
		{"speaker": "JEICOK", "text": "..."},
		{"speaker": "JEICOK", "text": "Gracias. De verdad."},
		{"speaker": "JEICOK", "text": "No esperaba que alguien cerrara eso por mí. Menos alguien que apenas me conoce."},
		{"speaker": "JEICOK", "text": "Visita la Casa del XV cuando puedas. Creo que ya ganaste el derecho de entrar como si siempre hubieras pertenecido ahí."},
	]
	var post_en := [
		{"speaker": "JEICOK", "text": "..."},
		{"speaker": "JEICOK", "text": "Thank you. Truly."},
		{"speaker": "JEICOK", "text": "I didn't expect anyone to close that for me. Especially not someone who barely knows me."},
		{"speaker": "JEICOK", "text": "Stop by the House of the XV. I think you've earned the right to walk in like you always belonged there."},
	]
	return post_es if es else post_en

# ── Estado traición ───────────────────────────────────────────────────────────

func _dlg_betrayal(es: bool) -> Array:
	var msg_es := [{"speaker": "JEICOK", "text": "...no tengo nada que decirte."}]
	var msg_en := [{"speaker": "JEICOK", "text": "...I have nothing to say to you."}]
	return msg_es if es else msg_en

# ── Reacción a la armadura del XV ─────────────────────────────────────────────

func _dlg_sees_armor(es: bool) -> Array:
	var armor_es := [
		{"speaker": "JEICOK", "text": "Ese rojo... ese blanco."},
		{"speaker": "JEICOK", "text": "Hace tiempo que no veía esos colores juntos así."},
		{"speaker": "JEICOK", "text": "Te quedan bien. De verdad te quedan bien."},
	]
	var armor_en := [
		{"speaker": "JEICOK", "text": "That red... that white."},
		{"speaker": "JEICOK", "text": "It's been a while since I've seen those colors together like that."},
		{"speaker": "JEICOK", "text": "They suit you. They really suit you."},
	]
	return armor_es if es else armor_en
