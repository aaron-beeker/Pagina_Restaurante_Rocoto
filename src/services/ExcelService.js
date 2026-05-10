import XLSX from "xlsx-js-style";

export class ExcelService {
    constructor(restaurantInfo) {
        this.info = restaurantInfo;
    }

    /**
     * Reporte Individual (Listado cronológico)
     */
    async generarReporteAsistencia(worker, attendanceList) {
        
        const reportData = attendanceList.map(reg => ({
            'FECHA': reg.fecha,
            'HORA': reg.timestamp?.seconds ? new Date(reg.timestamp.seconds * 1000).toLocaleTimeString() : '---',
            'TIPO': reg.tipo.toUpperCase(),
            'EMPRESA': reg.empresa || 'PARTICULAR'
        }));

        const header = [
            [this.info.name.toUpperCase()],
            ['REPORTE DE ASISTENCIA INDIVIDUAL'],
            [`Trabajador: ${worker.apellidos}, ${worker.nombre}`],
            [`DNI: ${worker.dni}`],
            []
        ];

        const ws = XLSX.utils.aoa_to_sheet(header);
        XLSX.utils.sheet_add_json(ws, reportData, { origin: "A6" });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
        XLSX.writeFile(wb, `Asistencia_${worker.dni}.xlsx`);
    }

