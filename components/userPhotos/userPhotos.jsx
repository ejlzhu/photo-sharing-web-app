import { Typography, List, ListItem, ListItemText, Paper } from "@material-ui/core";
import "./userPhotos.css";
import React from "react";
//import fetchModel from "../../lib/fetchModelData";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import axios from "axios";
import PhotoCommenter from "./photoCommenter";
/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userPhotos: [],
      comment: "",
      users: [],
      mentions: []
    };
    this.photoChange = this.photoChange.bind(this);
  }

  photoChange(newPhotos) {
    this.setState({ userPhotos: newPhotos });
  }

  componentDidMount() {
    this.props.changeMessage("Photos of " + this.props.name);
    axios.get("/photosOfUser/" + this.props.match.params.userId).then(
      val => {
        this.setState({ userPhotos: val.data });
      },
      err => {
        console.error("fetchModel error: ", err);
      }
    );
    let currUsers = [];
    this.props.users.forEach(function(user) {
      let id = user._id;
      let display = user.first_name + " " + user.last_name;
      let currUser = { id: id, display: display };
      currUsers.push(currUser);
    });
    this.setState({ users: currUsers });
  }

  render() {
    //console.log("photos", this.props.users);
    return (
      <div>
        {this.state.userPhotos.map(photo => (
        <Paper key={photo._id}>
          <div className="photos" key={photo._id}>
            <Typography variant="title">Posted on {photo.date_time}</Typography>
            <img
              id={photo.file_name}
              src={"/images/".concat(photo.file_name)}
              alt={photo._id}
            />
            {photo.comments && (
              <div>
                <Typography variant="subheading">
                  Comments:
                </Typography>
                <List>
                  {photo.comments.map(comment => {
                    return (
                      <Paper key={comment._id}>
                        <div className="div-comment" key={comment._id}>
                          <Link
                            variant="subheading"
                            component={RouterLink}
                            to={"/users/" + comment.user._id}
                          >
                            {comment.user.first_name + " " + comment.user.last_name}
                          </Link>
                          <ListItem>
                            <ListItemText primary={comment.date_time} />
                          </ListItem>
                        </div>
                        <ListItem>
                          <ListItemText
                            primary={comment.comment.replace(
                              /\([\d\w]+\)/gi, "")}
                          />
                        </ListItem>
                     </Paper>
                    );
                  })}
                  <PhotoCommenter
                    users={this.state.users}
                    photo={photo}
                    photoChange={this.photoChange}
                    userId={this.props.match.params.userId}
                    getUsers={this.props.getUsers}
                  />
                </List>
              </div>
            )}
          </div>
        </Paper>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
