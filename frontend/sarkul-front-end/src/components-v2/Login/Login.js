import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined as LockIcon, EmailOutlined as EmailIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/user/signin', { email, password });
      sessionStorage.setItem('accessToken', response.data.data);
      toast.success('Login successful!');
      
      // Determine destination based on UI version
      const uiVersion = localStorage.getItem('ui-version');
      if (uiVersion === 'classic') {
        window.location.href = '/';
      } else {
        window.location.href = '/v2/dashboard';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left side - Illustration */}
      <Grid 
        item 
        xs={false} 
        sm={4} 
        md={7} 
        sx={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          p: 4,
          position: 'relative'
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(26, 43, 74, 0.7)',
          zIndex: 1
        }} />
        <Box sx={{ maxWidth: 500, textAlign: 'center', zIndex: 2 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            SarKul Pro
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Premium Field Service Management Dashboard
          </Typography>
          {/* A simple geometric illustration placeholder */}
          <Box 
            sx={{
              width: '100%',
              height: 300,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ opacity: 0.8 }}>
              Modern Workflow Management
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Right side - Login Form */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please enter your details to sign in
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
