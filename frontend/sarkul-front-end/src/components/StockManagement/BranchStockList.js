import React, { useEffect, useState } from 'react'
import SideBarStock from '../Sidebar/SideBarStock'
import axios from 'axios';
import { Stack, Typography } from '@mui/material';
import Loader from '../Loader';

function BranchStockList() {

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        getData()
    }, [])

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
        }
        catch (error) {

            alert(error?.response?.data?.message)
        }
        setIsLoading(false);
    }


    return (
        <div>
            <SideBarStock />

            {isLoading ? <Loader /> :
                <Stack alignItems={'center'} p={2} gap={4}>
                    {data?.map((item) => {
                        return <Stack direction={'row'}
                            border={'1px solid grey'}
                            borderRadius={'12px'} p={2}
                            justifyContent={'space-evenly'}
                            width={'60%'}
                        >
                            <Stack gap={3.6}>
                                <Stack direction={'row'}>
                                    <Typography color={'black'}>Item Name: {" "}</Typography>
                                    <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.itemName} </Typography>
                                </Stack>
                                <Stack direction={'row'}>
                                    <Typography color={'black'}>Brand: {" "}</Typography>
                                    <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.brand} </Typography>
                                </Stack>
                                <Stack direction={'row'}>
                                    <Typography color={'black'}>Serial Number: {" "}</Typography>
                                    <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.serialNumber} </Typography>
                                </Stack>
                            </Stack>
                            <Stack gap={3.6}>
                                <Stack direction={'row'} >
                                    <Typography color={'black'}>Warranty Start: {" "}</Typography>
                                    <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.warrantyStart.slice(0, 10)} </Typography>
                                </Stack>
                                <Stack direction={'row'}>
                                    <Typography color={'black'}>Warranty End: {" "}</Typography>
                                    <Typography fontWeight={'bold'} pl={3} color={'black'}>{item?.warrantyEnd.slice(0, 10)} </Typography>
                                </Stack>
                                <Stack direction={'row'}>
                                    <Typography color={'black'}>Price: {" "}</Typography>
                                    <Typography fontWeight={'bold'} pl={3} color={'black'}> Rs {item?.price} </Typography>
                                </Stack>

                            </Stack>
                        </Stack>
                    })}
                </Stack>
            }


        </div>
    )
}

export default BranchStockList