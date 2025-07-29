const socket = io();

const productsList = document.getElementById('productsList');
const addProductForm = document.getElementById('addProductForm');
const deleteProductForm = document.getElementById('deleteProductForm');

// --- LÓGICA PARA AGREGAR PRODUCTOS ---
addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = e.target.elements.title.value;
    const price = e.target.elements.price.value;
    
    // Creamos un producto básico (puedes agregar más campos)
    const newProduct = { title, price: Number(price), stock: 10, category: 'default', code: `CODE-${Date.now()}`, description: 'N/A', status: true };
    
    socket.emit('addProduct', newProduct);
    addProductForm.reset();
});

// --- LÓGICA PARA ELIMINAR PRODUCTOS ---
deleteProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = e.target.elements.id.value;
    socket.emit('deleteProduct', id);
    deleteProductForm.reset();
});

// --- ACTUALIZAR LA LISTA DE PRODUCTOS EN EL DOM ---
socket.on('updateProducts', (products) => {
    let productItems = '';
    products.forEach(product => {
        productItems += `<li>ID: ${product.id} | ${product.title} - $${product.price}</li>`;
    });
    productsList.innerHTML = productItems;
});
