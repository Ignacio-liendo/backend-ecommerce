import { Router } from 'express';
import { CartManager } from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager('src/data/carts.json');

// POST /api/carts/
router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
    const cart = await cartManager.getCartById(req.params.cid);
    if (cart) {
        res.status(200).json(cart.products);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (updatedCart) {
        res.status(200).json(updatedCart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

export default router;