import { X, Minus, Plus, Trash2, MessageCircle, AlertCircle } from 'lucide-react';
import { useStore, getProductPrice } from '../context/StoreContext';
import { useState } from 'react';
import { SmartImage } from './ui/SmartImage';

export function CartDrawer() {
  const {
    cartOpen, setCartOpen, cart, products,
    updateQuantity, removeFromCart, cartTotal, cartCount,
    generateWhatsAppLink, clearCart, getAvailableStock,
    appliedCoupon, applyCoupon, removeCoupon, cartDiscount, cartFinalTotal,
  } = useStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res && res.success) {
      setCouponInput('');
      setCouponError('');
    } else {
      setCouponError(res?.message || 'Error al aplicar cupón');
      setTimeout(() => setCouponError(''), 4000);
    }
  };

  const handleWhatsApp = () => {
    if (cart.length === 0) return;
    window.open(generateWhatsAppLink(), '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(2px)' }}
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(430px, 100vw)',
          backgroundColor: '#F5F0E8',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
          className="flex items-start justify-between px-7 py-6"
        >
          <div>
            <p style={{ color: '#888', fontSize: '0.62rem', letterSpacing: '0.22em' }} className="uppercase mb-1">
              Tu carrito
            </p>
            <p
              style={{
                fontFamily: '"Cormorant Garamond","Georgia",serif',
                fontSize: '2rem',
                color: '#1a1a1a',
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              {cartCount} {cartCount === 1 ? 'pieza' : 'piezas'}
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{ color: '#888', marginTop: '4px' }}
            className="hover:opacity-60 transition-opacity"
          >
            <X size={19} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(192,57,43,0.1)',
                border: '1px solid rgba(192,57,43,0.3)',
                padding: '10px 12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={14} style={{ color: '#c0392b', flexShrink: 0 }} />
              <p style={{ color: '#c0392b', fontSize: '0.75rem' }}>{errorMsg}</p>
            </div>
          )}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div style={{ color: '#6B8F71', fontSize: '3rem', marginBottom: '18px', lineHeight: 1 }}>✦</div>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond","Georgia",serif',
                  fontSize: '1.5rem',
                  color: '#1a1a1a',
                  fontWeight: 300,
                }}
                  className="mb-2"
              >
                Tu carrito está vacío
              </p>
              <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Descubrí nuestras piezas hechas a mano.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                const key = `${item.productId}-${item.variant ?? 'default'}`;
                const showVariant = item.variant && item.variant !== 'Única';
                const unitPrice = getProductPrice(product, item.variant);
                return (
                  <div
                    key={key}
                    className="flex gap-4 py-5"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
                  >
                    <div
                      className="flex-shrink-0 overflow-hidden"
                      style={{ width: '76px', height: '76px', borderRadius: '1px' }}
                    >
                      <SmartImage src={product.image} alt={product.name} objectFit="cover" className="w-full h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p style={{ color: '#1a1a1a', fontSize: '0.85rem' }} className="mb-0.5 truncate">
                        {product.name}
                      </p>
                      {showVariant && (
                        <p style={{ color: '#888', fontSize: '0.72rem', letterSpacing: '0.06em' }} className="mb-2">
                          {item.variant}
                        </p>
                      )}
                      <p style={{ color: '#6B8F71', fontSize: '0.82rem' }} className="mb-3">
                        ${unitPrice.toLocaleString('es-AR')}
                      </p>

                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center"
                          style={{ border: '1px solid rgba(0,0,0,0.12)' }}
                        >
                          <button
                            onClick={() => {
                              setErrorMsg('');
                              updateQuantity(product.id, item.quantity - 1, item.variant);
                            }}
                            style={{ padding: '5px 9px', color: '#1a1a1a', border: 'none', background: 'none', cursor: 'pointer' }}
                            className="hover:bg-black/5 transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span style={{ padding: '5px 12px', fontSize: '0.82rem', color: '#1a1a1a', minWidth: '36px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              setErrorMsg('');
                              const result = updateQuantity(product.id, item.quantity + 1, item.variant);
                              if (!result.success) {
                                setErrorMsg(result.message || 'Error al actualizar cantidad');
                                setTimeout(() => setErrorMsg(''), 3000);
                              }
                            }}
                            style={{ padding: '5px 9px', color: '#1a1a1a', border: 'none', background: 'none', cursor: 'pointer' }}
                            className="hover:bg-black/5 transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product.id, item.variant)}
                          style={{ color: '#ccc', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                          className="hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p style={{ color: '#1a1a1a', fontSize: '0.85rem', flexShrink: 0 }}>
                      ${(unitPrice * item.quantity).toLocaleString('es-AR')}
                    </p>
                  </div>
                );
              })}

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  style={{ color: '#ccc', fontSize: '0.68rem', letterSpacing: '0.1em', marginTop: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  className="uppercase hover:text-red-400 transition-colors"
                >
                  Vaciar carrito
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }} className="px-7 pt-5 pb-7">
          
          {/* Coupon Section */}
          {cart.length > 0 && (
            <div className="mb-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '16px' }}>
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Código de cupón"
                    style={{
                      flex: 1,
                      border: '1px solid rgba(0,0,0,0.12)',
                      padding: '8px 12px',
                      fontSize: '0.72rem',
                      background: 'transparent',
                      color: '#1a1a1a',
                      outline: 'none',
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#1a1a1a',
                      color: '#F5F0E8',
                      fontSize: '0.62rem',
                      letterSpacing: '0.15em',
                      padding: '8px 16px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    className="uppercase hover:bg-black/80 transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between" style={{ backgroundColor: 'rgba(107,143,113,0.08)', border: '1px solid rgba(107,143,113,0.15)', padding: '8px 12px' }}>
                  <div>
                    <span style={{ fontSize: '0.58rem', color: '#6B8F71', letterSpacing: '0.12em' }} className="uppercase font-medium">Cupón Activo</span>
                    <p style={{ fontSize: '0.78rem', color: '#1a1a1a', fontWeight: 500 }} className="uppercase mb-0">
                      {appliedCoupon.code} {appliedCoupon.type === 'percentage' ? `(-${appliedCoupon.value}%)` : `(-$${appliedCoupon.value})`}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ color: '#888', background: 'none', border: 'none', fontSize: '0.62rem', letterSpacing: '0.12em', cursor: 'pointer' }}
                    className="uppercase hover:text-red-500 transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              )}
              {couponError && (
                <p style={{ color: '#c0392b', fontSize: '0.72rem', marginTop: '6px', marginBottom: 0 }}>{couponError}</p>
              )}
            </div>
          )}

          {/* Pricing Details */}
          <div className="flex flex-col gap-2.5 mb-5">
            <div className="flex justify-between items-center">
              <p style={{ color: '#888', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase">
                Subtotal
              </p>
              <p style={{ fontSize: '0.92rem', color: '#1a1a1a' }}>
                ${cartTotal.toLocaleString('es-AR')}
              </p>
            </div>

            {appliedCoupon && cartDiscount > 0 && (
              <div className="flex justify-between items-center">
                <p style={{ color: '#6B8F71', fontSize: '0.65rem', letterSpacing: '0.2em' }} className="uppercase">
                  Descuento ({appliedCoupon.code})
                </p>
                <p style={{ fontSize: '0.92rem', color: '#6B8F71' }}>
                  -${cartDiscount.toLocaleString('es-AR')}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center mt-2 pt-2.5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ color: '#1a1a1a', fontSize: '0.72rem', letterSpacing: '0.2em', fontWeight: 500 }} className="uppercase">
                Total Final
              </p>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond","Georgia",serif',
                  fontSize: '1.45rem',
                  color: '#1a1a1a',
                  fontWeight: 400,
                }}
              >
                ${cartFinalTotal.toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          <button
            onClick={handleWhatsApp}
            disabled={cart.length === 0}
            style={{
              width: '100%',
              backgroundColor: cart.length === 0 ? '#d0d0d0' : '#6B8F71',
              color: 'white',
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              padding: '16px',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'opacity 0.2s',
            }}
            className="uppercase flex items-center justify-center gap-3 hover:opacity-90"
          >
            <MessageCircle size={15} />
            Finalizar por WhatsApp
          </button>

          <div className="mt-4 text-center">
            <p style={{ color: '#aaa', fontSize: '0.7rem' }}>
              El pago se coordina por WhatsApp · Sin pagos en línea
            </p>
            <p style={{ color: '#aaa', fontSize: '0.7rem', marginTop: '3px' }}>
              Córdoba Capital · Envíos Uber Envíos
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
