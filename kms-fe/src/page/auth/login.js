import React, { useState } from "react";


function LoginPage() {
    const [state, setState] = useState({
        username: "",
        password: ""
    });
    const handleChange = evt => {
        const value = evt.target.value;
        setState({
            ...state,
            [evt.target.name]: value
        });
    };

    const handleOnSubmit = evt => {
        evt.preventDefault();

        const { username, password } = state;
        alert(`You are login with email: ${username} and password: ${password}`);

        for (const key in state) {
            setState({
                ...state,
                [key]: ""
            });
        }
    };

    return (
        <div className="">
            <div class="container" style={{ borderRadius: "10px", boxShadow: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)', marginTop: '11rem' }}>
                <div class="row justify-content-center">
                    <div class="col-md-12">
                        <div class="row">
                            <div class="col-6 text-center d-flex align-items-center bg-info" style={{ height: '500px', backgroundImage: "url('https://teachingstrategies.com/wp-content/uploads/2022/09/iStock-1158305219-1024x684.jpg')", backgroundBlendMode: 'multiply' }}>
                                <div class="w-100 text-white">
                                    <h2>Welcome to KMS</h2>
                                    <p>Enter your personal details and start journey with us</p>
                                </div>
                            </div>
                            <div class="col-6 align-items-center p-5 justify-content-center">
                                <div class="text-end">
                                    <div class="w-100">
                                        <a href="/" class="mb-4 fs-4 text-decoration-none text-dark border rounded-pill p-4">Back to HomePage </a>
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="w-100">
                                        <h1 class="mb-4 ">Sign In</h1>
                                    </div>
                                </div>
                                <form onSubmit={handleOnSubmit}>
                                    <div class="form-group mb-3">
                                        <label class="label text-dark fs-4 my-2" for="name">Username</label>
                                        <input type="text" class="form-control rounded-pill mt-2 px-4 fs-4" placeholder="Username" required style={{ backgroundColor: "#f0f0f0", height: '50px' }}
                                            name="username"
                                            value={state.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div class="form-group mb-3">
                                        <label class="label text-dark fs-4 my-2" for="password">Password</label>
                                        <input type="password" class="form-control rounded-pill mt-2 px-4 fs-4" placeholder="Password" required style={{ backgroundColor: "#f0f0f0", height: '50px' }}
                                            name="password"
                                            value={state.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div class="form-group">
                                        <button type="submit" class="form-control btn btn-info submit px-3 rounded-pill my-2 px-2 text-dark fs-4" style={{ height: "50px" }}>Sign In</button>
                                    </div>
                                    <div class=" d-md-flex justify-content-between pt-2">
                                        <div class="w-50 text-start">
                                            <label class="checkbox-wrap checkbox-primary mb-0 fs-4">Remember Me
                                                <input type="checkbox" checked />
                                                <span class="checkmark"></span>
                                            </label>
                                        </div>
                                        <div class="w-50 text-end fs-4">
                                            <a href="#">Forgot Password </a>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
