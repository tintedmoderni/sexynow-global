class DumpAudioData extends AudioWorkletProcessor {
  process(inputs) {
    this.port.postMessage({
      data: inputs[0],
      channelCount: inputs[0].length,
      sampleRate,
    });
    return true;
  }
}

registerProcessor('dump-audio-data', DumpAudioData);
