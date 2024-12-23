import React from "react";

// TODO - Da se odradi context kako treba

const AuthorizationContext = React.createContext({
    APIUrl: "http://localhost:5054/API/",
    contextUser: {
        id: -1,
        name: "",
        role: "Guest",
        jwtToken: "",
        email: "",
        picture: "",
        bio: ""
    },
    contextSetUser: () => {},
});

export default AuthorizationContext;
