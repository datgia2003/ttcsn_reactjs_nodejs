import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Button, Form, Modal, Input, Space, Alert, Table } from 'antd';
import { db } from '../components/firebase/config';
import { Col, Row } from 'antd';
import { deleteDocument } from '../components/Service/AddDocument';
import "./QuanLyHangTonKho2.css"
import { AuthContext } from '../components/Context/AuthProvider';
import { useNavigate } from 'react-router-dom';

function HangXuatKhoNhanVien() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState({});
  const [formSua] = Form.useForm();

  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [formSoLuongXuatKho] = Form.useForm();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { hangXuatKho, setHangXuatKho, setPathHangXuatKho, setSoLuongXuatKho
    , donHang, setDonHang } =
    React.useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isXuatHangModalOpen, setIsXuatHangModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedHangXuatKho, setSelectedHangXuatKho] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);



  const fetchHangXuatKhoData = () => {
    const hangXuatKho = db.collection("HangXuatKho");
    hangXuatKho
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs
          .filter((doc) => doc.id !== "dummyDoc")
          .map((doc) => doc.data());

        const a = [];
        data.map(item => {
          if (item.ngayNhapHang) {
            a.push(item);
          }
        })

        setHangXuatKho(a);
      })
      .catch((error) => {
        console.error('Error getting messages:', error);
      });
  };

  const memoizedfetchHangXuatKhoData = useMemo(() => fetchHangXuatKhoData, [hangXuatKho]);

  useEffect(() => {
    memoizedfetchHangXuatKhoData();
  }, [hangXuatKho.length]);

  const handleDeleteDoc = (item) => {
    setIsModalOpen(true);
    setSelectedHangXuatKho(item);
  };


  const handleOkDelete = () => {
    setLoading(true);
    const batch = db.batch();

    deleteDocument("HangXuatKho", selectedHangXuatKho.createdAt);
    setLoading(false);
    setIsModalOpen(false);
    memoizedfetchHangXuatKhoData();
  };

  const handleCancelDelete = () => {
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
      dataIndex: 'ngayNhapHang',
      width: 300,
    }, {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div className='two-button'>
          <Button type="primary" onClick={() => handleXemChiTiet(record)}>Xem chi tiết</Button>
          <Button type="primary" danger onClick={() => handleXuatHangDoc(record)}>Xuất hàng</Button>
          <Button type="primary" onClick={() => handleEditDoc(record)}>Sửa</Button>
          {/* <Button type="primary" danger onClick={() => handleDeleteDoc(record)}>Xóa</Button> */}
        </div>
      ),
      width: 220,
    },
  ];

  const handleXuatHangDoc = (item) => {
    setIsXuatHangModalOpen(true);
    setSelectedProduct(item);
  }

  const handleOkXuatHang = () => {
    setLoading(true);

    deleteDocument("HangXuatKho", selectedProduct.createdAt);

    setLoading(false);
    setIsXuatHangModalOpen(false);
    navigate('/staff/xuat-hang')
    memoizedfetchHangXuatKhoData();
    setDonHang(selectedProduct)
    setShowErrorAlert(true)
  }

  const handleCancelXuatHang = () => {
    setIsXuatHangModalOpen(false);
  };

  const handleXemChiTiet = (item) => {
    setPathHangXuatKho(item.tenSanPham)
    setDonHang(item)
    navigate(`/staff/hang-xuat-kho/${item.tenSanPham}`)
  }

  // sửa
  const handleEditDoc = (item) => {
    setIsEditModalOpen(true);
    setSelectedProductForEdit(item);
  };

  const handleOkEdit = () => {
    setLoading(true);
    formSua.validateFields()
      .then((values) => {
        const updatedProductData = {
          ...values,
        };

        const existingProductRef = db.collection("HangXuatKho").where('maSanPham', '==', selectedProductForEdit.maSanPham).limit(1);

        existingProductRef.get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              const firstDoc = querySnapshot.docs[0];
              if (firstDoc) {
                const existingProduct = firstDoc.data();

                // Update the existing product data
                firstDoc.ref.update(updatedProductData)
                  .then(() => {
                    console.log("Document successfully updated!");
                    memoizedfetchHangXuatKhoData();
                    formSua.setFieldsValue(updatedProductData);
                    setIsEditModalOpen(false);
                  })
                  .catch((error) => {
                    console.error("Error updating document: ", error);
                  });
              } else {
                console.error("Error: Empty document array.");
              }
            } else {
              console.log("Product not found");
            }
          })
      })
      .catch((error) => {
        console.error("Error checking document existence:", error);
      });
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
  };

  return (

    <>

      <div className='danhSachHang'>
        <h2 className='tittle'>Tất cả hàng xuất kho</h2>
        <div className='danhSachHang__admin'>
          <Row>
            {hangXuatKho.map((item) => (
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
                  title="Thông báo xuất hàng!"
                  onOk={() => handleOkXuatHang(item.createdAt)}
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
                >

                </Modal>
                <Modal
                  title='Sửa thông tin hàng'
                  visible={isEditModalOpen}
                  onOk={handleOkEdit}
                  onCancel={handleCancelEdit}
                >
                  <Form form={formSua} layout='vertical' initialValues={selectedProductForEdit}>
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
                    <Form.Item name="url" label="Url hình ảnh"
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng nhập url!',
                        },
                      ]}>
                      <Input placeholder='Nhập url' required />
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
                    <Form.Item name="giaNhap" label="Giá nhập"
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
                </Modal>
              </Col>

            ))}
            <Col span="8">
              <Table className='table-hangtonkho' rowSelection={rowSelection} columns={columns}
                scroll={{
                  x: 900,
                }} dataSource={hangXuatKho}
                pagination={{ pageSize: 5, size: 'small', }} style={{ display: 'flex' }} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
}

export default HangXuatKhoNhanVien;