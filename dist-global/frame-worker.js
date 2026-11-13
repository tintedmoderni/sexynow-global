"use strict";
(() => {
  // src/frame-worker.ts
  var scope = self;
  var track;
  var reader;
  var writer;
  var closed = false;
  var reading = false;
  scope.onmessage = ({ data }) => {
    void (async () => {
      if (data.type === "stop") {
        closed = true;
        track?.stop();
        await Promise.allSettled([reader?.cancel(), writer?.abort()]);
        scope.close();
        return;
      }
      if (closed) {
        data.frame?.close();
        return;
      }
      if (data.type === "source") {
        track = data.track;
        reader = new MediaStreamTrackProcessor({ track, maxBufferSize: 1 }).readable.getReader();
        scope.postMessage({ type: "ready" });
      } else if (data.type === "sink") {
        const generator = new VideoTrackGenerator();
        track = generator.track;
        writer = generator.writable.getWriter();
        scope.postMessage({ type: "track", track }, [track]);
      } else if (data.type === "pull" && reader && !reading) {
        reading = true;
        try {
          const { value: frame, done } = await reader.read();
          if (closed) {
            frame?.close();
            return;
          }
          if (done) {
            scope.postMessage({ type: "ended" });
            return;
          }
          try {
            scope.postMessage({ type: "frame", frame }, [frame]);
          } catch (error) {
            frame.close();
            throw error;
          }
        } finally {
          reading = false;
        }
      } else if (data.type === "frame") {
        const frame = data.frame;
        try {
          if (!writer) throw new Error("Video sink is not ready.");
          await writer.write(frame);
          if (!closed) scope.postMessage({ type: "written", sequence: data.sequence });
        } finally {
          frame.close();
        }
      }
    })().catch((error) => {
      if (!closed) scope.postMessage({ type: "error", error: error instanceof Error ? error.message : "Video worker failed." });
    });
  };
})();
