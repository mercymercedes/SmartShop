// SmartShop - Grocery Price Comparison App
// Main JavaScript functionality

// Global state management
let appState = {
    products: [],
    stores: ['billa', 'spar', 'hofer', 'merkur', 'penny', 'lidl'],
    storeNames: {
        'billa': 'Billa',
        'spar': 'Spar',
        'hofer': 'Hofer',
        'merkur': 'Merkur',
        'penny': 'Penny',
        'lidl': 'Lidl'
    },
    priceHistory: {},
    shoppingLists: [],
    userPreferences: {}
};

// Sample Vienna product data
const sampleProducts = [
    {
        id: 'milch-1l',
        name: 'Milch 1L',
        category: 'dairy',
        prices: {
            'hofer': { price: 0.89, lastUpdated: '2025-09-30' },
            'lidl': { price: 0.95, lastUpdated: '2025-09-30' },
            'billa': { price: 1.19, lastUpdated: '2025-09-30' },
            'spar': { price: 1.15, lastUpdated: '2025-09-30' },
            'merkur': { price: 1.25, lastUpdated: '2025-09-30' },
            'penny': { price: 0.99, lastUpdated: '2025-09-30' }
        },
        image: 'resources/products-dairy.jpg'
    },
    {
        id: 'bread-whole-wheat',
        name: 'Whole Wheat Bread',
        size: '1 loaf',
        category: 'bakery',
        prices: {
            walmart: { price: 1.89, lastUpdated: '2025-09-30' },
            kroger: { price: 2.19, lastUpdated: '2025-09-30' },
            aldi: { price: 1.49, lastUpdated: '2025-09-30' },
            publix: { price: 2.49, lastUpdated: '2025-09-30' },
            'whole-foods': { price: 3.99, lastUpdated: '2025-09-30' }
        },
        image: 'resources/products-pantry.jpg'
    },
    {
        id: 'eggs-large-dozen',
        name: 'Large Eggs',
        size: '1 dozen',
        category: 'dairy',
        prices: {
            walmart: { price: 2.79, lastUpdated: '2025-09-30' },
            kroger: { price: 2.99, lastUpdated: '2025-09-30' },
            aldi: { price: 2.49, lastUpdated: '2025-09-30' },
            publix: { price: 3.29, lastUpdated: '2025-09-30' },
            'whole-foods': { price: 4.99, lastUpdated: '2025-09-30' }
        },
        image: 'resources/products-dairy.jpg'
    },
    {
        id: 'bananas-per-lb',
        name: 'Bananas',
        size: 'per lb',
        category: 'produce',
        prices: {
            walmart: { price: 0.59, lastUpdated: '2025-09-30' },
            kroger: { price: 0.69, lastUpdated: '2025-09-30' },
            aldi: { price: 0.49, lastUpdated: '2025-09-30' },
            publix: { price: 0.79, lastUpdated: '2025-09-30' },
            'whole-foods': { price: 0.99, lastUpdated: '2025-09-30' }
        },
        image: 'resources/products-produce.jpg'
    }
];

// Initialize app with sample data
function loadSampleProducts() {
    appState.products = [...sampleProducts];
    renderProductGrid();
}

// Add new product functionality
function addProduct() {
    const nameInput = document.getElementById('product-name');
    const sizeInput = document.getElementById('product-size');
    const storeSelect = document.getElementById('product-store');
    const priceInput = document.getElementById('product-price');
    
    const name = nameInput.value.trim();
    const size = sizeInput.value.trim();
    const store = storeSelect.value;
    const price = parseFloat(priceInput.value);
    
    if (!name || !size || !store || !price) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if product already exists
    let product = appState.products.find(p => 
        p.name.toLowerCase() === name.toLowerCase() && 
        p.size.toLowerCase() === size.toLowerCase()
    );
    
    if (product) {
        // Update existing product price
        product.prices[store] = { price: price, lastUpdated: new Date().toISOString().split('T')[0] };
    } else {
        // Create new product
        const newProduct = {
            id: `${name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase().replace(/\s+/g, '-')}`.replace(/[^a-z0-9-]/g, ''),
            name: name,
            size: size,
            category: 'other',
            prices: {
                [store]: { price: price, lastUpdated: new Date().toISOString().split('T')[0] }
            },
            image: 'resources/products-pantry.jpg'
        };
        appState.products.push(newProduct);
    }
    
    // Clear form
    nameInput.value = '';
    sizeInput.value = '';
    storeSelect.value = '';
    priceInput.value = '';
    
    // Re-render grid
    renderProductGrid();
    updateStats();
    
    showNotification('Product added successfully!', 'success');
}

