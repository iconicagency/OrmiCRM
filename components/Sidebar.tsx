'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, MessageCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Khách hàng', href: '/customers', icon: Users },
  { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart },
  { name: 'Tin nhắn', href: '/chat', icon: MessageCircle },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logOut, user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-slate-300 shadow-xl transition-all duration-300 z-10">
      <div className="flex h-16 items-center px-6 border-b border-slate-800 bg-slate-950">
        <h1 className="text-2xl font-bold text-white tracking-wide">Omni<span className="text-indigo-500">CRM</span></h1>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800 p-4 bg-slate-950/50">
        <div className="flex items-center mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-300 truncate w-40">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logOut}
          className="flex w-full items-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
