import {
  PUBLISH_FPS
} from "./chunk-OWYOGLFU.js";
import {
  PROMPTS,
  errorText
} from "./chunk-33YNJZIY.js";
import {
  RealtimeConfiguration,
  RealtimeContext,
  RealtimeVideoFormat,
  XMAX_ENVIRONMENT,
  XmaxClient,
  XmaxConfiguration,
  XmaxRealtimeVideoView
} from "./chunk-K2DZGV6Q.js";

var messages = {
  network: "Unstable network. Video may stutter.",
  latency: "High network latency. Video may lag.",
  slow: "Playback is slowing down. Please wait\u2026"
};
var number = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
var StreamHealth = class {
  constructor(notify) {
    this.notify = notify;
  }
  current = null;
  candidate = null;
  badSince = 0;
  badCount = 0;
  goodSince = 0;
  goodCount = 0;
  requiredDirections = /* @__PURE__ */ new Set();
  lastOffset = -1;
  lastSample = 0;
  sample(stats, now = performance.now()) {
    const offset = number(stats.offset_ms);
    if (offset === void 0 || offset <= this.lastOffset) return;
    this.lastOffset = offset;
    if (offset < 8e3) return;
    const values = [];
    for (const direction of ["up", "down"]) {
      const age = number(stats[`${direction}_stats_age_ms`]);
      if (age === void 0 || age > 6e3) continue;
      const metric = (name) => number(stats[`window_${name}_avg`]) ?? number(stats[name]);
      values.push({
        direction,
        rtt: metric(`${direction}_rtt_ms`),
        loss: metric(`${direction}_loss_rate`),
        quality: number(stats[`${direction}_network_quality`]) || void 0,
        fps: metric(direction === "up" ? "up_fps" : "down_decode_fps")
      });
    }
    if (!values.some((v) => [v.rtt, v.loss, v.quality, v.fps].some((n) => n !== void 0))) return;
    const condition = values.some((v) => (v.loss ?? 0) >= 0.05 || (v.quality ?? 0) >= 4) ? "network" : values.some((v) => (v.rtt ?? 0) >= 400) ? "latency" : values.some((v) => v.fps !== void 0 && v.fps < 12) ? "slow" : null;
    if (condition) {
      this.lastSample = now;
      this.goodCount = 0;
      if (this.candidate !== condition) {
        this.candidate = condition;
        this.badSince = now;
        this.badCount = 0;
      }
      const affected = values.filter((v) => condition === "network" ? (v.loss ?? 0) >= 0.05 || (v.quality ?? 0) >= 4 : condition === "latency" ? (v.rtt ?? 0) >= 400 : v.fps !== void 0 && v.fps < 12);
      if (this.current === condition) affected.forEach((v) => this.requiredDirections.add(v.direction));
      if (++this.badCount >= 2 && now - this.badSince >= 2e3 && this.current !== condition) {
        this.requiredDirections = new Set(affected.map((v) => v.direction));
        this.current = condition;
        this.notify({ kind: condition === "slow" ? "buffering" : "network", text: messages[condition] });
      }
      return;
    }
    this.candidate = null;
    this.badCount = 0;
    const measured = this.requiredDirections.size > 0 && [...this.requiredDirections].every((direction) => {
      const v = values.find((value) => value.direction === direction);
      return v && (this.current === "latency" ? v.rtt !== void 0 : this.current === "network" ? v.loss !== void 0 || v.quality !== void 0 : v.fps !== void 0);
    });
    if (!this.current || measured) this.lastSample = now;
    const healthy = measured && values.every((v) => (v.loss ?? 0) < 0.02 && (v.quality ?? 1) <= 2 && (v.rtt ?? 0) < 250 && (v.fps === void 0 || v.fps >= 18));
    if (!healthy) {
      this.goodCount = 0;
      return;
    }
    if (!this.goodCount) this.goodSince = now;
    if (++this.goodCount >= 3 && now - this.goodSince >= 4e3 && this.current) {
      this.current = null;
      this.notify(null);
    }
  }
  expire(now = performance.now()) {
    if (now - this.lastSample > 12e3) this.reset();
  }
  reset() {
    const hadNotice = !!this.current;
    this.current = this.candidate = null;
    this.requiredDirections.clear();
    this.badCount = this.goodCount = 0;
    if (hadNotice) this.notify(null);
  }
};

