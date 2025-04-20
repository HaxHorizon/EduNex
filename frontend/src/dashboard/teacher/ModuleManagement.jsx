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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const ModuleManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    order: '',
  });

  const handleCreateModule = () => {
    setModules([...modules, { ...newModule, id: Date.now() }]);
    setNewModule({ title: '', description: '', order: '' });
    setOpenDialog(false);
  };

  const handleDeleteModule = (moduleId) => {
    setModules(modules.filter((module) => module.id !== moduleId));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Course Modules</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Module
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <List>
                {modules.map((module) => (
                  <ListItem
                    key={module.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={module.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Order: {module.order}
                          </Typography>
                          <br />
                          {module.description}
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
        <DialogTitle>Create New Module</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Module Title"
            fullWidth
            value={newModule.title}
            onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Module Order"
            type="number"
            fullWidth
            value={newModule.order}
            onChange={(e) => setNewModule({ ...newModule, order: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newModule.description}
            onChange={(e) =>
              setNewModule({ ...newModule, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateModule} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModuleManagement; 