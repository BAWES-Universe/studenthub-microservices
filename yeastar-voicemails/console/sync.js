const dotenv = require('dotenv');

dotenv.config();

require("../instrument");

const { getAccessToken } = require('../lib/yeastar');
const connectToDatabase = require('../lib/mongodb');
const { syncVoiceMails } = require('../lib/helper');
 

(async () => {
    await connectToDatabase();
    
    //const token = getToken();

    //if (!token) {
        await getAccessToken();
    //}

    const result = await syncVoiceMails();

    console.log("result", result);

    process.exit();
})();     