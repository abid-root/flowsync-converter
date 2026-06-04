# FlowSync File Forge

A fresh frontend prototype for a professional file conversion website.

## What is included

- Clean converter layout inspired by professional converter tools, but not a copy.
- Dark and light theme toggle.
- Smart service dropdown: Images, Video, Audio, PDF, Documents, Presentations.
- Smart FROM / TO format picker.
- More Tools modal with popular conversions and category cards.
- Upload up to 10 files in the free version.
- Queue view after files are selected.
- Per-file options modal for image/video/audio/PDF/document/presentation settings.
- Clean static folders for SEO-style URLs, for example `/png-to-webp/`.

## Important note

This is the frontend and interaction structure. The real conversion engine still needs to be connected.

Recommended backend direction:

- Image: browser Canvas APIs, Sharp, or Squoosh-style encoders.
- Video and audio: FFmpeg backend or FFmpeg WASM for limited browser use.
- Documents and presentations: LibreOffice/headless conversion or a document conversion API.
- PDF tools: PDF.js, pdf-lib, Poppler, or backend services depending on the feature.

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
