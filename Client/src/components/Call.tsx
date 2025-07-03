import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import { Button } from "@mui/material";

function Call() {
    const [peerId, setPeerId] = useState("");
    const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const currentUserVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const peerInstance = useRef<any>({});
    let recordedChunks: Blob[] = [];

    useEffect(() => {
        const URLParams = new URLSearchParams(window.location.search);
        const remoteId = URLParams.get("pid");
        if (remoteId) {
            setRemotePeerIdValue(remoteId);
        }

        // Get local stream immediately
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
            if (currentUserVideoRef.current) {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play();
            }
            peerInstance.current.localStream = mediaStream;
        });

        // Init peer
        const peer = new Peer();
        peerInstance.current.peer = peer;

        peer.on("open", (id) => {
            setPeerId(id);
        });

        peer.on("call", (call) => {
            const localStream = peerInstance.current.localStream;
            call.answer(localStream);

            call.on("stream", (remoteStream: MediaStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                }
                startDrawingCanvas();
                startRecordingMergedCanvas();
            });
        });
    }, []);

    useEffect(() => {
        if (remotePeerIdValue && peerInstance.current.peer && peerInstance.current.localStream) {
            const call = peerInstance.current.peer.call(remotePeerIdValue, peerInstance.current.localStream);
            call.on("stream", (remoteStream: MediaStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                }
                startDrawingCanvas();
                startRecordingMergedCanvas();
            });
        }
    }, [remotePeerIdValue, peerInstance.current.localStream]);

    const startDrawingCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const draw = () => {
            if (currentUserVideoRef.current && remoteVideoRef.current) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(currentUserVideoRef.current, 0, 0, 320, 240);
                ctx.drawImage(remoteVideoRef.current, 320, 0, 320, 240);
            }
            requestAnimationFrame(draw);
        };

        draw();
    };

    const startRecordingMergedCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasStream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: "video/webm; codecs=vp9",
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const file = new File([blob], "recording.webm", { type: "video/webm" });

            const formData = new FormData();
            formData.append("video", file);
            axios.post("http://localhost:3000/upload", formData);
        };

        mediaRecorder.start();
        setInterval(() => {
            mediaRecorder.stop();
            mediaRecorder.start();
            recordedChunks = [];
        }, 10000);
    };

    return (
        <div className="App">
            <h2>
                📹 Your Peer ID: <strong>{peerId}</strong>
            </h2>

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

            <Button
                variant="contained"
                onClick={() => {
                    axios.get("http://localhost:3000/testcookie", {
                        withCredentials: true,
                    });
                }}
                style={{ marginTop: "20px" }}
            >
                Test Btn
            </Button>

            <canvas ref={canvasRef} width={640} height={240} style={{ display: "none" }} />
        </div>
    );
}

export default Call;
