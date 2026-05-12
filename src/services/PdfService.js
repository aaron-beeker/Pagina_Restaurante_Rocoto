import { jsPDF } from "jspdf";
import "jspdf-autotable";

export class PdfService {
    constructor(restaurantInfo) {
        this.info = restaurantInfo;
        this.primary = [6, 78, 59];   // Esmeralda Profundo (Ajustado al nuevo diseño)
        this.secondary = [16, 185, 129]; // Esmeralda Brillante
        this.textMain = [15, 23, 42];
        this.textMuted = [100, 116, 139];
        this.logoUrlWhite = "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778318308/logo_blanco_qcb2a6.png";
    }

    async generarMenuDiarioPdf(dailyMenu) {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // 1. Fondo y Borde Minimalista
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, width, height, 'F');
        
        doc.setDrawColor(240, 240, 240);
        doc.setLineWidth(0.2);
        doc.rect(10, 10, width - 20, height - 20);

        // 2. Logo Centrado (Usamos el logo oficial del restaurante)
        await this.insertLogo(doc, this.info.logoUrl, width / 2, 35, 45, 25);

        // 3. Título Elegante
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...this.primary);
        doc.text("MENÚ DE HOY", width / 2, 65, { align: 'center' });
        
        // Línea divisoria fina
        doc.setDrawColor(...this.secondary);
        doc.setLineWidth(0.5);
        doc.line(width/2 - 15, 72, width/2 + 15, 72);

        // 4. Secciones del Menú
        let y = 90;
        const secciones = [
            { t: "ENTRADAS", d: dailyMenu.entradas },
            { t: "PLATOS DE FONDO", d: dailyMenu.segundos },
            { t: "REFRESCO", d: dailyMenu.refrescos }
        ];

        secciones.forEach(sec => {
            // Título de Sección
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(...this.secondary);
            doc.text(sec.t, width / 2, y, { align: 'center', charSpace: 2 });
            
            y += 10;
            
            // Items
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            doc.setTextColor(...this.textMain);
            
            sec.d.forEach(item => {
                doc.text(item.toUpperCase(), width / 2, y, { align: 'center' });
                y += 8;
            });
            
            y += 15; // Espacio entre secciones
        });

        // 5. Pie de Página (Precio y Detalle)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(...this.primary);
        doc.text("S/ 8.00", width / 2, height - 40, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...this.textMuted);
        doc.text("SERVICIO DE 12:00 PM A 3:30 PM", width / 2, height - 33, { align: 'center' });
        
        doc.text(`${this.info.name.toUpperCase()} - ${this.info.address.toUpperCase()}`, width / 2, height - 25, { align: 'center' });

        // 6. QR de Visita (Abajo a la derecha)
        await this.addQRToFooter(doc, width, height);

        doc.save(`Menu_Rocoto_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    }

    async generarReporteAsistencia(worker, attendanceList) {
        
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        
        doc.setFillColor(...this.primary);
        doc.rect(0, 0, width, 45, 'F');
        
        await this.insertLogo(doc, this.logoUrlWhite, 35, 22.5, 45, 20);

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("REPORTE INDIVIDUAL", width - 15, 20, { align: 'right' });
        doc.setFontSize(9);
        doc.text(`EMISIÓN: ${new Date().toLocaleDateString()}`, width - 15, 28, { align: 'right' });

        let y = 65;
        doc.setTextColor(...this.textMain);
        doc.setFontSize(12);
        doc.text("DATOS DEL PERSONAL", 15, y);
        y += 8;
        doc.setDrawColor(240, 240, 240);
        doc.line(15, y, width - 15, y);
        y += 10;

        const info = [
            ["COLABORADOR:", `${worker.apellidos}, ${worker.nombre}`],
            ["DNI:", worker.dni],
            ["EMPRESA:", worker.empresa || "Particular"]
        ];

        doc.setFontSize(9);
        info.forEach(([l, v]) => {
            doc.setFont("helvetica", "bold"); doc.text(l, 15, y);
            doc.setFont("helvetica", "normal"); doc.text(v, 50, y);
            y += 6;
        });

        const sortedList = [...attendanceList].sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        doc.autoTable({
            startY: y + 10,
            head: [['FECHA', 'HORA', 'SERVICIO', 'EMPRESA']],
            body: sortedList.map(r => [r.fecha, r.timestamp?.seconds ? new Date(r.timestamp.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--', r.tipo.toUpperCase(), r.empresa || 'PARTICULAR']),
            theme: 'grid',
            headStyles: { fillColor: this.primary, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
            columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' } },
            margin: { left: 15, right: 15 }
        });

        await this.addFooter(doc, width);
        doc.save(`Asistencia_${worker.dni}.pdf`);
    }

    async generarReporteAsistenciaGrupal(companyName, startDate, endDate, attendanceList, allWorkers, prices = {d:10, a:10, c:10}) {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const width = doc.internal.pageSize.getWidth();
        
        // 1. Encabezado Estilizado
        doc.setFillColor(...this.primary);
        doc.rect(0, 0, width, 40, 'F');
        await this.insertLogo(doc, this.logoUrlWhite, 30, 20, 40, 18);

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("CUADRO DE CONTROL DE ALIMENTACIÓN", width - 15, 18, { align: 'right' });
        doc.setFontSize(9);
        doc.text(`EMPRESA: ${companyName || 'CONSOLIDADO GENERAL'}`, width - 15, 25, { align: 'right' });
        doc.text(`PERIODO: ${startDate} AL ${endDate}`, width - 15, 30, { align: 'right' });

        // 2. Procesamiento de Datos
        let grandTotalD = 0, grandTotalA = 0, grandTotalC = 0;

        const tableBody = allWorkers.map((worker, index) => {
            let workerTotalD = 0, workerTotalA = 0, workerTotalC = 0;

            attendanceList.forEach(a => {
                if (String(a.dni).trim() === String(worker.dni).trim() && !a.soloCampo) {
                    const t = a.tipo.toLowerCase();
                    if (t.includes('desayuno')) workerTotalD++;
                    else if (t.includes('almuerzo')) workerTotalA++;
                    else if (t.includes('cena')) workerTotalC++;
                }
            });

            const workerCost = (workerTotalD * prices.d) + (workerTotalA * prices.a) + (workerTotalC * prices.c);
            grandTotalD += workerTotalD; grandTotalA += workerTotalA; grandTotalC += workerTotalC;

            return [
                index + 1,
                worker.dni,
                `${worker.apellidos}, ${worker.nombre}`.toUpperCase(),
                workerTotalD || "",
                workerTotalA || "",
                workerTotalC || "",
                `S/ ${workerCost.toFixed(2)}`
            ];
        });

        // 2.2 Fila de Raciones a Campo (Grupales)
        let fieldTotalD = 0, fieldTotalA = 0, fieldTotalC = 0;
        attendanceList.forEach(a => {
            if ((a.cantidadCampo || 0) > 0) {
                const t = a.tipo.toLowerCase();
                if (t.includes('desayuno')) fieldTotalD += a.cantidadCampo;
                else if (t.includes('almuerzo')) fieldTotalA += a.cantidadCampo;
                else if (t.includes('cena')) fieldTotalC += a.cantidadCampo;
            }
        });

        const fieldCost = (fieldTotalD * prices.d) + (fieldTotalA * prices.a) + (fieldTotalC * prices.c);
        tableBody.push([
            allWorkers.length + 1,
            "-",
            "TOTAL RACIONES A CAMPO (GRUPALES)",
            fieldTotalD || "",
            fieldTotalA || "",
            fieldTotalC || "",
            `S/ ${fieldCost.toFixed(2)}`
        ]);

        grandTotalD += fieldTotalD; grandTotalA += fieldTotalA; grandTotalC += fieldTotalC;
        const grandTotalCost = (grandTotalD * prices.d) + (grandTotalA * prices.a) + (grandTotalC * prices.c);

        // 3. Renderizar Tabla Principal
        doc.autoTable({
            startY: 50,
            head: [['ITEM', 'DNI', 'APELLIDOS Y NOMBRES', 'DES.', 'ALM.', 'CENA', 'SUBTOTAL']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: this.primary, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5 },
            columnStyles: { 
                0: { halign: 'center', cellWidth: 12 }, 
                1: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 15 },
                4: { halign: 'center', cellWidth: 15 },
                5: { halign: 'center', cellWidth: 15 },
                6: { halign: 'right', cellWidth: 30, fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 },
            didParseCell: (data) => {
                if (data.row.index === allWorkers.length) {
                    data.cell.styles.fillColor = [240, 253, 244];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        // 4. Resumen de Liquidación Final
        const finalY = doc.lastAutoTable.finalY + 10;
        const summaryData = [
            ["DESCRIPCIÓN", "CANT. TOTAL", "PRECIO U.", "TOTAL S/"],
            ["DESAYUNOS", grandTotalD, `S/ ${prices.d.toFixed(2)}`, `S/ ${(grandTotalD * prices.d).toFixed(2)}`],
            ["ALMUERZOS", grandTotalA, `S/ ${prices.a.toFixed(2)}`, `S/ ${(grandTotalA * prices.a).toFixed(2)}`],
            ["CENAS", grandTotalC, `S/ ${prices.c.toFixed(2)}`, `S/ ${(grandTotalC * prices.c).toFixed(2)}`],
            [{ content: "TOTAL A FACTURAR", colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `S/ ${grandTotalCost.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: this.primary, textColor: [255, 255, 255] } }]
        ];

        doc.autoTable({
            startY: finalY,
            head: [],
            body: summaryData,
            theme: 'grid',
            styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 60 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
            margin: { left: width - 150 },
        });

        await this.addFooter(doc, width);
        doc.save(`Reporte_Pension_${companyName || 'General'}_${startDate}.pdf`);
    }

    async addFooter(doc, width) {
        const h = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(...this.textMuted);
        doc.text(`${this.info.name} - San Ramón - WhatsApp: ${this.info.phone}`, width / 2, h - 10, { align: 'center' });
        
        // Agregar QR también a los reportes
        await this.addQRToFooter(doc, width, h);
    }

    async addQRToFooter(doc, width, height) {
        try {
            // URL oficial del restaurante
            const websiteUrl = "https://restaurante-rocoto.vercel.app/";
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(websiteUrl)}`;
            
            // Posición QR: Abajo a la derecha
            const qrSize = 22;
            const margin = 15;
            const x = width - qrSize - margin;
            const y = height - qrSize - margin;

            // Texto "VISÍTANOS" arriba del QR
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(...this.primary);
            doc.text("VISÍTANOS", x + qrSize/2, y - 2, { align: 'center' });

            const qrData = await this.getBase64FromUrl(qrUrl);
            doc.addImage(qrData, 'PNG', x, y, qrSize, qrSize);
        } catch (e) {
            console.error("Error al agregar QR al PDF", e);
        }
    }

    /**
     * Inserta el logo manteniendo la proporción para evitar deformaciones
     */
    async insertLogo(doc, url, x, y, maxW, maxH) {
        try {
            const imgData = await this.getBase64FromUrl(url);
            const img = new Image();
            img.src = imgData;
            await new Promise(resolve => img.onload = resolve);
            
            let w = img.width;
            let h = img.height;
            const ratio = w / h;

            if (w > maxW) { w = maxW; h = w / ratio; }
            if (h > maxH) { h = maxH; w = h * ratio; }

            doc.addImage(imgData, 'PNG', x - w / 2, y - h / 2, w, h);
        } catch (e) { console.error("Error al insertar logo proporcional", e); }
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
