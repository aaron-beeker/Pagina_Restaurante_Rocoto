export class PdfService {
    constructor(restaurantInfo) {
        this.info = restaurantInfo;
        this.primary = [0, 59, 27];   // Verde Rocoto
        this.secondary = [188, 0, 0]; // Rojo Rocoto
        this.textMain = [30, 30, 30];
        this.textMuted = [80, 80, 80];
    }

    async generarMenuA2(dailyMenu, allPlatos) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a2'
        });

        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // --- PÁGINA 1: EL MENÚ DIARIO (FRENTE) ---
        // Borde Ornamental Doble
        doc.setDrawColor(...this.primary);
        doc.setLineWidth(2);
        doc.rect(20, 20, width - 40, height - 40);
        doc.setLineWidth(0.5);
        doc.rect(23, 23, width - 46, height - 46);

        // Logo centrado con mayor presencia
        try {
            const logoImg = await this.getBase64FromUrl(this.info.logoUrl);
            doc.addImage(logoImg, 'PNG', width / 2 - 60, 45, 120, 35);
        } catch (e) { console.error("Error al cargar logo", e); }

        doc.setFont("times", "bolditalic");
        doc.setFontSize(70);
        doc.setTextColor(...this.primary);
        doc.text("MENÚ EJECUTIVO", width / 2, 105, { align: 'center' });

        // Línea divisoria artesanal
        this.drawArtisticLine(doc, width / 2, 115, 200);

        // Secciones del día
        let y = 160;
        const secciones = [
            { t: "ENTRADAS", d: dailyMenu.entradas },
            { t: "PLATOS DE FONDO", d: dailyMenu.segundos },
            { t: "REFRESCOS", d: dailyMenu.refrescos }
        ];

        secciones.forEach(sec => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(35);
            doc.setTextColor(...this.secondary);
            doc.text(sec.t, width / 2, y, { align: 'center' });
            
            y += 20;
            doc.setFont("times", "normal");
            doc.setFontSize(28);
            doc.setTextColor(...this.textMain);
            sec.d.forEach(item => {
                doc.text(item.toUpperCase(), width / 2, y, { align: 'center' });
                y += 15;
            });
            y += 35;
        });

        // Precio destacado en la parte inferior
        doc.setFontSize(45);
        doc.setTextColor(...this.primary);
        doc.text("PRECIO TOTAL: S/ 8.00", width / 2, height - 80, { align: 'center' });

        // --- PÁGINA 2: LA CARTA (DORSO) ---
        doc.addPage();
        
        // Cabecera elegante
        doc.setFillColor(...this.primary);
        doc.rect(0, 0, width, 60, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("times", "bold");
        doc.setFontSize(50);
        doc.text("NUESTRA CARTA GENERAL", width / 2, 40, { align: 'center' });

        // Filtrar platos que no son del menú diario
        const cartaPlatos = allPlatos.filter(p => {
            const cats = Array.isArray(p.category) ? p.category : [p.category];
            return !cats.every(c => ["Entrada", "Menú del Día", "Bebida Menú"].includes(c));
        });

        // Renderizar en 3 COLUMNAS para aprovechar el A2
        doc.autoTable({
            startY: 85,
            head: [],
            body: this.formatPlatosParaTresColumnas(cartaPlatos),
            theme: 'plain',
            styles: {
                font: "times",
                cellPadding: 8,
                fontSize: 14
            },
            columnStyles: {
                0: { cellWidth: (width - 60) / 3 },
                1: { cellWidth: (width - 60) / 3 },
                2: { cellWidth: (width - 60) / 3 }
            },
            margin: { left: 25, right: 25 },
            didDrawCell: (data) => {
                // Separadores verticales discretos
                if (data.column.index < 2) {
                    doc.setDrawColor(220, 220, 220);
                    doc.line(data.cell.x + data.cell.width, data.cell.y + 5, data.cell.x + data.cell.width, data.cell.y + data.cell.height - 5);
                }
            }
        });

        doc.save(`Carta_Rocoto_A2.pdf`);
    }

    async generarReporteAsistencia(worker, attendanceList) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth();
        
        // --- CABECERA ---
        // Fondo verde superior
        doc.setFillColor(...this.primary);
        doc.rect(0, 0, width, 40, 'F');
        
        // Logo
        try {
            const logoImg = await this.getBase64FromUrl(this.info.logoUrl);
            doc.addImage(logoImg, 'PNG', 15, 10, 45, 15);
        } catch (e) {}

        // Título del Reporte
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("REPORTE DE ASISTENCIA", width - 15, 20, { align: 'right' });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, width - 15, 28, { align: 'right' });

        // --- INFORMACIÓN DEL TRABAJADOR ---
        let y = 55;
        doc.setTextColor(...this.textMain);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DATOS DEL TRABAJADOR", 15, y);
        
        y += 10;
        doc.setDrawColor(230, 230, 230);
        doc.line(15, y - 5, width - 15, y - 5);

        const data = [
            ["NOMBRE COMPLETO:", `${worker.apellidos}, ${worker.nombre}`],
            ["DNI:", worker.dni],
            ["EMPRESA:", worker.empresa || "Particular"],
            ["TOTAL REGISTROS:", attendanceList.length.toString()]
        ];

        doc.setFontSize(10);
        data.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 15, y);
            doc.setFont("helvetica", "normal");
            doc.text(value, 60, y);
            y += 7;
        });

        // --- TABLA DE ASISTENCIA ---
        y += 10;
        
        // Ordenar por fecha y hora (descendente)
        const sortedList = [...attendanceList].sort((a, b) => {
            const dateA = a.timestamp?.seconds ? a.timestamp.seconds : 0;
            const dateB = b.timestamp?.seconds ? b.timestamp.seconds : 0;
            return dateB - dateA;
        });

        doc.autoTable({
            startY: y,
            head: [['FECHA', 'HORA', 'TIPO DE CONSUMO', 'EMPRESA']],
            body: sortedList.map(reg => [
                reg.fecha,
                reg.timestamp?.seconds ? new Date(reg.timestamp.seconds * 1000).toLocaleTimeString() : '---',
                reg.tipo.toUpperCase(),
                reg.empresa || 'PARTICULAR'
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: this.primary,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                font: "helvetica",
                fontSize: 9,
                cellPadding: 4
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 35 },
                1: { halign: 'center', cellWidth: 35 },
                2: { halign: 'center' },
                3: { halign: 'center' }
            },
            margin: { left: 15, right: 15 }
        });

        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(...this.textMuted);
        const footerText = `${this.info.name} - ${this.info.address} - WhatsApp: ${this.info.phone}`;
        doc.text(footerText, width / 2, 285, { align: 'center' });

        doc.save(`Asistencia_${worker.dni}_${worker.apellidos}.pdf`);
    }

    async generarReporteAsistenciaGrupal(companyName, startDate, endDate, attendanceList, prices = {d:10, a:10, c:10}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth();
        
        // --- CABECERA ---
        doc.setFillColor(...this.primary);
        doc.rect(0, 0, width, 40, 'F');
        
        try {
            const logoImg = await this.getBase64FromUrl(this.info.logoUrl);
            doc.addImage(logoImg, 'PNG', 15, 10, 45, 15);
        } catch (e) {}

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("REPORTE GRUPAL DE ASISTENCIA", width - 15, 20, { align: 'right' });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const rangeText = `Desde: ${startDate}  Hasta: ${endDate}`;
        doc.text(rangeText, width - 15, 28, { align: 'right' });

        // --- INFORMACIÓN DEL REPORTE ---
        let y = 55;
        doc.setTextColor(...this.textMain);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`EMPRESA: ${companyName || 'TODAS LAS EMPRESAS'}`, 15, y);
        
        y += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total de consumos registrados: ${attendanceList.length}`, 15, y);
        
        y += 5;
        let totalAmount = 0;
        attendanceList.forEach(reg => {
            const type = reg.tipo.toLowerCase();
            if (type.includes('desayuno')) totalAmount += (prices.d || 0);
            else if (type.includes('almuerzo')) totalAmount += (prices.a || 0);
            else if (type.includes('cena')) totalAmount += (prices.c || 0);
        });

        doc.text(`Precios: D: S/ ${prices.d.toFixed(2)} | A: S/ ${prices.a.toFixed(2)} | C: S/ ${prices.c.toFixed(2)}`, 15, y);
        doc.setFont("helvetica", "bold");
        doc.text(`MONTO TOTAL A PAGAR: S/ ${totalAmount.toFixed(2)}`, 15, y + 5);

        // --- TABLA DE ASISTENCIA ---
        y += 15;
        
        doc.autoTable({
            startY: y,
            head: [['FECHA', 'TRABAJADOR', 'DNI', 'TIPO', 'PRECIO']],
            body: attendanceList.map(reg => {
                const type = reg.tipo.toLowerCase();
                let price = 0;
                if (type.includes('desayuno')) price = prices.d;
                else if (type.includes('almuerzo')) price = prices.a;
                else if (type.includes('cena')) price = prices.c;

                return [
                    reg.fecha,
                    reg.nombreCompleto.toUpperCase(),
                    reg.dni,
                    reg.tipo.toUpperCase(),
                    `S/ ${price.toFixed(2)}`
                ];
            }),
            theme: 'striped',
            headStyles: {
                fillColor: this.primary,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                font: "helvetica",
                fontSize: 8,
                cellPadding: 3
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 25 },
                1: { halign: 'left', cellWidth: 70 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 25 },
                4: { halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        });

        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(...this.textMuted);
        const footerText = `${this.info.name} - ${this.info.address} - WhatsApp: ${this.info.phone}`;
        doc.text(footerText, width / 2, 285, { align: 'center' });

        const fileName = `Reporte_Grupal_${companyName || 'General'}_${startDate}_${endDate}.pdf`;
        doc.save(fileName);
    }

    formatPlatosParaTresColumnas(platos) {
        const platosPorCat = {};
        platos.forEach(p => {
            const cat = Array.isArray(p.category) ? p.category[0] : p.category;
            if (!platosPorCat[cat]) platosPorCat[cat] = [];
            platosPorCat[cat].push(p);
        });

        let rows = [];
        Object.keys(platosPorCat).forEach(cat => {
            // Título de categoría a lo ancho
            rows.push([{ content: cat.toUpperCase(), colSpan: 3, styles: { textColor: this.primary, fontStyle: 'bold', fontSize: 24, halign: 'center', cellPadding: 15 } }]);
            
            const items = platosPorCat[cat];
            for (let i = 0; i < items.length; i += 3) {
                rows.push([
                    this.renderItem(items[i]),
                    items[i + 1] ? this.renderItem(items[i + 1]) : "",
                    items[i + 2] ? this.renderItem(items[i + 2]) : ""
                ]);
            }
        });
        return rows;
    }

    renderItem(p) {
        if (!p) return "";
        return {
            content: `${p.name.toUpperCase()}\n${p.description || ''}\nS/ ${Number(p.price).toFixed(2)}`,
            styles: { cellPadding: 5 }
        };
    }

    drawArtisticLine(doc, x, y, w) {
        doc.setDrawColor(...this.secondary);
        doc.setLineWidth(1);
        doc.line(x - w/2, y, x + w/2, y);
        doc.circle(x, y, 1.5, 'F');
    }

    async getBase64FromUrl(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
}
