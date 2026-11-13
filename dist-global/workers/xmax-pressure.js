(function setPressureObserver(e2) {
  const t2 = PressureObserver.supportedSources;
  let i2 = "thermal";
  i2 = null != t2 && t2.includes("thermal") ? "thermal" : "cpu";
  const o2 = new PressureObserver(((t3) => {
    t3.forEach(((t4) => {
      t4.source === i2 && e2(t4.state);
    }));
  }));
  try {
    Promise.resolve(o2.observe(i2, { sampleInterval: 2e3 })).catch(() => o2.disconnect());
  } catch { o2.disconnect(); }
  return o2;
})(self.postMessage.bind(self));
