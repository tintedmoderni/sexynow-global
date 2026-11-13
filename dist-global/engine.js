import {
  errorNotice,
  getSettings
} from "./chunk-ULN4OXT3.js";
import {
  sendFrames
} from "./chunk-KM6WKAHB.js";
import {
  createVideoFeed
} from "./chunk-OWYOGLFU.js";
import {
  errorText,
  gatherIce
} from "./chunk-33YNJZIY.js";
import "./chunk-4VNS5WPM.js";

var id = new URLSearchParams(location.search).get("id");
var port = chrome.runtime.connect({ name: `engine:${id}` });
var defaultResult = document.querySelector("#result");
var result = defaultResult;
var source = document.querySelector("#source");
var peer;
var input;
var inputSize;
var providerFeed;
function stopProviderFeed() {
  providerFeed?.stop();
  providerFeed = void 0;
}
var directControl;
var directID = "";
var directStopped;
var pipSender;
var pipEnabled = false;
var pipUpdate = Promise.resolve();
function updateNativePip() {
  const sender = pipSender;
  const track = pipEnabled && result.srcObject instanceof MediaStream ? result.srcObject.getVideoTracks()[0] || null : null;
  pipUpdate = pipUpdate.catch(() => {
  }).then(async () => {
    if (!sender || sender !== pipSender) return;
    try {
      await sender.replaceTrack(track);
    } catch {
      if (sender === pipSender) send({ type: "native-pip-error", bridgeId });
    }
  });
}
var session;
var lowCreditsShown = false;
var pending;
var stopping;
var revision = 0;
var activeMode;
var activeProvider;
var creditTimer;
var keepAlive;
var lastFrame = performance.now();
var lastSentFrame = 0;
var remoteFrameSeen = false;
var outputRequestId = "";
var stopFrames;
var presentationPort;
var presentationToken = "";
window.addEventListener("message", (event) => {
  if (event.source !== parent || event.data?.type !== "swap-presentation" || !presentationToken || event.data.token !== presentationToken || !event.ports[0]) return;
  stopFrames?.();
  stopFrames = void 0;
  presentationPort?.close();
  presentationPort = event.ports[0];
  if (running && result.srcObject instanceof MediaStream) {
    const version = revision;
    remoteFrameSeen = false;
    frames(result.srcObject, () => version === revision && !closed);
  }
  send({ type: "presentation-attached" });
});
var waitingSince = 0;
var running = false;
var closed = false;
var sourcePaused = false;
var qualityNotice = null;
function publishQuality() {
  send({ type: "quality", bridgeId, notice: running && navigator.onLine === false ? { kind: "network", text: "You\u2019re offline. Check your connection." } : qualityNotice });
}
window.addEventListener("offline", () => {
  if (running) publishQuality();
});
window.addEventListener("online", () => {
  if (running) publishQuality();
});
var send = (message) => {
  try {
    port.postMessage(message);
  } catch {
  }
};
async function config() {
  const settings = await getSettings();
  const { mode } = await chrome.runtime.sendMessage({ type: "last-mode" });
  send({ type: "config", provider: settings.provider, hasKey: !!(settings.provider === "xmax" ? settings.xmaxKey : settings.decartKey), mode });
}
async function reportError(error, provider) {
  const text = errorText(error);
  if (/^Agora operation failed \([A-Z_0-9-]+\)$/.test(text)) console.warn("[RemixNow SDK error]", text);
  send({ type: "error", error: text });
  if (["missing-key", "invalid-key", "no-credits"].includes(errorNotice(text).kind)) {
    const selected = provider || activeProvider || (await getSettings()).provider;
    if (errorNotice(text).kind === "no-credits") {
      try {
        await stop();
      } catch {
        send({ type: "stop-failed" });
        return;
      }
    }
    await chrome.runtime.sendMessage({ type: "account-error", provider: selected, error: text, open: true }).catch(() => {
    });
  }
}
async function credits() {
  const version = revision, provider = activeProvider;
  if (!running || !provider) return;
  const response = await chrome.runtime.sendMessage({ type: "credits", provider });
  if (version !== revision || !running || provider !== activeProvider) return;
  if (response.state) send({ type: "account", state: response.state });
  await showLowCredits(response.state);
  if (response.state?.notice?.kind === "no-credits" && running) {
    running = false;
    await reportError("Not enough credits", provider);
  }
}
async function showLowCredits(state) {
  if (!state || state.notice?.kind === "balance-unavailable") return;
  if (state.notice?.kind !== "low-credits") {
    if (state.credits !== null && state.credits > 10) lowCreditsShown = false;
    return;
  }
  if (lowCreditsShown) return;
  lowCreditsShown = true;
  await chrome.runtime.sendMessage({ type: "open-settings", view: "pricing" }).catch(() => {
  });
}
function stop() {
  if (stopping) return stopping;
  console.debug("[RemixNow capture]", "engine stop", bridgeId.slice(0, 8));
  pipEnabled = false;
  pipSender = void 0;
  revision++;
  outputRequestId = "";
  running = false;
  qualityNotice = null;
  publishQuality();
  waitingSince = 0;
  remoteFrameSeen = false;
  stopProviderFeed();
  stopFrames?.();
  stopFrames = void 0;
  clearInterval(creditTimer);
  const task = async () => {
    if (directControl) {
      if (!closed) {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            directStopped = void 0;
            reject(new Error("Direct video teardown timed out."));
          }, 1e4);
          directStopped = () => {
            clearTimeout(timer);
            directStopped = void 0;
            resolve();
          };
          send({ type: "xmax-stop", bridgeId: directID });
        }).catch(() => {
        });
      }
      await directControl.close();
      directControl = void 0;
      directID = "";
    }
    const previous = session;
    if (previous) await previous.close();
    if (session === previous) {
      session = void 0;
      activeProvider = void 0;
      activeMode = void 0;
    }
    await pending?.catch(() => {
    });
    result.srcObject = null;
    result = defaultResult;
    defaultResult.style.display = "";
    peer?.close();
    peer = void 0;
    input = void 0;
    inputSize = void 0;
    source.srcObject = null;
    ice = [];
  };
  stopping = task().finally(() => {
    stopping = void 0;
  });
  return stopping;
}
async function start(mode, data, requestId) {
  if (pending) return;
  const version = revision;
  outputRequestId = requestId;
  const valid = () => version === revision && !closed;
  const task = async () => {
    const settings = await getSettings();
    const key = settings.provider === "xmax" ? settings.xmaxKey : settings.decartKey;
    if (!key) throw new Error("Add your API key in extension settings first.");
    if (!input?.getVideoTracks().length) throw new Error("Video capture is not ready. Please try again.");
    if (source.readyState < 2) {
      await new Promise((resolve, reject) => {
        const finish = () => {
          clearTimeout(timer);
          source.removeEventListener("loadeddata", ready);
        };
        const ready = () => {
          finish();
          resolve();
        };
        const timer = setTimeout(() => {
          finish();
          reject(new Error("No video frames reached the capture connection. Please try again."));
        }, 1e4);
        source.addEventListener("loadeddata", ready, { once: true });
      });
    }
    const blob = await (await fetch(data)).blob();
    const image = new File([blob], "reference.jpg", { type: blob.type });
    if (!valid()) return;
    if (session && activeProvider === settings.provider && (activeMode === mode || settings.provider === "xmax")) {
      try {
        await session.update(mode, image);
        if (valid()) {
          activeMode = mode;
          send({ type: "started", bridgeId, requestId });
        }
      } catch (error) {
        if (valid()) send({ type: "update-error", bridgeId, requestId, error: errorText(error) });
      }
      return;
    }
    if (session) {
      const old = session;
      session = void 0;
      await old.close();
    }
    if (!valid()) return;
    const callbacks = {
      stream: (stream, video) => {
        if (!valid()) return;
        stopFrames?.();
        stopFrames = void 0;
        result = video || defaultResult;
        result.dataset.swapOutput = "true";
        defaultResult.style.display = video ? "none" : "";
        remoteFrameSeen = false;
        lastSentFrame = 0;
        result.srcObject = stream;
        updateNativePip();
        frames(stream, valid);
        void result.play().catch((error) => {
          if (error.name !== "AbortError") callbacks.error(error);
        });
        lastFrame = performance.now();
      },
      quality: (notice) => {
        if (valid()) {
          qualityNotice = notice;
          publishQuality();
        }
      },
      status: (text) => {
        if (valid()) send({ type: "status", text });
      },
      error: (error) => {
        if (valid()) void reportError(error, settings.provider);
      },
      disconnected: (text) => {
        if (valid()) {
          void reportError(text, settings.provider);
          void stop();
        }
      }
    };
    const adapter = settings.provider === "xmax" ? await import("./xmax-4GXJXH2F.js") : await import("./decart-P2JEUXZJ.js");
    if (!valid()) return;
    stopProviderFeed();
    if (settings.provider === "xmax") providerFeed = createVideoFeed(source, (error) => {
      if (valid()) {
        void reportError(error, settings.provider);
        void stop().catch(() => {
        });
      }
    }, inputSize);
    let next;
    try {
      next = await adapter.connect(key, providerFeed?.stream || input, mode, image, callbacks, settings.xmaxRegion);
    } catch (error) {
      stopProviderFeed();
      throw error;
    }
    if (!valid()) {
      await next.close();
      return;
    }
    session = next;
    activeProvider = settings.provider;
    activeMode = mode;
    running = true;
    waitingSince = remoteFrameSeen ? 0 : performance.now();
    send({ type: "started", bridgeId, requestId });
    publishQuality();
    clearInterval(creditTimer);
    creditTimer = setInterval(() => {
      void credits().catch(() => {
      });
    }, 1e4);
    void credits().catch(() => {
    });
  };
  pending = task();
  try {
    await pending;
  } finally {
    pending = void 0;
  }
}
function frames(stream, valid) {
  if (!presentationPort) throw new Error("Video presentation is not ready. Please try again.");
  stopFrames = sendFrames(presentationPort, stream.getVideoTracks()[0], (mediaTime) => {
    if (!valid() || result.srcObject !== stream) return;
    const first = !remoteFrameSeen;
    if (first) console.debug("[RemixNow video frame]", { requestId: outputRequestId, mediaTime, presented: true });
    remoteFrameSeen = true;
    lastFrame = performance.now();
    waitingSince = 0;
    if (first || performance.now() - lastSentFrame > 700) {
      send({ type: "frame", bridgeId, requestId: outputRequestId, width: result.videoWidth, height: result.videoHeight });
      lastSentFrame = performance.now();
    }
  }, (error) => {
    if (valid()) void reportError(error);
  }, () => !sourcePaused || !remoteFrameSeen);
}
keepAlive = setInterval(() => {
  send({ type: "heartbeat" });
  if (running && !sourcePaused && (directControl || !source.paused) && performance.now() - lastFrame > 5e3) send({ type: "status", text: "Buffering\u2026" });
  if (waitingSince && performance.now() - waitingSince > 6e4) {
    send({ type: "error", error: "No generated video received. Please try again." });
    void stop();
  }
}, 5e3);
var ice = [];
var bridgeId = "";
port.onMessage.addListener((message) => {
  const handle = async () => {
    if (message.type === "prepare-presentation") {
      presentationToken = message.token;
      send({ type: "presentation-channel-ready", token: presentationToken });
      return;
    }
    if (message.type === "xmax-stopped" && message.bridgeId === directID) {
      directStopped?.();
      return;
    }
    if (message.type === "xmax-rpc") {
      const { requestId, bridgeId: requestedID, operation, payload } = message;
      try {
        let value;
        if (operation === "open") {
          const version = revision;
          const settings = await getSettings();
          if (closed || stopping || version !== revision || directControl || settings.provider !== "xmax") throw new Error("Session is unavailable. Try again.");
          if (!settings.xmaxKey) throw new Error("Add your API key to continue.");
          const { XmaxControl } = await import(chrome.runtime.getURL("xmax-control.js"));
          if (closed || stopping || version !== revision || directControl) throw new Error("Session was cancelled.");
          directControl = new XmaxControl(settings.xmaxKey);
          directID = bridgeId = requestedID;
          activeProvider = "xmax";
          remoteFrameSeen = false;
        } else {
          if (!directControl || requestedID !== directID) throw new Error("Session was cancelled.");
          value = await directControl.request(operation, payload);
        }
        send({ type: "xmax-response", bridgeId: requestedID, requestId, value });
      } catch (error) {
        send({ type: "xmax-response", bridgeId: requestedID, requestId, error: errorText(error) });
      }
      return;
    }
    if (message.type === "xmax-running" && message.bridgeId === directID && directControl && !stopping) {
      running = true;
      waitingSince = remoteFrameSeen ? 0 : performance.now();
      lastFrame = performance.now();
      clearInterval(creditTimer);
      creditTimer = setInterval(() => {
        void credits().catch(() => {
        });
      }, 1e4);
      void credits().catch(() => {
      });
      return;
    }
    if (message.type === "xmax-frame" && message.bridgeId === directID) {
      remoteFrameSeen = true;
      lastFrame = performance.now();
      waitingSince = 0;
      return;
    }
    if (message.type === "xmax-error" && message.bridgeId === directID) {
      await reportError(message.error, "xmax");
      return;
    }
    if (message.type === "ping") return;
    if (message.type === "config") return config();
    if (message.type === "preflight") {
      const version = revision;
      const settings = await getSettings();
      const response = await chrome.runtime.sendMessage({ type: "credits", provider: settings.provider, retry: true });
      if (version !== revision || closed) return;
      const current = await getSettings();
      const key = current.provider === "xmax" ? current.xmaxKey : current.decartKey;
      const changed = current.provider !== settings.provider || current.xmaxKey !== settings.xmaxKey || current.decartKey !== settings.decartKey || current.xmaxRegion !== settings.xmaxRegion;
      const blocked = changed || !key.trim() || response.ok && typeof response.credits === "number" && response.credits <= 0;
      send({ type: "preflight-result", requestId: message.requestId, ...response, allowed: !blocked, error: changed ? "Settings changed. Please try again." : response.error });
      if (!changed) await showLowCredits(response.state);
      if (["missing-key", "no-credits"].includes(response.state?.notice?.kind)) {
        await chrome.runtime.sendMessage({ type: "open-settings", view: response.state.notice.kind === "no-credits" ? "pricing" : "settings" }).catch(() => {
        });
      }
      return;
    }
    if (message.type === "scan") {
      try {
        const { scan } = await import("./scan-PYPPKCHE.js");
        send({ type: "scan-result", requestId: message.requestId, ...await scan(message.image) });
      } catch {
        send({ type: "scan-result", requestId: message.requestId, count: null, mask: null });
      }
    }
    if (message.type === "offer") {
      pipSender = void 0;
      pipEnabled = false;
      peer?.close();
      peer = new RTCPeerConnection({ iceServers: [] });
      bridgeId = message.bridgeId;
      const size = message.videoSize;
      inputSize = size && [size.width, size.height].every((value) => Number.isInteger(value) && value >= 2 && value <= 1920) ? { width: size.width, height: size.height } : void 0;
      const current = peer;
      current.ontrack = (event) => {
        input = event.streams[0] || new MediaStream([event.track]);
        source.srcObject = input;
        void source.play().catch(() => {
        });
      };
      current.onconnectionstatechange = () => {
        console.debug("[RemixNow capture]", "engine", message.bridgeId.slice(0, 8), current.connectionState);
        if (current === peer && current.connectionState === "failed") {
          send({ type: "error", error: "Video capture connection failed." });
          void stop();
        }
      };
      await current.setRemoteDescription(message.sdp);
      const videoTransceiver = current.getTransceivers().find((t) => t.receiver.track.kind === "video");
      if (videoTransceiver) {
        videoTransceiver.direction = "sendrecv";
        pipSender = videoTransceiver.sender;
      }
      for (const candidate of ice.splice(0)) await current.addIceCandidate(candidate);
      await current.setLocalDescription(await current.createAnswer());
      await gatherIce(current);
      if (current !== peer) return;
      send({ type: "answer", bridgeId: message.bridgeId, sdp: current.localDescription?.toJSON() });
    }
    if (message.type === "native-pip" && message.bridgeId === bridgeId) {
      pipEnabled = message.enabled === true && running;
      updateNativePip();
      return;
    }
    if (message.type === "ice") {
      if (peer?.remoteDescription) await peer.addIceCandidate(message.candidate);
      else ice.push(message.candidate);
    }
    if (message.type === "start") await start(message.mode, message.image, message.requestId);
    if (message.type === "stop") {
      try {
        await stop();
        bridgeId = "";
        send({ type: "stopped" });
      } catch {
        send({ type: "stop-failed" });
      }
    }
    if (message.type === "pause") {
      sourcePaused = message.paused;
      lastFrame = performance.now();
      if (result.srcObject) {
        if (message.paused) result.pause();
        else await result.play().catch((error) => {
          if (error.name !== "AbortError") throw error;
        });
      }
    }
    if (message.type === "layout") {
      document.documentElement.style.setProperty("--swap-fit", message.fit);
      document.documentElement.style.setProperty("--swap-position", message.position);
      result.style.objectFit = message.fit;
      result.style.objectPosition = message.position;
    }
  };
  handle().catch((error) => {
    if (message.type === "offer" && message.bridgeId !== bridgeId) return;
    void reportError(error);
    void stop().catch(() => {
    });
  });
});
port.onDisconnect.addListener(() => {
  closed = true;
  clearInterval(keepAlive);
  void stop().catch(() => {
  });
});
window.addEventListener("pagehide", () => {
  closed = true;
  clearInterval(keepAlive);
  void stop().catch(() => {
  });
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    void config();
    if (changes.settings && (pending || session || directControl)) {
      const previous = changes.settings.oldValue, next = changes.settings.newValue;
      if (previous?.privateRevision !== next?.privateRevision || previous?.provider !== next?.provider || previous?.xmaxKey !== next?.xmaxKey || previous?.decartKey !== next?.decartKey || previous?.xmaxRegion !== next?.xmaxRegion) {
        send({ type: "error", error: "Settings changed. Start a new swap to reconnect." });
        void stop().catch(() => {
        });
      }
    }
  }
  if (area === "session") void getSettings().then((settings) => {
    const state = changes[`account:${activeProvider || settings.provider}`]?.newValue;
    if (state) {
      send({ type: "account", state });
      if (state.notice?.kind === "no-credits" && running) {
        running = false;
        void reportError("Not enough credits", state.provider);
      }
    }
  });
});
