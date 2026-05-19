import XLSX from "xlsx-js-style";

/**
 * Servicio para generar reportes de asistencia en formato Excel (.xlsx).
 * Incluye estilos corporativos de Rocoto (color esmeralda).
 */
export class ExcelService {
  /**
   * @param {{name: string, [key: string]: any}} restaurantInfo - Información del restaurante para encabezados.
   */
  constructor(restaurantInfo) {
    /** @type {{name: string, [key: string]: any}} */
    this.info = restaurantInfo;
    /** @type {string} */
    this.primaryColor = "1b5e34";
    /** @type {object} */
    this.headerBg = {
      fill: { fgColor: { rgb: "1b5e34" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };
    /** @type {object} */
    this.borderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };
  }

  /**
   * Genera un reporte individual (ficha personal) de asistencia de un trabajador.
   * @param {{apellidos: string, nombre: string, dni: string, empresa?: string}} worker - Datos del trabajador.
   * @param {Array<{fecha: string, timestamp?: {seconds: number}, tipo: string, empresa?: string}>} attendanceList - Registros de asistencia.
   * @returns {Promise<void>} Descarga el archivo Excel.
   */
  async generarReporteAsistencia(worker, attendanceList) {
    const reportData = attendanceList.map((reg) => ({
      FECHA: reg.fecha,
      HORA: reg.timestamp?.seconds
        ? new Date(reg.timestamp.seconds * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "---",
      TIPO: reg.tipo.toUpperCase(),
      EMPRESA: reg.empresa || "PARTICULAR",
    }));

    const header = [
      [this.info.name.toUpperCase()],
      ["REPORTE DE ASISTENCIA INDIVIDUAL"],
      [`Trabajador: ${worker.apellidos}, ${worker.nombre}`],
      [`DNI: ${worker.dni}`],
      [],
    ];

    const ws = XLSX.utils.aoa_to_sheet(header);
    XLSX.utils.sheet_add_json(ws, reportData, { origin: "A6" });

    for (let r = 0; r <= 3; r++) {
      const cell = XLSX.utils.encode_cell({ r, c: 0 });
      if (ws[cell])
        ws[cell].s = {
          font: {
            bold: true,
            color: { rgb: r === 0 ? this.primaryColor : "000000" },
            size: r === 0 ? 14 : 10,
          },
        };
    }

    for (let c = 0; c <= 3; c++) {
      const cell = XLSX.utils.encode_cell({ r: 5, c });
      if (ws[cell]) ws[cell].s = { ...this.headerBg, border: this.borderStyle };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, `Asistencia_${worker.dni}.xlsx`);
  }

  /**
   * Genera un reporte grupal matricial (cuadro de control de alimentación).
   * Muestra raciones por trabajador, día y tipo de comida con totales y costos.
   * @param {string} companyName - Nombre de la empresa o null para todas.
   * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD.
   * @param {string} endDate - Fecha fin en formato YYYY-MM-DD.
   * @param {Array<{dni: string, fecha: string, tipo: string, soloCampo: boolean, cantidadCampo?: number}>} attendanceList - Registros de asistencia.
   * @param {Array<{dni: string, apellidos: string, nombre: string}>} allWorkers - Lista completa de trabajadores.
   * @param {{d: number, a: number, c: number}} [prices={d: 12, a: 12, c: 12}] - Precios por tipo de comida.
   * @returns {Promise<void>} Descarga el archivo Excel.
   */
  async generarReporteAsistenciaGrupal(
    companyName,
    startDate,
    endDate,
    attendanceList,
    allWorkers,
    prices = { d: 12, a: 12, c: 12 }
  ) {
    const workbook = XLSX.utils.book_new();

    const dates = [];
    const curr = new Date(startDate + "T12:00:00");
    const last = new Date(endDate + "T12:00:00");
    while (curr <= last) {
      dates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }

    const totalsColsStart = 3 + dates.length * 3;
    const totalCols = totalsColsStart + 4;

    const headers = [
      [this.info.name.toUpperCase()],
      ["CUADRO DE CONTROL DE ALIMENTACIÓN - SERVICIO DE PENSIÓN"],
      [`EMPRESA: ${companyName || "TODAS LAS EMPRESAS"}`],
      [`PERIODO: ${startDate} al ${endDate}`],
      [],
      ["ITEM", "DNI", "APELLIDOS Y NOMBRES"],
      ["", "", ""],
    ];

    dates.forEach((date) => {
      const d = new Date(date + "T12:00:00");
      const dayName = d.toLocaleDateString("es-ES", { weekday: "long" }).toUpperCase();
      headers[5].push(dayName, "", "");
      headers[6].push(date.split("-")[2], "", "");
    });

    headers[5].push("TOTAL", "", "", "");
    headers[6].push("", "", "", "");

    const subHeaders = ["", "", ""];
    dates.forEach(() => subHeaders.push("DESAYUNO", "ALMUERZO", "CENA"));
    subHeaders.push("DESAYUNO", "ALMUERZO", "CENA", "COSTO TOTAL");
    headers.push(subHeaders);

    let grandTotalD = 0,
      grandTotalA = 0,
      grandTotalC = 0;
    const rows = allWorkers.map((worker, index) => {
      const row = [
        index + 1,
        worker.dni,
        `${worker.apellidos.toUpperCase()}, ${worker.nombre.toUpperCase()}`,
      ];
      let wD = 0,
        wA = 0,
        wC = 0;

      dates.forEach((date) => {
        const dayRecords = attendanceList.filter(
          (a) => String(a.dni).trim() === String(worker.dni).trim() && a.fecha === date
        );

        const countD = dayRecords.filter(
          (r) => r.tipo.toLowerCase().includes("desayuno") && !r.soloCampo
        ).length;
        const countA = dayRecords.filter(
          (r) => r.tipo.toLowerCase().includes("almuerzo") && !r.soloCampo
        ).length;
        const countC = dayRecords.filter(
          (r) => r.tipo.toLowerCase().includes("cena") && !r.soloCampo
        ).length;

        row.push(countD || "", countA || "", countC || "");

        wD += countD;
        wA += countA;
        wC += countC;
      });

      const workerCost = wD * prices.d + wA * prices.a + wC * prices.c;
      row.push(wD, wA, wC, workerCost);

      grandTotalD += wD;
      grandTotalA += wA;
      grandTotalC += wC;

      return row;
    });

    const fieldRow = [allWorkers.length + 1, "-", "TOTAL RACIONES A CAMPO (GRUPALES)"];
    let fD = 0,
      fA = 0,
      fC = 0;
    dates.forEach((date) => {
      const dayFieldRecords = attendanceList.filter(
        (a) => a.fecha === date && (a.cantidadCampo || 0) > 0
      );
      const sumD = dayFieldRecords
        .filter((r) => r.tipo.toLowerCase().includes("desayuno"))
        .reduce((acc, r) => acc + (r.cantidadCampo || 0), 0);
      const sumA = dayFieldRecords
        .filter((r) => r.tipo.toLowerCase().includes("almuerzo"))
        .reduce((acc, r) => acc + (r.cantidadCampo || 0), 0);
      const sumC = dayFieldRecords
        .filter((r) => r.tipo.toLowerCase().includes("cena"))
        .reduce((acc, r) => acc + (r.cantidadCampo || 0), 0);
      fieldRow.push(sumD || "", sumA || "", sumC || "");
      fD += sumD;
      fA += sumA;
      fC += sumC;
    });
    fieldRow.push(fD, fA, fC, fD * prices.d + fA * prices.a + fC * prices.c);
    rows.push(fieldRow);

    grandTotalD += fD;
    grandTotalA += fA;
    grandTotalC += fC;

    const footerStartRow = headers.length + rows.length;
    const labelCol = totalsColsStart - 6;

    const footerRows = [
      [],
      new Array(labelCol).concat([
        "SUMA TOTAL CANTIDAD",
        "",
        "",
        "",
        "",
        "",
        grandTotalD,
        grandTotalA,
        grandTotalC,
        grandTotalD + grandTotalA + grandTotalC,
      ]),
      new Array(labelCol).concat([
        "PRECIO UNITARIO",
        "",
        "",
        "",
        "",
        "",
        prices.d,
        prices.a,
        prices.c,
        "",
      ]),
      new Array(labelCol).concat([
        "COSTO TOTAL CATEGORÍA",
        "",
        "",
        "",
        "",
        "",
        grandTotalD * prices.d,
        grandTotalA * prices.a,
        grandTotalC * prices.c,
        grandTotalD * prices.d + grandTotalA * prices.a + grandTotalC * prices.c,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...rows, ...footerRows]);

    for (let r = 0; r <= 3; r++) {
      const cell = XLSX.utils.encode_cell({ r, c: 0 });
      if (ws[cell])
        ws[cell].s = {
          font: {
            bold: true,
            size: r === 0 ? 18 : 11,
            color: { rgb: r === 0 ? this.primaryColor : "000000" },
          },
          alignment: { horizontal: "center" },
        };
    }

    for (let r = 5; r <= 6; r++) {
      for (let c = 0; c < totalCols; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (ws[ref]) ws[ref].s = { ...this.headerBg, border: this.borderStyle };
      }
    }

    for (let c = 0; c < totalCols; c++) {
      const ref = XLSX.utils.encode_cell({ r: 7, c });
      if (ws[ref])
        ws[ref].s = {
          fill: { fgColor: { rgb: "f8fafc" } },
          font: { bold: true, size: 8 },
          border: this.borderStyle,
          alignment: { horizontal: "center", vertical: "center", textRotation: c >= 3 ? 90 : 0 },
        };
    }

    rows.forEach((row, i) => {
      const rowIdx = 8 + i;
      for (let c = 0; c < totalCols; c++) {
        const ref = XLSX.utils.encode_cell({ r: rowIdx, c });
        if (ws[ref])
          ws[ref].s = {
            border: this.borderStyle,
            fill: {
              fgColor: {
                rgb: i === rows.length - 1 ? "fffbeb" : i % 2 === 0 ? "FFFFFF" : "f9fafb",
              },
            },
            alignment: { horizontal: c === 2 ? "left" : "center", vertical: "center" },
          };
      }
    });

    for (let r = 1; r <= 3; r++) {
      const rowIdx = footerStartRow + r;
      const labelRef = XLSX.utils.encode_cell({ r: rowIdx, c: labelCol });
      if (ws[labelRef])
        ws[labelRef].s = {
          font: { bold: true, size: 9 },
          alignment: { horizontal: "right", vertical: "center" },
          fill: { fgColor: { rgb: "f8fafc" } },
          border: this.borderStyle,
        };

      for (let c = totalsColsStart; c < totalCols; c++) {
        const valRef = XLSX.utils.encode_cell({ r: rowIdx, c });
        if (ws[valRef])
          ws[valRef].s = {
            font: {
              bold: true,
              color: { rgb: r === 3 && c === totalCols - 1 ? "FFFFFF" : "000000" },
            },
            fill: {
              fgColor: { rgb: r === 3 && c === totalCols - 1 ? this.primaryColor : "f0fdf4" },
            },
            alignment: { horizontal: "center" },
            border: this.borderStyle,
          };
      }
    }

    ws["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 45 }];
    for (let i = 3; i < totalCols; i++) ws["!cols"].push({ wch: 4 });

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } },
      { s: { r: 5, c: 0 }, e: { r: 7, c: 0 } },
      { s: { r: 5, c: 1 }, e: { r: 7, c: 1 } },
      { s: { r: 5, c: 2 }, e: { r: 7, c: 2 } },
      { s: { r: 5, c: totalsColsStart }, e: { r: 6, c: totalCols - 1 } },
    ];

    dates.forEach((_, i) => {
      const startCol = 3 + i * 3;
      ws["!merges"].push({ s: { r: 5, c: startCol }, e: { r: 5, c: startCol + 2 } });
      ws["!merges"].push({ s: { r: 6, c: startCol }, e: { r: 6, c: startCol + 2 } });
    });

    for (let r = 1; r <= 3; r++) {
      ws["!merges"].push({
        s: { r: footerStartRow + r, c: labelCol },
        e: { r: footerStartRow + r, c: totalsColsStart - 1 },
      });
    }

    XLSX.utils.book_append_sheet(workbook, ws, "Cuadro_Pension");
    XLSX.writeFile(workbook, `REPORTE_PENSION_${companyName || "GRUPAL"}_${startDate}.xlsx`);
  }
}
