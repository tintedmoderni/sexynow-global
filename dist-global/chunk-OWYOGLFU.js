var PUBLISH_FPS = 24;
var VideoCaptureError = class extends Error {
  /**
   * 采集失败类型；只有跨域限制适合尝试 CORS 媒体源。
   */
  kind;
  /**
   * 创建包含底层原因的采集错误。
   *
   * @param kind 采集失败类型。
   * @param message 面向用户的错误说明。
   * @param cause 浏览器提供的原始错误。
   * @returns 采集错误实例。
   */
  constructor(kind, message, cause) {
    super(message, { cause });
    this.name = "VideoCaptureError";
    this.kind = kind;
  }
};
function captureError(cause) {
  const name = cause && typeof cause === "object" && "name" in cause ? cause.name : "";
  return name === "SecurityError" ? new VideoCaptureError("cross-origin", "This video blocks frame capture. Its media server must allow cross-origin access.", cause) : new VideoCaptureError("capture", "Could not capture this video. Resume playback and try again.", cause);
}
function captureVideoFrame(video, size) {
  if (video.mediaKeys) throw new VideoCaptureError("protected", "Protected video playback cannot be captured. Try an unprotected video.");
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
    throw new Error("Source video is buffering. Resume playback and try again.");
  }
  const canvas = document.createElement("canvas");
  const { width, height } = size || { width: video.videoWidth, height: video.videoHeight };
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) throw new Error("Invalid video dimensions.");
  const scale = Math.min(1, 1920 / Math.max(width, height));
  canvas.width = Math.max(2, Math.round(width * scale / 2) * 2);
  canvas.height = Math.max(2, Math.round(height * scale / 2) * 2);
  try {
    const context = canvas.getContext("2d", { alpha: false });
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.getImageData(0, 0, 1, 1);
  } catch (error) {
    canvas.width = canvas.height = 1;
    throw captureError(error);
  }
  return canvas;
}
function createVideoFeed(source, onError, size, initialFrame) {
  const current = () => typeof source === "function" ? source() : source;
  const video = current();
  if (!video) throw new Error("Source video is unavailable.");
  const canvas = initialFrame || (video instanceof HTMLCanvasElement ? video : captureVideoFrame(video, size));
  const ctx = canvas.getContext("2d", { alpha: false });
  let stream;
  try {
    stream = canvas.captureStream(0);
  } catch (error) {
    throw captureError(error);
  }
  const track = stream.getVideoTracks()[0];
  track.contentHint = "motion";
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    canvas.width = canvas.height = 1;
  };
  const tick = () => {
    if (stopped) return;
    try {
      const video2 = current();
      if (video2 && (video2 instanceof HTMLCanvasElement || video2.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)) ctx.drawImage(video2, 0, 0, canvas.width, canvas.height);
      else ctx.drawImage(canvas, 0, 0);
      track.requestFrame();
    } catch {
      stop();
      onError(new Error("Video capture was interrupted. Reload the video and try again."));
    }
  };
  const timer = setInterval(tick, 1e3 / PUBLISH_FPS);
  tick();
  return { stream, stop };
}

export {
  PUBLISH_FPS,
  createVideoFeed
};
