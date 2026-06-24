"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Auth from "./components/Auth";
import CleaningService from "./components/CleaningService";

const SERVICES = [
  {
    id: "don-dep",
    name: "Dọn dẹp nhà cửa",
    icon: "🧹",
    desc: "Lau dọn bụi bẩn, hút bụi, sắp xếp đồ đạc",
    specialty: "dọn dẹp",
    isCleaningPackages: true,
    color: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
  },
  {
    id: "giat-ui",
    name: "Vệ sinh vải nội thất",
    icon: "🛋️",
    desc: "Vệ sinh chuyên sâu bằng máy phun hút hơi nước nóng",
    basePrice: 300000,
    specialty: "giặt ủi",
    color: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100"
  },
  {
    id: "ve-sinh-lanh",
    name: "Vệ sinh máy lạnh",
    icon: "❄️",
    desc: "Rửa lưới lọc, đo ga, xịt rửa dàn nóng/lạnh khử khuẩn",
    basePrice: 150000,
    specialty: "điện lạnh",
    color: "bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100"
  },
  {
    id: "ve-sinh-long-giat",
    name: "Vệ sinh lồng giặt",
    icon: "🧺",
    desc: "Tháo lồng vệ sinh cặn bẩn bám lâu ngày, diệt nấm mốc",
    basePrice: 200000,
    specialty: "điện lạnh",
    color: "bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100"
  },
  {
    id: "sua-dien-lanh",
    name: "Sửa chữa điện lạnh",
    icon: "🔌",
    desc: "Sửa tủ lạnh, tủ đông, máy giặt, lò vi sóng bị sự cố",
    basePrice: 50000,
    specialty: "điện lạnh",
    isRepair: true,
    color: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
  },
  {
    id: "sua-dien-nuoc",
    name: "Sửa chữa điện nước",
    icon: "🚰",
    desc: "Sửa chập điện, rò nước, thay bóng đèn, vòi hoa sen",
    basePrice: 50000,
    specialty: "điện nước",
    isRepair: true,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
  }
];

const UPHOLSTERY_SERVICES = [
  {
    id: "sofa",
    name: "Ghế sofa",
    sizes: [
      { label: "1 chỗ", price: 220000 },
      { label: "2 chỗ", price: 280000 },
      { label: "3 chỗ", price: 340000 }
    ]
  },
  {
    id: "dem",
    name: "Đệm",
    sizes: [
      { label: "Đơn", price: 180000 },
      { label: "Đôi", price: 240000 },
      { label: "Cỡ lớn", price: 300000 }
    ]
  },
  {
    id: "rem",
    name: "Rèm",
    sizes: [
      { label: "Ngắn", price: 120000 },
      { label: "Dài", price: 180000 },
      { label: "Rèm lớn", price: 260000 }
    ]
  },
  {
    id: "tham",
    name: "Thảm",
    sizes: [
      { label: "Nhỏ", price: 150000 },
      { label: "Trung bình", price: 220000 },
      { label: "Lớn", price: 300000 }
    ]
  }
];






