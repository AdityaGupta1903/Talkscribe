import { useEffect } from "react";

export const Receiver = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "receiver",
        })
      );
    };
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      let pc: RTCPeerConnection | null = null;
      if (message.type === "createOffer") {
        pc = new RTCPeerConnection();
        await pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        pc.onicecandidate = (event) => {
          console.log(event);
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };
        socket.send(
          JSON.stringify({
            type: "createAnswer",
            sdp: pc.localDescription,
          })
        );
      } else if (message.type === "iceCandidate" && pc != null) {
        //@ts-ignore
        pc?.addIceCandidate(message.candidate);
      }
    };
    socket.onclose = () => {
      console.log("Connection closed");
    };
  }, []);

  async function startReceiving(socket: WebSocket, sdp: any) {
    //
  }

  return <div></div>;
};
