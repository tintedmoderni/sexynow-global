var API_BASE_URLS = {
  ["china" /* china */]: "https://cloud.xmax.22duck.cn/open/api/v1",
  ["global" /* global */]: "https://api.xmax.cloud/open/api/v1"
};
var REALTIME_API_BASE_URLS = {
  ["china" /* china */]: "https://cloud.xmax.22duck.cn/open/api/v1",
  ["global" /* global */]: "https://api.xmax.ai/open/api/v1"
};
var NON_REALTIME_API_BASE_URLS = {
  ["china" /* china */]: "https://api.xmaxai.com/open/api/v1",
  ["global" /* global */]: "https://api.xmax.ai/open/api/v1"
};
function apiBaseURL(environment) {
  return API_BASE_URLS[environment];
}
function realtimeApiBaseURL(environment) {
  return REALTIME_API_BASE_URLS[environment];
}
function nonRealtimeApiBaseURL(environment) {
  return NON_REALTIME_API_BASE_URLS[environment];
}

var XmaxError = class _XmaxError extends Error {
  /**
   * The SDK error category.
   */
  code;
  /**
   * The API business error code, when supplied by an API failure.
   */
  apiCode;
  /**
   * The HTTP status code, when a response was received.
   */
  httpStatus;
  /**
   * Creates an SDK error.
   *
   * @param code - The SDK error category.
   * @param message - The readable error description.
   * @param options - Optional API business and HTTP status codes.
   */
  constructor(code, message, options) {
    super(message);
    this.name = "XmaxError";
    this.code = code;
    this.apiCode = options?.apiCode;
    this.httpStatus = options?.httpStatus;
  }
  /**
   * Normalizes an unknown error, returning existing XmaxError instances unchanged.
   *
   * @param error - The error to normalize.
   * @returns An SDK error suitable for rejection or callback delivery.
   */
  static from(error) {
    if (error instanceof _XmaxError) {
      return error;
    }
    const message = error instanceof Error && error.message.trim().length > 0 ? error.message.trim() : String(error);
    return new _XmaxError(
      "INTERNAL_ERROR" /* internalError */,
      message
    );
  }
};

var state = {
  options: 0 /* none */,
  environment: "china" /* china */
};
var CONSOLE_METHOD = {
  debug: "debug",
  info: "info",
  warning: "warn",
  error: "error"
};
var BRAND_BADGE_STYLE = "background:#2563eb;color:#fff;border-radius:3px;padding:1px 4px;font-weight:600;";
var CATEGORY_BADGE_STYLE = "background:#475569;color:#fff;border-radius:3px;padding:1px 4px;font-weight:600;";
var XmaxLogger = class _XmaxLogger {
  /**
   * The realtime business logger.
   */
  static realtime = new _XmaxLogger("Realtime");
  /**
   * The RTC engine, room, and media-transport logger.
   */
  static rtc = new _XmaxLogger("RTC");
  /**
   * The local-media preparation and cleanup logger.
   */
  static media = new _XmaxLogger("Media");
  /**
   * The API request and response logger.
   */
  static api = new _XmaxLogger("API");
  /**
   * The file upload and download logger.
   */
  static storage = new _XmaxLogger("Storage");
  /**
   * The room-message and heartbeat logger.
   */
  static room = new _XmaxLogger("Room");
  /**
   * The publication, subscription, and generation-signaling logger.
   */
  static stream = new _XmaxLogger("Stream");
  /**
   * The video-view and rendering-pipeline logger.
   */
  static render = new _XmaxLogger("Render");
  /**
   * The touch-sampling and trajectory logger.
   */
  static interaction = new _XmaxLogger("Interaction");
  /**
   * The camera and microphone permission logger.
   */
  static permission = new _XmaxLogger("Permission");
  /**
   * The category displayed in this logger's badge.
   */
  category;
  /**
   * Creates a categorized logger sharing the global output settings.
   */
  constructor(category) {
    this.category = category;
  }
  /**
   * Replaces global logging categories and language settings.
   *
   * @param options - The enabled-category bitmask.
   * @param environment - The environment selecting Chinese or English log details.
   */
  static configure(options, environment = "china" /* china */) {
    state.options = options;
    state.environment = environment;
  }
  /**
   * Selects localized details while retaining bilingual log titles.
   */
  static localized(chinese, english) {
    return state.environment === "china" /* china */ ? chinese : english;
  }
  /**
   * Checks whether a log category is enabled.
   */
  static isEnabled(option) {
    return (state.options & option) !== 0;
  }
  /**
   * Writes a debug message.
   */
  debug(message, option = 1 /* business */) {
    this.log(
      "debug",
      message,
      option
    );
  }
  /**
   * Writes an informational message.
   */
  info(message, option = 1 /* business */) {
    this.log(
      "info",
      message,
      option
    );
  }
  /**
   * Writes a warning.
   */
  warning(message, option = 1 /* business */) {
    this.log(
      "warning",
      message,
      option
    );
  }
  /**
   * Writes an error message.
   */
  error(message, option = 1 /* business */) {
    this.log(
      "error",
      message,
      option
    );
  }
  /**
   * Writes enabled messages without evaluating disabled message factories.
   */
  log(level, message, option) {
    if (!_XmaxLogger.isEnabled(option)) {
      return;
    }
    const text = message();
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      console[CONSOLE_METHOD[level]](
        `%c[Xmax]%c %c[${this.category}]%c
%s`,
        BRAND_BADGE_STYLE,
        "",
        CATEGORY_BADGE_STYLE,
        "",
        text
      );
      return;
    }
    console[CONSOLE_METHOD[level]](`[Xmax][${this.category}] ${text}`);
  }
};

var XMAX_SDK_VERSION = "1.1.5";
var RuntimeInfo = class _RuntimeInfo {
  /**
   * The current runtime metadata snapshot.
   */
  static current = {
    platform: "web",
    osVersion: _RuntimeInfo.currentOSVersion(),
    sdkVersion: XMAX_SDK_VERSION,
    deviceModel: "browser"
  };
  /**
   * Serializes runtime metadata to API snake_case fields.
   */
  static toJSON(snapshot = _RuntimeInfo.current) {
    return {
      platform: snapshot.platform,
      os_version: snapshot.osVersion,
      sdk_version: snapshot.sdkVersion,
      device_model: snapshot.deviceModel
    };
  }
  /**
   * Returns the browser User-Agent, or unknown outside a browser.
   */
  static currentOSVersion() {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      return navigator.userAgent;
    }
    return "unknown";
  }
};

var ApiService = class _ApiService {
  /**
   * The default request timeout, in milliseconds.
   */
  static defaultTimeoutMs = 15e3;
  /**
   * The key authenticating API requests.
   */
  apiKey;
  /**
   * The base URL for API requests.
   */
  baseURL;
  /**
   * The timeout for each request, in milliseconds.
   */
  timeoutMs;
  /**
   * The HTTP transport implementation.
   */
  fetchImpl;
  /**
   * Creates an API service.
   */
  constructor(options) {
    this.apiKey = options.apiKey.trim();
    this.baseURL = options.baseURL;
    this.timeoutMs = options.timeoutMs ?? _ApiService.defaultTimeoutMs;
    this.fetchImpl = options.fetchImpl ?? ((url, init) => fetch(
      url,
      init
    ));
  }
  /**
   * Sends a request and returns the envelope's data.
   *
   * @param options.keepalive - Whether the browser may complete this request after page unload.
   */
  async request(method, path, body, options) {
    this.validateConfiguration();
    if (options?.signal?.aborted) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "API request was cancelled"
      );
    }
    const request = this.makeRequest(
      method,
      path,
      body,
      options
    );
    const startedAt = Date.now();
    const timeoutSignal = request.init.signal;
    const controller = new AbortController();
    const abortTimeout = () => controller.abort(timeoutSignal.reason);
    const abortCaller = () => controller.abort(new DOMException(
      "Cancelled",
      "AbortError"
    ));
    timeoutSignal.addEventListener(
      "abort",
      abortTimeout,
      { once: true }
    );
    options?.signal?.addEventListener(
      "abort",
      abortCaller,
      { once: true }
    );
    request.init.signal = controller.signal;
    if (timeoutSignal.aborted) {
      abortTimeout();
    }
    if (options?.signal?.aborted) {
      abortCaller();
    }
    let status;
    let text;
    try {
      const response = await this.fetchImpl(
        request.url,
        request.init
      );
      status = response.status;
      text = await response.text();
    } catch (error) {
      const mapped = _ApiService.transportError(error);
      this.logFailure(
        method,
        path,
        mapped,
        startedAt
      );
      throw mapped;
    } finally {
      timeoutSignal.removeEventListener(
        "abort",
        abortTimeout
      );
      options?.signal?.removeEventListener(
        "abort",
        abortCaller
      );
    }
    try {
      const value = _ApiService.parseResponse(
        text,
        status
      );
      XmaxLogger.api.debug(
        () => `API \u8BF7\u6C42\u6210\u529F (API Request Succeeded)
\u2514\u2500 ${method} ${path} \xB7 ${status} \xB7 ${Date.now() - startedAt}ms`
      );
      return value;
    } catch (error) {
      const mapped = XmaxError.from(error);
      this.logFailure(
        method,
        path,
        mapped,
        startedAt
      );
      throw mapped;
    }
  }
  /**
   * Sends a GET request.
   */
  get(path, options) {
    return this.request(
      "GET" /* get */,
      path,
      void 0,
      options
    );
  }
  /**
   * Sends a POST request.
   */
  post(path, body) {
    return this.request(
      "POST" /* post */,
      path,
      body
    );
  }
  /**
   * Sends a PUT request.
   */
  put(path, body) {
    return this.request(
      "PUT" /* put */,
      path,
      body
    );
  }
  /**
   * Sends a DELETE request.
   */
  delete(path, options) {
    return this.request(
      "DELETE" /* delete */,
      path,
      void 0,
      options
    );
  }
  /**
   * Validates API key and base URL configuration.
   */
  validateConfiguration() {
    if (this.apiKey.length === 0) {
      throw new XmaxError(
        "INVALID_API_KEY" /* invalidAPIKey */,
        "API key cannot be empty"
      );
    }
    let url;
    try {
      url = new URL(this.baseURL);
    } catch {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "API service configuration is invalid"
      );
    }
    const isSecure = url.protocol === "https:";
    const isLocalhost = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (!isSecure && !isLocalhost || this.timeoutMs <= 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "API service configuration is invalid"
      );
    }
  }
  /**
   * Builds the URL, headers, and body, accepting only relative paths on the base URL's origin.
   */
  makeRequest(method, path, body, options) {
    const normalizedPath = path.trim();
    if (normalizedPath.length === 0 || normalizedPath.includes("://") || normalizedPath.startsWith("//")) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "API request path is invalid"
      );
    }
    const base = this.baseURL.endsWith("/") ? this.baseURL.slice(
      0,
      -1
    ) : this.baseURL;
    const relativePath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    const url = new URL(base + relativePath);
    const baseURLObj = new URL(base);
    if (url.protocol.toLowerCase() !== baseURLObj.protocol.toLowerCase() || url.host.toLowerCase() !== baseURLObj.host.toLowerCase()) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "API request path is invalid"
      );
    }
    let encodedBody;
    if (body !== void 0) {
      try {
        encodedBody = JSON.stringify(body);
      } catch {
        throw new XmaxError(
          "API_ERROR" /* apiError */,
          "Failed to encode API request body"
        );
      }
    }
    return {
      url: url.toString(),
      init: {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
          "X-Platform": "web",
          "X-SDK-Version": XMAX_SDK_VERSION
        },
        body: encodedBody,
        signal: AbortSignal.timeout(this.timeoutMs),
        ...options?.keepalive ? { keepalive: true } : {},
        ...options?.cache ? { cache: options.cache } : {}
      }
    };
  }
  /**
   * Parses envelope data, rejecting business failures and missing payloads.
   */
  static parseResponse(text, status) {
    let envelope;
    try {
      envelope = JSON.parse(text);
    } catch {
      throw new XmaxError(
        "API_ERROR" /* apiError */,
        "Server returned invalid JSON",
        {
          httpStatus: status
        }
      );
    }
    const ok = status >= 200 && status < 300;
    const succeeded = envelope.success === true || envelope.success === void 0 && envelope.code === 200;
    if (!ok || !succeeded) {
      const message = envelope.message?.trim();
      throw new XmaxError(
        "API_ERROR" /* apiError */,
        message || "Xmax API request failed",
        {
          apiCode: envelope.code,
          httpStatus: status
        }
      );
    }
    if (envelope.data === void 0 || envelope.data === null) {
      throw new XmaxError(
        "API_ERROR" /* apiError */,
        "Server returned invalid response data",
        { httpStatus: status }
      );
    }
    return envelope.data;
  }
  /**
   * Converts transport failures to SDK errors.
   */
  static transportError(error) {
    if (error instanceof XmaxError) {
      return error;
    }
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return new XmaxError(
        "TIMEOUT" /* timeout */,
        "API request timed out"
      );
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      return new XmaxError(
        "CANCELLED" /* cancelled */,
        "API request was cancelled"
      );
    }
    const message = error instanceof Error && error.message.trim().length > 0 ? error.message.trim() : String(error);
    return new XmaxError(
      "NETWORK_ERROR" /* networkError */,
      `HTTP request failed: ${message}`
    );
  }
  /**
   * Logs a failed API request.
   */
  logFailure(method, path, error, startedAt) {
    XmaxLogger.api.error(
      () => `API \u8BF7\u6C42\u5931\u8D25 (API Request Failed)
\u2514\u2500 ${method} ${path} \xB7 ${Date.now() - startedAt}ms
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${error.message}`
    );
  }
};

var RealtimeVideoFormat = class _RealtimeVideoFormat {
  /**
   * The video width, in pixels.
   */
  width;
  /**
   * The video height, in pixels.
   */
  height;
  /**
   * The video frame rate, in fps.
   */
  fps;
  /**
   * The minimum uplink bitrate, in kbps, for providers that support it. Defaults to the lower of 500 and
   * the maximum bitrate; zero disables the lower bound.
   */
  minimumBitrate;
  /**
   * The maximum uplink bitrate, in kbps; calculated by XmaxSDK when omitted.
   */
  maximumBitrate;
  /**
   * The preference for retaining frame rate or resolution on constrained networks.
   */
  encoderPreference;
  /**
   * Creates a realtime video format.
   */
  constructor(init) {
    this.width = init.width;
    this.height = init.height;
    this.fps = init.fps;
    this.minimumBitrate = init.minimumBitrate;
    this.maximumBitrate = init.maximumBitrate;
    this.encoderPreference = init.encoderPreference ?? "maintainFramerate" /* maintainFramerate */;
  }
  /**
   * Validates dimensions, frame rate, and explicit bitrate bounds.
   *
   * @throws An error if the dimensions, frame rate, or bitrate configuration is invalid.
   */
  validate() {
    if (this.width <= 0 || this.height <= 0 || !Number.isFinite(this.fps) || this.fps <= 0 || this.width % 2 !== 0 || this.height % 2 !== 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Realtime video width and height must be positive even numbers, and fps must be greater than zero"
      );
    }
    if (this.minimumBitrate !== void 0 && (!Number.isFinite(this.minimumBitrate) || this.minimumBitrate < 0)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Minimum bitrate must be finite and not negative"
      );
    }
    if (this.maximumBitrate !== void 0 && (!Number.isFinite(this.maximumBitrate) || this.maximumBitrate <= 0)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Maximum bitrate must be finite and greater than zero"
      );
    }
    if (this.minimumBitrate !== void 0 && this.maximumBitrate !== void 0 && this.minimumBitrate > this.maximumBitrate) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Minimum bitrate must not exceed maximum bitrate"
      );
    }
  }
  /**
   * Returns a resized format, preserving frame rate and uplink encoding options.
   */
  resized(width, height) {
    return new _RealtimeVideoFormat({
      width,
      height,
      fps: this.fps,
      minimumBitrate: this.minimumBitrate,
      maximumBitrate: this.maximumBitrate,
      encoderPreference: this.encoderPreference
    });
  }
};

var RealtimeContext = class {
  /**
   * The text prompt used for generation.
   */
  prompt;
  /**
   * The remote path of an uploaded reference image.
   */
  referencePath;
  /**
   * Creates realtime generation conditions.
   */
  constructor(init) {
    this.prompt = init.prompt.trim();
    const normalizedReferencePath = init.referencePath?.trim();
    this.referencePath = normalizedReferencePath || void 0;
  }
};

var RtcProvider = /* @__PURE__ */ ((RtcProvider2) => {
  RtcProvider2["trtc"] = "trtc";
  RtcProvider2["agora"] = "agora";
  RtcProvider2["vertc"] = "vertc";
  return RtcProvider2;
})(RtcProvider || {});

var RealtimeNetworkQualityLevel = /* @__PURE__ */ ((RealtimeNetworkQualityLevel2) => {
  RealtimeNetworkQualityLevel2["unknown"] = "Unknown";
  RealtimeNetworkQualityLevel2["excellent"] = "Excellent";
  RealtimeNetworkQualityLevel2["good"] = "Good";
  RealtimeNetworkQualityLevel2["poor"] = "Poor";
  RealtimeNetworkQualityLevel2["bad"] = "Bad";
  RealtimeNetworkQualityLevel2["veryBad"] = "VeryBad";
  RealtimeNetworkQualityLevel2["down"] = "Down";
  return RealtimeNetworkQualityLevel2;
})(RealtimeNetworkQualityLevel || {});

var RTC_QUALITY_LEVELS = Object.values(RealtimeNetworkQualityLevel);
function networkQualityLevel(value) {
  return value !== void 0 && Number.isInteger(value) ? RTC_QUALITY_LEVELS[value] ?? "Unknown" /* unknown */ : "Unknown" /* unknown */;
}

var RtcStatsLogger = class {
  /**
   * Logs uplink video statistics at info level without formatting when performance logs are disabled.
   */
  static logUplinkVideoStatistics(video) {
    XmaxLogger.rtc.info(
      () => this.uplinkVideoStatisticsMessage(video),
      2 /* performance */
    );
  }
  /**
   * Formats uplink metrics without substituting send rate for unavailable encoding rate.
   */
  static uplinkVideoStatisticsMessage(video) {
    return this.block(
      "\u89C6\u9891\u4E0A\u884C\u7EDF\u8BA1 (Video Uplink Statistics)",
      [
        `${XmaxLogger.localized("\u5206\u8FA8\u7387\uFF1A", "Resolution: ")}${this.resolution(video.width, video.height)}`,
        `${XmaxLogger.localized("\u53D1\u9001\u7801\u7387\uFF1A", "Send Bitrate: ")}${this.value(video.bitrateKbps, "kbps")}`,
        `${XmaxLogger.localized("\u91C7\u96C6\u5E27\u7387\uFF1A", "Capture Frame Rate: ")}${this.value(video.captureFrameRate, "fps")}`,
        `${XmaxLogger.localized("\u7F16\u7801\u5E27\u7387\uFF1A", "Encode Frame Rate: ")}${this.value(video.encodeFrameRate, "fps")}`,
        `${XmaxLogger.localized("\u53D1\u9001\u5E27\u7387\uFF1A", "Send Frame Rate: ")}${this.value(video.sendFrameRate, "fps")}`,
        `${XmaxLogger.localized("\u89C6\u9891\u4E22\u5305\u7387\uFF1A", "Video Packet Loss: ")}${this.value(video.packetLossPercent, "%")}`
      ]
    );
  }
  /**
   * Logs downlink video statistics using the same object delivered to callbacks.
   */
  static logDownlinkVideoStatistics(video) {
    XmaxLogger.rtc.info(
      () => this.downlinkVideoStatisticsMessage(video),
      2 /* performance */
    );
  }
  /**
   * Formats downlink metrics without user identifiers or unapproved native fields.
   */
  static downlinkVideoStatisticsMessage(video) {
    return this.block(
      "\u89C6\u9891\u4E0B\u884C\u7EDF\u8BA1 (Video Downlink Statistics)",
      [
        `${XmaxLogger.localized("\u5206\u8FA8\u7387\uFF1A", "Resolution: ")}${this.resolution(video.width, video.height)}`,
        `${XmaxLogger.localized("\u63A5\u6536\u7801\u7387\uFF1A", "Receive Bitrate: ")}${this.value(video.bitrateKbps, "kbps")}`,
        `${XmaxLogger.localized("\u89E3\u7801\u5E27\u7387\uFF1A", "Decode Frame Rate: ")}${this.value(video.decodeFrameRate, "fps")}`,
        `${XmaxLogger.localized("\u6E32\u67D3\u5E27\u7387\uFF1A", "Render Frame Rate: ")}${this.value(video.renderFrameRate, "fps")}`,
        `${XmaxLogger.localized("\u89C6\u9891\u4E22\u5305\u7387\uFF1A", "Video Packet Loss: ")}${this.value(video.packetLossPercent, "%")}`,
        `${XmaxLogger.localized("\u7AEF\u5230\u7AEF\u65F6\u5EF6\uFF1A", "End-to-End Delay: ")}${this.value(video.endToEndDelayMs, "ms")}`
      ]
    );
  }
  /**
   * Logs connection RTT, loss, and cumulative traffic separately from video statistics.
   */
  static logConnectionStatistics(stats) {
    XmaxLogger.rtc.info(
      () => this.block(
        "RTC \u8FD0\u884C\u7EDF\u8BA1 (RTC Statistics)",
        [
          `RTT: ${this.value(stats.rttMs, "ms")}`,
          `${XmaxLogger.localized("\u4E0A\u884C\u4E22\u5305\u7387\uFF1A", "Uplink Packet Loss: ")}${this.value(stats.uplinkLossPercent, "%")}`,
          `${XmaxLogger.localized("\u4E0B\u884C\u4E22\u5305\u7387\uFF1A", "Downlink Packet Loss: ")}${this.value(stats.downlinkLossPercent, "%")}`,
          `${XmaxLogger.localized("\u7D2F\u8BA1\u53D1\u9001\uFF1A", "Bytes Sent: ")}${this.value(stats.sentBytes, "bytes")}`,
          `${XmaxLogger.localized("\u7D2F\u8BA1\u63A5\u6536\uFF1A", "Bytes Received: ")}${this.value(stats.receivedBytes, "bytes")}`
        ]
      ),
      2 /* performance */
    );
  }
  /**
   * Logs common network quality and only the provider's actual direction-specific delay and loss
   * metrics.
   */
  static logNetworkQuality(stats) {
    XmaxLogger.rtc.info(
      () => {
        const details = (rtt, loss) => rtt === void 0 && loss === void 0 ? "" : `, RTT ${this.value(rtt, "ms")}, ${XmaxLogger.localized("\u4E22\u5305\u7387 ", "Loss ")}${this.value(loss, "%")}`;
        return this.block(
          "\u7F51\u7EDC\u8D28\u91CF (Network Quality Metrics)",
          [
            `${XmaxLogger.localized("\u672C\u5730\u4E0A\u884C\uFF1A", "Local Uplink: ")}${this.quality(stats.uplink)}${details(stats.uplinkRTT, stats.uplinkLoss)}`,
            `${XmaxLogger.localized("\u672C\u5730\u4E0B\u884C\uFF08\u5E73\u5747\uFF09\uFF1A", "Local Downlink (Average): ")}${this.quality(stats.downlink)}${details(stats.downlinkRTT, stats.downlinkLoss)}`
          ]
        );
      },
      2 /* performance */
    );
  }
  /**
   * Formats resolution only when both dimensions are valid, otherwise returning a placeholder.
   */
  static resolution(width, height) {
    if (typeof width !== "number" || typeof height !== "number" || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return "\u2014";
    }
    return `${width} \xD7 ${height}`;
  }
  /**
   * Builds one titled tree of metric lines.
   */
  static block(title, lines) {
    return [title, ...lines.map((line, index) => `${index === lines.length - 1 ? "\u2514\u2500" : "\u251C\u2500"} ${line}`)].join("\n");
  }
  /**
   * Formats valid zero and fractional values without changing public units, retaining at most two
   * decimal places.
   */
  static value(value, unit = "") {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return "\u2014";
    }
    return `${Number(value.toFixed(2))}${unit ? ` ${unit}` : ""}`;
  }
  /**
   * Localizes a shared network-quality rating.
   */
  static quality(value) {
    const names = {
      ["Unknown" /* unknown */]: ["\u672A\u77E5", "Unknown"],
      ["Excellent" /* excellent */]: ["\u6781\u597D", "Excellent"],
      ["Good" /* good */]: ["\u826F\u597D", "Good"],
      ["Poor" /* poor */]: ["\u4E00\u822C", "Poor"],
      ["Bad" /* bad */]: ["\u5DEE", "Bad"],
      ["VeryBad" /* veryBad */]: ["\u6781\u5DEE", "Very Bad"],
      ["Down" /* down */]: ["\u65AD\u7F51", "Disconnected"]
    };
    const name = names[value] ?? names["Unknown" /* unknown */];
    return XmaxLogger.localized(
      name[0],
      name[1]
    );
  }
};

var AgoraRtcStatistics = class _AgoraRtcStatistics {
  /**
   * Collects published-video and subscribed-result statistics independently of performance logging.
   */
  static collect(client, listener) {
    const rtc = client.getRTCStats();
    const local = client.getLocalVideoStats();
    const valid = _AgoraRtcStatistics.valid;
    const loss = _AgoraRtcStatistics.loss;
    const localVideo = client.localTracks.some((track) => track.trackMediaType === "video") ? Object.freeze({
      width: valid(
        local.sendResolutionWidth,
        1
      ),
      height: valid(
        local.sendResolutionHeight,
        1
      ),
      captureFrameRate: valid(local.captureFrameRate),
      sendFrameRate: valid(local.sendFrameRate),
      bitrateKbps: valid(local.sendBitrate / 1e3),
      packetLossPercent: loss(local.currentPacketLossRate)
    }) : void 0;
    const remote = Object.freeze(
      Object.entries(client.getRemoteVideoStats()).map(([userID, stats]) => Object.freeze({
        userID,
        width: valid(
          stats.receiveResolutionWidth,
          1
        ),
        height: valid(
          stats.receiveResolutionHeight,
          1
        ),
        decodeFrameRate: valid(stats.decodeFrameRate),
        renderFrameRate: valid(stats.renderFrameRate),
        bitrateKbps: valid(stats.receiveBitrate / 1e3),
        packetLossPercent: loss(stats.currentPacketLossRate),
        endToEndDelayMs: valid(stats.end2EndDelay)
      }))
    );
    listener?.onLocalVideoStatistics?.(localVideo);
    listener?.onRemoteVideoStatistics?.(remote);
    RtcStatsLogger.logConnectionStatistics({
      rttMs: valid(rtc.RTT),
      sentBytes: valid(rtc.SendBytes),
      receivedBytes: valid(rtc.RecvBytes)
    });
    if (localVideo) {
      RtcStatsLogger.logUplinkVideoStatistics(localVideo);
    }
    for (const video of remote) {
      RtcStatsLogger.logDownlinkVideoStatistics(video);
    }
  }
  /**
   * Maps network-quality ratings without representing overall RTT as independent directional RTT values.
   */
  static network(stats, listener) {
    const result = Object.freeze({
      uplink: networkQualityLevel(stats.uplinkNetworkQuality),
      downlink: networkQualityLevel(stats.downlinkNetworkQuality)
    });
    listener?.onNetworkStatistics?.(result);
    RtcStatsLogger.logNetworkQuality(result);
  }
  /**
   * Filters missing, nonfinite, or out-of-range statistics.
   */
  static valid(value, minimum = 0) {
    return typeof value === "number" && Number.isFinite(value) && value >= minimum ? value : void 0;
  }
  /**
   * Converts Agora loss ratios from 0–1 to percentages.
   */
  static loss(value) {
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value * 100 : void 0;
  }
};

function shouldTransposeRtcVideoSize(environment) {
  const userAgent = environment?.userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent);
  const maxTouchPoints = environment?.maxTouchPoints ?? (typeof navigator === "undefined" ? 0 : navigator.maxTouchPoints ?? 0);
  const mobile = /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(userAgent) || /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  if (!mobile) {
    return false;
  }
  const orientationType = environment?.orientationType ?? (typeof window === "undefined" ? void 0 : window.screen?.orientation?.type);
  if (orientationType !== void 0) {
    return orientationType.includes("portrait");
  }
  const degrees = environment?.orientationDegrees ?? (typeof window === "undefined" ? void 0 : window.orientation);
  return degrees === 0 || degrees === 180;
}
function rtcOrientedVideoSize(size, environment) {
  return shouldTransposeRtcVideoSize(environment) ? {
    width: size.height,
    height: size.width
  } : size;
}

var AgoraVideoSender = class {
  /**
   * Applies bitrate and frame-rate limits to the browser video sender.
   */
  static async apply(track, config, ensureActive2) {
    ensureActive2();
    const sender = track.getRTCRtpTransceiver()?.sender;
    if (!sender) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "WebRTC video sender is unavailable"
      );
    }
    const capture = sender.track?.getSettings();
    if (!capture?.width || !capture.height) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "WebRTC capture dimensions are unavailable"
      );
    }
    const scale = Math.max(1, capture.width / config.width, capture.height / config.height);
    const parameters = sender.getParameters();
    if (parameters.encodings?.length !== 1) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Sender-only configuration requires one video encoding"
      );
    }
    const encoding = parameters.encodings[0];
    const previous = { ...encoding };
    const previousPreference = parameters.degradationPreference;
    encoding.scaleResolutionDownBy = scale;
    encoding.maxFramerate = config.frameRate;
    encoding.maxBitrate = Math.round(config.maximumBitrate * 1e3);
    parameters.degradationPreference = config.encoderPreference === "maintainFramerate" /* maintainFramerate */ ? "maintain-framerate" : "maintain-resolution";
    await sender.setParameters(parameters);
    ensureActive2();
    if (track.getRTCRtpTransceiver()?.sender !== sender) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "WebRTC video sender changed during configuration"
      );
    }
    const applied = sender.getParameters();
    const actual = applied.encodings?.[0];
    if (!actual || Math.abs((actual.scaleResolutionDownBy ?? 1) - scale) > 1e-4 || actual.maxFramerate !== encoding.maxFramerate || actual.maxBitrate !== encoding.maxBitrate) {
      if (actual && applied.encodings.length === 1) {
        for (const key of ["scaleResolutionDownBy", "maxFramerate", "maxBitrate"]) {
          if (previous[key] === void 0) {
            delete actual[key];
          } else {
            actual[key] = previous[key];
          }
        }
        if (previousPreference === void 0) {
          delete applied.degradationPreference;
        } else {
          applied.degradationPreference = previousPreference;
        }
        await sender.setParameters(applied);
      }
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Browser did not retain WebRTC video sender parameters"
      );
    }
  }
};

function validateCameraRotation(rotation) {
  if (![0, 90, 180, 270].includes(rotation)) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "Camera rotation must be 0, 90, 180 or 270"
    );
  }
}

var CameraRotationProcessor = class {
  /**
   * Creates the rotation canvas and player, rejecting browsers without Canvas capture.
   */
  constructor(options) {
    this.options = options;
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    const context = this.canvas.getContext(
      "2d",
      { alpha: false }
    );
    if (!context || typeof this.canvas.captureStream !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Canvas camera rotation is not supported by this browser"
      );
    }
    this.context = context;
    this.video.muted = true;
    this.video.autoplay = true;
    this.video.playsInline = true;
  }
  /**
   * The video element reading source frames.
   */
  video = document.createElement("video");
  /**
   * The canvas holding rotated output frames.
   */
  canvas = document.createElement("canvas");
  /**
   * The canvas drawing context.
   */
  context;
  /**
   * The browser stream produced by this processor.
   */
  stream;
  /**
   * The borrowed camera track before rotation.
   */
  source;
  /**
   * The pending video-frame callback handle.
   */
  frameCallback;
  /**
   * The pending fallback timer.
   */
  timer;
  /**
   * The callback cancelling an unfinished first-frame wait.
   */
  cancelPending;
  /**
   * Whether scheduling has stopped and the pipeline is released.
   */
  stopped = false;
  /**
   * The source-operation revision rejecting obsolete asynchronous results.
   */
  version = 0;
  /**
   * The handler failing rotation when the borrowed camera track ends.
   */
  sourceEnded = () => {
    this.fail(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "Camera source ended during rotation"
    ));
  };
  /**
   * Waits for a successfully drawn first frame, reusing the output track across camera switches.
   */
  async setSource(source) {
    if (this.stopped) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Camera rotation has stopped"
      );
    }
    if (source.readyState === "ended") {
      this.stop();
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Camera rotation requires a live source"
      );
    }
    this.cancelPending?.();
    this.cancelFrame();
    this.source?.removeEventListener(
      "ended",
      this.sourceEnded
    );
    const version = ++this.version;
    this.source = source;
    source.addEventListener(
      "ended",
      this.sourceEnded
    );
    this.video.srcObject = new MediaStream([source]);
    try {
      await new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timeout);
          this.cancelPending = void 0;
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };
        const timeout = setTimeout(
          () => finish(new XmaxError(
            "TIMEOUT" /* timeout */,
            "Timed out waiting for a camera rotation frame"
          )),
          1e4
        );
        this.cancelPending = () => finish(new XmaxError(
          "CANCELLED" /* cancelled */,
          "Camera rotation source changed"
        ));
        void this.video.play().then(
          () => {
            if (settled || this.stopped || version !== this.version) {
              return;
            }
            const firstFrame = () => {
              if (settled || this.stopped || version !== this.version) {
                return;
              }
              try {
                if (!this.draw()) {
                  this.schedule(firstFrame);
                  return;
                }
                this.stream ??= this.canvas.captureStream(this.options.frameRate);
                if (!this.stream.getVideoTracks()[0]) {
                  throw new Error("Canvas did not produce a video track");
                }
                this.requestFrame();
                finish();
                this.schedule(() => this.render(version));
              } catch (error) {
                finish(error);
              }
            };
            this.schedule(firstFrame);
          },
          finish
        );
      });
      if (this.stopped || version !== this.version) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Camera rotation source changed"
        );
      }
      return this.stream.getVideoTracks()[0];
    } catch (error) {
      if (version === this.version) {
        this.stop();
      }
      throw XmaxError.from(error);
    }
  }
  /**
   * Unbinds the old source before a device change while retaining the last canvas frame and output
   * track.
   */
  pauseSource() {
    ++this.version;
    this.cancelPending?.();
    this.cancelFrame();
    this.source?.removeEventListener(
      "ended",
      this.sourceEnded
    );
    this.source = void 0;
    this.video.pause();
    this.video.srcObject = null;
  }
  /**
   * Updates rotated dimensions and output frame rate without replacing the output track or source
   * scheduler.
   */
  async updateFormat(width, height, frameRate) {
    if (this.stopped) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Camera rotation has stopped"
      );
    }
    const version = this.version;
    const output = this.stream?.getVideoTracks()[0];
    await output?.applyConstraints({ frameRate });
    if (this.stopped || this.version !== version) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Camera rotation source changed"
      );
    }
    Object.assign(
      this.options,
      {
        width,
        height,
        frameRate
      }
    );
    this.canvas.width = width;
    this.canvas.height = height;
    if (this.draw()) {
      this.requestFrame();
    }
  }
  /**
   * Stops scheduling and releases output resources without stopping the borrowed camera track.
   */
  stop() {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    ++this.version;
    this.cancelPending?.();
    this.cancelFrame();
    this.source?.removeEventListener(
      "ended",
      this.sourceEnded
    );
    this.source = void 0;
    this.video.pause();
    this.video.srcObject = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = void 0;
    this.canvas.width = this.canvas.height = 0;
  }
  /**
   * Draws the source using a centered crop at the post-rotation target dimensions.
   */
  draw() {
    const { videoWidth: width, videoHeight: height } = this.video;
    if (this.video.readyState < 2 || !width || !height) {
      return false;
    }
    const { width: outWidth, height: outHeight, rotation } = this.options;
    const quarterTurn = rotation === 90 || rotation === 270;
    const targetWidth = quarterTurn ? outHeight : outWidth;
    const targetHeight = quarterTurn ? outWidth : outHeight;
    const scale = Math.max(targetWidth / width, targetHeight / height);
    const cropWidth = targetWidth / scale, cropHeight = targetHeight / scale;
    this.context.setTransform(
      1,
      0,
      0,
      1,
      outWidth / 2,
      outHeight / 2
    );
    this.context.rotate(rotation * Math.PI / 180);
    this.context.drawImage(
      this.video,
      (width - cropWidth) / 2,
      (height - cropHeight) / 2,
      cropWidth,
      cropHeight,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight
    );
    return true;
  }
  /**
   * Draws and reschedules the current source, stopping when its revision is obsolete.
   */
  render(version) {
    if (this.stopped || version !== this.version) {
      return;
    }
    try {
      if (this.draw()) {
        this.requestFrame();
      }
      this.schedule(() => this.render(version));
    } catch (error) {
      this.fail(XmaxError.from(error));
    }
  }
  /**
   * Requests publication of the newly drawn canvas frame.
   */
  requestFrame() {
    const track = this.stream?.getVideoTracks()[0];
    track?.requestFrame?.();
  }
  /**
   * Schedules a native video-frame callback, falling back to a timer at the target frame rate.
   */
  schedule(callback) {
    if (typeof this.video.requestVideoFrameCallback === "function") {
      this.frameCallback = this.video.requestVideoFrameCallback(callback);
    } else {
      this.timer = setTimeout(
        callback,
        1e3 / this.options.frameRate
      );
    }
  }
  /**
   * Cancels the pending frame callback and fallback timer.
   */
  cancelFrame() {
    if (this.frameCallback !== void 0) {
      this.video.cancelVideoFrameCallback(this.frameCallback);
    }
    clearTimeout(this.timer);
    this.frameCallback = void 0;
    this.timer = void 0;
  }
  /**
   * Releases rotation resources and reports a media failure.
   */
  fail(error) {
    this.stop();
    this.options.onError(error);
  }
};

var AgoraRtcManager = class _AgoraRtcManager {
  /**
   * Module-wide region references. Because setArea is global, conflicting active environments are
   * rejected.
   */
  static regions = /* @__PURE__ */ new Map();
  /**
   * The configured service environment.
   */
  environment;
  /**
   * The lazy Agora runtime loader.
   */
  loadSDK;
  /**
   * The loaded Agora SDK module.
   */
  sdk;
  /**
   * The current Agora client.
   */
  client;
  /**
   * The shared initialization promise preventing duplicate clients.
   */
  initialization;
  /**
   * The lifecycle revision invalidating work after destruction.
   */
  lifecycle = 0;
  /**
   * The camera's local video output track.
   */
  camera;
  /**
   * The original camera capture track before rotation.
   */
  cameraSource;
  /**
   * The camera rotation processor.
   */
  cameraRotation;
  /**
   * The capture revision rejecting results after a switch or stop.
   */
  captureVersion = 0;
  /**
   * The active microphone capture track.
   */
  microphone;
  /**
   * The external-video clone owned by this adapter.
   */
  externalVideo;
  /**
   * The external-audio clone owned by this adapter.
   */
  externalAudio;
  /**
   * The last encoding preference applied to each local video track.
   */
  appliedOptimizationModes = /* @__PURE__ */ new WeakMap();
  /**
   * The camera sender's current target encoding settings.
   */
  cameraSenderConfiguration;
  /**
   * The serialized sender-parameter update chain.
   */
  senderUpdateTail = Promise.resolve();
  /**
   * The listener restoring parameters after sender replacement.
   */
  cameraTransceiverListener;
  /**
   * The active room identity and credentials.
   */
  connection;
  /**
   * The room revision invalidating work after leaving.
   */
  roomVersion = 0;
  /**
   * Whether credentials have expired and room recovery is required.
   */
  tokenExpired = false;
  /**
   * The shared room-recovery operation.
   */
  rejoinOperation;
  /**
   * The shared underlying rejoin task.
   */
  rejoinTask;
  /**
   * The callback cancelling the current rejoin wait.
   */
  cancelRejoin;
  /**
   * Whether the app currently requests video publication.
   */
  videoPublishRequested = false;
  /**
   * Whether the app currently requests audio publication.
   */
  audioPublishRequested = false;
  /**
   * The shared RTC event listener.
   */
  listener;
  /**
   * The periodic statistics timer.
   */
  statisticsTimer;
  /**
   * Whether network sampling is suspended during recovery or exit.
   */
  networkQualitySuspended = false;
  /**
   * Per-user playback volumes, from 0 to 100.
   */
  audioVolumes = /* @__PURE__ */ new Map();
  /**
   * The remote users for which audio subscription is requested.
   */
  requestedAudio = /* @__PURE__ */ new Set();
  /**
   * The ordered control queue, prioritized over unsent interaction snapshots.
   */
  orderedMessages = [];
  /**
   * The latest snapshot not yet submitted to Agora.
   */
  latestMessage;
  /**
   * The identity isolating asynchronous work for the current message-drain loop.
   */
  messageDrain;
  /**
   * Cancellation callbacks for in-flight gateway responses; at most 30 snapshot sends may remain
   * pending.
   */
  activeSends = /* @__PURE__ */ new Set();
  /**
   * Creates an adapter without loading browser dependencies or requesting device permission.
   */
  constructor(options) {
    this.environment = options.environment;
    this.loadSDK = options.loadSDK ?? (async () => (await import("./AgoraRTC_N-production-FHAKXOXU.js")).default);
  }
  /**
   * Whether this instance has an Agora client.
   */
  get isInitialized() {
    return this.client !== void 0;
  }
  /**
   * Whether independent volume control is supported. Zero volume additionally stops playback.
   */
  get supportsRemoteAudioVolumeControl() {
    return true;
  }
  /**
   * Initializes one client per instance using the configured service region.
   */
  async initialize() {
    if (this.client) {
      return;
    }
    if (this.initialization) {
      return this.initialization;
    }
    const version = this.lifecycle;
    const operation = this.performInitialize(version);
    this.initialization = operation;
    try {
      await operation;
    } finally {
      if (this.initialization === operation) {
        this.initialization = void 0;
      }
    }
  }
  /**
   * Loads the SDK, reserves its region, and registers events without reviving destroyed instances.
   */
  async performInitialize(version) {
    const sdk = await this.loadSDK();
    if (version !== this.lifecycle) {
      throw this.cancelled();
    }
    const region = _AgoraRtcManager.regions.get(sdk);
    if (region && region.environment !== this.environment) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Concurrent Agora clients must use the same XmaxEnvironment"
      );
    }
    sdk.setLogLevel(4);
    if (!region) {
      sdk.setArea([this.environment === "china" /* china */ ? "CHINA" : "GLOBAL"]);
    }
    const client = sdk.createClient({
      mode: "rtc",
      codec: "h264"
    });
    if (typeof client.sendStreamMessage !== "function") {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Agora DataStream is unavailable in this SDK version"
      );
    }
    _AgoraRtcManager.regions.set(
      sdk,
      {
        environment: this.environment,
        count: (region?.count ?? 0) + 1
      }
    );
    this.sdk = sdk;
    this.client = client;
    this.registerEvents(client);
  }
  /**
   * Invalidates asynchronous work before releasing room, capture, event, and region resources.
   */
  async destroy() {
    this.lifecycle++;
    const client = this.client;
    this.clearRoom();
    this.client = void 0;
    client?.removeAllListeners();
    this.releaseCameraCapture();
    this.microphone?.close();
    this.externalVideo?.close();
    this.externalAudio?.close();
    this.externalVideo = void 0;
    this.externalAudio = void 0;
    this.camera = void 0;
    this.microphone = void 0;
    const sdk = this.sdk;
    this.sdk = void 0;
    try {
      await client?.leave();
    } catch {
      XmaxLogger.rtc.warning(() => "Agora \u9000\u623F\u5931\u8D25\uFF0C\u5DF2\u91CA\u653E\u672C\u5730\u8D44\u6E90 (Agora Leave Failed)");
    } finally {
      const region = sdk && _AgoraRtcManager.regions.get(sdk);
      if (sdk && region && --region.count === 0) {
        _AgoraRtcManager.regions.delete(sdk);
      }
    }
  }
  /**
   * Captures camera video without publishing and returns its native track for shared rendering.
   */
  async startCameraCapture(options) {
    const client = this.requireClient();
    if (this.camera || this.cameraSource || this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "A local video source is already active"
      );
    }
    const rotation = options.rotation ?? 0;
    validateCameraRotation(rotation);
    const version = ++this.captureVersion;
    let source;
    try {
      const captureSize = rtcOrientedVideoSize(rotation === 90 || rotation === 270 ? {
        width: options.height,
        height: options.width
      } : options);
      source = await this.sdk.createCameraVideoTrack({
        facingMode: options.position === "front" /* front */ ? "user" : "environment",
        encoderConfig: {
          width: captureSize.width,
          height: captureSize.height,
          frameRate: options.frameRate
        }
      });
      if (this.client !== client || version !== this.captureVersion) {
        source.close();
        throw this.cancelled();
      }
      this.cameraSource = source;
      let camera = source;
      if (rotation !== 0) {
        const processor = new CameraRotationProcessor({
          ...options,
          rotation,
          onError: (error) => this.listener?.onError?.(error)
        });
        this.cameraRotation = processor;
        const output = await processor.setSource(source.getMediaStreamTrack());
        if (this.client !== client || version !== this.captureVersion) {
          throw this.cancelled();
        }
        camera = this.sdk.createCustomVideoTrack({
          mediaStreamTrack: output,
          width: options.width,
          height: options.height,
          frameRate: options.frameRate
        });
      }
      this.camera = camera;
      this.cameraTransceiverListener = () => {
        if (this.client === client && client.localTracks.includes(camera) && this.videoPublishRequested && !this.rejoinTask) {
          void this.restoreCameraSender(camera).catch(() => {
            if (this.camera === camera && this.videoPublishRequested) {
              XmaxLogger.rtc.warning(() => "Agora \u53D1\u9001\u53C2\u6570\u6062\u590D\u5931\u8D25 (Agora Sender Parameters Restore Failed)");
            }
          });
        }
      };
      camera.on(
        "transceiver-updated",
        this.cameraTransceiverListener
      );
      return camera.getMediaStreamTrack();
    } catch (error) {
      if (version === this.captureVersion) {
        this.releaseCameraCapture();
      }
      throw this.mapError(
        error,
        "CAMERA_PERMISSION_DENIED" /* cameraPermissionDenied */
      );
    }
  }
  /**
   * Updates unpublished camera capture while retaining the local track and rotation output.
   */
  async updateCameraCapture(options) {
    const source = this.requireCamera();
    const camera = this.camera;
    const client = this.requireClient();
    const version = this.captureVersion;
    if (this.connection || this.videoPublishRequested) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Disconnect Agora before updating camera capture"
      );
    }
    const rotation = options.rotation ?? 0;
    validateCameraRotation(rotation);
    if (rotation !== 0 !== !!this.cameraRotation) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera format updates must preserve rotation"
      );
    }
    const ensureCurrent = () => {
      if (this.camera !== camera || this.cameraSource !== source || this.client !== client || version !== this.captureVersion) {
        throw this.cancelled();
      }
    };
    const size = rtcOrientedVideoSize(rotation === 90 || rotation === 270 ? {
      width: options.height,
      height: options.width
    } : options);
    await this.run(() => source.setEncoderConfiguration({
      width: size.width,
      height: size.height,
      frameRate: options.frameRate
    }));
    ensureCurrent();
    if (this.cameraRotation) {
      await this.cameraRotation.updateFormat(
        options.width,
        options.height,
        options.frameRate
      );
      ensureCurrent();
    }
    return camera.getMediaStreamTrack();
  }
  /**
   * Switches the Agora camera device and returns its current native track.
   */
  async switchCameraCapture(to) {
    const source = this.requireCamera();
    const camera = this.camera;
    this.cameraRotation?.pauseSource();
    try {
      await this.run(() => source.setDevice({ facingMode: to === "front" /* front */ ? "user" : "environment" }));
    } catch (error) {
      if (this.camera === camera && this.cameraRotation) {
        await this.cameraRotation.setSource(source.getMediaStreamTrack()).catch((restoreError) => {
          this.listener?.onError?.(XmaxError.from(restoreError));
        });
      }
      throw error;
    }
    if (this.camera !== camera || this.cameraSource !== source) {
      throw this.cancelled();
    }
    if (this.cameraRotation) {
      await this.cameraRotation.setSource(source.getMediaStreamTrack());
      if (this.camera !== camera) {
        throw this.cancelled();
      }
    }
    if (this.videoPublishRequested) {
      await this.restoreCameraSender(camera);
    }
    return camera.getMediaStreamTrack();
  }
  /**
   * Stops capture and releases the camera.
   */
  async stopCameraCapture() {
    this.releaseCameraCapture();
  }
  /**
   * Releases camera capture, rotation output, and sender state.
   */
  releaseCameraCapture() {
    ++this.captureVersion;
    const camera = this.camera;
    this.releaseCameraSender();
    this.camera = void 0;
    camera?.close();
    this.cameraRotation?.stop();
    this.cameraRotation = void 0;
    if (this.cameraSource !== camera) {
      this.cameraSource?.close();
    }
    this.cameraSource = void 0;
  }
  /**
   * Wraps cloned external tracks as Agora local tracks without device access, releasing clones on
   * failure.
   */
  async setExternalMediaTracks(tracks) {
    this.requireClient();
    if (this.camera || this.cameraSource || this.microphone || this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Release the current local media before attaching external tracks"
      );
    }
    if (tracks.videoTrack.kind !== "video" || tracks.videoTrack.readyState !== "live" || tracks.audioTrack && (tracks.audioTrack.kind !== "audio" || tracks.audioTrack.readyState !== "live")) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "External media requires live video and optional audio tracks"
      );
    }
    const video = tracks.videoTrack.clone();
    let audio;
    let wrappedVideo;
    let wrappedAudio;
    try {
      audio = tracks.audioTrack?.clone();
      wrappedVideo = this.sdk.createCustomVideoTrack({ mediaStreamTrack: video });
      if (audio) {
        wrappedAudio = this.sdk.createCustomAudioTrack({
          mediaStreamTrack: audio,
          encoderConfig: "music_standard"
        });
      }
      this.externalVideo = wrappedVideo;
      this.externalAudio = wrappedAudio;
    } catch (error) {
      wrappedVideo?.close();
      wrappedAudio?.close();
      video.stop();
      audio?.stop();
      throw this.mapError(error);
    }
  }
  /**
   * Configures camera senders directly and uses Agora encoding configuration for external video.
   */
  async configureVideoEncoding(config) {
    const camera = this.requireLocalVideo();
    if (camera === this.camera) {
      const client = this.requireClient(), version = this.roomVersion;
      const published = this.videoPublishRequested;
      await this.run(() => this.queueSenderUpdate(async () => {
        const ensureActive2 = () => {
          if (this.camera !== camera || this.client !== client || this.roomVersion !== version || published && !this.videoPublishRequested) {
            throw this.cancelled();
          }
        };
        ensureActive2();
        if (this.videoPublishRequested) {
          await AgoraVideoSender.apply(
            camera,
            this.cameraEncodingConfiguration(config),
            ensureActive2
          );
        }
        this.cameraSenderConfiguration = { ...config };
      }));
      return;
    }
    const encodingSize = config;
    await this.run(async () => {
      await camera.setEncoderConfiguration({
        width: encodingSize.width,
        height: encodingSize.height,
        frameRate: config.frameRate,
        bitrateMin: config.minimumBitrate,
        bitrateMax: config.maximumBitrate
      });
      if (this.appliedOptimizationModes.get(camera) !== config.encoderPreference) {
        await camera.setOptimizationMode(
          config.encoderPreference === "maintainFramerate" /* maintainFramerate */ ? "motion" : "detail"
        );
        this.appliedOptimizationModes.set(
          camera,
          config.encoderPreference
        );
      }
    });
  }
  /**
   * Serializes camera sender changes to preserve update order.
   */
  queueSenderUpdate(operation) {
    const next = this.senderUpdateTail.then(operation);
    this.senderUpdateTail = next.catch(() => {
    });
    return next;
  }
  /**
   * Restores the latest successful settings after publication or sender replacement without capturing
   * obsolete queued settings.
   */
  restoreCameraSender(camera) {
    const client = this.client, version = this.roomVersion;
    return this.queueSenderUpdate(async () => {
      const ensureActive2 = () => {
        if (this.camera !== camera || this.client !== client || this.roomVersion !== version || !this.videoPublishRequested) {
          throw this.cancelled();
        }
      };
      ensureActive2();
      const config = this.cameraSenderConfiguration;
      if (config) {
        await AgoraVideoSender.apply(
          camera,
          this.cameraEncodingConfiguration(config),
          ensureActive2
        );
      }
    });
  }
  /**
   * Resolves camera encoding dimensions for the current orientation.
   */
  cameraEncodingConfiguration(config) {
    return this.cameraRotation ? config : {
      ...config,
      ...rtcOrientedVideoSize(config)
    };
  }
  /**
   * Removes sender-change observation and clears encoding settings.
   */
  releaseCameraSender() {
    if (this.cameraTransceiverListener) {
      this.camera?.off(
        "transceiver-updated",
        this.cameraTransceiverListener
      );
    }
    this.cameraTransceiverListener = void 0;
    this.cameraSenderConfiguration = void 0;
  }
  /**
   * Joins with the session's string channel and UID, using the configured region.
   */
  async joinRoom(configuration) {
    await this.rejoinTask?.catch(() => {
    });
    const client = this.requireClient();
    if (configuration.provider !== "agora" /* agora */ || this.connection) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Agora credentials and an idle room are required"
      );
    }
    const version = ++this.roomVersion;
    await this.joinChannel(
      client,
      configuration
    );
    if (client !== this.client || version !== this.roomVersion) {
      await client.leave();
      throw this.cancelled();
    }
    this.connection = configuration;
    for (const user of client.remoteUsers) {
      if (user.hasVideo) {
        this.listener?.onRemoteVideoPublished(
          String(user.uid),
          true
        );
      }
    }
    this.statisticsTimer = setInterval(
      () => {
        if (this.client !== client || !this.connection || this.tokenExpired || this.rejoinOperation) {
          return;
        }
        try {
          AgoraRtcStatistics.collect(
            client,
            this.listener
          );
        } catch {
          XmaxLogger.rtc.warning(() => "Agora \u7EDF\u8BA1\u91C7\u6837\u5931\u8D25 (Agora Statistics Failed)");
        }
      },
      2e3
    );
  }
  /**
   * Joins the native channel using the session's RTC credentials.
   */
  async joinChannel(client, configuration) {
    await this.run(() => client.join(
      configuration.appID,
      configuration.roomID,
      configuration.roomToken,
      configuration.userID
    ));
  }
  /**
   * Cancels messages, statistics, and playback before leaving while preserving local preview.
   */
  async leaveRoom() {
    this.clearRoom();
    if (this.client) {
      await this.run(() => this.client.leave());
    }
  }
  /**
   * Applies a new token to the same channel, renewing before expiration or rejoining and restoring media
   * afterward.
   */
  async updateCredentials(config, signal) {
    if (signal?.aborted) {
      throw this.cancelled();
    }
    const current = this.connection;
    const client = this.requireClient();
    if (!current || config.provider !== "agora" /* agora */ || config.appID !== current.appID || config.roomID !== current.roomID || config.userID !== current.userID) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Agora session binding changed"
      );
    }
    const version = this.roomVersion;
    if (!this.tokenExpired) {
      try {
        await this.run(() => client.renewToken(config.roomToken));
      } catch (error) {
        this.ensureRoomCurrent(
          client,
          version
        );
        if (!this.tokenExpired) {
          throw error;
        }
      }
    }
    this.ensureRoomCurrent(
      client,
      version
    );
    if (signal?.aborted) {
      throw this.cancelled();
    }
    if (this.tokenExpired) {
      await this.rejoinRoom(
        client,
        config,
        signal
      );
    } else {
      this.connection = config;
    }
  }
  /**
   * Serializes same-room recovery without creating a session or resending generation start.
   */
  async rejoinRoom(client, config, signal) {
    if (this.rejoinOperation) {
      return this.rejoinOperation;
    }
    const version = ++this.roomVersion;
    const task = Promise.resolve().then(() => this.performRejoin(
      client,
      config,
      version
    ));
    this.rejoinTask = task;
    void task.finally(() => {
      if (this.rejoinTask === task) {
        this.rejoinTask = void 0;
      }
    }).catch(() => {
    });
    let cancel;
    const operation = new Promise((resolve, reject) => {
      cancel = () => {
        if (this.isRoomCurrent(
          client,
          version
        )) {
          this.roomVersion++;
        }
        reject(this.cancelled());
      };
      this.cancelRejoin = cancel;
      signal?.addEventListener(
        "abort",
        cancel,
        { once: true }
      );
      task.then(
        resolve,
        reject
      );
      if (signal?.aborted) {
        cancel();
      }
    });
    this.rejoinOperation = operation;
    try {
      await operation;
    } finally {
      signal?.removeEventListener(
        "abort",
        cancel
      );
      if (this.cancelRejoin === cancel) {
        this.cancelRejoin = void 0;
      }
      if (this.rejoinOperation === operation) {
        this.rejoinOperation = void 0;
      }
    }
    this.ensureRoomCurrent(
      client,
      version
    );
    for (const user of client.remoteUsers) {
      if (user.hasVideo) {
        this.listener?.onRemoteVideoPublished(
          String(user.uid),
          true
        );
      }
    }
  }
  /**
   * Rejoins with updated credentials, reusing capture tracks and restoring remote audio subscriptions.
   */
  async performRejoin(client, config, version) {
    this.ensureRoomCurrent(
      client,
      version
    );
    for (const cancel of this.activeSends) {
      cancel();
    }
    this.listener?.onRoomRejoining?.();
    for (const user of client.remoteUsers) {
      user.audioTrack?.stop();
    }
    await this.run(() => client.leave());
    this.ensureRoomCurrent(
      client,
      version
    );
    await this.joinChannel(
      client,
      config
    );
    if (!this.isRoomCurrent(
      client,
      version
    )) {
      await this.run(() => client.leave());
      throw this.cancelled();
    }
    const video = this.externalVideo ?? this.camera;
    const audio = this.externalVideo ? this.externalAudio : this.microphone;
    if (this.videoPublishRequested && video) {
      await this.run(() => client.publish(video));
      this.ensureRoomCurrent(
        client,
        version
      );
      if (video === this.camera) {
        await this.restoreCameraSender(this.camera);
      }
    }
    if (this.audioPublishRequested && audio) {
      await this.run(() => client.publish(audio));
      this.ensureRoomCurrent(
        client,
        version
      );
    }
    for (const user of client.remoteUsers) {
      if (!user.hasAudio || !this.requestedAudio.has(String(user.uid))) {
        continue;
      }
      const track = await this.run(() => client.subscribe(
        user,
        "audio"
      ));
      if (!this.isRoomCurrent(
        client,
        version
      )) {
        track.stop();
        throw this.cancelled();
      }
      this.applyAudioVolume(user);
    }
    this.connection = config;
    this.tokenExpired = false;
  }
  /**
   * Publishes the prepared local video track.
   */
  async publishLocalVideo() {
    const client = this.requireClient();
    const camera = this.requireLocalVideo();
    this.videoPublishRequested = true;
    await this.rejoinOperation;
    if (client !== this.client || !this.videoPublishRequested) {
      throw this.cancelled();
    }
    if (client.localTracks.includes(camera)) {
      return;
    }
    await this.run(() => client.publish(camera));
    if (camera === this.camera) {
      await this.run(() => this.restoreCameraSender(this.camera));
    }
  }
  /**
   * Unpublishes video while retaining capture and preview.
   */
  async unpublishLocalVideo() {
    this.videoPublishRequested = false;
    if (this.rejoinTask || this.tokenExpired) {
      return;
    }
    const video = this.externalVideo ?? this.camera;
    if (this.client && video) {
      await this.run(() => this.client.unpublish(video));
    }
  }
  /**
   * Publishes external audio only when supplied, or starts microphone capture for a camera source;
   * obsolete capture results are released.
   */
  async publishLocalAudio() {
    const client = this.requireClient();
    this.audioPublishRequested = true;
    await this.rejoinOperation;
    const version = this.roomVersion;
    if (client !== this.client || !this.audioPublishRequested) {
      throw this.cancelled();
    }
    if (this.externalVideo) {
      const audio = this.externalAudio;
      if (audio && !client.localTracks.includes(audio)) {
        await this.run(() => client.publish(audio));
      }
      return;
    }
    try {
      if (!this.microphone) {
        const track = await this.sdk.createMicrophoneAudioTrack();
        if (client !== this.client || version !== this.roomVersion) {
          track.close();
          throw this.cancelled();
        }
        this.microphone = track;
      }
      if (!client.localTracks.includes(this.microphone)) {
        await client.publish(this.microphone);
      }
    } catch (error) {
      throw this.mapError(
        error,
        "MICROPHONE_PERMISSION_DENIED" /* microphonePermissionDenied */
      );
    }
  }
  /**
   * Unpublishes audio while leaving capture cleanup to closure.
   */
  async unpublishLocalAudio() {
    this.audioPublishRequested = false;
    if (this.rejoinTask || this.tokenExpired) {
      return;
    }
    const audio = this.externalVideo ? this.externalAudio : this.microphone;
    if (this.client && audio) {
      await this.run(() => this.client.unpublish(audio));
    }
  }
  /**
   * Subscribes to remote main video and returns its native track without creating another player.
   */
  async subscribeRemoteVideo(userID, subscribe) {
    if (!subscribe && this.rejoinTask) {
      return;
    }
    await this.rejoinOperation;
    const client = this.requireClient();
    const user = client.remoteUsers.find((user2) => String(user2.uid) === userID);
    if (!user && !subscribe) {
      return;
    }
    if (!user) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Agora remote video user is unavailable"
      );
    }
    if (!subscribe) {
      await this.run(() => client.unsubscribe(
        user,
        "video"
      ));
      return;
    }
    const version = this.roomVersion;
    const track = await this.run(() => client.subscribe(
      user,
      "video"
    ));
    if (client !== this.client || version !== this.roomVersion) {
      throw this.cancelled();
    }
    return track.getMediaStreamTrack();
  }
  /**
   * Remembers audio-subscription intent for later publication and applies volume before playback.
   */
  async subscribeRemoteAudio(userID, subscribe) {
    const client = this.requireClient();
    const user = client.remoteUsers.find((user2) => String(user2.uid) === userID);
    if (!subscribe) {
      this.requestedAudio.delete(userID);
      user?.audioTrack?.stop();
      if (user?.audioTrack && !this.rejoinTask) {
        await this.run(() => client.unsubscribe(
          user,
          "audio"
        ));
      }
      return;
    }
    this.requestedAudio.add(userID);
    if (this.rejoinOperation) {
      const version2 = this.roomVersion;
      await this.rejoinOperation;
      this.ensureRoomCurrent(
        client,
        version2
      );
      if (this.requestedAudio.has(userID)) {
        await this.subscribeRemoteAudio(
          userID,
          true
        );
      }
      return;
    }
    if (!user?.hasAudio) {
      return;
    }
    const version = this.roomVersion;
    const track = await this.run(() => client.subscribe(
      user,
      "audio"
    ));
    if (client !== this.client || version !== this.roomVersion || !this.requestedAudio.has(userID)) {
      track.stop();
      return;
    }
    this.applyAudioVolume(user);
    this.listener?.onRemoteAudioTrackChanged?.(userID);
  }
  /**
   * Caches volume before subscription; zero avoids play() to prevent an initial audio leak.
   */
  setRemoteAudioVolume(volume, userID) {
    this.audioVolumes.set(
      userID,
      Math.max(0, Math.min(100, Number.isFinite(volume) ? Math.round(volume) : 0))
    );
    const user = this.client?.remoteUsers.find((user2) => String(user2.uid) === userID);
    if (this.rejoinTask || this.tokenExpired) {
      user?.audioTrack?.stop();
      return;
    }
    if (user) {
      this.applyAudioVolume(user);
    }
  }
  /**
   * Applies playback state while retaining Agora's handling of browser autoplay restrictions.
   */
  applyAudioVolume(user) {
    const track = user.audioTrack;
    if (!track) {
      return;
    }
    const volume = this.audioVolumes.get(String(user.uid)) ?? 0;
    track.setVolume(volume);
    if (volume > 0 && this.requestedAudio.has(String(user.uid))) {
      track.play();
    } else {
      track.stop();
    }
  }
  /**
   * Returns original remote audio independently of Agora player playback.
   */
  getRemoteAudioTrack(userID) {
    const user = this.client?.remoteUsers.find((user2) => String(user2.uid) === userID);
    return user?.hasAudio ? user.audioTrack?.getMediaStreamTrack() : void 0;
  }
  /**
   * Awaits control messages in order while replacing unsent snapshots and not serially awaiting snapshot
   * acknowledgments.
   */
  async sendRoomMessage(message, delivery = "ordered", signal) {
    const version = this.roomVersion;
    const client = this.client;
    const bytes = new TextEncoder().encode(message).byteLength;
    if (signal?.aborted || !client || !this.connection || this.tokenExpired && !this.rejoinOperation) {
      throw this.cancelled();
    }
    if (bytes > 1e3) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Room message exceeds the 1000-byte limit"
      );
    }
    const pending = {
      client,
      version,
      message,
      concurrent: delivery === "concurrent",
      signal
    };
    if (delivery === "latest") {
      this.latestMessage = pending;
      this.scheduleRoomMessages();
      return;
    }
    if (delivery === "barrier" || delivery === "concurrent") {
      this.latestMessage = void 0;
    }
    return new Promise((resolve, reject) => {
      const cancel = () => {
        const index = this.orderedMessages.indexOf(pending);
        if (index !== -1) {
          this.orderedMessages.splice(index, 1);
        }
        pending.completion?.reject(this.cancelled());
      };
      pending.completion = {
        resolve: () => {
          signal?.removeEventListener("abort", cancel);
          resolve();
        },
        reject: (error) => {
          signal?.removeEventListener("abort", cancel);
          reject(error);
        }
      };
      this.orderedMessages.push(pending);
      signal?.addEventListener("abort", cancel, { once: true });
      this.scheduleRoomMessages();
    });
  }
  /**
   * Runs one room-message scheduler, preserving control order and coalescing unsent snapshots.
   */
  scheduleRoomMessages() {
    if (this.messageDrain || !this.orderedMessages.length && !this.latestMessage) {
      return;
    }
    const drain = {};
    this.messageDrain = drain;
    void this.drainRoomMessages(drain);
  }
  /**
   * Preserves submission order, awaiting ordinary controls while allowing bounded concurrent command
   * attempts and snapshots to proceed before preceding gateway responses.
   */
  async drainRoomMessages(drain) {
    try {
      while (this.messageDrain === drain) {
        const pending = this.orderedMessages[0] ?? this.latestMessage;
        if (!pending || (!pending.completion || pending.concurrent) && this.activeSends.size >= 30) {
          return;
        }
        try {
          await this.rejoinOperation;
          if (this.messageDrain !== drain) {
            return;
          }
          if (pending !== (this.orderedMessages[0] ?? this.latestMessage)) {
            continue;
          }
          if (pending.signal?.aborted) {
            throw this.cancelled();
          }
          this.ensureRoomCurrent(
            pending.client,
            pending.version
          );
          if (this.tokenExpired) {
            throw this.cancelled();
          }
          if (pending.completion) {
            this.orderedMessages.shift();
          } else {
            this.latestMessage = void 0;
          }
          const sending = this.sendWithTimeout(
            pending.client,
            pending.message,
            pending.signal
          );
          if (pending.completion && pending.concurrent) {
            void sending.then(pending.completion.resolve, pending.completion.reject).finally(() => this.scheduleRoomMessages());
          } else if (pending.completion) {
            await sending;
            pending.completion.resolve();
          } else {
            void sending.catch((error) => this.reportLatestMessageFailure(
              pending,
              error
            )).finally(() => this.scheduleRoomMessages());
          }
        } catch (error) {
          if (this.orderedMessages[0] === pending) {
            this.orderedMessages.shift();
          }
          if (this.latestMessage === pending) {
            this.latestMessage = void 0;
          }
          if (pending.completion) {
            pending.completion.reject(this.mapError(error));
          } else {
            this.reportLatestMessageFailure(
              pending,
              error
            );
          }
        }
      }
    } finally {
      if (this.messageDrain === drain) {
        this.messageDrain = void 0;
      }
    }
  }
  /**
   * Reports snapshot failures without terminating generation or warning for cancelled obsolete-room
   * work.
   */
  reportLatestMessageFailure(pending, error) {
    if (this.isRoomCurrent(
      pending.client,
      pending.version
    ) && this.mapError(error).code !== "CANCELLED" /* cancelled */) {
      XmaxLogger.rtc.warning(() => "\u53D1\u9001\u5B9E\u65F6\u623F\u95F4\u5FEB\u7167\u5931\u8D25\uFF0C\u5DF2\u4E22\u5F03\u5F53\u524D\u91C7\u6837\u5E27 (Latest Room Message Dropped)");
    }
  }
  /**
   * Times out sends after five seconds; leaving cancels waits and late native results cannot affect a
   * new room.
   */
  async sendWithTimeout(client, message, signal) {
    await new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
        this.activeSends.delete(cancel);
        if (error) {
          reject(this.mapError(error));
        } else {
          resolve();
        }
      };
      const cancel = () => finish(this.cancelled());
      const timer = setTimeout(
        () => finish(new XmaxError(
          "TIMEOUT" /* timeout */,
          "Agora room message send timed out"
        )),
        5e3
      );
      this.activeSends.add(cancel);
      signal?.addEventListener("abort", cancel, { once: true });
      if (signal?.aborted) {
        cancel();
        return;
      }
      void this.run(() => client.sendStreamMessage(
        message,
        false
      )).then(
        () => finish(),
        finish
      );
    });
  }
  /**
   * Sets the shared RTC event listener.
   */
  setEventListener(listener) {
    this.listener = listener;
  }
  /**
   * Bridges Agora publication, DataStream, quality, and token events to shared RTC events.
   */
  registerEvents(client) {
    const active = () => this.client === client && this.connection !== void 0 && !this.rejoinTask;
    const mediaActive = () => active() && !this.tokenExpired;
    const handleExpired = () => {
      if (!active() || this.tokenExpired) {
        return;
      }
      this.tokenExpired = true;
      this.listener?.onNetworkStatistics?.(void 0);
      this.listener?.onTokenExpired?.();
    };
    client.on(
      "user-published",
      (user, kind) => {
        if (!mediaActive()) {
          return;
        }
        if (kind === "video") {
          this.listener?.onRemoteVideoPublished(
            String(user.uid),
            true
          );
        }
        if (kind === "audio" && this.requestedAudio.has(String(user.uid))) {
          void this.subscribeRemoteAudio(
            String(user.uid),
            true
          ).catch((error) => {
            if (active()) {
              this.listener?.onError?.(this.mapError(error));
            }
          });
        }
      }
    );
    client.on(
      "user-unpublished",
      (user, kind) => {
        if (!mediaActive()) {
          return;
        }
        if (kind === "video") {
          this.listener?.onRemoteVideoPublished(
            String(user.uid),
            false
          );
        }
        if (kind === "audio") {
          user.audioTrack?.stop();
          this.listener?.onRemoteAudioTrackChanged?.(String(user.uid));
        }
      }
    );
    client.on(
      "user-left",
      (user) => {
        if (mediaActive()) {
          this.listener?.onRemoteVideoPublished(
            String(user.uid),
            false
          );
        }
      }
    );
    client.on(
      "stream-message",
      (uid, data) => {
        if (mediaActive()) {
          this.listener?.onCustomMessageReceived(
            String(uid),
            typeof data === "string" ? data : new TextDecoder().decode(data)
          );
        }
      }
    );
    client.on(
      "network-quality",
      (quality) => {
        if (mediaActive() && !this.networkQualitySuspended) {
          AgoraRtcStatistics.network(
            quality,
            this.listener
          );
        }
      }
    );
    client.on(
      "token-privilege-will-expire",
      () => {
        if (active() && !this.tokenExpired) {
          this.listener?.onTokenWillExpire?.();
        }
      }
    );
    client.on(
      "token-privilege-did-expire",
      handleExpired
    );
    client.on(
      "connection-state-change",
      (state2, previous, reason) => {
        if (this.client === client) {
          this.networkQualitySuspended = state2 !== "CONNECTED";
        }
        if (active() && state2 !== "CONNECTED") {
          this.listener?.onNetworkStatistics?.(void 0);
        }
        if (state2 === "DISCONNECTED" && reason === "TOKEN_EXPIRE") {
          handleExpired();
          return;
        }
        if (active() && !this.tokenExpired && state2 === "DISCONNECTED" && previous !== "DISCONNECTED") {
          this.listener?.onError?.(new XmaxError(
            "RTC_ERROR" /* rtcError */,
            `Agora connection disconnected: ${reason ?? "unknown"}`
          ));
        }
      }
    );
  }
  /**
   * Clears room state, playback, and queues without stopping local video capture.
   */
  clearRoom() {
    this.roomVersion++;
    this.cancelRejoin?.();
    this.connection = void 0;
    this.tokenExpired = false;
    this.networkQualitySuspended = false;
    this.videoPublishRequested = false;
    this.audioPublishRequested = false;
    clearInterval(this.statisticsTimer);
    this.statisticsTimer = void 0;
    this.messageDrain = void 0;
    this.latestMessage = void 0;
    for (const pending of this.orderedMessages.splice(0)) {
      pending.completion?.reject(this.cancelled());
    }
    for (const cancel of this.activeSends) {
      cancel();
    }
    this.requestedAudio.clear();
    this.audioVolumes.clear();
    for (const user of this.client?.remoteUsers ?? []) {
      user.audioTrack?.stop();
    }
  }
  /**
   * Checks whether recovery still belongs to the current room lifecycle.
   */
  isRoomCurrent(client, version) {
    return this.client === client && this.connection !== void 0 && this.roomVersion === version;
  }
  /**
   * Rejects further recovery steps after leaving, destruction, or room replacement.
   */
  ensureRoomCurrent(client, version) {
    if (!this.isRoomCurrent(
      client,
      version
    )) {
      throw this.cancelled();
    }
  }
  /**
   * Returns the initialized client.
   */
  requireClient() {
    if (!this.client) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Agora is not initialized"
      );
    }
    return this.client;
  }
  /**
   * Returns the active original camera capture track.
   */
  requireCamera() {
    if (!this.cameraSource || !this.camera) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera capture is not running"
      );
    }
    return this.cameraSource;
  }
  /**
   * Returns a publishable local video track from either camera or external media.
   */
  requireLocalVideo() {
    const video = this.externalVideo ?? this.camera;
    if (!video) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local video source is not prepared"
      );
    }
    return video;
  }
  /**
   * Runs an Agora operation and normalizes its failure.
   */
  async run(operation) {
    try {
      return await operation();
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Preserves provider error codes without exposing raw messages that may contain tokens.
   */
  mapError(error, permissionCode) {
    if (error instanceof XmaxError) {
      return error;
    }
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "UNKNOWN";
    const safeCode = /^[A-Z_0-9-]+$/.test(code) ? code : "UNKNOWN";
    return new XmaxError(
      permissionCode && safeCode === "PERMISSION_DENIED" ? permissionCode : "RTC_ERROR" /* rtcError */,
      `Agora operation failed (${safeCode})`
    );
  }
  /**
   * Creates the cancellation error for obsolete Agora operations.
   */
  cancelled() {
    return new XmaxError(
      "CANCELLED" /* cancelled */,
      "Agora operation was cancelled"
    );
  }
};

var RtcEngineLease = class {
  /**
   * The leased TRTC engine.
   */
  engine;
  /**
   * The lease ID.
   */
  id;
  /**
   * Creates an exclusive lease identifying the engine for release validation.
   */
  constructor(engine) {
    this.engine = engine;
    this.id = `lease-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
};
var RtcEngineManager = class _RtcEngineManager {
  /**
   * The shared engine manager.
   */
  static shared = new _RtcEngineManager();
  /**
   * The factory creating a TRTC engine.
   */
  makeEngine;
  /**
   * The currently held engine lease.
   */
  activeLease;
  /**
   * The pending exclusive-lease requests.
   */
  requests = [];
  /**
   * Creates a TRTC engine manager.
   */
  constructor(makeEngine = _RtcEngineManager.defaultMakeEngine) {
    this.makeEngine = makeEngine;
  }
  /**
   * Waits for an exclusive engine lease.
   *
   * @returns A lease that must be released after use.
   */
  async acquire() {
    if (!this.activeLease && this.requests.length === 0) {
      const lease = await this.createLease();
      this.activeLease = lease;
      return lease;
    }
    return new Promise((resolve, reject) => {
      this.requests.push({
        id: `req-${Date.now()}-${this.requests.length}`,
        resolve,
        reject
      });
    });
  }
  /**
   * Releases a valid lease, destroys its engine, and hands ownership to the next waiter.
   */
  release(lease) {
    if (this.activeLease?.id !== lease.id) {
      return;
    }
    this.activeLease = void 0;
    try {
      lease.engine.destroy();
    } catch {
    }
    void this.fulfillNextRequest();
  }
  /**
   * Lazily loads TRTC and creates an engine.
   */
  static async defaultMakeEngine() {
    const module = await import("./trtc-HNQT6WH6.js");
    module.default.setLogLevel(5);
    return module.default.create();
  }
  /**
   * Creates a new engine lease.
   */
  async createLease() {
    const engine = await this.makeEngine();
    if (!engine) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Failed to create RTC Engine"
      );
    }
    return new RtcEngineLease(engine);
  }
  /**
   * Services queued requests, rejecting failed engine creation and continuing with subsequent waiters.
   */
  async fulfillNextRequest() {
    while (!this.activeLease && this.requests.length > 0) {
      const request = this.requests.shift();
      if (!request) {
        return;
      }
      try {
        const lease = await this.createLease();
        this.activeLease = lease;
        request.resolve(lease);
      } catch (error) {
        request.reject(error);
      }
    }
  }
};

function canControlTrtcRemoteAudioVolume(environment) {
  const userAgent = environment?.userAgent ?? (typeof navigator === "undefined" ? "" : navigator.userAgent);
  const maxTouchPoints = environment?.maxTouchPoints ?? (typeof navigator === "undefined" ? 0 : navigator.maxTouchPoints ?? 0);
  const ios = /iPhone|iPad|iPod/i.test(userAgent) || /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  return !ios;
}

var RTC_EVENT = {
  remoteVideoAvailable: "remote-video-available",
  remoteVideoUnavailable: "remote-video-unavailable",
  remoteAudioAvailable: "remote-audio-available",
  remoteAudioUnavailable: "remote-audio-unavailable",
  customMessage: "custom-message",
  statistics: "statistics",
  networkQuality: "network-quality"
};
var STREAM_TYPE_MAIN = "main";
var CUSTOM_MESSAGE_CMD_ID = 1;
var ROOM_MESSAGE_MAX_BYTES = 1e3;
var CAPTURE_PLACEHOLDER_BITRATE = 1e3;
var QOS_PREFERENCE_MAP = {
  ["maintainFramerate" /* maintainFramerate */]: "smooth",
  ["maintainQuality" /* maintainQuality */]: "clear"
};
var TrtcRtcManager = class {
  /**
   * The manager supplying exclusive TRTC engine leases.
   */
  engineManager;
  /**
   * The active engine lease.
   */
  lease;
  /**
   * Whether camera capture is active.
   */
  isCapturing = false;
  /**
   * Whether local audio capture is active.
   */
  isAudioCapturing = false;
  /**
   * The adapter-owned external-video clone.
   */
  externalVideo;
  /**
   * The adapter-owned external-audio clone.
   */
  externalAudio;
  /**
   * Whether the engine has joined a room.
   */
  isInRoom = false;
  /**
   * The shared RTC event listener.
   */
  eventListener;
  /**
   * The disposer for RTC statistics event listeners.
   */
  removeStatsListeners;
  /**
   * Creates a TRTC adapter.
   */
  constructor(engineManager = RtcEngineManager.shared) {
    this.engineManager = engineManager;
  }
  /**
   * Whether the RTC engine is initialized.
   */
  get isInitialized() {
    return this.lease !== void 0;
  }
  /**
   * Acquires an exclusive engine and registers event bridges, doing nothing when already initialized.
   */
  async initialize() {
    if (this.lease) {
      return;
    }
    const lease = await this.engineManager.acquire();
    this.registerEventBridge(lease.engine);
    this.lease = lease;
  }
  /**
   * Releases capture, publication, the engine, and its lease; repeated calls without initialization do
   * nothing.
   */
  async destroy() {
    const lease = this.lease;
    this.lease = void 0;
    const externalVideo = this.externalVideo;
    const externalAudio = this.externalAudio;
    this.externalVideo = void 0;
    this.externalAudio = void 0;
    this.isCapturing = false;
    this.isAudioCapturing = false;
    this.isInRoom = false;
    this.removeStatsListeners?.();
    this.removeStatsListeners = void 0;
    if (!lease) {
      externalVideo?.stop();
      externalAudio?.stop();
      return;
    }
    try {
      await lease.engine.stopLocalAudio();
    } catch {
    }
    try {
      await lease.engine.stopLocalVideo();
    } catch {
    }
    externalVideo?.stop();
    externalAudio?.stop();
    this.engineManager.release(lease);
  }
  /**
   * Prepares external audio/video clones without publication, retaining ownership of the original tracks
   * at the source.
   */
  async setExternalMediaTracks(tracks) {
    const engine = this.requireEngine();
    if (this.isCapturing || this.isAudioCapturing || this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Release the current local media before attaching external tracks"
      );
    }
    if (tracks.videoTrack.kind !== "video" || tracks.videoTrack.readyState !== "live" || tracks.audioTrack && (tracks.audioTrack.kind !== "audio" || tracks.audioTrack.readyState !== "live")) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "External media tracks must be live video/audio tracks"
      );
    }
    const video = tracks.videoTrack.clone();
    this.externalVideo = video;
    let audio;
    try {
      audio = tracks.audioTrack?.clone();
      this.externalAudio = audio;
      await engine.startLocalVideo({
        publish: false,
        option: { videoTrack: video }
      });
      if (this.lease?.engine !== engine) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "External media preparation was cancelled"
        );
      }
      if (audio) {
        await engine.startLocalAudio({
          publish: false,
          option: {
            audioTrack: audio,
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false
          }
        });
        if (this.lease?.engine !== engine) {
          throw new XmaxError(
            "CANCELLED" /* cancelled */,
            "External media preparation was cancelled"
          );
        }
      }
    } catch (error) {
      if (this.lease?.engine === engine) {
        await engine.stopLocalAudio().catch(() => {
        });
        await engine.stopLocalVideo().catch(() => {
        });
      }
      if (this.externalVideo === video) {
        this.externalVideo = void 0;
        this.externalAudio = void 0;
      }
      video.stop();
      audio?.stop();
      throw this.mapError(error);
    }
  }
  /**
   * Updates disconnected camera dimensions and frame rate without replacing its device or capture
   * lifecycle.
   */
  async updateCameraCapture(options) {
    const engine = this.requireEngine();
    if (!this.isCapturing || this.externalVideo || this.isInRoom) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "A disconnected camera preview is required"
      );
    }
    const size = rtcOrientedVideoSize(options);
    try {
      await engine.updateLocalVideo({
        option: {
          profile: {
            width: size.width,
            height: size.height,
            frameRate: options.frameRate,
            bitrate: CAPTURE_PLACEHOLDER_BITRATE
          }
        }
      });
      if (this.lease?.engine !== engine || !this.isCapturing) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Camera capture stopped during format update"
        );
      }
      const track = engine.getVideoTrack();
      if (!track) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "RTC engine did not produce a camera video track"
        );
      }
      return track;
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Starts camera capture without publication.
   *
   * @returns The captured video track.
   * @throws Rejects for uninitialized or active capture, unavailable devices, or denied permission.
   */
  async startCameraCapture(options) {
    if (options.rotation !== void 0 && options.rotation !== 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera rotation currently requires Agora"
      );
    }
    const engine = this.requireEngine();
    if (this.isCapturing || this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera capture is already running"
      );
    }
    try {
      const captureSize = rtcOrientedVideoSize({
        width: options.width,
        height: options.height
      });
      await engine.startLocalVideo({
        publish: false,
        option: {
          useFrontCamera: options.position === "front" /* front */,
          profile: {
            width: captureSize.width,
            height: captureSize.height,
            frameRate: options.frameRate,
            bitrate: CAPTURE_PLACEHOLDER_BITRATE
          }
        }
      });
      const track = engine.getVideoTrack();
      if (!track) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "RTC engine did not produce a camera video track"
        );
      }
      this.isCapturing = true;
      return track;
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Switches between front and rear cameras.
   *
   * @returns The current capture video track.
   * @throws Rejects without initialized capture or if switching fails.
   */
  async switchCameraCapture(to) {
    const engine = this.requireEngine();
    if (!this.isCapturing) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera capture is not running"
      );
    }
    try {
      await engine.updateLocalVideo({
        option: { useFrontCamera: to === "front" /* front */ }
      });
      const track = engine.getVideoTrack();
      if (!track) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "RTC engine did not produce a camera video track after switching"
        );
      }
      return track;
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Stops camera capture, doing nothing when capture or the engine is inactive.
   */
  async stopCameraCapture() {
    if (this.externalVideo) {
      return;
    }
    const engine = this.lease?.engine;
    this.isCapturing = false;
    if (!engine) {
      return;
    }
    try {
      await engine.stopLocalVideo();
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Joins an RTC room.
   *
   * @throws Rejects for an uninitialized engine, invalid parameters, or join failure.
   */
  async joinRoom(configuration) {
    if (configuration.provider !== "trtc" /* trtc */) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "TRTC credentials required"
      );
    }
    const engine = this.requireEngine();
    const sdkAppId = Number(configuration.sdkAppID);
    if (!Number.isInteger(sdkAppId) || sdkAppId <= 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "RTC sdkAppID is invalid"
      );
    }
    if (this.isInRoom) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Already in an RTC room"
      );
    }
    try {
      await engine.enterRoom({
        sdkAppId,
        userId: configuration.userID,
        userSig: configuration.userSig,
        strRoomId: configuration.roomID,
        privateMapKey: configuration.privateMapKey,
        // Require explicit audio subscription after applying volume to avoid initial playback at TRTC defaults.
        autoReceiveAudio: false
      });
      this.isInRoom = true;
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Leaves the active room when initialized; failures are logged without rejecting cleanup.
   */
  async leaveRoom() {
    const engine = this.lease?.engine;
    if (!engine || !this.isInRoom) {
      return;
    }
    this.isInRoom = false;
    try {
      await engine.exitRoom();
    } catch (error) {
      XmaxLogger.rtc.warning(
        () => `\u9000\u51FA RTC \u623F\u95F4\u5931\u8D25 (Failed to Leave RTC Room)
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${XmaxError.from(error).message}`
      );
    }
  }
  /**
   * Configures video encoding using minimumBitrate as TRTC's single target bitrate and mapping the
   * encoding preference to its adaptation mode.
   *
   * @throws Rejects if local video is unavailable or configuration fails.
   */
  async configureVideoEncoding(configuration) {
    const engine = this.requireEngine();
    if (!this.isCapturing && !this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local video is not prepared"
      );
    }
    try {
      const encodingSize = this.externalVideo ? configuration : rtcOrientedVideoSize({
        width: configuration.width,
        height: configuration.height
      });
      await engine.updateLocalVideo({
        option: {
          profile: {
            width: encodingSize.width,
            height: encodingSize.height,
            frameRate: configuration.frameRate,
            bitrate: configuration.minimumBitrate
          },
          qosPreference: QOS_PREFERENCE_MAP[configuration.encoderPreference]
        }
      });
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Publishes local video.
   *
   * @throws Rejects without prepared media or if publication fails.
   */
  async publishLocalVideo() {
    const engine = this.requireEngine();
    if (!this.isCapturing && !this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local video is not prepared"
      );
    }
    try {
      await engine.updateLocalVideo({ publish: true });
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Unpublishes video while retaining capture and preview.
   */
  async unpublishLocalVideo() {
    const engine = this.lease?.engine;
    if (!engine || !this.isCapturing && !this.externalVideo) {
      return;
    }
    try {
      await engine.updateLocalVideo({ publish: false });
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Publishes file audio or microphone input, never starting a microphone for an audio-free file source.
   *
   * @throws Rejects for an uninitialized engine, denied permission, or publication failure.
   */
  async publishLocalAudio() {
    const engine = this.requireEngine();
    try {
      if (this.externalVideo) {
        if (this.externalAudio) {
          await engine.updateLocalAudio({ publish: true });
        }
      } else if (!this.isAudioCapturing) {
        await engine.startLocalAudio();
        this.isAudioCapturing = true;
      } else {
        await engine.updateLocalAudio({ publish: true });
      }
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Unpublishes local audio while retaining microphone capture.
   */
  async unpublishLocalAudio() {
    const engine = this.lease?.engine;
    if (!engine || !this.isAudioCapturing && !this.externalAudio) {
      return;
    }
    try {
      await engine.updateLocalAudio({ publish: false });
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Changes a remote main-video subscription and returns the subscribed track for rendering.
   *
   * @throws Rejects without an engine or if the subscription change fails.
   */
  async subscribeRemoteVideo(userID, subscribe) {
    const engine = this.requireEngine();
    try {
      if (subscribe) {
        await engine.startRemoteVideo({
          userId: userID,
          streamType: STREAM_TYPE_MAIN
        });
        const track = engine.getVideoTrack({ userId: userID });
        if (!track) {
          throw new XmaxError(
            "MEDIA_ERROR" /* mediaError */,
            "Remote video track is not available"
          );
        }
        return track;
      }
      await engine.stopRemoteVideo({
        userId: userID,
        streamType: STREAM_TYPE_MAIN
      });
      return void 0;
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Changes remote audio subscription.
   *
   * @throws Rejects without an engine or if the operation fails.
   */
  async subscribeRemoteAudio(userID, subscribe) {
    const engine = this.requireEngine();
    try {
      await engine.muteRemoteAudio(
        userID,
        !subscribe
      );
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Whether this platform supports TRTC remote-volume control; false on iOS Safari and WKWebView.
   */
  get supportsRemoteAudioVolumeControl() {
    return canControlTrtcRemoteAudioVolume();
  }
  /**
   * Returns original remote audio, rejecting observation where independent playback-volume control is
   * unsupported.
   */
  getRemoteAudioTrack(userID) {
    if (!canControlTrtcRemoteAudioVolume()) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "TRTC cannot provide remote audio frames independently of playback on this platform"
      );
    }
    return this.requireEngine().getAudioTrack(userID) ?? void 0;
  }
  /**
   * Sets a remote user's playback volume.
   *
   * On iOS Safari and WKWebView, zero stops subscription playback and nonzero restores it. Restoring
   * playback may briefly buffer because the stream must be fetched again.
   *
   * @param volume - The requested volume, clamped to 0–100.
   */
  setRemoteAudioVolume(volume, userID) {
    const engine = this.requireEngine();
    const normalized = Math.min(Math.max(Math.round(volume), 0), 100);
    if (!canControlTrtcRemoteAudioVolume()) {
      void engine.muteRemoteAudio(
        userID,
        normalized === 0
      ).catch((error) => {
        XmaxLogger.rtc.warning(
          () => `\u8FDC\u7AEF\u97F3\u9891\u64AD\u653E\u72B6\u6001\u5207\u6362\u5931\u8D25 (Failed to Toggle Remote Audio Playback)
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${XmaxError.from(error).message}`
        );
      });
      return;
    }
    engine.setRemoteAudioVolume(
      userID,
      normalized
    );
  }
  /**
   * Sends a room custom message with cmdId 1.
   *
   * @throws Rejects outside a room or when encoded text exceeds 1000 bytes.
   */
  async sendRoomMessage(message, _delivery, signal) {
    if (signal?.aborted) {
      throw new XmaxError("CANCELLED" /* cancelled */, "RTC room message was cancelled");
    }
    const engine = this.requireEngine();
    if (!this.isInRoom) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Not in an RTC room"
      );
    }
    const encoded = new TextEncoder().encode(message);
    if (encoded.byteLength > ROOM_MESSAGE_MAX_BYTES) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Room message exceeds the 1000-byte limit"
      );
    }
    engine.sendCustomMessage({
      cmdId: CUSTOM_MESSAGE_CMD_ID,
      data: encoded.buffer
    });
  }
  /**
   * Retains TRTC join authentication while the session layer caches refreshed credentials.
   */
  async updateCredentials(_configuration) {
  }
  /**
   * Sets the RTC event listener; undefined removes it.
   */
  setEventListener(listener) {
    this.eventListener = listener;
  }
  /**
   * Bridges native media, message, and performance events.
   */
  registerEventBridge(engine) {
    const source = engine;
    const onStatistics = (stats) => {
      if (this.isInRoom && this.lease?.engine === engine) {
        RtcStatsLogger.logConnectionStatistics({
          rttMs: stats.rtt,
          uplinkLossPercent: stats.upLoss,
          downlinkLossPercent: stats.downLoss,
          sentBytes: stats.bytesSent,
          receivedBytes: stats.bytesReceived
        });
        const video = stats.localStatistics?.video?.find((item) => item.videoType === "big");
        const valid = (value, minimum) => typeof value === "number" && Number.isFinite(value) && value >= minimum ? value : void 0;
        const localVideo = video ? Object.freeze({
          width: valid(
            video.width,
            1
          ),
          height: valid(
            video.height,
            1
          ),
          encodeFrameRate: valid(
            video.frameRate,
            0
          ),
          bitrateKbps: valid(
            video.bitrate,
            0
          ),
          packetLossPercent: stats.upLoss <= 100 ? valid(
            stats.upLoss,
            0
          ) : void 0
        }) : void 0;
        this.eventListener?.onLocalVideoStatistics?.(localVideo);
        if (localVideo) {
          RtcStatsLogger.logUplinkVideoStatistics(localVideo);
        }
        const remoteVideo = Object.freeze(
          (stats.remoteStatistics ?? []).flatMap((remote) => {
            const video2 = remote.video?.find((item) => item.videoType === "big");
            if (!video2) {
              return [];
            }
            const playback = video2;
            return [Object.freeze({
              userID: remote.userId,
              width: valid(
                video2.width,
                1
              ),
              height: valid(
                video2.height,
                1
              ),
              decodeFrameRate: valid(
                video2.frameRate,
                0
              ),
              bitrateKbps: valid(
                video2.bitrate,
                0
              ),
              packetLossPercent: stats.downLoss <= 100 ? valid(
                stats.downLoss,
                0
              ) : void 0,
              endToEndDelayMs: valid(
                playback.point2pointDelay,
                0
              )
            })];
          })
        );
        this.eventListener?.onRemoteVideoStatistics?.(remoteVideo);
        for (const video2 of remoteVideo) {
          RtcStatsLogger.logDownlinkVideoStatistics(video2);
        }
      }
    };
    const onNetworkQuality = (stats) => {
      if (this.isInRoom && this.lease?.engine === engine) {
        const quality = Object.freeze({
          uplink: networkQualityLevel(stats.uplinkNetworkQuality),
          downlink: networkQualityLevel(stats.downlinkNetworkQuality)
        });
        RtcStatsLogger.logNetworkQuality({
          ...quality,
          uplinkRTT: stats.uplinkRTT,
          downlinkRTT: stats.downlinkRTT,
          uplinkLoss: stats.uplinkLoss,
          downlinkLoss: stats.downlinkLoss
        });
        this.eventListener?.onNetworkStatistics?.(quality);
      }
    };
    source.on(
      RTC_EVENT.statistics,
      onStatistics
    );
    source.on(
      RTC_EVENT.networkQuality,
      onNetworkQuality
    );
    const onAudioChanged = (event) => {
      if (this.isInRoom && this.lease?.engine === engine) {
        this.eventListener?.onRemoteAudioTrackChanged?.(event.userId);
      }
    };
    source.on(
      RTC_EVENT.remoteAudioAvailable,
      onAudioChanged
    );
    source.on(
      RTC_EVENT.remoteAudioUnavailable,
      onAudioChanged
    );
    this.removeStatsListeners = () => {
      source.off(
        RTC_EVENT.statistics,
        onStatistics
      );
      source.off(
        RTC_EVENT.networkQuality,
        onNetworkQuality
      );
      source.off(
        RTC_EVENT.remoteAudioAvailable,
        onAudioChanged
      );
      source.off(
        RTC_EVENT.remoteAudioUnavailable,
        onAudioChanged
      );
    };
    source.on(
      RTC_EVENT.remoteVideoAvailable,
      (event) => {
        if (this.lease?.engine !== engine || event.streamType !== STREAM_TYPE_MAIN) {
          return;
        }
        this.eventListener?.onRemoteVideoPublished(
          event.userId,
          true
        );
      }
    );
    source.on(
      RTC_EVENT.remoteVideoUnavailable,
      (event) => {
        if (this.lease?.engine !== engine || event.streamType !== STREAM_TYPE_MAIN) {
          return;
        }
        this.eventListener?.onRemoteVideoPublished(
          event.userId,
          false
        );
      }
    );
    source.on(
      RTC_EVENT.customMessage,
      (event) => {
        if (this.lease?.engine !== engine || event.cmdId !== CUSTOM_MESSAGE_CMD_ID) {
          return;
        }
        let message;
        try {
          message = new TextDecoder().decode(event.data);
        } catch {
          XmaxLogger.rtc.warning(() => "\u81EA\u5B9A\u4E49\u6D88\u606F\u89E3\u7801\u5931\u8D25 (Failed to Decode Custom Message)");
          return;
        }
        this.eventListener?.onCustomMessageReceived(
          event.userId,
          message
        );
      }
    );
  }
  /**
   * Returns the current engine or throws if uninitialized.
   */
  requireEngine() {
    const engine = this.lease?.engine;
    if (!engine) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "RTC engine is not initialized"
      );
    }
    return engine;
  }
  /**
   * Maps TRTC failures to SDK errors.
   */
  mapError(error) {
    if (error instanceof XmaxError) {
      return error;
    }
    const rtcError = error;
    const originName = rtcError?.originError?.name ?? "";
    const message = typeof rtcError?.message === "string" && rtcError.message.trim().length > 0 ? rtcError.message.trim() : String(error);
    if (originName === "NotAllowedError" || originName === "SecurityError" || /NotAllowed/i.test(message)) {
      return new XmaxError(
        "CAMERA_PERMISSION_DENIED" /* cameraPermissionDenied */,
        message
      );
    }
    if (originName) {
      return new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        message
      );
    }
    return new XmaxError(
      "RTC_ERROR" /* rtcError */,
      message
    );
  }
};

var VeRtcStatistics = class {
  /**
   * Normalizes local video frame rates, bitrate, and packet loss.
   */
  static local(stats) {
    return Object.freeze({
      width: this.valid(
        stats.encodedFrameWidth,
        1
      ),
      height: this.valid(
        stats.encodedFrameHeight,
        1
      ),
      captureFrameRate: this.valid(stats.inputFrameRate),
      encodeFrameRate: this.valid(stats.encoderOutputFrameRate),
      sendFrameRate: this.valid(stats.sentFrameRate),
      bitrateKbps: this.valid(stats.sentKBitrate),
      packetLossPercent: this.loss(stats.videoLossRate)
    });
  }
  /**
   * Normalizes one remote user's received-video statistics while retaining unavailable metrics.
   */
  static remote(userID, stats) {
    return Object.freeze({
      userID,
      width: this.valid(
        stats.width,
        1
      ),
      height: this.valid(
        stats.height,
        1
      ),
      decodeFrameRate: this.valid(stats.decoderOutputFrameRate),
      renderFrameRate: this.valid(stats.rendererOutputFrameRate),
      bitrateKbps: this.valid(stats.receivedKBitrate),
      packetLossPercent: this.loss(stats.videoLossRate),
      endToEndDelayMs: this.valid(stats.e2eDelay)
    });
  }
  /**
   * Filters missing, nonfinite, and out-of-range statistics.
   */
  static valid(value, minimum = 0) {
    return typeof value === "number" && Number.isFinite(value) && value >= minimum ? value : void 0;
  }
  /**
   * Converts native packet-loss ratios to percentages.
   */
  static loss(value) {
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value * 100 : void 0;
  }
};

var VERTC_APP_ID = "69a177e226e9b90176a86b96";
var VeRtcManager = class {
  /**
   * The lazy VeRTC SDK loader.
   */
  loadSDK;
  /**
   * The loaded VeRTC SDK module.
   */
  sdk;
  /**
   * The current RTC engine.
   */
  engine;
  /**
   * The shared initialization promise preventing duplicate engines.
   */
  initialization;
  /**
   * The lifecycle revision invalidating work after release.
   */
  lifecycle = 0;
  /**
   * The capture revision rejecting late results after switching or stopping.
   */
  captureVersion = 0;
  /**
   * The active camera video track.
   */
  camera;
  /**
   * Whether microphone capture is active.
   */
  microphone = false;
  /**
   * The adapter-owned external-video clone.
   */
  externalVideo;
  /**
   * The adapter-owned external-audio clone.
   */
  externalAudio;
  /**
   * The active room identity and credentials.
   */
  connection;
  /**
   * Whether room entry has completed.
   */
  joined = false;
  /**
   * The room revision invalidating results after leaving.
   */
  roomVersion = 0;
  /**
   * The controller cancelling asynchronous room work on exit.
   */
  roomAbort = new AbortController();
  /**
   * The shared credential-recovery task.
   */
  recovery;
  /**
   * The shared room-join task.
   */
  joining;
  /**
   * Whether updated credentials require rejoining.
   */
  tokenExpired = false;
  /**
   * Whether publication privileges have expired.
   */
  publishPrivilegeExpired = false;
  /**
   * Whether subscription privileges have expired.
   */
  subscribePrivilegeExpired = false;
  /**
   * Whether local video publication is requested.
   */
  videoRequested = false;
  /**
   * Whether local audio publication is requested.
   */
  audioRequested = false;
  /**
   * The current RTC event listener.
   */
  listener;
  /**
   * The remote users known to publish main video.
   */
  publishedVideo = /* @__PURE__ */ new Set();
  /**
   * The remote users known to publish audio.
   */
  publishedAudio = /* @__PURE__ */ new Set();
  /**
   * The users for which video subscription is requested.
   */
  requestedVideo = /* @__PURE__ */ new Set();
  /**
   * The users for which audio subscription is requested.
   */
  requestedAudio = /* @__PURE__ */ new Set();
  /**
   * Per-user playback volumes, from 0 to 100.
   */
  audioVolumes = /* @__PURE__ */ new Map();
  /**
   * Remote audio players indexed by user ID.
   */
  audioPlayers = /* @__PURE__ */ new Map();
  /**
   * The audio-subscription identities rejecting obsolete results.
   */
  audioSubscriptions = /* @__PURE__ */ new Map();
  /**
   * The latest video statistics for each remote user.
   */
  remoteStatistics = /* @__PURE__ */ new Map();
  /**
   * Creates a VeRTC adapter without initializing its engine.
   */
  constructor(options = {}) {
    this.loadSDK = options.loadSDK ?? (() => import("./index.esm.min-DLKHUTGJ.js"));
  }
  /**
   * Whether the VeRTC engine is available.
   */
  get isInitialized() {
    return this.engine !== void 0;
  }
  /**
   * Whether continuous volume control is available; mobile Safari degrades to playback or mute.
   */
  get supportsRemoteAudioVolumeControl() {
    if (typeof navigator === "undefined") {
      return true;
    }
    return !(/iPad|iPhone|iPod/.test(navigator.userAgent) || /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  }
  /**
   * Lazily loads VeRTC and creates a manual-playback engine, sharing concurrent initialization.
   */
  async initialize() {
    if (this.engine) {
      return;
    }
    if (this.initialization) {
      return this.initialization;
    }
    const version = this.lifecycle;
    const operation = (async () => {
      const sdk = await this.loadSDK();
      if (version !== this.lifecycle) {
        throw this.cancelled();
      }
      sdk.default.setLogConfig({ logLevel: "none" });
      const engine = sdk.default.createEngine(
        VERTC_APP_ID,
        { autoPlayPolicy: sdk.RTCAutoPlayPolicy.PLAY_MANUALLY }
      );
      this.sdk = sdk;
      this.engine = engine;
      this.registerEvents(engine);
    })();
    this.initialization = operation;
    try {
      await operation;
    } finally {
      if (this.initialization === operation) {
        this.initialization = void 0;
      }
    }
  }
  /**
   * Destroys the engine and releases adapter-owned tracks and players.
   */
  async destroy() {
    this.lifecycle++;
    this.captureVersion++;
    const engine = this.engine;
    const sdk = this.sdk;
    this.clearRoom();
    this.engine = void 0;
    this.sdk = void 0;
    this.camera = void 0;
    this.microphone = false;
    engine?.removeAllListeners();
    try {
      if (engine && sdk) {
        sdk.default.destroyEngine(engine);
      }
    } finally {
      this.externalVideo?.stop();
      this.externalAudio?.stop();
      this.externalVideo = void 0;
      this.externalAudio = void 0;
    }
  }
  /**
   * Binds cloned external tracks to the main stream without device capture or automatic publication.
   */
  async setExternalMediaTracks(tracks) {
    const engine = this.requireEngine();
    const sdk = this.sdk;
    if (this.camera || this.microphone || this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Release the current local media before attaching external tracks"
      );
    }
    if (tracks.videoTrack.kind !== "video" || tracks.videoTrack.readyState !== "live" || tracks.audioTrack && (tracks.audioTrack.kind !== "audio" || tracks.audioTrack.readyState !== "live")) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "External media tracks must be live video/audio tracks"
      );
    }
    const video = tracks.videoTrack.clone();
    this.externalVideo = video;
    let audio;
    const index = sdk.StreamIndex.STREAM_INDEX_MAIN;
    const ensureCurrent = () => {
      if (this.engine !== engine || this.externalVideo !== video) {
        throw this.cancelled();
      }
    };
    try {
      audio = tracks.audioTrack?.clone();
      this.externalAudio = audio;
      await engine.setVideoSourceType(
        index,
        sdk.VideoSourceType.VIDEO_SOURCE_TYPE_EXTERNAL
      );
      ensureCurrent();
      await engine.setExternalVideoTrack(
        index,
        video
      );
      ensureCurrent();
      if (audio) {
        await engine.setAudioSourceType(
          index,
          sdk.AudioSourceType.AUDIO_SOURCE_TYPE_EXTERNAL
        );
        ensureCurrent();
        await engine.setExternalAudioTrack(
          index,
          audio
        );
        ensureCurrent();
      }
    } catch (error) {
      if (this.engine === engine) {
        await engine.setAudioSourceType(
          index,
          sdk.AudioSourceType.AUDIO_SOURCE_TYPE_INTERNAL
        ).catch(() => {
        });
        await engine.setVideoSourceType(
          index,
          sdk.VideoSourceType.VIDEO_SOURCE_TYPE_INTERNAL
        ).catch(() => {
        });
      }
      if (this.externalVideo === video) {
        this.externalVideo = void 0;
        this.externalAudio = void 0;
      }
      video.stop();
      audio?.stop();
      throw this.mapError(error);
    }
  }
  /**
   * Starts camera capture without publication; nonzero rotation is unsupported.
   */
  async startCameraCapture(options) {
    if (options.rotation !== void 0 && options.rotation !== 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera rotation currently requires Agora"
      );
    }
    const engine = this.requireEngine();
    if (this.camera || this.externalVideo) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local video is already prepared"
      );
    }
    const version = ++this.captureVersion;
    await this.run(() => engine.setVideoEncoderConfig({
      ...rtcOrientedVideoSize({
        width: options.width,
        height: options.height
      }),
      frameRate: options.frameRate,
      maxKbps: 1e3,
      preferCodecName: this.sdk.VideoCodecType.H264,
      contentHint: "motion"
    }));
    if (engine !== this.engine || version !== this.captureVersion) {
      throw this.cancelled();
    }
    try {
      await engine.startVideoCapture(options.position === "front" /* front */ ? "user" : "environment");
      if (engine !== this.engine || version !== this.captureVersion) {
        await engine.stopVideoCapture().catch(() => {
        });
        throw this.cancelled();
      }
      const track = engine.getLocalStreamTrack(
        this.sdk.StreamIndex.STREAM_INDEX_MAIN,
        "video"
      );
      if (!track) {
        await engine.stopVideoCapture();
        throw new XmaxError(
          "RTC_ERROR" /* rtcError */,
          "VeRTC camera track is unavailable"
        );
      }
      this.camera = track;
      return track;
    } catch (error) {
      throw this.mapError(
        error,
        "CAMERA_PERMISSION_DENIED" /* cameraPermissionDenied */
      );
    }
  }
  /**
   * Updates disconnected capture settings while retaining the engine and device.
   */
  async updateCameraCapture(options) {
    const engine = this.requireEngine();
    this.requireCamera();
    if (this.connection) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Disconnect VeRTC before updating camera capture"
      );
    }
    const version = this.captureVersion;
    const size = rtcOrientedVideoSize(options);
    await this.run(() => engine.setVideoEncoderConfig({
      width: size.width,
      height: size.height,
      frameRate: options.frameRate,
      maxKbps: 1e3,
      preferCodecName: this.sdk.VideoCodecType.H264,
      contentHint: "motion"
    }));
    if (engine !== this.engine || version !== this.captureVersion) {
      throw this.cancelled();
    }
    const track = engine.getLocalStreamTrack(
      this.sdk.StreamIndex.STREAM_INDEX_MAIN,
      "video"
    );
    if (!track) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "VeRTC camera track is unavailable"
      );
    }
    this.camera = track;
    return track;
  }
  /**
   * Switches cameras and returns the resulting video track.
   */
  async switchCameraCapture(to) {
    const engine = this.requireEngine();
    this.requireCamera();
    const version = this.captureVersion;
    await this.run(() => engine.setVideoCaptureDevice(to === "front" /* front */ ? "user" : "environment"));
    if (engine !== this.engine || version !== this.captureVersion) {
      throw this.cancelled();
    }
    const track = engine.getLocalStreamTrack(
      this.sdk.StreamIndex.STREAM_INDEX_MAIN,
      "video"
    );
    if (!track) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "VeRTC camera track is unavailable"
      );
    }
    this.camera = track;
    return track;
  }
  /**
   * Stops camera capture and clears its track reference.
   */
  async stopCameraCapture() {
    if (this.externalVideo) {
      return;
    }
    this.captureVersion++;
    this.camera = void 0;
    if (this.engine) {
      await this.run(() => this.engine.stopVideoCapture());
    }
  }
  /**
   * Applies oriented video dimensions, frame rate, and bitrate limits to the encoder.
   */
  async configureVideoEncoding(config) {
    const engine = this.requireEngine();
    this.requireLocalVideo();
    const size = this.externalVideo ? config : rtcOrientedVideoSize(config);
    await this.run(() => engine.setVideoEncoderConfig({
      width: size.width,
      height: size.height,
      frameRate: config.frameRate,
      maxKbps: config.maximumBitrate,
      contentHint: config.encoderPreference === "maintainFramerate" /* maintainFramerate */ ? "motion" : "detail",
      preferCodecName: this.sdk.VideoCodecType.H264
    }));
  }
  /**
   * Joins with current session credentials, sharing concurrent join operations.
   */
  async joinRoom(config) {
    await this.joining?.catch(() => {
    });
    await this.recovery?.catch(() => {
    });
    const engine = this.requireEngine();
    if (config.provider !== "vertc" /* vertc */ || config.appID !== VERTC_APP_ID || this.connection) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "VeRTC credentials for the configured AppID and an idle room are required"
      );
    }
    this.clearRoom();
    this.connection = config;
    const version = this.roomVersion;
    const task = this.performJoin(
      engine,
      config,
      version
    );
    this.joining = task;
    try {
      await task;
    } finally {
      if (this.joining === task) {
        this.joining = void 0;
      }
    }
  }
  /**
   * Completes room entry and leaves a room created after cancellation.
   */
  async performJoin(engine, config, version) {
    try {
      await this.enter(
        engine,
        config
      );
      if (!this.isCurrent(
        engine,
        version
      )) {
        await engine.leaveRoom().catch(() => {
        });
        throw this.cancelled();
      }
      this.joined = true;
      this.replayVideo();
    } catch (error) {
      if (this.isCurrent(
        engine,
        version
      )) {
        this.clearRoom();
      }
      throw this.mapError(error);
    }
  }
  /**
   * Joins through VeRTC with automatic publication and subscription disabled.
   */
  enter(engine, config) {
    return this.run(() => engine.joinRoom(
      config.roomToken,
      config.roomID,
      { userId: config.userID },
      {
        isAutoPublish: false,
        isAutoSubscribeAudio: false,
        isAutoSubscribeVideo: false,
        roomProfileType: this.sdk.RoomProfileType.communication
      }
    ));
  }
  /**
   * Leaves the room and clears subscriptions, players, and statistics.
   */
  async leaveRoom() {
    const engine = this.engine;
    this.clearRoom();
    if (engine) {
      await this.run(() => engine.leaveRoom());
    }
  }
  /**
   * Renews valid tokens or rejoins after removal, restoring publication and subscription intent.
   */
  async updateCredentials(config, signal) {
    const engine = this.requireEngine();
    const current = this.connection;
    if (signal?.aborted) {
      throw this.cancelled();
    }
    if (!current || config.provider !== "vertc" /* vertc */ || config.appID !== current.appID || config.roomID !== current.roomID || config.userID !== current.userID) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "VeRTC session binding changed"
      );
    }
    const version = this.roomVersion;
    if (this.recovery) {
      await this.cancellable(
        this.recovery,
        signal
      );
    }
    if (!this.isCurrent(
      engine,
      version
    )) {
      throw this.cancelled();
    }
    const task = this.renew(
      engine,
      config,
      version
    );
    this.recovery = task;
    void task.finally(() => {
      if (this.recovery === task) {
        this.recovery = void 0;
      }
    }).catch(() => {
    });
    await this.cancellable(
      task,
      signal
    );
  }
  /**
   * Updates credentials and restores room membership and media intent when necessary.
   */
  async renew(engine, config, version) {
    if (!this.tokenExpired) {
      try {
        await this.run(() => engine.updateToken(config.roomToken));
      } catch (error) {
        this.ensureCurrent(
          engine,
          version
        );
        if (!this.tokenExpired) {
          throw error;
        }
      }
    }
    this.ensureCurrent(
      engine,
      version
    );
    const restore = this.tokenExpired || this.publishPrivilegeExpired || this.subscribePrivilegeExpired;
    if (restore) {
      this.joined = false;
      this.listener?.onRoomRejoining?.();
      this.clearPlayers();
      this.clearStatistics();
      if (this.tokenExpired) {
        this.publishedVideo.clear();
        this.publishedAudio.clear();
        await this.run(() => engine.leaveRoom());
        this.ensureCurrent(
          engine,
          version
        );
        await this.enter(
          engine,
          config
        );
        if (!this.isCurrent(
          engine,
          version
        )) {
          await engine.leaveRoom().catch(() => {
          });
          throw this.cancelled();
        }
      }
      if ((this.tokenExpired || this.publishPrivilegeExpired) && this.videoRequested && (this.camera || this.externalVideo)) {
        await this.run(() => engine.publishStream(this.sdk.MediaType.VIDEO));
        this.ensureCurrent(
          engine,
          version
        );
        if (!this.videoRequested) {
          await this.run(() => engine.unpublishStream(this.sdk.MediaType.VIDEO));
          this.ensureCurrent(
            engine,
            version
          );
        }
      }
      if ((this.tokenExpired || this.publishPrivilegeExpired) && this.audioRequested && (this.microphone || this.externalAudio)) {
        await this.run(() => engine.publishStream(this.sdk.MediaType.AUDIO));
        this.ensureCurrent(
          engine,
          version
        );
        if (!this.audioRequested) {
          await this.run(() => engine.unpublishStream(this.sdk.MediaType.AUDIO));
          this.ensureCurrent(
            engine,
            version
          );
        }
      }
    }
    this.connection = config;
    this.tokenExpired = false;
    this.publishPrivilegeExpired = false;
    this.subscribePrivilegeExpired = false;
    this.joined = true;
    if (restore) {
      this.replayVideo();
      for (const userID of this.requestedAudio) {
        if (this.publishedAudio.has(userID)) {
          await this.subscribeRemoteAudio(
            userID,
            true
          );
        }
        this.ensureCurrent(
          engine,
          version
        );
      }
    }
  }
  /**
   * Publishes the prepared local video track.
   */
  async publishLocalVideo() {
    const engine = this.requireEngine();
    this.requireLocalVideo();
    this.videoRequested = true;
    const version = this.roomVersion;
    await this.recovery;
    this.ensureCurrent(
      engine,
      version
    );
    if (!this.videoRequested) {
      throw this.cancelled();
    }
    await this.run(() => engine.publishStream(this.sdk.MediaType.VIDEO));
  }
  /**
   * Unpublishes video while retaining the local source.
   */
  async unpublishLocalVideo() {
    this.videoRequested = false;
    if (this.joined && !this.tokenExpired) {
      await this.run(() => this.requireEngine().unpublishStream(this.sdk.MediaType.VIDEO));
    }
  }
  /**
   * Publishes external audio or starts and publishes microphone input in device-capture mode.
   */
  async publishLocalAudio() {
    const engine = this.requireEngine();
    if (this.externalVideo && !this.externalAudio) {
      return;
    }
    this.audioRequested = true;
    const version = this.roomVersion;
    await this.recovery;
    this.ensureCurrent(
      engine,
      version
    );
    try {
      if (!this.externalVideo && !this.microphone) {
        await engine.startAudioCapture();
        if (!this.isCurrent(
          engine,
          version
        )) {
          await engine.stopAudioCapture().catch(() => {
          });
          throw this.cancelled();
        }
        this.microphone = true;
      }
      if (!this.audioRequested) {
        throw this.cancelled();
      }
      await engine.publishStream(this.sdk.MediaType.AUDIO);
    } catch (error) {
      throw this.mapError(
        error,
        this.externalVideo ? "RTC_ERROR" /* rtcError */ : "MICROPHONE_PERMISSION_DENIED" /* microphonePermissionDenied */
      );
    }
  }
  /**
   * Unpublishes audio while retaining prepared media resources.
   */
  async unpublishLocalAudio() {
    this.audioRequested = false;
    if (this.joined && !this.tokenExpired) {
      await this.run(() => this.requireEngine().unpublishStream(this.sdk.MediaType.AUDIO));
    }
  }
  /**
   * Changes a user's video subscription and returns its subscribed main-video track.
   */
  async subscribeRemoteVideo(userID, subscribe) {
    const engine = this.requireEngine();
    const version = this.roomVersion;
    if (!subscribe) {
      this.requestedVideo.delete(userID);
      this.remoteStatistics.delete(userID);
      this.emitRemoteStatistics();
      if (this.joined && !this.tokenExpired) {
        await this.run(() => engine.unsubscribeStream(
          userID,
          this.sdk.MediaType.VIDEO
        ));
      }
      return;
    }
    this.requestedVideo.add(userID);
    await this.run(() => engine.subscribeStream(
      userID,
      this.sdk.MediaType.VIDEO
    ));
    this.ensureCurrent(
      engine,
      version
    );
    if (!this.requestedVideo.has(userID)) {
      return;
    }
    const track = engine.getRemoteStreamTrack(
      userID,
      this.sdk.StreamIndex.STREAM_INDEX_MAIN,
      "video"
    );
    if (!track) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "VeRTC remote video track is unavailable"
      );
    }
    return track;
  }
  /**
   * Changes a user's audio subscription and binds playback using the current volume.
   */
  async subscribeRemoteAudio(userID, subscribe) {
    const engine = this.requireEngine();
    const version = this.roomVersion;
    if (!subscribe) {
      this.requestedAudio.delete(userID);
      this.clearPlayer(userID);
      if (this.joined && !this.tokenExpired && this.publishedAudio.has(userID)) {
        await this.run(() => engine.unsubscribeStream(
          userID,
          this.sdk.MediaType.AUDIO
        ));
      }
      return;
    }
    this.requestedAudio.add(userID);
    if (!this.joined || this.tokenExpired || !this.publishedAudio.has(userID)) {
      return;
    }
    const subscription = {};
    this.audioSubscriptions.set(
      userID,
      subscription
    );
    await this.run(() => engine.subscribeStream(
      userID,
      this.sdk.MediaType.AUDIO
    ));
    if (!this.isCurrent(
      engine,
      version
    ) || !this.joined || this.tokenExpired || this.audioSubscriptions.get(userID) !== subscription || !this.requestedAudio.has(userID) || !this.publishedAudio.has(userID)) {
      return;
    }
    const track = engine.getRemoteStreamTrack(
      userID,
      this.sdk.StreamIndex.STREAM_INDEX_MAIN,
      "audio"
    );
    if (!track) {
      return;
    }
    this.clearPlayer(userID);
    const player = document.createElement("audio");
    player.srcObject = new MediaStream([track]);
    this.audioPlayers.set(
      userID,
      player
    );
    this.applyAudioVolume(userID);
    this.listener?.onRemoteAudioTrackChanged?.(userID);
  }
  /**
   * Returns original remote audio independently of element muting or playback volume.
   */
  getRemoteAudioTrack(userID) {
    if (!this.publishedAudio.has(userID)) {
      return void 0;
    }
    return this.requireEngine().getRemoteStreamTrack(
      userID,
      this.sdk.StreamIndex.STREAM_INDEX_MAIN,
      "audio"
    );
  }
  /**
   * Sets a user's playback volume from 0 to 100.
   */
  setRemoteAudioVolume(volume, userID) {
    this.audioVolumes.set(
      userID,
      Number.isFinite(volume) ? Math.max(0, Math.min(100, Math.round(volume))) : 0
    );
    this.applyAudioVolume(userID);
  }
  /**
   * Applies volume to a remote player, using playback/mute when continuous volume is unavailable.
   */
  applyAudioVolume(userID) {
    const player = this.audioPlayers.get(userID);
    if (!player) {
      return;
    }
    const volume = this.audioVolumes.get(userID) ?? 0;
    player.muted = volume === 0 || !this.requestedAudio.has(userID);
    if (this.supportsRemoteAudioVolumeControl) {
      player.volume = volume / 100;
    }
    if (player.muted) {
      player.pause();
    } else {
      void player.play().catch(() => {
        XmaxLogger.rtc.warning(() => "VeRTC audio playback requires a user interaction");
      });
    }
  }
  /**
   * Sends room text with a byte limit and bounded completion wait.
   */
  async sendRoomMessage(message, _delivery, signal) {
    if (signal?.aborted) {
      throw this.cancelled();
    }
    const engine = this.requireEngine();
    const version = this.roomVersion;
    if (!this.joined || this.tokenExpired) {
      throw this.cancelled();
    }
    if (new TextEncoder().encode(message).byteLength > 64 * 1024) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "VeRTC room message exceeds the 64-KiB limit"
      );
    }
    await this.cancellable(
      this.run(async () => {
        const sent = engine.sendRoomMessage(message);
        if (!sent) {
          throw new XmaxError(
            "RTC_ERROR" /* rtcError */,
            "VeRTC room message was not sent"
          );
        }
        await sent;
      }),
      signal,
      5e3
    );
    this.ensureCurrent(
      engine,
      version
    );
  }
  /**
   * Replaces the RTC event listener.
   */
  setEventListener(listener) {
    this.listener = listener;
  }
  /**
   * Bridges VeRTC publication, subscription, and statistics events.
   */
  registerEvents(engine) {
    const events = this.sdk.default.events;
    const active = () => engine === this.engine && this.connection !== void 0;
    const mediaActive = () => active() && this.joined && !this.tokenExpired;
    const video = (mediaType) => (mediaType & this.sdk.MediaType.VIDEO) !== 0;
    const audio = (mediaType) => (mediaType & this.sdk.MediaType.AUDIO) !== 0;
    engine.on(
      events.onUserPublishStream,
      ({ userId, mediaType }) => {
        if (!active()) {
          return;
        }
        if (video(mediaType)) {
          this.publishedVideo.add(userId);
          if (mediaActive()) {
            this.listener?.onRemoteVideoPublished(
              userId,
              true
            );
          }
        }
        if (audio(mediaType)) {
          this.publishedAudio.add(userId);
          if (mediaActive() && this.requestedAudio.has(userId)) {
            void this.subscribeRemoteAudio(
              userId,
              true
            ).catch((error) => {
              if (mediaActive()) {
                this.listener?.onError?.(this.mapError(error));
              }
            });
          }
        }
      }
    );
    engine.on(
      events.onUserUnpublishStream,
      ({ userId, mediaType }) => {
        if (!active()) {
          return;
        }
        if (video(mediaType)) {
          this.removeVideo(userId);
        }
        if (audio(mediaType)) {
          this.publishedAudio.delete(userId);
          this.clearPlayer(userId);
          this.listener?.onRemoteAudioTrackChanged?.(userId);
        }
      }
    );
    engine.on(
      events.onUserLeave,
      ({ userInfo }) => {
        if (!active()) {
          return;
        }
        this.removeVideo(userInfo.userId);
        this.publishedAudio.delete(userInfo.userId);
        this.clearPlayer(userInfo.userId);
      }
    );
    engine.on(
      events.onRoomMessageReceived,
      ({ userId, message }) => {
        if (mediaActive() && typeof message === "string") {
          this.listener?.onCustomMessageReceived(
            userId,
            message
          );
        }
      }
    );
    const willExpire = () => {
      if (active()) {
        this.listener?.onTokenWillExpire?.();
      }
    };
    engine.on(
      events.onTokenWillExpire,
      willExpire
    );
    engine.on(
      events.onTokenPublishPrivilegeWillExpire,
      willExpire
    );
    engine.on(
      events.onTokenSubscribePrivilegeWillExpire,
      willExpire
    );
    engine.on(
      events.onTokenPublishPrivilegeDidExpired,
      () => {
        if (!active() || this.publishPrivilegeExpired) {
          return;
        }
        this.publishPrivilegeExpired = true;
        this.listener?.onTokenExpired?.();
      }
    );
    engine.on(
      events.onTokenSubscribePrivilegeDidExpired,
      () => {
        if (!active() || this.subscribePrivilegeExpired) {
          return;
        }
        this.subscribePrivilegeExpired = true;
        this.clearPlayers();
        this.listener?.onTokenExpired?.();
      }
    );
    engine.on(
      events.onError,
      ({ errorCode }) => {
        if (!active()) {
          return;
        }
        if (errorCode === "TOKEN_EXPIRED") {
          if (this.tokenExpired) {
            return;
          }
          this.tokenExpired = true;
          this.clearPlayers();
          this.listener?.onTokenExpired?.();
        } else {
          this.listener?.onError?.(this.mapError({ code: errorCode }));
        }
      }
    );
    engine.on(
      events.onConnectionStateChanged,
      ({ state: state2 }) => {
        if (!mediaActive() || state2 !== this.sdk.ConnectionState.CONNECTION_STATE_RECONNECTED) {
          return;
        }
        this.listener?.onRoomRejoining?.();
        this.clearPlayers();
        this.clearStatistics();
        this.replayVideo();
        for (const userID of this.requestedAudio) {
          void this.subscribeRemoteAudio(
            userID,
            true
          ).catch((error) => {
            if (mediaActive()) {
              this.listener?.onError?.(this.mapError(error));
            }
          });
        }
      }
    );
    engine.on(
      events.onNetworkQuality,
      (up, down) => {
        if (mediaActive()) {
          const quality = Object.freeze({
            uplink: networkQualityLevel(up),
            downlink: networkQualityLevel(down)
          });
          this.listener?.onNetworkStatistics?.(quality);
          RtcStatsLogger.logNetworkQuality(quality);
        }
      }
    );
    engine.on(
      events.onLocalStreamStats,
      (stats) => {
        if (!mediaActive() || stats.isScreen || !this.videoRequested) {
          return;
        }
        const result = VeRtcStatistics.local(stats.videoStats);
        this.listener?.onLocalVideoStatistics?.(result);
        RtcStatsLogger.logUplinkVideoStatistics(result);
      }
    );
    engine.on(
      events.onRemoteStreamStats,
      (stats) => {
        if (!mediaActive() || stats.isScreen || !this.requestedVideo.has(stats.userId)) {
          return;
        }
        const result = VeRtcStatistics.remote(
          stats.userId,
          stats.videoStats
        );
        this.remoteStatistics.set(
          stats.userId,
          result
        );
        RtcStatsLogger.logDownlinkVideoStatistics(result);
        this.emitRemoteStatistics();
      }
    );
  }
  /**
   * Replays known remote-video publication states.
   */
  replayVideo() {
    for (const userID of this.publishedVideo) {
      this.listener?.onRemoteVideoPublished(
        userID,
        true
      );
    }
  }
  /**
   * Removes a remote-video publisher and its statistics.
   */
  removeVideo(userID) {
    this.publishedVideo.delete(userID);
    this.remoteStatistics.delete(userID);
    this.emitRemoteStatistics();
    if (this.joined && !this.tokenExpired) {
      this.listener?.onRemoteVideoPublished(
        userID,
        false
      );
    }
  }
  /**
   * Delivers an immutable snapshot of current remote-video statistics.
   */
  emitRemoteStatistics() {
    this.listener?.onRemoteVideoStatistics?.(Object.freeze([...this.remoteStatistics.values()]));
  }
  /**
   * Clears video statistics and reports unavailable samples.
   */
  clearStatistics() {
    this.remoteStatistics.clear();
    this.listener?.onLocalVideoStatistics?.(void 0);
    this.emitRemoteStatistics();
  }
  /**
   * Releases one remote user's audio player.
   */
  clearPlayer(userID) {
    this.audioSubscriptions.delete(userID);
    const player = this.audioPlayers.get(userID);
    if (player) {
      player.pause();
      player.srcObject = null;
    }
    this.audioPlayers.delete(userID);
  }
  /**
   * Releases every remote player and subscription identity.
   */
  clearPlayers() {
    this.audioSubscriptions.clear();
    for (const userID of this.audioPlayers.keys()) {
      this.clearPlayer(userID);
    }
  }
  /**
   * Invalidates room operations and clears authentication, media intent, and subscription state.
   */
  clearRoom() {
    this.roomVersion++;
    this.roomAbort.abort();
    this.roomAbort = new AbortController();
    this.connection = void 0;
    this.joined = false;
    this.tokenExpired = false;
    this.publishPrivilegeExpired = false;
    this.subscribePrivilegeExpired = false;
    this.videoRequested = false;
    this.audioRequested = false;
    this.publishedVideo.clear();
    this.publishedAudio.clear();
    this.requestedVideo.clear();
    this.requestedAudio.clear();
    this.audioVolumes.clear();
    this.clearPlayers();
    this.clearStatistics();
  }
  /**
   * Ends app waits promptly on cancellation while revision checks handle late native results.
   */
  async cancellable(task, signal, timeoutMs) {
    const roomSignal = this.roomAbort.signal;
    return new Promise((resolve, reject) => {
      const timer = timeoutMs === void 0 ? void 0 : setTimeout(
        () => {
          cleanup();
          reject(new XmaxError(
            "TIMEOUT" /* timeout */,
            "VeRTC room message send timed out"
          ));
        },
        timeoutMs
      );
      const cleanup = () => {
        clearTimeout(timer);
        roomSignal.removeEventListener(
          "abort",
          cancel
        );
        signal?.removeEventListener(
          "abort",
          cancel
        );
      };
      const cancel = () => {
        if (signal?.aborted && !roomSignal.aborted) {
          this.roomVersion++;
        }
        cleanup();
        reject(this.cancelled());
      };
      roomSignal.addEventListener(
        "abort",
        cancel,
        { once: true }
      );
      signal?.addEventListener(
        "abort",
        cancel,
        { once: true }
      );
      task.then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (error) => {
          cleanup();
          reject(error);
        }
      );
      if (roomSignal.aborted || signal?.aborted) {
        cancel();
      }
    });
  }
  /**
   * Checks whether an engine and room revision are current.
   */
  isCurrent(engine, version) {
    return this.engine === engine && this.connection !== void 0 && this.roomVersion === version;
  }
  /**
   * Throws cancellation when a room operation is obsolete.
   */
  ensureCurrent(engine, version) {
    if (!this.isCurrent(
      engine,
      version
    )) {
      throw this.cancelled();
    }
  }
  /**
   * Returns the initialized engine or throws an RTC error.
   */
  requireEngine() {
    if (!this.engine) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "VeRTC is not initialized"
      );
    }
    return this.engine;
  }
  /**
   * Returns a prepared external or camera video track.
   */
  requireLocalVideo() {
    if (this.externalVideo) {
      return this.externalVideo;
    }
    return this.requireCamera();
  }
  /**
   * Returns the active camera track or throws a configuration error.
   */
  requireCamera() {
    if (!this.camera) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera capture is not running"
      );
    }
    return this.camera;
  }
  /**
   * Runs asynchronous VeRTC work and normalizes native failures.
   */
  async run(operation) {
    try {
      return await operation();
    } catch (error) {
      throw this.mapError(error);
    }
  }
  /**
   * Maps native failures to permission or RTC errors as appropriate.
   */
  mapError(error, permissionCode) {
    if (error instanceof XmaxError) {
      return error;
    }
    const value = error;
    const code = typeof value?.code === "string" && /^[A-Z_0-9-]{1,64}$/.test(value.code) ? value.code : "UNKNOWN";
    const denied = value?.name === "NotAllowedError" || code === "PERMISSION_DENIED" || code === "DEVICE_PERMISSION_DENIED";
    return new XmaxError(
      permissionCode && denied ? permissionCode : "RTC_ERROR" /* rtcError */,
      `VeRTC operation failed (${code})`
    );
  }
  /**
   * Creates the error for a cancelled RTC operation.
   */
  cancelled() {
    return new XmaxError(
      "CANCELLED" /* cancelled */,
      "VeRTC operation was cancelled"
    );
  }
};

function createRtcManager(provider, environment) {
  switch (provider) {
    case "trtc" /* trtc */:
      return new TrtcRtcManager();
    case "agora" /* agora */:
      return new AgoraRtcManager({ environment });
    case "vertc" /* vertc */:
      return new VeRtcManager();
    default:
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Unsupported RTC provider"
      );
  }
}

function alignedVideoSize(size, scale, alignment) {
  const { width, height } = size;
  if (![width, height, alignment].every((value) => Number.isSafeInteger(value) && value > 0) || !Number.isFinite(scale) || scale <= 0 || scale > 1) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "Invalid video size or alignment"
    );
  }
  let divisor = width;
  let remainder = height;
  while (remainder !== 0) {
    [divisor, remainder] = [remainder, divisor % remainder];
  }
  const units = Math.floor(divisor * scale / alignment) * alignment;
  if (units >= alignment) {
    return {
      width: width / divisor * units,
      height: height / divisor * units
    };
  }
  const alignedWidth = Math.floor(width * scale / alignment) * alignment;
  const alignedHeight = Math.floor(height * scale / alignment) * alignment;
  if (alignedWidth < alignment || alignedHeight < alignment) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "No aligned video size is available within the size limits"
    );
  }
  return {
    width: alignedWidth,
    height: alignedHeight
  };
}

var PERMISSION_POLL_INTERVAL_MS = 100;
async function watchMediaPermissionPrompt(includeMicrophone) {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return void 0;
  }
  const names = ["camera", ...includeMicrophone ? ["microphone"] : []];
  const queryOnce = () => Promise.all(
    names.map(async (name) => {
      const status = await navigator.permissions.query({
        name
      });
      return status.state;
    })
  );
  const queryStates = () => Promise.all(
    names.map(async (name) => {
      try {
        const status = await navigator.permissions.query({
          name
        });
        return status.state;
      } catch {
        return "prompt";
      }
    })
  );
  let states;
  try {
    states = await queryOnce();
  } catch {
    return void 0;
  }
  if (states.every((state2) => state2 === "granted")) {
    return {
      decided: Promise.resolve(),
      /**
       * Completes cleanup without work because no observer was allocated.
       */
      dispose() {
      }
    };
  }
  if (!states.includes("prompt")) {
    return void 0;
  }
  let disposed = false;
  let resolveDecided;
  const decided = new Promise((resolve) => {
    resolveDecided = resolve;
  });
  const finishIfDecided = (current) => {
    if (disposed || current.includes("prompt")) {
      return;
    }
    dispose();
    resolveDecided();
  };
  const poll = setInterval(
    () => {
      void queryStates().then(finishIfDecided);
    },
    PERMISSION_POLL_INTERVAL_MS
  );
  function dispose() {
    disposed = true;
    clearInterval(poll);
  }
  return {
    decided,
    dispose
  };
}

var RESERVED_PARAMS = /* @__PURE__ */ new Set([
  "model",
  "face_replace",
  "size",
  "target_size",
  "prompt",
  "ref_image_path",
  "mirror",
  "min_bitrate",
  "max_bitrate",
  "padding"
]);
function snapshotExtraParams(params) {
  if (params === void 0) {
    return void 0;
  }
  const invalid2 = (message) => {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      message
    );
  };
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return invalid2("extraParams must be a JSON object");
  }
  for (const key of Object.keys(params)) {
    if (RESERVED_PARAMS.has(key)) {
      return invalid2(`extraParams conflicts with SDK parameter: ${key}`);
    }
  }
  const ancestors = /* @__PURE__ */ new Set();
  const validate = (value) => {
    if (value === null || typeof value === "string" || typeof value === "boolean") {
      return;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return;
    }
    if (typeof value !== "object" || !value) {
      return invalid2("extraParams must contain only JSON values");
    }
    if (ancestors.has(value)) {
      return invalid2("extraParams must not contain circular references");
    }
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
      return invalid2("extraParams must contain only JSON objects and arrays");
    }
    if (Object.getOwnPropertySymbols(value).length) {
      return invalid2("extraParams must not contain symbol keys");
    }
    ancestors.add(value);
    for (const child of Array.isArray(value) ? value : Object.values(value)) {
      validate(child);
    }
    ancestors.delete(value);
  };
  validate(params);
  return JSON.parse(JSON.stringify(params));
}

var REMOTE_AUDIO_WORKLET = `
class XmaxRemoteAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.channels = 0;
    this.filled = 0;
    this.startFrame = 0;
    this.nextFrame = undefined;
    this.discontinuous = true;
    this.packetSamples = Math.max(1, Math.round(sampleRate * 0.02));
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input.length || !input[0].length) {
      this.filled = 0;
      this.nextFrame = undefined;
      this.discontinuous = true;
      return true;
    }
    const channels = Math.min(2, input.length);
    if (channels !== this.channels || this.nextFrame !== currentFrame) {
      this.channels = channels;
      this.filled = 0;
      this.bytes = new ArrayBuffer(this.packetSamples * channels * 2);
      this.data = new DataView(this.bytes);
      this.discontinuous = true;
    }
    for (let i = 0; i < input[0].length; i++) {
      if (this.filled === 0) this.startFrame = currentFrame + i;
      for (let channel = 0; channel < channels; channel++) {
        const value = Math.max(-1, Math.min(1, input[channel][i] || 0));
        this.data.setInt16((this.filled * channels + channel) * 2,
          Math.round(value < 0 ? value * 32768 : value * 32767), true);
      }
      if (++this.filled === this.packetSamples) {
        this.port.postMessage({ data: this.bytes, sampleRate, channels,
          samplesPerChannel: this.packetSamples, frameIndex: this.startFrame,
          discontinuous: this.discontinuous }, [this.bytes]);
        this.bytes = new ArrayBuffer(this.packetSamples * channels * 2);
        this.data = new DataView(this.bytes);
        this.filled = 0;
        this.discontinuous = false;
      }
    }
    this.nextFrame = currentFrame + input[0].length;
    return true;
  }
}
registerProcessor("xmax-remote-audio", XmaxRemoteAudioProcessor);
`;

var RemoteAudioFrameSource = class {
  /**
   * The audio context owning the current input graph.
   */
  context;
  /**
   * The current input track's audio source node.
   */
  source;
  /**
   * The worklet copying PCM samples.
   */
  processor;
  /**
   * The silent output node keeping the audio graph active.
   */
  silence;
  /**
   * The borrowed input audio track, whose listeners are removed during cleanup.
   */
  track;
  /**
   * The callback stopping PCM observation when the current track ends.
   */
  onEnded;
  /**
   * The expected next presentation timestamp.
   */
  nextPTS;
  /**
   * The previous packet's sample rate and channel count.
   */
  format;
  /**
   * Prepares audio processing from a user gesture and releases allocated resources on failure or
   * cancellation.
   */
  async prepare(signal) {
    if (typeof AudioContext === "undefined" || typeof AudioWorkletNode === "undefined") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Remote PCM frames require AudioWorklet support"
      );
    }
    const context = new AudioContext();
    this.context = context;
    let url;
    try {
      if (!context.audioWorklet) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "Remote PCM frames require a secure context with AudioWorklet"
        );
      }
      const resumed = context.resume();
      url = URL.createObjectURL(new Blob(
        [REMOTE_AUDIO_WORKLET],
        { type: "text/javascript" }
      ));
      await this.wait(
        Promise.all([resumed, context.audioWorklet.addModule(url)]).then(() => {
        }),
        signal
      );
      if (context.state !== "running") {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "Start remote media observation from a user gesture to unlock audio"
        );
      }
    } catch (error) {
      await this.close();
      throw error;
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  }
  /**
   * Replaces the original input track, invalidating obsolete node messages without synthesizing PCM when
   * audio is absent.
   */
  setTrack(track, listener) {
    this.disconnect();
    const context = this.context;
    if (!context || !track || track.readyState === "ended") {
      return;
    }
    this.track = track;
    this.onEnded = () => this.disconnect();
    track.addEventListener(
      "ended",
      this.onEnded,
      { once: true }
    );
    const source = context.createMediaStreamSource(new MediaStream([track]));
    this.source = source;
    const processor = new AudioWorkletNode(
      context,
      "xmax-remote-audio",
      {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        channelCount: 2,
        channelCountMode: "max"
      }
    );
    this.processor = processor;
    const silence = context.createGain();
    this.silence = silence;
    silence.gain.value = 0;
    processor.port.onmessage = (event) => {
      if (this.processor !== processor || context.state !== "running") {
        return;
      }
      const packet = this.convert(
        event.data,
        context
      );
      if (packet) {
        listener(packet);
      }
    };
    source.connect(processor);
    processor.connect(silence);
    silence.connect(context.destination);
  }
  /**
   * Releases the audio graph and context without stopping the borrowed RTC track.
   */
  async close() {
    this.disconnect();
    const context = this.context;
    this.context = void 0;
    if (context && context.state !== "closed") {
      await context.close();
    }
  }
  /**
   * Disconnects input, invalidates old port messages, and resets audio continuity.
   */
  disconnect() {
    if (this.track && this.onEnded) {
      this.track.removeEventListener(
        "ended",
        this.onEnded
      );
    }
    this.track = void 0;
    this.onEnded = void 0;
    const processor = this.processor;
    this.processor = void 0;
    if (processor) {
      processor.port.onmessage = null;
      processor.port.close();
      processor.disconnect();
    }
    this.source?.disconnect();
    this.silence?.disconnect();
    this.source = void 0;
    this.silence = void 0;
    this.nextPTS = void 0;
    this.format = void 0;
  }
  /**
   * Validates worklet packets and advances time by sample count, reanchoring clock jumps over 100 ms.
   */
  convert(value, context) {
    const raw = value;
    const { data, sampleRate, channels, samplesPerChannel, frameIndex } = raw ?? {};
    if (!(data instanceof ArrayBuffer) || !sampleRate || sampleRate < 8e3 || sampleRate > 192e3 || !Number.isInteger(sampleRate) || !channels || ![1, 2].includes(channels) || !samplesPerChannel || !Number.isInteger(samplesPerChannel) || samplesPerChannel > sampleRate || frameIndex === void 0 || !Number.isSafeInteger(frameIndex) || frameIndex < 0 || data.byteLength !== samplesPerChannel * channels * 2) {
      this.nextPTS = void 0;
      return void 0;
    }
    const output = context.getOutputTimestamp?.();
    const validClock = output && Number.isFinite(output.contextTime) && Number.isFinite(output.performanceTime) && output.performanceTime > 0;
    const contextTime = validClock ? output.contextTime : context.currentTime;
    const performanceTime = validClock ? output.performanceTime : performance.now();
    const nativePTS = Math.round(performanceTime * 1e3 + (frameIndex / sampleRate - contextTime) * 1e6);
    if (!Number.isFinite(nativePTS)) {
      this.nextPTS = void 0;
      return void 0;
    }
    const format = `${sampleRate}/${channels}`;
    const discontinuous = raw?.discontinuous === true || this.nextPTS === void 0 || this.format !== format || Math.abs(nativePTS - this.nextPTS) > 1e5;
    const pts = discontinuous ? nativePTS : this.nextPTS;
    this.nextPTS = pts + samplesPerChannel * 1e6 / sampleRate;
    this.format = format;
    return {
      data: new Uint8Array(data),
      sampleRate,
      channels,
      samplesPerChannel,
      presentationTimeStamp: pts,
      discontinuous
    };
  }
  /**
   * Bounds module-loading and autoplay waits while observing cancellation.
   */
  wait(promise, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => finish(new XmaxError(
          "TIMEOUT" /* timeout */,
          "Remote audio initialization timed out; call setRemoteMediaFrameListener from a user gesture"
        )),
        3e3
      );
      const abort = () => finish(new XmaxError(
        "CANCELLED" /* cancelled */,
        "Remote media observation cancelled"
      ));
      const finish = (error) => {
        clearTimeout(timer);
        signal.removeEventListener(
          "abort",
          abort
        );
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      promise.then(
        () => finish(),
        finish
      );
      signal.addEventListener(
        "abort",
        abort,
        { once: true }
      );
      if (signal.aborted) {
        abort();
      }
    });
  }
};

var RemoteVideoFrameSource = class {
  /**
   * The video element used for independent frame observation.
   */
  video;
  /**
   * The pending frame-observation callback.
   */
  callback;
  /**
   * The borrowed input video track.
   */
  track;
  /**
   * The callback ending observation when the borrowed track ends.
   */
  onEnded;
  /**
   * Starts original-video observation without affecting the main player; the owner isolates observation
   * failures.
   */
  start(track, listener, onError) {
    this.stop();
    if (typeof VideoFrame === "undefined" || typeof HTMLVideoElement === "undefined" || typeof HTMLVideoElement.prototype.requestVideoFrameCallback !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Remote video frames require VideoFrame and requestVideoFrameCallback"
      );
    }
    const video = document.createElement("video");
    this.video = video;
    this.track = track;
    this.onEnded = () => this.stop();
    track.addEventListener(
      "ended",
      this.onEnded,
      { once: true }
    );
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = new MediaStream([track]);
    Object.assign(
      video.style,
      {
        position: "fixed",
        top: "0",
        left: "0",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none"
      }
    );
    video.setAttribute(
      "aria-hidden",
      "true"
    );
    document.body.appendChild(video);
    let previousPTS;
    let previousMediaTime;
    let previousFrames;
    let previousSize;
    const next = () => {
      this.callback = video.requestVideoFrameCallback((now, metadata) => {
        if (this.video !== video) {
          return;
        }
        let frame;
        try {
          const pts = Math.round((Number.isFinite(metadata.expectedDisplayTime) ? metadata.expectedDisplayTime : now) * 1e3);
          const size = `${video.videoWidth}/${video.videoHeight}`;
          const discontinuous = previousPTS === void 0 || pts <= previousPTS || size !== previousSize || previousMediaTime !== void 0 && metadata.mediaTime < previousMediaTime || previousFrames !== void 0 && metadata.presentedFrames > previousFrames + 1;
          const duration = previousPTS !== void 0 && pts > previousPTS ? pts - previousPTS : void 0;
          frame = new VideoFrame(
            video,
            {
              timestamp: pts,
              ...duration && { duration }
            }
          );
          previousPTS = pts;
          previousMediaTime = metadata.mediaTime;
          previousFrames = metadata.presentedFrames;
          previousSize = size;
          listener({
            frame,
            discontinuous
          });
        } catch (error) {
          frame?.close();
          onError(error);
        }
        if (this.video === video) {
          next();
        }
      });
    };
    next();
    void video.play().catch((error) => {
      if (this.video === video) {
        onError(error);
      }
    });
  }
  /**
   * Stops observation and releases its media element without stopping the borrowed RTC video track.
   */
  stop() {
    if (this.track && this.onEnded) {
      this.track.removeEventListener(
        "ended",
        this.onEnded
      );
    }
    this.track = void 0;
    this.onEnded = void 0;
    const video = this.video;
    this.video = void 0;
    if (!video) {
      return;
    }
    if (this.callback !== void 0) {
      video.cancelVideoFrameCallback(this.callback);
    }
    this.callback = void 0;
    video.pause();
    video.srcObject = null;
    video.remove();
  }
};

var RealtimeMediaFrameDispatcher = class {
  /**
   * Creates a queue bounded by packet count and bytes to prevent unbounded observer backlogs.
   */
  constructor(maximumPackets = 256, maximumBytes = 32 * 1024 * 1024) {
    this.maximumPackets = maximumPackets;
    this.maximumBytes = maximumBytes;
  }
  /**
   * The active media-frame listener.
   */
  listener;
  /**
   * The queued packets and their estimated memory costs.
   */
  queue = [];
  /**
   * The total queued byte count.
   */
  bytes = 0;
  /**
   * The pending asynchronous delivery timer.
   */
  timer;
  /**
   * The tracks whose next packet requires a discontinuity marker.
   */
  discontinuous = /* @__PURE__ */ new Set(["audio", "video"]);
  /**
   * Whether an app-observer failure has been reported for this subscription.
   */
  reportedError = false;
  /**
   * Replaces or removes the listener and discards packets queued for the previous observer.
   */
  setListener(listener) {
    this.reset();
    this.listener = listener;
    this.reportedError = false;
  }
  /**
   * Clears queued media while retaining the listener and borrowed RTC tracks.
   */
  reset() {
    clearTimeout(this.timer);
    this.timer = void 0;
    for (const item of this.queue) {
      this.release(item.packet);
    }
    this.queue = [];
    this.bytes = 0;
    this.discontinuous.add("audio");
    this.discontinuous.add("video");
  }
  /**
   * Enqueues media within memory bounds, releasing undelivered video on overflow and marking subsequent
   * discontinuity without compressing timestamps.
   */
  dispatch(packet) {
    const type = packet.content.type;
    const bytes = packet.content.type === "audio" ? packet.content.frame.data.byteLength : packet.content.frame.frame.displayWidth * packet.content.frame.frame.displayHeight * 4;
    if (!this.listener || this.queue.length >= this.maximumPackets || bytes > this.maximumBytes - this.bytes) {
      this.release(packet);
      this.discontinuous.add(type);
      return;
    }
    this.queue.push({
      packet: Object.freeze({
        ...packet,
        isDiscontinuous: packet.isDiscontinuous || this.discontinuous.has(type)
      }),
      bytes
    });
    this.discontinuous.delete(type);
    this.bytes += bytes;
    this.timer ??= setTimeout(
      () => this.deliver(),
      0
    );
  }
  /**
   * Delivers bounded batches and stops invoking an observer that replaces or removes itself.
   */
  deliver() {
    this.timer = void 0;
    for (let count = 0; count < 16 && this.queue.length; count++) {
      const item = this.queue.shift();
      this.bytes -= item.bytes;
      const listener = this.listener;
      if (!listener) {
        this.release(item.packet);
        continue;
      }
      try {
        void Promise.resolve(listener(item.packet)).catch((error) => {
          this.release(item.packet);
          this.report(error);
        });
      } catch (error) {
        this.release(item.packet);
        this.report(error);
      }
    }
    if (this.queue.length) {
      this.timer ??= setTimeout(
        () => this.deliver(),
        0
      );
    }
  }
  /**
   * Releases only undelivered frames; successfully delivered video belongs to your app.
   */
  release(packet) {
    if (packet.content.type === "video") {
      packet.content.frame.frame.close();
    }
  }
  /**
   * Isolates observer failures and logs once per subscription.
   */
  report(error) {
    if (this.reportedError) {
      return;
    }
    this.reportedError = true;
    XmaxLogger.render.warning(() => `Remote media frame listener failed: ${String(error)}`);
  }
};

var RemoteMediaFrameController = class {
  /**
   * The app's shared result-media listener.
   */
  listener;
  /**
   * The controller cancelling unfinished audio initialization.
   */
  setup;
  /**
   * The prepared audio observation source.
   */
  audio;
  /**
   * The shared-video observer.
   */
  video = new RemoteVideoFrameSource();
  /**
   * The bounded media delivery queue.
   */
  dispatcher = new RealtimeMediaFrameDispatcher();
  /**
   * The result-track binding currently supplied by shared output.
   */
  source;
  /**
   * The installed frame-observation binding.
   */
  bound;
  /**
   * The shared audio/video ID for the current result stream.
   */
  streamID;
  /**
   * Whether this binding has reported an observation failure.
   */
  reportedError = false;
  /**
   * Replaces or cancels observation; preparation failure rejects only this setup without terminating
   * generation.
   */
  async setListener(listener) {
    this.setup?.abort();
    const setup = new AbortController();
    this.setup = setup;
    this.listener = void 0;
    this.stopBinding();
    this.dispatcher.setListener(void 0);
    const previous = this.audio;
    this.audio = void 0;
    await previous?.close();
    if (setup.signal.aborted) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Remote media listener replaced"
      );
    }
    if (!listener) {
      return;
    }
    if (typeof VideoFrame === "undefined" || typeof HTMLVideoElement === "undefined" || typeof HTMLVideoElement.prototype.requestVideoFrameCallback !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "This browser cannot provide remote video frames"
      );
    }
    const audio = new RemoteAudioFrameSource();
    this.audio = audio;
    try {
      await audio.prepare(setup.signal);
      if (setup.signal.aborted) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Remote media listener replaced"
        );
      }
      this.listener = listener;
      this.dispatcher.setListener(listener);
      this.bind(true);
    } catch (error) {
      if (this.audio === audio) {
        this.audio = void 0;
      }
      await audio.close();
      throw error;
    }
  }
  /**
   * Updates observation after stream, task, or audio-track changes; without a listener, records only the
   * binding.
   */
  setSource(source) {
    this.source = source;
    if (!this.listener || !this.audio) {
      return;
    }
    this.bind();
  }
  /**
   * Installs the current stream, preserving video observation and stream identity when only audio
   * changes.
   */
  bind(strict = false) {
    const source = this.source;
    const previous = this.bound;
    if (!source) {
      this.stopBinding();
      return;
    }
    const sameStream = previous?.bindingID === source.bindingID && previous.userID === source.userID && previous.videoTrack === source.videoTrack;
    if (sameStream && previous.audioTrack === source.audioTrack) {
      return;
    }
    if (!sameStream) {
      this.stopBinding();
      this.streamID = crypto.randomUUID();
      this.reportedError = false;
    }
    this.bound = source;
    const streamID = this.streamID;
    try {
      if (!sameStream) {
        this.video.start(
          source.videoTrack,
          (packet) => {
            if (this.streamID !== streamID) {
              packet.frame.close();
              return;
            }
            const frame = Object.freeze({
              frame: packet.frame,
              presentationTimeStamp: packet.frame.timestamp,
              duration: packet.frame.duration ?? void 0
            });
            this.dispatcher.dispatch({
              streamID,
              isDiscontinuous: packet.discontinuous,
              content: {
                type: "video",
                frame
              },
              presentationTimeStamp: frame.presentationTimeStamp,
              duration: frame.duration
            });
          },
          (error) => this.report(error)
        );
      }
      this.audio.setTrack(
        source.audioTrack,
        (packet) => {
          if (this.streamID !== streamID) {
            return;
          }
          const frame = Object.freeze({
            data: packet.data,
            sampleRate: packet.sampleRate,
            channels: packet.channels,
            samplesPerChannel: packet.samplesPerChannel,
            presentationTimeStamp: packet.presentationTimeStamp,
            duration: packet.samplesPerChannel * 1e6 / packet.sampleRate
          });
          this.dispatcher.dispatch({
            streamID,
            isDiscontinuous: packet.discontinuous,
            content: {
              type: "audio",
              frame
            },
            presentationTimeStamp: frame.presentationTimeStamp,
            duration: frame.duration
          });
        }
      );
    } catch (error) {
      this.stopBinding();
      if (strict) {
        throw error;
      }
      this.report(error);
    }
  }
  /**
   * Stops obsolete observation and queued packets without changing borrowed RTC tracks.
   */
  stopBinding() {
    this.streamID = void 0;
    this.bound = void 0;
    this.video.stop();
    this.audio?.setTrack(
      void 0,
      () => {
      }
    );
    this.dispatcher.reset();
  }
  /**
   * Logs an observation failure without terminating playback or generation.
   */
  report(error) {
    if (this.reportedError) {
      return;
    }
    this.reportedError = true;
    XmaxLogger.render.warning(() => `Remote media frame observation failed: ${XmaxError.from(error).message}`);
  }
};

var RealtimeModel = /* @__PURE__ */ ((RealtimeModel2) => {
  RealtimeModel2["x2_0"] = "x2.0";
  RealtimeModel2["x2_1"] = "x2.1";
  RealtimeModel2["x2_1_flash"] = "x2.1-flash";
  return RealtimeModel2;
})(RealtimeModel || {});
function isKnownModel(model) {
  if (typeof model !== "string" || !model.trim()) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "Realtime model must be a non-empty string"
    );
  }
  return Object.values(RealtimeModel).includes(model);
}
function modelDefaults(model) {
  return isKnownModel(model) ? model : "x2.1" /* x2_1 */;
}
var RESOLUTION_BUCKETS = {
  ["x2.0" /* x2_0 */]: [],
  ["x2.1" /* x2_1 */]: [
    {
      width: 1920,
      height: 1080
    },
    {
      width: 1080,
      height: 1920
    },
    {
      width: 1408,
      height: 1408
    },
    {
      width: 1152,
      height: 1536
    },
    {
      width: 1536,
      height: 1152
    }
  ],
  ["x2.1-flash" /* x2_1_flash */]: [
    {
      width: 704,
      height: 1280
    },
    {
      width: 1280,
      height: 704
    },
    {
      width: 960,
      height: 960
    },
    {
      width: 1024,
      height: 768
    },
    {
      width: 768,
      height: 1024
    }
  ]
};
var MAXIMUM_INPUT_PIXELS = {
  ["x2.0" /* x2_0 */]: 128e4,
  ["x2.1" /* x2_1 */]: 21e5,
  ["x2.1-flash" /* x2_1_flash */]: 960 * 960
};
function modelBaseURL(model) {
  isKnownModel(model);
  return void 0;
}
function supportedVideoFormats(model) {
  return resolutionBuckets(model).map((size) => new RealtimeVideoFormat({
    ...size,
    fps: defaultFrameRate(model)
  }));
}
function resolutionBuckets(model) {
  return RESOLUTION_BUCKETS[modelDefaults(model)];
}
function minimumInputPixels(_model) {
  return 6e5;
}
function maximumInputPixels(model) {
  return MAXIMUM_INPUT_PIXELS[modelDefaults(model)];
}
function inputSizeAlignment(_model) {
  return 32;
}
function defaultFrameRate(_model) {
  return 30;
}
var CUSTOM_MODEL_RTC_PROVIDERS = Object.freeze([
  "agora" /* agora */,
  ...Object.values(RtcProvider).filter((provider) => provider !== "agora" /* agora */)
]);
var MODEL_RTC_PROVIDERS = {
  ["x2.0" /* x2_0 */]: Object.freeze(["vertc" /* vertc */]),
  ["x2.1" /* x2_1 */]: Object.freeze(["agora" /* agora */]),
  ["x2.1-flash" /* x2_1_flash */]: CUSTOM_MODEL_RTC_PROVIDERS
};
function supportedRtcProviders(model) {
  return isKnownModel(model) ? MODEL_RTC_PROVIDERS[model] : CUSTOM_MODEL_RTC_PROVIDERS;
}

var RealtimeVideoTrack = class {
  /**
   * The video track ID.
   */
  id;
  /**
   * The current video format and camera position.
   */
  metadata;
  /**
   * The underlying browser media track used internally by XmaxSDK. Available after local capture starts
   * or remote subscription succeeds. Remote processing is supplied through render bindings and media
   * listeners; this transport handle remains unprocessed.
   */
  mediaStreamTrack;
  /**
   * Creates a realtime video track.
   */
  constructor(init) {
    this.id = init.id;
    this.metadata = {
      videoFormat: init.videoFormat,
      position: init.position
    };
  }
  /**
   * The video format currently associated with the track.
   */
  get videoFormat() {
    return this.metadata.videoFormat;
  }
  /**
   * The camera position currently associated with a local camera track.
   */
  get position() {
    return this.metadata.position;
  }
  /**
   * Updates the track's video format.
   *
   * @internal
   */
  updateVideoFormat(videoFormat) {
    this.metadata.videoFormat = videoFormat;
  }
  /**
   * Updates the track's camera position.
   *
   * @internal
   */
  updatePosition(position) {
    this.metadata.position = position;
  }
};

var RealtimeMediaStream = class {
  /**
   * The media stream ID.
   */
  id;
  /**
   * The stream's video track.
   */
  videoTrack;
  /**
   * Creates a realtime media stream.
   */
  constructor(init) {
    this.id = init.id;
    this.videoTrack = init.videoTrack;
  }
};

var RealtimeReason = {
  /**
   * The reason for a normal operation's state transition.
   */
  normal: { kind: "normal" },
  /**
   * The reason for an orientation-related state transition.
   */
  orientationChanged: { kind: "orientationChanged" },
  /**
   * Wraps an SDK error as a state-transition reason, preserving its code and message.
   */
  failure(error) {
    return {
      kind: "failure",
      error
    };
  }
};
var RealtimeState = class {
  /**
   * The current connection lifecycle state.
   */
  connectionState;
  /**
   * The current or most recent realtime session ID.
   */
  sessionID;
  /**
   * The active generation task ID.
   */
  taskID;
  /**
   * The reason for entering this state, cleared when a normal operation begins.
   */
  reason;
  /**
   * Creates a realtime state snapshot.
   */
  constructor(init) {
    this.connectionState = init.connectionState;
    this.sessionID = init.sessionID;
    this.taskID = init.taskID;
    this.reason = init.reason;
  }
  /**
   * Compares connection state, session, task, and reason kind.
   *
   * @param other - The state to compare.
   */
  equals(other) {
    return this.connectionState === other.connectionState && this.sessionID === other.sessionID && this.taskID === other.taskID && this.reason?.kind === other.reason?.kind;
  }
};

var EncodingBitratePolicy = class _EncodingBitratePolicy {
  /**
   * The maximum-bitrate multiplier applied to reference values.
   */
  static bitrateScale = 0.6;
  /**
   * Resolves a fixed 100 kbps minimum and a size/frame-rate-dependent maximum multiplied by the budget
   * scale.
   */
  static resolve(width, height, fps) {
    new RealtimeVideoFormat({
      width,
      height,
      fps
    }).validate();
    const maximum = Math.round(
      this.resolveMaximumBitrate(
        width * height,
        fps
      ) * this.bitrateScale
    );
    if (!Number.isSafeInteger(maximum)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Realtime video format exceeds the supported bitrate range"
      );
    }
    return {
      minimum: 100,
      maximum: Math.max(100, maximum)
    };
  }
  /**
   * Interpolates maximum reference bitrate from pixel area and frame rate.
   */
  static resolveMaximumBitrate(pixels, fps) {
    const bitrate15 = _EncodingBitratePolicy.interpolate(
      pixels,
      _EncodingBitratePolicy.referenceBitratesAt15FPS
    );
    const first30 = _EncodingBitratePolicy.referenceBitratesAt30FPS[0];
    let bitrate30;
    if (pixels < first30.value) {
      const reference15 = _EncodingBitratePolicy.interpolate(
        first30.value,
        _EncodingBitratePolicy.referenceBitratesAt15FPS
      );
      bitrate30 = bitrate15 * (first30.bitrate / reference15);
    } else {
      bitrate30 = _EncodingBitratePolicy.interpolate(
        pixels,
        _EncodingBitratePolicy.referenceBitratesAt30FPS
      );
    }
    const bitrate10 = bitrate15 * (400 / 500);
    const maximum60 = bitrate30 * (6500 / 3150);
    return _EncodingBitratePolicy.interpolate(
      fps,
      [
        {
          value: 10,
          bitrate: bitrate10 * 2
        },
        {
          value: 15,
          bitrate: bitrate15 * 2
        },
        {
          value: 30,
          bitrate: bitrate30 * 2
        },
        {
          value: 60,
          bitrate: maximum60
        }
      ]
    );
  }
  /**
   * Interpolates between adjacent points and extrapolates proportionally beyond the nearest endpoint.
   */
  static interpolate(value, points) {
    const first = points[0];
    if (value <= first.value) {
      return first.bitrate * (value / first.value);
    }
    for (let index = 1; index < points.length; index += 1) {
      const upper = points[index];
      if (value <= upper.value) {
        const lower = points[index - 1];
        const ratio = (value - lower.value) / (upper.value - lower.value);
        return lower.bitrate + (upper.bitrate - lower.bitrate) * ratio;
      }
    }
    const last = points[points.length - 1];
    return last.bitrate * (value / last.value);
  }
  /**
   * Smoothness-oriented reference bitrates sorted by pixel area, in kbps.
   */
  static referenceBitratesAt15FPS = [
    {
      value: 120 * 120,
      bitrate: 50
    },
    {
      value: 160 * 120,
      bitrate: 65
    },
    {
      value: 180 * 180,
      bitrate: 100
    },
    {
      value: 240 * 180,
      bitrate: 120
    },
    {
      value: 320 * 180,
      bitrate: 140
    },
    {
      value: 320 * 240,
      bitrate: 200
    },
    {
      value: 424 * 240,
      bitrate: 220
    },
    {
      value: 360 * 360,
      bitrate: 260
    },
    {
      value: 480 * 360,
      bitrate: 320
    },
    {
      value: 640 * 360,
      bitrate: 400
    },
    {
      value: 640 * 480,
      bitrate: 500
    },
    {
      value: 848 * 480,
      bitrate: 610
    },
    {
      value: 960 * 720,
      bitrate: 910
    },
    {
      value: 1280 * 720,
      bitrate: 1130
    },
    {
      value: 1920 * 1080,
      bitrate: 2080
    }
  ];
  /**
   * Reference bitrates at 30 fps indexed by pixel area, in kbps.
   */
  static referenceBitratesAt30FPS = [
    {
      value: 360 * 360,
      bitrate: 400
    },
    {
      value: 480 * 360,
      bitrate: 490
    },
    {
      value: 640 * 360,
      bitrate: 600
    },
    {
      value: 640 * 480,
      bitrate: 750
    },
    {
      value: 848 * 480,
      bitrate: 930
    },
    {
      value: 960 * 720,
      bitrate: 1380
    },
    {
      value: 1280 * 720,
      bitrate: 1710
    },
    {
      value: 1920 * 1080,
      bitrate: 3150
    }
  ];
};

var INITIAL_QUALITY_LEVEL = 2;
var MINIMUM_QUALITY_SHORT_SIDE = 240;
var QUALITY_TIERS = {
  L1: {
    scale: 1,
    frameRate: 30
  },
  L2: {
    scale: 0.9,
    frameRate: 24
  },
  L3: {
    scale: 0.75,
    frameRate: 24
  },
  L4: {
    scale: 0.6,
    frameRate: 20
  },
  L5: {
    scale: 0.5,
    frameRate: 16
  }
};

function qualityVideoMaximumSize(baseline, level) {
  const tier = Object.values(QUALITY_TIERS)[level - 1];
  if (!Number.isInteger(level) || !tier) {
    throw new Error("Unsupported quality level");
  }
  baseline.validate();
  const shortSide = Math.min(baseline.width, baseline.height);
  const minimum = Math.min(shortSide, MINIMUM_QUALITY_SHORT_SIDE);
  const scale = Math.max(tier.scale, minimum / shortSide);
  return {
    width: baseline.width * scale,
    height: baseline.height * scale
  };
}
function qualityVideoSize(baseline, level, preserveAspectRatio = true) {
  const maximum = qualityVideoMaximumSize(
    baseline,
    level
  );
  if (preserveAspectRatio) {
    return alignedVideoSize(
      baseline,
      Math.min(1, maximum.width / baseline.width, maximum.height / baseline.height),
      4
    );
  }
  const width = Math.floor(maximum.width / 4 + 1e-9) * 4;
  const height = Math.floor(maximum.height / 4 + 1e-9) * 4;
  if (width < 4 || height < 4) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "No aligned video size is available within the size limits"
    );
  }
  return {
    width,
    height
  };
}
function supportsQualityEncoding(format) {
  const defaults = EncodingBitratePolicy.resolve(
    format.width,
    format.height,
    format.fps
  );
  const maximum = format.maximumBitrate ?? defaults.maximum;
  return (format.minimumBitrate ?? Math.min(500, maximum)) <= maximum;
}
function qualityVideoFormat(baseline, level, preserveAspectRatio = true) {
  const size = qualityVideoSize(
    baseline,
    level,
    preserveAspectRatio
  );
  const tier = Object.values(QUALITY_TIERS)[level - 1];
  return new RealtimeVideoFormat({
    ...baseline,
    ...size,
    fps: Math.min(baseline.fps, tier.frameRate)
  });
}

var CAMERA_WARMUP_MS = 200;
function waitForValidCameraFrame(track, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    let settled = false;
    const finish = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener(
        "abort",
        abort
      );
      track.removeEventListener(
        "ended",
        ended
      );
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    const abort = () => finish(new XmaxError(
      "CANCELLED" /* cancelled */,
      "Camera warmup cancelled"
    ));
    const ended = () => finish(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "Camera track ended before warmup completed"
    ));
    signal.addEventListener(
      "abort",
      abort,
      { once: true }
    );
    track.addEventListener(
      "ended",
      ended,
      { once: true }
    );
    if (signal.aborted) {
      abort();
      return;
    }
    if (track.readyState === "ended") {
      ended();
      return;
    }
    timer = setTimeout(
      () => finish(),
      CAMERA_WARMUP_MS
    );
  });
}

var PermissionManager = class {
  /**
   * Checks camera permission availability.
   *
   * @throws Rejects with cameraPermissionDenied if permission is denied or capture is unsupported.
   */
  async ensureCameraPermission() {
    await this.ensurePermission(
      "camera",
      "CAMERA_PERMISSION_DENIED" /* cameraPermissionDenied */
    );
  }
  /**
   * Checks microphone permission availability.
   *
   * @throws Rejects with microphonePermissionDenied if permission is denied or capture is unsupported.
   */
  async ensureMicrophonePermission() {
    await this.ensurePermission(
      "microphone",
      "MICROPHONE_PERMISSION_DENIED" /* microphonePermissionDenied */
    );
  }
  /**
   * Preflights device permission through the Permissions API.
   *
   * @param name - The media permission name.
   * @param deniedCode - The error code for denied permission.
   */
  async ensurePermission(name, deniedCode) {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new XmaxError(
        deniedCode,
        "This browser does not support media capture (getUserMedia)"
      );
    }
    try {
      const permissions = navigator.permissions;
      if (!permissions?.query) {
        return;
      }
      const status = await permissions.query({
        name
      });
      if (status.state === "denied") {
        throw new XmaxError(
          deniedCode,
          `${name === "camera" ? "Camera" : "Microphone"} permission was denied`
        );
      }
    } catch (error) {
      if (error instanceof XmaxError) {
        throw error;
      }
      XmaxLogger.permission.debug(
        () => `Permission query for ${name} is unavailable; skip pre-check`
      );
    }
  }
};

var VideoRenderRegistry = class _VideoRenderRegistry {
  /**
   * Custom rendering bindings indexed by video track.
   */
  static bindings = /* @__PURE__ */ new WeakMap();
  /**
   * Registers or replaces a track's custom rendering binding.
   *
   * @internal
   */
  static register(track, binding) {
    _VideoRenderRegistry.bindings.set(
      track,
      binding
    );
  }
  /**
   * Removes a binding without detaching views or releasing their resources.
   *
   * @internal
   */
  static unregister(track) {
    _VideoRenderRegistry.bindings.delete(track);
  }
  /**
   * Returns a track's custom rendering binding, or undefined when unregistered.
   *
   * @internal
   */
  static binding(forTrack) {
    return _VideoRenderRegistry.bindings.get(forTrack);
  }
};

var MediaService = class {
  /**
   * The model whose media constraints apply.
   */
  model;
  /**
   * Creates a media service.
   */
  constructor(model = "x2.1" /* x2_1 */) {
    this.model = model;
  }
  /**
   * Resolves a fixed media baseline, preserving content without upscaling and aligning limited
   * dimensions to four pixels. Camera requests must match model resolutions; file and external media may
   * use arbitrary aspect ratios.
   *
   * @param sourceMediaSize - The original media dimensions.
   * @param source - The media source; only camera input validates fixed capture resolutions.
   * @returns The fixed media baseline and initial uplink dimensions.
   */
  resolveMediaSize(sourceMediaSize, source) {
    this.validateIntegralSize(sourceMediaSize);
    const buckets = resolutionBuckets(this.model);
    if (source === "camera" && buckets.length > 0) {
      this.resolveModelInputSize(sourceMediaSize);
    }
    const pixels = sourceMediaSize.width * sourceMediaSize.height;
    const scale = Math.min(1, Math.sqrt(maximumInputPixels(this.model) / pixels));
    return alignedVideoSize(
      sourceMediaSize,
      scale,
      4
    );
  }
  /**
   * Selects the closest-aspect generation canvas, or applies model pixel-budget and alignment rules
   * without fixed resolutions.
   */
  resolveGenerationSize(resolvedMediaSize) {
    this.validateIntegralSize(resolvedMediaSize);
    const buckets = resolutionBuckets(this.model);
    if (buckets.length === 0) {
      return this.resolveModelInputSize(resolvedMediaSize);
    }
    const aspect = resolvedMediaSize.width / resolvedMediaSize.height;
    let best = buckets[0];
    let distance = Math.abs(Math.log(aspect / (best.width / best.height)));
    for (const bucket of buckets.slice(1)) {
      const candidate = Math.abs(Math.log(aspect / (bucket.width / bucket.height)));
      if (candidate < distance) {
        best = bucket;
        distance = candidate;
      }
    }
    return {
      width: best.width,
      height: best.height
    };
  }
  /**
   * Resolves bounded returned dimensions without upscaling, preferring the source aspect ratio and
   * four-pixel alignment.
   */
  resolveTargetSize(resolvedMediaSize, maximumSize) {
    this.validateIntegralSize(resolvedMediaSize);
    if (![maximumSize.width, maximumSize.height].every((value) => Number.isFinite(value) && value > 0)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Target bounds must be positive and finite"
      );
    }
    const scale = Math.min(1, maximumSize.width / resolvedMediaSize.width, maximumSize.height / resolvedMediaSize.height);
    return alignedVideoSize(
      resolvedMediaSize,
      scale,
      4
    );
  }
  /**
   * Rejects invalid dimensions or pixel areas that cannot be calculated safely.
   */
  validateIntegralSize(size) {
    if (![size.width, size.height].every((value) => Number.isSafeInteger(value) && value > 0) || !Number.isSafeInteger(size.width * size.height)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Media dimensions must be positive safe integers"
      );
    }
  }
  /**
   * Resolves model input dimensions using fixed resolutions or an aligned pixel budget, rejecting
   * unsupported formats.
   */
  resolveModelInputSize(size) {
    const buckets = resolutionBuckets(this.model);
    if (buckets.length > 0) {
      const matched = buckets.some(
        (bucket) => bucket.width === size.width && bucket.height === size.height
      );
      if (!matched) {
        const supportedSizes = buckets.map((bucket) => `${bucket.width}\xD7${bucket.height}`).join(", ");
        throw new XmaxError(
          "INVALID_CONFIGURATION" /* invalidConfiguration */,
          `Model ${this.model} does not support input resolution ${size.width}\xD7${size.height}. Supported resolutions: ${supportedSizes}`
        );
      }
      return {
        width: size.width,
        height: size.height
      };
    }
    const validated = this.validatedSize(size);
    const pixels = validated.width * validated.height;
    const minimumPixels = minimumInputPixels(this.model);
    const maximumPixels = maximumInputPixels(this.model);
    let scale;
    let rounding;
    if (pixels < minimumPixels) {
      scale = Math.sqrt(minimumPixels / pixels);
      rounding = Math.ceil;
    } else if (pixels > maximumPixels) {
      scale = Math.sqrt(maximumPixels / pixels);
      rounding = Math.floor;
    } else {
      scale = 1;
      rounding = Math.round;
    }
    const alignment = inputSizeAlignment(this.model);
    const width = Math.max(
      rounding(validated.width * scale / alignment) * alignment,
      alignment
    );
    const height = Math.max(
      rounding(validated.height * scale / alignment) * alignment,
      alignment
    );
    const alignedPixels = width * height;
    if (alignedPixels >= minimumPixels && alignedPixels <= maximumPixels) {
      return {
        width,
        height
      };
    }
    return this.boundedAlignedSize(
      validated.width * scale,
      validated.height * scale
    );
  }
  /**
   * Selects the closest aligned dimensions within the pixel-area limits.
   */
  boundedAlignedSize(width, height) {
    const alignment = inputSizeAlignment(this.model);
    const unitPixels = alignment * alignment;
    const minimumUnits = Math.ceil(minimumInputPixels(this.model) / unitPixels);
    const maximumUnits = Math.floor(maximumInputPixels(this.model) / unitPixels);
    let bestSize = {
      width: 0,
      height: 0
    };
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let widthUnits = 1; widthUnits <= maximumUnits; widthUnits += 1) {
      const minimumHeight = Math.ceil(minimumUnits / widthUnits);
      const maximumHeight = Math.floor(maximumUnits / widthUnits);
      if (minimumHeight > maximumHeight) {
        continue;
      }
      const heightUnits = Math.min(
        Math.max(Math.round(height / alignment), minimumHeight),
        maximumHeight
      );
      const candidateWidth = widthUnits * alignment;
      const candidateHeight = heightUnits * alignment;
      const distance = ((candidateWidth - width) / width) ** 2 + ((candidateHeight - height) / height) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSize = {
          width: candidateWidth,
          height: candidateHeight
        };
      }
    }
    return bestSize;
  }
  /**
   * Validates finite positive dimensions and normalizes them to integers of at least one pixel.
   */
  validatedSize(size) {
    if (!Number.isFinite(size.width) || !Number.isFinite(size.height) || size.width <= 0 || size.height <= 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Image width and height must be finite numbers greater than zero"
      );
    }
    return {
      width: Math.max(Math.round(size.width), 1),
      height: Math.max(Math.round(size.height), 1)
    };
  }
};

var CameraController = class _CameraController {
  /**
   * The SDK ID assigned to local camera video.
   */
  static localVideoTrackID = "video0";
  /**
   * The camera and microphone permission checker.
   */
  permissionManager;
  /**
   * The configured RTC capture and transport adapter.
   */
  rtcManager;
  /**
   * The service resolving model input dimensions.
   */
  mediaService;
  /**
   * The runtime capture-error listener.
   */
  errorListener;
  /**
   * The readiness callback requiring both a captured frame and bound preview.
   */
  previewReadyHandler;
  /**
   * The active SDK camera track.
   */
  activeTrack;
  /**
   * The browser media stream used for camera preview.
   */
  previewStream;
  /**
   * The callback applying preview mirroring.
   */
  previewMirrorApplier;
  /**
   * Whether a valid camera frame has arrived.
   */
  hasCapturedFrame = false;
  /**
   * Whether a preview target is attached.
   */
  isPreviewAttached = false;
  /**
   * Whether the current camera configuration includes microphone capture.
   */
  storedUseMicrophone = false;
  /**
   * Whether the current camera source enables pre-publication warmup.
   */
  storedFrameValidationEnabled = true;
  /**
   * The current clockwise camera rotation, retained across format updates.
   */
  storedRotation = 0;
  /**
   * The track being reformatted, whose obsolete native-track end events are ignored during replacement.
   */
  formatUpdatingTrack;
  /**
   * Creates a camera controller.
   *
   * @param options.permissionManager - The permission checker.
   * @param options.rtcManager - The capture and transport adapter.
   * @param options.mediaService - The model-sizing service.
   * @param options.errorListener - The runtime error listener.
   */
  constructor(options) {
    this.permissionManager = options?.permissionManager ?? new PermissionManager();
    this.rtcManager = options?.rtcManager ?? new TrtcRtcManager();
    this.mediaService = options?.mediaService ?? new MediaService();
    this.errorListener = options?.errorListener ?? (() => {
    });
  }
  /**
   * The active local camera track, or undefined before creation.
   */
  get currentTrack() {
    return this.activeTrack;
  }
  /**
   * Whether the active camera source is configured to use microphone input.
   */
  get useMicrophone() {
    return this.activeTrack !== void 0 && this.storedUseMicrophone;
  }
  /**
   * Whether the active camera source enables pre-publication warmup; false without an active source.
   */
  get isFrameValidationEnabled() {
    return this.activeTrack !== void 0 && this.storedFrameValidationEnabled;
  }
  /**
   * Waits for the fixed 200 ms warmup unless disabled, rejecting cancellation or track replacement.
   */
  async waitForValidCameraFrame(signal) {
    const track = this.activeTrack;
    const mediaTrack = track?.mediaStreamTrack;
    if (!mediaTrack) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Camera capture is not running"
      );
    }
    if (signal.aborted) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Camera frame validation cancelled"
      );
    }
    if (!this.isFrameValidationEnabled) {
      return;
    }
    await waitForValidCameraFrame(
      mediaTrack,
      signal
    );
    if (this.activeTrack !== track || track.mediaStreamTrack !== mediaTrack) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Camera track changed during warmup"
      );
    }
  }
  /**
   * Sets a one-shot readiness callback requiring a valid frame and a bound preview.
   */
  setPreviewReadyHandler(handler) {
    this.previewReadyHandler = handler;
    const track = this.activeTrack;
    if (track) {
      this.notifyPreviewReady(track);
    }
  }
  /**
   * Creates and starts local camera media.
   *
   * @param options.videoFormat - The desired post-rotation dimensions, frame rate, and encoding
   * settings, resolved by model rules.
   * @param options.position - The initial camera position.
   * @param options.rotation - Clockwise input rotation; defaults to 0. Nonzero values currently require
   * Agora.
   * @param options.useMicrophone - Whether to request microphone permission and allow audio capture
   * during connection.
   * @param options.enableFrameValidation - Whether to wait for a fixed 200 ms pre-publication warmup;
   * defaults to true.
   * @returns A media stream containing the local camera track.
   * @throws Rejects for active capture, invalid formats, denied permission, or capture-start failure.
   */
  async createLocalCameraStream(options) {
    if (this.activeTrack) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Stop the current local camera stream before creating another one"
      );
    }
    validateCameraRotation(options.rotation ?? 0);
    const resolvedFormat = this.resolveVideoFormat(options.videoFormat);
    const track = new RealtimeVideoTrack({
      id: _CameraController.localVideoTrackID,
      videoFormat: resolvedFormat,
      position: options.position
    });
    try {
      await this.permissionManager.ensureCameraPermission();
      if (options.useMicrophone) {
        await this.permissionManager.ensureMicrophonePermission();
      }
      await this.rtcManager.initialize();
      this.activeTrack = track;
      this.storedUseMicrophone = options.useMicrophone;
      this.storedFrameValidationEnabled = options.enableFrameValidation ?? true;
      this.storedRotation = options.rotation ?? 0;
      this.hasCapturedFrame = false;
      this.isPreviewAttached = false;
      this.registerPreviewBinding(track);
      const mediaTrack = await this.rtcManager.startCameraCapture({
        width: resolvedFormat.width,
        height: resolvedFormat.height,
        frameRate: resolvedFormat.fps,
        position: options.position,
        ...options.rotation !== void 0 ? { rotation: options.rotation } : {}
      });
      track.mediaStreamTrack = mediaTrack;
      this.previewStream = new MediaStream([mediaTrack]);
      this.observeMediaTrack(
        track,
        mediaTrack
      );
      return new RealtimeMediaStream({
        id: "stream0" /* local */,
        videoTrack: track
      });
    } catch (error) {
      await this.stopLocalCameraStream();
      throw XmaxError.from(error);
    }
  }
  /**
   * Stops capture, destroys the RTC engine, and releases the camera track and preview resources.
   */
  async stopLocalCameraStream() {
    const track = this.activeTrack;
    this.activeTrack = void 0;
    this.previewReadyHandler = void 0;
    this.previewStream = void 0;
    this.previewMirrorApplier = void 0;
    this.storedUseMicrophone = false;
    this.storedFrameValidationEnabled = true;
    this.storedRotation = 0;
    this.hasCapturedFrame = false;
    this.isPreviewAttached = false;
    await this.rtcManager.stopCameraCapture();
    await this.rtcManager.destroy();
    if (track) {
      VideoRenderRegistry.unregister(track);
      track.mediaStreamTrack = void 0;
    }
  }
  /**
   * Updates capture settings, replacing preview tracks and metadata only after success and retaining
   * existing bindings on failure.
   */
  async updateVideoFormat(videoFormat) {
    const track = this.activeTrack;
    const position = track?.position;
    if (!track || !position || !track.mediaStreamTrack) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera preview is not started"
      );
    }
    const resolved = this.resolveVideoFormat(videoFormat);
    if (!this.rtcManager.updateCameraCapture) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "The RTC provider does not support camera format updates"
      );
    }
    const previous = track.mediaStreamTrack;
    this.formatUpdatingTrack = track;
    try {
      const mediaTrack = await this.rtcManager.updateCameraCapture({
        width: resolved.width,
        height: resolved.height,
        frameRate: resolved.fps,
        position,
        rotation: this.storedRotation
      });
      if (this.activeTrack !== track) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Camera stream changed during format update"
        );
      }
      track.updateVideoFormat(resolved);
      track.mediaStreamTrack = mediaTrack;
      if (previous !== mediaTrack) {
        this.previewStream?.removeTrack(previous);
        this.previewStream?.addTrack(mediaTrack);
        this.observeMediaTrack(
          track,
          mediaTrack
        );
      }
    } finally {
      if (this.formatUpdatingTrack === track) {
        this.formatUpdatingTrack = void 0;
      }
      if (this.activeTrack === track && track.mediaStreamTrack?.readyState === "ended") {
        this.errorListener(new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "Camera capture ended during format update"
        ));
      }
    }
  }
  /**
   * Switches cameras while retaining the SDK track.
   *
   * The native replacement updates the existing preview stream; RTC owns old-track cleanup, so mounted
   * views need no rebinding.
   *
   * @returns The stream with updated camera media.
   * @throws Rejects without active capture or if switching fails.
   */
  async switchCamera() {
    const track = this.activeTrack;
    const position = track?.position;
    if (!track || !position) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Local camera preview is not started"
      );
    }
    const nextPosition = position === "front" /* front */ ? "back" /* back */ : "front" /* front */;
    const mediaTrack = await this.rtcManager.switchCameraCapture(nextPosition);
    const previousTrack = track.mediaStreamTrack;
    track.updatePosition(nextPosition);
    track.mediaStreamTrack = mediaTrack;
    if (this.previewStream) {
      if (previousTrack) {
        this.previewStream.removeTrack(previousTrack);
      }
      this.previewStream.addTrack(mediaTrack);
    }
    this.previewMirrorApplier?.(nextPosition === "front" /* front */);
    this.observeMediaTrack(
      track,
      mediaTrack
    );
    return new RealtimeMediaStream({
      id: "stream0" /* local */,
      videoTrack: track
    });
  }
  /**
   * Registers preview attachment, media delivery, and mirroring for a camera track.
   */
  registerPreviewBinding(track) {
    VideoRenderRegistry.register(
      track,
      {
        attachHandler: (view) => {
          const stream = this.previewStream;
          if (!stream) {
            throw new XmaxError(
              "MEDIA_ERROR" /* mediaError */,
              "Camera capture is not running"
            );
          }
          view.isMirrored = track.position === "front" /* front */;
          view.setMediaStream(stream);
          this.previewMirrorApplier = (mirrored) => {
            view.isMirrored = mirrored;
          };
          this.isPreviewAttached = true;
          this.notifyPreviewReady(track);
        },
        detachHandler: (view) => {
          view.setMediaStream(null);
          this.previewMirrorApplier = void 0;
          this.isPreviewAttached = false;
        }
      }
    );
  }
  /**
   * Observes the first frame for preview readiness and unexpected track termination for failure
   * reporting.
   */
  observeMediaTrack(track, mediaTrack) {
    const isCurrent = () => this.activeTrack === track && track.mediaStreamTrack === mediaTrack;
    if (mediaTrack.muted) {
      mediaTrack.addEventListener(
        "unmute",
        () => {
          if (!isCurrent()) {
            return;
          }
          this.hasCapturedFrame = true;
          this.notifyPreviewReady(track);
        },
        { once: true }
      );
    } else {
      this.hasCapturedFrame = true;
      this.notifyPreviewReady(track);
    }
    mediaTrack.addEventListener(
      "ended",
      () => {
        if (!isCurrent() || this.formatUpdatingTrack === track) {
          return;
        }
        this.errorListener(
          new XmaxError(
            "MEDIA_ERROR" /* mediaError */,
            "Camera video track ended unexpectedly"
          )
        );
      }
    );
  }
  /**
   * Invokes readiness once after both a valid frame and preview attachment.
   */
  notifyPreviewReady(track) {
    if (this.activeTrack !== track || !this.hasCapturedFrame || !this.isPreviewAttached || !this.previewReadyHandler) {
      return;
    }
    const handler = this.previewReadyHandler;
    this.previewReadyHandler = void 0;
    handler(() => this.activeTrack === track);
  }
  /**
   * Resolves the requested format according to model input rules.
   */
  resolveVideoFormat(videoFormat) {
    videoFormat.validate();
    const targetSize = this.mediaService.resolveMediaSize(
      {
        width: videoFormat.width,
        height: videoFormat.height
      },
      "camera"
    );
    const resolvedFormat = videoFormat.resized(
      targetSize.width,
      targetSize.height
    );
    resolvedFormat.validate();
    return resolvedFormat;
  }
};

var VideoController = class {
  /**
   * The current file source, including preparation state.
   */
  source;
  /**
   * The runtime media-failure callback.
   */
  onError;
  /**
   * Creates a file-video controller without allocating browser resources.
   */
  constructor(onError = () => {
  }) {
    this.onError = onError;
  }
  /**
   * Whether a file source exists, including a preparing player.
   */
  get isActive() {
    return this.source !== void 0;
  }
  /**
   * The prepared local video track.
   */
  get currentTrack() {
    return this.source?.track;
  }
  /**
   * The file-audio output, absent when disabled and silent for files without an audio track.
   */
  get audioTrack() {
    return this.source?.audioDestination?.stream.getAudioTracks()[0];
  }
  /**
   * Validates and prepares file media; call directly from a user gesture to unlock playback.
   */
  async create(options, mediaService, signal) {
    if (this.source) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Close the current local video before creating another one"
      );
    }
    if (!(options.file instanceof Blob) || options.file.size === 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local video requires a non-empty File or Blob"
      );
    }
    options.videoFormat.validate();
    if (signal.aborted) {
      throw this.cancelled();
    }
    if (typeof document === "undefined") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Local video requires a browser"
      );
    }
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context || typeof canvas.captureStream !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Canvas video capture is unavailable"
      );
    }
    const source = {
      video,
      canvas,
      context,
      url: URL.createObjectURL(options.file),
      abort: new AbortController(),
      targets: /* @__PURE__ */ new Set()
    };
    this.source = source;
    try {
      video.playsInline = true;
      video.loop = options.loop ?? true;
      video.preload = "auto";
      video.volume = 1;
      video.muted = options.includeAudio === false;
      if (options.includeAudio !== false) {
        if (typeof AudioContext === "undefined") {
          throw new XmaxError(
            "MEDIA_ERROR" /* mediaError */,
            "Web Audio is unavailable; disable file audio or use a supported browser"
          );
        }
        const audio = new AudioContext();
        source.audioContext = audio;
        source.audioSource = audio.createMediaElementSource(video);
        source.audioDestination = audio.createMediaStreamDestination();
        source.audioSource.connect(source.audioDestination);
      }
      video.src = source.url;
      const resume = source.audioContext?.resume();
      const playing = this.play(
        source,
        signal
      );
      await this.wait(
        source,
        Promise.all([resume, playing]),
        signal
      );
      video.pause();
      if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration) || video.duration <= 0) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "The file has no playable finite video stream"
        );
      }
      const size = mediaService.resolveMediaSize(
        {
          width: video.videoWidth,
          height: video.videoHeight
        },
        "video"
      );
      const format = options.videoFormat.resized(
        size.width,
        size.height
      );
      canvas.width = size.width;
      canvas.height = size.height;
      await this.rewind(
        source,
        signal
      );
      this.draw(source);
      source.stream = canvas.captureStream(format.fps);
      const nativeTrack = source.stream.getVideoTracks()[0];
      if (!nativeTrack) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "Canvas did not provide a video track"
        );
      }
      const track = new RealtimeVideoTrack({
        id: "local-video",
        videoFormat: format
      });
      track.mediaStreamTrack = nativeTrack;
      source.track = track;
      this.draw(source);
      source.drawTimer = setInterval(
        () => {
          if (this.source !== source) {
            return;
          }
          try {
            this.draw(source);
          } catch {
            this.handleError(source);
          }
        },
        1e3 / format.fps
      );
      source.onError = () => this.handleError(source);
      video.addEventListener(
        "error",
        source.onError
      );
      VideoRenderRegistry.register(
        track,
        {
          attachHandler: (view) => {
            view.isMirrored = false;
            view.setMediaStream(source.stream);
            source.targets.add(view);
          },
          detachHandler: (view) => {
            source.targets.delete(view);
            view.setMediaStream(null);
          }
        }
      );
      return new RealtimeMediaStream({
        id: "stream0" /* local */,
        videoTrack: track
      });
    } catch (error) {
      await this.stop();
      throw XmaxError.from(error);
    }
  }
  /**
   * Starts both tracks from the file beginning after start signaling, without waiting for a remote
   * frame.
   */
  async start(signal) {
    const source = this.source;
    if (!source?.track) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local video is not prepared"
      );
    }
    if (signal.aborted) {
      throw this.cancelled();
    }
    try {
      await this.rewind(
        source,
        signal
      );
      await this.wait(
        source,
        Promise.all([source.audioContext?.resume(), this.play(
          source,
          signal
        )]),
        signal
      );
    } catch (error) {
      source.video.pause();
      throw error;
    }
  }
  /**
   * Pauses file audio/video while retaining preview; restarting generation rewinds the file.
   */
  pause() {
    this.source?.video.pause();
  }
  /**
   * Releases the player, preview, timer, tracks, audio context, and Blob URL.
   */
  async stop() {
    const source = this.source;
    this.source = void 0;
    if (!source) {
      return;
    }
    source.abort.abort();
    clearInterval(source.drawTimer);
    if (source.onError) {
      source.video.removeEventListener(
        "error",
        source.onError
      );
    }
    if (source.track) {
      VideoRenderRegistry.unregister(source.track);
      source.track.mediaStreamTrack = void 0;
    }
    for (const view of source.targets) {
      try {
        view.setMediaStream(null);
      } catch {
      }
    }
    source.targets.clear();
    source.video.pause();
    source.video.removeAttribute("src");
    source.video.load();
    source.stream?.getTracks().forEach((track) => track.stop());
    source.audioDestination?.stream.getTracks().forEach((track) => track.stop());
    source.audioSource?.disconnect();
    source.audioDestination?.disconnect();
    URL.revokeObjectURL(source.url);
    await source.audioContext?.close().catch(() => {
    });
  }
  /**
   * Reports actionable playback rejection and pauses obsolete playback that completes after closure.
   */
  play(source, signal) {
    return source.video.play().then(() => {
      if (this.source !== source || source.abort.signal.aborted || signal.aborted) {
        source.video.pause();
        throw this.cancelled();
      }
    }).catch((error) => {
      if (error instanceof XmaxError) {
        throw error;
      }
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Cannot play local video; call from a user click and use a browser-supported video codec"
      );
    });
  }
  /**
   * Waits for rewind so restarted generation begins with the first frame rather than cached video.
   */
  async rewind(source, signal) {
    if (source.video.currentTime === 0) {
      return;
    }
    let seeked;
    const ready = new Promise((resolve) => {
      seeked = resolve;
    });
    source.video.addEventListener(
      "seeked",
      seeked,
      { once: true }
    );
    try {
      source.video.currentTime = 0;
      await this.wait(
        source,
        ready,
        signal
      );
    } finally {
      source.video.removeEventListener(
        "seeked",
        seeked
      );
    }
  }
  /**
   * Bounds browser preparation and playback to ten seconds while observing closure, cancellation, and
   * decode failure.
   */
  wait(source, operation, signal) {
    return new Promise((resolve, reject) => {
      const finish = (error) => {
        clearTimeout(timer);
        signal.removeEventListener(
          "abort",
          abort
        );
        source.abort.signal.removeEventListener(
          "abort",
          abort
        );
        source.video.removeEventListener(
          "error",
          failed
        );
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      const abort = () => finish(this.cancelled());
      const failed = () => finish(new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "The browser cannot decode this video file"
      ));
      const timer = setTimeout(
        () => finish(new XmaxError(
          "TIMEOUT" /* timeout */,
          "Local video preparation timed out; start from a user click and check the video codec"
        )),
        1e4
      );
      signal.addEventListener(
        "abort",
        abort,
        { once: true }
      );
      source.abort.signal.addEventListener(
        "abort",
        abort,
        { once: true }
      );
      source.video.addEventListener(
        "error",
        failed,
        { once: true }
      );
      operation.then(
        () => finish(),
        finish
      );
      if (signal.aborted || source.abort.signal.aborted) {
        abort();
      }
    });
  }
  /**
   * Scales the entire image to resolved media dimensions without generation padding or
   * device-orientation transposition.
   */
  draw(source) {
    const { video, canvas, context } = source;
    if (video.readyState < 2) {
      return;
    }
    context.fillStyle = "black";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
  /**
   * Stops media advancement and reports one runtime decode or drawing failure.
   */
  handleError(source) {
    if (this.source !== source || source.drawTimer === void 0) {
      return;
    }
    clearInterval(source.drawTimer);
    source.drawTimer = void 0;
    source.video.pause();
    XmaxLogger.realtime.warning(() => "\u672C\u5730\u89C6\u9891\u89E3\u7801\u5931\u8D25 (Local Video Decode Failed)");
    this.onError(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "Local video decoding failed"
    ));
  }
  /**
   * Creates the standard file-media cancellation error.
   */
  cancelled() {
    return new XmaxError(
      "CANCELLED" /* cancelled */,
      "Local video operation was cancelled"
    );
  }
};

var ExternalVideoTrackController = class {
  /**
   * Creates a controller with an external-track failure callback.
   */
  constructor(onError) {
    this.onError = onError;
  }
  /**
   * The SDK track associated with the external source.
   */
  track;
  /**
   * The callback reporting unexpected source termination.
   */
  onEnded = () => {
    this.onError(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "External video source ended"
    ));
  };
  /**
   * The external-video clone owned by the SDK.
   */
  get currentTrack() {
    return this.track;
  }
  /**
   * Validates and clones an external track, resolving its uplink baseline without modifying original
   * pixels.
   *
   * @param options - A live video track and its original media format.
   * @param mediaService - The model's media-sizing service.
   * @returns A local stream holding the cloned track and resolved fixed format.
   */
  create(options, mediaService) {
    if (this.track) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Close the current external video first"
      );
    }
    const { videoTrack, videoFormat } = options;
    if (!videoTrack || videoTrack.kind !== "video" || videoTrack.readyState !== "live" || typeof videoTrack.clone !== "function") {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "External video requires a live video MediaStreamTrack"
      );
    }
    const size = mediaService.resolveMediaSize(
      videoFormat,
      "external"
    );
    const format = videoFormat.resized(
      size.width,
      size.height
    );
    format.validate();
    const nativeTrack = videoTrack.clone();
    if (nativeTrack.readyState !== "live") {
      nativeTrack.stop();
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External video source ended during setup"
      );
    }
    const track = new RealtimeVideoTrack({
      id: "external-video",
      videoFormat: format
    });
    track.mediaStreamTrack = nativeTrack;
    nativeTrack.addEventListener(
      "ended",
      this.onEnded
    );
    this.track = track;
    return new RealtimeMediaStream({
      id: "stream0" /* local */,
      videoTrack: track
    });
  }
  /**
   * Removes termination observation and releases the SDK-owned clone.
   */
  stop() {
    const nativeTrack = this.track?.mediaStreamTrack;
    this.track = void 0;
    nativeTrack?.removeEventListener(
      "ended",
      this.onEnded
    );
    nativeTrack?.stop();
  }
};

async function waitForMediaOperation(operation, signal, timeoutMs, description) {
  let timer;
  let abort;
  try {
    const interrupted = new Promise((_, reject) => {
      abort = () => reject(new XmaxError(
        "CANCELLED" /* cancelled */,
        `${description} cancelled`
      ));
      timer = setTimeout(
        () => reject(new XmaxError(
          "TIMEOUT" /* timeout */,
          `${description} timed out`
        )),
        timeoutMs
      );
      signal.addEventListener(
        "abort",
        abort,
        { once: true }
      );
      if (signal.aborted) {
        abort();
      }
    });
    return await Promise.race([operation, interrupted]);
  } finally {
    clearTimeout(timer);
    if (abort) {
      signal.removeEventListener(
        "abort",
        abort
      );
    }
  }
}

var EXTERNAL_AUDIO_WORKLET = `
class XmaxExternalAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];
    this.epoch = 0;
    this.port.onmessage = ({ data }) => {
      if (data.type === "reset") {
        this.queue = [];
        this.epoch = data.epoch;
      } else if (data.epoch === this.epoch) {
        this.queue.push(data);
      }
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0][0];
    output.fill(0);
    for (let i = 0; i < output.length; i++) {
      const time = currentFrame + i;
      while (this.queue.length && time >= this.queue[0].end) {
        const packet = this.queue.shift();
        this.port.postMessage({ id: packet.id, epoch: packet.epoch });
      }
      const packet = this.queue[0];
      if (!packet || time < packet.start) continue;
      const position = (time - packet.start) * packet.rate / sampleRate;
      const left = Math.floor(position);
      const a = packet.samples[Math.min(left, packet.samples.length - 1)];
      const b = packet.samples[Math.min(left + 1, packet.samples.length - 1)];
      output[i] = a + (b - a) * (position - left);
    }
    return true;
  }
}
registerProcessor("xmax-external-audio", XmaxExternalAudioProcessor);
`;

var ExternalAudioFrameSource = class {
  /**
   * The audio context owning the processing graph and output track.
   */
  context;
  /**
   * The worklet that schedules copied PCM packets.
   */
  processor;
  /**
   * The output node that exposes the SDK-owned audio track.
   */
  destination;
  /**
   * The unexpected-output-end callback, removed before intentional cleanup.
   */
  onEnded;
  /**
   * The fixed PCM input format for the current binding.
   */
  format;
  /**
   * The expected next input timestamp, in source microseconds.
   */
  nextInputTime;
  /**
   * Whether incoming PCM is currently forwarded to the worklet.
   */
  published = false;
  /**
   * The sequence identifying packets within the bounded in-flight audio budget.
   */
  sequence = 0;
  /**
   * The queue revision used to ignore acknowledgments from earlier resets.
   */
  epoch = 0;
  /**
   * The total duration of unacknowledged audio packets, in seconds.
   */
  pendingSeconds = 0;
  /**
   * Unacknowledged packet durations, in seconds, indexed by sequence.
   */
  pending = /* @__PURE__ */ new Map();
  /**
   * The audio sampling clock, in microseconds, shared by video source-time mapping.
   */
  get nowUs() {
    return (this.context?.currentTime ?? 0) * 1e6;
  }
  /**
   * The SDK-owned audio track used as RTC input.
   */
  get track() {
    return this.destination?.stream.getAudioTracks()[0];
  }
  /**
   * Prepares the audio graph from a user gesture, releasing resources if loading, cancellation, or
   * autoplay restrictions prevent setup.
   */
  async prepare(signal, onError) {
    if (typeof AudioContext === "undefined" || typeof AudioWorkletNode === "undefined") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External PCM input requires AudioWorklet support"
      );
    }
    const context = new AudioContext({ sampleRate: 48e3 });
    this.context = context;
    let url;
    try {
      if (!context.audioWorklet) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "External PCM input requires a secure context with AudioWorklet"
        );
      }
      url = URL.createObjectURL(new Blob(
        [EXTERNAL_AUDIO_WORKLET],
        { type: "text/javascript" }
      ));
      await waitForMediaOperation(
        Promise.all([context.resume(), context.audioWorklet.addModule(url)]),
        signal,
        3e3,
        "External audio initialization; start from a user gesture"
      );
      if (context.state !== "running") {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "External audio must be initialized from a user gesture"
        );
      }
      const destination = new MediaStreamAudioDestinationNode(
        context,
        {
          channelCount: 1,
          channelCountMode: "explicit"
        }
      );
      this.destination = destination;
      const processor = new AudioWorkletNode(
        context,
        "xmax-external-audio",
        {
          numberOfInputs: 0,
          numberOfOutputs: 1,
          outputChannelCount: [1]
        }
      );
      this.processor = processor;
      processor.port.onmessage = ({ data }) => {
        if (this.processor !== processor || data?.epoch !== this.epoch) {
          return;
        }
        this.pendingSeconds = Math.max(0, this.pendingSeconds - (this.pending.get(data.id) ?? 0));
        this.pending.delete(data.id);
      };
      processor.onprocessorerror = () => onError(new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External audio processor failed"
      ));
      processor.connect(destination);
      if (!this.track || this.track.readyState !== "live") {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "External audio did not produce a live track"
        );
      }
      this.onEnded = () => onError(new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External audio output ended"
      ));
      this.track.addEventListener(
        "ended",
        this.onEnded
      );
    } catch (error) {
      await this.close();
      throw error;
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  }
  /**
   * Consumes input only while published, discarding queued audio on state changes instead of
   * accumulating it for reconnection.
   */
  setPublished(published) {
    if (this.published === published) {
      return;
    }
    this.published = published;
    this.reset();
  }
  /**
   * Clears worklet queues and in-flight budgets without changing input format or publication state.
   */
  reset() {
    this.pending.clear();
    this.pendingSeconds = 0;
    this.processor?.port.postMessage({
      type: "reset",
      epoch: ++this.epoch
    });
  }
  /**
   * Copies and downmixes PCM synchronously before scheduling it on the audio thread. Invalid or
   * overlapping timestamps are ignored; format changes throw.
   */
  push(frame, mapTime) {
    const timestamp = frame.timestamp;
    if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
      return;
    }
    const { sampleRate: rate, numberOfChannels: channels, numberOfFrames: frames, format } = frame;
    if (!format || !Number.isInteger(rate) || rate < 8e3 || rate > 192e3 || !Number.isInteger(channels) || channels < 1 || channels > 8 || !Number.isInteger(frames) || frames < 1 || frames > rate) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External audio requires live PCM at 8\u2013192 kHz, 1\u20138 channels, at most one second per packet"
      );
    }
    const identity = `${format}/${rate}/${channels}`;
    if (this.format && this.format !== identity) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External audio format must remain unchanged during a source binding"
      );
    }
    this.format = identity;
    if (this.nextInputTime !== void 0 && timestamp < this.nextInputTime - 5e5 / rate) {
      return;
    }
    const seconds = frames / rate;
    this.nextInputTime = timestamp + seconds * 1e6;
    const context = this.context;
    const processor = this.processor;
    if (!this.published || !context || !processor) {
      return;
    }
    if (context.state !== "running") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External audio context is suspended"
      );
    }
    const time = mapTime(timestamp);
    if (time + seconds * 1e6 <= this.nowUs) {
      return;
    }
    if (time > this.nowUs + 2e6 || this.pendingSeconds + seconds > 2 || this.pending.size >= 256) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External audio must be paced in real time; pending audio exceeds two seconds or 256 packets"
      );
    }
    const samples = new Float32Array(frames);
    const plane = new Float32Array(frames);
    for (let channel = 0; channel < channels; channel++) {
      frame.copyTo(
        plane,
        {
          planeIndex: channel,
          format: "f32-planar"
        }
      );
      for (let i = 0; i < frames; i++) {
        const value = Number.isFinite(plane[i]) ? plane[i] : 0;
        samples[i] += Math.max(-1, Math.min(1, value)) / channels;
      }
    }
    const id = ++this.sequence;
    const start = Math.round(time * context.sampleRate / 1e6);
    this.pending.set(
      id,
      seconds
    );
    this.pendingSeconds += seconds;
    processor.port.postMessage(
      {
        type: "packet",
        id,
        epoch: this.epoch,
        samples,
        rate,
        start,
        end: start + Math.round(seconds * context.sampleRate)
      },
      [samples.buffer]
    );
  }
  /**
   * Releases SDK audio tracks, processing nodes, and context without touching your app's source audio.
   */
  async close() {
    this.published = false;
    const context = this.context;
    this.context = void 0;
    if (this.onEnded) {
      this.track?.removeEventListener(
        "ended",
        this.onEnded
      );
      this.onEnded = void 0;
    }
    this.destination?.stream.getTracks().forEach((track) => track.stop());
    this.destination?.disconnect();
    this.destination = void 0;
    if (this.processor) {
      this.processor.onprocessorerror = null;
      this.processor.port.onmessage = null;
      this.processor.port.close();
      this.processor.disconnect();
      this.processor = void 0;
    }
    this.pending.clear();
    this.pendingSeconds = 0;
    if (context && context.state !== "closed") {
      await waitForMediaOperation(
        context.close(),
        new AbortController().signal,
        2e3,
        "External audio close"
      );
    }
  }
};

var ExternalVideoFrameSink = class {
  /**
   * Creates a sink with fixed formats, Canvas output, optional audio, and a terminal failure callback.
   */
  constructor(videoFormat, sourceFormat, context, track, audio, onError) {
    this.videoFormat = videoFormat;
    this.sourceFormat = sourceFormat;
    this.context = context;
    this.track = track;
    this.audio = audio;
    this.onError = onError;
  }
  /**
   * Whether the binding still accepts input.
   */
  active = true;
  /**
   * The last accepted video timestamp, in source microseconds.
   */
  lastVideoTime = -1;
  /**
   * The source and output clock origins, both in microseconds.
   */
  anchor;
  /**
   * The next scheduled frame; a newer frame must not repeatedly postpone its presentation.
   */
  pending;
  /**
   * The latest successor frame and its scheduled output timestamp, in microseconds.
   */
  next;
  /**
   * The timer presenting the pending video frame.
   */
  timer;
  /**
   * Whether frames are accepted, including disconnected preview; false after release or failure.
   */
  get isRequestingFrames() {
    return this.active;
  }
  /**
   * Clones video synchronously so the caller may close the original afterward; invalid timestamps are
   * ignored.
   */
  pushVideo(frame) {
    if (!this.active || !Number.isSafeInteger(frame.timestamp) || frame.timestamp < 0 || frame.timestamp <= this.lastVideoTime) {
      return;
    }
    try {
      if (frame.displayWidth !== this.sourceFormat.width || frame.displayHeight !== this.sourceFormat.height) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "External video frame dimensions must match source.videoFormat"
        );
      }
      const time = this.mapTime(frame.timestamp);
      const copy = frame.clone();
      this.lastVideoTime = frame.timestamp;
      if (this.pending) {
        this.next?.frame.close();
        this.next = {
          frame: copy,
          time
        };
      } else {
        this.scheduleVideo(
          copy,
          time
        );
      }
    } catch (error) {
      this.reportError(XmaxError.from(error));
    }
  }
  /**
   * Presents the scheduled frame and then the latest successor, retaining at most two copies.
   */
  scheduleVideo(copy, time) {
    this.pending = copy;
    this.timer = setTimeout(
      () => {
        this.pending = void 0;
        this.timer = void 0;
        try {
          if (this.active) {
            this.context.drawImage(
              copy,
              0,
              0,
              this.videoFormat.width,
              this.videoFormat.height
            );
            this.track.requestFrame?.();
          }
        } catch (error) {
          this.reportError(XmaxError.from(error));
        } finally {
          copy.close();
        }
        const next = this.next;
        this.next = void 0;
        if (this.active && next) {
          this.scheduleVideo(
            next.frame,
            next.time
          );
        }
      },
      Math.max(0, (time - this.nowUs()) / 1e3)
    );
  }
  /**
   * Copies audio using the shared video time mapping, ignoring audio when the source did not declare it.
   */
  pushAudio(frame) {
    if (!this.active || !this.audio) {
      return;
    }
    try {
      this.audio.push(
        frame,
        (timestamp) => this.mapTime(timestamp)
      );
    } catch (error) {
      this.reportError(XmaxError.from(error));
    }
  }
  /**
   * Invalidates input on the first failure before notifying lifecycle cleanup.
   */
  reportError(error) {
    if (!this.active) {
      return;
    }
    this.invalidate();
    this.onError(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      `External source failed: ${error.message}`
    ));
  }
  /**
   * Releases queued copies and audio without owning input frames or app capture devices.
   */
  invalidate() {
    this.active = false;
    this.clearVideo();
    this.audio?.setPublished(false);
  }
  /**
   * Releases pending video-frame copies.
   */
  clearVideo() {
    clearTimeout(this.timer);
    this.timer = void 0;
    this.pending?.close();
    this.pending = void 0;
    this.next?.frame.close();
    this.next = void 0;
  }
  /**
   * Returns the audio sampling clock when available, otherwise the browser monotonic clock, in
   * microseconds.
   */
  nowUs() {
    return this.audio?.nowUs ?? performance.now() * 1e3;
  }
  /**
   * Maps both tracks with a shared 20 ms scheduling allowance, reanchoring after pauses or long stalls
   * without replaying old queues.
   */
  mapTime(timestamp) {
    const now = this.nowUs();
    let time = this.anchor ? this.anchor.output + timestamp - this.anchor.source : now + 2e4;
    if (!this.anchor || time < now - 25e4) {
      this.clearVideo();
      this.audio?.reset();
      this.anchor = {
        source: timestamp,
        output: now + 2e4
      };
      time = this.anchor.output;
    }
    if (time > now + 2e6) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External frames must use a shared monotonic timeline and be paced in real time"
      );
    }
    return time;
  }
};

var ExternalVideoController = class {
  /**
   * Creates a controller with a terminal source-failure callback.
   */
  constructor(onError) {
    this.onError = onError;
  }
  /**
   * The active or preparing binding, preventing concurrent replacement.
   */
  binding;
  /**
   * Whether a source is preparing or bound.
   */
  get isActive() {
    return this.binding !== void 0;
  }
  /**
   * The SDK video track available for preview and publication.
   */
  get currentTrack() {
    return this.binding?.track;
  }
  /**
   * The publishable audio track created when the source declares audio.
   */
  get audioTrack() {
    return this.binding?.audio?.track;
  }
  /**
   * Prepares output and calls source.start without waiting for a frame, stopping the binding on
   * cancellation or failure.
   */
  async create(source, media, signal) {
    if (this.binding) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Close the current external frame source first"
      );
    }
    if (!source || typeof source.start !== "function" || typeof source.stop !== "function" || source.hasAudio !== void 0 && typeof source.hasAudio !== "boolean") {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "A valid external video source is required"
      );
    }
    source.videoFormat.validate();
    const size = media.resolveMediaSize(
      source.videoFormat,
      "external"
    );
    const sourceFormat = source.videoFormat.resized(
      source.videoFormat.width,
      source.videoFormat.height
    );
    const format = sourceFormat.resized(
      size.width,
      size.height
    );
    if (signal.aborted) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "External source creation cancelled"
      );
    }
    if (typeof document === "undefined" || typeof VideoFrame === "undefined") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External frames require a browser with VideoFrame support"
      );
    }
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext(
      "2d",
      { alpha: false }
    );
    if (!context || typeof canvas.captureStream !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Canvas video capture is unavailable"
      );
    }
    const stream = canvas.captureStream(format.fps);
    const native = stream.getVideoTracks()[0];
    if (!native || native.readyState !== "live") {
      stream.getTracks().forEach((track2) => track2.stop());
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Canvas did not provide a live external video track"
      );
    }
    const track = new RealtimeVideoTrack({
      id: "external-frames",
      videoFormat: format
    });
    track.mediaStreamTrack = native;
    const binding = {
      source,
      canvas,
      stream,
      track,
      abort: new AbortController(),
      targets: /* @__PURE__ */ new Set()
    };
    this.binding = binding;
    const abort = () => binding.abort.abort();
    signal.addEventListener(
      "abort",
      abort,
      { once: true }
    );
    if (signal.aborted) {
      abort();
    }
    try {
      if (source.hasAudio) {
        binding.audio = new ExternalAudioFrameSource();
        await binding.audio.prepare(
          binding.abort.signal,
          (error) => {
            if (binding.sink) {
              binding.sink.reportError(error);
            } else {
              binding.abort.abort();
              if (this.binding === binding) {
                this.onError(error);
              }
            }
          }
        );
      }
      const sink = new ExternalVideoFrameSink(
        format,
        sourceFormat,
        context,
        native,
        binding.audio,
        (error) => {
          if (this.binding === binding) {
            this.onError(error);
          }
        }
      );
      binding.sink = sink;
      binding.onEnded = () => sink.reportError(new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "External video output ended"
      ));
      native.addEventListener(
        "ended",
        binding.onEnded
      );
      VideoRenderRegistry.register(
        track,
        {
          attachHandler: (view) => {
            if (this.binding !== binding) {
              return;
            }
            view.isMirrored = false;
            view.setMediaStream(stream);
            binding.targets.add(view);
          },
          detachHandler: (view) => {
            binding.targets.delete(view);
            view.setMediaStream(null);
          }
        }
      );
      await waitForMediaOperation(
        Promise.resolve(source.start(sink)),
        binding.abort.signal,
        1e4,
        "External source startup"
      );
      if (this.binding !== binding || binding.abort.signal.aborted || !sink.isRequestingFrames) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "External source is no longer attached"
        );
      }
      return new RealtimeMediaStream({
        id: "stream0" /* local */,
        videoTrack: track
      });
    } catch (error) {
      if (this.binding === binding) {
        await this.stop();
      }
      throw XmaxError.from(error);
    } finally {
      signal.removeEventListener(
        "abort",
        abort
      );
    }
  }
  /**
   * Consumes audio only while RTC publication is active.
   */
  setAudioPublished(published) {
    this.binding?.audio?.setPublished(published && this.binding.sink?.isRequestingFrames === true);
  }
  /**
   * Synchronously rejects further frames before connection or media resources are released.
   */
  invalidate() {
    this.binding?.sink?.invalidate();
    this.binding?.abort.abort();
  }
  /**
   * Invalidates the sink and releases SDK output before a bounded wait for the app's stop callback.
   */
  async stop() {
    const binding = this.binding;
    if (!binding) {
      return;
    }
    this.binding = void 0;
    binding.abort.abort();
    binding.sink?.invalidate();
    const native = binding.track.mediaStreamTrack;
    if (binding.onEnded) {
      native?.removeEventListener(
        "ended",
        binding.onEnded
      );
    }
    VideoRenderRegistry.unregister(binding.track);
    binding.track.mediaStreamTrack = void 0;
    for (const view of binding.targets) {
      try {
        view.setMediaStream(null);
      } catch {
      }
    }
    binding.targets.clear();
    binding.stream.getTracks().forEach((track) => track.stop());
    binding.canvas.width = 0;
    binding.canvas.height = 0;
    const results = await Promise.allSettled([
      binding.audio?.close(),
      waitForMediaOperation(
        Promise.resolve().then(() => binding.source.stop()),
        new AbortController().signal,
        2e3,
        "External source stop"
      )
    ]);
    for (const result of results) {
      if (result.status === "rejected") {
        XmaxLogger.media.warning(() => `External source cleanup failed: ${XmaxError.from(result.reason).message}`);
      }
    }
  }
};

var ImageController = class {
  /**
   * Creates an image controller with a runtime failure callback.
   */
  constructor(onError) {
    this.onError = onError;
  }
  /**
   * The active image source, including pending decoding.
   */
  source;
  /**
   * Whether an image source is preparing or available.
   */
  get isActive() {
    return this.source !== void 0;
  }
  /**
   * The prepared still-image video track.
   */
  get currentTrack() {
    return this.source?.track;
  }
  /**
   * Decodes the image and continuously outputs its still snapshot, releasing resources on failure or
   * cancellation.
   */
  async create(options, mediaService, signal) {
    if (this.source) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Close the current local image before creating another one"
      );
    }
    if (!(options.file instanceof Blob) || options.file.size === 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Local image requires a non-empty File or Blob"
      );
    }
    options.videoFormat.validate();
    if (signal.aborted) {
      throw this.cancelled();
    }
    if (typeof document === "undefined") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Local image requires a browser"
      );
    }
    const image = document.createElement("img");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context || typeof canvas.captureStream !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Canvas video capture is unavailable"
      );
    }
    const source = {
      image,
      canvas,
      url: URL.createObjectURL(options.file),
      abort: new AbortController(),
      targets: /* @__PURE__ */ new Set()
    };
    this.source = source;
    try {
      await this.load(
        source,
        signal
      );
      if (signal.aborted || this.source !== source) {
        throw this.cancelled();
      }
      if (!image.naturalWidth || !image.naturalHeight) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "The image has no valid dimensions"
        );
      }
      const size = mediaService.resolveMediaSize(
        {
          width: image.naturalWidth,
          height: image.naturalHeight
        },
        "image"
      );
      const format = options.videoFormat.resized(
        size.width,
        size.height
      );
      canvas.width = size.width;
      canvas.height = size.height;
      context.fillStyle = "black";
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );
      source.stream = canvas.captureStream(format.fps);
      const nativeTrack = source.stream.getVideoTracks()[0];
      if (!nativeTrack || nativeTrack.readyState !== "live") {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "Canvas did not provide a live video track"
        );
      }
      const track = new RealtimeVideoTrack({
        id: "local-image",
        videoFormat: format
      });
      track.mediaStreamTrack = nativeTrack;
      source.track = track;
      const refresh = () => {
        context.drawImage(
          canvas,
          0,
          0
        );
        if (typeof nativeTrack.requestFrame === "function") {
          nativeTrack.requestFrame();
        }
      };
      refresh();
      source.timer = setInterval(
        () => {
          if (this.source !== source) {
            return;
          }
          try {
            refresh();
          } catch {
            this.handleError(source);
          }
        },
        1e3 / format.fps
      );
      source.onEnded = () => this.handleError(source);
      nativeTrack.addEventListener(
        "ended",
        source.onEnded
      );
      VideoRenderRegistry.register(
        track,
        {
          attachHandler: (view) => {
            if (this.source !== source) {
              return;
            }
            view.isMirrored = false;
            view.setMediaStream(source.stream);
            source.targets.add(view);
          },
          detachHandler: (view) => {
            source.targets.delete(view);
            view.setMediaStream(null);
          }
        }
      );
      return new RealtimeMediaStream({
        id: "stream0" /* local */,
        videoTrack: track
      });
    } catch (error) {
      if (this.source === source) {
        this.stop();
      }
      throw XmaxError.from(error);
    }
  }
  /**
   * Cancels decoding, clears preview, and releases tracks, timers, and the Blob URL.
   */
  stop() {
    const source = this.source;
    this.source = void 0;
    if (!source) {
      return;
    }
    source.abort.abort();
    clearInterval(source.timer);
    if (source.track) {
      VideoRenderRegistry.unregister(source.track);
      if (source.onEnded) {
        source.track.mediaStreamTrack?.removeEventListener(
          "ended",
          source.onEnded
        );
      }
      source.track.mediaStreamTrack = void 0;
    }
    for (const view of source.targets) {
      try {
        view.setMediaStream(null);
      } catch {
      }
    }
    source.targets.clear();
    source.stream?.getTracks().forEach((track) => track.stop());
    source.image.removeAttribute("src");
    URL.revokeObjectURL(source.url);
    source.canvas.width = 0;
    source.canvas.height = 0;
  }
  /**
   * Waits for browser image decoding with stop, cancellation, and timeout support.
   */
  load(source, signal) {
    return new Promise((resolve, reject) => {
      const finish = (error) => {
        clearTimeout(timer);
        source.image.removeEventListener(
          "load",
          loaded
        );
        source.image.removeEventListener(
          "error",
          failed
        );
        signal.removeEventListener(
          "abort",
          aborted
        );
        source.abort.signal.removeEventListener(
          "abort",
          aborted
        );
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
      const loaded = () => finish();
      const failed = () => finish(new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "The browser cannot decode this image file"
      ));
      const aborted = () => finish(this.cancelled());
      const timer = setTimeout(
        () => finish(new XmaxError(
          "TIMEOUT" /* timeout */,
          "Local image preparation timed out"
        )),
        1e4
      );
      source.image.addEventListener(
        "load",
        loaded,
        { once: true }
      );
      source.image.addEventListener(
        "error",
        failed,
        { once: true }
      );
      signal.addEventListener(
        "abort",
        aborted,
        { once: true }
      );
      source.abort.signal.addEventListener(
        "abort",
        aborted,
        { once: true }
      );
      if (signal.aborted || source.abort.signal.aborted) {
        aborted();
      } else {
        source.image.src = source.url;
      }
    });
  }
  /**
   * Stops refresh and reports one output failure, leaving resource cleanup to the media lifecycle.
   */
  handleError(source) {
    if (this.source !== source || source.timer === void 0) {
      return;
    }
    clearInterval(source.timer);
    source.timer = void 0;
    this.onError(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "Local image video output failed"
    ));
  }
  /**
   * Creates a standard image-operation cancellation error.
   */
  cancelled() {
    return new XmaxError(
      "CANCELLED" /* cancelled */,
      "Local image operation was cancelled"
    );
  }
};

var RealtimePoint = class {
  /**
   * The horizontal media coordinate.
   */
  x;
  /**
   * The vertical media coordinate.
   */
  y;
  /**
   * Creates a media-space point.
   */
  constructor(init) {
    this.x = init.x;
    this.y = init.y;
  }
};

var InteractionCoordinateMapper = class {
  /**
   * Returns the centered displayed-video rectangle; fill may extend outside the viewport and fit may
   * leave margins.
   */
  static displayedFrame(viewport, video, mode) {
    if (![viewport.width, viewport.height, video.width, video.height].every((value) => Number.isFinite(value) && value > 0)) {
      return void 0;
    }
    const scale = (mode === "fill" /* fill */ ? Math.max : Math.min)(
      viewport.width / video.width,
      viewport.height / video.height
    );
    const width = video.width * scale;
    const height = video.height * scale;
    return {
      x: (viewport.width - width) / 2,
      y: (viewport.height - height) / 2,
      width,
      height
    };
  }
  /**
   * Rejects margins and invalid points, removes display mirroring, and returns normalized coordinates.
   * The optional pixels mode returns media-pixel coordinates.
   */
  static map(point, frame, video, coordinateSpace = "normalized") {
    const rect = this.displayedFrame(
      frame.viewportSize,
      video,
      frame.contentMode
    );
    if (!rect || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      return void 0;
    }
    if (frame.contentMode === "fit" /* fit */ && (point.x < rect.x || point.x > rect.x + rect.width || point.y < rect.y || point.y > rect.y + rect.height)) {
      return void 0;
    }
    const displayedX = (point.x - rect.x) / rect.width;
    const x = frame.mirrored ? 1 - displayedX : displayedX;
    const y = (point.y - rect.y) / rect.height;
    if (coordinateSpace === "pixels") {
      return new RealtimePoint({
        x: Math.min(video.width - 1, Math.max(0, Math.round(x * video.width))),
        y: Math.min(video.height - 1, Math.max(0, Math.round(y * video.height)))
      });
    }
    return new RealtimePoint({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y))
    });
  }
};

var InteractionController = class {
  /**
   * Creates an interaction controller with a sender, without owning a room or RTC adapter.
   */
  constructor(listener) {
    this.listener = listener;
  }
  /**
   * The active task and fixed format, identified by object identity across task replacement.
   */
  active;
  /**
   * The latest interaction sample retained while sending is busy.
   */
  pending;
  /**
   * The interaction context whose samples are currently being drained.
   */
  draining;
  /**
   * Activates a task or updates its input format, discarding obsolete samples.
   */
  startInteraction(taskID, videoFormat, coordinateSpace = "normalized") {
    this.stopInteraction();
    if (taskID) {
      this.active = {
        taskID,
        videoFormat,
        coordinateSpace
      };
    }
  }
  /**
   * Invalidates interaction immediately; messages already submitted to RTC cannot be recalled.
   */
  stopInteraction() {
    this.active = void 0;
    this.pending = void 0;
    this.draining = void 0;
  }
  /**
   * Maps points synchronously and replaces pending samples to avoid constrained-network backlogs.
   */
  submitInteraction(frame) {
    const context = this.active;
    if (!context) {
      return;
    }
    const points = frame.points.flatMap((point) => {
      const mapped = InteractionCoordinateMapper.map(
        point,
        frame,
        context.videoFormat,
        context.coordinateSpace
      );
      return mapped ? [mapped] : [];
    });
    if (!points.length) {
      return;
    }
    this.pending = {
      context,
      points
    };
    if (this.draining !== context) {
      void this.drain(context);
    }
  }
  /**
   * Sends samples in order; a failed sample does not stop generation or subsequent interaction.
   */
  async drain(context) {
    this.draining = context;
    try {
      while (this.active === context && this.pending?.context === context) {
        const { points } = this.pending;
        this.pending = void 0;
        try {
          await this.listener(
            context.taskID,
            points
          );
        } catch {
          if (context === this.active) {
            XmaxLogger.interaction.warning(() => "\u53D1\u9001\u4EA4\u4E92\u8F68\u8FF9\u5931\u8D25\uFF0C\u5DF2\u4E22\u5F03\u5F53\u524D\u91C7\u6837\u5E27 (Interaction Sample Dropped)");
          }
        }
      }
    } finally {
      if (this.draining === context) {
        this.draining = void 0;
      }
    }
  }
};

var MediaController = class {
  /**
   * Creates a media controller from foundational services and failure/interaction callbacks.
   */
  constructor(dependencies) {
    this.dependencies = dependencies;
    this.camera = dependencies.cameraController ?? new CameraController({
      rtcManager: dependencies.rtcManager,
      mediaService: dependencies.mediaService,
      errorListener: dependencies.onCameraError
    });
    this.video = new VideoController(dependencies.onVideoError);
    this.image = new ImageController(dependencies.onImageError);
    this.external = new ExternalVideoTrackController(dependencies.onExternalError);
    this.externalFrames = new ExternalVideoController(dependencies.onExternalError);
    this.interaction = new InteractionController(dependencies.interactionListener);
  }
  /**
   * The camera capture and preview controller.
   */
  camera;
  /**
   * The local-file playback and audio/video output controller.
   */
  video;
  /**
   * The still-image video-output controller.
   */
  image;
  /**
   * The external-track ownership and termination controller.
   */
  external;
  /**
   * The external-frame-source, audio, and preview controller.
   */
  externalFrames;
  /**
   * The coordinate-mapping and serialized interaction sender.
   */
  interaction;
  /**
   * The current publishable source track.
   */
  get currentTrack() {
    return this.externalFrames.currentTrack ?? this.external.currentTrack ?? this.video.currentTrack ?? this.image.currentTrack ?? this.camera.currentTrack;
  }
  /**
   * The source kind derived from actual resources without duplicate media state.
   */
  get source() {
    if (this.externalFrames.isActive || this.external.currentTrack) {
      return "externalVideo";
    }
    if (this.video.isActive) {
      return "localVideo";
    }
    if (this.image.isActive) {
      return "localImage";
    }
    if (this.camera.currentTrack) {
      return "camera";
    }
    return void 0;
  }
  /**
   * Whether the active source supplies publishable audio.
   */
  get hasAudio() {
    if (this.externalFrames.isActive) {
      return !!this.externalFrames.audioTrack;
    }
    return this.video.isActive ? !!this.video.audioTrack : this.source === "camera" && this.camera.useMicrophone;
  }
  /**
   * Whether this camera source requires pre-publication warmup.
   */
  get isFrameValidationEnabled() {
    return this.source === "camera" && this.camera.isFrameValidationEnabled;
  }
  /**
   * Rejects creation over an active source or pending media preparation.
   */
  ensureNoLocalSource() {
    if (this.currentTrack || this.externalFrames.isActive || this.video.isActive || this.image.isActive) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Close the current local stream before creating another one"
      );
    }
  }
  /**
   * Validates the adapter's external-media capability.
   */
  validateExternalMediaSupport(kind) {
    if (!this.dependencies.rtcManager.setExternalMediaTracks) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        `The RTC provider does not support ${kind} video streams`
      );
    }
  }
  /**
   * Creates camera media using the camera controller's RTC and preview resources.
   */
  createLocalCameraStream(options) {
    this.ensureNoLocalSource();
    return this.camera.createLocalCameraStream(options);
  }
  /**
   * Updates the active camera format without replacing preview or other media resources.
   */
  updateCameraFormat(videoFormat) {
    if (this.source !== "camera") {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Camera preview is not started"
      );
    }
    return this.camera.updateVideoFormat(videoFormat);
  }
  /**
   * Unlocks user-initiated playback before prepareSource initializes RTC.
   */
  createLocalVideoStream(options, signal) {
    this.ensureNoLocalSource();
    return this.video.create(
      options,
      this.dependencies.mediaService,
      signal
    );
  }
  /**
   * Decodes an image into a still-video track without requesting device permission.
   */
  createLocalImageStream(options, signal) {
    this.ensureNoLocalSource();
    return this.image.create(
      options,
      this.dependencies.mediaService,
      signal
    );
  }
  /**
   * Binds a frame source or compatibility-track clone without stopping app-owned capture.
   */
  async createExternalVideoStream(options, signal) {
    this.ensureNoLocalSource();
    if (options.source !== void 0) {
      if (options.videoTrack !== void 0 || options.videoFormat !== void 0) {
        throw new XmaxError(
          "INVALID_CONFIGURATION" /* invalidConfiguration */,
          "External source and video track options cannot be combined"
        );
      }
      return this.externalFrames.create(
        options.source,
        this.dependencies.mediaService,
        signal
      );
    }
    return this.external.create(
      options,
      this.dependencies.mediaService
    );
  }
  /**
   * Passes publication state to external audio without affecting camera or file sources.
   */
  setExternalAudioPublished(published) {
    this.externalFrames.setAudioPublished(published);
  }
  /**
   * Initializes RTC and installs non-camera tracks, validating operation ownership across asynchronous
   * boundaries.
   */
  async prepareSource(ensureCurrent) {
    const rtc = this.dependencies.rtcManager;
    await rtc.initialize();
    ensureCurrent();
    const track = this.externalFrames.currentTrack ?? this.external.currentTrack ?? this.video.currentTrack ?? this.image.currentTrack;
    if (track?.mediaStreamTrack) {
      await rtc.setExternalMediaTracks({
        videoTrack: track.mediaStreamTrack,
        audioTrack: this.externalFrames.isActive ? this.externalFrames.audioTrack : this.video.audioTrack
      });
      ensureCurrent();
    }
  }
  /**
   * Sets the camera-preview readiness callback.
   */
  setCameraPreviewReadyHandler(handler) {
    this.camera.setPreviewReadyHandler(handler);
  }
  /**
   * Waits for camera warmup.
   */
  waitForValidCameraFrame(signal) {
    return this.camera.waitForValidCameraFrame(signal);
  }
  /**
   * Switches camera capture; external devices remain controlled by your app.
   */
  switchCamera() {
    if (this.externalFrames.isActive || this.external.currentTrack) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "External video capture is managed by the caller"
      );
    }
    return this.camera.switchCamera();
  }
  /**
   * Stops camera resources.
   */
  stopLocalCameraStream() {
    return this.camera.stopLocalCameraStream();
  }
  /**
   * Starts file playback after generation signaling.
   */
  startLocalVideo(signal) {
    return this.video.start(signal);
  }
  /**
   * Pauses the file timeline while retaining preview resources during disconnection.
   */
  pauseLocalVideo() {
    this.video.pause();
  }
  /**
   * Releases the current source, ensuring RTC teardown failure does not skip external-track or decoder
   * cleanup.
   */
  async stopLocalStream() {
    this.stopInteraction();
    const external = this.source !== void 0 && this.source !== "camera";
    this.externalFrames.invalidate();
    try {
      if (external) {
        await this.dependencies.rtcManager.destroy();
      } else {
        await this.camera.stopLocalCameraStream();
      }
    } finally {
      this.external.stop();
      await this.externalFrames.stop();
      if (this.image.isActive) {
        this.image.stop();
      }
      if (this.video.isActive) {
        await this.video.stop();
      }
    }
  }
  /**
   * Enables interaction against the fixed media baseline, including normalized external-video
   * coordinates. Adapted encoding dimensions and generation canvases do not affect this mapping.
   */
  startInteraction(taskID, format) {
    this.interaction.startInteraction(
      taskID,
      format
    );
  }
  /**
   * Drops pending interaction samples immediately when a task ends.
   */
  stopInteraction() {
    this.interaction.stopInteraction();
  }
  /**
   * Routes a render-layer snapshot through coordinate mapping and message submission.
   */
  submitInteraction(frame) {
    this.interaction.submitInteraction(frame);
  }
};

function resolvedVideoBeautyOptions(options) {
  const resolved = {
    smoothness: options.smoothness ?? 0,
    lightening: options.lightening ?? 0,
    sharpness: options.sharpness ?? 0,
    redness: options.redness ?? 0
  };
  if (Object.values(resolved).some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "Beauty strengths must be finite numbers from 0 to 1"
    );
  }
  return Object.freeze(resolved);
}

var runtime;
function loadRuntime() {
  runtime ??= Promise.all([
    import("./AgoraRTC_N-production-FHAKXOXU.js"),
    import("./agora-extension-beauty-EDQ6TXHH.js")
  ]).then(([agora, beauty]) => {
    const sdk = agora.default;
    const extension = new beauty.default();
    sdk.registerExtensions([extension]);
    return { sdk, extension };
  }).catch((error) => {
    runtime = void 0;
    throw error;
  });
  return runtime;
}
var AgoraBeautyController = class {
  /**
   * Receives the processor's owned display track.
   */
  onOutput;
  /**
   * Reports processing overload without terminating the received stream.
   */
  onError;
  /**
   * Loads or supplies the processing runtime.
   */
  load;
  /**
   * The unpublished wrapper owning a clone of the input track.
   */
  source;
  /**
   * The active extension processor.
   */
  processor;
  /**
   * The latest strengths, including updates received during lazy loading.
   */
  options = resolvedVideoBeautyOptions({});
  /**
   * The extension-generated display track.
   */
  output;
  /**
   * Whether cleanup has invalidated pending loading or output.
   */
  disposed = false;
  /**
   * The first processed output deadline.
   */
  timer;
  /**
   * Cancels the first-output wait during cleanup.
   */
  cancelReady;
  /**
   * Creates processing callbacks and an injectable runtime loader.
   */
  constructor(onOutput, onError, load = loadRuntime) {
    this.onOutput = onOutput;
    this.onError = onError;
    this.load = load;
  }
  /**
   * Starts processing an existing video track, rejecting unsupported devices or a missing processed
   * output after five seconds. The caller retains the input track.
   */
  async start(track, options) {
    this.update(options);
    const { sdk, extension } = await this.load();
    if (this.disposed) {
      return;
    }
    const clone = track.clone();
    try {
      this.source = sdk.createCustomVideoTrack({ mediaStreamTrack: clone });
    } catch (error) {
      clone.stop();
      throw error;
    }
    const processor = extension.createProcessor();
    this.processor = processor;
    this.update(this.options);
    processor.onoverload = () => this.onError(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "Beauty processing overloaded this device; the original video has been restored"
    ));
    const ready = new Promise((resolve, reject) => {
      this.cancelReady = () => reject(new XmaxError(
        "CANCELLED" /* cancelled */,
        "Beauty processing was stopped"
      ));
      this.timer = setTimeout(() => reject(new XmaxError(
        "TIMEOUT" /* timeout */,
        "Beauty processing did not produce a video track"
      )), 5e3);
      const destination = {
        name: "XmaxBeautyOutput",
        ID: "xmax-beauty-output",
        kind: "video",
        enabled: true,
        on: () => {
        },
        off: () => {
        },
        enable: () => {
        },
        disable: () => {
        },
        reset: () => {
        },
        unpipe: () => {
        },
        pipe: (next) => next,
        updateInput: (input) => {
          const output = input.track;
          if (!output || output === clone) {
            return;
          }
          if (this.disposed) {
            output.stop();
            return;
          }
          clearTimeout(this.timer);
          this.output = output;
          this.onOutput(output);
          resolve();
        }
      };
      this.source.pipe(processor).pipe(destination);
    });
    void ready.catch(() => {
    });
    try {
      await processor.enable();
      await ready;
    } finally {
      clearTimeout(this.timer);
      this.cancelReady = void 0;
    }
  }
  /**
   * Updates strengths without replacing the current processor or display track.
   */
  update(options) {
    const values = resolvedVideoBeautyOptions(options);
    this.options = values;
    this.processor?.setOptions({
      lighteningContrastLevel: 1,
      lighteningLevel: values.lightening,
      smoothnessLevel: values.smoothness,
      sharpnessLevel: values.sharpness,
      rednessLevel: values.redness
    });
  }
  /**
   * Invalidates late output and releases the worker, wrapper, and owned tracks without stopping input.
   */
  async dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    clearTimeout(this.timer);
    this.cancelReady?.();
    let failure;
    for (const release of [
      () => this.source?.unpipe(),
      () => this.processor?.unpipe(),
      () => this.source?.close(),
      () => this.output?.stop(),
      () => this.processor?.release()
    ]) {
      try {
        await release();
      } catch (error) {
        failure ??= error;
      }
    }
    if (failure) {
      throw failure;
    }
  }
};

var StableVideoOutput = class {
  /**
   * Creates a browser output surface without loading beauty dependencies.
   */
  constructor(onOutput, onError) {
    this.onOutput = onOutput;
    this.onError = onError;
    if (typeof document === "undefined") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Result beauty requires browser video and canvas support"
      );
    }
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext?.(
      "2d",
      { alpha: false }
    );
    if (!context || typeof this.canvas.captureStream !== "function") {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Result beauty requires canvas capture support"
      );
    }
    this.context = context;
    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.playsInline = true;
    Object.assign(
      this.video.style,
      {
        position: "fixed",
        top: "0",
        left: "0",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none"
      }
    );
    this.video.setAttribute(
      "aria-hidden",
      "true"
    );
    document.body.appendChild(this.video);
    this.timer = setTimeout(
      () => this.onError(new XmaxError(
        "TIMEOUT" /* timeout */,
        "Shared result video did not produce a frame"
      )),
      5e3
    );
  }
  /**
   * The hidden decoder for the currently selected input.
   */
  video;
  /**
   * The shared unmirrored result surface.
   */
  canvas;
  /**
   * The drawing context retained until output is released.
   */
  context;
  /**
   * The owned canvas stream, created after a valid frame.
   */
  stream;
  /**
   * The pending browser frame callback.
   */
  frameCallback;
  /**
   * The animation-frame fallback for browsers without video frame callbacks.
   */
  animationFrame;
  /**
   * The revision rejecting callbacks from a replaced input.
   */
  revision = 0;
  /**
   * Whether output has been released.
   */
  disposed = false;
  /**
   * Bounds the initial result-frame wait without running a permanent timer.
   */
  timer;
  /**
   * Changes borrowed input without replacing the owned output track.
   */
  setSource(track) {
    if (this.disposed) {
      return;
    }
    this.cancelFrame();
    const revision = ++this.revision;
    const video = this.video;
    video.srcObject = new MediaStream([track]);
    let previousTime = -1;
    const current = () => !this.disposed && this.revision === revision;
    const fail = (error) => {
      if (current()) {
        this.cancelFrame();
        this.onError(error);
      }
    };
    video.onerror = () => fail(new XmaxError(
      "MEDIA_ERROR" /* mediaError */,
      "Result video playback failed"
    ));
    const tick = () => {
      if (!current()) {
        return;
      }
      try {
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && video.currentTime !== previousTime) {
          if (this.canvas.width !== video.videoWidth || this.canvas.height !== video.videoHeight) {
            this.canvas.width = video.videoWidth;
            this.canvas.height = video.videoHeight;
          }
          this.context.drawImage(
            video,
            0,
            0
          );
          previousTime = video.currentTime;
          if (!this.stream) {
            this.stream = this.canvas.captureStream(0);
            if (typeof this.stream.getVideoTracks()[0]?.requestFrame !== "function") {
              this.stream.getTracks().forEach((item) => item.stop());
              this.stream = this.canvas.captureStream(60);
            }
            const output = this.stream.getVideoTracks()[0];
            if (!output) {
              throw new XmaxError(
                "MEDIA_ERROR" /* mediaError */,
                "Canvas did not produce a result video track"
              );
            }
            clearTimeout(this.timer);
            this.onOutput(output);
          }
          this.stream.getVideoTracks()[0].requestFrame?.();
        }
        if (!current()) {
          return;
        }
        if (typeof video.requestVideoFrameCallback === "function") {
          this.frameCallback = video.requestVideoFrameCallback(tick);
        } else {
          this.animationFrame = requestAnimationFrame(tick);
        }
      } catch (error) {
        fail(error);
      }
    };
    void video.play().then(
      tick,
      fail
    );
  }
  /**
   * Cancels only callbacks owned by this output.
   */
  cancelFrame() {
    if (this.frameCallback !== void 0) {
      this.video.cancelVideoFrameCallback(this.frameCallback);
      this.frameCallback = void 0;
    }
    if (this.animationFrame !== void 0) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = void 0;
    }
  }
  /**
   * Releases canvas output and playback without stopping borrowed input tracks.
   */
  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    clearTimeout(this.timer);
    this.revision++;
    this.cancelFrame();
    this.video.onerror = null;
    this.video.pause();
    this.video.srcObject = null;
    this.video.remove();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.canvas.width = this.canvas.height = 0;
  }
};

var RemoteVideoOutputController = class {
  /**
   * Creates the presentation callback and replaceable browser processors.
   */
  constructor(onVideo, createBridge = (onOutput, onError) => new StableVideoOutput(
    onOutput,
    onError
  ), createBeauty = (onOutput, onError) => new AgoraBeautyController(
    onOutput,
    onError
  )) {
    this.onVideo = onVideo;
    this.createBridge = createBridge;
    this.createBeauty = createBeauty;
  }
  /**
   * The borrowed RTC video input.
   */
  input;
  /**
   * The current task and original audio binding.
   */
  source;
  /**
   * The output currently supplied to all consumers.
   */
  output;
  /**
   * The stable browser output, retained even when beauty is disabled.
   */
  bridge;
  /**
   * Whether this source cannot create a canvas output.
   */
  bridgeUnavailable = false;
  /**
   * The shared, optional beauty configuration.
   */
  options;
  /**
   * The single processor shared by all result consumers.
   */
  beauty;
  /**
   * The current processor's first-output operation.
   */
  starting;
  /**
   * Cleanup operations retained until close has released every obsolete processor.
   */
  releases = /* @__PURE__ */ new Set();
  /**
   * The borrowed input's end listener, removed before replacement.
   */
  inputEnded;
  /**
   * The independent application callback for recoverable effect failures.
   */
  errorListener;
  /**
   * The processed-media receiver, independent of view attachment.
   */
  listener;
  /**
   * Replaces a result input without retaining processing or callbacks from its predecessor.
   */
  setVideoTrack(track) {
    if (this.input === track) {
      return;
    }
    if (this.inputEnded) {
      this.input?.removeEventListener?.(
        "ended",
        this.inputEnded
      );
    }
    this.input = track;
    this.inputEnded = track ? () => {
      if (this.input === track) {
        this.setVideoTrack(void 0);
      }
    } : void 0;
    if (this.inputEnded) {
      track?.addEventListener?.(
        "ended",
        this.inputEnded,
        { once: true }
      );
    }
    this.source = void 0;
    this.releaseBeauty();
    this.bridge?.dispose();
    this.bridge = void 0;
    this.bridgeUnavailable = false;
    this.output = void 0;
    this.onVideo(track);
    if (track && (this.options || this.listener)) {
      try {
        this.ensureBridge();
      } catch (error) {
        this.fallback(error);
      }
      if (this.options) {
        const configuration = this.options;
        void this.applyBeauty().catch((error) => {
          if (this.input === track && this.options === configuration && XmaxError.from(error).code !== "CANCELLED" /* cancelled */) {
            this.fallback(error);
          }
        });
      }
    }
    this.notify();
  }
  /**
   * Supplies task metadata and unmodified audio for processed-media observation.
   */
  setSource(source) {
    this.setVideoTrack(source?.videoTrack);
    this.source = source;
    this.notify();
  }
  /**
   * Replays available processed media; first output may arrive asynchronously while its bridge starts.
   */
  setListener(listener) {
    this.listener = listener;
    if (listener && this.input) {
      try {
        this.ensureBridge();
      } catch (error) {
        this.fallback(error);
      }
    }
    this.notify();
  }
  /**
   * Applies shared strengths before connection or during generation; undefined disables the effect.
   */
  async setBeauty(options) {
    const resolved = options === void 0 ? void 0 : resolvedVideoBeautyOptions(options);
    this.options = resolved;
    if (!resolved || Object.values(resolved).every((value) => value === 0)) {
      if (this.input) {
        this.bridge?.setSource(this.input);
      }
      await this.releaseBeauty();
      return;
    }
    if (!this.input) {
      return;
    }
    try {
      this.ensureBridge();
      await this.applyBeauty();
    } catch (error) {
      if (this.options === resolved && XmaxError.from(error).code !== "CANCELLED" /* cancelled */) {
        this.fallback(
          error,
          false
        );
      }
      throw XmaxError.from(error);
    }
  }
  /**
   * Replaces the runtime fallback callback; explicit configuration failures reject their promise.
   */
  setBeautyErrorListener(listener) {
    this.errorListener = listener;
  }
  /**
   * Creates one stable track before a media observer can receive an effect-dependent source.
   */
  ensureBridge() {
    if (this.bridge || !this.input) {
      return;
    }
    if (this.bridgeUnavailable) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "Shared result video output is unavailable"
      );
    }
    const input = this.input;
    try {
      const bridge = this.createBridge(
        (track) => {
          if (this.input !== input || this.bridge !== bridge) {
            return;
          }
          this.output = track;
          this.onVideo(track);
          this.notify();
        },
        (error) => {
          if (this.bridge !== bridge) {
            return;
          }
          this.bridge = void 0;
          this.bridgeUnavailable = true;
          bridge.dispose();
          this.output = void 0;
          this.fallback(error);
          this.onVideo(this.input);
          this.notify();
        }
      );
      this.bridge = bridge;
      bridge.setSource(input);
    } catch (error) {
      this.bridgeUnavailable = true;
      throw error;
    }
  }
  /**
   * Starts one lazy processor, retaining the latest strengths during asynchronous initialization.
   */
  async applyBeauty() {
    const input = this.input;
    const options = this.options;
    if (!input || !options || Object.values(options).every((value) => value === 0)) {
      return;
    }
    if (this.beauty) {
      const current = this.beauty;
      current.update(options);
      await this.starting;
      if (this.beauty !== current || this.input !== input) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Result beauty configuration was replaced"
        );
      }
      return;
    }
    const beauty = this.createBeauty(
      (track) => {
        if (this.beauty === beauty && this.input === input) {
          this.bridge?.setSource(track);
        }
      },
      (error) => {
        if (this.beauty === beauty) {
          this.fallback(error);
        }
      }
    );
    this.beauty = beauty;
    this.starting = beauty.start(
      input,
      options
    );
    await this.starting;
    if (this.beauty !== beauty || this.input !== input) {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "Result beauty configuration was replaced"
      );
    }
  }
  /**
   * Restores raw pixels through the existing output track before reporting runtime failure.
   */
  fallback(error, report = true) {
    const enabled = this.options !== void 0;
    this.options = void 0;
    if (this.input) {
      this.bridge?.setSource(this.input);
    }
    void this.releaseBeauty();
    if (enabled && report) {
      const resolved = XmaxError.from(error);
      XmaxLogger.render.warning(() => `Result beauty disabled; original pixels restored: ${resolved.message}`);
      try {
        void Promise.resolve(this.errorListener?.(resolved)).catch(() => {
        });
      } catch {
      }
    }
  }
  /**
   * Delivers the same processed video as preview while leaving original audio and task identity intact.
   */
  notify() {
    const track = this.output ?? (this.bridge ? void 0 : this.input);
    try {
      this.listener?.(this.source && track ? { ...this.source, videoTrack: track } : void 0);
    } catch (error) {
      XmaxLogger.render.warning(() => `Remote media track observer failed: ${XmaxError.from(error).message}`);
    }
  }
  /**
   * Invalidates a processor before releasing its owned output, isolating cleanup failures.
   */
  async releaseBeauty() {
    const beauty = this.beauty;
    this.beauty = void 0;
    this.starting = void 0;
    if (beauty) {
      const release = Promise.resolve().then(() => beauty.dispose()).catch(() => {
        XmaxLogger.render.warning(() => "Result beauty cleanup failed");
      });
      this.releases.add(release);
      void release.then(() => this.releases.delete(release));
    }
    await Promise.all(this.releases);
  }
  /**
   * Clears public configuration and observers and releases output when the manager closes.
   */
  async close() {
    this.options = void 0;
    this.errorListener = void 0;
    this.listener = void 0;
    this.setVideoTrack(void 0);
    await this.releaseBeauty();
  }
};

var TrajectoryBinding = class {
  /**
   * Creates a binding with a sample listener and model-input format.
   */
  constructor(listener, format) {
    this.listener = listener;
    this.format = format;
  }
  /**
   * The view currently owning this interaction binding.
   */
  overlay;
  /**
   * Whether interaction samples may be submitted.
   */
  enabled = false;
  /**
   * Whether the binding still belongs to a valid track.
   */
  valid = true;
  /**
   * Attaches one interaction view, cancelling the previous owner's pointers when ownership changes.
   */
  attach(overlay) {
    if (!this.valid) {
      return;
    }
    if (this.overlay !== overlay) {
      this.overlay?.setBinding(void 0);
    }
    this.overlay = overlay;
    overlay.setBinding(
      this,
      this.format,
      this.enabled
    );
  }
  /**
   * Detaches only the current owner so stale detach callbacks cannot affect a replacement.
   */
  detach(overlay) {
    if (this.overlay === overlay) {
      this.overlay = void 0;
      overlay.setBinding(void 0);
    }
  }
  /**
   * Updates task interaction availability or format and cancels obsolete gestures.
   */
  update(enabled, format = this.format) {
    this.enabled = enabled;
    this.format = format;
    this.overlay?.setBinding(
      this,
      format,
      enabled
    );
  }
  /**
   * Forwards current-view samples unless disabled or invalidated.
   */
  submit(frame) {
    if (this.valid && this.enabled) {
      this.listener(frame);
    }
  }
  /**
   * Invalidates the binding and releases view interaction, preventing old references from reattaching.
   */
  invalidate() {
    this.valid = false;
    this.overlay?.setBinding(void 0);
    this.overlay = void 0;
  }
};

var TrajectoryRegistry = class {
  /**
   * The interaction bindings indexed by media-track identity.
   */
  static bindings = /* @__PURE__ */ new WeakMap();
  /**
   * Invalidates an existing binding before replacing it.
   */
  static register(track, binding) {
    this.unregister(track);
    this.bindings.set(
      track,
      binding
    );
  }
  /**
   * Returns a track's interaction binding; local tracks do not register one.
   */
  static binding(track) {
    return this.bindings.get(track);
  }
  /**
   * Actively releases view resources rather than relying only on WeakMap collection.
   */
  static unregister(track) {
    this.bindings.get(track)?.invalidate();
    this.bindings.delete(track);
  }
};

var RenderController = class {
  /**
   * Creates a controller with presentation lifecycle callbacks, without owning Core objects.
   */
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
  }
  /**
   * The active remote track.
   */
  track;
  /**
   * The remote track's attached presentation targets.
   */
  targets = /* @__PURE__ */ new Set();
  /**
   * Whether the current task permits interaction.
   */
  interactionEnabled = false;
  /**
   * Whether the current remote view has completed render warmup.
   */
  ready = false;
  /**
   * The shared result track used by presentation and public media output.
   */
  outputTrack;
  /**
   * The lazy shared result processing owner.
   */
  output = new RemoteVideoOutputController((track) => {
    this.outputTrack = track;
    const stream = track && this.targets.size ? new MediaStream([track]) : null;
    for (const target of this.targets) {
      if (stream) {
        target.setMediaStream(
          stream,
          true
        );
      } else {
        target.setMediaStream(null);
      }
    }
  });
  /**
   * Whether the remote view has completed render warmup.
   */
  get isReady() {
    return this.ready;
  }
  /**
   * Resets first-frame and warmup readiness for a new task.
   */
  prepareForGeneration() {
    this.ready = false;
    this.targets.forEach((target) => target.prepareForGeneration?.());
  }
  /**
   * Registers a remote track and invalidates its predecessor; local tracks use separate bindings.
   */
  registerRemoteTrack(track, listener) {
    this.resetRemoteTrack();
    this.track = track;
    this.output.setVideoTrack(track.mediaStreamTrack);
    if (track.videoFormat) {
      TrajectoryRegistry.register(
        track,
        new TrajectoryBinding(
          listener,
          track.videoFormat
        )
      );
    }
    VideoRenderRegistry.register(
      track,
      {
        // Continue playback for 750 ms after the first frame before beginning fade-in.
        renderWarmupMs: 750,
        renderWarmupCompletedHandler: () => {
          if (this.track === track) {
            this.ready = true;
            this.callbacks.onRenderWarmupCompleted?.();
          }
        },
        frameDisplayHandler: () => {
          if (this.track === track) {
            this.callbacks.onFrameDisplayed?.();
          }
        },
        attachHandler: (view) => {
          if (this.track !== track) {
            return;
          }
          if (this.targets.size === 0) {
            this.ready = false;
          }
          view.isMirrored = false;
          this.targets.add(view);
          view.setMediaStream(this.outputTrack ? new MediaStream([this.outputTrack]) : null);
        },
        detachHandler: (view) => {
          this.targets.delete(view);
          if (this.targets.size === 0) {
            this.ready = false;
          }
          view.setMediaStream(null);
        }
      }
    );
  }
  /**
   * Updates remote media and disables interaction when presentation is cleared.
   */
  setRemoteMedia(track) {
    const previous = this.outputTrack;
    this.ready = false;
    if (this.track) {
      TrajectoryRegistry.binding(this.track)?.update(!!track && this.interactionEnabled);
    }
    this.output.setVideoTrack(track ?? void 0);
    if (!track && !previous) {
      this.targets.forEach((target) => target.setMediaStream(null));
    }
  }
  /**
   * Supplies original RTC metadata to shared result processing.
   */
  setRemoteMediaTracks(tracks) {
    this.output.setSource(tracks);
  }
  /**
   * Observes the shared result tracks independently of attached views.
   */
  setRemoteMediaTracksListener(listener) {
    this.output.setListener(listener);
  }
  /**
   * Configures result beauty once for preview, recording tracks, and decoded-frame observers.
   */
  setRemoteVideoBeauty(options) {
    return this.output.setBeauty(options);
  }
  /**
   * Observes recoverable runtime beauty failures.
   */
  setRemoteVideoBeautyErrorListener(listener) {
    this.output.setBeautyErrorListener(listener);
  }
  /**
   * Resets result processing configuration and owned resources when the manager closes.
   */
  closeBeauty() {
    return this.output.close();
  }
  /**
   * Updates the interaction format and availability.
   */
  setInteractionEnabled(enabled, format) {
    this.interactionEnabled = enabled;
    if (this.track) {
      TrajectoryRegistry.binding(this.track)?.update(
        enabled,
        format
      );
    }
  }
  /**
   * Invalidates capabilities before clearing presentation so stale frames or gestures cannot restore
   * ended tasks.
   */
  resetRemoteTrack() {
    this.ready = false;
    this.output.setVideoTrack(void 0);
    const track = this.track;
    this.track = void 0;
    this.interactionEnabled = false;
    if (track) {
      TrajectoryRegistry.unregister(track);
      VideoRenderRegistry.unregister(track);
    }
    this.targets.forEach((target) => target.setMediaStream(null));
    this.targets.clear();
  }
};

var RealtimeSession = class {
  /**
   * The session ID returned as sessionUid.
   */
  id;
  /**
   * The assigned model instance ID used for HTTP event relay.
   */
  modelID;
  /**
   * The business user ID.
   */
  userID;
  /**
   * The session status, such as ACTIVE, when supplied by the response.
   */
  status;
  /**
   * The session closure reason.
   */
  closeReason;
  /**
   * The RTC connection parameters; omitted from responses without complete credentials.
   */
  connection;
  /**
   * Creates a realtime session.
   */
  constructor(init) {
    this.id = init.id;
    this.modelID = init.modelID;
    this.userID = init.userID;
    this.status = init.status;
    this.connection = init.connection;
    this.closeReason = init.closeReason;
  }
};

var RoomJoinConfiguration = class {
  /**
   * The RTC provider.
   */
  provider = "trtc" /* trtc */;
  /**
   * The string TRTC room ID.
   */
  roomID;
  /**
   * The TRTC login identity from rtc_user_id.
   */
  userID;
  /**
   * The SDKAppID as a string, converted to a number when joining.
   */
  sdkAppID;
  /**
   * The TRTC login signature.
   */
  userSig;
  /**
   * The TRTC privateMapKey authorizing entry into a string-ID room.
   */
  privateMapKey;
  /**
   * Creates room-join parameters.
   */
  constructor(init) {
    this.roomID = init.roomID;
    this.userID = init.userID;
    this.sdkAppID = init.sdkAppID;
    this.userSig = init.userSig;
    this.privateMapKey = init.privateMapKey;
  }
};

var RealtimeSessionConnection = class {
  /**
   * The discriminator for TRTC credentials.
   */
  provider;
  /**
   * The string TRTC room ID.
   */
  roomID;
  /**
   * The TRTC SDKAppID represented as a string.
   */
  sdkAppID;
  /**
   * The TRTC login identity from rtc_user_id, not the business user_id.
   */
  userID;
  /**
   * The TRTC login signature.
   */
  userSig;
  /**
   * The TRTC privateMapKey used to authorize entry into a string-ID room.
   */
  privateMapKey;
  /**
   * The generation bot's user ID, used to match the remote result stream.
   */
  botID;
  /**
   * Creates RTC connection credentials.
   */
  constructor(init) {
    this.provider = init.provider;
    this.roomID = init.roomID;
    this.sdkAppID = init.sdkAppID;
    this.userID = init.userID;
    this.userSig = init.userSig;
    this.privateMapKey = init.privateMapKey;
    this.botID = init.botID;
  }
};
function toRoomJoinConfiguration(connection) {
  return connection.provider === "trtc" /* trtc */ ? new RoomJoinConfiguration(connection) : connection;
}
function connectionAppID(connection) {
  return connection.provider === "trtc" /* trtc */ ? connection.sdkAppID : connection.appID;
}

var RealtimeSessionService = class _RealtimeSessionService {
  /**
   * The API service used for session requests.
   */
  apiService;
  /**
   * The RTC provider determining join parameters and credential interpretation.
   */
  provider;
  /**
   * The heartbeat interval, in milliseconds.
   */
  heartbeatIntervalMs;
  /**
   * The scheduler waiting for a duration in milliseconds.
   */
  sleep;
  /**
   * The revision identifying the current heartbeat loop.
   */
  heartbeatVersion = 0;
  /**
   * Per-session credentials supporting partial heartbeat updates, removed on closure.
   */
  credentials = /* @__PURE__ */ new Map();
  /**
   * The in-progress credential refresh for each session ID.
   */
  refreshes = /* @__PURE__ */ new Map();
  /**
   * Creates a realtime session service.
   */
  constructor(options) {
    this.apiService = options.apiService;
    this.provider = options.provider ?? "trtc" /* trtc */;
    if (!Object.values(RtcProvider).includes(this.provider)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Unsupported RTC provider"
      );
    }
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 1e4;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(
      resolve,
      ms
    )));
  }
  /**
   * Creates a session and returns its RTC connection information.
   */
  async createSession(model) {
    const payload = await this.apiService.post(
      "/session",
      {
        model
      }
    );
    try {
      const session = this.makeSession(
        payload,
        true
      );
      _RealtimeSessionService.ensureSessionActive(session);
      const credentials = _RealtimeSessionService.decodeConnectionPayload(payload.modelExtra);
      this.credentials.set(
        session.id,
        this.provider === "vertc" /* vertc */ ? {
          ...credentials,
          user_id: session.connection.userID
        } : credentials
      );
      return session;
    } catch (error) {
      const sessionID = _RealtimeSessionService.nonEmpty(payload.sessionUid);
      if (sessionID) {
        await this.closeSession(sessionID).catch(() => {
        });
      }
      throw error;
    }
  }
  /**
   * Sends the first heartbeat with the measured allowance, then continues without that field. An
   * in-flight credential refresh settles before the first request so it cannot consume the allowance.
   */
  startHeartbeat(sessionID, handlers, firstHeartbeatGraceSeconds) {
    const version = ++this.heartbeatVersion;
    void this.runHeartbeat(
      version,
      sessionID,
      handlers,
      firstHeartbeatGraceSeconds
    );
  }
  /**
   * Stops heartbeats and suppresses obsolete pending responses.
   */
  stopHeartbeat() {
    this.heartbeatVersion += 1;
  }
  /**
   * Closes a realtime session with a keepalive request eligible to survive page unload.
   */
  async closeSession(sessionID) {
    this.credentials.delete(sessionID);
    this.refreshes.delete(sessionID);
    try {
      await this.apiService.delete(
        `/session/${sessionID}`,
        { keepalive: true }
      );
    } catch (error) {
      throw XmaxError.from(error);
    }
  }
  /**
   * Runs periodic heartbeats, delivering refreshed active sessions or reporting failure and invalidating
   * the loop.
   */
  async runHeartbeat(version, sessionID, handlers, firstHeartbeatGraceSeconds) {
    while (this.heartbeatVersion === version) {
      try {
        if (firstHeartbeatGraceSeconds !== void 0) {
          const pending = this.refreshes.get(sessionID);
          if (pending) {
            await pending;
            if (this.heartbeatVersion !== version) {
              return;
            }
            continue;
          }
        }
        const session = await this.heartbeatSession(
          sessionID,
          firstHeartbeatGraceSeconds
        );
        firstHeartbeatGraceSeconds = void 0;
        if (this.heartbeatVersion !== version) {
          return;
        }
        _RealtimeSessionService.ensureSessionActive(session);
        await handlers.onRefresh?.(session);
      } catch (error) {
        if (this.heartbeatVersion !== version) {
          return;
        }
        this.heartbeatVersion += 1;
        await handlers.onFailure(
          sessionID,
          XmaxError.from(error)
        );
        return;
      }
      if (this.heartbeatVersion !== version) {
        return;
      }
      await this.sleep(this.heartbeatIntervalMs);
    }
  }
  /**
   * Requests a heartbeat with an optional first-generation allowance. Concurrent credential refreshes
   * share the pending request.
   */
  heartbeatSession(sessionID, firstHeartbeatGraceSeconds) {
    if (firstHeartbeatGraceSeconds !== void 0 && (!Number.isSafeInteger(firstHeartbeatGraceSeconds) || firstHeartbeatGraceSeconds < 0)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "firstHeartbeatGraceSeconds must be a non-negative safe integer"
      );
    }
    const pending = this.refreshes.get(sessionID);
    if (pending) {
      return pending;
    }
    const operation = this.performHeartbeat(
      sessionID,
      firstHeartbeatGraceSeconds
    );
    this.refreshes.set(
      sessionID,
      operation
    );
    void operation.finally(() => {
      if (this.refreshes.get(sessionID) === operation) {
        this.refreshes.delete(sessionID);
      }
    }).catch(() => {
    });
    return operation;
  }
  /**
   * Merges partial heartbeat credentials without recreating cache entries for closed sessions.
   */
  async performHeartbeat(sessionID, firstHeartbeatGraceSeconds) {
    const previous = this.credentials.get(sessionID);
    const payload = await this.apiService.put(
      `/session/${sessionID}/heartbeat`,
      firstHeartbeatGraceSeconds === void 0 ? void 0 : { firstHeartbeatGraceSeconds }
    );
    const incoming = _RealtimeSessionService.decodeConnectionPayload(payload.modelExtra);
    if (payload.modelExtra != null && !incoming) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Invalid heartbeat RTC credentials"
      );
    }
    const merged = incoming ? {
      ...previous,
      ...incoming
    } : previous;
    const session = this.makeSession(
      {
        ...payload,
        modelExtra: merged
      },
      merged !== void 0
    );
    if (session.id !== sessionID) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Heartbeat session identity changed"
      );
    }
    _RealtimeSessionService.ensureSessionActive(session);
    if (previous && this.credentials.get(sessionID) === previous && merged) {
      this.credentials.set(
        sessionID,
        merged
      );
    }
    return session;
  }
  /**
   * Rejects sessions explicitly reported as non-ACTIVE.
   */
  static ensureSessionActive(session) {
    if (!session.status || session.status === "ACTIVE") {
      return;
    }
    throw new XmaxError(
      "SESSION_ERROR" /* sessionError */,
      session.closeReason ?? `Session is no longer active: ${session.status}`
    );
  }
  /**
   * Creates a session model, requiring complete credentials when requiresConnection is true.
   */
  makeSession(payload, requiresConnection) {
    const sessionID = _RealtimeSessionService.nonEmpty(payload.sessionUid);
    if (!sessionID) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Invalid session response"
      );
    }
    const connection = this.makeConnection(
      payload.modelExtra,
      payload.userUid
    );
    if (requiresConnection && !connection) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Session does not contain complete RTC join information"
      );
    }
    return new RealtimeSession({
      id: sessionID,
      modelID: _RealtimeSessionService.nonEmpty(payload.modelUid),
      userID: _RealtimeSessionService.nonEmpty(payload.userUid),
      status: _RealtimeSessionService.nonEmpty(payload.status),
      connection,
      closeReason: _RealtimeSessionService.nonEmpty(payload.closeReason)
    });
  }
  /**
   * Parses modelExtra credentials, returning undefined for incomplete or unsupported connection data.
   */
  makeConnection(modelExtra, fallbackUserID) {
    const payload = _RealtimeSessionService.decodeConnectionPayload(modelExtra);
    if (!payload) {
      return void 0;
    }
    const provider = this.provider;
    const roomID = _RealtimeSessionService.nonEmpty(payload.room_id);
    const sdkAppID = _RealtimeSessionService.nonEmpty(payload.rtc_app_id);
    const userID = provider === "vertc" /* vertc */ ? _RealtimeSessionService.nonEmpty(payload.user_id) ?? _RealtimeSessionService.nonEmpty(fallbackUserID) : _RealtimeSessionService.nonEmpty(payload.rtc_user_id);
    if (!roomID || !sdkAppID || !userID) {
      return void 0;
    }
    if (provider === "agora" /* agora */ || provider === "vertc" /* vertc */) {
      const roomToken = _RealtimeSessionService.nonEmpty(payload.room_token);
      if (!roomToken) {
        return void 0;
      }
      return Object.freeze({
        provider,
        roomID,
        appID: sdkAppID,
        userID,
        roomToken,
        botID: _RealtimeSessionService.nonEmpty(provider === "vertc" /* vertc */ ? payload.bot_name : payload.rtc_bot_id)
      });
    }
    const userSig = _RealtimeSessionService.nonEmpty(payload.user_sig);
    const privateMapKey = _RealtimeSessionService.nonEmpty(
      payload.private_map_key_with_string_room_id
    );
    if (!roomID || !sdkAppID || !userID || !userSig || !privateMapKey) {
      return void 0;
    }
    return new RealtimeSessionConnection({
      provider: "trtc" /* trtc */,
      roomID,
      sdkAppID,
      userID,
      userSig,
      privateMapKey,
      botID: _RealtimeSessionService.nonEmpty(payload.rtc_bot_id)
    });
  }
  /**
   * Decodes connection fields from an object or JSON string.
   */
  static decodeConnectionPayload(modelExtra) {
    if (typeof modelExtra === "string") {
      try {
        return _RealtimeSessionService.decodeConnectionPayload(JSON.parse(modelExtra));
      } catch {
        return void 0;
      }
    }
    if (typeof modelExtra === "object" && modelExtra !== null && !Array.isArray(modelExtra)) {
      return modelExtra;
    }
    return void 0;
  }
  /**
   * Trims an optional string and returns undefined when empty.
   */
  static nonEmpty(value) {
    const normalized = typeof value === "string" ? value.trim() : void 0;
    return normalized || void 0;
  }
};

var RoomEvent = class _RoomEvent {
  /**
   * Encodes a generation-start message.
   *
   * @param options.userID - The application user identifier.
   * @param options.taskID - The generation task identifier.
   * @param options.videoFormat - The generation video format.
   * @param options.context - The generation conditions.
   * @param options.targetSize - The returned video dimensions, omitted when unset.
   * @param options.minimumBitrate - The minimum returned bitrate, in kbps.
   * @param options.maximumBitrate - The maximum returned bitrate, in kbps.
   * @param options.mirror - Whether the server mirrors the input; defaults to false.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.extraParams - Validated extensions merged into params.
   * @returns The serialized start message.
   */
  static start(options) {
    return _RoomEvent.encode({
      event: "start",
      xid: options.xid,
      params: {
        ..._RoomEvent.generationParameters(options),
        min_bitrate: options.minimumBitrate,
        max_bitrate: options.maximumBitrate,
        mirror: options.mirror ?? false
      },
      user_id: options.userID,
      uid: options.taskID
    });
  }
  /**
   * Encodes updated generation conditions.
   *
   * @param options.userID - The application user identifier.
   * @param options.taskID - The generation task identifier.
   * @param options.videoFormat - The generation video format.
   * @param options.context - The generation conditions.
   * @param options.targetSize - The returned video dimensions, omitted when unset.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.extraParams - Validated extensions merged into params.
   * @returns The serialized change_condition message.
   */
  static changeCondition(options) {
    return _RoomEvent.encode({
      event: "change_condition",
      xid: options.xid,
      params: _RoomEvent.generationParameters(options),
      user_id: options.userID,
      uid: options.taskID
    });
  }
  /**
   * Encodes an update to returned dimensions and the bitrate range, in kbps.
   */
  static changeTargetSize(options) {
    return _RoomEvent.encode({
      event: "change_target_size",
      xid: options.xid,
      params: {
        min_bitrate: options.minimumBitrate,
        max_bitrate: options.maximumBitrate,
        target_size: [
          Math.round(options.targetSize.width),
          Math.round(options.targetSize.height)
        ]
      },
      user_id: options.userID,
      uid: options.taskID
    });
  }
  /**
   * Encodes a generation-stop message.
   */
  static stop(options) {
    return _RoomEvent.encode({
      event: "stop",
      user_id: options.userID,
      uid: options.taskID
    });
  }
  /**
   * Encodes an interaction trajectory message.
   */
  static tracks(options) {
    return _RoomEvent.encode(
      {
        event: "tracks",
        tracks: options.points.map((point) => [point.x, point.y]),
        user_id: options.userID,
        uid: options.taskID
      },
      false
    );
  }
  /**
   * Encodes a room heartbeat.
   */
  static heartbeat(options) {
    return _RoomEvent.encode({
      event: "heartbeat",
      user_id: options.userID
    });
  }
  /**
   * Builds shared generation parameters, including face restoration and message extensions.
   *
   * @param options - The generation message parameters.
   * @returns The params shared by start and change_condition messages.
   */
  static generationParameters(options) {
    return {
      model: "default",
      face_replace: options.faceRestoration ?? false,
      size: [options.videoFormat.width, options.videoFormat.height],
      ...options.paddingContain && { padding: "contain" },
      target_size: options.targetSize ? [
        Math.round(options.targetSize.width),
        Math.round(options.targetSize.height)
      ] : void 0,
      prompt: options.context.prompt,
      ref_image_path: options.context.referencePath,
      ...options.extraParams
    };
  }
  /**
   * Serializes business fields, omitting repeated runtime information from frequent trajectory
   * snapshots.
   */
  static encode(payload, includeRuntime = true) {
    try {
      return JSON.stringify(includeRuntime ? {
        ...payload,
        runtime: RuntimeInfo.toJSON()
      } : payload);
    } catch {
      throw new XmaxError(
        "INTERNAL_ERROR" /* internalError */,
        "Failed to encode RTC room event"
      );
    }
  }
};

var RoomHeartbeat = class {
  /**
   * The RTC engine used for heartbeat delivery.
   */
  rtcManager;
  /**
   * The delay between heartbeats, in milliseconds.
   */
  intervalMs;
  /**
   * The scheduler that resolves after a delay in milliseconds.
   */
  sleep;
  /**
   * The revision used to invalidate previous heartbeat cycles.
   */
  cycleVersion = 0;
  /**
   * Creates a room heartbeat scheduler.
   */
  constructor(options) {
    this.rtcManager = options.rtcManager;
    this.intervalMs = options.intervalMs ?? 1e4;
    this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(
      resolve,
      ms
    )));
  }
  /**
   * Starts a heartbeat cycle, replacing any existing cycle.
   */
  start(userID) {
    const version = ++this.cycleVersion;
    void this.run(
      version,
      userID
    );
  }
  /**
   * Stops the current cycle and prevents delayed sends from that cycle.
   */
  stop() {
    this.cycleVersion += 1;
  }
  /**
   * Waits and sends heartbeats repeatedly; logs send failures and continues the cycle.
   */
  async run(version, userID) {
    while (this.cycleVersion === version) {
      await this.sleep(this.intervalMs);
      if (this.cycleVersion !== version) {
        return;
      }
      try {
        await this.rtcManager.sendRoomMessage(RoomEvent.heartbeat({ userID }));
      } catch (error) {
        if (this.cycleVersion !== version) {
          return;
        }
        XmaxLogger.room.error(
          () => `\u53D1\u9001 RTC \u623F\u95F4\u5FC3\u8DF3\u5931\u8D25 (Failed to Send RTC Room Heartbeat)
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${XmaxError.from(error).message}`
        );
      }
    }
  }
};

var CHUNK_EVENT = "__trtc_chunk__";
var RoomMessageCodec = class _RoomMessageCodec {
  /**
   * Creates a message codec.
   *
   * @param chunkEvent - The fragment event name; TRTC uses the default, Agora uses __agora_chunk__, and
   * null disables fragmentation.
   */
  constructor(chunkEvent = CHUNK_EVENT) {
    this.chunkEvent = chunkEvent;
  }
  /**
   * The message size, in bytes, above which fragmentation is used.
   */
  static chunkThresholdBytes = 800;
  /**
   * The fragment data budget, in bytes, leaving room for the JSON envelope.
   */
  static chunkDataBudgetBytes = 600;
  /**
   * The maximum number of cached incomplete messages.
   */
  static cacheLimit = 1e3;
  /**
   * Incomplete messages indexed by sender and event ID.
   */
  records = /* @__PURE__ */ new Map();
  /**
   * Encodes an outgoing message.
   *
   * @returns The original message as a single item when fragmentation is unnecessary; otherwise, JSON
   * fragments using the selected provider's protocol.
   */
  encodeOutgoing(message) {
    if (this.chunkEvent === null || _RoomMessageCodec.byteLength(message) <= _RoomMessageCodec.chunkThresholdBytes) {
      return [message];
    }
    const eventId = _RoomMessageCodec.makeEventId();
    const slices = _RoomMessageCodec.sliceByByteBudget(
      message,
      _RoomMessageCodec.chunkDataBudgetBytes
    );
    const count = slices.length;
    XmaxLogger.room.debug(
      () => `\u623F\u95F4\u6D88\u606F\u62C6\u5305 (Chunking Room Message)
\u2514\u2500 eventId: ${eventId} \xB7 count: ${count} \xB7 bytes: ${_RoomMessageCodec.byteLength(message)}`
    );
    return slices.map(
      (data, index) => JSON.stringify({
        event: this.chunkEvent,
        eventId,
        index,
        count,
        data
      })
    );
  }
  /**
   * Processes an incoming message.
   *
   * @returns A parsed business message, or undefined for invalid JSON or incomplete fragments. Completed
   * fragment records are removed before parsing.
   */
  processIncoming(senderUserID, message) {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      XmaxLogger.room.warning(() => "\u623F\u95F4\u6D88\u606F\u4E0D\u662F\u5408\u6CD5 JSON (Room Message Is Not Valid JSON)");
      return void 0;
    }
    const chunk = this.parseChunk(parsed);
    if (!chunk) {
      return parsed;
    }
    const key = `${senderUserID}:${chunk.eventId}`;
    let record2 = this.records.get(key);
    if (!record2) {
      record2 = {
        count: chunk.count,
        parts: /* @__PURE__ */ new Map()
      };
      this.records.set(
        key,
        record2
      );
      this.evictOverflow();
    }
    record2.parts.set(
      chunk.index,
      chunk.data
    );
    if (record2.parts.size < record2.count) {
      return void 0;
    }
    this.records.delete(key);
    const parts = [];
    for (let index = 0; index < record2.count; index += 1) {
      const part = record2.parts.get(index);
      if (part === void 0) {
        return void 0;
      }
      parts.push(part);
    }
    const joined = parts.join("");
    try {
      return JSON.parse(joined);
    } catch {
      XmaxLogger.room.warning(
        () => `\u623F\u95F4\u6D88\u606F\u7EC4\u5305\u540E\u4E0D\u662F\u5408\u6CD5 JSON (Reassembled Message Is Not Valid JSON)
\u2514\u2500 eventId: ${chunk.eventId}`
      );
      return void 0;
    }
  }
  /**
   * Clears all incomplete messages.
   */
  reset() {
    this.records.clear();
  }
  /**
   * Recognizes a fragment envelope; incomplete envelope fields are treated as a regular business
   * message.
   */
  parseChunk(parsed) {
    if (this.chunkEvent === null || typeof parsed !== "object" || parsed === null) {
      return void 0;
    }
    const record2 = parsed;
    if (record2.event !== this.chunkEvent || typeof record2.eventId !== "string" || record2.eventId.length === 0 || !Number.isInteger(record2.index) || !Number.isInteger(record2.count) || typeof record2.data !== "string") {
      return void 0;
    }
    const index = record2.index;
    const count = record2.count;
    if (count < 1 || index < 0 || index >= count) {
      return void 0;
    }
    return {
      eventId: record2.eventId,
      index,
      count,
      data: record2.data
    };
  }
  /**
   * Evicts the oldest incomplete messages until the cache is within its limit.
   */
  evictOverflow() {
    while (this.records.size > _RoomMessageCodec.cacheLimit) {
      const oldest = this.records.keys().next().value;
      if (oldest === void 0) {
        return;
      }
      this.records.delete(oldest);
    }
  }
  /**
   * Splits a string by its UTF-8 byte budget without splitting multibyte characters.
   */
  static sliceByByteBudget(message, budget) {
    const slices = [];
    let current = "";
    let currentBytes = 0;
    for (const char of message) {
      const bytes = _RoomMessageCodec.byteLength(JSON.stringify(char)) - 2;
      if (currentBytes + bytes > budget && current.length > 0) {
        slices.push(current);
        current = "";
        currentBytes = 0;
      }
      current += char;
      currentBytes += bytes;
    }
    if (current.length > 0) {
      slices.push(current);
    }
    return slices;
  }
  /**
   * Returns the UTF-8 byte length of a string.
   */
  static byteLength(value) {
    return new TextEncoder().encode(value).byteLength;
  }
  /**
   * Creates a 32-character hexadecimal fragment event identifier.
   */
  static makeEventId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID().replace(
        /-/g,
        ""
      );
    }
    return Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }
};

var RETRY_OFFSETS_MS = [300, 1e3, 3e3, 3300, 4e3];
var RETRY_DEADLINE_MS = 6e3;
var RoomCommandController = class {
  /**
   * Creates a controller with a cancellable RTC transport, identifier generator, and optional relay.
   */
  constructor(sendMessage, makeID = () => crypto.randomUUID(), relayMessage, retryEnabled = true) {
    this.sendMessage = sendMessage;
    this.makeID = makeID;
    this.relayMessage = relayMessage;
    this.retryEnabled = retryEnabled;
  }
  /**
   * Commands with pending RTC sends, retries, or HTTP requests, indexed by their unique xid.
   */
  pending = /* @__PURE__ */ new Map();
  /**
   * Orders initial sends without waiting for service ACKs or completed retry schedules.
   */
  sendTail = Promise.resolve();
  /**
   * Sends a new logical command. Resolves after the first successful attempt; a missing ACK only stops
   * background retries with a warning. New starts supersede all old work; same-kind task updates
   * supersede older updates of that kind. Serialization happens before any old command is cancelled.
   */
  send(kind, taskID, createMessage, ensureCurrent) {
    ensureCurrent?.();
    const xid = this.makeID();
    const message = createMessage(xid);
    let resolve;
    let reject;
    const sent = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    void sent.catch(() => {
    });
    this.cancelMatching((command2) => kind === "start" || command2.taskID === taskID && command2.kind === kind);
    const command = {
      kind,
      taskID,
      xid,
      message,
      ensureCurrent,
      resolve,
      reject,
      initialController: new AbortController(),
      retryController: new AbortController(),
      relayController: new AbortController(),
      relaying: false,
      timers: [],
      attempts: 0,
      retrying: true,
      sent: false,
      cancelled: false
    };
    this.pending.set(xid, command);
    const operation = this.sendTail.then(() => {
      if (!command.cancelled) {
        this.begin(command);
      }
      return sent;
    });
    this.sendTail = operation.catch(() => {
    });
    return sent;
  }
  /**
   * Stops retransmission for a matching command without resolving or rejecting its transport result.
   */
  acknowledge(message) {
    const command = typeof message.xid === "string" ? this.pending.get(message.xid) : void 0;
    if (!command || !command.retrying || command.attempts === 0 || message.event !== "xid_ack" || typeof message.count !== "number" || !Number.isSafeInteger(message.count) || message.count < 1) {
      return;
    }
    try {
      command.ensureCurrent?.();
      this.stopRetries(command);
    } catch (error) {
      this.cancelCommand(command, XmaxError.from(error));
    }
  }
  /**
   * Cancels pending sends and retries for an ended task, or every command before leaving the room.
   */
  cancel(taskID) {
    this.cancelMatching((command) => taskID === void 0 || command.taskID === taskID);
  }
  /**
   * Releases commands matching a task or supersession boundary.
   */
  cancelMatching(matches) {
    for (const command of [...this.pending.values()]) {
      if (matches(command)) {
        this.cancelCommand(command, new XmaxError(
          "CANCELLED" /* cancelled */,
          "RTC command was cancelled"
        ));
      }
    }
  }
  /**
   * Starts a command's first send and retry clock after preceding initial sends complete.
   */
  begin(command) {
    if (this.retryEnabled) {
      for (const delay2 of RETRY_OFFSETS_MS) {
        command.timers.push(setTimeout(() => this.attempt(command, false), delay2));
      }
      command.timers.push(setTimeout(() => {
        if (!command.retrying) {
          return;
        }
        XmaxLogger.room.warning(() => `RTC command ACK not received after ${RETRY_DEADLINE_MS} ms; retries stopped: ${command.kind}, xid: ${command.xid}, attempts: ${command.attempts}`);
        this.stopRetries(command);
      }, RETRY_DEADLINE_MS));
    }
    this.attempt(command, true);
    void this.relay(command);
  }
  /**
   * Submits the HTTP copy once without changing the RTC send result or its ACK and retry schedule.
   */
  async relay(command) {
    if (!this.relayMessage || command.cancelled) {
      return;
    }
    command.relaying = true;
    const startedAt = performance.now();
    try {
      command.ensureCurrent?.();
      await this.relayMessage(
        command.message,
        command.relayController.signal
      );
    } catch (error) {
      if (!command.relayController.signal.aborted) {
        const mapped = XmaxError.from(error);
        XmaxLogger.room.warning(() => `HTTP \u4FE1\u4EE4\u8F6C\u53D1\u5931\u8D25 (HTTP Signaling Relay Failed)
\u251C\u2500 event: ${command.kind}, xid: ${command.xid}
\u251C\u2500 elapsed: ${(performance.now() - startedAt).toFixed(1)} ms
\u2514\u2500 code: ${mapped.code}, apiCode: ${mapped.apiCode ?? "n/a"}, httpStatus: ${mapped.httpStatus ?? "n/a"}, reason: ${mapped.message}`);
      }
    } finally {
      command.relaying = false;
      this.releaseCompleted(command);
    }
  }
  /**
   * Submits a transport attempt without waiting for a service receipt. An initial transport failure
   * retains the original failure behavior; redundant-send failures never fail an already sent task.
   */
  attempt(command, initial) {
    if (!command.retrying || command.cancelled) {
      return;
    }
    try {
      command.ensureCurrent?.();
      command.attempts++;
      const signal = initial ? command.initialController.signal : command.retryController.signal;
      void this.sendMessage(command.message, signal).then(
        () => this.completeSend(command),
        (error) => {
          if (command.cancelled || !command.retrying && command.sent) {
            return;
          }
          const mapped = XmaxError.from(error);
          if (initial && !command.sent) {
            if (command.kind === "start") {
              this.cancelMatching((item) => item !== command && item.taskID === command.taskID);
            }
            this.cancelCommand(command, mapped);
          } else if (command.retrying && mapped.code !== "CANCELLED" /* cancelled */) {
            XmaxLogger.room.warning(() => `RTC command retry send failed: ${command.kind}, xid: ${command.xid}, attempt: ${command.attempts}, reason: ${mapped.message}`);
          }
        }
      );
    } catch (error) {
      this.cancelCommand(command, XmaxError.from(error));
    }
  }
  /**
   * Completes sending once, allowing normal generation and the next initial command to continue.
   */
  completeSend(command) {
    if (command.cancelled || command.sent) {
      return;
    }
    command.sent = true;
    command.resolve();
    if (!this.retryEnabled) {
      this.stopRetries(command);
    }
    this.releaseCompleted(command);
  }
  /**
   * Stops background work without failing or cancelling an original transport send still in progress.
   */
  stopRetries(command) {
    command.retrying = false;
    command.timers.forEach((timer) => clearTimeout(timer));
    command.retryController.abort();
    this.releaseCompleted(command);
  }
  /**
   * Releases completed RTC work while retaining an outstanding HTTP request for lifecycle cancellation.
   */
  releaseCompleted(command) {
    if (command.sent && !command.retrying) {
      command.initialController.abort();
      if (!command.relaying) {
        this.pending.delete(command.xid);
      }
    }
  }
  /**
   * Cancels RTC sends and the HTTP request at an explicit lifecycle or supersession boundary.
   */
  cancelCommand(command, error) {
    command.cancelled = true;
    command.retrying = false;
    command.timers.forEach((timer) => clearTimeout(timer));
    command.initialController.abort();
    command.retryController.abort();
    command.relayController.abort();
    this.pending.delete(command.xid);
    command.reject(error);
  }
};

var RoomController = class {
  /**
   * The RTC engine used for room operations.
   */
  rtcManager;
  /**
   * The scheduler that sends room heartbeats.
   */
  heartbeat;
  /**
   * The message codec used by the current room.
   */
  codec;
  /**
   * Whether the message codec was supplied by the caller.
   */
  customCodec;
  /**
   * The room's command receipt, retry, and supersession controller.
   */
  commands;
  /**
   * The expected service sender, when identified by the session response.
   */
  botID;
  /**
   * The transport chain for ordinary controls and multipart snapshots, independent of command ACK waits.
   */
  sendTail = Promise.resolve();
  /**
   * The receiver for complete room messages.
   */
  listener;
  /**
   * The current membership and user identity.
   */
  state = { kind: "idle" };
  /**
   * The shared room-leaving and cleanup operation.
   */
  leaveOperation;
  /**
   * Creates a room controller.
   */
  constructor(options) {
    this.rtcManager = options.rtcManager;
    this.heartbeat = options.heartbeat ?? new RoomHeartbeat({ rtcManager: options.rtcManager });
    this.codec = options.codec ?? new RoomMessageCodec();
    this.customCodec = options.codec !== void 0;
    this.commands = new RoomCommandController(
      (message, signal) => this.sendCommandAttempt(
        message,
        signal
      ),
      void 0,
      options.relayMessage,
      options.retryCommands
    );
  }
  /**
   * Joins an RTC room while checking that the connection operation remains active.
   *
   * @throws Rejects if a previous room is still active, the operation is obsolete, or joining fails.
   */
  async join(connection, ensureActive2, measureRtcJoin) {
    try {
      ensureActive2();
    } catch (error) {
      throw XmaxError.from(error);
    }
    if (this.state.kind !== "idle" || this.leaveOperation) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Leave the current RTC room before joining another one"
      );
    }
    const operationID = `join-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.state = {
      kind: "joining",
      operationID
    };
    this.heartbeat.stop();
    try {
      if (!this.customCodec) {
        this.codec = new RoomMessageCodec(
          connection.provider === "vertc" /* vertc */ ? null : connection.provider === "agora" /* agora */ ? "__agora_chunk__" : "__trtc_chunk__"
        );
      }
      const configuration = toRoomJoinConfiguration(connection);
      const completeRtcJoin = measureRtcJoin?.();
      await this.rtcManager.joinRoom(configuration);
      ensureActive2();
      if (this.state.kind !== "joining" || this.state.operationID !== operationID || this.leaveOperation) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "RTC room join was cancelled"
        );
      }
      completeRtcJoin?.();
      this.state = {
        kind: "joined",
        userID: connection.userID
      };
      this.botID = connection.botID;
      this.heartbeat.start(connection.userID);
    } catch (error) {
      if (this.state.kind === "joining" && this.state.operationID === operationID && !this.leaveOperation) {
        this.state = { kind: "leaving" };
        this.heartbeat.stop();
        await this.rtcManager.leaveRoom();
        if (this.state.kind === "leaving") {
          this.state = { kind: "idle" };
        }
      }
      throw XmaxError.from(error);
    }
  }
  /**
   * Stops heartbeats and leaves the RTC room; concurrent calls share the same operation.
   */
  async leave() {
    if (this.leaveOperation) {
      await this.leaveOperation;
      return;
    }
    if (this.state.kind === "idle" || this.state.kind === "leaving") {
      return;
    }
    const operation = this.performLeave();
    this.leaveOperation = operation;
    await operation;
  }
  /**
   * Sends a generation-start message with background retries, without waiting for a service ACK.
   *
   * @param options.taskID - The generation task identifier.
   * @param options.videoFormat - The generation video format.
   * @param options.context - The generation conditions.
   * @param options.targetSize - The returned video dimensions, omitted when unset.
   * @param options.mirror - Whether the server mirrors the input; defaults to false.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.extraParams - Parameters merged into this start message without being retained.
   * @param options.onSent - Runs once after the first successful send, without waiting for the ACK.
   * @throws Rejects if the room is not ready or sending fails.
   */
  startGeneration(options) {
    const userID = this.requireUserID();
    const sending = this.commands.send(
      "start",
      options.taskID,
      (xid) => RoomEvent.start({
        xid,
        userID,
        taskID: options.taskID,
        videoFormat: options.videoFormat,
        context: options.context,
        targetSize: options.targetSize,
        mirror: options.mirror ?? false,
        faceRestoration: options.faceRestoration ?? false,
        paddingContain: options.paddingContain,
        extraParams: options.extraParams,
        ...this.downlinkBitrates(options.targetSize ?? options.videoFormat)
      })
    );
    return sending.then(() => options.onSent?.());
  }
  /**
   * Sends updated conditions with background retries, without waiting for a service ACK.
   *
   * @param options.taskID - The generation task identifier.
   * @param options.videoFormat - The generation video format.
   * @param options.context - The updated generation conditions.
   * @param options.targetSize - The returned video dimensions, omitted when unset.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.extraParams - Parameters merged into this change_condition message without being
   * retained.
   * @throws Rejects if the room is not ready or sending fails.
   */
  changeGenerationCondition(options) {
    const userID = this.requireUserID();
    return this.commands.send(
      "change_condition",
      options.taskID,
      (xid) => RoomEvent.changeCondition({
        xid,
        userID,
        taskID: options.taskID,
        videoFormat: options.videoFormat,
        context: options.context,
        targetSize: options.targetSize,
        faceRestoration: options.faceRestoration ?? false,
        paddingContain: options.paddingContain,
        extraParams: options.extraParams
      })
    );
  }
  /**
   * Updates the returned video dimensions for the current task.
   *
   * @throws Rejects if the operation is canceled, the room is not ready, or sending fails.
   */
  changeTargetSize(options) {
    options.ensureActive();
    const userID = this.requireUserID();
    return this.commands.send(
      "change_target_size",
      options.taskID,
      (xid) => RoomEvent.changeTargetSize({
        xid,
        userID,
        taskID: options.taskID,
        targetSize: options.targetSize,
        ...this.downlinkBitrates(options.targetSize)
      }),
      options.ensureActive
    );
  }
  /**
   * Estimates downlink bitrates from the returned dimensions at 24 fps, with a maximum between 100 and
   * 10000 kbps.
   *
   * This estimate neither sets the server frame rate nor reuses an explicit uplink bitrate.
   */
  downlinkBitrates(size) {
    const { maximum } = EncodingBitratePolicy.resolve(
      Math.round(size.width),
      Math.round(size.height),
      24
    );
    return {
      minimumBitrate: 100,
      maximumBitrate: Math.min(1e4, maximum)
    };
  }
  /**
   * Attempts to stop generation; ignores calls without a joined room or task identifier.
   */
  stopGeneration(taskID) {
    this.cancelGenerationCommands(taskID);
    if (!taskID || this.state.kind !== "joined") {
      return Promise.resolve();
    }
    return this.send(RoomEvent.stop({
      userID: this.state.userID,
      taskID
    }));
  }
  /**
   * Cancels retries and queued updates before task cleanup awaits other media operations.
   */
  cancelGenerationCommands(taskID) {
    this.commands.cancel(taskID || void 0);
  }
  /**
   * Sends interaction points; ignores an empty task identifier or point list.
   */
  sendTracks(taskID, points) {
    if (!taskID || points.length === 0) {
      return Promise.resolve();
    }
    return this.send(
      RoomEvent.tracks({
        userID: this.requireUserID(),
        taskID,
        points
      }),
      "latest"
    );
  }
  /**
   * Sets the room message listener; an undefined value clears it.
   */
  setListener(listener) {
    this.listener = listener;
  }
  /**
   * Resets room state, stops heartbeats, clears partial messages, and leaves the room.
   */
  async performLeave() {
    this.state = { kind: "idle" };
    this.commands.cancel();
    this.botID = void 0;
    this.heartbeat.stop();
    this.codec.reset();
    this.sendTail = Promise.resolve();
    try {
      await this.rtcManager.leaveRoom();
    } finally {
      this.leaveOperation = void 0;
    }
  }
  /**
   * Reassembles incoming messages and delivers those addressed to the current user.
   */
  handleIncomingMessage(senderUserID, raw) {
    const parsed = this.codec.processIncoming(
      senderUserID,
      raw
    );
    if (typeof parsed !== "object" || parsed === null) {
      return;
    }
    const message = parsed;
    const targetUserID = typeof message.user_id === "string" ? message.user_id : void 0;
    const ownUserID = this.state.kind === "joined" ? this.state.userID : void 0;
    if (targetUserID && ownUserID && targetUserID !== ownUserID) {
      return;
    }
    XmaxLogger.room.info(
      () => `\u63A5\u6536\u623F\u95F4\u4FE1\u4EE4 (Inbound Room Signaling)
\u251C\u2500 ${XmaxLogger.localized("\u53D1\u9001\u8005\uFF1A", "Sender: ")}${senderUserID}
\u2514\u2500 ${XmaxLogger.localized("\u5185\u5BB9\uFF1A", "Content:")}
${JSON.stringify(message, null, 2)}`
    );
    if (message.event === "xid_ack") {
      if (this.state.kind === "joined" && senderUserID !== ownUserID && (!this.botID || senderUserID === this.botID)) {
        this.commands.acknowledge(message);
      }
      return;
    }
    this.listener?.onRoomMessage(
      senderUserID,
      message
    );
  }
  /**
   * Sends a complete command attempt with independent fragment IDs. Each fragment checks cancellation;
   * service acknowledgement may cancel the remaining attempts before native send promises settle.
   */
  async sendCommandAttempt(message, signal) {
    const state2 = this.state;
    if (signal.aborted || state2.kind !== "joined") {
      throw new XmaxError(
        "CANCELLED" /* cancelled */,
        "RTC command was cancelled"
      );
    }
    XmaxLogger.room.info(
      () => `\u53D1\u9001\u623F\u95F4\u4FE1\u4EE4 (Outbound Room Signaling)
\u2514\u2500 ${XmaxLogger.localized("\u5185\u5BB9\uFF1A", "Content:")}
${JSON.stringify(JSON.parse(message), null, 2)}`
    );
    for (const packet of this.codec.encodeOutgoing(message)) {
      if (signal.aborted || state2 !== this.state || state2.kind !== "joined") {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "RTC command was cancelled"
        );
      }
      await this.rtcManager.sendRoomMessage(
        packet,
        "concurrent",
        signal
      );
    }
  }
  /**
   * Serializes ordinary transport sends; snapshots wait for prior sends without blocking later controls.
   * Retried generation commands use their independent receipt scheduler.
   */
  send(message, delivery = "ordered") {
    const state2 = this.state;
    const packets = this.codec.encodeOutgoing(message);
    const mode = packets.length > 1 ? "ordered" : delivery;
    const operation = this.sendTail.then(async () => {
      for (const packet of packets) {
        if (state2 !== this.state || state2.kind !== "joined") {
          throw new XmaxError(
            "CANCELLED" /* cancelled */,
            "Room message was cancelled"
          );
        }
        if (mode === "latest") {
          await this.rtcManager.sendRoomMessage(
            packet,
            "latest"
          );
        } else {
          await this.rtcManager.sendRoomMessage(
            packet,
            "barrier"
          );
        }
      }
      XmaxLogger.room.info(
        () => `\u53D1\u9001\u623F\u95F4\u4FE1\u4EE4 (Outbound Room Signaling)
\u2514\u2500 ${XmaxLogger.localized("\u5185\u5BB9\uFF1A", "Content:")}
${JSON.stringify(JSON.parse(message), null, 2)}`
      );
    }).catch((error) => {
      throw XmaxError.from(error);
    });
    if (mode === "ordered") {
      this.sendTail = operation.catch(() => {
      });
    }
    return operation;
  }
  /**
   * Returns the current room user identifier; throws if the room has not been joined.
   */
  requireUserID() {
    if (this.state.kind !== "joined") {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "RTC room is not joined"
      );
    }
    return this.state.userID;
  }
};

var RemoteStream = class {
  /**
   * The room containing the remote stream.
   */
  roomID;
  /**
   * The user publishing the remote stream.
   */
  userID;
  /**
   * Creates a remote-stream identity.
   */
  constructor(init) {
    this.roomID = init.roomID;
    this.userID = init.userID;
  }
  /**
   * The stream key unique across rooms.
   */
  get key() {
    return `${this.roomID}:${this.userID}`;
  }
};

var ENCODER_PREFERENCE_MAP = {
  ["maintainFramerate" /* maintainFramerate */]: "maintainFramerate" /* maintainFramerate */,
  ["maintainQuality" /* maintainQuality */]: "maintainQuality" /* maintainQuality */
};
var EncodingController = class {
  /**
   * The RTC adapter receiving encoding settings.
   */
  rtcManager;
  /**
   * The last encoding settings successfully applied to RTC.
   */
  lastAppliedConfiguration;
  /**
   * Creates an encoding controller.
   */
  constructor(options) {
    this.rtcManager = options.rtcManager;
  }
  /**
   * Validates the format, resolves explicit or default bitrate bounds, and configures RTC.
   */
  async configure(videoFormat) {
    videoFormat.validate();
    let minimum;
    let maximum;
    if (videoFormat.minimumBitrate !== void 0 && videoFormat.maximumBitrate !== void 0) {
      minimum = videoFormat.minimumBitrate;
      maximum = videoFormat.maximumBitrate;
    } else {
      const defaults = EncodingBitratePolicy.resolve(
        videoFormat.width,
        videoFormat.height,
        videoFormat.fps
      );
      maximum = videoFormat.maximumBitrate ?? defaults.maximum;
      minimum = videoFormat.minimumBitrate ?? Math.min(500, maximum);
    }
    if (minimum > maximum) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Minimum bitrate must not exceed maximum bitrate after applying SDK defaults"
      );
    }
    const configuration = {
      width: videoFormat.width,
      height: videoFormat.height,
      frameRate: videoFormat.fps,
      minimumBitrate: minimum,
      maximumBitrate: maximum,
      encoderPreference: ENCODER_PREFERENCE_MAP[videoFormat.encoderPreference]
    };
    await this.rtcManager.configureVideoEncoding(configuration);
    this.lastAppliedConfiguration = { ...configuration };
  }
  /**
   * Replaces only frame rate while retaining the last successful dimensions, resolved bitrate range, and
   * preference.
   */
  async updateFrameRate(fps) {
    const previous = this.lastAppliedConfiguration;
    if (!previous) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Apply an encoder configuration before updating frame rate"
      );
    }
    const format = new RealtimeVideoFormat({
      width: previous.width,
      height: previous.height,
      fps,
      minimumBitrate: previous.minimumBitrate,
      maximumBitrate: previous.maximumBitrate,
      encoderPreference: previous.encoderPreference === "maintainFramerate" /* maintainFramerate */ ? "maintainFramerate" /* maintainFramerate */ : "maintainQuality" /* maintainQuality */
    });
    format.validate();
    if (fps !== previous.frameRate) {
      const next = {
        ...previous,
        frameRate: fps
      };
      await this.rtcManager.configureVideoEncoding(next);
      this.lastAppliedConfiguration = next;
    }
    return format;
  }
};

function makeInitialState() {
  return {
    roomID: "",
    botID: "",
    localVideoPublished: false,
    localAudioPublished: false,
    subscribedRemoteUserIDs: /* @__PURE__ */ new Set(),
    publishedRemoteUserIDs: /* @__PURE__ */ new Set(),
    remoteVideoTracks: /* @__PURE__ */ new Map(),
    remoteVideoSubscriptions: /* @__PURE__ */ new Map(),
    subscribedRemoteAudioUserIDs: /* @__PURE__ */ new Set()
  };
}
var StreamController = class {
  /**
   * The RTC engine used for media transport.
   */
  rtcManager;
  /**
   * The controller for room membership and signaling.
   */
  roomController;
  /**
   * The controller that applies uplink encoding parameters.
   */
  encodingController;
  /**
   * The runtime error listener.
   */
  errorListener;
  /**
   * The listener for remote result-stream changes.
   */
  remoteStreamListener;
  /**
   * The observer of original result tracks; extra audio tracks are retrieved only when it is set.
   */
  remoteMediaListener;
  /**
   * The listener for uplink video statistics.
   */
  localVideoStatisticsListener;
  /**
   * The listener for network quality statistics.
   */
  networkStatisticsListener;
  /**
   * The listener for downlink video statistics.
   */
  remoteVideoStatisticsListener;
  /**
   * The generation confirmation timeout, in milliseconds.
   */
  generationTimeoutMs;
  /**
   * The remote audio playback volume, from 0 to 100.
   */
  remoteAudioVolumePercentage = 100;
  /**
   * The current room, subscription, and generation state.
   */
  state = makeInitialState();
  /**
   * The current receiver for room messages.
   */
  roomListener;
  /**
   * Creates a media transport controller.
   */
  constructor(options) {
    this.rtcManager = options.rtcManager;
    this.roomController = options.roomController ?? new RoomController({ rtcManager: options.rtcManager });
    this.encodingController = options.encodingController ?? new EncodingController({ rtcManager: options.rtcManager });
    this.errorListener = options.errorListener ?? (() => {
    });
    this.remoteStreamListener = options.remoteStreamListener ?? (() => {
    });
    this.generationTimeoutMs = options.generationTimeoutMs ?? 3e4;
    this.roomController.setListener({
      onRoomMessage: (sender, message) => {
        this.roomListener?.onRoomMessage(
          sender,
          message
        );
      }
    });
    this.rtcManager.setEventListener({
      onTokenWillExpire: options.onCredentialsRequired,
      onTokenExpired: options.onCredentialsRequired,
      onRoomRejoining: () => this.handleRoomRejoining(),
      onError: (error) => this.errorListener(error),
      onNetworkStatistics: (statistics) => {
        if (this.state.roomID) {
          this.networkStatisticsListener?.(statistics);
        }
      },
      onRemoteVideoStatistics: (statistics) => {
        const userID = this.state.activeRemoteStream?.userID;
        this.remoteVideoStatisticsListener?.(
          userID ? statistics.find((item) => item.userID === userID) : void 0
        );
      },
      onLocalVideoStatistics: (statistics) => {
        if (this.state.localVideoPublished) {
          this.localVideoStatisticsListener?.(statistics);
        }
      },
      onCustomMessageReceived: (senderUserID, message) => {
        this.roomController.handleIncomingMessage(
          senderUserID,
          message
        );
      },
      onRemoteVideoPublished: (userID, published) => {
        void this.handleRemoteVideoPublished(
          userID,
          published
        );
      },
      onRemoteAudioTrackChanged: (userID) => {
        if (this.state.activeRemoteStream?.userID === userID) {
          this.notifyRemoteMedia();
        }
      }
    });
  }
  /**
   * Whether a generation task is starting or running.
   */
  get hasGenerationTask() {
    return this.state.generationTaskID !== void 0;
  }
  /**
   * Replaces the original-track observer and immediately reports the current binding without changing
   * RTC event ownership.
   */
  setRemoteMediaListener(listener) {
    this.remoteMediaListener = listener;
    this.notifyRemoteMedia();
  }
  /**
   * Delivers the active result user's tracks to the observer while isolating track-access failures.
   */
  notifyRemoteMedia() {
    if (!this.remoteMediaListener) {
      return;
    }
    const userID = this.state.activeRemoteStream?.userID;
    const videoTrack = userID && this.state.remoteVideoTracks.get(userID);
    const bindingID = this.state.generationTaskID;
    try {
      this.remoteMediaListener(userID && videoTrack && bindingID ? {
        userID,
        bindingID,
        videoTrack,
        audioTrack: this.rtcManager.getRemoteAudioTrack(userID)
      } : void 0);
    } catch (error) {
      XmaxLogger.stream.warning(() => `Unable to observe remote media tracks: ${XmaxError.from(error).message}`);
    }
  }
  /**
   * Sets the uplink statistics listener without replacing the RTC event listener.
   */
  setUplinkVideoStatisticsListener(listener) {
    this.localVideoStatisticsListener = listener;
  }
  /**
   * Sets the network statistics listener; notifications do not depend on a remote user and may arrive
   * after publication.
   */
  setNetworkQualityListener(listener) {
    this.networkStatisticsListener = listener;
  }
  /**
   * Observes statistics for the accepted result publisher rather than assuming the session's bot ID is
   * the publisher.
   */
  setDownlinkVideoStatisticsListener(listener) {
    this.remoteVideoStatisticsListener = listener;
  }
  /**
   * The generated audio playback volume, from 0 to 1.
   */
  get remoteAudioVolume() {
    return this.remoteAudioVolumePercentage / 100;
  }
  /**
   * Sets the generated audio playback volume for all subscribed remote audio.
   */
  setRemoteAudioVolume(volume) {
    const rtcVolume = Math.min(Math.max(Math.round(volume * 100), 0), 100);
    for (const userID of [...this.state.subscribedRemoteAudioUserIDs].sort()) {
      this.rtcManager.setRemoteAudioVolume(
        rtcVolume,
        userID
      );
    }
    this.remoteAudioVolumePercentage = rtcVolume;
  }
  /**
   * Applies the uplink video format, bitrate range, and encoding policy.
   *
   * @throws Rejects if the format or bitrate range is invalid, or RTC configuration fails.
   */
  async updateUplinkVideoFormat(videoFormat) {
    await this.encodingController.configure(videoFormat);
  }
  /**
   * Updates the target frame rate without recalculating the bitrate range.
   */
  async updateUplinkFrameRate(fps) {
    return this.encodingController.updateFrameRate(fps);
  }
  /**
   * Joins the RTC room and publishes local media.
   *
   * @throws Rejects if the connection is canceled or joining, room configuration, or publication fails.
   */
  async connect(connection, includeLocalAudio, ensureActive2, beforePublish, measureRtcJoin) {
    this.configureRoom({
      roomID: connection.roomID,
      botID: connection.botID
    });
    await this.roomController.join(
      connection,
      ensureActive2,
      measureRtcJoin
    );
    ensureActive2();
    XmaxLogger.stream.info(
      () => `RTC \u623F\u95F4\u5DF2\u914D\u7F6E (RTC Room Configured)
\u2514\u2500 roomID: ${connection.roomID}, botID: ${connection.botID ?? "(\u672A\u8BBE\u7F6E)"}`
    );
    await beforePublish?.();
    ensureActive2();
    await this.publishLocalStream(includeLocalAudio);
  }
  /**
   * Clears generation state, local publication, and remote subscriptions, then leaves the room.
   */
  async disconnect() {
    await this.resetStream();
    await this.roomController.leave();
  }
  /**
   * Applies refreshed session credentials to the active RTC connection.
   */
  async updateCredentials(connection, signal) {
    await this.rtcManager.updateCredentials(
      toRoomJoinConfiguration(connection),
      signal
    );
  }
  /**
   * Creates a generation task and sends its start message.
   *
   * @param options.taskID - The generation task identifier.
   * @param options.videoFormat - The generation video format.
   * @param options.context - The generation conditions.
   * @param options.restart - Replaces the running task while retaining the connection; defaults to false
   * and does not send stop first.
   * @param options.targetSize - The returned video dimensions, omitted when unset.
   * @param options.mirror - Whether the server mirrors the input; defaults to false.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.onStartSent - Runs after start is sent, before generation confirmation.
   * @param options.extraParams - Parameters merged into this start message without being retained.
   * @returns A promise that waits for sending and the remote result stream, independently of receipt ACKs.
   * @throws Throws synchronously for an invalid task ID, an unready room, a pending start, or a running
   * task without restart. The returned promise rejects if sending fails or confirmation times out.
   */
  beginGeneration(options) {
    const taskID = options.taskID.trim();
    if (!taskID) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Realtime generation task ID cannot be empty"
      );
    }
    if (!this.state.roomID) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "RTC room is not configured"
      );
    }
    if (this.state.generationTaskID && (!options.restart || this.state.generationWaiter)) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Realtime generation is already active"
      );
    }
    let resolve;
    let reject;
    const confirmation = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const waiter = {
      taskID,
      resolve,
      reject,
      confirmationPending: false,
      timeoutTimer: setTimeout(
        () => {
          this.rejectGenerationStart(
            taskID,
            new XmaxError(
              "TIMEOUT" /* timeout */,
              "Realtime generation start timed out"
            )
          );
        },
        this.generationTimeoutMs
      )
    };
    this.state.generationTaskID = taskID;
    this.state.generationWaiter = waiter;
    void confirmation.catch(() => {
    });
    try {
      const state2 = this.state;
      const sending = this.roomController.startGeneration({
        taskID,
        videoFormat: options.videoFormat,
        context: options.context,
        targetSize: options.targetSize,
        mirror: options.mirror ?? false,
        faceRestoration: options.faceRestoration ?? false,
        paddingContain: options.paddingContain,
        extraParams: options.extraParams,
        onSent: async () => {
          if (this.state === state2 && state2.generationTaskID === taskID) {
            await options.onStartSent?.();
          }
        }
      });
      const sent = Promise.resolve(sending).then(async () => {
        if (this.state !== state2 || state2.generationTaskID !== taskID) {
          return;
        }
        for (const userID of state2.publishedRemoteUserIDs) {
          void this.handleRemoteVideoPublished(
            userID,
            true
          );
        }
      }).catch((error) => {
        const mapped = XmaxError.from(error);
        this.rejectGenerationStart(
          taskID,
          mapped
        );
        if (this.state.generationTaskID === taskID) {
          this.state.generationTaskID = void 0;
          void this.roomController.stopGeneration(taskID).catch(() => {
          });
        }
        throw mapped;
      });
      return Promise.all([sent, confirmation]).then(() => {
      });
    } catch (error) {
      const mapped = XmaxError.from(error);
      this.rejectGenerationStart(
        taskID,
        mapped
      );
      this.state.generationTaskID = void 0;
      try {
        void this.roomController.stopGeneration(taskID).catch(() => {
        });
      } catch {
      }
      throw mapped;
    }
  }
  /**
   * Subscribes to the active result stream's audio after its first frame is displayable.
   *
   * @throws Rejects if generation is unconfirmed or RTC volume or subscription configuration fails.
   */
  async activateRemoteAudio() {
    const remoteStream = this.state.generationTaskID ? this.state.activeRemoteStream : void 0;
    if (!remoteStream) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Remote generation audio stream is unavailable"
      );
    }
    await this.subscribeRemoteAudio(remoteStream.userID);
  }
  /**
   * Sends updated generation conditions.
   *
   * @param options.taskID - The generation task identifier.
   * @param options.videoFormat - The generation video format.
   * @param options.context - The updated generation conditions.
   * @param options.restart - Unused for condition updates.
   * @param options.targetSize - The returned video dimensions, omitted when unset.
   * @param options.mirror - Unused for condition updates.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.onStartSent - Not called for condition updates.
   * @param options.extraParams - Parameters merged into this change_condition message without being
   * retained.
   * @throws Rejects if the room is not ready or sending fails.
   */
  async updateGeneration(options) {
    try {
      await this.roomController.changeGenerationCondition({
        taskID: options.taskID,
        videoFormat: options.videoFormat,
        context: options.context,
        targetSize: options.targetSize,
        faceRestoration: options.faceRestoration ?? false,
        paddingContain: options.paddingContain,
        extraParams: options.extraParams
      });
    } catch (error) {
      throw XmaxError.from(error);
    }
  }
  /**
   * Updates returned video dimensions without restarting generation.
   *
   * @throws Rejects if the operation is canceled, the room is not ready, or sending fails.
   */
  async updateDownlinkVideoResolution(taskID, targetSize, ensureActive2) {
    try {
      await this.roomController.changeTargetSize({
        taskID,
        targetSize,
        ensureActive: ensureActive2
      });
    } catch (error) {
      throw XmaxError.from(error);
    }
  }
  /**
   * Stops generation and clears its result stream; an empty identifier stops the current task.
   *
   * @throws Rejects if the stop message cannot be sent.
   */
  async stopGeneration(taskID) {
    const stoppedTaskID = await this.stopStreamGeneration(taskID);
    if (taskID && !stoppedTaskID) {
      return;
    }
    try {
      await this.roomController.stopGeneration(stoppedTaskID);
    } catch (error) {
      throw XmaxError.from(error);
    }
  }
  /**
   * Sends interaction points; ignores an empty point list.
   *
   * @throws Rejects if the room is not ready or sending fails.
   */
  async sendTracks(taskID, points) {
    try {
      await this.roomController.sendTracks(
        taskID,
        points
      );
    } catch (error) {
      throw XmaxError.from(error);
    }
  }
  /**
   * Sets the room message listener; an undefined value clears it.
   */
  setRoomListener(listener) {
    this.roomListener = listener;
  }
  /**
   * Configures the room; rejects reconfiguration with active publication, subscriptions, or generation.
   */
  configureRoom(options) {
    const roomID = options.roomID.trim();
    const botID = options.botID?.trim() ?? "";
    if (!roomID) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "RTC room ID cannot be empty"
      );
    }
    if (this.state.localVideoPublished || this.state.localAudioPublished || this.state.subscribedRemoteUserIDs.size > 0 || this.state.generationTaskID) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Reset the current RTC room before configuring another one"
      );
    }
    this.state.roomID = roomID;
    this.state.botID = botID;
  }
  /**
   * Publishes local video and optional audio; rolls video publication back if audio publication fails.
   */
  async publishLocalStream(includeAudio) {
    if (!this.state.roomID) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Configure an RTC room before publishing the local stream"
      );
    }
    let publishedVideoInOperation = false;
    try {
      if (!this.state.localVideoPublished) {
        await this.rtcManager.publishLocalVideo();
        this.state.localVideoPublished = true;
        publishedVideoInOperation = true;
      }
      if (includeAudio && !this.state.localAudioPublished) {
        await this.rtcManager.publishLocalAudio();
        this.state.localAudioPublished = true;
      }
    } catch (error) {
      if (publishedVideoInOperation) {
        await this.rollbackLocalVideoPublication();
      }
      throw XmaxError.from(error);
    }
  }
  /**
   * Handles remote video publication by subscribing or clearing its binding.
   */
  async handleRemoteVideoPublished(userID, published) {
    const trimmedUserID = userID.trim();
    if (!trimmedUserID) {
      return;
    }
    XmaxLogger.stream.info(
      () => `\u8FDC\u7AEF\u89C6\u9891\u53D1\u5E03\u72B6\u6001\u53D8\u5316 (Remote Video Publication Changed)
\u2514\u2500 userID: ${trimmedUserID}, published: ${published}`
    );
    if (!this.state.roomID) {
      return;
    }
    if (published) {
      this.state.publishedRemoteUserIDs.add(trimmedUserID);
    } else {
      this.state.publishedRemoteUserIDs.delete(trimmedUserID);
      this.state.remoteVideoSubscriptions.delete(trimmedUserID);
      this.state.remoteVideoTracks.delete(trimmedUserID);
    }
    if (this.state.botID && this.state.botID !== trimmedUserID) {
      if (this.state.generationTaskID === void 0) {
        XmaxLogger.stream.warning(
          () => `\u5FFD\u7565\u975E\u76EE\u6807\u673A\u5668\u4EBA\u7684\u8FDC\u7AEF\u89C6\u9891 (Ignored Remote Video from Non-Bot User)
\u2514\u2500 userID: ${trimmedUserID}, botID: ${this.state.botID}`
        );
        return;
      }
      XmaxLogger.stream.warning(
        () => `\u8FDC\u7AEF\u89C6\u9891\u53D1\u5E03\u8005\u4E0E\u4F1A\u8BDD\u4E0B\u53D1\u7684\u673A\u5668\u4EBA\u6807\u8BC6\u4E0D\u4E00\u81F4\uFF0C\u6309\u751F\u6210\u7ED3\u679C\u6D41\u63A5\u53D7 (Accepted Remote Video Despite Bot ID Mismatch)
\u2514\u2500 userID: ${trimmedUserID}, botID: ${this.state.botID}`
      );
    }
    if (published) {
      await this.subscribeRemoteVideo(trimmedUserID);
      return;
    }
    this.state.subscribedRemoteUserIDs.delete(trimmedUserID);
    if (this.state.activeRemoteStream?.userID === trimmedUserID) {
      await this.unsubscribeRemoteAudio(trimmedUserID);
      this.state.activeRemoteStream = void 0;
      this.clearRemoteStream();
    }
  }
  /**
   * Discards obsolete media bindings on RTC rejoin while preserving the task, audio subscription intent,
   * and generation waiter.
   */
  handleRoomRejoining() {
    this.state.publishedRemoteUserIDs.clear();
    this.state.subscribedRemoteUserIDs.clear();
    this.state.remoteVideoSubscriptions.clear();
    this.state.remoteVideoTracks.clear();
    this.state.activeRemoteStream = void 0;
    this.clearRemoteStream();
  }
  /**
   * Subscribes to remote video, then confirms generation or updates its result binding.
   */
  async subscribeRemoteVideo(userID) {
    const state2 = this.state;
    const existing = state2.remoteVideoTracks.get(userID);
    if (existing) {
      if (state2.generationWaiter) {
        this.confirmOrUpdateRemoteStream(
          userID,
          existing
        );
      }
      return;
    }
    if (state2.remoteVideoSubscriptions.has(userID)) {
      return;
    }
    const subscription = {};
    state2.remoteVideoSubscriptions.set(
      userID,
      subscription
    );
    const isCurrent = () => this.state === state2 && state2.remoteVideoSubscriptions.get(userID) === subscription;
    try {
      const track = await this.rtcManager.subscribeRemoteVideo(
        userID,
        true
      );
      if (!isCurrent()) {
        return;
      }
      if (!track) {
        throw new XmaxError(
          "MEDIA_ERROR" /* mediaError */,
          "Remote video track is not available"
        );
      }
      state2.subscribedRemoteUserIDs.add(userID);
      state2.remoteVideoTracks.set(
        userID,
        track
      );
      XmaxLogger.stream.info(
        () => `\u8FDC\u7AEF\u89C6\u9891\u8BA2\u9605\u6210\u529F (Remote Video Subscribed)
\u2514\u2500 userID: ${userID}`
      );
      this.confirmOrUpdateRemoteStream(
        userID,
        track
      );
    } catch (error) {
      if (!isCurrent()) {
        return;
      }
      const mapped = XmaxError.from(error);
      const pendingTaskID = this.state.generationWaiter ? this.state.generationTaskID : void 0;
      if (pendingTaskID) {
        this.rejectGenerationStart(
          pendingTaskID,
          mapped
        );
      } else {
        this.errorListener(mapped);
      }
    } finally {
      if (isCurrent()) {
        state2.remoteVideoSubscriptions.delete(userID);
      }
    }
  }
  /**
   * Accepts a subscribed result stream, confirming a pending task or replacing the current binding.
   */
  confirmOrUpdateRemoteStream(userID, track) {
    const waiter = this.state.generationWaiter;
    const taskID = this.state.generationTaskID;
    const stream = new RemoteStream({
      roomID: this.state.roomID,
      userID
    });
    if (waiter && taskID) {
      if (waiter.confirmationPending) {
        return;
      }
      waiter.confirmationPending = true;
      try {
        this.remoteStreamListener({
          stream,
          videoTrack: track
        });
        if (this.state.generationTaskID === taskID) {
          this.state.activeRemoteStream = stream;
          this.notifyRemoteMedia();
        }
      } catch (error) {
        this.rejectGenerationStart(
          taskID,
          XmaxError.from(error)
        );
        return;
      }
      this.resolveGenerationStart(taskID);
      return;
    }
    if (taskID) {
      try {
        this.remoteStreamListener({
          stream,
          videoTrack: track
        });
        if (this.state.generationTaskID === taskID) {
          this.state.activeRemoteStream = stream;
          this.notifyRemoteMedia();
        }
      } catch (error) {
        this.errorListener(XmaxError.from(error));
      }
    }
  }
  /**
   * Subscribes to remote audio and applies the current volume using platform capabilities.
   *
   * Set the volume before subscribing where supported to avoid brief default-volume playback. Where
   * volume control falls back to playback or mute, subscribe first and then mute so resumed playback
   * does not override zero volume.
   */
  async subscribeRemoteAudio(userID) {
    if (this.state.subscribedRemoteAudioUserIDs.has(userID)) {
      return;
    }
    if (this.rtcManager.supportsRemoteAudioVolumeControl) {
      this.rtcManager.setRemoteAudioVolume(
        this.remoteAudioVolumePercentage,
        userID
      );
      await this.rtcManager.subscribeRemoteAudio(
        userID,
        true
      );
    } else {
      await this.rtcManager.subscribeRemoteAudio(
        userID,
        true
      );
      this.rtcManager.setRemoteAudioVolume(
        this.remoteAudioVolumePercentage,
        userID
      );
    }
    this.state.subscribedRemoteAudioUserIDs.add(userID);
    this.notifyRemoteMedia();
  }
  /**
   * Unsubscribes from remote audio and logs failures without propagating them.
   */
  async unsubscribeRemoteAudio(userID) {
    if (!this.state.subscribedRemoteAudioUserIDs.delete(userID)) {
      return;
    }
    await this.performCleanup(
      "\u53D6\u6D88\u8BA2\u9605 RTC \u8FDC\u7AEF\u97F3\u9891\u5931\u8D25 (Failed to Unsubscribe from RTC Remote Audio)",
      () => this.rtcManager.subscribeRemoteAudio(
        userID,
        false
      )
    );
  }
  /**
   * Stops the matching task, rejects its waiter, and clears its result stream and audio subscriptions.
   *
   * @returns The stopped task identifier, or an empty string when no task matches.
   */
  async stopStreamGeneration(taskID, reason = "Realtime generation start cancelled") {
    const currentTaskID = this.state.generationTaskID ?? "";
    if (taskID && taskID !== currentTaskID) {
      return "";
    }
    this.roomController.cancelGenerationCommands(currentTaskID);
    const waiter = this.state.generationWaiter;
    const remoteAudioUserIDs = [...this.state.subscribedRemoteAudioUserIDs];
    this.state.generationTaskID = void 0;
    this.state.generationWaiter = void 0;
    this.state.activeRemoteStream = void 0;
    this.state.subscribedRemoteAudioUserIDs.clear();
    if (waiter) {
      clearTimeout(waiter.timeoutTimer);
      waiter.reject(new XmaxError(
        "CANCELLED" /* cancelled */,
        reason
      ));
    }
    for (const userID of remoteAudioUserIDs.sort()) {
      await this.performCleanup(
        "\u53D6\u6D88\u8BA2\u9605 RTC \u8FDC\u7AEF\u97F3\u9891\u5931\u8D25 (Failed to Unsubscribe from RTC Remote Audio)",
        () => this.rtcManager.subscribeRemoteAudio(
          userID,
          false
        )
      );
    }
    this.clearRemoteStream();
    return currentTaskID;
  }
  /**
   * Stops generation, removes all remote subscriptions, and unpublishes local media.
   */
  async resetStream() {
    await this.stopStreamGeneration("");
    const previousState = this.state;
    this.state = makeInitialState();
    for (const userID of [...previousState.subscribedRemoteUserIDs].sort()) {
      await this.performCleanup(
        "\u53D6\u6D88\u8BA2\u9605 RTC \u8FDC\u7AEF\u89C6\u9891\u5931\u8D25 (Failed to Unsubscribe from RTC Remote Video)",
        async () => {
          await this.rtcManager.subscribeRemoteVideo(
            userID,
            false
          );
        }
      );
    }
    if (previousState.localAudioPublished) {
      await this.performCleanup(
        "\u53D6\u6D88\u53D1\u5E03 RTC \u672C\u5730\u97F3\u9891\u5931\u8D25 (Failed to Unpublish RTC Local Audio)",
        () => this.rtcManager.unpublishLocalAudio()
      );
    }
    if (previousState.localVideoPublished) {
      await this.performCleanup(
        "\u53D6\u6D88\u53D1\u5E03 RTC \u672C\u5730\u89C6\u9891\u5931\u8D25 (Failed to Unpublish RTC Local Video)",
        () => this.rtcManager.unpublishLocalVideo()
      );
    }
  }
  /**
   * Clears the waiter and resolves generation confirmation.
   */
  resolveGenerationStart(taskID) {
    const waiter = this.state.generationWaiter;
    if (this.state.generationTaskID !== taskID || waiter?.taskID !== taskID) {
      return;
    }
    this.state.generationWaiter = void 0;
    clearTimeout(waiter.timeoutTimer);
    waiter.resolve();
  }
  /**
   * Clears the waiter and rejects generation confirmation.
   */
  rejectGenerationStart(taskID, error) {
    const waiter = this.state.generationWaiter;
    if (this.state.generationTaskID !== taskID || waiter?.taskID !== taskID) {
      return;
    }
    this.state.generationWaiter = void 0;
    clearTimeout(waiter.timeoutTimer);
    waiter.reject(error);
  }
  /**
   * Notifies observers that the generated stream was cleared; logs listener failures.
   */
  clearRemoteStream() {
    this.remoteMediaListener?.(void 0);
    this.remoteVideoStatisticsListener?.(void 0);
    try {
      this.remoteStreamListener(null);
    } catch (error) {
      XmaxLogger.stream.error(
        () => `\u6E05\u7406 RTC \u8FDC\u7AEF\u751F\u6210\u6D41\u5931\u8D25 (Failed to Clean Up RTC Remote Generation Stream)
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${XmaxError.from(error).message}`
      );
    }
  }
  /**
   * Rolls back local video publication and logs failures.
   */
  async rollbackLocalVideoPublication() {
    await this.performCleanup(
      "\u56DE\u6EDA RTC \u672C\u5730\u89C6\u9891\u53D1\u5E03\u5931\u8D25 (Failed to Roll Back RTC Local Video Publication)",
      async () => {
        await this.rtcManager.unpublishLocalVideo();
        this.state.localVideoPublished = false;
      }
    );
  }
  /**
   * Runs a cleanup action and logs failures without propagating them.
   */
  async performCleanup(title, action) {
    try {
      await action();
    } catch (error) {
      XmaxLogger.stream.error(
        () => `${title}
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${XmaxError.from(error).message}`
      );
    }
  }
};

var DEFAULT_POLICY = {
  poorSamples: 3,
  goodSamples: 5,
  stabilizationMs: 4e3,
  probeMs: 2e4,
  upgradeCooldownMs: 6e4,
  sampleTimeoutMs: 5e3
};

var ORDERED_QUALITY_TIERS = Object.values(QUALITY_TIERS);
var QualityController = class {
  /**
   * Creates a quality state machine that retains its level when the adjacent candidate violates encoding
   * limits.
   */
  constructor(apply, now = () => performance.now(), policy = {}, canApply = () => true) {
    this.apply = apply;
    this.now = now;
    this.canApply = canApply;
    this.policy = {
      ...DEFAULT_POLICY,
      ...policy
    };
    for (const value of Object.values(this.policy)) {
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("Invalid quality policy");
      }
    }
    for (const value of [this.policy.poorSamples, this.policy.goodSamples]) {
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("Sample counts must be positive integers");
      }
    }
  }
  /**
   * The sample thresholds and transition windows.
   */
  policy;
  /**
   * Whether this state machine is active.
   */
  active = false;
  /**
   * The current index in the ordered quality presets.
   */
  index = 0;
  /**
   * The consecutive good-network sample count.
   */
  good = 0;
  /**
   * The consecutive poor-network sample count.
   */
  poor = 0;
  /**
   * The monotonic time of the last valid sample, in milliseconds.
   */
  lastSampleAt;
  /**
   * The earliest monotonic time for resuming sample accumulation after a transition, in milliseconds.
   */
  stableUntil = 0;
  /**
   * The earliest monotonic time for another upgrade probe, in milliseconds.
   */
  upgradeAfter = 0;
  /**
   * The active upgrade-probe deadline, in monotonic milliseconds.
   */
  probeUntil = 0;
  /**
   * Whether a quality change is being applied.
   */
  switching = false;
  /**
   * The controller invalidating work from an obsolete lifecycle.
   */
  lifecycle = new AbortController();
  /**
   * An immutable snapshot of the current level, activity, and upgrade waiting state.
   */
  get snapshot() {
    return Object.freeze({
      active: this.active,
      level: this.index + 1,
      ...ORDERED_QUALITY_TIERS[this.index],
      switching: this.switching,
      upgradeAfter: this.upgradeAfter
    });
  }
  /**
   * Starts from a caller-supplied level without changing encoding settings.
   */
  start(level = 1) {
    if (!Number.isInteger(level) || level < 1 || level > ORDERED_QUALITY_TIERS.length) {
      throw new Error("Unsupported quality level");
    }
    this.stop();
    this.lifecycle = new AbortController();
    this.index = level - 1;
    this.active = true;
    this.stableUntil = this.upgradeAfter = this.probeUntil = 0;
  }
  /**
   * Invalidates old-session results while retaining serialization until pending native work completes.
   */
  stop() {
    this.active = false;
    this.lifecycle.abort();
    this.resetSamples();
  }
  /**
   * Discards accumulated samples during foreground work while retaining failed-probe cooldown.
   */
  resetSamples() {
    this.resetCounts();
    this.lastSampleAt = void 0;
  }
  /**
   * Processes only new quality events, never timer-replayed cached statistics. The caller reports
   * failures.
   */
  async observe(quality, sampleAt = this.now()) {
    if (!this.active || this.switching || !Number.isFinite(sampleAt)) {
      return;
    }
    const now = this.now();
    if (sampleAt > now) {
      return;
    }
    if (this.lastSampleAt !== void 0) {
      if (sampleAt <= this.lastSampleAt) {
        return;
      }
      if (sampleAt - this.lastSampleAt > this.policy.sampleTimeoutMs) {
        this.resetCounts();
      }
    }
    this.lastSampleAt = sampleAt;
    if (now - sampleAt > this.policy.sampleTimeoutMs || sampleAt < this.stableUntil) {
      this.resetCounts();
      return;
    }
    if (quality === "Bad" /* bad */ || quality === "VeryBad" /* veryBad */) {
      this.good = 0;
      this.poor++;
      if (this.poor >= this.policy.poorSamples && this.index < ORDERED_QUALITY_TIERS.length - 1) {
        return this.change(
          this.index + 1,
          now < this.probeUntil ? "failedProbe" : "poorNetwork"
        );
      }
    } else if (quality === "Excellent" /* excellent */ || quality === "Good" /* good */) {
      this.poor = 0;
      if (sampleAt < this.upgradeAfter) {
        this.good = 0;
        return;
      }
      this.good++;
      if (this.good >= this.policy.goodSamples && this.index > 0) {
        return this.change(
          this.index - 1,
          "probeUpgrade"
        );
      }
    } else {
      this.resetCounts();
    }
    return;
  }
  /**
   * Clears consecutive good and poor sample counts.
   */
  resetCounts() {
    this.good = this.poor = 0;
  }
  /**
   * Applies an adjacent candidate and updates state and transition windows after success.
   */
  async change(index, reason) {
    this.resetCounts();
    if (!this.canApply(index + 1)) {
      return;
    }
    const lifecycle = this.lifecycle;
    const change = {
      from: this.index + 1,
      to: index + 1,
      ...ORDERED_QUALITY_TIERS[index],
      reason
    };
    this.switching = true;
    try {
      await this.apply(
        change,
        lifecycle.signal
      );
      if (lifecycle.signal.aborted) {
        return;
      }
      this.index = index;
      const now = this.now();
      this.stableUntil = now + this.policy.stabilizationMs;
      this.probeUntil = reason === "probeUpgrade" ? now + this.policy.probeMs : 0;
      if (reason === "failedProbe") {
        this.upgradeAfter = now + this.policy.upgradeCooldownMs;
      }
      return change;
    } catch (error) {
      if (!lifecycle.signal.aborted) {
        this.stableUntil = this.now() + this.policy.stabilizationMs;
        throw error;
      }
      return;
    } finally {
      this.switching = false;
    }
  }
};

var QualityHistory = class _QualityHistory {
  /**
   * Creates model- and provider-specific quality history.
   */
  constructor(model, provider, now = Date.now) {
    this.model = model;
    this.provider = provider;
    this.now = now;
  }
  /**
   * The history lifetime, in milliseconds.
   */
  static expirationMs = 60 * 60 * 1e3;
  /**
   * Returns L2 for missing, expired, malformed, inaccessible, or clock-regressed history.
   */
  read(direction) {
    try {
      const entry = JSON.parse(globalThis.localStorage.getItem(this.key(direction)) ?? "null");
      const now = this.now();
      if (entry && this.isValid(entry.level) && Number.isFinite(entry.savedAt) && entry.savedAt > 0 && now >= entry.savedAt && now - entry.savedAt < _QualityHistory.expirationMs) {
        return entry.level;
      }
    } catch {
    }
    return INITIAL_QUALITY_LEVEL;
  }
  /**
   * Stores a successful level and refreshes its one-hour lifetime; downlink success means signaling
   * submission only.
   */
  write(direction, level) {
    if (!this.isValid(level)) {
      return;
    }
    try {
      globalThis.localStorage.setItem(
        this.key(direction),
        JSON.stringify({
          level,
          savedAt: this.now()
        })
      );
    } catch {
    }
  }
  /**
   * Builds a direction-specific storage key; timestamp-free records are invalid.
   */
  key(direction) {
    return `xmax:quality:v1:${this.provider}:${encodeURIComponent(this.model)}:${direction}`;
  }
  /**
   * Validates a quality-level number.
   */
  isValid(level) {
    return Number.isInteger(level) && level >= 1 && level <= Object.keys(QUALITY_TIERS).length;
  }
};

var RealtimeTiming = class {
  /**
   * The immutable startup timing snapshot.
   */
  snapshot = Object.freeze({});
  /**
   * The app's startup timing listener.
   */
  listener;
  /**
   * The revision identifying the current measurement cycle.
   */
  sequence = 0;
  /**
   * Whether the current cycle still accepts measurements.
   */
  active = false;
  /**
   * The startup origin on the monotonic clock, in milliseconds.
   */
  startedAt = 0;
  /**
   * Sets the listener and immediately replays the snapshot; undefined removes it.
   */
  setListener(listener) {
    this.listener = listener;
    this.notify();
  }
  /**
   * Resets startup timing and returns a one-shot camera-creation completion callback.
   */
  startCamera() {
    this.start();
    return this.measure(
      "cameraMs",
      this.startedAt
    );
  }
  /**
   * Starts a new measurement cycle. Non-camera sources do not record camera duration.
   */
  start() {
    this.sequence += 1;
    this.active = true;
    this.startedAt = performance.now();
    this.snapshot = Object.freeze({});
    this.notify();
  }
  /**
   * Starts measuring media-permission confirmation and returns its completion callback.
   */
  startPermission() {
    return this.measure(
      "permissionMs",
      performance.now()
    );
  }
  /**
   * Starts timing session creation.
   */
  startSession() {
    return this.measure(
      "sessionMs",
      performance.now()
    );
  }
  /**
   * Starts timing the RTC adapter's room-join call.
   */
  startRtcJoin() {
    return this.measure(
      "rtcJoinMs",
      performance.now()
    );
  }
  /**
   * Starts timing local publication and returns its completion callback.
   */
  startPublish() {
    return this.measure(
      "publishMs",
      performance.now()
    );
  }
  /**
   * Starts waiting for the first remote frame submitted to the compositor, excluding render warmup.
   */
  startFirstFrame() {
    return this.measure(
      "firstFrameMs",
      performance.now()
    );
  }
  /**
   * Starts render warmup after the first frame and records warmup and total duration when completed,
   * excluding fade-in.
   */
  startRenderWarmup() {
    return this.measure(
      "renderWarmupMs",
      performance.now()
    );
  }
  /**
   * Freezes completed values and invalidates pending callbacks until the next media source.
   */
  cancel() {
    this.active = false;
    this.sequence += 1;
  }
  /**
   * Creates a one-shot callback ignored after cycle invalidation or stage completion.
   */
  measure(key, startedAt) {
    const sequence = this.sequence;
    return () => {
      if (!this.active || sequence !== this.sequence || this.snapshot[key] !== void 0) {
        return;
      }
      const now = performance.now();
      this.snapshot = Object.freeze({
        ...this.snapshot,
        [key]: now - startedAt,
        ...key === "renderWarmupMs" ? { totalMs: now - this.startedAt } : {}
      });
      if (key === "renderWarmupMs") {
        const snapshot = this.snapshot;
        XmaxLogger.realtime.info(
          () => this.format(snapshot),
          2 /* performance */
        );
      }
      this.notify();
    };
  }
  /**
   * Formats the startup snapshot, using placeholders for incomplete or disabled stages.
   */
  format(snapshot) {
    const stages = [
      [XmaxLogger.localized(
        "\u6444\u50CF\u5934\u542F\u52A8\uFF1A",
        "Camera Startup: "
      ), snapshot.cameraMs],
      [XmaxLogger.localized(
        "\u5A92\u4F53\u6388\u6743\uFF1A",
        "Media Permission: "
      ), snapshot.permissionMs],
      [XmaxLogger.localized(
        "\u521B\u5EFA\u4F1A\u8BDD\uFF1A",
        "Session Creation: "
      ), snapshot.sessionMs],
      [XmaxLogger.localized(
        "RTC \u8FDB\u623F\uFF1A",
        "RTC Room Join: "
      ), snapshot.rtcJoinMs],
      [XmaxLogger.localized(
        "\u53D1\u5E03\u672C\u5730\u6D41\uFF1A",
        "Local Stream Publication: "
      ), snapshot.publishMs],
      [XmaxLogger.localized(
        "\u9996\u5E27\u5230\u8FBE\uFF1A",
        "First Frame Arrival: "
      ), snapshot.firstFrameMs],
      [XmaxLogger.localized(
        "\u6E32\u67D3\u9884\u70ED\uFF1A",
        "Render Warmup: "
      ), snapshot.renderWarmupMs]
    ];
    return [
      "\u5B9E\u65F6\u751F\u6210\u542F\u52A8\u8017\u65F6 (Realtime Generation Startup Timing)",
      `\u2514\u2500 ${XmaxLogger.localized("\u603B\u8017\u65F6\uFF1A", "Total Duration: ")}${this.duration(snapshot.totalMs)}`,
      ...stages.map(
        ([label, duration], index) => `   ${index === stages.length - 1 ? "\u2514\u2500" : "\u251C\u2500"} ${label}${this.duration(duration)}`
      )
    ].join("\n");
  }
  /**
   * Formats milliseconds to one decimal place, using a placeholder for missing or invalid values.
   */
  duration(milliseconds) {
    if (milliseconds === void 0 || !Number.isFinite(milliseconds) || milliseconds < 0) {
      return "\u2014";
    }
    return `${milliseconds.toFixed(1)} ms`;
  }
  /**
   * Delivers immutable snapshots while isolating synchronous and asynchronous observer failures.
   */
  notify() {
    try {
      void Promise.resolve(this.listener?.(this.snapshot)).catch(() => {
      });
    } catch {
    }
  }
};

function scopeAffects(scope, kind) {
  if (scope === 1 /* all */) {
    return true;
  }
  return kind !== "media" /* media */;
}
var OperationLease = class {
  /**
   * Whether this lease still owns its operation.
   */
  valid = true;
  /**
   * The error that terminated the operation.
   */
  terminalError;
  /**
   * The resources to clean up if this operation fails.
   */
  storedFailureScope;
  /**
   * The cancellation controller shared by this operation's asynchronous waits.
   */
  abortController = new AbortController();
  /**
   * Creates an operation lease without expanding cleanup when no failure scope is supplied.
   */
  constructor(failureScope) {
    this.storedFailureScope = failureScope;
  }
  /**
   * Whether the lease remains valid for committing asynchronous results.
   */
  get isCurrent() {
    return this.valid;
  }
  /**
   * The first invalidation error; undefined for cancellation without an explicit reason.
   */
  get failure() {
    return this.terminalError;
  }
  /**
   * The resources to release on operation failure or cancellation.
   */
  get failureScope() {
    return this.storedFailureScope;
  }
  /**
   * The signal aborted synchronously when the lease is invalidated.
   */
  get signal() {
    return this.abortController.signal;
  }
  /**
   * Sets the resources to release if the operation fails or its caller cancels it.
   */
  setFailureScope(scope) {
    this.storedFailureScope = scope;
  }
  /**
   * Invalidates the lease and aborts pending work, preserving the first termination reason.
   */
  invalidate(error) {
    this.valid = false;
    if (!this.terminalError) {
      this.terminalError = error;
    }
    this.abortController.abort();
  }
  /**
   * Verifies lifecycle ownership after an asynchronous boundary.
   */
  ensureCurrent() {
    if (!this.valid) {
      throw this.terminalError ?? XmaxRealtimeLifecycleManager.cancelledError();
    }
  }
};
var operationSequence = 0;
var XmaxRealtimeLifecycleManager = class _XmaxRealtimeLifecycleManager {
  /**
   * The handler that reports lifecycle failures.
   */
  errorManager;
  /**
   * The callback that releases resources for a termination scope.
   */
  cleanup;
  /**
   * The latest committed lifecycle state.
   */
  state = new RealtimeState({
    connectionState: "Idle" /* idle */
  });
  /**
   * The app's realtime state listener.
   */
  stateListener;
  /**
   * Receives committed state changes before application observers, independently of listener replay.
   */
  onStateChanged;
  /**
   * The operation currently admitted to the lifecycle.
   */
  activeOperation;
  /**
   * The active termination request.
   */
  termination;
  /**
   * Creates a coordinator with error reporting and scoped cleanup.
   */
  constructor(options) {
    this.errorManager = options.errorManager;
    this.cleanup = options.cleanup;
    this.onStateChanged = options.onStateChanged;
  }
  /**
   * The latest realtime state snapshot.
   */
  get currentState() {
    return this.state;
  }
  /**
   * Whether foreground work or cleanup prevents automatic quality adaptation from acquiring a lease.
   */
  get isBusy() {
    return this.activeOperation !== void 0 || this.termination !== void 0;
  }
  /**
   * Sets the state listener and immediately replays the current state.
   *
   * @param listener - The callback; undefined removes it.
   */
  async setStateListener(listener) {
    this.stateListener = listener;
    if (listener) {
      listener(this.state);
    }
  }
  /**
   * Admits and executes one realtime operation. Cancelling a lifecycle operation completes scoped
   * cleanup first. Cancelling only a configuration update does not stop generation.
   *
   * @param kind - The operation kind.
   * @param failureScope - The automatic failure cleanup scope; omission only reports failures.
   * @param body - The operation body, which validates its lease across asynchronous boundaries.
   * @returns The operation result.
   * @throws Rejects with invalidConfiguration if another operation or termination is active.
   */
  async run(kind, failureScope, body) {
    if (this.termination || this.activeOperation) {
      const error = new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Another realtime operation is in progress; wait for it to finish"
      );
      await this.errorManager.report(error);
      throw error;
    }
    const operationKind = kind === "generation" /* generation */ && (this.state.connectionState === "Generating" /* generating */ || this.state.connectionState === "Starting" /* starting */ && !!this.state.taskID) ? "configuration" /* configuration */ : kind;
    const lease = new OperationLease(failureScope);
    const resultPromise = (async () => body(lease))();
    const operation = {
      id: `op-${operationSequence += 1}`,
      kind: operationKind,
      lease,
      completion: resultPromise.then(
        () => void 0,
        () => void 0
      )
    };
    this.activeOperation = operation;
    try {
      const value = await resultPromise;
      lease.ensureCurrent();
      this.finish(operation);
      return value;
    } catch (error) {
      return this.handleFailure(
        error,
        operation
      );
    }
  }
  /**
   * Commits public state only for the current operation.
   */
  async commit(nextState, token) {
    token.ensureCurrent();
    await this.setState(nextState);
  }
  /**
   * Completes media preparation when the current local preview is ready.
   */
  async localPreviewDidBecomeReady(isCurrent) {
    if (this.state.connectionState !== "Preparing" /* preparing */ || !isCurrent()) {
      return;
    }
    await this.setState(
      new RealtimeState({ connectionState: "Ready" /* ready */ })
    );
  }
  /**
   * Enters generating only when the current task and presentation are ready; stale callbacks cannot
   * restore ended tasks.
   */
  async remotePreviewDidBecomeReady(sessionID, taskID, isCurrent) {
    if (this.termination || this.state.connectionState !== "Starting" /* starting */ || this.state.sessionID !== sessionID || this.state.taskID !== taskID || !isCurrent()) {
      return;
    }
    await this.setState(new RealtimeState({
      connectionState: "Generating" /* generating */,
      sessionID,
      taskID
    }));
  }
  /**
   * Disconnects and cancels active work, including work that has not committed a connection state.
   */
  async disconnect(reason = RealtimeReason.normal) {
    const task = await this.beginDisconnect(reason);
    await task;
  }
  /**
   * Begins disconnecting and returns its cleanup task without requiring local-media changes to await
   * network teardown.
   */
  async beginDisconnect(reason) {
    const hasConnectionOperation = this.activeOperation ? scopeAffects(
      0 /* connection */,
      this.activeOperation.kind
    ) : false;
    const state2 = this.state.connectionState;
    const needsDisconnect = hasConnectionOperation || this.termination !== void 0 || state2 !== "Idle" /* idle */ && state2 !== "Preparing" /* preparing */ && state2 !== "Ready" /* ready */;
    if (!needsDisconnect) {
      return void 0;
    }
    return this.requestTermination(
      0 /* connection */,
      void 0,
      reason
    );
  }
  /**
   * Terminates a scope and awaits cleanup, merging concurrent requests into the broadest scope.
   */
  async terminate(target, reason = RealtimeReason.normal) {
    const task = await this.requestTermination(
      target,
      void 0,
      reason
    );
    await task;
  }
  /**
   * Cleans up a current-lifecycle background failure and exposes its reason in the final state.
   */
  async terminateWithError(error, target, isCurrent = () => true) {
    if (!isCurrent()) {
      return;
    }
    if (this.termination && target !== 1 /* all */) {
      return;
    }
    const task = await this.requestTermination(
      target,
      error,
      RealtimeReason.failure(error)
    );
    await task;
  }
  /**
   * Routes cancellation through termination and other failures through scoped cleanup or reporting.
   */
  async handleFailure(error, operation) {
    const operationWasCancelled = error instanceof XmaxError && error.code === "CANCELLED" /* cancelled */ || error instanceof DOMException && error.name === "AbortError" || !operation.lease.isCurrent;
    if (operationWasCancelled) {
      if ((operation.kind === "configuration" /* configuration */ || operation.lease.failureScope === void 0) && operation.terminationTask === void 0 && this.termination === void 0) {
        this.finish(operation);
        if (operation.kind === "media" /* media */ && this.state.connectionState === "Preparing" /* preparing */) {
          await this.setState(
            new RealtimeState({ connectionState: "Idle" /* idle */ })
          );
        }
        throw _XmaxRealtimeLifecycleManager.cancelledError();
      }
      const terminationTask = operation.terminationTask ?? this.termination?.task ?? await this.requestTermination(
        operation.lease.failureScope ?? 0 /* connection */,
        void 0,
        RealtimeReason.normal,
        operation
      );
      await terminationTask;
      this.finish(operation);
      throw operation.lease.failure ?? _XmaxRealtimeLifecycleManager.cancelledError();
    }
    const resolvedError = XmaxError.from(error);
    if (operation.kind !== "configuration" /* configuration */ && operation.lease.failureScope !== void 0) {
      const terminationTask = await this.requestTermination(
        operation.lease.failureScope,
        resolvedError,
        RealtimeReason.failure(resolvedError),
        operation
      );
      await terminationTask;
    } else {
      this.finish(operation);
      if (operation.kind === "media" /* media */ && this.state.connectionState === "Preparing" /* preparing */) {
        await this.setState(
          new RealtimeState({ connectionState: "Idle" /* idle */ })
        );
      }
      await this.errorManager.report(resolvedError);
      throw resolvedError;
    }
    this.finish(operation);
    throw resolvedError;
  }
  /**
   * Begins or merges termination, invalidates obsolete operations, and enters disconnecting.
   */
  async requestTermination(target, error, reason, origin) {
    let pending = this.termination;
    if (pending) {
      if (target > pending.target) {
        pending.target = target;
      }
      if (!pending.error) {
        pending.error = error;
      }
      if (error && pending.error === error) {
        pending.reason = RealtimeReason.failure(error);
      }
    } else {
      pending = {
        id: `term-${operationSequence += 1}`,
        target,
        reason,
        error,
        waitForOperations: [],
        task: Promise.resolve()
      };
      this.termination = pending;
      pending.task = this.performTermination(pending.id);
    }
    const active = this.activeOperation;
    if (active && active !== origin && scopeAffects(
      pending.target,
      active.kind
    )) {
      active.lease.invalidate(pending.error);
      active.terminationTask = pending.task;
      pending.waitForOperations.push(() => active.completion);
    } else if (origin) {
      origin.lease.invalidate(error);
      origin.terminationTask = pending.task;
      pending.waitForOperations.push(() => origin.completion);
    }
    await this.setState(
      new RealtimeState({
        connectionState: "Disconnecting" /* disconnecting */,
        sessionID: this.state.sessionID
      })
    );
    return pending.task;
  }
  /**
   * Awaits obsolete operations, releases scoped resources, and commits the final state.
   */
  async performTermination(id) {
    const pending = this.termination;
    if (!pending || pending.id !== id) {
      return;
    }
    for (; ; ) {
      const waiters = pending.waitForOperations;
      pending.waitForOperations = [];
      for (const waiter of waiters) {
        await waiter();
      }
      const requestedTarget = pending.target;
      const result = await this.cleanup(
        requestedTarget,
        this.state.taskID ?? ""
      );
      if (result.sessionID) {
        pending.sessionID = result.sessionID;
      }
      if (pending.target !== requestedTarget || pending.waitForOperations.length > 0) {
        continue;
      }
      const connectionState = requestedTarget === 1 /* all */ ? "Idle" /* idle */ : result.hasLocalMedia ? "Ready" /* ready */ : "Idle" /* idle */;
      const finalState = new RealtimeState({
        connectionState,
        sessionID: pending.sessionID ?? this.state.sessionID,
        reason: pending.reason
      });
      const active = this.activeOperation;
      if (active && scopeAffects(
        requestedTarget,
        active.kind
      )) {
        this.finish(active);
      }
      const listener = !this.state.equals(finalState) ? this.stateListener : void 0;
      this.state = finalState;
      this.termination = void 0;
      this.errorManager.invalidatePendingFailures(requestedTarget);
      if (listener) {
        listener(finalState);
      }
      if (pending.error) {
        await this.errorManager.report(pending.error);
      }
      return;
    }
  }
  /**
   * Completes an operation and releases its admission slot.
   */
  finish(operation) {
    if (this.activeOperation?.id === operation.id) {
      this.activeOperation = void 0;
    }
  }
  /**
   * Commits and notifies a changed state, suppressing equivalent snapshots.
   */
  async setState(nextState) {
    if (this.state.equals(nextState)) {
      return;
    }
    this.state = nextState;
    this.onStateChanged?.(nextState);
    this.stateListener?.(nextState);
  }
  /**
   * Creates the standard operation-cancellation error.
   */
  static cancelledError() {
    return new XmaxError(
      "CANCELLED" /* cancelled */,
      "Realtime operation was cancelled"
    );
  }
};

var XmaxRealtimeConnectionManager = class {
  /**
   * Creates a connection manager.
   *
   * @param dependencies - The session, transport, timing, and rendering dependencies.
   */
  constructor(dependencies) {
    this.dependencies = dependencies;
  }
  /**
   * The session currently owned by this connection.
   */
  activeSession;
  /**
   * Whether entering generating has started this session's HTTP heartbeat loop.
   */
  heartbeatStarted = false;
  /**
   * The monotonic connection start time, retained until the session is disconnected.
   */
  connectionStartedAt;
  /**
   * The credential-refresh revision used to reject obsolete lifecycle updates.
   */
  refreshVersion = 0;
  /**
   * The shared in-progress credential refresh.
   */
  credentialRefresh;
  /**
   * The serialized credential-application chain.
   */
  credentialApplication = Promise.resolve();
  /**
   * The controller cancelling current credential refresh and recovery.
   */
  credentialController;
  /**
   * The active remote track registered with the render layer.
   */
  activeRemoteTrack;
  /**
   * The active session ID; undefined before connection or after cleanup.
   */
  get currentSessionID() {
    return this.activeSession?.id;
  }
  /**
   * The current session identity and model binding, replaced when credentials are refreshed.
   */
  get currentSession() {
    return this.activeSession;
  }
  /**
   * Requires session services before connection without preventing local preview.
   */
  validateConfiguration() {
    this.requireSessionService();
  }
  /**
   * Creates a session, configures encoding, joins, and publishes before returning a remote placeholder.
   * HTTP heartbeats wait until the session enters generating. Session creation, room join, and
   * publication are timed separately. Optional pre-publication checks block publication and contribute
   * only to overall startup time.
   *
   * @param options.localTrack - The active local media track.
   * @param options.remoteVideoFormat - The original generation and remote format; defaults to the local
   * track's format.
   * @param options.localVideoFormat - The actual uplink format, independent of generation and remote
   * dimensions.
   * @param options.onVideoEncoderConfigured - The callback after uplink configuration succeeds.
   * @param options.model - The model used to create the session.
   * @param options.includeLocalAudio - Whether to publish local audio.
   * @param options.ensureCurrent - The operation-validity check.
   * @param options.onPublished - The callback after publication succeeds.
   * @param options.beforePublish - An optional asynchronous publication prerequisite.
   * @throws Rejects for session, join, publication, or lease failures; the caller performs lifecycle
   * cleanup.
   */
  async connect(options) {
    const sessionService = this.requireSessionService();
    const streamController = this.dependencies.streamController;
    options.ensureCurrent();
    this.connectionStartedAt = performance.now();
    const completeSession = this.dependencies.timing.startSession();
    const session = await sessionService.createSession(options.model);
    this.activeSession = session;
    options.ensureCurrent();
    completeSession();
    const connection = session.connection;
    if (!connection) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Session does not contain RTC join information"
      );
    }
    if (connection.provider !== (this.dependencies.provider ?? "trtc" /* trtc */)) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "RTC adapter configuration does not match the session service"
      );
    }
    ++this.refreshVersion;
    this.credentialController = new AbortController();
    const videoFormat = options.localVideoFormat ?? options.localTrack.videoFormat;
    if (!videoFormat) {
      throw new XmaxError(
        "INTERNAL_ERROR" /* internalError */,
        "Local video stream has no video format"
      );
    }
    await streamController.updateUplinkVideoFormat(videoFormat);
    options.ensureCurrent();
    options.onVideoEncoderConfigured?.();
    options.ensureCurrent();
    let completePublish;
    await streamController.connect(
      connection,
      options.includeLocalAudio,
      () => {
        options.ensureCurrent();
      },
      async () => {
        options.ensureCurrent();
        await options.beforePublish?.();
        options.ensureCurrent();
        completePublish = this.dependencies.timing.startPublish();
      },
      () => this.dependencies.timing.startRtcJoin()
    );
    options.ensureCurrent();
    completePublish?.();
    options.onPublished();
    const remoteTrack = new RealtimeVideoTrack({
      id: connection.botID ?? "video-remote",
      videoFormat: options.remoteVideoFormat ?? options.localTrack.videoFormat
    });
    this.activeRemoteTrack = remoteTrack;
    this.dependencies.renderController.registerRemoteTrack(
      remoteTrack,
      this.dependencies.onInteraction
    );
    streamController.setRemoteAudioVolume(this.dependencies.remoteAudioVolume());
    return new RealtimeMediaStream({
      id: "stream1" /* remote */,
      videoTrack: remoteTrack
    });
  }
  /**
   * Starts HTTP heartbeats once when the session enters generating. The first request includes the
   * connection-to-generating duration rounded up to whole seconds; stale sessions are ignored.
   */
  startHeartbeat(sessionID) {
    const session = this.activeSession;
    if (!session || session.id !== sessionID || this.heartbeatStarted || this.connectionStartedAt === void 0) {
      return;
    }
    this.heartbeatStarted = true;
    const elapsedMs = performance.now() - this.connectionStartedAt;
    const firstHeartbeatGraceSeconds = Math.max(0, Math.ceil(elapsedMs / 1e3));
    const refreshVersion = this.refreshVersion;
    this.requireSessionService().startHeartbeat(
      session.id,
      {
        onFailure: (sessionID2, error) => {
          if (this.refreshVersion === refreshVersion && this.activeSession?.id === sessionID2) {
            this.dependencies.onHeartbeatFailure(
              sessionID2,
              error
            );
          }
        },
        onRefresh: (refreshed) => {
          return this.handleSessionRefresh(
            refreshed,
            refreshVersion
          );
        }
      },
      firstHeartbeatGraceSeconds
    );
  }
  /**
   * Clears rendered remote media while retaining track/view bindings for unified cleanup.
   */
  clearRemoteMedia() {
    this.dependencies.renderController.setRemoteMedia(null);
  }
  /**
   * Stops session heartbeats if a session service exists.
   */
  stopHeartbeat() {
    this.heartbeatStarted = false;
    this.connectionStartedAt = void 0;
    this.refreshVersion++;
    this.credentialController?.abort();
    this.credentialController = void 0;
    this.credentialRefresh = void 0;
    this.credentialApplication = Promise.resolve();
    this.dependencies.sessionService?.stopHeartbeat();
  }
  /**
   * Refreshes expired RTC credentials through a session heartbeat, merging concurrent requests.
   */
  async refreshCredentials() {
    if (this.credentialRefresh) {
      return this.credentialRefresh;
    }
    const current = this.activeSession;
    if (!current?.connection || current.connection.provider === "trtc" /* trtc */) {
      return;
    }
    const version = this.refreshVersion;
    const operation = (async () => {
      try {
        const session = await this.requireSessionService().heartbeatSession(current.id);
        await this.handleSessionRefresh(
          session,
          version,
          true
        );
      } catch (error) {
        if (version === this.refreshVersion && this.activeSession?.id === current.id) {
          this.dependencies.onHeartbeatFailure(
            current.id,
            XmaxError.from(error)
          );
        }
      }
    })();
    this.credentialRefresh = operation;
    try {
      await operation;
    } finally {
      if (this.credentialRefresh === operation) {
        this.credentialRefresh = void 0;
      }
    }
  }
  /**
   * Waits for the received track to unmute. Timeout only warns; cancellation exits immediately and
   * releases listeners.
   */
  async waitUntilRemoteTrackReady(timeoutMs, signal) {
    if (signal.aborted) {
      throw XmaxRealtimeLifecycleManager.cancelledError();
    }
    const mediaTrack = this.activeRemoteTrack?.mediaStreamTrack;
    if (!mediaTrack || !mediaTrack.muted) {
      return;
    }
    await new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        mediaTrack.removeEventListener(
          "unmute",
          finish
        );
        signal.removeEventListener(
          "abort",
          abort
        );
      };
      const finish = () => {
        cleanup();
        resolve();
      };
      const abort = () => {
        cleanup();
        reject(XmaxRealtimeLifecycleManager.cancelledError());
      };
      const timer = setTimeout(
        () => {
          XmaxLogger.realtime.warning(() => "\u7B49\u5F85\u8FDC\u7AEF\u751F\u6210\u6D41\u9996\u5E27\u8D85\u65F6 (Timed Out Waiting for the First Remote Frame)");
          finish();
        },
        timeoutMs
      );
      mediaTrack.addEventListener(
        "unmute",
        finish
      );
      signal.addEventListener(
        "abort",
        abort,
        { once: true }
      );
      if (signal.aborted) {
        abort();
      }
    });
  }
  /**
   * Updates the remote track and views when transport binds or clears a generated stream.
   *
   * @param binding - The remote stream and video track, or null to clear them.
   * @throws An error if a stream arrives without an active connection, preventing generation
   * confirmation.
   */
  handleRemoteStreamBinding(binding) {
    const track = this.activeRemoteTrack;
    if (!binding) {
      if (track) {
        track.mediaStreamTrack = void 0;
      }
      this.dependencies.renderController.setRemoteMedia(null);
      return;
    }
    if (!track) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "Remote generation stream arrived without an active realtime connection"
      );
    }
    track.mediaStreamTrack = binding.videoTrack;
    this.dependencies.renderController.setRemoteMedia(binding.videoTrack);
  }
  /**
   * Creates a media stream for the current remote result track.
   */
  makeRemoteStream() {
    const track = this.activeRemoteTrack;
    if (!track) {
      throw new XmaxError(
        "RTC_ERROR" /* rtcError */,
        "The remote generation stream is unavailable"
      );
    }
    return new RealtimeMediaStream({
      id: "stream1" /* remote */,
      videoTrack: track
    });
  }
  /**
   * Applies changed heartbeat credentials to the active connection. Changes to provider, room,
   * application, or login identity invalidate the connection instead.
   */
  handleSessionRefresh(session, version, force = false) {
    const operation = this.credentialApplication.then(() => this.applySessionRefresh(
      session,
      version,
      force
    ));
    this.credentialApplication = operation.catch(() => {
    });
    return operation;
  }
  /**
   * Validates the room binding and applies credentials without restoring obsolete connection state.
   */
  async applySessionRefresh(session, version, force) {
    const current = this.activeSession;
    if (version !== this.refreshVersion || !current || current.id !== session.id) {
      return;
    }
    const next = session.connection;
    if (!next) {
      return;
    }
    const previous = current.connection;
    const bindingChanged = previous !== void 0 && (next.provider !== previous.provider || next.roomID !== previous.roomID || connectionAppID(next) !== connectionAppID(previous) || next.botID !== previous.botID || next.userID !== previous.userID);
    if (bindingChanged) {
      this.dependencies.onHeartbeatFailure(
        session.id,
        new XmaxError(
          "SESSION_ERROR" /* sessionError */,
          "RTC session binding changed during heartbeat"
        )
      );
      return;
    }
    if (next.provider !== "trtc" /* trtc */ && (force || !previous || previous.provider === "trtc" /* trtc */ || next.roomToken !== previous.roomToken)) {
      await this.dependencies.streamController.updateCredentials(
        next,
        this.credentialController?.signal
      );
      if (version !== this.refreshVersion || this.activeSession !== current) {
        return;
      }
    }
    this.activeSession = new RealtimeSession({
      id: session.id,
      modelID: session.modelID ?? current.modelID,
      userID: session.userID ?? current.userID,
      status: session.status ?? current.status,
      connection: next,
      closeReason: session.closeReason
    });
  }
  /**
   * Attempts all connection cleanup, closing the server session even if leaving the room fails.
   */
  async disconnect() {
    const sessionID = this.activeSession?.id;
    this.stopHeartbeat();
    this.clearRemoteMedia();
    try {
      await this.dependencies.streamController.disconnect();
    } catch (error) {
      XmaxLogger.realtime.error(() => `\u65AD\u5F00 RTC \u8FDE\u63A5\u5931\u8D25 (Failed to Disconnect RTC)
\u2514\u2500 ${XmaxError.from(error).message}`);
    }
    const track = this.activeRemoteTrack;
    if (track) {
      this.dependencies.renderController.resetRemoteTrack();
      track.mediaStreamTrack = void 0;
    }
    this.activeSession = void 0;
    this.activeRemoteTrack = void 0;
    if (sessionID && this.dependencies.sessionService) {
      try {
        await this.dependencies.sessionService.closeSession(sessionID);
      } catch (error) {
        XmaxLogger.realtime.error(() => `\u5173\u95ED\u5B9E\u65F6\u4F1A\u8BDD\u5931\u8D25 (Failed to Close Realtime Session)
\u2514\u2500 ${XmaxError.from(error).message}`);
      }
    }
    return sessionID;
  }
  /**
   * Returns the session service or throws a configuration error.
   */
  requireSessionService() {
    if (!this.dependencies.sessionService) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "The realtime manager is not configured with an API service"
      );
    }
    return this.dependencies.sessionService;
  }
};

var XmaxRealtimeGenerationManager = class _XmaxRealtimeGenerationManager {
  /**
   * Creates a generation manager with transport, interaction, rendering, and task-ID dependencies.
   */
  constructor(streamController, interactionController, renderController, taskIDGenerator = _XmaxRealtimeGenerationManager.createTaskID) {
    this.streamController = streamController;
    this.interactionController = interactionController;
    this.renderController = renderController;
    this.taskIDGenerator = taskIDGenerator;
  }
  /**
   * The latest successfully cached generation conditions.
   */
  currentContext;
  /**
   * The active generation task ID.
   */
  activeTaskID;
  /**
   * The shared result of concurrent task-stop requests.
   */
  pendingStop;
  /**
   * Validates initial conditions before connecting, allowing later calls to reuse the cache.
   */
  validateContext(context) {
    const resolved = context ?? this.currentContext;
    if (!resolved) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "A realtime context is required for the first generation"
      );
    }
    return resolved;
  }
  /**
   * Sends generation signaling and waits for confirmation, remote readiness, and audio activation.
   * Caches conditions only after confirmation. Startup failure attempts to stop the task while
   * preserving the original error.
   *
   * @param options.videoFormat - The fixed media format for interaction coordinates.
   * @param options.generationVideoFormat - The model canvas format; defaults to the media format.
   * @param options.paddingContain - Whether the server contains the input within the canvas.
   * @param options.signal - The startup cancellation signal.
   * @param options.ensureCurrent - The operation-validity check.
   * @param options.waitUntilRemoteReady - The remote-stream readiness wait.
   * @param options.context - The generation conditions; omission reuses cached conditions.
   * @param options.restart - Whether to replace the task with a new start message without sending stop;
   * defaults to false.
   * @param options.targetSize - The returned dimensions, omitted when unset.
   * @param options.mirror - Whether start requests horizontal input mirroring; defaults to false.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.onStartSent - The optional asynchronous callback after start is sent.
   * @param options.extraParams - Additional uncached start parameters.
   */
  async start(options) {
    const context = this.validateContext(options.context);
    options.ensureCurrent();
    const taskID = this.taskIDGenerator();
    if (options.restart) {
      this.interactionController.stopInteraction();
      this.renderController.setInteractionEnabled(false);
    }
    this.activeTaskID = taskID;
    try {
      const confirmation = this.streamController.beginGeneration({
        taskID,
        videoFormat: options.generationVideoFormat ?? options.videoFormat,
        paddingContain: options.paddingContain,
        context,
        restart: options.restart,
        ...options.targetSize && { targetSize: options.targetSize },
        mirror: options.mirror ?? false,
        faceRestoration: options.faceRestoration ?? false,
        ...options.onStartSent && { onStartSent: options.onStartSent },
        extraParams: options.extraParams
      });
      await this.awaitConfirmation(
        confirmation,
        options.signal
      );
      options.ensureCurrent();
      this.currentContext = context;
      if (options.extraParams?.static_generate !== true) {
        await options.waitUntilRemoteReady();
      }
      options.ensureCurrent();
      await this.streamController.activateRemoteAudio();
      options.ensureCurrent();
      this.interactionController.startInteraction(
        taskID,
        options.videoFormat
      );
      this.renderController.setInteractionEnabled(
        true,
        options.videoFormat
      );
      return taskID;
    } catch (error) {
      await this.stop(taskID);
      throw error;
    }
  }
  /**
   * Updates active-task conditions and replaces cached conditions only after signaling succeeds.
   *
   * @param taskID - The active task ID.
   * @param options.videoFormat - The fixed media format for interaction coordinates.
   * @param options.generationVideoFormat - The model canvas format; defaults to the media format.
   * @param options.paddingContain - Whether the server contains the input within the canvas.
   * @param options.context - The generation conditions; omission reuses cached conditions.
   * @param options.targetSize - The returned dimensions, omitted when unset.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false.
   * @param options.extraParams - Additional uncached change_condition parameters.
   */
  async update(taskID, options) {
    const context = options.context ?? this.currentContext;
    if (!taskID || !context) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "A realtime context is required to update the current generation"
      );
    }
    await this.streamController.updateGeneration({
      taskID,
      videoFormat: options.generationVideoFormat ?? options.videoFormat,
      paddingContain: options.paddingContain,
      context,
      ...options.targetSize && { targetSize: options.targetSize },
      faceRestoration: options.faceRestoration ?? false,
      extraParams: options.extraParams
    });
    if (this.activeTaskID !== taskID) {
      throw XmaxRealtimeLifecycleManager.cancelledError();
    }
    this.currentContext = context;
    this.interactionController.startInteraction(
      taskID,
      options.videoFormat
    );
    this.renderController.setInteractionEnabled(
      true,
      options.videoFormat
    );
  }
  /**
   * Stops an active task idempotently, sharing concurrent results and logging stop failures.
   */
  async stop(taskID = this.activeTaskID) {
    if (this.pendingStop && (!taskID || this.pendingStop.taskID === taskID)) {
      return this.pendingStop.completion;
    }
    if (!taskID || this.activeTaskID !== taskID) {
      return;
    }
    this.activeTaskID = void 0;
    this.interactionController.stopInteraction();
    this.renderController.setInteractionEnabled(false);
    const completion = (async () => {
      try {
        await this.streamController.stopGeneration(taskID);
      } catch (error) {
        XmaxLogger.realtime.error(() => `\u505C\u6B62\u751F\u6210\u4EFB\u52A1\u5931\u8D25 (Failed to Stop Generation Task)
\u2514\u2500 ${XmaxError.from(error).message}`);
      }
    })();
    this.pendingStop = {
      taskID,
      completion
    };
    try {
      await completion;
    } finally {
      if (this.pendingStop?.completion === completion) {
        this.pendingStop = void 0;
      }
    }
  }
  /**
   * Clears cached conditions and awaits task shutdown for disconnect or close.
   */
  async reset(taskID) {
    this.currentContext = void 0;
    this.interactionController.stopInteraction();
    this.renderController.setInteractionEnabled(false);
    await this.stop(this.activeTaskID ?? (taskID || void 0));
  }
  /**
   * Awaits confirmation, rejecting promptly on cancellation and releasing the abort listener on every
   * path.
   */
  async awaitConfirmation(confirmation, signal) {
    await new Promise((resolve, reject) => {
      const cleanup = () => signal.removeEventListener(
        "abort",
        abort
      );
      const abort = () => {
        cleanup();
        reject(XmaxRealtimeLifecycleManager.cancelledError());
      };
      confirmation.then(
        () => {
          cleanup();
          resolve();
        },
        (error) => {
          cleanup();
          reject(error);
        }
      );
      signal.addEventListener(
        "abort",
        abort,
        { once: true }
      );
      if (signal.aborted) {
        abort();
      }
    });
  }
  /**
   * Creates a unique generation task ID.
   */
  static createTaskID() {
    const hex = crypto.randomUUID().replace(
      /-/g,
      ""
    );
    let binary = "";
    for (let index = 0; index < 16; index += 1) {
      binary += String.fromCharCode(parseInt(
        hex.slice(
          index * 2,
          index * 2 + 2
        ),
        16
      ));
    }
    const base64url = btoa(binary).replace(
      /\+/g,
      "-"
    ).replace(
      /\//g,
      "_"
    ).replace(
      /=+$/,
      ""
    );
    return `task-${base64url}?os=web`;
  }
};

var XmaxRealtimeErrorManager = class {
  /**
   * The pending failures awaiting lifecycle invalidation.
   */
  pendingFailures = [];
  /**
   * Records a realtime failure and outputs its diagnostic log.
   */
  async report(error) {
    if (error.code === "CANCELLED" /* cancelled */) {
      return;
    }
    this.pendingFailures.push(error);
    XmaxLogger.realtime.error(
      () => `\u5B9E\u65F6\u4E1A\u52A1\u9519\u8BEF (Realtime Error)
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${error.code} ${error.message}`
    );
  }
  /**
   * Clears background failures belonging to a terminated lifecycle.
   */
  invalidatePendingFailures(_target) {
    this.pendingFailures = [];
  }
};

var XmaxRealtimeFactory = class {
  /**
   * Creates components in dependency order without starting capture, joining, or generation.
   */
  static make(options, dependencies, timing, bindings) {
    const mediaService = new MediaService(options.model);
    const errorManager = new XmaxRealtimeErrorManager();
    const rtcManager = dependencies?.rtcManager ?? createRtcManager(
      options.provider,
      dependencies?.environment ?? "china" /* china */
    );
    const canReadRemoteAudio = options.provider !== "trtc" /* trtc */ || rtcManager.supportsRemoteAudioVolumeControl;
    const sessionService = dependencies?.sessionService ?? (dependencies?.apiService ? new RealtimeSessionService({
      apiService: dependencies.apiService,
      provider: options.provider
    }) : void 0);
    let connectionManager;
    let lifecycleManager;
    const eventRelayService = dependencies?.eventRelayService;
    const redundantSignalingEnabled = options.model === "x2.1" /* x2_1 */;
    const streamController = dependencies?.streamController ?? new StreamController({
      rtcManager,
      roomController: new RoomController({
        rtcManager,
        retryCommands: redundantSignalingEnabled,
        relayMessage: redundantSignalingEnabled && eventRelayService ? async (message, signal) => {
          const session = connectionManager.currentSession;
          const data = JSON.parse(message);
          if (!session?.modelID) {
            XmaxLogger.room.warning(() => `HTTP \u4FE1\u4EE4\u8F6C\u53D1\u5DF2\u8DF3\u8FC7 (HTTP Signaling Relay Skipped)
\u251C\u2500 event: ${data.event}, xid: ${data.xid}
\u2514\u2500 Session does not contain a model instance ID`);
            return;
          }
          await eventRelayService.relay({
            sessionID: session.id,
            modelID: session.modelID,
            data,
            signal
          });
        } : void 0
      }),
      onCredentialsRequired: () => {
        void connectionManager.refreshCredentials();
      },
      errorListener: (error) => {
        void errorManager.report(error);
      },
      remoteStreamListener: (binding) => {
        bindings.clearRemoteVideoStatistics();
        connectionManager.handleRemoteStreamBinding(binding);
      }
    });
    const mediaController = new MediaController({
      rtcManager,
      mediaService,
      cameraController: dependencies?.cameraController,
      onCameraError: (error) => {
        void errorManager.report(error);
      },
      onVideoError: (error) => {
        void lifecycleManager.terminateWithError(
          error,
          0 /* connection */
        );
      },
      onExternalError: (error) => {
        void lifecycleManager.terminateWithError(
          error,
          1 /* all */
        );
      },
      onImageError: (error) => {
        void lifecycleManager.terminateWithError(
          error,
          1 /* all */
        );
      },
      interactionListener: (taskID, points) => streamController.sendTracks(
        taskID,
        points
      )
    });
    const renderController = new RenderController({
      onFrameDisplayed: () => bindings.onFrameDisplayed(),
      onRenderWarmupCompleted: () => {
        bindings.onRenderWarmupCompleted();
        void bindings.completeGenerationPresentation().catch((error) => errorManager.report(error));
      }
    });
    connectionManager = new XmaxRealtimeConnectionManager({
      provider: options.provider,
      sessionService,
      streamController,
      timing,
      remoteAudioVolume: () => bindings.remoteAudioVolume(),
      onHeartbeatFailure: (sessionID, error) => {
        void bindings.onHeartbeatFailure(
          sessionID,
          error
        );
      },
      renderController,
      onInteraction: (frame) => mediaController.submitInteraction(frame)
    });
    const generationManager = new XmaxRealtimeGenerationManager(
      streamController,
      mediaController,
      renderController
    );
    lifecycleManager = new XmaxRealtimeLifecycleManager({
      errorManager,
      onStateChanged: (state2) => {
        if (state2.connectionState === "Generating" /* generating */ && state2.sessionID) {
          connectionManager.startHeartbeat(state2.sessionID);
        }
      },
      cleanup: (scope, taskID) => bindings.cleanup(
        scope,
        taskID
      )
    });
    let qualityHistory;
    let qualityController;
    let downlinkQualityController;
    if (options.isAdaptiveQualityEnabled && (options.provider === "agora" /* agora */ || options.provider === "trtc" /* trtc */)) {
      qualityHistory = new QualityHistory(
        options.model,
        options.provider
      );
      qualityController = new QualityController(
        async (change, signal) => {
          await lifecycleManager.run(
            "configuration" /* configuration */,
            void 0,
            async (token) => {
              await bindings.applyUplinkQuality(
                change.to,
                token,
                signal
              );
            }
          );
        },
        void 0,
        {},
        (level) => bindings.supportsUplinkQuality(level)
      );
      downlinkQualityController = new QualityController(async (change, signal) => {
        await lifecycleManager.run(
          "configuration" /* configuration */,
          void 0,
          async (token) => {
            await bindings.applyDownlinkQuality(
              change.to,
              token,
              signal
            );
          }
        );
      });
    }
    return {
      mediaService,
      errorManager,
      canReadRemoteAudio,
      streamController,
      mediaController,
      renderController,
      connectionManager,
      generationManager,
      lifecycleManager,
      qualityHistory,
      qualityController,
      downlinkQualityController
    };
  }
  /**
   * Installs statistics listeners after the manager has assigned all component references.
   */
  static bindStatistics(streamController, listeners) {
    streamController.setUplinkVideoStatisticsListener(listeners.uplink);
    streamController.setNetworkQualityListener(listeners.network);
    streamController.setDownlinkVideoStatisticsListener(listeners.downlink);
  }
};

var RealtimeCameraPreset = /* @__PURE__ */ ((RealtimeCameraPreset2) => {
  RealtimeCameraPreset2["resolution1920x1080"] = "1920x1080";
  RealtimeCameraPreset2["resolution1080x1920"] = "1080x1920";
  RealtimeCameraPreset2["resolution1408x1408"] = "1408x1408";
  RealtimeCameraPreset2["resolution1152x1536"] = "1152x1536";
  RealtimeCameraPreset2["resolution1536x1152"] = "1536x1152";
  RealtimeCameraPreset2["resolution704x1280"] = "704x1280";
  RealtimeCameraPreset2["resolution1280x704"] = "1280x704";
  RealtimeCameraPreset2["resolution960x960"] = "960x960";
  RealtimeCameraPreset2["resolution1024x768"] = "1024x768";
  RealtimeCameraPreset2["resolution768x1024"] = "768x1024";
  return RealtimeCameraPreset2;
})(RealtimeCameraPreset || {});
function cameraPresetSize(preset) {
  if (!Object.values(RealtimeCameraPreset).includes(preset)) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "Unsupported camera preset"
    );
  }
  const [width, height] = preset.split("x").map(Number);
  return {
    width,
    height
  };
}

var REMOTE_FIRST_FRAME_TIMEOUT_MS = 5e3;
var XmaxRealtimeManager = class _XmaxRealtimeManager {
  /**
   * The realtime generation configuration.
   */
  options;
  /**
   * The media-sizing and platform-capability service.
   */
  mediaService;
  /**
   * The on-demand shared-result frame observer, without recording or file muxing.
   */
  remoteMediaFrames = new RemoteMediaFrameController();
  /**
   * The shared result-track observer, independent of WebCodecs.
   */
  remoteMediaTracksListener;
  /**
   * Whether decoded result-frame observation currently needs shared tracks.
   */
  remoteMediaFrameObservation = false;
  /**
   * Whether this RTC provider can observe audio independently of playback volume.
   */
  canReadRemoteAudio;
  /**
   * The fixed media format resolved at source creation, unaffected by uplink, generation-canvas, or
   * downlink changes.
   */
  resolvedMediaVideoFormat;
  /**
   * The observer of resolved media dimensions, retained while the manager is reusable.
   */
  resolvedMediaSizeListener;
  /**
   * The coordinator owning lifecycle admission, state, and cleanup.
   */
  lifecycleManager;
  /**
   * The handler for asynchronous realtime failures.
   */
  errorManager;
  /**
   * The active media source and interaction sampling controller.
   */
  mediaController;
  /**
   * The remote-track, warmup, and interaction-view binding controller.
   */
  renderController;
  /**
   * The startup-stage timing observer.
   */
  timing = new RealtimeTiming();
  /**
   * The callback ending first-frame timing when a remote frame is submitted for display.
   */
  remoteFrameDisplayHandler;
  /**
   * The callback recording completed render warmup and presentation readiness.
   */
  remoteRenderWarmupCompletedHandler;
  /**
   * The disposer for media-permission observation.
   */
  permissionWatchDispose;
  /**
   * The latest local-video statistics snapshot.
   */
  localVideoStatistics;
  /**
   * The app's local-video statistics listener.
   */
  localVideoStatisticsListener;
  /**
   * The current result stream's video statistics.
   */
  remoteVideoStatistics;
  /**
   * The app's remote-video statistics listener.
   */
  remoteVideoStatisticsListener;
  /**
   * Whether local publication has enabled valid video statistics.
   */
  acceptsVideoStatistics = false;
  /**
   * The latest uplink and downlink network quality snapshot.
   */
  networkStatistics;
  /**
   * The app's network quality listener.
   */
  networkStatisticsListener;
  /**
   * The owner of session and RTC connection resources.
   */
  connectionManager;
  /**
   * The owner of generation signaling, confirmation, and cached conditions.
   */
  generationManager;
  /**
   * The controller for room transport, publication, subscriptions, and generation signaling.
   */
  streamController;
  /**
   * The uplink quality-adaptation state machine.
   */
  qualityController;
  /**
   * The locally persisted history of successful quality levels.
   */
  qualityHistory;
  /**
   * Each local track's fixed quality baseline and current level.
   */
  qualityStates = /* @__PURE__ */ new WeakMap();
  /**
   * The downlink quality-adaptation state machine.
   */
  downlinkQualityController;
  /**
   * The last successfully sent downlink level and dimensions, without a server-application
   * acknowledgment.
   */
  downlinkQualityState;
  /**
   * Whether an adaptive-quality update is in progress.
   */
  adaptiveQualityPending = false;
  /**
   * The adaptation revision used to reject obsolete task results.
   */
  adaptiveQualityRevision = 0;
  /**
   * The local media preview volume, from 0 to 1.
   */
  storedLocalAudioVolume = 1;
  /**
   * The remote playback volume, from 0 to 1.
   */
  storedRemoteAudioVolume = 0;
  /**
   * Creates a realtime manager.
   *
   * @param options - The realtime model and generation configuration.
   * @param dependencies - Optional service and controller replacements; capture and transport share one
   * RTC engine.
   */
  constructor(options, dependencies) {
    this.options = options;
    const components = XmaxRealtimeFactory.make(
      options,
      dependencies,
      this.timing,
      {
        clearRemoteVideoStatistics: () => this.clearRemoteVideoStatistics(),
        onFrameDisplayed: () => this.remoteFrameDisplayHandler?.(),
        onRenderWarmupCompleted: () => this.remoteRenderWarmupCompletedHandler?.(),
        completeGenerationPresentation: () => this.completeGenerationPresentation(),
        remoteAudioVolume: () => this.storedRemoteAudioVolume,
        onHeartbeatFailure: (sessionID, error) => this.handleHeartbeatFailure(
          sessionID,
          error
        ),
        cleanup: (scope, taskID) => this.performCleanup(
          scope,
          taskID
        ),
        applyUplinkQuality: (level, token, signal) => this.applyUplinkQuality(
          level,
          token,
          signal
        ),
        applyDownlinkQuality: (level, token, signal) => this.applyDownlinkQuality(
          level,
          token,
          signal
        ),
        supportsUplinkQuality: (level) => {
          const track = this.currentLocalTrack;
          const state2 = track && this.qualityStates.get(track);
          return !!state2 && supportsQualityEncoding(this.uplinkQualityFormat(
            state2.baseline,
            level
          ));
        }
      }
    );
    this.mediaService = components.mediaService;
    this.errorManager = components.errorManager;
    this.canReadRemoteAudio = components.canReadRemoteAudio;
    this.streamController = components.streamController;
    this.mediaController = components.mediaController;
    this.renderController = components.renderController;
    this.connectionManager = components.connectionManager;
    this.generationManager = components.generationManager;
    this.lifecycleManager = components.lifecycleManager;
    this.qualityHistory = components.qualityHistory;
    this.qualityController = components.qualityController;
    this.downlinkQualityController = components.downlinkQualityController;
    XmaxRealtimeFactory.bindStatistics(
      this.streamController,
      {
        uplink: (statistics) => {
          if (this.acceptsVideoStatistics) {
            this.localVideoStatistics = statistics ? Object.freeze({ ...statistics }) : void 0;
            this.notifyLocalVideoStatistics();
          }
        },
        network: (statistics) => {
          if (this.acceptsVideoStatistics) {
            this.networkStatistics = statistics ? Object.freeze({ ...statistics }) : void 0;
            this.handleAdaptiveQuality(statistics);
            this.notifyNetworkStatistics();
          }
        },
        downlink: (statistics) => {
          if (this.acceptsVideoStatistics) {
            this.remoteVideoStatistics = statistics ? Object.freeze({ ...statistics }) : void 0;
            this.notifyRemoteVideoStatistics();
          }
        }
      }
    );
  }
  /**
   * The current realtime connection and generation state.
   */
  get currentState() {
    return this.lifecycleManager.currentState;
  }
  /**
   * The fixed camera media format, independent of adapted uplink dimensions.
   */
  get currentCameraVideoFormat() {
    return this.mediaController.source === "camera" ? this.resolvedMediaVideoFormat ?? this.currentLocalTrack?.videoFormat : void 0;
  }
  /**
   * The preset matching camera media dimensions, independent of encoding frame rate or quality level.
   */
  get currentCameraPreset() {
    const format = this.currentCameraVideoFormat;
    return format && Object.values(RealtimeCameraPreset).find((preset) => {
      const size = cameraPresetSize(preset);
      return size.width === format.width && size.height === format.height;
    });
  }
  /**
   * The uplink level successfully applied to the active connection.
   */
  get uplinkQualityLevel() {
    const track = this.currentLocalTrack;
    const state2 = this.currentState.connectionState;
    return (state2 === "Connected" /* connected */ || state2 === "Starting" /* starting */ || state2 === "Generating" /* generating */) && track ? this.qualityStates.get(track)?.level : void 0;
  }
  /**
   * The downlink level successfully submitted for the active connection.
   */
  get downlinkQualityLevel() {
    const state2 = this.currentState.connectionState;
    return state2 === "Connected" /* connected */ || state2 === "Starting" /* starting */ || state2 === "Generating" /* generating */ ? this.downlinkQualityState?.level : void 0;
  }
  /**
   * Updates a disconnected camera within a media operation and resets quality baselines after success.
   */
  async updateCameraFormat(format) {
    await this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        const current = this.currentCameraVideoFormat;
        if (this.currentState.connectionState !== "Ready" /* ready */ || this.connectionManager.currentSessionID || !current) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Camera preview must be ready and disconnected before updating its format"
          );
        }
        const size = typeof format === "string" ? cameraPresetSize(format) : void 0;
        const requested = size ? current.resized(
          size.width,
          size.height
        ) : format;
        if (!requested || typeof requested.validate !== "function") {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "A camera format or preset is required"
          );
        }
        token.ensureCurrent();
        await this.mediaController.updateCameraFormat(requested);
        token.ensureCurrent();
        const track = this.currentLocalTrack;
        this.updateResolvedMediaVideoFormat(track.videoFormat);
        this.qualityStates.delete(track);
      }
    );
  }
  /**
   * Sets the uplink level and resumes automatic adaptation from it.
   */
  setUplinkQualityLevel(level) {
    return this.updateQualityLevel(
      level,
      false,
      true
    );
  }
  /**
   * Sets the downlink level through the target-dimensions signaling path.
   */
  setDownlinkQualityLevel(level) {
    return this.updateQualityLevel(
      level,
      true,
      true
    );
  }
  /**
   * Adjusts uplink quality while retaining the baseline and continuing enabled adaptation.
   *
   * @param direction - The adjustment direction; L1/L5 boundaries do not reapply the same level.
   */
  async adjustUplinkQuality(direction) {
    return this.updateQualityLevel(
      direction,
      false
    );
  }
  /**
   * Applies uplink quality and updates track metadata and history after success.
   */
  async applyUplinkQuality(level, token, signal) {
    const track = this.currentLocalTrack;
    const state2 = track && this.qualityStates.get(track);
    const ensureActive2 = () => {
      token.ensureCurrent();
      if (signal?.aborted || !track || !state2 || track !== this.currentLocalTrack || state2 !== this.qualityStates.get(track) || this.currentState.connectionState !== "Generating" /* generating */) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Adaptive video format update was cancelled"
        );
      }
    };
    ensureActive2();
    if (!track || !state2) {
      return;
    }
    const target = this.uplinkQualityFormat(
      state2.baseline,
      level
    );
    let format;
    if (this.options.provider === "trtc" /* trtc */) {
      format = await this.streamController.updateUplinkFrameRate(target.fps);
    } else {
      await this.streamController.updateUplinkVideoFormat(target);
      format = target;
    }
    ensureActive2();
    if (!this.resolvedMediaVideoFormat) {
      this.updateResolvedMediaVideoFormat(state2.baseline);
    }
    track.updateVideoFormat(format);
    state2.level = level;
    this.qualityHistory?.write(
      "uplink",
      level
    );
  }
  /**
   * Adjusts downlink quality through the shared target-size signaling path without changing generation
   * or uplink settings.
   */
  async adjustDownlinkQuality(direction) {
    return this.updateQualityLevel(
      direction,
      true
    );
  }
  /**
   * Serializes explicit and incremental quality changes, retaining the last successful level on failure.
   */
  async updateQualityLevel(requested, downlink, absolute = false) {
    await this.lifecycleManager.run(
      "configuration" /* configuration */,
      void 0,
      async (token) => {
        const track = this.currentLocalTrack;
        const state2 = downlink ? this.downlinkQualityState : track && this.qualityStates.get(track);
        if (!state2 || this.currentState.connectionState !== "Generating" /* generating */) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Quality adjustment requires an active generation"
          );
        }
        let level = NaN;
        if (absolute) {
          if (typeof requested === "number") {
            level = requested;
          }
        } else if (requested === "upgrade" || requested === "downgrade") {
          const step = requested === "upgrade" ? -1 : 1;
          level = Math.max(1, Math.min(Object.keys(QUALITY_TIERS).length, state2.level + step));
        }
        if (!Number.isInteger(level) || level < 1 || level > Object.keys(QUALITY_TIERS).length) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Unsupported quality level or direction"
          );
        }
        if (level === state2.level) {
          return;
        }
        if (!downlink && !supportsQualityEncoding(this.uplinkQualityFormat(
          state2.baseline,
          level
        ))) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Quality level conflicts with explicit bitrate constraints"
          );
        }
        this.adaptiveQualityRevision++;
        const controller = downlink ? this.downlinkQualityController : this.qualityController;
        controller?.resetSamples();
        if (downlink) {
          await this.applyDownlinkQuality(
            level,
            token
          );
        } else {
          await this.applyUplinkQuality(
            level,
            token
          );
        }
        controller?.start(level);
      }
    );
  }
  /**
   * Sends target downlink dimensions and updates the level after success.
   */
  async applyDownlinkQuality(level, token, signal) {
    const state2 = this.downlinkQualityState;
    const ensureActive2 = () => {
      token.ensureCurrent();
      if (signal?.aborted || !state2 || state2 !== this.downlinkQualityState || this.currentState.connectionState !== "Generating" /* generating */ || this.currentState.taskID !== state2.taskID) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Target size update was cancelled"
        );
      }
    };
    ensureActive2();
    if (!state2) {
      return;
    }
    const size = this.resolveTargetSize(
      state2.baseline,
      level
    );
    await this.streamController.updateDownlinkVideoResolution(
      state2.taskID,
      size,
      ensureActive2
    );
    ensureActive2();
    state2.level = level;
    state2.size = size;
    this.qualityHistory?.write(
      "downlink",
      level
    );
  }
  /**
   * The local media preview volume, from 0 to 1.
   */
  get localAudioVolume() {
    return this.storedLocalAudioVolume;
  }
  /**
   * The remote generated audio volume, from 0 to 1.
   */
  get remoteAudioVolume() {
    return this.storedRemoteAudioVolume;
  }
  /**
   * Registers the fixed-media-size observer and synchronously replays its current snapshot.
   */
  setResolvedMediaSizeListener(listener) {
    this.resolvedMediaSizeListener = listener;
    this.notifyResolvedMediaSize();
  }
  /**
   * Stores the media baseline and notifies only when its dimensions change or become unavailable.
   */
  updateResolvedMediaVideoFormat(format) {
    const previous = this.resolvedMediaVideoFormat;
    this.resolvedMediaVideoFormat = format;
    if (previous?.width !== format?.width || previous?.height !== format?.height) {
      this.notifyResolvedMediaSize();
    }
  }
  /**
   * Delivers a detached, immutable size without allowing observer failures to break media operations.
   */
  notifyResolvedMediaSize() {
    const format = this.resolvedMediaVideoFormat;
    const size = format ? Object.freeze({ width: format.width, height: format.height }) : void 0;
    try {
      void Promise.resolve(this.resolvedMediaSizeListener?.(size)).catch(() => {
      });
    } catch {
    }
  }
  /**
   * Sets the state listener and immediately replays the current state.
   *
   * @param listener - The callback; undefined removes it.
   */
  async setStateListener(listener) {
    await this.lifecycleManager.setStateListener(listener);
  }
  /**
   * Sets the startup timing listener and immediately replays the snapshot; undefined removes it.
   */
  async setTimingListener(listener) {
    this.timing.setListener(listener);
  }
  /**
   * Observes local main-stream video statistics and immediately replays the latest snapshot.
   */
  async setUplinkVideoStatisticsListener(listener) {
    this.localVideoStatisticsListener = listener;
    this.notifyLocalVideoStatistics();
  }
  /**
   * Observes result-stream video statistics and immediately replays the latest snapshot.
   */
  async setDownlinkVideoStatisticsListener(listener) {
    this.remoteVideoStatisticsListener = listener;
    this.notifyRemoteVideoStatistics();
  }
  /**
   * Replays remote statistics while isolating synchronous and asynchronous observer failures.
   */
  notifyRemoteVideoStatistics() {
    try {
      void Promise.resolve(this.remoteVideoStatisticsListener?.(this.remoteVideoStatistics)).catch(() => {
      });
    } catch {
    }
  }
  /**
   * Replays the latest network snapshot, or undefined without data or after disconnection.
   */
  async setNetworkQualityListener(listener) {
    this.networkStatisticsListener = listener;
    this.notifyNetworkStatistics();
  }
  /**
   * Replays network statistics while isolating synchronous and asynchronous observer failures.
   */
  notifyNetworkStatistics() {
    try {
      void Promise.resolve(this.networkStatisticsListener?.(this.networkStatistics)).catch(() => {
      });
    } catch {
    }
  }
  /**
   * Clears remote statistics and notifies observers only if a snapshot previously existed.
   */
  clearRemoteVideoStatistics() {
    const hadStatistics = this.remoteVideoStatistics !== void 0;
    this.remoteVideoStatistics = void 0;
    if (hadStatistics) {
      this.notifyRemoteVideoStatistics();
    }
  }
  /**
   * Replays local statistics while isolating synchronous and asynchronous observer failures.
   */
  notifyLocalVideoStatistics() {
    try {
      void Promise.resolve(this.localVideoStatisticsListener?.(this.localVideoStatistics)).catch(() => {
      });
    } catch {
    }
  }
  /**
   * Stops statistics collection and clears snapshots, notifying only observers whose data became
   * invalid.
   */
  clearVideoStatistics() {
    this.qualityController?.stop();
    this.downlinkQualityController?.stop();
    this.downlinkQualityState = void 0;
    this.adaptiveQualityRevision++;
    this.acceptsVideoStatistics = false;
    const hadNetworkStatistics = this.networkStatistics !== void 0;
    this.networkStatistics = void 0;
    if (hadNetworkStatistics) {
      this.notifyNetworkStatistics();
    }
    this.clearRemoteVideoStatistics();
    const hadStatistics = this.localVideoStatistics !== void 0;
    this.localVideoStatistics = void 0;
    if (hadStatistics) {
      this.notifyLocalVideoStatistics();
    }
  }
  /**
   * Sets local media preview volume.
   *
   * @param volume - The preview volume, from 0 to 1.
   * @throws Rejects if the volume is outside the valid range.
   */
  async setLocalAudioVolume(volume) {
    _XmaxRealtimeManager.validateVolume(volume);
    this.storedLocalAudioVolume = volume;
  }
  /**
   * Sets remote playback volume, storing it before subscription and applying it before playback begins.
   *
   * @param volume - The remote volume, from 0 to 1.
   * @throws Rejects for an invalid volume or failed RTC update.
   */
  async setRemoteAudioVolume(volume) {
    _XmaxRealtimeManager.validateVolume(volume);
    this.storedRemoteAudioVolume = volume;
    if (!this.connectionManager.currentSessionID) {
      return;
    }
    try {
      this.streamController.setRemoteAudioVolume(volume);
    } catch (error) {
      throw XmaxError.from(error);
    }
  }
  /**
   * Creates a local camera stream and starts preview.
   *
   * Bind the returned track to a preview view; ready is entered after a valid frame arrives and the view
   * is bound.
   *
   * @param options.position - The front or rear camera.
   * @param options.useMicrophone - Whether to capture and publish microphone audio.
   * @param options.rotation - Clockwise input rotation, defaulting to 0; nonzero rotation currently
   * requires Agora. Preview and upload are corrected independently of mirroring.
   * @param options.enableFrameValidation - Whether to wait for a fixed 200 ms camera warmup before
   * publishing; defaults to true. False skips the wait.
   * @param options.videoFormat - The post-rotation target format, resolved using model sizing rules.
   * @param options.preset - A preset with the recommended frame rate, instead of videoFormat. Supply
   * exactly one.
   * @returns A media stream containing the local camera video track.
   * @throws Rejects for unsupported camera input, invalid configuration, denied permission, or capture
   * startup failure.
   */
  async createLocalCameraStream(options) {
    return this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        this.mediaController.ensureNoLocalSource();
        const { preset, videoFormat, ...captureOptions } = options;
        if (preset === void 0 === (videoFormat === void 0)) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Provide either a camera preset or a video format, not both"
          );
        }
        let requestedFormat = videoFormat;
        if (preset !== void 0) {
          const size = cameraPresetSize(preset);
          requestedFormat = supportedVideoFormats(this.options.model).find(
            (format) => format.width === size.width && format.height === size.height
          );
        }
        if (!requestedFormat) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Model does not support the requested camera preset"
          );
        }
        const cameraOptions = {
          ...captureOptions,
          videoFormat: requestedFormat
        };
        await this.lifecycleManager.commit(
          new RealtimeState({
            connectionState: "Preparing" /* preparing */
          }),
          token
        );
        token.ensureCurrent();
        const completeCamera = this.timing.startCamera();
        this.clearVideoStatistics();
        this.disposePermissionWatch();
        const permissionWatch = await watchMediaPermissionPrompt(options?.useMicrophone ?? false);
        if (permissionWatch) {
          const completePermission = this.timing.startPermission();
          void permissionWatch.decided.then(() => completePermission()).catch(() => {
          });
          this.permissionWatchDispose = permissionWatch.dispose;
        }
        let stream;
        try {
          token.ensureCurrent();
          stream = await this.mediaController.createLocalCameraStream(cameraOptions);
        } catch (error) {
          this.disposePermissionWatch();
          this.timing.cancel();
          throw error;
        }
        token.ensureCurrent();
        this.updateResolvedMediaVideoFormat(stream.videoTrack?.videoFormat);
        completeCamera();
        this.mediaController.setCameraPreviewReadyHandler((isCurrent) => {
          void this.lifecycleManager.localPreviewDidBecomeReady(isCurrent);
        });
        return stream;
      }
    );
  }
  /**
   * Creates a file-video source and prepares its external tracks, releasing media and RTC resources on
   * failure.
   *
   * @param options.file - A local File or Blob containing decodable video.
   * @param options.videoFormat - Frame rate and encoding settings; source dimensions are resolved from
   * the file.
   * @param options.loop - Whether to loop playback; defaults to true.
   * @param options.includeAudio - Whether to publish file audio; defaults to true.
   */
  async createLocalVideoStream(options) {
    return this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        this.mediaController.ensureNoLocalSource();
        this.mediaController.validateExternalMediaSupport("local");
        token.setFailureScope(1 /* all */);
        this.timing.start();
        this.clearVideoStatistics();
        const stream = await this.mediaController.createLocalVideoStream(
          options,
          token.signal
        );
        token.ensureCurrent();
        await this.mediaController.prepareSource(() => token.ensureCurrent());
        this.updateResolvedMediaVideoFormat(stream.videoTrack?.videoFormat);
        await this.lifecycleManager.commit(
          new RealtimeState({ connectionState: "Ready" /* ready */ }),
          token
        );
        return stream;
      }
    );
  }
  /**
   * Creates a still-image video source and prepares RTC, releasing this operation's resources on failure
   * or cancellation.
   */
  async createLocalImageStream(options) {
    return this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        this.mediaController.ensureNoLocalSource();
        this.mediaController.validateExternalMediaSupport("image");
        token.setFailureScope(1 /* all */);
        this.timing.start();
        this.clearVideoStatistics();
        const stream = await this.mediaController.createLocalImageStream(
          options,
          token.signal
        );
        token.ensureCurrent();
        await this.mediaController.prepareSource(() => token.ensureCurrent());
        this.updateResolvedMediaVideoFormat(stream.videoTrack?.videoFormat);
        await this.lifecycleManager.commit(
          new RealtimeState({ connectionState: "Ready" /* ready */ }),
          token
        );
        return stream;
      }
    );
  }
  /**
   * Binds an external source or clones a compatibility video track without capturing devices.
   *
   * @param options - A source or videoTrack/videoFormat pair, never both.
   * @returns The resolved local stream; frame sources also support preview and optional audio.
   */
  async createExternalVideoStream(options) {
    return this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        this.mediaController.ensureNoLocalSource();
        this.mediaController.validateExternalMediaSupport("external");
        const stream = await this.mediaController.createExternalVideoStream(
          options,
          token.signal
        );
        token.setFailureScope(1 /* all */);
        token.ensureCurrent();
        this.timing.start();
        this.clearVideoStatistics();
        await this.mediaController.prepareSource(() => token.ensureCurrent());
        this.updateResolvedMediaVideoFormat(stream.videoTrack?.videoFormat);
        await this.lifecycleManager.commit(
          new RealtimeState({ connectionState: "Ready" /* ready */ }),
          token
        );
        return stream;
      }
    );
  }
  /**
   * Unbinds a disconnected external source and clears media state without taking ownership of app
   * devices.
   */
  async stopExternalVideoStream() {
    await this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        if (this.mediaController.source !== "externalVideo") {
          return;
        }
        if (this.connectionManager.currentSessionID) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Disconnect before stopping the external video stream"
          );
        }
        token.setFailureScope(1 /* all */);
        this.timing.cancel();
        this.clearVideoStatistics();
        await this.mediaController.stopLocalStream();
        token.ensureCurrent();
        this.updateResolvedMediaVideoFormat(void 0);
        await this.lifecycleManager.commit(
          new RealtimeState({ connectionState: "Idle" /* idle */ }),
          token
        );
      }
    );
  }
  /**
   * The media-source track owned by this manager.
   */
  get currentLocalTrack() {
    return this.mediaController.currentTrack;
  }
  /**
   * Disposes media-permission observation when no longer needed.
   */
  disposePermissionWatch() {
    this.permissionWatchDispose?.();
    this.permissionWatchDispose = void 0;
  }
  /**
   * Applies a complete uplink format and updates track metadata without changing generation dimensions
   * or lifecycle. Dimensions align downward to four pixels, preferring the exact aspect ratio; the
   * result becomes the new L1 baseline. Shared configuration admission excludes conflicting lifecycle
   * work.
   *
   * @throws Rejects without local media, for invalid settings, conflicting operations, or encoder-update
   * failure.
   */
  async updateUplinkVideoFormat(videoFormat) {
    await this.lifecycleManager.run(
      "configuration" /* configuration */,
      void 0,
      async (token) => {
        const track = this.currentLocalTrack;
        const previousFormat = track?.videoFormat;
        if (!track || !previousFormat) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "Local camera, external or file video stream is not started"
          );
        }
        videoFormat.validate();
        const size = alignedVideoSize(
          videoFormat,
          1,
          4
        );
        const resolvedFormat = size.width === videoFormat.width && size.height === videoFormat.height ? videoFormat : videoFormat.resized(
          size.width,
          size.height
        );
        this.qualityController?.stop();
        await this.streamController.updateUplinkVideoFormat(resolvedFormat);
        token.ensureCurrent();
        if (!this.resolvedMediaVideoFormat) {
          this.updateResolvedMediaVideoFormat(previousFormat);
        }
        track.updateVideoFormat(resolvedFormat);
        this.qualityStates.set(
          track,
          {
            baseline: resolvedFormat,
            level: 1
          }
        );
        this.qualityHistory?.write(
          "uplink",
          1
        );
      }
    );
  }
  /**
   * Replaces only frame rate on an active connection using the shared configuration lease.
   */
  async updateUplinkFrameRate(fps) {
    await this.lifecycleManager.run(
      "configuration" /* configuration */,
      void 0,
      async (token) => {
        this.qualityController?.stop();
        await this.applyUplinkFrameRate(
          fps,
          token
        );
        const track = this.currentLocalTrack;
        if (track?.videoFormat) {
          this.qualityStates.set(
            track,
            {
              baseline: track.videoFormat,
              level: 1
            }
          );
          this.qualityHistory?.write(
            "uplink",
            1
          );
        }
      }
    );
  }
  /**
   * Applies a manual frame-rate update and establishes its full resulting format as the new L1 baseline.
   */
  async applyUplinkFrameRate(fps, token) {
    const track = this.currentLocalTrack;
    const previous = track?.videoFormat;
    const state2 = this.currentState.connectionState;
    if (!track || !previous || state2 !== "Connected" /* connected */ && state2 !== "Starting" /* starting */ && state2 !== "Generating" /* generating */) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Frame rate updates require a connected local camera, external or file stream"
      );
    }
    if (!Number.isFinite(fps) || fps <= 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Video frame rate must be greater than zero"
      );
    }
    const format = await this.streamController.updateUplinkFrameRate(fps);
    token.ensureCurrent();
    if (!this.resolvedMediaVideoFormat) {
      this.updateResolvedMediaVideoFormat(previous);
    }
    track.updateVideoFormat(format);
  }
  /**
   * Evaluates both directions independently and applies one sample serially to avoid competing
   * configuration leases.
   */
  handleAdaptiveQuality(statistics) {
    const revision = ++this.adaptiveQualityRevision;
    const controller = this.qualityController;
    const downlink = this.downlinkQualityController;
    if (!controller || !downlink) {
      return;
    }
    const taskID = this.currentState.taskID;
    if (this.currentState.connectionState !== "Generating" /* generating */ || !taskID) {
      controller.stop();
      downlink.stop();
      return;
    }
    if (!statistics || this.lifecycleManager.isBusy || this.adaptiveQualityPending) {
      controller.resetSamples();
      downlink.resetSamples();
      return;
    }
    const track = this.currentLocalTrack;
    if (!track) {
      controller.stop();
    } else if (!controller.snapshot.active) {
      const format = track.videoFormat;
      if (format) {
        const state3 = this.qualityStates.get(track) ?? {
          baseline: format,
          level: 1
        };
        this.qualityStates.set(
          track,
          state3
        );
        controller.start(state3.level);
      }
    }
    const state2 = this.downlinkQualityState;
    if (state2 && !downlink.snapshot.active) {
      downlink.start(state2.level);
    }
    const sampleAt = performance.now();
    this.adaptiveQualityPending = true;
    void (async () => {
      await controller.observe(
        statistics.uplink,
        sampleAt
      ).catch(() => {
      });
      if (revision !== this.adaptiveQualityRevision || this.currentState.taskID !== taskID || state2 !== this.downlinkQualityState || this.currentState.connectionState !== "Generating" /* generating */ || this.lifecycleManager.isBusy) {
        downlink.resetSamples();
        return;
      }
      await downlink.observe(
        statistics.downlink,
        sampleAt
      ).catch(() => {
      });
    })().finally(() => {
      this.adaptiveQualityPending = false;
    });
  }
  /**
   * Stops camera capture and releases preview and RTC resources.
   */
  async stopLocalCameraStream() {
    if (this.mediaController.source && this.mediaController.source !== "camera") {
      return;
    }
    await this.lifecycleManager.run(
      "media" /* media */,
      void 0,
      async (token) => {
        this.timing.cancel();
        this.clearVideoStatistics();
        this.disposePermissionWatch();
        await this.mediaController.stopLocalCameraStream();
        token.ensureCurrent();
        this.updateResolvedMediaVideoFormat(void 0);
        await this.lifecycleManager.commit(
          new RealtimeState({ connectionState: "Idle" /* idle */ }),
          token
        );
      }
    );
  }
  /**
   * Switches between front and rear cameras.
   *
   * During generation, stops the task, switches capture, and restores generation with cached conditions
   * while retaining the RTC connection. Switching is unavailable during connection or generation
   * startup.
   *
   * @returns The local stream with the same SDK video track and updated camera position.
   */
  async switchCamera() {
    return this.lifecycleManager.run(
      "cameraSwitch" /* cameraSwitch */,
      void 0,
      async (token) => {
        if (this.mediaController.source === "externalVideo") {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "External video capture is managed by the caller"
          );
        }
        this.qualityController?.stop();
        const stream = await this.mediaController.switchCamera();
        token.ensureCurrent();
        return stream;
      }
    );
  }
  /**
   * Connects a local stream created by this manager.
   *
   * Creates a session, joins the RTC room, and publishes local media. HTTP heartbeats start when the
   * session enters generating. Enabled camera validation waits for a fixed 200 ms warmup in parallel
   * with connection, before publishing. The returned remote stream carries results once generation
   * starts.
   *
   * @param localStream - This manager's camera, external, local-image, or file-video stream.
   * @returns A remote stream placeholder for generated media.
   * @throws Rejects for foreign streams, an active connection, or session, join, or publication
   * failures. Failure releases connection resources and restores local preview.
   */
  async connect(localStream) {
    return this.lifecycleManager.run(
      "connection" /* connection */,
      void 0,
      async (token) => {
        const connectionState = this.lifecycleManager.currentState.connectionState;
        if (connectionState === "Connecting" /* connecting */ || connectionState === "Connected" /* connected */ || connectionState === "Starting" /* starting */ || connectionState === "Generating" /* generating */) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "A realtime connection is already active"
          );
        }
        return this.performConnect(
          localStream,
          token
        );
      }
    );
  }
  /**
   * Connects if needed and starts generation.
   *
   * Active generation updates conditions unless restart is true. The first task requires a context;
   * later calls may reuse cached conditions. Mount the returned remote stream in an SDK video view;
   * generating is entered only after the first frame and render warmup.
   *
   * RTC control messages retry in the background until acknowledged or their six-second retry budget
   * ends. Missing ACKs do not delay this operation or change generation and rendering readiness.
   *
   * @param options.localStream - This manager's local camera, external, image, or video-file stream.
   * @param options.context - The generation conditions; omission reuses cached conditions.
   * @param options.restart - Whether to retain RTC and start a new task without first sending stop;
   * defaults to false.
   * @param options.faceRestoration - Whether to restore the original face; defaults to false and updates
   * active tasks through change_condition.
   * @param options.extraParams - Additional start/change_condition parameters. Not cached or included in
   * automatic recovery; SDK fields cannot be overridden.
   * @returns A mountable remote stream without waiting for warmup; generating signals presentation
   * readiness.
   * @throws Rejects with invalidConfiguration for non-JSON, cyclic, or reserved extra parameters before
   * connection or condition updates.
   * @throws Rejects for foreign media, missing conditions, signaling failure, or unconfirmed generation,
   * stopping the task and releasing connection resources.
   */
  async startGeneration(options) {
    const extraParams = snapshotExtraParams(options.extraParams);
    return this.lifecycleManager.run(
      options.restart === true ? "generationRestart" /* generationRestart */ : "generation" /* generation */,
      void 0,
      async (token) => {
        const localTrack = options.localStream.videoTrack;
        if (!localTrack || localTrack !== this.currentLocalTrack) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "The local stream must be created and started by this realtime manager"
          );
        }
        const videoFormat = this.resolvedMediaVideoFormat ?? localTrack.videoFormat;
        if (!videoFormat) {
          throw new XmaxError(
            "INVALID_CONFIGURATION" /* invalidConfiguration */,
            "The local video format is unavailable"
          );
        }
        const currentState = this.lifecycleManager.currentState;
        const hasGeneration = currentState.connectionState === "Generating" /* generating */ || currentState.connectionState === "Starting" /* starting */ && !!currentState.taskID;
        if (hasGeneration && options.restart !== true) {
          await this.generationManager.update(
            currentState.taskID,
            {
              videoFormat,
              ...this.resolveGenerationFormat(videoFormat),
              context: options.context,
              targetSize: this.downlinkQualityState?.size,
              faceRestoration: options.faceRestoration ?? false,
              extraParams
            }
          );
          token.ensureCurrent();
          return this.connectionManager.makeRemoteStream();
        }
        const context = this.generationManager.validateContext(options.context);
        if (currentState.connectionState !== "Connected" /* connected */ && !hasGeneration) {
          await this.performConnect(
            options.localStream,
            token
          );
        }
        return this.performStartGeneration(
          token,
          videoFormat,
          context,
          options.restart ?? false,
          options.faceRestoration ?? false,
          extraParams
        );
      }
    );
  }
  /**
   * Applies shared result beauty before connection or during generation without changing input media.
   */
  setRemoteVideoBeauty(options) {
    return this.renderController.setRemoteVideoBeauty(options);
  }
  /**
   * Receives recoverable beauty failures separately from generation errors.
   */
  setRemoteVideoBeautyErrorListener(listener) {
    this.renderController.setRemoteVideoBeautyErrorListener(listener);
  }
  /**
   * Observes shared result video and PCM audio before or during generation; undefined releases
   * observation resources. Call from a user gesture to unlock audio. Unsupported capabilities or setup
   * failure reject without affecting playback or generation.
   */
  async setRemoteMediaFrameListener(listener) {
    if (listener && !this.canReadRemoteAudio) {
      throw new XmaxError(
        "MEDIA_ERROR" /* mediaError */,
        "This RTC platform cannot observe remote audio independently of playback"
      );
    }
    this.remoteMediaFrameObservation = false;
    this.remoteMediaFrames.setSource(void 0);
    this.updateRemoteMediaObservation();
    await this.remoteMediaFrames.setListener(listener);
    this.remoteMediaFrameObservation = Boolean(listener);
    this.updateRemoteMediaObservation();
  }
  /**
   * Delivers shared result tracks without creating audio processors or WebCodecs frame readers.
   */
  setRemoteMediaTracksListener(listener) {
    this.remoteMediaTracksListener = listener;
    this.updateRemoteMediaObservation();
  }
  /**
   * Routes shared result output to independent frame and track subscriptions.
   */
  updateRemoteMediaObservation() {
    this.renderController.setRemoteMediaTracksListener(
      this.remoteMediaFrameObservation || this.remoteMediaTracksListener ? (tracks) => {
        if (this.remoteMediaFrameObservation) {
          this.remoteMediaFrames.setSource(tracks);
        }
        try {
          this.remoteMediaTracksListener?.(tracks);
        } catch (error) {
          XmaxLogger.render.warning(() => `Remote media track observer failed: ${XmaxError.from(error).message}`);
        }
      } : void 0
    );
    this.streamController.setRemoteMediaListener(
      this.remoteMediaFrameObservation || this.remoteMediaTracksListener ? (tracks) => this.renderController.setRemoteMediaTracks(tracks) : void 0
    );
  }
  /**
   * Disconnects while retaining local media preview.
   */
  async disconnect() {
    this.mediaController.pauseLocalVideo();
    this.timing.cancel();
    this.clearVideoStatistics();
    await this.lifecycleManager.disconnect();
  }
  /**
   * Closes the lifecycle and releases connection, local media, and RTC resources. Concurrent calls await
   * the same cleanup. Local streams can be created again after closure.
   */
  async close() {
    this.mediaController.pauseLocalVideo();
    this.timing.cancel();
    this.clearVideoStatistics();
    await this.lifecycleManager.terminate(1 /* all */);
  }
  /**
   * Derives TRTC quality frame rates while retaining the initial dimensions.
   */
  uplinkQualityFormat(baseline, level) {
    const format = qualityVideoFormat(
      baseline,
      level
    );
    return this.options.provider === "trtc" /* trtc */ ? format.resized(
      baseline.width,
      baseline.height
    ) : format;
  }
  /**
   * Selects a generation canvas from the fixed media baseline and enables server padding for non-camera
   * aspect-ratio mismatches. Only signaling changes; uplink tracks and encoding dimensions remain
   * unchanged.
   *
   * @param videoFormat - The fixed media format, unaffected by uplink adaptation.
   * @returns The supported canvas format and padding preference.
   */
  resolveGenerationFormat(videoFormat) {
    if (this.mediaController.source === "camera" && resolutionBuckets(this.options.model).length > 0) {
      return {
        generationVideoFormat: videoFormat,
        paddingContain: false
      };
    }
    const size = this.mediaService.resolveGenerationSize(videoFormat);
    const paddingContain = this.mediaController.source !== "camera" && videoFormat.width * size.height !== videoFormat.height * size.width;
    return {
      generationVideoFormat: size.width !== videoFormat.width || size.height !== videoFormat.height ? videoFormat.resized(
        size.width,
        size.height
      ) : videoFormat,
      paddingContain
    };
  }
  /**
   * Derives downlink dimensions from the fixed media baseline, preserving aspect ratio and four-pixel
   * alignment for all sources.
   *
   * @param videoFormat - The fixed media format.
   * @param level - The downlink quality level.
   * @returns Target dimensions within the level bounds without upscaling.
   */
  resolveTargetSize(videoFormat, level) {
    return this.mediaService.resolveTargetSize(
      videoFormat,
      qualityVideoMaximumSize(
        videoFormat,
        level
      )
    );
  }
  /**
   * Selects initial uplink quality; disabled adaptation starts each connection at the original L1
   * baseline.
   */
  resolveInitialUplinkQuality(track) {
    const previous = this.qualityStates.get(track);
    if (previous && this.options.isAdaptiveQualityEnabled) {
      return void 0;
    }
    const baseline = previous?.baseline ?? track.videoFormat;
    if (!baseline) {
      return void 0;
    }
    let level = this.qualityHistory?.read("uplink") ?? 1;
    while (level > 1 && !supportsQualityEncoding(this.uplinkQualityFormat(
      baseline,
      level
    ))) {
      level--;
    }
    return {
      baseline,
      level
    };
  }
  /**
   * Creates the session, joins and publishes, and prepares remote rendering without starting HTTP heartbeats.
   *
   * @param localStream - The local stream owned by this manager.
   * @param token - The current operation lease.
   * @returns A placeholder stream for generated results.
   */
  async performConnect(localStream, token) {
    const localTrack = localStream.videoTrack;
    if (!localTrack || localTrack !== this.currentLocalTrack) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "The local stream must be created and started by this realtime manager"
      );
    }
    this.connectionManager.validateConfiguration();
    token.setFailureScope(0 /* connection */);
    await this.lifecycleManager.commit(
      new RealtimeState({ connectionState: "Connecting" /* connecting */ }),
      token
    );
    const warmupController = new AbortController();
    const abortWarmup = () => warmupController.abort();
    token.signal.addEventListener(
      "abort",
      abortWarmup,
      { once: true }
    );
    if (token.signal.aborted) {
      abortWarmup();
    }
    try {
      let beforePublish;
      if (this.mediaController.isFrameValidationEnabled) {
        const cameraReady = this.mediaController.waitForValidCameraFrame(warmupController.signal).then(() => {
          token.ensureCurrent();
        });
        void cameraReady.catch(() => {
        });
        beforePublish = () => cameraReady;
      }
      const initialQuality = this.resolveInitialUplinkQuality(localTrack);
      const initialFormat = initialQuality && this.qualityController ? this.uplinkQualityFormat(
        initialQuality.baseline,
        initialQuality.level
      ) : initialQuality?.baseline;
      const remote = await this.connectionManager.connect({
        localTrack,
        remoteVideoFormat: this.resolvedMediaVideoFormat ?? localTrack.videoFormat,
        localVideoFormat: initialFormat,
        onVideoEncoderConfigured: () => {
          if (!initialQuality || !initialFormat) {
            return;
          }
          if (!this.resolvedMediaVideoFormat) {
            this.updateResolvedMediaVideoFormat(initialQuality.baseline);
          }
          localTrack.updateVideoFormat(initialFormat);
          this.qualityStates.set(
            localTrack,
            initialQuality
          );
          this.qualityHistory?.write(
            "uplink",
            initialQuality.level
          );
        },
        model: this.options.model,
        includeLocalAudio: this.mediaController.hasAudio,
        ensureCurrent: () => token.ensureCurrent(),
        onPublished: () => {
          this.acceptsVideoStatistics = true;
          this.mediaController.setExternalAudioPublished(true);
        },
        beforePublish
      });
      await this.lifecycleManager.commit(
        new RealtimeState({
          connectionState: "Connected" /* connected */,
          sessionID: this.connectionManager.currentSessionID
        }),
        token
      );
      return remote;
    } finally {
      token.signal.removeEventListener(
        "abort",
        abortWarmup
      );
      abortWarmup();
    }
  }
  /**
   * Coordinates first-frame timing and presentation state; the generation manager owns tasks and
   * confirmation.
   *
   * @param token - The current generation lease.
   * @param videoFormat - The fixed baseline for canvas, returned dimensions, and interaction
   * coordinates.
   * @param context - The resolved generation conditions.
   * @param restart - Whether to replace the task with a new start message.
   * @param faceRestoration - Whether to restore the original face.
   * @param extraParams - Additional uncached start parameters.
   * @returns The stream carrying generation results.
   */
  async performStartGeneration(token, videoFormat, context, restart, faceRestoration, extraParams) {
    token.setFailureScope(0 /* connection */);
    const sessionID = this.connectionManager.currentSessionID;
    if (!sessionID) {
      throw new XmaxError(
        "SESSION_ERROR" /* sessionError */,
        "Realtime session is unavailable"
      );
    }
    await this.lifecycleManager.commit(
      new RealtimeState({
        connectionState: "Starting" /* starting */,
        sessionID
      }),
      token
    );
    token.ensureCurrent();
    const initialLevel = this.qualityHistory?.read("downlink") ?? 1;
    const targetSize = this.resolveTargetSize(
      videoFormat,
      initialLevel
    );
    const completeFirstFrame = this.timing.startFirstFrame();
    this.remoteRenderWarmupCompletedHandler = void 0;
    this.remoteFrameDisplayHandler = () => {
      if (!token.signal.aborted) {
        completeFirstFrame();
        this.remoteRenderWarmupCompletedHandler ??= this.timing.startRenderWarmup();
      }
    };
    this.renderController.prepareForGeneration();
    const taskID = await this.generationManager.start({
      videoFormat,
      ...this.resolveGenerationFormat(videoFormat),
      signal: token.signal,
      ensureCurrent: () => token.ensureCurrent(),
      waitUntilRemoteReady: () => this.connectionManager.waitUntilRemoteTrackReady(
        REMOTE_FIRST_FRAME_TIMEOUT_MS,
        token.signal
      ),
      context,
      restart,
      targetSize,
      mirror: this.mediaController.source === "camera" && this.currentLocalTrack?.position === "front" /* front */,
      faceRestoration,
      onStartSent: this.mediaController.source === "localVideo" ? async () => {
        token.ensureCurrent();
        await this.mediaController.startLocalVideo(token.signal);
        token.ensureCurrent();
      } : void 0,
      extraParams
    });
    token.ensureCurrent();
    this.downlinkQualityController?.stop();
    this.downlinkQualityState = {
      taskID,
      baseline: videoFormat,
      level: initialLevel,
      size: targetSize ?? {
        width: videoFormat.width,
        height: videoFormat.height
      }
    };
    await this.lifecycleManager.commit(
      new RealtimeState({
        connectionState: "Starting" /* starting */,
        sessionID,
        taskID
      }),
      token
    );
    token.ensureCurrent();
    await this.completeGenerationPresentation();
    token.ensureCurrent();
    this.qualityHistory?.write(
      "downlink",
      initialLevel
    );
    return this.connectionManager.makeRemoteStream();
  }
  /**
   * Commits presentation readiness after task startup and view warmup, without blocking the remote
   * stream's return.
   */
  async completeGenerationPresentation() {
    const { sessionID, taskID } = this.currentState;
    if (!sessionID || !taskID) {
      return;
    }
    await this.lifecycleManager.remotePreviewDidBecomeReady(
      sessionID,
      taskID,
      () => this.renderController.isReady
    );
  }
  /**
   * Terminates the connection on heartbeat or session failure and exposes the reason in the final state.
   */
  async handleHeartbeatFailure(sessionID, error) {
    await this.lifecycleManager.terminateWithError(
      error,
      0 /* connection */,
      () => this.connectionManager.currentSessionID === sessionID
    );
  }
  /**
   * Stops heartbeat and generation before disconnecting; the all scope also releases local media.
   */
  async performCleanup(scope, taskID) {
    this.remoteMediaFrames.setSource(void 0);
    this.mediaController.setExternalAudioPublished(false);
    this.mediaController.pauseLocalVideo();
    this.timing.cancel();
    this.remoteFrameDisplayHandler = void 0;
    this.remoteRenderWarmupCompletedHandler = void 0;
    this.clearVideoStatistics();
    this.connectionManager.clearRemoteMedia();
    this.connectionManager.stopHeartbeat();
    await this.generationManager.reset(taskID);
    const sessionID = await this.connectionManager.disconnect();
    if (scope === 1 /* all */) {
      this.setRemoteMediaTracksListener(void 0);
      await this.setRemoteMediaFrameListener(void 0);
      await this.renderController.closeBeauty();
      this.updateResolvedMediaVideoFormat(void 0);
      this.disposePermissionWatch();
      try {
        await this.mediaController.stopLocalStream();
      } catch (error) {
        XmaxLogger.realtime.error(
          () => `\u91CA\u653E\u672C\u5730\u5A92\u4F53\u5931\u8D25 (Failed to Release Local Media)
\u2514\u2500 ${XmaxLogger.localized("\u539F\u56E0\uFF1A", "Reason: ")}${XmaxError.from(error).message}`
        );
      }
    }
    return {
      sessionID,
      hasLocalMedia: this.currentLocalTrack !== void 0
    };
  }
  /**
   * Validates a volume from 0 to 1.
   */
  static validateVolume(volume) {
    if (!Number.isFinite(volume) || volume < 0 || volume > 1) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Audio volume must be between 0 and 1"
      );
    }
  }
};

var RealtimeEventRelayService = class {
  /**
   * Creates a relay service using the environment's authenticated relay endpoint.
   */
  constructor(apiService) {
    this.apiService = apiService;
  }
  /**
   * Submits one complete command. Both accepted and previously accepted responses are successful.
   * Cancellation stops local work without withdrawing an event already accepted by the platform.
   */
  async relay(options) {
    const startedAt = performance.now();
    const response = await this.apiService.request(
      "POST" /* post */,
      "/client-event/relay",
      {
        sessionId: options.sessionID,
        modelId: options.modelID,
        data: options.data
      },
      { signal: options.signal }
    );
    if (!response || typeof response !== "object" || Array.isArray(response) || !("xid" in response) || response.xid !== options.data.xid || !("accepted" in response) || typeof response.accepted !== "boolean") {
      throw new XmaxError(
        "API_ERROR" /* apiError */,
        "Server returned invalid event relay response"
      );
    }
    if (!options.signal.aborted) {
      XmaxLogger.room.info(() => `HTTP \u4FE1\u4EE4\u8F6C\u53D1 (HTTP Signaling Relay)
\u251C\u2500 event: ${options.data.event}, xid: ${options.data.xid}
\u251C\u2500 sessionID: ${options.sessionID}, modelID: ${options.modelID}
\u2514\u2500 accepted: ${response.accepted}, elapsed: ${(performance.now() - startedAt).toFixed(1)} ms`);
    }
  }
};

var XmaxConfiguration = class {
  /**
   * The API key used to access Xmax services.
   */
  apiKey;
  /**
   * The service environment, which also selects Chinese or English log details.
   */
  environment;
  /**
   * The enabled log categories; logging is disabled by default.
   */
  loggerOptions;
  /**
   * Creates a client configuration. Call validate() to check its validity.
   */
  constructor(init) {
    this.apiKey = init.apiKey.trim();
    this.environment = init.environment ?? "china" /* china */;
    this.loggerOptions = init.loggerOptions ?? 0 /* none */;
  }
  /**
   * Validates the client configuration.
   *
   * @throws An XmaxError if the API key is empty.
   */
  validate() {
    if (this.apiKey.length === 0) {
      throw new XmaxError(
        "INVALID_API_KEY" /* invalidAPIKey */,
        "API key cannot be empty"
      );
    }
  }
};

var StoredFile = class {
  /**
   * The URL used to access the file.
   */
  url;
  /**
   * The key identifying the object in storage.
   */
  objectKey;
  /**
   * The storage ETag, when returned.
   */
  etag;
  /**
   * Creates stored-file information.
   */
  constructor(init) {
    this.url = init.url;
    this.objectKey = init.objectKey;
    this.etag = init.etag;
  }
};

var CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  ogv: "video/ogg"
};
var StorageService = class _StorageService {
  /**
   * The API service used to obtain temporary storage credentials.
   */
  apiService;
  /**
   * The factory creating an object-storage client.
   */
  clientFactory;
  /**
   * The clock used in uploaded object keys.
   */
  dateGenerator;
  /**
   * The unique-ID source used in uploaded object keys.
   */
  identifierGenerator;
  /**
   * Creates a storage service.
   */
  constructor(options) {
    this.apiService = options.apiService;
    this.clientFactory = options.clientFactory ?? _StorageService.cosClientFactory;
    this.dateGenerator = options.dateGenerator ?? (() => /* @__PURE__ */ new Date());
    this.identifierGenerator = options.identifierGenerator ?? (() => crypto.randomUUID().toLowerCase());
  }
  /**
   * Uploads an image and returns its access information.
   */
  async uploadImage(options) {
    return this.upload(
      options,
      "Image"
    );
  }
  /**
   * Uploads an original video without transcoding, compression, or multipart upload.
   */
  async uploadVideo(options) {
    return this.upload(
      options,
      "Video"
    );
  }
  /**
   * Downloads an original video and requests browser saving, with cancellable network transfer.
   */
  async downloadVideo(options) {
    const fileName = _StorageService.validateFileName(options.fileName);
    let url;
    try {
      url = new URL(options.url.trim());
    } catch {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Invalid video download URL"
      );
    }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Video download requires an HTTP(S) URL without embedded credentials"
      );
    }
    if (typeof document === "undefined" || !document.body) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Video saving requires a browser document"
      );
    }
    let objectURL;
    let link;
    let saveRequested = false;
    try {
      if (options.signal?.aborted) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Video download was cancelled"
        );
      }
      const response = await fetch(
        options.url.trim(),
        {
          credentials: "omit",
          signal: options.signal
        }
      );
      if (!response.ok) {
        throw new XmaxError(
          "DOWNLOAD_ERROR" /* downloadError */,
          "Video download failed",
          { httpStatus: response.status }
        );
      }
      const data = await response.blob();
      if (options.signal?.aborted) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Video download was cancelled"
        );
      }
      if (data.size === 0) {
        throw new XmaxError(
          "DOWNLOAD_ERROR" /* downloadError */,
          "Downloaded video is empty"
        );
      }
      objectURL = URL.createObjectURL(data);
      link = document.createElement("a");
      link.href = objectURL;
      link.download = fileName;
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      saveRequested = true;
    } catch (error) {
      if (options.signal?.aborted) {
        throw new XmaxError(
          "CANCELLED" /* cancelled */,
          "Video download was cancelled"
        );
      }
      if (error instanceof XmaxError) {
        throw error;
      }
      throw new XmaxError(
        "DOWNLOAD_ERROR" /* downloadError */,
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      link?.remove();
      if (objectURL) {
        const resourceURL = objectURL;
        if (saveRequested) {
          setTimeout(
            () => URL.revokeObjectURL(resourceURL),
            6e4
          );
        } else {
          URL.revokeObjectURL(resourceURL);
        }
      }
    }
  }
  /**
   * Obtains temporary credentials and uploads through COS putObject, normalizing progress, results, and
   * errors.
   */
  async upload(options, mediaType) {
    const startedAt = Date.now();
    try {
      const safeName = _StorageService.validateFileName(options.fileName);
      const contentType = options.contentType?.trim() || _StorageService.inferContentType(safeName);
      const body = _StorageService.makeBody(
        options.data,
        contentType
      );
      if (body.size === 0) {
        throw new XmaxError(
          "INVALID_CONFIGURATION" /* invalidConfiguration */,
          `${mediaType} data cannot be empty`
        );
      }
      const temporary = await this.fetchStorageConfiguration();
      const objectKey = this.makeObjectKey(
        temporary.prefix,
        safeName
      );
      const client = await this.clientFactory(temporary);
      XmaxLogger.storage.info(
        () => `\u5F00\u59CB\u4E0A\u4F20 (Upload Started)
\u251C\u2500 ${XmaxLogger.localized("\u6587\u4EF6\uFF1A", "File: ")}${safeName}
\u2514\u2500 ${XmaxLogger.localized("\u5927\u5C0F\uFF1A", "Size: ")}${_StorageService.formatByteCount(body.size)}`
      );
      const uploaded = await _StorageService.putObject(
        client,
        {
          Bucket: temporary.bucket,
          Region: temporary.region,
          Key: objectKey,
          Body: body,
          ContentType: contentType,
          onProgress: options.onProgress ? (info) => options.onProgress?.(
            info.loaded,
            info.total
          ) : void 0
        }
      );
      const url = _StorageService.resolveObjectURL(
        uploaded.Location,
        temporary,
        objectKey
      );
      XmaxLogger.storage.info(
        () => `\u4E0A\u4F20\u5B8C\u6210 (Upload Completed)
\u251C\u2500 ${XmaxLogger.localized("\u5730\u5740\uFF1A", "URL: ")}${url}
\u2514\u2500 ${XmaxLogger.localized("\u8017\u65F6\uFF1A", "Duration: ")}${Date.now() - startedAt}ms`
      );
      return new StoredFile({
        url,
        objectKey,
        etag: uploaded.ETag
      });
    } catch (error) {
      if (error instanceof XmaxError) {
        throw error;
      }
      throw new XmaxError(
        "UPLOAD_ERROR" /* uploadError */,
        error instanceof Error && error.message.trim().length > 0 ? error.message.trim() : String(error)
      );
    }
  }
  /**
   * Returns temporary storage settings, rejecting incomplete credentials with an API error.
   */
  async fetchStorageConfiguration() {
    const payload = await this.apiService.get("/cos/sts");
    const message = "Invalid storage credential payload";
    const bucket = _StorageService.nonEmpty(payload.bucket);
    const region = _StorageService.nonEmpty(payload.region);
    const prefix = _StorageService.nonEmpty(payload.prefix);
    const accessKeyID = _StorageService.nonEmpty(payload.credentials?.accessKeyId);
    const secretAccessKey = _StorageService.nonEmpty(payload.credentials?.secretAccessKey);
    const sessionToken = _StorageService.nonEmpty(payload.credentials?.sessionToken);
    if (!bucket || !region || !prefix || !accessKeyID || !secretAccessKey || !sessionToken) {
      throw new XmaxError(
        "API_ERROR" /* apiError */,
        message
      );
    }
    return {
      bucket,
      region,
      endpoint: _StorageService.nonEmpty(payload.endpoint),
      prefix,
      credentials: {
        accessKeyID,
        secretAccessKey,
        sessionToken
      }
    };
  }
  /**
   * Builds an object key from its prefix, millisecond timestamp, unique ID, and filename.
   */
  makeObjectKey(prefix, fileName) {
    const milliseconds = Math.round(this.dateGenerator().getTime());
    return `${prefix}${milliseconds}_${this.identifierGenerator()}_${fileName}`;
  }
  /**
   * Dynamically loads cos-js-sdk-v5 and creates a client with temporary credentials.
   */
  static async cosClientFactory(configuration) {
    const module = await import("./cos-js-sdk-v5-4GWQE76H.js");
    const COS = module.default;
    return new COS({
      SecretId: configuration.credentials.accessKeyID,
      SecretKey: configuration.credentials.secretAccessKey,
      SecurityToken: configuration.credentials.sessionToken
    });
  }
  /**
   * Wraps object upload callbacks in a promise.
   */
  static putObject(client, params) {
    return new Promise((resolve, reject) => {
      client.putObject(
        params,
        (error, data) => {
          if (error) {
            reject(
              new XmaxError(
                "UPLOAD_ERROR" /* uploadError */,
                error.message?.trim() || "Storage upload failed"
              )
            );
            return;
          }
          resolve(data ?? {});
        }
      );
    });
  }
  /**
   * Resolves the object URL from Location with a scheme, a custom endpoint, or the default COS domain,
   * in that order.
   */
  static resolveObjectURL(location, configuration, objectKey) {
    const candidate = location?.trim() ?? "";
    if (candidate.startsWith("//")) {
      return `https:${candidate}`;
    }
    if (/^https?:\/\//i.test(candidate)) {
      return candidate;
    }
    const endpoint = configuration.endpoint?.trim();
    if (endpoint) {
      const normalized = /^https?:\/\//i.test(endpoint) ? endpoint : `https://${endpoint}`;
      return `${normalized.replace(/\/+$/, "")}/${objectKey}`;
    }
    return `https://${configuration.bucket}.cos.${configuration.region}.myqcloud.com/${objectKey}`;
  }
  /**
   * Creates the upload body.
   */
  static makeBody(data, contentType) {
    if (data instanceof Blob) {
      return data;
    }
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    return new Blob(
      [bytes],
      { type: contentType }
    );
  }
  /**
   * Validates a nonempty filename without path separators.
   */
  static validateFileName(fileName) {
    const safeName = fileName.trim();
    if (!safeName || safeName.includes("/") || safeName.includes("\\")) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Invalid file name for storage operation"
      );
    }
    return safeName;
  }
  /**
   * Infers content type from the filename extension.
   */
  static inferContentType(fileName) {
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
    return CONTENT_TYPES[extension] ?? "application/octet-stream";
  }
  /**
   * Formats a byte count for logging.
   */
  static formatByteCount(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }
  /**
   * Trims an optional string and returns undefined when empty.
   */
  static nonEmpty(value) {
    const normalized = value?.trim();
    return normalized || void 0;
  }
};

var NonRealtimeQuality = /* @__PURE__ */ ((NonRealtimeQuality2) => {
  NonRealtimeQuality2["sd"] = "sd";
  NonRealtimeQuality2["hd"] = "hd";
  return NonRealtimeQuality2;
})(NonRealtimeQuality || {});
var NonRealtimeTaskStatus = /* @__PURE__ */ ((NonRealtimeTaskStatus2) => {
  NonRealtimeTaskStatus2["submitted"] = "submitted";
  NonRealtimeTaskStatus2["processing"] = "processing";
  NonRealtimeTaskStatus2["completed"] = "completed";
  NonRealtimeTaskStatus2["error"] = "error";
  return NonRealtimeTaskStatus2;
})(NonRealtimeTaskStatus || {});

var SUPPORTED_FPS = /* @__PURE__ */ new Set([8, 10, 12, 15, 16, 18, 20, 22, 24, 25, 30, 45, 48, 50, 60, 72, 90, 100, 120]);
var NonRealtimeTaskService = class {
  /**
   * The API transport for task requests.
   */
  api;
  /**
   * Creates a task service using the supplied API transport.
   */
  constructor(api) {
    this.api = api;
  }
  /**
   * Submits once without retrying ambiguous outcomes that might incur duplicate charges.
   */
  async submitTask(options) {
    const model = options.model?.trim();
    if (!model) {
      invalid("Model must not be empty");
    }
    const prompt = options.prompt.trim();
    if (!prompt || [...prompt].length > 1024) {
      invalid("Prompt must contain 1\u20131024 characters");
    }
    validateURL(options.videoPath);
    if (options.referencePath !== void 0) {
      validateURL(options.referencePath);
    }
    if (!Object.values(NonRealtimeQuality).includes(options.quality)) {
      invalid("Quality must be sd or hd");
    }
    if (options.fps !== void 0 && !SUPPORTED_FPS.has(options.fps)) {
      invalid("Unsupported processing frame rate");
    }
    const payload = await this.api.post(
      "/offline-task",
      {
        model,
        prompt,
        refVideoPath: options.videoPath.trim(),
        ...options.referencePath === void 0 ? {} : { refImagePath: options.referencePath.trim() },
        quality: options.quality,
        ...options.fps === void 0 ? {} : { fps: options.fps }
      }
    );
    return parseTask(payload);
  }
  /**
   * Queries and validates a task ID; cancellation stops this HTTP query, not the server task.
   */
  async getTask(taskUid, signal) {
    const uid = validateTaskUid(taskUid);
    const task = parseTask(await this.api.get(
      `/offline-task/${encodeURIComponent(uid)}`,
      { signal }
    ));
    if (task.uid !== uid) {
      malformed("Task UID does not match the request");
    }
    return task;
  }
  /**
   * Queries at most 100 IDs, deduplicating in first-occurrence order and failing if any task is
   * unavailable.
   */
  async getTasks(taskUids) {
    if (taskUids.length < 1 || taskUids.length > 100) {
      invalid("Provide 1\u2013100 task UIDs");
    }
    const uids = [...new Set(taskUids.map(validateTaskUid))];
    const payload = record(await this.api.post(
      "/offline-task/batch-query",
      { taskUids: uids }
    ));
    const tasks = parseList(payload.list);
    if (tasks.length !== uids.length || tasks.some((task, index) => task.uid !== uids[index])) {
      malformed("Batch response does not match the requested task UIDs");
    }
    return tasks;
  }
  /**
   * Queries one page without implicitly loading additional pages.
   */
  async listTasks(options = {}) {
    const pageNumber = options.pageNumber ?? 1;
    const pageSize = options.pageSize ?? 10;
    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
      invalid("Page number must be a positive integer");
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      invalid("Page size must be between 1 and 100");
    }
    if (options.status !== void 0 && !Object.values(NonRealtimeTaskStatus).includes(options.status)) {
      invalid("Invalid task status");
    }
    const query = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize)
    });
    if (options.status !== void 0) {
      query.set(
        "status",
        options.status
      );
    }
    const payload = record(await this.api.get(`/offline-task/page?${query}`));
    return Object.freeze({
      pageNumber: pageInteger(
        payload,
        "pageNumber",
        1
      ),
      pageSize: pageInteger(
        payload,
        "pageSize",
        1
      ),
      total: pageInteger(
        payload,
        "total",
        0
      ),
      list: parseList(payload.list)
    });
  }
};
function validateTaskUid(value) {
  const uid = value.trim();
  if (!uid || uid === "." || uid === "..") {
    invalid("Task UID must not be empty or a relative path segment");
  }
  return uid;
}
function validateURL(value) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return invalid("Resource must be an uploaded HTTP(S) URL");
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
    invalid("Resource must be an uploaded HTTP(S) URL");
  }
}
function invalid(message) {
  throw new XmaxError(
    "INVALID_CONFIGURATION" /* invalidConfiguration */,
    message
  );
}
function malformed(message = "Invalid non-realtime response data") {
  throw new XmaxError(
    "API_ERROR" /* apiError */,
    message
  );
}
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    malformed();
  }
  return value;
}
function field(data, key, type) {
  const value = data[key];
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== type || typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
    malformed(`Invalid field: ${key}`);
  }
  return value;
}
function pageInteger(data, key, minimum) {
  const value = field(
    data,
    key,
    "number"
  );
  if (value === void 0 || !Number.isSafeInteger(value) || value < minimum) {
    malformed(`Invalid field: ${key}`);
  }
  return value;
}
function parseList(value) {
  if (!Array.isArray(value)) {
    malformed("Missing task list");
  }
  return Object.freeze(value.map(parseTask));
}
function parseTask(value) {
  const data = record(value);
  const uid = field(
    data,
    "uid",
    "string"
  );
  const status = field(
    data,
    "status",
    "string"
  );
  const quality = field(
    data,
    "quality",
    "string"
  );
  if (!uid?.trim() || !Object.values(NonRealtimeTaskStatus).includes(status)) {
    malformed("Missing task UID or invalid status");
  }
  if (quality !== void 0 && !Object.values(NonRealtimeQuality).includes(quality)) {
    malformed("Invalid task quality");
  }
  return Object.freeze({
    uid,
    status,
    quality,
    userUid: field(
      data,
      "userUid",
      "string"
    ),
    prompt: field(
      data,
      "prompt",
      "string"
    ),
    videoPath: field(
      data,
      "refVideoPath",
      "string"
    ),
    referencePath: field(
      data,
      "refImagePath",
      "string"
    ),
    processorId: field(
      data,
      "processorId",
      "string"
    ),
    requestedFps: field(
      data,
      "requestedFps",
      "number"
    ),
    resolvedFps: field(
      data,
      "resolvedFps",
      "number"
    ),
    retryCount: field(
      data,
      "retryCount",
      "number"
    ),
    videoDurationSeconds: field(
      data,
      "videoDurationSeconds",
      "number"
    ),
    billableDurationSeconds: field(
      data,
      "billableDurationSeconds",
      "number"
    ),
    chargePoints: field(
      data,
      "chargePoints",
      "number"
    ),
    result: data.result == null ? void 0 : parseResult(data.result),
    processStartTime: field(
      data,
      "processStartTime",
      "string"
    ),
    createTimestamp: field(
      data,
      "createTimestamp",
      "string"
    ),
    updateTimestamp: field(
      data,
      "updateTimestamp",
      "string"
    )
  });
}
function parseResult(value) {
  const data = record(value);
  return Object.freeze({
    url: field(
      data,
      "result_url",
      "string"
    ),
    uploadError: field(
      data,
      "upload_error",
      "string"
    ),
    uploadStatus: field(
      data,
      "upload_status",
      "string"
    ),
    finalizeDurationMs: field(
      data,
      "finalize_duration_ms",
      "number"
    ),
    compressionLevel: field(
      data,
      "compression_level",
      "string"
    ),
    frameCount: field(
      data,
      "frame_count",
      "number"
    ),
    fps: field(
      data,
      "fps",
      "number"
    ),
    durationMs: field(
      data,
      "result_duration_ms",
      "number"
    ),
    fileSizeBytes: field(
      data,
      "file_size_bytes",
      "number"
    ),
    droppedFrameCount: field(
      data,
      "dropped_frame_count",
      "number"
    ),
    originalFileSizeBytes: field(
      data,
      "original_file_size_bytes",
      "number"
    )
  });
}

var NonRealtimeTaskError = class extends XmaxError {
  /**
   * The last task snapshot associated with the failure.
   */
  task;
  /**
   * Creates an API-category error without inventing a server business code.
   */
  constructor(task, message) {
    super(
      "API_ERROR" /* apiError */,
      message
    );
    this.name = "NonRealtimeTaskError";
    this.task = task;
  }
};

var XmaxNonRealtimeManager = class {
  /**
   * The service that submits and queries non-realtime tasks.
   */
  tasks;
  /**
   * Creates a manager with a non-realtime task service.
   */
  constructor(tasks) {
    this.tasks = tasks;
  }
  /**
   * Submits a task once without retrying a potentially billable request.
   */
  submitTask(options) {
    return this.tasks.submitTask(options);
  }
  /**
   * Returns a task snapshot without treating a server-side task failure as a query failure.
   */
  getTask(taskUid, options) {
    return this.tasks.getTask(
      taskUid,
      options?.signal
    );
  }
  /**
   * Returns snapshots for multiple tasks.
   */
  getTasks(taskUids) {
    return this.tasks.getTasks(taskUids);
  }
  /**
   * Returns a page of tasks.
   */
  listTasks(options) {
    return this.tasks.listTasks(options);
  }
  /**
   * Waits for completion using serial queries and bounded transient-error backoff. Cancellation and the
   * overall timeout cover requests and polling delays.
   */
  async waitForCompletion(taskUid, options = {}) {
    const uid = validateTaskUid(taskUid);
    const interval = options.intervalMs ?? 2e3;
    const retries = options.maxConsecutiveRetries ?? 3;
    validateDelay(interval);
    if (options.timeoutMs !== void 0) {
      validateDelay(options.timeoutMs);
    }
    if (!Number.isSafeInteger(retries) || retries < 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Retry count must be a non-negative integer"
      );
    }
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    options.signal?.addEventListener(
      "abort",
      abort,
      { once: true }
    );
    if (options.signal?.aborted) {
      abort();
    }
    const timer = options.timeoutMs === void 0 ? void 0 : setTimeout(
      () => {
        timedOut = true;
        abort();
      },
      options.timeoutMs
    );
    let failures = 0;
    try {
      for (; ; ) {
        ensureActive(controller.signal);
        let task;
        try {
          task = await this.tasks.getTask(
            uid,
            controller.signal
          );
        } catch (error) {
          ensureActive(controller.signal);
          if (!isTransient(error) || failures >= retries) {
            throw error;
          }
          failures++;
          await delay(
            Math.min(interval * 2 ** (failures - 1), 3e4),
            controller.signal
          );
          continue;
        }
        ensureActive(controller.signal);
        failures = 0;
        try {
          void Promise.resolve(options.onTaskUpdated?.(task)).catch(() => {
          });
        } catch {
        }
        ensureActive(controller.signal);
        if (task.status === "error" /* error */) {
          throw new NonRealtimeTaskError(
            task,
            `Non-realtime task ${uid} failed`
          );
        }
        if (task.status === "completed" /* completed */) {
          if (!isResultAvailable(task)) {
            throw new NonRealtimeTaskError(
              task,
              `Non-realtime task ${uid} completed without a usable result`
            );
          }
          return task;
        }
        await delay(
          interval,
          controller.signal
        );
      }
    } catch (error) {
      if (timedOut) {
        throw new XmaxError(
          "TIMEOUT" /* timeout */,
          `Waiting for task ${uid} timed out; the server task was not cancelled`
        );
      }
      ensureActive(controller.signal);
      throw error;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener(
        "abort",
        abort
      );
    }
  }
};
function validateDelay(value) {
  if (!Number.isFinite(value) || value <= 0 || value > 2147483647) {
    throw new XmaxError(
      "INVALID_CONFIGURATION" /* invalidConfiguration */,
      "Polling durations must be positive and within the timer range"
    );
  }
}
function ensureActive(signal) {
  if (signal.aborted) {
    throw new XmaxError(
      "CANCELLED" /* cancelled */,
      "Task wait was cancelled locally; the server task was not cancelled"
    );
  }
}
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener(
        "abort",
        finish
      );
      try {
        ensureActive(signal);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    const timer = setTimeout(
      finish,
      ms
    );
    signal.addEventListener(
      "abort",
      finish,
      { once: true }
    );
    if (signal.aborted) {
      finish();
    }
  });
}
function isTransient(error) {
  if (!(error instanceof XmaxError)) {
    return false;
  }
  return error.code === "NETWORK_ERROR" /* networkError */ || error.code === "TIMEOUT" /* timeout */ || error.code === "API_ERROR" /* apiError */ && (error.httpStatus ?? 0) >= 500 && (error.apiCode === void 0 || error.apiCode === error.httpStatus);
}
function isResultAvailable(task) {
  const result = task.result;
  if (!result?.url?.trim() || result.uploadError?.trim() || result.uploadStatus !== void 0 && result.uploadStatus !== "success") {
    return false;
  }
  try {
    const url = new URL(result.url);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

var XmaxClient = class {
  /**
   * The configuration shared by this client's services.
   */
  configuration;
  /**
   * The API service used for authenticated server requests.
   */
  apiService;
  /**
   * Creates an XmaxSDK client.
   *
   * Local camera preview does not require a validated API key. Server operations validate the key when
   * called.
   */
  constructor(configuration) {
    this.configuration = configuration;
    XmaxLogger.configure(
      configuration.loggerOptions,
      configuration.environment
    );
    this.apiService = new ApiService({
      apiKey: configuration.apiKey,
      baseURL: apiBaseURL(configuration.environment)
    });
  }
  /**
   * Creates a realtime media manager.
   *
   * All model IDs use the environment's realtime endpoint for the entire session lifecycle.
   *
   * @param options - The model and realtime generation configuration.
   * @returns A manager for local preview, realtime connections, and generation.
   */
  createRealtimeManager(options) {
    const baseURL = modelBaseURL(options.model) ?? realtimeApiBaseURL(this.configuration.environment);
    const apiService = new ApiService({
      apiKey: this.configuration.apiKey,
      baseURL
    });
    const eventRelayService = new RealtimeEventRelayService(apiService);
    return new XmaxRealtimeManager(
      options,
      {
        apiService,
        eventRelayService,
        environment: this.configuration.environment
      }
    );
  }
  /**
   * Creates a non-realtime task manager using the client's API key and task endpoint.
   *
   * Creation does not send requests or load an RTC SDK. Server-persisted tasks can be queried again by
   * ID.
   */
  createNonRealtimeManager() {
    const apiService = new ApiService({
      apiKey: this.configuration.apiKey,
      baseURL: nonRealtimeApiBaseURL(this.configuration.environment)
    });
    return new XmaxNonRealtimeManager(new NonRealtimeTaskService(apiService));
  }
  /**
   * Creates a media-processing and capability-query service.
   *
   * @param model - The model whose input rules apply; defaults to x2.1.
   */
  createMediaService(model = "x2.1" /* x2_1 */) {
    return new MediaService(model);
  }
  /**
   * Creates a storage service for uploading images and videos.
   */
  createStorageService() {
    return new StorageService({ apiService: this.apiService });
  }
  /**
   * Fetches the remaining credits for the account owning this client's API key.
   *
   * Each call requests the current server balance using the client's general service environment,
   * bypassing browser caching. Your app controls refresh timing and insufficient-credit handling.
   *
   * @returns The server-reported balance, including fractional credits.
   * @throws Rejects for invalid credentials, request failure, or missing or invalid balance data.
   */
  async getCreditBalance() {
    const payload = await this.apiService.get(
      "/balance",
      { cache: "no-store" }
    );
    const currentBalance = typeof payload === "object" && payload !== null && !Array.isArray(payload) ? payload.currentBalance : void 0;
    if (typeof currentBalance !== "number" || !Number.isFinite(currentBalance) || currentBalance < 0) {
      throw new XmaxError(
        "API_ERROR" /* apiError */,
        "Server returned an invalid credit balance"
      );
    }
    return Object.freeze({ currentBalance });
  }
};

var RealtimeConfiguration = class {
  /**
   * The generation model. Custom IDs are forwarded unchanged and use X2.1 media and RTC defaults.
   */
  model;
  /**
   * The RTC provider, defaulting to the first provider supported by the model. It cannot change after
   * creation.
   */
  provider;
  /**
   * Whether to adapt uplink and downlink quality automatically; defaults to true. When disabled, startup
   * uses L1 without reading or updating quality history. Manual adjustment remains available.
   */
  isAdaptiveQualityEnabled;
  /**
   * Creates a realtime configuration and validates the model and RTC provider.
   */
  constructor(init) {
    const providers = supportedRtcProviders(init.model);
    this.provider = init.provider ?? providers[0];
    if (!Object.values(RtcProvider).includes(this.provider)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "Unsupported RTC provider"
      );
    }
    if (!providers.includes(this.provider)) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        `Model ${init.model} does not support RTC provider ${this.provider}`
      );
    }
    this.model = init.model;
    this.isAdaptiveQualityEnabled = init.isAdaptiveQualityEnabled ?? true;
  }
};

var RenderStatisticsController = class {
  /**
   * Creates an observer for a video element; collection begins only after start().
   */
  constructor(video) {
    this.video = video;
  }
  /**
   * The presentation-statistics callback.
   */
  handler;
  /**
   * The periodic sampling timer.
   */
  timer;
  /**
   * The pending video-frame observation handle.
   */
  callbackID;
  /**
   * The measurement revision rejecting obsolete callbacks.
   */
  sequence = 0;
  /**
   * The sampling-window start on the monotonic clock.
   */
  startedAt = 0;
  /**
   * The original-frame count in the current window.
   */
  originalFrames = 0;
  /**
   * The previous cumulative presented-frame count reported by the browser.
   */
  previousPresentedFrames;
  /**
   * Collects independently of panel visibility, without allocating a timer when no observer exists.
   */
  start() {
    if (this.timer !== void 0 || !this.video.srcObject && !this.video.getAttribute("src") || !this.handler || typeof this.video.requestVideoFrameCallback !== "function") {
      return;
    }
    this.reset();
    const sequence = this.sequence;
    const observe = () => {
      this.callbackID = this.video.requestVideoFrameCallback((_now, metadata) => {
        if (sequence !== this.sequence) {
          return;
        }
        this.callbackID = void 0;
        if (!document.hidden) {
          this.recordVideoFrames(metadata.presentedFrames);
        } else {
          this.previousPresentedFrames = void 0;
        }
        observe();
      });
    };
    observe();
    this.timer = setInterval(
      () => this.sample(),
      1e3
    );
  }
  /**
   * Counts cumulative presented-frame increments, including frames presented between callbacks.
   */
  recordVideoFrames(presentedFrames) {
    if (!Number.isSafeInteger(presentedFrames) || presentedFrames < 0) {
      this.previousPresentedFrames = void 0;
      return;
    }
    const previous = this.previousPresentedFrames;
    this.previousPresentedFrames = presentedFrames;
    if (previous === void 0 || presentedFrames < previous) {
      this.originalFrames += presentedFrames > 0 ? 1 : 0;
      return;
    }
    this.originalFrames += presentedFrames - previous;
  }
  /**
   * Stops sampling and frame observation, invalidates queued callbacks, and clears public statistics.
   */
  stop() {
    this.sequence++;
    clearInterval(this.timer);
    this.timer = void 0;
    if (this.callbackID !== void 0) {
      this.video.cancelVideoFrameCallback(this.callbackID);
    }
    this.callbackID = void 0;
    this.reset();
  }
  /**
   * Resets the sampling window to exclude media from previous bindings.
   */
  reset() {
    this.startedAt = performance.now();
    this.originalFrames = 0;
    this.previousPresentedFrames = void 0;
    this.notify(void 0);
  }
  /**
   * Computes rate over actual elapsed time, reporting zero without new frames and suppressing
   * hidden-page samples.
   */
  sample() {
    const now = performance.now();
    const seconds = (now - this.startedAt) / 1e3;
    if (document.hidden || seconds <= 0) {
      this.reset();
      return;
    }
    const statistics = Object.freeze({
      source: "video",
      frameRate: this.originalFrames / seconds,
      originalFrameRate: this.originalFrames / seconds
    });
    this.startedAt = now;
    this.originalFrames = 0;
    this.notify(statistics);
  }
  /**
   * Isolates app callback failures from playback and subsequent sampling.
   */
  notify(statistics) {
    try {
      this.handler?.(statistics);
    } catch {
    }
  }
};

var RenderWarmupController = class {
  /**
   * Creates a presentation warmup controller; fade settings do not change first-frame or
   * warmup-completion timing.
   *
   * @param element - The media layer whose visibility and fade are controlled.
   * @param fadeInDurationMs - Fade duration after warmup, in milliseconds; defaults to 300. Zero
   * displays immediately.
   * @throws An invalidConfiguration error for negative or nonfinite durations.
   */
  constructor(element, fadeInDurationMs = 300) {
    this.element = element;
    this.fadeInDurationMs = fadeInDurationMs;
  }
  /**
   * The configured warmup duration, in milliseconds.
   */
  durationMs;
  /**
   * The pending warmup timer.
   */
  timer;
  /**
   * Whether warmup has started.
   */
  started = false;
  /**
   * Whether the current warmup has completed.
   */
  completed = false;
  /**
   * The next fade-in duration, in milliseconds.
   */
  currentFadeInDurationMs = 300;
  /**
   * The configured fade-in duration, in milliseconds.
   */
  get fadeInDurationMs() {
    return this.currentFadeInDurationMs;
  }
  /**
   * Updates the next fade without changing an active animation or first-frame warmup.
   */
  set fadeInDurationMs(fadeInDurationMs) {
    if (!Number.isFinite(fadeInDurationMs) || fadeInDurationMs < 0) {
      throw new XmaxError(
        "INVALID_CONFIGURATION" /* invalidConfiguration */,
        "fadeInDurationMs must be a finite non-negative number"
      );
    }
    this.currentFadeInDurationMs = fadeInDurationMs;
  }
  /**
   * Whether presentation is waiting for a first frame or warmup completion.
   */
  get isPending() {
    return this.durationMs !== void 0 && !this.completed;
  }
  /**
   * Hides new media during warmup; undefined displays immediately without warmup.
   */
  prepare(durationMs) {
    this.reset();
    this.durationMs = durationMs;
    if (durationMs === void 0) {
      return;
    }
    this.element.style.transition = "none";
    this.element.style.opacity = "0";
    this.element.style.pointerEvents = "none";
  }
  /**
   * Starts one warmup after first-frame readiness, then notifies and fades in.
   */
  start(onCompleted) {
    if (this.durationMs === void 0 || this.started) {
      return;
    }
    this.started = true;
    this.timer = setTimeout(
      () => {
        this.timer = void 0;
        this.completed = true;
        const reduceMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        this.element.style.transition = reduceMotion || this.fadeInDurationMs === 0 ? "none" : `opacity ${this.fadeInDurationMs}ms ease-in-out`;
        this.element.style.opacity = "1";
        this.element.style.pointerEvents = "";
        onCompleted();
      },
      this.durationMs
    );
  }
  /**
   * Cancels warmup and fade during replacement or unmounting so obsolete tasks cannot reveal new media.
   */
  reset() {
    clearTimeout(this.timer);
    this.timer = void 0;
    this.started = false;
    this.completed = false;
    if (this.durationMs !== void 0) {
      this.element.style.transition = "";
      this.element.style.opacity = "";
      this.element.style.pointerEvents = "";
    }
    this.durationMs = void 0;
  }
};

var TrajectoryOverlayView = class {
  /**
   * Creates a transparent overlay with a separate effect renderer, capturing pointers only when
   * interaction is available.
   */
  constructor(renderer) {
    this.renderer = renderer;
    Object.assign(
      this.element.style,
      {
        position: "absolute",
        inset: "0",
        zIndex: "2",
        overflow: "hidden"
      }
    );
    Object.assign(
      renderer.element.style,
      {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      }
    );
    this.element.appendChild(renderer.element);
    this.element.addEventListener(
      "pointerdown",
      this.onDown
    );
    this.element.addEventListener(
      "pointermove",
      this.onMove
    );
    this.element.addEventListener(
      "pointerup",
      this.onEnd
    );
    this.element.addEventListener(
      "pointercancel",
      this.onEnd
    );
    this.element.addEventListener(
      "lostpointercapture",
      this.onEnd
    );
    document.addEventListener(
      "visibilitychange",
      this.visibilityChanged
    );
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.cancel());
      this.resizeObserver.observe(this.element);
    }
    this.updateStyle();
  }
  /**
   * The transparent interaction-layer element.
   */
  element = document.createElement("div");
  /**
   * The interaction binding supplied by the current track.
   */
  binding;
  /**
   * The fixed media format used for coordinate mapping.
   */
  format;
  /**
   * The image scaling and cropping mode.
   */
  contentMode = "fill" /* fill */;
  /**
   * Whether the displayed image is mirrored horizontally.
   */
  mirrored = false;
  /**
   * Whether the app requests interaction.
   */
  requested = true;
  /**
   * Whether the binding permits interaction samples.
   */
  enabled = false;
  /**
   * The active pointers indexed by browser pointer ID.
   */
  pointers = /* @__PURE__ */ new Map();
  /**
   * The next trajectory ID.
   */
  nextID = 0;
  /**
   * The pending animation-frame handle.
   */
  animation;
  /**
   * The monotonic time of the last submitted sample, in milliseconds.
   */
  lastSample = 0;
  /**
   * The observer tracking interaction-viewport size.
   */
  resizeObserver;
  /**
   * The current viewport dimensions, in CSS pixels.
   */
  viewport;
  /**
   * The handler cancelling gestures when the page becomes hidden.
   */
  visibilityChanged = () => {
    if (document.hidden) {
      this.cancel();
    }
    this.updateStyle();
  };
  /**
   * The handler beginning a pointer trajectory.
   */
  onDown = (event) => this.begin(event);
  /**
   * The handler updating pointer position and visuals.
   */
  onMove = (event) => this.move(event);
  /**
   * The handler ending a pointer trajectory.
   */
  onEnd = (event) => this.end(event.pointerId);
  /**
   * Updates the task binding and clears obsolete gestures and samples.
   */
  setBinding(binding, format, enabled = false) {
    this.cancel();
    this.binding = binding;
    this.format = format;
    this.enabled = enabled;
    this.updateStyle();
  }
  /**
   * Updates presentation settings and stops submitting coordinates from the old layout.
   */
  configure(mode, mirrored, enabled) {
    if (this.contentMode !== mode || this.mirrored !== mirrored || this.requested !== enabled) {
      this.cancel();
    }
    this.contentMode = mode;
    this.mirrored = mirrored;
    this.requested = enabled;
    this.updateStyle();
  }
  /**
   * Releases sampling, animation, pointer capture, and listeners while allowing renderer reuse.
   */
  dispose() {
    this.binding?.detach(this);
    this.cancel();
    this.resizeObserver?.disconnect();
    document.removeEventListener(
      "visibilitychange",
      this.visibilityChanged
    );
    this.element.removeEventListener(
      "pointerdown",
      this.onDown
    );
    this.element.removeEventListener(
      "pointermove",
      this.onMove
    );
    this.element.removeEventListener(
      "pointerup",
      this.onEnd
    );
    this.element.removeEventListener(
      "pointercancel",
      this.onEnd
    );
    this.element.removeEventListener(
      "lostpointercapture",
      this.onEnd
    );
    this.element.remove();
  }
  /**
   * Allows page scrolling when no task is active or interaction is disabled.
   */
  updateStyle() {
    const active = this.requested && this.enabled && !!this.binding && !document.hidden;
    this.element.style.pointerEvents = active ? "auto" : "none";
    this.element.style.touchAction = active ? "none" : "auto";
    this.element.style.userSelect = active ? "none" : "auto";
  }
  /**
   * Rejects letterbox margins and clamps out-of-viewport movement to visible video edges.
   */
  point(event, id, clamp) {
    const viewport = this.element.getBoundingClientRect();
    if (!this.format) {
      return void 0;
    }
    const rect = InteractionCoordinateMapper.displayedFrame(
      viewport,
      this.format,
      this.contentMode
    );
    if (!rect || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
      return void 0;
    }
    const minX = Math.max(0, rect.x);
    const minY = Math.max(0, rect.y);
    const maxX = Math.min(viewport.width, rect.x + rect.width);
    const maxY = Math.min(viewport.height, rect.y + rect.height);
    let x = event.clientX - viewport.left;
    let y = event.clientY - viewport.top;
    if (!clamp && (x < minX || x > maxX || y < minY || y > maxY)) {
      return void 0;
    }
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));
    return Object.freeze({
      id,
      location: Object.freeze({
        x,
        y
      }),
      normalizedLocation: Object.freeze({
        x: (x - rect.x) / rect.width,
        y: (y - rect.y) / rect.height
      }),
      timestamp: performance.now()
    });
  }
  /**
   * Samples presses immediately without waiting for the next interval, accepting only the primary mouse
   * button.
   */
  begin(event) {
    if (!this.requested || !this.enabled || !this.binding || document.hidden || event.button !== 0) {
      return;
    }
    const point = this.point(
      event,
      ++this.nextID,
      false
    );
    if (!point) {
      return;
    }
    event.preventDefault();
    this.pointers.set(
      event.pointerId,
      point
    );
    try {
      this.element.setPointerCapture(event.pointerId);
    } catch {
    }
    this.render(() => this.renderer.renderBegan([point]));
    this.sample(
      performance.now(),
      true
    );
    this.schedule();
  }
  /**
   * Updates the latest position and visuals on high-frequency moves without sending each event.
   */
  move(event) {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) {
      return;
    }
    const point = this.point(
      event,
      previous.id,
      true
    );
    if (point) {
      this.pointers.set(
        event.pointerId,
        point
      );
      this.render(() => this.renderer.renderMoved([point]));
    }
  }
  /**
   * Releases one pointer, continuing multi-touch interaction until the final pointer ends.
   */
  end(pointerID) {
    const point = this.pointers.get(pointerID);
    if (!point) {
      return;
    }
    this.pointers.delete(pointerID);
    try {
      this.element.releasePointerCapture(pointerID);
    } catch {
    }
    this.render(() => this.renderer.renderEnded([point.id]));
    if (!this.pointers.size) {
      this.stopSampling();
    }
  }
  /**
   * Cancels all gestures and visual effects without retaining cross-lifecycle trajectories.
   */
  cancel() {
    for (const id of [...this.pointers.keys()]) {
      this.end(id);
    }
    this.stopSampling();
    this.render(() => this.renderer.reset());
  }
  /**
   * Clears the sampling callback and viewport snapshot.
   */
  stopSampling() {
    if (this.animation !== void 0) {
      cancelAnimationFrame(this.animation);
    }
    this.animation = void 0;
    this.viewport = void 0;
    this.lastSample = 0;
  }
  /**
   * Runs the animation clock only while pointers are active.
   */
  schedule() {
    if (this.animation === void 0 && this.pointers.size) {
      this.animation = requestAnimationFrame((now) => {
        this.animation = void 0;
        this.sample(now);
        this.schedule();
      });
    }
  }
  /**
   * Samples all active pointers at a fixed frequency, cancelling after layout changes rather than
   * sending obsolete coordinates.
   */
  sample(now, force = false) {
    if (document.hidden) {
      this.cancel();
      return;
    }
    const { width, height } = this.element.getBoundingClientRect();
    if (this.viewport && (width !== this.viewport.width || height !== this.viewport.height)) {
      this.cancel();
      return;
    }
    this.viewport = {
      width,
      height
    };
    if (!force && now - this.lastSample < 1e3 / 30) {
      return;
    }
    this.lastSample = now;
    this.binding?.submit({
      points: [...this.pointers.values()].map((point) => point.location),
      viewportSize: this.viewport,
      contentMode: this.contentMode,
      mirrored: this.mirrored
    });
  }
  /**
   * Isolates custom-renderer failures from sampling and message delivery.
   */
  render(action) {
    try {
      action();
    } catch {
      XmaxLogger.render.warning(() => "\u8F68\u8FF9\u6548\u679C\u7ED8\u5236\u5931\u8D25 (Trajectory Rendering Failed)");
    }
  }
};

var VISUAL = {
  outerWidth: 18,
  outerBlur: 12,
  outerAlpha: 0.35,
  middleWidth: 10,
  middleBlur: 6,
  middleAlpha: 0.75,
  coreWidth: 3,
  headRadius: 5,
  headGlowRadius: 14,
  headGlowAlpha: 0.9,
  ringCount: 2,
  ringStartRadius: 10,
  ringSpacing: 14,
  ringLineWidth: 2,
  ringPulseSpeed: 1.2,
  ringMaxAlpha: 0.6,
  particleCount: 4,
  particleRadius: 3,
  particleOrbitRadius: 22,
  particleSpeed: 0.06,
  particleAlpha: 0.6,
  fadeAlpha: 0.05,
  idleFadeFrames: 64
};
var DefaultTrajectoryEffectRenderer = class {
  /**
   * The element containing the trail and pointer-effect layers.
   */
  element = document.createElement("div");
  /**
   * The Canvas drawing trajectory strokes.
   */
  trailCanvas = document.createElement("canvas");
  /**
   * The Canvas drawing pointer halos.
   */
  effectCanvas = document.createElement("canvas");
  /**
   * The pending animation-frame handle.
   */
  animation;
  /**
   * Whether trail pixels remain to fade.
   */
  hasTrailPixels = false;
  /**
   * The number of fade frames since the last active pointer.
   */
  idleFadeFrames = 0;
  /**
   * The current pointers and their press timestamps.
   */
  pointers = /* @__PURE__ */ new Map();
  /**
   * The trajectory segments awaiting drawing.
   */
  segments = [];
  /**
   * Creates independent visual layers without registering pointer events.
   */
  constructor() {
    for (const canvas of [this.trailCanvas, this.effectCanvas]) {
      Object.assign(
        canvas.style,
        {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }
      );
      this.element.appendChild(canvas);
    }
  }
  /**
   * Starts pointer decorations with pulse time relative to each press.
   */
  renderBegan(points) {
    for (const point of points) {
      this.pointers.set(
        point.id,
        {
          point,
          startedAt: point.timestamp
        }
      );
    }
    this.idleFadeFrames = 0;
    this.schedule();
  }
  /**
   * Draws new segments while old pixels fade, without repeatedly brightening the full trajectory.
   */
  renderMoved(points) {
    for (const point of points) {
      const pointer = this.pointers.get(point.id);
      if (pointer) {
        this.segments.push({
          from: pointer.point,
          to: point
        });
        pointer.point = point;
      }
    }
    this.schedule();
  }
  /**
   * Removes pointer decorations on release while retaining trail fade-out.
   */
  renderEnded(identifiers) {
    for (const id of identifiers) {
      this.pointers.delete(id);
    }
    this.schedule();
  }
  /**
   * Clears drawing state and animation, allowing the renderer to be mounted again.
   */
  reset() {
    if (this.animation !== void 0) {
      cancelAnimationFrame(this.animation);
    }
    this.animation = void 0;
    this.pointers.clear();
    this.segments.length = 0;
    this.hasTrailPixels = false;
    this.idleFadeFrames = 0;
    for (const canvas of [this.trailCanvas, this.effectCanvas]) {
      canvas.getContext("2d")?.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }
  /**
   * Requests animation only while pointers, segments, or fading pixels remain.
   */
  schedule() {
    if (this.animation === void 0 && (this.pointers.size || this.segments.length || this.hasTrailPixels)) {
      this.animation = requestAnimationFrame((now) => this.draw(now));
    }
  }
  /**
   * Synchronizes Canvas resolution and updates trail and pointer layers.
   */
  draw(now) {
    this.animation = void 0;
    const trail = this.trailCanvas.getContext("2d");
    const effects = this.effectCanvas.getContext("2d");
    if (!trail || !effects) {
      this.reset();
      return;
    }
    const rect = this.element.getBoundingClientRect();
    const dpr = globalThis.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    for (const canvas of [this.trailCanvas, this.effectCanvas]) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        this.hasTrailPixels = false;
      }
    }
    if (this.hasTrailPixels) {
      trail.save();
      trail.globalCompositeOperation = "destination-out";
      trail.fillStyle = "rgba(0,0,0," + VISUAL.fadeAlpha + ")";
      trail.fillRect(
        0,
        0,
        width,
        height
      );
      trail.restore();
    }
    if (this.segments.length) {
      this.drawSegments(
        trail,
        dpr
      );
      this.segments.length = 0;
      this.hasTrailPixels = true;
      this.idleFadeFrames = 0;
    }
    effects.clearRect(
      0,
      0,
      width,
      height
    );
    effects.save();
    effects.globalCompositeOperation = "lighter";
    for (const { point, startedAt } of this.pointers.values()) {
      const x = point.location.x * dpr;
      const y = point.location.y * dpr;
      if (this.pointers.size === 1) {
        this.drawRings(
          effects,
          x,
          y,
          dpr,
          (now - startedAt) / 1e3
        );
        this.drawParticles(
          effects,
          x,
          y,
          dpr,
          (now - startedAt) / 1e3
        );
      }
      this.drawGlow(
        effects,
        x,
        y,
        VISUAL.headGlowRadius * dpr,
        VISUAL.headGlowAlpha,
        true
      );
      effects.fillStyle = "rgba(255,255,255,1)";
      effects.beginPath();
      effects.arc(
        x,
        y,
        VISUAL.headRadius * dpr,
        0,
        Math.PI * 2
      );
      effects.fill();
    }
    effects.restore();
    if (this.pointers.size) {
      this.idleFadeFrames = 0;
    } else if (this.hasTrailPixels && ++this.idleFadeFrames > VISUAL.idleFadeFrames) {
      trail.clearRect(
        0,
        0,
        width,
        height
      );
      this.hasTrailPixels = false;
      this.idleFadeFrames = 0;
    }
    this.schedule();
  }
  /**
   * Draws green outer and middle glows with a white core, omitting shadows for multiple pointers to
   * reduce drawing cost.
   */
  drawSegments(context, dpr) {
    const layers = [
      {
        width: VISUAL.outerWidth,
        blur: VISUAL.outerBlur,
        color: this.green(VISUAL.outerAlpha)
      },
      {
        width: VISUAL.middleWidth,
        blur: VISUAL.middleBlur,
        color: this.green(VISUAL.middleAlpha)
      },
      {
        width: VISUAL.coreWidth,
        blur: 0,
        color: "rgba(255,255,255,1)"
      }
    ];
    for (const layer of layers) {
      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = layer.width * dpr;
      context.strokeStyle = layer.color;
      context.shadowBlur = this.pointers.size > 1 ? 0 : layer.blur * dpr;
      context.shadowColor = context.shadowBlur ? layer.color : "transparent";
      context.beginPath();
      for (const { from, to } of this.segments) {
        context.moveTo(
          from.location.x * dpr,
          from.location.y * dpr
        );
        context.lineTo(
          to.location.x * dpr,
          to.location.y * dpr
        );
      }
      context.stroke();
      context.restore();
    }
  }
  /**
   * Draws two pointer rings with different pulse phases.
   */
  drawRings(context, x, y, dpr, elapsed) {
    context.lineWidth = VISUAL.ringLineWidth * dpr;
    for (let index = 0; index < VISUAL.ringCount; index++) {
      const pulse = (Math.sin((elapsed * VISUAL.ringPulseSpeed + index * 0.5) * Math.PI * 2) + 1) / 2;
      const radius = (VISUAL.ringStartRadius + index * VISUAL.ringSpacing + pulse * 6) * dpr;
      context.strokeStyle = this.green(VISUAL.ringMaxAlpha * (1 - index * 0.2) * (0.5 + pulse * 0.5));
      context.beginPath();
      context.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );
      context.stroke();
    }
  }
  /**
   * Draws four softly orbiting particles with alternating motion.
   */
  drawParticles(context, x, y, dpr, elapsed) {
    for (let index = 0; index < VISUAL.particleCount; index++) {
      const direction = index % 2 === 0 ? 1 : -1;
      const angle = index / VISUAL.particleCount * Math.PI * 2 + elapsed * VISUAL.particleSpeed * direction;
      const radius = VISUAL.particleOrbitRadius * dpr;
      const alpha = VISUAL.particleAlpha * (0.6 + Math.sin(elapsed * 3 + index) * 0.4);
      this.drawGlow(
        context,
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius,
        VISUAL.particleRadius * 2 * dpr,
        alpha
      );
    }
  }
  /**
   * Draws a radial green halo with an additional midtone at the pointer center.
   */
  drawGlow(context, x, y, radius, alpha, head = false) {
    const gradient = context.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      radius
    );
    gradient.addColorStop(
      0,
      this.green(alpha)
    );
    if (head) {
      gradient.addColorStop(
        0.4,
        this.green(alpha * 0.6)
      );
    }
    gradient.addColorStop(
      1,
      this.green(0)
    );
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );
    context.fill();
  }
  /**
   * Returns the shared trajectory color at the requested opacity.
   */
  green(alpha) {
    return "rgba(0,255,100," + alpha + ")";
  }
};

var OBJECT_FIT = {
  ["fit" /* fit */]: "contain",
  ["fill" /* fill */]: "cover"
};
var XmaxRealtimeVideoView = class {
  /**
   * The root element containing the video player.
   */
  element;
  /**
   * The player element used by rendering bindings.
   *
   * @internal
   */
  videoElement;
  /**
   * The video-presentation layer, independent of trajectory interaction.
   */
  videoLayer;
  /**
   * The media-only warmup layer, which leaves interaction unaffected.
   */
  warmupLayer;
  /**
   * Whether video content is visible.
   */
  videoVisible = true;
  /**
   * The one-shot callback after first-frame submission, rearmed when the track changes.
   */
  frameDisplayHandler;
  /**
   * The currently rendered track.
   */
  currentTrack;
  /**
   * The image scaling and cropping mode.
   */
  contentMode;
  /**
   * Whether video display is mirrored horizontally.
   */
  mirrored = false;
  /**
   * Whether the current stream has reported its first frame.
   */
  hasNotifiedFrameDisplay = false;
  /**
   * The fallback playing-event callback for first-frame readiness.
   */
  onPlaying;
  /**
   * The pending first-frame observation handle.
   */
  videoFrameCallbackID;
  /**
   * The revision preventing old-stream frame callbacks from affecting replacements.
   */
  frameNotificationSequence = 0;
  /**
   * The presentation-statistics controller.
   */
  statisticsController;
  /**
   * The remote warmup and fade-in controller.
   */
  warmupController;
  /**
   * The shared stream currently assigned by the rendering binding.
   */
  sourceStream = null;
  /**
   * Whether the view has been detached.
   */
  detached = false;
  /**
   * Whether trajectory interaction is requested.
   */
  interactionEnabled = true;
  /**
   * The app-supplied trajectory renderer.
   */
  customTrajectoryRenderer;
  /**
   * The viewport sampling and trajectory-effect overlay.
   */
  trajectoryOverlay;
  /**
   * Creates a single-track realtime view.
   *
   * @param options.videoContentMode - The layout mode; defaults to fill.
   * @param options.isInteractionEnabled - Whether remote interaction is permitted; defaults to true.
   * @param options.fadeInDurationMs - Fade duration after warmup, in milliseconds; defaults to 300. Zero
   * displays immediately without skipping warmup.
   * @throws An invalidConfiguration error for negative or nonfinite fade durations.
   */
  constructor(options) {
    this.contentMode = options?.videoContentMode ?? "fill" /* fill */;
    this.interactionEnabled = options?.isInteractionEnabled ?? true;
    this.element = document.createElement("div");
    this.element.style.position = "relative";
    this.element.style.overflow = "hidden";
    this.element.style.backgroundColor = "black";
    this.videoLayer = document.createElement("div");
    Object.assign(
      this.videoLayer.style,
      {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        opacity: "1"
      }
    );
    this.element.appendChild(this.videoLayer);
    this.warmupLayer = document.createElement("div");
    Object.assign(
      this.warmupLayer.style,
      {
        position: "absolute",
        inset: "0"
      }
    );
    this.videoLayer.appendChild(this.warmupLayer);
    this.warmupController = new RenderWarmupController(
      this.warmupLayer,
      options?.fadeInDurationMs
    );
    this.videoElement = document.createElement("video");
    this.statisticsController = new RenderStatisticsController(this.videoElement);
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;
    this.videoElement.style.position = "absolute";
    this.videoElement.style.inset = "0";
    this.videoElement.style.width = "100%";
    this.videoElement.style.height = "100%";
    this.applyContentMode();
    this.warmupLayer.appendChild(this.videoElement);
  }
  /**
   * The fade duration after remote warmup, in milliseconds.
   */
  get fadeInDurationMs() {
    return this.warmupController.fadeInDurationMs;
  }
  /**
   * Sets the next fade duration; zero skips animation but not warmup.
   */
  set fadeInDurationMs(durationMs) {
    this.warmupController.fadeInDurationMs = durationMs;
  }
  /**
   * Whether video is visible; defaults to true. Hidden video retains playback, decoding, and trajectory
   * interaction.
   */
  get isVideoVisible() {
    return this.videoVisible;
  }
  /**
   * Changes video visibility without changing media or interaction settings.
   */
  set isVideoVisible(visible) {
    if (this.videoVisible === visible) {
      return;
    }
    this.videoVisible = visible;
    this.videoLayer.style.opacity = visible ? "1" : "0";
  }
  /**
   * Whether remote interaction is permitted. Local tracks have no interaction binding.
   */
  get isInteractionEnabled() {
    return this.interactionEnabled;
  }
  /**
   * Enables or disables interaction, cancelling current gestures immediately when disabled without
   * interrupting playback.
   */
  set isInteractionEnabled(enabled) {
    this.interactionEnabled = enabled;
    this.trajectoryOverlay?.configure(
      this.contentMode,
      this.mirrored,
      enabled
    );
  }
  /**
   * The custom trajectory effect, or undefined for the SDK default.
   */
  get trajectoryRenderer() {
    return this.customTrajectoryRenderer;
  }
  /**
   * Replaces visual effects after releasing old animation; the SDK retains sampling and message
   * delivery.
   */
  set trajectoryRenderer(renderer) {
    if (this.customTrajectoryRenderer === renderer) {
      return;
    }
    this.disposeTrajectory();
    this.customTrajectoryRenderer = renderer;
    this.attachTrajectory();
  }
  /**
   * The currently displayed track, with old bindings removed on replacement.
   */
  get track() {
    return this.currentTrack;
  }
  /**
   * The presentation-statistics callback, invoked once per second; replacement, detachment, or
   * unavailable measurements report undefined.
   */
  get renderStatisticsHandler() {
    return this.statisticsController.handler;
  }
  /**
   * Updates observation independently of playback, stopping statistics collection when removed.
   */
  set renderStatisticsHandler(handler) {
    this.statisticsController.handler = handler;
    this.statisticsController.stop();
    this.startRenderStatistics();
  }
  /**
   * Unbinds the old track, installs the replacement, and rearms one-shot first-frame notification.
   */
  set track(track) {
    if (this.currentTrack === track) {
      return;
    }
    this.detachCurrentTrack();
    this.currentTrack = track;
    this.hasNotifiedFrameDisplay = false;
    if (track) {
      this.attachTrack(track);
    }
  }
  /**
   * The image layout mode.
   */
  get videoContentMode() {
    return this.contentMode;
  }
  /**
   * Changes layout without reapplying unchanged settings.
   */
  set videoContentMode(mode) {
    if (this.contentMode === mode) {
      return;
    }
    this.contentMode = mode;
    this.applyContentMode();
  }
  /**
   * Whether display is mirrored, without affecting publication.
   */
  get isMirrored() {
    return this.mirrored;
  }
  /**
   * Updates the display transform without modifying media.
   */
  set isMirrored(mirrored) {
    if (this.mirrored === mirrored) {
      return;
    }
    this.mirrored = mirrored;
    this.applyContentMode();
  }
  /**
   * Attaches the view to a container.
   */
  attach(to) {
    this.detached = false;
    to.appendChild(this.element);
    this.attachTrajectory();
    if (this.videoElement.srcObject && this.videoElement.autoplay && !this.videoElement.ended && this.videoElement.paused && typeof this.videoElement.play === "function") {
      void this.videoElement.play().catch((error) => {
        XmaxLogger.render.warning(() => `\u6062\u590D\u89C6\u9891\u64AD\u653E\u5931\u8D25 (Failed to Resume Video Playback)
\u2514\u2500 ${String(error)}`);
      });
    }
    this.startRenderStatistics();
    if (this.videoElement.srcObject && !this.hasNotifiedFrameDisplay) {
      this.prepareRenderWarmup();
      this.armFrameDisplayNotification();
    }
  }
  /**
   * Removes the view from its container.
   */
  detach() {
    this.detached = true;
    this.disposeTrajectory();
    this.statisticsController.stop();
    this.cancelFrameDisplayNotification();
    this.warmupController.reset();
    this.hasNotifiedFrameDisplay = false;
    this.element.remove();
  }
  /**
   * Sets rendered media for custom bindings and direct playback.
   *
   * @internal
   */
  setMediaStream(stream, preservePresentation = false) {
    if (this.sourceStream === stream) {
      return;
    }
    this.sourceStream = stream;
    if (preservePresentation && stream && this.hasNotifiedFrameDisplay) {
      this.videoElement.srcObject = stream;
      this.videoElement.autoplay = true;
      return;
    }
    this.statisticsController.stop();
    this.cancelFrameDisplayNotification();
    this.hasNotifiedFrameDisplay = false;
    this.videoElement.srcObject = stream;
    this.warmupController.reset();
    if (stream) {
      this.videoElement.autoplay = true;
      this.prepareRenderWarmup();
      this.armFrameDisplayNotification();
      this.startRenderStatistics();
    }
  }
  /**
   * Restarts first-frame and warmup observation without replacing playing media.
   *
   * @internal
   */
  prepareForGeneration() {
    this.cancelFrameDisplayNotification();
    this.warmupController.reset();
    this.hasNotifiedFrameDisplay = false;
    this.prepareRenderWarmup();
    if (!this.detached && this.videoElement.srcObject) {
      this.armFrameDisplayNotification();
    }
  }
  /**
   * Uses a registered rendering binding or attaches the native media track directly.
   */
  attachTrack(track) {
    const binding = VideoRenderRegistry.binding(track);
    if (binding) {
      binding.attachHandler(
        this,
        this.contentMode
      );
      this.attachTrajectory();
      return;
    }
    if (track.mediaStreamTrack) {
      this.setMediaStream(new MediaStream([track.mediaStreamTrack]));
      return;
    }
    XmaxLogger.render.warning(
      () => `\u8F68\u9053 ${track.id} \u65E2\u6CA1\u6709\u6E32\u67D3\u7ED1\u5B9A\u4E5F\u6CA1\u6709\u5A92\u4F53\u8F68\uFF0C\u65E0\u6CD5\u663E\u793A`
    );
  }
  /**
   * Unbinds the current track and clears presentation.
   */
  detachCurrentTrack() {
    this.warmupController.reset();
    this.disposeTrajectory();
    this.statisticsController.stop();
    const track = this.currentTrack;
    if (track) {
      VideoRenderRegistry.binding(track)?.detachHandler(this);
    }
    this.cancelFrameDisplayNotification();
    this.videoElement.srcObject = null;
    this.sourceStream = null;
  }
  /**
   * Observes compositor submission, approximating readiness with playing on unsupported browsers.
   */
  armFrameDisplayNotification() {
    this.cancelFrameDisplayNotification();
    const sequence = this.frameNotificationSequence;
    const track = this.currentTrack;
    const binding = track ? VideoRenderRegistry.binding(track) : void 0;
    const notify = () => {
      if (sequence !== this.frameNotificationSequence || this.hasNotifiedFrameDisplay) {
        return;
      }
      this.hasNotifiedFrameDisplay = true;
      this.cancelFrameDisplayNotification();
      const notifiedSequence = this.frameNotificationSequence;
      binding?.frameDisplayHandler?.();
      this.frameDisplayHandler?.();
      if (notifiedSequence === this.frameNotificationSequence) {
        this.warmupController.start(() => {
          this.applyContentMode();
          binding?.renderWarmupCompletedHandler?.();
        });
      }
    };
    if (typeof this.videoElement.requestVideoFrameCallback === "function") {
      this.videoFrameCallbackID = this.videoElement.requestVideoFrameCallback(notify);
      return;
    }
    this.onPlaying = notify;
    this.videoElement.addEventListener(
      "playing",
      this.onPlaying,
      {
        once: true
      }
    );
    if (!this.videoElement.paused && this.videoElement.readyState >= 2) {
      queueMicrotask(notify);
    }
  }
  /**
   * Cancels first-frame observation on replacement, unbinding, or detachment so stale callbacks cannot
   * count toward a new stream.
   */
  cancelFrameDisplayNotification() {
    this.frameNotificationSequence += 1;
    if (this.videoFrameCallbackID !== void 0) {
      this.videoElement.cancelVideoFrameCallback(this.videoFrameCallbackID);
      this.videoFrameCallbackID = void 0;
    }
    if (this.onPlaying) {
      this.videoElement.removeEventListener(
        "playing",
        this.onPlaying
      );
      this.onPlaying = void 0;
    }
  }
  /**
   * Enables warmup only for configured remote bindings; local and ordinary media display immediately.
   */
  prepareRenderWarmup() {
    const binding = this.currentTrack ? VideoRenderRegistry.binding(this.currentTrack) : void 0;
    this.warmupController.prepare(binding?.renderWarmupMs);
    this.applyContentMode();
  }
  /**
   * Applies layout and mirroring styles.
   */
  applyContentMode() {
    this.trajectoryOverlay?.configure(
      this.contentMode,
      this.mirrored,
      this.interactionEnabled
    );
    this.videoElement.style.objectFit = OBJECT_FIT[this.contentMode];
    this.videoElement.style.transform = this.mirrored ? "scaleX(-1)" : "";
  }
  /**
   * Starts presentation statistics while attached, delegating readiness and sampling to the statistics
   * controller.
   */
  startRenderStatistics() {
    if (!this.detached) {
      this.statisticsController.start();
    }
  }
  /**
   * Creates an overlay only for interactive tracks, avoiding Canvas allocation for ordinary video and
   * local preview.
   */
  attachTrajectory() {
    if (this.detached || this.trajectoryOverlay || !this.currentTrack) {
      return;
    }
    const binding = TrajectoryRegistry.binding(this.currentTrack);
    if (!binding) {
      return;
    }
    const overlay = new TrajectoryOverlayView(this.customTrajectoryRenderer ?? new DefaultTrajectoryEffectRenderer());
    this.trajectoryOverlay = overlay;
    overlay.configure(
      this.contentMode,
      this.mirrored,
      this.interactionEnabled
    );
    this.element.appendChild(overlay.element);
    binding.attach(overlay);
  }
  /**
   * Releases interaction resources on replacement or detachment; reattachment creates a fresh binding.
   */
  disposeTrajectory() {
    this.trajectoryOverlay?.dispose();
    this.trajectoryOverlay = void 0;
  }
};

var XMAX_ENVIRONMENT = false ? XmaxEnvironment3.global : "global";

export {
  realtimeApiBaseURL,
  ApiService,
  RealtimeVideoFormat,
  RealtimeContext,
  createRtcManager,
  XmaxRealtimeManager,
  RealtimeEventRelayService,
  XmaxConfiguration,
  XmaxClient,
  RealtimeConfiguration,
  XmaxRealtimeVideoView,
  XMAX_ENVIRONMENT
};
