goog.provide('game.Audio');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('lime.userAgent');

/**
 * Audio stream object
 * @constructor
 * @param {string} filePath Path to audio file.
 */
game.Audio = function(MP3_File, MP3_Base64, OGG_Base64) {
    goog.events.EventTarget.call(this);
	
	if(typeof(MP3_Base64) == 'undefined') {
		MP3_Base64 = '';
	}
	if(typeof(OGG_Base64) == 'undefined') {
		OGG_Base64 = '';
	}
	
	var filePath = '';
	if(goog.global['AudioContext'] || goog.global['webkitAudioContext']) {
		if(goog.userAgent.GECKO) {
			filePath = OGG_Base64;
		} else {
			filePath = MP3_Base64
		}
	}
	if( filePath == '') {
		filePath = MP3_File;
	}	
	
    if(filePath && goog.isFunction(filePath.data)){
        filePath = filePath.data();
    }

	//add by gsyan
	// check if the host is same.
	if( filePath.match(/http:/i) && !filePath.match(/window.location.host/i) ) {
		this.crossSite_ = true;
	} else {
		this.crossSite_ = false;
	}

    /**
     * @type {Boolean}
     * @private
     */
    this.loaded_ = false;

    /**
     * @type {boolean}
     * @private
     */
    this.playing_ = false;

    if (goog.userAgent.GECKO && (/\.mp3$/).test(filePath)) {
        filePath = filePath.replace(/\.mp3$/, '.ogg');
    }
	
    if (game.AudioContext && !this.crossSite_) {
        this.volume_ = 1;
        this.prepareContext_();
        this.loadBuffer(filePath, goog.bind(this.bufferLoadedHandler_, this));
    }
    else {
        /**
         * Internal audio element
         * @type {audio}
         */
        this.baseElement = document.createElement('audio');
        this.baseElement['preload'] = true;
        this.baseElement['loop'] = false;
        this.baseElement.src = filePath;
        this.baseElement.load();
        this.baseElement.addEventListener('ended', goog.bind(this.onEnded_, this));
        this.loadInterval = setInterval(goog.bind(this.loadHandler_, this), 10);

        this.loaded_ = false;
    }
};
goog.inherits(game.Audio, goog.events.EventTarget);

game.AudioContext = goog.global['AudioContext'] || goog.global['webkitAudioContext'];
game._buffers = {};

game.supportsMultiChannel = game.AudioContext || !(lime.userAgent.IOS || lime.userAgent.WINPHONE);

game.Audio.prototype.prepareContext_ = function() {
    if (game.context) return;
    var context = game.context = new game.AudioContext();
    var gain = game.masterGain = context['createGain']();
    gain['connect'](context['destination']);
};

game.Audio.prototype.loadBuffer = function (path, cb) {
    var buffers = game._buffers;
    if (buffers[path] && buffers[path].buffer) {
        cb(buffers[path].buffer, path);
    }
    else if (buffers[path]) {
        buffers[path].push(cb);
    }
    else if (path.match(/data:audio\/(ogg|mp3);base64,/) || path.length % 4 == 0 && path.match(/^[A-Za-z0-9+\/=]+\Z/) ) {	
    	//如果傳來的資料符合 base64 的特徵，就進行資料解碼的程序
		if( path.match(/data:audio\/(ogg|mp3);base64,/) ) {
			path = path.replace(/data:audio\/(ogg|mp3);base64,/, '');
		}
    	buffers[path] = [cb];
    	var myBuffer = this.decodeArrayBuffer(path);
    	game.context['decodeAudioData'](myBuffer, function(buffer) {
    		var cbArray = buffers[path];
    		buffers[path] = {buffer: buffer};
    		for (var i=0; i < cbArray.length; i++) {
                cbArray[i](buffer, path);
            }
    	});
	}
    else {
        buffers[path] = [cb];
        var req = new XMLHttpRequest();
        req.open('GET', path, true);
		req.withCredentials = true;
        req.responseType = 'arraybuffer';
        req.onload = function() {
            game.context['decodeAudioData'](req.response, function(buffer) {
               if (!buffer) {
                   return console.error('Error decoding file:', path);
               }
               var cbArray = buffers[path];
               buffers[path] = {buffer: buffer};
               for (var i=0; i < cbArray.length; i++) {
                   cbArray[i](buffer, path);
               }
            }, function(e){console.error('Error decoding file',e);});
        };
        req.onerror = function() {
          console.error('XHR error loading file:', path);
        };
        req.send();
    }
};

