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