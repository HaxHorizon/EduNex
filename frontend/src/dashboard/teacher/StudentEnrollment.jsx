
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';

const StudentEnrollment = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({
    studentName: '',
    studentEmail: '',
    course: '',
    status: 'pending',
  });

  const handleAddEnrollment = () => {
    setEnrollments([
      ...enrollments,
      {
        ...newEnrollment,
        id: Date.now(),
        enrollmentDate: new Date().toLocaleDateString(),
      },
    ]);
    setNewEnrollment({
      studentName: '',
      studentEmail: '',
      course: '',
      status: 'pending',
    });
    setOpenDialog(false);
  };

  const handleDeleteEnrollment = (enrollmentId) => {
    setEnrollments(
      enrollments.filter((enrollment) => enrollment.id !== enrollmentId)
    );
  };

  const handleApproveEnrollment = (enrollmentId) => {
    setEnrollments(
      enrollments.map((enrollment) =>
        enrollment.id === enrollmentId
          ? { ...enrollment, status: 'approved' }
          : enrollment
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Student Enrollments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Enrollment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Enrollment Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.studentName}</TableCell>
                <TableCell>{enrollment.studentEmail}</TableCell>
                <TableCell>{enrollment.course}</TableCell>
                <TableCell>{enrollment.enrollmentDate}</TableCell>
                <TableCell>
                  <Chip
                    label={enrollment.status.toUpperCase()}
                    color={getStatusColor(enrollment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {enrollment.status === 'pending' && (
                    <IconButton
                      color="success"
                      onClick={() => handleApproveEnrollment(enrollment.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteEnrollment(enrollment.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Enrollment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Student Name"
            fullWidth
            value={newEnrollment.studentName}
            onChange={(e) =>
              setNewEnrollment({ ...newEnrollment, studentName: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Student Email"
            type="email"
            fullWidth
            value={newEnrollment.studentEmail}
            onChange={(e) =>
              setNewEnrollment({ ...newEnrollment, studentEmail: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Course"
            fullWidth
            value={newEnrollment.course}
            onChange={(e) =>
              setNewEnrollment({ ...newEnrollment, course: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEnrollment} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentEnrollment; 