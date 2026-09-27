import React, { useEffect, useState } from 'react'
import './styles.css';
import { Autocomplete, Button, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../Loader';

function CallCard({ callNumber, customerName, date, link, isPending, engineers, problemDescription, onCallUpdated }) {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState({
    showEngineer: false,
    engineer: null,
    showUpdate: false
  });

  const [updateData, setUpdateData] = useState({
    engineerRemark: '',
    partStatus: ''
  });

  async function handleSubmit() {

    let data = {
      callId: callNumber,
      engineerName: state.engineer
    };
    await postData(data);
  }


  async function postData(data) {
    try {
      setIsLoading(true)
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/call/assign';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let response = await axios.post(url, data, config);
      setState((prev) => ({ ...prev, showEngineer: false, engineer: null }))
      alert(response?.data?.message)
      setIsLoading(false)
    }
    catch (error) {
      console.log("error while assigning: ");
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
      setIsLoading(false)
    }

  }

  async function performUpdate() {
      let url = `https://sarkultechapi.onrender.com/api/v1/call/${callNumber}`;
      let data = {
        customerRemark: problemDescription || "",
        engineerRemark: updateData.engineerRemark,
        partStatus: updateData.partStatus
      };
      let token = sessionStorage.getItem("accessToken");
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      return await axios.patch(url, data, config);
  }

  async function handleUpdateSubmit() {
    try {
      setIsLoading(true);
      let response = await performUpdate();
      alert(response.data.message);
      setState(prev => ({...prev, showUpdate: false}));
      if (onCallUpdated) onCallUpdated();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCallClose() {
    try {
      setIsLoading(true);
      await performUpdate();
      let token = sessionStorage.getItem("accessToken");
      let url = `https://sarkultechapi.onrender.com/api/v1/call/close/${callNumber}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      let response = await axios.post(url, null, config);
      alert(response.data.message);
      setState(prev => ({...prev, showUpdate: false}));
      if (onCallUpdated) onCallUpdated();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    isLoading ?
      <Loader />
      :
      <Stack
        direction={'row'}
        border={'1px solid grey'}
        borderRadius={'10px'}
        m={1}
        width={'75%'}
        p={1}
        height={''}
        justifyContent={'space-between'}

      >
        <h3 >Call number: {callNumber}</h3>
        <h3 >Customer Name: {customerName}</h3>
        <h3 >Date: {date.slice(0, 10)}</h3>
        <Stack alignItems={'center'} direction={'row'} gap={2} >
          {isPending && !state.showEngineer && !state.showUpdate && <Button
            variant='contained'
            sx={{
              height: '35px',
              width: '140px',
            }}
            onClick={() => { setState((prev) => ({ ...prev, showEngineer: true })) }}
          >
            Call Assign
          </Button>
          }
          {isPending && !state.showEngineer && !state.showUpdate && <Button
            variant='contained'
            sx={{
              height: '35px',
              width: '140px',
            }}
            onClick={() => { setState((prev) => ({ ...prev, showUpdate: true })) }}
          >
            Call Update
          </Button>
          }
          
          {isPending && state.showEngineer && <Stack alignItems={'center'} direction={'row'}>
            <Autocomplete
              required
              sx={{
                width: '15rem',
                margin: '1rem'
              }}
              options={engineers || []}
              getOptionLabel={(option) => option?.employeeName}
              onChange={(event, value) => {
                setState((prev) => ({
                  ...prev,
                  engineer: value?.employeeName
                }))
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Engineers"
                  variant="outlined"
                  fullWidth
                  required

                />
              )}

            />
            <Button
              variant='contained'
              disabled={!state.engineer}
              sx={{
                height: '35px',
                width: '140px'
              }}
              onClick={() => {
                handleSubmit()
              }}
            >Assign </Button>
            <Button
              sx={{ height: '35px', ml: 1 }}
              onClick={() => setState(prev => ({...prev, showEngineer: false}))}
            >Cancel</Button>
          </Stack>}

          {isPending && state.showUpdate && (
            <Stack direction={'row'} gap={1} alignItems={'center'} margin={'1rem'}>
              <TextField 
                label="Engineer's remarks" 
                size="small"
                required
                value={updateData.engineerRemark} 
                onChange={(e) => setUpdateData({...updateData, engineerRemark: e.target.value})} 
              />
              <TextField 
                select
                label="Part Status"
                size="small"
                required
                value={updateData.partStatus}
                onChange={(e) => setUpdateData({...updateData, partStatus: e.target.value})}
                SelectProps={{ native: true }}
                sx={{ width: '180px' }}
              >
                <option value=""></option>
                <option value="required">Part Required</option>
                <option value="pending">Part Pending</option>
                <option value="replace">Part Replace</option>
                <option value="chargeable">Chargeable</option>
                <option value="serviceAndClose">Service and Close</option>
                <option value="cancelAndClose">Cancel and Close</option>
                <option value="customerDependence">Customer dependence</option>
                <option value="oemPending">OEM Pending</option>
              </TextField>
              
              <Button 
                variant='contained' 
                size="small"
                onClick={handleUpdateSubmit} 
                disabled={!updateData.engineerRemark || !updateData.partStatus}
              >
                Update
              </Button>
              <Button 
                variant='contained' 
                color='error' 
                size="small"
                onClick={handleCallClose} 
                disabled={!updateData.engineerRemark || !updateData.partStatus}
              >
                Close Call
              </Button>
              <Button size="small" onClick={() => setState(prev => ({...prev, showUpdate: false}))}>
                Cancel
              </Button>
            </Stack>
          )}

          {(!state.showEngineer && !state.showUpdate) && <Button
            onClick={() => { nav(link) }}
            sx={{
              height: '35px',
              width: '140px'
            }}
          >
            View Detail
          </Button>}
        </Stack>

      </Stack>

  )
}

export default CallCard