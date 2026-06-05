import { categories, categoryDefaults, conversions, formats } from './data.js';
import { canConvertInBrowser, conversionUnavailableMessage, convertImageItem } from './convert.js';
import { initialStateFromPath, updateBrowserUrl, updateMeta } from './router.js';
import { createQueueItems } from './upload.js';
import {
  renderFormatInfo,
  renderFormatPicker,
  renderHero,
  renderOptionsModal,
  renderQueue,
  renderServiceMenu,
  renderToolsModal,
  renderToolsPreview
} from './ui.js';

const state = {
  ...initialStateFromPath(),
  queue: [],
  picker: {
    mode: 'from',
    search: '',
    activeCategory: null
  },
  activeOptionsId: null
};

const $ = selector => document.querySelector(selector);
const elements = {
  app: document.body,
  themeToggle: $('#themeToggle'),
  serviceButton: $('#serviceButton'),
  serviceCurrent: $('#serviceCurrent'),
  serviceMenu: $('#serviceMenu'),
  kicker: $('#pageKicker'),
  title: $('#pageTitle'),
  description: $('#pageDescription'),
  fromCard: $('#fromCard'),
  toCard: $('#toCard'),
  swapButton: $('#swapButton'),
  uploadPanel: $('#uploadPanel'),
  queuePanel: $('#queuePanel'),
  queueList: $('#queueList'),
  queueSummary: $('#queueSummary'),
  fileInput: $('#fileInput'),
  chooseFileButton: $('#chooseFileButton'),
  addFileButton: $('#addFileButton'),
  clearQueueButton: $('#clearQueueButton'),
  convertButton: $('#convertButton'),
  formatInfo: $('#formatInfo'),
  toolsPreview: $('#toolsPreview'),
  uploadMenuButton: $('#uploadMenuButton'),
  uploadMenu: $('#uploadMenu'),

  pickerBackdrop: $('#pickerBackdrop'),
  picker: $('#formatPicker'),
  pickerTitle: $('#pickerTitle'),
  pickerSubtitle: $('#pickerSubtitle'),
  pickerSearch: $('#pickerSearch'),
  pickerCategories: $('#pickerCategories'),
  pickerFormats: $('#pickerFormats'),
  closePicker: $('#closePicker'),

  optionsBackdrop: $('#optionsBackdrop'),
  optionsModal: $('#optionsModal'),
  optionsTitle: $('#optionsTitle'),
  optionsForm: $('#optionsForm'),
  optionsBody: $('#optionsBody'),
  optionsSave: $('#optionsSave'),
  closeOptions: $('#closeOptions'),

  toolsBackdrop: $('#toolsBackdrop'),
  toolsModal: $('#toolsModal'),
  toolsModalBody: $('#toolsModalBody'),
  openToolsButtons: document.querySelectorAll('[data-open-tools]'),
  closeTools: $('#closeTools')
};


let savedScrollY = 0;

function secondaryScreenOpen() {
  return [
    elements.picker,
    elements.optionsModal,
    elements.toolsModal
  ].some(screen => screen && screen.hidden === false);
}

