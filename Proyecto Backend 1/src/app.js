// src/app.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { ProductManager } from './managers/ProductManager.js';

// --- CONFIGURACIÓN BÁSICA ---
const app = express();
const PORT = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productManager = new ProductManager(path.join(__dirname, './data/products.json'));

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURACIÓN DE HANDLEBARS ---
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// --- SERVIDOR HTTP Y SOCKET.IO ---
const httpServer = createServer(app);
const io = new Server(httpServer);

// Middleware para pasar el servidor de sockets a las rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- RUTAS ---
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// --- LÓGICA DE SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });

    // Escuchar evento para agregar un producto
    socket.on('addProduct', async (product) => {
        await productManager.addProduct(product);
        const products = await productManager.getProducts();
        io.emit('updateProducts', products); // Emitir a TODOS los clientes
    });

    // Escuchar evento para eliminar un producto
    socket.on('deleteProduct', async (productId) => {
        await productManager.deleteProduct(productId);
        const products = await productManager.getProducts();
        io.emit('updateProducts', products); // Emitir a TODOS los clientes
    });
});

// --- INICIAR SERVIDOR ---
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});