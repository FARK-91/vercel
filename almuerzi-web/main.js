// const { get } = require("mongoose")

let globalMeal = []
let user = {}
let route = 'login' // login, register, orders

const stringToHtml = (string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(string, 'text/html')

    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHtml(`<li data-id="${item._id}">${item.name}</li>`)

    element.addEventListener('click', () => {
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })

    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHtml(`<li data-id="${order._id}">${meal.name} - ${order.user_id}</li>`)

    return element
}

const initialize = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disable', true)
        const mealId = document.getElementById('meals-id').value
        if (!mealId){
            alert('Debe seleccionar al menos un plato.!')
            submit.removeAttribute('disable')
            return
        }

        const order = {
            meal_id: mealId,
            user_id: user._id
        }

        fetch('https://serverless.fark-91.vercel.app/api/orders',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: localStorage.getItem('token'),
            },
            body: JSON.stringify(order)
        })
        .then(response => response.json())
        .then(postData => {
            const renderedOrder = renderOrder(postData,globalMeal)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disable')
        })
    }
}

const fetchData = () => {
    // Get Meals
	fetch('https://serverless.fark-91.vercel.app/api/meals', {
	})
	.then(response => response.json())
	.then(data => {
        globalMeal = data
        const mealsList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const listItem = data.map(renderItem)
        mealsList.removeChild(mealsList.firstElementChild)
        listItem.forEach(element => mealsList.appendChild(element))
        submit.removeAttribute('disabled')

        // Get Orders
        fetch('https://serverless.fark-91.vercel.app/api/orders', {
        })
        .then(response => response.json())
        .then(ordersData => {
            const ordersList = document.getElementById('orders-list')
            const listOrder = ordersData.map(orderData => renderOrder(orderData, data))
            ordersList.removeChild(ordersList.firstElementChild)
            listOrder.forEach(element => ordersList.appendChild(element))
        })
    })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if(token){
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    initialize()
    fetchData()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const passwd = document.getElementById('passwd').value

        fetch('https://serverless.fark-91.vercel.app/api/auth/login',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password: passwd })
        }).then(response => response.json())
        .then(respuesta => {
            localStorage.setItem('token', respuesta.token)
            route = 'orders'
            return respuesta.token
        })
        .then(token => {
            return fetch('https://serverless.fark-91.vercel.app/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: token,
                },
            })
        })
        .then(x => x.json())
        .then(fetchedUser => {
            localStorage.setItem('user', JSON.stringify(fetchedUser))
            user = fetchedUser
            renderOrders()
        })
    }
}

window.onload = () => {
    renderApp()

}