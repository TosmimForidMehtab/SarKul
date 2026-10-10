import React, { useRef } from 'react';
import './styles.css';
import { useState } from 'react';
import axios from 'axios';
import Image from '../../assets/LoginPage.png';

function Login() {
    const email = 'cheemstech01@gmail.com';
    const [otp, setOtp] = useState(false);
    const [val, setVal] = useState(true);
    const [isSent, setIsSent] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const input = useRef(null);
    const emailRef = useRef(null);
    const passRef = useRef(null);

    async function generateOtp() {
        setIsSent(false)
        const url = "https://sarkultechapi.onrender.com/api/v1/user/send-otp";
        const data = {
            // email:email
            email: emailRef.current.value
        }
        await axios.post(url, data);
        setIsSent(true);
        setOtp(true);
    }
    async function validate(e) {
        e.preventDefault();

        setIsVerifying(true);
        try {

            const url = "https://sarkultechapi.onrender.com/api/v1/user/signin";
            const data = {
                email: emailRef.current.value,
                password: passRef.current.value
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            let response = await axios.post(url, data, config);

            console.log("response of login");
            sessionStorage.setItem("accessToken", response.data.data);
            setIsVerifying(false);
            window.location.reload(true);

        }
        catch (error) {
            console.log("************")
            console.log(error);
            alert("Wrong Credentials");
            setIsVerifying(false);
        }



    }

    return (

        <div className='login-page'>
            <div className='header'>
                <h2>Welcome to Sarkul Technology Private Limited</h2>
            </div>
            <div className='login-centre'>
                <img className='image-login' src={Image} alt='Image here' />
                <div className='login-slot'>
                    <h1>Login Here</h1>
                    <form onSubmit={validate}>

                        <input type='text' placeholder='Enter the email here...' className='form-input' required ref={emailRef} /><br />
                        <input type='password' placeholder='Enter the password here...' className='form-input' required ref={passRef} /><br /><br />
                        {isVerifying ? <button className='button-login'>Loading...</button> : <input type='submit' className='button-login' value={'Login'} onSubmit={validate} />}

                    </form>





                </div>
            </div>

            <div className='footer'>
                <h3>All rights reserved. Only the person having authentication can login here and access the portal to manage changes...</h3>
            </div>
        </div>

    )
}

export default Login
