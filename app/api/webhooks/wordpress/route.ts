import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Note: In a real production app, you should use firebase-admin for server-side operations
// and verify the webhook signature from WooCommerce.

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Example WooCommerce Order Payload
    // {
    //   "id": 123,
    //   "status": "processing",
    //   "total": "100.00",
    //   "billing": { "first_name": "John", "last_name": "Doe", "email": "john@example.com", "phone": "123456789", "address_1": "123 Main St" },
    //   "line_items": [{ "name": "Product A" }]
    // }

    if (!data || !data.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const email = data.billing?.email;
    const phone = data.billing?.phone;
    const name = `${data.billing?.first_name || ''} ${data.billing?.last_name || ''}`.trim();
    const address = data.billing?.address_1 || '';
    const amount = parseFloat(data.total || '0');
    const product = data.line_items?.map((item: any) => item.name).join(', ') || 'Unknown Product';
    
    let customerId = '';

    // 1. Find or create customer
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      customerId = querySnapshot.docs[0].id;
    } else {
      // Create new customer
      const newCustomerRef = await addDoc(customersRef, {
        name: name || 'Unknown',
        email: email || '',
        phone: phone || '',
        address: address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      customerId = newCustomerRef.id;
    }

    // 2. Create order
    await addDoc(collection(db, 'orders'), {
      customerId,
      wpOrderId: data.id.toString(),
      product,
      amount,
      status: data.status === 'completed' ? 'completed' : 'processing',
      source: 'wordpress',
      purchaseDate: new Date().toISOString(),
      warrantyPeriod: '12 months', // Default or extract from meta
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({ success: true, message: 'Order synced' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
