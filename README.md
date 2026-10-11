# Amadeus — world.execute(me);

牧濑红莉栖／Amadeus 红色版歌词 MV，基于 Nyankomint 的第四版工程改编。非官方同人作品，包含 AI 生成角色素材与 AI 辅助代码。

![Amadeus 封面](docs/images/amadeus_cover.png)

保留原曲时间轴、三色版画、代码图形和镜头节奏。角色使用红莉栖的长发、白衬衫、红领带和滑落肩部的外套造型，主色改为朱红／米白／近黑。界面采用 Amadeus 名称与 参考图衍生的斜三角线稿标志与分段记忆环；猫耳为短暂玩笑形态，F／M 段只修改记忆档案参数，人物始终是红莉栖。

启动、视觉通道、日期回溯、十二次执行及关机采用记忆实验室的仪器语言：辉光管式数字、神经信号、档案边界与不同尝试路径。Vision 及高潮的马赛克已替换为变暗和扫描线，保留原有卡点、撕裂与墨版错位。

当前歌曲和歌词尚未提供。工程可运行完整无声画面预览，占位文本标为 `LAYOUT PREVIEW`；占位预览不能验收歌词排版或人声同步。

## 运行

需要 Node.js 20+、Chrome 或 Edge。已在 macOS 的 Chrome／Metal 渲染管线验证。

```sh
npm install
npm run preview
```

缺少歌词时，启动器会打开带占位文字的预览；也可显式运行 `npm run preview:layout`。拖动进度条检查全片，按空格播放无声预览。`?t=92.2&layoutOnly=1` 可跳到档案切换镜头。

```sh
npm run cover
npm run check:amadeus
node tools/check_memory_lab.mjs
node tools/storyboard.mjs --layout-only
```

封面输出 `out/amadeus_cover.png`。角色墨版可通过 `?lab=inks&layoutOnly=1` 查看；档案变化检查用 `?lab=pre2&layoutOnly=1`，标志检查用 `?lab=marks&layoutOnly=1`。

## 补齐音源与导出

将自己提供的原曲 WAV 与 LRC／纯文本歌词放在 `音頻&歌詞/`，默认文件名见 `config.json → paths.audio / paths.lrc`。也可修改配置以匹配其他文件名。歌曲及填好的歌词不会提交到 Git。

```sh
npm run lyrics
npm run preview
npm run export:preview
```

成片输出 **`out/amadeus_1080p60.mp4`**，1920×1080／60fps、H.264、AAC，包含原工程的 5 秒警告页。仅显式运行 `npm run export:4k` 时导出 4K。

LRC 的文字按原工程的 129 行重新分行，使用仓库内现有时间轴。音源开头留白不同时调整 `timing.offset`；若音源剪辑或速度不同，需重新分析并验收时间轴。

占位文本禁止用于普通成片导出。需要无声检查视频时，显式使用：

```sh
node export/export.mjs --layout-only --silent --width 1920 --height 1080 --fps 60 --cq 26 --out out/amadeus_layout_1080p60.mp4
```

当前改版关键帧与前后对比见 `out/amadeus_memory_keyframes.png`、`out/amadeus_memory_comparison.png`；完整尺寸单帧在 `out/sg_frames/`，最终视频抽帧检查见 `out/amadeus_memory_video_frames.png`。

## 验证

`node tools/check_memory_lab.mjs` 使用实际 1080p 渲染检查切点和开关附近帧、跳转／顺序渲染一致性、十二条不同尝试路径和保留的镜头时间轴，并输出完整尺寸关键帧。需要本机 Chrome；在 macOS 使用 Metal。

`npm run check:amadeus` 检查角色 PNG 尺寸与 RGBA、关键区域、眼睛和手掌映射、87 个镜头及全部 129 行覆盖，线稿 SVG 与实时路径一致性，以及代码语法和旧品牌／男性素材残留。

视频检查需要 Python 3、NumPy、librosa（含其依赖）；可使用自己的 `.venv`，或用环境变量 `MV_PYTHON` 指定已有 Python 环境。

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tools/requirements-qa.txt
npm run check
node tools/python.mjs tools/luma.py out/amadeus_1080p60.mp4
```

片中包含快速切换和强光。保留原工程的警告页与光效限幅，最终带音源版本需重新检查一般闪光、红色闪光、单帧突跳、音频偏移和提示点。

## 素材与来源

- `assets/amadeus/`：六张角色 PNG、用户参考图、区域测量、内置 image_gen 生成提示词，以及标志参考与完整／简化线稿 SVG。
- `data/amadeus_chat.json`、`data/amadeus_errors.json`：当前主题文案。
- [改编记录](docs/AMADEUS.md)、[来源与授权](CREDITS.md)。
- [第四版原始 README](docs/v4/README_original.md) 和 `docs/v3/`、`docs/v4/` 保留原作者的 Claude／Claude Code 制作记录；其中原始导出和验收结论仅适用于第四版。

Amadeus red screenprint adaptation featuring Makise Kurisu. The deterministic Canvas 2D + WebGL renderer and original timing are retained. The music and lyrics must be supplied locally; layout previews use labeled placeholder text and are not final lyric videos.
