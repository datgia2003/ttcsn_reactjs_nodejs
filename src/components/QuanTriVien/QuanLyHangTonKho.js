import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Button, Form, Modal, Input, Space, Select, Table } from 'antd';
import { db } from '../firebase/config';
import { Col, Row } from 'antd';
import { addDocument } from '../Service/AddDocument';
import { deleteDocument } from '../Service/AddDocument';
import "./QuanLyHangTonKho.css"
import { AuthContext } from '../Context/AuthProvider';

const { Option } = Select;



function HangTonKhoQuanTriVien() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);

  const { cate } = useContext(AuthContext);
  const [productsCate, setProductsCate] = useState([]);
  const [DanhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [form] = Form.useForm();
  const [isAddProductVisible, setIsAddProductVisible] = useState(false);
  const { user: { uid } } = useContext(AuthContext);

  const fetchMessagesData = () => {
    const messagesRef = db.collection("HangTonKho");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const productsData = querySnapshot.docs.map((doc) => doc.data());
        setProductsCate(productsData);
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const fetchTenNhanVien = () => {
    const messagesRef = db.collection("TaiKhoanNhanVien");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const productsData = querySnapshot.docs.map((doc) => doc.data());
        setDanhSachNhanVien(productsData);
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const memoizedFetchMessagesData = useMemo(() => fetchMessagesData, [productsCate]);
  const memoizedFetchTaiKhoanNhanVien = useMemo(() => fetchTenNhanVien, [DanhSachNhanVien]);

  useEffect(() => {
    // Fetch data from Firestore when the component mounts
    memoizedFetchMessagesData();
    memoizedFetchTaiKhoanNhanVien();
  }, [productsCate.length]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Tháng bắt đầu từ 0
        const currentDay = currentDate.getDate();

        const ngayHienTai = `${currentDay}/${currentMonth}/${currentYear}`;
        const newProductData = {
          ...form.getFieldsValue(),
          ngayNhapKho: ngayHienTai
        };
        addDocument("HangTonKho", newProductData);
        // addDocument("products", { ...form.getFieldsValue(), category: [cate.category] });
        const categoryRef = db.collection("HangTonKho");
        memoizedFetchMessagesData();
        const categorySnapshot = categoryRef.get();
        if (!categorySnapshot.exists) {
          categoryRef.doc('dummyDoc').set({});
        }
        form.resetFields();
        setIsAddProductVisible(false);
      })
      .catch((errorInfo) => {
        console.error('Validation failed:', errorInfo);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsAddProductVisible(false);
  };

  const addProduct = () => {
    setIsAddProductVisible(true);
  }

  const handleDeleteDoc = (item) => {
    setIsModalOpen(true);
    setSelectedProduct(item);
  };

  const handleOkDelete = () => {
    setLoading(true);
    const batch = db.batch();

    deleteDocument("HangTonKho", selectedProduct.createdAt);
    setLoading(false);
    setIsModalOpen(false);
    memoizedFetchMessagesData();
    memoizedFetchTaiKhoanNhanVien();
  };


  const handleCancelDelete = () => {
    setIsModalOpen(false);
  };

  //  

  const handleXuatKhoDoc = (item) => {
    setIsModalOpen(true);
    setSelectedProduct(item);
  };

  const handleOkXuatKho = () => {
    setLoading(true);
    const batch = db.batch();

    addDocument("HangXuatKho", selectedProduct);
    deleteDocument("HangTonKho", selectedProduct.createdAt);
    // const categoryRef = db.collection(cate.category).doc(selectedProduct.createdAt);
    // batch.delete(categoryRef);

    // const productsRef = db.collection("products").doc(selectedProduct.createdAt);
    // batch.delete(productsRef);
    setLoading(false);
    setIsModalOpen(false);
    memoizedFetchMessagesData();
    memoizedFetchTaiKhoanNhanVien();
  };


  const handleCancelXuatKho = () => {
    setIsModalOpen(false);
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
          <Button className='btnXuatKho' type="primary" onClick={() => handleXuatKhoDoc(record)}>Xuất kho</Button>
          <Button type="primary" danger onClick={() => handleDeleteDoc(record)}>Xóa</Button>
        </div>
      ),
      width: 220,
    },
  ];

  return (
    <>
      <div className='AllLichTrinh'>
        <Button className='btnAddProductCate' onClick={addProduct}><span>Thêm hàng</span></Button>
        <Modal
          title='Tạo hàng'
          visible={isAddProductVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form form={form} layout='vertical'>
            {/* Form fields */}
            <Form.Item name="maSanPham" label="Mã sản phẩm"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mã sản phẩm!',
                },
              ]}>
              <Input placeholder='Nhập mã sản phẩm' required />
            </Form.Item>
            <Form.Item name="tenSanPham" label="Tên sản phẩm"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tênsản phẩm!',
                },
              ]}>
              <Input placeholder='Nhập tên sản phẩm' required />
            </Form.Item>
            <Form.Item name="soLuong" label="Số lượng"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập số lượng!',
                },
              ]}>
              <Input placeholder='Nhập số lượng sản phẩm' required />
            </Form.Item>

          </Form>
        </Modal >
        <h2 className='tittle'>Tất cả hàng tồn kho</h2>
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
                <Modal
                  title="Thông báo!"
                  onOk={() => handleOkXuatKho(item.createdAt)}
                  onCancel={handleCancelXuatKho}
                  visible={isModalOpen}
                  confirmLoading={loading}
                  footer={[
                    <Button key="back" onClick={handleCancelXuatKho}>
                      Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleOkXuatKho}>
                      Đồng ý
                    </Button>,
                  ]}
                ></Modal>

              </Col>

            ))}
            <Col key="1" span="8">
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

export default HangTonKhoQuanTriVien;