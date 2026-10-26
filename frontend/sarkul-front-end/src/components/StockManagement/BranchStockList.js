import React, { useEffect, useState } from 'react';
import SideBarStock from '../Sidebar/SideBarStock';
import axios from 'axios';
import { Stack, Typography, IconButton } from '@mui/material';
import Loader from '../Loader';
import ExcelJS from 'exceljs';
import DownloadIcon from '@mui/icons-material/Download';

function BranchStockList() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        getData();
    }, []);

    async function getData() {
        setIsLoading(true);
        try {
            let token = sessionStorage.getItem("accessToken");
            let url = 'https://sarkultechapi.onrender.com/api/v1/mystocks';
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'Application/json'
                },
            };
            const response = await axios.get(url, config);
            let rawList = response.data.data?.data || (Array.isArray(response.data.data) ? response.data.data : response.data.message?.[0]?.data);
            let arr = Array.isArray(rawList) ? [...rawList].reverse() : [];
            setData(arr);
        } catch (error) {
            alert(error?.response?.data?.message || 'Error fetching branch stocks');
        }
        setIsLoading(false);
    }

    const downloadExcel = async () => {
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();

        var formattedDate = day + "/" + month + "/" + year;
        const finalArr = data.map((item) => ({
            Date: item.createdAt ? item.createdAt.substring(0, 10) : '',
            'Item Name': item.itemName || '',
            'Group': item.brand || item.itemName || '',
            'Brand': item.brand || '',
            'Serial Number': item.serialNumber || '',
            'Price': item.price != null ? 'Rs ' + item.price : '',
            'Warranty Start': item.warrantyStart ? item.warrantyStart.slice(0, 10) : '',
            'Warranty End': item.warrantyEnd ? item.warrantyEnd.slice(0, 10) : ''
        }));

        if (!finalArr || finalArr.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Branch Stock');

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
        a.download = `branch_stock_${formattedDate}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div>
            <SideBarStock />
            <Stack bgcolor={'white'} direction={'row'} justifyContent={'end'} pr={10} pt={1} pb={1}>
                <IconButton
                    title={'Download Report'}
                    disabled={data.length === 0}
                    onClick={downloadExcel}
                >
                    <DownloadIcon sx={{ color: data.length > 0 ? 'black' : 'grey' }} />
                </IconButton>
            </Stack>

            {isLoading ? <Loader /> :
                <Stack alignItems={'center'} p={2} gap={4}>
                    {data?.map((item, idx) => {
                        return (
                            <Stack
                                key={item._id || idx}
                                direction={'row'}
                                border={'1px solid grey'}
                                borderRadius={'12px'}
                                p={2}
                                justifyContent={'space-evenly'}
                                width={'60%'}
                            >
                                <Stack gap={3.6}>
                                    <Stack direction={'row'}>
                                        <Typography color={'black'}>Item Name: </Typography>
                                        <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.itemName} </Typography>
                                    </Stack>
                                    <Stack direction={'row'}>
                                        <Typography color={'black'}>Group / Brand: </Typography>
                                        <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.brand} </Typography>
                                    </Stack>
                                    <Stack direction={'row'}>
                                        <Typography color={'black'}>Serial Number: </Typography>
                                        <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.serialNumber} </Typography>
                                    </Stack>
                                </Stack>
                                <Stack gap={3.6}>
                                    <Stack direction={'row'}>
                                        <Typography color={'black'}>Warranty Start: </Typography>
                                        <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.warrantyStart?.slice(0, 10)} </Typography>
                                    </Stack>
                                    <Stack direction={'row'}>
                                        <Typography color={'black'}>Warranty End: </Typography>
                                        <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.warrantyEnd?.slice(0, 10)} </Typography>
                                    </Stack>
                                    <Stack direction={'row'}>
                                        <Typography color={'black'}>Price: </Typography>
                                        <Typography fontWeight={'bold'} pl={3} color={'black'}> Rs {item?.price} </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>
            }
        </div>
    );
}

export default BranchStockList;
