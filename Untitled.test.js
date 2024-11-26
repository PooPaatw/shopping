import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';

// 自定義指標
const errorRate = new Rate('errors');
const orderCreationTrend = new Trend('order_creation_duration');

// 配置常量
const API_BASE_URL = 'http://localhost:3000';
const PRODUCT_ID_MIN = 4001;
const PRODUCT_ID_MAX = 4015;

// 效能測試配置
export const options = {
    scenarios: {
        smoke: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '30s', target: 50 },  // 提升階段
                { duration: '30s', target: 50 },   // 穩定階段
                // { duration: '30s', target: 0 },   // 緩衝階段
            ],
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<300', 'p(99)<500'],
        http_req_failed: ['rate<0.01'],
        'errors': ['rate<0.1'],
        'order_creation_duration': ['p(95)<400'],
    },
};

// 測試數據
const users = new SharedArray('users', () => [
    { username: 'jason', password: '123' },
    { username: 'alex', password: '123' },
    { username: 'maple', password: '123' }
]);

// API 請求函數
const api = {
    post: (path, payload, headers = {}) => {
        const url = `${API_BASE_URL}${path}`;
        return http.post(url, JSON.stringify(payload), {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
        });
    },
    
    get: (path, headers = {}) => {
        const url = `${API_BASE_URL}${path}`;
        return http.get(url, { headers });
    }
};

// 工具函數
const utils = {
    getRandomProductId: () => 
        Math.floor(Math.random() * (PRODUCT_ID_MAX - PRODUCT_ID_MIN + 1)) + PRODUCT_ID_MIN,
    
    getRandomUser: () => 
        users[Math.floor(Math.random() * users.length)],
    
    validateResponse: (res, checkName) => {
        const success = check(res, {
            [`${checkName} status is 200`]: (r) => r.status === 200,
            [`${checkName} has valid response`]: (r) => r.body.length > 0,
        });
        
        if (!success) {
            errorRate.add(1);
            console.error(`${checkName} failed: ${res.status} ${res.body}`);
        }
        
        return success;
    }
};

// 主要測試流程
export default function () {
    const user = utils.getRandomUser();
    let authToken;

    group('認證流程', function () {
        // 登入
        const loginRes = api.post('/api/users/login', {
            username: user.username,
            password: user.password
        });
        
        if (!utils.validateResponse(loginRes, 'login')) return;
        
        authToken = loginRes.json('token');
        const authHeaders = { 'Authorization': `Bearer ${authToken}` };

        // 驗證用戶資料
        const profileRes = api.get('/api/users/profile', authHeaders);
        utils.validateResponse(profileRes, 'profile');
    });

    group('購物流程', function() {
        const authHeaders = { 'Authorization': `Bearer ${authToken}` };
        
        // 加入購物車
        const cartPayload = {
            product_id: utils.getRandomProductId(),
            quantity: 1
        };
        
        const addToCartRes = api.post('/api/cart/add', cartPayload, authHeaders);
        if (!utils.validateResponse(addToCartRes, 'add to cart')) return;
        
        sleep(1);

        // 檢查購物車
        const cartRes = api.get('/api/cart/items', authHeaders);
        if (!utils.validateResponse(cartRes, 'get cart')) return;
        
        const cartItems = cartRes.json().data;
        
        if (cartItems && cartItems.length > 0) {
            const startTime = new Date();
            
            // 建立訂單
            const orderPayload = {
                product_id: cartItems[0].product_id,
                quantity: cartItems[0].quantity,
            };
            
            const createOrderRes = api.post('/api/orderscreate', orderPayload, authHeaders);
            utils.validateResponse(createOrderRes, 'create order');
            
            // 記錄訂單創建時間
            orderCreationTrend.add(new Date() - startTime);
            
            sleep(1);
        }
    });

    group('訂單查詢', function() {
        const authHeaders = { 'Authorization': `Bearer ${authToken}` };
        
        // 獲取訂單列表
        const ordersRes = api.get('/api/getallorders', authHeaders);
        utils.validateResponse(ordersRes, 'get orders');
        
        sleep(1);
    });
}