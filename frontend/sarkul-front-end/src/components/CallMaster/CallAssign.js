import React, {useEffect, useRef, useState} from 'react';
import SideBar from '../Sidebar/SideBar';
import Image from '../../assets/Sarkul.png';
import './styles.css';
import axios from 'axios';
import Loader from '../Loader';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SideBarMain from '../Sidebar/SideBarMain';

function CallAssign() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [arr, setArr] = useState([]);
  const callRef = useRef(null);
  const nameRef = useRef(null);

useEffect(()=>{
  getEngineerName();
},[])
async function getEngineerName()
 {
   try{
    let token= sessionStorage.getItem("accessToken");
    let url = 'https://sarkultechapi.onrender.com/api/v1/engineer?status=active';
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    let response = await axios.get(url,config);
    let eng = response.data.data?.data || response.data.data;
    setArr(Array.isArray(eng) ? eng : []);
   }
   catch(error)
   {
    console.log(error);
   }
 }

  async function handleSubmit(event) {
    setIsLoading(true);
    event.preventDefault();

    let data = {
      callId: callRef.current.value,
      engineerName:nameRef.current.value
      // engineerName: 'Albedo'
    };
    await postData(data);
    setIsLoading(false);
  }
 

  async function postData(data) {
    try {
      let token= sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/call/assign';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let response = await axios.post(url, data, config);
      // console.log("response in assign");
      // console.log(response.data);
      // setSuccessMsg(response?.data?.message);
      alert(response?.data?.message)

    }
    catch (error) {
      console.log("error while assigning: ");
      console.log(error);
      alert(error.response.data.message);
      // setErrorMsg(error.response.data.message);
    }

  }




  return (
    <div className='call-assign-parent'>
      <SideBarMain/>
      <SideBar/>
      <h2>Call Assign</h2>
      {/* <img className='image' src={Image} alt='Image here' /> */}
      {isLoading ? (<Loader />) :
        (
          <form className='call-assign-form' onSubmit={handleSubmit}>
            <h3>Assign the call to the Engineer</h3>
            <div className='call-assign-main'>
              <div className='call-assign-input'>
                <label>Call Number: </label>
                <input type='text' className='form-input' ref={callRef} required />
              </div>
              <div className='call-assign-input'>
                <label>Engineer Name: </label>
                <select id="dropdown" required ref={nameRef}>
              <option value="">-- Select --</option>
              {
                
                  arr.map((item)=>{
                    return <option value={item.employeeName}>{item.employeeName}</option>
                  })
                
              }
              </select>
              </div>
            </div>

            <input type='submit' value='Submit' className='submit-btn call-assign-btn' onSubmit={handleSubmit} />

            {/* {successMsg && (
              <ToastContainer
                position="center"
                closeOnClick
                pauseOnFocusLoss
                theme='light'
              >
                {toast.success(successMsg)}
              </ToastContainer>
            )}

            {errorMsg && (
              <ToastContainer
                position="right-center"
                closeOnClick
                pauseOnFocusLoss
                theme='light'>
                {toast.error(errorMsg)}
              </ToastContainer>
            )} */}

          </form>
        )}

    </div>
  );
}

export default CallAssign;