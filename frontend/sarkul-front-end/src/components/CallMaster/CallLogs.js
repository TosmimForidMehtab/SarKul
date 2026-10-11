import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import axios from 'axios';
import Loader from '../Loader';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SideBarMain from '../Sidebar/SideBarMain'
import SideBar from '../Sidebar/SideBar'
import AddIcon from '@mui/icons-material/Add';
import { Autocomplete, Button, IconButton, Stack, TextField } from '@mui/material';

function CallLogs() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [groupState, setGroupState] = useState({
    add: false,
    groupArr: [],
    selectedGroup: '',
    newGroup: ''
  });
  const [successMsg, setSuccessMsg] = useState("");
  let serialNumber = "";
  let customerName = '';
  let customerCode = '';
  let contact = 0;
  let email = '';
  let address = '';
  let category = '';
  let problem = '';
  let modelNumber = '';
  let item = '';
  let userName = '';
  let serialNumberRef = useRef(null);
  let customerNameRef = useRef(null);
  let customerCodeRef = useRef(null);
  let contactRef = useRef(null);
  let emailRef = useRef(null);
  let addressRef = useRef(null);
  let categoryRef = useRef(null);
  let problemRef = useRef(null);
  let modelNumberRef = useRef(null);
  let itemRef = useRef(null);
  let userNameRef = useRef(null);
  let callNumber = 0;


  async function handleSubmit(event) {
    setIsLoading(true);
    event.preventDefault();
    serialNumber = serialNumberRef.current.value;
    userName = userNameRef.current.value;
    customerName = customerNameRef.current.value;
    customerCode = customerCodeRef.current.value;
    contact = contactRef.current.value;
    email = emailRef.current.value;
    address = addressRef.current.value;
    category = categoryRef.current.value;
    problem = problemRef.current.value;
    modelNumber = modelNumberRef.current.value;
    item = groupState.selectedGroup;

    let obj = {
      serialNumber: serialNumber,
      customerName: customerName,
      customerCode: customerCode,
      contactNumber: contact,
      customerEmail: email,
      userName: userName,
      customerAddress: address,
      problemDescription: problem,
      category: category,
      itemName: item,
      itemModelNumber: modelNumber
    };
    // console.log(obj, 'obj');
    await postData(obj);
    setIsLoading(false);

  }

  async function postData(data) {
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/call';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      const response = await axios.post(url, data, config);

      const callNumber = response.data.data;
      alert("Call Created with call number: " + callNumber);
      // setSuccessMsg(`${response.data.message} with id ${callNumber}`);

    } catch (error) {
      // console.error('Error:', error);
      // alert(error.response.data.message);
      setErrorMsg(error.response.data.message);
    }

  }

  async function getGroupName() {
    // setIsLoading(true);
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/group';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      const response = await axios.get(url, config);
      let temp = [];
      let groups = response?.data?.data?.data || (Array.isArray(response?.data?.data) ? (response.data.data[0]?.data || response.data.data) : []);
      (Array.isArray(groups) ? groups : []).forEach((item) => {
        if (item?.groupName && !item.groupName.includes('test') && !item.groupName.includes('Test')) {
          temp = [...temp, item.groupName];
        }
      });
      setGroupState((prev) => ({ ...prev, groupArr: temp }));


    }
    catch (error) {

      console.log(error?.response?.data?.message)
    }
    // setIsLoading(false);
  }

  const addGroupName = async () => {
    setIsLoading(true)
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/group';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };

      const data = { groupName: groupState.newGroup }

      const response = await axios.post(url, data, config);
      alert("Group added successfully")
      getGroupName()
      setGroupState((prev) => ({ ...prev, add: false }))

      setIsLoading(false)

    } catch (error) {
      alert(error.response.data.message)
      setIsLoading(false)
    }

  }
  const handleAddGroup = () => {
    addGroupName()

  }
  useEffect(() => {
    getGroupName();
  }, [])

  return (
    <div>
      {/* <img className='image' src={Image} alt='Image here'/> */}
      <SideBarMain />
      <SideBar />
      <h2>Call Log</h2>
      {isLoading ? (<Loader />) : (
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-left'>
            <div className='form-left-top'>
              <label>Serial number:</label> <input type='text' className='form-input' ref={serialNumberRef} /><br />
              <label>Customer Name:</label> <input type='text' className='form-input' required ref={customerNameRef} /><br />
              <label>Customer Code:</label> <input type='text' className='form-input' required ref={customerCodeRef} /><br />
              <label>User Name:</label> <input type='text' className='form-input' required ref={userNameRef} /><br />
            </div>

            <label>Contact:</label> <input type='number' className='form-input' required ref={contactRef} /><br />
            <label>Email id:</label> <input type='email' className='form-input' ref={emailRef} /><br />
          </div>
          <div className='form-right' >
            <label>Category:</label>
            <select id="dropdown" required ref={categoryRef}>
              <option value="">-- Select --</option>
              <option value="desktop">Desktop</option>
              <option value="laptop">Laptop</option>
              <option value="printer">Printer</option>
              <option value="plotter">Plotter</option>
              <option value="scanner">Scanner</option>
              <option value="server">Server</option>
              <option value="UPS">UPS</option>
              <option value="cctv">CCTV</option>
              <option value="activity">Activity</option>
            </select><br />
            {/* <label>Group:</label> */}
            {/* <input type='text' className='form-input' required ref={itemRef} /> */}
            {!groupState.add ? <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
              <Autocomplete
                required
                sx={{
                  width: '15rem',
                  margin: '1rem'
                }}
                options={groupState.groupArr || []}
                getOptionLabel={(option) => option}
                onChange={(event, value) => {
                  setGroupState((prev) => ({
                    ...prev,
                    selectedGroup: value
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Group"
                    variant="outlined"
                    fullWidth
                    required

                  />
                )}

              />
              <IconButton
                title='Click to add new group to the list'
                sx={{ height: '40px', width: '40px' }}
                onClick={() => { setGroupState((prev) => ({ ...prev, add: true })) }}
              >
                <AddIcon />
              </IconButton>
            </Stack>
              :
              <Stack direction={'row'} justifyContent={'center'}>
                <TextField
                  variant='outlined'
                  label='Group'
                  placeholder='Enter New group name to add'
                  onChange={(e) => { setGroupState((prev) => ({ ...prev, newGroup: e.target.value })) }}
                />
                <Button
                  title='Click to save group to the list'
                  sx={{ ml: '8px' }}
                  disabled={!groupState.newGroup}
                  onClick={handleAddGroup}
                >Add</Button>
              </Stack>
            }

            <br />
            <label>Address:</label> <input type='text' className='form-input' required ref={addressRef} /><br />
            <label>Problem:</label> <input type='text' className='form-input' required ref={problemRef} /><br />
            <div className='model-number'>
              <label>Model Number:</label> <input type='text' className='form-input' required ref={modelNumberRef} /><br />
            </div>

            <br /><br />

            <input type='submit' value='Submit' className='submit-btn' onSubmit={handleSubmit} />

          </div>

        </form>
      )}

      {
        errorMsg && <ToastContainer
          position="top-center"
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
        >
          {toast.error(errorMsg)}
        </ToastContainer>
      }
      {
        successMsg && <ToastContainer
          position="top-center"
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
        >
          {toast.success(successMsg)}
        </ToastContainer>
      }
    </div>



  );
}

export default CallLogs;