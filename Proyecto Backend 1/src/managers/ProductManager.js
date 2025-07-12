import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

export class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        try {
            const prods = JSON.parse(await fs.readFile(this.path, 'utf-8'));
            return prods;
        } catch (error) {
            // Si el archivo no existe, devolvemos un array vacío
            return [];
        }
    }

    async getProductById(id) {
        const prods = await this.getProducts();
        const producto = prods.find(prod => prod.id === id);
        return producto;
    }

    async addProduct(product) {
        const prods = await this.getProducts();
        product.id = uuidv4(); // Asignamos un ID único
        prods.push(product);
        await fs.writeFile(this.path, JSON.stringify(prods, null, 2)); // Usamos null, 2 para formatear el JSON
        return product;
    }

    // --- MÉTODOS NUEVOS ---
    async updateProduct(id, updatedFields) {
        const prods = await this.getProducts();
        const productIndex = prods.findIndex(prod => prod.id === id);

        if (productIndex === -1) {
            return null; // Producto no encontrado
        }

        // Actualizamos los campos del producto sin cambiar el ID
        const updatedProduct = { ...prods[productIndex], ...updatedFields };
        prods[productIndex] = updatedProduct;

        await fs.writeFile(this.path, JSON.stringify(prods, null, 2));
        return updatedProduct;
    }

    async deleteProduct(id) {
        const prods = await this.getProducts();
        const updatedProds = prods.filter(prod => prod.id !== id);

        if (prods.length === updatedProds.length) {
            return false; // No se encontró el producto, no se borró nada
        }

        await fs.writeFile(this.path, JSON.stringify(updatedProds, null, 2));
        return true; // Éxito
    }
}