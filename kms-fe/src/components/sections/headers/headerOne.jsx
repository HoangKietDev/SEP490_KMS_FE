import React, { useEffect, useState } from 'react';
import DesktopMenu from './desktopMenu';
import MobileMenu from './mobileMenu';
import logo from '@/assets/images/logo.png';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FaMagnifyingGlass, FaArrowRight } from "react-icons/fa6";
import TopHeader from './topHeader';
import SearchForm from './searchForm';
import Logo from '@/components/ui/logo';
import StickyHeader from '@/components/ui/stickyHeader';

const HeaderOne = () => {
    const [isSerchActive, setIsSerchActive] = useState(false);
    const [isMobleMenuActive, setIsMobleMenuActive] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State để quản lý dropdown

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        setIsLoggedIn(!!storedUser); // Set isLoggedIn to true if user exists
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen); // Chuyển đổi trạng thái của dropdown
    };

    return (
        <StickyHeader>
            <header id="header" className="sticky top-0 transition-[top] duration-300 z-40">
                <div id="header-container">
                    <TopHeader />
                    <div className="[.header-pinned_&]:shadow-md bg-background transition-all duration-300">
                        <div className="container py-5">
                            <div className="flex justify-between items-center">
                                <Logo />
                                <div className="flex items-center">
                                    <DesktopMenu />
                                    <MobileMenu isMobleMenuActive={isMobleMenuActive} setIsMobleMenuActive={setIsMobleMenuActive} />

                                    <div className="flex items-center gap-6">
                                        <div className="ml-16 cursor-pointer" onClick={() => setIsSerchActive(true)}>
                                            <FaMagnifyingGlass className='text-xl' />
                                        </div>
                                        {isLoggedIn ? (
                                            <div className="relative">
                                                <button onClick={toggleDropdown} className="flex items-center">
                                                    Hello, {localStorage.getItem('user')}
                                                </button>
                                                {isDropdownOpen && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                                                        <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
                                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Button asChild variant="ghost" className="sm:flex hidden">
                                                <Link to={"/login"}> Login <FaArrowRight /></Link>
                                            </Button>
                                        )}

                                        <div className="flex xl:hidden flex-col items-end cursor-pointer transition-all duration-500" onClick={() => setIsMobleMenuActive(true)}>
                                            <span className="block h-[3px] w-5 bg-muted"></span>
                                            <span className="block h-[3px] w-7.5 bg-muted mt-2"></span>
                                            <span className="block h-[3px] w-5 bg-muted mt-2"></span>
                                        </div>
                                    </div>

                                    <SearchForm isSerchActive={isSerchActive} setIsSerchActive={setIsSerchActive} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </StickyHeader>
    );
};

export default HeaderOne;
