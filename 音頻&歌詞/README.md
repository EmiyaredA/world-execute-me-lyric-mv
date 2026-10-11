# 把你自己的歌曲與歌詞放在這裡 · Put your own song and lyrics here

**[中文](#中文)** | **[English](#english)**

## 中文

這個倉庫**不含** Mili《world.execute(me);》的音頻,也不含歌詞。兩樣都請自備,放進這個資料夾;git 會忽略這裡除了本說明以外的所有檔案。

| 檔案 | 預設檔名(`config.json → paths`) | 說明 |
| --- | --- | --- |
| 歌曲 | `Mili - world.execute (me) ;.wav` | 檔名不同就改 `config.json → paths.audio`。製作時用的是 44.1 kHz 的 wav;你的版本若開頭的空白長度不同,用 `config.json → timing.offset` 整體校正。 |
| 歌詞 | `Mili - world.execute (me) ;.lrc` | 任何時間軸的 LRC,或沒有時間軸的純文字都可以;這個資料夾裡只有一個 `.lrc` / `.txt` 時,檔名不拘。 |

歌詞檔只需要有同樣的詞、同樣的順序。它自己的時間軸和分行不會被採用:`tools/fill_lyrics.mjs` 會把你的詞填進倉庫裡的時間表
(`data/lyric_timing.json`),生成只留在你本機的 `data/lyrics.json`。預覽、導出與分鏡表都會自動做這一步;想單獨看結果:

```bash
npm run lyrics
```

它會告訴你有幾行與製作時的歌詞完全相同、哪些行被重新分行、你的檔案裡哪幾列不是片中的歌詞(署名、翻譯)而被略過;
如果片中有某幾行在你的檔案裡找不到,它會列出行號與歌曲時間,並停下來。

当前 Amadeus 版本缺少歌词时自动进入带 `LAYOUT PREVIEW` 标记的占位预览；缺少音源时仍可无声播放。`npm run preview:layout` 可显式打开该模式。占位文本仅用于检查构图与节奏，不能验收歌词排版或音画同步。

正式导出 `npm run export:preview` 需要补齐音源和歌词，输出 `out/amadeus_1080p60.mp4`。音源开头留白不同，先调整 `timing.offset`；若剪辑或速度不同，需要重新分析时间轴。需要完整无声检查版时，显式运行：

```sh
node export/export.mjs --layout-only --silent --width 1920 --height 1080 --fps 60 --cq 26 --out out/amadeus_layout_1080p60.mp4
```

两种导出都包含歌曲前五秒警告页。完整说明见 [主 README](../README.md#中文)。

## English

This repository contains **neither** the audio of Mili's "world.execute(me);" **nor** its lyrics. Bring both yourself and put
them into this folder (its name means "audio & lyrics"); git ignores everything here except this note.

| File | Default name (`config.json → paths`) | Notes |
| --- | --- | --- |
| Song | `Mili - world.execute (me) ;.wav` | If your file has another name, change `config.json → paths.audio`. The film was made with a 44.1 kHz wav; if your version has a different amount of silence at the start, shift everything with `config.json → timing.offset`. |
| Lyrics | `Mili - world.execute (me) ;.lrc` | An LRC with any timing, or plain text without time tags. If this folder holds exactly one `.lrc` / `.txt`, its name does not matter. |

The lyric file only has to carry the same words in the same order. Its own time tags and line breaks are not used:
`tools/fill_lyrics.mjs` puts your words into the timing table of the repository (`data/lyric_timing.json`) and writes
`data/lyrics.json`, which stays on your machine. The preview, the exporter and the storyboard do this by themselves; to see the result on its own:

```bash
npm run lyrics
```

It reports how many lines are identical to the text the film was made with, which lines were re-divided, and which rows of your
file are no line of the film (credits, translations) and were passed over. If lines of the film cannot be found in your file,
it lists their numbers and song times and stops.

The Amadeus version automatically uses a labeled `LAYOUT PREVIEW` when lyrics are missing and plays silently when audio is missing. `npm run preview:layout` selects this mode explicitly. Placeholder previews are for visual structure and pacing, not final lyric layout or audiovisual sync.

The normal `npm run export:preview` needs both audio and lyrics and writes `out/amadeus_1080p60.mp4`. Use the explicit `--layout-only --silent` command above to export a complete silent check as `out/amadeus_layout_1080p60.mp4`. Both include the five-second warning before the song. Adjust `timing.offset` for different leading silence; a different edit or speed needs a timing review. See the [main README](../README.md#english).
