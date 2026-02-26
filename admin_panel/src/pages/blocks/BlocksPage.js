import React from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const blocks = [
  { id: 1, name: 'Block A', code: 'A', floors: 10, flats: 40 },
  { id: 2, name: 'Block B', code: 'B', floors: 8, flats: 32 },
  { id: 3, name: 'Block C', code: 'C', floors: 12, flats: 48 },
];

export default function BlocksPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Blocks Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Block</Button>
      </Box>
      
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Block Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Floors</TableCell>
                <TableCell>Flats</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>{block.name}</TableCell>
                  <TableCell>{block.code}</TableCell>
                  <TableCell>{block.floors}</TableCell>
                  <TableCell>{block.flats}</TableCell>
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
