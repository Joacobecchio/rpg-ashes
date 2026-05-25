#!/usr/bin/env python3
"""Populates the Legacy of Ashes Notion Dev Hub pages via API."""

import json
import os
import urllib.request
import urllib.error

TOKEN      = os.environ["NOTION_TOKEN"]
TECH_PAGE  = os.environ.get("NOTION_TECH_PAGE_ID",  "36afe52d-3d05-8091-9eb6-ef32893d4066")
GDD_PAGE   = os.environ.get("NOTION_GDD_PAGE_ID",   "36afe52d-3d05-8051-90a5-fd3f5e2d4cbb")
ROAD_PAGE  = os.environ.get("NOTION_ROADMAP_PAGE_ID","36afe52d-3d05-8087-ac87-e4eba4244f10")

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

def req(method, path, body=None):
    url = f"https://api.notion.com/v1{path}"
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(r) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()}")
        return None

def append(page_id, children):
    """Append blocks in chunks of 100."""
    for i in range(0, len(children), 100):
        chunk = children[i:i+100]
        result = req("PATCH", f"/blocks/{page_id}/children", {"children": chunk})
        if result is None:
            print(f"  Failed chunk {i//100 + 1}")

def h1(text):
    return {"object":"block","type":"heading_1","heading_1":{"rich_text":[{"type":"text","text":{"content":text}}]}}

def h2(text):
    return {"object":"block","type":"heading_2","heading_2":{"rich_text":[{"type":"text","text":{"content":text}}]}}

def h3(text):
    return {"object":"block","type":"heading_3","heading_3":{"rich_text":[{"type":"text","text":{"content":text}}]}}

def p(text):
    return {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":text}}]}}

def p_empty():
    return {"object":"block","type":"paragraph","paragraph":{"rich_text":[]}}

def code(text, lang="plain text"):
    return {"object":"block","type":"code","code":{"rich_text":[{"type":"text","text":{"content":text}}],"language":lang}}

def bullet(text, bold=False):
    style = {"bold": True} if bold else {}
    return {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"type":"text","text":{"content":text},"annotations":style}]}}

def todo(text, checked=False):
    return {"object":"block","type":"to_do","to_do":{"rich_text":[{"type":"text","text":{"content":text}}],"checked":checked}}

def divider():
    return {"object":"block","type":"divider","divider":{}}

def table(headers, rows):
    """Build a Notion table block with header row + data rows."""
    col_count = len(headers)
    header_cells = [[{"type":"text","text":{"content":h},"annotations":{"bold":True}}] for h in headers]
    data_rows = [[[{"type":"text","text":{"content":cell}}] for cell in row] for row in rows]
    return {
        "object": "block",
        "type": "table",
        "table": {
            "table_width": col_count,
            "has_column_header": True,
            "has_row_header": False,
            "children": [
                {"object":"block","type":"table_row","table_row":{"cells": header_cells}},
                *[{"object":"block","type":"table_row","table_row":{"cells": r}} for r in data_rows]
            ]
        }
    }

# ── Tech Stack & Repo ────────────────────────────────────────────────────────

