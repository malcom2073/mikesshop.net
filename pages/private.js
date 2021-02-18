import {Container, Row, Col} from 'react-bootstrap';
import MSNavbar from '../components/navbar'
//import {getUserNavbar} from '../components/navbar'
//import MSNavBar from '../components/navbar'
import LoginForm from '../components/loginform'
import nextCookie from 'next-cookies'
import privateRoute from "../components/privateroute";
import { render } from 'react-dom';
import pageLayout from '../components/pagelayout'
import dynamic from 'next/dynamic'
import myDataProvider from '../components/dataprovider'
import jsonServerProvider from 'ra-data-json-server';
const Resource = dynamic(() => import("react-admin").then((mod)=>mod.Resource), { ssr: false });
const ListGuesser = dynamic(() => import("react-admin").then((mod)=>mod.ListGuesser), { ssr: false });
const EditGuesser = dynamic(() => import("react-admin").then((mod)=>mod.EditGuesser), { ssr: false });
const Admin = dynamic(() => import("react-admin").then((mod)=>mod.Admin), { ssr: false });


class Private extends React.Component {
  constructor(props) {
    super(props);
//    this.dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
      this.dataProvider = myDataProvider;
  }
  render() {
  return (
  <>
          <Admin dataProvider={this.dataProvider}>
                <Resource name="posts" list={ListGuesser} edit={EditGuesser} />
                <Resource name="users" list={ListGuesser} edit={EditGuesser} />
                </Admin>
  </>
  )
  }
  
}

export default privateRoute(pageLayout(Private));
