# Third-party notices

Bundled components retain their own licenses and applicable publisher/vendor permissions. These notices do not license the entire SexyNow extension, its media or all dependencies under a single open-source license.

## Confirmed copies for identified versions

| Component | Version | Included copies |
| --- | --- | --- |
| LiveKit client | 2.20.2 | [Apache-2.0 license](licenses/LiveKit-2.20.2-LICENSE.txt), from the official npm package; [NOTICE](licenses/LiveKit-2.20.2-NOTICE.txt), from the matching upstream v2.20.2 tag. |
| Tencent COS JavaScript SDK | 1.10.1 | [MIT license](licenses/tencent-cos-js-sdk-v5-1.10.1-LICENSE.txt), from this exact npm package. Its packaged license is MIT; the metadata's ISC field is not substituted for that text. |

## Other identified components and scope

The build also includes Xmax Web SDK 1.1.5, Agora RTC 4.24.8, Agora Beauty 1.1.1, Tencent TRTC 5.20.0, MediaPipe runtime/WASM, a Pose Landmarker model and transitive libraries. The publisher has confirmed redistribution permissions. The original lockfile and complete notice inventory were not supplied; this list is not a complete software bill of materials or full license audit.

The Agora RTC 4.24.8 package manifest declares MIT and TRTC 5.20.0 declares ISC; separate license/notice files were not found in those exact tarballs during this review. Agora Beauty and Xmax follow the applicable publisher/vendor permissions. No missing copyright statement or license text has been invented.

Sources of the confirmed copies:

- https://registry.npmjs.org/livekit-client/2.20.2
- https://raw.githubusercontent.com/livekit/client-sdk-js/v2.20.2/NOTICE
- https://registry.npmjs.org/cos-js-sdk-v5/1.10.1
