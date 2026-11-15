# 项目音频与歌词 · Archived audio and lyrics

本分支按用户要求，将以下输入纳入Git保存；新检出无需另行寻找素材：

| 文件 | 用途 |
| --- | --- |
| `Mili - world.execute (me) ;.wav` | 44.1 kHz双声道float32音轨，从用户参考视频AAC解码并移除五秒片头。 |
| `Mili - world.execute (me) ;.lrc` | 恢复的歌词原稿。 |
| `../data/lyrics.json` | 129行正式歌词、精确分行及时间信息。 |

音乐与歌词属于Mili及相关权利人，不纳入项目代码的MIT许可。归档不改变原有来源与权利声明，详见 [来源记录](../CREDITS.md)。

`config.json → paths` 指定上述文件。`data/lyric_timing.json` 保留镜头使用的时间表、分行及校验值；LRC自身的时间标签不覆盖这份时间表。预览、导出与分镜工具会检查歌词，需要单独重新填充时运行：

```sh
npm run lyrics
npm run check:lyrics
```

`check:lyrics` 允许这三份归档输入，并检查其他文件是否意外包含歌词。新增音频与歌词仍默认忽略，只为上述文件设置例外。

正常预览使用真实歌词与音轨。若输入被移除，可恢复Git中的版本；`npm run preview:layout` 仍可显式打开带标记的占位模式。正式导出使用 `npm run export:final`，导出视频和中间结果位于被忽略的 `out/`，需单独保留或重新生成。详见 [主README](../README.md)。

## English

This branch archives the WAV audio, source LRC and `data/lyrics.json` (129 restored lines with exact timing) in Git at the user's request. A new checkout includes these inputs. Music and lyrics belong to Mili and their respective rights holders; they are not covered by the code's MIT license. See [credits](../CREDITS.md).

The WAV was decoded from the maker-supplied reference video's AAC audio, with its five-second preroll removed. `config.json → paths` selects the inputs. `npm run lyrics` fills the source words into the existing timing table; the LRC's own timestamps do not replace that table. `npm run check:lyrics` allows only the three approved archive inputs and checks other files for lyric text.

Rendered videos and intermediate outputs remain ignored under `out/`; preserve them separately or regenerate them with `npm run export:final`. Use `npm run preview:layout` for an explicit placeholder preview when inputs are unavailable.
