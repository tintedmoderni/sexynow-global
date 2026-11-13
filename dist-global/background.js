import {
  BUILD_REGION,
  LINKS,
  XMAX_API_BASE_URL,
  accountNotice,
  errorNotice,
  getSettings,
  readStoredSettings,
  usesPrivateSettings,
  writeStoredSettings
} from "./chunk-ULN4OXT3.js";
import {
  errorText
} from "./chunk-33YNJZIY.js";
import "./chunk-4VNS5WPM.js";

var BALANCE_REGION = BUILD_REGION;
var XMAX_BALANCE_URL = `${XMAX_API_BASE_URL}/balance`;
var pendingBalances = /* @__PURE__ */ new Map();
function fetchXmaxBalance(key, region = BALANCE_REGION) {
  if (region !== BALANCE_REGION) return Promise.reject(new Error("Balance region does not match this build."));
  const identity = `${region}:${key}`;
  const existing = pendingBalances.get(identity);
  if (existing) return existing;
  const pending = requestBalance(key).finally(() => pendingBalances.delete(identity));
  pendingBalances.set(identity, pending);
  return pending;
}
async function requestBalance(key) {
  const response = await fetch(`${XMAX_API_BASE_URL}/balance`, {
    method: "GET",
    headers: { "X-Api-Key": key },
    signal: AbortSignal.timeout(12e3)
  });
  const body = await response.json();
  if (!response.ok || body.success !== true) {
    const code = typeof body.code === "number" ? body.code : response.status;
    throw new Error(`Balance lookup failed (${code}).`);
  }
  if (typeof body.data?.currentBalance !== "number" || !Number.isFinite(body.data.currentBalance)) throw new Error("Balance unavailable.");
  return Math.max(0, body.data.currentBalance);
}

async function openSettingsPage() {
  try {
    if (typeof chrome.action.openPopup === "function") {
      await chrome.action.openPopup();
      return;
    }
  } catch {
  }
  const url = chrome.runtime.getURL("popup.html?tab=1");
  const existing = (await chrome.tabs.query({})).find((tab) => tab.url === url);
  if (existing?.id != null) await chrome.tabs.update(existing.id, { active: true });
  else await chrome.tabs.create({ url });
}

var REFERENCE_LIMIT = 60;
function visibleReferenceCount(library, catalog) {
  return library.uploads.length + catalog.filter((id) => !library.hiddenPresets.includes(id)).length;
}

