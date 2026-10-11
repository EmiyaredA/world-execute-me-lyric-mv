# Amadeus — world.execute(me);

牧濑红莉栖／Amadeus 红色版歌词 MV，基于 Nyankomint 的第四版工程改编。非官方同人作品，包含 AI 生成角色素材与 AI 辅助代码。

![Amadeus 封面](docs/images/amadeus_cover.png)

**[中文](#中文)** · **[English](#english)** · **[制作文件与提示词](docs/README.md)** · **[来源与授权](CREDITS.md)**

本改编位于 **[Amadeus 分支](https://github.com/EmiyaredA/world-execute-me-lyric-mv/tree/Amadeus)**；`main` 保留原始第四版。原作者的 Claude／Claude Code 制作记录保存在 `docs/v3/`、`docs/v4/`。

## 中文

### 当前版本

围绕“读取她的记忆—建立连接—反复尝试—保存并告别”展开。保留原曲时间轴、87 个镜头、129 行卡点、三色版画、代码图形和五秒片头警告。

角色改为牧濑红莉栖，沿用长发、白衬衫、红领带和落肩外套。主墨色为朱红 `#c64b52`、米白 `#f4e6d3` 和近黑 `#211819`；报错使用玫红，关闭状态使用灰阶。Amadeus 标志根据参考自绘为透明线稿，与十二段记忆环搭配；徽记保持直立，外环承担加载和思考动画。猫耳只作为短暂玩笑形态，F／M 段变化的是档案字段，人物始终是红莉栖。对方保持为匿名使用者。

| 段落 | 当前画面 |
| --- | --- |
| 启动 | 灰阶辉光管式数字、记忆校验、神经信号与逐渐对齐的角色墨版 |
| Vision | 关闭输入时变暗并加入低强度扫描线，人物、开关与文字保持清楚 |
| 日期回溯 | 档案带随查询年代回拉，越过记录边界后显示空框与 `NO RECORD` |
| 十二次执行 | 十二条不同尝试路径最终都返回 `NO REPLY`，旧路径变暗留存 |
| 关机 | 信号停止，数字和记忆环逐位熄灭，保留 `ARCHIVE SAVED / CONNECTION CLOSED` |

全片马赛克已替换为变暗与扫描干扰，原有撕裂、墨版错位和高潮节奏保留。封面采用红莉栖眼部特写、三行代码标题和 Amadeus 线稿，由影片同一渲染管线生成。

**目前完成的是画面改版与完整无声检查版。** 音源和真实歌词仍需本地补齐；预览明确标为 `LAYOUT PREVIEW`，正式歌词排版与音画同步尚未验收。生成的 MP4、联系表和工程压缩包位于本地 `out/`，不随 Git 提交。

### 运行

需要 Node.js 20+、Chrome 或 Edge。已在 macOS 的 Chrome／Metal 渲染管线验证。

```sh
git clone --branch Amadeus https://github.com/EmiyaredA/world-execute-me-lyric-mv.git
cd world-execute-me-lyric-mv
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

封面输出 `out/amadeus_cover.png`，尺寸为 1920×1080；README 使用的副本位于 [`docs/images/amadeus_cover.png`](docs/images/amadeus_cover.png)。角色墨版可通过 `?lab=inks&layoutOnly=1` 查看；档案变化检查用 `?lab=pre2&layoutOnly=1`，标志检查用 `?lab=marks&layoutOnly=1`。

### 补齐音源与导出

将自己提供的原曲 WAV 与 LRC／纯文本歌词放在 [`音頻&歌詞/`](音頻&歌詞/README.md)，默认文件名见 `config.json → paths.audio / paths.lrc`。也可修改配置以匹配其他文件名。歌曲及填好的歌词不会提交到 Git。

```sh
npm run lyrics
npm run preview
npm run export:preview
```

补齐音源与歌词后，成片输出 **`out/amadeus_1080p60.mp4`**，1920×1080／60fps、H.264、AAC，包含原工程的 5 秒警告页。仅显式运行 `npm run export:4k` 时导出 4K。

LRC 的文字按原工程的 129 行重新分行，使用仓库内现有时间轴。音源开头留白不同时调整 `timing.offset`；若音源剪辑或速度不同，需重新分析并验收时间轴。

占位文本禁止用于普通成片导出。需要无声检查视频时，显式使用：

```sh
node export/export.mjs --layout-only --silent --width 1920 --height 1080 --fps 60 --cq 26 --out out/amadeus_layout_1080p60.mp4
```

当前改版关键帧与前后对比见 `out/amadeus_memory_keyframes.png`、`out/amadeus_memory_comparison.png`；完整尺寸单帧在 `out/sg_frames/`，最终视频抽帧检查见 `out/amadeus_memory_video_frames.png`。

### 验证

当前无声检查版为 1920×1080／60fps、H.264／BT.709，共 13,017 帧、216.95 秒，含五秒警告页且无音轨。330 个开关及切点附近帧检查通过；13 个时刻的跳转与顺序渲染哈希一致。一般闪光最高 2.0 次／秒，饱和红闪光为 0 次，无单帧突跳。详细结果与限制见 [改编与验证记录](docs/AMADEUS.md)。

`node tools/check_memory_lab.mjs` 使用实际 1080p 渲染检查切点和开关附近帧、跳转／顺序渲染一致性、十二条不同尝试路径和保留的镜头时间轴，并输出完整尺寸关键帧。需要本机 Chrome；在 macOS 使用 Metal。

`npm run check:amadeus` 检查角色 PNG 尺寸与 RGBA、关键区域、眼睛和手掌映射、87 个镜头及全部 129 行覆盖，线稿 SVG 与实时路径一致性，以及代码语法和旧品牌／男性素材残留。

视频检查需要 Python 3、NumPy、librosa（含其依赖）；可使用自己的 `.venv`，或用环境变量 `MV_PYTHON` 指定已有 Python 环境。

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tools/requirements-qa.txt
npm run check
node tools/python.mjs tools/luma.py out/amadeus_1080p60.mp4
```

片中包含快速切换和强光，集中在成片时间 **<!-- flash-range -->2:33 – 3:17<!-- /flash-range -->**。保留原工程的警告页与光效限幅，最终带音源版本需重新检查一般闪光、红色闪光、单帧突跳、音频偏移和提示点。

### 素材与来源

- [`assets/amadeus/`](assets/amadeus/)：六张角色 PNG、角色／标志／封面参考、区域测量、内置 image_gen [生成提示词](assets/amadeus/prompts.json)，以及完整／简化线稿 SVG。
- `data/amadeus_chat.json`、`data/amadeus_errors.json`：当前主题文案。
- [改编记录](docs/AMADEUS.md)、[来源与授权](CREDITS.md)。
- [第四版原始 README](docs/v4/README_original.md) 和 `docs/v3/`、`docs/v4/` 保留原作者的 Claude／Claude Code 制作记录；其中原始导出和验收结论仅适用于第四版。

## English

An unofficial Amadeus / Makise Kurisu adaptation of Nyankomint's fourth-version lyric MV for Mili's *world.execute(me);*. The original timing, 87 shots, 129 lyric cues, five-second warning, and deterministic Canvas 2D + WebGL renderer are retained. AI-generated character assets and AI-assisted code are used. This adaptation lives on the **Amadeus** branch; `main` retains the original fourth version.

The palette is vermilion, cream, and near-black. A reference-derived Amadeus outline sits inside a twelve-segment memory ring. Boot, Vision, date rewind, twelve execution attempts, and shutdown use memory checks, neural traces, archive boundaries, and routes ending at the same `NO REPLY` node. Mosaic effects are replaced by dimming and scan interference. The cover pairs Kurisu's eye close-up with three lines of code-style title lettering.

### Run and export

Use Node.js 20+ and Chrome or Edge. Clone the `Amadeus` branch, run `npm install`, then `npm run preview`. Missing lyrics automatically select a labeled layout preview; `npm run preview:layout` selects it explicitly. `npm run cover` renders a 1920×1080 PNG.

Supply your own audio and lyrics in [`音頻&歌詞/`](音頻&歌詞/README.md), following `config.json`. Run `npm run lyrics`, then `npm run export:preview` for `out/amadeus_1080p60.mp4` (1080p/60fps, H.264/AAC). The lyric file is fitted to the existing timing table. Adjust `timing.offset` if the audio has different leading silence; different edits or playback speeds need a new timing review.

The current delivery is a **silent layout check**, not a finished lyric video. To reproduce it, use the explicit `--layout-only --silent` export command above. Generated videos and reports stay in local `out/` and are not committed. Final lyric layout and audiovisual sync await the real audio and lyrics.

### Validation and credits

`npm run check:amadeus` checks character geometry, branding, 87-shot/129-line coverage, and syntax. `node tools/check_memory_lab.mjs` checks actual rendered cue frames, seek consistency, and the twelve attempt routes. The current 1080p/60fps silent export has 13,017 frames over 216.95 seconds. Flash checks report at most 2.0 general flashes per second, no saturated-red flashes, and no single-frame pops; these are the existing project's approximate checks. Fast cuts and strong light occur at film time **<!-- flash-range -->2:33 – 3:17<!-- /flash-range -->**. Repeat the final checks after adding real lyrics and audio.

See [adaptation and validation notes](docs/AMADEUS.md), [production documents and prompts](docs/README.md), and [credits and licensing](CREDITS.md). The original author's Claude / Claude Code production records remain in `docs/v3/` and `docs/v4/`; their original export and validation claims apply to version 4. Character derivatives and references are outside the code's MIT license. Music and lyrics belong to their respective rights holders and are not included.
