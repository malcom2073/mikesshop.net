import { create } from 'apisauce'
import nextCookie from 'next-cookies'
import { render } from 'react-dom';
import pageLayout from '../../components/pagelayout'
import privateRoute from '../../components/privateroute'
import { AuthToken } from '../../services/auth_token'
import Router from 'next/router'
import Forum_Index from '../../components/forums'
import { Row,Col, Form, Input, Button, Checkbox,List } from 'antd';
import remark from 'remark'
import gfm from 'remark-gfm'
import html from 'remark-html'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'  
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
//import { coy } from "react-syntax-highlighter/dist/styles/prism";
import {coy} from "react-syntax-highlighter/dist/cjs/styles/prism/prism"
var toc = require('markdown-toc-unlazy');
var uslug = require('uslug');
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
import { Typography } from 'antd';

const { Title, Text } = Typography;
const generateId = (() => {
    let i = 0;
    return (prefix = '') => {
      i += 1;
      return `${prefix}-${i}`;
    };
  })();
const renderers = {
    heading: function Heading(props) {
        // This only works for raw text headers
        // TODO: Make it work for dynamic text headers?
        var slug = "";
        console.log(props);
        if (props.children.length > 0) {
            var childtext = props.children[0].props.children
            if (typeof(childtext) == "string") {
                slug = uslug(childtext);
            }
        }
        
        return <Title id={slug} level={props.level}>{props.children}</Title>;
    },
    // TODO: Look into properly formatting this sometime?
    /*list: function MakeList(props) {
        return <List bordered>{props.children}</List>
    },  
    listItem: function MakeListItem(props) {
        return <List.Item>{props.children}</List.Item>
    },*/
    inlineCode: function makeInlineCode(props) {
        return  <Text code>{props.children}</Text>
    },
    code: function makeCodeBlock(props) {
        return <SyntaxHighlighter language={props.language} style={coy}>{props.value}</SyntaxHighlighter>
    },
    blockquote: function makeBlockQuote(props) {
        return <Text type="secondary">{props.children}</Text>
    }
};
class BlogView extends React.Component {
    constructor({query}) {
        super({query});
    }
    componentDidMount = async () => {
        var token = AuthToken.fromNext();
        var headers = { Accept: 'application/vnd.github.v3+json'};
        if (token) {
            headers.Authorization = token.authorizationString();
        }
        const api = create({
            baseURL: process.env.REACT_APP_MSAPI_ENDPOINT,
            headers: headers,
            });
        const response = await api.get('/api/blog/getPost',{'postid' : this.props.query.slug});
        //console.log(response);
        if (response.problem) {
            switch (response.problem) {
                case 'CLIENT_ERROR':
                if (response.status == 401)
                {
                    alert('Invalid credentials');
                    return 
                    //Bad authentication!
                }
                break;
                default:
                    break;
            }
            alert('Unknown error');
        }
        
        var toccontent = toc(response.data.data.content);
        //console.log(toccontent);
        var i;
        var currlevel = 0;
        var textoutput = "\n";
        var prefixlist = [];
        prefixlist.push(1);
        var currlevelindex = -1;
        //textoutput = `\`\`\`\n`;
        for (i = 0; i < toccontent.json.length; i++) {
            var newlvl = (toccontent.json[i].lvl - toccontent.highest)
            //console.log("NewLvl: " + newlvl);
            //console.log("Currlvl: " + currlevelindex);
            if (newlvl > currlevel) {
                prefixlist.push(currlevelindex)
                //console.log("PrefixList Push");
                currlevel = newlvl;
                currlevelindex = 0;
            }
            else if (newlvl < currlevel) {
                currlevelindex = prefixlist.pop();
                currlevel = newlvl
//                currlevelindex = 1;
                currlevelindex++;
            }
            else {
                currlevelindex++;
            }
            var ii = 0;
            var spacing = ""
            var numbers = ""
            //textoutput += prefixlist[0]+1 + "."
            for (ii=0;ii<prefixlist.length;ii++) {
                numbers += prefixlist[ii] + "."
                if (ii != 0) {
                    spacing += "  ";
                }
            }
            textoutput += spacing + "* " + numbers
            //console.log("PLength: " + prefixlist.length);
            textoutput += "" + currlevelindex;
            textoutput += " [" + toccontent.json[i].content +"](http://localhost:3000/blog/6#" + toccontent.json[i].slug + ")";
            textoutput += "\n"
            //text += cars[i] + "<br>";
        }
        //textoutput += `\n\`\`\``;
        //console.log(textoutput);
        //this.setState({title: response.data.data.title, blogdata: response.data.data.content.replace("__TOC__",textoutput),loaded:true})
        this.setState({title: response.data.data.title, blogdata: response.data.data.content.replace("__TOC__",toccontent.content),loaded:true})
    }
    
    render = () => {
        return (
        <>
            <Row justify="center">
            {(this.state && this.state.loaded ? (
                <Title>{this.state.title}</Title>
            ) : (
                <></>
            ))}    
            </Row>
            <Row justify="center">
                <Col span={10} >
                {(this.state && this.state.loaded ? (
                    <ReactMarkdown renderers={renderers} plugins={[gfm]} children={this.state.blogdata} />
                ) : (
                    <></>
                ))}
                </Col>
                {(this.props.auth && this.props.auth.isValid() ? (
                <Col span={1}>
                    <Link href={"/blog/edit/" + this.props.query.slug}>Edit Post</Link>
                </Col>
                ) : (
                    <></>
                ))}
            </Row>
        </>
        )
    }
}
export default pageLayout(BlogView);