function lockSecondaryScreenScroll() {
  if (document.body.classList.contains('secondary-screen-locked')) return;

  savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.dataset.lockScrollY = String(savedScrollY);
  document.body.classList.add('secondary-screen-locked');

  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockSecondaryScreenScroll() {
  window.setTimeout(() => {
    if (secondaryScreenOpen()) return;

    const y = Number(document.body.dataset.lockScrollY || savedScrollY || 0);

    document.body.classList.remove('secondary-screen-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    window.scrollTo(0, y);
  }, 0);
}

function init() {
  const savedTheme = localStorage.getItem('flowsync-theme');
  document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';
  bindEvents();
  renderAll(true);
  if (window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').pop() === 'tools') {
    setTimeout(openTools, 150);
  }
}


function bindEvents() {
  elements.themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('flowsync-theme', html.dataset.theme || 'dark');
  });

  elements.serviceButton.addEventListener('click', () => {
    elements.serviceMenu.hidden = !elements.serviceMenu.hidden;
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.service-switcher')) elements.serviceMenu.hidden = true;
    if (!event.target.closest('.upload-split')) elements.uploadMenu.hidden = true;
  });

  elements.fromCard.addEventListener('click', () => openPicker('from'));
  elements.toCard.addEventListener('click', () => openPicker('to'));
  elements.swapButton.addEventListener('click', swapFormats);

  elements.chooseFileButton.addEventListener('click', () => elements.fileInput.click());
  elements.addFileButton.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', event => handleFiles(event.target.files));

  elements.uploadPanel.addEventListener('dragover', event => {
    event.preventDefault();
    elements.uploadPanel.classList.add('dragging');
  });
  elements.uploadPanel.addEventListener('dragleave', () => elements.uploadPanel.classList.remove('dragging'));
  elements.uploadPanel.addEventListener('drop', event => {
    event.preventDefault();
    elements.uploadPanel.classList.remove('dragging');
    handleFiles(event.dataTransfer.files);
  });

  elements.uploadMenuButton.addEventListener('click', event => {
    event.stopPropagation();
    elements.uploadMenu.hidden = !elements.uploadMenu.hidden;
  });
  elements.uploadMenu.querySelectorAll('[data-upload-option]').forEach(button => {
    button.addEventListener('click', () => {
      const option = button.dataset.uploadOption;
      elements.uploadMenu.hidden = true;
      if (option === 'computer') elements.fileInput.click();
      else alert(`${button.textContent.trim()} can be connected later with an API integration.`);
    });
  });

  elements.clearQueueButton.addEventListener('click', () => {
    state.queue = [];
    elements.fileInput.value = '';
    renderAll();
  });

  elements.convertButton.addEventListener('click', convertOrDownload);

  elements.closePicker.addEventListener('click', closePicker);
  elements.pickerBackdrop.addEventListener('click', closePicker);
  elements.pickerSearch.addEventListener('input', () => {
    state.picker.search = elements.pickerSearch.value;
    renderPicker();
  });

  elements.closeOptions.addEventListener('click', closeOptions);
  elements.optionsBackdrop.addEventListener('click', closeOptions);
  elements.optionsForm.addEventListener('submit', event => event.preventDefault());

  elements.openToolsButtons.forEach(button => button.addEventListener('click', openTools));
  elements.closeTools.addEventListener('click', closeTools);
  elements.toolsBackdrop.addEventListener('click', closeTools);

  window.addEventListener('popstate', () => {
    Object.assign(state, initialStateFromPath());
    renderAll(true);
  });
}

function renderAll(replaceUrl = false) {
  normalizeState();
  renderHero(state, elements);
  renderServiceMenu(state, elements, setCategory);
  renderFormatInfo(state, elements);
  renderToolsPreview(elements);
  renderQueue(state.queue, state, elements, {
    output: updateQueueOutput,
    options: openOptions,
    remove: removeQueueItem
  });
  bindPreviewTools();
  updateMeta(state.from, state.to);
  updateBrowserUrl(state.from, state.to, replaceUrl);
}

function normalizeState() {
  if (!formats[state.from]) {
    [state.from, state.to] = categoryDefaults.image;
    state.category = 'image';
  }
  const currentCategory = formats[state.from].category;
  state.category = currentCategory === 'document' && state.from === 'pdf' ? 'pdf' : currentCategory;
  const allowed = conversions[state.from] || [];
  if (!allowed.includes(state.to)) state.to = allowed[0] || state.to;
}

function setCategory(category) {
  const pair = categoryDefaults[category] || categoryDefaults.image;
  state.category = category;
  state.from = pair[0];
  state.to = conversions[state.from]?.includes(pair[1])
    ? pair[1]
    : (conversions[state.from]?.[0] || pair[1]);

  elements.serviceMenu.hidden = true;
  syncQueueWithCurrentFormats();
  renderAll();
}

function setFormats(from, to) {
  state.from = from;
  state.to = conversions[from]?.includes(to)
    ? to
    : (conversions[from]?.[0] || to || state.to);

  syncQueueWithCurrentFormats();
  renderAll();
}

function swapFormats() {
  if (conversions[state.to]?.includes(state.from)) {
    const nextFrom = state.to;
    const nextTo = state.from;

    state.from = nextFrom;
    state.to = nextTo;
  } else {
    state.to = conversions[state.from]?.[0] || state.to;
  }

  syncQueueWithCurrentFormats();
  renderAll();
}

