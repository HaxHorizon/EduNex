import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Card sx={{ maxWidth: 345, m: 2, height: '100%' }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Teacher: {course.teacher?.fullName || 'Unknown'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Course Code: {course.code}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {course.resources?.length || 0} Resources
          </Typography>
          <Button
            component={Link}
            to={`/courses/${course._id}`}
            variant="contained"
            size="small"
          >
            View Course
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard; 