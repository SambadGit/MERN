import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateProductMutation } from '../services/api';

const initialForm = { name: '', description: '', price: '', stock: '10', category: 'General', image: '' };

// This page is the focused product-creation workflow linked from the sidebar.
export function AddProductPage() {
  const [form, setForm] = useState(initialForm);
  const [create, state] = useCreateProductMutation();
  const navigate = useNavigate();

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await create({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        image: form.image || undefined,
      }).unwrap();
      navigate('/products');
    } catch (_error) {
      // The mutation state below gives the user a clear error message.
    }
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Catalog</span>
          <h2>Add product</h2>
        </div>
        <Link className="secondary-button button-link" to="/products">Back to products</Link>
      </div>
      <div className="standalone-form panel">
        <div className="form-intro">
          <span className="eyebrow">Product details</span>
          <h3>Create a catalog item</h3>
          <p className="muted">Add the information your team needs to sell and fulfill this product.</p>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="form-row">
            <label>Product name<input required value={form.name} onChange={(event) => updateField('name', event.target.value)} /></label>
            <label>Category<input required value={form.category} onChange={(event) => updateField('category', event.target.value)} /></label>
          </div>
          <label>Description<textarea required rows={4} value={form.description} onChange={(event) => updateField('description', event.target.value)} /></label>
          <div className="form-row">
            <label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} /></label>
            <label>Opening stock<input required type="number" min="0" step="1" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} /></label>
          </div>
          <label>Image URL <span className="muted">(optional)</span><input type="url" value={form.image} onChange={(event) => updateField('image', event.target.value)} placeholder="https://..." /></label>
          {state.isError && <p className="error-box" role="alert">Product could not be created. Check the values and try again.</p>}
          <div className="form-actions"><Link className="secondary-button button-link" to="/products">Cancel</Link><button disabled={state.isLoading}>{state.isLoading ? 'Creating product...' : 'Create product'}</button></div>
        </form>
      </div>
    </section>
  );
}
