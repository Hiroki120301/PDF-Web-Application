/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import { Layout, Card, Row, Col } from 'antd';
import '../CSS/HomepageStyles.css';
import JamesPic from '../images/james.jpg';
import MaxPic from '../images/max.jpg';
import KerryPic from '../images/kerry.jpg';
import TigerPic from '../images/tiger.jpg';
import HirokiPic from '../images/hiroki.jpg';
import KierenPic from '../images/kieren.jpg';
 
const Homepage = ({}) => {
    const navigate = useNavigate();
    const { Header, Footer, Content } = Layout;

    const goToDashboard = () => {
        navigate("/Dashboard");
    };

    return (
        <>
        <Layout style={{minHeight:"100vh"}}>
        <Header style={{ backgroundColor: '#b6d7a8' }}>
                <Navbar />
            </Header>
            <Content>
                <div style={{ height: '85vh' }}>
                    <div className='hero-image'>
                        <p className='hero-text-title'>Welcome to the Homepage</p>
                        <button className='hero-button' onClick={goToDashboard} >
                            Travel to Dashboard
                        </button>
                    </div>
                </div>
                
                <div className='hero-section' style={{ backgroundColor: '#88BC9E' }}>
                    <p className='hero-section-title'>Meet the Team</p>
                    <Row gutter={[16, 24]}>
                    <Col span={8}>
                        <Card 
                        hoverable 
                        title="James Redding"
                        cover={
                            <img
                            style={{ height: "30vh", objectFit: "cover" }}
                              alt="example"
                              src={JamesPic}
                            />
                          }>
                        Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                        hoverable 
                        title="Maxwell Ryan"
                        cover={
                            <img
                            style={{ height: "30vh", objectFit: "cover" }}
                              alt="example"
                              src={MaxPic}
                            />
                          }>
                        Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                        hoverable 
                        title="Kerry Nettles"
                        cover={
                            <img
                            style={{ height: "30vh", objectFit: "cover" }}
                              alt="example"
                              src={KerryPic}
                            />
                          }>
                        Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                        hoverable 
                        title="Tiger Tian"
                        cover={
                            <img
                            style={{ height: "30vh", objectFit: "cover" }}
                              alt="example"
                              src={TigerPic}
                            />
                          }>
                        Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                        hoverable 
                        title="Hiroki Nakayama"
                        cover={
                            <img
                            style={{ height: "30vh", objectFit: "cover" }}
                              alt="example"
                              src={HirokiPic}
                            />
                          }>
                        Card content
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card 
                        hoverable 
                        title="Kieran Williams"
                        cover={
                            <img
                            style={{ height: "30vh", objectFit: "cover" }}
                              alt="example"
                              src={KierenPic}
                            />
                          }>
                        Card content
                        </Card>
                    </Col>
                    </Row>
                </div>
            </Content>
            <Footer style={{ backgroundColor: '#b6d7a8', textAlign: 'center' }}>Luis Segovia Fan Club ©2022 Created by James Redding, Maxwell Ryan, Kerry Nettles, Tiger Tian, Hiroki Nakayama, & Kieran Williams</Footer>
        </Layout>
        </>
    )
}
 
export default Homepage