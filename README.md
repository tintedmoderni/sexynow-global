# SexyNow Global

Prebuilt **SexyNow v1.0.0** Chrome extension for reference-guided character and outfit replacement in webpage videos. The current interface includes **Undress** and **Swap** modes, and the package includes adult reference presets.

The unpacked extension files are available in [dist-global/](dist-global/): manifest, runtime JavaScript, styles, images, WASM and supporting assets. These are prebuilt distribution files; original development source code, dependency lockfile and build configuration are not included. The original installation ZIP is also available in Releases.

## Repository contents

- **dist-global/**: the unpacked extension, with its original directory structure.
- **Releases**: the original ZIP installation package.
- **SHA256SUMS.txt**: checksum of that original release ZIP.

## Installation

Requires **Chrome 116 or later**.

1. Select **Code → Download ZIP** on the repository main branch, or download **sexynow-global.zip** from **Releases**.
2. Extract the archive.
3. Open **chrome://extensions/** and enable **Developer mode**.
4. Select **Load unpacked** and choose the extracted **dist-global** folder containing **manifest.json**.

The v1.0.0 release tag predates the unpacked files: use the named sexynow-global.zip release asset for installation rather than that tag's automatically generated Source code archives. The named release ZIP is the original supplied archive. Its SHA-256 is recorded in **SHA256SUMS.txt**. The **__MACOSX** directory contains archive metadata and is not needed for installation.

## Services, permissions and data

Generation uses Xmax or Decart and requires a provider API key and available credits. Provider charges, availability and terms apply.

The extension requests storage, activeTab and HTTP/HTTPS website access, including matching page frames. During processing, reference images and captured video streams can be transmitted to cloud providers. Settings and API credentials are saved in browser extension storage; the reference library uses local IndexedDB. No application-level encryption of saved API keys was identified in the reviewed build.

The included Decart SDK enables telemetry by default and can report session, model, statistics and diagnostic data. Other SDK reporting paths have not been fully characterized at runtime. Cloud retention and deletion guarantees have not been verified. This is not an entirely offline extension.

## Permitted use

Use only media you are authorized to modify and distribute. Every depicted person must be an adult and must explicitly consent to the intended transformation and sharing.

Do not create or distribute non-consensual intimate imagery, sexual material involving minors, or content that violates another person's rights. These usage rules are not a claim that all restrictions are technically enforced by the current build.

## Distribution and support

Bundled components remain subject to their applicable licenses and publisher permissions. A complete dependency manifest and third-party notice bundle are not included in the supplied archive. No claim of GitHub approval, complete security review or verified cloud moderation is made.

For issue reports, include the Chrome version, extension version, provider and reproduction steps. Remove API keys and private media, and use SFW screenshots.
