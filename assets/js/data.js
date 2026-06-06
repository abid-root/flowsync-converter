export const categories = {
  image: {
    label: 'Image',
    route: 'image-converter',
    description: 'Convert common image files, resize them, and prepare clean outputs.',
    formats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'bmp']
  },

  pdf: {
    label: 'PDF',
    route: 'pdf-converter',
    description: 'Create PDF files from images with page size, margin, and orientation options.',
    formats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'bmp']
  },

  icon: {
    label: 'Icon',
    route: 'icon-converter',
    description: 'Create ICO and favicon-style files from images and convert icons back to images.',
    formats: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'bmp', 'ico']
  }
};

export const formats = {
  png: { label: 'PNG', category: 'image', mime: 'image/png', title: 'Portable Network Graphic', icon: 'image' },
  jpg: { label: 'JPG', category: 'image', mime: 'image/jpeg', title: 'JPEG Image', icon: 'image' },
  jpeg: { label: 'JPEG', category: 'image', mime: 'image/jpeg', title: 'JPEG Image', icon: 'image' },
  webp: { label: 'WEBP', category: 'image', mime: 'image/webp', title: 'Web Picture Format', icon: 'image' },
  avif: { label: 'AVIF', category: 'image', mime: 'image/avif', title: 'AV1 Image Format', icon: 'image' },
  gif: { label: 'GIF', category: 'image', mime: 'image/gif', title: 'GIF Snapshot', icon: 'image' },
  svg: { label: 'SVG', category: 'image', mime: 'image/svg+xml', title: 'Scalable Vector Graphic', icon: 'image' },
  bmp: { label: 'BMP', category: 'image', mime: 'image/bmp', title: 'Bitmap Image', icon: 'image' },

  pdf: { label: 'PDF', category: 'pdf', mime: 'application/pdf', title: 'Portable Document Format', icon: 'pdf' },

  ico: { label: 'ICO', category: 'icon', mime: 'image/x-icon', title: 'Icon File', icon: 'image' }
};

export const conversions = {
  png: ['webp', 'jpg', 'pdf', 'ico'],
  jpg: ['webp', 'png', 'pdf', 'ico'],
  jpeg: ['webp', 'png', 'pdf', 'ico'],
  webp: ['png', 'jpg', 'pdf', 'ico'],
  avif: ['png', 'jpg', 'webp', 'pdf', 'ico'],
  gif: ['png', 'jpg', 'webp', 'pdf', 'ico'],
  svg: ['png', 'jpg', 'webp', 'pdf', 'ico'],
  bmp: ['png', 'jpg', 'webp', 'pdf', 'ico'],

  ico: ['png', 'jpg', 'webp', 'pdf']
};

export const popularRoutes = [
  ['png', 'webp'],
  ['jpg', 'webp'],
  ['webp', 'png'],
  ['png', 'jpg'],
  ['jpg', 'png'],

  ['png', 'pdf'],
  ['jpg', 'pdf'],
  ['webp', 'pdf'],

  ['png', 'ico'],
  ['svg', 'ico'],
  ['ico', 'png']
];

export const categoryDefaults = {
  image: ['png', 'webp'],
  pdf: ['png', 'pdf'],
  icon: ['png', 'ico']
};

export const formatNotes = {
  png: 'A lossless image format commonly used for transparent graphics, UI images, and screenshots.',
  jpg: 'A popular photo format with small file size and broad compatibility across devices and browsers.',
  jpeg: 'A popular photo format with small file size and broad compatibility across devices and browsers.',
  webp: 'A modern image format designed for smaller web images with strong compression and good quality.',
  avif: 'A modern image format for strong compression. Browser support can vary by device.',
  gif: 'GIF conversion currently uses a still snapshot / first frame only.',
  svg: 'A vector image format commonly used for logos, icons, and web graphics.',
  bmp: 'An older bitmap image format that can be converted into modern image outputs.',
  pdf: 'A portable document format used for sharing pages, scans, forms, and printable documents.',
  ico: 'An icon format commonly used for website favicons and desktop-style icons.'
};


