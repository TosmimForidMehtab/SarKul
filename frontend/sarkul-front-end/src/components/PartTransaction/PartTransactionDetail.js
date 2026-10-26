import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import SideBarPart from '../Sidebar/SideBarPart';
import PartDetail from '../Helper/PartDetail/PartDetail';
import { Button, MenuItem, Stack, TextField, IconButton } from '@mui/material';
import ExcelJS from 'exceljs';
import DownloadIcon from '@mui/icons-material/Download';

function PartTransactionDetail() {
    const [isLoading, setIsLoading] = useState(false);
    const [eng, setEng] = useState([]);
    const [state, setState] = useState({
        selectedEngineer: '',
        callNumber: '',
        selectedFilter: ''
    });
    const [arr, setArr] = useState([]);
    const [masterArr, setMasterArr] = useState([]);

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        getEngineerName();
    }, []);

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
            let engList = response.data.data?.data || response.data.data;
            setEng(Array.isArray(engList) ? engList : []);
        } catch (error) {
            console.log(error);
        }
    }

    async function getData() {
        setIsLoading(true);
        try {
            let token = sessionStorage.getItem("accessToken");
            let config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            let url = 'https://sarkultechapi.onrender.com/api/v1/transaction';
            let response = await axios.get(url, config);

            let txList = response.data.data?.data || response.data.data;
            let safeList = Array.isArray(txList) ? txList : [];
            setArr(safeList);
            setMasterArr(safeList);
            setIsLoading(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Error fetching transactions');
            setIsLoading(false);
        }
    }

    const handleFilterEngineer = (name) => {
        let temp = masterArr.slice(0, masterArr.length);
        let filteredArr = temp.filter((item) => item.engineerName?.toLowerCase() === name?.toLowerCase());
        setArr(filteredArr);
    };

    const handleFilterCallId = (id) => {
        let temp = masterArr.slice(0, masterArr.length);
        let filteredArr = temp.filter((item) => item.callId?.includes(id));
        setArr(filteredArr);
    };

    const downloadExcel = async () => {
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();

        var formattedDate = day + "/" + month + "/" + year;
        const finalArr = arr
            ?.filter((item) => item?.callId !== 'b441a0' && item?.callId !== 'cb6fb7')
            ?.map((item) => ({
                Date: item.createdAt ? item.createdAt.substring(0, 10) : '',
                'Transaction Type': item.category === 'b2e' ? 'Branch to Engineer' : 'Engineer to Branch',
                'Call Id': item.callId || '',
                'Group': item.partName || item.itemName || '',
                'Item Name': item.itemName || '',
                'Part Name': item.partName || '',
                'Stock Id': item.stockId || '',
                'Engineer Name': item.engineerName || '',
                'Model Number': item.modelNumber || '',
                'Serial Number': item.serialNumber || '',
                'Dispatch Mode': item.dispatchMode || '',
                'Part Status': item.partStatus || ''
            }));

        if (!finalArr || finalArr.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        const headers = Object.keys(finalArr[0]);
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
                    padding: { top: 5, left: 5, bottom: 5, right: 5 }
                };
            });
            column.width = Math.min(100, Math.max(10, header.length * 2.8));
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `part_transactions_${formattedDate}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div>
            <SideBarPart />
            <Stack direction={"row"} p={0.7} bgcolor={"white"} justifyContent={'center'} alignItems="center" gap={5}>
                <Stack direction={'row'} gap={3} alignItems="center">
                    <TextField
                        select
                        label='Filter By:'
                        value={state.selectedFilter}
                        onChange={(e) => {
                            setState((prev) => ({
                                ...prev,
                                selectedFilter: e.target.value,
                                selectedEngineer: '',
                                callNumber: ''
                            }));
                            getData();
                        }}
                        sx={{
                            width: '130px',
                        }}
                    >
                        <MenuItem value={'engineer'}>Engineer</MenuItem>
                        <MenuItem value={'callNumber'}>Call Number</MenuItem>
                    </TextField>
                    {state.selectedFilter === 'engineer' && (
                        <TextField
                            select
                            value={state.selectedEngineer}
                            label='Engineers'
                            onChange={(e) => {
                                setState((prev) => ({
                                    ...prev,
                                    selectedEngineer: e.target.value
                                }));
                                handleFilterEngineer(e.target.value);
                            }}
                            sx={{
                                width: '230px',
                            }}
                        >
                            {eng.map((item, idx) => (
                                <MenuItem key={idx} value={item.employeeName}>{item.employeeName}</MenuItem>
                            ))}
                        </TextField>
                    )}

                    {state.selectedFilter === 'callNumber' && (
                        <TextField
                            label='Call Number'
                            value={state.callNumber}
                            onChange={(e) => {
                                setState((prev) => ({
                                    ...prev,
                                    callNumber: e.target.value
                                }));
                                handleFilterCallId(e.target.value);
                            }}
                            sx={{
                                width: '150px',
                            }}
                        />
                    )}
                    <Button
                        onClick={() => {
                            setState({
                                selectedEngineer: '',
                                callNumber: '',
                                selectedFilter: ''
                            });
                            getData();
                        }}
                    >
                        Clear Filter
                    </Button>
                </Stack>

                <IconButton
                    title="Download Report"
                    disabled={arr.length === 0}
                    onClick={downloadExcel}
                >
                    <DownloadIcon sx={{ color: arr.length > 0 ? 'black' : 'grey' }} />
                </IconButton>
            </Stack>
            {isLoading ? (
                <Loader />
            ) : (
                arr.map((item, idx) => {
                    return item?.callId !== 'b441a0' && item?.callId !== 'cb6fb7' && (
                        <Stack key={item._id || idx} alignItems={'center'}>
                            <PartDetail item={item} />
                        </Stack>
                    );
                })
            )}
        </div>
    );
}

export default PartTransactionDetail;
