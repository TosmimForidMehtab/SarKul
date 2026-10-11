import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loader from '../Loader';
import SideBarPart from '../Sidebar/SideBarPart';
import PartDetail from '../Helper/PartDetail/PartDetail';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';

function PartTransactionDetail() {
    const [isLoading, setIsLoading] = useState(false)
    const [eng, setEng] = useState([]);
    const [state, setState] = useState({
        selectedEngineer: '',
        callNumber: '',
        selectedFilter: ''
    })
    const [arr, setArr] = useState([]);
    const [masterArr, setMasterArr] = useState([]);


    useEffect(() => {
        getData();
    }, [])

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
            let engList = response.data.data?.data || response.data.data;
            setEng(Array.isArray(engList) ? engList : []);
        }
        catch (error) {
            console.log(error);
        }
    }
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

            let txList = response.data.data?.data || response.data.data;
            let safeList = Array.isArray(txList) ? txList : [];
            setArr(safeList);
            setMasterArr(safeList)
            setIsLoading(false)
        }
        catch (error) {
            alert(error.response?.data.message);
            // console.log(error)
            setIsLoading(false)
        }

    }

    const handleFilterEngineer = (name) => {

        let temp = masterArr.slice(0, masterArr.length)
        let filteredArr = temp.filter((item) => item.engineerName.toLowerCase() == name.toLowerCase())
        setArr(filteredArr)

    }

    const handleFilterCallId = (id) => {
        let temp = masterArr.slice(0, masterArr.length)
        let filteredArr = temp.filter((item) => item.callId.includes(id))
        setArr(filteredArr)
    }

    return (
        <div>
            <SideBarPart />
            <Stack direction={"row"} p={0.7} bgcolor={"white"} justifyContent={'center'} gap={5} >
                <Stack direction={'row'} gap={3}>
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

                            }))
                            getData()
                        }}
                        sx={{
                            width: '130px',
                        }}
                    >
                        <MenuItem value={'engineer'}>Engineer</MenuItem>
                        <MenuItem value={'callNumber'}>Call Number</MenuItem>
                    </TextField>
                    {state.selectedFilter == 'engineer' &&
                        <TextField
                            select
                            value={state.selectedEngineer}
                            label='Engineers'
                            onChange={(e) => {
                                setState((prev) => ({
                                    ...prev,
                                    selectedEngineer: e.target.value
                                }))
                                handleFilterEngineer(e.target.value)
                            }}
                            sx={{
                                width: '230px',
                            }}
                        >
                            {

                                eng.map((item) => {
                                    return <MenuItem value={item.employeeName}>{item.employeeName}</MenuItem>
                                })

                            }
                        </TextField>}

                    {state.selectedFilter == 'callNumber' && <TextField
                        label='Call Number'
                        value={state.callNumber}
                        onChange={(e) => {
                            setState((prev) => ({
                                ...prev,
                                callNumber: e.target.value
                            }))
                            handleFilterCallId(e.target.value)
                        }}
                        sx={{
                            width: '150px',
                        }}
                    />}
                    <Button
                        onClick={() => {
                            setState({
                                selectedEngineer: '',
                                callNumber: '',
                                selectedFilter: ''
                            })
                            getData()
                        }}
                    >Clear Filter</Button>
                </Stack>



            </Stack>
            {isLoading ? <Loader /> :

                arr.map((item) => {
                    return item?.callId != 'b441a0' && item?.callId != 'cb6fb7' && <Stack alignItems={'center'}> <PartDetail item={item} /> </Stack>

                })

            }
        </div>
    )
}

export default PartTransactionDetail