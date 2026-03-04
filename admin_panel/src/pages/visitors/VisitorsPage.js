import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const visitors = [
  { id: 1, name: 'John Visitor', flat: 'A-101', purpose: 'Guest', inTime: '10:30 AM', outTime: '-', status: 'Inside' },
  { id: 2, name: 'Delivery Person', flat: 'B-201', purpose: 'Delivery', inTime: '11:00 AM', outTime: '11:15 AM', status: 'Left' },
  { id: 3, name: 'Service Engineer', flat: 'C-301', purpose: 'Maintenance', inTime: '09:00 AM', outTime: '12:00 PM', status: 'Left' },
];

export default function VisitorsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Visitors Log</Typography>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Flat</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>In Time</TableCell>
                <TableCell>Out Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell>{visitor.name}</TableCell>
                  <TableCell>{visitor.flat}</TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>{visitor.inTime}</TableCell>
                  <TableCell>{visitor.outTime}</TableCell>
                  <TableCell>
                    <Chip 
                      label={visitor.status} 
                      color={visitor.status === 'Inside' ? 'warning' : 'success'} 
                      size="small" 
                    />
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
