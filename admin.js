document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    // 綁定搜尋和篩選事件
    document.getElementById('searchOrder').addEventListener('input', loadOrders);
    document.getElementById('statusFilter').addEventListener('change', loadOrders);

    // 綁定彈窗關閉事件
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('orderModal').style.display = 'none';
    });
});

async function loadOrders() {
    try {
        const searchTerm = document.getElementById('searchOrder').value;
        const statusFilter = document.getElementById('statusFilter').value;

        const response = await fetch('http://localhost:3000/api/orders');
        const data = await response.json();

        if (data.success) {
            // 根據狀態篩選訂單
            let filteredOrders = data.orders;
            if (statusFilter) {
                filteredOrders = data.orders.filter(order => order.orderStatus === statusFilter);
            }
            
            // 如果有搜尋詞，進一步篩選
            if (searchTerm) {
                filteredOrders = filteredOrders.filter(order => 
                    order.orderNumber.includes(searchTerm) ||
                    order.customer.name.includes(searchTerm) ||
                    order.customer.phone.includes(searchTerm)
                );
            }
            
            displayOrders(filteredOrders);
        }
    } catch (error) {
        console.error('載入訂單失敗:', error);
        alert('載入訂單失敗：' + error.message);
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = orders.map(order => `
        <tr>
            <td>${order.orderNumber}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
            <td>${order.customer.name}</td>
            <td>$${order.totalAmount}</td>
            <td>${getPaymentMethodText(order.paymentMethod)}</td>
            <td><span class="status-badge status-${order.orderStatus}">${getStatusText(order.orderStatus)}</span></td>
            <td>
                <button class="action-btn view-btn" onclick="viewOrderDetails('${order._id}')">
                    查看詳情
                </button>
            </td>
        </tr>
    `).join('');
}

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/details/${orderId}`);
        const data = await response.json();

        if (data.success) {
            showOrderModal(data.order);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('載入訂單詳情失敗:', error);
        alert('載入訂單詳情失敗：' + error.message);
    }
}

function showOrderModal(order) {
    const orderDetails = document.getElementById('orderDetails');
    orderDetails.innerHTML = `
        <div class="order-detail-section">
            <h3>訂單資訊</h3>
            <p>訂單編號：${order.orderNumber}</p>
            <p>訂購時間：${new Date(order.createdAt).toLocaleString()}</p>
            <p>訂單狀態：${getStatusText(order.orderStatus)}</p>
            <p>付款方式：${getPaymentMethodText(order.paymentMethod)}</p>
        </div>
        
        <div class="order-detail-section">
            <h3>客戶資訊</h3>
            <p>姓名：${order.customer.name}</p>
            <p>電話：${order.customer.phone}</p>
            <p>Email：${order.customer.email}</p>
            <p>地址：${order.customer.address}</p>
        </div>

        <div class="order-detail-section">
            <h3>商品明細</h3>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <div class="order-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="order-item-info">
                            <p>${item.name}</p>
                            <p>$${item.price} x ${item.quantity}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <p>小計：$${order.totalAmount}</p>
                <p>運費：$${order.shippingFee}</p>
                <p>總計：$${order.totalAmount + order.shippingFee}</p>
            </div>
        </div>

        <div class="order-actions">
            <select id="statusSelect">
                <option value="processing" ${order.orderStatus === 'processing' ? 'selected' : ''}>處理中</option>
                <option value="shipped" ${order.orderStatus === 'shipped' ? 'selected' : ''}>已出貨</option>
                <option value="completed" ${order.orderStatus === 'completed' ? 'selected' : ''}>已完成</option>
                <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>已取消</option>
            </select>
            <button onclick="updateOrderStatus('${order._id}', document.getElementById('statusSelect').value)">
                更新狀態
            </button>
        </div>
    `;

    document.getElementById('orderModal').style.display = 'block';
}

function getPaymentMethodText(method) {
    const methods = {
        'credit-card': '信用卡付款',
        'line-pay': 'LINE Pay',
        'bank-transfer': '銀行轉帳',
        'cash-on-delivery': '貨到付款'
    };
    return methods[method] || method;
}

function getStatusText(status) {
    const statuses = {
        'processing': '處理中',
        'shipped': '已出貨',
        'completed': '已完成'
    };
    return statuses[status] || status;
}

// 添加訂單狀態更新功能
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        if (data.success) {
            loadOrders(); // 重新載入訂單列表
        }
    } catch (error) {
        console.error('更新訂單狀態失敗:', error);
    }
}

async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/statistics');
        const data = await response.json();
        
        document.querySelector('.statistics').innerHTML = `
            <div class="stat-card">
                <h3>今日訂單</h3>
                <p>${data.todayOrders}</p>
            </div>
            <div class="stat-card">
                <h3>本月營業額</h3>
                <p>$${data.monthlyRevenue}</p>
            </div>
            <div class="stat-card">
                <h3>待處理訂單</h3>
                <p>${data.pendingOrders}</p>
            </div>
        `;
    } catch (error) {
        console.error('載入統計資料失敗:', error);
    }
}

async function exportOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/export');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('匯出訂單失敗:', error);
    }
} 