import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

// GET /api/products/
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send('Error al obtener el producto');
    }
});

// POST /api/products/
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category } = req.body;
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        return res.status(400).send('Todos los campos son obligatorios, excepto thumbnails');
    }
    try {
        const newProduct = await productManager.addProduct(req.body);
        
        // --- EMISIÓN DE SOCKET ---
        const products = await productManager.getProducts();
        req.io.emit('updateProducts', products);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).send('Error al agregar el producto');
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
        if (updatedProduct) {
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).send('Producto no encontrado para actualizar');
        }
    } catch (error) {
        res.status(500).send('Error al actualizar el producto');
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        const success = await productManager.deleteProduct(req.params.pid);
        if (success) {
            // --- EMISIÓN DE SOCKET ---
            const products = await productManager.getProducts();
            req.io.emit('updateProducts', products);

            res.status(200).send('Producto eliminado correctamente');
        } else {
            res.status(404).send('Producto no encontrado para eliminar');
        }
    } catch (error) {
        res.status(500).send('Error al eliminar el producto');
    }
});

export default router;