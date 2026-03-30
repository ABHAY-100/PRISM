import './app.css'
import { Chat } from './components/Chat'
import { LogViewer } from './components/LogViewer'

export function App() {
  return (
    <div id="main-container">
      <Chat />
      <LogViewer />
    </div>
  )
}

