const { User } = require("../models/Users");

let auth = (req, res, next)=> {
    // 인증 처리를 하는 곳

    // 클라이언트 쿠키에서 토큰을 가져옴
    let token = req.cookies.x_auth;

    // 토큰을 복호화 한 후 유저를 찾는다.
    User.findeByToken(token, (err, user) => {
        if(err) throw err;
        if (!user) return res.json({ isAuth: false, error: true })
        
        req.token = token;
        req.user = user;
        next();  // 다음이 진행될 수 있도록 next가 필수로 들어가야함
    })
    // 유저가 있으면 인증okey , 유저가 없으면 인증 no


}

module.exports = { auth };