const express = require('express')
const res = require('express/lib/response')
const { handlebars } = require('hbs')
const app = express()
const PORT= 5000
const bcrypt= require('bcrypt')
const flash= require('express-flash')
const session = require ('express-session')
const db = require('./connections/db')
const { request, response } = require('express')
const upload = require ('./middlewares/fileUpload')
isLogin= true


app.set('view engine', 'hbs')
app.use(flash())
app.use(
    session({
        cookie : {
            maxAge: 2*60*60*1000, //data disimpan di session selama 2jam
            secure : false,
            httpOnly : true
        },
        store : new session.MemoryStore(),
        saveUninitialized:true,
        resave :false,
        secret : 'secretValue'
    })
)
app.use('/public' , express.static(__dirname + '/public')) 
app.use('/uploads' , express.static(__dirname + '/uploads'))
app.use(express.urlencoded({extended : false})) 



function getDistanceTime(time){
    //parameter time disini bernilai waktu sekarang
    let timePost= time
    let timeNow= new Date()
    let distance = timeNow - timePost
    //variable distance bernilai waktu pada saat posting-waktu sekarang

    let milisecond= 1000
    let secondInHours= 3600
    let hoursInDay=23
    let minutes= 60
    let seconds= 60
    //untuk mendefinisikan nilai satuan waktu


    let distanceDay=Math.floor( distance / (milisecond * secondInHours * hoursInDay))
    let distanceHours= Math.floor(distance/ (milisecond * minutes * seconds))
    let distanceMinutes= Math.floor(distance/(milisecond * seconds))
    let distanceSeconds= Math.floor(distance/ (milisecond))
   //math.floor berfungsi untuk membulatkan angka


    if(distanceDay>=1){
      //kondisi2 untuk mengetahui berapa lama post sudah diposting
       return (`${distanceDay} day ago`);
    }else{
        if(distanceHours >=1){
            return (`${distanceHours} hours ago`);
        }else{
            if(distanceMinutes >=1){
               return (`${distanceMinutes} minutes ago`);
            }else{
               return (`${distanceSeconds} seconds ago`);
            }
        }
    }
    
    }
function getFullTime(time){
    let month= ['january','february','march','april','may','june','july','august','september','october','november','december']
    let date = time.getDate()
    let monthIndex= time.getMonth()
    let year = time.getFullYear()
    let hours= time.getHours()
    let minutes= time.getMinutes()
    //get2 diatas merupakan keyword javascript
    let fullTime= (`${date} ${month[monthIndex]} ${year} ${hours}: ${minutes} WIB`)
    return fullTime
    }






// app.get('/',(request,response)=>{
//     response.send("index")
// })

app.get('/add-blog',(request,response)=>{
    if(!request.session.isLogin){
        request.flash('danger','Please login first')
        return response.redirect('/login')
    }
    response.render("add-blog", { user:request.session.user,isLogin:request.session.isLogin})
})

app.get('/contact',(request,response)=>{
    response.render("contact")
})

app.get('/login',(request,response)=>{
    response.render("login")
})

app.get('/register',(request,response)=>{
    response.render("register")
})

app.post('/register',(request,response)=>{
    
    const {inputName,inputEmail,inputPassword}= request.body
    const hashedPassword = bcrypt.hashSync(inputPassword, 10)
    console.log(request.body);
    db.connect((err,client,done)=>{
        //jika ada error saat mengkoneksikan ke database kita throw error tersebut
        if(err){
            throw err
        } 
        //jika tidak ada error kita lanjutkan dgn query insert into table tb_blog dgn value dari inputan user
        client.query(`INSERT INTO tb_user(name,email,password)values('${inputName}','${inputEmail}','${hashedPassword}')`, (err,result)=>{
            if(err){
                throw err
            } else{
                console.log("success");
                response.redirect('/login')
            }
        })
    })
})

app.post('/login',(request,response)=>{
    const {inputEmail,inputPassword}= request.body

    let query = `SELECT * FROM tb_user WHERE email= '${inputEmail}'`
    db.connect((err,client,done)=>{
       if(err) throw err
        client.query(query, (err,result)=>{
            if(err){
                throw err
            } 
            if(result.rows.length==0){
                request.flash('danger', 'Email and Password dont Match')

               return  response.redirect('/login')
            }
              
            let isMatch = bcrypt.compareSync(inputPassword, result.rows[0].password)
            console.log(isMatch);
    
            if(isMatch){
                request.session.isLogin =true
                request.session.user={
                    id:result.rows[0].id,
                    name : result.rows[0].name,
                    email : result.rows[0].email
                }

                request.flash('success', 'Login success')
                response.redirect('/blog')
            }else{
                request.flash('danger', 'Email and Password dont Match')
                response.redirect('/login')
            }
            console.log(isMatch);
        })
    })
})

