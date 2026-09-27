import React, { useEffect, useState } from 'react'
import SideBarPart from '../Sidebar/SideBarPart'
import { useFormik } from 'formik'
import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import axios from 'axios'
import Loader from '../Loader'

function BranchToEngineer() {
    const [arr, setArr] = useState([])
    const [isLoading, setIsLoading] = useState(false);
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
            setArr(response.data.data);
        }
        catch (error) {
            console.log(error);
        }
    }
    const formik = useFormik({
        initialValues: {
            callId: '',
            itemName: '',
            partName: '',
            modelNumber: '',
            stockId: '',
            serialNumber: '',
            dispatchMode: '',
            engineerName: '',
            category: 'b2e',
            status: 'unavailable'


        },
        onSubmit: (values) => {
            handleSubmit(values);
        }
    })

    async function handleSubmit(values) {
        setIsLoading(true);
        console.log('loading...prt')
        try {
            let token = sessionStorage.getItem("accessToken");
            let url = 'https://sarkultechapi.onrender.com/api/v1/transaction';
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'Application/json'
                },
            };
            const response = await axios.post(url, values, config);
            alert(response?.data?.message);

            console.log(response, 'b2eresponse')
            setIsLoading(false);
        }
        catch (error) {
            console.log(error)
            alert(error.response.data.message)
            setIsLoading(false);
        }

    }

    return (

        <div>
            <SideBarPart />
            {isLoading ? (<Loader />) : (
                <Stack>
                    <form onSubmit={formik.handleSubmit}>

                        <Stack direction={'row'} justifyContent={'space-evenly'} pt={3}>
                            <Stack direction={'column'} gap={6} >
                                <TextField id="outlined-basic" required name="callId" onChange={formik.handleChange} label="Call Number" variant="outlined" />
                                {/* <TextField id="outlined-basic" name="itemName" onChange={formik.handleChange} label="Item Name" variant="outlined" /> */}
                                <FormControl  >
                                    <InputLabel id="demo-simple-select-label">Item Name</InputLabel>
                                    <Select
                                        sx={{ width: '230px' }}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Item Name"
                                        name="itemName"
                                        value={formik.values.itemName}
                                        onChange={formik.handleChange}
                                    >

                                        <MenuItem value={"printer"}>Printer</MenuItem>
                                        <MenuItem value={"scanner"}>Scanner</MenuItem>
                                        <MenuItem value={"plotter"}>Plotter</MenuItem>
                                        <MenuItem value={"desktop"}>Desktop</MenuItem>
                                        <MenuItem value={"laptop"}>Laptop</MenuItem>
                                        <MenuItem value={"server"}>Server</MenuItem>
                                        <MenuItem value={"UPS"}>UPS</MenuItem>
                                        <MenuItem value={"cctv"}>CCTV</MenuItem>
                                        <MenuItem value={"Keyboard"}>Keyboard</MenuItem>
                                        <MenuItem value={"Mouse"}>Mouse</MenuItem>
                                        <MenuItem value={"PowerSupply"}>Power Supply</MenuItem>
                                        <MenuItem value={"Motherboard"}>Motherboard</MenuItem>
                                        <MenuItem value={"HardDisk"}>Hard Disk</MenuItem>
                                        <MenuItem value={"Display"}>Display</MenuItem>
                                        <MenuItem value={"RAM"}>RAM</MenuItem>
                                        <MenuItem value={"CPUFan"}>CPU Fan</MenuItem>
                                        <MenuItem value={"Processor"}>Processor</MenuItem>
                                        <MenuItem value={"SSD"}>SSD</MenuItem>
                                        <MenuItem value={"TFT"}>TFT</MenuItem>

                                    </Select>

                                </FormControl>

                                <TextField id="outlined-basic" name="partName" onChange={formik.handleChange} label="Part Name" variant="outlined" />
                                <TextField id="outlined-basic" name="modelNumber" onChange={formik.handleChange} label="Model Number" variant="outlined" />
                                <TextField id="outlined-basic" required name="stockId" onChange={formik.handleChange} label="Stock Id" variant="outlined" />
                            </Stack>
                            <Stack direction={'column'} gap={6}>
                                <TextField id="outlined-basic" name="serialNumber" onChange={formik.handleChange} label="Serial Number" variant="outlined" />

                                <FormControl  >
                                    <InputLabel id="demo-simple-select-label">Dispatch Mode</InputLabel>
                                    <Select
                                        sx={{ width: '230px' }}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Dispatch Mode"
                                        name="dispatchMode"
                                        value={formik.values.dispatchMode}
                                        onChange={formik.handleChange}
                                    >

                                        <MenuItem value={"RGP"}>RGP</MenuItem>
                                        <MenuItem value={"NRGP"}>NRGP</MenuItem>
                                        <MenuItem value={"consumable"}>Consumable</MenuItem>

                                    </Select>

                                </FormControl>

                                <FormControl required >
                                    <InputLabel id="demo-simple-select-label">Engineer Name</InputLabel>
                                    <Select
                                        // sx={{ width: '130px' }}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Engineer Name"
                                        name="engineerName"
                                        value={formik.values.engineerName}
                                        onChange={formik.handleChange}
                                    >


                                        {

                                            arr.map((item) => {
                                                return <MenuItem value={item.employeeName}>{item.employeeName}</MenuItem>
                                            })

                                        }

                                    </Select>

                                </FormControl>
                                <TextField sx={{
                                    '&:hover': {


                                        boxShadow: '5px 5px 10px var(--blue);'
                                    },
                                }} type="submit" onSubmit={formik.handleSubmit}>Submit</TextField>
                            </Stack>

                        </Stack>
                    </form>
                </Stack>
            )}
        </div>
    )
}

export default BranchToEngineer