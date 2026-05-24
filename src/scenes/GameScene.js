import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.esm.js";
import { ASSETS, ENEMY, GAME, PLAYER, SCENES } from "../constants.js";
import CharacterBuilder from "../systems/CharacterBuilder.js";
import CombatSystem from "../systems/CombatSystem.js";
import InputManager from "../systems/InputManager.js";
import VisualFxSystem from "../systems/VisualFxSystem.js";
import {
  applyEvolution,
  getEvolutionQuest,
  tryUnlockHumanTalent,
  tryUnlockEvolution,
} from "../systems/EvolutionSystem.js";
import { computeDamage, gainXp } from "../systems/StatsSystem.js";
import { SKILLS } from "../systems/SkillsSystem.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  create() {
    const { map, layers, colliders } = this.createTilemap();
    const worldWidth = map?.widthInPixels ?? GAME.WORLD_WIDTH;
    const worldHeight = map?.heightInPixels ?? GAME.WORLD_HEIGHT;

    this.map = map;
    this.layers = layers;
    this.colliders = colliders;
    this.depthBase = 200;

    if (map) {
      const debugBg = this.add.rectangle(
        map.widthInPixels / 2,
        map.heightInPixels / 2,
        map.widthInPixels,
        map.heightInPixels,
        0x333333,
        0.5
      );
      debugBg.setDepth(1);
      console.log(`Debug background created at ${map.widthInPixels / 2}, ${map.heightInPixels / 2}, size: ${map.widthInPixels}x${map.heightInPixels}`);
      
      if (layers && Object.keys(layers).length > 0) {
        console.log("Layers created:", Object.keys(layers));
        Object.values(layers).forEach((layer, idx) => {
          if (layer) {
            const layerName = Object.keys(layers)[idx];
            if (layer.children && layer.children.length > 0) {
              const firstChild = layer.children.entries[0];
              console.log(`Layer "${layerName}": ${layer.children.length} tiles, depth=${firstChild?.depth || 'N/A'}, visible=${firstChild?.visible || 'N/A'}`);
            } else if (layer.tileCount !== undefined) {
              console.log(`Layer "${layerName}": ${layer.tileCount} tiles (manual layer)`);
            } else {
              console.log(`Layer "${layerName}": visible=${layer.visible}, alpha=${layer.alpha}, depth=${layer.depth}, width=${layer.width || 'N/A'}, height=${layer.height || 'N/A'}`);
            }
          }
        });
      } else {
        console.warn("No layers were created!");
      }
    }

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.playerSpawn =
      this.getSpawnPoint(map, "Spawns", "player") ?? {
        x: worldWidth / 2,
        y: worldHeight / 2,
      };

    this.characterBuilder = new CharacterBuilder(this, "characters");
    const playerConfig = this.registry.get("playerConfig");
    this.player = playerConfig
      ? this.characterBuilder.buildPlayerFromConfig(
          playerConfig,
          this.playerSpawn.x,
          this.playerSpawn.y
        )
      : this.characterBuilder.buildPlayer(
          "default",
          this.playerSpawn.x,
          this.playerSpawn.y
        );
    this.player.direction = "down";
    this.player.lastHitAt = 0;
    this.player.invulnerable = false;
    this.player.hitStunUntil = 0;
    this.player.lastAttackAt = 0;
    this.player.setDepth(this.depthBase + this.player.y);

    this.playerHpBar = this.add.graphics();
    this.attackHitbox = this.add.rectangle(0, 0, 40, 40, 0xffffff, 0.2);
    this.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.enable = false;
    this.attackHitbox.setVisible(false);
    this.magicProjectiles = this.physics.add.group();

    this.inputManager = new InputManager(this);
    this.combatSystem = new CombatSystem();
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    if (this.colliders) {
      this.physics.add.collider(this.player, this.colliders);
    }

    this.visualFx = new VisualFxSystem(this, { preset: "warAsh" });
    this.visualFx.create();
  }

  drawHpBar(target, bar, width = 40, height = 6) {
    if (!target || !target.active || !target.stats) return;
    bar.clear();

    const x = target.x - width / 2;
    const y = target.y - 40;

    const ratio = target.stats.hp / target.stats.maxHp;

    bar.fillStyle(0x000000);
    bar.fillRect(x - 1, y - 1, width + 2, height + 2);

    bar.fillStyle(0xff3333);
    bar.fillRect(x, y, width * ratio, height);
  }

  attack() {
    const now = this.time.now;
    if (now - this.player.lastAttackAt < PLAYER.ATTACK_COOLDOWN_MS) return;
    this.player.lastAttackAt = now;

    if (this.player.attackType === "magic") {
      const skill = this.player.skills.find(
        (entry) => entry?.id === SKILLS.magicBolt.id
      );
      if (!skill) return;
      if (this.player.stats.mp < skill.mpCost) return;
      if (!this.player.lastMagicAt) this.player.lastMagicAt = 0;
      if (now - this.player.lastMagicAt < skill.cooldownMs) return;
      this.player.lastMagicAt = now;

      this.player.stats.mp = Math.max(0, this.player.stats.mp - skill.mpCost);
      this.castMagicBolt(skill);
      return;
    }

    const range = 40;
    let x = this.player.x;
    let y = this.player.y;

    if (this.player.direction === "right") x += range;
    if (this.player.direction === "left") x -= range;
    if (this.player.direction === "down") y += range;
    if (this.player.direction === "up") y -= range;

    this.attackHitbox.setPosition(x, y);
    this.attackHitbox.body.enable = true;
    this.attackHitbox.setVisible(true);

    this.time.delayedCall(PLAYER.ATTACK_ACTIVE_MS, () => {
      this.attackHitbox.body.enable = false;
      this.attackHitbox.setVisible(false);
    });

    this.player.setScale(PLAYER.SCALE * 1.06);
    this.time.delayedCall(PLAYER.ATTACK_FEEDBACK_MS, () => {
      this.player.setScale(PLAYER.SCALE);
    });
  }

  castMagicBolt(skill) {
    const size = skill.size;
    const projectile = this.add.rectangle(
      this.player.x,
      this.player.y,
      size,
      size,
      0x66ccff,
      0.9
    );
    this.physics.add.existing(projectile);
    this.magicProjectiles.add(projectile);

    let dx = 0;
    let dy = 0;
    if (this.player.direction === "right") dx = 1;
    if (this.player.direction === "left") dx = -1;
    if (this.player.direction === "down") dy = 1;
    if (this.player.direction === "up") dy = -1;
    if (dx === 0 && dy === 0) dy = 1;

    projectile.body.setVelocity(dx * skill.speed, dy * skill.speed);
    const lifetimeMs = Math.ceil((skill.range / skill.speed) * 1000);
    this.time.delayedCall(lifetimeMs, () => {
      if (projectile && projectile.active) {
        projectile.destroy();
      }
    });
  }

  handlePlayerDeath() {
    this.player.stats.hp = 0;
    this.player.setVelocity(0);
    this.player.setActive(false);
    this.player.setVisible(false);
    this.player.setAlpha(1);
    this.player.invulnerable = false;
    if (this.player.invulnEvent) {
      this.player.invulnEvent.remove(false);
      this.player.invulnEvent = null;
    }

    this.time.delayedCall(PLAYER.RESPAWN_DELAY_MS, () => {
      this.player.stats.hp = this.player.stats.maxHp;
      this.player.stats.mp = this.player.stats.maxMp;
      this.player.setPosition(this.playerSpawn.x, this.playerSpawn.y);
      this.player.setActive(true);
      this.player.setVisible(true);
      this.player.lastHitAt = this.time.now;
      this.startInvulnerability(PLAYER.RESPAWN_INVULN_MS);

      if (this.enemy && this.enemy.active) {
        this.enemy.setPosition(this.enemySpawn.x, this.enemySpawn.y);
        this.enemy.setVelocity(0);
      }
    });
  }

  applyLifeSteal(attacker, damage) {
    const pct = attacker?.passives?.lifeStealPct || 0;
    if (!pct || !attacker?.stats) return;
    const heal = Math.max(1, Math.floor(damage * pct));
    attacker.stats.hp = Math.min(attacker.stats.hp + heal, attacker.stats.maxHp);
  }

  applyDamageToEnemy(attackType) {
    if (!this.enemy || !this.enemy.active) return;
    const { damage, isCrit } = computeDamage(
      this.player.stats,
      this.enemy.stats,
      attackType
    );
    this.enemy.stats.hp = Math.max(0, this.enemy.stats.hp - damage);
    this.applyLifeSteal(this.player, damage);
    this.logDamage("Enemy", damage, isCrit, this.enemy.stats.hp);

    if (this.enemy.stats.hp <= 0) {
      this.handleEnemyDeath();
    }
  }

  handleEnemyDeath() {
    if (!this.enemy) return;
    const levelsGained = gainXp(this.player.stats, ENEMY.XP_REWARD);
    if (levelsGained > 0) {
      console.log("Level up! Nivel:", this.player.stats.level);
      const options = tryUnlockEvolution(this.player);
      if (options.length > 0) {
        const quest = getEvolutionQuest(this.player);
        console.log(
          "Evolucion disponible:",
          options.map((opt) => opt.name).join(", ")
        );
        if (quest) {
          console.log(
            "Quest de evolucion:",
            quest.quest,
            "-",
            quest.location,
            "-",
            quest.boss
          );
        }
      }
      const humanTalent = tryUnlockHumanTalent(this.player);
      if (humanTalent) {
        console.log("Talento humano desbloqueado:", humanTalent.name);
      }
    }

    this.enemy.destroy();
    this.enemy = null;
    this.enemyHpBar.clear();
  }

  logDamage(targetName, damage, isCrit, remainingHp) {
    console.log(
      `${targetName} hit for`,
      damage,
      isCrit ? "(CRIT)" : "",
      "HP left:",
      remainingHp
    );
  }

  completeEvolutionQuest() {
    this.player.evolutionQuestCompleted = true;
    const options = tryUnlockEvolution(this.player);
    if (options.length > 0) {
      const quest = getEvolutionQuest(this.player);
      console.log(
        "Evolucion disponible:",
        options.map((opt) => opt.name).join(", ")
      );
      if (quest) {
        console.log(
          "Quest de evolucion:",
          quest.quest,
          "-",
          quest.location,
          "-",
          quest.boss
        );
      }
    }
  }

  evolvePlayer(evolutionId) {
    const ok = applyEvolution(this.player, evolutionId);
    if (ok) {
      console.log("Evolucion aplicada:", evolutionId);
    }
  }

  startInvulnerability(durationMs) {
    this.player.invulnerable = true;
    this.player.setAlpha(1);

    if (this.player.invulnEvent) {
      this.player.invulnEvent.remove(false);
    }

    this.player.invulnEvent = this.time.addEvent({
      delay: PLAYER.INVULN_FLICKER_MS,
      repeat: Math.ceil(durationMs / PLAYER.INVULN_FLICKER_MS),
      callback: () => {
        this.player.setAlpha(this.player.alpha === 1 ? 0.4 : 1);
      },
    });

    this.time.delayedCall(durationMs, () => {
      this.player.invulnerable = false;
      this.player.setAlpha(1);
      if (this.player.invulnEvent) {
        this.player.invulnEvent.remove(false);
        this.player.invulnEvent = null;
      }
    });
  }

  applyHitFeedback(source, target) {
    if (!source || !target) return;
    const now = this.time.now;
    this.player.hitStunUntil = now + PLAYER.HIT_STUN_MS;

    const angle = Phaser.Math.Angle.Between(
      source.x,
      source.y,
      target.x,
      target.y
    );
    const knockbackX = Math.cos(angle) * PLAYER.KNOCKBACK_FORCE;
    const knockbackY = Math.sin(angle) * PLAYER.KNOCKBACK_FORCE;
    target.setVelocity(knockbackX, knockbackY);

    this.cameras.main.shake(
      PLAYER.SHAKE_DURATION_MS,
      PLAYER.SHAKE_INTENSITY
    );
    this.hitstop(PLAYER.HITSTOP_MS);
  }

  hitstop(durationMs) {
    if (this.hitstopActive) return;
    this.hitstopActive = true;
    this.physics.world.pause();

    this.time.delayedCall(durationMs, () => {
      this.physics.world.resume();
      this.hitstopActive = false;
    });
  }

  update(time, delta) {
    this.visualFx?.update(time, delta);
    if (!this.player.active) {
      this.drawHpBar(this.player, this.playerHpBar);
      return;
    }

    const now = this.time.now;
    const inHitStun = now < this.player.hitStunUntil;

    if (!inHitStun) {
      const { vx, vy, speed } = this.inputManager.getMovement();
      if (vx > 0) this.player.direction = "right";
      else if (vx < 0) this.player.direction = "left";
      else if (vy > 0) this.player.direction = "down";
      else if (vy < 0) this.player.direction = "up";

      this.player.setMovement(vx, vy, speed);
    }

    if (this.inputManager.isAttackJustDown()) {
      this.combatSystem.attack(this.player);
      this.attack();
    }

    this.updateActorDepths();

    this.drawHpBar(this.player, this.playerHpBar);
  }

  createTilemap() {
    // Crear el tilemap usando el método nativo de Phaser
    // El mapa debe estar cargado con this.load.tilemapTiledJSON en PreloadScene
    const map = this.make.tilemap({ key: ASSETS.MAP_V0 });
    
    if (!map) {
      console.error("❌ No se pudo crear el tilemap. Verifica que el mapa esté cargado en PreloadScene.");
      return { map: null, layers: null, colliders: null };
    }

    console.log("✓ Map creado con método nativo de Phaser");
    console.log("Map tilesets (después de crear):", map.tilesets?.length || 0);
    console.log("Map layers:", map.layers?.map(l => l.name) || []);

    // Mapeo de nombres de tilesets (EXACTOS como en Tiled) a constantes ASSETS
    // El primer parámetro de addTilesetImage() debe ser EXACTO al "name" del tileset en Tiled
    const tilesetAssetMap = {
      "TX Plant": ASSETS.TILESET_PLANT,
      "TX Player": ASSETS.TILESET_PLAYER,
      "TX Props": ASSETS.TILESET_PROPS,
      "TX Tileset Grass": ASSETS.TILESET_GRASS,
      "TX Struct": ASSETS.TILESET_STRUCT,
      "TX Tileset Stone Ground": ASSETS.TILESET_STONE_GROUND,
      "TX Tileset Wall": ASSETS.TILESET_WALL,
      "TX Shadow": ASSETS.TILESET_SHADOW,
      "TX Shadow Plant": ASSETS.TILESET_SHADOW_PLANT,
    };

    // Agregar cada tileset usando addTilesetImage
    // El primer parámetro es el nombre EXACTO del tileset en Tiled
    // El segundo parámetro es la key del asset cargado en PreloadScene
    const tsPlant = map.addTilesetImage("TX Plant", ASSETS.TILESET_PLANT);
    const tsPlayer = map.addTilesetImage("TX Player", ASSETS.TILESET_PLAYER);
    const tsProps = map.addTilesetImage("TX Props", ASSETS.TILESET_PROPS);
    const tsGrass = map.addTilesetImage("TX Tileset Grass", ASSETS.TILESET_GRASS);
    const tsStruct = map.addTilesetImage("TX Struct", ASSETS.TILESET_STRUCT);

    // Filtrar tilesets nulos y crear array
    const tilesets = [tsPlant, tsPlayer, tsProps, tsGrass, tsStruct].filter(ts => ts !== null);

    if (tilesets.length === 0) {
      console.error("❌ No se pudieron agregar tilesets. Verifica que:");
      console.error("   1. Las imágenes PNG estén cargadas en PreloadScene");
      console.error("   2. Los nombres de los tilesets en addTilesetImage() coincidan EXACTAMENTE con los nombres en Tiled");
      throw new Error("No se pudieron agregar tilesets.");
    }
    
    console.log(`✓ Total tilesets agregados: ${tilesets.length}, Map size: ${map.widthInPixels}x${map.heightInPixels}`);

    // Crear las capas usando el método nativo de Phaser
    // Los nombres de las capas deben ser EXACTOS como en Tiled
    const depthMap = {
      "Grass": 50,
      "Ground": 50,
      "Struc": 60,
      "Plant 1": 75,
      "Shadows": 55,
      "Walls": 60,
      "Props": 70,
      "Plants": 75,
      "Plant2": 76,
      "Above": 850,
    };

    const layers = {};
    
    // Crear capas usando createLayer con los nombres exactos de Tiled
    // Puedes pasar múltiples tilesets si una capa usa tiles de varios tilesets
    const ground = map.createLayer("Ground", [tsGrass], 0, 0);
    const grass = map.createLayer("Grass", [tsGrass], 0, 0);
    const struc = map.createLayer("Struc", [tsStruct], 0, 0);
    const plant1 = map.createLayer("Plant 1", [tsPlant], 0, 0);

    // Configurar profundidad y propiedades de cada capa
    if (ground) {
      ground.setDepth(depthMap["Ground"] || 50);
      ground.setVisible(true);
      layers["Ground"] = ground;
      console.log(`✓ Layer "Ground" creado`);
    }

    if (grass) {
      grass.setDepth(depthMap["Grass"] || 50);
      grass.setVisible(true);
      layers["Grass"] = grass;
      console.log(`✓ Layer "Grass" creado`);
    }

    if (struc) {
      struc.setDepth(depthMap["Struc"] || 60);
      struc.setVisible(true);
      layers["Struc"] = struc;
      console.log(`✓ Layer "Struc" creado`);
    }

    if (plant1) {
      plant1.setDepth(depthMap["Plant 1"] || 75);
      plant1.setVisible(true);
      layers["Plant 1"] = plant1;
      console.log(`✓ Layer "Plant 1" creado`);
    }

    // Verificar si hay capas que no se pudieron crear
    const createdLayers = Object.keys(layers);
    const expectedLayers = ["Grass", "Ground", "Struc", "Plant 1"];
    const missingLayers = expectedLayers.filter(name => !createdLayers.includes(name));
    
    if (missingLayers.length > 0) {
      console.warn(`⚠ No se pudieron crear las siguientes capas: ${missingLayers.join(", ")}`);
      console.warn(`   Verifica que los nombres coincidan EXACTAMENTE con los nombres en Tiled`);
    }

    const colliders = this.createCollidersFromObjects(map, "Colliders");

    return {
      map,
      layers,
      colliders,
    };
  }

  createManualTileLayer(layerData, tileset, tileSize, mapWidth, mapHeight, depth) {
    if (!tileset || !layerData.data) return null;
    
    const tilesetTexture = this.textures.get(ASSETS.TILESET_MAIN);
    if (!tilesetTexture) {
      console.warn("Tileset texture not found:", ASSETS.TILESET_MAIN);
      return null;
    }
    
    const tilesetWidth = tilesetTexture.source[0]?.width || 128;
    const tilesetHeight = tilesetTexture.source[0]?.height || 64;
    const tilesetColumns = Math.floor(tilesetWidth / tileSize) || 4;
    const tilesetRows = Math.floor(tilesetHeight / tileSize) || 2;
    const totalTiles = tilesetColumns * tilesetRows;
    
    const frameKey = `tileset_frames_${tileSize}`;
    
    if (!this.textures.exists(frameKey)) {
      this.createTilesetFrames(frameKey, tilesetTexture, tileSize, tilesetColumns, tilesetRows);
    }
    
    const tiles = [];
    let createdCount = 0;
    
    layerData.data.forEach((gid, index) => {
      if (gid > 0) {
        const col = index % mapWidth;
        const row = Math.floor(index / mapWidth);
        const x = col * tileSize;
        const y = row * tileSize;
        
        let localTileIndex = 0;
        
        if (gid >= 257 && gid < 321) {
          localTileIndex = (gid - 257) % totalTiles;
        } else if (gid >= 321 && gid < 577) {
          localTileIndex = (gid - 321) % totalTiles;
        } else if (gid >= 577 && gid < 641) {
          localTileIndex = (gid - 577) % totalTiles;
        } else if (gid >= 641 && gid < 897) {
          localTileIndex = (gid - 641) % totalTiles;
        } else if (gid >= 897) {
          localTileIndex = (gid - 897) % totalTiles;
        } else {
          localTileIndex = (gid - 1) % totalTiles;
        }
        
        const tileCol = localTileIndex % tilesetColumns;
        const tileRow = Math.floor(localTileIndex / tilesetColumns);
        
        if (tileRow < tilesetRows && tileCol < tilesetColumns) {
          const frameName = `tile_${tileRow}_${tileCol}`;
          const texture = this.textures.get(frameKey);
          
          if (texture && texture.has(frameName)) {
            const tile = this.add.image(x, y, frameKey, frameName);
            tile.setOrigin(0, 0);
            tile.setDepth(depth);
            tile.setVisible(true);
            tile.setDisplaySize(tileSize, tileSize);
            
            if (createdCount < 3) {
              console.log(`Tile ${createdCount}: GID=${gid}, pos=(${x},${y}), frame=${frameName}, localIndex=${localTileIndex}, tileRow=${tileRow}, tileCol=${tileCol}`);
            }
            
            tiles.push(tile);
            createdCount++;
          } else {
            if (createdCount < 5) {
              console.warn(`Frame ${frameName} not found for GID ${gid} at index ${index}, tileRow=${tileRow}, tileCol=${tileCol}, localTileIndex=${localTileIndex}`);
            }
          }
        }
      }
    });
    
    if (tiles.length === 0) {
      console.warn(`No tiles created for layer ${layerData.name}`);
      return null;
    }
    
    console.log(`Created ${createdCount} tiles for layer ${layerData.name}, tileset: ${tilesetColumns}x${tilesetRows}, total tiles: ${totalTiles}`);
    
    if (tiles.length > 0) {
      tiles.forEach(tile => {
        tile.setDepth(depth);
        tile.setVisible(true);
      });
    }
    
    const layerGroup = this.add.group(tiles);
    layerGroup.tileCount = createdCount;
    layerGroup.layerName = layerData.name;
    
    return layerGroup;
  }

  createTilesetFrames(frameKey, sourceTexture, tileSize, columns, rows) {
    if (this.textures.exists(frameKey)) {
      return;
    }
    
    const sourceImage = sourceTexture.source[0].image;
    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImage, 0, 0);
    
    this.textures.addCanvas(frameKey, canvas);
    
    const texture = this.textures.get(frameKey);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const frameName = `tile_${row}_${col}`;
        const x = col * tileSize;
        const y = row * tileSize;
        texture.add(frameName, 0, x, y, tileSize, tileSize);
      }
    }
    
    console.log(`Created ${columns * rows} frames for tileset ${frameKey} (${columns}x${rows})`);
  }

  createCollidersFromObjects(map, layerName) {
    if (!map) return null;
    const layer = map.getObjectLayer(layerName);
    if (!layer?.objects?.length) return null;

    const colliders = this.physics.add.staticGroup();
    layer.objects.forEach((obj) => {
      if (!obj.width || !obj.height) return;
      const x = obj.x + obj.width / 2;
      const y = obj.y + obj.height / 2;
      const body = this.add.rectangle(x, y, obj.width, obj.height, 0x00ff00, 0);
      this.physics.add.existing(body, true);
      colliders.add(body);
    });
    return colliders;
  }

  getSpawnPoint(map, layerName, name) {
    if (!map) return null;
    const layer = map.getObjectLayer(layerName);
    if (!layer?.objects?.length) return null;
    const match = layer.objects.find(
      (obj) =>
        obj.name?.toLowerCase() === name.toLowerCase() ||
        obj.type?.toLowerCase() === name.toLowerCase()
    );
    if (!match) return null;
    return {
      x: match.x ?? 0,
      y: match.y ?? 0,
    };
  }

  updateActorDepths() {
    if (this.player?.active) {
      this.player.setDepth(this.depthBase + this.player.y);
    }
    if (this.enemy?.active) {
      this.enemy.setDepth(this.depthBase + this.enemy.y);
    }
  }
}