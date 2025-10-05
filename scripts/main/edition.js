define("edition", ["config/editions/net-edition"], function (netEdition) {
    const mobileEdition = netEdition;
    mobileEdition.siteUrl = "http://mozilla.cuttherope.net";

    return mobileEdition;
});
