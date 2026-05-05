/**
 * VeilFlow - Storage Management System
 * نظام إدارة التخزين المحلي
 */

const VeilStorage = {
    // Storage Keys
    KEYS: {
        PRODUCTS: 'veilflow_products',
        SETTINGS: 'veilflow_settings',
        SEQUENCES: 'veilflow_sequences',
        STATS: 'veilflow_stats'
    },

    /**
     * Initialize Storage
     * تهيئة التخزين
     */
    init() {
        if (!this.getData(this.KEYS.PRODUCTS)) {
            this.setData(this.KEYS.PRODUCTS, []);
        }
        if (!this.getData(this.KEYS.SETTINGS)) {
            this.setData(this.KEYS.SETTINGS, this.getDefaultSettings());
        }
        if (!this.getData(this.KEYS.SEQUENCES)) {
            this.setData(this.KEYS.SEQUENCES, {});
        }
        if (!this.getData(this.KEYS.STATS)) {
            this.setData(this.KEYS.STATS, {
                totalPrints: 0,
                todayPrints: 0,
                lastPrintDate: null
            });
        }
    },

    /**
     * Get data from localStorage
     */
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    /**
     * Set data to localStorage
     */
    setData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    },

    /**
     * Get all products
     */
    getProducts() {
        return this.getData(this.KEYS.PRODUCTS) || [];
    },

    /**
     * Add new product
     */
    addProduct(product) {
        const products = this.getProducts();
        product.id = this.generateId();
        product.createdAt = new Date().toISOString();
        products.push(product);
        this.setData(this.KEYS.PRODUCTS, products);
        return product;
    },

    /**
     * Update product
     */
    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            this.setData(this.KEYS.PRODUCTS, products);
            return products[index];
        }
        return null;
    },

    /**
     * Delete product
     */
    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        this.setData(this.KEYS.PRODUCTS, filtered);
        return true;
    },

    /**
     * Get product by ID
     */
    getProduct(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    },

    /**
     * Get next sequence number for category
     */
    getNextSequence(category) {
        const sequences = this.getData(this.KEYS.SEQUENCES);
        const key = `${category}_${new Date().getFullYear()}`;
        const current = sequences[key] || 0;
        const next = current + 1;
        sequences[key] = next;
        this.setData(this.KEYS.SEQUENCES, sequences);
        return next;
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Get settings
     */
    getSettings() {
        const settings = this.getData(this.KEYS.SETTINGS) || this.getDefaultSettings();
        const oldDefaultPaper = settings.paperSize === 'custom' &&
            Number(settings.labelWidth) === 5 &&
            Number(settings.labelHeight) === 2.5;

        if (!settings.garmentMeasurementsUpdateApplied) {
            const updated = {
                ...settings,
                ...(oldDefaultPaper ? {
                    labelWidth: 10,
                    labelHeight: 15,
                    paperSize: '100x150',
                    paperType: 'thermal'
                } : {}),
                garmentMeasurementsUpdateApplied: true
            };
            this.setData(this.KEYS.SETTINGS, updated);
            return updated;
        }

        return settings;
    },

    /**
     * Update settings
     */
    updateSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        this.setData(this.KEYS.SETTINGS, updated);
        return updated;
    },

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            labelWidth: 10,
            labelHeight: 15,
            paperSize: '100x150', // المقاس المحدد: 50x25, 57x40, 60x40, 50x40, 100x150, 100x100، أو custom
            paperType: 'thermal',
            marginTop: 10,
            marginRight: 10,
            marginBottom: 10,
            marginLeft: 10,
            fontSize: 10,
            labelTemplate: 'classic',
            shopName: '',
            shopLogo: '',
            showLogoOnLabel: false,
            garmentMeasurementsUpdateApplied: true
        };
    },

    /**
     * Get statistics
     */
    getStats() {
        const stats = this.getData(this.KEYS.STATS);
        const today = new Date().toDateString();

        // Reset today's count if it's a new day
        if (stats.lastPrintDate !== today) {
            stats.todayPrints = 0;
            stats.lastPrintDate = today;
            this.setData(this.KEYS.STATS, stats);
        }

        return stats;
    },

    /**
     * Increment print count
     */
    incrementPrintCount(count = 1) {
        const stats = this.getStats();
        stats.totalPrints += count;
        stats.todayPrints += count;
        stats.lastPrintDate = new Date().toDateString();
        this.setData(this.KEYS.STATS, stats);
    },

    /**
     * Export all data
     */
    exportData() {
        return {
            products: this.getProducts(),
            settings: this.getSettings(),
            sequences: this.getData(this.KEYS.SEQUENCES),
            stats: this.getStats(),
            exportDate: new Date().toISOString()
        };
    },

    /**
     * Import data
     */
    importData(data) {
        try {
            if (data.products) this.setData(this.KEYS.PRODUCTS, data.products);
            if (data.settings) this.setData(this.KEYS.SETTINGS, data.settings);
            if (data.sequences) this.setData(this.KEYS.SEQUENCES, data.sequences);
            if (data.stats) this.setData(this.KEYS.STATS, data.stats);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    /**
     * Clear all data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    },

    /**
     * Search products
     */
    searchProducts(query) {
        const products = this.getProducts();
        const lowerQuery = query.toLowerCase();
        return products.filter(p => {
            const measurements = p.measurements || {};
            const measurementText = Object.values(measurements).join(' ');
            return p.name.toLowerCase().includes(lowerQuery) ||
                p.sku.toLowerCase().includes(lowerQuery) ||
                measurementText.toLowerCase().includes(lowerQuery);
        });
    },

    /**
     * Get products by date range
     */
    getProductsByDateRange(startDate, endDate) {
        const products = this.getProducts();
        return products.filter(p => {
            const createdDate = new Date(p.createdAt);
            return createdDate >= startDate && createdDate <= endDate;
        });
    },

    /**
     * Get products this month
     */
    getProductsThisMonth() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return this.getProductsByDateRange(startOfMonth, endOfMonth);
    }
};

// Initialize storage on load
VeilStorage.init();