game.Audio.prototype.bufferLoadedHandler_ = function (buffer, path) {
    this.buffer = buffer;
    this.loaded_ = true;
    var ev = new goog.events.Event('loaded');
    ev.event = null;
    this.dispatchEvent(ev);
    if (this.autoplay_) {
        this.play.apply(this, this.autoplay_);
    }
};

game.Audio.prototype.onEnded_ = function (e) {
    this.playing_ = false;
    var ev = new goog.events.Event('ended');
    ev.event = e;
    this.dispatchEvent(ev);
    this.playPosition_ = 0;
    var delay = (game.AudioContext && !this.crossSite_) ? this.playTime_ + this.buffer.duration - this.playPositionCache - 0.05 : 0;
    if (this.next_) {
        for (var i = 0; i < this.next_.length; i++) {
            this.next_[i][0].play(this.next_[i][1], delay);
        }
    }
    else if (ev.returnValue_ !== false && this.loop_) {
        this.play(this.loop_, delay);
    }
}

/**
 * Handle loading the audio file. Event handlers seem to fail
 * on lot of browsers.
 * @private
 */
game.Audio.prototype.loadHandler_ = function() {
    if (this.baseElement['readyState'] > 2) {
        this.bufferLoadedHandler_();
        clearTimeout(this.loadInterval);
    }
    if (this.baseElement['error'])clearTimeout(this.loadInterval);

    if (lime.userAgent.IOS && this.baseElement['readyState'] == 0) {
        //ios hack do not work any more after 4.2.1 updates
        // no good solutions that i know
        this.bufferLoadedHandler_();
        clearTimeout(this.loadInterval);
        // this means that ios audio anly works if called from user action
    }
};

/**
 * Returns true if audio file has been loaded
 * @return {boolean} Audio has been loaded.
 */
game.Audio.prototype.isLoaded = function() {
    return this.loaded_;
};

/**
 * Returns true if audio file is playing
 * @return {boolean} Audio is playing.
 */
game.Audio.prototype.isPlaying = function() {
    return this.playing_;
};

/**
 * Start playing the audio
 * @param {number=} opt_loop Loop the sound.
 */
game.Audio.prototype.play = function(opt_loop) {
    if (!this.isLoaded()) {
        this.autoplay_ = goog.array.toArray(arguments);
    }
    if (this.isLoaded() && !this.isPlaying() && !game.getMute()) {
        if (game.AudioContext && !this.crossSite_) {
            if (this.source && this.source['playbackState'] == this.source['FINISHED_STATE']) {
                this.playPosition_ = 0;
            }
            this.source = game.context['createBufferSource']();
            this.source.buffer = this.buffer;
            this.gain = game.context['createGain']();
            this.gain['connect'](game.masterGain);
            this.gain['gain']['value'] = this.volume_;
            this.source['connect'](this.gain);

            this.playTime_ = game.context['currentTime'];
            var delay = arguments[1] || 0

            if (this.playPosition_ > 0) {
                this.source['start'](delay, this.playPosition_, this.buffer.duration - this.playPosition_);
            }
            else {
                this.source['start'](delay);
            }
            this.playPositionCache = this.playPosition_;
            this.endTimeout_ = setTimeout(goog.bind(this.onEnded_, this),
                (this.buffer.duration - (this.playPosition_ || 0)) * 1000 - 150);
        }
        else {
            this.baseElement.play();
        }
        this.playing_ = true;
        this.loop_ = !!opt_loop;
        if (game._playQueue.indexOf(this) == -1) {
          game._playQueue.push(this);
        }
    }
};

/**
 * Stop playing the audio
 */
