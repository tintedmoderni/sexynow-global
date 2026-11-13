import {
  receiveFrames
} from "./chunk-KM6WKAHB.js";
import "./chunk-4VNS5WPM.js";

var video = document.querySelector("video");
var stop;
window.addEventListener("message", (event) => {
  if (event.source !== parent) return;
  if (event.data?.type === "swap-display" && event.ports[0] && !stop) {
    const port = event.ports[0];
    stop = receiveFrames(port, video, () => {
    }, (error) => {
      console.error("[RemixNow display]", error instanceof Error ? error.message : "Video presentation failed");
      port.postMessage({ error: "Video presentation failed. Please reload the page." });
    });
  }
  if (event.data?.type === "layout") {
    if (typeof event.data.fit === "string") video.style.objectFit = event.data.fit;
    if (typeof event.data.position === "string") video.style.objectPosition = event.data.position;
  }
});
window.addEventListener("pagehide", () => {
  stop?.();
});