def populate_tech():
    print("Populating Tech Stack & Repo...")
    blocks = [
        h1("Tech Stack & Repo — Legacy of Ashes"),
        p("Documento técnico completo del proyecto. Se actualiza automáticamente con cada milestone completado."),
        divider(),

        h2("🖥️ Engine & Plataforma"),
        table(
            ["Campo", "Valor"],
            [
                ["Engine", "Godot 4.6.3"],
                ["Renderer", "Forward+ (Vulkan) — soporta iluminación 2D dinámica"],
                ["Lenguaje", "GDScript"],
                ["Resolución", "1280 × 720 (canvas_items stretch)"],
                ["Plataforma objetivo", "Desktop PC — Windows / Mac / Linux"],
                ["Distribución futura", "Steam"],
                ["Multiplayer", "Godot MultiplayerAPI + ENet transport (co-op 2-4 jugadores — futuro)"],
            ]
        ),
        p_empty(),
        divider(),

        h2("🏗️ Arquitectura General"),
        p("El proyecto usa tres patrones principales:"),
        bullet("Autoload Singleton — sistemas globales siempre disponibles (StatsSystem, GameManager, I18nManager)"),
        bullet("Signal-based communication — los nodos se comunican por señales sin acoplamiento directo"),
        bullet("Group-based entity finding — el HUD encuentra al jugador via get_nodes_in_group('player')"),
        p_empty(),

        h2("📁 Estructura de Carpetas"),
        code(
"""legacy-of-ashes/
├── project.godot
├── .env                        ← secrets (gitignored)
├── scripts/
│   ├── autoloads/              ← Singletons globales
│   │   ├── game_manager.gd
│   │   ├── stats_system.gd
│   │   └── i18n_manager.gd
│   └── tools/
│       └── populate_notion.py  ← este script
├── scenes/
│   ├── entities/
│   │   └── player/
│   │       ├── player.gd
│   │       └── player.tscn
│   ├── ui/
│   │   └── hud/
│   │       ├── hud.gd
│   │       └── hud.tscn
│   └── world/
│       └── valdrek/
│           └── valdrek.tscn
└── assets/
    ├── data/i18n/              ← en.json / es.json
    ├── sprites/
    ├── audio/
    └── fonts/""",
            "shell"
        ),
        p_empty(),
        divider(),

        h2("⚙️ Autoloads (Singletons)"),
        table(
            ["Singleton", "Archivo", "Responsabilidad"],
            [
                ["GameManager", "scripts/autoloads/game_manager.gd", "Estado global (MENU/PLAYING/PAUSED/CUTSCENE/LOADING), cambio de escenas, datos del jugador"],
                ["StatsSystem", "scripts/autoloads/stats_system.gd", "Toda la lógica RPG: creación de personajes, daño, XP, level up, compatibilidad raza/clase/facción"],
                ["I18nManager", "scripts/autoloads/i18n_manager.gd", "Internacionalización, carga en.json y es.json, método t(key)"],
            ]
        ),
        p_empty(),
        divider(),

        h2("🎮 Sistemas Implementados"),
        table(
            ["Sistema", "Estado", "Archivo clave"],
            [
                ["Movimiento jugador (WASD + sprint)", "✅ Completo", "player.gd"],
                ["Stats RPG (HP/MP/ATK/DEX/MAG/VIT/ARMOR/MRES)", "✅ Completo", "stats_system.gd"],
                ["Razas (6): Human, Elf, Dwarf, Orc, Draconic, Gnome", "✅ Completo", "stats_system.gd"],
                ["Clases (9): Warrior, Paladin, Berserker, Ranger, Assassin, Pyromancer, Necromancer, Inquisitor, Warlock", "✅ Completo", "stats_system.gd"],
                ["Facciones (7): Ashen Order, Black Choir, Hollow Pact, Iron Wolves, Emberborn, Ashen Veil, Frostborn Clans", "✅ Completo", "stats_system.gd"],
                ["Daño, críticos, XP, level up", "✅ Completo", "stats_system.gd"],
                ["HUD (HP bar, MP bar, XP bar)", "✅ Completo", "hud.gd / hud.tscn"],
                ["Internacionalización (ES/EN)", "✅ Completo", "i18n_manager.gd"],
                ["Enemigo con IA (patrulla/persecución/ataque)", "🔄 En desarrollo", "—"],
                ["Sistema de combate", "📋 Pendiente", "—"],
                ["Save / Load", "📋 Pendiente", "—"],
                ["Diálogos (Dialogic plugin)", "📋 Pendiente", "—"],
                ["Multiplayer co-op (ENet)", "📋 Pendiente", "—"],
                ["Dungeons procedurales", "📋 Pendiente", "—"],
                ["Zone Pass System", "📋 Pendiente", "—"],
            ]
        ),
        p_empty(),
        divider(),

        h2("🎯 Input Map"),
        table(
            ["Acción", "Tecla"],
            [
                ["Moverse", "WASD / Flechas"],
                ["Sprint", "Shift"],
                ["Atacar", "Espacio"],
                ["Interactuar", "F"],
            ]
        ),
        p_empty(),
        divider(),

        h2("⚠️ Convenciones Importantes"),
        bullet("Stats usan atk (no str) y mag (no int) — palabras reservadas en GDScript"),
        bullet("Parámetro de clase usa char_class (no class_name) — reservada en GDScript"),
        bullet("I18n usa t() (no tr()) — tr() es método built-in de Object en Godot"),
        bullet("Renderer Forward+ requerido para iluminación dinámica 2D (PointLight2D, etc.)"),
        p_empty(),
    ]
    append(TECH_PAGE, blocks)
    print("  ✅ Tech Stack done")

# ── Game Design Document ─────────────────────────────────────────────────────

