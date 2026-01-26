import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../../../services/socket';

export const useChat = () => {
    const [username, setUsername] = useState(null);
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('Disconnected');
    const [isChatEnabled, setIsChatEnabled] = useState(false);

    const addMessage = useCallback((text, type) => {
        setMessages(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
    }, []);

    const addSystemMessage = useCallback((text) => {
        setMessages(prev => [...prev, { text, type: 'system', id: Date.now() + Math.random() }]);
    }, []);

    const connect = useCallback((user) => {
        setUsername(user);
        setStatus('Connecting...');

        socketService.connect(
            user,
            () => {
                setStatus('Connected. Waiting for a partner...');
                addSystemMessage('Connected to server.');
            },
            (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'chat') {
                        addMessage(data.message, 'stranger');
                    } else if (data.type === 'system') {
                        addSystemMessage(data.message);
                        setStatus(data.message);

                        if (data.message.includes('connected') && !data.message.includes('Disconnected from server')) {
                            setIsChatEnabled(true);
                        } else if (data.message.includes('disconnected')) {
                            setIsChatEnabled(false);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing message", e);
                }
            },
            () => {
                setStatus('Disconnected from server.');
                addSystemMessage('Disconnected from server.');
                setIsChatEnabled(false);
            },
            (err) => {
                console.error("WebSocket error", err);
                setStatus('Connection error.');
                setIsChatEnabled(false);
            }
        );
    }, [addMessage, addSystemMessage]);

    const disconnect = useCallback(() => {
        socketService.disconnect();
        setUsername(null);
        setMessages([]);
        setStatus('Disconnected');
        setIsChatEnabled(false);
    }, []);

    const findNewPartner = useCallback(() => {
        socketService.disconnect();
        setMessages([]);
        setIsChatEnabled(false);
        setStatus('Reconnecting...');

        // Quick timeout to allow cleanup before reconnecting
        setTimeout(() => {
            connect(username);
        }, 500);
    }, [username, connect]);


    useEffect(() => {
        // Handling unmount
        return () => {
            socketService.disconnect();
        };
    }, []);

    const sendMessage = useCallback((text) => {
        if (text.trim()) {
            const sent = socketService.sendMessage(text);
            if (sent) {
                addMessage(text, 'you');
                return true;
            }
        }
        return false;
    }, [addMessage]);

    return {
        username,
        messages,
        status,
        isChatEnabled,
        connect,
        disconnect,
        findNewPartner,
        sendMessage
    };
};
