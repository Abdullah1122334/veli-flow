/**
 * VeilFlow - Label Generator with Multiple Templates
 * محرك توليد الملصقات - قوالب متعددة
 */

const LabelGenerator = {
    // Current selected template (can be changed from settings)
    currentTemplate: 'thermalGarment',

    generateSKU(category, fabric) {
        const year = new Date().getFullYear().toString().slice(-2);
        const sequence = VeilStorage.getNextSequence(category);
        const sequenceStr = sequence.toString().padStart(5, '0');
        return `${category}${year}${sequenceStr}-${fabric}`;
    },

    generateBarcode(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = containerId + '_svg';
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', data);
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.maxWidth = '100%';
        svg.style.maxHeight = '100%';
        svg.style.display = 'block';
        svg.style.shapeRendering = 'crispEdges';
        container.appendChild(svg);

        try {
            const settings = VeilStorage.getSettings();
            const isLargeLabel = (settings.labelHeight || 0) >= 8;
            JsBarcode(svg, data, {
                format: "CODE128",
                width: isLargeLabel ? 2 : 1.5,
                height: isLargeLabel ? 120 : 48,
                displayValue: false,
                margin: 0,        // إلغاء الهوامش الداخلية للباركود لمنع القص
                background: "#ffffff",
                lineColor: "#000000"
            });
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        } catch (error) {
            console.error('Error generating barcode:', error);
            container.innerHTML = '<div style="font-size: 8px;">خطأ</div>';
        }
    },

    createLabelHTML(product, includeBarcode = true) {
        const barcodeId = `barcode_${product.id || Math.random().toString(36).substr(2, 9)}`;
        const settings = VeilStorage.getSettings();

        // Get template from settings or use default
        const templateName = settings.labelTemplate || this.currentTemplate;

        // Get HTML from selected template
        let html = '';
        if (LabelTemplates[templateName]) {
            html = LabelTemplates[templateName](product, barcodeId, settings);
        } else {
            // Fallback to classic if template not found
            html = LabelTemplates.classic(product, barcodeId, settings);
        }

        return { html, barcodeId };
    },

    calculateFontSize(text) {
        const length = text.length;
        if (length <= 15) return 10;
        if (length <= 25) return 8;
        if (length <= 35) return 7;
        return 6;
    },

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    generatePreview(product, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const labelData = this.createLabelHTML(product);

        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 2rem; background: #f1f5f9; border-radius: 12px; min-height: 250px;">
                <div style="transform: scale(1.5); transform-origin: center;">
                    ${labelData.html}
                </div>
            </div>
        `;

        setTimeout(() => {
            this.generateBarcode(labelData.barcodeId, product.sku);
        }, 200);
    },

    /**
     * توليد الملصقات للطباعة مع معالجة مشاكل الطابعات الحرارية [تعديل أساسي]
     */
    generateBulkLabels(products) {
        const printArea = document.getElementById('printArea');
        if (!printArea) return;

        const settings = VeilStorage.getSettings();
        const labelWidth = settings.labelWidth || 10;
        const labelHeight = settings.labelHeight || 15;
        printArea.innerHTML = '';

        // إنشاء حاوية الطباعة - تم تغييرها لـ block لإصلاح تكرار الورق الأبيض [تحسين]
        const container = document.createElement('div');
        container.style.cssText = `
            padding: 0;
            margin: 0;
            display: block;
            width: ${labelWidth}cm;
        `;

        products.forEach(product => {
            const labelData = this.createLabelHTML(product);
            const labelDiv = document.createElement('div');
            labelDiv.innerHTML = labelData.html;
            
            // ضبط كل ملصق ليأخذ ورقة واحدة فقط في الطابعة الحرارية
            const labelElement = labelDiv.firstElementChild;
            labelElement.style.margin = '0';
            labelElement.style.width = `${labelWidth}cm`;
            labelElement.style.height = `${labelHeight}cm`;
            labelElement.style.maxWidth = `${labelWidth}cm`;
            labelElement.style.maxHeight = `${labelHeight}cm`;
            labelElement.style.boxSizing = 'border-box';
            labelElement.style.overflow = 'hidden';
            labelElement.style.breakInside = 'avoid';
            labelElement.style.pageBreakInside = 'avoid';
            labelElement.style.breakAfter = 'page';
            labelElement.style.pageBreakAfter = 'always'; // إجبار الطابعة على إنهاء الصفحة بعد كل ملصق
            
            container.appendChild(labelElement);
        });

        printArea.appendChild(container);

        setTimeout(() => {
            products.forEach(product => {
                const barcodeId = `barcode_${product.id}`;
                this.generateBarcode(barcodeId, product.sku);
            });

            setTimeout(() => {
                // تحديث مقاس الصفحة برمجياً ليتعرف المتصفح على الملصق تلقائياً
                this.updatePrintPageSize();
                window.print();
                VeilStorage.incrementPrintCount(products.length);
            }, 500);
        }, 300);
    },

    downloadQRCode(product) {
        const tempDiv = document.createElement('div');
        tempDiv.id = 'temp-label-download';
        tempDiv.style.cssText = 'position: fixed; left: -9999px; top: -9999px; background: white;';
        document.body.appendChild(tempDiv);

        const labelData = this.createLabelHTML(product);
        tempDiv.innerHTML = labelData.html;

        setTimeout(() => {
            this.generateBarcode(labelData.barcodeId, product.sku);

            setTimeout(() => {
                const labelElement = tempDiv.querySelector('.print-label');

                if (typeof html2canvas !== 'undefined') {
                    html2canvas(labelElement, {
                        scale: 3, 
                        backgroundColor: '#ffffff',
                        logging: false
                    }).then(canvas => {
                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Label_${product.sku}.png`;
                        a.click();
                        document.body.removeChild(tempDiv);
                    }).catch(error => {
                        console.error('Error capturing label:', error);
                        this.downloadLabelFallback(product, tempDiv);
                    });
                } else {
                    this.downloadLabelFallback(product, tempDiv);
                }
            }, 500);
        }, 100);
    },

    downloadLabelFallback(product, tempDiv) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 250;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(product.name.substring(0, 30), 250, 40);
        const barcodeCanvas = tempDiv.querySelector('canvas');
        if (barcodeCanvas) {
            ctx.drawImage(barcodeCanvas, 50, 70, 400, 100);
        }
        ctx.fillStyle = '#64748b';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(product.sku, 50, 200);
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(product.price + ' ر.س', 450, 200);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `Label_${product.sku}.png`;
        a.click();
        document.body.removeChild(tempDiv);
    },

    generateSettingsPreview() {
        const container = document.getElementById('previewLabelsGrid');
        if (!container) return;

        container.innerHTML = '';
        const products = VeilStorage.getProducts().slice(0, 8);

        if (products.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #94a3b8;">لا توجد منتجات لعرضها</p>';
            return;
        }

        const settings = VeilStorage.getSettings();
        const gridDiv = document.createElement('div');
        gridDiv.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, ${settings.labelWidth}cm);
            gap: 0.5cm;
            justify-content: center;
        `;

        products.forEach(product => {
            const labelData = this.createLabelHTML(product);
            const labelDiv = document.createElement('div');
            labelDiv.innerHTML = labelData.html;
            labelDiv.style.transform = 'scale(0.6)';
            labelDiv.style.transformOrigin = 'top right';
            gridDiv.appendChild(labelDiv.firstElementChild);
        });

        container.appendChild(gridDiv);

        setTimeout(() => {
            products.forEach(product => {
                const barcodeId = `barcode_${product.id}`;
                this.generateBarcode(barcodeId, product.sku);
            });
        }, 100);
    },

    updateLivePreview(formData) {
        const previewBarcode = document.getElementById('previewBarcode');
        const productName = document.querySelector('.label-preview .product-name');
        const productPrice = document.querySelector('.label-preview .product-price');
        const skuText = document.querySelector('.label-preview .sku-text');

        if (productName) productName.textContent = formData.name || 'اسم المنتج';
        if (productPrice) productPrice.textContent = formData.price ? `${formData.price} ر.س` : '--- ر.س';
        this.updatePreviewMeasurements(formData.measurements || {});

        if (formData.category && formData.fabric) {
            const sku = `${formData.category}${new Date().getFullYear().toString().slice(-2)}XXXXX-${formData.fabric}`;
            if (skuText) skuText.textContent = sku;
            const skuPreview = document.getElementById('skuPreview');
            if (skuPreview) skuPreview.textContent = sku.replace('XXXXX', '●●●●●');
            if (previewBarcode) {
                const tempSku = sku.replace('XXXXX', '00000');
                this.generateBarcode('previewBarcode', tempSku);
            }
        } else {
            if (skuText) skuText.textContent = '---';
            if (previewBarcode) previewBarcode.innerHTML = '<i class="fas fa-barcode" style="font-size: 2.5rem;"></i>';
            const skuPreview = document.getElementById('skuPreview');
            if (skuPreview) skuPreview.textContent = 'سيتم التوليد تلقائياً';
        }
    },

    updatePreviewMeasurements(measurements) {
        const keys = ['length', 'width', 'sleeve', 'shoulder', 'collar'];

        keys.forEach(key => {
            const element = document.querySelector(`[data-measurement="${key}"]`);
            if (!element) return;

            const value = measurements[key] === undefined || measurements[key] === null
                ? ''
                : String(measurements[key]).trim();

            if (!value) {
                element.textContent = '---';
                return;
            }

            element.textContent = /(سم|cm|مم|mm)$/i.test(value) ? value : `${value} سم`;
        });
    },

    /**
     * وظيفة تحديث مقاس الصفحة ديناميكياً لضمان اختيار المتصفح للمقاس الصحيح
     */
    updatePrintPageSize() {
        const settings = VeilStorage.getSettings();
        const width = settings.labelWidth || 5;
        const height = settings.labelHeight || 2.5;

        let styleTag = document.getElementById('dynamic-print-page-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-print-page-style';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
            @media print {
                @page {
                    size: ${width}cm ${height}cm;
                    margin: 0;
                }
                html,
                body {
                    width: ${width}cm !important;
                    min-width: ${width}cm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #fff !important;
                    overflow: visible !important;
                }
                body * {
                    visibility: hidden !important;
                }
                #printArea,
                #printArea * {
                    visibility: visible !important;
                }
                #printArea {
                    position: absolute !important;
                    top: 0 !important;
                    right: 0 !important;
                    width: ${width}cm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    background: #fff !important;
                }
                #printArea > div {
                    width: ${width}cm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                #printArea .print-label {
                    width: ${width}cm !important;
                    height: ${height}cm !important;
                    max-width: ${width}cm !important;
                    max-height: ${height}cm !important;
                    margin: 0 !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                    break-after: page !important;
                    page-break-after: always !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                #printArea .print-label:last-child {
                    break-after: auto !important;
                    page-break-after: auto !important;
                }
                #printArea .print-label,
                #printArea .print-label * {
                    color: #000 !important;
                    text-shadow: none !important;
                    box-sizing: border-box !important;
                }
                #printArea svg {
                    shape-rendering: crispEdges !important;
                }
            }
        `;
    }
};