export default function Home() {
  // --- STATE QUẢN LÝ AUTHENTICATION ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // --- STATE QUẢN LÝ TABS CHÍNH ---
  const [activeTab, setActiveTab] = useState("home"); // "home", "activity", "account"

  // --- STATE QUẢN LÝ VÒNG ĐỜI ĐƠN HÀNG (TRANG CHỦ) ---
  const [step, setStep] = useState(1); // Bước 1 đến Bước 5
  const [selectedService, setSelectedService] = useState(null);
  const [showCleaningPackages, setShowCleaningPackages] = useState(false);
  const [selectedUpholsteryType, setSelectedUpholsteryType] = useState("");
  const [selectedUpholsterySize, setSelectedUpholsterySize] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderNotification, setOrderNotification] = useState(null);
  
  // Thông tin nhà & Giá (Bước 2)
  const [address, setAddress] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("08:00 - 10:00");

  // Kết nối thợ (Bước 3)
  const [isScanning, setIsScanning] = useState(false);
  const [scanCountdown, setScanCountdown] = useState(5);
  const [matchedTho, setMatchedTho] = useState(null);
  const [orderId, setOrderId] = useState("");

  // Giả lập làm việc (Bước 4)
  const [workPhase, setWorkPhase] = useState("moving"); // "moving" (đang di chuyển), "working" (đang làm việc)
  const [workCountdown, setWorkCountdown] = useState(5);
  const [workProgress, setWorkProgress] = useState(0);

  // Hoàn thành & Đánh giá (Bước 5)
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // --- DANH SÁCH HOẠT ĐỘNG / LỊCH SỬ ---
  const [history, setHistory] = useState([]);

  // --- REFS CHO TIMERS ---
  const timerRef = useRef(null);

  const calculatedPrice = useMemo(() => {
    if (!selectedService) return 0;

    if (selectedService.id === "giat-ui") {
      const item = UPHOLSTERY_SERVICES.find((option) => option.id === selectedUpholsteryType);
      const size = item?.sizes.find((sz) => sz.label === selectedUpholsterySize);
      return size?.price || 0;
    }

    if (selectedService.isRepair) {
      return 50000;
    }

    return selectedService.totalPrice || selectedService.basePrice || 0;
  }, [selectedService, selectedUpholsteryType, selectedUpholsterySize]);

  const selectedUpholsteryItem = UPHOLSTERY_SERVICES.find((option) => option.id === selectedUpholsteryType);
  const selectedUpholsterySizeObj = selectedUpholsteryItem?.sizes.find((size) => size.label === selectedUpholsterySize);
  const selectedServiceLabel = selectedService?.id === "giat-ui"
    ? selectedUpholsteryItem && selectedUpholsterySizeObj
      ? `${selectedService.name} - ${selectedUpholsteryItem.name} (${selectedUpholsterySizeObj.label})`
      : selectedService?.name
    : selectedService?.name || "";

  const renderWorkerAvatar = (worker, size = 64) => {
    const wrapperStyle = { width: `${size}px`, height: `${size}px` };
    if (!worker?.image) {
      return (
        <div
          style={wrapperStyle}
          className="rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-500"
        >
          👤
        </div>
      );
    }

    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-100" style={wrapperStyle}>
        <Image
          src={worker.image}
          alt={worker.name}
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  };

  const handleCancelOrder = (reason = "Người dùng hủy đơn") => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (orderId) {
      setHistory(prev =>
        prev.map(item => item.id === orderId ? { ...item, status: "cancelled", reason } : item)
      );
    }

    setStep(1);
    setSelectedService(null);
    setCurrentOrder(null);
    setMatchedTho(null);
    setOrderId("");
    setOrderNotification(null);
    setRating(0);
    setReviewText("");
    setRatingSubmitted(false);
  };

  const triggerWorkerAccepted = (order, assignedWorker = null) => {
    const activeOrder = order || currentOrder;
    if (!activeOrder) return;

    const worker = assignedWorker || matchedTho || {
      id: 99,
      name: "Thợ Phục Vụ Nhanh",
      age: 30,
      phone: "0900.000.000",
      rating: 5.0,
      specialty: activeOrder.specialty || "dọn dẹp",
      image: "/images/tho1.png"
    };

    setMatchedTho(worker);
    setOrderNotification({ type: "accepted", worker });
    setCurrentOrder(prev => prev ? { ...prev, status: "accepted" } : prev);
    setHistory(prev => prev.map(item => item.id === activeOrder.id ? { ...item, status: "accepted" } : item));
  };

  const startCompletionTimer = (order) => {
    const activeOrder = order || currentOrder;
    if (!activeOrder) return;

    timerRef.current = setTimeout(() => {
      setHistory(prev =>
        prev.map(item => item.id === activeOrder.id ? { ...item, status: "completed" } : item)
      );

      setCurrentOrder(prev => prev ? { ...prev, status: "completed" } : prev);
      setOrderNotification({ type: "completed", worker: matchedTho, order: activeOrder });
    }, 15000);
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      alert("Vui lòng nhập hoặc chọn địa chỉ nơi ở!");
      return;
    }
    if (!selectedDate) {
      alert("Vui lòng chọn ngày thực hiện!");
      return;
    }

    if (selectedService?.id === "giat-ui") {
      if (!selectedUpholsteryType || !selectedUpholsterySize) {
        alert("Vui lòng chọn loại và kích thước vải nội thất.");
        return;
      }
    }

    const generatedId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderId(generatedId);

    const serviceLabel = selectedService?.id === "giat-ui"
      ? `${selectedService.name} - ${UPHOLSTERY_SERVICES.find((opt) => opt.id === selectedUpholsteryType)?.name} (${selectedUpholsterySize})`
      : selectedService?.name;

    const newOrder = {
      id: generatedId,
      serviceName: serviceLabel,
      icon: selectedService?.icon,
      date: `${selectedDate} ${selectedTimeSlot.split(" ")[0]}`,
      price: calculatedPrice,
      status: "waiting",
      workerName: "Đang tìm thợ...",
      address: address,
      specialty: selectedService?.specialty,
      isRepair: selectedService?.isRepair || false
    };

    setHistory(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    setStep(1);
    setSelectedService(null);
    setShowCleaningPackages(false);
    setOrderNotification({
      type: "placed",
      message: "Dịch vụ đã đặt thành công, vui lòng ấn vào mục 'Hoạt động' để theo dõi trạng thái đơn yêu cầu của bạn",
      order: newOrder
    });

    let assignedWorker = {
      id: 99,
      name: "Thợ Phục Vụ Nhanh",
      age: 30,
      phone: "0900.000.000",
      rating: 5.0,
      specialty: newOrder.specialty,
      image: "/images/tho1.png"
    };

    try {
      const response = await fetch(`/api/get-tho?specialty=${encodeURIComponent(newOrder.specialty)}`);
      const data = await response.json();
      if (!data.error) {
        assignedWorker = data;
      }
    } catch (err) {
      console.error("Lỗi fetch thợ:", err);
    }

    setMatchedTho(assignedWorker);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      triggerWorkerAccepted(newOrder, assignedWorker);
    }, 15000);
  };

  const handleConfirmArrival = () => {
    if (!currentOrder || !matchedTho) return;

    setHistory(prev =>
      prev.map(item => item.id === currentOrder.id ? { ...item, status: "in-progress", workerName: matchedTho.name } : item)
    );

    setCurrentOrder(prev => prev ? { ...prev, status: "in-progress", workerName: matchedTho.name } : prev);
    setOrderNotification(null);
    setStep(1);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      startCompletionTimer(currentOrder);
    }, 15000);
  };

  // --- GỬI ĐÁNH GIÁ THỢ (BƯỚC 5) ---
  const handleSubmitRating = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao để đánh giá!");
      return;
    }
    
    // Cập nhật số sao vào lịch sử hoạt động
    setHistory(prev => 
      prev.map(item => item.id === orderId ? { ...item, rating: rating } : item)
    );

    // Tính điểm tích lũy = tiền / 10
    const finalPrice = currentOrder?.price ?? calculatedPrice;
    const earnedPoints = Math.floor(finalPrice / 10);
    const updatedUser = {
      ...currentUser,
      rewardPoints: (currentUser.rewardPoints || 0) + earnedPoints
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    setRatingSubmitted(true);
    // Hide any active order notification after submitting rating
    setOrderNotification(null);
    
    // Sau 2.5 giây tự động reset trở lại Trang chủ Bước 1
    setTimeout(() => {
      setStep(1);
      setSelectedService(null);
      setMatchedTho(null);
      setCurrentOrder(null);
      setOrderId("");
      setRating(0);
      setReviewText("");
      setRatingSubmitted(false);
    }, 2500);
  };

  // Load current user only on the client to avoid hydration mismatch
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Lỗi parse user:", e);
        localStorage.removeItem("currentUser");
      }
    }
    setLoadingUser(false);
  }, []);

  // Cleanup timers khi unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- HÀM XÁC ĐỊNH MÀU SẮC ACTIVE CỦA BOTTOM NAVIGATION BAR THEO ĐƠN HÀNG ---
  const getBottomNavColor = () => {
    if (step >= 2 && step <= 4) {
      return {
        activeText: "text-amber-500",
        activeBg: "bg-amber-50",
        border: "border-amber-100",
        accent: "bg-amber-500"
      }; // Đang trong quá trình đặt / thực hiện đơn hàng (Màu Cam/Vàng)
    }
    if (step === 5) {
      return {
        activeText: "text-emerald-500",
        activeBg: "bg-emerald-50",
        border: "border-emerald-100",
        accent: "bg-emerald-500"
      }; // Đơn hàng đã hoàn thành (Màu Xanh Lá)
    }
    return {
      activeText: "text-blue-600",
      activeBg: "bg-blue-50",
      border: "border-gray-100",
      accent: "bg-blue-600"
    }; // Mặc định hoặc Bước 1 (Màu Xanh Dương thương hiệu)
  };

  const navTheme = getBottomNavColor();

  // Hiển thị Auth nếu chưa login hoặc loading
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-slate-600 font-semibold">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  return (
    <div className="phone-container">
      {/* 1. THANH TRẠNG THÁI GIẢ LẬP ĐIỆN THOẠI (CHỈ HIỂN THỊ ĐẸP TRÊN MÀN HÌNH) */}
      <div className="hidden md:flex justify-between items-center px-6 pt-7 pb-2 bg-slate-900 text-white text-xs select-none z-50">
        <span>13:45</span>
        <div className="flex gap-2">
          <span>📶</span>
          <span>🛜</span>
          <span>🔋 85%</span>
        </div>
      </div>

      {/* 2. THANH TIÊU ĐỀ (HEADER) CỦA APP */}
      <header className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇻🇳</span>
          <div>
            <h1 className="font-bold text-base tracking-wide">Chăm Sóc Nhà Việt</h1>
            <p className="text-[10px] text-blue-100 opacity-90">Đặt Thợ Nhanh • Giá Cực Rẻ</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              setCurrentUser(null);
            }}
            className="text-sm px-2 py-1 bg-blue-500/50 hover:bg-blue-500/70 rounded-lg transition-colors"
            title="Đăng xuất"
          >
            🚪
          </button>
        </div>
      </header>

      {orderNotification && (
        <div className="p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3">
            {orderNotification.type === "placed" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">🛎️</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Đặt dịch vụ thành công</h3>
                    <p className="text-[10px] text-slate-500">{orderNotification.message}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setActiveTab("activity"); setOrderNotification(null); }}
                    className="py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Xem Hoạt động
                  </button>
                  <button
                    onClick={() => setOrderNotification(null)}
                    className="py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Đóng
                  </button>
                </div>
              </>
            ) : orderNotification.type === "accepted" ? (
              <>
              {/* Phần hiển thị Avatar Thợ và Tiêu đề */}
              <div className="flex items-center gap-3">
                {/* Gọi hàm render ảnh thợ với size 48px (tương đương w-12 h-12) */}
                {renderWorkerAvatar(orderNotification.worker, 48)}
                
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Thợ đã nhận đơn của bạn</h3>
                  <p className="text-[10px] text-slate-500">Vui lòng xác nhận để thợ bắt đầu làm việc.</p>
                </div>
              </div>

              {/* Phần chi tiết thông tin thợ */}
              {orderNotification.worker && (
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] text-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Thợ nhận:</span>
                    <strong className="text-slate-800">{orderNotification.worker.name}</strong>
                  </div>
                  
                  {/* THÊM MỚI: Hiển thị Đánh giá / Rating */}
                  <div className="flex justify-between items-center">
                    <span>Đánh giá:</span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      ⭐ {Number(orderNotification.worker.rating || 5).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Chuyên môn:</span>
                    <span className="text-slate-600">{orderNotification.worker.specialty}</span>
                  </div>
                </div>
              )}

              {/* Hai nút bấm hành động */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleConfirmArrival}
                  className="py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => handleCancelOrder("Hủy sau khi thợ nhận")}
                  className="py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition"
                >
                  Hủy đặt
                </button>
              </div>
            </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">✅</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Ca dịch vụ đã hoàn thành</h3>
                    <p className="text-[10px] text-slate-500">Bấm đánh giá để hoàn tất và nhận điểm thưởng.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setActiveTab("home");
                      setStep(5);
                      setSelectedService({ name: currentOrder?.serviceName, isRepair: currentOrder?.isRepair });
                      setOrderNotification(null);
                    }}
                    className="py-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold hover:bg-emerald-600 transition"
                  >
                    Đánh giá
                  </button>
                  <button
                    onClick={() => setOrderNotification(null)}
                    className="py-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. NỘI DUNG CHÍNH (ĐƯỢC CUỘN DỌC) */}
      <main className="flex-1 overflow-y-auto bg-slate-50 pb-24 no-scrollbar">
        
        {/* --- TAB TRANG CHỦ ("home") --- */}
        {activeTab === "home" && (
          <div className="p-4 animate-fade-in">
            
            {/* BƯỚC 1: CHỌN DỊCH VỤ */}
            {step === 1 && !showCleaningPackages && (
              <div>
                <div className="mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-7xl opacity-15 pointer-events-none select-none">🏠</div>
                  <h3 className="font-bold text-lg mb-1">Chào bạn, {currentUser?.name}!</h3>
                  <p className="text-xs text-blue-100 mb-3">Hôm nay bạn cần hỗ trợ công việc gì?</p>
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2 backdrop-blur-sm">
                    <span className="text-sm">💎</span>
                    <span className="text-xs">Bạn có <strong className="font-semibold text-amber-300">{currentUser?.rewardPoints || 0} điểm</strong> tích lũy</span>
                  </div>
                </div>

                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Dịch vụ tại nhà</h2>
                
                {/* GRID DỊCH VỤ */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {SERVICES.map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => {
                        if (srv.isCleaningPackages) {
                          setShowCleaningPackages(true);
                        } else {
                          setSelectedService(srv);
                          setSelectedUpholsteryType("");
                          setSelectedUpholsterySize("");
                          setStep(2);
                          // Điền địa chỉ mặc định đầu tiên nếu trống
                          if (!address && currentUser?.savedAddresses?.length > 0) {
                            setAddress(currentUser.savedAddresses[0]);
                          }
                          // Điền ngày mặc định là hôm nay
                          const today = new Date().toISOString().split("T")[0];
                          setSelectedDate(today);
                        }
                      }}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm ${srv.color}`}
                    >
                      <span className="text-3xl mb-3 select-none">{srv.icon}</span>
                      <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug">{srv.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{srv.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Banner cam kết dịch vụ */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-start gap-3">
                  <span className="text-xl mt-0.5 select-none">🛡️</span>
                  <div>
                    <h5 className="font-bold text-xs text-emerald-800 mb-0.5">Cam kết Chăm Sóc Nhà Việt</h5>
                    <p className="text-[10px] text-emerald-700 leading-normal">
                      Thợ được xác thực lý lịch, tay nghề cao. Đền bù thiệt hại vật chất 100% nếu có sự cố.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHỌN GÓI DỌN DẸP */}
            {step === 1 && showCleaningPackages && (
              <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setShowCleaningPackages(false)}
                    className="p-1.5 rounded-full hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                  >
                    ⬅️
                  </button>
                  <h3 className="font-bold text-slate-800 text-base">Chọn gói dọn dẹp</h3>
                </div>
                <CleaningService 
                  onSelectService={(svc) => {
                    setSelectedService(svc);
                    setSelectedUpholsteryType("");
                    setSelectedUpholsterySize("");
                    setShowCleaningPackages(false);
                    setStep(2);
                    if (!address && currentUser?.savedAddresses?.length > 0) {
                      setAddress(currentUser.savedAddresses[0]);
                    }
                    const today = new Date().toISOString().split("T")[0];
                    setSelectedDate(today);
                  }}
                />
              </div>
            )}

            {/* BƯỚC 2: TÍCH CHỌN THÔNG TIN NHÀ & HIỆN GIÁ */}
            {step === 2 && selectedService && (
              <div className="animate-slide-up">
                {/* Tiêu đề & Nút quay lại */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setStep(1)}
                    className="p-1.5 rounded-full hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                  >
                    ⬅️
                  </button>
                  <h3 className="font-bold text-slate-800 text-base">Thông tin đặt dịch vụ</h3>
                </div>

                {/* Tóm tắt dịch vụ đã chọn */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm flex items-center gap-3 mb-4">
                  <span className="text-3xl select-none">{selectedService.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedServiceLabel || selectedService.name}</h4>
                    <p className="text-xs text-slate-500">Chuyên môn thợ: {selectedService.specialty}</p>
                  </div>
                </div>

                {selectedService.id === "giat-ui" && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4">
                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide mb-3">Chọn loại vải nội thất</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {UPHOLSTERY_SERVICES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedUpholsteryType(item.id);
                            setSelectedUpholsterySize(item.sizes[0].label);
                          }}
                          className={`text-xs text-left p-3 rounded-2xl border ${selectedUpholsteryType === item.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                        >
                          <strong className="block font-semibold">{item.name}</strong>
                          <span className="text-[10px] text-slate-500">Bắt đầu từ {item.sizes[0].price.toLocaleString("vi-VN")}đ</span>
                        </button>
                      ))}
                    </div>
                    {selectedUpholsteryType ? (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Chọn kích thước</p>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedUpholsteryItem?.sizes.map((size) => (
                            <button
                              key={size.label}
                              type="button"
                              onClick={() => setSelectedUpholsterySize(size.label)}
                              className={`text-[11px] p-2 rounded-2xl border ${selectedUpholsterySize === size.label ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}
                            >
                              {size.label}
                            </button>
                          ))}
                        </div>
                        {selectedUpholsterySizeObj && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-2xl p-3 border border-slate-200">
                            Giá dịch vụ: <strong className="text-slate-800">{selectedUpholsterySizeObj.price.toLocaleString("vi-VN")}đ</strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">Chọn mục để xem giá theo kích thước.</p>
                    )}
                  </div>
                )}

                {/* Form điền thông tin */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 space-y-4">

                  {/* Địa chỉ thực hiện */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Địa chỉ thực hiện
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ nhà chi tiết..."
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    {/* Gợi ý địa chỉ đã lưu */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-semibold">📍 Địa chỉ đã lưu của bạn:</p>
                      {currentUser?.savedAddresses?.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAddress(addr)}
                          className="w-full text-left text-[11px] p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 truncate block border border-slate-100"
                        >
                          {addr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chọn ngày & giờ */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Ngày làm việc
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Khung giờ
                      </label>
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="08:00 - 10:00">08:00 - 10:00</option>
                        <option value="10:00 - 12:00">10:00 - 12:00</option>
                        <option value="13:00 - 15:00">13:00 - 15:00</option>
                        <option value="15:00 - 17:00">15:00 - 17:00</option>
                        <option value="18:00 - 20:00">18:00 - 20:00</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lưu ý nếu dịch vụ sửa chữa */}
                {selectedService.isRepair && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 flex gap-2">
                    <span className="text-base select-none">⚠️</span>
                    <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                      Đây là phí kiểm tra tận nơi cố định 50.000đ, chi phí sửa chữa thực tế sẽ theo bảng giá sàn của App sau khi thợ khảo sát.
                    </p>
                  </div>
                )}

                {/* Hộp tổng kết giá & Đặt đơn */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Tổng phí:</span>
                    <strong className="text-xl text-blue-600">
                      {calculatedPrice.toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md transition-colors ripple"
                  >
                    🚀 ĐẶT DỊCH VỤ NGAY
                  </button>
                </div>
              </div>
            )}

            {/* BƯỚC 3: QUÉT ĐƠN & KẾT NỐI THỢ */}
            {step === 3 && (
              <div className="text-center py-6 animate-fade-in">
                {isScanning ? (
                  // MÀN HÌNH QUÉT ĐƠN RADAR
                  <div className="flex flex-col items-center">
                    <h3 className="font-bold text-slate-800 text-lg mb-1 animate-pulse">Đang quét tìm thợ gần bạn</h3>
                    <p className="text-xs text-slate-500 mb-8">Hệ thống đang điều phối thợ chuyên môn &quot;{selectedService.specialty}&quot;...</p>
                    
                    {/* Hiệu ứng Radar quét cực đẹp */}
                    <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                      <div className="absolute w-full h-full rounded-full bg-blue-500/10 radar-pulse-1"></div>
                      <div className="absolute w-full h-full rounded-full bg-blue-500/10 radar-pulse-2"></div>
                      <div className="absolute w-full h-full rounded-full bg-blue-500/10 radar-pulse-3"></div>
                      
                      <div className="absolute w-36 h-36 rounded-full border border-blue-200 bg-white shadow-inner flex items-center justify-center">
                        <span className="text-5xl animate-spin-slow select-none">🧭</span>
                      </div>
                      
                      {/* Bong bóng dịch vụ nhỏ chạy xung quanh */}
                      <span className="absolute top-4 left-6 text-2xl animate-bounce">🧹</span>
                      <span className="absolute bottom-4 right-8 text-2xl animate-bounce delay-200">🛠️</span>
                    </div>

                    <div className="bg-slate-100 rounded-full px-4 py-1.5 text-xs text-slate-700 font-bold mb-8">
                      Còn lại {scanCountdown}s...
                    </div>

                    <button
                      onClick={() => handleCancelOrder("Hủy trong khi tìm thợ")}
                      className="py-2.5 px-6 border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl transition-all"
                    >
                      ❌ Hủy đơn hàng
                    </button>
                  </div>
                ) : (
                  // MÀN HÌNH KẾT QUẢ ĐÃ TÌM THẤY THỢ
                  <div className="animate-slide-up space-y-4">
                    <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1 animate-bounce shadow-md shadow-emerald-200">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Đã kết nối thợ thành công!</h3>
                    <p className="text-xs text-slate-500 mb-2">Thợ sửa chữa/dọn dẹp đã nhận yêu cầu của bạn.</p>

                    {/* THẺ THÔNG TIN THỢ KẾT NỐI */}
                    {matchedTho ? (
                      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md text-left space-y-4">
                        <div className="flex gap-4">
                          {renderWorkerAvatar(matchedTho, 64)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h4 className="font-bold text-slate-800 text-sm truncate">{matchedTho.name}</h4>
                              <span className="bg-blue-50 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                Thợ tốt
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold mb-1">
                              {matchedTho.age} tuổi • Chuyên môn: {matchedTho.specialty}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="text-amber-400 text-xs">⭐</span>
                              <span className="text-xs font-bold text-slate-800">{matchedTho.rating.toFixed(1)}</span>
                              <span className="text-[10px] text-slate-400">(45 đánh giá)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 bg-slate-100 animate-pulse rounded-2xl"></div>
                    )}

                    {/* TÓM TẮT ĐƠN HÀNG */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dịch vụ đặt:</span>
                        <span className="font-semibold text-slate-800">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Địa chỉ làm:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng thanh toán:</span>
                        <span className="font-bold text-blue-600">{calculatedPrice.toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>

                    {/* HAI NÚT LỰA CHỌN */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleCancelOrder("Hủy sau khi tìm thấy thợ")}
                        className="py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                      >
                        ❌ Hủy đơn hàng
                      </button>
                      <button
                        onClick={handleConfirmArrival}
                        className="py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all ripple"
                      >
                        🫱🏼‍🫲 Diem danh / Xác nhận thợ đến
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BƯỚC 4: GIẢ LẬP THỜI GIAN LÀM VIỆC */}
            {step === 4 && (
              <div className="text-center py-6 animate-fade-in space-y-6">
                {workPhase === "moving" ? (
                  // Giai đoạn 1: Thợ đang di chuyển
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-base">Thợ đang di chuyển tới nhà bạn</h3>
                    <p className="text-xs text-slate-500">Giả lập thời gian thợ đi đường: <strong className="text-amber-500">{workCountdown} giây</strong></p>

                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-amber-50 rounded-full border border-amber-100">
                      <span className="text-5xl animate-bounce">🛵</span>
                      {/* Vòng quay tiến trình */}
                      <svg className="absolute w-36 h-36 -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="68"
                          stroke="#e2e8f0"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="68"
                          stroke="#f59e0b"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={427}
                          strokeDashoffset={427 - (427 * workProgress) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${workProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  // Giai đoạn 2: Thợ đang làm việc
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-base text-blue-600 animate-pulse">Thợ đang tiến hành dịch vụ</h3>
                    <p className="text-xs text-slate-500">Giả lập thời gian thợ lau dọn/sửa chữa: <strong className="text-blue-600">{workCountdown} giây</strong></p>

                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-blue-50 rounded-full border border-blue-100">
                      <span className="text-5xl animate-pulse select-none">
                        {selectedService.id.includes("sua") ? "🛠️" : "🧼"}
                      </span>
                      {/* Vòng quay tiến trình */}
                      <svg className="absolute w-36 h-36 -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="68"
                          stroke="#e2e8f0"
                          strokeWidth="6"
                          fill="transparent"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="68"
                          stroke="#2563eb"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={427}
                          strokeDashoffset={427 - (427 * workProgress) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${workProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* THẺ THÔNG TIN THỢ TRONG KHI LÀM VIỆC */}
                {matchedTho && (
                  <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 text-left max-w-xs mx-auto">
                    {renderWorkerAvatar(matchedTho, 48)}
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{matchedTho.name}</h4>
                      <p className="text-[10px] text-slate-500">SĐT: {matchedTho.phone}</p>
                    </div>
                    <span className="ml-auto bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-1 rounded">
                      Đang xử lý
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleCancelOrder("Hủy khẩn cấp khi đang làm việc")}
                  className="py-2 px-4 border border-slate-200 hover:bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg transition-all"
                >
                  🛑 Dừng khẩn cấp / Hủy dịch vụ
                </button>
              </div>
            )}

            {/* BƯỚC 5: HOÀN THÀNH & ĐÁNH GIÁ */}
            {step === 5 && (
              <div className="text-center py-4 animate-slide-up space-y-6">
                {!ratingSubmitted ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce border-2 border-emerald-500">
                      <span className="text-emerald-600 text-3xl">🎉</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Ca dịch vụ đã hoàn thành!</h3>
                      <p className="text-xs text-slate-500 mt-1">Cảm ơn bạn đã tin tưởng Chăm Sóc Nhà Việt.</p>
                    </div>

                    {/* HÓA ĐƠN CHI TIẾT */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md text-left space-y-3 max-w-sm mx-auto">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
                        Chi tiết hóa đơn
                      </h4>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dịch vụ:</span>
                          <strong className="text-slate-800">{currentOrder?.serviceName || selectedService?.name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Khách hàng:</span>
                          <span className="text-slate-800">{currentUser?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Thực hiện bởi:</span>
                          <span className="font-semibold text-blue-600">{matchedTho?.name}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm">
                          <span className="text-slate-700">Tổng tiền đã thanh toán:</span>
                          <span className="text-emerald-600">{(currentOrder?.price ?? calculatedPrice).toLocaleString("vi-VN")}đ</span>
                        </div>
                      </div>
                    </div>

                    {/* CỤM ĐÁNH GIÁ 5 SAO INTERACTIVE */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 max-w-sm mx-auto">
                      <h4 className="font-bold text-xs text-slate-700">Đánh giá chất lượng dịch vụ của thợ</h4>
                      
                      <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="text-3xl focus:outline-none transition-transform hover:scale-125 select-none"
                          >
                            <span
                              className={
                                star <= (hoverRating || rating)
                                  ? "text-amber-400 fill-current"
                                  : "text-slate-300"
                              }
                            >
                              ★
                            </span>
                          </button>
                        ))}
                      </div>

                      {rating > 0 && (
                        <p className="text-xs text-amber-600 font-bold animate-pulse">
                          {rating === 1 && "Rất tệ 😞"}
                          {rating === 2 && "Tệ 😕"}
                          {rating === 3 && "Bình thường 😐"}
                          {rating === 4 && "Tốt 🙂"}
                          {rating === 5 && "Tuyệt vời! 😍"}
                        </p>
                      )}

                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Để lại cảm nhận để cải thiện dịch vụ của thợ..."
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        rows={2}
                      />
                    </div>

                    <button
                      onClick={handleSubmitRating}
                      className="w-full max-w-sm py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors ripple block mx-auto"
                    >
                      ⭐️ GỬI ĐÁNH GIÁ & HOÀN TẤT
                    </button>
                  </>
                ) : (
                  // Màn hình cảm ơn sau khi đánh giá
                  <div className="py-12 animate-fade-in space-y-4">
                    <div className="text-6xl animate-bounce select-none">💖</div>
                    <h3 className="font-bold text-slate-800 text-lg">Cảm ơn đánh giá của bạn!</h3>
                    <p className="text-xs text-slate-500">Đóng góp của bạn giúp nâng cao tay nghề thợ phục vụ.</p>
                    <p className="text-[10px] text-blue-500 animate-pulse font-semibold pt-4">Hệ thống đang tự động quay về trang chủ...</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* --- TAB HOẠT ĐỘNG / LỊCH SỬ ("activity") --- */}
        {activeTab === "activity" && (
          <div className="p-4 animate-fade-in">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📋</span> Lịch sử hoạt động của bạn
            </h2>

            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm flex items-start gap-3 relative"
                >
                  <span className="text-3xl bg-slate-50 p-2 rounded-xl border border-slate-100 select-none">
                    {item.icon}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.serviceName}</h4>
                      <span className="text-[10px] text-slate-400 font-medium select-all">{item.id}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 mb-1.5">{item.date}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.status === "completed" && (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded">
                            Hoàn thành
                          </span>
                        )}
                        {item.status === "cancelled" && (
                          <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded">
                            Đã hủy
                          </span>
                        )}
                        {item.status === "waiting" && (
                          <span className="bg-slate-50 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                            Đang chờ thợ nhận
                          </span>
                        )}
                        {item.status === "in-progress" && (
                          <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                            Thợ đang thực hiện
                          </span>
                        )}
                      </div>
                      <strong className="text-xs text-slate-700">
                        {item.price.toLocaleString("vi-VN")}đ
                      </strong>
                    </div>

                    {/* Hiển thị thợ và đánh giá nếu có */}
                    {item.status === "completed" && (
                      <div className="border-t border-slate-100 mt-2 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Thợ: <strong>{item.workerName}</strong></span>
                        {item.rating ? (
                          <span className="text-amber-500">
                            {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                          </span>
                        ) : (
                          <span className="text-slate-400">Chưa đánh giá</span>
                        )}
                      </div>
                    )}

                    {/* Nút quay lại tiến độ nếu đang xử lý */}
                    {item.status === "processing" && (
                      <div className="border-t border-slate-100 mt-2.5 pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveTab("home");
                          }}
                          className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          Xem tiến độ hiện tại ➔
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB TÀI KHOẢN ("account") --- */}
        {activeTab === "account" && (
          <div className="p-4 animate-fade-in space-y-6">
            
            {/* THẺ PROFILE TÀI KHOẢN */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blue-100 border border-slate-200 flex-shrink-0 shadow-inner">
                {/* Dùng ảnh thợ làm ảnh đại diện để tạo giao diện lung linh không bị ảnh lỗi font */}
                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  👤
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{currentUser?.name}</h3>
                <p className="text-xs text-slate-500 mb-0.5">{currentUser?.phone || "Chưa cập nhật"}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">@{currentUser?.username}</p>
              </div>
            </div>

            {/* HỘP QUẢN LÝ ĐIỂM THƯỞNG */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 text-6xl opacity-10 pointer-events-none select-none">⭐</div>
              <div>
                <span className="text-[10px] text-blue-100 uppercase font-bold tracking-wider opacity-90">Hạng khách hàng</span>
                <h4 className="font-bold text-sm mb-1">Thành viên Vàng</h4>
                <p className="text-[11px] text-blue-100">Điểm thưởng khả dụng: <strong>{currentUser?.rewardPoints || 0}</strong></p>
              </div>
              <button className="bg-white text-blue-600 text-xs font-bold py-2 px-4 rounded-xl shadow hover:bg-slate-50 active:scale-95 transition-all">
                Đổi quà 🎁
              </button>
            </div>

            {/* QUẢN LÝ ĐỊA CHỈ ĐÃ LƯU */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Địa chỉ đã lưu</h4>
              <div className="space-y-2">
                {currentUser?.savedAddresses?.map((addr, idx) => (
                  <div key={idx} className="flex gap-2 p-2 bg-slate-50 rounded-xl text-xs text-slate-700 items-start">
                    <span className="text-sm select-none">📍</span>
                    <span className="leading-snug">{addr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DANH SÁCH MENU TIỆN ÍCH KHÁC */}
            <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
              <button className="w-full flex items-center justify-between p-3 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all">
                <div className="flex items-center gap-2">
                  <span>💳</span>
                  <span>Phương thức thanh toán</span>
                </div>
                <span>➔</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span>Trung tâm trợ giúp 24/7</span>
                </div>
                <span>➔</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Cài đặt cấu hình ứng dụng</span>
                </div>
                <span>➔</span>
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">Chăm Sóc Nhà Việt v1.0.0 (MVP Demo)</p>
          </div>
        )}

      </main>

      {/* 4. THANH BOTTOM NAVIGATION BAR CỐ ĐỊNH Ở ĐÁY KHUNG DI ĐỘNG */}
      <nav className={`absolute bottom-0 left-0 right-0 h-16 bg-white border-t ${navTheme.border} flex items-center justify-around px-2 z-50 shadow-inner`}>
        
        {/* NÚT TRANG CHỦ */}
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all select-none ${
            activeTab === "home"
              ? `${navTheme.activeText} ${navTheme.activeBg} font-bold scale-105 shadow-sm`
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[10px] mt-0.5 leading-none">Trang chủ</span>
        </button>

        {/* NÚT HOẠT ĐỘNG */}
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all select-none ${
            activeTab === "activity"
              ? `${navTheme.activeText} ${navTheme.activeBg} font-bold scale-105 shadow-sm`
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-lg">📋</span>
          <span className="text-[10px] mt-0.5 leading-none">Hoạt động</span>
          {/* Chấm tròn nhấp nháy báo đơn đang chạy */}
          {history.some(h => h.status === "processing") && (
            <span className={`absolute top-2.5 right-4 w-2 h-2 ${navTheme.accent} rounded-full animate-ping`}></span>
          )}
        </button>

        {/* NÚT TÀI KHOẢN */}
        <button
          onClick={() => setActiveTab("account")}
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all select-none ${
            activeTab === "account"
              ? `${navTheme.activeText} ${navTheme.activeBg} font-bold scale-105 shadow-sm`
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-lg">👤</span>
          <span className="text-[10px] mt-0.5 leading-none">Tài khoản</span>
        </button>

      </nav>
    </div>
  );
}