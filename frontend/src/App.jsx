import React, { useEffect, useState } from 'react'
import {getUniversalLink} from "@selfxyz/core"
import {SelfAppBuilder, SelfQRcodeWrapper} from "@selfxyz/qrcode"

import { ethers } from 'ethers'

const App = () => {

  const [selfApp, setSelfApp] = useState(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress);

  useEffect( () => {

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName:  "Self Workshop",
        scope: "self-workshop",
        endpoint: `${window.location.origin}/api`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_https",
        userIdType: "hex",
        userDefinedData: "Hello World",
        disclosures: {
          //check the API reference for more disclose attributes!
          minimumAge: 18,
          excludedCountries: ["IRN", "PRK", "RUS", "SYR"],
          ofac: true,
          nationality: true,
          gender: true,
      } })
      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
      
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  },[userId])


  const handleSuccessfulVerification = () => {
    console.log("Verification successful!");
  };

  return (
   <div className="verification-container">
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app</p>
      {selfApp ? (
        <SelfQRcodeWrapper
         selfApp={selfApp}
         onSuccess={handleSuccessfulVerification}
         onError={() => {
          console.error("Verification failed or was cancelled.");
         }}
        />
      ) : (
        <div>Loading QR Code...</div>
      )}
    </div>
  )
}

export default App