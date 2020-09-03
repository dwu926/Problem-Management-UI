import React, {useState, useEffect}  from 'react';
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
    
      axios.post('http://localhost:5000/api/upload/', formData)
      .then(response => {
        console.log(response);
        //Perform action based on response
      })
      .catch(error => {
          console.log(error);
      //Perform action based on error
      });   
  
    };

function App() {

    const [currentTime, setCurrentTime] = useState(1);

    useEffect (()=>{
        fetch('/api/current').then(res => res.json()).then(data => {
        setCurrentTime(data.time)
        })
    }, []);

    return (
        <div>
            <header>
    
            <h1>Central Feedback System</h1>
    
            </header>

            <main>
            <h1>The current time is {currentTime}</h1>
            <br/>
            <form>
                <input type="file" name="file" onChange={this.onChangeFile}/>
                <button onClick={this.handleUploadFile}>Upload</button>

            </form>
            </main>

        </div>
        );
    
        
    };


export default App;