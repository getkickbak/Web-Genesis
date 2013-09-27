if ( typeof (importScripts) != 'undefined')
{
   var prefix;
   //
   // Desktop testing mode
   //
   if (location.href.match('testing'))
   {
      prefix = '..';
   }
   //
   // Native code or emualtor
   //
   else if (location.href.match(/mobileServer/i))
   {
      prefix = '../..';
   }
   //
   // Desktop production mode
   //
   else
   {
      prefix = '/merchant';
   }
   importScripts(prefix + '/lib/dsp.min.js');
}

var fft, sampleRate, fftSize, bwWidth, MAG_THRESHOLD = 1e-5, MATCH_THRESHOLD = 3, ERROR_THRESHOLD = 175, //
loFreq = 17000.0, hiFreq = 20000.0, FREQ_GAP = 500.0, NUM_SIGNALS = 3;

var fft_init = function(config, scope)
{
   sampleRate = config['sampleRate'], fftSize = config['fftSize'], bwWidth = sampleRate / fftSize;
   //
   // Wait until Lame is loaded into memory
   //
   fft = new FFT(fftSize, sampleRate);
   //console.debug("#MP3 Init");
   scope.postMessage(JSON.stringify(
   {
      cmd : 'init'
   }));
};
var fft_forward = function(buf, scope)
{
   var me = this, i = 0, mag, array, freqs = [], fft = me.fft, isNeighbor, foundIndex, _mag;

   fft.forward(buf);
   mags = fft.spectrum;
   // Find frequency amplitudes between loFreq and highFreq
   for ( i = Math.floor(loFreq / bwWidth); i < Math.ceil(hiFreq / bwWidth); i++)
   //for (var i =0; i < Math.min(Math.ceil(me.hiFreq / me.bwWidth), array.length); i++)
   {
      mag = mags[i];
      if (mag <= MAG_THRESHOLD)
      {
         continue;
      }

      //
      // Sort on Index (asc)
      //
      foundIndex = null;
      if (freqs.length > 0)
      {
         freqs.sort(function(i1, i2)
         {
            return i1['index'] - i2['index'];
         });
         //
         // Find any nearby Index
         //
         foundIndex = freqs.binarySearch(
         {
            val : mag,
            index : i
         }, function(i1, i2)
         {
            // Are they in the freq neighbourhood?
            //
            isNeighbor = (Math.abs(i1['index'] - i2['index']) <= ERROR_THRESHOLD);

            return (isNeighbor) ? 0 : (i1['index'] - i2['index']);
         });
      }

      if (foundIndex == null)
      {
         foundIndex = -1;
      }

      if (foundIndex >= 0)
      {
         _mag = freqs[foundIndex];
         //
         // Found an existing power even larger than adjacent power values
         //
         //console.debug("foundIndex=" + foundIndex + ", freqs.length=" + freqs.length + ", mag=" + mag + ", String=" +
         // JSON.stringify(_mag));
         if (_mag['val'] < mag)
         {
            _mag['val'] = mag;
            _mag['index'] = i;
         }
      }
      else
      {
         //console.debug("Added Mag" + mag + ", index = " + i);
         freqs.push(
         {
            val : mag,
            index : i
         });
      }
   }
   if (freqs.length >= MATCH_THRESHOLD)
   {
      var ret = [];
      for ( i = 0; i < MATCH_THRESHOLD; i++)
      {
         ret[i] = Math.round(freqs[i]['index'] * bwWidth);

         console.debug("PostFFT - Mag Resolution= " + freqs[i]['val'] + ", Freq = " + ret[i] + "Hz");
      }
      //
      // Sort on Frequency (asc)
      //
      ret.sort(function(i1, i2)
      {
         return (i1 - i2);
      });

      //
      // Print Matching info
      //
      //         return ret;

      scope.postMessage(JSON.stringify(
      {
         cmd : 'forward',
         freqs : ret
      }));
   }
   else
   {
   }
};

onmessage = function(e)
{
   var data = e.data;
   switch (data.cmd)
   {
      case 'init':
         fft_init(data.config, self);
         break;
      case 'forward':
         fft_forward(data.buf, self);
         break;
   }
};

Array.prototype.binarySearch = function(find, comparator)
{
   var low = 0, high = this.length - 1, i, comparison;
   while (low <= high)
   {
      i = Math.floor((low + high) / 2);
      comparison = comparator(this[i], find);
      if (comparison < 0)
      {
         low = i + 1;
         continue;
      };
      if (comparison > 0)
      {
         high = i - 1;
         continue;
      };
      return i;
   }
   return null;
};

