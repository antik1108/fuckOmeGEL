import { useState } from 'react';
import LoginScreen from '../features/auth/LoginScreen';
import ChatContainer from '../features/chat/components/ChatContainer';

function App() {
  const [username, setUsername] = useState(null);

  if (!username) {
    return <LoginScreen onJoin={setUsername} />;
  }

  return <ChatContainer username={username} onLogout={() => setUsername(null)} />;
}

export default App;
