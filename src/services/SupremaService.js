export class SupremaService {
  constructor() {
    this.baseUrl = "http://localhost:5000";
  }

  async init() {
    try {
      const response = await fetch(`${this.baseUrl}/scan`);
      if (response.status === 404) return { retCode: -1, error: "Lector no conectado" };
      return { retCode: 0 };
    } catch (error) {
      return { retCode: -1, error: "Agente local no iniciado" };
    }
  }

  async capture() {
    try {
      const response = await fetch(`${this.baseUrl}/scan`);
      if (!response.ok) throw new Error("Error en el lector");
      const data = await response.json();
      return { retCode: 0, template: data.template };
    } catch (error) {
      return { retCode: -1, error: error.message };
    }
  }

  async verify(savedTemplate) {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved_template: savedTemplate })
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.match === true;
    } catch (error) {
      return false;
    }
  }
}
