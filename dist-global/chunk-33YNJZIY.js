var PROMPTS = {
  character: "\u89C6\u9891\u4E2D\u89D2\u8272\u66FF\u6362\u6210\u53C2\u8003\u56FE\u4E2D\u89D2\u8272",
  outfit: "\u89C6\u9891\u4E2D\u4EBA\u7269\u8863\u670D\u66FF\u6362\u6210\u53C2\u8003\u56FE\u4E2D\u8863\u670D"
};
function errorText(error) {
  const detail = error && typeof error === "object" ? error : void 0;
  const text = typeof detail?.message === "string" ? detail.message : String(error);
  const code = String(detail?.code ?? detail?.status ?? detail?.statusCode ?? "");
  const value = `${code} ${detail?.apiCode ?? ""} ${text}`;
  if (/\b46001\b|X-Api-Key cannot be empty|Add your API key|API key (?:is )?(?:missing|required)/i.test(value)) return "Add your API key to continue.";
  if (/\b46018\b|TOKEN_EXPIRED|(?:API key|token).*(?:expired|已过期)/i.test(value)) return "Your API key has expired. Update it in settings.";
  if (/\b46019\b|(?:temporary API key).*(?:points|credit).*limit/i.test(value)) return "This API key has reached its credit limit. Update it in settings.";
  if (/\b46017\b|payment required|insufficient[_ ](?:credits|balance|funds)|(?:credits|balance).*(?:exhausted|depleted)|out of credits|积分不足|余额不足/i.test(value)) return "Out of credits. Top up to continue.";
  if (/\b46002\b|TOKEN_INVALID|invalid[_ ](?:user[_ ])?(?:api[_ ]?)?key|无效的用户 API Key/i.test(value)) return "Your provider rejected this API key. Check it in settings.";
  return text.slice(0, 240);
}
async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read image."));
    r.readAsDataURL(file);
  });
}
async function gatherIce(peer) {
  if (peer.iceGatheringState === "complete") return;
  await new Promise((resolve, reject) => {
    const finish = () => {
      clearTimeout(timer);
      peer.removeEventListener("icegatheringstatechange", change);
    };
    const change = () => {
      if (peer.iceGatheringState === "complete") {
        finish();
        resolve();
      }
    };
    const timer = setTimeout(() => {
      finish();
      reject(new Error("Local video connection timed out."));
    }, 8e3);
    peer.addEventListener("icegatheringstatechange", change);
  });
}

export {
  PROMPTS,
  errorText,
  fileToDataUrl,
  gatherIce
};
