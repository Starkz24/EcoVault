import React, { useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import "./style.css";

function Donation() {
  const [formData, setFormData] = useState({
    name: "",
    locality: "",
    phno: "",
    amt: 500,
    donationType: "Dustbins",
    token: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToken = (token) => {
    const payload = { ...formData, token };
    setFormData(payload);
    fetch("/api/donate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="Dcontainer">
      <div className="Dheading">Donate For Good!</div>
      <div className="Dcard">
        <div className="Dcard__content">
          <form>
          <div className="ipDiv" id="nameIp">
              <label htmlFor="name">Name</label>
              <br />
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="ipDiv">
              <label htmlFor="locality">Locality</label>
              <br />
              <input type="text" name="locality" value={formData.locality} onChange={handleChange} />
            </div>
            <div className="ipDiv">
              <label htmlFor="phno">Phone Number</label>
              <br />
              <input type="text" name="phno" value={formData.phno} onChange={handleChange} />
            </div>
            <div className="ipDiv">
              <label htmlFor="amt">Amount</label>
              <br />
              <input type="number" name="amt" value={formData.amt} onChange={handleChange} />
            </div>
            <span>What do you want us to implant?</span>
            <div className="radio-inputs">
              <label className="radio">
                <input
                  type="radio"
                  name="donationType"
                  value="Dustbins"
                  checked={formData.donationType === "Dustbins"}
                  onChange={handleChange}
                  required
                />
                <span className="name">Dustbins</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="donationType"
                  value="Trees"
                  checked={formData.donationType === "Trees"}
                  onChange={handleChange}
                  required
                />
                <span className="name">Trees</span>
              </label>
            </div>
            <div className="submitBtn">
              <StripeCheckout
                token={handleToken}
                stripeKey={process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY}
                amount={formData.amt}
                currency="USD"
                name="Donate For Good"
                description={`Proceed to pay $${formData.amt / 100} for donation`}
                billingAddress
                zipCode
              >
                <button type="button" className="btn">
                  Proceed to Pay
                </button>
              </StripeCheckout>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Donation;
