import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import axios from 'axios';
import ResourceList from '../components/ResourceList';
import ModuleList from '../components/ModuleList';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!course) {
    return <Typography>Course not found</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Course Code: {course.code}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                {course.teacher?.fullName?.charAt(0) || 'T'}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {course.teacher?.fullName || 'Unknown Teacher'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {course.teacher?.email || ''}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Contact Teacher
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Course Modules
            </Typography>
            <ModuleList modules={course.modules} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Course Resources
            </Typography>
            <ResourceList resources={course.resources} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CourseDetail; 