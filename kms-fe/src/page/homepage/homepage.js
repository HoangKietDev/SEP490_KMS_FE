import React, { useState,useEffect } from "react";
import { Navigation } from "../../components/navigation";
import { Intro } from "../../components/intro";
import { About } from "../../components/about";
import { Services } from "../../components/services";
import { Contact } from "../../components/contact";
import JsonData from "../../data/data.json";
import SmoothScroll from "smooth-scroll";

export const scroll = new SmoothScroll('a[href*="#"]', {
    speed: 1000,
    speedAsDuration: true,
});

function HomePage() {

    const [landingPageData, setLandingPageData] = useState({});
    useEffect(() => {
        setLandingPageData(JsonData);
    }, []);

    return (
        <>
            <Intro data={landingPageData.Intro} />
            <About data={landingPageData.About} />
            <Services data={landingPageData.Services} />
        </>
    );
}

export default HomePage;
