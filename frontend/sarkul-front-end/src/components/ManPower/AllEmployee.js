import React, { useEffect, useState } from 'react'
import SideBarMp from '../Sidebar/SideBarMp';
import axios from 'axios';
import Loader from '../Loader';
import { Link } from 'react-router-dom';
import EmployeeCard from '../Helper/EmployeeCard';
import SideBarMain from '../Sidebar/SideBarMain'
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
function AllEmployee() {
    const [arr, setArr] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("");
    useEffect(()=>{
        getData();
    }, []);

    async function getData(){
        setIsLoading(true);
            try
            {
                let token= sessionStorage.getItem("accessToken");
                 let url= 'https://sarkultechapi.onrender.com/api/v1/engineer'
                let config={
                     headers:{
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                     }
                }
            
            let response = await axios.get(url,config);
            let empList = response.data.data?.data || response.data.data;
            setArr(Array.isArray(empList) ? empList : []);
            setIsLoading(false);
            }
            catch(error)
            { 
                setErrorMsg(error.response.data.message);
                setIsLoading(false);
            }
    }


  return (
    <div>
      <SideBarMain/>
        <SideBarMp/>
        <h2>All Employee</h2>

        {isLoading? ( <Loader/> ): 
        (
            <ol>
            {arr.map((item)=>{
            //   return <Link to={`/callmaster/call-details-specific/${item.callId}`}> 
            //   <EmployeeCard id={item.id} name={} contact={}    />
            //   </Link>
              return  <Link to={`/manpower/manpower-specific/${item.employeeCode}`}> <EmployeeCard id={item.employeeCode} name={item.employeeName} contact={item.status}    /> </Link>
             
              
            })}
          </ol>

        )
    }
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
        
    </div>
  )
}

export default AllEmployee