def populate_gdd():
    print("Populating Game Design Document...")
    blocks = [
        h1("Game Design Document — Legacy of Ashes: Eryndor"),
        p("El mundo de Eryndor fue devastado por The Ashfall — una lluvia de cenizas mágicas que corrompió la tierra, destruyó reinos y transformó a sus habitantes. Lo que quedó son 7 regiones separadas por fracturas, cada una dominada por una facción distinta que sobrevivió a su manera."),
        divider(),

        h2("🎯 Visión del Juego"),
        table(
            ["Campo", "Descripción"],
            [
                ["Género", "Dark Fantasy RPG de acción, narrativo, con co-op online"],
                ["Referencias visuales", "Sea of Stars (pixel art, colores, parallax) + Diablo 3 (iluminación dinámica, oscuridad, partículas)"],
                ["Plataforma", "Desktop PC — Windows / Mac / Linux"],
                ["Modelo de negocio", "F2P + $5 base game + Zone Passes por región (por personaje)"],
                ["Modo multijugador", "Co-op online 2-4 jugadores estilo Diablo — planificado para fase tardía"],
                ["Tono", "Post-apocalíptico oscuro, esperanza en ruinas, redención posible"],
            ]
        ),
        p_empty(),
        divider(),

        h2("🌍 El Mundo: Eryndor"),
        p("Antes del Ashfall, Eryndor era un continente unificado bajo el Imperio Argente. The Ashfall lo fracturó en 7 regiones aisladas. Cada región desarrolló su propia cultura de supervivencia y facción dominante."),
        p_empty(),

        h2("🗺️ Regiones & Facciones"),
        table(
            ["Región", "Facción", "Clase home", "Tono"],
            [
                ["Valdrek", "Ashen Order", "Warrior, Paladin, Ranger", "Fortaleza militar, orden y disciplina"],
                ["Tharos", "Black Choir", "Inquisitor, Paladin", "Teocracia oscura, fe como arma"],
                ["Velthorne", "Hollow Pact", "Necromancer, Warlock", "Magia prohibida, pactos con lo muerto"],
                ["Drak'Mor", "Iron Wolves", "Berserker, Warrior, Assassin", "Tribu guerrera, fuerza sobre todo"],
                ["Ashkhar", "Emberborn", "Pyromancer, Berserker, Ranger", "Supervivientes del fuego, caos controlado"],
                ["Elmyr", "Ashen Veil", "Warlock, Assassin, Ranger", "Espías y sombras, información es poder"],
                ["Nyrvald", "Frostborn Clans", "Berserker, Warrior, Ranger", "Clanes del frío, honor en combate"],
            ]
        ),
        p_empty(),
        divider(),

        h2("⚔️ Sistema de Personajes"),
        h3("Razas (6)"),
        table(
            ["Raza", "HP base", "MP base", "Fortaleza", "Puede evolucionar"],
            [
                ["Human", "800", "300", "Balanceado", "No"],
                ["Elf", "600", "500", "Magia / Destreza", "Sí"],
                ["Dwarf", "1000", "200", "VIT / ATK", "Sí"],
                ["Orc", "1100", "150", "ATK bruto", "Sí"],
                ["Draconic", "850", "400", "Balanceado+", "Sí"],
                ["Gnome", "550", "600", "Magia pura", "Sí"],
            ]
        ),
        p_empty(),

        h3("Clases (9 en demo — 17 total planificadas)"),
        table(
            ["Clase", "Tipo ataque", "Rol"],
            [
                ["Warrior", "Melee", "Tank DPS balanceado"],
                ["Paladin", "Melee", "Tank / Support sagrado"],
                ["Berserker", "Melee", "DPS puro, alto riesgo"],
                ["Ranger", "Ranged", "DPS a distancia, versátil"],
                ["Assassin", "Melee", "Burst DPS, sigilo"],
                ["Pyromancer", "Magic", "DPS mágico AoE, fuego"],
                ["Necromancer", "Magic", "Invocador, control"],
                ["Inquisitor", "Melee", "Hybrid melee/sagrado"],
                ["Warlock", "Magic", "DPS oscuro, pactos"],
            ]
        ),
        p_empty(),
        divider(),

        h2("💰 Modelo de Negocio"),
        bullet("Juego base: $5 USD — incluye región home (según facción elegida) + acceso a Valdrek como región tutorial"),
        bullet("Zone Pass: acceso temporal a regiones no-home (tiempo limitado, por personaje)"),
        bullet("Dual currency: Oro (in-game, farmeable) + Moneda real (premium, para passes y cosméticos)"),
        bullet("Viral gifting: podés regalarle un Zone Pass a un amigo para que te acompañe en co-op"),
        bullet("Co-op Guest: el invitado puede entrar, moverse y pelear en región extranjera, pero NO puede iniciar quests propias"),
        p_empty(),

        h2("🚪 Puertas de Región"),
        p("Cada región tiene una entrada monumental física en el mundo — una puerta imponente con guardianes. Si el jugador no tiene Zone Pass, el guardia lo detiene con diálogo contextual."),
        bullet("Si el jugador tiene pass: la puerta se abre directamente"),
        bullet("Si viene con un host que tiene pass: el guardia le pregunta al host '¿Viene contigo?' → [Sí, viene conmigo] / [No]"),
        bullet("Si no tiene pass ni host: guardia explica el costo y opciones de compra"),
        p_empty(),
    ]
    append(GDD_PAGE, blocks)
    print("  ✅ GDD done")

