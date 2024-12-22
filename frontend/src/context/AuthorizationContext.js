import React from "react";

const AuthorizationContext = React.createContext({
    APIUrl: "http://localhost:5054/API/",
    contextUser: {
        id: -1,
        name: "",
        role: "Guest",
        jwtToken: "",
        email: "",
        jmbg: "",
        picture: "",
        description: ""
    },
    contextSetUser: () => {},
});

export default AuthorizationContext;
