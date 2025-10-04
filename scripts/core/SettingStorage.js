define("core/SettingStorage", ["edition", "utils/PubSub"], function (
  edition,
  PubSub,
) {
  var editionPrefix = edition.settingPrefix || "",
    prefix = editionPrefix;

  PubSub.subscribe(PubSub.ChannelId.UserIdChanged, function (userId) {
    if (userId) {
      prefix = userId + "-" + editionPrefix;
    } else {
      prefix = editionPrefix;
    }
  });

  var settingCache = {};

  var SettingStorage = {
    get: function (key) {
      if (!window.localStorage) {
        return null;
      }
      //console.log("GET",key);
      if (key in settingCache) {
        return settingCache[key];
      }

      return localStorage.getItem(prefix + key);
    },
    set: function (key, value) {
      if (window.localStorage) {
        //console.log("SET",key,value);
        if (value == null) {
          delete settingCache[key];
          localStorage.removeItem(prefix + key);
        } else {
          settingCache[key] = value.toString();
          localStorage.setItem(prefix + key, value.toString());
        }
      }
    },
    remove: function (key) {
      if (window.localStorage) {
        //console.log("REMOVE",key)
        delete settingCache[key];
        localStorage.removeItem(prefix + key);
      }
    },
    getBoolOrDefault: function (key, defaultValue) {
      var val = this.get(key);
      if (val == null) {
        return defaultValue;
      }
      return val === "true";
    },
    getIntOrDefault: function (key, defaultValue) {
      var val = this.get(key);
      if (val == null) {
        return defaultValue;
      }
      return parseInt(val, 10);
    },
  };

  return SettingStorage;
});
