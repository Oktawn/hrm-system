import express from 'express';
import bot from './bots/main.bot';

const app = express();


app.listen(3000, () => {
  bot.start();
  console.log('Server is running on port 3000');
});