const DEFAULT_LANG = "en";
const SUPPORTED_LANGS = ["en", "es"];
const STORAGE_KEY = "rpg-ashes.lang";
const I18N_ASSET_KEY_PREFIX = "i18n_";

const getValue = (obj, path) => {
  if (typeof path !== "string") {
    return undefined;
  }
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

/** @returns {string} Asset key for i18n JSON, e.g. "i18n_en" */
export const getI18nAssetKey = (lang) =>
  `${I18N_ASSET_KEY_PREFIX}${lang}`;

/** @returns {string} Path to i18n JSON, e.g. "assets/i18n/en.json" */
export const getI18nPath = (lang) => `assets/i18n/${lang}.json`;

/**
 * Register i18n JSON load for a language. Call from PreloadScene.preload().
 * @param {Phaser.Scene} scene
 * @param {string} lang
 */
export const loadLanguage = (scene, lang) => {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  scene.load.json(getI18nAssetKey(lang), getI18nPath(lang));
};

const getI18nData = (scene, lang) =>
  scene?.cache?.json?.get(getI18nAssetKey(lang)) || {};

export const getLanguage = (scene) => {
  const registryLang = scene?.registry?.get("lang");
  if (SUPPORTED_LANGS.includes(registryLang)) {
    return registryLang;
  }
  const stored =
    typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }
  return DEFAULT_LANG;
};

export const setLanguage = (scene, lang) => {
  const next = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  if (scene?.registry) {
    scene.registry.set("lang", next);
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, next);
  }
  return next;
};

/** Initialize lang from localStorage/registry at startup. Call from Preload create(). */
export const initLanguage = (scene) => {
  const lang = getLanguage(scene);
  return setLanguage(scene, lang);
};

export const t = (scene, key, params = {}) => {
  if (typeof key !== "string") {
    return String(key ?? "");
  }
  const lang = getLanguage(scene);
  const data = getI18nData(scene, lang);
  const fallback = getI18nData(scene, DEFAULT_LANG);
  let value = getValue(data, key) ?? getValue(fallback, key) ?? key;
  if (typeof value === "string") {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{${paramKey}}`, String(paramValue));
    });
  }
  return value;
};

export const getUiKey = (scene, baseKey) => {
  const lang = getLanguage(scene);
  return `${baseKey}_${lang}`;
};

export const LANGUAGES = [...SUPPORTED_LANGS];
