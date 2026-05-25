extends Node

# Keys usadas en stats: hp, mp, atk, dex, mag, vit, armor, mres
# Evitamos "str" e "int" que son palabras reservadas en GDScript

const RACES: Dictionary = {
	"human":    { "hp": 800,  "mp": 300, "atk": 10, "dex": 10, "mag": 10, "vit": 10, "armor": 5,  "mres": 5,  "can_evolve": false },
	"elf":      { "hp": 600,  "mp": 500, "atk": 7,  "dex": 14, "mag": 14, "vit": 8,  "armor": 3,  "mres": 8,  "can_evolve": true  },
	"dwarf":    { "hp": 1000, "mp": 200, "atk": 14, "dex": 8,  "mag": 7,  "vit": 15, "armor": 10, "mres": 4,  "can_evolve": true  },
	"orc":      { "hp": 1100, "mp": 150, "atk": 16, "dex": 7,  "mag": 5,  "vit": 14, "armor": 8,  "mres": 2,  "can_evolve": true  },
	"draconic": { "hp": 850,  "mp": 400, "atk": 12, "dex": 10, "mag": 12, "vit": 11, "armor": 7,  "mres": 7,  "can_evolve": true  },
	"gnome":    { "hp": 550,  "mp": 600, "atk": 6,  "dex": 11, "mag": 17, "vit": 7,  "armor": 2,  "mres": 10, "can_evolve": true  },
}

const FACTIONS: Dictionary = {
	"ashen_order":     { "region": "valdrek",   "atk": 0, "dex": 1, "mag": 1, "vit": 1 },
	"black_choir":     { "region": "tharos",    "atk": 0, "dex": 0, "mag": 2, "vit": 1 },
	"hollow_pact":     { "region": "velthorne", "atk": 0, "dex": 0, "mag": 3, "vit": 0 },
	"iron_wolves":     { "region": "drak_mor",  "atk": 2, "dex": 1, "mag": 0, "vit": 0 },
	"emberborn":       { "region": "ashkhar",   "atk": 1, "dex": 1, "mag": 1, "vit": 0 },
	"ashen_veil":      { "region": "elmyr",     "atk": 0, "dex": 1, "mag": 2, "vit": 0 },
	"frostborn_clans": { "region": "nyrvald",   "atk": 2, "dex": 0, "mag": 0, "vit": 2 },
}

const CLASSES: Dictionary = {
	"warrior":     { "attack_type": "melee",  "hp": 1.3,  "mp": 0.8, "atk": 1.3, "dex": 1.0, "mag": 0.7, "vit": 1.2, "armor": 1.1, "mres": 0.9 },
	"paladin":     { "attack_type": "melee",  "hp": 1.2,  "mp": 1.0, "atk": 1.1, "dex": 0.9, "mag": 1.0, "vit": 1.2, "armor": 1.2, "mres": 1.1 },
	"berserker":   { "attack_type": "melee",  "hp": 1.4,  "mp": 0.6, "atk": 1.5, "dex": 0.9, "mag": 0.5, "vit": 1.3, "armor": 0.9, "mres": 0.7 },
	"ranger":      { "attack_type": "ranged", "hp": 0.9,  "mp": 0.9, "atk": 0.9, "dex": 1.5, "mag": 0.9, "vit": 0.9, "armor": 0.8, "mres": 0.8 },
	"assassin":    { "attack_type": "melee",  "hp": 0.8,  "mp": 0.9, "atk": 1.1, "dex": 1.6, "mag": 0.8, "vit": 0.8, "armor": 0.7, "mres": 0.7 },
	"pyromancer":  { "attack_type": "magic",  "hp": 0.7,  "mp": 1.4, "atk": 0.6, "dex": 0.8, "mag": 1.6, "vit": 0.7, "armor": 0.6, "mres": 1.0 },
	"necromancer": { "attack_type": "magic",  "hp": 0.8,  "mp": 1.5, "atk": 0.5, "dex": 0.7, "mag": 1.7, "vit": 0.8, "armor": 0.5, "mres": 1.1 },
	"inquisitor":  { "attack_type": "melee",  "hp": 1.0,  "mp": 1.1, "atk": 1.0, "dex": 0.9, "mag": 1.1, "vit": 1.0, "armor": 1.0, "mres": 1.2 },
	"warlock":     { "attack_type": "magic",  "hp": 0.75, "mp": 1.4, "atk": 0.5, "dex": 0.8, "mag": 1.6, "vit": 0.7, "armor": 0.5, "mres": 1.0 },
}

