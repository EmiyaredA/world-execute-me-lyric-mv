# SenseTime v6 制作与验证记录

2026-10-12。由 Amadeus `05cd54a` 派生至 `sensetime` 分支。用户参考图仅用于角色造型；保留原有 87 个镜头、129 行提示和五秒片头。

## 角色与发饰

七张透明角色素材采用羊毛白、灰褐、深棕主体墨版。按用户补充要求，所有最终生成图都包含额发右上侧的红金无限符号发饰；猫耳装饰不替换羊耳和发饰。提示词、参考及修复记录见 `assets/sensetime/`。

角色发饰在加载时提取红金专色，并独立追踪为矢量路径。渲染与羊毛墨版共享偏移、显现、裁切和镜像；灰阶、淡出和暗色校样也跟随当前画面状态。界面标志使用填充飘带 SVG，保留原标志开口卷曲端部、变化带宽与红金渐变；完整和小尺寸版本与 Canvas 共用路径，小尺寸只减少阴影层。矢量参考来自 CompaniesLogo，已与 SenseTime 官网 PNG 对照，不宣称是官方 SVG；来源记录见 `assets/sensetime/logo-sources.json`。十二段外环保留加载、思考与转场行为，中心标志保持直立。

按用户提供的小浣熊页面配色参考，普通编辑器改为白底、淡紫面板与紫色强调，错误与高潮段采用深紫对比。角色三墨版独立映射为羊毛白、淡紫阴影、深紫轮廓，红金发饰保持独立专色；离线与关机状态仍为灰阶。配色参考保存于 `assets/sensetime/palette-reference.png`。

紫白版本的首次全片预检在歌曲50.82秒附近达到每秒3.5次一般闪光。除降低浅色背景的扫描压暗幅度外，Vision 特写的点击摆动与晕眩摆动缩小至原幅度的20%，向日期行的平移提前至该段第12拍开始，仍在第15.8拍到达相同位置；最后几次开关点击仍可见，开关时刻、镜头切点和日期抓取时刻保留。修订段以1920×1080／60fps复测达到每秒3次一般闪光、0次红闪光，无单帧突跳；最终以完整新版MP4复测为准。

## 感知与连接

编辑器、侧栏、输入区、身份卡及封面显示 SenseTime。启动验证感知输入，Vision 开关控制输入信号，日期查询显示当前记录与五组历史图形记录；F／M 段在歌曲91.72秒切换到男版羊角色，92.65秒的下一镜头恢复原版女形象；后续镜头与封面持续使用女版。十二次执行呈现连接尝试，关机保存会话并卸载感知模块。原有代码球、歌词版式、高潮、错误及镜头节拍保留。

## 当前验证

- `npm run check:sensetime`：七张 PNG 均为 RGBA，透明通道范围为 0–255，主体包含实心墨版；发饰区域具有独立红金像素。区域边界、眼睛与掌心映射、87 个镜头／129 行覆盖、品牌及 JavaScript 语法检查通过。
- `npm run storyboard -- --layout-only`：镜头与节拍表保留，无缺失行、无后备镜头、无缺失描述。
- `npm run check:render`：330 个切点附近帧无异常；13 个时刻的直接跳转、顺序渲染和跨时间跳转哈希完全一致；56 项发饰检查覆盖七种角色的位图、矢量、镜像、裁切、灰阶及隐藏状态。十二条尝试路径互异且终点均为 NO REPLY；生成20张完整尺寸关键帧。9个实际渲染时刻确认男版仅出现在F→M镜头，92.65秒之后恢复女版。
- GPU Canvas 模式曾在执行段155.6秒出现29个像素、每像素最大一级RGB差异，与文本栅格缓存顺序相关。启用原有 `video.exactRaster` 后通过严格哈希检查；WebGL后期仍由Metal GPU执行。
- 横版封面1920×1080，竖版封面1080×1920；两者均重排取景以保留完整发饰，并使撕裂条带避开发饰和眼睛。
- `npm run check:layout`：直接检查最终MP4的编码、帧数、完整解码、闪光及亮度，抽取12张实际视频帧，并将文件SHA-256写入检查报告。闪光超限或出现单帧突跳时返回非零状态。

