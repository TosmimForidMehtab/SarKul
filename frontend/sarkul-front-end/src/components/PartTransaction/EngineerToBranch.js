import React, { useEffect, useState } from 'react'
import SideBarPart from '../Sidebar/SideBarPart'
import { useFormik } from 'formik'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import axios from 'axios'
import Loader from '../Loader'

function EngineerToBranch() {
    const [arr, setArr] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState({
        open: false,
    })






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
            partStatus: '',
            itemName: "",
            partName: '',
            stockId: '',
            engineerName: '',
            category: 'e2b'


        },
        onSubmit: (values) => {
            console.log(values, 'e2b....');
            formik2.setFieldValue('itemPart', values.partName)
            formik2.setFieldValue('itemName', values.itemName)
            formik2.setFieldValue('condition', values.partStatus)
            handleSubmit(values);
        }
    })

    const formik2 = useFormik({
        initialValues: {
            itemName: '',
            itemPart: '',
            serialNumber: '',
            configuration: '',
            modelNumber: '',
            amcStartDate: '',
            amcEndDate: '',
            price: '',
            condition: '',
            officeRepair: 'yes'
        },
        onSubmit: async (values) => {
            await handleSubmit2(values);
            formik.resetForm();
        }
    })


    async function handleSubmit2(data) {


        setIsLoading(true)
        try {
            let token = sessionStorage.getItem("accessToken");
            let url = 'https://sarkultechapi.onrender.com/api/v1/stock';
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'Application/json'
                },
            };
            const response = await axios.post(url, data, config);
            alert("Transaction created & New Stock moved to office repair with stock id" + response.data.data.stockId)
            setState((prev) => ({ ...prev, open: false }))
            formik2.resetForm();
            setIsLoading(false)

        } catch (error) {
            console.log(error.response.data.message)
            alert(error.response.data.message)
            setIsLoading(false)
        }


    }


    async function handleSubmit(values) {

        setIsLoading(true);
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
            alert(response?.data?.message)
            if (response.status == 210) {
                setState((prev) => ({ ...prev, open: true }))
            }
            console.log(response, 'e2bresponse')
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
                                <TextField id="outlined-basic" name="stockId" onChange={formik.handleChange} label="Stock Id" variant="outlined" />
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

                            </Stack>
                            <Stack direction={'column'} gap={6}>
                                <FormControl required >
                                    <InputLabel id="demo-simple-select-label">Part Status</InputLabel>
                                    <Select
                                        // sx={{ width: '130px' }}
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Engineer Name"
                                        name="partStatus"
                                        value={formik.values.partStatus}
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value='working'>Working</MenuItem>
                                        <MenuItem value='faulty'>Faulty</MenuItem>


                                    </Select>

                                </FormControl>
                                <FormControl required >
                                    <InputLabel id="demo-simple-select-label">Engineer Name</InputLabel>
                                    <Select
                                        sx={{ width: '223.2px' }}
                                        fullWidth
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
                                    cursor: 'pointer',
                                    '&:hover': {

                                        cursor: 'pointer',
                                        boxShadow: '5px 5px 10px var(--blue);'
                                    },
                                }} type="submit" onSubmit={formik.handleSubmit}>Submit</TextField>
                            </Stack>

                        </Stack>
                    </form>
                </Stack>
            )}
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
                <DialogTitle>More Fields required for this stock</DialogTitle>
                <DialogContent>
                    <form>
                        <Stack gap={2} p={2}>

                            <TextField
                                name='serialNumber'
                                id="outlined-basic"
                                label='Serial Number'
                                placeholder='Serial Number'
                                value={formik2.values.serialNumber}
                                onChange={formik2.handleChange}
                            />
                            <TextField
                                name='modelNumber'
                                id="outlined-basic"
                                label='Model'
                                placeholder='Model'
                                value={formik2.values.modelNumber}
                                onChange={formik2.handleChange}
                            />
                        </Stack>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={formik2.handleSubmit}
                    >
                        Submit
                    </Button>
                </DialogActions>

            </Dialog>
        </div>
    )
}

export default EngineerToBranch