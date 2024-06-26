import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loader from '../Loader';
import SideBarPart from '../Sidebar/SideBarPart';
import PartDetail from '../Helper/PartDetail/PartDetail';
import { Stack } from '@mui/material';

function PartTransactionDetail() {
    const [isLoading, setIsLoading] = useState(false)
    const [arr, setArr] = useState([]);

    useEffect(() => {
        getData();
    }, [])


    async function getData() {
        setIsLoading(true)
        try {
            let token = sessionStorage.getItem("accessToken");
            let config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
            let url = 'https://sarkultechapi.onrender.com/api/v1/transaction'
            let response = await axios.get(url, config);

            console.log(response.data.data, 'part');
            setArr(response.data.data);

            setIsLoading(false)
        }
        catch (error) {
            alert(error.response?.data.message);
            // console.log(error)
            setIsLoading(false)
        }

    }

    return (
        <div>
            <SideBarPart />
            {arr.map((item) => {
                return <Stack alignItems={'center'}> <PartDetail item={item} /> </Stack>

            })}

        </div>
    )
}

export default PartTransactionDetail