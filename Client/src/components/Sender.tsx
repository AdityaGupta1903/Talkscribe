import { useEffect, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };
  }, []);

  const initiateConn = async () => {
    if (!socket) return;
    // Creating the offer
    const pc = new RTCPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    pc.onicecandidate = (event) => {
      console.log(event);
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    socket?.send(
      JSON.stringify({
        type: "createOffer",
        sdp: pc.localDescription,
      })
    );
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type == "createAnswer") {
        pc?.setRemoteDescription(message.sdp);
      } else if (message.type == "iceCandidate") {
        pc.addIceCandidate(message.candidate);
      }
    };
    setPC(pc);
  };

  const getCameraStreamAndSend = (pc: RTCPeerConnection) => {};

  return (
    <div>
      Sender
      <button onClick={initiateConn}> Send data </button>
    </div>
  );
};