// Render product comparison grid
function renderProductGrid() {
    const grid = document.getElementById('comparison-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    appState.products.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

// Create individual product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'price-card bg-white rounded-xl shadow-lg p-6 border border-gray-100';
    
    // Find best price
    const prices = Object.entries(product.prices);
    const bestPrice = prices.reduce((min, current) => 
        current[1].price < min[1].price ? current : min
    );
    
    const savings = prices.filter(([store, data]) => store !== bestPrice[0])
                         .reduce((total, [store, data]) => total + (data.price - bestPrice[1].price), 0);
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${product.name}</h3>
                <p class="text-sm text-gray-600">${product.size}</p>
            </div>
            <div class="ml-4">
                <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg">
            </div>
        </div>
        
        <div class="space-y-3 mb-4">
            ${prices.map(([store, data]) => `
                <div class="flex items-center justify-between p-3 rounded-lg ${store === bestPrice[0] ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}">
                    <div class="flex items-center">
                        <span class="store-badge ${store === bestPrice[0] ? 'best-price' : ''}">${appState.storeNames[store]}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold ${store === bestPrice[0] ? 'text-green-600' : 'text-gray-700'}">
                            $${data.price.toFixed(2)}
                        </div>
                        ${store === bestPrice[0] ? '<div class="text-xs text-green-600 font-medium">Best Price!</div>' : 
                          `<div class="text-xs text-gray-500">Save $${(data.price - bestPrice[1].price).toFixed(2)}</div>`}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="text-sm text-gray-600">
                Potential savings: <span class="font-bold text-orange-600">$${savings.toFixed(2)}</span>
            </div>
            <button onclick="removeProduct('${product.id}')" 
                    class="text-red-500 hover:text-red-700 text-sm font-medium">
                Remove
            </button>
        </div>
    `;
    
    return card;
}

// Remove product from comparison
function removeProduct(productId) {
    appState.products = appState.products.filter(p => p.id !== productId);
    renderProductGrid();
    updateStats();
    showNotification('Product removed', 'info');
}

// Update statistics
function updateStats() {
    const totalProducts = appState.products.length;
    const totalSavings = appState.products.reduce((total, product) => {
        const prices = Object.values(product.prices);
        if (prices.length > 1) {
            const minPrice = Math.min(...prices.map(p => p.price));
            const maxPrice = Math.max(...prices.map(p => p.price));
            return total + (maxPrice - minPrice);
        }
        return total;
    }, 0);
    
    // Update counters with animation
    const savingsEl = document.getElementById('savings-today');
    const productsEl = document.getElementById('products-tracked');
    
    if (savingsEl) {
        anime({
            targets: savingsEl,
            innerHTML: [parseFloat(savingsEl.textContent.replace('$', '')), totalSavings],
            round: 100,
            duration: 1000,
            easing: 'easeOutExpo',
            update: function(anim) {
                savingsEl.textContent = '$' + anim.animatables[0].target.innerHTML;
            }
        });
    }
    
    if (productsEl) {
        anime({
            targets: productsEl,
            innerHTML: [parseInt(productsEl.textContent), totalProducts],
            round: 1,
            duration: 1000,
            easing: 'easeOutExpo'
        });
    }
}

// Show best deals modal
function showBestDeals() {
    const bestDeals = appState.products.map(product => {
        const prices = Object.entries(product.prices);
        const bestPrice = prices.reduce((min, current) => 
            current[1].price < min[1].price ? current : min
        );
        return {
            ...product,
            bestStore: bestPrice[0],
            bestPrice: bestPrice[1].price
        };
    }).sort((a, b) => a.bestPrice - b.bestPrice);
    
    if (bestDeals.length === 0) {
        showNotification('No products to show deals for', 'info');
        return;
    }
    
    const modal = createModal('Best Deals', `
        <div class="space-y-4">
            ${bestDeals.slice(0, 5).map(deal => `
                <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                        <div class="font-semibold">${deal.name}</div>
                        <div class="text-sm text-gray-600">${deal.size}</div>
                        <div class="text-xs text-green-600">Best at ${appState.storeNames[deal.bestStore]}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xl font-bold text-green-600">$${deal.bestPrice.toFixed(2)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `);
    
    document.body.appendChild(modal);
}

// Set price alerts
function setPriceAlerts() {
    showNotification('Price alerts feature coming soon!', 'info');
}

// Export data functionality
function exportData() {
    const data = {
        products: appState.products,
        exportDate: new Date().toISOString(),
        totalSavings: appState.products.reduce((total, product) => {
            const prices = Object.values(product.prices);
            if (prices.length > 1) {
                const minPrice = Math.min(...prices.map(p => p.price));
                const maxPrice = Math.max(...prices.map(p => p.price));
                return total + (maxPrice - minPrice);
            }
            return total;
        }, 0)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-prices-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

// Clear all data
function clearAll() {
    if (confirm('Are you sure you want to clear all products?')) {
        appState.products = [];
        renderProductGrid();
        updateStats();
        showNotification('All products cleared', 'info');
    }
}

// Utility function to create modal
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold">${title}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                ${content}
            </div>
        </div>
    `;
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Shopping list functionality (for shopping-list.html)
function createShoppingList() {
    const listName = prompt('Enter shopping list name:');
    if (!listName) return;
    
    const newList = {
        id: Date.now().toString(),
        name: listName,
        items: [],
        created: new Date().toISOString()
    };
    
    appState.shoppingLists.push(newList);
    showNotification('Shopping list created!', 'success');
}

// Add item to shopping list
function addToShoppingList(productId, store = null) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    // Find best store if not specified
    if (!store) {
        const prices = Object.entries(product.prices);
        const bestPrice = prices.reduce((min, current) => 
            current[1].price < min[1].price ? current : min
        );
        store = bestPrice[0];
    }
    
    const listItem = {
        id: Date.now().toString(),
        productId: productId,
        productName: product.name,
        size: product.size,
        store: store,
        price: product.prices[store].price,
        quantity: 1,
        completed: false
    };
    
    // Add to default list or create new one
    if (appState.shoppingLists.length === 0) {
        createShoppingList();
    }
    
    appState.shoppingLists[0].items.push(listItem);
    showNotification(`Added ${product.name} to shopping list`, 'success');
}

// Health scoring functionality (for ingredients.html)
function calculateHealthScore(ingredients) {
    const harmfulIngredients = [
        'high fructose corn syrup', 'artificial colors', 'artificial flavors',
        'partially hydrogenated', 'trans fat', 'sodium nitrite', 'sodium nitrate',
        'bht', 'bha', 'tbhq', 'propylene glycol', 'msg'
    ];
    
    const beneficialIngredients = [
        'whole grain', 'organic', 'natural', 'fresh', 'vitamin', 'fiber',
        'protein', 'calcium', 'iron', 'omega-3', 'antioxidant'
    ];
    
    let score = 10;
    let reasons = [];
    
    const ingredientText = ingredients.toLowerCase();
    
    harmfulIngredients.forEach(bad => {
        if (ingredientText.includes(bad)) {
            score -= 2;
            reasons.push(`Contains ${bad}`);
        }
    });
    
    beneficialIngredients.forEach(good => {
        if (ingredientText.includes(good)) {
            score += 1;
            reasons.push(`Contains ${good}`);
        }
    });
    
    score = Math.max(1, Math.min(10, score));
    
    return { score, reasons };
}

// Recipe parsing functionality (for recipes.html)
function parseRecipeIngredients(recipeText) {
    const lines = recipeText.split('\n').filter(line => line.trim());
    const ingredients = [];
    
    lines.forEach(line => {
        const match = line.match(/^(\d+(?:\.\d+)?)\s*(\w+)?\s*(.+)$/);
        if (match) {
            const [, quantity, unit, name] = match;
            ingredients.push({
                name: name.trim(),
                quantity: parseFloat(quantity),
                unit: unit || 'piece'
            });
        }
    });
    
    return ingredients;
}

// Local storage management
function saveToLocalStorage() {
    localStorage.setItem('smartshop-state', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('smartshop-state');
    if (saved) {
        appState = { ...appState, ...JSON.parse(saved) };
    }
}

// Auto-save on page unload
window.addEventListener('beforeunload', saveToLocalStorage);

// Load saved data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});

// Export functions for global access
window.addProduct = addProduct;
window.removeProduct = removeProduct;
window.showBestDeals = showBestDeals;
window.setPriceAlerts = setPriceAlerts;
window.exportData = exportData;
window.clearAll = clearAll;
window.createShoppingList = createShoppingList;
window.addToShoppingList = addToShoppingList;