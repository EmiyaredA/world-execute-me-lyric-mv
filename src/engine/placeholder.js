// Layout-only text derived from timing metadata. Never stored as real lyrics.
// The letter cues remain inspectable, but this data cannot validate vocal sync.
export function layoutLyrics(timing) {
  const letters = { 57: ['F', 'M'], 59: ['AM', 'PM'], 61: ['S', 'M'] };
  return {
    placeholder: true,
    sections: timing.sections,
    lines: timing.lines.map((line, i) => {
      let text = line.emphasis ? 'PENDING09' : `ARCHIVE ${String(i).padStart(3, '0')} / TEXT PENDING`;
      if (letters[i]) text = `ARCHIVE ${letters[i][0]} FIELD ${letters[i][1]}`;
      const { words, letters: count, h, x, ...timed } = line;
      return { ...timed, text };
    }),
  };
}
