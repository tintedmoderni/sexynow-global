import {
  ApiService,
  XMAX_ENVIRONMENT,
  XmaxClient,
  XmaxConfiguration,
  realtimeApiBaseURL
} from "./chunk-K2DZGV6Q.js";
import "./chunk-4VNS5WPM.js";

var XmaxControl = class {
  api;
  storage;
  sessions = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Set();
  closed = false;
  creating = false;
  constructor(key) {
    this.api = new ApiService({ apiKey: key, baseURL: realtimeApiBaseURL(XMAX_ENVIRONMENT) });
    this.storage = new XmaxClient(new XmaxConfiguration({ apiKey: key, environment: XMAX_ENVIRONMENT })).createStorageService();
  }
  request(operation, payload) {
    if (this.closed) return Promise.reject(new Error("Session is closing."));
    const task = this.perform(operation, payload);
    this.pending.add(task);
    void task.finally(() => this.pending.delete(task)).catch(() => {
    });
    return task;
  }
  async perform(operation, payload) {
    if (operation === "upload") {
      const data = payload?.data;
      if (typeof data !== "string" || data.length > 24e6 || !/^data:image\/(jpeg|png|webp);base64,/.test(data)) throw new Error("Invalid reference image.");
      const blob = await (await fetch(data)).blob();
      const reference = await this.storage.uploadImage({ data: blob, fileName: "reference." + (blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg"), contentType: blob.type });
      return { url: reference.url };
    }
    if (operation !== "api") throw new Error("Unsupported Xmax operation.");
    const { method, path, body } = payload || {};
    if (method === "POST" /* post */ && path === "/session" && body?.model === "x2.1") {
      if (this.sessions.size || this.creating) throw new Error("An Xmax session is already active.");
      this.creating = true;
      try {
        const result = await this.api.post("/session", { model: "x2.1" });
        if (typeof result.sessionUid === "string") this.sessions.set(result.sessionUid, result.modelUid);
        return result;
      } finally {
        this.creating = false;
      }
    }
    if (method === "POST" /* post */ && path === "/client-event/relay") {
      const { sessionId, modelId, data } = body || {};
      if (!this.sessions.has(sessionId) || !modelId || this.sessions.get(sessionId) !== modelId || !data || typeof data !== "object" || Array.isArray(data) || !["start", "change_condition", "change_target_size"].includes(data.event) || typeof data.xid !== "string" || !data.xid) {
        throw new Error("Invalid Xmax relay operation.");
      }
      return this.api.post(path, { sessionId, modelId, data });
    }
    for (const id of this.sessions.keys()) {
      if (method === "PUT" /* put */ && path === `/session/${id}/heartbeat`) {
        const grace = body?.firstHeartbeatGraceSeconds;
        if (grace !== void 0 && (!Number.isSafeInteger(grace) || grace < 0)) throw new Error("Invalid heartbeat allowance.");
        return this.api.put(path, grace === void 0 ? void 0 : { firstHeartbeatGraceSeconds: grace });
      }
      if (method === "DELETE" /* delete */ && path === `/session/${id}`) {
        const result = await this.api.delete(path, { keepalive: true });
        this.sessions.delete(id);
        return result;
      }
    }
    throw new Error("Invalid Xmax session operation.");
  }
  async close() {
    this.closed = true;
    await Promise.allSettled([...this.pending]);
    await Promise.all([...this.sessions.keys()].map(async (id) => {
      await this.api.delete(`/session/${id}`, { keepalive: true });
      this.sessions.delete(id);
    }));
  }
};
export {
  XmaxControl
};
