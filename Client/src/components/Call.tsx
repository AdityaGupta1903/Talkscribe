import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import { Button, TextField, Box, Paper, IconButton, Tooltip, Fab } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import { Controller } from "../api/function";
import { PROD_URL } from "../../contants";

function Call() {
    const [peerId, setPeerId] = useState("");
    const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
    const [startRecording, setStartRecoding] = useState<boolean>(false);
    const [IntervalId, setIntervalId] = useState<number>(-1);
    const [currentUID, setcurrentUID] = useState<string>();
    const [remoteUID, setremoteUID] = useState<string>();
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
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
                axios.post(`${PROD_URL}/upload`, formData, {
                    withCredentials: true,
                });
                recordedChunks = []
            };
            mediaRecorder.start();
            let IntervalId = setInterval(() => {
                mediaRecorder.stop();
                mediaRecorder.start();
                console.log(recordedChunks);
            }, 2000);
            //@ts-ignore
            setIntervalId(IntervalId);
            setStartRecoding(true);
        }
    };

    const toggleVideo = () => {
        const localStream = peerInstance.current.localStream;
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        const localStream = peerInstance.current.localStream;
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const copyInviteLink = async () => {
        const link = `${window.location.origin}${window.location.pathname}?pid=${peerId}&uid=${currentUID}`;
        await navigator.clipboard.writeText(link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const endCall = () => {
        if (peerInstance.current.peer) {
            peerInstance.current.peer.destroy();
        }
        window.location.href = '/video';
    };

    console.log(remoteUID);
    console.log(currentUID);

    return (
        <>
            <Box 
                sx={{ 
                    height: "100vh", 
                    width: "100vw", 
                    overflow: "hidden", 
                    position: "relative", 
                    backgroundColor: "#000",
                    cursor: showControls ? 'default' : 'none'
                }}
                onMouseMove={() => {
                    setShowControls(true);
                    setTimeout(() => setShowControls(false), 3000);
                }}
            >
                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover",
                        filter: remoteVideoRef.current?.srcObject ? 'none' : 'blur(10px)'
                    }}
                />
                
                {/* Local Video */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        position: "absolute",
                        bottom: "20px",
                        right: "20px",
                        width: "200px",
                        height: "150px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        border: "2px solid rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <video
                        ref={currentUserVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: isVideoEnabled ? 'block' : 'none'
                        }}
                    />
                    {!isVideoEnabled && (
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                bgcolor: "rgba(0,0,0,0.8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white"
                            }}
                        >
                            <VideocamOffIcon sx={{ fontSize: 40 }} />
                        </Box>
                    )}
                </motion.div>

                {/* Control Panel */}
                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            style={{
                                position: "absolute",
                                bottom: "20px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 10
                            }}
                        >
                            <Paper
                                sx={{
                                    bgcolor: "rgba(0,0,0,0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 6,
                                    p: 2,
                                    display: "flex",
                                    gap: 2,
                                    alignItems: "center"
                                }}
                            >
                                <Tooltip title={isAudioEnabled ? "Mute" : "Unmute"}>
                                    <IconButton
                                        onClick={toggleAudio}
                                        sx={{
                                            bgcolor: isAudioEnabled ? "rgba(255,255,255,0.1)" : "#f44336",
                                            color: "white",
                                            "&:hover": {
                                                bgcolor: isAudioEnabled ? "rgba(255,255,255,0.2)" : "#d32f2f"
                                            }
                                        }}
                                    >
                                        {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}>
                                    <IconButton
                                        onClick={toggleVideo}
                                        sx={{
                                            bgcolor: isVideoEnabled ? "rgba(255,255,255,0.1)" : "#f44336",
                                            color: "white",
                                            "&:hover": {
                                                bgcolor: isVideoEnabled ? "rgba(255,255,255,0.2)" : "#d32f2f"
                                            }
                                        }}
                                    >
                                        {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={startRecording ? "Stop Recording" : "Start Recording"}>
                                    <IconButton
                                        onClick={async () => {
                                            startRecordingMergedCanvas(startRecording);
                                            if (startRecording) {
                                                const formData = new FormData();
                                                let RecordingDetails = {
                                                    currentUID: currentUID,
                                                    remoteUID: remoteUID
                                                }
                                                formData.append("rec_details", JSON.stringify(RecordingDetails));
                                                axios.post(`${PROD_URL}/stoprecording`, formData, {
                                                    withCredentials: true,
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    }
                                                })
                                            }
                                        }}
                                        sx={{
                                            bgcolor: startRecording ? "#f44336" : "rgba(255,255,255,0.1)",
                                            color: "white",
                                            "&:hover": {
                                                bgcolor: startRecording ? "#d32f2f" : "rgba(255,255,255,0.2)"
                                            }
                                        }}
                                    >
                                        {startRecording ? <StopIcon /> : <FiberManualRecordIcon />}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="End Call">
                                    <IconButton
                                        onClick={endCall}
                                        sx={{
                                            bgcolor: "#f44336",
                                            color: "white",
                                            "&:hover": {
                                                bgcolor: "#d32f2f"
                                            }
                                        }}
                                    >
                                        <CallEndIcon />
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording Indicator */}
                {startRecording && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            position: "absolute",
                            top: "20px",
                            left: "20px",
                            zIndex: 10
                        }}
                    >
                        <Paper
                            sx={{
                                bgcolor: "rgba(244, 67, 54, 0.9)",
                                backdropFilter: "blur(10px)",
                                color: "white",
                                px: 2,
                                py: 1,
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <FiberManualRecordIcon sx={{ fontSize: 16 }} />
                            </motion.div>
                            Recording
                        </Paper>
                    </motion.div>
                )}
            </Box>
            
            <canvas ref={canvasRef} width={640} height={240} style={{ display: "none" }} />

            {/* Invite Link Panel */}
            {!remotePeerIdValue && (
                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            style={{
                                position: "absolute",
                                top: "20px",
                                left: "20px",
                                zIndex: 10
                            }}
                        >
                            <Paper
                                sx={{
                                    bgcolor: "rgba(0,0,0,0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 3,
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    maxWidth: 400
                                }}
                            >
                                <TextField
                                    label="Invite Link"
                                    variant="outlined"
                                    size="small"
                                    value={`${window.location.origin}${window.location.pathname}?pid=${peerId}&uid=${currentUID}`}
                                    InputProps={{ 
                                        readOnly: true,
                                        sx: { fontSize: '0.875rem' }
                                    }}
                                    sx={{ 
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                                    }}
                                />
                                <Tooltip title={copySuccess ? "Copied!" : "Copy Link"}>
                                    <IconButton
                                        onClick={copyInviteLink}
                                        sx={{
                                            bgcolor: copySuccess ? "#4caf50" : "rgba(255,255,255,0.1)",
                                            color: "white",
                                            "&:hover": {
                                                bgcolor: copySuccess ? "#45a049" : "rgba(255,255,255,0.2)"
                                            }
                                        }}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Floating Action Button for mobile controls */}
            <Fab
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    left: 16,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    display: { xs: 'flex', md: 'none' },
                    '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.8)'
                    }
                }}
                onClick={() => setShowControls(!showControls)}
            >
                <VideocamIcon />
            </Fab>
        </>
    );
}

export default Call;

                    >
                        Copy
                    </Button>
                </Box>
            )}
        </>
    );
}

export default Call;
