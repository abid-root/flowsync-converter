# FlowSync File Forge

A fresh frontend prototype for a professional file conversion website.

## What is included

- Clean converter layout inspired by professional converter tools, but not a copy.
- Dark and light theme toggle.
- Smart service dropdown: Image, PDF, and Icon tools.
- Smart FROM / TO format picker.
- More Tools modal with popular conversions and category cards.
- Upload up to 10 files in the free version.
- Queue view after files are selected.
- Per-file options modal for image, PDF, and icon output settings.
- Static folders for generated SEO URLs, for example `/png-to-jpg/`.
- Browser-side image conversion for supported image, PDF, and ICO outputs.
- Sitemap and robots files for search indexing.

## Important note

This is the frontend and interaction structure. Supported image inputs can convert to image, PDF, and ICO outputs in the browser. Additional engines can be connected later.

Recommended backend direction:

- Image: browser Canvas APIs, Sharp, or Squoosh-style encoders.
- PDF tools: PDF.js, pdf-lib, Poppler, or backend services depending on the feature.
- Icon tools: browser ICO packaging for simple favicons, or backend services for advanced icon sets.

## Folder structure

```txt
assets/
  css/
    reset.css
    theme.css
    layout.css
    converter.css
    overlays.css
    responsive.css
    main.css
  js/
    data.js
    router.js
    upload.js
    ui.js
    app.js
index.html
png-to-webp/index.html
image-converter/index.html
...
```

## How to preview locally

Use a local server so JavaScript modules load correctly:

```bash
python -m http.server 8080
```

Then open:

```txt
http://localhost:8080/png-to-webp/
```
