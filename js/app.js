/**
 * VeilFlow - Main Application Controller
 * المتحكم الرئيسي للتطبيق
 */

const VeilFlow = {
    selectedProducts: new Set(),
    currentSection: 'dashboard',

    /**
     * Initialize Application
     */
    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.loadSettings();
        this.navigateTo('dashboard');
    },

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateTo(section);
            });
        });

        // Product Form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
            productForm.addEventListener('reset', () => this.resetForm());

            // Live preview on input
            [
                'productName',
                'productPrice',
                'productCategory',
                'productFabric',
                'productLength',
                'productWidth',
                'productSleeve',
                'productShoulder',
                'productCollar'
            ].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', () => this.updateFormPreview());
                }
            });
        }

        const editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        }

        // Search
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Bulk Actions
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }

        const selectAllBtn = document.getElementById('selectAll');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                const checkbox = document.getElementById('selectAllCheckbox');
                checkbox.checked = !checkbox.checked;
                this.toggleSelectAll(checkbox.checked);
            });
        }

        const printSelectedBtn = document.getElementById('printSelected');
        if (printSelectedBtn) {
            printSelectedBtn.addEventListener('click', () => this.printSelected());
        }

        // Settings
        const saveSettingsBtn = document.getElementById('saveSettings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        const resetSettingsBtn = document.getElementById('resetSettings');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }

        // Font size slider
        const fontSizeSlider = document.getElementById('fontSize');
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', (e) => {
                document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            });
        }

        // Export/Import
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const importBtn = document.getElementById('importData');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        // Logo Upload
        const logoInput = document.getElementById('shopLogo');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        // Paper Size Selection
        const paperSizeSelect = document.getElementById('paperSize');
        if (paperSizeSelect) {
            paperSizeSelect.addEventListener('change', (e) => this.handlePaperSizeChange(e.target.value));
        }

        // Mobile Menu Toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebar = document.querySelector('.sidebar');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Close mobile menu when nav item is clicked
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });
    },

    /**
     * Navigate to section
     */
    navigateTo(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        // Update sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId)?.classList.add('active');

        this.currentSection = sectionId;

        // Load section data
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'labels-gallery':
                this.loadProductsGallery();
                break;
            case 'print-settings':
                this.loadSettings();
                LabelGenerator.generateSettingsPreview();
                break;
        }
    },

    /**
     * Update Dashboard
     */
    updateDashboard() {
        const products = VeilStorage.getProducts();
        const stats = VeilStorage.getStats();
        const thisMonthProducts = VeilStorage.getProductsThisMonth();

        // Update stats
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('todayPrints').textContent = stats.todayPrints;
        document.getElementById('totalLabels').textContent = products.length;
        document.getElementById('thisMonth').textContent = thisMonthProducts.length;

        // Update recent products
        this.loadRecentProducts();
    },

    /**
     * Load Recent Products
     */
    loadRecentProducts() {
        const container = document.getElementById('recentProductsList');
        if (!container) return;

        const products = VeilStorage.getProducts().slice(-5).reverse(); // Last 5 products

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>لا توجد منتجات بعد</p>
                    <button class="btn-primary" onclick="VeilFlow.navigateTo('add-product')">إضافة منتج جديد</button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; border-right: 4px solid #059669;">
                <div style="flex: 1;">
                    <h4 style="color: #1e293b; margin-bottom: 0.25rem;">${product.name}</h4>
                    <p style="color: #64748b; font-size: 0.875rem; font-family: 'Inter', monospace;">${product.sku}</p>
                </div>
                <div style="text-align: left;">
                    <strong style="color: #059669; font-size: 1.25rem; font-family: 'Inter';">${product.price} ر.س</strong>
                </div>
            </div>
        `).join('');
    },

    /**
     * Handle Product Form Submit
     */
    handleProductSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('productName').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            fabric: document.getElementById('productFabric').value,
            quantity: parseInt(document.getElementById('productQuantity').value, 10) || 0,
            minQuantity: parseInt(document.getElementById('productMinQuantity').value, 10) || 0,
            colors: Array.from(document.getElementById('productColors').selectedOptions).map(option => option.value),
            measurements: this.collectMeasurements('product')
        };

        // Generate SKU
        formData.sku = LabelGenerator.generateSKU(formData.category, formData.fabric);

        // Save product
        const product = VeilStorage.addProduct(formData);

        // Show success message
        this.showNotification('تم إضافة المنتج بنجاح! ✓', 'success');

        // Reset form
        e.target.reset();
        this.resetForm();

        // Update dashboard
        this.updateDashboard();

        // Navigate to gallery
        setTimeout(() => {
            this.navigateTo('labels-gallery');
        }, 1000);
    },

    /**
     * Update form preview
     */
    updateFormPreview() {
        const formData = {
            name: document.getElementById('productName').value.trim(),
            price: document.getElementById('productPrice').value,
            category: document.getElementById('productCategory').value,
            fabric: document.getElementById('productFabric').value,
            measurements: this.collectMeasurements('product')
        };

        LabelGenerator.updateLivePreview(formData);
    },

    /**
     * Reset form
     */
    resetForm() {
        const previewQR = document.getElementById('previewQR');
        if (previewQR) {
            previewQR.innerHTML = '<div class="qr-placeholder"><i class="fas fa-qrcode"></i></div>';
        }

        const productName = document.querySelector('.label-preview .product-name');
        const productPrice = document.querySelector('.label-preview .product-price');
        const skuText = document.querySelector('.label-preview .sku-text');
        const skuPreview = document.getElementById('skuPreview');

        if (productName) productName.textContent = 'اسم المنتج';
        if (productPrice) productPrice.textContent = '--- ر.س';
        if (skuText) skuText.textContent = '---';
        if (skuPreview) skuPreview.textContent = 'سيتم التوليد تلقائياً';
        LabelGenerator.updatePreviewMeasurements({});
    },

    /**
     * Collect garment measurements from add/edit forms
     */
    collectMeasurements(prefix = 'product') {
        const fieldMap = {
            length: `${prefix}Length`,
            width: `${prefix}Width`,
            sleeve: `${prefix}Sleeve`,
            shoulder: `${prefix}Shoulder`,
            collar: `${prefix}Collar`
        };

        return Object.entries(fieldMap).reduce((measurements, [key, id]) => {
            const value = document.getElementById(id)?.value.trim() || '';
            measurements[key] = value;
            return measurements;
        }, {});
    },

    /**
     * Format measurement values for UI
     */
    formatMeasurementValue(value) {
        const text = value === undefined || value === null ? '' : String(value).trim();
        if (!text) return '';
        return /(سم|cm|مم|mm)$/i.test(text) ? text : `${text} سم`;
    },

    /**
     * Render compact garment measurements in gallery
     */
    renderMeasurementsSummary(product) {
        const labels = {
            length: 'الطول',
            width: 'العرض',
            sleeve: 'الكم',
            shoulder: 'الكتف',
            collar: 'الياقة'
        };
        const measurements = product.measurements || {};
        const items = Object.entries(labels)
            .map(([key, label]) => {
                const value = this.formatMeasurementValue(measurements[key]);
                return value ? `<span>${label}: ${value}</span>` : '';
            })
            .filter(Boolean);

        if (items.length === 0) return '<span style="color: #94a3b8;">---</span>';
        return `<div class="measurement-chips">${items.join('')}</div>`;
    },

    /**
     * Render product colors in gallery
     */
    renderColorsSummary(product) {
        const colors = Array.isArray(product.colors) ? product.colors : [];
        if (colors.length === 0) return '<span style="color: #94a3b8;">---</span>';
        return `<div class="color-badges">${colors.map(color => `<span class="color-badge">${color}</span>`).join('')}</div>`;
    },

    /**
     * Load Products Gallery
     */
    loadProductsGallery(products = null) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        const productsList = products || VeilStorage.getProducts();

        if (productsList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>لا توجد منتجات لعرضها</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = productsList.map(product => `
            <tr>
                <td><input type="checkbox" class="product-checkbox" data-id="${product.id}" ${this.selectedProducts.has(product.id) ? 'checked' : ''}></td>
                <td>
                    <div style="width: 80px; height: 40px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #94a3b8;">
                        <i class="fas fa-tag"></i>
                    </div>
                </td>
                <td><strong>${product.name}</strong></td>
                <td><strong style="color: #059669; font-family: 'Inter';">${product.price} ر.س</strong></td>
                <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: 'Inter';">${product.sku}</code></td>
                <td>${this.getCategoryName(product.category)}</td>
                <td>${this.getFabricName(product.fabric)}</td>
                <td><strong style="font-family: 'Inter';">${product.quantity || 0}</strong></td>
                <td>${this.renderColorsSummary(product)}</td>
                <td>${this.renderMeasurementsSummary(product)}</td>
                <td style="font-size: 0.875rem; color: #64748b;">${this.formatDate(product.createdAt)}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="VeilFlow.viewLabel('${product.id}')" class="btn-icon" title="معاينة">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="VeilFlow.downloadQR('${product.id}')" class="btn-icon" title="تحميل QR">
                            <i class="fas fa-qrcode"></i>
                        </button>
                        <button onclick="VeilFlow.printSingle('${product.id}')" class="btn-icon" title="طباعة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button onclick="VeilFlow.openEditModal('${product.id}')" class="btn-icon" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="VeilFlow.deleteProduct('${product.id}')" class="btn-icon btn-danger" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners to checkboxes
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedProducts.add(id);
                } else {
                    this.selectedProducts.delete(id);
                }
                this.updateSelectedCount();
            });
        });

        this.updateSelectedCount();
    },

    /**
     * Handle Search
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.loadProductsGallery();
            return;
        }

        const results = VeilStorage.searchProducts(query);
        this.loadProductsGallery(results);
    },

    /**
     * Toggle Select All
     */
    toggleSelectAll(checked) {
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
            const id = checkbox.dataset.id;
            if (checked) {
                this.selectedProducts.add(id);
            } else {
                this.selectedProducts.delete(id);
            }
        });
        this.updateSelectedCount();
    },

    /**
     * Update selected count
     */
    updateSelectedCount() {
        const count = this.selectedProducts.size;
        document.getElementById('selectedCount').textContent = count;
        document.getElementById('printSelected').disabled = count === 0;
    },

    /**
     * Print Selected
     */
    printSelected() {
        if (this.selectedProducts.size === 0) return;

        const products = Array.from(this.selectedProducts).map(id => VeilStorage.getProduct(id)).filter(p => p);
        LabelGenerator.generateBulkLabels(products);
    },

    /**
     * View Label
     */
    viewLabel(id) {
        const product = VeilStorage.getProduct(id);
        if (!product) return;

        // Create modal or preview
        const modal = this.createModal(
            'معاينة الملصق',
            `<div id="labelPreviewModal"></div>`
        );

        setTimeout(() => {
            LabelGenerator.generatePreview(product, 'labelPreviewModal');
        }, 100);
    },

    /**
     * Download QR
     */
    downloadQR(id) {
        const product = VeilStorage.getProduct(id);
        if (!product) return;
        LabelGenerator.downloadQRCode(product);
    },

    /**
     * Print Single
     */
    printSingle(id) {
        const product = VeilStorage.getProduct(id);
        if (!product) return;
        LabelGenerator.generateBulkLabels([product]);
    },

    /**
     * Open edit modal
     */
    openEditModal(id) {
        const product = VeilStorage.getProduct(id);
        if (!product) return;

        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name || '';
        document.getElementById('editProductPrice').value = product.price || '';
        document.getElementById('editProductQuantity').value = product.quantity || 0;

        const measurements = product.measurements || {};
        document.getElementById('editProductLength').value = measurements.length || '';
        document.getElementById('editProductWidth').value = measurements.width || '';
        document.getElementById('editProductSleeve').value = measurements.sleeve || '';
        document.getElementById('editProductShoulder').value = measurements.shoulder || '';
        document.getElementById('editProductCollar').value = measurements.collar || '';

        const modal = document.getElementById('editModal');
        if (modal) modal.style.display = 'flex';
    },

    /**
     * Close edit modal
     */
    closeEditModal() {
        const modal = document.getElementById('editModal');
        if (modal) modal.style.display = 'none';
    },

    /**
     * Save edit modal changes
     */
    handleEditSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('editProductId').value;
        const updates = {
            name: document.getElementById('editProductName').value.trim(),
            price: parseFloat(document.getElementById('editProductPrice').value),
            quantity: parseInt(document.getElementById('editProductQuantity').value, 10) || 0,
            measurements: this.collectMeasurements('editProduct')
        };

        VeilStorage.updateProduct(id, updates);
        this.closeEditModal();
        this.showNotification('تم حفظ التعديلات بنجاح ✓', 'success');
        this.loadProductsGallery();
        this.updateDashboard();
    },

    /**
     * Delete Product
     */
    deleteProduct(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        VeilStorage.deleteProduct(id);
        this.showNotification('تم حذف المنتج بنجاح', 'success');
        this.loadProductsGallery();
        this.updateDashboard();
    },

    /**
     * Load Settings
     */
    loadSettings() {
        const settings = VeilStorage.getSettings();

        // Load paper size
        const paperSizeSelect = document.getElementById('paperSize');
        if (paperSizeSelect) {
            paperSizeSelect.value = settings.paperSize || 'custom';
            // Update dimensions based on selected size
            this.handlePaperSizeChange(settings.paperSize || 'custom', false);
        }

        document.getElementById('labelWidth').value = settings.labelWidth;
        document.getElementById('labelHeight').value = settings.labelHeight;
        document.getElementById('paperType').value = settings.paperType;
        document.getElementById('marginTop').value = settings.marginTop;
        document.getElementById('marginRight').value = settings.marginRight;
        document.getElementById('marginBottom').value = settings.marginBottom;
        document.getElementById('marginLeft').value = settings.marginLeft;
        document.getElementById('fontSize').value = settings.fontSize;
        document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';

        const templateSelect = document.getElementById('labelTemplate');
        if (templateSelect) {
            templateSelect.value = settings.labelTemplate || 'classic';
        }

        // Load shop settings
        const shopNameInput = document.getElementById('shopName');
        if (shopNameInput) {
            shopNameInput.value = settings.shopName || '';
        }

        const showLogoCheckbox = document.getElementById('showLogoOnLabel');
        if (showLogoCheckbox) {
            showLogoCheckbox.checked = settings.showLogoOnLabel || false;
        }

        // Display logo preview if exists - with delay to ensure DOM is ready
        setTimeout(() => {
            if (settings.shopLogo) {
                this.displayLogoPreview(settings.shopLogo);
            }
        }, 100);
    },

    /**
     * Save Settings
     */
    saveSettings() {
        const settings = VeilStorage.getSettings(); // Get current settings to preserve logo

        const updatedSettings = {
            labelWidth: parseFloat(document.getElementById('labelWidth').value),
            labelHeight: parseFloat(document.getElementById('labelHeight').value),
            paperSize: document.getElementById('paperSize').value,
            paperType: document.getElementById('paperType').value,
            marginTop: parseInt(document.getElementById('marginTop').value),
            marginRight: parseInt(document.getElementById('marginRight').value),
            marginBottom: parseInt(document.getElementById('marginBottom').value),
            marginLeft: parseInt(document.getElementById('marginLeft').value),
            fontSize: parseInt(document.getElementById('fontSize').value),
            labelTemplate: document.getElementById('labelTemplate').value,
            shopName: document.getElementById('shopName').value,
            shopLogo: settings.shopLogo || '', // Preserve existing logo
            showLogoOnLabel: document.getElementById('showLogoOnLabel')?.checked || false
        };

        VeilStorage.updateSettings(updatedSettings);
        this.showNotification('تم حفظ الإعدادات بنجاح ✓', 'success');
        LabelGenerator.generateSettingsPreview();
        // تحديث مقاس الطباعة فوراً
        LabelGenerator.updatePrintPageSize();
    },

    /**
     * Reset Settings
     */
    resetSettings() {
        if (!confirm('هل أنت متأكد من إعادة الإعدادات للوضع الافتراضي؟')) return;

        const defaults = VeilStorage.getDefaultSettings();
        VeilStorage.updateSettings(defaults);
        this.loadSettings();
        this.showNotification('تم إعادة الإعدادات للوضع الافتراضي', 'success');
        LabelGenerator.generateSettingsPreview();
    },

    /**
     * Export Data
     */
    exportData() {
        const data = VeilStorage.exportData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veilflow_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('تم تصدير البيانات بنجاح', 'success');
    },

    /**
     * Import Data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('هل أنت متأكد من استيراد هذه البيانات؟ سيتم استبدال البيانات الحالية.')) {
                        VeilStorage.importData(data);
                        this.showNotification('تم استيراد البيانات بنجاح', 'success');
                        this.updateDashboard();
                        this.loadProductsGallery();
                    }
                } catch (error) {
                    this.showNotification('خطأ في قراءة الملف', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    /**
     * Helper: Get Category Name
     */
    getCategoryName(code) {
        const categories = {
            'V': 'نقاب',
            'S': 'ستايل',
            'A': 'إكسسوارات',
            'C': 'عباءات'
        };
        return categories[code] || code;
    },

    /**
     * Helper: Get Fabric Name
     */
    getFabricName(code) {
        const fabrics = {
            'F': 'قماش',
            'C': 'قطن',
            'S': 'معدني',
            'P': 'بوليستر',
            'M': 'مخلوط'
        };
        return fabrics[code] || code;
    },

    /**
     * Helper: Format Date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Show Notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Create Modal
     */
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            max-width: 700px;
            width: 90%;
            max-height: 90vh;
            overflow: auto;
        `;

        modalContent.innerHTML = `
            <h2 style="margin-bottom: 1rem; color: #1a472a;">${title}</h2>
            ${content}
            <button onclick="this.closest('[style*=fixed]').remove()" class="btn-secondary" style="margin-top: 1rem; width: 100%;">إغلاق</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        return modal;
    },

    /**
     * Handle Logo Upload
     */
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('الرجاء اختيار صورة صحيحة', 'error');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('حجم الصورة كبير جداً (الحد الأقصى 2MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const logoData = e.target.result;

            // Save to settings
            const settings = VeilStorage.getSettings();
            settings.shopLogo = logoData;
            VeilStorage.updateSettings(settings);

            // Display preview
            this.displayLogoPreview(logoData);
            this.showNotification('تم رفع اللوجو بنجاح', 'success');
        };
        reader.readAsDataURL(file);
    },

    /**
     * Display Logo Preview
     */
    displayLogoPreview(logoData) {
        const logoInput = document.getElementById('shopLogo');
        if (!logoInput) return;

        let preview = logoInput.parentElement.querySelector('.logo-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'logo-preview';
            preview.style.cssText = 'margin-top: 0.5rem; text-align: center;';
            logoInput.parentElement.appendChild(preview);
        }

        preview.innerHTML = `
            <img src="${logoData}" style="max-width: 100px; max-height: 100px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <button type="button" onclick="VeilFlow.removeLogo()" style="display: block; margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">حذف اللوجو</button>
        `;
    },

    /**
     * Remove Logo
     */
    removeLogo() {
        const settings = VeilStorage.getSettings();
        settings.shopLogo = '';
        VeilStorage.updateSettings(settings);

        const preview = document.querySelector('.logo-preview');
        if (preview) preview.remove();

        const logoInput = document.getElementById('shopLogo');
        if (logoInput) logoInput.value = '';

        this.showNotification('تم حذف اللوجو', 'success');
        LabelGenerator.generateSettingsPreview();
    },

    /**
     * Handle Paper Size Change
     */
    handlePaperSizeChange(sizeValue, updatePreview = true) {
        const widthInput = document.getElementById('labelWidth');
        const heightInput = document.getElementById('labelHeight');

        // تعريف المقاسات المحددة مسبقاً بالسنتيمتر
        const paperSizes = {
            '50x25': { width: 5.0, height: 2.5 },
            '50x40': { width: 5.0, height: 4.0 },
            '57x40': { width: 5.7, height: 4.0 },
            '60x40': { width: 6.0, height: 4.0 },
            '100x100': { width: 10.0, height: 10.0 },
            '100x150': { width: 10.0, height: 15.0 }
        };

        if (sizeValue === 'custom') {
            // تفعيل حقول الإدخال اليدوي
            widthInput.disabled = false;
            heightInput.disabled = false;
            widthInput.style.opacity = '1';
            heightInput.style.opacity = '1';
        } else if (paperSizes[sizeValue]) {
            // تحديث الأبعاد بناءً على المقاس المحدد
            widthInput.value = paperSizes[sizeValue].width;
            heightInput.value = paperSizes[sizeValue].height;
            // تعطيل حقول الإدخال اليدوي
            widthInput.disabled = true;
            heightInput.disabled = true;
            widthInput.style.opacity = '0.6';
            heightInput.style.opacity = '0.6';
        }

        // تحديث المعاينة إذا لزم الأمر
        if (updatePreview) {
            LabelGenerator.generateSettingsPreview();
        }
    },

    /**
     * Toggle Mobile Menu
     */
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const menuIcon = document.querySelector('#mobileMenuToggle i');

        if (sidebar && overlay) {
            const isActive = sidebar.classList.toggle('active');

            if (isActive) {
                overlay.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                if (menuIcon) menuIcon.className = 'fas fa-times';
            } else {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                if (menuIcon) menuIcon.className = 'fas fa-bars';
            }
        }
    },

    /**
     * Close Mobile Menu
     */
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const menuIcon = document.querySelector('#mobileMenuToggle i');

        if (sidebar) {
            sidebar.classList.remove('active');
        }
        if (overlay) {
            overlay.style.display = 'none';
        }
        document.body.style.overflow = '';
        if (menuIcon) menuIcon.className = 'fas fa-bars';
    }
};

// Make navigateTo globally accessible
window.navigateTo = (section) => VeilFlow.navigateTo(section);

// Make navigateTo globally accessible
window.navigateTo = (section) => VeilFlow.navigateTo(section);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    VeilFlow.init();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
    .btn-icon {
        padding: 0.5rem;
        border: none;
        background: #f1f5f9;
        color: #475569;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-icon:hover {
        background: #e2e8f0;
        transform: translateY(-2px);
    }
    .btn-icon.btn-danger {
        background: #fee2e2;
        color: #dc2626;
    }
    .btn-icon.btn-danger:hover {
        background: #fecaca;
    }
`;
document.head.appendChild(style);
