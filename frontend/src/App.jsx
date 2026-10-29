import { useCallback, useEffect, useMemo, useState } from 'react';
import { request } from './api.js';

const blank = { foodId: '', name: '', category: '', cuisine: '', ingredients: '', price: '', quantity: '', description: '', imageUrl: '' };
const money = n => Number(n || 0).toLocaleString('vi-VN') + ' đ';
const normalize = values => ({
  ...values,
  ingredients: String(values.ingredients || '').split(',').map(s => s.trim()).filter(Boolean),
  price: Number(values.price),
  quantity: Number(values.quantity)
});
function getForm(food) {
  return food ? { ...food, ingredients: (food.ingredients || []).join(', ') } : { ...blank };
}

export default function App() {
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(getForm());
  const [saving, setSaving] = useState(false);

  const fetchFoods = useCallback(async (search = '') => {
    setLoading(true); setError('');
    try {
      const data = await request(`/api/foods${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setFoods(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const id = setTimeout(() => fetchFoods(query), 250); return () => clearTimeout(id); }, [query, fetchFoods]);
  const categories = useMemo(() => new Set(foods.map(f => f.category)).size, [foods]);

  function beginAdd() { setEditing('new'); setForm(getForm()); setMessage(''); setError(''); }
  function beginEdit(food) { setEditing(food._id || food.foodId); setForm(getForm(food)); setViewing(null); setMessage(''); setError(''); }
  function change(field, value) { setForm(prev => ({ ...prev, [field]: value })); }
  async function save(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const isNew = editing === 'new';
      await request(isNew ? '/api/foods' : `/api/foods/${editing}`, {
        method: isNew ? 'POST' : 'PUT', body: JSON.stringify(normalize(form))
      });
      setEditing(null);
      setMessage(isNew ? 'Đã thêm món ăn mới.' : 'Đã cập nhật món ăn.');
      await fetchFoods(query);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function remove(food) {
    if (!window.confirm(`Xóa món "${food.name}"?`)) return;
    setError(''); setMessage('');
    try {
      await request(`/api/foods/${food._id || food.foodId}`, { method: 'DELETE' });
      setViewing(null);
      setMessage('Đã xóa món ăn.');
      await fetchFoods(query);
    } catch (err) { setError(err.message); }
  }
  async function details(food) {
    setError('');
    try { setViewing(await request(`/api/foods/${food._id || food.foodId}`)); }
    catch (err) { setError(err.message); }
  }
  return (
    <div className="app">
      <header className="header">
        <div className="logo"><span className="mark">✦</span><div><strong>CloudFoods</strong><small>Đồ án điện toán đám mây · 236602</small></div></div>
        <span className="status"><i /> MongoDB Atlas · MERN</span>
      </header>
      <main className="main">
        <section className="intro"><div><div className="eyebrow">FOOD MANAGEMENT / CLOUD APP</div><h1>Quản lý món ăn</h1><p>Danh sách, giá bán và số lượng món ăn được lưu trữ trên MongoDB Atlas.</p></div><button className="primary" onClick={beginAdd}>+ Thêm món ăn</button></section>
        <section className="stats"><div><small>TỔNG MÓN ĂN</small><strong>{foods.length}</strong></div><div><small>LOẠI MÓN ĂN</small><strong>{categories}</strong></div><div><small>TỔNG SỐ LƯỢNG</small><strong>{foods.reduce((sum,f) => sum + Number(f.quantity || 0), 0)}</strong></div></section>
        <section className="content"><div className="toolbar"><div><h2>Danh mục món ăn</h2><p>Tìm theo tên, loại hoặc vùng miền</p></div><input aria-label="Tìm kiếm món ăn" className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="⌕  Tìm kiếm món ăn..." /></div>
          {message && <div role="status" className="notice good">{message}</div>}
          {error && <div role="alert" className="notice bad">{error}</div>}
          {loading ? <div className="empty">Đang tải dữ liệu...</div> : foods.length === 0 ? <div className="empty">Chưa có món ăn phù hợp.</div> : <div className="grid">{foods.map(food => <article className="food" key={food._id || food.foodId}><div className="food-media">{food.imageUrl ? <img src={food.imageUrl} alt={food.name} onError={e => { e.currentTarget.style.display = 'none'; }} /> : <span>🍲</span>}</div><div className="food-content"><div className="chips"><span>{food.category}</span><span>{food.cuisine}</span></div><h3>{food.name}</h3><p className="desc">{food.description}</p><div className="price">{money(food.price)}<small>Còn {food.quantity}</small></div><div className="actions"><button onClick={()=>details(food)}>Chi tiết</button><button onClick={()=>beginEdit(food)}>Sửa</button><button className="danger-text" onClick={()=>remove(food)}>Xóa</button></div></div></article>)}</div>}
        </section>
      </main>
      {viewing && <div className="overlay" onMouseDown={e => { if(e.target === e.currentTarget) setViewing(null); }}><div className="modal" role="dialog" aria-modal="true" aria-label="Chi tiết món ăn"><button className="close" aria-label="Đóng" onClick={()=>setViewing(null)}>✕</button><div className="eyebrow">CHI TIẾT MÓN ĂN</div><h2>{viewing.name}</h2><p><b>Mã:</b> {viewing.foodId}</p><p><b>Loại:</b> {viewing.category} | <b>Ẩm thực:</b> {viewing.cuisine}</p><p><b>Nguyên liệu:</b> {(viewing.ingredients||[]).join(', ')}</p><p><b>Giá:</b> {money(viewing.price)} | <b>Số lượng:</b> {viewing.quantity}</p><p><b>Mô tả:</b> {viewing.description}</p><button className="primary" onClick={()=>beginEdit(viewing)}>Chỉnh sửa</button></div></div>}
      {editing && <div className="overlay" onMouseDown={e => { if(e.target === e.currentTarget) setEditing(null); }}><div className="modal" role="dialog" aria-modal="true" aria-label="Biểu mẫu món ăn"><button className="close" aria-label="Đóng" onClick={()=>setEditing(null)}>✕</button><div className="eyebrow">QUẢN LÝ MÓN ĂN</div><h2>{editing === 'new' ? 'Thêm món ăn' : 'Cập nhật món ăn'}</h2><form onSubmit={save}><div className="fields">{[
          ['foodId','Mã món ăn','text'],['name','Tên món ăn','text'],['category','Loại món ăn','text'],['cuisine','Ẩm thực / vùng miền','text'],['ingredients','Nguyên liệu (cách nhau bằng dấu phẩy)','text'],['price','Giá bán (VNĐ)','number'],['quantity','Số lượng','number'],['description','Mô tả','text'],['imageUrl','Link hình ảnh (không bắt buộc)','url']
        ].map(([key,label,type]) => <label key={key} className={key==='ingredients' || key==='description'||key==='imageUrl' ? 'wide': ''}>{label}<input type={type} value={form[key] ?? ''} onChange={e=>change(key,e.target.value)} required={key!=='imageUrl'} min={type==='number' ? 0:undefined} step={key==='quantity' ? 1: undefined} /></label>)}</div><div className="form-actions"><button type="button" onClick={()=>setEditing(null)}>Hủy</button><button type="submit" className="primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu món ăn'}</button></div></form></div></div>}
      <footer>Cloud Computing Exam · 236602 · React + Express + MongoDB Atlas</footer>
    </div>
  );
}