预览的自动占位、播放／暂停、拖动及键盘跳转通过，页面无异常。全片检查版采用原有导出器并行渲染三个连续、无重叠的帧区间，随后无损拼接H.264流；正式量测以最终拼接文件为准。
## 早期深色版无声交付（历史）

- `out/sensetime_layout_1080p60.mp4`：H.264／BT.709、yuv420p、1920×1080、60fps、13,017帧、216.95秒、33,014,303字节（33.0 MB）。无音轨；包含五秒片头和明确占位标记。`mv_start=-5.000000;layout_only=true`。容器检查通过，见 `out/sensetime_video_check.json`。
- 从最终MP4抽取8帧，实际确认SenseTime界面、发饰、猫耳装扮、女版F、男版M、下一镜头恢复女版、高潮与关机。联系表为 `out/sensetime_video_keyframes.png`，完整尺寸帧在 `out/sensetime_video_frames/`。
- 最终1080p视频闪光复测：18帧大面积亮度转换，最密集一秒一般闪光2.5次，饱和红闪光0次，无单帧突跳；原工程近似检查通过。报告 `out/check_flash_sensetime_layout.txt`。
- 全片亮度峰值位于歌曲177.500秒（成片182.500秒），平均亮度0.981；量测输出为 `out/luma_sensetime_layout.txt`。高潮保留脉冲、故障和白场，不宣称全程亮度单调递增。
- 封面：`out/sensetime_cover.png`（1920×1080）、`out/sensetime_cover_portrait.png`（1080×1920），副本保存于 `docs/images/`。
- 18个关键镜头：`out/sensetime_keyframes.png`；F→M及恢复女版的6帧检查图：`out/sensetime_gender.png`。角色原图及完整生成、修复提示词位于 `assets/sensetime/`，均使用内置image_gen。

以上数字属于首次深色版无声检查，不作为后续紫白有声成片的验收结果。

## 紫白版与真实歌词同步

2026-10-12 按用户补充要求，从 Amadeus `509caed` 的独立工作树同步本地 `data/lyrics.json`、LRC 与 WAV。三个文件的SHA-256与源文件一致，两个分支的 `data/lyric_timing.json` 逐字节相同；129行完整文字与词语校验值匹配，起止时间不变。同步记录保存于 `out/sensetime_lyric_sync.json`。

源音轨为用户参考视频AAC的float32解码WAV，44.1kHz双声道、211.957596秒。源WAV已移除参考视频五秒片头，导出时仅加入一次五秒警告与对应音频延迟。未重新分析节拍、拉伸音频或更改原有镜头网格。歌词、音源与含歌曲文件继续保留在Git忽略范围内。

- `npm run check:restored-lyrics`：129行完整文字与词语哈希、起止时间均匹配；无占位歌词；387个歌词附近帧无场景错误，正常音频预览通过。报告 `out/sensetime_lyrics_check.json`，逐行渲染图在 `out/lyrics_frames/`，联系表 `out/sensetime_all_lyrics_keyframes.png`。
- `npm run check:render:lyrics`：330个切点附近帧、13个严格跳转／顺序哈希、56项发饰检查、9个F／M范围抽查通过；十二条路径与原87镜头网格保留。报告 `out/sensetime_render_lyrics_check.json`，20个关键镜头联系表 `out/sensetime_keyframes.png`。
- `npm run lyrics`：129行与参考文字完全一致，保留已有本地歌词JSON；`npm run check:lyrics`：无歌词文本进入可提交文件。
- 有声版导出入口 `npm run export:final`；三个连续、无重叠帧区间采用CRF 16／fast渲染，再无损拼接H.264视频并封装AAC。输出 `out/sensetime_1080p60.mp4`。
- `npm run check:final`：最终文件编码／帧数／完整解码、一般及红色闪光、单帧突跳、亮度、音轨封装延迟检查；另从成片抽取12张关键帧和全部129行歌词对应帧。报告包含最终文件SHA-256。检查依赖NumPy、librosa和SciPy，通过 `MV_PYTHON` 选择环境。

