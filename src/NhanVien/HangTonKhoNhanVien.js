import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Button, Form, Modal, Input, Image, Space, Select, DatePicker } from 'antd';
import { addDocument } from '../components/Service/AddDocument';
import { db } from '../components/firebase/config';
import { Col, Row } from 'antd';
import { deleteDocument } from '../components/Service/AddDocument';
import { AuthContext } from '../components/Context/AuthProvider';

function HangTonKhoNhanVien() {
  const { check, setCheck } =
    React.useContext(AuthContext);
  const [hangTonKho, sethangTonKho] = useState([]);

  const { user: { uid } } = useContext(AuthContext);

  const fetchHangTonKho = () => {
    const messagesRef = db.collection("HangTonKho");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const productsData = querySnapshot.docs.map((doc) => doc.data());

        sethangTonKho(productsData)
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const memoizedFetchHangTonKho = useMemo(() => fetchHangTonKho, [hangTonKho || check]);

  useEffect(() => {
    memoizedFetchHangTonKho();
  }, [hangTonKho.length]);

  return (
    <>
      <div className='danhSachHang'>
        <h2 className='tittle'>Tất cả hàng tồn kho</h2>
        <div className='danhSachHang__admin'>
          <Row>
            {hangTonKho.map((item) => (
              <Col key={item.id} span="8">
                {item.url && (
                  <div className='danhSachHang__admin__item'>
                    <div className='danhSachHang__admin__name'>
                      <h3 className='tittleHang'>{item.tenSanPham}</h3>
                      <img src={item.url} />
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

export default HangTonKhoNhanVien;