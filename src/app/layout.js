import "./globals.css";

export const metadata = {
  title: "Chăm Sóc Nhà Việt - Đặt Dịch Vụ Sửa Chữa & Dọn Dẹp",
  description: "Ứng dụng di động giả lập đặt dịch vụ dọn dẹp nhà cửa, giặt rèm/đệm/sofa, vệ sinh máy lạnh, sửa chữa điện lạnh, sửa chữa điện nước nhanh chóng, tiện lợi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
