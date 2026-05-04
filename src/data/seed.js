import { RestaurantInfo } from "../models/RestaurantInfo.js";

export const restaurantInfo = new RestaurantInfo({
  name: "Rocoto Restaurante Chifa",
  slogan: "Tradición y Sabor Chifa",
  logoUrl: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png",
  address: "Calle Perú 379, San Ramón",
  phone: "+51 995 750 239",
  whatsapp: "51995750239",
  email: "hola@rocotochifa.pe",
  schedule: "12:00 PM - 3:00 PM y 7:00 PM - 11:00 PM",
  mapsUrl: "https://maps.app.goo.gl/1NC2sP5WzcQLqr2i9",
  mapsEmbedUrl: "https://www.google.com/maps?q=Restaurante%20Rocoto%2C%20C.%20Peru%20379%2C%20San%20Ramon%2C%20Peru&output=embed",
});

export const menuSeed = [
  {
    id: "pollo-parrilla",
    name: "Pollo a la Parrilla",
    description: "Acompañado de ensalada fresca y guarnición a elección.",
    category: "Parrillas y Pollos",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHvACiKem-w6T7ND8kAfZuel7ZZFqQgf828zd8hbkhTKD3eN389n7jwo9pqQ8ngFkn8YXouT5Lh1X2DTTRVdTRUraEAaMAPFSayFAEP0n14afFaDvR3EEAK9zHJN-jOrf_qS7uRWmZRLBzswNDoT6x18BWMRYwcGLZWxy4OmlhYDrH82QCjLQUh0QQ37F6b6eu6O6uwyEcC7IqmfTIod-j5oHbM7L4mI8TlUl1LmQq-f9YgpHYbgL72oHX3nvzZtd6aysP50bKPSHr",
  },
  {
    id: "pollo-broaster",
    name: "Pollo Broaster",
    description: "Pollo crocante dorado al instante, servido con ensalada.",
    category: "Parrillas y Pollos",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEhvAaQwChvkGXG7Y_POsJKhTdmB-TFIpuySwsveejZLToQ0MuEeLfqoPpsXZxkkBGHWOVKZtFVJrCSTJouTJMev_JpS-DzB3l9Fqm2vyzWczKT_ygbKgelkETIzel2JMBFoA21s62zB8MOu4D9n5RxtoOynl32Of1xqyue2nxUxZWN2QXYz3W9xKo5DtV7RqDGx7w9LBKNWkpc2M9CgqCaWrLcagVVwoYGj88bUn_FcxW_F8i9qApz2i71oxtf3jpzuNpLG_L7m-D",
  },
  {
    id: "mostrito",
    name: "Mostrito",
    description: "Combinación clásica de arroz chaufa con pollo broaster.",
    category: "Parrillas y Pollos",
    price: 12,
    tags: ["MENU EXTRA", "POPULAR"],
    imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "chuleta",
    name: "Chuleta",
    description: "Chuleta dorada, acompañada de ensalada y guarnición.",
    category: "Carnes Criollas",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bistec",
    name: "Bistec",
    description: "Corte de res sazonado a la plancha, con ensalada fresca.",
    category: "Carnes Criollas",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "trucha-frita",
    name: "Trucha Frita",
    description: "Trucha crocante servida con ensalada y guarnición.",
    category: "Pescados",
    price: 12,
    tags: ["MENU EXTRA"],
    imageUrl: "https://images.unsplash.com/photo-1559847844-d721426d6edc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "arroz-pollo-huancaina",
    name: "Arroz con Pollo con Papa a la Huancaína",
    description: "Clásico peruano acompañado de cremosa salsa huancaína.",
    category: "Menú del Día",
    price: 10.00,
    tags: ["ESPECIAL", "CRIOLLO"],
    imageUrl: "https://images.unsplash.com/photo-1626202340534-f1639844439c?q=80&w=1200&auto=format&fit=crop"
  }
];

export const recetarioPlatos = [];
export const opcionesEntradas = ["Crema de alverja", "Causa rellena", "Papa a la huancaína", "Sopa del día"];
export const opcionesRefrescos = ["Chicha morada", "Maracuyá", "Limonada", "Té helado"];
