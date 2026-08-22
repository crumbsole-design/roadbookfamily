import { test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __spokenMessages?: string[];
  }
}

async function addPoint(page: Page, name: string) {
  await page.getByRole("button", { name: "＋ Añadir punto" }).click();
  await page.getByLabel("Nombre corto *").fill(name);
  await page.getByLabel("Nombre largo / descripción *").fill(name);
  await page.getByRole("button", { name: "💾 Guardar" }).click();
}

test("modo audio anuncia activación, puntos y cuenta atrás", async ({ page }) => {
  await page.addInitScript(() => {
    const spokenMessages: string[] = [];
    window.__spokenMessages = spokenMessages;

    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;

      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      writable: true,
      value: MockSpeechSynthesisUtterance,
    });

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak: (utterance: { text?: string }) => {
          spokenMessages.push(utterance?.text ?? "");
        },
        cancel: () => {},
      },
    });
  });

  await page.goto("/");
  await page.getByRole("link", { name: "📋 Mis Listas" }).click();

  const listName = `Ruta audio e2e ${Date.now()}`;
  await page.getByPlaceholder("Nombre de nueva lista...").fill(listName);
  await page.getByRole("button", { name: "＋" }).click();

  const createdList = page.locator("li", { hasText: listName });
  await createdList.getByRole("link", { name: "✏️ Editar" }).click();

  await addPoint(page, "uno");
  await addPoint(page, "dos");
  await addPoint(page, "tres");
  await addPoint(page, "último");

  await page.getByRole("link", { name: "▶ Recorrer esta lista" }).click();
  await page.getByRole("button", { name: "🔊 Audio" }).click();
  await page.getByRole("button", { name: "▶ Iniciar" }).click();

  await page.waitForFunction(() => {
    const spoken = (window.__spokenMessages ?? []).map((value) => value.toLowerCase());
    return spoken.some((value) => value.includes("navegación por voz activada"));
  }, undefined, { timeout: 45_000 });

  await page.waitForFunction(() => {
    const spoken = (window.__spokenMessages ?? []).map((value) => value.toLowerCase());
    const indexes = ["uno", "dos", "tres", "último"].map((name) =>
      spoken.findIndex((value) => value.includes(name))
    );
    return indexes.every((index) => index >= 0) && indexes.every((index, i) => i === 0 || index > indexes[i - 1]);
  }, undefined, { timeout: 45_000 });

  await page.waitForFunction(() => {
    const spoken = (window.__spokenMessages ?? []).map((value) => value.toLowerCase());
    return [4, 3, 2, 1].every((remaining) =>
      spoken.some((value) => value.includes(`quedan ${remaining} segundos`))
    );
  }, undefined, { timeout: 45_000 });
});
