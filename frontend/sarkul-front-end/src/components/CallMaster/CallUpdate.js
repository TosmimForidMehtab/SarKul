import React, { useState, useRef } from 'react';
import SideBar from '../Sidebar/SideBar';
import './styles.css';
import Loader from '../Loader';
import axios from 'axios';
import SideBarMain from '../Sidebar/SideBarMain';

function CallUpdate() {
  const [callNumber, setCallNumber] = useState("28342");
  const [flag, setFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const callNumberRef = useRef(null);
  const [data, setData] = useState({});
  const [engineer, setEngineer] = useState("");
  let engineerRef = useRef(null);
  let customerRef = useRef(null);
  let partRef = useRef(null);
  let customerRemarks = "";
  let [engineerRemarks, setEnginnerRemarks] = useState('');
  let partStatus = "";

  async function getCall(e) {
    e.preventDefault();
    setIsLoading(true);
    setCallNumber(callNumberRef.current.value);
    try {
      let token = sessionStorage.getItem("accessToken");
      let config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let url = `https://sarkultechapi.onrender.com/api/v1/call/${callNumberRef.current.value}`;
      let response = await axios.get(url, config);
      setData(response.data.data);
      setEnginnerRemarks(response?.data?.data?.engineerRemark);
      if (response.data.data.engineersAssigned[0]) {
        setEngineer(response.data.data.engineersAssigned[0].employeeName);
      }
      setFlag(true);
      setIsLoading(false);
    }
    catch (error) {
      alert(error.response?.data?.message || "Failed to find call");
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setIsLoading(true);

    customerRemarks = customerRef.current.value;
    engineerRemarks = engineerRef.current.value;
    partStatus = partRef.current.value;
    try {
      let url = `https://sarkultechapi.onrender.com/api/v1/call/${callNumber}`;
      let data = {
        customerRemark: customerRemarks,
        engineerRemark: engineerRemarks,
        partStatus: partStatus,
        action: partStatus
      };
      let token = sessionStorage.getItem("accessToken");

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      let response = await axios.patch(url, data, config);
      setIsLoading(false);
      alert(response.data.message);
      return response;
    }
    catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
      setIsLoading(false);
      throw error;
    }
  }

  async function handleClose(e) {
    if (e && e.preventDefault) e.preventDefault();
    setIsLoading(true);
    try {
      await handleSubmit();
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
      setIsLoading(false);
    }
    catch (error) {
      setIsLoading(false);
      alert(error.response?.data?.message || "Failed to close call");
    }
  }

  return (
    <div>
      <SideBarMain />
      <SideBar />
      <h2>Call Update</h2>

      {isLoading ? (<Loader />) : (!flag ? (
        <form className='call-assign-form' onSubmit={getCall}>
          <h3>Update the Call here..</h3>
          <label>Call Number: </label><input type='text' className='form-input' required ref={callNumberRef} />
          <input type='submit' className='submit-btn' />
        </form>
      ) : (
        <div className='call-update-detail'>
          <div className='details'>
            <div className='call-update-left'>
              <label className='update-label'>Call Number: </label> {callNumber} <br /><br />
              <label className='update-label'>Serial Number: </label> {data.serialNumber}<br /><br />
              <label className='update-label'>Customer Name: </label> {data.customerName}<br /><br />
              <label className='update-label'>Customer Code: </label> {data.customerCode}<br /><br />
              <label className='update-label'>Contact: </label> {data.contactNumber}<br /><br />
              <label className='update-label'>Email: </label> {data.customerEmail}<br /><br />
            </div>
            <div className='call-update-right'>
              <label className='update-label'>Category: </label> {data.category}<br /><br />
              <label className='update-label'>Problem: </label> {data?.problemDescription}<br /><br />
              <label className='update-label'>Model Number: </label> {data.itemModelNumber}<br /><br />
              <label className='update-label'>Group: </label> {data.itemName}<br /><br />
              <label className='update-label'>Address: </label> {data.customerAddress}<br /><br />
              <label className='update-label'>Engineer Assigned: </label> {engineer}
            </div>
          </div>

          <form className='update-form' onSubmit={handleSubmit}>
            <div className='update-form-input'>
              <label>Customer's remarks: </label>
              <input type='text' className='form-input' value={data?.problemDescription || ''} disabled required ref={customerRef} /><br />
              <label>Engineer's remarks: </label>
              <input type='text' className='form-input' value={engineerRemarks} onChange={(e) => { setEnginnerRemarks(e.target.value); }} required ref={engineerRef} />
            </div>
            <div className='update-form-right'>
              <label id='part-label'>Part Status:</label>
              <select id="dropdown" ref={partRef} required >
                <option value="">-- Select --</option>
                <option value="required">Part Required</option>
                <option value="pending">Part Pending</option>
                <option value="replace">Part Replace</option>
                <option value="chargeable">Chargeable</option>
                <option value="serviceAndClose">Service and Close</option>
                <option value="cancelAndClose">Cancel and Close</option>
                <option value="customerDependence">Customer dependence</option>
                <option value="oemPending">OEM Pending</option>
              </select>

              <div className='form-buttons'>
                <input type='submit' value='Update' className='submit-btn update-btn' />
                <button type='button' id='close-call' onClick={handleClose}>Call Close</button>
              </div>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}

export default CallUpdate;
