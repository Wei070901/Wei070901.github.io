const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 添加靜態文件服務
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static('public/images'));

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('成功連接到 MongoDB');
  })
  .catch(err => {
    console.error('MongoDB 連接失敗:');
    console.error('錯誤代碼:', err.code);
    console.error('錯誤訊息:', err.message);
    if (err.codeName) {
      console.error('錯誤代碼名稱:', err.codeName);
    }
    process.exit(1);
  });

// 訂單模型
const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true }
    }],
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'pending' },
    orderStatus: { type: String, default: 'processing' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// 添加管理員認證中間件
const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: '未授權訪問' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: '無效的認證token' });
    }
};

// API 路由
app.post('/api/orders', async (req, res) => {
    try {
        const {
            customer,
            items,
            totalAmount,
            shippingFee,
            paymentMethod
        } = req.body;

        console.log('收到的訂單資料:', JSON.stringify(req.body, null, 2));

        // 檢查必要欄位
        if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address) {
            return res.status(400).json({
                success: false,
                message: '缺少必要的客戶資訊',
                missingFields: {
                    name: !customer?.name,
                    phone: !customer?.phone,
                    email: !customer?.email,
                    address: !customer?.address
                }
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: '訂單中沒有商品'
            });
        }

        // 驗證商品資料
        const invalidItems = items.filter(item => 
            !item.name || 
            typeof item.price !== 'number' || 
            typeof item.quantity !== 'number' ||
            !item.image
        );

        if (invalidItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: '商品資料不完整或格式錯誤',
                invalidItems
            });
        }

        // 生成訂單編號
        const orderNumber = 'ORD' + Date.now();

        // 創建訂單前先打印完整的訂單資料
        const orderData = {
            orderNumber,
            customer: {
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address
            },
            items: items.map(item => ({
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                image: item.image
            })),
            totalAmount: Number(totalAmount),
            shippingFee: Number(shippingFee),
            paymentMethod
        };

        console.log('準備創建的訂單資料:', JSON.stringify(orderData, null, 2));

        const order = new Order(orderData);
        const savedOrder = await order.save();

        console.log('訂單已成功保存:', savedOrder);

        res.status(201).json({
            success: true,
            orderNumber,
            message: '訂單建立成功'
        });
    } catch (error) {
        console.error('訂單建立錯誤:', error);
        console.error('錯誤詳情:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            errors: error.errors
        });
        
        res.status(500).json({
            success: false,
            message: '訂單建立失敗',
            error: error.message,
            details: error.errors,
            name: error.name
        });
    }
});

// 查詢訂單狀態
app.get('/api/orders/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '查詢失敗',
            error: error.message
        });
    }
});

// 獲取所有訂單
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '獲取訂單失敗',
            error: error.message
        });
    }
});

// 添加路由處理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

app.get('/thank-you', (req, res) => {
    res.sendFile(path.join(__dirname, 'thank-you.html'));
});

// 根據 ID 查詢訂單
app.get('/api/orders/details/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }
        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '查詢失敗',
            error: error.message
        });
    }
});

// 添加搜尋和篩選 API
app.get('/api/orders/search', async (req, res) => {
    try {
        const { keyword, status, startDate, endDate } = req.query;
        let query = {};

        if (keyword) {
            query.$or = [
                { orderNumber: { $regex: keyword, $options: 'i' } },
                { 'customer.name': { $regex: keyword, $options: 'i' } },
                { 'customer.phone': { $regex: keyword, $options: 'i' } }
            ];
        }

        if (status) {
            query.orderStatus = status;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '搜尋失敗',
            error: error.message
        });
    }
});

// 添加訂單狀態更新路由
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '找不到訂單'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新訂單狀態失敗',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`伺服器運行在 port ${PORT}`);
}); 

async function sendOrderNotification(order) {
    // 設置郵件傳輸
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 發送給客戶的訂單確認信
    await transporter.sendMail({
        from: '"The Eggy" <noreply@theeggy.com>',
        to: order.customer.email,
        subject: `訂單確認 #${order.orderNumber}`,
        html: `
            <h1>感謝您的訂購！</h1>
            <p>您的訂單編號：${order.orderNumber}</p>
            <!-- 更多訂單詳情 -->
        `
    });

    // 發送給管理員的新訂單通知
    await transporter.sendMail({
        from: '"The Eggy System" <noreply@theeggy.com>',
        to: 'admin@theeggy.com',
        subject: `新訂單通知 #${order.orderNumber}`,
        html: `
            <h1>收到新訂單！</h1>
            <p>訂單編號：${order.orderNumber}</p>
            <p>客戶：${order.customer.name}</p>
            <!-- 更多訂單詳情 -->
        `
    });
} 