import './App.css';
import axios from 'axios';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'


class App extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedFile: null,
            to: '',
            from: '',
            date: '',
            subject: '',
            content: "",
            fileParsed: false,
            inbox: []
        }
    }

    onFileSelect = (e) => {
        this.setState({
            selectedFile:e.target.files[0]
        })
    }

    onFileUpload = () => {
        // Create an object of formData
        const formData = new FormData();

        // Update the formData object with file data
        formData.append(
          "myFile",
          this.state.selectedFile,
        );


        // Upload File Data and save parsed message info
        axios.post("http://localhost:8080/api/message", formData)
        .then((res) => {
            if (res.status === 201) {
                console.log(res.data)
                this.setState(state => ({
                    to: res.data.to,
                    from: res.data.from,
                    subject: res.data.subject,
                    date: res.data.date,
                    content: res.data.body,
                    id: res.data.messageID,
                    fileParsed:true,
                    inbox: state.inbox.concat(res.data),
                    selectedFile: null
                }));

            }
            else {
                alert("Something went wrong! File could not be parsed")
            }
        })
    }

    renderEmailBody = () => {
        if (this.state.fileParsed) {
            return (
                //Render multipart content
                <div>
                {this.state.content.map(c => {
                    var key = Object.keys(c)[0];
                    if (key.includes("multipart/alternative")) {
                        //Do not display multipart
                        return null;
                    }
                    else if (key.includes("text/plain")) {
                        //Display Plain Text
                        return (
                            //For each new line in plain text, render in div for line break
                            <div>
                                {c[key].split("\n").map((i,k) => {
                                    //Create hyperlinks
                                    var url = ""
                                    if (i.match(/(?=https:\/\/).*(?=\s)/ig) !== null && i.match(/<http/ig) === null) {
                                        url = i.match(/(?=https:\/\/).*(?=\s)/ig)[0];
                                        return  <div key={k}><a href={url}> {i.replace(url, "") }</a><br/></div>
                                    }
                                    else if (i.match(/https:\/\/.*/ig) !== null && i.match(/<http/ig) === null) {
                                        url = i.match(/https:\/\/.*/ig)[0];
                                        return  <div key={k}><a href={url}> here</a><br/></div>
                                    }
                                    else if (i.match(/(?=http:\/\/).*(?=\s)/ig) !== null && i.match(/<http/ig) === null) {
                                        url = i.match(/(?=http:\/\/).*(?=\s)/ig)[0];
                                        return  <div key={k}><a href={url}> {i.replace(url, "") }</a><br/></div>
                                    }
                                    else if (i.match(/http:\/\/.*/ig) !== null && i.match(/<http/ig) === null) {
                                        url = i.match(/http:\/\/.*/ig)[0];
                                        return  <div key={k}><a href={url}> here</a><br/></div>
                                    }
                                    else {
                                        return <div key={k}>{i}<br/></div>;
                                    }
                                })}
                            </div>);
                    }
                    else if (key.includes("text/html")) {
                        return <div dangerouslySetInnerHTML={{__html: c[key]}}/>
                    }
                })}
                </div>
            )
        }
        else {
            return null;
        }
    }

    //Display Email Message Header Info (To, From, Date, Subject )
    renderEmail = () => {

        console.log(this.state.id)

        return (
            <div>
                <div className={'email-header'}>
                    <span style={{fontWeight:'bold'}}>Subject: </span> {this.state.subject}<br/>
                    <span style={{fontWeight:'bold'}}>To: </span> {this.state.to}<br/>
                    <span style={{fontWeight:'bold'}}>From: </span> {this.state.from}<br/>
                    <span style={{fontWeight:'bold'}}>On: </span> {this.state.date}<br/>
                </div>

                <div className={'email-body'}>
                    {this.renderEmailBody()}
                </div>

            </div>
        )
    }

    updateActiveMsg = (i) => {
        let active = this.state.inbox[i];

        this.setState(state => ({
            to: active.to,
            from: active.from,
            subject: active.subject,
            date: active.date,
            content: active.body,
            id: active.messageID,

        }));

    }

    renderInbox = () => {
        return (
            <div className={'inbox'}>
                    <div className={'upload-container'}>
                        <h2>Inbox</h2>
                        <hr/>
                        <div style={{width: 200}}>
                            <input type="file"  onChange={this.onFileSelect} className={'horizontal-center'}/>
                        </div>
                        <br/><br/>
                        <Button size="lg" block onClick={this.onFileUpload} >
                            <i className="fa fa-upload"/>
                        </Button>
                        <hr/>

                    </div>
                    {this.state.inbox.slice(0).reverse().map((e, i) => {
                        return <div className={`${this.state.id === e.messageID ? 'active' : null } msg-item`} onClick={() => {this.updateActiveMsg(i)}}>{e.from}</div>
                    })}

            </div>
        )
    }

    render() {
        return (
            <Container className="app-container">
                <Row className="justify-content-md-center title" >
                    <h1>Message Viewer</h1>
                </Row>
                <Row>
                    <Col sm={4} style={{paddingLeft:0, paddingRight:0}}>{this.renderInbox()}</Col>
                    <Col sm={8} style={{paddingRight:0, paddingLeft:0, borderRight: "1px solid #3D5E75", borderBottom: "1px solid #3D5E75"}} >
                        {this.state.fileParsed ? this.renderEmail() :

                            <div class="vertical-center horizontal-shift upload-screen">
                                <i className="fa fa-envelope"/>
                                <br/>
                                Upload an Item To Read
                            </div>
                        }
                    </Col>
                </Row>
            </Container>
        )
    }


/*
<div className="App">

<Col sm={4}>Inbox</Col>
<Col sm={8}>Message
  {this.renderEmailHeader()}
  {this.renderEmailBody()}
</div>
*/
}

export default App;
