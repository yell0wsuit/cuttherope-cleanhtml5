define("resources/Sounds", ["platform", "utils/Log"], function (platform, Log) {
  // export a singleton which manages audio using SoundManager2
  var Sounds = {
    onReady: function (callback) {
      callback();
    },
    play: function (soundId, onComplete) {
      var sound = window.sounds__["s" + soundId];
      var id = "s" + soundId;

      // choose and create a backup sound
      if (!sound.paused) {
        // lazy clone it
        if (!window.backupSounds__[id]) {
          window.backupSounds__[id] = window.sounds__[id].cloneNode();
          window.backupSounds__[id].mozAudioChannelType = "content";
        }

        sound = window.backupSounds__[id];
      }

      sound["addEventListener"](
        "ended",
        function onendcb() {
          sound["removeEventListener"]("ended", onendcb);
          if (onComplete) {
            onComplete();
          }
        },
        false,
      );
      sound["play"]();
    },
    isPlaying: function (soundId) {
      var sound = window.sounds__["s" + soundId];
      return !sound["paused"];
    },
    isPaused: function (soundId) {
      var sound = window.sounds__["s" + soundId];
      return sound["paused"];
    },
    pause: function (soundId) {
      var sound = window.sounds__["s" + soundId];
      sound["pause"]();
    },
    stop: function (soundId) {
      var sound = window.sounds__["s" + soundId];
      sound["pause"]();
      try {
        sound["currentTime"] = sound["initialTime"];
      } catch (e) {}
    },
    setVolume: function (soundId, percent) {
      var sound = window.sounds__["s" + soundId];
      sound["volume"] = percent / 100;
    },
  };

  return Sounds;
});
