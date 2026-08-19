import { useState } from 'react';
import { useCreateOrderMutation, useOrdersQuery, useProductsQuery } from '../services/api';
import type { OrderStatus } from '../types';

// Orders combines server-backed history with a stock-aware create form.
export function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const { data, isLoading, isError } = useOrdersQuery({ status });
  const { data: productsData } = useProductsQuery({ limit: 100 });
  const [createOrder, createState] = useCreateOrderMutation();
  const products = productsData?.data.items || [];

  // The backend is authoritative for stock validation and inventory updates.
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!productId && products[0]) setProductId(products[0]._id);
    const selectedId = productId || products[0]?._id;
    if (!selectedId) return;
    try {
      await createOrder({ items: [{ productId: selectedId, quantity: Number(quantity) }] }).unwrap();
      setQuantity('1');
    } catch (_error) {
      // The mutation state below displays a safe error message.
    }
  };

  if (isLoading) return <div className="state">Loading orders...</div>;
  if (isError || !data) return <div className="state error-box">Orders could not be loaded.</div>;

  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">Fulfillment</span><h2>Orders</h2></div><select value={status || ''} onChange={(event) => setStatus((event.target.value || undefined) as OrderStatus | undefined)} aria-label="Filter orders by status"><option value="">All statuses</option>{['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="content-grid orders-layout">
      <div className="panel"><div className="panel-heading"><h3>Order history</h3><span className="muted">{data.data.pagination.total} orders</span></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Placed</th></tr></thead><tbody>{data.data.items.map((order) => <tr key={order._id}><td><strong>#{order._id.slice(-7).toUpperCase()}</strong><small>{order.items.length} line items</small></td><td>{order.customer?.name || 'Customer'}<small>{order.customer?.email}</small></td><td><span className="badge">{order.status}</span></td><td>${order.total.toFixed(2)}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>{!data.data.items.length && <div className="empty">No orders match this filter.</div>}</div>
      <div className="panel form-panel"><span className="eyebrow">New transaction</span><h3>Create order</h3><form onSubmit={submit}><label>Product<select required value={productId || products[0]?._id || ''} onChange={(event) => setProductId(event.target.value)}><option value="" disabled>Select a product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name} · {product.stock} in stock</option>)}</select></label><label>Quantity<input required type="number" min="1" max={products.find((product) => product._id === (productId || products[0]?._id))?.stock || undefined} value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>{createState.isError && <p className="error-box" role="alert">Order could not be created. Check stock availability.</p>}<button disabled={createState.isLoading || !products.length}>{createState.isLoading ? 'Creating order...' : 'Create order'}</button></form>{!products.length && <p className="muted">Add a product before creating an order.</p>}</div>
    </div>
  </section>;
}
