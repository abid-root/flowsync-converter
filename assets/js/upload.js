import { conversions, formats } from './data.js';

export function bytesToSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${sizes[index]}`;
}

export function extensionOf(filename = '') {
  return filename.split('.').pop().toLowerCase().trim();
}

export function detectFormat(file) {
  const ext = extensionOf(file.name);
  if (formats[ext]) return ext;
  const mime = file.type;
  const found = Object.entries(formats).find(([, item]) => item.mime === mime);
  return found ? found[0] : 'file';
}

export function fileCategory(format) {
  return formats[format]?.category || 'unknown';
}

export function createQueueItems(fileList, state) {
  const files = Array.from(fileList).slice(0, 10);

  return files
    .map((file, index) => {
      const detected = detectFormat(file);

      if (!isSupportedInputFormat(detected)) {
        return null;
      }

      const actualFrom = detected;
      const output = chooseValidOutput(actualFrom, state.to);

      return {
        id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
        file,
        name: file.name,
        size: file.size,

        // actualFrom is the truth. It comes from uploaded file.
        actualFrom,
        from: actualFrom,

        to: output,
        status: 'ready',
        progress: 0,
        error: '',
        settings: {},
        downloadUrl: '',
        downloadName: ''
      };
    })
    .filter(Boolean);
}

export function isSupportedInputFormat(format) {
  return Boolean(
    format &&
    format !== 'file' &&
    formats[format] &&
    Array.isArray(conversions[format]) &&
    conversions[format].length
  );
}
function chooseValidOutput(from, preferredTo) {
  const allowed = (conversions[from] || []).filter(output => output !== from);

  if (allowed.includes(preferredTo)) return preferredTo;

  return allowed[0] || preferredTo;
}


