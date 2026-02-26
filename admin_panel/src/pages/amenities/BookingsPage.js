import React, { useState } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

const bookings = [
  { id: 1, member: 'John Doe', amenity: 'Swimming Pool', date: '2024-01-20', time: '10 AM - 11 AM', status: 'CONFIRMED' },
  { id: 2, member: 'Sarah Smith', amenity: 'Gym', date: '2024-01-21', time: '6 AM - 7 AM', status: 'PENDING' },
  { id: 3, member: 'Mike Johnson', amenity: 'Club House', date: '2024-01-22', time: '4 PM - 6 PM', status: 'CONFIRMED' },
];

const BookingsPage = () => {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>Amenity Bookings</Typography>
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField fullWidth placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
      </Card>
      <Card>
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell>Member</TableCell><TableCell>Amenity</TableCell><TableCell>Date</TableCell><TableCell>Time</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>{b.member}</TableCell><TableCell>{b.amenity}</TableCell><TableCell>{b.date}</TableCell><TableCell>{b.time}</TableCell>
                  <TableCell><Chip label={b.status} size="small" color={b.status === 'CONFIRMED' ? 'success' : 'warning'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
export default BookingsPage;
