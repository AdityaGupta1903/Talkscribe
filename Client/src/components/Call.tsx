import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import { Button, TextField, Box } from "@mui/material";
import { Controller } from "../api/function";

function Call() {
    const [peerId, setPeerId] = useState("");
    const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
    const [startRecording, setStartRecoding] = useState<boolean>(false);
    const [IntervalId, setIntervalId] = useState<number>(-1);
    const [currentUID, setcurrentUID] = useState<string>();
    const [remoteUID, setremoteUID] = useState<string>();
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const currentUserVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const peerInstance = useRef<any>({});
    let recordedChunks: Blob[] = [];

    useEffect(() => {
        const URLParams = new URLSearchParams(window.location.search);
        const remoteId = URLParams.get("pid");
        const UID = URLParams.get("uid");
        if (remoteId) setRemotePeerIdValue(remoteId);
        if (UID) setremoteUID(UID);

        Controller.getUserId().then((resp) => {
            setcurrentUID(resp);
        })

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
            if (currentUserVideoRef.current) {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play();
            }
            peerInstance.current.localStream = mediaStream;
        });

        const peer = new Peer();
        peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                setremoteUID(data as unknown as string);
            })

        })

        peerInstance.current.peer = peer;

        peer.on("open", (id) => setPeerId(id));

        peer.on("call", (call) => {
            const localStream = peerInstance.current.localStream;
            call.answer(localStream);

            call.on("stream", (remoteStream: MediaStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                }
                startDrawingCanvas();
            });
        });
    }, []);

    useEffect(() => {
        if (remotePeerIdValue.length > 0 && peerInstance.current.peer && peerInstance.current.localStream) {
            const peerConnection = peerInstance.current.peer.connect(remotePeerIdValue);
            peerConnection.on('open', () => {
                peerConnection.send(currentUID);
            })
            const call = peerInstance.current.peer.call(remotePeerIdValue, peerInstance.current.localStream);
            call.on("stream", (remoteStream: MediaStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play();
                }
                startDrawingCanvas();
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

    const startRecordingMergedCanvas = (startRecording: boolean) => {
        if (startRecording == true) {
            clearInterval(IntervalId);
            setStartRecoding(false);
        }
        else {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const canvasStream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(canvasStream, {
                mimeType: "video/webm; codecs=vp9",
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                const file = new File([blob], "recording.webm", { type: "video/webm" });

                const formData = new FormData();
                formData.append("video", file);
                let RecordingDetails = {
                    currentUID: currentUID,
                    remoteUID: remoteUID
                }
                formData.append("rec_details", JSON.stringify(RecordingDetails));
                axios.post("https://talkscribeaptapiv1.adityagupta.site/upload", formData, {
                    withCredentials: true,
                });
                recordedChunks = []
            };
            mediaRecorder.start();
            let IntervalId = setInterval(() => {
                mediaRecorder.stop();
                mediaRecorder.start();
                console.log(recordedChunks);
            }, 10000);
            setIntervalId(IntervalId);
            setStartRecoding(true);
        }
    };

    console.log(remoteUID);
    console.log(currentUID);
    return (
        <>
            <Box sx={{ height: "100vh", width: "100vw", overflow: "hidden", position: "relative", backgroundColor: "#000" }}>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <video
                    ref={currentUserVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                        position: "absolute",
                        width: "200px",
                        height: "150px",
                        bottom: "20px",
                        right: "20px",
                        border: "2px solid white",
                        borderRadius: "10px",
                        objectFit: "cover",
                    }}
                />


            </Box>
            <canvas ref={canvasRef} width={640} height={240} style={{ display: "none" }} />

            <Button sx={{
                position: "absolute",
                color: "White",
                top: 20,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "16px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: 1,
            }} variant="outlined" onClick={async () => {
                startRecordingMergedCanvas(startRecording);
                if (startRecording) {  // Signal Server to stop the recording
                    const formData = new FormData();
                    let RecordingDetails = {
                        currentUID: currentUID,
                        remoteUID: remoteUID
                    }
                    formData.append("rec_details", JSON.stringify(RecordingDetails));
                    axios.post("https://talkscribeaptapiv1.adityagupta.site/stoprecording", formData, {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json"
                        }

                    })
                }

            }}>{startRecording ? "Stop Recording" : "Start Recording"}</Button>
            {!remotePeerIdValue && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 20,
                        left: 20,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        padding: "16px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <TextField
                        label="Invite Link"
                        variant="outlined"
                        size="small"
                        value={`${window.location.origin}${window.location.pathname}?pid=${peerId}&uid=${currentUID}`}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        sx={{ input: { color: "#fff" }, label: { color: "#ccc" } }}
                    />
                    <Button
                        variant="contained"
                        onClick={async () => {
                            await navigator.clipboard.writeText(
                                `${window.location.origin}${window.location.pathname}?pid=${peerId}&uid=${currentUID}`
                            );
                        }}
                    >
                        Copy
                    </Button>
                </Box>
            )}
        </>
    );
}

export default Call;
