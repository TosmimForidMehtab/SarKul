import React, { useEffect, useState } from 'react'
import SideBarStock from '../Sidebar/SideBarStock'
import axios from 'axios';
import Loader from '../Loader';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import StockCard from '../Helper/StockCard';

function OfficeRepair() {
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState([]);
    const [state, setState] = useState(
        {
            open: false,
            scrap: false,
            stockId: '',
            repairAmount: ''
        }
    );

    const handleMoveToScrap = async () => {

        let data = {
            scrap: 'yes',
            officeRepair: 'no'
        }
        await handleSubmit(data);

        setState((prev) => ({
            ...prev,
            open: false,
            scrap: false,
            stockId: '',
            repairAmount: "",
        }))
        getData();
    }

    const handleRepair = async () => {

        let data = {
            status: 'available',
            officeRepair: 'no',
            condition: 'repaired',
            price: state.repairAmount
        }
        await handleSubmit(data);

        setState((prev) => ({
            ...prev,
            open: false,
            scrap: false,
            stockId: '',
            repairAmount: "",
        }))
        getData()

    }
    
    async function handleSubmit(data) {


        setIsLoading(true)
        try {
            let token = sessionStorage.getItem("accessToken");
            let url = `https://sarkultechapi.onrender.com/api/v1/stock/${state.stockId}`;

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'Application/json'
                },
            };
            let response = await axios.patch(url, data, config);
            console.log(response.data, 'nigga')
            alert(response.data.message)

            // formik.resetForm();
            setIsLoading(false)

        } catch (error) {
            console.log(error.response.data.message)
            alert(error.response.data.message)
            setIsLoading(false)
        }


    }



    async function getData() {
        setIsLoading(true);
        try {
            let token = sessionStorage.getItem("accessToken");
            let url = 'https://sarkultechapi.onrender.com/api/v1/stock?officeRepair=yes';
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'Application/json'
                },
            };
            const response = await axios.get(url, config);
            let stockList = response?.data?.data?.data || (Array.isArray(response?.data?.data) ? (response.data.data[0]?.data || response.data.data) : []);
            setData(Array.isArray(stockList) ? stockList : []);
        }
        catch (error) {

            alert(error?.response?.data?.message)
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getData();
    }, [])

    return (
        <div>OfficeRepair
            <SideBarStock />
            {isLoading ? <Loader /> :
                <Stack alignItems={'center'}>
                    {data?.map((item) => {
                        return <Stack mt={2} width={'50%'} p={2} border={'1px solid black'} borderRadius={'10px'}>

                            <Stack p={2} direction={'row'} justifyContent={'space-around'}>
                                <Stack gap={1.4}>
                                    <Typography variant='h6' >Stock Id: {item?.stockId} </Typography>
                                    <Typography variant='h6'>Item Name: {item?.itemName} </Typography>
                                    <Typography variant='h6'>Part Name: {item?.itemPart} </Typography>
                                </Stack>
                                <Stack gap={1.4}>
                                    <Typography variant='h6'>Serial Number: {item?.serialNumber} </Typography>
                                    <Typography variant='h6'>Model Number: {item?.modelNumber} </Typography>
                                    <Typography variant='h6'>Price: {item?.price ? "Rs" + item.price : 'Currently NA'}/- </Typography>
                                </Stack>
                            </Stack>
                            <Stack direction={'row'} justifyContent={'end'}>
                                <Button
                                    variant='contained'
                                    sx={{
                                        bgcolor: 'var(--red)',
                                        '&:hover': {
                                            bgcolor: 'var(--red)',
                                        }
                                    }}
                                    onClick={() => {
                                        setState((prev) => ({ ...prev, open: true, scrap: true, stockId: item.stockId }))
                                    }}
                                >
                                    Scrap
                                </Button>
                                <Button
                                    variant='contained'
                                    sx={{ ml: '8px' }}
                                    onClick={() => {
                                        setState((prev) => ({ ...prev, open: true, scrap: false, stockId: item.stockId }))
                                    }}
                                >
                                    Repair
                                </Button>
                            </Stack>
                        </Stack>
                    })}

                </Stack>
            }
            <Dialog
                open={state.open}
                sx={{
                    [".MuiDialog-paper"]: {
                        padding: "22px",
                        backgroundColor: "var(--white)",
                        borderRadius: "28px",
                        width: "26%",
                    },
                }}
            >
                <DialogTitle>{state.scrap ? 'Confirmation!!' : "Detail Required"}</DialogTitle>
                <DialogContent>
                    <Stack border={'1px dashed grey'} p={2} borderRadius={'12px'} height={'150px'} justifyContent={'center'} >

                        {state.scrap ? <Typography variant='h5'>
                            Are You sure,you want to move it to scrap ?
                        </Typography> :
                            <TextField id="outlined-basic"
                                label="Repair Amount(in Rs)"
                                variant="outlined"
                                type='number'
                                value={state.repairAmount}
                                onChange={(e) => {
                                    setState((prev) => ({
                                        ...prev,
                                        repairAmount: e.target.value
                                    }))
                                }}
                            />


                        }
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={() => {
                            setState((prev) => ({
                                ...prev,
                                open: false,
                                scrap: false,
                                stockId: '',
                                repairAmount: "",
                            }))
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={() => {
                            state.scrap ? handleMoveToScrap() : handleRepair()
                        }}
                    >
                        {state.scrap ? 'Yes' : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    )
}

export default OfficeRepair