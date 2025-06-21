import { useEffect, useRef } from "react";

export const Receiver = () => {
  const VideoRef = useRef<HTMLVideoElement>(null);
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
        pc.ontrack = (event) => {
          console.log(event.track);
          if (VideoRef.current) {
            VideoRef.current.srcObject = new MediaStream([event.track]);
            VideoRef.current.play();
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

  return (
    <div>
      Receiver
      <video ref={VideoRef}></video>
    </div>
  );
};
