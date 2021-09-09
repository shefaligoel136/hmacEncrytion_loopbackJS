"use strict";
var createHmac = require("crypto").createHmac;

var generator = require("generate-password");

var secretKeys = ["secRet123Key", "auth123Key", "verified142Key", "hmac432Key"];

module.exports = function (Service) {
  Service.getCredentials = function () {
    let apiKey = generateNum();
    let secret = secretKeys[Math.floor(Math.random() * secretKeys.length)];
    const hmac = createHmac("SHA256", secret)
      .update(apiKey, "utf-8")
      .digest("base64");
    //   console.log("api",apiKey);
    //   console.log("hmac",hmac);
    return Service.create({
      apiKey: hmac,
    })
      .then(function (data) {
        data.apiKey = apiKey;
        data.secret = secret;

        return data;
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  Service.verifyCredentials = function (apiKey, secret) {
    const hmac = createHmac("SHA256", secret)
      .update(apiKey, "utf-8")
      .digest("base64");

    return Service.findOne({
      where: {
        apiKey: hmac,
      },
    }).then(function (data) {
      if (data) {
        return "Verified";
      } else {
        if(secretKeys.indexOf(secret)>-1){
            return "Not Verified"
        }else{
            return "You entered a wrong secret"
        }
      }
    });
  };

  Service.remoteMethod("getCredentials", {
    description: "Returns Api Key and secret to the user",
    http: {
      path: "/getCredentials",
      verb: "get",
    },
    returns: {
      arg: "credentials",
      type: "object",
    },
  });
  Service.remoteMethod("verifyCredentials", {
    description: "Returns if user is verified or not",
    accepts: [
      {
        arg: "apiKey",
        type: "string",
        required: true,
      },
      {
        arg: "secret",
        type: "string",
        required: true,
      },
    ],
    http: {
      path: "/getVerified",
      verb: "get",
    },
    returns: {
      arg: "isVerified",
      type: "string",
    },
  });
};

function generateNum() {
  let randomNum = generator.generate({
    length: 32,
    numbers: true,
  });
  console.log(randomNum);
  return randomNum;
}
