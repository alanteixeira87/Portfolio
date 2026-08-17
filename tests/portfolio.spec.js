const { test, expect } = require('@playwright/test');

const pages = ['index.html', 'Projetos.html', 'qa-automation-suite.html', 'paketa.html'];

for (const path of pages) {
  test(`${path} carrega sem erros`, async ({ page }) => {
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(`http://127.0.0.1:4173/${path}`);
    expect(response.ok()).toBeTruthy();
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('explorador alterna, expande detalhes e controla o lightbox', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/qa-automation-suite.html');
  const explorer = page.locator('[data-image-explorer]').first();
  const anatomy = explorer.getByRole('button', { name: 'Anatomia da solução' });
  await expect(anatomy).toBeVisible();
  await anatomy.click();
  await expect(anatomy).toHaveAttribute('aria-pressed', 'true');
  await expect(explorer.locator('.explorer-image')).toHaveAttribute('src', /anatomia/);
  await explorer.getByRole('button', { name: 'Explorar os 14 pontos' }).click();
  await expect(explorer.locator('.decision-groups')).toBeVisible();
  await explorer.getByRole('button', { name: /Ampliar/ }).click();
  await expect(page.locator('#image-lightbox')).toBeVisible();
  await expect(page.locator('#image-lightbox img')).toHaveAttribute('src', /anatomia/);
  const hotspot = page.locator('#image-lightbox .anatomy-hotspot').first();
  await expect(hotspot).toBeVisible();
  await hotspot.focus();
  await expect(hotspot.locator('.hotspot-tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-lightbox')).not.toBeVisible();
  await expect(explorer.getByRole('button', { name: /Ampliar/ })).toBeFocused();
});

test('menu mobile funciona a 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('http://127.0.0.1:4173/index.html');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#nav')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

for (const path of pages) {
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    test(`${path} não cria overflow a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://127.0.0.1:4173/${path}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    });
  }
}

test('imagem de anatomia ausente mantém fallback funcional', async ({ page }) => {
  await page.route(/anatomia/, route => route.abort());
  await page.goto('http://127.0.0.1:4173/qa-automation-suite.html');
  const explorer = page.locator('[data-image-explorer]').first();
  await expect(explorer.getByRole('button', { name: 'Anatomia da solução' })).toBeHidden();
  await expect(explorer.locator('.explorer-image')).toHaveAttribute('src', /Gerador%20de%20payload\.png/);
});

for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  test(`case Paketá permanece organizado a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173/paketa.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'O que o QA consegue realizar com a suíte.' })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect(page.locator('.paketa-device')).toBeVisible();
  });
}

test('todas as evidências visuais do case Paketá carregam ao entrar na viewport', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/paketa.html');
  const images = page.locator('main img');
  for (let index = 0; index < await images.count(); index++) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBeTruthy();
  }
});

test('explorador percorre as seis etapas reais da jornada Paketá', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/paketa.html');
  const explorer = page.locator('[data-journey-explorer]');
  const tabs = explorer.getByRole('tab');
  await expect(tabs).toHaveCount(6);
  for (let index = 0; index < 6; index++) {
    await tabs.nth(index).click();
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
    await expect(explorer.locator('.journey-step')).toContainText(`0${index + 1} de 06`);
    await expect.poll(() => explorer.locator('.journey-stage img').evaluate(image => image.complete && image.naturalWidth > 0)).toBeTruthy();
  }
  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
});

for (const width of [1024, 1440, 1920]) {
  test(`interface e anatomia permanecem centralizadas a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173/qa-automation-suite.html');
    for (const explorer of await page.locator('[data-image-explorer]').all()) {
      const frame = explorer.locator('.explorer-frame');
      const image = explorer.locator('.explorer-image');
      const assertCentered = async () => {
        const [frameBox, imageBox] = await Promise.all([frame.boundingBox(), image.boundingBox()]);
        const frameCenter = frameBox.x + frameBox.width / 2;
        const imageCenter = imageBox.x + imageBox.width / 2;
        expect(Math.abs(frameCenter - imageCenter)).toBeLessThanOrEqual(1);
      };
      await assertCentered();
      const anatomy = explorer.getByRole('button', { name: 'Anatomia da solução' });
      await anatomy.click();
      await expect(anatomy).toHaveAttribute('aria-pressed', 'true');
      await assertCentered();
    }
  });
}

for (const width of [1024, 1440]) {
  test(`todos os hotspots e tooltips ficam organizados no lightbox a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173/qa-automation-suite.html');
    const explorers = page.locator('[data-image-explorer]');
    for (let moduleIndex = 0; moduleIndex < await explorers.count(); moduleIndex++) {
      const explorer = explorers.nth(moduleIndex);
      await explorer.getByRole('button', { name: 'Anatomia da solução' }).click();
      await explorer.getByRole('button', { name: /Ampliar/ }).click();
      const canvas = page.locator('.lightbox-canvas');
      const hotspots = canvas.locator('.anatomy-hotspot');
      expect(await hotspots.count()).toBe([14, 9, 9, 4][moduleIndex]);
      const canvasBox = await canvas.boundingBox();
      for (let pointIndex = 0; pointIndex < await hotspots.count(); pointIndex++) {
        const hotspot = hotspots.nth(pointIndex);
        const hotspotBox = await hotspot.boundingBox();
        expect(hotspotBox.x + hotspotBox.width / 2).toBeGreaterThanOrEqual(canvasBox.x);
        expect(hotspotBox.x + hotspotBox.width / 2).toBeLessThanOrEqual(canvasBox.x + canvasBox.width);
        await hotspot.focus();
        await expect(hotspot.locator('.hotspot-tooltip')).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }
  });
}

for (const width of [320, 375, 430, 768]) {
  test(`mobile a ${width}px mantém leitura principal e simplifica anatomia`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:4173/qa-automation-suite.html');
    const explorer = page.locator('[data-image-explorer]').first();
    await expect(explorer.getByRole('button', { name: 'Anatomia da solução' })).toBeHidden();
    await expect(explorer.getByRole('button', { name: 'Interface' })).toBeVisible();
    await explorer.getByRole('button', { name: /Ampliar/ }).click();
    await expect(page.locator('#image-lightbox')).toBeVisible();
    await expect(page.locator('#image-lightbox img')).toHaveAttribute('src', /Gerador%20de%20payload\.png/);
    await expect(page.locator('#image-lightbox .anatomy-hotspot')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await explorer.getByRole('button', { name: 'Explorar os 14 pontos' }).click();
    await expect(explorer.locator('.decision-groups')).toBeVisible();
  });
}
