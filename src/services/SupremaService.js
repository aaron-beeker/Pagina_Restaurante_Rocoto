export class SupremaService {
  constructor() {
    this.baseUrl = "http://localhost:5000";
  }

  /**
   * Verifica si el agente está vivo Y si el lector USB está conectado.
   */
  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const response = await fetch(`${this.baseUrl}/ping`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.status === "success" && data.connected === true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Captura una huella (1 luz).
   */
  async capture(onStep) {
    try {
      const response = await fetch(`${this.baseUrl}/scan`);
      if (!response.ok) return { retCode: -1, error: "Error de lectura" };
      
      const data = await response.json();
      if (data.status === "success" && data.template) {
        if (onStep) onStep('captured');
        return { retCode: 0, template: data.template };
      }
      return { retCode: -1, error: "Huella no detectada" };
    } catch (error) {
      return { retCode: -1, error: "Error de conexión" };
    }
  }

  /**
   * Identificación masiva 1:N en el agente (Ultra-rápido).
   */
  async identify(capturedTemplate, templateList) {
    try {
      if (!capturedTemplate || !templateList || templateList.length === 0) return null;
      
      const response = await fetch(`${this.baseUrl}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          template: capturedTemplate,
          templates: templateList 
        })
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      return (data.status === "success" && data.match) ? { match: true, index: data.index } : { match: false };
    } catch (error) {
      return null;
    }
  }

  /**
   * Comparación 1:1 offline (Sin luz).
   */
  async match(savedTemplate, capturedTemplate) {
    try {
      if (!savedTemplate || !capturedTemplate) return false;
      
      const response = await fetch(`${this.baseUrl}/match_offline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          template1: savedTemplate, 
          template2: capturedTemplate 
        })
      });
      
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === "success" && data.match === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Solo para compatibilidad legada o registro individual.
   */
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

  async init() { return { retCode: 0 }; }
}
