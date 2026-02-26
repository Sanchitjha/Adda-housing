import React from 'react';
import { Box, Typography, Card, Button, Grid, Chip, Avatar } from '@mui/material';
import { Add, Edit, Delete, CalendarMonth } from '@mui/icons-material';

const amenities = [
  { id: 1, name: 'Swimming Pool', icon: '🏊', timing: '6 AM - 9 PM', capacity: 30, bookings: 45, status: 'Active' },
  { id: 2, name: 'Gymnasium', icon: '🏋️', timing: '5 AM - 11 PM', capacity: 20, bookings: 120, status: 'Active' },
  { id: 3, name: 'Tennis Court', icon: '🎾', timing: '6 AM - 9 PM', capacity: 4, bookings: 28, status: 'Active' },
  { id: 4, name: 'Club House', icon: '🏠', timing: '8 AM - 10 PM', capacity: 50, bookings: 15, status: 'Active' },
  { id: 5, name: 'Garden', icon: '🌳', timing: '6 AM - 8 PM', capacity: 100, bookings: 0, status: 'Active' },
  { id: 6, name: 'Party Hall', icon: '🎉', timing: '10 AM - 12 PM', capacity: 150, bookings: 8, status: 'Active' },
];

export default function AmenitiesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Amenities Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Amenity</Button>
      </Box>
      <Grid container spacing={3}>
        {amenities.map((amenity) => (
          <Grid item xs={12} sm={6} md={4} key={amenity.id}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 28 }}>
                  {amenity.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{amenity.name}</Typography>
                  <Chip label={amenity.status} color="success" size="small" />
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <CalendarMonth sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {amenity.timing}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacity: {amenity.capacity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bookings: {amenity.bookings}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<Edit />}>Edit</Button>
                <Button size="small" color="error" startIcon={<Delete />}>Delete</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
