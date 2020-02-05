import ReactDOM from 'react-dom';
import React from 'react';

import '../../node_modules/@fortawesome/fontawesome-free/css/all.css';
import './styles/index.scss';

import settings from '../../settings/globals.json';

import App from './components/App/App';

ReactDOM.render(
    <App settings={settings}/>,
    document.getElementById('app')
);