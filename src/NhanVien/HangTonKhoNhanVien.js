import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Button, Form, Modal, Input, Space, Alert, Table } from 'antd';
import { db } from '../components/firebase/config';
import { Col, Row } from 'antd';
import { addDocument } from '../components/Service/AddDocument';
import { deleteDocument } from '../components/Service/AddDocument';
import "./QuanLyHangTonKho.css"
import { AuthContext } from '../components/Context/AuthProvider';

function HangTonKhoNhanVien() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedProduct1, setSelectedProduct1] = useState([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isXuatKhoModalOpen, setIsXuatKhoModalOpen] = useState(false);
  const [isSoLuongXuatKhoModalOpen, setIsSoLuongXuatKhoModalOpen] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const [hangTonKho, setHangTonKho] = useState([]);
  const [form] = Form.useForm();
  const [formSoLuongXuatKho] = Form.useForm();
  const [isAddProductVisible, setIsAddProductVisible] = useState(false);
  const { user: { uid } } = useContext(AuthContext);

  const fetchHangTonKhoData = () => {
    const messagesRef = db.collection("HangTonKho");
    messagesRef
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => doc.data());
        setHangTonKho(data);

        const a = [];
        data.map(item => {
          if (item.ngayNhapHang) {
            a.push(item);
          }
        })

        setHangTonKho(a);
        console.log(hangTonKho);
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const memoizedfetchHangTonKhoData = useMemo(() => fetchHangTonKhoData, [hangTonKho]);

  useEffect(() => {
    memoizedfetchHangTonKhoData();
  }, [hangTonKho.length]);

  const handleOk = () => {
    form.validateFields()
      .then((values) => {
        const newProductData = {
          ...form.getFieldsValue(),
        };

        // Kiểm tra sự tồn tại của sản phẩm trong Firestore
        const existingProductRef = db.collection("HangTonKho").where('maSanPham', '==', newProductData.maSanPham).limit(1);

        existingProductRef.get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              const firstDoc = querySnapshot.docs[0];
              if (firstDoc) {
                const existingProduct = firstDoc.data();
                existingProduct.soLuong = (
                  (parseInt(existingProduct.soLuong, 10) || 0) +
                  (parseInt(newProductData.soLuong, 10) || 0)
                ).toString();

                firstDoc.ref.update({
                  soLuong: existingProduct.soLuong,
                })
                  .then(() => {
                    console.log("Document successfully updated!");
                    memoizedfetchHangTonKhoData();
                    form.resetFields();
                    setIsAddProductVisible(false);
                  })
                  .catch((error) => {
                    console.error("Error updating document: ", error);
                  });
              } else {
                console.error("Error: Empty document array.");
              }
            } else {
              // Không có tài liệu nào tồn tại, thêm mới vào Firestore
              addDocument("HangTonKho", newProductData);
              console.log("Không tồn tại");
              memoizedfetchHangTonKhoData();
              form.resetFields();
              setIsAddProductVisible(false);
            }
          })
      })
      .catch((error) => {
        console.error("Error checking document existence:", error);
      });

  }


  const handleCancel = () => {
    form.resetFields();
    setIsAddProductVisible(false);
  };

  const addProduct = () => {
    setIsAddProductVisible(true);
  }

  const handleDeleteDoc = (item) => {
    setIsDeleteModalOpen(true);
    setSelectedProduct1(item);
  };

  const handleOkDelete = () => {
    setLoading(true);
    const batch = db.batch();

    deleteDocument("HangTonKho", selectedProduct1.createdAt);
    setLoading(false);
    setIsDeleteModalOpen(false);
    memoizedfetchHangTonKhoData();
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  //  

  const handleXuatKhoDoc = (item) => {
    setIsSoLuongXuatKhoModalOpen(true);
    setSelectedProduct(item);
    console.log(selectedProduct)
  };

  const handleOkXuatKho = () => {
    setLoading(true);
    const { soLuongXuatKho } = formSoLuongXuatKho.getFieldsValue();

    const existingProductRef = db.collection("HangTonKho").where('maSanPham', '==', selectedProduct.maSanPham).limit(1);

    const newProductData = {
      ...form.getFieldsValue(),
    };

    existingProductRef.get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          console.log("Ton tai")
          const firstDoc = querySnapshot.docs[0];
          if (firstDoc) {
            const existingProduct = firstDoc.data();

            var sl = (parseInt(existingProduct.soLuong, 10) || 0) -
              (parseInt(soLuongXuatKho, 10) || 0);

            if (sl >= 0) {
              existingProduct.soLuong = (
                (parseInt(existingProduct.soLuong, 10) || 0) -
                (parseInt(soLuongXuatKho, 10) || 0)
              ).toString();

              if (sl > 0) {
                firstDoc.ref.update({
                  soLuong: existingProduct.soLuong,
                })
                  .then(() => {
                    console.log("Hoan thanh");
                    addDocument("HangXuatKho", {
                      ...selectedProduct,
                      soLuong: soLuongXuatKho,
                    })
                    memoizedfetchHangTonKhoData();
                    formSoLuongXuatKho.resetFields();
                    setIsSoLuongXuatKhoModalOpen(false);
                    setLoading(false);
                    setShowErrorAlert(false);
                  })
                  .catch((error) => {
                    console.error("Error updating document: ", error);
                  });
              } else {
                addDocument("HangXuatKho", {
                  ...selectedProduct,
                  soLuongXuatKho,
                })
                deleteDocument("HangTonKho", selectedProduct.createdAt);
                memoizedfetchHangTonKhoData();
                formSoLuongXuatKho.resetFields();
                setIsSoLuongXuatKhoModalOpen(false);
                setShowErrorAlert(false);
              }
            } else if (sl < 0) {
              setLoading(false);
              setShowErrorAlert(true);
            }

          } else {
            console.error("Error: Empty document array.");
          }
        }
      })
  };

  const handleCancelXuatKho = () => {
    setIsSoLuongXuatKhoModalOpen(false);
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
      title: 'Ngày nhập',
      dataIndex: 'ngayNhapHang',
      width: 300,
    },
    {
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
      <div className='danhSachHang'>
        <Button className='btnThemHang' onClick={addProduct}><span>Thêm hàng</span></Button>
        <Modal
          title='Tạo hàng'
          visible={isAddProductVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form form={form} layout='vertical'>
            {/* Form fields */}
            <Form.Item name="maSanPham" label="Mã hàng"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mã hàng!',
                },
              ]}>
              <Input placeholder='Nhập mã hàng' required />
            </Form.Item>
            <Form.Item name="tenSanPham" label="Tên hàng"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên hàng!',
                },
              ]}>
              <Input placeholder='Nhập tên hàng' required />
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
            <Form.Item name="ngayNhapHang" label="Ngày nhập hàng"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập ngày nhập!',
                },
              ]}>
              <Input placeholder='Nhập ngày nhập hàng' required />
            </Form.Item>
            <Form.Item name="donViTinh" label="Đơn vị tính"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập đơn vị tính!',
                },
              ]}>
              <Input placeholder='Nhập đơn vị tính' required />
            </Form.Item>
            <Form.Item name="nhaCungCap" label="Nhà cung cấp"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập nhà cung cấp!',
                },
              ]}>
              <Input placeholder='Nhập nhà cung cấp' required />
            </Form.Item>
            <Form.Item name="giaNHap" label="Giá nhập"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập giá nhập hàng!',
                },
              ]}>
              <Input placeholder='Nhập giá nhập hàng' required />
            </Form.Item>
            <Form.Item name="giaBan" label="Giá bán"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập giá bán!',
                },
              ]}>
              <Input placeholder='Nhập giá bán' required />
            </Form.Item>
            <Form.Item name="viTriKho" label="Vị trí"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập vị trí!',
                },
              ]}>
              <Input placeholder='Nhập vị trí' required />
            </Form.Item>
            <Form.Item name="tinhTrangHang" label="Tình trạng hàng"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tình trạng hàng!',
                },
              ]}>
              <Input placeholder='Nhập tình trạng hàng' required />
            </Form.Item>
          </Form>
        </Modal >
        <h2 className='tittle'>Tất cả hàng tồn kho</h2>
        <div className='danhSachHang__admin'>
          <Row>
            {hangTonKho.map((item) => (
              <Col key={item.id} span="8">
                <Modal
                  title="Thông báo xóa!"
                  onOk={() => handleOkDelete(item.createdAt)}
                  onCancel={handleCancelDelete}
                  visible={isDeleteModalOpen}
                  confirmLoading={loading}
                  footer={[
                    <Button key="back" onClick={handleCancelDelete}>
                      Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleOkDelete}>
                      Đồng ý
                    </Button>,
                  ]}
                >
                </Modal>
                <Modal
                  title="Thông báo xuất kho!"
                  onOk={() => handleOkXuatKho(item.createdAt)}
                  onCancel={handleCancelXuatKho}
                  visible={isSoLuongXuatKhoModalOpen}
                  confirmLoading={loading}
                  footer={[
                    <Button key="back" onClick={handleCancelXuatKho}>
                      Hủy
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleOkXuatKho}>
                      Đồng ý
                    </Button>,
                  ]}
                >
                  <Form form={formSoLuongXuatKho} layout='vertical'>
                    <Form.Item name="soLuongXuatKho" label="Số lượng:"
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập số lượng hàng xuất kho!',
                        },
                      ]}>
                      <Input placeholder='Nhập số lượng hàng xuất kho' required />
                    </Form.Item>

                    {showErrorAlert && <Space Space direction="vertical" style={{ width: '100%' }
                    }>
                      <Alert message="Số lượng xuất kho không hợp lệ!" type="error" showIcon />
                    </Space>}
                  </Form>
                </Modal>

              </Col>

            ))}

            <Col key="1" span="8">
              <Table className='table-hangtonkho' rowSelection={rowSelection} columns={columns}
                scroll={{
                  x: 900,
                }} dataSource={hangTonKho}
                pagination={{ pageSize: 5, size: 'small', }} style={{ display: 'flex' }} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
}

export default HangTonKhoNhanVien;