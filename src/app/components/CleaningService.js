"use client";

const CLEANING_PACKAGES = [
  {
    id: "cleaning-2h",
    duration: 2,
    basePrice: 160000,
    maxArea: 55,
    desc: "Lau dọn bụi bẩn, hút bụi, sắp xếp đồ đạc",
  },
  {
    id: "cleaning-3h",
    duration: 3,
    basePrice: 240000,
    maxArea: 80,
    desc: "Dọn sâu bao gồm tủ, tường",
  },
  {
    id: "cleaning-4h",
    duration: 4,
    basePrice: 320000,
    maxArea: 120,
    desc: "Dọn toàn bộ nhà, có cả sân",
  },
];

export default function CleaningService({ onSelectService }) {
  const handleSelectPackage = (pkg, hasPets) => {
    const finalPrice = pkg.basePrice + (hasPets ? 30000 : 0);
    onSelectService({
      id: pkg.id,
      name: `Dọn dẹp nhà cửa - ${pkg.duration} tiếng`,
      icon: "🧹",
      desc: pkg.desc,
      duration: pkg.duration,
      maxArea: pkg.maxArea,
      basePrice: pkg.basePrice,
      petSurcharge: hasPets ? 30000 : 0,
      totalPrice: finalPrice,
      specialty: "dọn dẹp",
      isRepair: false,
      color: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
    });
  };

  return (
    <div className="space-y-3">
      {CLEANING_PACKAGES.map((pkg) => (
        <div key={pkg.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                {pkg.duration} tiếng - {pkg.basePrice.toLocaleString('vi-VN')}đ
              </h4>
              <p className="text-xs text-slate-500 mb-2">{pkg.desc}</p>
              <p className="text-[10px] text-amber-600 font-semibold">
                💡 Tối đa {pkg.maxArea}m²
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleSelectPackage(pkg, false)}
              className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Không có thú cưng
            </button>
            <button
              onClick={() => handleSelectPackage(pkg, true)}
              className="w-full py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition"
            >
              Có chó/mèo (+30k)
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
