import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';

const complaints = [
  { id: 1, flat: 'A-101', category: 'Water Leakage', description: 'Bathroom tap leaking', status: 'Open', date: '2024-01-18' },
  { id: 2, flat: 'B-201', category: 'Electrical', description: 'Power outage in bedroom', status: 'In Progress', date: '2024-01-17' },
  { id: 3, flat: 'C-301', category: 'Cleaning', description: 'Common area dirty', status: 'Resolved', date: '2024-01-15' },
];

export default function ComplaintsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Complaints</Typography>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flat</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>{complaint.flat}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>{complaint.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={complaint.status} 
                      color={complaint.status === 'Open' ? 'error' : complaint.status === 'Resolved' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{complaint.date}</TableCell>
                  <TableCell>
                    <Button size="small">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
