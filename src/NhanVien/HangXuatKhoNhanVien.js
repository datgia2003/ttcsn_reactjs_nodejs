import React, { useEffect, useState, useMemo } from 'react';
import { Button, Form, Modal, Input, Space, Alert, Table } from 'antd';
import { db } from '../components/firebase/config';
import { Col, Row } from 'antd';
import { deleteDocument } from '../components/Service/AddDocument';
import "./QuanLyHangTonKho.css"
import { AuthContext } from '../components/Context/AuthProvider';
import { useNavigate } from 'react-router-dom';

function HangXuatKhoNhanVien() {
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [formSoLuongXuatKho] = Form.useForm();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { hangXuatKho, setHangXuatKho, soLuongXuatKho, setSoLuongXuatKho
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
          <Button type="primary" className='btnXuatKho' danger onClick={() => handleXuatHangDoc(record)}>Xuất hàng</Button>
          <Button type="primary" danger onClick={() => handleDeleteDoc(record)}>Xóa</Button>
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

    // deleteDocument("HangXuatKho", selectedProduct.createdAt);

    const { soLuongXuatKho } = formSoLuongXuatKho.getFieldsValue();
    console.log("item: " + selectedProduct.soLuong)
    if ((parseInt(selectedProduct.soLuong, 10) || 0) >= (parseInt(soLuongXuatKho, 10) || 0)) {
      setSoLuongXuatKho(soLuongXuatKho);
      setLoading(false);
      setIsXuatHangModalOpen(false);
      navigate('/admin/xuat-hang')
      memoizedfetchHangXuatKhoData();
      setDonHang(selectedProduct)
    } else {
      setLoading(false);
      setShowErrorAlert(true)
    }
  };

  const handleCancelXuatHang = () => {
    setIsXuatHangModalOpen(false);
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