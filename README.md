# 236602_TranDangKhoa

## Thong tin sinh vien
- MSSV: 236602
- Ho ten: Tran Dang Khoa
- Hoc phan: Dien toan dam may

## De tai
Xay dung va trien khai he thong quan ly mon an tren nen tang dam may.

## Cong nghe su dung
- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Quan ly ma nguon: Git, GitHub
- Dong goi: Docker, Docker Hub
- Trien khai: Render

## Cau truc du an
- backend/: API quan ly mon an
- frontend/: Giao dien React
- README.md: Huong dan du an
- .gitignore: Loai tru file nhay cam

## Chuc nang du kien
- Hien thi danh sach mon an
- Xem chi tiet mon an
- Them, sua, xoa mon an
- Tim kiem mon an
- Ket noi MongoDB Atlas

## Huong dan cai dat va chay
Sau khi hoan thien ma nguon:

Backend:
1. cd backend
2. npm install
3. Tao file .env tu .env.example
4. npm start

Frontend:
1. cd frontend
2. npm install
3. npm run dev

## Bao mat
Khong dua file .env, mat khau hoac token len GitHub.

## Trien khai
URL Render va Docker Hub se duoc cap nhat
sau khi trien khai thanh cong.

## Cau 2: MongoDB Atlas
- Cluster: TrandangKhoa236602
- Database: 236602_TranDangKhoa
- Collection: foods
- Du lieu mau: F001 Pho bo, F002 Bun bo Hue, F003 Com tam suon
- So luong: 3 documents
- Connection String: luu rieng trong backend/.env

## Cau 5: Docker Backend
- Docker Image: trandangkhoa236602/backend:1.0
- Docker Hub: https://hub.docker.com/r/trandangkhoa236602/backend
- Build: docker build -t trandangkhoa236602/backend:1.0 ./backend
- Run: docker run -p 5001:5000 --env-file backend/.env trandangkhoa236602/backend:1.0
- API: /health va /api/foods

## Cau 6: Docker Frontend
- Image: trandangkhoa236602/frontend:1.0
- Docker Hub: https://hub.docker.com/r/trandangkhoa236602/frontend
- Build: docker build -t trandangkhoa236602/frontend:1.0 ./frontend
- Container port: 10000
- Backend API: BACKEND_UPSTREAM

## Cau 7: Render Frontend
- Service: web-236602
- URL: https://web-236602.onrender.com
- Docker Image: trandangkhoa236602/frontend:1.0
- Backend API: se cau hinh sau khi trien khai Cau 8

## Cau 8: Render Backend va ket noi Frontend
- Backend: https://api-236602.onrender.com
- Frontend: https://web-236602.onrender.com
- Health API: https://api-236602.onrender.com/health
- Foods API: https://api-236602.onrender.com/api/foods
- MongoDB Atlas: 236602_TranDangKhoa
- Da cau hinh BACKEND_UPSTREAM tren Render.
- Da sua Nginx HTTPS proxy.
