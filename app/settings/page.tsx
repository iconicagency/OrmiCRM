'use client';

import { useState } from 'react';
import { Copy, Check, Webhook, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = useState('');
  
  // In a real app, this would be the actual deployed URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  
  const webhooks = [
    { name: 'WordPress / WooCommerce', url: `${baseUrl}/api/webhooks/wordpress` },
    { name: 'Zalo OA', url: `${baseUrl}/api/webhooks/zalo` },
    { name: 'Messenger', url: `${baseUrl}/api/webhooks/messenger` },
  ];

  const handleCopy = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    setCopied(name);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Cài đặt</h1>
      
      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl mb-8 overflow-hidden">
        <div className="px-6 py-6 sm:p-8">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
              <Webhook className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Tích hợp Webhook</h3>
              <p className="mt-1 text-sm text-slate-500">Sử dụng các đường dẫn Webhook này để kết nối các nền tảng bên ngoài với OmniCRM.</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-6">
            {webhooks.map((webhook) => (
              <div key={webhook.name} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">{webhook.name}</label>
                <div className="mt-1 flex rounded-xl shadow-sm">
                  <div className="relative flex flex-grow items-stretch focus-within:z-10">
                    <input
                      type="text"
                      readOnly
                      value={webhook.url}
                      className="block w-full rounded-none rounded-l-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border bg-white text-slate-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(webhook.url, webhook.name)}
                    className="relative -ml-px inline-flex items-center space-x-2 rounded-r-xl border border-slate-300 bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    {copied === webhook.name ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                    <span className={copied === webhook.name ? 'text-emerald-700 font-bold' : ''}>
                      {copied === webhook.name ? 'Đã chép' : 'Sao chép'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-6 sm:p-8">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <KeyRound className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Cấu hình nền tảng</h3>
              <p className="mt-1 text-sm text-slate-500">Cấu hình API keys và secrets cho các nền tảng bên ngoài.</p>
            </div>
          </div>
          
          <form className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Zalo OA Access Token</label>
              <input type="password" placeholder="••••••••" className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Messenger Page Access Token</label>
              <input type="password" placeholder="••••••••" className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div className="pt-4">
              <button type="button" className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">
                Lưu cấu hình
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