app.get('/logout',(request,response)=>{
    request.session.destroy()

    response.redirect('/login')
})

app.post('/blog', upload.single('inputImage'),(request,response)=>{
    //return console.log(request.session.user.id);
    let data = request.body
    let image = request.file.filename
    let authorId= request.session.user.id
    console.log(authorId);
    let query= `INSERT INTO tb_blog(title, content, category, image,author_id) 
     VALUES('${data.inputTitle}','${data.inputContent}','${data.inputCategory}','${image}','${authorId}')`
    
    db.connect(function(err,client,done){
        if(err) throw err

        client.query(query,function(err,result){
            if(err) throw err
            response.redirect('/blog')
        })
    })
})

app.get('/blog',(request,response)=>{
    if(!request.session.isLogin){
        request.flash('danger','Please login first')
        return response.redirect('/login')
    }
   db.connect(function(err,client,done){
     
    if(err) throw err
        const query=`SELECT tb_blog.id, title, tb_blog.content, tb_blog.image, tb_blog.post_at, tb_user.name AS author, tb_blog.author_id 
        FROM tb_blog left JOIN tb_user ON tb_blog.author_id = tb_user.id`
        client.query(query, function(err,result){
            //jika ada error misal salah syntax sql atau typo nama column kita throw err
            if(err) throw err
            let data= result.rows 
            console.log(data);
            data = data.map(function(blog){
                return {
                    ...blog,
                    isLogin: request.session.isLogin,
                    postAt : getFullTime(blog.post_at),
                    distance : getDistanceTime(blog.post_at)
                }
            })
            response.render("blog", {isLogin : request.session.isLogin, user: request.session.user ,blogs : data})
        })
   }) 
})
app.get('/edit-blog/:id',(request,response)=>{
    if(!request.session.isLogin){
        request.flash('danger','Please login first')
        return response.redirect('/login')
    }
    const id = request.params.id
    db.connect(function(err,client,done){
        if(err) throw err
    
            client.query(`SELECT * FROM tb_blog where id=${id}`, function(err,result){
                if(err) throw err
    
                //console.log(result.rows);
                let data= result.rows
                console.log(data);
                response.render("edit-blog", {blogs : data})
            })
            
       })
})

app.post('/edit-blog/:id',(request,response)=>{
    console.log(request.body);
    const inputTitle = request.body.inputTitle;
    const inputCategory = request.body.inputCategory;
    const inputContent = request.body.inputContent;

    const id = request.params.id
    
    db.connect((err,client,done)=>{
        if(err){
            console.error(err)
        } 
        console.log("connected");
        client.query(`UPDATE tb_blog set title='${inputTitle}', category='${inputCategory}', content='${inputContent}' WHERE id=${id}`, (err,result)=>{
            if(err){
                console.error(err)
            } else{
                console.log("success");
                response.redirect('/blog')
            }
        })
    })
    
})

app.get('/delete-blog/:id', function(request, response){
    if(!request.session.isLogin){
        request.flash('danger','Please login first')
        return response.redirect('/login')
    }
const id= request.params.id

db.connect((err,client,done)=>{
    if(err){
        console.error(err)
    } 
    console.log("connected");
    client.query(`DELETE FROM tb_blog WHERE id=${id}`, (err,result)=>{
        if(err){
            console.error(err)
        } else{
            console.log("success");
            response.redirect('/blog')
        }
    })
})

})

app.get('/blog-detail/:id',function (request,response){
    if(!request.session.isLogin){
        request.flash('danger','Please login first')
        return response.redirect('/login')
    }
    let blogId = request.params.id
    response.render('blog-detail' , {blog :{
        id : blogId,
        title : 'selamat datang di web',
        content : 'ini adalah content',
        author : 'alifian',
        postAt : getFullTime(new Date()),
        distance : getDistanceTime(waktu)
    }}) 
})

app.get('/index',(request,response)=>{
   db.connect(function(err,client,done){
    if(err) throw err
        client.query('SELECT * FROM tb_exp', function(err,result){        
            if(err) throw err
            let data= result.rows 
            response.render("index", {data : data})
        })
   }) 
})

app.listen(PORT,()=>{
    console.log("server starting on localhost");
})