import React, { useEffect, useState } from "react";
import SideBar from "../Sidebar/SideBar";
import Image from "../../assets/Sarkul.png";
import CallCard from "../Helper/CallCard/CallCard";
import axios from "axios";
import Loader from "../Loader";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBarMain from "../Sidebar/SideBarMain";
import ExcelJS from "exceljs";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function PendingCallReports() {
  const [arr, setArr] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [state, setState] = useState({
    date: { from: "", to: "", disabled: true },
  });
  useEffect(() => {
    getData();
  }, []);

  const [engineers, setEngineers] = useState([]);
  useEffect(() => {
    getEngineerName();
  }, [])
  async function getEngineerName() {
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/engineer?status=active';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let response = await axios.get(url, config);
      setEngineers(response.data.data);
    }
    catch (error) {
      console.log(error);
    }
  }

  async function getData() {
    setIsLoading(true);
    try {
      const createdAt = new Date("2024-01-29");
      // let url = `https://sarkultechapi.onrender.com/api/v1/call/pending?createdAt=${createdAt}`;
      let token = sessionStorage.getItem("accessToken");
      let config = {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      };
      let url = "https://sarkultechapi.onrender.com/api/v1/call/pending";
      let response = await axios.get(url, config);
      setArr(response?.data.data);
      setSuccessMsg(response?.data.message);
      setIsLoading(false);
    } catch (error) {
      setErrorMsg(error.response?.data.message);
      setIsLoading(false);
    }
  }

  const getFilteredData = async (startDate, endDate) => {
    setIsLoading(true);
    try {
      console.log(startDate, "........", endDate);
      let token = sessionStorage.getItem("accessToken");
      let config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      let url = `https://sarkultechapi.onrender.com/api/v1/call?startDate=${startDate}&endDate=${endDate}`;
      let response = await axios.get(url, config);
      let temp = response.data.data.filter((item) => {
        return item.status == "pending";
      });
      setArr(temp);

      setIsLoading(false);
    } catch (error) {
      alert(error.response?.data.message);

      setIsLoading(false);
    }
  };

  function convertDateFormat(inputDate) {
    var parts = inputDate.split("-");
    var outputDate = parts[2] + "-" + parts[1] + "-" + parts[0];

    return outputDate;
  }

  const downloadExcel = async () => {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();

    var formattedDate = day + "/" + month + "/" + year;
    const arrWithoutUnwantedFields = arr.map(
      ({ _id, updatedAt, __v, ...rest }) => rest
    );
    const arrWithNewOrder = arrWithoutUnwantedFields.map(
      ({
        createdAt,
        callId,
        customerName,
        customerCode,
        userName,
        contactNumber,
        customerEmail,
        problemDescription,
        engineersAssigned,
        ...rest
      }) => ({
        createdAt: convertDateFormat(createdAt.substring(0, 10)),
        "Call Id": callId,
        "Customer Name": customerName,
        "Customer Code": customerCode,
        "User Name": userName,
        "Contact Number": contactNumber,
        "Customer Email": customerEmail,
        "Problem Description": problemDescription,
        "Engineers Assigned": engineersAssigned[0]?.engineerName,
        "Serial Number": rest.serialNumber,
        "Customer Address": rest.customerAddress,
        Status: rest.status,
        Category: rest.category,
        "Group": rest.itemName,
        "Item Model Number": rest.itemModelNumber,
      })
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Calls");

    const headers = Object.keys(arrWithNewOrder[0]).map((header) =>
      header === "createdAt" ? "Date" : header
    );
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
            right: 5,
          },
        };
      });
      column.width = Math.min(100, Math.max(10, header.length * 2.8));
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call_pending_data${formattedDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SideBarMain />
      <SideBar />
      <Stack direction={"row"} p={1} bgcolor={"white"} gap={2}>
        <Stack pl={"20%"}>
          {state.date.disabled ? (
            <Button
              onClick={() => {
                setState({
                  ...state,
                  date: { ...state.date, disabled: false },
                });
              }}
            >
              Filter By Date
            </Button>
          ) : (
            <Button
              onClick={() => {
                setState({
                  ...state,
                  date: { ...state.date, disabled: true, from: "", to: "" },
                });
                getData();
              }}
            >
              Clear Filter
            </Button>
          )}
        </Stack>
        <Typography variant="body1">| |</Typography>
        <Stack direction={"row"} gap={7}>
          <Stack direction={"row"} gap={1.7} height={"30px"}>
            <label>From: </label>
            <input
              type="date"
              style={{
                cursor: !state.date.disabled ? "pointer" : "",
                backgroundColor: state.date.disabled ? "#e0e0e0" : "",
                padding: "0px",
              }}
              value={state.date.from}
              disabled={state.date.disabled}
              onChange={(e) => {
                setState({
                  ...state,
                  date: { ...state.date, from: e.target.value },
                });
              }}
            />
          </Stack>
          <Stack direction={"row"} gap={1.7} height={"30px"}>
            <label>To: </label>
            <input
              type="date"
              style={{
                cursor: !state.date.disabled ? "pointer" : "",
                backgroundColor: state.date.disabled ? "#e0e0e0" : "",
                padding: "0px",
              }}
              value={state.date.to}
              disabled={state.date.disabled}
              onChange={(e) => {
                setState({
                  ...state,
                  date: { ...state.date, to: e.target.value },
                });
              }}
            />
          </Stack>
        </Stack>
        <Typography variant="body1">| |</Typography>
        <Stack>
          <Button
            variant="contained"
            disabled={!state.date.from || !state.date.to}
            onClick={() => {
              getFilteredData(state.date.from, state.date.to);
            }}
          >
            Filter
          </Button>
        </Stack>
        <Typography variant="body1">| |</Typography>
        <Stack>
          <IconButton
            title={"Download Report"}
            aria-label="download"
            disabled={arr.length == 0}
            onClick={downloadExcel}
          >
            <DownloadIcon sx={{ color: arr.length > 0 ? "black" : "grey" }} />
          </IconButton>
        </Stack>
      </Stack>

      {isLoading ? (
        <Loader />
      ) : arr.length > 0 ? (
        <Stack alignItems={'center'} >
          {arr.map((item, key) => {
            return < CallCard
              key={item.callId}
              callNumber={item.callId}
              customerName={item.customerName}
              date={item.createdAt}
              link={`/callmaster/call-details-specific/${item.callId}`}
              isPending={true}
              engineers={engineers}
              problemDescription={item.problemDescription}
              onCallUpdated={getData}
            />
            // (
            // <Link
            //   to={`/callmaster/call-details-specific/${item.callId}`}
            //   key={item.callId}
            // >
            // { " " }

            // { " " }
            // </Link>
            // );
          })}
        </Stack>
      ) : (
        <Stack color={"var(--red)"}>No Results</Stack>
      )}

      {/* {
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
      } */}
    </div>
  );
}

export default PendingCallReports;
