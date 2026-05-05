/**
 * VeilFlow - Label Templates with Logo Support
 * قوالب الملصقات مع دعم اللوجو
 */

const LabelTemplates = {
    measurementLabels: {
        length: 'الطول',
        width: 'العرض',
        sleeve: 'الكم',
        shoulder: 'الكتف',
        collar: 'الياقة'
    },

    formatMeasurementValue(value) {
        const text = value === undefined || value === null ? '' : String(value).trim();
        if (!text) return '';
        return /(سم|cm|مم|mm)$/i.test(text) ? text : `${text} سم`;
    },

    getMeasurementEntries(product) {
        const measurements = product.measurements || {};
        return Object.entries(this.measurementLabels)
            .map(([key, label]) => ({
                label,
                value: this.formatMeasurementValue(measurements[key])
            }))
            .filter(item => item.value);
    },

    renderMeasurements(product, settings, options = {}) {
        const entries = this.getMeasurementEntries(product);
        if (entries.length === 0) return '';

        const height = settings.labelHeight || 15;
        const isLargeLabel = height >= 8;
        const borderColor = options.borderColor || '#e2e8f0';
        const headingColor = options.headingColor || '#1a472a';
        const labelColor = options.labelColor || '#64748b';
        const valueColor = options.valueColor || '#0f172a';
        const background = options.background || '#ffffff';
        const headingSize = isLargeLabel ? '12px' : '7px';
        const labelSize = isLargeLabel ? '10px' : '6px';
        const valueSize = isLargeLabel ? '12px' : '7px';
        const padding = isLargeLabel ? '0.12cm' : '0.04cm';
        const gap = isLargeLabel ? '0.1cm' : '0.03cm';

        return `
            <div style="
                margin: ${isLargeLabel ? '0.12cm 0' : '0.03cm 0'};
                padding: ${padding};
                border: 1px solid ${borderColor};
                border-radius: 4px;
                background: ${background};
                font-family: 'Cairo', sans-serif;
                direction: rtl;
            ">
                <div style="font-size: ${headingSize}; font-weight: 800; color: ${headingColor}; margin-bottom: ${gap}; text-align: center;">
                    مقاسات الثوب
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${gap};">
                    ${entries.map(item => `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.08cm; min-width: 0; border-bottom: 1px dotted ${borderColor}; padding-bottom: 0.03cm;">
                            <span style="font-size: ${labelSize}; color: ${labelColor}; white-space: nowrap;">${item.label}</span>
                            <strong style="font-size: ${valueSize}; color: ${valueColor}; font-family: 'Inter', sans-serif; white-space: nowrap;">${item.value}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Template 1: Classic - Full Text with Logo
     */
    classic(product, barcodeId, settings) {
        const width = settings.labelWidth || 5;
        const height = settings.labelHeight || 2.5;
        const showLogo = settings.showLogoOnLabel && settings.shopLogo;

        return `
            <div class="print-label" style="
                width: ${width}cm; 
                height: ${height}cm; 
                display: flex;
                flex-direction: column;
                border: 1px solid #ddd; 
                background: white; 
                page-break-inside: avoid;
                padding: 0.1cm 0.12cm;
                box-sizing: border-box;
            ">
                ${showLogo ? `
                <div style="text-align: center; margin-bottom: 0.05cm;">
                    <img src="${settings.shopLogo}" style="max-width: 0.8cm; max-height: 0.8cm; object-fit: contain;">
                </div>
                ` : ''}
                
                <div style="
                    text-align: center;
                    font-size: 11px;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1.2;
                    font-family: 'Cairo', sans-serif;
                    margin-bottom: 0.06cm;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    hyphens: auto;
                ">
                    ${product.name}
                </div>

                ${this.renderMeasurements(product, settings)}
                
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; margin: 0.1cm 0; min-height: 0.8cm; overflow: hidden;">
                    <div id="${barcodeId}" style="width: 100%; max-width: 100%; display: flex; align-items: center; justify-content: center;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-family: 'Inter', monospace; padding-top: 0.04cm; border-top: 1px solid #e2e8f0;">
                    <div style="font-weight: 700; color: #059669; white-space: nowrap; font-size: 11px;">${product.price} ر.س</div>
                    <div style="font-weight: 600; color: #64748b; font-size: 9px;">${product.sku}</div>
                </div>
            </div>
        `;
    },

    /**
     * Template 2: Modern Elegant - Full Text with Logo
     */
    modernElegant(product, barcodeId, settings) {
        const width = settings.labelWidth || 5;
        const height = settings.labelHeight || 2.5;
        const showLogo = settings.showLogoOnLabel && settings.shopLogo;

        return `
            <div class="print-label" style="
                width: ${width}cm; 
                height: ${height}cm; 
                display: flex;
                flex-direction: column;
                border: none;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                page-break-inside: avoid;
                padding: 0.12cm;
                box-sizing: border-box;
            ">
                <div style="background: linear-gradient(90deg, #1a472a 0%, #059669 100%); padding: 0.08cm; border-radius: 3px; margin-bottom: 0.08cm; min-height: 0.4cm; display: flex; align-items: center; gap: 0.1cm;">
                    ${showLogo ? `
                    <img src="${settings.shopLogo}" style="max-width: 0.6cm; max-height: 0.6cm; object-fit: contain; filter: brightness(0) invert(1);">
                    ` : ''}
                    <div style="
                        flex: 1;
                        text-align: center;
                        font-size: 10px;
                        font-weight: 700;
                        color: white;
                        line-height: 1.2;
                        font-family: 'Cairo', sans-serif;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    ">
                        ${product.name}
                    </div>
                </div>

                ${this.renderMeasurements(product, settings, {
                    borderColor: '#d1fae5',
                    headingColor: '#047857',
                    background: '#ffffff'
                })}
                
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: white; border-radius: 3px; padding: 0.1cm; min-height: 0.8cm;">
                    <div id="${barcodeId}" style="width: 100%;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.05cm; padding: 0.05cm; background: #f1f5f9; border-radius: 3px;">
                    <div style="font-size: 12px; font-weight: 800; color: #059669; font-family: 'Inter';">${product.price} ر.س</div>
                    <div style="font-size: 8px; font-weight: 600; color: #475569; font-family: 'Inter';">${product.sku}</div>
                </div>
            </div>
        `;
    },

    /**
     * Template 3: Premium with Decorative Border and Logo
     */
    premium(product, barcodeId, settings) {
        const width = settings.labelWidth || 5;
        const height = settings.labelHeight || 2.5;
        const showLogo = settings.showLogoOnLabel && settings.shopLogo;

        return `
            <div class="print-label" style="
                width: ${width}cm; 
                height: ${height}cm; 
                display: flex;
                flex-direction: column;
                border: 2px solid #c9a961;
                background: white;
                page-break-inside: avoid;
                padding: 0.05cm;
                box-sizing: border-box;
                position: relative;
            ">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #c9a961, #d4af37, #c9a961);"></div>
                
                ${showLogo ? `
                <div style="text-align: center; margin-bottom: 0.02cm;">
                    <img src="${settings.shopLogo}" style="max-width: 0.5cm; max-height: 0.5cm; object-fit: contain;">
                </div>
                ` : ''}
                
                <div style="
                    text-align: center;
                    font-size: 10px;
                    font-weight: 700;
                    color: #1a472a;
                    line-height: 1.1;
                    font-family: 'Cairo', sans-serif;
                    margin-bottom: 0.02cm;
                    padding: 0.02cm 0;
                    border-bottom: 1px dashed #c9a961;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    max-height: ${showLogo ? height * 0.18 : height * 0.22}cm;
                    overflow: hidden;
                ">
                    ${product.name}
                </div>

                ${this.renderMeasurements(product, settings, {
                    borderColor: '#c9a961',
                    headingColor: '#1a472a',
                    labelColor: '#6b5d42',
                    background: '#fef9e7'
                })}
                
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.02cm 0; min-height: 0;">
                    <div id="${barcodeId}" style="max-width: 95%; max-height: 100%;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.02cm 0.03cm; background: #fef9e7; border-top: 1px dashed #c9a961;">
                    <div style="font-size: 10px; font-weight: 800; color: #1a472a; font-family: 'Inter';">${product.price} ر.س</div>
                    <div style="font-size: 8px; font-weight: 600; color: #6b5d42; font-family: 'Inter';">${product.sku}</div>
                </div>
            </div>
        `;
    },

    /**
     * Template 4: Minimalist Clean with Logo
     */
    minimalist(product, barcodeId, settings) {
        const width = settings.labelWidth || 5;
        const height = settings.labelHeight || 2.5;
        const showLogo = settings.showLogoOnLabel && settings.shopLogo;

        return `
            <div class="print-label" style="
                width: ${width}cm; 
                height: ${height}cm; 
                display: flex;
                flex-direction: column;
                border: 1px solid #e2e8f0;
                background: white;
                page-break-inside: avoid;
                padding: 0.15cm;
                box-sizing: border-box;
            ">
                ${showLogo ? `
                <div style="text-align: center; margin-bottom: 0.05cm;">
                    <img src="${settings.shopLogo}" style="max-width: 0.8cm; max-height: 0.8cm; object-fit: contain;">
                </div>
                ` : ''}
                
                <div style="
                    text-align: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #0f172a;
                    line-height: 1.2;
                    font-family: 'Cairo', sans-serif;
                    margin-bottom: 0.1cm;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                ">
                    ${product.name}
                </div>

                ${this.renderMeasurements(product, settings, {
                    borderColor: '#e2e8f0',
                    headingColor: '#0f172a'
                })}
                
                <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                    <div id="${barcodeId}" style="max-width: 100%; max-height: 100%;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.08cm;">
                    <div style="font-size: 13px; font-weight: 700; color: #059669; font-family: 'Inter';">${product.price} ر.س</div>
                    <div style="font-size: 9px; font-weight: 500; color: #94a3b8; font-family: 'Inter'; letter-spacing: 0.5px;">${product.sku}</div>
                </div>
            </div>
        `;
    },

    /**
     * Template 5: Colorful Brand with Logo
     */
    colorful(product, barcodeId, settings) {
        const width = settings.labelWidth || 5;
        const height = settings.labelHeight || 2.5;
        const showLogo = settings.showLogoOnLabel && settings.shopLogo;

        return `
            <div class="print-label" style="
                width: ${width}cm; 
                height: ${height}cm; 
                display: flex;
                flex-direction: column;
                border: none;
                background: white;
                page-break-inside: avoid;
                padding: 0;
                box-sizing: border-box;
                overflow: hidden;
            ">
                <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 0.1cm; display: flex; align-items: center; min-height: 0.5cm; gap: 0.08cm;">
                    ${showLogo ? `
                    <img src="${settings.shopLogo}" style="max-width: 0.6cm; max-height: 0.6cm; object-fit: contain; filter: brightness(0) invert(1);">
                    ` : ''}
                    <div style="
                        font-size: 10px;
                        font-weight: 700;
                        color: white;
                        line-height: 1.2;
                        font-family: 'Cairo', sans-serif;
                        flex: 1;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    ">
                        ${product.name}
                    </div>
                    <div style="font-size: 11px; font-weight: 800; color: #fbbf24; font-family: 'Inter'; white-space: nowrap;">${product.price}</div>
                </div>

                ${this.renderMeasurements(product, settings, {
                    borderColor: '#bbf7d0',
                    headingColor: '#047857',
                    labelColor: '#475569',
                    background: '#f8fafc'
                })}
                
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 0.08cm; background: #f8fafc;">
                    <div id="${barcodeId}" style="max-width: 100%; max-height: 100%;"></div>
                </div>
                
                <div style="background: #1e293b; padding: 0.05cm 0.08cm; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #fbbf24; font-family: 'Inter';">${product.price} ر.س</div>
                    <div style="font-size: 8px; font-weight: 600; color: #94a3b8; font-family: 'Inter';">${product.sku}</div>
                </div>
            </div>
        `;
    }
};