### 首次有声交付与实测（记录内容修正前）

- `out/sensetime_1080p60.mp4`：1920×1080／60fps、13,017帧、216.95秒、271,073,540字节（271.1 MB），H.264 High／yuv420p与AAC／44.1kHz双声道；BT.709矩阵、原色与传递标签齐全，有限范围。元数据为 `mv_start=-5.000000`，没有占位标记。完整解码通过。SHA-256：`19ae96bf0f9b7257f0b8e0a6ae36a82c21ab58240cf823db6b8e3440a9c3dd34`。
- 最终一般闪光最高每秒3.0次（歌曲50.35秒附近），红色闪光0次，无单帧突跳；46帧大面积亮度转换、23次大幅帧变化，最密集一秒3次。通过原工程近似检查的阈值。报告 `out/check_flash_sensetime_final.txt`。
- 亮度峰值位于歌曲177.500秒（文件182.500秒），平均亮度0.992，属于原有白场；不宣称全片或高潮亮度单调递增。报告 `out/luma_sensetime_final.txt`。
- 音轨相对源WAV的封装偏移0.00 ms。以亮度峰值查找画面提示点得到首瞬态+33 ms、标题切点0 ms、下一提示点+100 ms；紫白版亮度变化与旧深色版不同，该图像统计不作为整体移动时间轴的依据。原镜头及129行时间表逐项一致。声乐频段逐行最近起音中位数−5 ms、四分位−54至+49 ms；全局统计峰−245 ms、z=2.1，包含伴奏和非歌词强拍，未据此自动改动同步。未将自动量测宣称为人工听感验收。报告 `out/check_sync_sensetime_final.txt`。
- 从最终MP4抽取12张关键帧和全部129行歌词对应帧，确认真实歌词、紫白界面、红金标志与发饰、猫耳装扮、男版M及下一镜头恢复女版。关键帧联系表 `out/sensetime_final_video_keyframes.png`；逐行联系表 `out/sensetime_final_all_lyrics_keyframes.png`，单帧目录 `out/sensetime_final_lyrics_frames/`。完整检查记录 `out/sensetime_final_video_check.json`。
- 横竖封面继续使用新版SVG标志和紫白配色；`out/sensetime_gender.png`已更新为真实歌词的F／M与女版恢复检查图。旧无声MP4仅保留为历史文件；记录内容修正后的当前成片见下节。

封装检查发现原分段流缺少原色及传递标签，已在拼接器中显式补齐H.264色彩元数据；最终文件通过无损重封装补齐，画面未重新编码。批量抽帧器采用平衡表达式，避免129项平铺表达式超过FFmpeg解析深度。

### 记录内容修正（移除结尾面板前）

按用户反馈，日期回拉段恢复原第四版的五组历史图形（塔楼、尖塔、柱廊、阶梯神庙、金字塔），分别放入 `HISTORICAL RECORD` 卡；当前羊角色卡标为 `CURRENT RECORD`。状态说明改为读取当前／历史记录，替代原先的 `NO RECORD` 空框。历史图形表示查询资料，当前角色卡表示会话观测；原有六次回拉、年代跨越、镜头和歌词时间保持一致。新增六个实际渲染时刻的回归检查，确认 RECORD 标签和五组内容均被绘制。

水果主体继续使用独立专色：茄子 `#7B52AB`、番茄 `#D4432F`；按用户最新说明，果蒂继续使用界面紫色，不引入橙色专色。检查图 `out/sensetime_corrections.png`。

当次有声成片为 `out/sensetime_1080p60.mp4`：1920×1080／60fps、13,017帧、216.95秒、271,165,162字节；SHA-256：`b849cea122e8f69ddadeffed997799ab7ba07d418e44ebad98d3fc906256b95c`。完整解码、BT.709标签、帧数、129行歌词抽帧检查通过。一般闪光46帧大面积转换、最密集一秒3.0次；红闪光0.0次，无单帧突跳；音轨封装偏移+0.00 ms。报告 `out/sensetime_final_video_check.json`。

