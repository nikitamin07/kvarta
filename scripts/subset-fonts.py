# нарезка шрифтов для next/font/local
# python scripts/subset-fonts.py <папка с ttf из google/fonts>
# нужны fonttools и brotli
import sys
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

# русский алфавит, ascii и знаки со страницы
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0x410, 0x450))
    + [0x401, 0x451, 0xA0, 0xAB, 0xB7, 0xBB, 0xD7]
    + [0x2013, 0x2014, 0x2026, 0x2116, 0x20BD, 0x2212]
)

FONTS = {
    "literata.woff2": ("Literata[opsz,wght].ttf", {"wght": (400, 600)}),
    "literata-italic.woff2": ("Literata-Italic[opsz,wght].ttf", {"wght": 400}),
    "commissioner.woff2": (
        "Commissioner[FLAR,VOLM,slnt,wght].ttf",
        {"wght": (400, 600), "slnt": 0, "FLAR": 0, "VOLM": 0},
    ),
    "caveat.woff2": ("Caveat[wght].ttf", {"wght": 500}),
}

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "src" / "assets" / "fonts"
out.mkdir(parents=True, exist_ok=True)

for name, (source, axes) in FONTS.items():
    buf = BytesIO()
    instantiateVariableFont(TTFont(src / source), axes).save(buf)
    font = TTFont(buf)
    options = subset.Options(flavor="woff2")
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(out / name)
    print(name, round((out / name).stat().st_size / 1024), "KB")
