function usesPrivateSettings() {
  return chrome.runtime.getURL("").startsWith("safari-web-extension:");
}
var database;
function openDatabase() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("remixnow-private-settings", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("settings");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      database = void 0;
      reject(request.error);
    };
  });
  return database;
}
async function readStoredSettings(inBackground = false) {
  if (!usesPrivateSettings()) return (await chrome.storage.local.get("settings")).settings;
  if (!inBackground) return chrome.runtime.sendMessage({ type: "private-settings" });
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction("settings").objectStore("settings").get("current");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function writeStoredSettings(settings) {
  if (!usesPrivateSettings()) {
    await chrome.storage.local.set({ settings });
    return;
  }
  const previous = await readStoredSettings(true);
  if (JSON.stringify(previous) === JSON.stringify(settings)) return;
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction("settings", "readwrite");
    transaction.objectStore("settings").put(settings, "current");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error("Settings write was aborted."));
  });
  await chrome.storage.local.set({ settings: { provider: settings.provider, privateRevision: crypto.randomUUID() } });
}

var BUILD_REGION = false ? "global" : "global";

var XMAX_API_BASE_URL = false ? "https://api.xmax.cloud/open/api/v1" : "https://api.xmax.cloud/open/api/v1";
var DEFAULTS = { provider: "xmax", xmaxKey: "", decartKey: "", xmaxRegion: BUILD_REGION };
var XMAX_PLATFORM_URL = false ? "https://platform.xmax.ai/" : "https://platform.xmax.ai/";
var LINKS = {
  xmax: { topup: XMAX_PLATFORM_URL, pricing: `${XMAX_PLATFORM_URL}docs/capabilities/realtime-video` },
  decart: { topup: "https://platform.decart.ai/", billing: "https://platform.decart.ai/billing", pricing: "https://docs.platform.decart.ai/getting-started/pricing" }
};
async function getSettings(inBackground = false) {
  const settings = await readStoredSettings(inBackground);
  const saved = settings && typeof settings === "object" ? settings : {};
  return { ...DEFAULTS, ...saved, xmaxRegion: BUILD_REGION };
}

function accountNotice(hasKey, credits) {
  if (!hasKey) return { kind: "missing-key", text: "Add your API key to continue." };
  if (credits !== null && credits <= 0) return { kind: "no-credits", text: "Not enough credits" };
  if (credits !== null && credits <= 10) return { kind: "low-credits", text: "Not enough credits" };
  return null;
}
function errorNotice(text) {
  if (/Add your API key/i.test(text)) return { kind: "missing-key", text };
  if (/provider rejected this API key|API key has expired|API key has reached its credit limit/i.test(text)) return { kind: "invalid-key", text };
  if (/not enough credits|out of credits|insufficient[_ ](?:credits|balance|funds)|46017|payment required/i.test(text)) return { kind: "no-credits", text: "Not enough credits" };
  if (/^Agora operation failed \([A-Z_0-9-]+\)$/.test(text)) return { kind: "error", text: "Video connection failed." };
  return { kind: "error", text };
}
function chooseNotice(transient, account) {
  if (account?.kind === "missing-key" || account?.kind === "invalid-key" || account?.kind === "no-credits") return account;
  if (transient?.kind === "loading" || transient?.kind === "error") return transient;
  return account?.kind === "low-credits" ? account : transient || account;
}

