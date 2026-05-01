export class RestaurantInfo {
  constructor({ name, slogan, logoUrl, address, phone, email, schedule, mapsUrl, mapsEmbedUrl, dailyMenu }) {
    this.name = name;
    this.slogan = slogan;
    this.logoUrl = logoUrl;
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.schedule = schedule;
    this.mapsUrl = mapsUrl;
    this.mapsEmbedUrl = mapsEmbedUrl;
    this.dailyMenu = dailyMenu;
  }
}
