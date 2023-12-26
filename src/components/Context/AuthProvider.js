import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { Spin } from 'antd';

export const AuthContext = React.createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [hangXuatKho, setHangXuatKho] = useState([]);
  const [tenHienThi, setTenHienThi] = useState('');
  const [soLuongXuatKho, setSoLuongXuatKho] = useState('');
  const [donHang, setDonHang] = useState([]);
  const [pathTenNhanVien, setPathTenNhanVien] = useState('');
  const [tenNhanVien, setTenNhanVien] = useState('');
  const [pathHangTonKho, setPathHangTonKho] = useState('');
  const [pathHangXuatKho, setPathHangXuatKho] = useState('');

  const [pathHangTonKhoNhanVien, setPathHangTonKhoNhanVien] = useState('');
  const [pathHangXuatKhoNhanVien, setPathHangXuatKhoNhanVien] = useState('');


  React.useEffect(() => {
    const unsubscibed = auth.onAuthStateChanged((user) => {
      if (user) {
        const providerId = user.providerData[0].providerId;

        if (providerId === 'password') {
          const { displayName, email, uid, photoURL } = user;
          setUser({
            displayName,
            email,
            uid,
            photoURL,
          });
          setIsLoading(false);
          if ((location.pathname === '/admin')) {
            navigate('/admin');
          }
        }
      }
      else {
        setIsLoading(false);
        if (!user && (location.pathname === '/')) {
          navigate('/');
        }
        if (!user && (location.pathname === '/login')) {
          navigate('/login');
        }
      }
    }
    );

    return () => {
      unsubscibed();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{
      user, setUser, hangXuatKho, setHangXuatKho
      , tenHienThi, setTenHienThi, soLuongXuatKho, setSoLuongXuatKho,
      donHang, setDonHang, tenNhanVien, setTenNhanVien, pathTenNhanVien, setPathTenNhanVien
      , pathHangTonKho, setPathHangTonKho, pathHangXuatKho, setPathHangXuatKho
      , pathHangTonKhoNhanVien, setPathHangTonKhoNhanVien,
      pathHangXuatKhoNhanVien, setPathHangXuatKhoNhanVien
    }}>
      {isLoading ? <Spin style={{ position: 'fixed', inset: 0 }} /> : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);