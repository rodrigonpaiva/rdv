import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const output = '/tmp/rdv-bk008-browser/evidence';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Users/rodrigopaiva/Library/Caches/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-mac-arm64/chrome-headless-shell', headless: true });
const page = await browser.newPage();
const errors = []; const requests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
const checks = [];
try {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto('http://127.0.0.1:3128/internal/design-system');
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      fontLoaded: Array.from(document.fonts).some(font => font.family === 'Inter' && font.status === 'loaded'),
      header: getComputedStyle(document.querySelector('header')).backgroundColor,
      base: getComputedStyle(document.documentElement).backgroundColor,
      sampleTitle: getComputedStyle(document.querySelector('.demo-sample-title')).color,
      samplePrice: getComputedStyle(document.querySelector('.demo-price')).color,
      panels: Array.from(document.querySelectorAll('.ds-panel')).map(panel => ({ border: getComputedStyle(panel).borderTopWidth, color: getComputedStyle(panel).borderTopColor, background: getComputedStyle(panel).backgroundColor })),
      fields: Array.from(document.querySelectorAll('.ds-control')).filter(field => field.getClientRects().length > 0).map(field => ({ font: getComputedStyle(field).fontSize, height: field.getBoundingClientRect().height })),
      buttons: Array.from(document.querySelectorAll('main button')).map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })),
    }));
    assert.ok(metrics.scrollWidth <= width);
    assert.equal(metrics.fontLoaded, true);
    assert.equal(metrics.header, 'rgb(32, 32, 32)'); assert.equal(metrics.base, 'rgb(255, 255, 255)');
    assert.equal(metrics.sampleTitle, 'rgb(78, 88, 96)'); assert.equal(metrics.samplePrice, 'rgb(78, 88, 96)');
    assert.ok(metrics.panels.every(panel => panel.border === '1px' && panel.color === 'rgb(217, 221, 225)' && ['rgb(247, 248, 249)', 'rgb(255, 255, 255)'].includes(panel.background)));
    assert.ok(metrics.fields.every(field => field.font === '16px' && field.height >= 44));
    assert.ok(metrics.buttons.every(button => button.width >= 44 && button.height >= 44));
    checks.push({ viewport: width, ...metrics });
    await page.screenshot({ path: `${output}/demo-${width}.png`, fullPage: true });
  }
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.ds-skip-link').evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  const loading = page.locator('main button').filter({ hasText: 'Preview loading' });
  await loading.focus();
  const before = await loading.boundingBox();
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('main button[aria-busy="true"]'), undefined, { timeout: 3000 });
  assert.equal(await loading.getAttribute('aria-busy'), 'true');
  const busy = await loading.boundingBox(); assert.equal(busy.width, before.width);
  await page.keyboard.press('Enter');
  await page.getByText('Loading preview finished. No operation was performed.', { exact: true }).waitFor();
  const name = page.getByRole('textbox', { name: 'Example name', exact: true });
  await name.fill('  '); await page.getByRole('button', { name: 'Validate example', exact: true }).click();
  assert.equal(await name.inputValue(), '  '); assert.equal(await name.getAttribute('aria-invalid'), 'true');
  const association = await name.getAttribute('aria-describedby');
  const errorText = await page.evaluate(ids => ids.split(' ').map(id => document.getElementById(id)?.textContent).join(' '), association);
  assert.ok(errorText.includes('Enter an example name to continue.'));
  await name.fill('Synthetic long example name for layout and keyboard verification only');
  await page.getByRole('button', { name: 'Validate example', exact: true }).click();
  assert.notEqual(await name.getAttribute('aria-invalid'), 'true');
  await page.getByRole('combobox', { name: 'Example preference', exact: true }).selectOption('morning');
  const checkbox = page.getByRole('checkbox');await checkbox.focus();await page.keyboard.press('Space');assert.equal(await checkbox.isChecked(), true);
  const trigger = page.getByRole('button', { name: 'Open dialog', exact: true });
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Review this example', exact: true }); await dialog.waitFor();
  assert.equal(await dialog.locator('h2').evaluate(element => element === document.activeElement), true);
  for (let index = 0; index < 16; index++) {
    await page.keyboard.press(index % 3 === 0 ? 'Shift+Tab' : 'Tab');
    assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true);
  }
  await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
  assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Enter'); await dialog.waitFor();
  const note = dialog.getByRole('textbox', { name: 'Optional example note' });await note.fill('Synthetic note retained after failure');
  await dialog.getByRole('button', { name: 'Preview error', exact: true }).click();
  await page.keyboard.press('Escape'); assert.equal(await dialog.isVisible(), true);
  await dialog.getByRole('alert').waitFor();assert.equal(await note.inputValue(), 'Synthetic note retained after failure');
  await page.setViewportSize({ width: 320, height: 740 });
  assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), true);
  await page.screenshot({ path: `${output}/dialog-error-320.png` });
  await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
  assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).colorScheme), 'light');
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(255, 255, 255)');
  // Increase the user's default text size: fields remain 16px, surrounding content reflows.
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: `${output}/text-resize-320.png`, fullPage: true });
  assert.equal(errors.length, 0, errors.join('\n'));
  assert.equal(requests.some(request => request.method !== 'GET'), false);
  assert.equal(requests.some(request => !request.url.startsWith('http://127.0.0.1:3128/')), false);
  await fs.writeFile(`${output}/review.json`, JSON.stringify({ browser: await browser.version(), viewports: checks, keyboard: { skipLink: true, loadingStableWidthAndGuard: true, associatedErrorAndPreservedInput: true, selectAndCheckbox: true, modalInitialFocus: true, nativeFocusContainment16Steps: true, escapeAndFocusReturn: true, busyEscapeBlocked: true, failureRetainsNote: true }, darkHostKeepsLightTheme: true, reducedMotionRequested: true, textResizeReflowAt320: true, pageErrors: errors, allRequestsLocalGet: true, passed: true }, null, 2)+'\n');
  console.log('Visual metrics at five widths, keyboard, errors/loading/dialog, local fonts, light theme and text resize passed.');
} finally { await browser.close(); }
