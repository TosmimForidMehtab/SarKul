import React, { useEffect, useState } from 'react'
import SideBar from '../Sidebar/SideBar';
import axios from 'axios';
import CallCard from '../Helper/CallCard/CallCard';
import Loader from '../Loader';
import { Link } from 'react-router-dom';
import SideBarMain from '../Sidebar/SideBarMain';

function CallRegister() {
  const [arr, setArr] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(()=>{
    getData();
  },[])
async function getData()
{
  setIsLoading(true)
  try{
    let token= localStorage.getItem("accessToken");
    let config={
        headers:{
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    }
    let url = 'https://sarkultechapi.onrender.com/api/v1/call'
    let response = await axios.get(url,config);
    // console.log("response in all call");
    // console.log(response.data.data);
    setArr(response.data.data);
    
    setIsLoading(false)
  }
  catch(error)
  {
    alert(error.response?.data.message);
    // console.log(error)
    setIsLoading(false)
  }
}
  return (
    <div>
      <SideBarMain/>
      <SideBar/>
      <h2> Call Register</h2>
      {isLoading? <Loader/>: 
     
      <ol>
        {arr.map((item)=>{
          return <Link to={`/callmaster/call-details-specific/${item.callId}`}> <CallCard callNumber={item.callId} customerName={item.customerName} date={item.createdAt}/> </Link>
        })}
      </ol>
     }
      </div>
  )
}

export default CallRegister