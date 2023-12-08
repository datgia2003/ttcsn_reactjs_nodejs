import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Button, Form, Modal, Table, Image, Space, Select, DatePicker } from 'antd';
import { db } from '../firebase/config';
import { Col, Row } from 'antd';
import { deleteDocument } from '../Service/AddDocument';
import "./QuanLyHangTonKho.css"
import { AuthContext } from '../Context/AuthProvider';

function HangXuatKhoQuanTriVien() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { lichKham, setlichKham, check, setCheck } =
    React.useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);

  const [productsCate, setProductsCate] = useState([]);
  const [DanhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [form] = Form.useForm();
  const [isAddProductVisible, setIsAddProductVisible] = useState(false);
  const { user: { uid } } = useContext(AuthContext);

  const fetchMessagesData = () => {
    const messagesRef = db.collection("HangXuatKho");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const productsData = querySnapshot.docs
          .filter((doc) => doc.id !== "dummyDoc")
          .map((doc) => doc.data());

        setProductsCate(productsData);
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const fetchTenNhanVien = () => {
    const messagesRef = db.collection("HangXuatKho");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const productsData = querySnapshot.docs.map((doc) => doc.data());
        setlichKham(productsData);
        setCheck(!check);
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const memoizedFetchMessagesData = useMemo(() => fetchMessagesData, [productsCate]);
  const memoizedFetchTaiKhoanNhanVien = useMemo(() => fetchTenNhanVien, [lichKham || check]);

  useEffect(() => {
    // Fetch data from Firestore when the component mounts
    memoizedFetchMessagesData();
    memoizedFetchTaiKhoanNhanVien();

  }, [productsCate.length || lichKham.length || check]);

  const handleDeleteDoc = (item) => {
    setIsModalOpen(true);
    setSelectedProduct(item);
  };

  const handleOkDelete = () => {
    setLoading(true);
    const batch = db.batch();

    deleteDocument("HangXuatKho", selectedProduct.createdAt);

    setLoading(false);
    setIsModalOpen(false);
    memoizedFetchMessagesData();
    memoizedFetchTaiKhoanNhanVien();
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
  };


  const config = {
    rules: [
      {
        type: 'object',
        required: true,
        message: 'Vui lòng chọn ngày!',
      },
    ],
  };

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };


  const columns = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'maSanPham',
      width: 350,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'tenSanPham',
      width: 500,
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      width: 200,
    },
    {
      title: 'Ngày nhập kho',
      dataIndex: 'ngayNhapKho',
      width: 300,
    }, {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div className='two-button'>
          <Button type="primary" danger onClick={() => handleDeleteDoc(record)}>Xóa</Button>
        </div>
      ),
      width: 220,
    },
  ];

  return (
    <>

      <div className='AllLichTrinh'>
        <h2 className='tittle'>Tất cả hàng xuất kho</h2>
        <div className='productsCate__admin'>
          <Row>
            {productsCate.map((item) => (
              <Col key={item.id} span="8">
                <Modal
                  title="Thông báo!"
                  onOk={() => handleOkDelete(item.createdAt)}
                  onCancel={handleCancelDelete}
                  visible={isModalOpen}
                  confirmLoading={loading}
                  footer={[
                    <Button key="back" onClick={handleCancelDelete}>
                      Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleOkDelete}>
                      Đồng ý
                    </Button>,
                  ]}
                ></Modal>
              </Col>

            ))}
            <Col span="8">
              <Table className='table-hangtonkho' rowSelection={rowSelection} columns={columns}
                scroll={{
                  x: 900,
                }} dataSource={productsCate}
                pagination={{ pageSize: 5, size: 'small', }} style={{ display: 'flex' }} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
}

export default HangXuatKhoQuanTriVien;