import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import PageHeader from '../shared/PageHeader';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ManpowerEntry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    employeeContact: '',
    employeeDOB: '',
    employeeAddress: '',
    employeeDesignation: '',
    joinDate: '',
    salary: '',
    experience: '',
    qualification: '',
    reference: ''
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [files, setFiles] = useState({
    idProof: null,
    certificate: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!files.idProof || !files.certificate) {
      toast.error("Both ID Proof and Certificate are required!");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      data.append('skills', skills.join(','));
      data.append('idProof', files.idProof);
      data.append('certificate', files.certificate);

      const res = await api.post('/engineer', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(`Employee added successfully with Code: ${res.data.data.employeeCode}`);
      navigate('/v2/man-power/all');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Add New Employee"
        breadcrumbs={[
          { label: 'Dashboard', path: '/v2/dashboard' },
          { label: 'ManPower', path: '/v2/man-power/all' },
          { label: 'Entry' }
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="Full Name" name="employeeName" value={formData.employeeName} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="email" label="Email Address" name="employeeEmail" value={formData.employeeEmail} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="Contact Number" name="employeeContact" value={formData.employeeContact} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="date" label="Date of Birth" name="employeeDOB" value={formData.employeeDOB} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField fullWidth required label="Residential Address" name="employeeAddress" value={formData.employeeAddress} onChange={handleInputChange} />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4 }}>
              Employment Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="Designation" name="employeeDesignation" value={formData.employeeDesignation} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="date" label="Joining Date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="number" label="Salary (₹)" name="salary" value={formData.salary} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="number" label="Experience (Years)" name="experience" value={formData.experience} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="Reference (if any)" name="reference" value={formData.reference} onChange={handleInputChange} />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4 }}>
              Skills & Documents
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Skills (Type and press Enter)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="e.g. React, Node.js, Leadership"
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {skills.map((skill, index) => (
                    <Chip key={index} label={skill} onDelete={() => handleRemoveSkill(skill)} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ border: '1px dashed grey', p: 3, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>ID Proof Document (Required)</Typography>
                  <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                    Upload ID Proof
                    <input type="file" hidden name="idProof" onChange={handleFileChange} />
                  </Button>
                  {files.idProof && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      {files.idProof.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ border: '1px dashed grey', p: 3, borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>Qualification Certificate (Required)</Typography>
                  <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                    Upload Certificate
                    <input type="file" hidden name="certificate" onChange={handleFileChange} />
                  </Button>
                  {files.certificate && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      {files.certificate.name}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/v2/man-power/all')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Employee'}
              </Button>
            </Box>

          </CardContent>
        </Card>
      </form>
    </Box>
  );
};

export default ManpowerEntry;
