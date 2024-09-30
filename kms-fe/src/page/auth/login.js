import React, { useState } from "react";

function LoginPage() {
    const [state, setState] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState("");

    const handleChange = (evt) => {
        const value = evt.target.value;
        setState({
            ...state,
            [evt.target.name]: value
        });
    };

    const handleOnSubmit = async (evt) => {
        evt.preventDefault();
        const { username, password } = state;

        try {
            // Gọi API để lấy danh sách account
            const response = await fetch("http://localhost:3360/api/login");
            if (!response.ok) {
                throw new Error("Failed to fetch accounts");
            }
            const accounts = await response.json();

            // Tìm account có username và password trùng khớp, và status = 1
            const matchedAccount = accounts.find(
                (account) => 
                    account.username === username && 
                    account.password === password && 
                    account.status === 1
            );

            if (matchedAccount) {
                // Đăng nhập thành công
                alert("Login successful!");

                // Lưu username hoặc token vào localStorage
                localStorage.setItem("username", username);

                // Ví dụ: bạn có thể chuyển hướng đến dashboard
                window.location.href = "/";
            } else {
                // Sai username/password hoặc tài khoản bị khóa (status != 1)
                setError("Incorrect username or password, or your account is inactive.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="">
            <div className="container" style={{ borderRadius: "10px", boxShadow: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)', marginTop: '11rem' }}>
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-6 text-center d-flex align-items-center bg-info" style={{ height: '500px', backgroundImage: "url('https://teachingstrategies.com/wp-content/uploads/2022/09/iStock-1158305219-1024x684.jpg')", backgroundBlendMode: 'multiply' }}>
                                <div className="w-100 text-white">
                                    <h2>Welcome to KMS</h2>
                                    <p>Enter your personal details and start journey with us</p>
                                </div>
                            </div>
                            <div className="col-6 align-items-center p-5 justify-content-center">
                                <div className="text-end">
                                    <div className="w-100">
                                        <a href="/" className="mb-4 fs-4 text-decoration-none text-dark border rounded-pill p-4">Back to HomePage </a>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="w-100">
                                        <h1 className="mb-4 ">Sign In</h1>
                                    </div>
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <form onSubmit={handleOnSubmit}>
                                    <div className="form-group mb-3">
                                        <label className="label text-dark fs-4 my-2" htmlFor="name">Username</label>
                                        <input type="text" className="form-control rounded-pill mt-2 px-4 fs-4" placeholder="Username" required style={{ backgroundColor: "#f0f0f0", height: '50px' }}
                                            name="username"
                                            value={state.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="label text-dark fs-4 my-2" htmlFor="password">Password</label>
                                        <input type="password" className="form-control rounded-pill mt-2 px-4 fs-4" placeholder="Password" required style={{ backgroundColor: "#f0f0f0", height: '50px' }}
                                            name="password"
                                            value={state.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="form-control btn btn-info submit px-3 rounded-pill my-2 px-2 text-dark fs-4" style={{ height: "50px" }}>Sign In</button>
                                    </div>
                                    <div className=" d-md-flex justify-content-between pt-2">
                                        <div className="w-50 text-start">
                                            <label className="checkbox-wrap checkbox-primary mb-0 fs-4">Remember Me
                                                <input type="checkbox" checked />
                                                <span className="checkmark"></span>
                                            </label>
                                        </div>
                                        <div className="w-50 text-end fs-4">
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
