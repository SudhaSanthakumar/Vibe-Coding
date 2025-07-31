import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [quantities, setQuantities] = useState({});

  // Backend base URL (adjust port if needed)
  const BASE_URL = 'http://localhost:8080/cart';

  useEffect(() => {
    fetch(`${BASE_URL}/inventory`)
      .then(res => res.json())
      .then(data => setInventory(data));
    fetch(`${BASE_URL}`)
      .then(res => res.json())
      .then(data => setCart(data));
  }, []);

  const addToCart = (item) => {
    const quantity = parseInt(quantities[item.name]) || 1;
    if (quantity < 1) {
      setMessage('Quantity must be at least 1.');
      return;
    }
    if (quantity > item.quantity) {
      setMessage(`Cannot add more than available stock (${item.quantity}).`);
      return;
    }
    fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: item.name, quantity, price: item.price })
    })
      .then(res => res.text())
      .then(msg => {
        setMessage(msg);
        // Refresh cart
        fetch(`${BASE_URL}`)
          .then(res => res.json())
          .then(data => setCart(data));
      });
  };

  const checkout = () => {
    fetch(`${BASE_URL}/checkout`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setCart([]);
        setMessage('Checked out!');
      });
  };

  const pay = () => {
    fetch(`${BASE_URL}/pay`, { method: 'POST' })
      .then(res => res.text())
      .then(msg => {
        setMessage(msg);
        // Refresh order
        fetch(`${BASE_URL}/order`)
          .then(res => res.json())
          .then(data => setOrder(data));
      });
  };

  return (
    <div className="App">
      <h1>Grocery Store</h1>
      <h2>Inventory</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {inventory.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>${item.price}</td>
              <td>{item.quantity}</td>
              <td style={{display:'flex', alignItems:'center', gap:'0.5em'}}>
                <input
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={quantities[item.name] || 1}
                  style={{width:'60px'}}
                  onChange={e => setQuantities(q => ({ ...q, [item.name]: e.target.value }))}
                />
                <button onClick={() => addToCart(item)}>Add to Cart</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Cart</h2>
      {cart.length === 0 ? <p>Cart is empty.</p> : (
        <table>
          <thead>
            <tr><th>Name</th><th>Price</th><th>Quantity</th></tr>
          </thead>
          <tbody>
            {cart.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={checkout} disabled={cart.length === 0}>Checkout</button>

      {order && (
        <div style={{marginTop: '2em'}}>
          <h2>Order Summary</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Price</th><th>Quantity</th></tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Total: ${order.total}</strong></p>
          <p>Status: {order.paid ? 'Paid' : 'Not Paid'}</p>
          {!order.paid && <button onClick={pay}>Pay Now</button>}
        </div>
      )}

      {message && <div style={{marginTop: '1em', color: 'green'}}>{message}</div>}
    </div>
  );
}

export default App;
