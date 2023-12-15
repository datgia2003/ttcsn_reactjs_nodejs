import React, { useEffect, useContext, useState, useMemo } from 'react';
import { db } from '../components/firebase/config';
import { Col, Row } from 'antd';
import { AuthContext } from '../components/Context/AuthProvider';

function HangXuatKhoNhanVien() {
  const { check, setCheck } =
    React.useContext(AuthContext);
  const [hangXuatKho, sethangXuatKho] = useState([]);

  const { user: { uid } } = useContext(AuthContext);

  const fetchHangXuatKho = () => {
    const messagesRef = db.collection("HangXuatKho");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const productsData = querySnapshot.docs.map((doc) => doc.data());

        sethangXuatKho(productsData)
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const memoizedFetchHangXuatKho = useMemo(() => fetchHangXuatKho, [hangXuatKho || check]);

  useEffect(() => {
    memoizedFetchHangXuatKho();
  }, [hangXuatKho.length]);

  return (
    <>
      <div className='danhSachHang'>
        <h2 className='tittle'>Tất cả hàng tồn kho</h2>
        <div className='danhSachHang__admin'>
          <Row>
            {hangXuatKho.map((item) => (
              <Col key={item.id} span="8">
                {item.url && (
                  <div className='danhSachHang__admin__item'>
                    <div className='danhSachHang__admin__name'>
                      <h3 className='tittleHang'>{item.tenSanPham}</h3>
                      <img src={item.url} />
                    </div>
                    <div className='productsCate__admin_image'>
                    </div>
                  </div>
                )}
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </>
  )
}

export default HangXuatKhoNhanVien;