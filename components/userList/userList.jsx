import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";
import "./userList.css";
import { Link as RouterLink } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      usersArray: []
    };
  }

  componentDidMount() {
    this.props.getUsers();
  }

  render() {
    return (
      <div>
        <Typography variant="title">List of Users</Typography>
        <List component="nav">
          {this.props.users.map(currUser => {
            let link = "/users/" + currUser._id;
            return (
              <div key={currUser.first_name}>
                <ListItem button component={RouterLink} to={link}>
                  {currUser.lastAction && currUser.lastAction.includes(".") ? (
                    <React.Fragment>
                      <div>
                        <ListItemText
                          primary={currUser.first_name.concat(
                            " ",
                            currUser.last_name
                          )}
                        />{" "}
                      </div>
                      <div>
                        <img
                          id={currUser.lastAction}
                          src={"/images/".concat(currUser.lastAction)}
                          alt={currUser.lastAction}
                          style={{
                            height: "auto",
                            width: "100px",
                            display: "block",
                            margin: "10px"
                          }}
                        />
                      </div>
                    </React.Fragment>
                  ) : (
                    <ListItemText
                      primary={currUser.first_name.concat(
                        " ",
                        currUser.last_name
                      )}
                      secondary={currUser.lastAction}
                    />
                  )}
                </ListItem>
                <Divider />
              </div>
            );
          })}
        </List>
      </div>
    );
  }
}

export default UserList;
