const API_URL = ' https://tokyo-street.onrender.com/api';
let isRegisterMode = false;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCart();
  updateUserUI();
});

// 1. Filtrar Productos por Categoría
async function filterCategory(category) {
  // Actualizar estilos de los botones de categoría
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('bg-rose-600', 'text-white');
    btn.classList.add('bg-slate-800', 'text-slate-300');
  });
  event?.target?.classList?.remove('bg-slate-800', 'text-slate-300');
  event?.target?.classList?.add('bg-rose-600', 'text-white');

  loadProducts(category);
}

// 2. Cargar Productos desde la API
async function loadProducts(category = 'todos') {
  try {
    const url = category === 'todos' ? `${API_URL}/products` : `${API_URL}/products?category=${category}`;
    const res = await fetch(url);
    const result = await res.json();
    const grid = document.getElementById('products-grid');

    if (result.data.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-500 py-8">No hay productos en esta categoría.</p>`;
      return;
    }

    grid.innerHTML = result.data.map(p => `
      <div class="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between hover:border-slate-700 transition">
        <img src="${p.image}" alt="${p.name}" class="h-48 w-full object-cover">
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] uppercase font-bold text-rose-500 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900">${p.category}</span>
            <h3 class="font-bold text-slate-200 mt-2 mb-1">${p.name}</h3>
            <p class="text-rose-400 font-bold mb-4">$${p.price} USD</p>
          </div>
          <button onclick="addToCart('${p.id}')" class="w-full bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-600 text-slate-200 text-sm font-medium py-2 rounded transition">
            + Agregar al Carrito
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
}

// 3. Modales y Autenticación
function toggleAuthModal() {
  document.getElementById('auth-modal').classList.toggle('hidden');
}

function switchAuthMode() {
  isRegisterMode = !isRegisterMode;
  document.getElementById('auth-title').innerText = isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión';
  document.getElementById('name-field').classList.toggle('hidden', !isRegisterMode);
  document.getElementById('auth-toggle-text').innerText = isRegisterMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
  document.getElementById('auth-toggle-btn').innerText = isRegisterMode ? 'Iniciar Sesión' : 'Registrarse';
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value;

  const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
  const body = isRegisterMode ? { name, email, password } : { email, password };

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (data.success) {
    alert(data.message || 'Operación exitosa');
    if (data.token || isRegisterMode) {
      const userToken = data.token || `token_temp_${Date.now()}`;
      const userName = data.user.name || data.user.email;
      localStorage.setItem('token', userToken);
      localStorage.setItem('userName', userName);
    }
    toggleAuthModal();
    updateUserUI();
  } else {
    alert(data.message);
  }
}

function updateUserUI() {
  const userName = localStorage.getItem('userName');
  const userInfo = document.getElementById('user-info');
  const authBtn = document.getElementById('auth-btn');

  if (userName) {
    userInfo.innerText = `👤 ${userName}`;
    authBtn.innerText = 'Cerrar Sesión';
    authBtn.onclick = logout;
  } else {
    userInfo.innerText = '';
    authBtn.innerText = 'Iniciar Sesión';
    authBtn.onclick = toggleAuthModal;
  }
}

function logout() {
  localStorage.clear();
  updateUserUI();
}

// 4. Carrito y Modificación de Cantidades
function toggleCartModal() {
  document.getElementById('cart-modal').classList.toggle('hidden');
}

async function addToCart(productId) {
  await fetch(`${API_URL}/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity: 1 })
  });
  loadCart();
}

async function updateQuantity(productId, quantity) {
  await fetch(`${API_URL}/cart/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  loadCart();
}

async function loadCart() {
  const res = await fetch(`${API_URL}/cart`);
  const data = await res.json();
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  let total = 0;
  let count = 0;

  cartItems.innerHTML = data.cart.map(item => {
    total += item.product.price * item.quantity;
    count += item.quantity;
    return `
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 class="font-medium text-slate-200 text-sm">${item.product.name}</h4>
          <p class="text-xs text-rose-400">$${item.product.price} USD</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateQuantity('${item.product.id}', ${item.quantity - 1})" class="bg-slate-800 px-2 rounded text-slate-300 hover:bg-slate-700">-</button>
          <span class="text-sm font-bold text-slate-100">${item.quantity}</span>
          <button onclick="updateQuantity('${item.product.id}', ${item.quantity + 1})" class="bg-slate-800 px-2 rounded text-slate-300 hover:bg-slate-700">+</button>
        </div>
      </div>
    `;
  }).join('') || '<p class="text-slate-500 text-sm">Tu carrito está vacío.</p>';

  cartCount.innerText = count;
  cartTotal.innerText = `$${total} USD`;
}

// 5. Realizar Pago (Con Validación de Sesión)
async function processCheckout() {
  const token = localStorage.getItem('token');
  const warning = document.getElementById('checkout-warning');

  // Si no está autenticado, detiene el pago y abre el modal de Login
  if (!token) {
    warning.classList.remove('hidden');
    setTimeout(() => {
      toggleCartModal();
      toggleAuthModal();
    }, 1200);
    return;
  }


  warning.classList.add('hidden');

  const res = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (data.success) {
    alert(`🎉 ¡COMPRA REALIZADA CON ÉXITO!\n\nID de Transacción: ${data.confirmation.orderId}\nTotal Pagado: $${data.confirmation.total} USD`);
    loadCart();
    toggleCartModal();
  } else {
    alert(data.message);
  }
}