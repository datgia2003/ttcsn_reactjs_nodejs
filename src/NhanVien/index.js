import React from 'react';
import { Row, Col } from 'antd';
import Sidebar from './sidebar';
import { Outlet } from 'react-router-dom';

export default function NhanVien() {
  return (
    <div>

      <Row>
        <Col span={6}>
          <Sidebar />
        </Col>
        <Col span={18}>
          <Outlet />
        </Col>
      </Row>
    </div>
  );
}