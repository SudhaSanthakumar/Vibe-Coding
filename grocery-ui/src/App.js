import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pickupOrDelivery, setPickupOrDelivery] = useState('pickup');
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

  const fetchOrderHistory = () => {
    fetch(`${BASE_URL}/history`)
      .then(res => res.json())
      .then(data => setOrderHistory(data));
  };

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
    fetch(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickupOrDelivery })
    })
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
      <div style={{marginBottom:'1em'}}>
        <label>
          <input type="radio" name="pickupOrDelivery" value="pickup" checked={pickupOrDelivery === 'pickup'} onChange={() => setPickupOrDelivery('pickup')} /> Pickup
        </label>
        <label style={{marginLeft:'1.5em'}}>
          <input type="radio" name="pickupOrDelivery" value="delivery" checked={pickupOrDelivery === 'delivery'} onChange={() => setPickupOrDelivery('delivery')} /> Delivery
        </label>
      </div>
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
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Type:</strong> {order.pickupOrDelivery ? order.pickupOrDelivery.charAt(0).toUpperCase() + order.pickupOrDelivery.slice(1) : ''}</p>
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

      <button style={{marginTop:'2em'}} onClick={() => { setShowHistory(h => !h); if (!showHistory) fetchOrderHistory(); }}>
        {showHistory ? 'Hide Order History' : 'View Order History'}
      </button>

      {showHistory && (
        <div style={{marginTop:'1em'}}>
          <h2>Order History</h2>
          {orderHistory.length === 0 ? <p>No orders yet.</p> : (
            <table>
              <thead>
                <tr><th>Order ID</th><th>Type</th><th>Status</th><th>Total</th><th>Items</th></tr>
              </thead>
              <tbody>
                {orderHistory.map((ord, idx) => (
                  <tr key={ord.orderId || idx}>
                    <td>{ord.orderId}</td>
                    <td>{ord.pickupOrDelivery ? ord.pickupOrDelivery.charAt(0).toUpperCase() + ord.pickupOrDelivery.slice(1) : ''}</td>
                    <td>{ord.paid ? 'Paid' : 'Not Paid'}</td>
                    <td>${ord.total}</td>
                    <td>
                      <ul style={{margin:0, paddingLeft:18}}>
                        {ord.items.map((item, i) => (
                          <li key={i}>{item.name} x {item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {message && <div style={{marginTop: '1em', color: 'green'}}>{message}</div>}
    </div>
  );
}

export default App;
