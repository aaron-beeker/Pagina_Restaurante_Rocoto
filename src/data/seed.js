import { RestaurantInfo } from "../models/RestaurantInfo.js";

export const restaurantInfo = new RestaurantInfo({
  name: "Rocoto Restaurante Chifa",
  slogan: "Tradicion y Sabor Chifa",
  logoUrl: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png",
  address: "Calle Peru 379, San Ramon 12840, Peru",
  phone: "+51995750239",
  email: "hola@rocotochifa.pe",
  schedule: "12:00 PM - 3:00 PM y 7:00 PM - 11:00 PM",
  mapsUrl: "https://maps.app.goo.gl/1NC2sP5WzcQLqr2i9",
  mapsEmbedUrl: "https://www.google.com/maps?q=Restaurante%20Rocoto%2C%20C.%20Peru%20379%2C%20San%20Ramon%2C%20Peru&output=embed",
});

export const menuSeed = [
  {
    id: "pollo-parrilla",
    name: "Pollo a la Parrilla",
    description: "Acompanado de ensalada fresca y guarnicion a eleccion.",
    category: "Parrillas y Pollos",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHvACiKem-w6T7ND8kAfZuel7ZZFqQgf828zd8hbkhTKD3eN389n7jwo9pqQ8ngFkn8YXouT5Lh1X2DTTRVdTRUraEAaMAPFSayFAEP0n14afFaDvR3EEAK9zHJN-jOrf_qS7uRWmZRLBzswNDoT6x18BWMRYwcGLZWxy4OmlhYDrH82QCjLQUh0QQ37F6b6eu6O6uwyEcC7IqmfTIod-j5oHbM7L4mI8TlUl1LmQq-f9YgpHYbgL72oHX3nvzZtd6aysP50bKPSHr",
  },
  {
    id: "pollo-broaster",
    name: "Pollo Broaster",
    description: "Pollo crocante dorado al instante, servido con ensalada.",
    category: "Parrillas y Pollos",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEhvAaQwChvkGXG7Y_POsJKhTdmB-TFIpuySwsveejZLToQ0MuEeLfqoPpsXZxkkBGHWOVKZtFVJrCSTJouTJMev_JpS-DzB3l9Fqm2vyzWczKT_ygbKgelkETIzel2JMBFoA21s62zB8MOu4D9n5RxtoOynl32Of1xqyue2nxUxZWN2QXYz3W9xKo5DtV7RqDGx7w9LBKNWkpc2M9CgqCaWrLcagVVwoYGj88bUn_FcxW_F8i9qApz2i71oxtf3jpzuNpLG_L7m-D",
  },
  {
    id: "mostrito",
    name: "Mostrito",
    description: "Combinacion clasica de arroz chaufa con pollo broaster.",
    category: "Parrillas y Pollos",
    price: 12,
    tags: ["MENU EXTRA", "POPULAR"],
    imageUrl:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "chuleta",
    name: "Chuleta",
    description: "Chuleta dorada, acompanada de ensalada y guarnicion.",
    category: "Carnes Criollas",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bistec",
    name: "Bistec",
    description: "Corte de res sazonado a la plancha, con ensalada fresca.",
    category: "Carnes Criollas",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "bistec-pobre",
    name: "Bistec a lo Pobre",
    description: "Bistec con huevo, platano frito y complemento del dia.",
    category: "Carnes Criollas",
    price: 15,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "milanesa",
    name: "Milanesa",
    description: "Filete empanizado y crujiente, servido con ensalada.",
    category: "Carnes Criollas",
    price: 10,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "lomo-saltado",
    name: "Lomo Saltado",
    description: "Clasico lomo salteado al wok con cebolla y tomate.",
    category: "Carnes Criollas",
    price: 15,
    tags: ["MENU EXTRA", "RECOMENDADO"],
    imageUrl:
      "https://images.unsplash.com/photo-1514516345957-556ca7b2b7e3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "trucha-frita",
    name: "Trucha Frita",
    description: "Trucha crocante servida con ensalada y guarnicion.",
    category: "Pescados",
    price: 12,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1559847844-d721426d6edc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "barbon-frito",
    name: "Barbon Frito",
    description: "Pescado frito al punto, ideal para almuerzo criollo.",
    category: "Pescados",
    price: 12,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "filete-zungaro",
    name: "Filete de Zungaro",
    description: "Filete suave de zungaro, servido con ensalada.",
    category: "Pescados",
    price: 12,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "chicharron-doncella",
    name: "Chicharron de Doncella",
    description: "Crujiente y sabroso, servido con arroz y ensalada.",
    category: "Pescados",
    price: 25,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "chaufa-alitas",
    name: "Chaufa con Alitas",
    description: "Arroz chaufa con alitas doradas y sabor casero.",
    category: "Amazonico y Chaufas",
    price: 12,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "chaufa-cecina",
    name: "Chaufa de Cecina",
    description: "Arroz chaufa amazónico con cecina ahumada.",
    category: "Amazonico y Chaufas",
    price: 20,
    tags: ["MENU EXTRA"],
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "tacacho-cecina",
    name: "Tacacho con Cecina",
    description: "Tacacho tradicional con cecina y ensalada fresca.",
    category: "Amazonico y Chaufas",
    price: 25,
    tags: ["MENU EXTRA", "AMAZONICO"],
    imageUrl:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },

// Añadir al array menuSeed en data/seed.js
{
  id: "arroz-pollo-huancaina",
  name: "Arroz con Pollo con Papa a la Huancaína",
  description: "Clásico peruano acompañado de cremosa salsa huancaína.",
  category: "Menú del Día",
  price: 10.00,
  tags: ["ESPECIAL", "CRIOLLO"],
  imageUrl: "URL_IMAGEN"
},
{
  id: "adobo-chancho",
  name: "Adobo de Chancho",
  description: "Tiernos trozos de chancho en salsa de chicha de jora y ají panca.",
  category: "Menú del Día",
  price: 10.00,
  tags: ["REGIONAL"],
  imageUrl: "URL_IMAGEN"
}
// Repetir para: Puré con Asado, Tallarines Rojos, Chicharrón Colorado, Secos, etc.


];


