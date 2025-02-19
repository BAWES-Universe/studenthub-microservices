import { LinearClient } from "@linear/sdk";
import express from 'express';
 
import cors from 'cors';
import * as Sentry from "@sentry/node";
import dotenv from 'dotenv';
import './instrument.ts';

const app: express.Application = express()
const port = 3002
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// Enable CORS for all routes
app.use(cors());
 
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

app.listen(port, () => {
  console.log(`Linear app listening on port ${port}`)
})

