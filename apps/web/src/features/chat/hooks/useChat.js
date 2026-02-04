import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../../../services/socket';

const INITIAL_LOGS = [
    { id: '1', type: 'system', text: 'Connected to secure_relay_node_04...', icon: 'link' },
    { id: '2', type: 'system', text: 'Waiting for a partner in the void...', icon: 'search' },
];

const generateLogId = () => `log-${Math.random().toString(36).substr(2, 9)}`;

export const useChat = () => {
    const [username, setUsername] = useState(null);
    const [messages, setMessages] = useState([]);
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [status, setStatus] = useState('Disconnected');
    const [isChatEnabled, setIsChatEnabled] = useState(false);
    const [isPartnerConnected, setIsPartnerConnected] = useState(false);
    const wasConnected = useRef(false);

    const addMessage = useCallback((text, type) => {
        setMessages(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);
    }, []);

    const addLog = useCallback((text, icon = 'info', animate = false) => {
        setLogs(prev => [...prev, { id: generateLogId(), type: 'system', text, icon, animate }]);
    }, []);

    const connect = useCallback((user) => {
        setUsername(user);
        setStatus('Connecting...');
        setLogs([
            ...INITIAL_LOGS,
            { id: generateLogId(), type: 'system', text: 'Establishing secure connection...', icon: 'vpn_lock' }
        ]);

        socketService.connect(
            user,
            () => {
                setStatus('Connected. Waiting for a partner...');
                addLog('Connected to server. Scanning for strangers...', 'wifi');
            },
            (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'chat') {
                        addMessage(data.message, 'stranger');
                    } else if (data.type === 'system') {
                        setStatus(data.message);

                        if (data.event === 'partner_connected' || (data.message.includes('connected') && !data.message.includes('Disconnected from server'))) {
                            if (!wasConnected.current) {
                                wasConnected.current = true;
                                addLog('STRANGER_CONNECTED! End-to-end encryption active.', 'security', true);
                            }
                            setIsChatEnabled(true);
                            setIsPartnerConnected(true);
                        } else if (data.event === 'partner_disconnected' || data.message.includes('disconnected')) {
                            wasConnected.current = false;
                            setIsPartnerConnected(false);
                            addLog('⚠️ STRANGER_DISCONNECTED: Connection terminated.', 'person_off', true);
                            setIsChatEnabled(false);
                            // Clean up WebRTC connection
                            socketService.closePeerConnection();
                        }
                    }
                } catch (e) {
                    console.error("Error parsing message", e);
                }
            },
            () => {
                setStatus('Disconnected from server.');
                addLog('CONNECTION_LOST: Server unreachable.', 'wifi_off');
                setIsChatEnabled(false);
                wasConnected.current = false;
            },
            (err) => {
                console.error("WebSocket error", err);
                setStatus('Connection error.');
                addLog('ERROR: Connection unstable. Retrying...', 'error');
                setIsChatEnabled(false);
            }
        );
    }, [addMessage, addLog]);

    const disconnect = useCallback(() => {
        socketService.disconnect();
        setUsername(null);
        setMessages([]);
        setLogs(INITIAL_LOGS);
        setStatus('Disconnected');
        setIsChatEnabled(false);
        wasConnected.current = false;
    }, []);

    const findNewPartner = useCallback(() => {
        socketService.disconnect();
        setMessages([]);
        setIsChatEnabled(false);
        setIsPartnerConnected(false);
        wasConnected.current = false;
        setStatus('Reconnecting...');
        setLogs([
            ...INITIAL_LOGS,
            { id: generateLogId(), type: 'system', text: 'Reconnecting to new node...', icon: 'sync', animate: true }
        ]);

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
        logs,
        status,
        isChatEnabled,
        isPartnerConnected,
        connect,
        disconnect,
        findNewPartner,
        sendMessage,
        addLog
    };
};
