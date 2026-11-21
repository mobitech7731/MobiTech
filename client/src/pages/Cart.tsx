import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { formatPrice } from '../utils/formatCurrency';
import { useCartStore } from '../store/cartStore';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { createWhatsAppOrderUrl, getSanitizedWhatsAppNumber } from '../utils/whatsapp';
import { orderService, CreateOrderResponse } from '../services/orderService';
import { useMutation } from '@tanstack/react-query';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(null);
  const [cartSnapshot, setCartSnapshot] = useState<typeof items>([]);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const sanitizedWhatsAppNumber = getSanitizedWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER);
  const isWhatsAppConfigured = !!sanitizedWhatsAppNumber;

  const createOrderMutation = useMutation({
    mutationFn: (payload: Parameters<typeof orderService.createOrder>[0]) => orderService.createOrder(payload),
    onSuccess: () => {
      // Don't auto-invalidate products immediately to prevent jarring UI shifts while reading success message
      // They'll invalidate naturally on next navigation
    },
  });

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isWhatsAppConfigured) return;
    if (items.length === 0) return;
    setCheckoutError('');

    const orderPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerNote: customerNote.trim() || undefined,
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
    };

    let orderNumber = '';
    let orderSubtotal = subtotal;

    try {
      const orderResponse = await createOrderMutation.mutateAsync(orderPayload);
      orderNumber = orderResponse.orderNumber;
      orderSubtotal = orderResponse.subtotal;
      setCreatedOrder(orderResponse);
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data?.message || '').toLowerCase();
        if (msg.includes('stock') || msg.includes('available')) {
          setCheckoutError('Some items are no longer available in the requested quantity. Please review your cart.');
          return;
        }
      }
      // If server or network encounter an issue, provide a fallback reference so WhatsApp order is not blocked
      const fallbackOrderNumber = `MOB-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      orderNumber = fallbackOrderNumber;
      setCreatedOrder({
        orderNumber: fallbackOrderNumber,
        subtotal,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }

    // Save snapshot of cart items before clearing
    setCartSnapshot([...items]);
    setCheckoutStep('success');
    clearCart();

    // Open WhatsApp with complete formatted order message
    const url = createWhatsAppOrderUrl(
      orderNumber,
      items,
      orderSubtotal,
      orderPayload.customerName,
      orderPayload.customerPhone,
      orderPayload.customerNote,
      sanitizedWhatsAppNumber
    );

    if (url) {
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback: the success screen provides a prominent manual "Open WhatsApp" button
      }
    }
  };

  const handleManualWhatsAppOpen = () => {
    if (!createdOrder || !isWhatsAppConfigured) return;
    const url = createWhatsAppOrderUrl(
      createdOrder.orderNumber,
      cartSnapshot.length > 0 ? cartSnapshot : items,
      createdOrder.subtotal,
      customerName,
      customerPhone,
      customerNote,
      sanitizedWhatsAppNumber
    );
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-soft-ivory/30">
      <Navbar />

      <main className="flex-grow py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-dark">Shopping Cart</h1>
            <p className="text-primary-dark/60 mt-2">
              {checkoutStep === 'success' ? 'Order confirmed.' : 'Review your items and request an order via WhatsApp.'}
            </p>
          </div>

          {checkoutStep === 'success' && createdOrder ? (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-light-neutral shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-primary-dark mb-2">Order request created!</h2>
              <p className="text-primary-dark/60 mb-6">
                Your order <span className="font-mono text-primary-dark font-medium">{createdOrder.orderNumber}</span> has been created successfully.
              </p>
              
              <div className="bg-soft-ivory/30 border border-light-neutral rounded-xl p-4 mb-8 inline-block min-w-[200px]">
                <div className="text-sm text-primary-dark/60 mb-1">Total Amount</div>
                <div className="text-xl font-bold text-primary-dark">{formatPrice(createdOrder.subtotal)}</div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full bg-white">Continue Shopping</Button>
                </Link>
                {isWhatsAppConfigured && (
                  <Button variant="primary" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2" onClick={handleManualWhatsAppOpen}>
                    <MessageCircle size={20} /> Open WhatsApp
                  </Button>
                )}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-light-neutral/40 shadow-sm text-center px-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary-dark-teal/40 mb-6 shadow-sm">
                <ShoppingBag size={32} />
              </div>
              <h2 className="text-2xl font-bold text-primary-dark mb-3">Your cart is empty</h2>
              <p className="text-primary-dark/60 mb-8 max-w-sm">
                Looks like you haven't added anything yet. Explore our premium collection of accessories.
              </p>
              <Link to="/shop">
                <Button variant="primary" size="lg">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
              {/* Cart Items List */}
              <div className="flex-grow flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-light-neutral/60 pb-4">
                  <span className="text-primary-dark/60 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                  <button onClick={clearCart} className="text-sm font-medium text-primary-dark/60 hover:text-red-500 transition-colors">
                    Clear Cart
                  </button>
                </div>
                
                {items.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-white rounded-2xl border border-light-neutral/40 shadow-sm relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-soft-ivory/50 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    
                    <div className="flex flex-col flex-grow w-full">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <Link to={`/product/${item.product.id}`} className="hover:text-primary-dark-teal transition-colors">
                          <h3 className="text-lg font-bold text-primary-dark leading-tight">{item.product.name}</h3>
                        </Link>
                        <div className="text-lg font-bold text-primary-dark whitespace-nowrap">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-primary-dark/60 mb-4 uppercase tracking-wider text-xs font-bold">
                        {item.product.category.replace('-', ' ')}
                      </div>
                      
                      <div className="flex items-center justify-between w-full mt-auto">
                        <div className="flex items-center border border-light-neutral rounded-lg bg-soft-ivory/50 h-10">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label={`Decrease quantity for ${item.product.name}`}
                            className="w-10 flex items-center justify-center text-primary-dark hover:text-primary-dark-teal transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <div className="w-8 text-center font-bold text-sm text-primary-dark select-none">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label={`Increase quantity for ${item.product.name}`}
                            className="w-10 flex items-center justify-center text-primary-dark hover:text-primary-dark-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="text-sm text-primary-dark/50 hidden sm:block">
                          {formatPrice(item.product.price)} each
                        </div>

                        <IconButton 
                          icon={Trash2} 
                          size="sm" 
                          variant="ghost" 
                          aria-label={`Remove ${item.product.name}`}
                          onClick={() => removeItem(item.product.id)}
                          className="text-primary-dark/40 hover:text-red-500 hover:bg-red-50 ml-auto sm:ml-0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-96 flex-shrink-0">
                <div className="bg-white rounded-3xl border border-light-neutral/60 p-8 shadow-sm sticky top-32">
                  <h2 className="text-xl font-bold text-primary-dark mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-primary-dark/70">
                      <span>Subtotal</span>
                      <span className="font-medium text-primary-dark">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-primary-dark/70">
                      <span>Shipping</span>
                      <span className="text-sm">Calculated on WhatsApp</span>
                    </div>
                    <div className="border-t border-light-neutral/60 pt-4 mt-4 flex justify-between items-center">
                      <span className="font-bold text-primary-dark">Total</span>
                      <span className="text-2xl font-bold text-primary-dark">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  {checkoutStep === 'checkout' ? (
                    <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 animate-fade-in">
                      {checkoutError && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                          {checkoutError}
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-primary-dark mb-1">Name <span className="text-red-500">*</span></label>
                          <input 
                            required
                            type="text" 
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-light-neutral focus:border-primary-dark-teal outline-none text-sm"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-dark mb-1">Phone <span className="text-red-500">*</span></label>
                          <input 
                            required
                            type="tel" 
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-light-neutral focus:border-primary-dark-teal outline-none text-sm"
                            placeholder="e.g. +91 9876543210"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-dark mb-1">Email <span className="text-primary-dark/40 font-normal">(optional)</span></label>
                          <input 
                            type="email" 
                            value={customerEmail}
                            onChange={e => setCustomerEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-light-neutral focus:border-primary-dark-teal outline-none text-sm"
                            placeholder="For order updates"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-dark mb-1">Note <span className="text-primary-dark/40 font-normal">(optional)</span></label>
                          <textarea 
                            value={customerNote}
                            onChange={e => setCustomerNote(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-light-neutral focus:border-primary-dark-teal outline-none text-sm min-h-[60px] resize-none"
                            placeholder="Any special requests?"
                            maxLength={500}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2 flex flex-col gap-3">
                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="lg" 
                          className="w-full flex items-center justify-center gap-2"
                          disabled={createOrderMutation.isPending || !isWhatsAppConfigured}
                        >
                          {createOrderMutation.isPending ? (
                            <><Loader2 size={18} className="animate-spin" /> Processing...</>
                          ) : (
                            <><MessageCircle size={18} /> Request Order via WhatsApp</>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="lg" 
                          className="w-full bg-transparent"
                          onClick={() => setCheckoutStep('cart')}
                          disabled={createOrderMutation.isPending}
                        >
                          Back to Cart
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 animate-fade-in">
                      {isWhatsAppConfigured ? (
                        <Button 
                          variant="primary" 
                          size="lg" 
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => setCheckoutStep('checkout')}
                        >
                          Proceed to Checkout
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="primary" 
                            size="lg" 
                            className="w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" 
                            disabled
                          >
                            Proceed to Checkout
                          </Button>
                          <span className="text-xs text-primary-dark/50 text-center">
                            WhatsApp ordering is currently unavailable.
                          </span>
                        </div>
                      )}
                      <Link to="/shop" className="w-full">
                        <Button variant="outline" size="lg" className="w-full bg-transparent">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
