import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Typography, Box, Container } from "@mui/material";
import VideoCallIcon from '@mui/icons-material/VideoCall';

const previousRecordings = [
  {
    id: 1,
    title: "Team Sync - July 1",
    date: "2025-07-01",
    url: "#",
  },
  {
    id: 2,
    title: "Client Meeting - June 28",
    date: "2025-06-28",
    url: "#",
  },
  {
    id: 3,
    title: "Project Kickoff - June 20",
    date: "2025-06-20",
    url: "#",
  },
];

const CallSetup = () => {
  const navigate = useNavigate();

  const handleStartVideo = () => {
    navigate("/call");
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" align="center" gutterBottom>
          Setup Your Call
        </Typography>

        <Box display="flex" justifyContent="center" mb={6}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<VideoCallIcon />}
            size="large"
            onClick={handleStartVideo}
          >
            Start Video
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom>
          Previous Recordings
        </Typography>

        <Box display="grid" gap={2}>
          {previousRecordings.map((rec) => (
            <Card
              key={rec.id}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={() => window.location.href = rec.url}
            >
              <CardContent>
                <Typography variant="h6" color="primary">
                  {rec.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {rec.date}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default CallSetup;
