/**
 * TechStore - Main JavaScript File
 * Handles Cart, Quick View Modal, FAQ Accordion, Search & Filtering, and Mobile Navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. STATE & STORAGE MANAGEMENT
    // -------------------------------------------------------------
    let cart = JSON.parse(localStorage.getItem('techstore_cart')) || [];

    function saveCart() {
        localStorage.setItem('techstore_cart', JSON.stringify(cart));
        updateCartUI();
    }

    // -------------------------------------------------------------
    // 2. DYNAMIC UI INJECTION (Cart Drawer, Modal & Toast)
    // -------------------------------------------------------------
    function injectGlobalUIElements() {
        // Inject Cart Drawer if it doesn't exist
        if (!document.getElementById('cartDrawer')) {
            const drawerHTML = `
                <div class="cart-drawer-overlay" id="cartOverlay"></div>
                <div class="cart-drawer" id="cartDrawer" role="dialog" aria-label="Shopping Cart">
                    <div class="cart-drawer-header">
                        <h3><i class="fa-solid fa-cart-shopping"></i> Your Shopping Cart</h3>
                        <button class="cart-close-btn" id="closeCartBtn" aria-label="Close cart">&times;</button>
                    </div>
                    <div class="cart-drawer-body" id="cartItemsContainer">
                        <!-- Dynamic Cart Items Rendered Here -->
                    </div>
                    <div class="cart-drawer-footer">
                        <div class="cart-total-row">
                            <span>Subtotal:</span>
                            <span class="cart-subtotal-val" id="cartSubtotal">$0.00</span>
                        </div>
                        <div class="cart-total-row grand-total">
                            <span>Total:</span>
                            <span class="cart-total-val" id="cartTotal">$0.00</span>
                        </div>
                        <div class="cart-drawer-actions">
                            <button class="btn-checkout" id="checkoutBtn"><i class="fa-solid fa-credit-card"></i> Proceed to Checkout</button>
                            <button class="btn-clear-cart" id="clearCartBtn"><i class="fa-solid fa-trash-can"></i> Clear Cart</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', drawerHTML);
        }

        // Inject Quick View Modal if it doesn't exist
        if (!document.getElementById('quickViewModal')) {
            const modalHTML = `
                <div class="modal-overlay" id="modalOverlay"></div>
                <div class="quick-view-modal" id="quickViewModal" role="dialog" aria-label="Product Quick View">
                    <button class="modal-close-btn" id="closeModalBtn" aria-label="Close modal">&times;</button>
                    <div class="modal-body-wrapper">
                        <div class="modal-img-col">
                            <img src="" alt="Product Image" id="modalProductImg">
                        </div>
                        <div class="modal-info-col">
                            <span class="modal-category" id="modalProductCategory">Electronics</span>
                            <h2 class="modal-title" id="modalProductTitle">Product Title</h2>
                            <div class="modal-rating" id="modalProductRating">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star-half-stroke"></i>
                                <span>(4.8/5)</span>
                            </div>
                            <div class="modal-price" id="modalProductPrice">$0.00</div>
                            <p class="modal-desc" id="modalProductDesc">High quality tech gadget designed for optimal efficiency and longevity.</p>
                            <div class="modal-actions">
                                <div class="qty-selector">
                                    <button id="modalQtyMinus">-</button>
                                    <input type="number" id="modalQtyInput" value="1" min="1" readonly>
                                    <button id="modalQtyPlus">+</button>
                                </div>
                                <button class="btn-primary-action" id="modalAddToCartBtn">
                                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Inject Toast Container
        if (!document.getElementById('toastContainer')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    injectGlobalUIElements();

    // Elements reference after injection
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTotalEl = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const quickViewModal = document.getElementById('quickViewModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalProductImg = document.getElementById('modalProductImg');
    const modalProductCategory = document.getElementById('modalProductCategory');
    const modalProductTitle = document.getElementById('modalProductTitle');
    const modalProductPrice = document.getElementById('modalProductPrice');
    const modalProductDesc = document.getElementById('modalProductDesc');
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
    const modalQtyInput = document.getElementById('modalQtyInput');
    const modalQtyMinus = document.getElementById('modalQtyMinus');
    const modalQtyPlus = document.getElementById('modalQtyPlus');

    let currentModalProduct = null;

    // -------------------------------------------------------------
    // 3. TOAST NOTIFICATION SYSTEM
    // -------------------------------------------------------------
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // -------------------------------------------------------------
    // 4. CART DRAWER & LOGIC
    // -------------------------------------------------------------
    function openCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    function updateCartUI() {
        // Update all header cart count badges
        const countBadges = document.querySelectorAll('.cart-count');
        const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        countBadges.forEach(badge => {
            badge.textContent = totalItemsCount;
        });

        // Render drawer items
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>Your cart is empty</p>
                    <a href="product.html" class="btn-shop-now">Start Shopping</a>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.textContent = '$0.00';
            if (cartTotalEl) cartTotalEl.textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <div class="cart-qty-controls">
                            <button class="qty-btn minus-btn" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}" title="Remove Item">&times;</button>
                </div>
            `;
        }).join('');

        if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (cartTotalEl) cartTotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }

    function addToCart(product, qty = 1) {
        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: qty
            });
        }
        saveCart();
        showToast(`Added "${product.name}" to cart!`);
    }

    function removeFromCart(id) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            const removedName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            saveCart();
            showToast(`Removed "${removedName}" from cart`, 'info');
        }
    }

    function changeQuantity(id, delta) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                saveCart();
            }
        }
    }

    // Cart Listeners
    document.addEventListener('click', (e) => {
        // Open Cart trigger
        const cartTrigger = e.target.closest('.cart-icon') || e.target.closest('#openCartBtn');
        if (cartTrigger) {
            e.preventDefault();
            openCart();
        }

        // Add to Cart buttons
        const addBtn = e.target.closest('.f-add-btn') || e.target.closest('.p-add-cart-btn') || e.target.closest('.add-cart-btn');
        if (addBtn && !addBtn.id) {
            e.preventDefault();
            const card = addBtn.closest('.f-product-card') || addBtn.closest('.p-grid-card') || addBtn.closest('.product-wrapper');
            if (card) {
                const id = card.dataset.id || card.querySelector('h3, .p-name, h1')?.textContent.trim().toLowerCase().replace(/\s+/g, '-') || 'prod-' + Date.now();
                const name = card.dataset.name || card.querySelector('h3, .p-name, h1')?.textContent.trim() || 'Tech Product';
                const priceText = card.dataset.price || card.querySelector('.f-price, .p-price-tag, .price-tag')?.textContent || '99.00';
                const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 99.00;
                const image = card.dataset.image || card.querySelector('img')?.src || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80';

                addToCart({ id, name, price, image }, 1);
            }
        }

        // Cart Drawer quantity +/- & remove
        if (e.target.classList.contains('minus-btn')) {
            const id = e.target.dataset.id;
            changeQuantity(id, -1);
        }
        if (e.target.classList.contains('plus-btn')) {
            const id = e.target.dataset.id;
            changeQuantity(id, 1);
        }
        if (e.target.classList.contains('remove-item-btn')) {
            const id = e.target.dataset.id;
            removeFromCart(id);
        }
    });

    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            cart = [];
            saveCart();
            showToast('Cart cleared', 'info');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty!', 'info');
                return;
            }
            alert('Thank you for shopping with TechStore! Order processing checkout demo.');
            cart = [];
            saveCart();
            closeCart();
        });
    }

    // -------------------------------------------------------------
    // 5. QUICK VIEW MODAL LOGIC
    // -------------------------------------------------------------
    function openQuickView(product) {
        currentModalProduct = product;
        if (modalProductImg) modalProductImg.src = product.image;
        if (modalProductTitle) modalProductTitle.textContent = product.name;
        if (modalProductCategory) modalProductCategory.textContent = product.category || 'Premium Tech';
        if (modalProductPrice) modalProductPrice.textContent = `$${parseFloat(product.price).toFixed(2)}`;
        if (modalProductDesc) modalProductDesc.textContent = product.desc || 'Experience top-tier quality and modern design with this premium electronics item.';
        if (modalQtyInput) modalQtyInput.value = 1;

        if (quickViewModal && modalOverlay) {
            quickViewModal.classList.add('open');
            modalOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeQuickView() {
        if (quickViewModal && modalOverlay) {
            quickViewModal.classList.remove('open');
            modalOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    document.addEventListener('click', (e) => {
        const quickViewTrigger = e.target.closest('.f-quick-view') || e.target.closest('.btn-secondary');
        if (quickViewTrigger) {
            e.preventDefault();
            const card = quickViewTrigger.closest('.f-product-card') || quickViewTrigger.closest('.p-grid-card') || quickViewTrigger.closest('.modern-hero');
            if (card) {
                const id = card.dataset.id || card.querySelector('h3, h1')?.textContent.trim().toLowerCase().replace(/\s+/g, '-') || 'prod-qv-' + Date.now();
                const name = card.dataset.name || card.querySelector('h3, h1')?.textContent.trim() || 'Wireless Headphones';
                const priceText = card.dataset.price || card.querySelector('.f-price, .p-price-tag, .btn-primary')?.textContent || '299.00';
                const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 299.00;
                const image = card.dataset.image || card.querySelector('img')?.src || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
                const category = card.dataset.category || 'Featured Collection';
                const desc = card.querySelector('p')?.textContent || 'Designed for comfort, acoustic perfection, and maximum battery life.';

                openQuickView({ id, name, price, image, category, desc });
            }
        }
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeQuickView);
    if (modalOverlay) modalOverlay.addEventListener('click', closeQuickView);

    if (modalQtyMinus) {
        modalQtyMinus.addEventListener('click', () => {
            let current = parseInt(modalQtyInput.value) || 1;
            if (current > 1) modalQtyInput.value = current - 1;
        });
    }

    if (modalQtyPlus) {
        modalQtyPlus.addEventListener('click', () => {
            let current = parseInt(modalQtyInput.value) || 1;
            modalQtyInput.value = current + 1;
        });
    }

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (currentModalProduct) {
                const qty = parseInt(modalQtyInput.value) || 1;
                addToCart(currentModalProduct, qty);
                closeQuickView();
            }
        });
    }

    // -------------------------------------------------------------
    // 6. FAQ ACCORDION LOGIC
    // -------------------------------------------------------------
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // -------------------------------------------------------------
    // 7. MOBILE MENU TOGGLE
    // -------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn') || document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // -------------------------------------------------------------
    // 8. LIVE SEARCH & CATEGORY FILTERING
    // -------------------------------------------------------------
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterProducts(query, currentCategory);
        });
    });

    let currentCategory = 'all';
    const categoryCards = document.querySelectorAll('.category-item, .cat-glass-card');
    categoryCards.forEach(cat => {
        cat.addEventListener('click', (e) => {
            e.preventDefault();
            categoryCards.forEach(c => c.classList.remove('active'));
            cat.classList.add('active');

            const catText = cat.querySelector('h3')?.textContent.trim().toLowerCase() || 'all';
            currentCategory = catText;
            filterProducts('', currentCategory);

            // Scroll to product section if on product page
            const prodSection = document.querySelector('.featured-products, .product-grid-section');
            if (prodSection) {
                prodSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    function filterProducts(searchQuery = '', category = 'all') {
        const productCards = document.querySelectorAll('.f-product-card, .p-grid-card');
        productCards.forEach(card => {
            const name = card.querySelector('h3, .p-name')?.textContent.toLowerCase() || '';
            const cardCat = (card.dataset.category || '').toLowerCase();

            const matchesSearch = name.includes(searchQuery);
            const matchesCategory = category === 'all' || name.includes(category) || cardCat.includes(category);

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Initial Cart Render
    updateCartUI();
});
