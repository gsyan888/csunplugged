goog.provide('game.AudioPlayerAudio');

goog.require('lime.audio.Audio');

/**
 * @constructor
 */
game.AudioPlayerAudio = function(filePath) {
    //alert(lime.audio.AudioContext=false);    
	
	this.decodeKeyStr_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	if( location.toString().substr(0,4) == 'file' ) {
		if( !( filePath.length % 4 == 0 && filePath.match(/^[A-Za-z0-9+\/=]+\Z/) ) ) {
			lime.audio.AudioContext = false;
		}
	}

    lime.audio.Audio.call(this, filePath);
};
goog.inherits(game.AudioPlayerAudio, lime.audio.Audio);


game.AudioPlayerAudio.prototype.loadBuffer = function (path, cb) {
    var buffers = lime.audio._buffers;
    if (buffers[path] && buffers[path].buffer) {
        cb(buffers[path].buffer, path);
    }
    else if (buffers[path]) {
        buffers[path].push(cb);
    }
    else if ( path.length % 4 == 0 && path.match(/^[A-Za-z0-9+\/=]+\Z/) ) {
    	//如果傳來的資料符合 base64 的特徵，就進行資料解碼的程序
    	buffers[path] = [cb];
    	var myBuffer = this.decodeArrayBuffer(path);
    	lime.audio.context['decodeAudioData'](myBuffer, function(buffer) {
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
        req.responseType = 'arraybuffer';
        req.onload = function() {
		    lime.audio.context['decodeAudioData'](req.response, function(buffer) {
               if (!buffer) {
                   return console.error('Error decoding file:', path);
               }
               var cbArray = buffers[path];
               buffers[path] = {buffer: buffer};
               for (var i=0; i < cbArray.length; i++) {
                   cbArray[i](buffer, path);
               }
            }, function(e){ console.error('Error decoding file',e);});
        };
        req.onerror = function() {
          console.error('XHR error loading file:', path);
        };
        req.send();
    }
};


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
game.AudioPlayerAudio.prototype.decodeArrayBuffer = function(input) {
	var bytes = (input.length/4) * 3;
	var ab = new ArrayBuffer(bytes);
	this.decode(input, ab);
	
	return ab;
}
	
game.AudioPlayerAudio.prototype.decode = function(input, arrayBuffer) {
	//get last chars to see if are valid
	var lkey1 = this.decodeKeyStr_.indexOf(input.charAt(input.length-1));		 
	var lkey2 = this.decodeKeyStr_.indexOf(input.charAt(input.length-2));		 

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
		enc1 = this.decodeKeyStr_.indexOf(input.charAt(j++));
		enc2 = this.decodeKeyStr_.indexOf(input.charAt(j++));
		enc3 = this.decodeKeyStr_.indexOf(input.charAt(j++));
		enc4 = this.decodeKeyStr_.indexOf(input.charAt(j++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		uarray[i] = chr1;			
		if (enc3 != 64) uarray[i+1] = chr2;
		if (enc4 != 64) uarray[i+2] = chr3;
	}

	return uarray;	
}