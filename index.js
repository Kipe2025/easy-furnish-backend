const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');
const authRouter = require('./routes/auth');
const billingRouter = require('./routes/billing');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Root route to prevent "Cannot GET /" error
app.get('/', (req, res) => {
  res.send('Easy Furnish backend is running!');
});

app.use('/projects', projectsRouter);
app.use('/auth', authRouter);
app.use('/billing', billingRouter);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Easy Furnish backend running on port ${PORT}`);
});
