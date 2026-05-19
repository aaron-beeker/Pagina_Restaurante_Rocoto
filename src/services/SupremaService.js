/**
 * Servicio para comunicación con el agente local del lector de huellas Suprema.
 * El agente debe estar corriendo en `http://localhost:5000`.
 */
export class SupremaService {
  constructor() {
    /** @type {string} URL base del agente local. */
    this.baseUrl = "http://localhost:5000";
  }

  /**
   * Verifica si el agente está vivo y si el lector USB está conectado.
   * @returns {Promise<boolean>} True si el agente responde y el lector está conectado.
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
   * Captura una huella dactilar (1 luz).
   * @param {Function} [onStep] - Callback opcional que recibe el paso actual ("captured").
   * @returns {Promise<{retCode: number, template?: string, error?: string}>}
   */
  async capture(onStep) {
    try {
      const response = await fetch(`${this.baseUrl}/scan`);
      if (!response.ok) return { retCode: -1, error: "Error de lectura" };

      const data = await response.json();
      if (data.status === "success" && data.template) {
        if (onStep) onStep("captured");
        return { retCode: 0, template: data.template };
      }
      return { retCode: -1, error: "Huella no detectada" };
    } catch (error) {
      return { retCode: -1, error: "Error de conexión" };
    }
  }

  /**
   * Identificación masiva 1:N en el agente local (ultra-rápido).
   * Compara una huella capturada contra una lista de templates almacenados.
   * @param {string} capturedTemplate - Template de la huella capturada.
   * @param {string[]} templateList - Lista de templates almacenados para comparar.
   * @returns {Promise<{match: boolean, index?: number}|null>} Resultado de la identificación.
   */
  async identify(capturedTemplate, templateList) {
    try {
      if (!capturedTemplate || !templateList || templateList.length === 0) return null;

      const response = await fetch(`${this.baseUrl}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: capturedTemplate,
          templates: templateList,
        }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.status === "success" && data.match
        ? { match: true, index: data.index }
        : { match: false };
    } catch (error) {
      return null;
    }
  }

  /**
   * Comparación 1:1 offline entre dos templates de huella.
   * @param {string} savedTemplate - Template almacenado de referencia.
   * @param {string} capturedTemplate - Template de la huella capturada.
   * @returns {Promise<boolean>} True si las huellas coinciden.
   */
  async match(savedTemplate, capturedTemplate) {
    try {
      if (!savedTemplate || !capturedTemplate) return false;

      const response = await fetch(`${this.baseUrl}/match_offline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template1: savedTemplate,
          template2: capturedTemplate,
        }),
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.status === "success" && data.match === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificación de huella contra el agente (compatibilidad legada).
   * @param {string} savedTemplate - Template almacenado para verificar.
   * @returns {Promise<boolean>} True si la huella verificada coincide.
   */
  async verify(savedTemplate) {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved_template: savedTemplate }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.match === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Inicializa el servicio (stub para compatibilidad).
   * @returns {Promise<{retCode: number}>}
   */
  async init() {
    return { retCode: 0 };
  }
}
