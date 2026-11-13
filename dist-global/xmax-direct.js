import {
  XMAX_MODEL,
  XmaxInputError,
  connectMedia
} from "./chunk-HHSTQEVL.js";
import "./chunk-OWYOGLFU.js";
import {
  fileToDataUrl
} from "./chunk-33YNJZIY.js";
import {
  RealtimeConfiguration,
  RealtimeEventRelayService,
  XMAX_ENVIRONMENT,
  XmaxRealtimeManager,
  createRtcManager
} from "./chunk-K2DZGV6Q.js";
import "./chunk-4VNS5WPM.js";

var DirectXmax = class {
  constructor(request, mount, callbacks, fallback) {
    this.request = request;
    this.mount = mount;
    this.callbacks = callbacks;
    this.fallback = fallback;
    const api = {
      request: (method, path, body, options) => {
        if (options?.signal?.aborted) return Promise.reject(new DOMException("Cancelled", "AbortError"));
        return request("api", { method, path, body });
      },
      get: (path, options) => api.request("GET" /* get */, path, void 0, options),
      post: (path, body) => api.request("POST" /* post */, path, body),
      put: (path, body) => api.request("PUT" /* put */, path, body),
      delete: (path, options) => api.request("DELETE" /* delete */, path, void 0, options)
    };
    this.createManager = () => {
      this.inputRejected = false;
      const rtc = createRtcManager("agora" /* agora */, XMAX_ENVIRONMENT);
      const configure = rtc.configureVideoEncoding.bind(rtc);
      rtc.configureVideoEncoding = async (configuration) => {
        try {
          await configure(configuration);
        } catch (error) {
          this.inputRejected = true;
          throw error;
        }
      };
      return new XmaxRealtimeManager(
        new RealtimeConfiguration({ model: XMAX_MODEL, provider: "agora" /* agora */ }),
        { environment: XMAX_ENVIRONMENT, apiService: api, rtcManager: rtc, eventRelayService: new RealtimeEventRelayService(api) }
      );
    };
    this.manager = this.createManager();
  }
  manager;
  createManager;
  inputRejected = false;
  session;
  pending;
  closed = false;
  video;
  frameID;
  paused = false;
  fit = "contain";
  position = "50% 50%";
  start(stream, mode, image) {
    const task = (async () => {
      const connect = (input) => connectMedia(this.manager, input, mode, image, {
        ...this.callbacks,
        stream: (output, video) => {
          if (this.closed || !video) return;
          if (this.frameID !== void 0) this.video?.cancelVideoFrameCallback(this.frameID);
          this.video = video;
          this.layout(this.fit, this.position);
          this.callbacks.stream(output, video);
          this.callbacks.frame();
          const tick = () => {
            if (this.closed) return;
            this.callbacks.frame();
            this.frameID = video.requestVideoFrameCallback(tick);
          };
          this.frameID = video.requestVideoFrameCallback(tick);
          this.pause(this.paused);
        }
      }, async (file) => this.request("upload", { data: await fileToDataUrl(file) }), this.mount);
      let session;
      try {
        session = await connect(stream);
      } catch (error) {
        if (this.closed || !this.fallback || !(error instanceof XmaxInputError) && !this.inputRejected) throw error;
        console.debug("[RemixNow capture]", "single-canvas fallback", "native track rejected by encoder");
        this.manager = this.createManager();
        session = await connect(this.fallback());
      }
      if (this.closed) await session.close();
      else this.session = session;
    })();
    this.pending = task;
    return task.finally(() => {
      if (this.pending === task) this.pending = void 0;
    });
  }
  async update(mode, image) {
    if (!this.session || this.closed) throw new Error("Video connection ended. Please try again.");
    const task = this.session.update(mode, image);
    this.pending = task;
    try {
      await task;
    } finally {
      if (this.pending === task) this.pending = void 0;
    }
  }
  layout(fit, position) {
    this.fit = fit;
    this.position = position;
    if (this.video) {
      this.video.style.objectFit = fit;
      this.video.style.objectPosition = position;
    }
  }
  pause(paused) {
    this.paused = paused;
    if (this.video) {
      if (paused) this.video.pause();
      else void this.video.play().catch((error) => {
        if (error.name !== "AbortError" && !this.closed) this.callbacks.error(error);
      });
    }
  }
  async close() {
    this.closed = true;
    if (this.frameID !== void 0) this.video?.cancelVideoFrameCallback(this.frameID);
    try {
      if (this.session) await this.session.close();
      else await this.manager.close();
      await this.pending?.catch(() => {
      });
    } finally {
      this.session = void 0;
      this.mount.replaceChildren();
    }
  }
};
export {
  DirectXmax
};