# ── Roadmap ──────────────────────────────────────────────────────────────────

def populate_roadmap():
    print("Populating Roadmap...")
    blocks = [
        h1("Roadmap — Legacy of Ashes: Eryndor"),
        p("Estado del desarrollo por milestones. Se actualiza automáticamente al completar cada sistema."),
        divider(),

        h2("✅ Milestone 0 — Fundación"),
        todo("Migración de Phaser 3 a Godot 4.6.3", True),
        todo("Configuración del proyecto (renderer, input map, resolución)", True),
        todo("Autoloads: GameManager, StatsSystem, I18nManager", True),
        todo("StatsSystem completo (razas, clases, facciones, daño, XP, level up)", True),
        todo("Migración de 104 assets del proyecto anterior", True),
        p_empty(),

        h2("✅ Milestone 1 — Jugador & HUD"),
        todo("Player con movimiento WASD + sprint", True),
        todo("Sistema de stats conectado al jugador (create_character)", True),
        todo("HUD con barras HP (roja), MP (azul), XP (dorada)", True),
        todo("HUD conectado a señales del jugador en tiempo real", True),
        p_empty(),

        h2("🔄 Milestone 2 — Primer Enemigo & Combate"),
        todo("Enemigo con placeholder visual (rect rojo)", False),
        todo("IA básica: estado Idle → Patrol → Chase → Attack", False),
        todo("Atacar con Espacio → el enemigo recibe daño", False),
        todo("El enemigo ataca al jugador → barra HP baja en el HUD", False),
        todo("Enemigo muere → suelta XP → barra XP sube", False),
        p_empty(),

        h2("📋 Milestone 3 — Save/Load & Escenas"),
        todo("Sistema de guardado (posición, stats, nivel, XP)", False),
        todo("Pantalla de inicio / menú principal", False),
        todo("Transición entre escenas (fade in/out)", False),
        todo("Múltiples zonas navegables", False),
        p_empty(),

        h2("📋 Milestone 4 — Diálogos & NPCs"),
        todo("Instalar Dialogic (compatible con Godot 4.6)", False),
        todo("NPC básico con diálogo contextual", False),
        todo("Sistema de quests básico", False),
        todo("Guardianes de región con diálogo de Zone Pass", False),
        p_empty(),

        h2("📋 Milestone 5 — Arte & Audio"),
        todo("Compra e integración de asset pack de sprites (personajes)", False),
        todo("Compra e integración de tilesets por región", False),
        todo("Música ambiental por región", False),
        todo("SFX de combate, pasos, UI", False),
        todo("Iluminación dinámica 2D con PointLight2D", False),
        p_empty(),

        h2("📋 Milestone 6 — Dungeon Procedural"),
        todo("Generador de dungeons por tiles (BSP o Cellular Automata)", False),
        todo("Loot aleatorio (common / epic)", False),
        todo("Enemigos procedurales por nivel de dungeon", False),
        p_empty(),

        h2("📋 Milestone 7 — Zone Pass System"),
        todo("Sistema de passes por personaje (servidor)", False),
        todo("UI de expiración de pass (HUD top-right)", False),
        todo("Sistema de gifting entre amigos", False),
        todo("Validación server-side", False),
        p_empty(),

        h2("📋 Milestone 8 — Multiplayer Co-op"),
        todo("Godot MultiplayerAPI + ENet transport", False),
        todo("Sincronización de posición y stats", False),
        todo("Co-op Guest mode (puede luchar, no puede hacer quests)", False),
        todo("Sistema de invitaciones", False),
        p_empty(),

        divider(),
        h2("📌 Decisiones Técnicas Tomadas"),
        bullet("Stat keys: atk / mag (en vez de str / int — reservadas en GDScript)"),
        bullet("HUD construido 100% por código (no usa .tscn para nodos UI) — fácil de actualizar sin el editor"),
        bullet("Dialogic: instalado cuando llegue Milestone 4 (versión main tenía errores con Godot 4.6.3)"),
        bullet("Co-op Guest: puede entrar, moverse y pelear — NO puede iniciar quests propias en región extranjera"),
        bullet("Pases: por personaje, no por cuenta — decisión de monetización deliberada"),
    ]
    append(ROAD_PAGE, blocks)
    print("  ✅ Roadmap done")

# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    populate_tech()
    populate_gdd()
    populate_roadmap()
    print("\n✅ Notion Dev Hub poblado completamente.")
