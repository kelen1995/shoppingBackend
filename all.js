
const apiUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'kn99';
const apiKey = 'HKqgwrl3jRP0mmi2Ds2IGaiANC33';

const BYCATEGORY = 'byCategory';
const BYITEM = 'byItem';

const topMenu = document.querySelector('.topBar-menu');
const orderTable = document.querySelector('.orderPage-table');
const chartTitle = document.querySelector('.section-title');
const removeAllOrder = document.querySelector('.discardAllBtn');

let currentOrderData = {};
let currentChartType = '';

function init() {
    getOrderData();
    bindChartEvent();
    bindRemoveOrderEvent();
    bindChangePaidEvent();
}

init();

function getOrderData() {
    axios({
        method: 'get',
        url: `${apiUrl}/api/livejs/v1/admin/${apiPath}/orders`,
        headers: {
            'authorization':apiKey
        }
    })
    .then(res => {
        console.log(res.data);
        currentOrderData = res.data;
        createChart(BYCATEGORY,res.data);
        renderOrderTable(res.data);
    })
    .catch(err => {
        console.log(err.response);
    })
}

function bindChartEvent() {
    topMenu.addEventListener('click', e => {
        if (e.target.classList.value.includes('ordersByCategory')){
            createOrdersByCategoryChart(currentOrderData);
        } else if (e.target.classList.value.includes('ordersByItem')){
            createOrdersByItemChart(currentOrderData);
        }
    })
}

function createChart(type, orderData) {
    switch(type){
        case BYCATEGORY:
            createOrdersByCategoryChart(orderData);
            break;
        case BYITEM:
            createOrdersByItemChart(orderData);
            break;
    }
}

function createOrdersByCategoryChart(orderData) {
    chartTitle.textContent = '全產品類別營收比重';
    currentChartType = BYCATEGORY;

    let categoryPrice = {}
    // 整理類別資料
    let orders = orderData.orders;
    orders.forEach(order => {
        let products = order.products;
        products.forEach(product => {
            if (categoryPrice[product.category]) {
                categoryPrice[product.category] += product.price * product.quantity;
            } else {
                categoryPrice[product.category] = product.price * product.quantity;
            }
        })
    })

    // console.log(categoryPrice);

    let columnsData = [];
    let keys = Object.keys(categoryPrice);
    keys.forEach(key => {
        let category = key;
        let totalIncome = categoryPrice[key];
        columnsData.push([category, totalIncome]);
    })


    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: columnsData
        },
    });
}

function createOrdersByItemChart(orderData) {
    chartTitle.textContent = '全品項營收比重';
    currentChartType = BYITEM;

    let itemPrice = {};
    // 整理品項資料
    let orders = orderData.orders;
    orders.forEach(order => {
        let products = order.products;
        products.forEach(product => {
            if (itemPrice[product.title]) {
                itemPrice[product.title] += product.price * product.quantity;
            } else {
                itemPrice[product.title] = product.price * product.quantity;
            }
        });
    });

    // console.log(itemPrice);

    let columnsData = [];
    let keys = Object.keys(itemPrice);
    keys.forEach(key => {
        let item = key;
        let totalPrice = itemPrice[key];
        columnsData.push([item, totalPrice]);
    });

    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type: "pie",
            columns: columnsData
        },
    });
}

function renderOrderTable(orderData) {
    let orders = orderData.orders;
    let str = `
        <thead>
            <tr>
                <th>訂單編號</th>
                <th>聯絡人</th>
                <th>聯絡地址</th>
                <th>電子郵件</th>
                <th>訂單品項</th>
                <th>訂單日期</th>
                <th>訂單狀態</th>
                <th>操作</th>
            </tr>
        </thead>
    `;

    if (orders.length > 0) {
        orders.forEach(order => {
            str += `
            <tr>
                <td>${order.id}</td>
                <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
                </td>
                <td>${order.user.address}</td>
                <td>${order.user.email}</td>
                <td>
                <p>${order.products[0].title}</p>
                </td>
                <td>${getFormatDate(order.createdAt)}</td>
                <td class="orderStatus">
                <a href="#" data-id=${order.id} data-ispaid=${order.paid}>${isPaid(order.paid)}</a>
                </td>
                <td>
                <input type="button" class="delSingleOrder-Btn" data-id=${order.id} value="刪除">
                </td>
            </tr>
            `;

        });
    }
    orderTable.innerHTML = str;
}

function getFormatDate(timestamp) {
    let date = new Date(timestamp*1000);
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
}

function isPaid(paid) {
    return paid ? '已處理' : '未處理';
}

function bindRemoveOrderEvent() {

    // remove single order
    orderTable.addEventListener('click', e => {
        // console.log(e.target);
        let tar = e.target;
        if (tar.classList.value.includes('delSingleOrder-Btn')) {
            deleteSingleOrder(tar.dataset.id);
        }
    });

    // remove all orders
    removeAllOrder.addEventListener('click', e => {
        deleteAllOrders();
    })
}

function deleteSingleOrder(orderId) {
    axios({
        method: 'delete',
        url: `${apiUrl}​/api/livejs/v1/admin/${apiPath}/orders/${orderId}`,
        headers: {
            'authorization':apiKey
        }
    })
    .then(res => {
        // console.log(res.data);
        renderOrderTable(res.data);
        createChart(currentChartType, res.data);
    })
    .catch(err => {
        console.log(err.response);
    });
}

function deleteAllOrders(){
    axios({
        method: 'delete',
        url: `${apiUrl}​/api/livejs/v1/admin/${apiPath}/orders`,
        headers: {
            'authorization':apiKey
        }
    })
    .then(res => {
        // console.log(res.data);
        renderOrderTable(res.data);
        createChart(currentChartType, res.data);
    })
    .catch(err => {
        console.log(err.response);
    });
}

function bindChangePaidEvent() {
    orderTable.addEventListener('click', e => {
        let tar = e.target;
        let orderId = tar.dataset.id;
        let newState = changeIsPaidState(tar.dataset.ispaid);
        console.log(orderId, newState);
        modifyOrderState(orderId, newState);
    });
}

function changeIsPaidState(isPaidStr) {
    if (isPaidStr === 'false') {
        return true;
    } else {
        return false;
    }
}

function modifyOrderState(orderId, isPaid) {
    axios({
        method: 'put',
        url: `${apiUrl}​/api/livejs/v1/admin/${apiPath}/orders`,
        data: {
            "data": {
              "id": orderId,
              "paid": isPaid
            }
          },
        headers: {
            'authorization':apiKey
        }
    })
    .then(res => {
        console.log(res.data);
        renderOrderTable(res.data);
        createChart(currentChartType, res.data);
    })
    .catch(err => {
        console.log(err.response);
    })
}