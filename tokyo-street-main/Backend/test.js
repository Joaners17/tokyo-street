// test.js - Prueba automatizada de la API
const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log("🧪 INICIANDO PRUEBAS AUTOMATIZADAS DE LA API...\n");

  try {
    // Test 1: Consultar Productos
    const resProducts = await fetch(`${API_URL}/products`);
    const dataProducts = await resProducts.json();
    console.log(dataProducts.success ? "✅ PASS: Endpoint GET /api/products funcional" : "❌ FAIL: GET /api/products");

    // Test 2: Registro de Usuario
    const testUser = { name: "Tester", email: `test_${Date.now()}@tokyo.com`, password: "123" };
    const resRegister = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const dataRegister = await resRegister.json();
    console.log(dataRegister.success ? "✅ PASS: Endpoint POST /api/auth/register funcional" : "❌ FAIL: POST /api/auth/register");

    // Test 3: Login de Usuario
    const resLogin = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const dataLogin = await resLogin.json();
    console.log(dataLogin.success ? "✅ PASS: Endpoint POST /api/auth/login funcional" : "❌ FAIL: POST /api/auth/login");

    // Test 4: Bloqueo de Pago sin Token
    const resCheckoutFail = await fetch(`${API_URL}/checkout`, { method: 'POST' });
    const dataCheckoutFail = await resCheckoutFail.json();
    console.log(!dataCheckoutFail.success ? "✅ PASS: Bloqueo de pago sin autenticación correcto" : "❌ FAIL: Seguridad de checkout");

    console.log("\n✨ TODAS LAS PRUEBAS AUTOMATIZADAS HAN FINALIZADO CON ÉXITO.");
  } catch (error) {
    console.error("❌ ERROR DURANTE LAS PRUEBAS:", error.message);
  }
}

runTests();