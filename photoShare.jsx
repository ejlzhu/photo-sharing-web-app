import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Paper } from "@material-ui/core";
import "./styles/main.css";
import axios from "axios";

// import necessary components
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/UserDetail";
import UserList from "./components/userList/UserList";
import UserPhotos from "./components/userPhotos/UserPhotos";
import LoginRegister from "./components/loginRegister/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      name: "",
      userIsLoggedIn: false,
      user: {},
      users: []
    };
    this.topBarChange = this.topBarChange.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.changeLogIn = this.changeLogIn.bind(this);
    this.changeUser = this.changeUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUserList = this.getUserList.bind(this);
  }

  componentDidMount() {
    this.setState({ message: "Home" });
    this.getUserList();
  }

  getUserList() {
    axios.get("/user/list").then(
      users => {
        this.setState({ users: users.data, userIsLoggedIn: true });
        //this.setState({ userIsLoggedIn: true });
      },
      err => {
        this.setState({ userIsLoggedIn: false });
        console.error("fetchModel error: ", err);
      }
    );
  }

  topBarChange(newMsg) {
    this.setState({ message: newMsg });
  }

  nameChange(newName) {
    this.setState({ name: newName });
  }

  changeLogIn(loggedIn) {
    this.setState({ userIsLoggedIn: loggedIn });
  }

  changeUser(user) {
    this.setState({ user: user });
  }

  getUsers(users) {
    this.setState({ users: users });
  }

  render() {
    console.log("users", this.state.users);
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar
                message={this.state.message}
                login={this.state.userIsLoggedIn}
                changeLogIn={this.changeLogIn}
                name={this.state.user.first_name}
                getUsers={this.getUserList}
              />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                {this.state.userIsLoggedIn && (
                  <UserList
                    changeMessage={this.topBarChange}
                    setUsers={this.getUsers}
                    users={this.state.users}
                    getUsers={this.getUserList}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item sm={9}>
             
                <Switch>
                  {this.state.userIsLoggedIn ? (
                    <Route
                      path="/users/:userId"
                      render={props => (
                        <UserDetail
                          {...props}
                          changeMessage={this.topBarChange}
                          changeName={this.nameChange}
                          userId={props.match.params.userId}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/users/:id" to="/login-register" />
                  )}
                  {this.state.userIsLoggedIn ? (
                    <Route
                      path="/photos/:userId"
                      render={props => (
                        <UserPhotos
                          {...props}
                          changeMessage={this.topBarChange}
                          name={this.state.message}
                          users={this.state.users}
                          getUsers={this.getUserList}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/photos/:userId" to="/login-register" />
                  )}
                  {this.state.userIsLoggedIn && (
                    <Redirect
                      path="/login-register"
                      to={"/users/" + this.state.user._id}
                    />
                  )}

                  <Route
                    path="/login-register"
                    render={() => (
                      <LoginRegister
                        changeUser={this.changeUser}
                        changeLogIn={this.changeLogIn}
                      />
                    )}
                  />
                  {this.state.userIsLoggedIn ? (
                    <Route path="/users" component={UserList} />
                  ) : (
                    <Redirect path="/users" to="/login-register" />
                  )}
                  {!this.state.userIsLoggedIn && (
                    <Redirect to="/login-register" />
                  )}
                </Switch>
              
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
