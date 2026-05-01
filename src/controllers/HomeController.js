export class HomeController {
  constructor({ homeView, menuView, menuRepository, restaurantInfo }) {
    this.homeView = homeView;
    this.menuView = menuView;
    this.menuRepository = menuRepository;
    this.restaurantInfo = restaurantInfo;
    this.activeCategory = "Todos";
    this.storageKey = "rocoto_daily_menu_v1";
  }

  initialize() {
    this.loadDailyMenuFromStorage();
    this.homeView.renderShell(this.restaurantInfo);
    this.homeView.bindDailyMenuPhotoInput((file) => this.handleDailyMenuPhoto(file));
    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");
    this.renderMenu();
  }

  renderMenu() {
    const categories = this.menuRepository.getCategories();
    const items = this.menuRepository.getByCategory(this.activeCategory);

    this.menuView.renderFilters(categories, this.activeCategory, (selectedCategory) => {
      this.activeCategory = selectedCategory;
      this.renderMenu();
    });
    this.menuView.renderItems(items);
  }

  loadDailyMenuFromStorage() {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      if (!rawData) return;
      const parsedData = JSON.parse(rawData);
      this.restaurantInfo.dailyMenu = { ...this.restaurantInfo.dailyMenu, ...parsedData };
    } catch {
      // If local data is invalid, keep seed defaults.
    }
  }

  saveDailyMenuToStorage(dailyMenu) {
    localStorage.setItem(this.storageKey, JSON.stringify(dailyMenu));
  }

  async handleDailyMenuPhoto(file) {
    this.homeView.setDailyMenuOcrStatus("Procesando imagen y extrayendo texto...");

    try {
      const extractedText = await this.extractTextFromImage(file);
      const parsedMenu = this.parseDailyMenuText(extractedText);
      const mergedMenu = { ...this.restaurantInfo.dailyMenu, ...parsedMenu };

      this.restaurantInfo.dailyMenu = mergedMenu;
      this.saveDailyMenuToStorage(mergedMenu);
      this.homeView.updateDailyMenuSection(mergedMenu);
      this.homeView.setDailyMenuOcrStatus("Menu diario actualizado desde la foto.", "success");
    } catch (error) {
      this.homeView.setDailyMenuOcrStatus(
        `No se pudo procesar la foto. ${error.message || "Intenta con una imagen mas nitida."}`,
        "error",
      );
    }
  }

  async extractTextFromImage(file) {
    if (!window.Tesseract) {
      throw new Error("OCR no disponible en este momento.");
    }

    const result = await window.Tesseract.recognize(file, "spa");
    return result?.data?.text || "";
  }

  parseDailyMenuText(rawText) {
    const text = rawText.replace(/\r/g, "");
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const normalizedLines = lines.map((line) => line.toLowerCase());
    const secondCourseCandidates = lines.filter((line) =>
      /^[\-\*\u2022]?\s*[a-zA-ZÀ-ÿ]/.test(line) && !line.match(/^\s*s\/?\s*\d+/i),
    );
    const priceMatch = text.match(/s\/?\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
    const timeMatch = text.match(/([01]?\d(?::\d{2})?\s*(?:am|pm))\s*(?:-|a)\s*([01]?\d(?::\d{2})?\s*(?:am|pm))/i);

    const entradaItems = this.pickLinesByKeywords(lines, ["sopa", "crema", "entrada"]);
    const fondoItems = this.pickLinesByKeywords(lines, [
      "estofado",
      "aji",
      "locro",
      "pollo",
      "carne",
      "pescado",
      "segundo",
    ]);
    const acompanamientoItems = this.pickLinesByKeywords(lines, ["yuca", "frejol", "papa", "ensalada", "arroz"]);

    const fallbackFondo = secondCourseCandidates.slice(0, 5);
    const parsedSteps = [
      { title: "Entrada (A elegir)", items: entradaItems.length ? entradaItems : ["Entrada del dia"] },
      { title: "Segundo (A elegir)", items: fondoItems.length ? fondoItems : fallbackFondo },
      {
        title: "Acompanamiento",
        items: acompanamientoItems.length ? acompanamientoItems : ["Consultar acompanamiento disponible"],
      },
    ];

    const availableTime = timeMatch ? `${timeMatch[1].toUpperCase()} - ${timeMatch[2].toUpperCase()}` : this.restaurantInfo.dailyMenu.availableTime;

    return {
      title: "Menu Diario",
      description: normalizedLines.some((line) => line.includes("criollo"))
        ? "Almuerzo criollo del dia extraido desde tu carta."
        : "Menu diario actualizado automaticamente desde la foto.",
      steps: parsedSteps,
      price: priceMatch ? priceMatch[1].replace(",", ".") : this.restaurantInfo.dailyMenu.price,
      availableTime,
    };
  }

  pickLinesByKeywords(lines, keywords) {
    return lines.filter((line) => {
      const lowerLine = line.toLowerCase();
      return keywords.some((keyword) => lowerLine.includes(keyword));
    });
  }
}
