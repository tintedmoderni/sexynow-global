import {
  NoticeView,
  accountNotice,
  getSettings,
  noticeStyles
} from "./chunk-ULN4OXT3.js";
import "./chunk-33YNJZIY.js";
import "./chunk-4VNS5WPM.js";

var $ = (id) => document.getElementById(id);
var isNativePopup = chrome.extension?.getViews ? chrome.extension.getViews({ type: "popup" }).includes(window) : new URLSearchParams(location.search).get("tab") !== "1";
if (isNativePopup) document.documentElement.dataset.popup = "true";
var style = document.createElement("style");
style.textContent = noticeStyles;
document.head.prepend(style);
var notice = new NoticeView($("account-status"));
var provider = $("provider");
var key = $("key");
var controlsToggle = $("controls-toggle");
var controlsTabId;
async function initControls() {
  const state = await chrome.runtime.sendMessage({ type: "controls-state" });
  if (!state?.available) {
    controlsToggle.title = "Open a webpage to control video visibility";
    return;
  }
  controlsTabId = state.tabId;
  controlsToggle.setAttribute("aria-checked", String(!state.hidden));
  controlsToggle.disabled = false;
}
controlsToggle.addEventListener("click", async () => {
  if (controlsTabId == null) return;
  const visible = controlsToggle.getAttribute("aria-checked") !== "true";
  controlsToggle.disabled = true;
  $("controls-error").hidden = true;
  try {
    const result = await chrome.runtime.sendMessage({ type: "set-controls-visible", tabId: controlsTabId, visible });
    if (!result?.ok) throw new Error("Could not update visibility");
    controlsToggle.setAttribute("aria-checked", String(visible));
  } catch {
    $("controls-error").textContent = "Could not update video controls. Refresh the page and try again.";
    $("controls-error").hidden = false;
  } finally {
    controlsToggle.disabled = false;
  }
});
var settings;
var selected = "xmax";
var refreshVersion = 0;
var dirty = false;
var saveRevision = 0;
var pendingAccount;
function keyField(value) {
  return value === "xmax" ? "xmaxKey" : "decartKey";
}
function view(pricing) {
  $("pricing-view").hidden = !pricing;
  $("settings-view").hidden = pricing;
  $("topup").setAttribute("aria-expanded", String(pricing));
  $("settings-header").hidden = pricing;
  $("topup").setAttribute("aria-controls", "pricing-view");
}
function keyError(text = "") {
  key.setAttribute("aria-invalid", String(!!text));
  $("key-error").textContent = text;
  $("key-error").hidden = !text;
}
function balancePresentation() {
  const external = selected === "decart";
  $("credits").hidden = external;
  $("balance-label").hidden = external;
  $("view-balance").hidden = !external;
}
function renderAccount(state) {
  if (state.provider !== selected) return;
  if (dirty) {
    pendingAccount = state;
    return;
  }
  balancePresentation();
  $("credits").textContent = state.credits === null ? "\u2014" : state.credits.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const balance = document.querySelector(".balance");
  balance.classList.toggle("empty", state.credits === 0 || state.notice?.kind === "no-credits");
  balance.classList.toggle("low", state.notice?.kind === "low-credits");
  balance.title = selected === "decart" ? "View your remaining credits on Decart" : state.credits === null ? "Balance unavailable" : `${state.credits} Xmax credits`;
  const isKeyError = ["missing-key", "invalid-key"].includes(state.notice?.kind || "");
  keyError(isKeyError ? state.notice?.kind === "invalid-key" && selected === "xmax" ? "Key rejected. Check your API key." : state.notice.text : "");
  notice.set(isKeyError ? null : state.notice);
}
async function refresh() {
  const version = ++refreshVersion;
  const saved = await getSettings();
  if (dirty || saved.provider !== selected) return;
  if (!saved[keyField(selected)]) {
    renderAccount({ provider: selected, credits: null, notice: accountNotice(false, null) });
    return;
  }
  const result = await chrome.runtime.sendMessage({ type: "credits", provider: selected });
  if (version !== refreshVersion || dirty) return;
  if (result.state) renderAccount(result.state);
  else notice.set({ kind: "error", text: result.error || "Balance unavailable. Please try again." });
}
async function init() {
  settings = await getSettings();
  selected = settings.provider;
  provider.value = selected;
  key.value = settings[keyField(selected)];
  balancePresentation();
  provider.disabled = false;
  key.disabled = false;
  updateClear();
  const session = await chrome.storage.session.get([`account:${selected}`, "popupView"]);
  if (session[`account:${selected}`]) renderAccount(session[`account:${selected}`]);
  view(session.popupView === "pricing");
  await chrome.storage.session.remove("popupView");
  await refresh();
}
function refreshSafely() {
  void refresh().catch(() => notice.set({ kind: "balance-unavailable", text: "Balance unavailable. You can still try generating." }));
}
function updateClear() {
  $("clear-key").hidden = !key.value;
}
async function save(patch) {
  const version = ++saveRevision;
  dirty = true;
  pendingAccount = void 0;
  refreshVersion++;
  keyError();
  notice.clear();
  $("credits").textContent = "\u2014";
  document.querySelector(".balance").classList.remove("empty", "low");
  try {
    const result = await chrome.runtime.sendMessage({ type: "save-settings", patch });
    if (version !== saveRevision) return;
    if (!result.ok) throw new Error("Save failed");
    dirty = false;
    if (pendingAccount) {
      const state = pendingAccount;
      pendingAccount = void 0;
      renderAccount(state);
    }
  } catch {
    if (version === saveRevision) notice.set({ kind: "error", text: "Could not save settings. Edit the field to try again." });
  }
}
provider.addEventListener("change", () => {
  selected = provider.value;
  settings.provider = selected;
  key.value = settings[keyField(selected)];
  balancePresentation();
  updateClear();
  void save({ provider: selected }).then(() => {
    if (!dirty) refreshSafely();
  });
});
key.addEventListener("input", () => {
  settings[keyField(selected)] = key.value.trim();
  updateClear();
  void save({ [keyField(selected)]: key.value.trim() });
});
key.addEventListener("blur", () => {
  if (!dirty) refreshSafely();
});
$("clear-key").addEventListener("click", () => {
  key.value = "";
  key.dispatchEvent(new Event("input"));
  key.focus();
});
$("reveal").addEventListener("click", () => {
  const show = key.type === "password";
  key.type = show ? "text" : "password";
  $("reveal").setAttribute("aria-pressed", String(show));
  $("reveal").title = show ? "Hide API key" : "Show API key";
  $("reveal").setAttribute("aria-label", show ? "Hide API key" : "Show API key");
});
$("view-balance").addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "open-link", provider: "decart", kind: "billing" });
});
$("topup").addEventListener("click", () => {
  view(true);
  $("pricing-back").focus();
});
$("pricing-back").addEventListener("click", () => {
  view(false);
  $("topup").focus();
});
$("popup-close").addEventListener("click", () => window.close());
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("pricing-view").hidden) {
    event.preventDefault();
    view(false);
    $("topup").focus();
  }
});
$("account-status").querySelector(".notice-action").addEventListener("click", () => {
  if (["missing-key", "invalid-key"].includes(notice.current?.kind || "")) key.focus();
  else view(true);
});
for (const button of document.querySelectorAll("[data-buy]")) button.addEventListener("click", () => {
  void chrome.runtime.sendMessage({ type: "open-link", provider: button.dataset.buy });
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "session" && controlsTabId != null && changes[`hidden-tab:${controlsTabId}`]) {
    controlsToggle.setAttribute("aria-checked", String(!changes[`hidden-tab:${controlsTabId}`].newValue));
  }
  if (area === "session" && changes[`account:${selected}`]?.newValue) renderAccount(changes[`account:${selected}`].newValue);
  if (area === "session" && changes.popupView?.newValue) view(changes.popupView.newValue === "pricing");
});
window.addEventListener("focus", () => {
  if (settings && !dirty) refreshSafely();
});
void init().catch(() => notice.set({ kind: "error", text: "Could not load settings. Reopen SexyNow to try again." }));
void initControls().catch(() => {
  controlsToggle.title = "Could not read page state. Reopen SexyNow to try again.";
});
