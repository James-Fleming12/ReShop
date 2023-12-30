import supertokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import ThirdParty from "supertokens-node/recipe/thirdparty";

supertokens.init({
    framework: "express",
    supertokens: {
        connectionURI: "https://st-dev-95296730-a6a4-11ee-ac36-7fb04e67268e.aws.supertokens.io"
    },
    appInfo: {
        appName: "ReShop",
        apiDomain: "http://localhost:5000",
        websiteDomain: "",
        apiBasePath: "/auth",
        websiteBasePath: "/atuh",
    },
    recipeList: [
        // ThirdParty.init({ // Todo }),
        Session.init()
    ]
});