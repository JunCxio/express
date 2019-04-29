const express = require('express');
const handlebars = require('express3-handlebars').create({defaultLayout:'main'})

const app = express();

const fortunes =[
    'Conquer your fears or they will conquer you.',
    'Rivers need springs.',
    'Do not fear what you don"t kone.',
    'You will have a pleasant surprise.',
    'Whenever possible,keep it simple'
]

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars')

app.set('port',process.env.PORT || 3022)

app.use(express.static(__dirname+'/public'));

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/about',(req,res)=>{
    const randomFortune=fortunes[Math.floor(Math.random()*fortunes.length)];
    res.render('about',{fortune:randomFortune})

})

//定制404页面
app.use((req,res,next)=>{
    res.status(404);
    res.render('404');
})

//定制500页面
app.use((err,req,res,next)=>{
    res.status(500);
    res.render('500');
})


app.listen(app.get('port'),()=>{
    console.log('Express started on http://localhost:'+app.get('port')+';press Ctrl-C to terminate')
})