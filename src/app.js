import { HomeController } from "./controllers/HomeController.js";
import { menuSeed, restaurantInfo } from "./data/seed.js";
import { MenuRepository } from "./services/MenuRepository.js";
import { HomeView } from "./views/HomeView.js";
import { MenuView } from "./views/MenuView.js";
import { UserRepository } from "./services/UserRepository.js";

function bootstrap() {
  const root = document.getElementById("app");
  const homeView = new HomeView(root);
  const menuView = new MenuView(null, null);
  const menuRepository = new MenuRepository(menuSeed);

  const controller = new HomeController({
    homeView,
    menuView,
    menuRepository,
    restaurantInfo,
  });

  controller.initialize();
}

bootstrap();
