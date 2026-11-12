import { expect, test } from "@playwright/test";

// #16: las listas se leen de localStorage con useLists() y el GPS reinicia su estado al pulsar el botón.

test("crear, renombrar, importar y borrar listas se refleja al momento y tras recargar", async ({ page }) => {
  await page.goto("/lists");

  const listName = `Lista e2e ${Date.now()}`;
  await page.getByPlaceholder("Nombre de nueva lista...").fill(listName);
  await page.getByRole("button", { name: "＋", exact: true }).click();
  const createdList = page.locator("li", { hasText: listName });
  await expect(createdList).toBeVisible();

  await createdList.getByRole("link", { name: "✏️ Editar" }).click();
  const nameInput = page.locator("main input[type=text]").first();
  await expect(nameInput).toHaveValue(listName);

  const renamed = `${listName} renombrada`;
  await nameInput.fill(renamed);
  await nameInput.blur();
  await page.reload();
  await expect(page.locator("main input[type=text]").first()).toHaveValue(renamed);

  await page.goto("/lists");
  await expect(page.locator("li", { hasText: renamed })).toBeVisible();

  const importedName = `Importada e2e ${Date.now()}`;
  await page.locator("input[type=file]").setInputFiles({
    name: "lista.roadbook.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      JSON.stringify({ name: importedName, items: [{ shortName: "a", longName: "a" }, { shortName: "b", longName: "b" }] })
    ),
  });
  const importedList = page.locator("li", { hasText: importedName });
  await expect(importedList).toContainText("2 puntos");

  page.once("dialog", (dialog) => dialog.accept());
  await importedList.getByRole("button", { name: "🗑" }).click();
  await expect(importedList).toHaveCount(0);
});

test("una lista inexistente redirige a Mis Listas", async ({ page }) => {
  await page.goto("/lists/no-existe");
  await expect(page).toHaveURL(/\/lists$/);

  await page.goto("/run?listId=no-existe");
  await expect(page).toHaveURL(/\/lists$/);
});

test("el GPS se puede desactivar y volver a activar durante el recorrido", async ({ page }) => {
  await page.goto("/lists");
  const listName = `GPS e2e ${Date.now()}`;
  await page.getByPlaceholder("Nombre de nueva lista...").fill(listName);
  await page.getByRole("button", { name: "＋", exact: true }).click();
  await page.locator("li", { hasText: listName }).getByRole("link", { name: "✏️ Editar" }).click();

  await page.getByRole("button", { name: "＋ Añadir punto" }).click();
  await page.getByLabel("Nombre corto *").fill("inicio");
  await page.getByLabel("Nombre largo / descripción *").fill("inicio");
  await page.getByRole("button", { name: "💾 Guardar" }).click();

  await page.getByRole("link", { name: "▶ Recorrer esta lista" }).click();
  await page.getByRole("button", { name: "▶ Iniciar" }).click();

  const gpsButton = page.locator("button[aria-label^='GPS']");
  await expect(gpsButton).toHaveAttribute("aria-label", "GPS activo");

  await gpsButton.click();
  await expect(gpsButton).toHaveAttribute("aria-label", "GPS desactivado");

  await gpsButton.click();
  await expect(gpsButton).toHaveAttribute("aria-label", "GPS activo");
});