function openPicker(mode) {
  state.picker.mode = mode;
  state.picker.search = '';
  state.picker.activeCategory = state.category;
  elements.pickerSearch.value = '';
  elements.picker.hidden = false;
  elements.pickerBackdrop.hidden = false;
  lockSecondaryScreenScroll();
  renderPicker();
  setTimeout(() => elements.pickerSearch.focus(), 60);
}

function closePicker() {
  elements.picker.hidden = true;
  elements.pickerBackdrop.hidden = true;
  unlockSecondaryScreenScroll();
}

function renderPicker() {
  renderFormatPicker({ mode: state.picker.mode, state, search: state.picker.search, activeCategory: state.picker.activeCategory }, elements, {
    category: category => {
      state.picker.activeCategory = category;
      renderPicker();
    },
    select: format => {
      if (state.picker.mode === 'from') {
        state.from = format;
        state.to = conversions[format]?.includes(state.to)
          ? state.to
          : (conversions[format]?.[0] || state.to);

        syncQueueWithCurrentFormats();
      } else {
        state.to = format;
        syncQueueOutputWithCurrentTo();
      }

      closePicker();
      renderAll();
    }
  });
}

function syncQueueWithCurrentFormats() {
  if (!state.queue.length) return;

  state.queue.forEach(item => {
    revokeItemDownload(item);

    item.from = state.from;
    item.to = conversions[state.from]?.includes(state.to)
      ? state.to
      : (conversions[state.from]?.[0] || state.to);

    item.status = 'ready';
    item.progress = 0;
    item.error = '';
  });
}

function syncQueueOutputWithCurrentTo() {
  if (!state.queue.length) return;

  state.queue.forEach(item => {
    revokeItemDownload(item);

    item.to = conversions[item.from]?.includes(state.to)
      ? state.to
      : (conversions[item.from]?.[0] || item.to);

    item.status = 'ready';
    item.progress = 0;
    item.error = '';
  });
}

function handleFiles(fileList) {
  if (!fileList || !fileList.length) return;
  const remaining = Math.max(0, 10 - state.queue.length);
  if (!remaining) {
    alert('Free version supports up to 10 files per batch. Remove files or upgrade later.');
    return;
  }
  const incoming = Array.from(fileList).slice(0, remaining);
  if (fileList.length > remaining) {
    alert(`Free version supports up to 10 files per batch. Added ${remaining} file${remaining === 1 ? '' : 's'}.`);
  }
  const items = createQueueItems(incoming, state);
  if (items.length) {
    const first = items[0];
    if (formats[first.from]) {
      state.from = first.from;
      state.to = conversions[first.from]?.includes(state.to) ? state.to : (conversions[first.from]?.[0] || state.to);
    }
  }
  state.queue = [...state.queue, ...items].slice(0, 10);
  elements.fileInput.value = '';
  renderAll();
}

function updateQueueOutput(id, output) {
  const item = state.queue.find(entry => entry.id === id);
  if (!item) return;
  revokeItemDownload(item);
  item.to = output;
  item.status = 'ready';
  item.progress = 0;
  item.error = '';
  renderAll(true);
}

function removeQueueItem(id) {
  state.queue.filter(item => item.id === id).forEach(revokeItemDownload);
  state.queue = state.queue.filter(item => item.id !== id);
  renderAll(true);
}

function openOptions(id) {
  const item = state.queue.find(entry => entry.id === id);
  if (!item) return;
  state.activeOptionsId = id;
  lockSecondaryScreenScroll();
  renderOptionsModal(item, elements, data => {
    item.settings = data;
    closeOptions();
    renderAll(true);
  });
}

function closeOptions() {
  elements.optionsModal.hidden = true;
  elements.optionsBackdrop.hidden = true;
  state.activeOptionsId = null;
  unlockSecondaryScreenScroll();
}

