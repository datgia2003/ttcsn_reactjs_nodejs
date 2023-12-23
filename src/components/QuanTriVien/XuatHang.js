import React, { useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../Context/AuthProvider';
import { Button, Modal, Table, Form, Alert, Input, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { deleteDocument } from '../Service/AddDocument';
import { db } from '../firebase/config';

function XuatHangAdmin() {
  const { donHang, soLuongXuatKho } =
    React.useContext(AuthContext);
  const [isXuatHangModalOpen, setIsXuatHangModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formSoLuongXuatKho] = Form.useForm();
  const navigate = useNavigate();

  const fetchHangXuatKhoData = () => {
    console.log(donHang)
    console.log("So luong: " + `${donHang.soLuong}`)
    console.log("Xuat kho: " + soLuongXuatKho)
  }

  useEffect(() => {
    fetchHangXuatKhoData()
  }, [donHang.length]);

  const handleXuatHangDoc = () => {
    setIsXuatHangModalOpen(true);
  }

  const handleOkXuatHang = () => {
    setLoading(true);

    if ((parseInt(donHang.soLuong, 10) || 0) > (parseInt(soLuongXuatKho, 10) || 0)) {
      setLoading(false);
      setIsXuatHangModalOpen(false);

      const existingProductRef = db.collection("HangXuatKho").where('maSanPham', '==', donHang.maSanPham).limit(1);
      existingProductRef.get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const firstDoc = querySnapshot.docs[0];
            if (firstDoc) {
              const existingProduct = firstDoc.data();
              existingProduct.soLuong = (
                (parseInt(existingProduct.soLuong, 10) || 0) -
                (parseInt(soLuongXuatKho, 10) || 0)
              ).toString();

              firstDoc.ref.update({
                soLuong: existingProduct.soLuong,
              })
                .then(() => {
                  console.log("Document successfully updated!");
                })
                .catch((error) => {
                  console.error("Error updating document: ", error);
                });
            } else {
              console.error("Error: Empty document array.");
            }
          }
        })

      navigate('/admin/hang-xuat-kho')
    } else if ((parseInt(donHang.soLuong, 10) || 0) == (parseInt(soLuongXuatKho, 10) || 0)) {
      deleteDocument("HangXuatKho", donHang.createdAt);
      setLoading(false);
      navigate('/admin/hang-xuat-kho')
    }
  };

  const handleCancelXuatHang = () => {
    setIsXuatHangModalOpen(false);
  };

  return (
    <>
      <Modal
        title="Thông báo xuất hàng!"
        onOk={() => handleOkXuatHang(donHang.createdAt)}
        onCancel={handleCancelXuatHang}
        visible={isXuatHangModalOpen}
        confirmLoading={loading}
        footer={[
          <Button key="back" onClick={handleCancelXuatHang}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleOkXuatHang}>
            Đồng ý
          </Button>,
        ]}
      ></Modal>
      <div>
        <img src={donHang.url} />
        <p>Mã sản phẩm: {donHang.maSanPham}</p>
        <p>Tên sản phẩm: {donHang.tenSanPham}</p>
        <p>Số lượng: {soLuongXuatKho}</p>
        <p>Giá bán: {donHang.giaBan}</p>
        <p>Đơn vị tính: {donHang.donViTinh}</p>
        <p>Tình trạng hàng: {donHang.tinhTrangHang}</p>

        <Button type="primary" className='btnXuatKho' danger onClick={() => handleXuatHangDoc()}>Xuất hàng</Button>
      </div>
    </>
  )
}
export default XuatHangAdmin;