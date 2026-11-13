# SexyNow Global

**[Download v1.0.0 ZIP for Chrome](https://github.com/tintedmoderni/sexynow-global/releases/download/v1.0.0/sexynow-global.zip)** · **[简体中文安装与使用](README.zh-CN.md)** · [Browse files](dist-global/)

Prebuilt **SexyNow v1.0.0** Chrome extension for reference-guided character and outfit replacement in webpage videos. The current interface includes **Undress** and **Swap** modes, and the package includes adult reference presets.

The unpacked extension files are available in [dist-global/](dist-global/): manifest, runtime JavaScript, styles, images, WASM and supporting assets. These are prebuilt distribution files; original development source code, dependency lockfile and build configuration are not included. The original installation ZIP is also available in Releases.

## Repository contents

- **dist-global/**: the unpacked extension, with its original directory structure.
- **Releases**: the original ZIP installation package.
- **SHA256SUMS.txt**: checksum of that original release ZIP.

## Installation

**You need:** desktop Chrome 116+, internet access, and your own **Xmax or Decart API key with available credits**. Processing may incur provider charges. Downloading this extension does not include a key or credits.

1. **[Download sexynow-global.zip](https://github.com/tintedmoderni/sexynow-global/releases/download/v1.0.0/sexynow-global.zip)** and extract it.
2. In Chrome, open **chrome://extensions/** and enable **Developer mode**.
3. Click **Load unpacked**. Select the extracted **dist-global** folder containing **manifest.json**, not the ZIP or its outer download folder.
4. Keep the extracted folder. Pin SexyNow from Chrome's Extensions menu if desired, then refresh any video pages already open.

Use the named **sexynow-global.zip** asset. The v1.0.0 page's automatic **Source code** archives come from an earlier documentation-only commit and are not the installer. Alternatively, **Code → Download ZIP** on the current main branch includes the unpacked extension.

The release ZIP is the unchanged original. Its SHA-256 is in [SHA256SUMS.txt](SHA256SUMS.txt). **__MACOSX** is archive metadata, not the extension folder.

## First use

1. Click SexyNow in the Chrome toolbar. Under **Model**, select **Xmax · x2.1** or **Decart · Lucy 2.5 / VTON 3.6** and enter that provider's **API key**. Settings save automatically; there is no Save button. Provider portals: [Xmax](https://platform.xmax.ai/) · [Decart](https://platform.decart.ai/).
2. Open an ordinary HTTP/HTTPS webpage, play its video and wait for a visible picture. Click the floating SexyNow sparkle control beside the video (**Transform this video**).
3. Choose **Swap** or **Undress**. The latter is initially selected.
4. Click a reference image, or choose **＋ / Upload image** and upload an authorized image smaller than 15 MB. **Selecting or uploading a reference can immediately start processing and consume credits. There is no separate Generate button.**
5. To stop processing and restore the video, use **Stop swap / Stop swap and restore original**. The panel's **×** only closes the panel.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Extension will not load | Extract the ZIP; select the inner **dist-global** containing **manifest.json**. |
| No floating control | Refresh the webpage, play the video and enable **Show video controls** in the popup. Chrome internal pages are not ordinary webpages. |
| Invalid key / no credits | Match the key to the selected provider; check its validity and balance. |
| Video capture fails | DRM-protected video is unsupported. Some players or cross-origin restrictions prevent capture; compatibility with every site is not guaranteed. |
| Image upload fails | Use a browser-decodable image smaller than 15 MB. |
| Connection error | Follow the displayed message; refresh the page before retrying. |

## Services, permissions and data

Generation uses Xmax or Decart and requires a provider API key and available credits. Provider charges, availability and terms apply.

The extension requests storage, activeTab and HTTP/HTTPS website access, including matching page frames. During processing, reference images and captured video streams can be transmitted to cloud providers. Settings and API credentials are saved in browser extension storage; the reference library uses local IndexedDB. No application-level encryption of saved API keys was identified in the reviewed build.

The included Decart SDK enables telemetry by default and can report session, model, statistics and diagnostic data. Other SDK reporting paths have not been fully characterized at runtime. Cloud retention and deletion guarantees have not been verified. This is not an entirely offline extension.

## Permitted use

Use only media you are authorized to modify and distribute. Every depicted person must be an adult and must explicitly consent to the intended transformation and sharing.

Do not create or distribute non-consensual intimate imagery, sexual material involving minors, or content that violates another person's rights. These usage rules are not a claim that all restrictions are technically enforced by the current build.

## Distribution and support

Bundled components retain their own licenses and publisher permissions. See [third-party notices](THIRD_PARTY_NOTICES.md) and [license copies](licenses/). The complete dependency/notice inventory has not been reconstructed from the missing development project. No claim of GitHub approval, complete security review or verified cloud moderation is made. The release remains marked **Pre-release**.

[Report a problem](https://github.com/tintedmoderni/sexynow-global/issues/new) with your Chrome version, extension version, provider, error and reproduction steps. Remove API keys and private media; use SFW screenshots.
