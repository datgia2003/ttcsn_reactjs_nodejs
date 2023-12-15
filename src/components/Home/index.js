import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Row, Col } from 'antd';
import "./styles.css"

export default function Home() {
  const navigate = useNavigate([]);

  const handleHome = () => {
    navigate("/");
  }
  const handleLogin = () => {
    navigate("/login");
  }

  return (
    <div>
      <header className='header'>
        <div className='header-main'>
          <ul className='menu'>
            <li onClick={handleHome}>Trang chủ</li>
            <li className='buttonLogin' onClick={handleLogin}>Đăng nhập</li>
          </ul>
        </div>
      </header>

      <Row>
        <Col span={24}>
          <Outlet />
        </Col>
      </Row>
    </div >
  );

}