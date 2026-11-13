# SexyNow Global｜安装与使用

**[下载 v1.0.0 Chrome 安装 ZIP](https://github.com/tintedmoderni/sexynow-global/releases/download/v1.0.0/sexynow-global.zip)** · [English](README.md) · [浏览插件文件](dist-global/)

SexyNow 1.0.0 根据参考图替换网页视频中的角色或服装，当前模式为 **Swap／Undress**，包内含成人参考预设。仅处理有权修改、且被摄成年人明确同意相应用途的素材。

**需要：桌面 Chrome 116 或更新版本、网络、你自己的 Xmax 或 Decart API key 和可用积分。处理可能产生供应商费用，下载插件不附赠密钥或积分。**

## 下载与安装

1. 点击上方 **下载 ZIP**，把压缩包解压到电脑上。
2. 在 Chrome 地址栏打开 **chrome://extensions/**，开启 **开发者模式**。
3. 点击 **加载已解压的扩展程序（Load unpacked）**，选择解压后的 **dist-global**。该文件夹里必须直接包含 **manifest.json**；不要选择 ZIP 或外层下载文件夹。
4. 保留这个解压文件夹，不要安装后删除。可在扩展菜单中固定 SexyNow 图标，再刷新安装前已经打开的视频网页。

请下载文件名为 **sexynow-global.zip** 的附件。v1.0.0 页面自动生成的 **Source code** 压缩包来自较早的文档提交，不是安装包。也可在当前仓库首页选择 **Code → Download ZIP**，解压后找到 **dist-global**。

原 ZIP 校验值见 [SHA256SUMS.txt](SHA256SUMS.txt)。**__MACOSX** 是打包元数据，安装时不用选它。

## 第一次使用

1. 点击浏览器工具栏里的 SexyNow，在 **Model** 选择 **Xmax · x2.1** 或 **Decart · Lucy 2.5 / VTON 3.6**，填写对应供应商的 **API key**。设置自动保存，没有 Save 按钮。供应商入口：[Xmax](https://platform.xmax.ai/)／[Decart](https://platform.decart.ai/)。
2. 打开普通 HTTP／HTTPS 网页，先播放视频、等待出现画面，再点视频旁的 SexyNow 闪光浮钮 **Transform this video**。
3. 选择 **Swap／Undress** 模式，初始为后者。
4. 点击参考图，或点 **＋／Upload image** 上传小于 15 MB、已获授权的图片。**选择参考图或上传完成后可能立即开始处理并扣除积分，没有单独的 Generate 按钮。**
5. 用 **Stop swap／Stop swap and restore original** 停止处理并恢复原视频。面板右上角 **×** 只关闭面板。

## 常见问题

| 情况 | 处理方法 |
| --- | --- |
| 扩展加载失败 | 确认已经解压，选中直接包含 manifest.json 的 dist-global。 |
| 没有浮钮 | 刷新网页、播放视频，检查弹窗的 **Show video controls**。Chrome 内置页面不属于普通网页。 |
| 密钥错误或余额不足 | 密钥必须属于所选供应商，仍有效且余额足够；GitHub 登录信息不是模型 API key。 |
| 采集视频失败 | 不支持 DRM 受保护视频；部分播放器或跨域限制也会导致失败，不能保证所有网站兼容。 |
| 上传图片失败 | 使用浏览器能解码、且小于 15 MB 的图片。 |
| 连接中断 | 按界面提示处理，刷新网页后重试。 |

可[提交 Issue](https://github.com/tintedmoderni/sexynow-global/issues/new)，说明 Chrome 版本、插件版本、供应商、报错及复现步骤。不要提交密钥、私人影像或露骨截图。

## 权限、隐私与使用范围

插件请求存储、activeTab、HTTP／HTTPS 网页及匹配子框架的访问权限。参考图和视频流可能传到 Xmax／Decart 云端，不是完全离线处理。API key 保存在浏览器扩展设置中，本次未见应用级加密；参考图库使用本地 IndexedDB。

Decart SDK 默认启用遥测，可发送会话、模型、统计及诊断数据。其他 SDK 的全部运行时上报、云端保留期限和删除保证尚未核实。

须取得每位被摄成年人对相应修改和传播的明确同意。禁止非自愿私密影像、未成年人性内容及侵权。这些规则不表示当前版本已对全部限制实现技术核验。

仓库的 **dist-global/** 是原始包的 60 个构建文件，不含开发源码、lockfile 或构建配置。第三方组件遵循各自许可和实际授权，见[第三方说明](THIRD_PARTY_NOTICES.md)。本次发布没有实测付费生成、输出质量或后端审核，保留 **Pre-release（预发布）** 标记。
