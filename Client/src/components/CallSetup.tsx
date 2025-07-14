import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  CircularProgress,
  CardMedia,
  Chip,
  IconButton,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Controller } from "../api/function";
import dayjs from "dayjs";

const CallSetup = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", error: false });

  const handleStartVideo = () => {
    navigate("/call");
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = () => {
    setLoading(true);
    Controller.getRecordings()
      .then((data: any) => {
        setRecordings(data.recordings);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to load recordings", error: true });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleDelete = async () => { // To implement this
    // if (selectedId === null) return;
    // try {
    //   await Controller.deleteRecording(selectedId);
    //   setRecordings((prev) => prev.filter((rec) => rec.Id !== selectedId));
    //   setSnackbar({ open: true, message: "Recording deleted", error: false });
    // } catch {
    //   setSnackbar({ open: true, message: "Failed to delete", error: true });
    // } finally {
    //   setOpenDialog(false);
    //   setSelectedId(null);
    // }
  };

  const filteredRecordings = recordings.filter(
    (rec) =>
      rec.Processed &&
      rec.PublicUrl &&
      rec.UserId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <Box mb={4}>
          <TextField
            label="Search by User ID"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRecordings.length === 0 ? (
              <Typography variant="body1" color="textSecondary" ml={2}>
                No recordings found.
              </Typography>
            ) : (
              filteredRecordings.map((rec) => (
                //@ts-ignore
                <Grid item xs={12} sm={6} md={4} key={rec.Id}>
                  <Card sx={{ position: 'relative', transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        backgroundColor: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(rec.PublicUrl, '_blank')}
                    >
                      <PlayCircleOutlineIcon sx={{ fontSize: 50 }} />
                    </CardMedia>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                        Recording - {dayjs(rec.Date).format("MMM D, YYYY")}
                      </Typography>
                      <Chip
                        label={`User ID: ${rec.UserId.slice(0, 6)}...`}
                        size="small"
                        variant="outlined"
                      />
                    </CardContent>
                    <IconButton
                      onClick={() => confirmDelete(rec.Id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#fff',
                        '&:hover': { backgroundColor: '#ffe6e6' },
                      }}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Are you sure you want to delete this recording?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          action={
            <IconButton size="small" onClick={() => setSnackbar({ ...snackbar, open: false })}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          ContentProps={{
            sx: { backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' },
          }}
        />
      </Container>
    </Box>
  );
};

export default CallSetup;
