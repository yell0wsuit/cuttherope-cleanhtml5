define("edition", ["config/editions/net-edition"], function (netEdition) {
  var mobileEdition = netEdition;
  mobileEdition.siteUrl = "http://mozilla.cuttherope.net";

  return mobileEdition;
});
