import React, { useEffect, useState } from 'react'
import './styles.css';
import SideBar from '../../Sidebar/SideBar';
import axios from 'axios';
import Loader from '../../Loader';
import { useParams } from 'react-router-dom';


function CallDetails({ callNumber, setFlag }) {
  const { callId } = useParams();
  // console.log(callId);
  if (callId) {
    callNumber = callId;
  }

  useEffect(() => { getData() }, [callNumber])
  const [isLoading, setIsLoading] = useState(false)
  const [problem, setProblem] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerCode, setCustomerCode] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [category, setCategory] = useState("")
  const [modelNumber, setModelNumber] = useState("")
  const [item, setItem] = useState("")
  const [engineer, setEngineer] = useState("")
  const [date, setDate] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [status, setStatus] = useState("")
  const [obj, setObj] = useState({});


  async function getData() {
    setIsLoading(true);
    try {
      let token = sessionStorage.getItem("accessToken");
      let config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }

      let url = `https://sarkultechapi.onrender.com/api/v1/call/${callNumber}`;
      // let url = `https://sarkultechapi.onrender.com/api/v1/call?`;

      let response = await axios.get(url, config);
      console.log(response, 'response here');
      let callData = response.data.data || {};
      setObj(callData);
      setSerialNumber(callData.serialNumber || '');
      setCustomerName(callData.customerName || '');
      setCustomerCode(callData.customerCode || '');
      setContact(callData.contactNumber || '');
      setEmail(callData.customerEmail || '');
      setAddress(callData.customerAddress || '');
      setCategory(callData.category || '');
      setProblem(callData.problemDescription || '');
      setModelNumber(callData.itemModelNumber || '');
      setItem(callData.itemName || '');
      if (callData.engineersAssigned && callData.engineersAssigned.length > 0) {
        setEngineer(callData.engineersAssigned[callData.engineersAssigned.length - 1]?.employeeName || '');
      } else {
        setEngineer('Not Assigned');
      }
      setDate(callData.createdAt || '');
      setStatus(callData.status || '');
      //  console.log("problem")
      //  console.log(problem)
      console.log(response.data.data);
      setIsLoading(false);
    }
    catch (error) {
      console.log("error found is: " + error);
      setIsLoading(false);
      alert(error.response.data.message);
      setFlag(false);
    }
  }



  return (
    <div className='call-details-wrapper'>
      <SideBar />

      {isLoading ? <Loader /> : (
        <div>
          <h3 id='call-details-h3'>Call Details</h3>
          <div className='details call-details-card'>
            <div className='call-update-left2 call-update-left'>
              <label className='update-label call-detail-label'>Call Number: </label> {callNumber} <br /><br />
              <label className='update-label call-detail-label'>Serial Number: </label> {serialNumber}<br /><br />
              <label className='update-label call-detail-label'>Customer Name: </label> {customerName}<br /><br />
              <label className='update-label call-detail-label'>Customer Code: </label> {customerCode}<br /><br />
              <label className='update-label call-detail-label'>User Name: </label> {obj?.userName}<br /><br />
              <label className='update-label call-detail-label'>Contact: </label> {contact}<br /><br />
              <label className='update-label call-detail-label'>Email: </label> {email}<br /><br />
              <label className='update-label call-detail-label'>Call Status: </label> {status}<br /><br />
              <label className='update-label call-detail-label'>Customer Remarks: </label> {obj?.customerRemark}<br /><br />
              <label className='update-label call-detail-label'>Engineer Remarks: </label> {obj?.engineerRemark}<br /><br />


            </div>
            <div className='call-update-right2 call-update-right'>
              <label className='update-label call-detail-label'>Category: </label> {category}<br /><br />
              <label className='update-label call-detail-label'>Problem: </label> {problem}<br /><br />
              <label className='update-label call-detail-label'>Model Number: </label> {modelNumber}<br /><br />
              <label className='update-label call-detail-label'>Group: </label> {item}<br /><br />
              <label className='update-label call-detail-label'>Address: </label> {address}<br /><br />
              <label className='update-label call-detail-label'>Engineer Assigned: </label> {engineer}<br /><br />
              <label className='update-label call-detail-label'>Call-log Date: </label> {date ? date.slice(0, 10) : 'N/A'}<br /><br />
              <label className='update-label call-detail-label'>Part Status: </label> {obj?.itemStatus}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default CallDetails;