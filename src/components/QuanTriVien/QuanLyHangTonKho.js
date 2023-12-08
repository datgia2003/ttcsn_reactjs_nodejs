import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Button, Form, Modal, Input, Image, Space, Select, DatePicker } from 'antd';
import { db } from '../firebase/config';
import { Col, Row } from 'antd';
import { addDocument } from '../Service/AddDocument';
import { deleteDocument } from '../Service/AddDocument';
import "./QuanLyHangTonKho.css"
import { AuthContext } from '../Context/AuthProvider';

const { Option } = Select;

function HangTonKhoQuanTriVien() {
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
  }, [productsCate.length || DanhSachNhanVien.length]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        const newProductData = {
          ...form.getFieldsValue(),
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
    // const categoryRef = db.collection(cate.category).doc(selectedProduct.createdAt);
    // batch.delete(categoryRef);

    // const productsRef = db.collection("products").doc(selectedProduct.createdAt);
    // batch.delete(productsRef);
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

            <Form.Item name="tenSanPham" label="Tên sản phẩm"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tênsản phẩm!',
                },
              ]}>
              <Input placeholder='Nhập tên sản phẩm' required />
            </Form.Item>
            <Form.Item name="url" label="Url sản phẩm"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập url sản phẩm!',
                },
              ]}>
              <Input placeholder='Nhập url sản phẩm' required />
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
                {item.url && (
                  <div className='productsCate__admin__item'>
                    <div className='productsCate__admin_name'>
                      <h3>{item.tenSanPham}</h3>
                      <img src={item.url} />
                    </div>
                    <button className='btn_delete' onClick={() => handleDeleteDoc(item)}>Xóa</button>
                    <button className='btn_xuatKho' onClick={() => handleXuatKhoDoc(item)}>Xuất kho</button>
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

export default HangTonKhoQuanTriVien;