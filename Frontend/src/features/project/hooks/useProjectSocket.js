import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router";
import { useToast } from "../../shared/components/Toast";
const BACKEND_SOCKET_URL = import.meta.env.VITE_BACKEND_SOCKET_URL;

const useProjectSocket = (currentUserId) => {
  console.log("current user id", currentUserId);
  const navigate = useNavigate();
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiLimitError, setAiLimitError] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(BACKEND_SOCKET_URL, {
      autoConnect: false,
    });
    socketRef.current = socket;

    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-user-room", currentUserId);
    });

    socket.on("project-status-update", (data) => {
      console.log("Data from socket \n", data);
      setIsGenerating(false);

      if (data.status === "completed") {
        toast.success(
          "Your webpage is ready. Opening workspace…",
          "Project compiled!",
        );
        navigate(`/project?id=${data.projectId}`);
      }

      if (data.status === "failed") {
        const msg = data.message || "";
        const isApiLimit =
          msg.includes("fetch failed") ||
          msg.includes("ConnectTimeout") ||
          msg.includes("UND_ERR_CONNECT_TIMEOUT") ||
          msg.includes("timeout") ||
          msg.includes("quota") ||
          msg.includes("rate");

        if (isApiLimit) {
          setAiLimitError(true);
        } else {
          toast.error(
            msg || "The AI compilation encountered an error. Please try again.",
            "Compilation failed",
          );
        }
        navigate("/dashboard");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.off("connect");
      socket.off("project-status-update");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, navigate]);

  return { isGenerating, setIsGenerating, aiLimitError, setAiLimitError };
};

export default useProjectSocket;
