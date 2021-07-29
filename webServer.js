"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

var async = require("async");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require("./schema/user.js");
var Photo = require("./schema/photo.js");
var SchemaInfo = require("./schema/schemaInfo.js");

var express = require("express");
var app = express();
var session = require("express-session");
var bodyParser = require("body-parser");
var multer = require("multer");
var processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);
var fs = require("fs");

app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);
app.use(bodyParser.json());

// XXX - Your submission should work without this line
//var cs142models = require("./modelData/photoApp.js").cs142models;

mongoose.connect(
  "mongodb://localhost/cs142project6",
  { useMongoClient: true }
);

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.get("/", function(request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get("/test/:p1", function(request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params objects.
  console.log("/test called with param1 = ", request.params.p1);

  var param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
    SchemaInfo.find({}, function(err, info) {
      if (err) {
        // Query returned an error.  We pass it back to the browser with an Internal Service
        // Error (500) error code.
        console.error("Doing /user/info error:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object - This
        // is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      //console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an async
    // call to each collections. That is tricky to do so we use the async package
    // do the work.  We put the collections into array and use async.each to
    // do each .count() query.
    var collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo }
    ];
    async.each(
      collections,
      function(col, done_callback) {
        col.collection.count({}, function(err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function(err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          var obj = {};
          for (var i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400) status.
    response.status(400).send("Bad param " + param);
  }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get("/user/list", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    User.find({}, "first_name last_name id lastAction", function(err, users) {
      if (err) {
        response.status(500).send(JSON.stringify(err));
        return;
      } else {
        response.status(200).send(JSON.parse(JSON.stringify(users)));
      }
    });
  } else {
    response.status(401).send("You are not logged in");
  }
});
/*
 * URL /user/:id - Return the information for User (id)
 */
app.get("/user/:id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    var id = request.params.id;
    User.findById(
      id,
      "first_name last_name id location description occupation mentions"
    )
      .then(result => {
        response.status(200).send(JSON.parse(JSON.stringify(result)));
      })
      .then(null, err => {
        response.status(400).send(JSON.stringify(err));
      });
  } else {
    response.status(401).send("You are not logged in");
  }
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
1. find the photos of the user based on user_id
2. find the comments of each photo
3. find the user for each comment




 */
app.get("/photosOfUser/:id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    var id = request.params.id;
    try {
      id = mongoose.Types.ObjectId(id);
    } catch (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    Photo.find({ user_id: id }, "_id user_id comments file_name date_time")
      .then(photos => {
        photos = JSON.parse(JSON.stringify(photos));
        async.each(
          photos,
          function(photo, callbackPhoto) {
            async.each(
              photo.comments,
              function(comment, callbackComment) {
                let comment_id = comment.user_id;
                delete comment.user_id;
                User.findById(comment_id, "first_name last_name _id")
                  .then(user => {
                    comment.user = user;
                    callbackComment();
                  })
                  .catch(err => {
                    callbackComment(err);
                    console.log("commentcallback: ", err);
                  });
              },
              // after all the comments are finished being processed
              err => {
                if (err) {
                  callbackPhoto(err);
                } else {
                  callbackPhoto();
                }
              }
            );
          },
          err => {
            if (err) {
              response.status(400).send(JSON.stringify(err));
            } else {
              response.status(200).send(JSON.parse(JSON.stringify(photos)));
            }
          }
        );
      })
      .catch(err => {
        response.status(400).send(JSON.stringify(err));
      });
  } else {
    response.status(401).send("You are not logged in");
  }
});

app.post("/admin/login", function(request, response) {
  var id = request.body.login_name;
  User.findOne(
    { login_name: id },
    "first_name last_name id location description occupation login_name password lastAction"
  )
    .then(result => {
      if (result.password === request.body.password) {
        request.session.user_id = result.id;
        request.session.login_name = result.login_name;
        result.lastAction = "Logged in";
        result.save();
        response.status(200).send(JSON.parse(JSON.stringify(result)));
      } else response.status(400).send("wrong password");
    })
    .catch(err => {
      //console.log("error");
      response.status(400).send(JSON.stringify(err));
    });
});

app.post("/admin/logout", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    User.findOne(
      { login_name: request.session.login_name },
      "first_name last_name id lastAction"
    )
      .then(result => {
        //console.log("logout", result);
        result.lastAction = "Logged out";
        result.save();
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
    delete request.session["login_name"];
    delete request.session["user_id"];
    request.session.destroy(function(err) {
      response.status(400).send(JSON.stringify(err));
    });
    response.status(200).send(JSON.stringify(""));
  } else {
    response.status(400).send("Cannot logout if not logged in");
  }
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    /*
1) find the photo
2) make a comment object with the comment and the user id of whoever posted the comment and the time
3) attach that comment to the photo's comment Array
4) save the photo

  */
    // console.log("in comments:", request.body.comment);
    // console.log("userid", request.session.user_id);
    if (request.body.comment === "") {
      response.status(400).send("cannot send an empty comment");
      return;
    }
    User.findOne(
      { login_name: request.session.login_name },
      "first_name last_name id lastAction"
    )
      .then(result => {
        //console.log("logout", result);
        result.lastAction = "Added a comment";
        result.save();
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
    var photo_id = request.params.photo_id;
    Photo.findOne({ _id: photo_id }, "comments")
      .then(photo => {
        let comment = {
          comment: request.body.comment, // The text of the comment.
          date_time: Date.now(), // The date and time when the comment was created.
          user_id: request.session.user_id
        };
        // console.log("in findphoto", comment.user_id);
        // console.log("in findphoto", comment.comment);

        if (photo.comments.length) {
          photo.comments = photo.comments.concat([comment]);
        } else {
          photo.comments = [comment];
        }
        photo.save();
        response.status(200).send("comment saved");
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
  }
});

app.post("/photos/new", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    processFormBody(request, response, function(err) {
      if (err || !request.file) {
        response.status(400).send(JSON.stringify(err));
        return;
      }

      // request.file has the following properties of interest
      //      fieldname      - Should be 'uploadedphoto' since that is what we sent
      //      originalname:  - The name of the file the user uploaded
      //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
      //      buffer:        - A node Buffer containing the contents of the file
      //      size:          - The size of the file in bytes

      // XXX - Do some validation here.
      // We need to create the file in the directory "images" under an unique name. We make
      // the original file name unique by adding a unique prefix with a timestamp.
      var timestamp = new Date().valueOf();
      var filename = "U" + String(timestamp) + request.file.originalname;

      User.findOne(
        { login_name: request.session.login_name },
        "first_name last_name id lastAction"
      )
        .then(result => {
          //console.log("logout", result);
          result.lastAction = filename;
          result.save();
        })
        .catch(err => response.status(400).send(JSON.stringify(err)));

      fs.writeFile("./images/" + filename, request.file.buffer, function() {
        // XXX - Once you have the file written into your images directory under the name
        // filename you can create the Photo object in the database
        Photo.create(
          {
            file_name: filename,
            date_time: timestamp,
            user_id: request.session.user_id,
            comments: []
          },
          err => {
            if (err) {
              response.status(400).send(JSON.stringify(err));
            } else {
              response.status(200).send("photo saved");
            }
          }
        );
      });
    });
  }
});

app.post("/user", function(request, response) {
  //specified and doesn't already exist
  //first name, last name, and password must be non-empty strings
  //create user
  if (request.session.login_name && request.session.user_id) {
    if (request.body.login_name) {
      //console.log("in the first if statement");
      User.findOne({ login_name: request.body.login_name })
        .then(result => {
          // console.log(result);
          if (result === null) {
            throw new Error("can't find user");
          }
          // console.log("found a user");
          response.status(400).send("user already exists");
        })
        .catch(() => {
          console.log("couldn't find user");
          if (
            request.body.first_name !== "" &&
            request.body.last_name !== "" &&
            request.body.password !== ""
          ) {
            // console.log("got into if statement");
            User.create({
              first_name: request.body.first_name,
              last_name: request.body.last_name,
              location: request.body.location,
              description: request.body.description,
              occupation: request.body.occupation,
              login_name: request.body.login_name,
              password: request.body.password,
              lastAction: "Registered as a user"
            })
              .then(result => {
                //console.log("created user", result._id);
                result.save();
                response.status(200).send("user saved");
              })
              .catch(() => {
                // console.log("in catch statement");
                response.status(400).send("cannot create user");
              });
          } else {
            // console.log("empty something");
            response.status(400).send("empty string");
          }
        });
    }
  }
});

app.post("/mentionsOfPhoto/:photo_id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let user = request.body.mentionUser;
    let photo = request.params.photo_id;
    // console.log("in mentions backend user", user);
    // console.log("in mentions backend photo", photo);

    User.findById(user, "mentions")
      .then(user => {
        console.log(user);
        if (user.mentions.length) {
          user.mentions = user.mentions.concat([photo]);
        } else {
          user.mentions = [photo];
        }
        user
          .save()
          .then(result => {
            console.log("user saved", result);
            response.status(200).send("mention saved");
          })
          .catch(err => response.status(400).send(JSON.stringify(err)));
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
  }
});

app.get("/getPhoto/:photo_id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let photo_id = request.params.photo_id;
    console.log("in mentions backend photo", photo_id);

    Photo.findById(photo_id, "file_name user_id")
      .then(photo => {
        photo = JSON.parse(JSON.stringify(photo));
        User.findById(photo.user_id, "first_name last_name")
          .then(user => {
            photo.first_name = user.first_name;
            photo.last_name = user.last_name;
            console.log("PHOTO", photo);
            response.status(200).send(JSON.stringify(photo));
          })
          .catch(err => {response.status(400).send(JSON.stringify(err))});
      })
      .catch(err => response.status(400).send(JSON.stringify(err)));
  }
});

app.get("/getTopUserPhoto/:id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let id = request.params.id;
    Photo.find(
      { user_id: id },
      "_id user_id comments file_name date_time"
    ).then(
      photos => {
        let lastPhoto = photos[Object.keys(photos).length - 1];
        response.status(200).send(JSON.stringify(lastPhoto));
      },
      err => {
          response.status(400).send(JSON.stringify(err));
      }
    );
  } else {
    response.status(401).send("You are not logged in");
  }
});

app.get("/getTopComment/:id", function(request, response) {
  if (request.session.login_name && request.session.user_id) {
    let id = request.params.id;
    Photo.find(
      { user_id: id },
      "_id user_id comments file_name date_time"
    ).then(
      photos => {
        let topPhoto = photos[Object.keys(photos)[0]];
        let numComments = 0;
        Object.keys(photos).forEach(function(currKey) {
          let currPhoto = photos[currKey];
          if (currPhoto.comments.length > numComments) {
            topPhoto = currPhoto;
            numComments = currPhoto.comments.length;
            console.log("top photo", currPhoto.file_name);
          }
        });
        if (numComments === 0) {
          response.status(200).send(JSON.stringify({}));
        } else {
          response.status(200).send(JSON.stringify(topPhoto));
        }
      },
      err => {
          response.status(400).send(JSON.stringify(err));
      }
    );
  } else {
    response.status(401).send("You are not logged in");
  }
});

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
