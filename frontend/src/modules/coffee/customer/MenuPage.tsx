
'use client';

import { useState } from 'react';
import { Button, Input, Badge, Drawer, message, Checkbox, Radio, Space } from 'antd';
import {
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  HomeOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  PlusOutlined,
  MinusOutlined,
  CloseOutlined,
  CoffeeOutlined,
  RestOutlined,
  FireOutlined
} from '@ant-design/icons';
import axios from 'axios';

// Custom Juice SVG Icon matching Ant Design style
const JuiceIcon = () => (
  <span className="anticon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5h12l-1.2 15c-.1.9-.9 1.5-1.8 1.5H9c-.9 0-1.7-.6-1.8-1.5L6 5Z" />
      <path d="M14 5l1.5-4" />
      <line x1="6.5" y1="10" x2="17.5" y2="10" />
      <line x1="7" y1="15" x2="17" y2="15" />
    </svg>
  </span>
);

// Mock Data
const MOCK_CATEGORIES = [
  { id: 1, name: 'Cà Phê', icon: <CoffeeOutlined /> },
  { id: 2, name: 'Trà & Trà Sữa', icon: <RestOutlined /> },
  { id: 3, name: 'Nước Ép', icon: <JuiceIcon /> },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Cà Phê Đen', price: 25000, img: '/images/products/ca-phe-den.png', categoryId: 1, desc: 'Cà phê đen nguyên chất đậm vị truyền thống.' },
  { id: 2, name: 'Cà Phê Sữa', price: 29000, img: '/images/products/ca-phe-sua.png', categoryId: 1, desc: 'Sự hòa quyện giữa cà phê đậm đà và sữa đặc béo ngậy.' },
  { id: 3, name: 'Bạc Xỉu', price: 32000, img: '/images/products/bac-xiu.png', categoryId: 1, desc: 'Nhiều sữa, ít cà phê, phù hợp cho người thích ngọt nhẹ.' },
  { id: 4, name: 'Trà Sữa Truyền Thống', price: 35000, img: '/images/products/tra-sua-truyen-thong.png', categoryId: 2, desc: 'Trà sữa đậm vị trà, kết hợp trân châu đen dai ngon.' },
  { id: 5, name: 'Trà Sữa Khoai Môn', price: 39000, img: '/images/products/tra-sua-khoai-mon.png', categoryId: 2, desc: 'Vị khoai môn béo ngậy thơm lừng.' },
  { id: 6, name: 'Trà Sữa Matcha', price: 39000, img: '/images/products/tra-sua-matcha.png', categoryId: 2, desc: 'Trà xanh matcha thanh mát kết hợp vị sữa béo.' },
  { id: 7, name: 'Matcha Latte', price: 45000, img: '/images/products/matcha-latte.png', categoryId: 2, desc: 'Matcha nguyên chất chuẩn Nhật và sữa tươi.' },
  { id: 8, name: 'Trà Tắc', price: 20000, img: '/images/products/tra-tat.png', categoryId: 2, desc: 'Chua chua ngọt ngọt thanh mát giải nhiệt.' },
  { id: 9, name: 'Trà Đường', price: 15000, img: '/images/products/tra-duong.png', categoryId: 2, desc: 'Trà nguyên bản thêm chút đường nhẹ nhàng.' },
  { id: 10, name: 'Cam Ép', price: 35000, img: '/images/products/cam-ep.png', categoryId: 3, desc: 'Nước cam ép tươi nguyên chất 100%.' },
];

const MOCK_TOPPINGS = [
  { id: 1, name: 'Trân châu trắng', price: 5000 },
  { id: 2, name: 'Kem Macchiato', price: 10000 },
  { id: 3, name: 'Pudding trứng', price: 8000 },
];

