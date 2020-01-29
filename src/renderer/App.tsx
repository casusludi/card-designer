'use strict'
import React, { Component } from 'react';
import PDFViewer from './components/PDFViewer/PDFViewer';

const FILE_TEST:string = `C:\\Users\\Pierre\\projets\\casusludi\\orangeda\\export\\basic\\clients.pdf`;


export default class App extends Component {

  render() {
    return (
      <div>
        <PDFViewer filePath={FILE_TEST}/>

      </div>
    );
  }
}