var noticeMarkup = `<span class="notice-copy"><span class="indicator" aria-hidden="true"></span><span class="status-text"></span></span><button class="notice-action" hidden></button><button class="retry" hidden>Try again</button><button class="cancel" aria-label="Dismiss notification">\xD7</button>`;
var NoticeView = class {
  constructor(element) {
    this.element = element;
    element.innerHTML = noticeMarkup;
  }
  transient = null;
  account = null;
  quality = null;
  advisory = null;
  rendered = "";
  advisoryTimer;
  get current() {
    return chooseNotice(this.transient || this.advisory || this.quality, this.account);
  }
  setAdvisory(notice) {
    clearTimeout(this.advisoryTimer);
    this.advisoryTimer = void 0;
    this.advisory = notice;
    this.render();
  }
  dispose() {
    clearTimeout(this.advisoryTimer);
  }
  set(notice) {
    this.transient = notice;
    this.render();
  }
  setQuality(notice) {
    this.quality = notice;
    this.render();
  }
  setAccount(notice) {
    this.account = notice;
    this.render();
  }
  clearLoading() {
    if (this.transient && ["loading", "buffering"].includes(this.transient.kind)) this.set(null);
  }
  clear() {
    this.setAdvisory(null);
    this.transient = this.account = this.quality = null;
    this.render();
  }
  render() {
    const notice = this.current;
    this.element.hidden = !notice;
    if (notice !== this.advisory) {
      clearTimeout(this.advisoryTimer);
      this.advisoryTimer = void 0;
    }
    if (!notice) {
      this.rendered = "";
      return;
    }
    if (notice === this.advisory && !this.advisoryTimer) this.advisoryTimer = setTimeout(() => this.setAdvisory(null), 15e3);
    const signature = JSON.stringify(notice);
    if (signature === this.rendered) return;
    this.rendered = signature;
    const busy = ["loading", "buffering", "network"].includes(notice.kind);
    this.element.dataset.kind = notice.kind;
    this.element.classList.toggle("error", ["error", "missing-key", "invalid-key", "no-credits"].includes(notice.kind));
    this.element.setAttribute("role", this.element.classList.contains("error") ? "alert" : "status");
    this.element.querySelector(".status-text").textContent = busy ? notice.kind === "loading" ? "Loading\u2026" : "Buffering\u2026" : notice.text;
    this.element.title = notice.kind === "network" ? notice.text : "";
    this.element.setAttribute("aria-label", notice.kind === "network" ? `Buffering. ${notice.text}` : busy ? notice.kind === "loading" ? "Loading" : "Buffering" : notice.text);
    const action = this.element.querySelector(".notice-action");
    const credit = notice.kind === "low-credits" || notice.kind === "no-credits";
    action.hidden = !credit && notice.kind !== "missing-key" && notice.kind !== "invalid-key";
    action.textContent = credit ? "Top up" : notice.kind === "invalid-key" ? "Check key" : "Add key";
    const retry = this.element.querySelector(".retry");
    retry.hidden = notice.kind !== "error";
    retry.textContent = "Retry";
    const cancel = this.element.querySelector(".cancel");
    cancel.hidden = busy;
    cancel.textContent = "\xD7";
    cancel.setAttribute("aria-label", busy ? "Cancel generation" : "Dismiss notification");
  }
};
var noticeStyles = `
.status{display:flex;align-items:center;gap:10px;font-size:12px;line-height:1.5}
.status .notice-copy{display:contents}
.status .status-text{min-width:0;overflow-wrap:anywhere}
.status .indicator{flex:none;width:16px;height:16px;border:1.8px solid currentColor;border-radius:50%;opacity:.9;display:grid;place-items:center;font-size:11px;font-weight:600}
.status .indicator:after{content:'!'}
.status[data-kind=loading] .indicator,.status[data-kind=buffering] .indicator,.status[data-kind=network] .indicator{border-color:#ffffff45;border-top-color:currentColor;animation:notice-spin .85s linear infinite}
.status[data-kind=loading] .indicator:after,.status[data-kind=buffering] .indicator:after,.status[data-kind=network] .indicator:after{content:''}
.status[data-kind=info] .indicator:after{content:'i'}
.status button{border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;white-space:nowrap;padding:3px 0}
.status .notice-action,.status .retry{text-decoration:underline;text-underline-offset:3px;font-size:11px}
.status .cancel{opacity:.7;margin-left:2px;font-size:12px}.status .cancel:hover{opacity:1}
@keyframes notice-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.status .indicator{animation:none!important}}
`;

export {
  usesPrivateSettings,
  readStoredSettings,
  writeStoredSettings,
  BUILD_REGION,
  XMAX_API_BASE_URL,
  LINKS,
  getSettings,
  accountNotice,
  errorNotice,
  NoticeView,
  noticeStyles
};