export default function MenuPage({ tableId }: { tableId: string }) {
  const [view, setView] = useState<'menu' | 'cart' | 'favorite'>('menu');
  const [activeCategory, setActiveCategory] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favSearchQuery, setFavSearchQuery] = useState('');

  // Offcanvas (Drawer) States
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Size M');
  const [selectedSugar, setSelectedSugar] = useState('100% Đường');
  const [selectedIce, setSelectedIce] = useState('Đá bình thường');
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState('');

  const updateCartQty = (index: number, delta: number) => {
    const newCart = [...cart];
    if (newCart[index].qty + delta > 0) {
      newCart[index].qty += delta;
      setCart(newCart);
    } else {
      setCart(newCart.filter((_, i) => i !== index));
    }
  };

  // --- Handlers ---
  const toggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const openOffcanvas = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedSize('Size M');
    setSelectedSugar('100% Đường');
    setSelectedIce('Đá bình thường');
    setSelectedToppings([]);
    setIsOffcanvasOpen(true);
  };

  const toggleTopping = (id: number) => {
    if (selectedToppings.includes(id)) {
      setSelectedToppings(selectedToppings.filter(tId => tId !== id));
    } else {
      setSelectedToppings([...selectedToppings, id]);
    }
  };

  const addToCart = () => {
    const toppingTotal = selectedToppings.reduce((acc, tId) => {
      const top = MOCK_TOPPINGS.find(t => t.id === tId);
      return acc + (top ? top.price : 0);
    }, 0);

    const sizeAdd = selectedSize === 'Size L' ? 6000 : selectedSize === 'Size XL' ? 10000 : 0;
    const finalPrice = selectedProduct.price + sizeAdd + toppingTotal;

    setCart([
      ...cart,
      {
        ...selectedProduct,
        qty: quantity,
        size: selectedSize,
        sugar: selectedSugar,
        ice: selectedIce,
        toppings: selectedToppings,
        finalPrice
      }
    ]);
    message.success(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ!`);
    setIsOffcanvasOpen(false);
  };

  const placeOrder = async () => {
    try {
      await axios.post('http://localhost:3001/api/tenant/coffee/order', {
        tableId: Number(tableId),
        items: cart.map(c => ({
          productId: c.id,
          quantity: c.qty,
          toppingIds: c.toppings,
          note: `Size: ${c.size}, ${c.sugar}, ${c.ice}`
        })),
      }, {
        headers: { 'x-tenant-id': 'coffee' }
      });
      message.success('Đặt món thành công! Barista đang chuẩn bị.');
      setCart([]);
      setView('menu');
    } catch (error) {
      message.error('Có lỗi khi đặt món.');
    }
  };

  const currentTotalPrice = selectedProduct ? (() => {
    const toppingTotal = selectedToppings.reduce((acc, tId) => {
      const top = MOCK_TOPPINGS.find(t => t.id === tId);
      return acc + (top ? top.price : 0);
    }, 0);
    const sizeAdd = selectedSize === 'Size L' ? 6000 : selectedSize === 'Size XL' ? 10000 : 0;
    return (selectedProduct.price + sizeAdd + toppingTotal) * quantity;
  })() : 0;

  // --- Views ---

  if (view === 'favorite') {
    const favoriteProducts = MOCK_PRODUCTS.filter(p => favorites.includes(p.id) && p.name.toLowerCase().includes(favSearchQuery.toLowerCase()));

    return (
      <div className="max-w-md mx-auto bg-[#E3C9AD] min-h-screen relative font-sans pb-24">
        <div className="p-6 pt-10">
          <h2 className="text-2xl font-bold text-[#220C02] mb-4">Món yêu thích</h2>

          <div className="mb-6">
            <Input
              prefix={<SearchOutlined className="text-[#8B5742]" />}
              placeholder="Tìm trong mục yêu thích..."
              value={favSearchQuery}
              onChange={(e) => setFavSearchQuery(e.target.value)}
              className="rounded-full bg-[#E3D8D3] border-none py-2 placeholder-[#8B5742] text-[#220C02]"
            />
          </div>

          {favoriteProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-[#8B5742]">
              <HeartOutlined className="text-6xl mb-4 opacity-50" />
              <p className="text-center">{favSearchQuery ? 'Không tìm thấy món nào phù hợp.' : 'Bạn chưa có món yêu thích nào.'}</p>
              {!favSearchQuery && <button className="mt-6 px-8 py-3 bg-[#220C02] text-[#E3C9AD] rounded-full font-bold shadow-md" onClick={() => setView('menu')}>Khám phá Menu</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {favoriteProducts.map(p => (
                <div key={p.id} className="bg-[#E3D8D3] rounded-2xl p-3 shadow-sm flex flex-col relative cursor-pointer" onClick={() => openOffcanvas(p)}>
                  <div className="h-36 w-full mb-3 bg-white/40 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={p.img} alt={p.name} className="h-full w-full object-cover mix-blend-multiply" />
                  </div>

                  <button
                    type="button"
                    className="absolute top-2 right-2 z-20 w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform drop-shadow-md bg-transparent border-none outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(e, p.id);
                    }}
                  >
                    {favorites.includes(p.id) ? (
                      <HeartFilled style={{ color: '#ef4444', fontSize: '24px' }} />
                    ) : (
                      <HeartFilled style={{ color: '#ffffff', fontSize: '24px', opacity: 0.9 }} />
                    )}
                  </button>

                  <h3 className="font-bold text-[#220C02] leading-tight mb-1">{p.name}</h3>

                  <div className="mt-auto flex justify-between items-center pt-2">
                    <span className="font-bold text-[#220C02]">{p.price.toLocaleString()}đ</span>
                    <button
                      className="bg-[#220C02] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10"
                      onClick={(e) => { e.stopPropagation(); openOffcanvas(p); }}
                    >
                      <PlusOutlined />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-[#E3C9AD] border-t border-[#6A5750]/30 px-6 py-4 flex justify-between items-center rounded-t-3xl z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-[#8B5742]" onClick={() => setView('menu')}>
            <HomeOutlined className="text-2xl mb-1 cursor-pointer" />
            <span className="text-xs">Trang chủ</span>
          </div>
          <div className="flex flex-col items-center text-[#8B5742]" onClick={() => setView('menu')}>
            <BookOutlined className="text-2xl mb-1 cursor-pointer" />
            <span className="text-xs">Menu</span>
          </div>
          <div className="flex flex-col items-center text-[#220C02] font-bold" onClick={() => setView('favorite')}>
            <HeartFilled className="text-2xl mb-1 cursor-pointer" />
            <span className="text-xs">Yêu thích</span>
          </div>
          <div className="flex flex-col items-center text-[#8B5742] cursor-pointer relative" onClick={() => setView('cart')}>
            <Badge count={cart.length} size="small" color="#220C02" offset={[5, 0]}>
              <ShoppingCartOutlined className="text-2xl mb-1 text-[#8B5742]" />
            </Badge>
            <span className="text-xs">Giỏ hàng</span>
          </div>
          <div className="flex flex-col items-center text-[#8B5742]">
            <UserOutlined className="text-2xl mb-1" />
            <span className="text-xs">Hồ sơ</span>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'cart') {
    const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.qty), 0);
    const discount = promoCode === 'BIZSAAS10' ? Math.round(cartTotal * 0.1) : 0;
    const finalTotal = cartTotal - discount;

    return (
      <div className="max-w-md mx-auto bg-[#E3C9AD] min-h-screen relative font-sans pb-24">
        <div className="p-6 pt-10">
          <h2 className="text-2xl font-bold text-[#220C02] mb-6">Giỏ hàng của bạn</h2>

          <div className="space-y-4 mb-8">
            {cart.map((c, i) => {
              const toppingsStr = c.toppings.map((tId: number) => MOCK_TOPPINGS.find(t => t.id === tId)?.name).filter(Boolean).join(', ');
              const desc = [c.size, c.sugar, c.ice, toppingsStr].filter(Boolean).join(', ');
              return (
                <div key={i} className="bg-[#E3D8D3] rounded-2xl p-3 flex items-center border border-[#6A5750]/30 shadow-sm">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 mr-4">
                    <img src={c.img} alt={c.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-[#220C02]">{c.name}</div>
                    <div className="text-xs text-[#8B5742] leading-tight mb-1">{desc}</div>
                    <div className="font-bold text-[#220C02]">{c.finalPrice.toLocaleString()}đ</div>
                  </div>
                  <div className="flex items-center border border-[#6A5750] rounded-md bg-transparent px-2 py-1 ml-2">
                    <button className="px-1 text-[#220C02] font-bold" onClick={() => updateCartQty(i, -1)}>-</button>
                    <span className="px-2 font-semibold text-[#220C02]">{c.qty}</span>
                    <button className="px-1 text-[#220C02] font-bold" onClick={() => updateCartQty(i, 1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-[#220C02]">Promo code</h3>
            <div className="flex gap-2 w-1/2">
              <Input
                placeholder="Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-transparent border-[#8B5742] rounded-lg"
              />
              <button className="bg-[#6A5750] text-white px-4 py-1 rounded-lg text-sm font-semibold whitespace-nowrap shadow-sm hover:bg-[#392A25] transition" onClick={() => { if (promoCode) message.success('Applied promo code!') }}>
                Apply
              </button>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#6A5750]/30 pt-6">
            <div className="flex justify-between text-lg font-semibold text-[#392A25]">
              <span>Tạm tính</span>
              <span>{cartTotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-[#392A25]">
              <span>Giảm giá</span>
              <span>{discount > 0 ? '10%' : '0%'}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-[#220C02] mt-2">
              <span>Tổng cộng</span>
              <span>{finalTotal.toLocaleString()}đ</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            className="w-full bg-[#220C02] text-white py-4 rounded-2xl font-bold text-xl shadow-lg mt-8"
          >
            Thanh Toán
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-[#E3C9AD] border-t border-[#6A5750] px-6 py-4 flex justify-between items-center rounded-t-3xl z-40">
          <div className="flex flex-col items-center text-[#8B5742]" onClick={() => setView('menu')}>
            <HomeOutlined className="text-2xl mb-1 cursor-pointer" />
            <span className="text-xs">Trang chủ</span>
          </div>
          <div className="flex flex-col items-center text-[#8B5742]" onClick={() => setView('menu')}>
            <BookOutlined className="text-2xl mb-1 cursor-pointer" />
            <span className="text-xs">Menu</span>
          </div>
          <div className="flex flex-col items-center text-[#8B5742]" onClick={() => setView('favorite')}>
            <HeartOutlined className="text-2xl mb-1 cursor-pointer" />
            <span className="text-xs">Yêu thích</span>
          </div>
          <div className="flex flex-col items-center text-[#220C02] font-bold cursor-pointer relative" onClick={() => setView('cart')}>
            <Badge count={cart.length} size="small" color="#220C02" offset={[5, 0]}>
              <ShoppingCartOutlined className="text-2xl mb-1 text-[#220C02]" />
            </Badge>
            <span className="text-xs">Giỏ hàng</span>
          </div>
          <div className="flex flex-col items-center text-[#8B5742]">
            <UserOutlined className="text-2xl mb-1" />
            <span className="text-xs">Hồ sơ</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Menu View ---
  return (
    <div className="max-w-md mx-auto bg-transparent min-h-screen pb-24 font-sans relative">
      <div className="px-6">

        {/* Search */}
        <div className="mb-8">
          <Input
            prefix={<SearchOutlined className="text-[#8B5742]" />}
            placeholder="Tìm món tại BizSaaS Coffee..."
            className="rounded-full bg-[#E3D8D3] border-none py-2 placeholder-[#8B5742] text-[#220C02]"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-1">
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all duration-300 shadow-sm ${activeCategory === cat.id
                  ? 'bg-[#220C02] text-[#E3C9AD] shadow-md scale-105'
                  : 'bg-[#E3D8D3] text-[#8B5742] hover:bg-[#D5C6BD]'
                  }`}
              >
                <span className="text-lg flex items-center">{cat.icon}</span>
                <span className="text-sm tracking-wide">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {MOCK_PRODUCTS.filter(p => p.categoryId === activeCategory).map(p => (
            <div key={p.id} className="bg-[#E3D8D3] rounded-2xl p-3 shadow-sm flex flex-col relative cursor-pointer" onClick={() => openOffcanvas(p)}>
              {/* Image container */}
              <div className="h-36 w-full mb-3 bg-white/40 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={p.img} alt={p.name} className="h-full w-full object-cover mix-blend-multiply" />
              </div>

              <button
                type="button"
                className="absolute top-2 right-2 z-20 w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform drop-shadow-md bg-transparent border-none outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(e, p.id);
                }}
              >
                {favorites.includes(p.id) ? (
                  <HeartFilled style={{ color: '#ef4444', fontSize: '24px' }} />
                ) : (
                  <HeartFilled style={{ color: '#ffffff', fontSize: '24px', opacity: 0.9 }} />
                )}
              </button>

              <h3 className="font-bold text-[#220C02] leading-tight mb-1">{p.name}</h3>

              <div className="mt-auto flex justify-between items-center pt-2">
                <span className="font-bold text-[#220C02]">{p.price.toLocaleString()}đ</span>
                <button
                  className="bg-[#220C02] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); openOffcanvas(p); }}
                >
                  <PlusOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-[#E3C9AD] border-t border-[#6A5750]/30 px-6 py-4 flex justify-between items-center rounded-t-3xl z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center text-[#220C02] font-bold">
          <HomeOutlined className="text-2xl mb-1" />
          <span className="text-xs">Trang chủ</span>
        </div>
        <div className="flex flex-col items-center text-[#8B5742]">
          <BookOutlined className="text-2xl mb-1" />
          <span className="text-xs">Menu</span>
        </div>
        <div className="flex flex-col items-center text-[#8B5742]" onClick={() => setView('favorite')}>
          <HeartOutlined className="text-2xl mb-1 cursor-pointer" />
          <span className="text-xs">Yêu thích</span>
        </div>
        <div className="flex flex-col items-center text-[#8B5742] cursor-pointer relative" onClick={() => setView('cart')}>
          <Badge count={cart.length} size="small" color="#220C02" offset={[5, 0]}>
            <ShoppingCartOutlined className="text-2xl mb-1 text-[#8B5742]" />
          </Badge>
          <span className="text-xs">Giỏ hàng</span>
        </div>
        <div className="flex flex-col items-center text-[#8B5742]">
          <UserOutlined className="text-2xl mb-1" />
          <span className="text-xs">Hồ sơ</span>
        </div>
      </div>

      {/* Offcanvas Topping Selection (ShopeeFood Style) */}
      <Drawer
        placement="bottom"
        closable={false}
        onClose={() => setIsOffcanvasOpen(false)}
        open={isOffcanvasOpen}
        styles={{ 
          wrapper: { height: '85%' }, 
          body: { padding: 0, background: '#E3C9AD' } 
        }}
        className="rounded-t-3xl overflow-hidden"
      >
        {selectedProduct && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#6A5750]/20 bg-[#E3C9AD] sticky top-0 z-10">
              <div className="w-8"></div>
              <h3 className="font-bold text-lg text-[#220C02]">Thêm món mới</h3>
              <CloseOutlined className="text-xl text-[#6A5750] cursor-pointer" onClick={() => setIsOffcanvasOpen(false)} />
            </div>

            <div className="overflow-y-auto pb-28 flex-grow">
              {/* Product Info */}
              <div className="flex gap-4 p-4 bg-[#E3D8D3]">
                <div className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0">
                  <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-[#220C02] leading-tight mb-1">{selectedProduct.name}</h2>
                  <p className="text-xs text-[#6A5750] line-clamp-2 mb-2">{selectedProduct.desc}</p>

                  <div className="flex justify-between items-end mt-auto">
                    <span className="text-[#220C02] font-bold text-lg">{selectedProduct.price.toLocaleString()}đ</span>
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#6A5750] rounded-md bg-transparent">
                      <button className="px-2 py-1 text-[#220C02] font-bold text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                      <span className="px-3 font-semibold text-[#220C02]">{quantity}</span>
                      <button className="px-2 py-1 text-[#220C02] font-bold text-lg bg-[#6A5750]/20" onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mt-2 bg-[#E3D8D3]">
                <div className="px-4 py-3 bg-[#6A5750]/10 text-[#392A25] font-semibold text-sm">Chọn Size (Bắt buộc)</div>
                <div className="w-full flex flex-col">
                  {[
                    { label: 'Size M', price: 0 },
                    { label: 'Size L', price: 6000 },
                    { label: 'Size XL', price: 10000 }
                  ].map(size => (
                    <div key={size.label} className="flex justify-between items-center p-4 border-b border-[#6A5750]/10 last:border-b-0 cursor-pointer" onClick={() => setSelectedSize(size.label)}>
                      <div>
                        <div className="font-semibold text-[#220C02]">{size.label}</div>
                        <div className="text-xs text-[#8B5742]">{size.price > 0 ? `+${size.price.toLocaleString()}đ` : '0đ'}</div>
                      </div>
                      <Radio checked={selectedSize === size.label} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sugar Selection */}
              <div className="mt-2 bg-[#E3D8D3]">
                <div className="px-4 py-3 bg-[#6A5750]/10 text-[#392A25] font-semibold text-sm">Chọn mức đường (Chọn 1)</div>
                <div className="w-full flex flex-col">
                  {['100% Đường', '50% Đường', '30% Đường', 'Không Đường'].map(opt => (
                    <div key={opt} className="flex justify-between items-center p-4 border-b border-[#6A5750]/10 last:border-b-0 cursor-pointer" onClick={() => setSelectedSugar(opt)}>
                      <div className="font-semibold text-[#220C02]">{opt}</div>
                      <Radio checked={selectedSugar === opt} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ice Selection */}
              <div className="mt-2 bg-[#E3D8D3]">
                <div className="px-4 py-3 bg-[#6A5750]/10 text-[#392A25] font-semibold text-sm">Chọn mức đá (Chọn 1)</div>
                <div className="w-full flex flex-col">
                  {['Đá bình thường', 'Ít đá', 'Không đá', 'Đá riêng'].map(opt => (
                    <div key={opt} className="flex justify-between items-center p-4 border-b border-[#6A5750]/10 last:border-b-0 cursor-pointer" onClick={() => setSelectedIce(opt)}>
                      <div className="font-semibold text-[#220C02]">{opt}</div>
                      <Radio checked={selectedIce === opt} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toppings Selection */}
              <div className="mt-2 bg-[#E3D8D3] mb-4">
                <div className="px-4 py-3 bg-[#6A5750]/10 text-[#392A25] font-semibold text-sm">Topping (Tùy chọn)</div>
                <div className="flex flex-col">
                  {MOCK_TOPPINGS.map(top => (
                    <div key={top.id} className="flex justify-between items-center p-4 border-b border-[#6A5750]/10 last:border-b-0 cursor-pointer" onClick={() => toggleTopping(top.id)}>
                      <div>
                        <div className="font-semibold text-[#220C02]">{top.name}</div>
                        <div className="text-xs text-[#8B5742]">+${top.price.toLocaleString()}đ</div>
                      </div>
                      <Checkbox checked={selectedToppings.includes(top.id)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Button */}
            <div className="fixed bottom-0 left-0 w-full bg-[#E3C9AD] p-4 border-t border-[#6A5750]/30 z-50">
              <button
                onClick={addToCart}
                className="w-full bg-[#220C02] text-white py-3 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2"
              >
                Thêm vào giỏ hàng - {currentTotalPrice.toLocaleString()}đ
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Customize Antd Radio & Checkbox to match theme */
        .ant-radio-checked .ant-radio-inner {
          border-color: #220C02 !important;
          background-color: #220C02 !important;
        }
        .ant-checkbox-checked .ant-checkbox-inner {
          border-color: #220C02 !important;
          background-color: #220C02 !important;
        }
      `}</style>
    </div>
  );
}
