const API = "/api";
let token = localStorage.getItem("token");
let currentProducts = [];

function parseJwt(t) {
    try { return JSON.parse(atob(t.split('.')[1])); } catch (e) { return null; }
}

function showPage(pageId) {
    ["loginPage", "registerPage", "catalogPage", "adminPage"].forEach(id => document.getElementById(id).classList.add("d-none"));
    document.getElementById(pageId + "Page").classList.remove("d-none");
    if (pageId === 'catalog') loadProducts();
    if (pageId === 'admin') loadAdminData();
    updateNav();
}

function updateNav() {
    const isAuth = !!token;
    const user = isAuth ? parseJwt(token) : null;
    const isAdmin = user && user.role === 'admin';
    document.getElementById("adminBtn").style.display = isAdmin ? "inline-block" : "none";
    document.getElementById("loginBtn").style.display = isAuth ? "none" : "inline-block";
    document.getElementById("regBtn").style.display = isAuth ? "none" : "inline-block";
    document.getElementById("logoutBtn").style.display = isAuth ? "inline-block" : "none";
}

async function handleRegister() {
    const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            full_name: document.getElementById("regName").value,
            email: document.getElementById("regEmail").value,
            password: document.getElementById("regPassword").value
        })
    });
    if (res.ok) { const d = await res.json(); saveAuth(d.token); }
}

async function handleLogin() {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    });
    if (res.ok) { const d = await res.json(); saveAuth(d.token); }
}

function saveAuth(t) { token = t; localStorage.setItem("token", t); showPage('catalog'); }
function handleLogout() { token = null; localStorage.removeItem("token"); showPage('catalog'); }

async function loadProducts() {
    const cat = document.getElementById("categoryFilter").value;
    const res = await fetch(`${API}/products${cat ? '?cat=' + cat : ''}`);
    currentProducts = await res.json();
    document.getElementById("productGrid").innerHTML = currentProducts.map(p => `
        <div class="col-md-4 mb-4"><div class="card h-100 shadow-sm border-0"><div class="card-body">
            <h5>${p.model_name}</h5>
            <p class="text-primary fw-bold">${p.price.toLocaleString()} KZT</p>
            <p class="text-muted small">Stock: ${p.stock}</p>
            <div class="d-grid gap-2">
                <button class="btn btn-outline-dark btn-sm" onclick="viewProduct('${p._id}')">Details</button>
                <button class="btn btn-success btn-sm" onclick="placeOrder('${p._id}', ${p.price})">Order</button>
            </div>
        </div></div></div>`).join("");
}

async function addProduct() {
    const body = {
        model_name: document.getElementById("pName").value,
        category: document.getElementById("pCat").value,
        price: document.getElementById("pPrice").value,
        stock: document.getElementById("pStock").value,
        specs: {
            cpu: document.getElementById("pCpu").value,
            gpu: document.getElementById("pGpu").value,
            ram: document.getElementById("pRam").value,
            ssd: document.getElementById("pSsd").value
        }
    };
    const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(body)
    });
    if (res.ok) { alert("Added!"); loadAdminData(); }
}

async function loadAdminData() {
    const pRes = await fetch(`${API}/products`);
    const products = await pRes.json();
    document.getElementById("adminTable").innerHTML = products.map(p => `
        <tr><td>${p.model_name}</td><td>${p.price.toLocaleString()}</td><td>${p.stock}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')">X</button></td></tr>`).join("");

    const oRes = await fetch(`${API}/orders`, { headers: { "x-auth-token": token } });
    const orders = await oRes.json();
    
    document.getElementById("ordersTable").innerHTML = orders.map(o => {
        const productNames = o.items.map(i => i.product_id ? i.product_id.model_name : 'Deleted').join(", ");
        const productPrices = o.items.map(i => i.product_id ? i.product_id.price.toLocaleString() + ' KZT' : '-').join(", ");
        
        return `<tr>
            <td>${new Date(o.order_date).toLocaleDateString()}</td>
            <td>${o.customer_id ? o.customer_id.full_name : 'Unknown'}</td>
            <td><small>${productNames}</small></td>
            <td><span class="text-success fw-bold">${productPrices}</span></td>
            <td><span class="badge bg-secondary">${o.status}</span></td>
            <td>
                <select onchange="updateOrderStatus('${o._id}', this.value)" class="form-select form-select-sm">
                    <option value="">Change</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                </select>
            </td>
        </tr>`;
    }).join("");

    const sRes = await fetch(`${API}/stats/revenue`, { headers: { "x-auth-token": token }});
    const sD = await sRes.json();
    document.getElementById("stats").innerHTML = "<strong>Revenue Analytics:</strong> " + sD.map(s => `${s._id}: ${s.total.toLocaleString()} KZT`).join(" | ");
}

async function updateOrderStatus(id, status) {
    if (!status) return;
    await fetch(`${API}/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify({ status })
    });
    loadAdminData();
}

async function deleteProduct(id) {
    await fetch(`${API}/products/${id}`, { method: "DELETE", headers: { "x-auth-token": token }});
    loadAdminData();
}

async function viewProduct(id) {
    const p = currentProducts.find(x => x._id === id);
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    document.getElementById("modalContent").innerHTML = `
        <div class="modal-header"><h5>${p.model_name}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body">
            <h6>Specs:</h6><ul><li>CPU: ${p.specs.cpu}</li><li>GPU: ${p.specs.gpu}</li><li>RAM: ${p.specs.ram}</li></ul>
            <hr><h6>Reviews:</h6>
            <div>${p.reviews.map(r => `<p class="mb-1"><strong>${r.user}:</strong> ${r.comment} (${r.rating}/5)</p>`).join("")}</div>
            ${token ? `<div class="mt-3">
                <input type="number" id="rRate" class="form-control mb-1" placeholder="1-5" min="1" max="5">
                <textarea id="rCom" class="form-control mb-2" placeholder="Comment"></textarea>
                <button class="btn btn-primary btn-sm w-100" onclick="submitReview('${p._id}')">Post</button>
            </div>` : ''}
        </div>`;
    modal.show();
}

async function submitReview(id) {
    await fetch(`${API}/products/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify({ 
            rating: document.getElementById("rRate").value, 
            comment: document.getElementById("rCom").value 
        })
    });
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
}

async function placeOrder(pId, price) {
    if (!token) return alert("Login first");
    const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify({ total_amount: price, items: [{ product_id: pId, quantity: 1 }] })
    });
    if (res.ok) { alert("Order placed!"); loadProducts(); }
}

updateNav();
loadProducts();