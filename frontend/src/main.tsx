
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast';
import store from './app/store.ts'
import { MsgNotificationProvider } from './messageNotification.tsx';


createRoot(document.getElementById('root')!).render(
  <MsgNotificationProvider>
  <Provider store={store}>
    <Toaster />
    <App />
    </Provider>
    </MsgNotificationProvider>
)
