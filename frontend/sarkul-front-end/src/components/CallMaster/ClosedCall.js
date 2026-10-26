import React, { useEffect, useState } from 'react';
import SideBar from '../Sidebar/SideBar';
import axios from 'axios';
import CallCard from '../Helper/CallCard/CallCard';
import Loader from '../Loader';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SideBarMain from '../Sidebar/SideBarMain';
import ExcelJS from 'exceljs';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, IconButton, Stack, Typography } from '@mui/material';

function ClosedCall() {
  const [arr, setArr] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [state, setState] = useState({ date: { from: '', to: '', disabled: true } });

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setIsLoading(true);
    let token = sessionStorage.getItem("accessToken");
    let config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    try {
      let url = 'https://sarkultechapi.onrender.com/api/v1/call/closed?limit=10000';
      let response = await axios.get(url, config);
      let calls = response.data.data?.data || response.data.data;
      let safeList = Array.isArray(calls) ? [...calls].reverse() : [];
      setArr(safeList);
      setSuccessMsg(response.data.message);
      setIsLoading(false);
    }
    catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to load closed calls");
      setIsLoading(false);
    }
  }

  const getFilteredData = async (startDate, endDate) => {
    setIsLoading(true);
    try {
      let token = sessionStorage.getItem("accessToken");
      let config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let url = `https://sarkultechapi.onrender.com/api/v1/call?startDate=${startDate}&endDate=${endDate}&limit=10000`;
      let response = await axios.get(url, config);
      let calls = response.data.data?.data || response.data.data;
      let safeList = Array.isArray(calls) ? calls : [];
      let temp = safeList.filter((item) => { return item.status === 'completed'; });
      setArr(temp);
      setIsLoading(false);
    }
    catch (error) {
      alert(error.response?.data?.message || "Failed to filter calls");
      setIsLoading(false);
    }
  };

  function convertDateFormat(inputDate) {
    if (!inputDate) return '';
    var parts = inputDate.split("-");
    if (parts.length < 3) return inputDate;
    var outputDate = parts[2] + "-" + parts[1] + "-" + parts[0];
    return outputDate;
  }

  const formatAction = (call) => {
    const val = call?.action || call?.itemStatus;
    if (val) {
      const mapping = {
        serviceAndClose: 'Service and Close',
        cancelAndClose: 'Cancel and Close',
        customerDependence: 'Customer Dependence',
        oemPending: 'OEM Pending',
        replace: 'Part Replace',
        required: 'Part Required',
        pending: 'Part Pending',
        chargeable: 'Chargeable'
      };
      return mapping[val] || val;
    }
    return call?.status === 'completed' ? 'Closed' : (call?.status || 'Pending');
  };

  const getCloseDate = (call) => {
    if (call?.closedAt) return convertDateFormat(String(call.closedAt).substring(0, 10));
    if (call?.status === 'completed' && call?.updatedAt) return convertDateFormat(String(call.updatedAt).substring(0, 10));
    return 'Pending';
  };

  const downloadExcel = async () => {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();

    var formattedDate = day + "/" + month + "/" + year;
    const arrWithoutUnwantedFields = arr.map(({ _id, __v, ...rest }) => rest);
    const arrWithNewOrder = arrWithoutUnwantedFields.map(({ createdAt, callId, customerName, customerCode, userName, contactNumber, customerEmail, problemDescription, engineersAssigned, ...rest }) => ({
      'Date': createdAt ? convertDateFormat(createdAt.substring(0, 10)) : '',
      'Call Id': callId || '',
      'Customer Name': customerName || '',
      'Customer Code': customerCode || '',
      'User Name': userName || '',
      'Contact Number': contactNumber || '',
      'Customer Email': customerEmail || '',
      'Problem Description': problemDescription || '',
      'Call Log': problemDescription || rest.customerRemark || '',
      'Call Log Date': createdAt ? convertDateFormat(createdAt.substring(0, 10)) : '',
      'Engineers Assigned': engineersAssigned?.[0]?.engineerName || '',
      'Serial Number': rest.serialNumber || '',
      'Customer Address': rest.customerAddress || '',
      'Status': rest.status || '',
      'Category': rest.category || '',
      'Group': rest.itemName || '',
      'Item Model Number': rest.itemModelNumber || '',
      'Action': formatAction(rest),
      'Part Status': rest.itemStatus || '',
      'Close Date': getCloseDate(rest),
      'Closed Date': getCloseDate(rest)
    }));

    if (!arrWithNewOrder || arrWithNewOrder.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Calls');

    const headers = Object.keys(arrWithNewOrder[0]);
    worksheet.addRow(headers);

    arrWithNewOrder.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.eachCell((cell) => {
        cell.style = {
          ...cell.style,
          padding: {
            top: 5,
            left: 5,
            bottom: 5,
            right: 5
          }
        };
      });
      column.width = Math.min(100, Math.max(10, header.length * 2.8));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call_closed_data${formattedDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SideBarMain />
      <SideBar />
      <Stack direction={'row'} p={1} bgcolor={'white'} gap={2} >
        <Stack pl={'20%'}>
          {state.date.disabled ? (
            <Button onClick={() => { setState({ ...state, date: { ...state.date, disabled: false } }) }}>Filter By Date</Button>
          ) : (
            <Button onClick={() => { setState({ ...state, date: { ...state.date, disabled: true, from: '', to: '' } }); getData() }}>Clear Filter</Button>
          )}

        </Stack>
        <Typography variant='body1'>| |</Typography>
        <Stack direction={'row'} gap={7}>
          <Stack direction={'row'} gap={1.7} height={'30px'}>
            <label>From: </label>
            <input type='date'
              style={{ cursor: !state.date.disabled ? 'pointer' : '', backgroundColor: state.date.disabled ? '#e0e0e0' : '', padding: '0px' }}
              value={state.date.from}
              disabled={state.date.disabled}
              onChange={(e) => { setState({ ...state, date: { ...state.date, from: e.target.value } }) }}

            />
          </Stack>
          <Stack direction={'row'} gap={1.7} height={'30px'}>
            <label>To: </label>
            <input type='date'
              style={{ cursor: !state.date.disabled ? 'pointer' : '', backgroundColor: state.date.disabled ? '#e0e0e0' : '', padding: '0px' }}
              value={state.date.to}
              disabled={state.date.disabled}
              onChange={(e) => { setState({ ...state, date: { ...state.date, to: e.target.value } }) }}

            />
          </Stack>
        </Stack>
        <Typography variant='body1'>| |</Typography>
        <Stack >
          <Button variant='contained'
            disabled={(!state.date.from) || (!state.date.to)}
            onClick={() => { getFilteredData(state.date.from, state.date.to) }}
          >
            Filter
          </Button>
        </Stack>
        <Typography variant='body1'>| |</Typography>
        <Stack  >
          <IconButton title={'Download Report'} aria-label="download"
            disabled={arr.length === 0}
            onClick={downloadExcel}
          >
            <DownloadIcon sx={{ color: arr.length > 0 ? 'black' : 'grey' }} />
          </IconButton>
        </Stack>
      </Stack>

      {isLoading ? <Loader /> :
        arr.length > 0 ?
          <Stack alignItems={'center'}>
            {arr.map((item) => {
              return <CallCard key={item.callId} callNumber={item.callId} customerName={item.customerName} date={item.createdAt} link={`/callmaster/call-details-specific/${item.callId}`} isPending={false} problemDescription={item.problemDescription} />;
            })}
          </Stack> : <Stack color={'var(--red)'}>No Results</Stack>
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
  );
}

export default ClosedCall;
