import React, { useEffect, useState } from 'react'
import SideBarStock from '../Sidebar/SideBarStock'
import { Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import axios from 'axios'
import Loader from '../Loader';
import StockCard from '../Helper/StockCard';
import { Link } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import ExcelJS from 'exceljs';
function CurrentStock() {


  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([])
  const [state, setState] = useState({
    dataArr: [],
    filterByConditionValue: '',
    filterByItem: '',
    parentFilter: ''
  })
  useEffect(() => {
    getData();
  }, [])

  async function getData() {
    setIsLoading(true);
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/stock?status=available';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };
      const response = await axios.get(url, config);
      let stockList = response.data.data?.data || (Array.isArray(response.data.data) ? (response.data.data[0]?.data || response.data.data) : []);
      let safeList = Array.isArray(stockList) ? stockList : [];
      setData(safeList);
      setState((prev) => ({
        ...prev,
        dataArr: safeList,
      }))
    }
    catch (error) {

      alert(error?.response?.data?.message)
    }
    setIsLoading(false);
  }

  async function handleChangeCondition(e) {

    setState((prev) => ({
      ...prev,
      filterByConditionValue: e.target.value
    }))
    let tempArr = state.dataArr.filter((item) => item.condition == e.target.value)
    setData(tempArr)
  }

  function handleChangeItem(e) {
    setState((prev) => ({
      ...prev,
      filterByItem: e.target.value
    }))
    let tempArr = state.dataArr.filter((item) => item.itemName == e.target.value)
    setData(tempArr)
  }



  function formatDate(dateString) {

    const date = new Date(dateString);

    const day = date.getUTCDate();
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  }

  const downloadExcel = async () => {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();

    var formattedDate = day + "/" + month + "/" + year;
    const arrWithoutUnwantedFields = data.map(({ ...rest }) => rest);
    const arrWithNewOrder = arrWithoutUnwantedFields.map(({ stockId, itemName, itemPart, configuration, condition, modelNumber, serialNumber, price, ...rest }) => ({

      'Stock Id': stockId,
      'Item Name': itemName,
      'Group': itemPart,
      'Configuration': configuration,
      'Condition': condition,
      'Model Number': modelNumber,
      'Serial Number': serialNumber,
      'Price': 'Rs ' + price,
      'AMC Start Date': formatDate(rest.amcStartDate),
      'AMC End Date': formatDate(rest.amcEndDate),

    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stocks');

    const headers = Object.keys(arrWithNewOrder[0]).map(header => header === 'createdAt' ? 'Date' : header);
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
    a.download = `current_stock_data_${formattedDate}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };





  return (
    <div>
      <SideBarStock />
      <Stack direction={"row"} p={0.7} bgcolor={"white"} justifyContent={'center'} gap={5} >
        <TextField
          select
          label='Filter By:'
          value={state.parentFilter}
          onChange={(e) => {
            setState((prev) => ({
              ...prev,
              filterByConditionValue: '',
              filterByItem: '',
              parentFilter: e.target.value
            }))
            setData(state.dataArr)
          }}
          sx={{
            width: '120px',
          }}
        >
          <MenuItem value='condition' >Condition</MenuItem>
          <MenuItem value='item' >Item</MenuItem>
        </TextField>
        <Stack direction={'row'} justifyContent={'space-between'} gap={3}>
          {state.parentFilter == 'condition' &&
            <TextField
              select
              label='Filter By Condition'
              value={state.filterByConditionValue}
              onChange={(e) => { handleChangeCondition(e) }}
              sx={{
                width: '150px'
              }}
            >
              <MenuItem value="working">Working</MenuItem>
              <MenuItem value='faulty'>Faulty</MenuItem>
              <MenuItem value='new'>New</MenuItem>
            </TextField>}
          {state.parentFilter == 'item' &&
            <TextField
              select
              label='Filter By Item'
              value={state.filterByItem}
              onChange={(e) => { handleChangeItem(e) }}
              sx={{
                width: '150px'
              }}
            >
              <MenuItem value={"printer"}>Printer</MenuItem>
              <MenuItem value={"scanner"}>Scanner</MenuItem>
              <MenuItem value={"plotter"}>Plotter</MenuItem>
              <MenuItem value={"desktop"}>Desktop</MenuItem>
              <MenuItem value={"laptop"}>Laptop</MenuItem>
              <MenuItem value={"server"}>Server</MenuItem>
              <MenuItem value={"UPS"}>UPS</MenuItem>
              <MenuItem value={"cctv"}>CCTV</MenuItem>
            </TextField>}
        </Stack>
        <Button
          onClick={() => {
            setState({
              dataArr: [],
              filterByConditionValue: '',
              filterByItem: '',
              parentFilter: ''
            })
            getData();
          }}
        >
          Clear Filter
        </Button>

        <Stack>
          <IconButton title={'Download Report'} aria-label="download"
            disabled={data.length == 0}
            onClick={downloadExcel}
          >
            <DownloadIcon sx={{ color: data.length > 0 ? 'black' : 'grey' }} />
          </IconButton>
        </Stack>
      </Stack>



      {isLoading ? (<Loader />) : (
        <Stack>
          <Stack>
            {/* <Typography>Item Name: {data.itemName}</Typography> */}
            {data?.map((item) => {
              return item.officeRepair !== 'yes' && item.scrap !== 'yes' && <Stack mt={2} alignItems={'center'}><Link to={`/stockmanagement/current-stock-specific/${item.stockId}`} > <StockCard stockId={item.stockId} partName={item.itemPart} condition={item.condition} serialNumber={item.serialNumber} /> </Link></Stack>
            })}

          </Stack>
        </Stack>
      )}

    </div>
  )
}

export default CurrentStock