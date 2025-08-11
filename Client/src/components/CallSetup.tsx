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
  Fab,
  Avatar,
  Divider,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import { Controller } from "../api/function";
import dayjs from "dayjs";

const CallSetup = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteVideoURL, setDeleteVideoURL] = useState<string | null>(null);
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

  const confirmDelete = (id: number, VideoPublicURL: string) => {
    setSelectedId(id);
    setDeleteVideoURL(VideoPublicURL)
    setOpenDialog(true);
  };
  console.log(selectedId);

  const handleDelete = async () => { // To implement this
    if (selectedId === null || deleteVideoURL === null) return;
    try {
      await Controller.deleteRecording(selectedId, deleteVideoURL);
      setRecordings((prev) => prev.filter((rec) => rec.Id !== selectedId));
      setSnackbar({ open: true, message: "Recording deleted", error: false });
    } catch {
      setSnackbar({ open: true, message: "Failed to delete", error: true });
    } finally {
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  const filteredRecordings = recordings.filter(
    (rec) =>
      rec.Processed &&
      rec.PublicUrl &&
      rec.UserId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 70%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="md">
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              color: 'white',
              fontWeight: 700,
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Video Call Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 300,
              mb: 3
            }}
          >
            Start a new call or review your recorded sessions
          </Typography>

          <Button
            variant="contained"
            startIcon={<VideoCallIcon />}
            size="large"
            onClick={handleStartVideo}
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
            Start New Video Call
          </Button>
        </Paper>

        {/* Recordings Section */}
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            p: 4
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'white',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <PlayCircleOutlineIcon />
              Previous Recordings
            </Typography>
            <IconButton 
              onClick={fetchRecordings}
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box mb={4}>
            <TextField
              label="Search by User ID"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  color: 'white',
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: 'white',
                  }
                }
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredRecordings.length === 0 ? (
                <Grid item xs={12}>
                  <Box 
                    textAlign="center" 
                    py={6}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderRadius: 3,
                      border: '1px dashed rgba(255,255,255,0.3)'
                    }}
                  >
                    <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      No recordings found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Start your first video call to see recordings here
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredRecordings.map((rec) => (
                  //@ts-ignore
                  <Grid item xs={12} sm={6} md={4} key={rec.Id}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          bgcolor: 'rgba(255,255,255,0.15)',
                        }
                      }}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 140,
                          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                          },
                          '&:hover': {
                            '& .play-icon': {
                              transform: 'scale(1.1)',
                            }
                          }
                        }}
                        onClick={() => window.open(rec.PublicUrl, '_blank')}
                      >
                        <PlayCircleOutlineIcon 
                          className="play-icon"
                          sx={{ 
                            fontSize: 50,
                            transition: 'transform 0.3s ease',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                          }} 
                        />
                      </CardMedia>
                      <CardContent sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="bold" 
                          gutterBottom 
                          noWrap
                          sx={{ color: 'white' }}
                        >
                          Recording - {dayjs(rec.Date).format("MMM D, YYYY")}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Chip
                            label={`${rec.UserId.slice(0, 8)}...`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.8)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </CardContent>
                      <IconButton
                        onClick={() => confirmDelete(rec.Id, rec.PublicUrl)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          color: '#ff6b6b',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            bgcolor: 'rgba(255,107,107,0.2)',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              color: 'white'
            }
          }}
        >
          <DialogTitle sx={{ color: 'white' }}>
            Are you sure you want to delete this recording?
          </DialogTitle>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="contained"
              sx={{
                bgcolor: '#ff6b6b',
                '&:hover': { bgcolor: '#ff5252' }
              }}
            >
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
            sx: { 
              backgroundColor: snackbar.error ? '#d32f2f' : '#43a047',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </Container>
    </Box>
  );
};

export default CallSetup;
