export class MenuItem {
  constructor({ id, name, description, category, price, imageUrl, tags = [] }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.price = price;
    this.imageUrl = imageUrl;
    this.tags = tags;
  }
}
