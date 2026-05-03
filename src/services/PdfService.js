export class PdfService {
    constructor(restaurantInfo) {
        this.info = restaurantInfo;
    }

    async generarMenuA3(dailyMenu, allPlatos) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a3'
        });

        const width = doc.internal.pageSize.getWidth();
        const primaryColor = [0, 59, 27]; // Tu color verde #003b1b

        // --- PÁGINA 1: EL MENÚ DIARIO (FRENTE) ---
        // Logo
        try {
            const logoImg = await this.getBase64FromUrl(this.info.logoUrl);
            doc.addImage(logoImg, 'PNG', width / 2 - 40, 20, 80, 25);
        } catch (e) { console.error("Logo no cargado", e); }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.setTextColor(...primaryColor);
        doc.text("MENÚ DEL DÍA", width / 2, 60, { align: 'center' });

        doc.setLineWidth(1);
        doc.line(40, 65, width - 40, 65);

        // Secciones del Menú Diario
        let y = 90;
        const secciones = [
            { t: "ENTRADAS", d: dailyMenu.entradas },
            { t: "SEGUNDOS", d: dailyMenu.segundos },
            { t: "BEBIDAS", d: dailyMenu.refrescos }
        ];

        secciones.forEach(sec => {
            doc.setFontSize(24);
            doc.text(sec.t, width / 2, y, { align: 'center' });
            y += 15;
            doc.setFontSize(18);
            doc.setTextColor(60, 60, 60);
            sec.d.forEach(item => {
                doc.text(item, width / 2, y, { align: 'center' });
                y += 10;
            });
            y += 15;
        });

        doc.setFontSize(30);
        doc.setTextColor(188, 0, 0); // Tu color rojo secundario
        doc.text("PRECIO: S/ 8.00", width / 2, y + 20, { align: 'center' });

        // --- PÁGINA 2: LA CARTA (POSTERIOR) ---
        doc.addPage();
        doc.setFontSize(35);
        doc.setTextColor(...primaryColor);
        doc.text("NUESTRA CARTA", width / 2, 30, { align: 'center' });

        // Filtrar platos (excluir los que son SOLO menú diario)
        const cartaPlatos = allPlatos.filter(p => {
            const cats = Array.isArray(p.category) ? p.category : [p.category];
            return !cats.every(c => ["Entrada", "Menú del Día", "Bebida Menú"].includes(c));
        });

        // Organizar por categorías
        const platosPorCategoria = {};
        cartaPlatos.forEach(p => {
            const cat = Array.isArray(p.category) ? p.category[0] : p.category;
            if (!platosPorCategoria[cat]) platosPorCategoria[cat] = [];
            platosPorCategoria[cat].push(p);
        });

        let currentY = 50;
        Object.keys(platosPorCategoria).forEach(cat => {
            doc.autoTable({
                startY: currentY,
                head: [[cat.toUpperCase(), "PRECIO"]],
                body: platosPorCategoria[cat].map(p => [
                    { content: `${p.name}\n${p.description || ''}`, styles: { fontSize: 12 } },
                    `S/ ${Number(p.price).toFixed(2)}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: primaryColor, fontSize: 14 },
                columnStyles: { 1: { halign: 'right', cellWidth: 30 } },
                margin: { left: 30, right: 30 }
            });
            currentY = doc.lastAutoTable.finalY + 15;
        });

        doc.save(`Carta_Rocoto_${new Date().toLocaleDateString()}.pdf`);
    }

    getBase64FromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    }
}