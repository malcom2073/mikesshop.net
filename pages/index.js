import Head from 'next/head'
//import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Date from '../components/date'
import { create } from 'apisauce'
import MSNavbar from '../components/navbar'
import {Container, Row, Col} from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import MSAdminSideBar from '../components/adminsidebar'
import { Layout, Menu, Breadcrumb } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import pageLayout from '../components/pagelayout'
import Router from 'next/router'
class IndexPage extends React.Component {
    constructor(props)
    {
        super(props);
    }
    componentDidMount = () => {
        //Router.push('/blog');
    }
    
    render() {

                
        return (
            <>

                This is some content
            </>
        )
    }

}
export default pageLayout(IndexPage);
