const express = require('express');
const app = express();
const port = 5000;
const cookieparser = require('cookie-parser');
const config = require('./config/key');

const { User } = require("./models/Users");

//application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
//application/json
app.use(express.json());
app.use(cookieparser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello World! 안녕하세요'));

app.post('/register', (req, res) => {
  // 회원가입할때 필요한 정보들을  client에서 가져오면 그것들을 데이터 베이스에 넣어준다.


  const user = new User(req.body)


  user.save((err, userInfo) => {
    if(err) return res.json({ sucess: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/login', (req, res) => {
  // 1.요청된 이메일이 데이터 베이스에 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess:false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."  
      })
    }
     // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 같은지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})   
      // 3. 비밀번호까지 맞다면 토큰을 생성함
      user.generateToken((err, user) => {                     // user안에 token이 들어가있음

        if (err) return res.status(400).send(err);
         
        // 토큰을 쿠키에 저장한다. 
          res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })


})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));


