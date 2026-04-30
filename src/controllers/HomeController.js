export class HomeController {
  constructor({ homeView, menuView, menuRepository, restaurantInfo }) {
    this.homeView = homeView;
    this.menuView = menuView;
    this.menuRepository = menuRepository;
    this.restaurantInfo = restaurantInfo;
    this.activeCategory = "Todos";
  }

  initialize() {
    this.homeView.renderShell(this.restaurantInfo);
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
}
