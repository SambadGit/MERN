import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';

// All frontend requests use this backend API base URL.
const API_URL = 'http://localhost:5000/api';

// The backend expects the login token in the Authorization request header.
const setAuthHeader = (token) => ({
  Authorization: token || '',
});

// The functions below keep HTTP details in one place. Components call them
// instead of repeating fetch(), headers, JSON parsing, and error handling.
const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

// Request the current product list for the logged-in user.
const fetchProducts = async (token) => {
  const response = await fetch(`${API_URL}/products`, {
    headers: setAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load products');
  }

  return data;
};

// Use POST when id is missing (create) and PUT when id is present (update).
const saveProduct = async (product, token, method, id) => {
  const response = await fetch(`${API_URL}/products${id ? `/${id}` : ''}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...setAuthHeader(token),
    },
    body: JSON.stringify(product),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save product');
  }

  return data;
};

// Delete one product and return the server response.
const deleteProduct = async (id, token) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: setAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete product');
  }
  return data;
};

// Send a purchase to the backend, where stock validation and updates happen.
const makeTransaction = async (payload, token) => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...setAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Transaction failed');
  }

  return data;
};

// Redirect visitors who are not logged in away from protected pages.
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Show public navigation before login and application navigation after login.
const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <nav className="navbar">
      <strong>MERN Demo</strong>
      <div className="nav-links">
        {!isAuthenticated ? (
          <Link to="/login">Login</Link>
        ) : (
          <>
            <Link to="/products/new">Add Product</Link>
            <Link to="/products">View Products</Link>
            <Link to="/transactions">Transactions</Link>
            <button className="secondary" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  // Form values are kept in component state so the inputs always show current data.
  const [form, setForm] = useState({ username: 'admin', password: 'password1' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Wait for the API before treating the user as authenticated.
      const result = await loginUser(form);
      setTimeout(() => {
        onLogin(result.token, result.user.username);
        navigate('/products');
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card auth-box">
        <h2>Login</h2>
        <p>Use admin credentials to access the demo.</p>
        {error ? <div className="error">{error}</div> : null}
        {!loading ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading}>
                Login
              </button>
            </div>
          </form>
        ) : (
          <div className="loader-wrap">
            <div className="loader"></div>
            <p>Logging in...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductForm = ({ token, onSaved, editProduct }) => {
  const navigate = useNavigate();
  // The same form is used for both creating a product and editing one.
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: 10,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When editProduct arrives, copy its values into the form inputs.
    if (editProduct) {
      setForm({
        name: editProduct.name || '',
        description: editProduct.description || '',
        price: editProduct.price || '',
        stock: editProduct.stock || 10,
      });
    }
  }, [editProduct]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert numeric input strings before sending data to the API.
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      await saveProduct(payload, token, editProduct ? 'PUT' : 'POST', editProduct?._id);
      onSaved();
      if (!editProduct) {
        setForm({ name: '', description: '', price: '', stock: 10 });
      }
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="page-title">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
        {error ? <div className="error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewProductsPage = ({ token, onRefresh, refreshKey }) => {
  // These states represent the three common request states: data, loading, and error.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(token);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch again after login or whenever another component changes refreshKey.
    if (token) {
      loadProducts();
    }
  }, [token, refreshKey]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id, token);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container"><div className="card">Loading products...</div></div>;

  return (
    <div className="container">
      <div className="card">
        <h2 className="page-title">Products</h2>
        {error ? <div className="error">{error}</div> : null}
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6">No products available.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.soldCount || 0}</td>
                  <td>
                    <div className="actions">
                      <Link to={`/products/${product._id}/edit`}>
                        <button type="button">Edit</button>
                      </Link>
                      <button type="button" className="danger" onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransactionPage = ({ token, onRefresh }) => {
  // Product choices come from the API; the selected id and quantity come from the form.
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(token);
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0]._id);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    if (token) {
      loadProducts();
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      // The backend checks stock, updates the product, and returns the result.
      const result = await makeTransaction({ productId: selectedProductId, quantity: Number(quantity) }, token);
      setSuccess(`Transaction successful: ${result.message}`);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="grid-two">
        <div className="card">
          <h2 className="page-title">Transactions</h2>
          {error ? <div className="error">{error}</div> : null}
          {success ? <div className="success">{success}</div> : null}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="product">Product</label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ${Number(product.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit">Complete Purchase</button>
            </div>
          </form>
        </div>
        <div className="card">
          <h3>Inventory Preview</h3>
          {products.length === 0 ? <p>No products to show.</p> : (
            <ul>
              {products.map((product) => (
                <li key={product._id}>
                  <strong>{product.name}</strong> - {product.stock} in stock
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // Keep the login session after a browser refresh by restoring it from localStorage.
  const [token, setToken] = useState(localStorage.getItem('mern-token') || '');
  const [username, setUsername] = useState(localStorage.getItem('mern-user') || '');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Save or remove the token whenever authentication state changes.
    if (token) {
      localStorage.setItem('mern-token', token);
    } else {
      localStorage.removeItem('mern-token');
    }
  }, [token]);

  useEffect(() => {
    // Save or remove the displayed username whenever it changes.
    if (username) {
      localStorage.setItem('mern-user', username);
    } else {
      localStorage.removeItem('mern-user');
    }
  }, [username]);

  const handleLogin = (newToken, userName) => {
    setToken(newToken);
    setUsername(userName);
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
  };

  // Incrementing this value gives product pages a simple signal to reload their data.
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <>
      <Navbar isAuthenticated={!!token} onLogout={handleLogout} />
      {/* Routes decide which component is rendered for each browser path. */}
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute isAuthenticated={!!token}>
              <ProductForm token={token} onSaved={triggerRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute isAuthenticated={!!token}>
              <ProductEditRoute token={token} onSaved={triggerRefresh} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute isAuthenticated={!!token}>
              <ViewProductsPage token={token} onRefresh={triggerRefresh} refreshKey={refreshKey} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute isAuthenticated={!!token}>
              <TransactionPage token={token} onRefresh={triggerRefresh} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={token ? '/products' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={token ? '/products' : '/login'} replace />} />
      </Routes>
    </>
  );
};

const ProductEditRoute = ({ token, onSaved }) => {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`, {
          headers: setAuthHeader(token),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load product');
        }
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    };

    // Load the product selected by the :id URL parameter before showing the form.
    if (token && id) {
      loadProduct();
    }
  }, [id, token]);

  if (error) return <div className="container"><div className="card"><div className="error">{error}</div></div></div>;
  if (!product) return <div className="container"><div className="card">Loading product...</div></div>;

  return <ProductForm token={token} onSaved={onSaved} editProduct={product} />;
};

export default App;
