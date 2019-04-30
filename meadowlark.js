const express = require('express');
const handlebars = require('express3-handlebars').create({defaultLayout:'main'})
const fortune = require('./lib/fortune')
const credentials = require('./credentials')
const mongoose = require('mongoose')
const Vacation = require('./models/vacation')
const Category = require('./models/category');
const Post = require('./models/post')
const Attraction = require('./models/attraction')


// const opts = {
//     server:{
//         socketOptions:{keepAlive:1}
//     }
// }

mongoose.connect("mongodb://localhost/test", function(err) {
    if(err){
        console.log('连接失败');
    }else{
        console.log('连接成功');
        // var schema = new mongoose.Schema({ num:Number, name: String, size: String});
        // var MyModel = mongoose.model('MyModel', schema);
        // var doc1 = new MyModel({ size: 'small' });
        // console.log(doc1.size);//'small'
        // doc1.save((err,doc)=>{
        //     console.log(doc)
        // })
        //使用链式写法    
        // new MyModel({age:10,name:'save'}).save(function(err,doc){
        //     //[ { _id: 59720bc0d2b1125cbcd60b3f, age: 10, name: 'save', __v: 0 } ]
        //     console.log(doc);        
        // });    

        // MyModel.create({name:"xiaowang"},{name:"xiaoli"},function(err,doc1,doc2){
        //     //{ __v: 0, name: 'xiaowang', _id: 59720d83ad8a953f5cd04664 }
        //     console.log(doc1); 
        //     //{ __v: 0, name: 'xiaoli', _id: 59720d83ad8a953f5cd04665 }
        //     console.log(doc2); 
        // });   

        // MyModel.find({},{_id:0},function(err,docs){
            //[ { _id: 5971f93be6f98ec60e3dc86c, name: 'huochai', age: 27 },
            //{ _id: 5971f93be6f98ec60e3dc86d, name: 'wang', age: 18 },
            //{ _id: 5971f93be6f98ec60e3dc86e, name: 'huo', age: 30 },
            //{ _id: 5971f93be6f98ec60e3dc86f, name: 'li', age: 12 } ]
            // console.log(docs);
        // })

        //找出年龄大于18的数据
        // MyModel.find({age:{$gte:18}},function(err,docs){
        //     //[ { _id: 5971f93be6f98ec60e3dc86c, name: 'huochai', age: 27 },
        //     //{ _id: 5971f93be6f98ec60e3dc86d, name: 'wang', age: 18 },
        //     //{ _id: 5971f93be6f98ec60e3dc86e, name: 'huo', age: 30 }]
        //     console.log(docs);
        // })
    }
});

const app = express();

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars')

app.set('port',process.env.PORT || 3022)

app.use(express.static(__dirname+'/public'));

//使用body-parse插件
app.use(require('body-parser')());

app.use(require('cookie-parser')(credentials.cookieSecret))
app.use(require('express-session')())

// app.use((req,res,next)=>{
//     res.locals.showTests = app.get('env') !=='producetion' && req.query.test ==='1';
//     next();
// })
app.disable('X-Powered-By')


app.get('/api/attractions', function(req, res){
    Attraction.find({ approved: true }, function(err, attractions){
        if(err) return res.send(500, 'Error occurred: database error.');
            res.status(200).json({
                code:200,
                data:attractions.map(function(a){
                    return {
                        name: a.name,
                        id: a._id,
                        description: a.description,
                        location: a.location,
                    }
                })
            });
    });
});

app.post('/api/attraction', function(req, res){
    console.log(req.body,'body')
    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: { lat: req.body.lat, lng: req.body.lng },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date(),
        },
        approved: false,
    });
    a.save(function(err, a){
        if(err) return res.send(500, 'Error occurred: database error.');
        res.status(200).json({code:200,message:'新增成功',id: a._id });
    });
})

app.get('/api/attraction', function(req,res){
    console.log(req.query,'req')
    Attraction.findById(req.query.id, function(err, a){
    if(err) return res.send(500, 'Error occurred: database error.');
        res.json({
            code:200,
            data:{
                name: a.name,
                id: a._id,
                description: a.description,
                location: a.location,
            }
        });
    });
});

/* 加载所有类别 */
app.get('/categories', (req, res) => {
    Category.find().populate('posts','title').select("number name description recommend index").exec((err, docs) => {
        if (err) return res.status(500).json({code: 0, message: err.message, err})
        return res.status(200).json({code: 1, message: '获取类别成功', result: {docs}})
    })
})

/* 新增一个类别 */
app.post('/categories', (req, res) => {
    console.log(req.body,'body')
    new Category(req.body).save((err, doc) => {
        if (err) return res.status(500).json({code: 0, message: err.message, err})
        doc.populate({path:'posts',select:'title'}, (err, doc) => {
        if (err) return res.status(500).json({code:0, message: err.message, err})
        return res.status(200).json({code: 1, message: '新增成功', result: {doc}})
        })      
    })
})

app.get('/headers',(req,res)=>{
    res.set('Content-Type','text/plain');
    var s = '';
    for(var name in req.headers){
        s += name +':'+ req.headers[name] + '\n';
    }
    res.send(s)
})

app.get('/',(req,res)=>{
    res.cookie('monster','nom nom')
    res.cookie('signed_monster','nom nom',{signed:true})
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