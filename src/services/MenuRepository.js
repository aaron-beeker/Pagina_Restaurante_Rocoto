import { MenuItem } from "../models/MenuItem.js";

/**
 * Repositorio de datos del menu.
 * DIP: el controlador depende de esta abstraccion y no de datos hardcodeados.
 */
export class MenuRepository {
  constructor(seedData = []) {
    this.items = seedData.map((item) => new MenuItem(item));
  }

  getAll() {
    return [...this.items];
  }

  getByCategory(category) {
    if (category === "Todos") return this.getAll();
    return this.items.filter((item) => item.category === category);
  }

  getCategories() {
    const categories = new Set(this.items.map((item) => item.category));
    return ["Todos", ...categories];
  }
}
