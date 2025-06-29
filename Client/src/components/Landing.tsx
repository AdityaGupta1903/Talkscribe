import React from 'react';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Client_ID, redirect_URI } from "./../../contants"

const LandingPage: React.FC = () => {

    const SSOURL = `https://accounts.google.com/o/oauth2/v2/auth?
 scope=profile&
 include_granted_scopes=true&
 response_type=code&
 state=state_parameter_passthrough_value&
 redirect_uri=${redirect_URI}&
 client_id=${Client_ID}`

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #3f51b5, #5c6bc0)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2
            }}
        >
            <Paper elevation={12} sx={{ maxWidth: 600, width: '100%', p: 5, borderRadius: 4 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography variant="h3" align="center" gutterBottom color="textPrimary">
                        Welcome to ConnectNow
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
                        Seamless, secure and high-quality video calling experience.
                    </Typography>
                </motion.div>

                <Box display="flex" justifyContent="center" gap={2} mt={4}>
                    <Button variant="contained" color="primary" size="large" onClick={() => {
                        window.open(SSOURL)
                    }}>
                        Login
                    </Button>
                    <Button variant="contained" color="secondary" size="large">
                        Sign Up
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default LandingPage;
