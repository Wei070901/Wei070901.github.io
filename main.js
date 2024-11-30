document.addEventListener('DOMContentLoaded', () => {
    // 購物車狀態
    let cartItems = [];
    const cartPanel = document.querySelector('.cart-panel');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalAmount = document.querySelector('.total-amount');
    
    // 打開購物車
    document.querySelector('.cart-icon').addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
    
    // 關閉購物車
    document.querySelector('.close-cart').addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    
    // 添加到購物車功能
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            const productImage = productCard.querySelector('img').src;
            const imageUrl = new URL(productImage).pathname;
            
            addToCart({
                name: productName,
                price: parseInt(productPrice.replace('$', '')),
                image: imageUrl,
                quantity: 1
            }, e);
        });
    });
    
    // 添加結帳按鈕事件監聽
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', handleCheckout);
    
    function addToCart(product, clickEvent) {
        const existingItem = cartItems.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push(product);
        }
        
        // 添加購物車動畫
        const cartIcon = document.querySelector('.cart-icon');
        const productCard = clickEvent.target.closest('.product-card');
        const productImage = productCard.querySelector('img');
        
        // 創建飛行動畫元素
        const flyingImage = document.createElement('div');
        flyingImage.className = 'flying-image';
        flyingImage.style.cssText = `
            position: fixed;
            width: 50px;
            height: 50px;
            background-image: url(${productImage.src});
            background-size: cover;
            border-radius: 50%;
            z-index: 1000;
        `;
        
        // 設置初始位置
        const rect = productImage.getBoundingClientRect();
        flyingImage.style.top = rect.top + 'px';
        flyingImage.style.left = rect.left + 'px';
        
        document.body.appendChild(flyingImage);
        
        // 獲取購物車圖標位置
        const cartRect = cartIcon.getBoundingClientRect();
        
        // 執行動畫
        requestAnimationFrame(() => {
            flyingImage.style.transition = 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
            flyingImage.style.top = (cartRect.top + cartRect.height/2) + 'px';
            flyingImage.style.left = (cartRect.left + cartRect.width/2) + 'px';
            flyingImage.style.transform = 'scale(0.1)';
            flyingImage.style.opacity = '0';
        });
        
        // 移除動畫元素
        setTimeout(() => {
            document.body.removeChild(flyingImage);
        }, 800);
        
        updateCart();
        showNotification('已加入購物車！');
    }
    
    function updateCart() {
        // 更新購物車數量
        cartCount.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        // 更新購物車內容
        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-name="${item.name}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="cart-item-remove"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
        
        // 更新總金額
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalAmount.textContent = `$${total}`;
        
        // 綁定數量按鈕事件
        bindQuantityButtons();
    }
    
    function bindQuantityButtons() {
        cartItemsContainer.querySelectorAll('.cart-item').forEach(item => {
            const name = item.dataset.name;
            const cartItem = cartItems.find(i => i.name === name);
            
            item.querySelector('.minus').addEventListener('click', () => {
                if (cartItem.quantity > 1) {
                    cartItem.quantity--;
                    updateCart();
                }
            });
            
            item.querySelector('.plus').addEventListener('click', () => {
                cartItem.quantity++;
                updateCart();
            });
            
            item.querySelector('.cart-item-remove').addEventListener('click', () => {
                cartItems = cartItems.filter(i => i.name !== name);
                updateCart();
            });
        });
    }
    
    function openCart() {
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeCart() {
        cartPanel.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 處理結帳功能
    function handleCheckout() {
        if (cartItems.length === 0) {
            showNotification('購物車是空的！');
            return;
        }
        
        // 將購物車資料存儲到 localStorage
        localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
        
        // 導向到結帳頁面
        window.location.href = 'checkout.html';
    }
    
    // 2. 添加載入狀態
    async function loadOrders() {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-spinner';
        try {
            // ... 現有代碼 ...
        } finally {
            loadingIndicator.remove();
        }
    }
}); 