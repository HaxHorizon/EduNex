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
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const ResourceUpload = () => {
  const [resources, setResources] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    file: null,
    type: '',
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewResource({
        ...newResource,
        file,
        type: file.type.split('/')[1] || 'file',
      });
    }
  };

  const handleUploadResource = () => {
    if (newResource.file) {
      setResources([
        ...resources,
        {
          ...newResource,
          id: Date.now(),
          uploadDate: new Date().toLocaleDateString(),
        },
      ]);
      setNewResource({ title: '', description: '', file: null, type: '' });
      setOpenDialog(false);
    }
  };

  const handleDeleteResource = (resourceId) => {
    setResources(resources.filter((resource) => resource.id !== resourceId));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Course Resources</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Upload Resource
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {resources.map((resource) => (
                  <ListItem
                    key={resource.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={resource.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Uploaded: {resource.uploadDate}
                          </Typography>
                          <br />
                          {resource.description}
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={resource.type.toUpperCase()}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
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
        <DialogTitle>Upload New Resource</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resource Title"
            fullWidth
            value={newResource.title}
            onChange={(e) =>
              setNewResource({ ...newResource, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newResource.description}
            onChange={(e) =>
              setNewResource({ ...newResource, description: e.target.value })
            }
          />
          <Box sx={{ mt: 2 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Choose File
              </Button>
            </label>
            {newResource.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {newResource.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadResource}
            variant="contained"
            disabled={!newResource.file}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceUpload; 