import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class CartManager {
    constructor(path) {
        this.path = path;
    }

    async getCarts() {
        const carts = JSON.parse(await fs.readFile(this.path, 'utf-8'));
        return carts;
    }

    async createCart() {
        const carts = await this.getCarts();
        const newCart = { id: uuidv4(), products: [] };
        carts.push(newCart);
        await fs.writeFile(this.path, JSON.stringify(carts));
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === id);
        return cart;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) {
            // Manejar error: carrito no encontrado
            return null;
        }

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.product === productId);

        if (productIndex !== -1) {
            // Si el producto ya existe, incrementamos la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si no existe, lo agregamos
            cart.products.push({ product: productId, quantity: 1 });
        }

        await fs.writeFile(this.path, JSON.stringify(carts));
        return cart;
    }
}