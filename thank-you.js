document.addEventListener('DOMContentLoaded', async () => {
    // 從 URL 獲取訂單編號
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');
    
    if (!orderNumber) {
        window.location.href = 'index.html';
        return;
    }

    // 顯示訂單編號
    document.getElementById('orderNumber').textContent = orderNumber;

    // 顯示訂單狀態時間軸
    const statusTimeline = document.getElementById('statusTimeline');
    const statuses = [
        {
            title: '訂單已建立',
            time: new Date().toLocaleString(),
            icon: 'fa-shopping-cart'
        },
        {
            title: '訂單處理中',
            time: '處理中',
            icon: 'fa-cog'
        },
        {
            title: '準備出貨',
            time: '等待中',
            icon: 'fa-box'
        },
        {
            title: '已出貨',
            time: '等待中',
            icon: 'fa-truck'
        }
    ];

    statusTimeline.innerHTML = statuses.map((status, index) => `
        <div class="status-item ${index === 0 ? 'active' : ''}">
            <div class="status-icon">
                <i class="fas ${status.icon}"></i>
            </div>
            <div class="status-content">
                <div class="status-title">${status.title}</div>
                <div class="status-time">${status.time}</div>
            </div>
        </div>
    `).join('');

    // 綁定追蹤訂單按鈕
    document.querySelector('.track-order').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderNumber}`);
            const result = await response.json();
            
            if (result.success) {
                alert(`訂單狀態：${result.order.orderStatus}`);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert('無法獲取訂單狀態：' + error.message);
        }
    });
}); 