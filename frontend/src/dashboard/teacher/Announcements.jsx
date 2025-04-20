import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal',
  });

  const handleCreateAnnouncement = () => {
    setAnnouncements([
      ...announcements,
      {
        ...newAnnouncement,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
      },
    ]);
    setNewAnnouncement({ title: '', content: '', priority: 'normal' });
    setOpenDialog(false);
  };

  const handleDeleteAnnouncement = (announcementId) => {
    setAnnouncements(
      announcements.filter((announcement) => announcement.id !== announcementId)
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Course Announcements</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Announcement
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {announcements.map((announcement) => (
                  <ListItem
                    key={announcement.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{announcement.title}</Typography>
                          <Chip
                            label={announcement.priority.toUpperCase()}
                            size="small"
                            color={getPriorityColor(announcement.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Posted: {announcement.date}
                          </Typography>
                          <br />
                          {announcement.content}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={newAnnouncement.content}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
            }
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Priority
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['normal', 'medium', 'high'].map((priority) => (
                <Chip
                  key={priority}
                  label={priority.toUpperCase()}
                  color={getPriorityColor(priority)}
                  variant={
                    newAnnouncement.priority === priority ? 'filled' : 'outlined'
                  }
                  onClick={() =>
                    setNewAnnouncement({ ...newAnnouncement, priority })
                  }
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements; 