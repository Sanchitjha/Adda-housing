import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People,
  Home,
  Receipt,
  ReportProblem,
  HowToReg,
  TrendingUp,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const statsCards = [
  { title: 'Total Members', value: '245', icon: <People />, color: '#2563EB' },
  { title: 'Total Flats', value: '120', icon: <Home />, color: '#22C55E' },
  { title: 'Pending Bills', value: '45', icon: <Receipt />, color: '#F59E0B' },
  { title: 'Open Complaints', value: '12', icon: <ReportProblem />, color: '#EF4444' },
  { title: 'Today\'s Visitors', value: '28', icon: <HowToReg />, color: '#8B5CF6' },
  { title: 'Collection Rate', value: '92%', icon: <TrendingUp />, color: '#06B6D4' },
];

const recentPayments = [
  { id: 1, flat: 'A-101', name: 'John Doe', amount: 4500, date: '2024-01-20', status: 'Paid' },
  { id: 2, flat: 'A-102', name: 'Jane Smith', amount: 4500, date: '2024-01-20', status: 'Paid' },
  { id: 3, flat: 'B-201', name: 'Mike Johnson', amount: 5200, date: '2024-01-19', status: 'Pending' },
  { id: 4, flat: 'B-202', name: 'Sarah Williams', amount: 4500, date: '2024-01-19', status: 'Paid' },
  { id: 5, flat: 'C-301', name: 'Robert Brown', amount: 6000, date: '2024-01-18', status: 'Paid' },
];

const barChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Collection (₹)',
      data: [125000, 145000, 132000, 158000, 162000, 175000],
      backgroundColor: '#2563EB',
      borderRadius: 8,
    },
  ],
};

const doughnutData = {
  labels: ['Paid', 'Pending', 'Overdue'],
  datasets: [
    {
      data: [75, 18, 7],
      backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
      borderWidth: 0,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { display: false } },
    x: { grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
  cutout: '70%',
};

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Collections
              </Typography>
              <Box sx={{ height: 320 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Status
              </Typography>
              <Box sx={{ height: 280, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Payments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Payments
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Flat</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>{payment.flat}</TableCell>
                    <TableCell>{payment.name}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={payment.status === 'Paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