async function convertOrDownload() {
  if (!state.queue.length) return;

  const hasDownload = state.queue.some(item => item.status === 'converted' && item.downloadUrl);
  const hasPending = state.queue.some(item => !['converted', 'error'].includes(item.status));

  if (hasDownload && !hasPending) {
    downloadConvertedFiles();
    return;
  }

  state.queue.forEach(item => {
    if (item.status === 'converted' && item.downloadUrl) return;
    revokeItemDownload(item);
    item.status = 'converting';
    item.progress = 0;
    item.error = '';
  });
  renderAll(true);

  for (const item of state.queue) {
    if (item.status === 'converted' && item.downloadUrl) continue;

    if (!canConvertInBrowser(item)) {
      item.status = 'error';
      item.progress = 0;
      item.error = conversionUnavailableMessage(item);
      renderAll(true);
      continue;
    }

    try {
      item.progress = 35;
      renderAll(true);
      const result = await convertImageItem(item);
      item.downloadUrl = URL.createObjectURL(result.blob);
      item.downloadName = result.name;
      item.status = 'converted';
      item.progress = 100;
      item.error = '';
    } catch (error) {
      item.status = 'error';
      item.progress = 0;
      item.error = error instanceof Error ? error.message : 'Conversion failed in this browser.';
    }
    renderAll(true);
  }
}

function downloadConvertedFiles() {
  state.queue
    .filter(item => item.status === 'converted' && item.downloadUrl)
    .forEach(item => downloadUrl(item.downloadUrl, item.downloadName || item.name));
}

function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function revokeItemDownload(item) {
  if (item.downloadUrl) URL.revokeObjectURL(item.downloadUrl);
  item.downloadUrl = '';
  item.downloadName = '';
}

function openTools() {
  lockSecondaryScreenScroll();
  renderToolsModal(elements, (from, to) => {
    closeTools();
    setFormats(from, to);
  }, category => {
    closeTools();
    setCategory(category);
  });
}

function closeTools() {
  elements.toolsModal.hidden = true;
  elements.toolsBackdrop.hidden = true;
  unlockSecondaryScreenScroll();
}

function bindPreviewTools() {
  document.querySelectorAll('.mini-tool[data-category]').forEach(button => {
    button.onclick = () => setCategory(button.dataset.category);
  });
}

init();


/* Click empty upload area to choose files start */
function setupWholeDropBoxClick() {
  const uploadPanel =
    document.getElementById('uploadPanel') ||
    document.querySelector('.upload-panel') ||
    document.querySelector('.drop-zone') ||
    document.querySelector('.upload-box') ||
    document.querySelector('.upload-zone');

  if (!uploadPanel) return;

  const fileInput =
    document.getElementById('fileInput') ||
    document.querySelector('input[type="file"]');

  if (!fileInput) return;

  uploadPanel.addEventListener('click', event => {
    const ignored = event.target.closest(
      'button, a, input, select, textarea, label, .upload-menu, .upload-menu *'
    );

    if (ignored) return;

    fileInput.click();
  });

  uploadPanel.addEventListener('dragover', event => {
    event.preventDefault();
    uploadPanel.classList.add('is-dragging');
  });

  uploadPanel.addEventListener('dragleave', () => {
    uploadPanel.classList.remove('is-dragging');
  });

  uploadPanel.addEventListener('drop', () => {
    uploadPanel.classList.remove('is-dragging');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupWholeDropBoxClick);
} else {
  setupWholeDropBoxClick();
}
/* Click empty upload area to choose files end */

/* Queue see more controller start */
function setupQueueSeeMore() {
  const panel = document.getElementById('queuePanel');
  if (!panel) return;

  const list = panel.querySelector('.queue-list');
  const actions = panel.querySelector('.queue-actions');
  if (!list || !actions) return;

  function refreshQueueLimit() {
    const rows = Array.from(list.querySelectorAll('.queue-row'));
    const total = rows.length;

    panel.classList.toggle('queue-has-more', total > 3);

    let button = document.getElementById('seeMoreQueueButton');

    if (total <= 3) {
      panel.classList.remove('queue-expanded');
      if (button) button.remove();
      return;
    }

    if (!button) {
      button = document.createElement('button');
      button.id = 'seeMoreQueueButton';
      button.className = 'line-button queue-see-more';
      button.type = 'button';

      const firstChild = actions.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        actions.insertBefore(button, firstChild.nextSibling);
      } else {
        actions.prepend(button);
      }

      button.addEventListener('click', () => {
        panel.classList.toggle('queue-expanded');
        refreshQueueLimit();
      });
    }

    const expanded = panel.classList.contains('queue-expanded');
    button.textContent = expanded ? 'Show less' : `See more (${total - 3})`;
    button.setAttribute('aria-expanded', String(expanded));
  }

  const observer = new MutationObserver(refreshQueueLimit);
  observer.observe(list, { childList: true });

  refreshQueueLimit();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupQueueSeeMore);
} else {
  setupQueueSeeMore();
}
/* Queue see more controller end */

