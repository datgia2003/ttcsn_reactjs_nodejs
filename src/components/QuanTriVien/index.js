import React from 'react';
import { Row, Col } from 'antd';
import { Outlet } from 'react-router-dom';
import SidebarQuanTriVien from "./Sidebar"

export default function QuanTriVien() {
  return (
    <div>

      <Row>
        <Col span={6}>
          <SidebarQuanTriVien />
        </Col>
        <Col span={18}>
          <Outlet />
        </Col>
      </Row>
    </div>
  );
}