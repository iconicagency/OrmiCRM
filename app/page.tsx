'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, ShoppingCart, MessageCircle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    revenue: 0,
    conversations: 0
  });

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const customersSnap = await getDocs(collection(db, 'customers'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const convSnap = await getDocs(collection(db, 'conversations'));

        let revenue = 0;
        ordersSnap.forEach(doc => {
          revenue += doc.data().amount || 0;
        });

        if (mounted) {
          setStats({
            customers: customersSnap.size,
            orders: ordersSnap.size,
            revenue,
            conversations: convSnap.size
          });
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    }
    loadStats();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Tổng quan</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-slate-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Tổng khách hàng</dt>
                  <dd className="text-2xl font-bold text-slate-900 mt-1">{stats.customers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-slate-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Tổng đơn hàng</dt>
                  <dd className="text-2xl font-bold text-slate-900 mt-1">{stats.orders}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-slate-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Tổng doanh thu</dt>
                  <dd className="text-2xl font-bold text-slate-900 mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl border border-slate-100">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-xl">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Tin nhắn đang mở</dt>
                  <dd className="text-2xl font-bold text-slate-900 mt-1">{stats.conversations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