/* Safe upload dropdown direction start */
function setupUploadDropdownDirection() {
  const button =
    document.getElementById('uploadMenuButton') ||
    document.querySelector('.upload-menu-button');

  const menu =
    document.getElementById('uploadMenu') ||
    document.querySelector('.upload-menu');

  if (!button || !menu) return;

  const holder = button.closest('.upload-split') || menu.parentElement;
  if (!holder) return;

  function updateDirection() {
    const isOpen = !menu.hidden && getComputedStyle(menu).display !== 'none';
    if (!isOpen) return;

    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Open upward only when there is clearly not enough room below.
    const shouldDropUp = spaceBelow < 260 && spaceAbove > spaceBelow;

    holder.classList.toggle('drop-up', shouldDropUp);
    holder.classList.toggle('drop-down', !shouldDropUp);
  }

  button.addEventListener('click', () => {
    window.setTimeout(updateDirection, 0);
  });

  window.addEventListener('scroll', updateDirection, { passive: true });
  window.addEventListener('resize', updateDirection);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupUploadDropdownDirection);
} else {
  setupUploadDropdownDirection();
}
/* Safe upload dropdown direction end */

/* Final format picker state sync start */
(function setupFinalFormatPickerStateSync() {
  if (window.__flowSyncFinalFormatPickerStateSync) return;
  window.__flowSyncFinalFormatPickerStateSync = true;

  const browserReadyImageOutputs = {
    png: ['webp', 'jpg'],
    jpg: ['webp', 'png'],
    jpeg: ['webp', 'png'],
    webp: ['png', 'jpg']
  };

  function categoryForFormat(format) {
    const item = formats[format];
    if (!item) return state.category;
    if (item.category === 'pdf') return 'pdf';
    return item.category;
  }

  function allowedOutputsFor(format) {
    return browserReadyImageOutputs[format] || conversions[format] || [];
  }

  function resetQueueItem(item) {
    revokeItemDownload(item);
    item.status = 'ready';
    item.progress = 0;
    item.error = '';
  }

  function syncQueueFormatsToCurrent() {
    if (!state.queue.length) return;

    state.queue.forEach(item => {
      item.from = state.from;
      item.to = allowedOutputsFor(state.from).includes(state.to)
        ? state.to
        : (allowedOutputsFor(state.from)[0] || state.to);

      resetQueueItem(item);
    });
  }

  function syncQueueOutputToCurrent() {
    if (!state.queue.length) return;

    state.queue.forEach(item => {
      item.to = allowedOutputsFor(item.from).includes(state.to)
        ? state.to
        : (allowedOutputsFor(item.from)[0] || item.to);

      resetQueueItem(item);
    });
  }

  function applyFormatSelection(format) {
    if (!formats[format]) return;

    if (state.picker.mode === 'from') {
      state.from = format;
      state.category = categoryForFormat(format);

      const allowed = allowedOutputsFor(format);
      state.to = allowed.includes(state.to)
        ? state.to
        : (allowed[0] || state.to);

      syncQueueFormatsToCurrent();
    } else {
      const allowed = allowedOutputsFor(state.from);
      if (!allowed.includes(format)) return;

      state.to = format;
      syncQueueOutputToCurrent();
    }

    closePicker();
    renderAll(true);
  }

  elements.pickerFormats.addEventListener('click', event => {
    const button = event.target.closest('[data-format]');
    if (!button || !elements.pickerFormats.contains(button)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    applyFormatSelection(button.dataset.format);
  }, true);
})();
/* Final format picker state sync end */


