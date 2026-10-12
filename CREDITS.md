# 来源与制作记录

当前版本为用户参考图所示的商汤羊角色／SenseTime 主题改编，包含 AI 生成素材与 AI 辅助代码。

- **原工程**：Nyankomint，`world-execute-me-lyric-mv` 第四版。代码原始版权声明保留在 [LICENSE](LICENSE)。原作者的制作过程与提示词保存在 `docs/v3/`、`docs/v4/`。
- **改编基础**：Amadeus 分支的 `05cd54a`；此前角色、标志和仪器制作记录保留在 [docs/AMADEUS.md](docs/AMADEUS.md)，相应素材与脚本保留为历史。
- **当前角色参考**：用户提供的《商汤黑羊-三视图.png》，保存为 `assets/sensetime/reference.png`，仅用于造型参考。图中角色与商汤名称、标志的相关权利归其权利人所有，本工程不表示官方授权或背书。
- **当前素材**：内置 image_gen 生成六张透明 PNG，保留卷发、羊耳、毛绒服装及红金无限符号发饰。提示词及修复记录见 [assets/sensetime/prompts.json](assets/sensetime/prompts.json)。参考图与角色衍生素材不纳入代码 MIT 许可。
- **标志与专色**：SenseTime 界面标志依据角色发饰重绘，大小两种 SVG 与 Canvas 共用矢量路径；角色素材中的发饰红金专色独立提取并追踪为矢量墨版，以保持缩放、裁切及镜像中的贴合。
- **封面与感知仪器**：使用本工程 Canvas／WebGL 渲染流程制作。输入信号、观测边界、扫描和十二条连接路径为代码绘制，沿用原工程的匿名对话与歌曲时间结构。
- **音乐与歌词**：Mili《world.execute(me);》及相关权利人所有，仓库不包含歌曲或歌词文本。本机音源、歌词及视频通过 `.gitignore` 排除。
- **字体**：JetBrains Mono、Source Serif 4、Inter 及原工程 Noto 中韩字体，来源及 SIL Open Font License 1.1 声明见 [第四版来源记录](docs/v4/CREDITS_original.md)。
- **历史素材**：`assets/character/` 的原版角色素材保留原作者 CC BY-NC-SA 4.0 声明；当前版本不加载历史角色。

当前验证结果见 [SenseTime 制作记录](docs/SENSETIME.md)。历史版本的同步、亮度或闪光报告不作为本版本的验收结论。
