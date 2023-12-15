import './App.css';
import Home from './components/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from './components/Context/AuthProvider';
import Login from './components/Login/QuanTriVien';
import NhanVien from './NhanVien';
import HangTonKhoNhanVien from './NhanVien/HangTonKhoNhanVien';
import HangXuatKhoNhanVien from './NhanVien/HangXuatKhoNhanVien';
import QuanTriVien from './components/QuanTriVien';
import HangXuatKhoQuanTriVien from './components/QuanTriVien/QuanLyHangXuatKho';
import HangTonKhoQuanTriVien from './components/QuanTriVien/QuanLyHangTonKho';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Home />} >
          </Route>

          <Route path="/staff" element={<NhanVien />} >
            <Route path="/staff/hang-ton-kho" element={<HangTonKhoNhanVien />} />
            <Route path="/staff/hang-xuat-kho" element={<HangXuatKhoNhanVien />} />
          </Route>

          <Route path="/admin" element={<QuanTriVien />} >
            <Route path="/admin/hang-xuat-kho" element={<HangXuatKhoQuanTriVien />} />
            <Route path="/admin/hang-ton-kho" element={<HangTonKhoQuanTriVien />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter >
  );
}

export default App;