此次仅重新渲染覆盖日期段的文件帧区间 `[3201,3857)`（歌曲48.35至59.283333秒），在原流关键帧处拼接，其他区间保留原H.264流；七个区间外边界／抽查帧解码哈希一致，AAC包逐字节一致。拼接验证 `out/sensetime_record_splice_check.json`，日期段实际成片抽帧 `out/sensetime_record_video_frame.png`。修正前文件保留为 `out/sensetime_before_record_fix_1080p60.mp4`。

### 移除结尾状态面板（开头与果萼修正前）

按用户框选范围，完整移除结尾右下角的会话状态面板，包括 `SESSION SAVED / CONNECTION CLOSED`、六位计数器、信号线和面板边框；不增加滚动动画。该面板在最后消息及身份参数镜头中的绘制调用均已删除。分镜文字同步更新，四张检查图为 `out/sensetime_shutdown_clean.png`，实际成片抽帧为 `out/sensetime_shutdown_clean_video_frame.png`。

当次 `out/sensetime_1080p60.mp4` 为1920×1080／60fps、13017帧、216.95秒、270752294字节；SHA-256：`520284a5fe2d61eb2481a58d1ed466a281bca45aedba658fa5021b8f62644ad5`。完整解码、色彩标签、全部129行歌词抽帧和原工程闪光检查通过；一般闪光最高每秒3.0次，红闪光0次，无单帧突跳；音轨偏移+0.00 ms。

仅重新渲染文件帧 `[11782,12505)`（歌曲191.366667至203.416667秒）并在关键帧处拼接。七个区间外抽查／边界帧解码哈希一致，AAC包完全相同；报告 `out/sensetime_shutdown_splice_check.json`。移除前文件保留为 `out/sensetime_before_shutdown_panel_removal.mp4`。渲染检查的330个提示点附近帧及13组严格跳转一致性检查通过，当前／历史记录卡检查继续通过。

### 当前交付：开头提示条与水果造型修正

移除正式画面开头0.9至6.5秒叠加的重复提示条，保留原有五秒独立提示页、倒计时及片尾来源信息。`overlayScene` 仅绘制片尾信息，删除失效的 `warningSeconds` 配置。

水果果萼原先使用品牌 `sparkOutline`，在SenseTime标志轮廓改成圆环后退化为圆块。现将七瓣果萼轮廓独立到 `objects.js` 的 `calyxOutline`，茄子和番茄各自保留原版的变形、茎、开切与给出状态；色彩按用户最新确认沿用视频风格：果萼紫色 `#8b5cdf`，茄子皮 `#7B52AB`，番茄皮 `#D4432F`。

两个168点果萼轮廓与原第四版 `2073b0c` 的原轮廓坐标完全一致（最大坐标误差0），报告 `out/sensetime_calyx_geometry_check.json`。新增几何回归检查，验证七个突出叶瓣及径向起伏，防止再变为品牌圆环。完整渲染检查继续通过。实际成片水果抽帧联系图为 `out/sensetime_fruit_final.png`，开头抽帧为 `out/sensetime_opening_fixed_video_frame.png`；全状态检查图为 `out/sensetime_opening_fruit_fix.png`。

当前成片 `out/sensetime_1080p60.mp4`：1920×1080／60fps、13017帧、216.95秒、270512391字节；SHA-256：`5269320ac280a9d48c69b4f22448fb42c8298d1e7c86f1d55c630a51298093f2`。完整解码、BT.709标签、129行歌词抽帧检查通过；一般闪光最高每秒3次、红闪光0次、无单帧突跳，音轨偏移+0.00 ms。

本次重新渲染文件帧 `[310,764)` 与 `[4752,5223)`，其余视频流保留；九个区间外边界／抽查帧解码哈希一致，AAC包完全相同。报告 `out/sensetime_opening_fruit_splice_check.json`。修正前文件保留为 `out/sensetime_before_opening_fruit_fix.mp4`。此前历史记录卡恢复及结尾状态面板移除均继续保留。
