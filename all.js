
const apiUrl = 'https://livejs-api.hexschool.io';
const apiPath = 'kn99';
const apiKey = 'HKqgwrl3jRP0mmi2Ds2IGaiANC33';

const topMenu = document.querySelector('.topBar-menu');
const ordersByCategory = document.querySelector('.ordersByCategory');
const ordersByItem = document.querySelector('.ordersByItem');
const orderTable = document.querySelector('.orderPage-table');
const chartTitle = document.querySelector('.section-title');

let currentOrderData = {};

function init() {
    getOrderData();
    bindChartEvent();
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
        createOrdersByCategoryChart(res.data);
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

function createOrdersByCategoryChart(orderData) {
    chartTitle.textContent = '全產品類別營收比重';

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
            <a href="#">${isPaid(order.paid)}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除">
            </td>
        </tr>
        `;

        orderTable.innerHTML = str;
    });

}

function getFormatDate(timestamp) {
    let date = new Date(timestamp*1000);
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
}

function isPaid(paid) {
    return paid ? '已處理' : '未處理';
}

function bindRemoveOrderEvent() {




}