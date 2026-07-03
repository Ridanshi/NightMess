import React, { useState, useEffect } from 'react';
import API from 'axiosConfig';

function FoodProducts() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await API.get(
          'https://world.openfoodfacts.org/cgi/search.pl?search_terms=snacks&search_simple=1&action=process&json=1'
        );
        setProducts(res.data.products.slice(0, 12)); // first 12 results
      } catch (err) {
        console.error('API error', err);
      }
    }
    fetchProducts();
  }, []);

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Food Products</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {products.map(p => (
          <div key={p.code} style={{
            border: '1px solid #ddd', borderRadius: 8, padding: 10, width: 180
          }}>
            <img
              src={p.image_small_url}
              alt={p.product_name}
              style={{ width: '100%', height: 100, objectFit: 'cover' }}
            />
            <h4>{p.product_name || 'Unnamed'}</h4>
            <p><b>Brand:</b> {p.brands || 'Unknown'}</p>
            <button
              onClick={() => addToCart(p)}
              style={{
                background: '#28a745', color: 'white',
                padding: '6px 12px', marginTop: 8, border: 'none', borderRadius: 4
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 30 }}>Cart ({cart.length})</h3>
      <ul>
        {cart.map((item, idx) => (
          <li key={idx}>{item.product_name || 'Unnamed Product'}</li>
        ))}
      </ul>
    </div>
  );
}

export default FoodProducts;
