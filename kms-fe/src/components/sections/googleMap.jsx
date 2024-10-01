import React from 'react'

const GoogleMap = () => {
    return (
        <div className="lg:pt-15 lg;pb-15 pb-10 pt-10 overflow-x-hidden">
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14897.961443735907!2d105.5268773!3d21.0130567!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1727790638904!5m2!1svi!2s" width="1920" height="497" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
    )
}

export default GoogleMap