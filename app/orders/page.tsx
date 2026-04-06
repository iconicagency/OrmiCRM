'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  product: string;
  amount: number;
  status: string;
  source: string;
  warrantyPeriod: string;
  purchaseDate: any;
}

interface Customer {
  id: string;
  name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customerId: '', product: '', amount: 0, status: 'completed', warrantyPeriod: '', purchaseDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const custSnap = await getDocs(collection(db, 'customers'));
      const custData = custSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCustomers(custData);

      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const order = { id: doc.id, ...doc.data() } as Order;
        order.customerName = custData.find(c => c.id === order.customerId)?.name || 'Khách hàng ẩn danh';
        return order;
      });
      setOrders(data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'orders'), {
        ...formData,
        amount: Number(formData.amount),
        source: 'manual',
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ customerId: '', product: '', amount: 0, status: 'completed', warrantyPeriod: '', purchaseDate: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding order", error);
    }
  }

  const filteredOrders = orders.filter(o => 
    o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Hoàn thành</span>;
      case 'pending':
        return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Chờ xử lý</span>;
      case 'processing':
        return <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Đang xử lý</span>;
      case 'cancelled':
        return <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">Đã hủy</span>;
      default:
        return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Đơn hàng</h1>
          <p className="mt-2 text-sm text-slate-500">Quản lý đơn hàng thủ công và từ WordPress.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm đơn hàng
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Thêm đơn hàng mới</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Khách hàng</label>
              <select required value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border">
                <option value="">Chọn khách hàng</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sản phẩm</label>
              <input required type="text" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền (VNĐ)</label>
              <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày mua</label>
              <input required type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hạn bảo hành</label>
              <input type="text" placeholder="VD: 12 tháng" value={formData.warrantyPeriod} onChange={e => setFormData({...formData, warrantyPeriod: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border">
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">Hủy</button>
              <button type="submit" className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">Lưu</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-xl border border-slate-200 pl-11 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 shadow-sm"
        />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-2xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sản phẩm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Ngày mua</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Số tiền</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Nguồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{order.customerName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{order.product}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {order.purchaseDate ? format(new Date(order.purchaseDate), 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-700">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 capitalize">
                        {order.source === 'wordpress' ? (
                          <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium">WordPress</span>
                        ) : (
                          <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-medium">Thủ công</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                        Không tìm thấy đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
