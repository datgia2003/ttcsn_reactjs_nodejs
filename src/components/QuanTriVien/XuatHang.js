import React, { useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../Context/AuthProvider';
import { Button, Modal, Table, Form, Alert, Input, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { deleteDocument } from '../Service/AddDocument';
import { db } from '../firebase/config';
import "./showProductDetail.css"

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
      <div className='product__content'>
        <div className='product__content--image'>
          <img src={donHang.url} />
        </div>
        <div className='product__content--price'>
          <h2 className='product__content--name'>Thông tin hàng tồn kho:</h2>
          <h3>Mã sản phẩm: <span>{donHang.maSanPham}</span></h3>
          <h3>Tên sản phẩm: <span>{donHang.tenSanPham}</span></h3>
          <h3>Số lượng: <span>{donHang.soLuong}</span></h3>
          <h3>Số lượng: <span>{donHang.ngayNhap}</span></h3>
          <h3>Số lượng: <span>{donHang.nhaCungCap}</span></h3>
          <h3>Giá nhập: <span>{donHang.giaNhap}</span></h3>
          <h3>Giá bán: <span>{donHang.giaBan}</span></h3>
          <h3>Đơn vị tính: <span>{donHang.donViTinh}</span></h3>
          <h3>Vị trí: <span>{donHang.viTriKho}</span></h3>

          <h3>Tình trạng hàng: <span>{donHang.tinhTrangHang}</span></h3>
          <Button type="primary" className='btnXuatKho' danger onClick={() => handleXuatHangDoc()}>Xuất hàng</Button>
        </div>
      </div >

    </>
  )
}
export default XuatHangAdmin;