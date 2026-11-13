function createWorker(onError) {
  const worker = new Worker(new URL("./frame-worker.js", import.meta.url));
  worker.onerror = (event) => {
    event.preventDefault();
    onError(new Error("Video worker could not run. Reload the page and try again."));
  };
  worker.onmessageerror = () => onError(new Error("Video worker could not receive frames."));
  return worker;
}
function stopWorker(worker) {
  worker.onmessage = null;
  worker.onerror = null;
  worker.onmessageerror = null;
  worker.postMessage({ type: "stop" });
  setTimeout(() => worker.terminate(), 250);
}
function receiveWorkerFrames(port, video, onFrame, onError) {
  let closed = false, track;
  let pending;
  const worker = createWorker(onError);
  const submit = (data) => {
    try {
      worker.postMessage({ type: "frame", ...data }, [data.frame]);
    } catch (error) {
      data.frame.close();
      onError(error);
    }
  };
  worker.onmessage = ({ data }) => {
    void (async () => {
      if (closed) {
        data.track?.stop();
        return;
      }
      if (data.type === "track") {
        track = data.track;
        video.srcObject = new MediaStream([track]);
        void video.play().catch((error) => {
          if (!closed && error.name !== "AbortError") onError(error);
        });
        if (pending) {
          submit(pending);
          pending = void 0;
        }
      } else if (data.type === "written") {
        if (video.paused) await video.play();
        if (!closed) {
          onFrame();
          port.postMessage({ ack: data.sequence });
        }
      } else if (data.type === "error") onError(new Error(data.error));
    })().catch((error) => {
      if (!closed) onError(error);
    });
  };
  port.onmessageerror = () => onError(new Error("Generated frames could not cross the browser isolation boundary."));
  port.onmessage = ({ data }) => {
    if (!data?.frame || typeof data.frame.close !== "function") return;
    if (closed) {
      data.frame.close();
      return;
    }
    if (track) submit(data);
    else {
      pending?.frame.close();
      pending = data;
    }
  };
  worker.postMessage({ type: "sink" });
  return () => {
    closed = true;
    pending?.frame.close();
    pending = void 0;
    port.close();
    track?.stop();
    video.srcObject = null;
    stopWorker(worker);
  };
}
function sendWorkerFrames(port, track, onFrame, onError, presenting) {
  const owned = track.clone();
  let closed = false, busy = false, sequence = 0, timestamp = 0;
  const worker = createWorker(onError);
  port.onmessage = ({ data }) => {
    if (!closed && typeof data?.error === "string") {
      onError(new Error(data.error));
      return;
    }
    if (!closed && busy && data?.ack === sequence) {
      busy = false;
      onFrame(timestamp);
    }
  };
  worker.onmessage = ({ data }) => {
    if (closed) {
      data.frame?.close();
      return;
    }
    if (data.type === "error") {
      onError(new Error(data.error));
      return;
    }
    if (data.type === "ready") worker.postMessage({ type: "pull" });
    if (data.type !== "frame") return;
    const frame = data.frame;
    try {
      if (busy || !presenting()) frame.close();
      else {
        busy = true;
        timestamp = frame.timestamp / 1e6;
        port.postMessage({ frame, sequence: ++sequence }, [frame]);
      }
      worker.postMessage({ type: "pull" });
    } catch (error) {
      frame.close();
      onError(error);
    }
  };
  try {
    worker.postMessage({ type: "source", track: owned }, [owned]);
  } catch (error) {
    owned.stop();
    worker.terminate();
    throw error;
  }
  return () => {
    closed = true;
    port.onmessage = null;
    owned.stop();
    stopWorker(worker);
  };
}

function receiveFrames(port, video, onFrame, onError) {
  if (typeof MediaStreamTrackGenerator === "undefined") return receiveWorkerFrames(port, video, onFrame, onError);
  const track = new MediaStreamTrackGenerator({ kind: "video" });
  const writer = track.writable.getWriter();
  video.srcObject = new MediaStream([track]);
  void video.play().catch(() => {
  });
  let closed = false;
  port.onmessageerror = () => onError(new Error("Generated frames could not cross the browser isolation boundary."));
  port.onmessage = async ({ data }) => {
    if (!data?.frame || typeof data.frame.close !== "function") return;
    const frame = data.frame;
    try {
      if (!closed) {
        await writer.write(frame);
        if (video.paused) await video.play();
        if (!closed) onFrame();
      }
    } catch (error) {
      if (!closed && error?.name !== "AbortError") onError(error);
    } finally {
      frame.close();
      if (!closed) port.postMessage({ ack: data.sequence });
    }
  };
  return () => {
    closed = true;
    port.close();
    track.stop();
    video.srcObject = null;
    void writer.abort().catch(() => {
    });
  };
}
function sendFrames(port, track, onFrame, onError, presenting = () => true) {
  if (typeof MediaStreamTrackProcessor === "undefined") return sendWorkerFrames(port, track, onFrame, onError, presenting);
  const owned = track.clone();
  const reader = new MediaStreamTrackProcessor({ track: owned, maxBufferSize: 1 }).readable.getReader();
  let closed = false, busy = false, sequence = 0, timestamp = 0;
  port.onmessage = ({ data }) => {
    if (!closed && typeof data?.error === "string") {
      onError(new Error(data.error));
      return;
    }
    if (!closed && busy && data?.ack === sequence) {
      busy = false;
      onFrame(timestamp);
    }
  };
  void (async () => {
    try {
      while (!closed) {
        const { value: frame, done } = await reader.read();
        if (done) break;
        if (closed || busy || !presenting()) {
          frame.close();
          continue;
        }
        busy = true;
        timestamp = frame.timestamp / 1e6;
        try {
          port.postMessage({ frame, sequence: ++sequence }, [frame]);
        } catch (error) {
          frame.close();
          throw error;
        }
      }
    } catch (error) {
      if (!closed) onError(error);
    }
  })();
  return () => {
    closed = true;
    port.onmessage = null;
    owned.stop();
    void reader.cancel().catch(() => {
    });
  };
}

export {
  receiveFrames,
  sendFrames
};
