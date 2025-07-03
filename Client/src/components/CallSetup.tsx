import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import { Button } from "@mui/material";

function CallSetup() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentUserVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peerInstance = useRef<any>(null);
  let recordedChunks: Blob[] = [];

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
        currentUserVideoRef.current!.srcObject = mediaStream;
        currentUserVideoRef.current!.play();
        call.answer(mediaStream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current!.srcObject = remoteStream;
          remoteVideoRef.current!.play();

          startDrawingCanvas();
          startRecordingMergedCanvas();
        });
      });
    });

    peerInstance.current = peer;
  }, []);

  const call = (remotePeerId: string) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      currentUserVideoRef.current!.srcObject = mediaStream;
      currentUserVideoRef.current!.play();

      const call = peerInstance.current.call(remotePeerId, mediaStream);

      call.on("stream", (remoteStream: MediaStream) => {
        remoteVideoRef.current!.srcObject = remoteStream;
        remoteVideoRef.current!.play();

        startDrawingCanvas();
        startRecordingMergedCanvas();
      });
    });
  };

  const startDrawingCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = () => {
      if (currentUserVideoRef.current && remoteVideoRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentUserVideoRef.current, 0, 0, 320, 240); // Local on left
        ctx.drawImage(remoteVideoRef.current, 320, 0, 320, 240); // Remote on right
      }
      requestAnimationFrame(draw);
    };

    draw();
  };

  const startRecordingMergedCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasStream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: "video/webm; codecs=vp9" });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const file = new File([blob], "recording.webm", { type: "video/webm" });
      console.log(file);

      const formData = new FormData();
      formData.append("video", file);
      axios.post("http://localhost:3000/upload", formData); /// upload the data to the backend on record interval
      console.log(recordedChunks);
    };

    mediaRecorder.start();
    console.log("Recording started");

    setInterval(() => {
      mediaRecorder.stop();
      mediaRecorder.start();
      recordedChunks = [];
      console.log("Recording stopped");
    }, 10000); // Record for 10 seconds (adjust as needed)
  };

  return (
    <div className="App">
      <h2>
        📹 Your Peer ID: <strong>{peerId}</strong>
      </h2>

      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
        placeholder="Enter remote peer ID"
      />
      <button onClick={() => {
        call(remotePeerIdValue)
      }}>Call</button>

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <div>
          <h4>Local Video</h4>
          <video ref={currentUserVideoRef} autoPlay muted style={{ width: 320, height: 240 }} />
        </div>
        <div>
          <h4>Remote Video</h4>
          <video ref={remoteVideoRef} autoPlay style={{ width: 320, height: 240 }} />
        </div>
      </div>
      <Button onClick={() => {
        axios.get("http://localhost:3000/testcookie", {
          withCredentials: true
        })
      }}>Test Btn</Button>

      {/* Hidden canvas used for recording */}
      <canvas ref={canvasRef} width={640} height={240} style={{ display: "none" }} />
    </div>
  );
}

export default CallSetup;
