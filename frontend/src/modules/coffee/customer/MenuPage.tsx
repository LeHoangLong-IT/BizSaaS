'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Drawer, message, Checkbox, Radio, Space } from 'antd';
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
  FireOutlined,
  QrcodeOutlined,
  ArrowRightOutlined,
  LeftOutlined,
  DownOutlined,
  StarOutlined,
  TagOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { io } from 'socket.io-client';
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






export default function MenuPage({ tableId }: { tableId: string }) {
  const [view, setView] = useState<'menu' | 'cart' | 'favorite' | 'profile' | 'tracking'>('menu');
  const [activeCategory, setActiveCategory] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favSearchQuery, setFavSearchQuery] = useState('');
  
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingOrderData, setTrackingOrderData] = useState<any>(null);
  const [orderStatusTrigger, setOrderStatusTrigger] = useState(0);

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tableName, setTableName] = useState<string>('');

  // Checkout states
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState('BANK');
  const [vietQRUrl, setVietQRUrl] = useState('');
  const [qrConfigs, setQrConfigs] = useState<any[]>([]);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  const banks = [
    { value: '970436', label: 'Vietcombank (VCB)' },
    { value: '970422', label: 'MBBank (MB)' },
    { value: '970415', label: 'VietinBank (CTG)' },
    { value: '970418', label: 'BIDV' },
    { value: '970405', label: 'Agribank' },
    { value: '970407', label: 'Techcombank (TCB)' },
    { value: '970416', label: 'ACB' },
    { value: '970432', label: 'VPBank' },
    { value: '970423', label: 'TPBank' },
  ];

  useEffect(() => {
    const fetchMenu = () => {
      axios.get('http://localhost:3001/api/tenant/coffee/menu', { headers: { 'x-tenant-id': 'coffee' } })
        .then(res => {
          setCategories(res.data.categories || []);
          setProducts(res.data.products || []);
          setToppings(res.data.toppings || []);
          if (res.data.categories?.length > 0) setActiveCategory(prev => prev || res.data.categories[0].id);
          setIsLoading(false);
        })
        .catch(() => {
          message.error('Lỗi tải dữ liệu');
          setIsLoading(false);
        });
        
      if (tableId) {
        axios.get('http://localhost:3001/api/tenant/coffee/tables', { headers: { 'x-tenant-id': 'coffee' } })
          .then(res => {
            const table = res.data.find((t: any) => t.id.toString() === tableId.toString());
            if (table) setTableName(table.name);
          })
          .catch(console.error);
      }
      
      axios.get('http://localhost:3001/api/tenant/coffee/vietqr', { headers: { 'x-tenant-id': 'coffee' } })
        .then(res => setQrConfigs(res.data))
        .catch(console.error);
    };

    fetchMenu();

    const socket = io('http://localhost:3001');
    socket.on('menuUpdated', () => {
      fetchMenu();
    });
    
    socket.on('orderStatusChanged', ({ orderId, status }) => {
      // Nếu có orderId trùng khớp, gọi lại hàm fetch order
      // Do không thể truy cập trực tiếp state trackingOrderId trong callback này (stale closure),
      // nên sẽ xử lý bên trong một useEffect khác hoặc dispatch event tùy chọn.
      // Cách đơn giản nhất là set một state trigger.
      setOrderStatusTrigger(Date.now());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Khôi phục trạng thái tracking nếu khách hàng F5 trang
    const savedOrderId = localStorage.getItem('bizsaas_tracking_order');
    if (savedOrderId) {
      setTrackingOrderId(Number(savedOrderId));
      setView('tracking');
    }
  }, []);

  useEffect(() => {
    if (trackingOrderId) {
      axios.get(`http://localhost:3001/api/tenant/coffee/orders/${trackingOrderId}`, { headers: { 'x-tenant-id': 'coffee' } })
        .then(res => setTrackingOrderData(res.data))
        .catch(console.error);
    }
  }, [trackingOrderId, orderStatusTrigger]);

  // Offcanvas (Drawer) States
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Size M');
  const [selectedSugar, setSelectedSugar] = useState('100% Đường');
  const [selectedIce, setSelectedIce] = useState('Đá bình thường');
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [customerNote, setCustomerNote] = useState('');

  // Cart
  const [cart, setCart] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.qty), 0);
  const discount = promoCode === 'BIZSAAS10' ? Math.round(cartTotal * 0.1) : 0;
  const finalTotal = cartTotal - discount;


  // Profile States
  const [customer, setCustomer] = useState<any>(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginStep, setLoginStep] = useState(0);

  const handleLogin = async () => {
    if (!loginPhone) return message.warning('Vui lòng nhập số điện thoại');

    if (loginStep === 1) {
      try {
        const res = await axios.post('http://localhost:3001/api/tenant/coffee/login', { phone: loginPhone }, { headers: { 'x-tenant-id': 'coffee' } });
        if (res.data.isNew) {
          setLoginStep(2);
        } else {
          setCustomer(res.data.customer);
          message.success('Đăng nhập thành công');
        }
      } catch {
        message.error('Lỗi kết nối');
      }
    } else if (loginStep === 2) {
      if (!loginName) return message.warning('Vui lòng nhập tên của bạn');
      try {
        const res = await axios.post('http://localhost:3001/api/tenant/coffee/login', { phone: loginPhone, name: loginName }, { headers: { 'x-tenant-id': 'coffee' } });
        setCustomer(res.data.customer);
        message.success('Đăng ký thành công');
      } catch {
        message.error('Lỗi đăng ký');
      }
    }
  };

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
    setCustomerNote('');
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
      const top = toppings.find(t => t.id === tId);
      return acc + (top ? Number(top.price) : 0);
    }, 0);

    const sizeAdd = selectedSize === 'Size L' ? 6000 : selectedSize === 'Size XL' ? 10000 : 0;
    const finalPrice = Number(selectedProduct.price) + sizeAdd + toppingTotal;

    setCart([
      ...cart,
      {
        ...selectedProduct,
        qty: quantity,
        size: selectedSize,
        sugar: selectedSugar,
        ice: selectedIce,
        toppings: selectedToppings,
        customerNote,
        finalPrice
      }
    ]);
    message.success(`Đã thêm ${quantity} ${selectedProduct.name} vào giỏ!`);
    setIsOffcanvasOpen(false);
  };

  const handleCheckoutClick = async () => {
    try {
      const res = await axios.post('http://localhost:3001/api/tenant/coffee/order', {
        tableId: Number(tableId),
        paymentMethod: 'BANK',
        items: cart.map(c => ({
          image_url: c.image_url,
          productId: c.id,
          quantity: c.qty,
          toppingIds: c.toppings,
          finalPrice: c.finalPrice,
          note: `Size: ${c.size}, ${c.sugar}, ${c.ice}${c.customerNote ? ' | ' + c.customerNote : ''}`
        })),
      }, {
        headers: { 'x-tenant-id': 'coffee' }
      });
      
      const newOrderId = res.data.orderId;
      setCreatedOrderId(newOrderId);
      setIsCheckoutDrawerOpen(true);
      setCheckoutMethod('BANK');
      setIsPaymentPending(true);
      
      const activeQR = qrConfigs?.find((c: any) => c.is_active);
      if (activeQR && activeQR.bank_id && activeQR.account_no) {
        const amount = finalTotal;
        const addInfo = `BIZSAAS ${newOrderId}`;
        setVietQRUrl(`https://img.vietqr.io/image/${activeQR.bank_id}-${activeQR.account_no}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(activeQR.account_name || '')}`);
      } else {
        setVietQRUrl('');
      }
    } catch (error) {
      message.error('Có lỗi khi tạo đơn hàng.');
    }
  };

  const handleSwitchToCash = async () => {
    setCheckoutMethod('CASH');
    if (!createdOrderId) return;
    try {
      await axios.post('http://localhost:3001/api/tenant/coffee/webhook/payos', {
        amount: finalTotal,
        description: `BIZSAAS ${createdOrderId}`
      }, { headers: { 'x-tenant-id': 'coffee' } });
      message.success('Đặt món thành công! Vui lòng thanh toán tại quầy.');
      setTrackingOrderId(createdOrderId);
      localStorage.setItem('bizsaas_tracking_order', createdOrderId.toString());
      setCart([]);
      setIsCheckoutDrawerOpen(false);
      setIsPaymentPending(false);
      setView('tracking');
    } catch (error) {
      message.error('Có lỗi khi chuyển đổi phương thức.');
    }
  };

  const placeOrder = async () => {
    // This is no longer used directly from the UI, kept for compatibility if needed.
  };

  const simulateWebhook = async () => {
    if (!createdOrderId) return;
    try {
      await axios.post('http://localhost:3001/api/tenant/coffee/webhook/payos', {
        amount: finalTotal,
        description: `BIZSAAS ${createdOrderId}`
      }, { headers: { 'x-tenant-id': 'coffee' } });
      message.success('Thanh toán thành công! Đơn hàng đã được chuyển đến bếp để chuẩn bị.');
      setTrackingOrderId(createdOrderId);
      localStorage.setItem('bizsaas_tracking_order', createdOrderId.toString());
      setCart([]);
      setIsCheckoutDrawerOpen(false);
      setIsPaymentPending(false);
      setView('tracking');
    } catch (error) {
      message.error('Lỗi giả lập Webhook');
    }
  };

  const currentTotalPrice = selectedProduct ? (() => {
    const toppingTotal = selectedToppings.reduce((acc, tId) => {
      const top = toppings.find(t => t.id === tId);
      return acc + (top ? Number(top.price) : 0);
    }, 0);
    const sizeAdd = selectedSize === 'Size L' ? 6000 : selectedSize === 'Size XL' ? 10000 : 0;
    return (Number(selectedProduct.price) + sizeAdd + toppingTotal) * quantity;
  })() : 0;

  // --- Views ---


  if (view === 'profile') {
    return (
      <div className="max-w-md mx-auto bg-[#faf8f5] min-h-[calc(100vh-60px)] relative font-sans">
        {!customer ? (
          loginStep === 0 ? (
            <div className="flex flex-col h-[calc(100vh-60px)]">
              <div className="flex-1 relative">
                <img src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Coffee" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#faf8f5]"></div>
                <div className="absolute top-1/4 w-full flex flex-col items-center">
                  <img src="/coffee/logo.png" className="w-32 h-32 mb-2 drop-shadow-md object-contain" alt="Cafee Logo" />
                  <h1 className="text-4xl font-bold text-primary tracking-wider drop-shadow-md">BizCoffee</h1>
                  <p className="text-primary text-sm drop-shadow-md font-medium">Good Coffee - Good Mood</p>
                </div>
              </div>
              <div className="bg-[#faf8f5] rounded-t-[40px] -mt-16 relative z-10 p-8 flex flex-col items-center shadow-[0_-10px_30px_rgba(0,0,0,0.1)] pb-32">
                <h2 className="text-2xl font-bold text-primary mb-2 text-center">Chào mừng bạn<br />đến với BizCoffee</h2>
                <p className="text-muted text-center text-sm mb-8 leading-relaxed">Đặt món nhanh - Tích điểm dễ dàng -<br />Thưởng thức cà phê trọn vị</p>
                <button onClick={() => setLoginStep(1)} className="w-full bg-[#5d4037] text-white font-bold py-4 rounded-full text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-[#4a332c] transition-colors">Bắt đầu <ArrowRightOutlined /></button>
                {/* Decorative dots */}
                <div className="flex gap-2 mt-8">
                  <div className="w-2 h-2 rounded-full bg-[#5d4037]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>
          ) : loginStep === 1 ? (
            <div className="p-6 pt-12 flex flex-col min-h-[calc(100vh-60px)] bg-[#faf8f5]">
              <div className="flex items-center">
                <LeftOutlined className="text-xl cursor-pointer text-primary" onClick={() => setLoginStep(0)} />
              </div>
              <div className="flex flex-col items-center mb-8">
                <img src="/coffee/logo.png" className="w-24 h-24 mb-2 object-contain" alt="Cafee Logo" />
                <h1 className="text-2xl font-bold text-[#5d4037] tracking-wide">BizCoffee</h1>
              </div>
              <h2 className="text-2xl font-bold text-center text-[#5d4037] mb-2">Đăng nhập / Đăng ký</h2>
              <p className="text-center text-muted text-sm mb-8 px-2 leading-relaxed">Chỉ cần số điện thoại, chúng tôi sẽ giúp bạn đăng nhập hoặc tạo tài khoản mới</p>

              <div className="bg-white rounded-2xl border border-gray-100 p-1 flex items-center mb-4 shadow-sm focus-within:border-[#5d4037] focus-within:ring-1 focus-within:ring-[#5d4037] transition-all">
                <input
                  type="tel"
                  className="w-full bg-transparent border-none text-lg flex-1 focus:ring-0 outline-none px-6 py-3 placeholder:font-normal placeholder:text-gray-400 font-semibold text-primary"
                  placeholder="Nhập số điện thoại của bạn"
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value)}
                />
              </div>

              <button onClick={handleLogin} className="w-full bg-[#5d4037] text-white font-bold py-4 rounded-full text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-[#4a332c] transition-colors">Tiếp tục <ArrowRightOutlined /></button>

              <div className="mt-10 flex justify-center gap-3">
                <div className="bg-[#f5ebe6] p-4 rounded-[20px] flex flex-col items-center justify-center w-[100px] h-[100px] text-center shadow-sm">
                  <CoffeeOutlined className="text-2xl text-[#5d4037] mb-2" />
                  <span className="text-[10px] text-[#5d4037] font-semibold leading-tight">Đặt món<br />nhanh chóng</span>
                </div>
                <div className="bg-[#f5ebe6] p-4 rounded-[20px] flex flex-col items-center justify-center w-[100px] h-[100px] text-center shadow-sm">
                  <StarOutlined className="text-2xl text-[#5d4037] mb-2" />
                  <span className="text-[10px] text-[#5d4037] font-semibold leading-tight">Tích điểm<br />mỗi đơn hàng</span>
                </div>
                <div className="bg-[#f5ebe6] p-4 rounded-[20px] flex flex-col items-center justify-center w-[100px] h-[100px] text-center shadow-sm">
                  <TagOutlined className="text-2xl text-[#5d4037] mb-2" />
                  <span className="text-[10px] text-[#5d4037] font-semibold leading-tight">Nhận ưu đãi<br />độc quyền</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 pt-12 flex flex-col min-h-[calc(100vh-60px)] bg-[#faf8f5]">
              <div className="flex items-center">
                <LeftOutlined className="text-xl cursor-pointer text-primary" onClick={() => setLoginStep(1)} />
              </div>
              <div className="flex flex-col items-center mb-8">
                <img src="/coffee/logo.png" className="w-24 h-24 mb-2 object-contain" alt="Cafee Logo" />
                <h1 className="text-2xl font-bold text-[#5d4037] tracking-wide">BizCoffee</h1>
              </div>
              <h2 className="text-2xl font-bold text-center text-[#5d4037] mb-2">Đăng ký tài khoản mới</h2>
              <p className="text-center text-muted text-sm mb-8 px-2 leading-relaxed">Chào mừng bạn mới, vui lòng nhập tên để chúng mình tiện xưng hô nhé!</p>

              <div className="bg-white rounded-2xl border border-gray-100 p-1 flex items-center mb-5 shadow-sm focus-within:border-[#5d4037] focus-within:ring-1 focus-within:ring-[#5d4037] transition-all">
                <input
                  type="text"
                  className="w-full bg-transparent border-none text-lg flex-1 focus:ring-0 outline-none px-6 py-3 placeholder:font-normal placeholder:text-gray-400 font-semibold text-primary"
                  placeholder="Tên của bạn"
                  value={loginName}
                  onChange={e => setLoginName(e.target.value)}
                />
              </div>

              <button onClick={handleLogin} className="w-full bg-[#5d4037] text-white font-bold py-4 rounded-full text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-[#4a332c] transition-colors">Hoàn tất <ArrowRightOutlined /></button>
            </div>
          )
        ) : (
          <div className="p-6 pt-10 pb-32">
            <h2 className="text-2xl font-bold text-primary mb-6">Hồ sơ khách hàng</h2>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  {customer?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{customer?.name}</h3>
                  <p className="text-muted font-medium mt-1">{customer?.phone}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#5d4037] to-[#8a6b62] text-white p-5 rounded-2xl mb-5 shadow-md flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-[-50px] bottom-[-30px] opacity-[0.25]">
                  <img src="/coffee/logo.png" className="w-48 h-48 object-contain brightness-0 invert" alt="BizCoffee Logo" />
                </div>
                <div className="relative z-10">
                  <span className="block text-sm text-white/80 font-medium mb-1">Điểm tích lũy</span>
                  <span className="text-3xl font-bold">{customer?.points || 0} <span className="text-base font-normal">pt</span></span>
                </div>
                <div className="relative z-10 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors">
                  <span className="font-semibold text-sm">Đổi điểm</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-primary mb-3 flex items-center gap-2 text-base"><TagOutlined className="text-primary" /> Voucher của bạn</h4>
                <div className="flex justify-between items-center bg-[#f5ebe6]/50 p-3 rounded-xl border border-[#f5ebe6]">
                  <span className="font-bold text-[#5d4037] bg-white px-3 py-1.5 rounded-lg shadow-sm text-sm">NEWBIE100</span>
                  <span className="text-sm font-medium text-gray-600">Giảm 20k</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-red-50 text-red-500 font-bold py-3.5 rounded-full hover:bg-red-100 transition-colors" onClick={() => setCustomer(null)}>Đăng xuất</button>
            </div>
          </div>
        )}

        {renderBottomNav()}
        {renderOffcanvas()}
      </div>
    );
  }

  if (view === 'favorite') {
    const favoriteProducts = products.filter(p => favorites.includes(p.id) && p.name.toLowerCase().includes(favSearchQuery.toLowerCase()));

    return (
      <div className="max-w-md mx-auto bg-primary-light min-h-screen relative font-sans pb-24">
        <div className="p-6 pt-10">
          <h2 className="text-2xl font-bold text-primary mb-4">Món yêu thích</h2>

          <div className="mb-6">
            <Input
              prefix={<SearchOutlined className="text-secondary" />}
              placeholder="Tìm trong mục yêu thích..."
              value={favSearchQuery}
              onChange={(e) => setFavSearchQuery(e.target.value)}
              className="rounded-full bg-surface-light border-none py-2 placeholder-[var(--color-secondary)] text-primary"
            />
          </div>

          {favoriteProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10 text-secondary">
              <HeartOutlined className="text-6xl mb-4 opacity-50" />
              <p className="text-center">{favSearchQuery ? 'Không tìm thấy món nào phù hợp.' : 'Bạn chưa có món yêu thích nào.'}</p>
              {!favSearchQuery && <button className="mt-6 px-8 py-3 bg-primary text-primary-light rounded-full font-bold shadow-md" onClick={() => setView('menu')}>Khám phá Menu</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {favoriteProducts.map(p => (
                <div key={p.id} className="bg-surface-light rounded-2xl p-3 shadow-sm flex flex-col relative cursor-pointer" onClick={() => openOffcanvas(p)}>
                  <div className="h-36 w-full mb-3 bg-white/40 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={p.image_url || p.img} alt={p.name} className="h-full w-full object-cover mix-blend-multiply" />
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

                  <h3 className="font-bold text-primary leading-tight mb-1">{p.name}</h3>

                  <div className="mt-auto flex justify-between items-center pt-2">
                    <span className="font-bold text-primary">{Number(p.price).toLocaleString()}đ</span>
                    <button
                      className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10"
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

        {renderBottomNav()}
        {renderOffcanvas()}
      </div>
    );
  }

  if (view === 'cart') {

    return (
      <div className="max-w-md mx-auto bg-primary-light min-h-screen relative font-sans pb-24">
        <div className="p-6 pt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Giỏ hàng của bạn</h2>
            {tableName && (
              <span className="bg-[#6b5eae] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                📍 {tableName}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-secondary">
              <ShoppingCartOutlined className="text-6xl mb-4 opacity-50" />
              <p className="text-center font-medium">Giỏ hàng của bạn đang trống.</p>
              <button 
                className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold shadow-md"
                onClick={() => setView('menu')}
              >
                Tiếp tục chọn món
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cart.map((c, i) => {
                  const toppingsStr = c.toppings.map((tId: number) => toppings.find(t => t.id === tId)?.name).filter(Boolean).join(', ');
                  const desc = [c.size, c.sugar, c.ice, toppingsStr].filter(Boolean).join(', ');
                  return (
                    <div key={i} className="bg-surface-light rounded-2xl p-3 flex items-center border border-muted/30 shadow-sm">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 mr-4">
                        <img src={c.image_url || c.img} alt={c.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-bold text-primary">{c.name}</div>
                        <div className="text-xs text-secondary leading-tight mb-1">{desc}</div>
                        <div className="font-bold text-primary">{Number(c.finalPrice).toLocaleString()}đ</div>
                      </div>
                      <div className="flex items-center border border-muted rounded-md bg-transparent px-2 py-1 ml-2">
                        <button className="px-1 text-primary font-bold" onClick={() => updateCartQty(i, -1)}>-</button>
                        <span className="px-2 font-semibold text-primary">{c.qty}</span>
                        <button className="px-1 text-primary font-bold" onClick={() => updateCartQty(i, 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg text-primary">Promo code</h3>
                <div className="flex gap-2 w-1/2">
                  <Input
                    placeholder="Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-transparent border-secondary rounded-lg"
                  />
                  <button className="bg-muted text-white px-4 py-1 rounded-lg text-sm font-semibold whitespace-nowrap shadow-sm hover:bg-surface-dark transition" onClick={() => { if (promoCode) message.success('Applied promo code!') }}>
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-muted/30 pt-6">
                <div className="flex justify-between text-lg font-semibold text-surface-dark">
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-surface-dark">
                  <span>Giảm giá</span>
                  <span>{discount > 0 ? '10%' : '0%'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary mt-2">
                  <span>Tổng cộng</span>
                  <span>{finalTotal.toLocaleString()}đ</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-xl shadow-lg mt-8"
              >
                Thanh Toán
              </button>
            </>
          )}
        </div>

        {renderBottomNav()}
        {renderOffcanvas()}
      </div>
    );
  }

  if (view === 'tracking') {
    return (
      <div className="max-w-md mx-auto bg-primary-light min-h-screen relative font-sans pb-24">
        {renderTrackingView()}
        {renderBottomNav()}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary-light text-primary">
        <img src="/coffee/logo.png" className="w-24 h-24 animate-bounce mb-4 object-contain drop-shadow-lg" alt="Loading Logo" />
        <h2 className="text-xl font-bold animate-pulse">Đang tải Menu...</h2>
      </div>
    );
  }


  function renderOffcanvas() {
    return (
      <>
        {/* Offcanvas Topping Selection (ShopeeFood Style) */}
        <Drawer
          placement="bottom"
          closable={false}
          onClose={() => setIsOffcanvasOpen(false)}
          open={isOffcanvasOpen}
          styles={{
            wrapper: { height: '85%' },
            body: { padding: 0, background: 'var(--color-primary-light)' }
          }}
          className="rounded-t-3xl overflow-hidden"
        >
          {selectedProduct && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-muted/20 bg-primary-light sticky top-0 z-10">
                <div className="w-8"></div>
                <h3 className="font-bold text-lg text-primary">Thêm món mới</h3>
                <CloseOutlined className="text-xl text-muted cursor-pointer" onClick={() => setIsOffcanvasOpen(false)} />
              </div>

              <div className="overflow-y-auto pb-28 flex-grow">
                {/* Product Info */}
                <div className="flex gap-4 p-4 bg-surface-light">
                  <div className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img src={selectedProduct.image_url || selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h2 className="text-lg font-bold text-primary leading-tight mb-1">{selectedProduct.name}</h2>
                    <p className="text-xs text-muted line-clamp-2 mb-2">{selectedProduct.desc}</p>

                    <div className="flex justify-between items-end mt-auto">
                      <span className="text-primary font-bold text-lg">{Number(selectedProduct.price).toLocaleString('vi-VN')}đ</span>
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-muted rounded-md bg-transparent">
                        <button className="px-2 py-1 text-primary font-bold text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                        <span className="px-3 font-semibold text-primary">{quantity}</span>
                        <button className="px-2 py-1 text-primary font-bold text-lg bg-muted/20" onClick={() => setQuantity(quantity + 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mt-2 bg-surface-light">
                  <div className="px-4 py-3 bg-muted/10 text-surface-dark font-semibold text-sm">Chọn Size (Bắt buộc)</div>
                  <div className="w-full flex flex-col">
                    {[
                      { label: 'Size M', price: 0 },
                      { label: 'Size L', price: 6000 },
                      { label: 'Size XL', price: 10000 }
                    ].map(size => (
                      <div key={size.label} className="flex justify-between items-center p-4 border-b border-muted/10 last:border-b-0 cursor-pointer" onClick={() => setSelectedSize(size.label)}>
                        <div>
                          <div className="font-semibold text-primary">{size.label}</div>
                          <div className="text-xs text-secondary">{size.price > 0 ? `+${size.price.toLocaleString()}đ` : '0đ'}</div>
                        </div>
                        <Radio checked={selectedSize === size.label} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sugar Selection */}
                <div className="mt-2 bg-surface-light">
                  <div className="px-4 py-3 bg-muted/10 text-surface-dark font-semibold text-sm">Chọn mức đường (Chọn 1)</div>
                  <div className="w-full flex flex-col">
                    {['100% Đường', '50% Đường', '30% Đường', 'Không Đường'].map(opt => (
                      <div key={opt} className="flex justify-between items-center p-4 border-b border-muted/10 last:border-b-0 cursor-pointer" onClick={() => setSelectedSugar(opt)}>
                        <div className="font-semibold text-primary">{opt}</div>
                        <Radio checked={selectedSugar === opt} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ice Selection */}
                <div className="mt-2 bg-surface-light">
                  <div className="px-4 py-3 bg-muted/10 text-surface-dark font-semibold text-sm">Chọn mức đá (Chọn 1)</div>
                  <div className="w-full flex flex-col">
                    {['Đá bình thường', 'Ít đá', 'Không đá', 'Đá riêng'].map(opt => (
                      <div key={opt} className="flex justify-between items-center p-4 border-b border-muted/10 last:border-b-0 cursor-pointer" onClick={() => setSelectedIce(opt)}>
                        <div className="font-semibold text-primary">{opt}</div>
                        <Radio checked={selectedIce === opt} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toppings Selection */}
                {selectedProduct?.toppings && selectedProduct.toppings.length > 0 && (
                  <div className="mt-2 bg-surface-light mb-4">
                    <div className="px-4 py-3 bg-muted/10 text-surface-dark font-semibold text-sm">Topping (Tùy chọn)</div>
                    <div className="flex flex-col">
                      {selectedProduct.toppings.map((top: any) => (
                        <div key={top.id} className="flex justify-between items-center p-4 border-b border-muted/10 last:border-b-0 cursor-pointer" onClick={() => toggleTopping(top.id)}>
                          <div>
                            <div className="font-semibold text-primary">{top.name}</div>
                            <div className="text-xs text-secondary">+{Number(top.price).toLocaleString()}đ</div>
                          </div>
                          <Checkbox checked={selectedToppings.includes(top.id)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Note */}
                <div className="mt-2 bg-surface-light mb-4">
                  <div className="px-4 py-3 bg-muted/10 text-surface-dark font-semibold text-sm">Ghi chú thêm</div>
                  <div className="p-4">
                    <input 
                      type="text" 
                      placeholder="Ví dụ: Ít sữa, không lấy ống hút..." 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-primary placeholder-gray-400 focus:outline-none focus:border-[#5d4037] focus:ring-1 focus:ring-[#5d4037] transition-all"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Button */}
              <div className="fixed bottom-0 left-0 w-full bg-primary-light p-4 border-t border-muted/30 z-50">
                <button
                  onClick={addToCart}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2"
                >
                  Thêm vào giỏ hàng - {currentTotalPrice.toLocaleString()}đ
                </button>
              </div>
            </div>
          )}
        </Drawer>

        {/* Checkout Drawer */}
        <Drawer
          placement="bottom"
          closable={false}
          onClose={() => setIsCheckoutDrawerOpen(false)}
          open={isCheckoutDrawerOpen}
          styles={{
            wrapper: { height: '90%' },
            body: { padding: 0, background: '#faf8f5', display: 'flex', flexDirection: 'column' }
          }}
          className="rounded-t-3xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-muted/20 sticky top-0 bg-[#faf8f5] z-10 shadow-sm">
            <h3 className="font-bold text-xl text-primary">Thanh toán</h3>
            <CloseOutlined className="text-xl text-muted cursor-pointer" onClick={() => setIsCheckoutDrawerOpen(false)} />
          </div>

          <div className="p-4 flex-1 overflow-y-auto pb-24">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h4 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Phương thức thanh toán</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl font-bold transition-all ${checkoutMethod === 'CASH' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm scale-105' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  onClick={handleSwitchToCash}
                >
                  <div className="text-xl mb-1">💵</div>
                  Tiền mặt
                </button>
                <button
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl font-bold transition-all ${checkoutMethod === 'BANK' ? 'border-primary bg-[#f4f3fb] text-primary shadow-sm scale-105' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  onClick={() => setCheckoutMethod('BANK')}
                >
                  <QrcodeOutlined className="text-xl mb-1" />
                  Chuyển khoản QR
                </button>
              </div>

              {checkoutMethod === 'BANK' ? (
                vietQRUrl ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="text-center mb-2 font-bold text-red-500 animate-pulse">Vui lòng thanh toán để đơn được xử lý</div>
                    <div className="border p-2 rounded-xl bg-white shadow-md inline-block mb-4">
                      <img src={vietQRUrl} alt="VietQR" className="w-56 h-56" />
                    </div>
                    <div className="w-full text-sm border border-primary rounded-xl p-4 bg-primary-light/30 text-left mb-4">
                      {qrConfigs?.find((c: any) => c.is_active)?.show_bank_name && (
                        <div className="mb-2"><span className="text-gray-500">Ngân hàng:</span> <span className="font-bold text-primary float-right">{banks.find(b => b.value === qrConfigs.find((c: any) => c.is_active).bank_id)?.label?.split(' (')[0] || qrConfigs.find((c: any) => c.is_active).bank_id}</span></div>
                      )}
                      {qrConfigs?.find((c: any) => c.is_active)?.show_amount && (
                        <div className="mb-2"><span className="text-gray-500">Số tiền:</span> <span className="font-bold text-red-600 float-right text-lg">{finalTotal.toLocaleString()} đ</span></div>
                      )}
                      {qrConfigs?.find((c: any) => c.is_active)?.show_account_name && (
                        <div className="mb-2"><span className="text-gray-500">Chủ TK:</span> <span className="font-bold uppercase float-right">{qrConfigs.find((c: any) => c.is_active).account_name}</span></div>
                      )}
                      <div className="mb-2"><span className="text-gray-500">Nội dung:</span> <span className="font-bold text-primary float-right">BIZSAAS {createdOrderId}</span></div>
                    </div>
                    <Button type="dashed" danger onClick={simulateWebhook} className="w-full h-12 text-lg font-bold">
                      (Dev) Giả lập Ngân hàng báo có
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-red-500 py-8">
                    <QrcodeOutlined className="text-4xl mb-2 opacity-50" />
                    <p>Quán chưa cấu hình mã QR.</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircleOutlined className="text-5xl text-green-500 mb-3 opacity-80" />
                  <p>Bạn sẽ thanh toán bằng tiền mặt<br/>cho nhân viên tại quầy.</p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-500">Tổng thanh toán:</span>
                <span className="text-primary text-xl">{finalTotal.toLocaleString()} đ</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => { setIsCheckoutDrawerOpen(false); setCart([]); setView('menu'); setIsPaymentPending(false); }}
              className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-xl transition active:scale-95"
            >
              Hủy / Đóng
            </button>
          </div>
        </Drawer>
      </>
    );
  }

  function renderTrackingView() {
    if (!trackingOrderData) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-primary">
          <CoffeeOutlined className="text-6xl animate-bounce mb-4 opacity-50" />
          <h2 className="text-xl font-bold animate-pulse">Đang tải thông tin đơn hàng...</h2>
        </div>
      );
    }

    const { id, status, items, total_price } = trackingOrderData;

    const steps = [
      { key: 'PENDING', title: 'Chờ xử lý', icon: <CoffeeOutlined /> },
      { key: 'PREPARING', title: 'Đang pha chế', icon: <FireOutlined /> },
      { key: 'SERVED', title: 'Sẵn sàng', icon: <CheckCircleOutlined /> }
    ];

    let currentStep = 0;
    if (status === 'PREPARING') currentStep = 1;
    if (status === 'SERVED' || status === 'COMPLETED' || status === 'PAID') currentStep = 2;

    return (
      <div className="p-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Đơn hàng #{id}</h2>
          {tableName && (
            <span className="bg-[#6b5eae] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              📍 {tableName}
            </span>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden border border-gray-100">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
          
          <h3 className="text-lg font-bold text-gray-700 mb-8 text-center">Tiến độ đơn hàng</h3>
          
          <div className="relative mb-6">
            {/* Progress line background */}
            <div className="absolute top-5 left-[10%] w-[80%] h-1 bg-gray-200 -z-10"></div>
            {/* Progress line active */}
            <div className="absolute top-5 left-[10%] h-1 bg-primary transition-all duration-700 ease-in-out -z-10" style={{ width: `${currentStep * 50}%` }}></div>
            
            <div className="flex justify-between relative z-0">
              {steps.map((step, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center bg-white">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 transition-all duration-500 ${isActive ? 'bg-primary text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-300 border border-gray-200'}`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-bold text-center w-20 ${isCurrent ? 'text-primary' : (isActive ? 'text-gray-600' : 'text-gray-400')}`}>{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-8 text-center p-4 bg-primary-light/30 rounded-xl">
            {status === 'PENDING' && <p className="text-gray-600 font-bold">Barista đã nhận đơn và chuẩn bị pha chế.</p>}
            {status === 'PREPARING' && <p className="text-primary font-bold animate-pulse">Đồ uống của bạn đang được pha chế thơm ngon!</p>}
            {(status === 'SERVED' || status === 'COMPLETED' || status === 'PAID') && <p className="text-green-600 font-bold">Thức uống đã sẵn sàng! Chúc bạn ngon miệng.</p>}
            {status === 'UNPAID' && <p className="text-red-500 font-bold">Đơn hàng chưa thanh toán.</p>}
            {status === 'CANCELLED' && <p className="text-red-500 font-bold">Đơn hàng đã bị hủy.</p>}
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 border border-muted/30 shadow-sm mb-6">
          <h3 className="font-bold text-lg text-primary mb-4 border-b pb-2 border-gray-200">Chi tiết món</h3>
          <div className="space-y-4">
            {items?.map((item: any, idx: number) => {
              const [specs] = item.note ? item.note.split('|') : [''];
              return (
                <div key={idx} className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-gray-800 text-sm">{item.quantity}x {item.product?.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{specs?.replace('Size: ', '')}</div>
                    {item.toppings?.length > 0 && (
                      <div className="text-xs text-primary font-medium mt-1">+{item.toppings.map((t: any) => t.name).join(', ')}</div>
                    )}
                  </div>
                  <div className="font-bold text-primary">
                    {((Number(item.product?.price) + (item.toppings?.reduce((s: number, t: any) => s + Number(t.price), 0) || 0)) * item.quantity).toLocaleString()}đ
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xl font-bold text-primary mt-4 pt-4 border-t border-gray-200">
            <span>Tổng cộng</span>
            <span>{Number(total_price || 0).toLocaleString()}đ</span>
          </div>
        </div>

        <button
          onClick={() => {
            setView('menu');
            setTrackingOrderId(null);
            setTrackingOrderData(null);
            localStorage.removeItem('bizsaas_tracking_order');
          }}
          className="w-full bg-white text-primary border-2 border-primary py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-primary-light transition active:scale-95 mb-8"
        >
          Tiếp tục đặt món
        </button>
      </div>
    );
  }

  function renderBottomNav() {
    return (
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-surface-dark border-t-0 px-6 py-4 flex justify-between items-center rounded-t-3xl z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {/* Floating QR Button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-7 flex flex-col items-center justify-center cursor-pointer z-50">
          <div className="bg-surface-dark p-1.5 rounded-full">
            <div className="bg-surface-bright text-primary border-[4px] border-surface-dark w-14 h-14 rounded-full flex items-center justify-center shadow-inner">
              <QrcodeOutlined className="text-3xl font-bold" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-primary-light absolute -bottom-3">QR</span>
        </div>

        <div className={`flex flex-col items-center cursor-pointer ${view === 'menu' ? 'text-primary-light font-bold' : 'text-primary-light opacity-70'}`} onClick={() => setView('menu')}>
          <BookOutlined className="text-2xl mb-1" />
          <span className="text-xs">Menu</span>
        </div>
        <div className={`flex flex-col items-center cursor-pointer ${view === 'favorite' ? 'text-primary-light font-bold' : 'text-primary-light opacity-70'}`} onClick={() => setView('favorite')}>
          {view === 'favorite' ? <HeartFilled className="text-2xl mb-1" /> : <HeartOutlined className="text-2xl mb-1" />}
          <span className="text-xs">Yêu thích</span>
        </div>
        {/* Spacer for absolute QR */}
        <div className="w-14"></div>

        <div className={`flex flex-col items-center cursor-pointer relative ${view === 'cart' ? 'text-primary-light font-bold' : 'text-primary-light opacity-70'}`} onClick={() => setView('cart')}>
          <div className="relative">
            <ShoppingCartOutlined className="text-2xl mb-1 text-primary-light" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary-light text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-xs">Giỏ hàng</span>
        </div>
        <div className={`flex flex-col items-center cursor-pointer ${view === 'profile' ? 'text-primary-light font-bold' : 'text-primary-light opacity-70'}`} onClick={() => setView('profile')}>
          <UserOutlined className="text-2xl mb-1" />
          <span className="text-xs">Hồ sơ</span>
        </div>
      </div>
    );
  }

  // --- Menu View ---

  return (
    <div className="max-w-md pt-10 mx-auto bg-transparent min-h-screen pb-24 font-sans relative">
      <div className="px-6">

        {/* Header - Table Info */}
        {tableName && (
          <div className="mb-4 bg-[#6b5eae] text-white py-2 px-4 rounded-xl flex items-center justify-between shadow-md animate-fade-in">
            <span className="font-semibold text-sm">📍 Bạn đang ngồi tại:</span>
            <span className="font-bold text-lg">{tableName}</span>
          </div>
        )}

        {/* Search */}
        <div className="mb-5">
          <Input
            prefix={<SearchOutlined className="text-secondary" />}
            placeholder="Tìm món tại BizSaaS Coffee..."
            className="rounded-full bg-surface-light border-none py-2 placeholder-[var(--color-secondary)] text-primary"
          />
        </div>

        {/* Categories */}
        <div className="mb-5">
          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all duration-300 shadow-sm ${activeCategory === cat.id
                  ? 'bg-primary text-primary-light shadow-md scale-105'
                  : 'bg-surface-light text-secondary hover:bg-surface-hover'
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
          {products.filter(p => p.category?.id === activeCategory || p.categoryId === activeCategory).map(p => (
            <div key={p.id} className="bg-surface-light rounded-2xl p-3 shadow-sm flex flex-col relative cursor-pointer" onClick={() => openOffcanvas(p)}>
              {/* Image container */}
              <div className="h-36 w-full mb-3 bg-white/40 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={p.image_url || p.img} alt={p.name} className="h-full w-full object-cover mix-blend-multiply" />
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

              <h3 className="font-bold text-primary leading-tight mb-1">{p.name}</h3>

              <div className="mt-auto flex justify-between items-center pt-2">
                <span className="font-bold text-primary">{Number(p.price).toLocaleString()}đ</span>
                <button
                  className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); openOffcanvas(p); }}
                >
                  <PlusOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {renderBottomNav()}
      {renderOffcanvas()}



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
          border-color: var(--color-primary) !important;
          background-color: var(--color-primary) !important;
        }
        /* Fix Antd Badge overriding text color */\n        .ant-badge {\n          color: inherit !important;\n        }\n\n        .ant-checkbox-checked .ant-checkbox-inner {
          border-color: var(--color-primary) !important;
          background-color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
