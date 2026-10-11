import React, { useEffect, useState } from 'react'
import SideBarExpense from '../Sidebar/SideBarExpense'
import axios from 'axios';
import Loader from '../Loader';
import { IconButton, Stack } from '@mui/material';
import ExpenseCard from './ExpenseCard';
import ExcelJS from 'exceljs';
import DownloadIcon from '@mui/icons-material/Download';
function ExpenseList() {

  const [isLoading, setIsLoading] = useState(false);
  const [expense, setExpense] = useState([]);


  async function getExpenseList() {
    setIsLoading(true);
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/expense';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      const response = await axios.get(url, config);
      let expList = response?.data?.data?.data || (Array.isArray(response?.data?.data) ? (response.data.data[0]?.data || response.data.data) : []);
      setExpense(Array.isArray(expList) ? expList : []);
      setIsLoading(false);

    }
    catch (error) {

      console.log(error?.response?.data?.message)
      setIsLoading(false);
    }
  }
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
    const arrWithoutUnwantedFields = expense.map(({ _id, updatedAt, __v, ...rest }) => rest);
    const finalArr = arrWithoutUnwantedFields?.filter((item) => !item?.remarks.includes('test') && !item?.remarks.includes('check')); // filter out unwanted fields 
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expense Report');

    const headers = Object.keys(finalArr[0]).map(header => header === 'createdAt' ? 'Date' : header);
    worksheet.addRow(headers);

    finalArr.forEach((row) => {
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
    a.download = `expense_report_${formattedDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  useEffect(() => {
    getExpenseList();
  }, [])
  return (
    <div>
      <SideBarExpense />
      <Stack bgcolor={'white'} direction={'row'} justifyContent={'end'} pr={35} >
        <IconButton title={'Download Report'} aria-label="download"
          disabled={expense?.length == 0}
          onClick={downloadExcel}
        >
          <DownloadIcon sx={{ color: expense?.length > 0 ? 'black' : 'grey' }} />
        </IconButton>
      </Stack>
      {isLoading ?
        <Loader />
        :
        <Stack alignItems={'center'} pt={4} >
          {expense?.map((item) => {
            return !item?.remarks.includes('test') && !item?.remarks.includes('check') && <ExpenseCard
              name={item?.engineerName}
              category={item?.category}
              month={item?.month}
              period={item?.period}
              amount={item?.amount}
              remarks={item?.remarks}
            />
          })}
        </Stack>
      }
    </div>
  )
}

export default ExpenseList