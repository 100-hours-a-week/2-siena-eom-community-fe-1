const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.json()); // JSON 형식의 요청을 처리하기 위해 필요

// 초기 화면으로 login.html을 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'login.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
