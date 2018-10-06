
const http = require('http');
const mongo = require('mongodb').MongoClient;
const urlQuery = require('url');


const mongoUrl = process.env.DBurl || "mongodb://localhost:27017"; // config variables on Heroku
const port = process.env.PORT || 3000;
const collection = process.env.MyCollection || "MyCollection";
const dbName =  process.env.mydb || "mydb";

//-------------------- server App --------------------------//

const server = http.createServer((req,res)=>{

    console.log(req.url);

    //----------- home page ---------------
    if(req.url ==='/')
    {
        serverHomePage(req,res);
    }
    //----------- insert data -------------
    else if (req.url.match("^/insert"))
    {
        insertData(req,res);        
    }
    //----------- find data -------------
    else if (req.url.match("^/find"))
    {
        findData(req,res);        
    }
    //----------- unknown request -------------
    else{       
        unknownRequest(req,res);
    }





});

server.listen(port,()=>{

    console.log(`APP1 - Server Started on port ${port} .....${mongoUrl}`);
});

//-------- function to handle unknown request -----------

function unknownRequest(req,res){

    res.writeHead(204);
    res.end("Unknown request....");
    console.log("Warning:unexpected request %s by %s method",req.url,req.method)

}


//------ function to server home page -----------------

function serverHomePage(req,res){

    res.writeHead(200,{'Content-type':'text/html'});
    res.end("Welcome to Server App1.....");
}


//-------- Fucntion to conenct to database -------------

function conenctDB(){

    return new Promise((resolve,reject)=>{

        mongo.connect(mongoUrl,{ useNewUrlParser: true },(err,client)=>{

            if(err)
            {
                console.log("Error1: URL connect");
                reject(err);
            }
            else{
                console.log("Database URL Connected");

                const db = client.db(dbName);                  

                resolve({db,client}); // send database object 

            }


        });

    });



}



//-------- fucntion to insert data in database------------

function insertData(req,res){

        conenctDB()
        .then((mongoObj)=>{

            let db= mongoObj.db; // get database object

            let query = urlQuery.parse(req.url,true).query; // get query string from get request

            console.log((query));
            console.log(typeof(query));
            console.log(query.RTU);

              //  if(query.prototype.hasOwnProperty('RTU') == false)
                if(query.RTU == undefined)
                {        

                    console.log("Error:Query missing ");

                    res.writeHead(200,{'Content-type':'text/html'});
                    res.end("Error:Query parameter missing ");

                  //  reject("Error:Query missing ");

                }
                else
                {

                    db.collection(collection).insertOne(query,(err,result)=>{
                    if(err)
                    {
                        console.log("Error:insert data " + err);

                        res.writeHead(200,{'Content-type':'text/html'});
                        res.end("Error:insert data");

                        //reject("Error:insert data ");
                    }
                    else
                    {
                        console.log("Inserted");
                    // console.log(result.result);
                        console.log(result.ops); // ops is array of objects
                        console.log("No of record inserted =" + result.insertedCount); 

                        mongoObj.client.close();

                        res.writeHead(200,{'Content-type':'text/html'});
                        res.end("<p>Data Inserted Successfully </p>" + "<p>" + JSON.stringify(result.ops) +"</p>");

                      //  resolve("Data Inserted");
                    }
                
                    });
                }
            });

        }




//-------- fucntion to Find data in database------------

function findData(req,res){

    conenctDB()
    .then((mongoObj)=>{

        let db= mongoObj.db; // get database object

        let query = urlQuery.parse(req.url,true).query; // get query string from get request

        console.log((query));
     
/*         if(query.Type == undefined) // if request to find all records
            {        
                console.log("Fetching all data ");





                res.writeHead(200,{'Content-type':'text/html'});
                res.end("Error:Query parameter missing ");

              //  reject("Error:Query missing ");

            } */

        db.collection(collection).find(query).toArray((err,result)=>{
        if(err)
        {
            console.log("Error:find data to array " + err);

            res.writeHead(200,{'Content-type':'text/html'});
            res.end("Error:in finding data");

            //reject("Error:insert data ");
        }
        else
        {
            console.log("Data Found  ");      
            console.log(result); 
            let response='<table style="border: 1px solid powderblue">';
            for(ptr=0 ; ptr< result.length; ptr++)
            {
                let entries = Object.entries(result[ptr]);
                console.log(entries);
                response+= "<tr>"
                for(const [key , value] of entries)
                {
                    console.log(` ${key} --> ${value}`);
                    response+=`<th> ${key} </th>`;
                    response+=`<th> ${value} </th>`;
                } 
                response+= "</tr>"

            }

            response+='</table>';
            
           // console.log("No of record inserted =" + result.insertedCount); 

            
            mongoObj.client.close();
            console.log(response); 
            res.writeHead(200,{'Content-type':'text/html'});
            res.end(response);
            
            //  resolve("Data Inserted");
        }
    
        });
            
        });

    }        