    /**
     * Reporte Grupal MATRICIAL AVANZADO (Cuadro de Control de Alimentación)
     */
    async generarReporteAsistenciaGrupal(companyName, startDate, endDate, attendanceList, allWorkers, prices = {d:12, a:12, c:12}) {
        
        const workbook = XLSX.utils.book_new();
        
        // 1. Calcular los días del rango solicitado
        const dates = [];
        let curr = new Date(startDate + "T12:00:00");
        let last = new Date(endDate + "T12:00:00");
        while (curr <= last) {
            dates.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }

        const totalDays = dates.length;
        const matrixColsCount = totalDays * 3; // 3 raciones por día
        const totalsColsStart = 3 + matrixColsCount; // ITEM, DNI, NOMBRES + MALLA

        // 2. Definir los Encabezados
        const headers = [
            [this.info.name.toUpperCase()],
            ["CUADRO DE CONTROL DE ALIMENTACIÓN - SERVICIO DE PENSIÓN"],
            [`EMPRESA: ${companyName || 'TODAS LAS EMPRESAS'}`],
            [`PERIODO: ${startDate} al ${endDate}`],
            [],
            ["ITEM", "DNI", "APELLIDOS Y NOMBRES"], // Fila 5: Etiquetas principales + Nombres de días
            ["", "", ""] // Fila 6: Números de día
        ];

        // Fila 5 (Nombres de día) y Fila 6 (Números de día)
        dates.forEach(date => {
            const d = new Date(date + "T12:00:00");
            const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
            const dayNum = date.split('-')[2];
            
            headers[5].push(dayName, "", ""); 
            headers[6].push(dayNum, "", ""); 
        });

        // Agregados finales para Fila 5 y 6 (Sección TOTAL)
        headers[5].push("TOTAL", "", "", ""); 
        headers[6].push("", "", "", ""); 

        // Fila 7: Sub-cabeceras (D, A, C)
        const subHeaders = ["", "", ""]; 
        dates.forEach(() => {
            subHeaders.push("DESAYUNO", "ALMUERZO", "CENA");
        });
        subHeaders.push("DESAYUNO", "ALMUERZO", "CENA", "COSTO TOTAL"); 
        headers.push(subHeaders);

        // 3. Procesar las Filas y Acumuladores
        let grandTotalD = 0;
        let grandTotalA = 0;
        let grandTotalC = 0;

        const rows = allWorkers.map((worker, index) => {
            const row = [
                index + 1,
                worker.dni,
                `${worker.apellidos.toUpperCase()}, ${worker.nombre.toUpperCase()}`
            ];

            let workerTotalD = 0;
            let workerTotalA = 0;
            let workerTotalC = 0;

            dates.forEach((date) => {
                const dayRecords = attendanceList.filter(a => 
                    String(a.dni).trim() === String(worker.dni).trim() && a.fecha === date
                );

                const hasD = dayRecords.some(r => r.tipo.toLowerCase().includes('desayuno') && !r.soloCampo) ? 1 : "";
                const hasA = dayRecords.some(r => r.tipo.toLowerCase().includes('almuerzo') && !r.soloCampo) ? 1 : "";
                const hasC = dayRecords.some(r => r.tipo.toLowerCase().includes('cena') && !r.soloCampo) ? 1 : "";

                row.push(hasD, hasA, hasC);

                if (hasD) workerTotalD++;
                if (hasA) workerTotalA++;
                if (hasC) workerTotalC++;
            });

            const workerCost = (workerTotalD * prices.d) + (workerTotalA * prices.a) + (workerTotalC * prices.c);
            row.push(workerTotalD, workerTotalA, workerTotalC, workerCost);

            grandTotalD += workerTotalD;
            grandTotalA += workerTotalA;
            grandTotalC += workerTotalC;

            return row;
        });

        // 3.1 Fila Especial: TOTAL RACIONES A CAMPO (Suma de raciones grupales por día)
        const fieldRationsRow = [
            allWorkers.length + 1,
            "", // DNI vacío
            "TOTAL RACIONES A CAMPO (GRUPALES)"
        ];

        let fieldGrandTotalD = 0;
        let fieldGrandTotalA = 0;
        let fieldGrandTotalC = 0;

        dates.forEach(date => {
            const dayFieldRecords = attendanceList.filter(a => a.fecha === date && (a.cantidadCampo || 0) > 0);
            const sumD = dayFieldRecords.filter(r => r.tipo.toLowerCase().includes('desayuno')).reduce((acc, r) => acc + (r.cantidadCampo || 0), 0);
            const sumA = dayFieldRecords.filter(r => r.tipo.toLowerCase().includes('almuerzo')).reduce((acc, r) => acc + (r.cantidadCampo || 0), 0);
            const sumC = dayFieldRecords.filter(r => r.tipo.toLowerCase().includes('cena')).reduce((acc, r) => acc + (r.cantidadCampo || 0), 0);

            fieldRationsRow.push(sumD || "", sumA || "", sumC || "");
            fieldGrandTotalD += sumD;
            fieldGrandTotalA += sumA;
            fieldGrandTotalC += sumC;
        });

        const fieldTotalCost = (fieldGrandTotalD * prices.d) + (fieldGrandTotalA * prices.a) + (fieldGrandTotalC * prices.c);
        fieldRationsRow.push(fieldGrandTotalD, fieldGrandTotalA, fieldGrandTotalC, fieldTotalCost);

        // Añadir la fila de campo al final de la lista de trabajadores
        rows.push(fieldRationsRow);

        // Actualizar los Grandes Totales para el Footer
        grandTotalD += fieldGrandTotalD;
        grandTotalA += fieldGrandTotalA;
        grandTotalC += fieldGrandTotalC;

        // 4. Pie de Página de Costos (Footer)
        const grandTotalCost = (grandTotalD * prices.d) + (grandTotalA * prices.a) + (grandTotalC * prices.c);
        const footerStartRow = headers.length + rows.length;
        
        const footerRows = [
            [], // Espacio
            new Array(totalsColsStart).fill(""), 
            new Array(totalsColsStart).fill(""), 
            new Array(totalsColsStart).fill("")  
        ];

        const labelStartCol = totalsColsStart - 6;
        footerRows[1][labelStartCol] = "SUMA TOTAL CANTIDAD";
        footerRows[2][labelStartCol] = "PRECIO UNITARIO";
        footerRows[3][labelStartCol] = "COSTO TOTAL CATEGORÍA";

        footerRows[1].push(grandTotalD, grandTotalA, grandTotalC, grandTotalD + grandTotalA + grandTotalC);
        footerRows[2].push(prices.d, prices.a, prices.c, ""); 
        footerRows[3].push(grandTotalD * prices.d, grandTotalA * prices.a, grandTotalC * prices.c, grandTotalCost);

        // 5. Crear Hoja y Aplicar Estilos
        const ws = XLSX.utils.aoa_to_sheet([
            ...headers, 
            ...rows, 
            ...footerRows
        ]);

        // Anchos de columna
        const colWidths = [{ wch: 5 }, { wch: 12 }, { wch: 60 }]; 
        dates.forEach(() => {
            colWidths.push({ wch: 3.5 }, { wch: 3.5 }, { wch: 3.5 }); 
        });
        colWidths.push({ wch: 3.5 }, { wch: 3.5 }, { wch: 3.5 }, { wch: 12 });
        ws['!cols'] = colWidths;

        // Combinación de Celdas
        const totalCols = totalsColsStart + 4;
        const merges = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }, 
            { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } }, 
            { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } }, 
            { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } }, 
            { s: { r: 5, c: 0 }, e: { r: 7, c: 0 } }, // ITEM (Combinar Filas 5, 6, 7)
            { s: { r: 5, c: 1 }, e: { r: 7, c: 1 } }, // DNI
            { s: { r: 5, c: 2 }, e: { r: 7, c: 2 } }  // NOMBRES
        ];

        // Merge para el footer de costos
        for (let i = 1; i <= 3; i++) {
            merges.push({
                s: { r: footerStartRow + i, c: labelStartCol },
                e: { r: footerStartRow + i, c: totalsColsStart - 1 }
            });
        }

        // Merges para días
        dates.forEach((_, i) => {
            const startCol = 3 + (i * 3);
            merges.push({ s: { r: 5, c: startCol }, e: { r: 5, c: startCol + 2 } }); // Nombre Día
            merges.push({ s: { r: 6, c: startCol }, e: { r: 6, c: startCol + 2 } }); // Número Día
        });

        // Combinar cabecera "TOTAL" sobre las 4 columnas finales (Filas 5 y 6)
        merges.push({ s: { r: 5, c: totalsColsStart }, e: { r: 6, c: totalsColsStart + 3 } });

        ws['!merges'] = merges;

        // --- APLICACIÓN DE ESTILOS ---
        const borderStyle = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
        };

        const headerBgColor = { rgb: "003b1b" }; // Verde oscuro restaurante
        const subHeaderBgColor = { rgb: "F2F2F2" }; // Gris muy claro
        const whiteText = { color: { rgb: "FFFFFF" }, bold: true };

        // 1. Estilos para Títulos principales
        for (let r = 0; r <= 3; r++) {
            const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
            if (!ws[cellRef]) ws[cellRef] = { v: "" };
            ws[cellRef].s = {
                font: { bold: true, size: r === 0 ? 16 : 12 },
                alignment: { horizontal: "center" }
            };
        }

        // 2. Estilos para Cabeceras (Fila 5 y 6)
        for (let r = 5; r <= 6; r++) {
            for (let c = 0; c < totalCols; c++) {
                const cellRef = XLSX.utils.encode_cell({ r, c });
                if (!ws[cellRef]) continue;
                ws[cellRef].s = {
                    fill: { fgColor: headerBgColor },
                    font: whiteText,
                    alignment: { 
                        horizontal: "center", 
                        vertical: "center"
                    },
                    border: borderStyle
                };
                if (c === 0) ws[cellRef].s.alignment.textRotation = 90;
            }
        }

        // 3. Estilos para Sub-cabeceras (Fila 7)
        for (let c = 0; c < totalCols; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 7, c });
            if (!ws[cellRef]) ws[cellRef] = { v: "" };
            ws[cellRef].s = {
                fill: { fgColor: subHeaderBgColor },
                font: { bold: true, size: 9 },
                alignment: { 
                    horizontal: "center", 
                    vertical: (c >= 3) ? "bottom" : "center",
                    textRotation: (c >= 3 && c < totalCols - 1) ? 90 : 0
                },
                border: borderStyle
            };
            if (c === totalCols - 1) {
                ws[cellRef].s.alignment.vertical = "center";
            }
        }

        // 4. Estilos para el Cuerpo de Datos
        const lastDataRow = 7 + rows.length;
        for (let r = 8; r <= lastDataRow; r++) {
            for (let c = 0; c < totalCols; c++) {
                const cellRef = XLSX.utils.encode_cell({ r, c });
                if (!ws[cellRef]) ws[cellRef] = { v: "" };
                ws[cellRef].s = {
                    border: borderStyle,
                    alignment: { 
                        horizontal: c === 2 ? "left" : "center",
                        vertical: "center"
                    }
                };
                if (c === totalCols - 1) { 
                    ws[cellRef].s.font = { bold: true };
                }
            }
        }

        // 5. Estilos para el Footer
        for (let r = 1; r <= 3; r++) {
            const currentRow = footerStartRow + r;
            for (let c = labelStartCol; c < totalCols; c++) {
                const cellRef = XLSX.utils.encode_cell({ r: currentRow, c });
                if (!ws[cellRef]) ws[cellRef] = { v: "" };
                ws[cellRef].s = {
                    border: borderStyle,
                    font: { bold: true },
                    alignment: { 
                        horizontal: c < totalsColsStart ? "right" : "center",
                        vertical: "center"
                    }
                };
                if (c >= totalsColsStart) {
                    ws[cellRef].s.fill = { fgColor: subHeaderBgColor };
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, ws, "Cuadro_Pension");
        XLSX.writeFile(workbook, `REPORTE_PENSION_${companyName || 'GRUPAL'}_${startDate}.xlsx`);
    }
}