var LEGACY_MODES = ["character", "outfit"];
var database;
var operations = Promise.resolve();
function openDatabase() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("sexynow-reference-library", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("images", { keyPath: "id" });
      request.result.createObjectStore("meta");
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        database = void 0;
      };
      resolve(db);
    };
    request.onerror = () => {
      database = void 0;
      reject(request.error);
    };
  });
  return database;
}
function read(db, store, key) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function commit(db, library, added = [], removed) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["meta", "images"], "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Could not save the reference library."));
    tx.onabort = () => reject(tx.error || new Error("Reference library write was aborted."));
    try {
      tx.objectStore("meta").put(library, "current");
      for (const image of added) tx.objectStore("images").put(image);
      if (removed) tx.objectStore("images").delete(removed);
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
}
function imageBlob(value, maxLength = 24e6) {
  if (typeof value !== "string" || value.length > maxLength) throw new Error("Reference image is too large.");
  const match = /^data:(image\/(?:jpeg|png|webp));base64,/.exec(value);
  if (!match) throw new Error("Invalid reference image.");
  const binary = atob(value.slice(match[0].length));
  if (!binary.length) throw new Error("Reference image is empty.");
  return new Blob([Uint8Array.from(binary, (character) => character.charCodeAt(0))], { type: match[1] });
}
async function dataURL(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += 32768) chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
  return `data:${blob.type};base64,${btoa(chunks.join(""))}`;
}
function validateCatalog(ids) {
  if (!Array.isArray(ids) || !ids.length || ids.length > REFERENCE_LIMIT || new Set(ids).size !== ids.length || ids.some((id) => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(id))) throw new Error("Invalid reference catalog.");
}
async function load(db, catalog) {
  const current = await read(db, "meta", "current");
  if (current) {
    if (current.version === 2) {
      if (!current.uploads.some((item) => "label" in item)) return current;
      const library3 = {
        ...current,
        revision: current.revision + 1,
        uploads: current.uploads.map(({ id, createdAt, bytes }) => ({ id, createdAt, bytes }))
      };
      await commit(db, library3);
      return library3;
    }
    if (current.version !== 1) throw new Error("Unsupported reference library version.");
    const library2 = {
      version: 2,
      revision: current.revision + 1,
      uploads: current.uploads.map(({ id, createdAt, bytes }) => ({ id, createdAt, bytes })).sort((a, b) => b.createdAt - a.createdAt),
      hiddenPresets: [.../* @__PURE__ */ new Set([...current.hiddenPresets.character, ...current.hiddenPresets.outfit])]
    };
    await commit(db, library2);
    return library2;
  }
  const library = { version: 2, revision: 1, uploads: [], hiddenPresets: [] };
  const legacy = await chrome.storage.session.get(LEGACY_MODES.map((mode) => `lastImage:${mode}`));
  const migrated = [];
  for (const mode of LEGACY_MODES) {
    const value = legacy[`lastImage:${mode}`];
    if (!value) continue;
    let image;
    try {
      image = imageBlob(value);
    } catch {
      continue;
    }
    let thumbnail = image;
    if (typeof OffscreenCanvas !== "undefined") {
      try {
        const bitmap = await createImageBitmap(image);
        try {
          const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
          const canvas = new OffscreenCanvas(Math.max(1, Math.round(bitmap.width * scale)), Math.max(1, Math.round(bitmap.height * scale)));
          const context = canvas.getContext("2d");
          if (context) {
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            thumbnail = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.75 });
          }
        } finally {
          bitmap.close();
        }
      } catch {
      }
    }
    const id = crypto.randomUUID();
    if (visibleReferenceCount(library, catalog) >= REFERENCE_LIMIT) {
      const lastPreset = [...catalog].reverse().find((id2) => !library.hiddenPresets.includes(id2));
      if (lastPreset) library.hiddenPresets.push(lastPreset);
    }
    library.uploads.push({ id, createdAt: Date.now(), bytes: image.size + thumbnail.size });
    migrated.push({ id, image, thumbnail });
  }
  await commit(db, library, migrated);
  await chrome.storage.session.remove(LEGACY_MODES.map((mode) => `lastImage:${mode}`)).catch(() => {
  });
  return library;
}
async function handle(action, catalog) {
  validateCatalog(catalog);
  const db = await openDatabase();
  const library = await load(db, catalog);
  if (action.action === "read") return { ok: true, library };
  if (action.action === "image" || action.action === "thumbnail") {
    const record = await read(db, "images", action.id);
    if (!record) throw new Error("This reference has been deleted.");
    return { ok: true, data: await dataURL(record[action.action]) };
  }
  if (action.action !== "add" && action.action !== "remove") throw new Error("Unsupported library request.");
  if (action.action === "add") {
    if (!/^[a-f0-9-]{36}$/.test(action.id)) throw new Error("Invalid reference identifier.");
    if (library.uploads.some((item) => item.id === action.id)) return { ok: true, library };
    if (visibleReferenceCount(library, catalog) >= REFERENCE_LIMIT) throw new Error(`Maximum ${REFERENCE_LIMIT} images. Delete one to upload another.`);
    const image = imageBlob(action.image), thumbnail = imageBlob(action.thumbnail, 5e5);
    library.uploads.unshift({ id: action.id, createdAt: Date.now(), bytes: image.size + thumbnail.size });
    library.revision++;
    await commit(db, library, [{ id: action.id, image, thumbnail }]);
  } else {
    const exists = action.kind === "upload" ? library.uploads.some((item) => item.id === action.id) : action.kind === "preset" && catalog.includes(action.id) && !library.hiddenPresets.includes(action.id);
    if (!exists) return { ok: true, library };
    if (visibleReferenceCount(library, catalog) <= 1) throw new Error("Keep at least one reference image.");
    if (action.kind === "upload") library.uploads = library.uploads.filter((item) => item.id !== action.id);
    else library.hiddenPresets.push(action.id);
    library.revision++;
    await commit(db, library, [], action.kind === "upload" ? action.id : void 0);
  }
  return { ok: true, changed: true, library };
}
function referenceLibraryRequest(action, catalog) {
  const task = operations.catch(() => {
  }).then(() => handle(action, catalog));
  operations = task;
  return task;
}

