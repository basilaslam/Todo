//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash')
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//Database Connection
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser:true})
//Mongoose Schema


const itemsSchema = {
    name:String
}
const listSchema = {
  name: String,
  items : [itemsSchema]
};
//Mongoosw Model
const List = mongoose.model('List',listSchema)

const Item = mongoose.model('item',itemsSchema);
//Making new models

const item1 = new Item({
    name: "Welcome to your to-do list"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "<-- Hit this to delete an item"
})
const defaultItems = [item1,item2,item3]




app.set("view engine", "ejs");
const list = [];
app.get("/", (req, res) => {
  Item.find({},(err , foundItems)=>{

  if (foundItems.length===0){

// Add to database
      Item.insertMany(defaultItems,(err)=>{
          //Deal with error or log success
          if(err){
              console.log(err)
          }else{

          console.log('success')
      }
    
      })
      res.redirect('/')
  }else{
    
  }
 
    
    res.render("list", { listTitle: "Today", newListItems: foundItems});
  })
  
});

app.post("/", (req, res) => {
const itemName = req.body.Newitem
const listName= req.body.list
const item = new Item ({name: itemName})

    if(listName === 'Today'){
      
    
item.save()
res.redirect('/')
}else{
  List.findOne({name: listName}, (err, foundList)=>{
    foundList.items.push(item)
    foundList.save()
    res.redirect("/"+listName)
  })
}
});

app.get('/:customListName', function (req, res) {
 const customListName = _.capitalize(req.params.customListName)
List.findOne({name : customListName},(err,foundList)=>{
  if(!err){
    if(!foundList){
      const list = new List({
        name:customListName,
        items: defaultItems
        
      })
      list.save()
      res.redirect('/'+customListName)
    }else{
      res.render("list",{listTitle: foundList.name, newListItems:foundList.items})    }
  }
})

  

})


app.post('/delete',(req,res)=>{
const checkedItemId = req.body.checkbox
const listName = _.capitalize(req.body.listName)
console.log(listName)

if (listName=== 'Today'){

  Item.findByIdAndRemove(checkedItemId, function(err) {
  if (!err) {
    console.log("Success")
    res.redirect("/")
  }
});

}else{
   List.findOneAndUpdate({name: listName},{$pull: {items:{_id :checkedItemId}}},(err , fountList)=>{
if(!err){
  res.redirect('/'+listName)
}
   })
}

})



app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, (req, res) => {
  console.log("listening port 3000");
});
