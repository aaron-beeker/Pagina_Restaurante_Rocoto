import { RestaurantInfo } from "../models/RestaurantInfo.js";

export const restaurantInfo = new RestaurantInfo({
  name: "Rocoto Restaurante Chifa",
  slogan: "Tradicion y Sabor Chifa",
  logoUrl:
    "https://lh3.googleusercontent.com/aida/ADBb0uiODUgYTKi4Z0c-I5lUo0FRXJHhpIbYjrRpKN-McGODYBS4MmUicgk0dSok8aFbSuf6emHl7Vr4nppUQFu4HaFygUyKCdmGb_KrY7bTwBx1_hLWkM-pXXU8F8HWZ3w07zKinvNUSFmTbFzvzWOHIb6iN56CL4RZ_JFAaS9onInPOEgDSeWRgj40FJaUEcIoMBnABaOclmHIz0RquG2BHWxg-E6FrlXFKbUURLqMH9Q-40V1bJU8rahDBvCvf0zAr4YKStH3NcHSeEI",
  address: "Av. Petit Thouars 4500, Miraflores, Lima - Peru",
  phone: "+51 (01) 444-5566",
  email: "hola@rocotochifa.pe",
  schedule: "Lun - Sab 12:00 PM - 11:00 PM | Dom 12:00 PM - 9:00 PM",
});

export const menuSeed = [
  {
    id: "wantan-frito",
    name: "Wantan Frito",
    description:
      "Crujientes laminas de masa rellenas de carne seleccionada, con salsa de tamarindo.",
    category: "Entradas",
    price: 18,
    tags: ["ENTRADA"],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHvACiKem-w6T7ND8kAfZuel7ZZFqQgf828zd8hbkhTKD3eN389n7jwo9pqQ8ngFkn8YXouT5Lh1X2DTTRVdTRUraEAaMAPFSayFAEP0n14afFaDvR3EEAK9zHJN-jOrf_qS7uRWmZRLBzswNDoT6x18BWMRYwcGLZWxy4OmlhYDrH82QCjLQUh0QQ37F6b6eu6O6uwyEcC7IqmfTIod-j5oHbM7L4mI8TlUl1LmQq-f9YgpHYbgL72oHX3nvzZtd6aysP50bKPSHr",
  },
  {
    id: "chaufa-especial",
    name: "Arroz Chaufa Especial",
    description:
      "Arroz salteado al wok con trozos de pollo, chancho asado, langostinos y cebollita china.",
    category: "Platos de Fondo",
    price: 32,
    tags: ["POPULAR", "PLATILLO RECOMENDADO"],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEhvAaQwChvkGXG7Y_POsJKhTdmB-TFIpuySwsveejZLToQ0MuEeLfqoPpsXZxkkBGHWOVKZtFVJrCSTJouTJMev_JpS-DzB3l9Fqm2vyzWczKT_ygbKgelkETIzel2JMBFoA21s62zB8MOu4D9n5RxtoOynl32Of1xqyue2nxUxZWN2QXYz3W9xKo5DtV7RqDGx7w9LBKNWkpc2M9CgqCaWrLcagVVwoYGj88bUn_FcxW_F8i9qApz2i71oxtf3jpzuNpLG_L7m-D",
  },
  {
    id: "chicha-morada",
    name: "Chicha Morada",
    description: "Bebida tradicional peruana, fresca y especiada.",
    category: "Bebidas",
    price: 10,
    tags: ["BEBIDA"],
    imageUrl:
      "https://images.unsplash.com/photo-1600359759059-519f62f6764f?q=80&w=1200&auto=format&fit=crop",
  },
];
