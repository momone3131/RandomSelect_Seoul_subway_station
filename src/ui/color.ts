export function readableInk(hex: string): '#17271d' | '#ffffff' {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#ffffff';
  const channels = normalized.match(/../g)!.map((value) => {
    const c = Number.parseInt(value, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
  return (luminance + 0.05) / 0.05 > 1.05 / (luminance + 0.05) ? '#17271d' : '#ffffff';
}
