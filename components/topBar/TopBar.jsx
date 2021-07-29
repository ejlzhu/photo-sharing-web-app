import React from "react";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import "./TopBar.css";
import axios from "axios";
import Button from "@material-ui/core/Button";

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versionNumber: ""
    };
    this.buttonClicked = this.buttonClicked.bind(this);
    this.handleUploadButtonClicked = this.handleUploadButtonClicked.bind(this);
  }

  buttonClicked() {
    axios.post("/admin/logout", {}).then(
      () => {
        this.props.changeLogIn(false);
      },
      err => {
        console.error("button clicked error:", err);
      }
    );
  }

  handleUploadButtonClicked (event) {
    event.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      axios
        .post("/photos/new", domForm)
        .then(res => {
          this.props.getUsers();
          console.log(res);
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  componentDidMount() {
    axios.get("test/info").then(
      val => {
        this.setState({ versionNumber: val.data.__v });
      },
      err => {
        console.error("fetchModel error: ", err);
      }
    );
  }

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" >
        <Toolbar>
          <Typography variant="h5" color="inherit">
            Jialin Zhu
          </Typography>
          <Typography
            className="cs142-topbar-version-number"
            variant="subtitle2"
            color="inherit"
          >
            Version Number: {this.state.versionNumber}
          </Typography>
          <Typography
            //className="cs142-topbar-message"
            variant="h5"
            color="inherit"
          >
            {this.props.login ? "Hello " + this.props.name : "Please Log In"}
          </Typography>
          {this.props.login && (
            <input
              type="file"
              accept="image/*"
              ref={domFileRef => {
                this.uploadInput = domFileRef;
              }}
            />
          )}
          {this.props.login && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleUploadButtonClicked}
            >
              Upload photo
            </Button>
          )}
          {this.props.login && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.buttonClicked}
            >
              Log out
            </Button>
          )}
          <Typography
            className="cs142-topbar-message"
            variant="h5"
            color="inherit"
          >
            {this.props.message}
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
