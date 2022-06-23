/**
 * @author aman singh bhandari
 * @bannerid B00910008
 */

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");

const AppUtil = require("./lib/AppUtil.js");

const { buildWallet } = require("./lib/AppUtil.js");

const walletPath = path.join(__dirname, "Org1"); //Org1 is exported and is kept in root folder

const http = require("http"); //protocol
const url = require("url");

const host = "0.0.0.0"; //localhost
const port = 8082; //port to listen

let identity = "Org1 Admin";
let networkConnections = {};
let gateway = null;
let network = null;
let contract = null;

async function initNetwork() {
  try {
    const ccp = AppUtil.buildJunglekidsOrg1();
    const wallet = await buildWallet(Wallets, walletPath);
    if (gateway == null) gateway = new Gateway();

    if (network == null) {
      console.log("\nNetwork is not created yet.");
      console.log("Build a network gateway to connect to local emulator");

      await gateway.connect(ccp, {
        wallet,
        identity: identity, //.json exported from contract
        discovery: { enabled: true, asLocalhost: false }, //using emulator
      });
    }
  } catch (error) {
    console.error(`initializeHyperledgerNetwork error: ${error}`);
  }
}

async function initContract() {
  try {
    console.log(
      "\nFrom the gateway created to access the emulator, retreive the channel"
    );
    network = await gateway.getNetwork("channel1"); //get the channel
    console.log("Got the network gateway of specified channel");
    contract = network.getContract("assignment2"); //get contract to access its method later
    console.log("Got the contract");
    networkConnections["assignment2"] = contract; //add to connection map
    return contract;
  } catch (error) {
    console.error(`\nContract initialization error: ${error}`);
  }
}

/**
 *
 * verifies if the contract is loaded and
 */
async function getActorConnection() {
  if (!networkConnections["assignment2"]) {
    await initContract();
  }
  return networkConnections["assignment2"];
}

async function approveOrCancelAgreement(id, value) {
  let contract = await getActorConnection();
  let result = "";

  try {
    await contract.submitTransaction("approveOrCancelAgreement008", id, value); //approve or reject agreement
    result = "Agreement with Id " + id + " was successfully submitted!";
  } catch (e) {
    result = e.message;
  }
  console.log("\n" + result);
  return result;
}

async function createAsset(id, value) {
  let contract = await getActorConnection();
  let result = "";
  console.log("Creating asset with id = " + id + ", value = " + value);

  try {
    await contract.submitTransaction("createAssets008", id, value); //submit agreement
    result = "Agreement with Id " + id + " was successfully submitted!";
  } catch (e) {
    result = e.message;
  }
  console.log("\n" + result);
  return result;
}

async function readAsset(id) {
  console.log(
    "\n---- Now Buyer/Seller wants to retreive the agreement to validate it ------"
  );
  let contract = await getActorConnection();
  let result = "";
  try {
    result = await contract.evaluateTransaction("readAssets008", id);
  } catch (e) {
    result = e.message;
  }
  console.log(
    "On retreving the Buyer/Seller got the below agreement and supporting fields \n" +
      result
  );
  return result;
}

const requestListener = async function (req, res) {
  const queryObject = url.parse(req.url, true).query;

  console.log("req.url:", req.url);

  let result = "";
  let id = "";
  let value = "";
  let status = "";
  const crypto = require("crypto");

  res.setHeader("Content-Type", "application/json");

  if (req.url.startsWith("/retrieve-agreement")) {
    id = queryObject.id;
    result = await readAsset(id);

    let resultjson = JSON.parse(result);
    const agreement = resultjson.agreement;

    const retrivedHash = resultjson.hash;
    console.log("\nretrived agreement from the contract: " + agreement);
    console.log("retrived hash from the contract: " + retrivedHash);
    console.log(
      "\nBuyer/Seller will now calculate hash of retreived agreement (md5): "
    );

    var calculatedHash = crypto
      .createHash("md5")
      .update(agreement)
      .digest("hex"); //Hashing with md5

    console.log("Calculated hash is: " + calculatedHash);

    if (calculatedHash === retrivedHash) {
      console.log(
        "\nYayy !!! Hash matched that means the agreement integrity is verified!"
      );
      console.log("Buyer/Seller will now APPROVE the agreement");
      resultjson.message =
        "Buyer retrived the asset -> calculated its hash -> It matched :) !!!";
    } else {
      console.log("\nOopsss !!! Hash didn't match");
      console.log("Buyer/Seller will now CANCEL the agreement");
      resultjson.message =
        "Buyer retrived the asset -> calculated its hash -> And it didn't match :( !!!";
    }
    result = JSON.stringify(resultjson);
    res.writeHead(200);
    res.end(result);
  } else if (req.url.startsWith("/approve-agreement")) {
    status = queryObject.status;
    id = queryObject.id;
    console.log(
      "\nBuyer/Seller requested to change the status of contract to " + status
    );

    result = await approveOrCancelAgreement(id, status);

    console.log("Status changed successfully!");
    res.writeHead(200);
    res.end(result);
  } else if (req.url.startsWith("/submit-agreement")) {
    value = queryObject.value;
    id = queryObject.id;
    result = await createAsset(id, value);
    res.writeHead(200);
    res.end(result);
  } else {
    res.writeHead(200);
    res.end("Unsupported URL");
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, async () => {
  await initNetwork();
  console.log(`Server is running on http://${host}:${port}`);
});
