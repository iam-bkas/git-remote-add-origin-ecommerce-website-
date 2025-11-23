
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
    Check, ArrowLeft, Calendar, MapPin, CreditCard, 
    FileText, Package, Truck, Home, Wallet
} from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  }

  // Calculate tax and total for display
  const tax = order.total * 0.08;
  const grandTotal = order.total + tax;

  const steps = [
    { id: 'pending', label: 'Order Placed', icon: FileText, date: order.timeline.placed },
    { id: 'processing', label: 'Processing', icon: Package, date: order.timeline.processing },
    { id: 'shipped', label: 'Shipped', icon: Truck, date: order.timeline.shipped },
    { id: 'delivered', label: 'Delivered', icon: Home, date: order.timeline.delivered },
  ];

  // Logic to handle cancelled state in timeline visualization
  let currentStepIndex = steps.findIndex(s => s.id === order.status);
  if (order.status === 'cancelled') {
      currentStepIndex = -1; // Or handle differently
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <Link to="/account" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Order #{order.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }
                    `}>
                        {order.status}
                    </span>
                    {order.paymentStatus === 'refunded' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-200 text-gray-700">
                            Refunded
                        </span>
                    )}
                </div>
                <p className="text-gray-500 text-sm mt-1">
                    Placed on {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                </p>
            </div>
            <Link 
                to={`/order/${order.id}/invoice`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
                <FileText className="h-4 w-4" /> View Invoice
            </Link>
        </div>

        {/* Timeline */}
        {order.status !== 'cancelled' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-8">Order Status</h2>
                <div className="relative">
                    {/* Connector Line */}
                    <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-100 hidden md:block" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const Icon = step.icon;
                            
                            return (
                                <div key={step.id} className={`flex md:flex-col items-center gap-4 md:gap-0 md:text-center ${isCompleted ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-500
                                        ${isCompleted ? 'border-indigo-600' : 'border-gray-200'}
                                        ${isCurrent ? 'ring-4 ring-indigo-50 shadow-lg scale-110' : ''}
                                    `}>
                                        {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 md:mt-4">
                                        <p className={`font-bold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </p>
                                        {step.date && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(step.date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-8 mb-8 text-center">
                <div className="text-red-700 font-bold text-lg mb-2">Order Cancelled</div>
                <p className="text-red-600 text-sm">This order has been cancelled and {order.paymentStatus === 'refunded' ? 'refunded' : 'voided'}.</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900">Items Ordered</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-6 flex gap-4">
                                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover bg-gray-100" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.category}</p>
                                        </div>
                                        <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 p-6 border-t border-gray-100">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-400" /> Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="whitespace-pre-line">{order.shippingAddress}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {order.paymentMethodType === 'card' ? <CreditCard className="h-5 w-5 text-gray-400" /> : <Wallet className="h-5 w-5 text-gray-400" />} 
                        Payment Info
                    </h3>
                    <div className="text-sm text-gray-600">
                        <p className="mb-2">
                            <span className="font-medium text-gray-900">Method:</span> <span className="capitalize">{order.paymentMethod}</span>
                        </p>
                        <p className="mb-2">
                            <span className="font-medium text-gray-900">Status:</span> 
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'refunded' ? 'bg-gray-200 text-gray-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {order.paymentStatus}
                            </span>
                        </p>
                        <p><span className="font-medium text-gray-900">Billing Address:</span></p>
                        <p className="whitespace-pre-line mt-1">{order.billingAddress}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
