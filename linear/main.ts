import { LinearClient } from "@linear/sdk";
import express from 'express';
 
import cors from 'cors';
import * as Sentry from "@sentry/node";
import dotenv from 'dotenv';
//import * as _ from './instrument';

const app: express.Application = express()
const port = 3002
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// Enable CORS for all routes
//app.use(cors());
 
dotenv.config(); 

/*async function getCurrentUser(): LinearFetch<User> {
  return linearClient.viewer;
}*/

// Add this after all routes,
// but before any and other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/create-issue', async (req, res) => {
    const apiKey = process.env.LINEAR_API_KEY;

    const linearClient = new LinearClient({ apiKey });

    const teams = await linearClient.teams();
     
    const team = teams.nodes.find(team => team.name === "WTF");
     
    const { title, description, assigneeId, priority, dueDate, teamId } = req.body

    const issue = await linearClient.createIssue({
        title,
        description,
        assigneeId: assigneeId,
        priority: priority || 3,
        dueDate,
        teamId: teamId || team?.id
    })

    res.send(issue)
})

//listen on any IPv4 address (0.0.0.0) or IPv6 address (::) 
app.listen(port, '::', () => {
  console.log(`Server running on port ${port} (IPv4 and IPv6)`);
}).on('error', (err: any) => {
  if (err.syscall !== 'listen') {
    throw err;
  }
  
  // If IPv6 fails, fallback to IPv4
  if (err.code === 'EADDRNOTAVAIL') {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port} (IPv4 only)`);
    });
  } else {
    throw err;
  }
});