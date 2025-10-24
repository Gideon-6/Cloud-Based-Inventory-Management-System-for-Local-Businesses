import React, { useState, useEffect } from "react";
// FIX: Added 'put' to the import list
import { get, post, del, put } from "aws-amplify/api";
import "./Dashboard.css";

// This variable stores the correct, case-sensitive API name from aws-exports.js
const apiName = "NewInventoryAPI";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    quantity: "",
    price: "",
    description: "N/A",
    lowStockThreshold: 10,
  });
  const [loading, setLoading] = useState(true);
  // NEW STATE: To track which product is being edited
  const [editProduct, setEditProduct] = useState(null); 

  // Fetch all products from the backend API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const restOperation = get({
        apiName: apiName,
        path: "/products", // Corrected path to match API Gateway
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a new product to the backend
  const addProduct = async (e) => {
    e.preventDefault();
    const { productName, quantity, price } = newProduct;
    if (!productName || !quantity || !price) {
      alert("Please fill all fields");
      return;
    }

    try {
      await post({
        apiName: apiName,
        path: "/products", // Corrected path to match API Gateway
        options: {
          body: { ...newProduct, price: parseFloat(price), quantity: parseInt(quantity) },
        },
      });
      fetchProducts(); // Refetch products to show the new item
      setNewProduct({ productName: "", quantity: "", price: "", description: "N/A", lowStockThreshold: 10 });
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // NEW FUNCTION: Update a product in the backend
  const updateProduct = async (e) => {
    e.preventDefault();
    const { productId, productName, quantity, price } = editProduct;
    if (!productName || !quantity || !price) return;
    
    try {
      await put({
        apiName: apiName,
        path: `/products/${productId}`,
        options: {
          body: { 
            productName, 
            quantity: parseInt(quantity), 
            price: parseFloat(price),
            description: editProduct.description,
            lowStockThreshold: parseInt(editProduct.lowStockThreshold) 
          },
        },
      });
      // Optimistically update the local state and clear the edit mode
      setProducts((prev) => 
        prev.map((p) => (p.productId === productId ? editProduct : p))
      );
      setEditProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Delete a product from the backend
  const deleteProduct = async (productId) => {
    try {
      await del({
        apiName: apiName,
        path: `/products/${productId}`, // Corrected path to match API Gateway
      });
      setProducts((prev) => prev.filter((product) => product.productId !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Filter products that are low in stock
  const lowStockProducts = products.filter(
    (product) => product.quantity < product.lowStockThreshold
  );

  if (loading) {
    return <h2 className="loading-message">Loading Inventory...</h2>;
  }

  return (
    <div className="dashboard">
      <div className="card add-product-card">
        <h2>Add New Product</h2>
        <form onSubmit={addProduct} className="add-form">
          <input name="productName" value={newProduct.productName} onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })} placeholder="Product Name" required />
          <input name="quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} placeholder="Quantity" required />
          <input name="price" type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price" required />
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div className="dashboard-container">
        {/* Low Stock Alerts Card */}
        <div className="card low-stock-card">
          <h2>Low Stock Alerts</h2>
          {lowStockProducts.length > 0 ? (
            <ul className="low-stock">
              {lowStockProducts.map((product) => (
                <li key={product.productId}>
                  **{product.productName}** is low on stock! (Current: {product.quantity})
                </li>
              ))}
            </ul>
          ) : (
            <p>No products are currently low on stock. ✅</p>
          )}
        </div>

        {/* Product Table Card */}
        <div className="card product-list-card">
          <h2>Stock Levels</h2>
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                // CONDITIONAL RENDERING: Render edit form if product is selected for editing
                editProduct?.productId === product.productId ? (
                  <tr key={product.productId}>
                    <td>
                      <input
                        value={editProduct.productName}
                        onChange={(e) => setEditProduct({ ...editProduct, productName: e.target.value })}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editProduct.quantity}
                        onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editProduct.price}
                        onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                        required
                      />
                    </td>
                    <td>
                      <button className="save-btn" onClick={updateProduct}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditProduct(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  // Normal Row rendering
                  <tr key={product.productId}>
                    <td>{product.productName}</td>
                    <td>{product.quantity}</td>
                    <td>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</td>
                    <td>
                      <button 
                        className="edit-btn" 
                        onClick={() => setEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => deleteProduct(product.productId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}