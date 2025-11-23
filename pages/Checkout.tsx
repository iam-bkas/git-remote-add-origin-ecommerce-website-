
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, CreditCard, ShieldCheck, MapPin, ChevronRight, Edit2, Mail, Smartphone, Wallet, AlertTriangle, Loader2, Tag } from 'lucide-react';
import { PaymentMethod } from '../types';

type CheckoutStep = 'shipping' | 'billing' | 'payment' | 'review';

const Checkout = () => {
  const { cart, cartTotal, placeOrder, user, validateCoupon, addNotification } = useStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Discount State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, amount: number} | null>(null);

  // Form States
  const [email, setEmail] = useState(user?.email || '');
  
  // Shipping State
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Billing State
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });

  // Payment State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  
  // Gateway Mock State
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'connecting' | 'processing' | 'success' | 'failed'>('connecting');

  useEffect(() => {
    if (user && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setShippingAddress({
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
        street: defaultAddr.street,
        city: defaultAddr.city,
        state: defaultAddr.state,
        zip: defaultAddr.zip,
        country: defaultAddr.country
      });
    }
  }, [user]);

  // Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const subtotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
  const shippingCost = subtotalAfterDiscount > 150 ? 0 : 15;
  const tax = subtotalAfterDiscount * 0.08;
  const grandTotal = subtotalAfterDiscount + shippingCost + tax;

  const handleApplyCoupon = () => {
      const coupon = validateCoupon(couponCode.toUpperCase(), cartTotal);
      if (coupon) {
          let amount = 0;
          if (coupon.type === 'percent') {
              amount = cartTotal * (coupon.value / 100);
          } else {
              amount = coupon.value;
          }
          setAppliedCoupon({ code: coupon.code, amount });
          addNotification('success', `Coupon ${coupon.code} applied!`);
      } else {
          setAppliedCoupon(null);
          addNotification('error', 'Invalid coupon code or minimum order not met.');
      }
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setShippingAddress({
        firstName: user?.name.split(' ')[0] || '',
        lastName: user?.name.split(' ')[1] || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States'
      });
    } else {
      const addr = user?.addresses.find(a => a.id === id);
      if (addr) {
        setShippingAddress({
            firstName: user?.name.split(' ')[0] || '',
            lastName: user?.name.split(' ')[1] || '',
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            country: addr.country
        });
      }
    }
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    
    // Check if we need to simulate external gateway
    if (selectedPaymentMethod !== 'card') {
        setShowGatewayModal(true);
        setGatewayStatus('connecting');
        
        // Simulation Sequence
        setTimeout(() => setGatewayStatus('processing'), 1500);
        setTimeout(() => setGatewayStatus('success'), 3500);
        setTimeout(() => {
            finalizeOrder();
        }, 4500);
        return;
    }

    // Direct Card Processing Simulation
    setTimeout(() => {
        finalizeOrder();
    }, 2000);
  };

  const finalizeOrder = () => {
    const finalBilling = sameAsShipping ? shippingAddress : billingAddress;
    let paymentMethodDisplay = '';
    
    switch (selectedPaymentMethod) {
        case 'card':
            paymentMethodDisplay = `Card ending in ${cardDetails.cardNumber.slice(-4) || '4242'}`;
            break;
        case 'esewa':
            paymentMethodDisplay = 'eSewa Wallet';
            break;
        case 'khalti':
            paymentMethodDisplay = 'Khalti Wallet';
            break;
        case 'paypal':
            paymentMethodDisplay = 'PayPal';
            break;
    }

    placeOrder({
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: email,
        items: cart,
        subtotal: cartTotal,
        discount: discountAmount,
        tax: tax,
        shippingCost: shippingCost,
        total: grandTotal,
        shippingAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
        billingAddress: `${finalBilling.street}, ${finalBilling.city}, ${finalBilling.state} ${finalBilling.zip}`,
        paymentMethod: paymentMethodDisplay,
        paymentMethodType: selectedPaymentMethod
    });

    setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsProcessing(false);
    setShowGatewayModal(false);
    setIsSuccess(true);
    window.scrollTo(0,0);
  };

  // Steps Rendering Helpers
  const renderProgress = () => {
    const steps: CheckoutStep[] = ['shipping', 'billing', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);

    return (
        <div className="flex justify-between items-center mb-10 px-4 md:px-0">
            {steps.map((step, idx) => {
                const isActive = idx === currentIndex;
                const isCompleted = idx < currentIndex;
                
                return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            ${isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
                              isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                        `}>
                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                        </div>
                        <span className={`text-xs mt-2 font-medium uppercase tracking-wide hidden md:block ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                            {step}
                        </span>
                    </div>
                );
            })}
            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-0 hidden md:block"></div>
            {/* Progress Bar Fill */}
            <div 
                className="absolute top-4 left-0 h-0.5 bg-green-500 -z-0 transition-all duration-500 hidden md:block" 
                style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            ></div>
        </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center animate-fade-in-up border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6 animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 text-lg mb-2">Order ID: <span className="font-mono font-bold text-gray-900">#{orderId}</span></p>
          <p className="text-gray-500 mb-8 text-sm bg-gray-50 py-2 px-4 rounded-lg inline-block">
            <Mail className="inline h-4 w-4 mr-1 relative -top-0.5" />
            Confirmation sent to <strong>{email}</strong>
          </p>
          
          <div className="space-y-3">
             {user && (
                 <Link
                    to="/account"
                    className="block w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    View My Orders
                </Link>
             )}
              <Link
                to="/shop"
                className={`block w-full font-bold py-3 px-4 rounded-xl transition-colors ${user ? 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
            >
                Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
            <Link to="/shop" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      {/* Gateway Simulation Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up">
                <div className={`h-2 w-full ${
                    selectedPaymentMethod === 'esewa' ? 'bg-green-500' : 
                    selectedPaymentMethod === 'khalti' ? 'bg-purple-700' : 'bg-blue-600'
                }`}></div>
                <div className="p-8 text-center">
                    {gatewayStatus === 'connecting' && (
                        <>
                            <Loader2 className="h-12 w-12 text-gray-300 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">Redirecting...</h3>
                            <p className="text-gray-500 mt-2">Connecting to secure payment gateway.</p>
                        </>
                    )}
                    {gatewayStatus === 'processing' && (
                        <>
                             <div className="mx-auto flex items-center justify-center h-16 w-16 bg-gray-100 rounded-full mb-4 animate-pulse">
                                 <ShieldCheck className="h-8 w-8 text-gray-600" />
                             </div>
                             <h3 className="text-lg font-bold text-gray-900">Processing Payment</h3>
                             <p className="text-gray-500 mt-2">Please do not close this window.</p>
                        </>
                    )}
                    {gatewayStatus === 'success' && (
                        <>
                             <div className="mx-auto flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-4 animate-scale-in">
                                 <CheckCircle className="h-8 w-8 text-green-600" />
                             </div>
                             <h3 className="text-lg font-bold text-gray-900">Payment Successful</h3>
                             <p className="text-gray-500 mt-2">Redirecting back to merchant...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Checkout</h1>
        
        {renderProgress()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* STEP 1: SHIPPING */}
                {currentStep === 'shipping' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-right">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <MapPin className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-bold">Shipping Address</h2>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email for confirmation</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-3 border"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Saved Addresses */}
                        {user && user.addresses.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Saved Address</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {user.addresses.map(addr => (
                                        <button
                                            key={addr.id}
                                            onClick={() => handleAddressSelect(addr.id)}
                                            className={`text-left p-3 rounded-xl border-2 transition-all ${selectedAddressId === addr.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                                        >
                                            <div className="font-bold text-sm text-gray-900">{addr.label}</div>
                                            <div className="text-xs text-gray-500 truncate">{addr.street}, {addr.city}</div>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleAddressSelect('new')}
                                        className={`text-left p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${selectedAddressId === 'new' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 border-dashed hover:border-indigo-300'}`}
                                    >
                                        <div className="font-medium text-sm text-gray-600">+ New Address</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Address Form */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input 
                                    value={shippingAddress.firstName} 
                                    onChange={e => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input 
                                    value={shippingAddress.lastName} 
                                    onChange={e => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                <input 
                                    value={shippingAddress.street} 
                                    onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input 
                                    value={shippingAddress.city} 
                                    onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                                <input 
                                    value={shippingAddress.state} 
                                    onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                                <input 
                                    value={shippingAddress.zip} 
                                    onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <select 
                                    value={shippingAddress.country} 
                                    onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 p-2.5 border"
                                >
                                    <option>United States</option>
                                    <option>Canada</option>
                                    <option>United Kingdom</option>
                                    <option>Australia</option>
                                    <option>Nepal</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={() => setCurrentStep('billing')}
                                disabled={!shippingAddress.street || !shippingAddress.city || !email}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                Continue to Billing <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: BILLING */}
                {currentStep === 'billing' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-right">
                         <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-bold">Billing Address</h2>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={sameAsShipping}
                                    onChange={e => setSameAsShipping(e.target.checked)}
                                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="font-medium text-gray-900">Same as shipping address</span>
                            </label>
                        </div>

                        {!sameAsShipping && (
                             <div className="grid grid-cols-2 gap-4 animate-fade-in-down">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input 
                                        value={billingAddress.firstName} 
                                        onChange={e => setBillingAddress({...billingAddress, firstName: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input 
                                        value={billingAddress.lastName} 
                                        onChange={e => setBillingAddress({...billingAddress, lastName: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                    <input 
                                        value={billingAddress.street} 
                                        onChange={e => setBillingAddress({...billingAddress, street: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input 
                                        value={billingAddress.city} 
                                        onChange={e => setBillingAddress({...billingAddress, city: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input 
                                        value={billingAddress.state} 
                                        onChange={e => setBillingAddress({...billingAddress, state: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                                    <input 
                                        value={billingAddress.zip} 
                                        onChange={e => setBillingAddress({...billingAddress, zip: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-2.5 border"
                                    />
                                </div>
                             </div>
                        )}

                        <div className="mt-8 flex justify-between">
                             <button 
                                onClick={() => setCurrentStep('shipping')}
                                className="text-gray-500 font-medium hover:text-gray-900 px-4"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => setCurrentStep('payment')}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                            >
                                Continue to Payment <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PAYMENT */}
                {currentStep === 'payment' && (
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-right">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                           <CreditCard className="h-5 w-5 text-indigo-600" />
                           <h2 className="text-xl font-bold">Payment Method</h2>
                       </div>
                       
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <button
                                onClick={() => setSelectedPaymentMethod('card')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                            >
                                <CreditCard className="h-6 w-6" />
                                <span className="text-xs font-bold">Card</span>
                            </button>
                            <button
                                onClick={() => setSelectedPaymentMethod('esewa')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === 'esewa' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-200'}`}
                            >
                                <Wallet className="h-6 w-6" />
                                <span className="text-xs font-bold">eSewa</span>
                            </button>
                            <button
                                onClick={() => setSelectedPaymentMethod('khalti')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === 'khalti' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-200'}`}
                            >
                                <Smartphone className="h-6 w-6" />
                                <span className="text-xs font-bold">Khalti</span>
                            </button>
                            <button
                                onClick={() => setSelectedPaymentMethod('paypal')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${selectedPaymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200'}`}
                            >
                                <div className="text-xl font-serif font-bold italic leading-none">P</div>
                                <span className="text-xs font-bold">PayPal</span>
                            </button>
                       </div>

                       {selectedPaymentMethod === 'card' && (
                           <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            value={cardDetails.cardNumber} 
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                setCardDetails({...cardDetails, cardNumber: val});
                                            }}
                                            className="w-full rounded-lg border-gray-300 pl-10 p-3 border font-mono tracking-wider"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                        <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                    <input 
                                        value={cardDetails.name}
                                        onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                                        className="w-full rounded-lg border-gray-300 p-3 border"
                                        placeholder="Name on card"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input 
                                            value={cardDetails.expiry}
                                            onChange={e => {
                                                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2);
                                                setCardDetails({...cardDetails, expiry: val});
                                            }}
                                            className="w-full rounded-lg border-gray-300 p-3 border"
                                            placeholder="MM/YY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                        <input 
                                            type="password"
                                            value={cardDetails.cvc}
                                            onChange={e => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0,3)})}
                                            className="w-full rounded-lg border-gray-300 p-3 border"
                                            placeholder="123"
                                        />
                                    </div>
                                </div>
                           </div>
                       )}

                       {selectedPaymentMethod !== 'card' && (
                           <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center animate-fade-in">
                               <p className="text-gray-600 mb-4">
                                   You will be redirected to <strong>{selectedPaymentMethod === 'esewa' ? 'eSewa' : selectedPaymentMethod === 'khalti' ? 'Khalti' : 'PayPal'}</strong> to complete your purchase securely.
                               </p>
                               <div className="flex justify-center text-gray-400 gap-2">
                                   <ShieldCheck className="h-5 w-5" />
                                   <span className="text-sm">Secure Redirect</span>
                               </div>
                           </div>
                       )}

                       <div className="mt-8 flex justify-between">
                             <button 
                                onClick={() => setCurrentStep('billing')}
                                className="text-gray-500 font-medium hover:text-gray-900 px-4"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => setCurrentStep('review')}
                                disabled={selectedPaymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.cvc || !cardDetails.expiry)}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                Review Order <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                     </div>
                )}

                {/* STEP 4: REVIEW */}
                {currentStep === 'review' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-right">
                         <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Review Your Order</h2>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             <div className="bg-gray-50 p-4 rounded-xl">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-gray-700 text-sm">Shipping Address</h3>
                                     <button onClick={() => setCurrentStep('shipping')} className="text-indigo-600 hover:text-indigo-800"><Edit2 className="h-3 w-3" /></button>
                                 </div>
                                 <p className="text-sm text-gray-600">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                                 <p className="text-sm text-gray-600">{shippingAddress.street}</p>
                                 <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-xl">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-gray-700 text-sm">Payment Method</h3>
                                     <button onClick={() => setCurrentStep('payment')} className="text-indigo-600 hover:text-indigo-800"><Edit2 className="h-3 w-3" /></button>
                                 </div>
                                 <p className="text-sm text-gray-600 flex items-center gap-2 capitalize">
                                     {selectedPaymentMethod === 'card' ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />} 
                                     {selectedPaymentMethod === 'card' ? `Card ending in ${cardDetails.cardNumber.slice(-4)}` : selectedPaymentMethod}
                                 </p>
                                 {selectedPaymentMethod === 'card' && <p className="text-sm text-gray-600 mt-1">Exp: {cardDetails.expiry}</p>}
                             </div>
                         </div>

                         <div className="border rounded-xl overflow-hidden mb-8">
                             {cart.map(item => (
                                 <div key={item.id} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50">
                                     <img src={item.image} alt="" className="w-16 h-16 rounded-md object-cover" />
                                     <div className="flex-1">
                                         <div className="flex justify-between">
                                             <h4 className="font-bold text-gray-900">{item.name}</h4>
                                             <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                         </div>
                                         <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>

                         <div className="mt-8 flex justify-between">
                             <button 
                                onClick={() => setCurrentStep('payment')}
                                className="text-gray-500 font-medium hover:text-gray-900 px-4"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-75 transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2"
                            >
                                {isProcessing ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Summary Sticky Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-2xl sticky top-24 border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        
                        {/* Coupon Section */}
                        {appliedCoupon ? (
                             <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Promo Code"
                                    className="flex-1 rounded-lg border-gray-300 text-sm p-2 border focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                                <button 
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode}
                                    className="bg-gray-900 text-white px-3 rounded-lg text-sm font-bold hover:bg-gray-700 disabled:opacity-50"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                         {appliedCoupon && (
                             <button 
                                onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                                className="text-xs text-red-500 hover:underline"
                             >
                                 Remove Coupon
                             </button>
                         )}

                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            {shippingCost === 0 ? (
                                <span className="text-green-600 font-medium">Free</span>
                            ) : (
                                <span>${shippingCost.toFixed(2)}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Taxes (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
                        <span className="font-bold text-lg text-gray-900">Total</span>
                        <span className="font-bold text-2xl text-gray-900">${grandTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                        <ShieldCheck className="h-4 w-4" />
                        Secure Checkout powered by Lumina
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