if (typeof chrome.storage.local.setAccessLevel === "function") void chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
void chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
var channels = /* @__PURE__ */ new Map();
var activeSessions = /* @__PURE__ */ new Map();
var claims = /* @__PURE__ */ new Map();
var stopWaiters = /* @__PURE__ */ new Map();
var extensionOrigin = chrome.runtime.getURL("");
function trustedPage(sender) {
  return !!sender.url?.startsWith(extensionOrigin);
}
chrome.runtime.onConnect.addListener((port) => {
  const [role, id] = port.name.split(":");
  if (!/^[a-f0-9-]{36}$/.test(id || "")) return port.disconnect();
  if (role === "content" && port.sender?.tab?.id != null && !trustedPage(port.sender)) {
    if (channels.has(id)) return port.disconnect();
    const channel = { content: port, tabId: port.sender.tab.id, frameId: port.sender.frameId ?? 0 };
    channels.set(id, channel);
    port.onMessage.addListener((message) => channels.get(id)?.engine?.postMessage(message));
    port.onDisconnect.addListener(() => {
      const current = channels.get(id);
      channels.delete(id);
      current?.engine?.disconnect();
      if (current && activeSessions.get(current.tabId) === id) activeSessions.delete(current.tabId);
      stopWaiters.get(id)?.(true);
    });
  } else if (role === "engine" && port.sender?.url?.startsWith(chrome.runtime.getURL("engine.html"))) {
    const channel = channels.get(id);
    if (!channel || channel.engine || port.sender.tab?.id != null && port.sender.tab.id !== channel.tabId) return port.disconnect();
    channel.engine = port;
    port.onMessage.addListener((message) => {
      if (message.type === "stopped") {
        if (activeSessions.get(channel.tabId) === id) activeSessions.delete(channel.tabId);
        stopWaiters.get(id)?.(true);
      }
      if (message.type === "stop-failed") stopWaiters.get(id)?.(false);
      channel.content.postMessage(message);
    });
    port.onDisconnect.addListener(() => {
      if (channels.get(id)?.engine !== port) return;
      channel.engine = void 0;
      try {
        channel.content.postMessage({ type: "engine-lost" });
      } catch {
      }
    });
    channel.content.postMessage({ type: "engine-ready" });
  } else port.disconnect();
});
var hiddenKey = (tabId) => `hidden-tab:${tabId}`;
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.status === "loading") void chrome.storage.session.remove(hiddenKey(tabId));
});
chrome.tabs.onRemoved.addListener((tabId) => {
  void chrome.storage.session.remove(hiddenKey(tabId));
});
var settingsWrites = Promise.resolve();
var modeWrites = Promise.resolve();
var accountRevisions = { xmax: 0, decart: 0 };
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  const handle2 = async () => {
    if (msg.type === "reference-library" && sender.tab?.id != null && !trustedPage(sender)) {
      const result = await referenceLibraryRequest(msg, msg.catalog);
      if ("changed" in result && result.changed && result.library) {
        for (const channel of channels.values()) {
          try {
            channel.content.postMessage({ type: "reference-library-changed", library: result.library });
          } catch {
          }
        }
      }
      return result;
    }
    if (msg.type === "private-settings" && trustedPage(sender)) return readStoredSettings(true);
    if (msg.type === "claim-session" && sender.tab?.id != null && !trustedPage(sender)) {
      const tabId = sender.tab.id;
      const target = channels.get(msg.id);
      if (!target || target.tabId !== tabId || target.frameId !== (sender.frameId ?? 0)) return { ok: false };
      const task = (claims.get(tabId) || Promise.resolve()).catch(() => {
      }).then(async () => {
        const old = activeSessions.get(tabId);
        const previous = old ? channels.get(old) : void 0;
        if (old && old !== msg.id && previous?.engine) {
          const stopped = await new Promise((resolve) => {
            const timer = setTimeout(() => {
              stopWaiters.delete(old);
              resolve(false);
            }, 15e3);
            stopWaiters.set(old, (ok) => {
              clearTimeout(timer);
              stopWaiters.delete(old);
              resolve(ok);
            });
            previous.engine.postMessage({ type: "stop" });
          });
          if (!stopped) return { ok: false };
        }
        if (channels.get(msg.id) !== target) return { ok: false };
        activeSessions.set(tabId, msg.id);
        return { ok: true };
      });
      claims.set(tabId, task);
      try {
        return await task;
      } finally {
        if (claims.get(tabId) === task) claims.delete(tabId);
      }
    }
    if (msg.type === "remember-mode" && sender.tab?.id != null && !trustedPage(sender)) {
      if (msg.mode !== "character" && msg.mode !== "outfit") return { ok: false };
      const task = modeWrites.catch(() => {
      }).then(() => chrome.storage.local.set({ lastMode: msg.mode }));
      modeWrites = task;
      await task;
      return { ok: true };
    }
    if (msg.type === "last-mode" && trustedPage(sender)) {
      await modeWrites.catch(() => {
      });
      const { lastMode } = await chrome.storage.local.get("lastMode");
      return { mode: lastMode === "character" ? "character" : "outfit" };
    }
    if (msg.type === "save-settings" && trustedPage(sender)) {
      const patch = msg.patch;
      if (!patch || typeof patch !== "object") return { ok: false };
      const revisions = { ...accountRevisions };
      const task = settingsWrites.catch(() => {
      }).then(async () => {
        const settings = await getSettings(true);
        if (patch.provider === "xmax" || patch.provider === "decart") settings.provider = patch.provider;
        for (const field of ["xmaxKey", "decartKey"]) {
          if (typeof patch[field] === "string" && patch[field].length <= 4096) {
            settings[field] = patch[field].trim();
            const provider = field === "xmaxKey" ? "xmax" : "decart";
            if (revisions[provider] === accountRevisions[provider]) await chrome.storage.session.remove(`account:${provider}`);
          }
        }
        await writeStoredSettings({ ...settings });
        return { ok: true };
      });
      settingsWrites = task;
      return task;
    }
    if ((msg.type === "page-state" || msg.type === "hide-page") && sender.tab?.id != null && !trustedPage(sender)) {
      const tabId = sender.tab.id, key = hiddenKey(tabId);
      if (msg.type === "hide-page") {
        await chrome.storage.session.set({ [key]: true });
        await chrome.tabs.sendMessage(tabId, { type: "hide-controls" }).catch(() => {
        });
        return { ok: true };
      }
      return { hidden: !!(await chrome.storage.session.get(key))[key] };
    }
    if (msg.type === "open-link") {
      const provider = msg.provider === "decart" ? "decart" : "xmax";
      const url = provider === "decart" && msg.kind === "billing" ? LINKS.decart.billing : msg.kind === "pricing" ? LINKS[provider].pricing : LINKS[provider].topup;
      await chrome.tabs.create({ url });
      return { ok: true };
    }
    if (msg.type === "open-settings") {
      await chrome.storage.session.set({ popupView: msg.view === "pricing" ? "pricing" : "settings" });
      await openSettingsPage();
      return { ok: true };
    }
    if (msg.type === "account-error" && trustedPage(sender)) {
      const provider = msg.provider === "decart" ? "decart" : "xmax";
      const notice = errorNotice(errorText(msg.error));
      if (!["missing-key", "invalid-key", "no-credits"].includes(notice.kind)) return { ok: true };
      accountRevisions[provider]++;
      const state = { provider, credits: provider === "xmax" && notice.kind === "no-credits" ? 0 : null, notice };
      await chrome.storage.session.set({ [`account:${provider}`]: state });
      if (msg.open) {
        await chrome.storage.session.set({ popupView: notice.kind === "no-credits" ? "pricing" : "settings" });
        await openSettingsPage().catch(() => {
        });
      }
      return { ok: true };
    }
    if (msg.type === "controls-state" && trustedPage(sender)) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id == null || !/^https?:\/\//.test(tab.url || "")) return { available: false };
      return { available: true, tabId: tab.id, hidden: !!(await chrome.storage.session.get(hiddenKey(tab.id)))[hiddenKey(tab.id)] };
    }
    if (msg.type === "set-controls-visible" && trustedPage(sender)) {
      if (!Number.isInteger(msg.tabId) || typeof msg.visible !== "boolean") return { ok: false };
      const tab = await chrome.tabs.get(msg.tabId);
      if (!/^https?:\/\//.test(tab.url || "")) return { ok: false };
      const key = hiddenKey(msg.tabId);
      const previous = !!(await chrome.storage.session.get(key))[key];
      if (msg.visible) await chrome.storage.session.remove(key);
      else await chrome.storage.session.set({ [key]: true });
      try {
        await chrome.tabs.sendMessage(msg.tabId, { type: msg.visible ? "show-controls" : "hide-controls", revealOnly: true });
      } catch {
        if (previous) await chrome.storage.session.set({ [key]: true });
        else await chrome.storage.session.remove(key);
        return { ok: false };
      }
      return { ok: true };
    }
    if (msg.type === "show-controls" && trustedPage(sender)) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id != null) {
        await chrome.storage.session.remove(hiddenKey(tab.id));
        await chrome.tabs.sendMessage(tab.id, { type: "show-controls" });
      }
      return { ok: true };
    }
    if (msg.type === "credits" && trustedPage(sender)) {
      const settings = await getSettings(true);
      const provider = (msg.provider || settings.provider) === "decart" ? "decart" : "xmax";
      const accountVersion = accountRevisions[provider];
      const key = provider === "xmax" ? settings.xmaxKey : settings.decartKey;
      let credits = null;
      let failure = "";
      if (key && provider === "xmax") {
        try {
          credits = await fetchXmaxBalance(key);
        } catch (error) {
          failure = errorText(error);
        }
      }
      let notice = failure ? { kind: "balance-unavailable", text: "Balance unavailable. You can still try generating." } : accountNotice(!!key, credits);
      if (key && !msg.retry) {
        const previous = (await chrome.storage.session.get(`account:${provider}`))[`account:${provider}`];
        if (previous?.notice?.kind === "invalid-key" || provider === "decart" && previous?.notice?.kind === "no-credits") notice = previous.notice;
      }
      const state = { provider, credits, notice };
      const current = await getSettings(true);
      if ((provider === "xmax" ? current.xmaxKey : current.decartKey) !== key || provider === "xmax" && current.xmaxRegion !== settings.xmaxRegion) return { ok: false, error: "Settings changed. Please try again." };
      if (accountVersion !== accountRevisions[provider]) {
        const latest = (await chrome.storage.session.get(`account:${provider}`))[`account:${provider}`];
        return { ok: !failure, credits: latest?.credits ?? credits, state: latest, error: failure || void 0 };
      }
      await chrome.storage.session.set({ [`account:${provider}`]: state });
      if (provider === current.provider) {
        await chrome.action.setBadgeText({ text: notice?.kind === "no-credits" ? "!" : "" });
        if (notice?.kind === "no-credits") await chrome.action.setBadgeBackgroundColor({ color: "#c42b32" });
      }
      return { ok: !failure, credits, state, error: failure || void 0 };
    }
    return { ok: false, error: "Unsupported request." };
  };
  handle2().then(reply, (error) => reply({ ok: false, error: errorText(error) }));
  return true;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.settings) return;
  const oldValue = changes.settings.oldValue || {};
  const newValue = changes.settings.newValue || {};
  const privateSettings = usesPrivateSettings();
  for (const provider of ["xmax", "decart"]) {
    const field = provider === "xmax" ? "xmaxKey" : "decartKey";
    if (privateSettings || oldValue[field] !== newValue[field] || provider === "xmax" && oldValue.xmaxRegion !== newValue.xmaxRegion) {
      const revision = ++accountRevisions[provider];
      const reset = (settings) => {
        if (revision !== accountRevisions[provider]) return;
        return chrome.storage.session.set({ [`account:${provider}`]: { provider, credits: null, notice: accountNotice(!!settings[field], null) } });
      };
      if (privateSettings) void getSettings(true).then(reset).catch(() => {
      });
      else void reset(newValue);
    }
  }
  void chrome.action.setBadgeText({ text: "" });
});
