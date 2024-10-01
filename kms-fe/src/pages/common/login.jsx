import React, { useState } from "react";

const LoginPage = () => {
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
        }
        );
    };
    const handleOnSubmit = async (evt) => {
        console.log(1);
    
        evt.preventDefault();
        const { username, password } = state;
        try {
            // Gọi API để lấy danh sách account
            const response = await fetch("http://localhost:5124/api/Login/GetAllData");
            if (!response.ok) {
                throw new Error("Failed to fetch accounts");
            }
            const accountList = await response.json();
            console.log(accountList);
    
            // Tìm account có username và password trùng khớp, và status = 1
            const matchedAccount = accountList.find(user =>
                user.accounts.some(account =>
                    account.username === username &&
                    account.password === password &&
                    account.status === 1
                )
            );
    
            if (matchedAccount) {
                // Đăng nhập thành công
                alert("Login successful!");
    
                // Lưu username hoặc token vào localStorage
                localStorage.setItem("user", username);
    
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
        <div style={{ backgroundColor: "#FFF0E5" }} className="p-20 h-screen">
            <div class="container mx-auto rounded-lg shadow-md ">
                <div class="flex flex-col md:flex-row">
                    <div class="w-full md:w-1/2 h-screen bg-cover bg-blend-multiply bg-no-repeat bg-center" style={{ height: '500px', backgroundImage: "url('https://teachingstrategies.com/wp-content/uploads/2022/09/iStock-1158305219-1024x684.jpg')", backgroundBlendMode: 'multiply' }}>
                        <div class="flex flex-col justify-center items-center h-full px-4">
                            <h2 class="text-white text-3xl font-bold mb-4">Welcome to KMS</h2>
                            <p class="text-white text-lg mb-8">Enter your personal details and start your journey with us</p>
                            <a href="/" class="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200">Back to HomePage</a>
                        </div>
                    </div>
                    <div class=" md:w-1/2 bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div class="p-6 space-y-4 md:space-y-6 sm:p-8 mt-8">
                            <h1 class="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Sign in to your account
                            </h1>
                            <form class="space-y-4 md:space-y-6" onSubmit={handleOnSubmit}>
                                <div>
                                    <label for="username" class="block mb-2 text-sm font-semibold text-gray-900 dark:text-white">Username</label>
                                    <input type="text" name="username" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" required="" 
                                    value={state.username}
                                    onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label for="password" class="block mb-2 text-sm font-semibold text-gray-900 dark:text-white">Password</label>
                                    <input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="" 
                                    value={state.password}
                                    onChange={handleChange}
                                    />
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-start">
                                        <div class="flex items-center h-5">
                                            <input id="remember" aria-describedby="remember" type="checkbox" class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" required="" />
                                        </div>
                                        <div class="ml-3 text-sm">
                                            <label for="remember" class="text-gray-500 dark:text-gray-300">Remember me</label>
                                        </div>
                                    </div>
                                    <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500 ">Forgot password?</a>
                                </div>
                                <button type="submit"  class="w-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Sign in</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;