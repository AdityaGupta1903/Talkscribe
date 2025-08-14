import React from 'react';
import { Button, Typography, Box, Container, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SecurityIcon from '@mui/icons-material/Security';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import GroupIcon from '@mui/icons-material/Group';
import { SSOURL } from "./../../contants"
import { Controller } from '../api/function';
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null); // null = loading
    React.useEffect(() => {
        const setIsAuth = async () => {
            const res = await Controller.isUserAuthenticated();
            setIsAuthenticated(res);
        };
        setIsAuth();
    }, []);
    if (isAuthenticated == true) {
        navigate("/video")
    }
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
                {/* Hero Section */}
                <Box textAlign="center" mb={8}>
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: 'white',
                                mb: 2,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                fontSize: { xs: '2.5rem', md: '3.5rem' }
                            }}
                        >
                            Welcome to TalkScribe
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                mb: 4,
                                fontWeight: 300,
                                maxWidth: 600,
                                mx: 'auto'
                            }}
                        >
                            Experience seamless, secure, and high-quality video calling with automatic recording capabilities
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<VideoCallIcon />}
                            onClick={() => window.open(SSOURL)}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: 3,
                                textTransform: 'none',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                                }
                            }}
                        >
                            Get Started
                        </Button>
                    </motion.div>
                </Box>

                {/* Features Section */}
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    {[
                        {
                            icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
                            title: 'HD Video Calls',
                            description: 'Crystal clear video quality with real-time communication'
                        },
                        {
                            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
                            title: 'Secure & Private',
                            description: 'End-to-end encryption ensures your conversations stay private'
                        },
                        {
                            icon: <HighQualityIcon sx={{ fontSize: 40 }} />,
                            title: 'Auto Recording',
                            description: 'Automatically record and save your important conversations'
                        },
                        {
                            icon: <GroupIcon sx={{ fontSize: 40 }} />,
                            title: 'Easy Sharing',
                            description: 'Share meeting links instantly and join with one click'
                        }
                    ].map((feature, index) => (
                        //@ts-ignore
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Box sx={{ color: 'white', mb: 2 }}>
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: 'white',
                                                fontWeight: 600,
                                                mb: 1
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(255,255,255,0.8)',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default LandingPage;
