document.addEventListener('DOMContentLoaded', () => {
    // 從 localStorage 獲取購物車資料
    const checkoutItems = JSON.parse(localStorage.getItem('checkoutItems')) || [];
    const orderItemsContainer = document.querySelector('.order-items');
    const subtotalAmount = document.querySelector('.subtotal .amount');
    const totalAmount = document.querySelector('.total .amount');
    const shippingFee = 60; // 運費
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutSteps = document.querySelectorAll('.step');
    let currentStep = 0;

    // 顯示訂單項目
    function displayOrderItems() {
        if (checkoutItems.length === 0) {
            // 如果沒有商品，返回首頁
            window.location.href = 'index.html';
            return;
        }

        // 渲染訂單項目
        orderItemsContainer.innerHTML = checkoutItems.map(item => `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="order-item-info">
                    <div class="order-item-title">${item.name}</div>
                    <div class="order-item-price">$${item.price} x ${item.quantity}</div>
                </div>
            </div>
        `).join('');

        // 計算小計
        const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        subtotalAmount.textContent = `$${subtotal}`;

        // 計算總計（含運費）
        const total = subtotal + shippingFee;
        totalAmount.textContent = `$${total}`;
    }

    // 顯示指定步驟的內容
    function showStep(stepIndex) {
        const checkoutContent = document.querySelector('.checkout-content');
        const orderSummaryHTML = `
            <div class="order-summary">
                <h2>訂單摘要</h2>
                <div class="order-items">
                    ${checkoutItems.map(item => `
                        <div class="order-item">
                            <div class="order-item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="order-item-info">
                                <div class="order-item-title">${item.name}</div>
                                <div class="order-item-price">$${item.price} x ${item.quantity}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <div class="subtotal">
                        <span>小計</span>
                        <span class="amount">$${checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                    </div>
                    <div class="shipping">
                        <span>運費</span>
                        <span class="amount">$${shippingFee}</span>
                    </div>
                    <div class="total">
                        <span>總計</span>
                        <span class="amount">$${checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingFee}</span>
                    </div>
                </div>
            </div>
        `;

        switch(stepIndex) {
            case 0: // 填寫資料
                checkoutContent.innerHTML = `
                    ${orderSummaryHTML}
                    <form id="checkoutForm" class="checkout-form">
                        <h2>收件資料</h2>
                        <div class="form-group">
                            <label for="name">姓名</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">手機號碼</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label for="email">電子信箱</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="address">收件地址</label>
                            <input type="text" id="address" name="address" required>
                        </div>
                        <div class="form-group">
                            <label for="note">備註</label>
                            <textarea id="note" name="note" rows="3"></textarea>
                        </div>
                        <button type="submit" class="next-step-btn">下一步</button>
                    </form>`;
                break;
            
            case 1: // 付款方式
                checkoutContent.innerHTML = `
                    ${orderSummaryHTML}
                    <div class="payment-form">
                        <h2>付款方式</h2>
                        <div class="payment-options">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="credit-card" checked>
                                <div class="payment-option-content">
                                    <i class="fas fa-credit-card"></i>
                                    <span>信用卡付款</span>
                                </div>
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="payment" value="line-pay">
                                <div class="payment-option-content">
                                    <i class="fab fa-line"></i>
                                    <span>LINE Pay</span>
                                </div>
                            </label>
                            
                            <label class="payment-option">
                                <input type="radio" name="payment" value="bank-transfer">
                                <div class="payment-option-content">
                                    <i class="fas fa-university"></i>
                                    <span>銀行轉帳</span>
                                </div>
                            </label>

                            <label class="payment-option">
                                <input type="radio" name="payment" value="cash-on-delivery">
                                <div class="payment-option-content">
                                    <i class="fas fa-truck"></i>
                                    <span>貨到付款</span>
                                </div>
                            </label>
                        </div>

                        <div class="payment-details">
                            <!-- 信用卡表單 -->
                            <div class="payment-detail-form" id="credit-card-form">
                                <div class="form-group">
                                    <label for="card-number">卡號</label>
                                    <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="expiry">有效期限</label>
                                        <input type="text" id="expiry" placeholder="MM/YY" maxlength="5">
                                    </div>
                                    <div class="form-group">
                                        <label for="cvv">CVV</label>
                                        <input type="text" id="cvv" placeholder="123" maxlength="3">
                                    </div>
                                </div>
                            </div>

                            <!-- LINE Pay 說明 -->
                            <div class="payment-detail-form" id="line-pay-form" style="display: none;">
                                <div class="payment-instruction">
                                    <p>點擊下一步後，將導向 LINE Pay 付款頁面進行付款。</p>
                                </div>
                            </div>

                            <!-- 銀行轉帳資訊 -->
                            <div class="payment-detail-form" id="bank-transfer-form" style="display: none;">
                                <div class="payment-instruction">
                                    <h3>銀行帳戶資訊</h3>
                                    <p>銀行：國泰世華銀行</p>
                                    <p>戶名：The Eggy 股份有限公司</p>
                                    <p>帳號：1234-5678-9012-3456</p>
                                    <p class="note">請在匯款後將匯款收據拍照上傳：</p>
                                    <input type="file" accept="image/*" class="receipt-upload">
                                </div>
                            </div>

                            <!-- 貨到付款說明 -->
                            <div class="payment-detail-form" id="cash-on-delivery-form" style="display: none;">
                                <div class="payment-instruction">
                                    <p>請在收到商品時付款給配送人員。</p>
                                    <p class="note">需額外支付手續費 NT$30</p>
                                </div>
                            </div>
                        </div>

                        <div class="button-group">
                            <button class="prev-step-btn">上一步</button>
                            <button class="next-step-btn">下一步</button>
                        </div>
                    </div>`;

                // 綁定付款方式切換事件
                const paymentOptions = document.querySelectorAll('input[name="payment"]');
                const paymentForms = document.querySelectorAll('.payment-detail-form');
                
                paymentOptions.forEach(option => {
                    option.addEventListener('change', (e) => {
                        // 隱藏所有表單
                        paymentForms.forEach(form => form.style.display = 'none');
                        // 顯示選中的付款方式表單
                        document.getElementById(`${e.target.value}-form`).style.display = 'block';
                    });
                });

                // 信用卡號碼格式化
                const cardNumber = document.getElementById('card-number');
                if (cardNumber) {
                    cardNumber.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        value = value.replace(/(\d{4})/g, '$1 ').trim();
                        e.target.value = value;
                    });
                }

                // 有效期限格式化
                const expiry = document.getElementById('expiry');
                if (expiry) {
                    expiry.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        e.target.value = value;
                    });
                }
                break;
            
            case 2: // 確認訂單
                checkoutContent.innerHTML = `
                    ${orderSummaryHTML}
                    <div class="order-confirmation">
                        <h2>確認訂單</h2>
                        <div class="confirmation-details">
                            <div class="section">
                                <h3>收件資料</h3>
                                <p>姓名：${localStorage.getItem('checkoutName')}</p>
                                <p>電話：${localStorage.getItem('checkoutPhone')}</p>
                                <p>地址：${localStorage.getItem('checkoutAddress')}</p>
                            </div>
                            <div class="section">
                                <h3>付款資訊</h3>
                                <p>付款方式：${getPaymentMethodText(localStorage.getItem('paymentMethod'))}</p>
                                ${getPaymentDetails(localStorage.getItem('paymentMethod'))}
                            </div>
                        </div>
                        <div class="button-group">
                            <button class="prev-step-btn">上一步</button>
                            <button class="submit-order-btn">確認付款</button>
                        </div>
                    </div>`;
                break;
        }

        // 更新進度指示器
        checkoutSteps.forEach((step, index) => {
            if (index <= stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // 重新綁定事件
        bindEvents();
    }

    function bindEvents() {
        // 綁定表單提交事件
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // 綁定上一步按鈕
        const prevBtn = document.querySelector('.prev-step-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentStep--;
                showStep(currentStep);
            });
        }

        // 綁定下一步按鈕
        const nextBtn = document.querySelector('.next-step-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentStep === 1) { // 付款方式頁面
                    // 這裡可以添加付款表單驗證
                    currentStep++;
                    showStep(currentStep);
                }
            });
        }

        // 綁定確認付款按鈕
        const submitBtn = document.querySelector('.submit-order-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', handleOrderSubmit);
        }

        // 如果在付款方式頁面，綁定付款選項事件
        if (currentStep === 1) {
            bindPaymentOptionEvents();
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // 儲存表單資料，包括電子信箱
        localStorage.setItem('checkoutName', document.getElementById('name').value);
        localStorage.setItem('checkoutPhone', document.getElementById('phone').value);
        localStorage.setItem('checkoutEmail', document.getElementById('email').value);
        localStorage.setItem('checkoutAddress', document.getElementById('address').value);

        // 進入下一步
        currentStep++;
        showStep(currentStep);
    }

    async function handleOrderSubmit() {
        try {
            // 檢查必要資料
            const customerName = localStorage.getItem('checkoutName');
            const customerPhone = localStorage.getItem('checkoutPhone');
            const customerEmail = localStorage.getItem('checkoutEmail');
            const customerAddress = localStorage.getItem('checkoutAddress');
            
            if (!customerName || !customerPhone || !customerEmail || !customerAddress) {
                throw new Error('請填寫完整的收件資訊');
            }

            if (!checkoutItems || checkoutItems.length === 0) {
                throw new Error('購物車是空的');
            }

            const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const orderData = {
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                    address: customerAddress
                },
                items: checkoutItems,
                totalAmount: subtotal,
                shippingFee: shippingFee,
                paymentMethod: localStorage.getItem('paymentMethod') || '信用卡付款'
            };

            console.log('準備提交的訂單資料:', orderData);

            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                // 清空購物車和結帳資訊
                localStorage.removeItem('checkoutItems');
                localStorage.removeItem('checkoutName');
                localStorage.removeItem('checkoutPhone');
                localStorage.removeItem('checkoutEmail');
                localStorage.removeItem('checkoutAddress');
                localStorage.removeItem('paymentMethod');
                
                // 導向到感謝頁面
                window.location.href = `thank-you.html?order=${result.orderNumber}`;
            } else {
                throw new Error(result.message || '訂單提交失敗');
            }
        } catch (error) {
            console.error('訂單提交錯誤:', error);
            alert('訂單提交失敗：' + error.message);
        }
    }

    // 在付款方式選擇時保存選擇
    function bindPaymentOptionEvents() {
        const paymentOptions = document.querySelectorAll('input[name="payment"]');
        paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                localStorage.setItem('paymentMethod', e.target.value);
            });
        });
    }

    // 初始化顯示
    displayOrderItems();
    showStep(currentStep);

    // 添加這些輔助函數
    function getPaymentMethodText(method) {
        const paymentMethods = {
            'credit-card': '信用卡付款',
            'line-pay': 'LINE Pay',
            'bank-transfer': '銀行轉帳',
            'cash-on-delivery': '貨到付款'
        };
        return paymentMethods[method] || '信用卡付款';
    }

    function getPaymentDetails(method) {
        switch(method) {
            case 'credit-card':
                return `<p>卡號末四碼：****</p>`;
            case 'line-pay':
                return `<p>將導向 LINE Pay 付款頁面</p>`;
            case 'bank-transfer':
                return `
                    <p>銀行：國泰世華銀行</p>
                    <p>戶名：The Eggy 股份有限公司</p>
                    <p>帳號：1234-5678-9012-3456</p>
                `;
            case 'cash-on-delivery':
                return `<p>請於收到商品時付款給配送人員</p>
                       <p class="note">需額外支付手續費 NT$30</p>`;
            default:
                return '';
        }
    }

    // 添加信用卡輸入格式化
    document.addEventListener('input', function(e) {
        if (e.target.id === 'card-number') {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        }
        
        if (e.target.id === 'expiry-date') {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0,2) + '/' + value.slice(2);
            }
            e.target.value = value;
        }
    });
}); 