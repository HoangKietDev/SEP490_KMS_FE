import React from "react";

export const Services = (props) => {
  return (
    <div id="services" className="text-center"  >
      <div className="container">
        <div className="section-title">
          <h2>Program</h2>
          <p>
          
          </p>
        </div>
        <div className="row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-md-4">
                  {" "}
                  <img className={d.icon} src={d.img} alt={d.name} />
                  <div className="service-desc">
                    <h3>{d.name}</h3>
                    <p>{d.text}</p>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};
