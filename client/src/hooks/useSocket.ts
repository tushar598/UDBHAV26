import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

// Singleton socket — created once and reused across components
let socketInstance: Socket | null = null;

export const useSocket = (enabled: boolean = true) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Reuse existing socket if already connected
        if (!socketInstance || !socketInstance.connected) {
            socketInstance = io(SOCKET_URL, {
                withCredentials: true, // ✅ Sends httpOnly cookies so server can auth
                transports: ["websocket", "polling"],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });
        }

        socketRef.current = socketInstance;

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);

        if (socketInstance.connected) setIsConnected(true);

        return () => {
            socketInstance?.off("connect", onConnect);
            socketInstance?.off("disconnect", onDisconnect);
        };
    }, [enabled]);

    const joinConversation = (conversationId: string) => {
        socketRef.current?.emit("join_conversation", conversationId);
    };

    const sendSocketMessage = (
        conversationId: string,
        content: string,
        callback?: (result: { success: boolean; message?: any }) => void
    ) => {
        socketRef.current?.emit("send_message", { conversationId, content }, callback);
    };

    const emitTypingStart = (conversationId: string) => {
        socketRef.current?.emit("typing_start", { conversationId });
    };

    const emitTypingStop = (conversationId: string) => {
        socketRef.current?.emit("typing_stop", { conversationId });
    };

    const markRead = (conversationId: string) => {
        socketRef.current?.emit("mark_read", { conversationId });
    };

    const disconnectSocket = () => {
        socketInstance?.disconnect();
        socketInstance = null;
    };

    return {
        socket: socketRef.current,
        isConnected,
        joinConversation,
        sendSocketMessage,
        emitTypingStart,
        emitTypingStop,
        markRead,
        disconnectSocket,
    };
};
