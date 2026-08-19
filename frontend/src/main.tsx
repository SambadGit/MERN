import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import { BrowserRouter } from 'react-router-dom'; 
import { Provider } from 'react-redux'; 
import App from './App'; 
import { store } from './store'; 
import './styles.css';


// Bootstrap the React tree with Redux state, client-side routing, and global CSS.
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Provider store={store}><BrowserRouter><App /></BrowserRouter></Provider></React.StrictMode>);
// why BrowserRouter used here? Because it uses the HTML5 history API to keep the UI in sync with the URL. AND it allows for clean URLs without the hash (#) symbol, making the application more user-friendly and SEO-friendly. and if we not used BrowserRouter, we would have to use HashRouter which uses the hash portion of the URL (window.location.hash) to keep the UI in sync with the URL. This would result in URLs with a hash symbol (#), which can be less user-friendly and may not be as SEO-friendly.