var XMAX_MODEL = "x2.1" /* x2_1 */;
var networkGrade = { Unknown: 0, Excellent: 1, Good: 2, Poor: 3, Bad: 4, VeryBad: 5, Down: 6 };
var XmaxInputError = class extends Error {
  constructor(error) {
    super(errorText(error), { cause: error });
    this.name = "XmaxInputError";
  }
};
async function connect(key, stream, mode, image, cb, _region) {
  const client = new XmaxClient(new XmaxConfiguration({ apiKey: key, environment: XMAX_ENVIRONMENT, loggerOptions: 1 /* business */ }));
  const manager = client.createRealtimeManager(new RealtimeConfiguration({ model: XMAX_MODEL, provider: "agora" /* agora */ }));
  const storage = client.createStorageService();
  return connectMedia(manager, stream, mode, image, cb, (file) => storage.uploadImage({ data: file, fileName: file.name, contentType: file.type }));
}
async function connectMedia(manager, stream, mode, image, cb, upload, mount = document.body) {
  const view = new XmaxRealtimeVideoView({
    videoContentMode: "fit" /* fit */,
    isInteractionEnabled: false,
    fadeInDurationMs: 0
  });
  view.videoElement.dataset.swapRenderer = "";
  Object.assign(view.element.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none" });
  let closing = false, connected = false;
  let stage = "initialize";
  const input = stream.getVideoTracks()[0];
  function logInput(event, error) {
    const settings = input?.getSettings();
    const failure = error;
    console.debug("[RemixNow SDK input]", {
      event,
      stage,
      model: XMAX_MODEL,
      readyState: input?.readyState,
      muted: input?.muted,
      width: settings?.width,
      height: settings?.height,
      frameRate: settings?.frameRate,
      code: failure?.code,
      errorName: failure?.name,
      causeName: failure?.cause?.name,
      constraint: failure?.constraint || failure?.cause?.constraint
    });
  }
  let closeTask;
  let forwarded;
  const startedAt = performance.now();
  const health = new StreamHealth((notice) => {
    if (!closing) cb.quality?.(notice);
  });
  let network;
  let remote;
  const timer = setInterval(() => {
    if (closing) return;
    if (document.visibilityState === "hidden") {
      health.reset();
      return;
    }
    const now = performance.now(), n = network?.value, r = remote?.value;
    health.sample({
      offset_ms: now - startedAt,
      up_stats_age_ms: network ? now - network.at : void 0,
      down_stats_age_ms: remote ? now - remote.at : network ? now - network.at : void 0,
      up_network_quality: n ? networkGrade[n.uplink] : void 0,
      down_network_quality: network && now - network.at <= 6e3 ? n ? networkGrade[n.downlink] : void 0 : void 0,
      // The new public API has no RTT; endToEndDelayMs is a different metric.
      down_loss_rate: r?.packetLossPercent === void 0 ? void 0 : r.packetLossPercent / 100,
      down_decode_fps: r?.decodeFrameRate
    }, now);
    health.expire(now);
  }, 2e3);
  function close() {
    if (closeTask) return closeTask;
    closing = true;
    clearInterval(timer);
    health.reset();
    cb.quality?.(null);
    view.frameDisplayHandler = void 0;
    view.track = void 0;
    view.detach();
    closeTask = manager.close();
    return closeTask;
  }
  function forwardOutput() {
    if (closing || manager.currentState.connectionState !== "Generating" /* generating */) return;
    const output = view.videoElement.srcObject;
    if (output instanceof MediaStream && output !== forwarded) {
      forwarded = output;
      cb.stream(output, view.videoElement);
    }
  }
  try {
    await manager.setTimingListener((timing) => {
      console.debug("[RemixNow SDK timing]", timing);
    });
    await manager.setStateListener((state) => {
      console.debug("[RemixNow SDK state]", { connectionState: state.connectionState, reason: state.reason?.kind });
      if (closing || !connected) return;
      if (state.reason?.kind === "failure") {
        logInput("failed", state.reason.error);
        cb.error(state.reason.error);
        void close().catch(() => {
        });
      } else if (state.connectionState === "Generating" /* generating */) {
        forwardOutput();
      } else if (state.connectionState === "Idle" /* idle */ || state.connectionState === "Ready" /* ready */) {
        cb.disconnected("Video connection ended. Please try again.");
        void close().catch(() => {
        });
      }
    });
    await manager.setNetworkQualityListener((value) => {
      network = value ? { value, at: performance.now() } : void 0;
    });
    await manager.setDownlinkVideoStatisticsListener((value) => {
      remote = value ? { value, at: performance.now() } : void 0;
    });
    await manager.setRemoteAudioVolume(0);
    cb.status("Uploading reference image\u2026");
    stage = "upload-reference";
    const reference = await upload(image);
    if (!input) throw new Error("No video track is available. Please try again.");
    const { width, height, frameRate } = input.getSettings();
    if (typeof width !== "number" || typeof height !== "number" || !Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
      throw new Error("Source video dimensions are unavailable. Resume playback and try again.");
    }
    const fps = frameRate !== void 0 && Number.isFinite(frameRate) && frameRate > 0 ? frameRate : PUBLISH_FPS;
    stage = "create-external-stream";
    logInput("begin");
    const localStream = await manager.createExternalVideoStream({
      videoTrack: input,
      videoFormat: new RealtimeVideoFormat({ width, height, fps })
    }).catch((error) => {
      throw new XmaxInputError(error);
    });
    logInput("accepted");
    cb.status("Connecting to Xmax\u2026");
    stage = "start-generation";
    logInput("begin");
    const output = await manager.startGeneration({
      localStream,
      faceRestoration: mode === "outfit",
      context: new RealtimeContext({ prompt: PROMPTS[mode], referencePath: reference.url })
    });
    stage = "connected";
    logInput("accepted");
    console.debug("[RemixNow SDK startGeneration]", { operation: "start", returned: true, model: XMAX_MODEL });
    connected = true;
    view.frameDisplayHandler = forwardOutput;
    view.attach(mount);
    view.track = output.videoTrack;
    return {
      close,
      async update(nextMode, nextImage) {
        if (closing) throw new Error("Video connection ended. Please try again.");
        const reference2 = await upload(nextImage);
        if (closing) return;
        const output2 = await manager.startGeneration({
          localStream,
          faceRestoration: nextMode === "outfit",
          context: new RealtimeContext({ prompt: PROMPTS[nextMode], referencePath: reference2.url })
        });
        console.debug("[RemixNow SDK startGeneration]", { operation: "change_condition", returned: true, model: XMAX_MODEL });
        if (!closing) view.track = output2.videoTrack;
      }
    };
  } catch (error) {
    logInput("failed", error);
    await close().catch(() => {
    });
    throw error;
  }
}

export {
  XMAX_MODEL,
  XmaxInputError,
  connect,
  connectMedia
};
