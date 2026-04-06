'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Search, Database } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zaloId?: string;
  messengerId?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', zaloId: '', messengerId: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'customers'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ name: '', phone: '', email: '', address: '', zaloId: '', messengerId: '' });
      fetchCustomers();
    } catch (error) {
      console.error("Error adding customer", error);
    }
  }

  async function generateSampleData() {
    setIsSeeding(true);
    const sampleCustomers = [
      { name: 'Nguyễn Văn An', phone: '0901234567', email: 'nguyenvan.an@example.com', address: '123 Lê Lợi, Quận 1, TP.HCM', zaloId: 'zalo_123', messengerId: 'msg_123' },
      { name: 'Trần Thị Bình', phone: '0912345678', email: 'tranthi.binh@example.com', address: '456 Nguyễn Huệ, Quận 1, TP.HCM', zaloId: 'zalo_456', messengerId: '' },
      { name: 'Lê Văn Cường', phone: '0923456789', email: 'levan.cuong@example.com', address: '789 Trần Hưng Đạo, Quận 5, TP.HCM', zaloId: '', messengerId: 'msg_789' },
      { name: 'Phạm Thị Dung', phone: '0934567890', email: 'phamthi.dung@example.com', address: '101 Võ Văn Tần, Quận 3, TP.HCM', zaloId: 'zalo_101', messengerId: 'msg_101' },
      { name: 'Hoàng Văn Em', phone: '0945678901', email: 'hoangvan.em@example.com', address: '202 Hai Bà Trưng, Quận 3, TP.HCM', zaloId: '', messengerId: '' },
    ];

    try {
      for (const cust of sampleCustomers) {
        await addDoc(collection(db, 'customers'), {
          ...cust,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      await fetchCustomers();
    } catch (error) {
      console.error("Error adding sample data", error);
    } finally {
      setIsSeeding(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Khách hàng</h1>
          <p className="mt-2 text-sm text-slate-500">Danh sách toàn bộ khách hàng của bạn.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={generateSampleData}
            disabled={isSeeding}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
            <Database className="mr-2 h-4 w-4 text-slate-500" />
            {isSeeding ? 'Đang tạo...' : 'Tạo dữ liệu mẫu'}
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Thêm khách hàng mới</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zalo ID (Tùy chọn)</label>
              <input type="text" value={formData.zaloId} onChange={e => setFormData({...formData, zaloId: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Messenger ID (Tùy chọn)</label>
              <input type="text" value={formData.messengerId} onChange={e => setFormData({...formData, messengerId: e.target.value})} className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" />
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
          placeholder="Tìm kiếm khách hàng..."
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Họ và tên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Số điện thoại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Địa chỉ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{customer.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{customer.phone}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{customer.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{customer.address}</td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                        Không tìm thấy khách hàng nào.
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
