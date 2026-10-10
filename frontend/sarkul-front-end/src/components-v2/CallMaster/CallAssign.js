import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Stack, Autocomplete 
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import api from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const CallAssign = () => {
  const [callOptions, setCallOptions] = useState([]);
  const [engineerOptions, setEngineerOptions] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [callsRes, engRes] = await Promise.all([
          api.get('/call?status=pending&limit=100'),
          api.get('/engineer')
        ]);
        let calls = callsRes.data.data || callsRes.data;
        if (calls && !Array.isArray(calls) && Array.isArray(calls.data)) calls = calls.data;
        if (!Array.isArray(calls)) calls = [];

        let engs = engRes.data.data || engRes.data;
        if (engs && !Array.isArray(engs) && Array.isArray(engs.data)) engs = engs.data;
        if (!Array.isArray(engs)) engs = [];
        
        setCallOptions(calls);
        setEngineerOptions(engs);

        // Preselect if callId is in URL query
        const queryParams = new URLSearchParams(location.search);
        const urlCallId = queryParams.get('callId');
        if (urlCallId) {
          const matchedCall = calls.find(c => c.callId === urlCallId || c.callNumber === urlCallId);
          if (matchedCall) setSelectedCall(matchedCall);
        }
      } catch (err) {
        toast.error('Failed to load dropdown options');
      }
    };
    fetchData();
  }, [location.search]);

  const handleAssign = async () => {
    if (!selectedCall || !selectedEngineer) {
      toast.error('Please select both a call and an engineer.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/call/assign', { 
        callId: selectedCall.callId || selectedCall.callNumber,
        engineerCode: selectedEngineer.employeeCode
      });
      toast.success('Call assigned successfully!');
      setSelectedCall(null);
      setSelectedEngineer(null);
      navigate('/v2/call-master/pending');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Assign Call" />
      
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Assign Engineer to Call</Typography>
          <Stack spacing={3} mt={2}>
            <Autocomplete
              options={callOptions}
              getOptionLabel={(option) => `${option.callId || option.callNumber} - ${option.customerName}`}
              onChange={(e, newValue) => setSelectedCall(newValue)}
              value={selectedCall}
              renderInput={(params) => <TextField {...params} label="Select Pending Call" size="small" />}
            />

            <Autocomplete
              options={engineerOptions}
              getOptionLabel={(option) => `${option.employeeName} (${option.employeeCode})`}
              onChange={(e, newValue) => setSelectedEngineer(newValue)}
              value={selectedEngineer}
              renderInput={(params) => <TextField {...params} label="Select Engineer" size="small" />}
            />

            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAssign} 
              disabled={loading || !selectedCall || !selectedEngineer}
            >
              {loading ? 'Assigning...' : 'Assign Call'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CallAssign;