// Añade esto a menuSeed en src/data/seed.js
export const recetarioPlatos = [
  { 
    id: 'ap-huancaina', 
    name: 'Arroz con Pollo con Papa a la Huancaína', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1626202340534-f1639844439c?q=80&w=1200&auto=format&fit=crop',
    description: 'Arroz verde con presas de pollo, servido con la clásica crema de ají amarillo y queso.'
  },
  { 
    id: 'adobo-chancho', 
    name: 'Adobo de Chancho', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=1200&auto=format&fit=crop',
    description: 'Trozos de chancho macerados en chicha de jora y especias, servido con yuca sancochada.'
  },
  { 
    id: 'pure-asado', 
    name: 'Puré con Asado', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    description: 'Suave puré de papa amarilla acompañado de tierno asado de res en su jugo.'
  },
  { 
    id: 't-rojos-huancaina', 
    name: 'Tallarines Rojos con Papa a la Huancaína', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop',
    description: 'Tallarines en salsa de tomate y carne, acompañados de papa con crema huancaína.'
  },
  { 
    id: 'chicharron-colorado', 
    name: 'Chicharrón Colorado', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1200&auto=format&fit=crop',
    description: 'Chancho dorado en su propia grasa con salsa de ají colorado, servido con arroz y papas.'
  },
  { 
    id: 'seco-huachana', 
    name: 'Seco a la Huachana (Res/Pollo)', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1514516345957-556ca7b2b7e3?q=80&w=1200&auto=format&fit=crop',
    description: 'Guiso tradicional con culantro y especias, servido con frijoles y arroz blanco.'
  },
  { 
    id: 'seco-norteña', 
    name: 'Seco a la Norteña (Res/Pollo)', 
    categoria: 'Fondo',
    imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1200&auto=format&fit=crop',
    description: 'Especialidad norteña con loche y chicha de jora, acompañado de yucas y frijoles.'
  }
];


// En src/data/seed.js añadir:
export const opcionesEntradas = ["Crema de alverja", "Causa rellena", "Papa a la huancaína", "Sopa del día"];
export const opcionesRefrescos = ["Chicha morada", "Maracuyá", "Limonada", "Té helado"];
