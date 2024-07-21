# TRUE-API-Web
Tech Stack: NodeJS + ExpessJS + MongoDB + //Redis

Tôi rất vui được hỗ trợ bạn tạo file README.md để hướng dẫn cài đặt và sử dụng API cho dự án website "Tìm phòng trọ, căn hộ mini". Dưới đây là nội dung của file README.md:

# Tìm phòng trọ, căn hộ mini

Đây là API được xây dựng bằng Node.js, Express.js và MongoDB để hỗ trợ tìm kiếm và quản lý thông tin về các phòng trọ, căn hộ mini.

## Yêu cầu cài đặt

Trước khi sử dụng API, bạn cần cài đặt các công cụ sau:

1. Node.js (version 16.16.0)
2. MongoDB (version __.x )
3. npm (được cài đặt cùng với Node.js)

## Cài đặt

1. Clone repository từ Github:
```
git clone .git
```

2. Di chuyển vào thư mục dự án:
```
cd 
```

3. Cài đặt các dependencies:
```
npm install
```

4. Tạo file `.env` trong thư mục gốc của dự án và thêm các biến môi trường sau:
```
MONGODB_URI=mongodb://localhost:27017/room-finder
PORT=3000
```

5. Khởi động server:
```
npm start
```

Lúc này, API sẽ được chạy trên địa chỉ `http://localhost:3000`.

## Sử dụng API

API cung cấp các endpoint sau:

1. **Tìm kiếm phòng trọ/căn hộ mini**:
   - Endpoint: `GET /rooms`
   - Tham số: `location`, `type`, `minPrice`, `maxPrice`
   - Ví dụ: `http://localhost:3000/rooms?location=Hanoi&type=apartment&minPrice=500000&maxPrice=1000000`

2. **Xem chi tiết phòng trọ/căn hộ mini**:
   - Endpoint: `GET /rooms/:id`
   - Ví dụ: `http://localhost:3000/rooms/60a1b2c3d4e5f6g7h8i9j0`

3. **Thêm mới phòng trọ/căn hộ mini**:
   - Endpoint: `POST /rooms`
   - Dữ liệu gửi lên: `{ "location": "Hanoi", "type": "apartment", "price": 800000, "description": "..." }`

4. **Cập nhật thông tin phòng trọ/căn hộ mini**:
   - Endpoint: `PUT /rooms/:id`
   - Dữ liệu gửi lên: `{ "price": 900000, "description": "..." }`

5. **Xóa phòng trọ/căn hộ mini**:
   - Endpoint: `DELETE /rooms/:id`

Bạn có thể sử dụng các công cụ như Postman hoặc cURL để test các endpoint này.

## Lưu ý

- Đảm bảo MongoDB đang chạy trên máy của bạn trước khi khởi động server.
- Tài liệu API chi tiết có thể được tìm thấy trong file `docs/api.md`.
- Nếu gặp bất kỳ vấn đề nào, hãy tạo issue trên GitHub hoặc liên hệ với nhóm phát triển.

Chúc bạn sử dụng API thành công!