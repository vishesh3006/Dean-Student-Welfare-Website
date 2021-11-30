//jshint esversion:6
  
import dotenv from "dotenv"
dotenv.config();
import express from "express"
import bcrypt from "bcrypt"
import passport from "passport"
import flash from "express-flash"
import session from "express-session"
// import methodOverride from "method-override"
import tech_council from './data/tech_council_data.js'
import social_society from "./data/social_society_data.js";
import literary_council from "./data/literary_council_data.js";
import innovative_team from "./data/innovative_team_data.js";
import cultural_council from "./data/cultural_council_data.js";
import initializePassport from "./passport-config.js"
import mongoose from "mongoose"
import upload from "./S3upload.js"
//import flash from "req-flash"
import ejs from 'ejs'
import Event from "./Schemas/eventSchema.js"
import Society from "./Schemas/societySchema.js"
import Notice from "./Schemas/noticeSchema.js"
import Award_Pub from "./Schemas/award_pubSchema.js"
const port = "3000"
const url = "https://" + process.env.AWS_CLOUDFRONT_DOMAIN + ".cloudfront.net/"
const app = express();

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )

const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10)
// console.log(hashedPassword)
const users = [{
    id: process.env.ID,
    email: process.env.EMAIL,
    password: hashedPassword
}]

app.set('view engine', 'ejs')
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
// app.use(methodOverride('_method'))

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})

app.get("/", async (req, res) => {
    const events = await Event.find({}, 'name date _id')
    const notices = await Notice.find({}, 'name date _id')
    const awards = await Award_Pub.find({})
    events.sort(sortByDate)

    res.render("home",{
        events: events,
        notices: notices,
        awards: awards
    })
})

app.get("/about-us/mission-vission", (req, res) => {
    res.render("vission_mission")
})

app.get("/about-us/dean" , (req, res) => {
    res.render("dean")
})

app.get("/about-us/welcome-remarks", (req, res)=>{
    res.render("VC_remark")
})

app.get("/about-us/brochure", (req, res) => {
    res.render("brochure")
})

app.get("/community/sportsandgame", async (req, res) => {
    const events = await Event.find({})
    res.render("sports", {events: events})
})

app.get("/community", (req, res) => {
    res.render("student_activities")
})

app.get("/community/tcr", (req, res) => {
    res.render("tech_council", {
        societies: tech_council
    })
})

app.get("/community/lcr", (req, res) => {
    res.render("literary_council", {
        societies: literary_council
    })
})

app.get("/community/ccr", (req, res) => {
    res.render("cultural_council", {
        societies: cultural_council
    })
})

app.get("/community/scr", (req, res) => {
    res.render("social_societies")
})

app.get("/community/i_t", (req, res) => {
    res.render("innov_team", {societies: innovative_team})
})
app.get("/events", async (req, res) => {
    const events = await Event.find({})
    events.sort(sortByDate)
    res.render("event", {events: events})
})

app.get("/events/:id", async (req, res) => {
    const event = await Event.findById(req.params.id)
    res.render("eventPage", {event: event})
})

app.get("/admin", checkAuthenticated, (req, res) => {
    res.render('admin', { success: "" })
})

app.get("/admin/create_event", checkAuthenticated, (req, res) => {
    res.render('create_event')
})

app.post("/admin/create_event", upload.array('event_img', 5), async (req, res) => {
    console.log(req.files)
    const file_url = new Array
    await req.files.forEach(file => {
        file_url.push(url + file.key)
    })
    const event = new Event({
        name: req.body.name,
        organiser: req.body.organiser,
        date: [req.body.day, req.body.month, req.body.year],
        type: req.body.event_type,
        description: req.body.description,
        img_location: file_url
    })

    event.save((err, event_new) => {
        if(err) 
            req.flash("error", "Error!! "+err)
        else{
            console.log(event_new)
            req.flash("success", "Event Added Successfully!!")
        }
        res.redirect("/admin")
    })
})

app.get("/admin/create_society", checkAuthenticated, (req, res) => {
    res.render('create_society')
})

app.post("/admin/create_society", upload.single('society_logo'), (req,res) => {
    console.log(req.file)
    const file_url = url+req.file.key
    const society = new Society({
        name: req.body.name,
        faculty: req.body.faculty,
        head: req.body.head,
        img_location: file_url,
        type: soc_type
    })

    society.save((err, society_new) => {
        if(err) 
            req.flash("error", "Error!! "+err)
        else{
            console.log(society_new)
            req.flash("success", "Society Added Successfully!!")
        }
        res.redirect("/admin")
    })
})

app.get("/admin/create_notice", checkAuthenticated, (req, res) => {
    res.render('create_notice')
})

app.get("/notices", async (req, res) => {
    const notices = await Notice.find({});
    notices.sort(sortByDate)
    res.render('notices', {notices: notices})
})

app.get("/guidelines", async (req, res) => {
    const notices = await Notice.find({});
    notices.sort(sortByDate)
    res.render('guidelines', {notices: notices})
})

app.get("/notices/:id", async (req, res) => {
    const notice = await Notice.findById(req.params.id)
    res.render('noticePage', {notice: notice})
})

app.post("/admin/create_notice",  upload.single('notice_file'), (req,res) => {
    console.log(req.file)
    const file_url = url+req.file.key
    const notice = new Notice({
        name: req.body.name,
        date: [req.body.day, req.body.month, req.body.year],
        notice_location: file_url,
    })

    notice.save((err, notice_new) => {
        if(err) 
            req.flash("error", "Error!! "+err)
        else{
            console.log(notice_new)
            req.flash("success", "Notice Added Successfully!!")
        }
        res.redirect("/admin")
    })
})

app.get("/admin/create_intP", checkAuthenticated, (req, res) => {
    res.render('create_intP')
})

app.get("/awards", async (req, res) => {
    const awards = await Award_Pub.find({});
    res.render("award_pub", {awards: awards})
})
app.post("/admin/create_intP", (req,res) => {
    const award = new Award_Pub({
        name: req.body.name,
        roll: req.body.roll,
        type: req.body.win,
        event_name: req.body.event_conf,
        description: req.body.description,
        place: req.body.place
    })

    award.save((err, award_new) => {
        if(err) 
            req.flash("error", "Error!! "+err)
        else{
            console.log(award_new)
            req.flash("success", req.body.win + " Added Successfully!!")
        }
        res.redirect("/admin")
    })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
  }))

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/admin')
    }
    next()
}

let date_month = new Map()
date_month

function sortByDate(a, b){
    if(a.date[2] != b.date[2])
        return b.date[2] - a.date[2]
    if(a.date[1] != b.date[1])
        return b.date[1] - a.date[1]
    return b.date[0] - a.date[0]

}

app.listen(process.env.PORT || port, () => console.log("Server started on port 3000"))