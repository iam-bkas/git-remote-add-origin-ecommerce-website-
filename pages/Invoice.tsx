
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Printer, ArrowLeft, Sparkles } from 'lucide-react';
import { APP_NAME } from '../constants';

const Invoice = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return <Navigate to="/account" />;
  }

  const handlePrint = () => {
    window.print();
  };

  const tax = order.total * 0.08;
  const grandTotal = order.total + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-12 print:bg-white print:py-0">
      {/* Navigation - Hidden in Print */}
      <div className="max-w-4xl mx-auto px-4 mb-8 flex justify-between items-center print:hidden">
        <Link to={`/order/${order.id}`} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Order
        </Link>
        <button 
          onClick={handlePrint}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800"
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Sparkles className="h-6 w-6 text-indigo-600" />
               <h1 className="text-2xl font-serif font-bold text-gray-900">{APP_NAME}</h1>
            </div>
            <p className="text-gray-500 text-sm">
              123 Innovation Dr.<br />
              Tech City, CA 94000<br />
              support@lumina.com
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-200 mb-2">INVOICE</h2>
            <p className="text-gray-600 font-medium">#{order.id.toUpperCase()}</p>
            <p className="text-gray-500 text-sm">{new Date(order.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
            <div className="text-gray-900 font-medium mb-1">{order.customerName}</div>
            <div className="text-gray-500 text-sm whitespace-pre-line">{order.billingAddress}</div>
            <div className="text-gray-500 text-sm mt-2">{order.email}</div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ship To</h3>
            <div className="text-gray-900 font-medium mb-1">{order.customerName}</div>
            <div className="text-gray-500 text-sm whitespace-pre-line">{order.shippingAddress}</div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-sm font-bold text-gray-900">Item</th>
                <th className="py-3 text-sm font-bold text-gray-900 text-right">Quantity</th>
                <th className="py-3 text-sm font-bold text-gray-900 text-right">Price</th>
                <th className="py-3 text-sm font-bold text-gray-900 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 text-sm text-gray-600">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.id}</div>
                  </td>
                  <td className="py-4 text-sm text-gray-600 text-right">{item.quantity}</td>
                  <td className="py-4 text-sm text-gray-600 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-4 text-sm font-medium text-gray-900 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-100">
          <p className="font-serif font-bold text-gray-900 text-lg mb-2">Thank you for your business</p>
          <p className="text-gray-500 text-sm">
            If you have any questions about this invoice, please contact<br />
            support@lumina.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
