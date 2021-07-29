import React from "react";
import "./userDetail.css";
import { List, ListItem, ListItemText, Paper } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
//import fetchModel from "../../lib/fetchModelData";
import Mentions from "./Mentions";
import axios from "axios";
import { HashLink } from "react-router-hash-link";

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userObj: {
        first_name: ""
      },
      mentions: [],
      topPhoto: {},
      topComment: {}
    };
  }

  userChange(newUser) {
    this.setState({ userObj: newUser });
  }

  getTopPhoto() {
    axios.get("/getTopUserPhoto/" + this.props.userId).then(
      photo => {
        this.setState({ topPhoto: photo.data });
        console.log(this.state.topPhoto);
      },
      err => {
        console.error("fetchModel error: ", err);
      }
    );
  }

  getTopComment() {
    this.setState({
      topComment: {}
    });
    axios.get("/getTopComment/" + this.props.userId).then(
      photo => {
        console.log("top comment", photo);
        this.setState({ topComment: photo.data });
      },
      err => {
        console.error("fetchModel error: ", err);
      }
    );
  }

  getUserDetail() {
    axios.get("/user/" + this.props.userId).then(
      val => {
        // console.log("user:", val);
        this.setState({ userObj: val.data }, () => {
          this.props.changeMessage(this.state.userObj.first_name);
          this.setState({
            mentions: []
          });
          if (this.state.userObj.mentions.length) {
            // console.log("in mentions if statement");
            this.state.userObj.mentions.forEach(mention => {
              axios.get("/getPhoto/" + mention).then(
                val => {
                  this.setState({
                    mentions: this.state.mentions.concat(val.data)
                  });
                },
                err => {
                  console.error("fetchModel error: ", err);
                }
              );
            });
          }
        });
      },
      err => {
        console.error("fetchModel error: ", err);
      }
    );
  }

  componentDidMount() {
    this.getUserDetail();
    this.getTopPhoto();
    this.getTopComment();
  }

  componentDidUpdate(prevProps) {
    if (this.props.userId !== prevProps.userId) {
      this.getUserDetail();
      this.getTopPhoto();
      this.getTopComment();
    }
  }

  render() {
    return (
      <div>
        <List>
          <Paper>
          <ListItem>
            <ListItemText
              disableTypography
              style={{fontSize: "200%"}}
              primary={"Name: ".concat(this.state.userObj.first_name).concat(
                " ", this.state.userObj.last_name)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={"Location: ".concat(this.state.userObj.location)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={"Description: ".concat(this.state.userObj.description)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={"Occupation: ".concat(this.state.userObj.occupation)}
            />
          </ListItem>
          <ListItem>
            <Link
              variant="subheading"
              underline="always"
              component={RouterLink}
              to={"/photos/" + this.state.userObj._id}
            >
              Click here to explore photos of {this.state.userObj.first_name}
            </Link>
          </ListItem>
          </Paper>
          <Paper>
          <ListItem>
            <ListItemText primary={"Photos with comments that mention " + this.state.userObj.first_name + ":"} />
            <Mentions mentions={this.state.mentions} />
          </ListItem>
          </Paper>
          <Paper>
          {Object.keys(this.state.topPhoto).length ? (
            <ListItem>
              <ListItemText
                primary={
                  "Most recent photo posted on " + this.state.topPhoto.date_time
                }
              />
              <HashLink to={"/photos/" + this.state.userObj._id}>
                <img
                  src={"/images/" + this.state.topPhoto.file_name}
                  alt={this.state.topPhoto.file_name}
                  style={{
                    height: "auto",
                    width: "100px",
                    display: "block",
                    margin: "10px"
                  }}
                />
              </HashLink>
            </ListItem>
          ) : (
            <ListItem>
              <ListItemText primary={"No most recent photo"} />
            </ListItem>
          )}
          </Paper>
          <Paper>
          {Object.keys(this.state.topComment).length ? (
            <ListItem>
              <ListItemText
                primary={
                  Object.keys(this.state.topComment).length
                    ? "Photo with most comments: " +
                      this.state.topComment.comments.length +
                      " comment(s)"
                    : "No photo with most comments"
                }
              />
              <HashLink to={"/photos/" + this.state.userObj._id}>
                <img
                  src={"/images/" + this.state.topComment.file_name}
                  alt={this.state.topPhoto.file_name}
                  style={{
                    height: "auto",
                    width: "100px",
                    display: "block",
                    margin: "10px"
                  }}
                />
              </HashLink>
            </ListItem>
          ) : (
            <ListItem>
              {" "}
              <ListItemText primary="No photo with most comments" />
            </ListItem>
          )}
          </Paper>
        </List>
      </div>
    );
  }
}

export default UserDetail;
