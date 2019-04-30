const express = require('express');
const handlebars = require('express3-handlebars').create({defaultLayout:'main'})
const fortune = require('./lib/fortune')

const app = express();

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars')

app.set('port',process.env.PORT || 3022)

app.use(express.static(__dirname+'/public'));

//使用body-parse插件
app.use(require('body-parser')());

// app.use((req,res,next)=>{
//     res.locals.showTests = app.get('env') !=='producetion' && req.query.test ==='1';
//     next();
// })
app.disable('X-Powered-By')

app.get('/headers',(req,res)=>{
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers){
        s += name +':'+ req.headers[name] + '\n';
    }
    res.send(s)
})

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/about',(req,res)=>{
    res.render('about',{fortune:fortune.getFortune()})
})

var tours = [
    {id:0,name:'Hood River',price:99.99},
    {id:0,name:'Oregon Coast',price:149.95}
]

app.get('/api/tours',(req,res)=>{
    res.json(
        tours
    )
})

app.get('/newsletter',(req,res)=>{
    res.render('newsletter',{csrf:'CSRF token goes here'})
})

app.post('/process',(req,res)=>{
    console.log(req.query,'query');
    console.log(req.body,'body')
    console.log('Form (from querystring):' + req.query.form);
    console.log('CSRF token(from hidden form field):' + req.body._csrf);
    console.log('Name (from visible form field):' + req.body.name);
    console.log('Email (from visible form field):' + req.body.email);
    res.redirect(303,'/thank-you')
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