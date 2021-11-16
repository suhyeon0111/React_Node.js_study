const express = require('express');
const app = express();
const cookieparser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

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

app.get('/api/hello', (req, res) => {
  res.send("안녕하세요~")
})

app.post('/api/users/register', (req, res) => {
  // 회원가입할때 필요한 정보들을  client에서 가져오면 그것들을 데이터 베이스에 넣어준다.
  
  const user = new User(req.body)
  
  user.save((err, userInfo) => {
    if(err) return res.json({ sucess: false, err })
    return res.status(200).json({
      success: true
    })
  })
}) 



app.post('/api/users/login', (req, res) => {

  // console.log('ping')
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {

    // console.log('user', user)
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    
    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      // console.log('err',err)

      // console.log('isMatch',isMatch)

      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

      //비밀번호 까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다.  어디에 ?  쿠키 , 로컳스토리지 
        res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

// app.post('/api/users/login', (req, res) => {
//   // 1.요청된 이메일이 데이터 베이스에 있는지 찾는다.
//   User.findOne({ email: req.body.email }, (err, user) => {
  //     if(!user) {
    //       return res.json({
      //         loginSuccess:false,
      //         message: "제공된 이메일에 해당하는 유저가 없습니다."  
      //       })
      //     }
      
      //      // 2. 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 같은지 확인
      //     user.comparePassword(req.body.password, (err, isMatch) => {
        //       if(!isMatch)
        //         return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})   
        //       // 3. 비밀번호까지 맞다면 토큰을 생성함
        //       user.generateToken((err, user) => {                     // user안에 token이 들어가있음
        
        //         if (err) return res.status(400).send(err);
        
        //         // 토큰을 쿠키에 저장한다. 
        //           res.cookie("x_auth", user.token)                      //x_auth라는 이름으로 쿠키가 저장됨
        //           .status(200)
        //           .json({ loginSuccess: true, userId: user._id })
        //       })
        //     })
        //   })
        // })
        
        // role 1 어드민 role 2 특정부서 어드민
        // role 0이면 일반 유져, role 0이 아니면 관리자
        
        app.get('/api/users/auth', auth, (req, res) => {

          // 여기까지 미들웨어를 통과해 왔다는 얘끼는 Authentication이 true라는 말
          res.status(200).json({
            _id: req.user._id, 
            isAdmin: req.user.role === 0 ? false : true,
            isAuth: true, 
            email: req.user.email,
            name: req.user.name, 
            lastname: req.user.lastname,
            role: req.user.role,
            image: req.user.image,
  })
})


// logout 라우터
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id: req.user._id}, 
    {token: ""}
    , (err, user) => {
      if (err) return res.json({ success: false, err});
      return res.status(200).send({
        success: true
      })
    })
})
// auth는 미들웨어: 미들웨어의 역할은 콜백function을 하기전에 실행하는 것


const port = 5000;

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));


