const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let users = [];
let cart = [];

// Catálogo por Categorías (Pantalones, Camisas, Medias, Calzado, Accesorios)
const products = [
  // Camisas / Tops
  { id: "prod-1", name: "Cyberpunk Oversized Hoodie", price: 110, category: "camisas", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600" },
  { id: "prod-2", name: "Haori 'Ryu' Dark Red", price: 85, category: "camisas", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600" },
  
  // Pantalones
  { id: "prod-3", name: "Pantalón Jogger Cargo Tactical", price: 95, category: "pantalones", image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600" },
  { id: "prod-4", name: "Hakama Cyber Streetwear", price: 120, category: "pantalones", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600" },
  
  // Medias
  { id: "prod-5", name: "Medias Tabi Neón Harajuku", price: 18, category: "medias", image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600" },
  { id: "prod-6", name: "Medias Shinobi High Compression", price: 22, category: "medias", image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600" },
  
  // Calzado y Accesorios
  { id: "prod-7", name: "Futuristic Shinobi Sneakers", price: 140, category: "calzado", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600" },
  { id: "prod-8", name: "Máscara Kitsune Tactical", price: 45, category: "accesorios", image: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600" }
];

// --- ENDPOINTS ---

// 1. Obtener productos (con filtro opcional por categoría)
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'todos') {
    const filtered = products.filter(p => p.category === category);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: products });
});

// 2. Registro
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Campos vacíos." });

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ success: false, message: "El usuario ya existe." });

  const newUser = { id: Date.now().toString(), name, email, password };
  users.push(newUser);
  res.status(201).json({ success: true, message: "Cuenta creada con éxito", user: { id: newUser.id, name, email } });
});

// 3. Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos." });

  res.json({ success: true, token: `token_tokyo_${user.id}`, user: { id: user.id, name: user.name, email: user.email } });
});

// 4. Carrito
app.get('/api/cart', (req, res) => res.json({ success: true, cart }));

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: "Producto no encontrado." });

  const existingItem = cart.find(item => item.product.id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  res.json({ success: true, cart });
});

app.put('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (quantity <= 0) {
    cart = cart.filter(i => i.product.id !== productId);
  } else {
    const item = cart.find(i => i.product.id === productId);
    if (item) item.quantity = quantity;
  }
  res.json({ success: true, cart });
});

// 5. Pago con validación de Sesión obligatoria
app.post('/api/checkout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Debes iniciar sesión para realizar el pago." });
  }

  if (cart.length === 0) {
    return res.status(400).json({ success: false, message: "El carrito está vacío." });
  }

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const order = {
    orderId: `TKY-${Math.floor(100000 + Math.random() * 900000)}`,
    items: [...cart],
    total,
    date: new Date().toISOString()
  };

  cart = []; // Vaciar carrito tras la compra
  res.json({ success: true, message: "¡Compra realizada con éxito!", confirmation: order });
});

app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));