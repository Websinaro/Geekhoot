# Custom watermark font (optional)

The invoice PDF's "GEEKHOOT" watermark uses a bundled fallback font
(Helvetica-Bold) by default — it works out of the box with no setup.

To make the watermark use the same font as the site's headings
(Space Grotesk, SIL Open Font License), drop a font file here named
one of:

- `watermark.ttf`
- `watermark.otf`
- `SpaceGrotesk-Bold.ttf`

The invoice generator (`backend/services/invoice.service.ts`) checks
for these automatically and switches to whichever one it finds — no
code changes needed.

Where to get it (free, same license the site already uses):
- Google Fonts: https://fonts.google.com/specimen/Space+Grotesk → Download family → use the **Bold** `.ttf` from the `static/` folder.
- Or the type designer's own repo: https://github.com/floriankarsten/space-grotesk (see `fonts/ttf/static/SpaceGrotesk-Bold.ttf`).

Note: only `.ttf`/`.otf` work here — `.woff`/`.woff2` (the web-optimized
formats used on the site itself) aren't supported by the PDF engine.
