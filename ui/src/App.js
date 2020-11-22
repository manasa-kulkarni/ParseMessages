import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import React from 'react';


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
            fileParsed: false
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
                this.setState({
                    to: res.data.to,
                    from: res.data.from,
                    subject: res.data.subject,
                    date: res.data.date,
                    content: res.data.body,
                    fileParsed:true
                })
            }
            else {
                alert("Something went wrong! File could not be parsed")
            }
        })
    }



    renderEmailBody = () => {
        if (this.state.fileParsed) {
            return (
                <div>
                //Render multipart content
                {this.state.content.map(c => {
                    var key = Object.keys(c)[0]
                    if (key.includes("multipart/alternative")) {
                        //Do not display multipart
                        return null;
                    }
                    else if (key.includes("text/plain")) {
                        //Display Plain Text
                        return (
                            <div>
                                //For each new line in plain text, render in div for line break
                                {c[key].split("\n").map((i,k) => {
                                    //Create hyperlinks
                                    if (i.match(/(?=https:\/\/).*(?=\s)/ig) !== null && i.match(/<http/ig) === null) {
                                        var url = i.match(/(?=https:\/\/).*(?=\s)/ig)[0];
                                        return  <div key={k}><a href={url}> {i.replace(url, "") }</a><br/></div>
                                    }
                                    else if (i.match(/https:\/\/.*/ig) !== null && i.match(/<http/ig) === null) {
                                        var url = i.match(/https:\/\/.*/ig)[0];
                                        return  <div key={k}><a href={url}> here</a><br/></div>
                                    }
                                    else if (i.match(/(?=http:\/\/).*(?=\s)/ig) !== null && i.match(/<http/ig) === null) {
                                        var url = i.match(/(?=http:\/\/).*(?=\s)/ig)[0];
                                        return  <div key={k}><a href={url}> {i.replace(url, "") }</a><br/></div>
                                    }
                                    else if (i.match(/http:\/\/.*/ig) !== null && i.match(/<http/ig) === null) {
                                        var url = i.match(/http:\/\/.*/ig)[0];
                                        return  <div key={k}><a href={url}> here</a><br/></div>
                                    }
                                    else {
                                        return <div key={k}>{i}<br/></div>;
                                    }
                                })}
                            </div>);
                    }
                    else if (key.includes("text/html")) {
                        //Set innerHTML from text/html data
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
    renderEmailHeader = () => {
        if  (this.state.fileParsed) {
            return (
                <div>
                    To: {this.state.to}<br/>
                    From: {this.state.from}<br/>
                    Date: {this.state.date}<br/>
                    Subject: {this.state.subject}<br/>
                </div>
            )
        }
        else {
            return null;
        }

    }

    render() {
        return (
          <div className="App">
            <input type="file" onChange={this.onFileSelect}/>
            <button onClick={this.onFileUpload}>View File</button>
            {this.renderEmailHeader()}
            {this.renderEmailBody()}
          </div>
        );
    }

}

export default App;
