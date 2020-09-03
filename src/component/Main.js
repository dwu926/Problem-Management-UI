
import React from 'react';
import axios from 'axios';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileToBeSent: null,
    };

    this.handleUploadFile = this.handleUploadFile.bind(this);
  }

  handleUploadFile(ev) {
    ev.preventDefault();
    let file = this.state.fileToBeSent;
    const formData = new FormData();
  
    formData.append("file", file);
  
    axios.post('http://127.0.0.1:3000/api/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}})
    .then(response => {
      console.log(response);
      //Perform action based on response
    })
    .catch(error => {
        console.log(error);
    //Perform action based on error
    });   

  }

  render() {
    return (
      <form>
        <input type="file" name="file" onChange={this.onChangeFile}/>
        <button onClick={this.handleUploadFile}>Upload</button>

      </form>
    );
  }
}

export default Main;