/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import { Layout, Row, Col, Button } from 'antd';
import { Auth, Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsExports from '../aws-exports';
 
const Homepage = ({}) => {
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const { Header, Footer, Sider, Content } = Layout;

    async function getUser () { 
        const user = await Auth.currentAuthenticatedUser();
        return user
    }

    const goToDashboard = () => {
        navigate("/Dashboard");
    };
    
    if(getUser){
        return (
            <>
            <Layout className="layout">
                <Header style={{ backgroundColor: '#b6d7a8' }}>
                    <Navbar />
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <div className="site-layout-content">
                        <Button type="primary" onClick={goToDashboard} >
                            Click to Travel to Dashboard
                        </Button>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Luis Sergovia Fan Club ©2022 Created by James Redding & Maxwell Ryan</Footer>
            </Layout>
            </>
        )
    }
    else{
        return (
            <>
            <Layout className="layout">
                <Header style={{ backgroundColor: '#b6d7a8' }}>
                    <Navbar />
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <div className="site-layout-content">
                        <p></p>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Luis Sergovia Fan Club ©2022 Created by James Redding & Maxwell Ryan</Footer>
            </Layout>
            </>
        )
    }
}
 
export default Homepage