game.Audio.prototype.stop = function() {
    if (!this.isLoaded()) {
        this.autoplay_ = null;
    }
    if (this.isPlaying()) {
        if (game.AudioContext && !this.crossSite_) {
            clearTimeout(this.endTimeout_);
            this.playPosition_ = game.context.currentTime - this.playTime_ + (this.playPosition_ || 0);
            if (this.playPosition_ > this.buffer.duration) {
                this.playPosition_ = 0;
            }
            this.source['stop'](0);
            this.gain['disconnect'](game.masterGain);
            this.source = null;
        }
        else {
            this.baseElement.pause();
        }
        this.playing_ = false;
    }
};

game._isMute = false;
game._playQueue = [];

game.getMute = function() {
  return game._isMute;
};

game.setMute = function(bool) {
  if (bool && !game._isMute) {
    for (var i = 0; i < game._playQueue.length; i++) {
      game._playQueue[i].stop();
    }
    game._playQueue = [];
  }
  game._isMute = bool;
};

game.Audio.prototype.setVolume = function(value) {
    if (game.AudioContext && !this.crossSite_) {
        this.volume_ = value;
        if (this.gain) this.gain['gain']['value'] = value;
    }
    else {
        this.baseElement.volume = value;
    }
};
game.Audio.prototype.getVolume = function() {
    if (game.AudioContext && !this.crossSite_) {
        return this.volume_;
    }
    else {
        return this.baseElement.volume;
    }
};

//*-------------------------------------------------------
//add by gsyan
//*-------------------------------------------------------
game.Audio.prototype.soundInit = function() {
	game.isSoundInit_ = true;
	//if(!stroke.isSoundInit && sound_win.isLoaded()) {
	//如果是 iOS 的, 要先利用按鈕播放一次, 後續才能用程式控制
	if( lime.userAgent.IOS ) {	
		this.playing_ = false;
		this.setVolume(0);
		this.play();
	} else {
		this.setVolume(0);
	}
};
game.Audio.prototype.isSoundInit = function() {
	return game.isSoundInit_;
};

game.decodeKeyStr_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
game.isSoundInit_ = false;

/*
Copyright (c) 2011, Daniel Guerrero
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Uses the new array typed in javascript to binary base64 encode/decode
 * at the moment just decodes a binary base64 encoded
 * into either an ArrayBuffer (decodeArrayBuffer)
 * or into an Uint8Array (decode)
 * 
 * References:
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/ArrayBuffer
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/Uint8Array
 */

/* will return a  Uint8Array type */
game.Audio.prototype.decodeArrayBuffer = function(input) {
	var bytes = (input.length/4) * 3;
	var ab = new ArrayBuffer(bytes);
	this.decode(input, ab);
	
	return ab;
}
	
game.Audio.prototype.decode = function(input, arrayBuffer) {
	//get last chars to see if are valid
	var lkey1 = game.decodeKeyStr_.indexOf(input.charAt(input.length-1));		 
	var lkey2 = game.decodeKeyStr_.indexOf(input.charAt(input.length-2));		 

	var bytes = (input.length/4) * 3;
	if (lkey1 == 64) bytes--; //padding chars, so skip
	if (lkey2 == 64) bytes--; //padding chars, so skip
	
	var uarray;
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;
	var j = 0;
	
	if (arrayBuffer)
		uarray = new Uint8Array(arrayBuffer);
	else
		uarray = new Uint8Array(bytes);
	
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
	for (i=0; i<bytes; i+=3) {	
		//get the 3 octects in 4 ascii chars
		enc1 = game.decodeKeyStr_.indexOf(input.charAt(j++));
		enc2 = game.decodeKeyStr_.indexOf(input.charAt(j++));
		enc3 = game.decodeKeyStr_.indexOf(input.charAt(j++));
		enc4 = game.decodeKeyStr_.indexOf(input.charAt(j++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		uarray[i] = chr1;			
		if (enc3 != 64) uarray[i+1] = chr2;
		if (enc4 != 64) uarray[i+2] = chr3;
	}

	return uarray;	
}