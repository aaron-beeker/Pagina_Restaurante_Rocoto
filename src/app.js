import { HomeController } from "./controllers/HomeController.js";
import { menuSeed, restaurantInfo } from "./data/seed.js";
import { MenuRepository } from "./services/MenuRepository.js";
import { HomeView } from "./views/HomeView.js";
import { MenuView } from "./views/MenuView.js";
import { UserRepository } from "./services/UserRepository.js";
import { Router } from "./Router.js";

function bootstrap() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  const root = document.getElementById("app");
  const homeView = new HomeView(root);
  const menuView = new MenuView(null, null);
  const menuRepository = new MenuRepository(menuSeed);
  const userRepository = new UserRepository();

  const controller = new HomeController({
    homeView,
    menuView,
    menuRepository,
    restaurantInfo,
  });

  const router = new Router({
    homeView,
    homeController: controller,
    attendanceController: controller.attendanceController,
    adminMenuController: controller.adminMenuController,
    userRepository,
  });

  controller.setRouter(router);
  controller.initialize();
  router.start();
}

bootstrap();