const COMPATIBILITY: Dictionary = {
	"warrior":     { "ashen_order": 2, "black_choir": 1, "hollow_pact": 1, "iron_wolves": 2, "emberborn": 2, "ashen_veil": 1, "frostborn_clans": 2 },
	"paladin":     { "ashen_order": 2, "black_choir": 2, "hollow_pact": 0, "iron_wolves": 0, "emberborn": 1, "ashen_veil": 0, "frostborn_clans": 0 },
	"berserker":   { "ashen_order": 1, "black_choir": 0, "hollow_pact": 0, "iron_wolves": 2, "emberborn": 2, "ashen_veil": 0, "frostborn_clans": 2 },
	"ranger":      { "ashen_order": 2, "black_choir": 0, "hollow_pact": 0, "iron_wolves": 2, "emberborn": 2, "ashen_veil": 2, "frostborn_clans": 2 },
	"assassin":    { "ashen_order": 1, "black_choir": 1, "hollow_pact": 1, "iron_wolves": 2, "emberborn": 1, "ashen_veil": 1, "frostborn_clans": 1 },
	"pyromancer":  { "ashen_order": 0, "black_choir": 1, "hollow_pact": 0, "iron_wolves": 0, "emberborn": 2, "ashen_veil": 0, "frostborn_clans": 0 },
	"necromancer": { "ashen_order": 0, "black_choir": 0, "hollow_pact": 2, "iron_wolves": 0, "emberborn": 0, "ashen_veil": 1, "frostborn_clans": 0 },
	"inquisitor":  { "ashen_order": 0, "black_choir": 2, "hollow_pact": 0, "iron_wolves": 0, "emberborn": 0, "ashen_veil": 0, "frostborn_clans": 0 },
	"warlock":     { "ashen_order": 0, "black_choir": 0, "hollow_pact": 2, "iron_wolves": 1, "emberborn": 1, "ashen_veil": 2, "frostborn_clans": 0 },
}

func create_character(race: String, char_class: String, faction: String, level: int = 1) -> Dictionary:
	var r: Dictionary = RACES.get(race, RACES["human"])
	var c: Dictionary = CLASSES.get(char_class, CLASSES["warrior"])
	var f: Dictionary = FACTIONS.get(faction, FACTIONS["ashen_order"])

	var ch: Dictionary = {
		"race": race,
		"char_class": char_class,
		"faction": faction,
		"level": level,
		"xp": 0,
		"xp_to_next": xp_to_next_level(level),
	}

	ch["max_hp"]  = roundi(r["hp"]    * c["hp"]    + f.get("vit", 0) * 5.0)
	ch["max_mp"]  = roundi(r["mp"]    * c["mp"])
	ch["atk"]     = roundi(r["atk"]   * c["atk"]   + f.get("atk", 0))
	ch["dex"]     = roundi(r["dex"]   * c["dex"]   + f.get("dex", 0))
	ch["mag"]     = roundi(r["mag"]   * c["mag"]   + f.get("mag", 0))
	ch["vit"]     = roundi(r["vit"]   * c["vit"]   + f.get("vit", 0))
	ch["armor"]   = roundi(r["armor"] * c["armor"])
	ch["mres"]    = roundi(r["mres"]  * c["mres"])
	ch["hp"]      = ch["max_hp"]
	ch["mp"]      = ch["max_mp"]

	return ch

func compute_damage(attacker: Dictionary, is_crit: bool = false) -> int:
	var atype: String = CLASSES.get(attacker.get("char_class", "warrior"), {}).get("attack_type", "melee")
	var base_dmg: float

	if atype == "magic":
		base_dmg = attacker.get("mag", 10) * 2.2 + attacker.get("level", 1) * 1.5
	else:
		base_dmg = attacker.get("atk", 10) * 2.0 + attacker.get("dex", 10) * 0.6 + attacker.get("level", 1) * 1.2

	base_dmg *= randf_range(0.85, 1.15)
	if is_crit:
		base_dmg *= 1.5

	return maxi(1, roundi(base_dmg))

func apply_damage(target: Dictionary, raw_damage: int) -> int:
	var final_dmg: int = maxi(1, raw_damage - roundi(target.get("armor", 0) * 0.4))
	target["hp"] = maxi(0, target["hp"] - final_dmg)
	return final_dmg

func roll_crit(character: Dictionary) -> bool:
	var atype: String = CLASSES.get(character.get("char_class", "warrior"), {}).get("attack_type", "melee")
	var stat: int = character.get("dex", 10) if atype != "magic" else character.get("mag", 10)
	var chance: float = minf(0.5, 0.05 + stat * 0.003)
	return randf() < chance

func gain_xp(character: Dictionary, amount: int) -> bool:
	character["xp"] += amount
	if character["xp"] >= character["xp_to_next"]:
		_level_up(character)
		return true
	return false

func _level_up(character: Dictionary) -> void:
	character["xp"] -= character["xp_to_next"]
	character["level"] += 1
	character["xp_to_next"] = xp_to_next_level(character["level"])
	character["vit"]    += 1
	character["max_hp"] += 5
	character["hp"]      = character["max_hp"]
	var is_magic: bool = CLASSES.get(character.get("char_class", ""), {}).get("attack_type", "") == "magic"
	if is_magic:
		character["mag"]    += 1
		character["max_mp"] += 3
		character["mp"]      = character["max_mp"]

func xp_to_next_level(level: int) -> int:
	return 40 + level * 25

func get_start_region(faction: String) -> String:
	return FACTIONS.get(faction, {}).get("region", "valdrek")

func is_compatible(char_class: String, faction: String) -> int:
	return COMPATIBILITY.get(char_class, {}).get(faction, 1)

func is_alive(character: Dictionary) -> bool:
	return character.get("hp", 0) > 0
