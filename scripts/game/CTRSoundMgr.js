define("game/CTRSoundMgr", [
  "game/CTRSettings",
  "utils/Log",
  "resources/ResourceId",
  "resources/Sounds",
], function (settings, Log, ResourceId, Sounds) {
  var SoundMgr = {
    audioPaused: false,
    soundEnabled: settings.getSoundEnabled(),
    musicEnabled: settings.getMusicEnabled(),
    musicId: null, // background music
    playSound: function (soundId) {
      if (this.soundEnabled) {
        Sounds.play(soundId);
      }
    },
    pauseSound: function (soundId) {
      if (this.soundEnabled && Sounds.isPlaying(soundId)) {
        Sounds.pause(soundId);
      }
    },
    resumeSound: function (soundId) {
      if (this.soundEnabled && Sounds.isPaused(soundId)) {
        Sounds.play(soundId);
      }
    },
    playLoopedSound: function (soundId) {
      var self = this;
      if (this.soundEnabled && !Sounds.isPlaying(soundId)) {
        Sounds.play(soundId, function () {
          if (!self.audioPaused && self.soundEnabled) {
            self.playLoopedSound(soundId);
          }
        });
      }
    },
    stopSound: function (soundId) {
      Sounds.stop(soundId);
    },
    playMusic: function (soundId) {
      // stop the existing music if different
      if (this.musicId && this.musicId !== soundId) {
        this.stopMusic(soundId);
      }

      var self = this;
      if (this.musicEnabled && !Sounds.isPlaying(soundId)) {
        this.musicId = soundId;
        Sounds.setVolume(soundId, 70);
        Sounds.play(soundId, function () {
          if (!self.audioPaused && self.musicEnabled) {
            self.playMusic(soundId);
          }
        });
      }
    },
    pauseAudio: function () {
      //console.log('Paused audio');

      this.audioPaused = true;
      this.pauseMusic();

      // electro is the only looped sound effect for now
      this.pauseSound(ResourceId.SND_ELECTRIC);
    },
    pauseMusic: function () {
      if (this.musicId) {
        Sounds.pause(this.musicId);
      }
    },
    resumeAudio: function () {
      //console.log('Resumed audio', this.audioPaused);
      if (!this.audioPaused) return;

      this.audioPaused = false;
      this.resumeMusic();
      this.resumeSound(ResourceId.SND_ELECTRIC);
    },
    resumeMusic: function () {
      if (this.musicId) {
        this.playMusic(this.musicId);
      }
    },
    stopMusic: function () {
      if (this.musicId) {
        // stop any currently playing background music
        Sounds.stop(this.musicId);
      }
    },
    setMusicEnabled: function (musicEnabled) {
      this.musicEnabled = musicEnabled;
      settings.setMusicEnabled(musicEnabled);
      if (this.musicEnabled) {
        this.resumeMusic();
      } else {
        this.pauseMusic();
      }
    },
    setSoundEnabled: function (soundEnabled) {
      this.soundEnabled = soundEnabled;
      settings.setSoundEnabled(soundEnabled);
    },
  };

  return SoundMgr;
});
