import React from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const flats = [
  { id: 1, flatNumber: '101', block: 'A', floor: 1, type: '2BHK', owner: 'John Doe', status: 'Occupied' },
  { id: 2, flatNumber: '102', block: 'A', floor: 1, type: '2BHK', owner: 'Jane Smith', status: 'Occupied' },
  { id: 3, flatNumber: '201', block: 'A', floor: 2, type: '3BHK', owner: '-', status: 'Vacant' },
];

export default function FlatsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Flats Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Flat</Button>
      </Box>
      
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flat No.</TableCell>
                <TableCell>Block</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flats.map((flat) => (
                <TableRow key={flat.id}>
                  <TableCell>{flat.flatNumber}</TableCell>
                  <TableCell>{flat.block}</TableCell>
                  <TableCell>{flat.floor}</TableCell>
                  <TableCell>{flat.type}</TableCell>
                  <TableCell>{flat.owner}</TableCell>
                  <TableCell>
                    <Chip 
                      label={flat.status} 
                      color={flat.status === 'Occupied' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton><Edit /></IconButton>
                    <IconButton color="error"><Delete /></IconButton>
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
