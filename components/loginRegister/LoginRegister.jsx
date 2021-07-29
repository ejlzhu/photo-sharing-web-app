import React from "react";
import { Typography } from "@material-ui/core";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import "./LoginRegister.css";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login_name: "took",
      password: "weak",
      user: {},
      error_login: "",
      error: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNewUser = this.handleNewUser.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleNewUser(event) {
    event.preventDefault();
    if (this.state.new_password === this.state.new_password2) {
      if (
        this.state.first_name &&
        this.state.last_name &&
        this.state.location &&
        this.state.description &&
        this.state.occupation &&
        this.state.new_login_name &&
        this.state.new_password &&
        this.state.new_password2
      ) {
        axios
          .post("/user", {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            location: this.state.location,
            description: this.state.description,
            occupation: this.state.occupation,
            login_name: this.state.new_login_name,
            password: this.state.new_password
          })
          .then(
            () => {
              this.setState({
                error: "User successfully created!",
                first_name: "",
                last_name: "",
                location: "",
                description: "",
                occupation: "",
                new_login_name: "",
                new_password: "",
                new_password2: ""
              });
            },
            err => {
              this.setState({
                error: err.response.data
              });
            }
          );
      } else {
        this.setState({ error: "Please fill in all of the input fields" });
      }
    } else {
      this.setState({
        error: "Please make sure both of the password fields match"
      });
    }
  }

  handleSubmit(event) {
    //console.log("A name was submitted: ", this.state);
    event.preventDefault();
    axios
      .post("/admin/login", {
        login_name: this.state.login_name,
        password: this.state.password
      })
      .then(
        val => {
          console.log("loginregister", val);
          this.props.changeUser(val.data);
          this.props.changeLogIn(true);
        },
        err => {
          this.setState({
            error_login: "Incorrect login or password. Please try again"
          });
          console.error("fetchModel error: ", err);
        }
      );
  }

  componentDidMount() {}

  render() {
    //console.log(this.state);
    return (
      <div>
        <div>
          <Typography component="h1" variant="h5">
            Log In:
          </Typography>
          <form onSubmit={this.handleSubmit}>
            <div>
              <TextField
                type="login name"
                name="login_name"
                value={this.state.login_name}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Login Name"
              />
              <TextField
                type="password"
                className="text"
                name="password"
                value={this.state.password}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Password"
              />
              </div>
              <Button
                id="button1"
                variant="contained"
                color="primary"
                label="Submit"
                type="submit"
              >
                Log In
              </Button>
        
            {this.state.error_login && (
              <Typography variant="subtitle2" color="inherit">
                {this.state.error_login}
              </Typography>
            )}
          </form>
        </div>
        <div>
          <Typography component="h1" variant="h5">
            Create New User:
          </Typography>
          <form onSubmit={this.handleNewUser}>
            <div className="div1">
              <TextField
                type="text"
                name="new_login_name"
                value={this.state.new_login_name || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Login Name"
              />
              <TextField
                type="password"
                name="new_password"
                value={this.state.new_password || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Password"
              />
              <TextField
                type="password"
                name="new_password2"
                value={this.state.new_password2 || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Verify Password"
              />
              <TextField
                type="text"
                name="first_name"
                value={this.state.first_name || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="First Name"
              />
              <TextField
                type="text"
                name="last_name"
                value={this.state.last_name || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Last Name"
              />
            </div>
            <div>
              <TextField
                type="text"
                name="location"
                value={this.state.location || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Location"
              />
              <TextField
                type="text"
                name="description"
                value={this.state.description || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Description"
              />
              <TextField
                type="text"
                name="occupation"
                value={this.state.occupation || ""}
                onChange={this.handleChange}
                margin="normal"
                variant="outlined"
                label="Occupation"
              />
            </div>
              <Button
                variant="contained"
                color="primary"
                label="Submit"
                type="submit"
              >
                Register Me
              </Button>
              {this.state.error && (
                <Typography variant="subtitle2" color="inherit">
                  {this.state.error}
                </Typography>
              )} 
          </form>
        </div>
      </div>
    );
  }
}

export default LoginRegister;
