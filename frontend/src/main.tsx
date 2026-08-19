import React from 'react'; import ReactDOM from 'react-dom/client'; import { BrowserRouter } from 'react-router-dom'; import { Provider } from 'react-redux'; import App from './App'; import { store } from './store'; import './styles.css';
// Bootstrap the React tree with Redux state, client-side routing, and global CSS.
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Provider store={store}><BrowserRouter><App /></BrowserRouter></Provider></React.StrictMode>);
