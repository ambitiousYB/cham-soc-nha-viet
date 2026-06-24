import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty'); // ví dụ: "dọn dẹp", "giặt ủi", "điện lạnh", "điện nước"
    
    // Đọc tho_data.json động tại thời điểm runtime
    const filePath = path.join(process.cwd(), 'src', 'tho_data.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const thoList = JSON.parse(fileData);
    
    if (!specialty) {
      return NextResponse.json({ error: 'Thiếu tham số specialty' }, { status: 400 });
    }
    
    // Lọc danh sách thợ theo chuyên môn
    const filteredTho = thoList.filter(
      t => t.specialty.toLowerCase().trim() === specialty.toLowerCase().trim()
    );
    
    if (filteredTho.length === 0) {
      // Nếu không tìm thấy thợ khớp chuyên môn, tạo thợ dự phòng với ảnh mặc định tho1.png
      return NextResponse.json({
        id: 99,
        name: "Thợ Phục Vụ Nhanh",
        age: 30,
        phone: "0900.000.000",
        specialty: specialty,
        rating: 5.0,
        image: "/images/tho1.png"
      });
    }
    
    // Trả về thợ ngẫu nhiên trong danh sách đã lọc
    const randomTho = filteredTho[Math.floor(Math.random() * filteredTho.length)];
    return NextResponse.json(randomTho);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thợ:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
